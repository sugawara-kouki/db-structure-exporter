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
        let errorMessage = 'Excelファイルのエクスポートに失敗しました';
        
        // レスポンスの種類に応じてエラーメッセージを取得
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          // JSONでない場合はテキストとして読み込む
          const errorText = await response.text();
          console.error('API エラーレスポンス:', errorText);
        }
        
        throw new Error(errorMessage);
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

  /**
   * テストデータ入力用のテンプレートをエクスポートする
   * APIを呼び出してダウンロードを開始する
   */
  static async exportTestDataTemplate(structures: TableStructure[]): Promise<void> {
    try {
      console.log('テストデータテンプレート生成リクエスト送信:', structures);
      
      // テストデータテンプレート用のAPIを呼び出す
      const response = await fetch('/api/database/export-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(structures),
      });
      
      console.log('API レスポンスステータス:', response.status);
      console.log('API レスポンスヘッダー:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = 'テンプレートのエクスポートに失敗しました';
        
        // レスポンスの種類に応じてエラーメッセージを取得
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          // JSONでない場合はテキストとして読み込む
          const errorText = await response.text();
          console.error('API エラーレスポンス:', errorText);
        }
        
        throw new Error(errorMessage);
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
        : `test_data_template_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // メモリリークを防ぐ
    } catch (error) {
      console.error('テンプレートのエクスポートに失敗しました', error);
      throw error instanceof Error 
        ? error 
        : new Error('テンプレートのエクスポートに失敗しました');
    }
  }
}