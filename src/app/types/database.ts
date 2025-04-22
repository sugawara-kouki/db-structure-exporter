// types/database.ts
export interface DatabaseConnection {
  type: 'mysql' | 'postgresql' | 'mssql'; // 対応するデータベースタイプ
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface TableStructure {
  tableName: string;
  columns: ColumnStructure[];
}

export interface ColumnStructure {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencedTable?: string;
  referencedColumn?: string;
  defaultValue?: string | null;
  comment?: string;
}