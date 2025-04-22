import { TableStructure } from '../types/database';

/**
 * インポートと SQL 生成に関する機能を提供するサービス
 */
export class ImportService {
  /**
   * Excelファイルをアップロードし、SQLを生成するAPIを呼び出す
   * 
   * @param file アップロードするExcelファイル
   * @param structures テーブル構造の定義情報
   * @returns 生成されたSQLファイルのダウンロード処理
   */
  static async importExcelAndGenerateSQL(
    file: File,
    structures: TableStructure[],
    dbType: string // データベースタイプをFormDataに追加
  ): Promise<void> {
    try {
      // FormDataを作成
      const formData = new FormData();
      formData.append('file', file);
      
      // テーブル構造情報をJSON文字列に変換してFormDataに追加
      formData.append('structures', JSON.stringify(structures));
      formData.append('dbType', dbType)

      // APIを呼び出してSQLファイルを取得
      const response = await fetch('/api/database/generate-sql', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        let errorMessage = 'SQLファイルの生成に失敗しました';
        
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
        : `generated_sql_${new Date().toISOString().split('T')[0]}.sql`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // メモリリークを防ぐ
    } catch (error) {
      console.error('テストデータのインポートに失敗しました', error);
      throw error instanceof Error 
        ? error 
        : new Error('テストデータのインポートに失敗しました');
    }
  }
}