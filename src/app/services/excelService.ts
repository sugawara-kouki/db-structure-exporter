// services/excelService.ts
import { TableStructure } from '../types/database';

/**
 * エクセルファイルを管理するサービス
 */
export class ExcelService {
  /**
   * データベース構造からエクセルファイルをエクスポートする
   * APIを呼び出してダウンロードを開始する
   */
  static async exportToExcel(structures: TableStructure[]): Promise<void> {
    try {
      // APIを呼び出してExcelファイルを取得
      const response = await fetch('/api/database/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(structures),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Excelファイルのエクスポートに失敗しました');
      }
      
      // レスポンスからBlobを取得
      const blob = await response.blob();
      
      // ダウンロードリンクの作成と実行
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Content-Dispositionヘッダーからファイル名を取得、なければデフォルト値を使用
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `database_structure_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // メモリリークを防ぐ
    } catch (error) {
      console.error('Excelファイルのエクスポートに失敗しました', error);
      throw error instanceof Error 
        ? error 
        : new Error('Excelファイルのエクスポートに失敗しました');
    }
  }
}