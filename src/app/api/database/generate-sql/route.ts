// src/app/api/database/generate-sql/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { TableStructure } from '@/app/types/database';

/**
 * Excelテンプレートからデータを読み込み、INSERTステートメントを生成するAPI
 */
export async function POST(request: Request) {
  try {
    // FormDataからファイルとテーブル構造を取得
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const structuresJson = formData.get('structures') as string | null;
    
    // バリデーション
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが提供されていません' },
        { status: 400 }
      );
    }
    
    if (!structuresJson) {
      return NextResponse.json(
        { error: 'テーブル構造情報が提供されていません' },
        { status: 400 }
      );
    }
    
    // テーブル構造情報をパース
    let structures: TableStructure[] = [];
    try {
      structures = JSON.parse(structuresJson);
    } catch (e) {
      return NextResponse.json(
        { error: 'テーブル構造情報のパースに失敗しました' },
        { status: 400 }
      );
    }
    
    // ファイルをArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    
    // Excelファイルを読み込む
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    
    // 生成したSQLステートメントを格納する配列
    const sqlStatements: string[] = [];
    
    // 全てのシートを処理
    for (const sheetName of workbook.SheetNames) {
      // テーブル名を取得（通常はシート名と一致する）
      const tableStructure = structures.find(s => 
        s.tableName.toLowerCase() === sheetName.toLowerCase() ||
        sheetName.toLowerCase().includes(s.tableName.toLowerCase())
      );
      
      if (!tableStructure) {
        console.warn(`警告: シート ${sheetName} に対応するテーブル構造が見つかりませんでした`);
        continue;
      }
      
      // シートからデータを取得
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
      
      if (data.length === 0) {
        console.warn(`警告: シート ${sheetName} にデータがありません`);
        continue;
      }
      
      // テーブル名
      const tableName = tableStructure.tableName;
      
      // 各行に対してINSERTステートメントを生成
      for (const row of data) {
        // 空の行はスキップ
        if (Object.keys(row).length === 0) continue;
        
        // 値が入力されているカラムのみ抽出
        const nonEmptyColumns = Object.entries(row)
          .filter(([_, value]) => value !== null && value !== undefined && value !== '')
          .map(([key, _]) => key);
        
        if (nonEmptyColumns.length === 0) continue;
        
        // SQLステートメントの作成
        const columnNames = nonEmptyColumns.join(', ');
        const values = nonEmptyColumns.map(column => {
          const value = row[column];
          
          // カラムの型情報を取得
          const columnDef = tableStructure.columns.find(c => c.name === column);
          const isNumeric = columnDef && ['int', 'decimal', 'float', 'double', 'bigint', 'tinyint', 'smallint'].some(
            type => columnDef.type.toLowerCase().includes(type)
          );
          const isBoolean = columnDef && ['boolean', 'tinyint(1)'].some(
            type => columnDef.type.toLowerCase().includes(type)
          );
          
          // データ型に応じて値をフォーマット
          if (value === null || value === undefined) {
            return 'NULL';
          } else if (isBoolean) {
            // Boolean型の処理
            const boolValue = String(value).toLowerCase();
            if (['true', 'yes', 'y', '1'].includes(boolValue)) {
              return '1';
            } else if (['false', 'no', 'n', '0'].includes(boolValue)) {
              return '0';
            } else {
              return 'NULL';
            }
          } else if (isNumeric) {
            // 数値型の処理
            const numValue = String(value).replace(/,/g, ''); // カンマを除去
            if (isNaN(Number(numValue))) {
              return 'NULL';
            }
            return numValue;
          } else {
            // 文字列型の処理（エスケープ処理）
            return `'${String(value).replace(/'/g, "''")}'`;
          }
        }).join(', ');
        
        // INSERTステートメントを作成
        const insertStatement = `INSERT INTO ${tableName} (${columnNames}) VALUES (${values});`;
        sqlStatements.push(insertStatement);
      }
      
      // テーブル間の区切り
      if (sqlStatements.length > 0 && !sqlStatements[sqlStatements.length - 1].endsWith('\n\n')) {
        sqlStatements.push('\n');
      }
    }
    
    // SQL文を結合
    let sqlContent = '';
    if (sqlStatements.length > 0) {
      // ヘッダーコメントを追加
      sqlContent = `-- Generated SQL Insert Statements\n`;
      sqlContent += `-- Generated at: ${new Date().toISOString()}\n`;
      sqlContent += `-- Tables: ${structures.map(s => s.tableName).join(', ')}\n\n`;
      
      // SQLステートメントを追加
      sqlContent += sqlStatements.join('\n');
    } else {
      sqlContent = `-- 有効なデータが見つかりませんでした。\n-- テンプレートにデータを入力して再度お試しください。`;
    }
    
    // ファイル名を生成
    const fileName = `generated_sql_${new Date().toISOString().split('T')[0]}.sql`;
    
    // レスポンスヘッダーの設定
    return new NextResponse(sqlContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('SQLファイル生成エラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'SQLファイルの生成に失敗しました' },
      { status: 500 }
    );
  }
}