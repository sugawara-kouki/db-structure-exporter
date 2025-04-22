// app/api/database/structure/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { Client } from 'pg';
import type { DatabaseConnection, TableStructure } from '@/app/types/database';

export async function POST(request: Request) {
  try {
    const connection: DatabaseConnection = await request.json();

    let result: TableStructure[] = [];
    switch (connection.type) {
      case 'mysql':
        result = await getMySQLStructure(connection);
        break;
      case 'postgresql':
        result = await getPostgreSQLStructure(connection);
        break;
      default:
        return NextResponse.json(
          { error: 'サポートされていないデータベースタイプです' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('データベース構造取得エラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'データベース構造の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// MySQLからテーブル構造を取得する関数
async function getMySQLStructure(connection: DatabaseConnection): Promise<TableStructure[]> {
  const { host, port, username, password, database } = connection;

  // MySQLに接続
  const pool = mysql.createPool({
    host,
    port,
    user: username,
    password,
    database,
  });

  try {
    // テーブル一覧を取得
    const [tables] = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ?;
    `, [database]);
    console.log(tables)

    const result: TableStructure[] = [];

    // 各テーブルのカラム情報を取得
    for (const table of (tables as {TABLE_NAME: string}[])) {
      const tableName = table.TABLE_NAME;

      // カラム情報を取得
      const [columns] = await pool.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_key,
          column_default,
          extra,
          column_comment
        FROM information_schema.columns
        WHERE table_schema = ? AND table_name = ?;
      `, [database, tableName]);

      // 外部キー情報を取得
      const [foreignKeys] = await pool.query(`
        SELECT
          column_name,
          referenced_table_name,
          referenced_column_name
        FROM information_schema.key_column_usage
        WHERE table_schema = ?
          AND table_name = ?
          AND referenced_table_name IS NOT NULL;
      `, [database, tableName]);

      // 外部キー情報をマップ化
      // TODO:: anyを使わないように修正する必要あり
      const fkMap: Record<string, { referencedTable: string; referencedColumn: string }> = {};
      (foreignKeys as any[]).forEach(fk => {
        fkMap[fk.column_name] = {
          referencedTable: fk.referenced_table_name,
          referencedColumn: fk.referenced_column_name
        };
      });

      // カラム情報を整形
      type columnType = {
        COLUMN_NAME: string,
        DATA_TYPE: string,
        IS_NULLABLE: string,
        COLUMN_KEY: string,
        COLUMN_DEFAULT: string | null,
        EXTRA: string,
        COLUMN_COMMENT: string
      }
      const formattedColumns = (columns as columnType[]).map(column => ({
        name: column.COLUMN_NAME,
        type: column.DATA_TYPE,
        nullable: column.IS_NULLABLE === 'YES',
        isPrimaryKey: column.COLUMN_KEY === 'PRI',
        isForeignKey: !!fkMap[column.COLUMN_NAME],
        referencedTable: fkMap[column.COLUMN_NAME]?.referencedTable,
        referencedColumn: fkMap[column.COLUMN_NAME]?.referencedColumn,
        defaultValue: column.COLUMN_DEFAULT,
        comment: column.COLUMN_COMMENT
      }));

      result.push({
        tableName,
        columns: formattedColumns
      });
    }

    await pool.end();
    return result;
  } catch (error) {
    console.error('MySQLからの構造取得に失敗:', error);
    throw error;
  }
}

async function getPostgreSQLStructure(connection: DatabaseConnection): Promise<TableStructure[]> {
  const { host, port, username, password, database } = connection;
  
  // PostgreSQLクライアントの作成
  const client = new Client({
    host,
    port,
    user: username,
    password,
    database,
  });

  try {
    // PostgreSQLに接続
    await client.connect();
    
    // テーブル一覧を取得するクエリ
    const tablesQuery = `
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const result: TableStructure[] = [];
    
    // 各テーブルに対してカラム情報を取得
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.tablename;
      
      // カラム情報を取得するクエリ
      const columnsQuery = `
        SELECT 
          c.column_name, 
          c.data_type, 
          c.is_nullable,
          c.column_default,
          c.character_maximum_length,
          (CASE WHEN pk.constraint_type = 'PRIMARY KEY' THEN true ELSE false END) as is_primary_key,
          c.udt_name,
          pgd.description as column_comment
        FROM 
          information_schema.columns c
        LEFT JOIN (
          SELECT 
            kcu.column_name, 
            tc.constraint_type
          FROM 
            information_schema.table_constraints tc
          JOIN 
            information_schema.key_column_usage kcu
          ON 
            tc.constraint_name = kcu.constraint_name
          WHERE 
            tc.table_name = $1
            AND tc.constraint_type = 'PRIMARY KEY'
        ) pk ON c.column_name = pk.column_name
        LEFT JOIN pg_catalog.pg_description pgd 
          ON pgd.objoid = (SELECT oid FROM pg_catalog.pg_class WHERE relname = $1) 
          AND pgd.objsubid = c.ordinal_position
        WHERE 
          c.table_name = $1
        ORDER BY 
          c.ordinal_position;
      `;
      
      const columnsResult = await client.query(columnsQuery, [tableName]);
      console.log(columnsResult)
      
      // 外部キー情報を取得するクエリ
      const foreignKeysQuery = `
        SELECT
          kcu.column_name,
          ccu.table_name AS referenced_table,
          ccu.column_name AS referenced_column
        FROM
          information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE
          tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = $1;
      `;
      
      const foreignKeysResult = await client.query(foreignKeysQuery, [tableName]);
      
      // 外部キー情報をマップに変換
      const fkMap: Record<string, { referencedTable: string; referencedColumn: string }> = {};
      foreignKeysResult.rows.forEach(fk => {
        fkMap[fk.column_name] = {
          referencedTable: fk.referenced_table,
          referencedColumn: fk.referenced_column
        };
      });
      
      // カラム情報を整形
      const formattedColumns = columnsResult.rows.map(column => ({
        name: column.column_name,
        type: column.data_type + (column.character_maximum_length ? `(${column.character_maximum_length})` : ''),
        nullable: column.is_nullable === 'YES',
        isPrimaryKey: column.is_primary_key,
        isForeignKey: !!fkMap[column.column_name],
        referencedTable: fkMap[column.column_name]?.referencedTable,
        referencedColumn: fkMap[column.column_name]?.referencedColumn,
        defaultValue: column.column_default,
        comment: column.column_comment || ''
      }));
      
      result.push({
        tableName,
        columns: formattedColumns
      });
    }
    
    return result;
  } catch (error) {
    console.error('PostgreSQLからの構造取得に失敗:', error);
    throw error;
  } finally {
    // クライアントを閉じる
    await client.end();
  }
}