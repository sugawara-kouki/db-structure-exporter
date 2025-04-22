// services/excelService.ts
import * as XLSX from 'xlsx';
import { TableStructure } from '../types/database';

/**
 * エクセルファイルを生成するサービス
 */
export class ExcelService {
  /**
   * データベース構造からエクセルファイルを生成する
   */
  static generateExcelFile(structures: TableStructure[]): Blob {
    // ワークブックの作成
    const workbook = XLSX.utils.book_new();

    // 各テーブルごとにワークシートを作成
    structures.forEach((table, index) => {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, `tableName${index}`);
    });

    // エクセルファイルの生成
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
}