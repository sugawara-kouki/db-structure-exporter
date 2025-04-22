// src/app/api/database/export/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { TableStructure } from '@/app/types/database';

/**
 * Excelファイルを生成してレスポンスとして返すAPI
 */
export async function POST(request: Request) {
  try {
    // リクエストボディからテーブル構造情報を取得
    const structures: TableStructure[] = await request.json();
    
    // Excelファイルの生成
    const workbook = XLSX.utils.book_new();

    // 各テーブルごとにワークシートを作成
    structures.forEach((table, index) => {
      // テーブル名をシート名として使用（無効な文字を削除）
      const sheetName = `table${index}`// table.tableName.replace(/[*?:/\\[\]]/g, '_').substring(0, 31);
      
      // テーブル情報をワークシートに変換
      const worksheetData = [
        ['カラム名', 'データ型', '必須', 'プライマリーキー', '外部キー', '参照テーブル', '参照カラム', 'デフォルト値', 'コメント'],
        ...table.columns.map(column => [
          column.name,
          column.type,
          column.nullable ? 'No' : 'Yes',
          column.isPrimaryKey ? 'Yes' : 'No',
          column.isForeignKey ? 'Yes' : 'No',
          column.referencedTable || '',
          column.referencedColumn || '',
          column.defaultValue || '',
          column.comment || ''
        ])
      ];

      // ワークシートの作成
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // スタイルを適用（ヘッダー行の強調など）
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EFEFEF" } }
        };
      }

      // ワークシートをワークブックに追加
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // エクセルファイルの生成
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelData = new Uint8Array(excelBuffer);
    
    // ファイル名を生成
    const fileName = `database_structure_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // レスポンスヘッダーの設定
    return new NextResponse(excelData, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Excelファイルの生成に失敗しました:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Excelファイルの生成に失敗しました' },
      { status: 500 }
    );
  }
}