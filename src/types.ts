export interface SQLiteUIConfig {
  db: any; // Can be a file path (string), a better-sqlite3 database instance, or a Bun database instance
  theme?: 'dark' | 'light' | 'system';
  readOnly?: boolean;
}

export interface ColumnSchema {
  name: string;
  type: string;
  notNull: boolean;
  defaultValue: any;
  primaryKey: boolean;
}

export interface ForeignKeyInfo {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
  onUpdate: string;
  onDelete: string;
  match: string;
}

export interface TableInfo {
  name: string;
  columns: ColumnSchema[];
  foreignKeys: ForeignKeyInfo[];
}

export interface QueryResult {
  rows: any[];
  columns: string[];
  affectedRows?: number;
  error?: string;
}
