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

  // Excelエクスポート処理
  const handleExportExcel = () => {
    try {
      // Excelファイルの生成
      const excelBlob = ExcelService.generateExcelFile(structures);

      // ダウンロード処理
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_structure_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Excelファイルの生成に失敗しました');
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
          />
        )}
      </Box>
    </Container>
  );
}