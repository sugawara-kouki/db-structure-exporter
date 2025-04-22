'use client';

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { DatabaseConnection } from '../types/database';
import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
  Paper
} from '@mui/material';

interface ConnectionFormProps {
  onSubmit: (values: DatabaseConnection) => void;
  isLoading: boolean;
}

// バリデーションスキーマ
const ConnectionSchema = Yup.object().shape({
  type: Yup.string()
    .oneOf(['mysql', 'postgresql', 'mssql'], 'サポートされているデータベースを選択してください')
    .required('データベースタイプを選択してください'),
  host: Yup.string().required('ホスト名は必須です'),
  port: Yup.number()
    .required('ポート番号は必須です')
    .positive('有効なポート番号を入力してください'),
  username: Yup.string().required('ユーザー名は必須です'),
  password: Yup.string().required('パスワードは必須です'),
  database: Yup.string().required('データベース名は必須です'),
});

const ConnectionForm: React.FC<ConnectionFormProps> = ({ onSubmit, isLoading }) => {
  const initialValues: DatabaseConnection = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: '',
    password: '',
    database: '',
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        データベース接続情報
      </Typography>
      
      <Formik
        initialValues={initialValues}
        validationSchema={ConnectionSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched, values, handleChange }) => (
          <Form>
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth error={touched.type && Boolean(errors.type)}>
                <InputLabel id="db-type-label">データベースタイプ</InputLabel>
                <Select
                  labelId="db-type-label"
                  id="type"
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                  label="データベースタイプ"
                >
                  <MenuItem value="mysql">MySQL</MenuItem>
                  <MenuItem value="postgresql">PostgreSQL</MenuItem>
                  <MenuItem value="mssql">SQL Server</MenuItem>
                </Select>
                {touched.type && errors.type && (
                  <FormHelperText>{errors.type}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                id="host"
                name="host"
                label="ホスト名"
                value={values.host}
                onChange={handleChange}
                error={touched.host && Boolean(errors.host)}
                helperText={touched.host && errors.host}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                id="port"
                name="port"
                label="ポート番号"
                type="number"
                value={values.port}
                onChange={handleChange}
                error={touched.port && Boolean(errors.port)}
                helperText={touched.port && errors.port}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="ユーザー名"
                value={values.username}
                onChange={handleChange}
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="パスワード"
                type="password"
                value={values.password}
                onChange={handleChange}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                id="database"
                name="database"
                label="データベース名"
                value={values.database}
                onChange={handleChange}
                error={touched.database && Boolean(errors.database)}
                helperText={touched.database && errors.database}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : 'データベース構造を取得'}
            </Button>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default ConnectionForm;