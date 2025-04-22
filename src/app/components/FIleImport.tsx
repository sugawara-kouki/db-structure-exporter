'use client';

import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper,
  CircularProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { TableStructure } from '../types/database';

interface FileImportProps {
  onImport: (file: File, structures: TableStructure[]) => void;
  structures: TableStructure[];
  isLoading: boolean;
}
// onImportの型定義は親コンポーネントからdbTypeを渡さないように見えますが、
// 実際の実装では親コンポーネント内にすでにdbTypeをクロージャとして
// 利用できるため、propsに含める必要はないです

const FileImport: React.FC<FileImportProps> = ({ 
  onImport, 
  structures,
  isLoading 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleButtonClick = () => {
    // ファイル選択ダイアログを開く
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setFileName(null);
      return;
    }

    const selectedFile = files[0];
    setFileName(selectedFile.name);

    // ファイルが選択されたらインポート処理を開始
    onImport(selectedFile, structures);

    // ファイル選択をリセット（同じファイルを再度選択できるように）
    event.target.value = '';
  };

  // 構造情報がない場合は表示しない
  if (!structures || !structures.length) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        テストデータのインポート
      </Typography>

      <Typography variant="body1" gutterBottom>
        エクスポートしたテンプレートにデータを入力し、SQLを生成できます。
      </Typography>

      <Box 
        sx={{ 
          mt: 2, 
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          startIcon={<UploadFileIcon />}
          onClick={handleButtonClick}
          disabled={isLoading}
        >
          Excelファイルを選択
        </Button>

        {isLoading && <CircularProgress size={24} />}

        {fileName && (
          <Typography variant="body2">
            選択したファイル: {fileName}
          </Typography>
        )}

        {/* 非表示のファイル入力 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".xlsx,.xls"
        />
      </Box>
    </Paper>
  );
};

export default FileImport;