import { TableInfo, QueryResult, ColumnSchema, ForeignKeyInfo } from './types';

export class SQLiteDriver {
  private db: any;
  private isReadOnly: boolean;

  constructor(db: any, isReadOnly = false) {
    this.db = db;
    this.isReadOnly = isReadOnly;
  }

  /**
   * Helper factory to resolve the database connection.
   * If dbInput is a string, it dynamically imports bun:sqlite or better-sqlite3 depending on the platform.
   */
  static async create(dbInput: any, isReadOnly = false): Promise<SQLiteDriver> {
    let dbInstance = dbInput;
    if (typeof dbInput === 'string') {
      if (typeof (globalThis as any).Bun !== 'undefined') {
        // @ts-ignore
        const { Database } = await import('bun:sqlite');
        dbInstance = new Database(dbInput);
      } else {
        try {
          // Dynamic import of better-sqlite3 for Node.js
          const { default: Database } = await import('better-sqlite3');
          dbInstance = new Database(dbInput);
        } catch (e) {
          try {
            // Fallback to native node:sqlite (Node 22.5.0+)
            const { DatabaseSync } = await import('node:sqlite');
            dbInstance = new DatabaseSync(dbInput);
          } catch (e2) {
            throw new Error(
              'No SQLite driver found. Please run in Bun, install better-sqlite3 in Node.js, or pass an active database instance.'
            );
          }
        }
      }
    }
    return new SQLiteDriver(dbInstance, isReadOnly);
  }

  /**
   * Execute raw SQL query with parameters safely.
   */
  execute(sql: string, params: any[] = []): QueryResult {
    if (this.isReadOnly) {
      const isWrite = !/^\s*(select|pragma|explain|show|desc)/i.test(sql);
      if (isWrite) {
        return { rows: [], columns: [], error: 'Database is in read-only mode' };
      }
    }

    try {
      const stmt = this.db.prepare(sql);
      let rows: any[] = [];
      let affectedRows: number | undefined;

      try {
        rows = stmt.all(...params);
      } catch (err: any) {
        const errMsg = err.message || '';
        if (
          errMsg.includes('returns data') ||
          errMsg.includes('does not return data') ||
          errMsg.includes('use run') ||
          errMsg.includes('is not a select') ||
          errMsg.includes('column names')
        ) {
          const result = stmt.run(...params);
          affectedRows = result?.changes ?? 0;
          rows = [];
        } else {
          throw err;
        }
      }

      let columns: string[] = [];
      if (rows && rows.length > 0) {
        columns = Object.keys(rows[0]);
      } else if (stmt.columnNames) {
        columns = stmt.columnNames;
      } else if (stmt.columns) {
        try {
          const cols = typeof stmt.columns === 'function' ? stmt.columns() : stmt.columns;
          if (Array.isArray(cols)) {
            columns = cols.map((c: any) => (typeof c === 'string' ? c : c.name));
          }
        } catch (e) {
          // Ignore error for non-reader statements
        }
      }

      return { rows, columns, affectedRows };
    } catch (err: any) {
      return { rows: [], columns: [], error: err.message || String(err) };
    }
  }

  /**
   * Get all user table names.
   */
  getTables(): string[] {
    const res = this.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (res.error) throw new Error(res.error);
    return res.rows.map((r) => r.name);
  }

  /**
   * Fetch columns and foreign keys for a specific table.
   */
  getTableInfo(table: string): TableInfo {
    const sanitizedTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    const colRes = this.execute(`PRAGMA table_info("${sanitizedTable}")`);
    if (colRes.error) throw new Error(colRes.error);

    const fkRes = this.execute(`PRAGMA foreign_key_list("${sanitizedTable}")`);
    if (fkRes.error) throw new Error(fkRes.error);

    const columns: ColumnSchema[] = colRes.rows.map((r) => ({
      name: r.name,
      type: r.type,
      notNull: r.notnull === 1,
      defaultValue: r.dflt_value,
      primaryKey: r.pk === 1 || r.pk === true,
    }));

    const foreignKeys: ForeignKeyInfo[] = fkRes.rows.map((r) => ({
      id: r.id,
      seq: r.seq,
      table: r.table,
      from: r.from,
      to: r.to,
      onUpdate: r.on_update,
      onDelete: r.on_delete,
      match: r.match,
    }));

    return { name: table, columns, foreignKeys };
  }

  /**
   * Fetch rows for a table with pagination and searching.
   */
  getRows(
    table: string,
    options: { limit: number; offset: number; search?: string }
  ): { rows: any[]; total: number } {
    const sanitizedTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    const { limit, offset, search } = options;
    const info = this.getTableInfo(table);

    let whereClause = '';
    const params: any[] = [];

    if (search && info.columns.length > 0) {
      // Find columns that are of type text or similar
      const searchTerms = info.columns
        .filter(
          (c) =>
            ['TEXT', 'VARCHAR', 'CHAR', 'CLOB'].some((t) =>
              c.type.toUpperCase().includes(t)
            ) || c.type === ''
        )
        .map((c) => `"${c.name.replace(/"/g, '""')}" LIKE ?`);

      if (searchTerms.length > 0) {
        whereClause = ` WHERE ${searchTerms.join(' OR ')}`;
        const wildCardSearch = `%${search}%`;
        searchTerms.forEach(() => params.push(wildCardSearch));
      }
    }

    // Count total rows
    const countSql = `SELECT COUNT(*) as count FROM "${sanitizedTable}"${whereClause}`;
    const countRes = this.execute(countSql, params);
    const total = countRes.rows[0]?.count ?? 0;

    // Fetch data rows
    const selectSql = `SELECT * FROM "${sanitizedTable}"${whereClause} LIMIT ? OFFSET ?`;
    const selectRes = this.execute(selectSql, [...params, limit, offset]);

    return {
      rows: selectRes.rows,
      total,
    };
  }

  /**
   * Insert a new row.
   */
  insertRow(table: string, data: Record<string, any>): QueryResult {
    const sanitizedTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    const columns = Object.keys(data).map((c) => `"${c.replace(/"/g, '""')}"`);
    const placeholders = Object.keys(data).map(() => '?');
    const values = Object.values(data);

    const sql = `INSERT INTO "${sanitizedTable}" (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    const res = this.execute(sql, values);
    if (res.error) throw new Error(res.error);
    return res;
  }

  /**
   * Update an existing row based on a primary key dictionary.
   */
  updateRow(
    table: string,
    pk: Record<string, any>,
    data: Record<string, any>
  ): QueryResult {
    const sanitizedTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    const setTerms = Object.keys(data).map((c) => `"${c.replace(/"/g, '""')}" = ?`);
    const setValues = Object.values(data);

    const whereTerms = Object.keys(pk).map((c) => `"${c.replace(/"/g, '""')}" = ?`);
    const whereValues = Object.values(pk);

    const sql = `UPDATE "${sanitizedTable}" SET ${setTerms.join(', ')} WHERE ${whereTerms.join(' AND ')}`;
    const res = this.execute(sql, [...setValues, ...whereValues]);
    if (res.error) throw new Error(res.error);
    return res;
  }

  /**
   * Delete a row based on a primary key dictionary.
   */
  deleteRow(table: string, pk: Record<string, any>): QueryResult {
    const sanitizedTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    const whereTerms = Object.keys(pk).map((c) => `"${c.replace(/"/g, '""')}" = ?`);
    const whereValues = Object.values(pk);

    const sql = `DELETE FROM "${sanitizedTable}" WHERE ${whereTerms.join(' AND ')}`;
    const res = this.execute(sql, whereValues);
    if (res.error) throw new Error(res.error);
    return res;
  }
}
