// src/app/api/database/export-template/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { TableStructure } from '@/app/types/database';

/**
 * テストデータ入力用のテンプレートを生成するAPI
 * カラム名をヘッダーとして、二行目以降は空のExcelファイルを生成する
 */
export async function POST(request: Request) {
  try {
    // リクエストボディからテーブル構造情報を取得
    const requestData = await request.text();
    let structures: TableStructure[] = [];
    
    try {
      structures = JSON.parse(requestData);
    } catch (parseError) {
      console.error('リクエストJSONのパースに失敗:', parseError);
      return NextResponse.json(
        { error: 'リクエストデータのパースに失敗しました' },
        { status: 400 }
      );
    }
    
    // 空行の数を設定（調整可能）
    const emptyRowCount = 20;
    
    // Excelファイルの生成
    const workbook = XLSX.utils.book_new();

    // 各テーブルごとにワークシートを作成
    structures.forEach((table) => {
      // カラム名だけをヘッダーとして使用
      const headers = table.columns.map(column => column.name);
      
      // 空行を生成（Array.fill()を直接使うと同じ配列への参照になるため、mapで個別に生成）
      const emptyRows = Array(emptyRowCount).fill(null).map(() => 
        Array(headers.length).fill('')
      );
      
      // データ配列の作成（ヘッダー行 + 空行）
      const worksheetData = [headers, ...emptyRows];
      
      // ワークシートの作成
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // スタイルを適用（ヘッダー行の強調）
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EFEFEF" } }
        };
      }
      
      // シート名はテーブル名を使用（無効な文字を削除し、長すぎる場合は短縮）
      // シート名が無い場合はインデックスを使用
      const sheetName = table.tableName 
        ? table.tableName.replace(/[*?:/\\[\]]/g, '_').substring(0, 31)
        : `Table_${structures.indexOf(table)}`;
      
      // ワークシートをワークブックに追加
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // エクセルファイルの生成
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelData = new Uint8Array(excelBuffer);
    
    // ファイル名を生成
    const fileName = `test_data_template_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // レスポンスヘッダーの設定
    return new NextResponse(excelData, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('テストデータテンプレートの生成に失敗しました:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'テストデータテンプレートの生成に失敗しました' },
      { status: 500 }
    );
  }
}