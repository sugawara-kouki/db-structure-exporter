'use client';

import React from 'react';
import { 
  Box, 
  Button,
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TableStructure } from '../types/database';

interface StructureDisplayProps {
  structures: TableStructure[];
  onExportExcel: () => void;
}

const StructureDisplay: React.FC<StructureDisplayProps> = ({ structures, onExportExcel }) => {
  if (!structures.length) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          データベース構造
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={onExportExcel}
        >
          Excelにエクスポート
        </Button>
      </Box>

      {structures.map((table) => (
        <Accordion key={table.tableName}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{table.tableName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>カラム名</TableCell>
                    <TableCell>データ型</TableCell>
                    <TableCell>必須</TableCell>
                    <TableCell>プライマリーキー</TableCell>
                    <TableCell>外部キー</TableCell>
                    <TableCell>参照テーブル</TableCell>
                    <TableCell>参照カラム</TableCell>
                    <TableCell>デフォルト値</TableCell>
                    <TableCell>コメント</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {table.columns.map((column) => (
                    <TableRow key={column.name}>
                      <TableCell>{column.name}</TableCell>
                      <TableCell>{column.type}</TableCell>
                      <TableCell>{column.nullable ? 'No' : 'Yes'}</TableCell>
                      <TableCell>{column.isPrimaryKey ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{column.isForeignKey ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{column.referencedTable || '-'}</TableCell>
                      <TableCell>{column.referencedColumn || '-'}</TableCell>
                      <TableCell>{column.defaultValue || '-'}</TableCell>
                      <TableCell>{column.comment || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
};

export default StructureDisplay;