// services/databaseService.ts
import { DatabaseConnection, TableStructure } from '../types/database';

/**
 * データベースの構造を取得するサービス
 */
export class DatabaseService {
  /**
   * データベース接続情報を使用して、データベースの構造を取得する
   * Next.jsのAPIルートを呼び出す
   */
  static async fetchDatabaseStructure(connection: DatabaseConnection): Promise<TableStructure[]> {
    try {
      // Next.jsのAPIルートを呼び出してデータベース構造を取得する
      const response = await fetch('/api/database/structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connection),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'データベース構造の取得に失敗しました');
      }
      
      return await response.json();
    } catch (error) {
      console.error('データベース構造の取得に失敗しました', error);
      throw error instanceof Error 
        ? error 
        : new Error('データベース構造の取得に失敗しました');
    }
  }
}