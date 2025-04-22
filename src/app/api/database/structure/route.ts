// app/api/database/structure/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { DatabaseConnection, TableStructure } from '@/app/types/database';

export async function POST(request: Request) {
  try {
    const connection: DatabaseConnection = await request.json();

    let result: TableStructure[] = [];
    switch (connection.type) {
      case 'mysql':
        result = await getMySQLStructure(connection);
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