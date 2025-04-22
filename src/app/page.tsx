'use client';

import React, { useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import ConnectionForm from './components/ConnectionForm';
import StructureDisplay from './components/StructureDisplay';
import type { DatabaseConnection, TableStructure } from './types/database';
import { DatabaseService } from './services/databaseService';
import { ExcelService } from './services/excelService';

export default function Home() {
  // 状態管理
  const [structures, setStructures] = useState<TableStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // データベース接続処理
  const handleConnect = async (connection: DatabaseConnection) => {
    setLoading(true);
    setError(null);

    try {
      // データベース構造の取得
      const result = await DatabaseService.fetchDatabaseStructure(connection);
      setStructures(result);
    } catch (err) {
      // エラーハンドリング
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // Excelエクスポート処理（既存機能）
  const handleExportExcel = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Excelファイルのエクスポート
      await ExcelService.exportToExcel(structures);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Excelファイルのエクスポートに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // テストデータテンプレートエクスポート処理（新機能）
  const handleExportTestTemplate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // テストデータテンプレートのエクスポート
      await ExcelService.exportTestDataTemplate(structures);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'テストデータテンプレートのエクスポートに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          データベース構造エクスポートツール
        </Typography>

        <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 4 }}>
          データベース接続情報を入力して、テーブル構造をExcelにエクスポートできます。
        </Typography>

        {/* 接続フォーム */}
        <ConnectionForm onSubmit={handleConnect} isLoading={loading} />

        {/* ローディングインジケーター */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {/* エラーメッセージ */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        {/* 構造表示 */}
        {structures.length > 0 && (
          <StructureDisplay
            structures={structures}
            onExportExcel={handleExportExcel}
            onExportTestTemplate={handleExportTestTemplate}
          />
        )}
      </Box>
    </Container>
  );
}