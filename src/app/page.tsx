'use client';

import React, { useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import ConnectionForm from './components/ConnectionForm';
import StructureDisplay from './components/StructureDisplay';
import FileImport from './components/FIleImport';
import type { DatabaseConnection, TableStructure } from './types/database';
import { DatabaseService } from './services/databaseService';
import { ExcelService } from './services/excelService';
import { ImportService } from './services/importService'; // 新しく追加したサービス

export default function Home() {
  // 状態管理
  const [structures, setStructures] = useState<TableStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // 成功メッセージ用の状態
  const [dbType, setDbType] = useState<string>('mysql') // データベースタイプの状態

  // データベース接続処理
  const handleConnect = async (connection: DatabaseConnection) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setDbType(connection.type)

    try {
      // データベース構造の取得
      const result = await DatabaseService.fetchDatabaseStructure(connection);
      setStructures(result);
      setSuccessMessage('データベース構造の取得に成功しました');
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
    setSuccessMessage(null);
    
    try {
      // Excelファイルのエクスポート
      await ExcelService.exportToExcel(structures);
      setSuccessMessage('構造情報のエクスポートが完了しました');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Excelファイルのエクスポートに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // テストデータテンプレートエクスポート処理
  const handleExportTestTemplate = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // テストデータテンプレートのエクスポート
      await ExcelService.exportTestDataTemplate(structures);
      setSuccessMessage('テストデータテンプレートのエクスポートが完了しました');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'テストデータテンプレートのエクスポートに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ファイルインポート処理（新機能）
  const handleImportFile = async (file: File, tableStructures: TableStructure[]) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // ファイルのインポートとSQL生成
      await ImportService.importExcelAndGenerateSQL(file, tableStructures, dbType);
      setSuccessMessage('SQLファイルの生成が完了しました');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SQLファイルの生成に失敗しました');
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

        {/* 成功メッセージ */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
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

        {/* ファイルインポート（新機能） */}
        {structures.length > 0 && (
          <FileImport
            onImport={handleImportFile}
            structures={structures}
            isLoading={loading}
          />
        )}
      </Box>
    </Container>
  );
}