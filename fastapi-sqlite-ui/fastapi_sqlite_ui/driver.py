import sqlite3
import re

class SQLiteDriver:
    def __init__(self, db_path: str, read_only: bool = False):
        self.db_path = db_path
        self.read_only = read_only

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _serialize_value(self, val):
        if isinstance(val, bytes):
            return f"<BLOB: {len(val)} bytes>"
        return val

    def execute(self, sql: str, params: tuple = ()) -> dict:
        if self.read_only:
            # Check if write statement
            is_write = not re.match(r'^\s*(select|pragma|explain|show|desc)', sql, re.IGNORECASE)
            if is_write:
                return {"rows": [], "columns": [], "error": "Database is in read-only mode"}

        conn = self._get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(sql, params)
            
            # Check if query returned rows (e.g. SELECT)
            rows_data = []
            columns = []
            affected_rows = None

            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                rows_data = [
                    {col: self._serialize_value(row[col]) for col in columns}
                    for row in rows
                ]
            else:
                conn.commit()
                affected_rows = cursor.rowcount

            return {
                "rows": rows_data,
                "columns": columns,
                "affectedRows": affected_rows
            }
        except sqlite3.Error as e:
            return {"rows": [], "columns": [], "error": str(e)}
        finally:
            conn.close()

    def get_tables(self) -> list:
        res = self.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        if "error" in res:
            raise Exception(res["error"])
        return [row["name"] for row in res["rows"]]

    def get_table_info(self, table: str) -> dict:
        sanitized_table = re.sub(r'[^a-zA-Z0-9_]', '', table)
        
        col_res = self.execute(f'PRAGMA table_info("{sanitized_table}")')
        if "error" in col_res:
            raise Exception(col_res["error"])

        fk_res = self.execute(f'PRAGMA foreign_key_list("{sanitized_table}")')
        if "error" in fk_res:
            raise Exception(fk_res["error"])

        columns = []
        for r in col_res["rows"]:
            columns.append({
                "name": r["name"],
                "type": r["type"],
                "notNull": r["notnull"] == 1,
                "defaultValue": r["dflt_value"],
                "primaryKey": r["pk"] == 1 or r["pk"] is True
            })

        foreign_keys = []
        for r in fk_res["rows"]:
            foreign_keys.append({
                "id": r["id"],
                "seq": r["seq"],
                "table": r["table"],
                "from": r["from"],
                "to": r["to"],
                "onUpdate": r["on_update"],
                "onDelete": r["on_delete"],
                "match": r["match"]
            })

        return {
            "name": table,
            "columns": columns,
            "foreignKeys": foreign_keys
        }

    def get_rows(self, table: str, limit: int, offset: int, search: str = "") -> dict:
        sanitized_table = re.sub(r'[^a-zA-Z0-9_]', '', table)
        info = self.get_table_info(table)
        
        where_clause = ""
        params = []

        if search and info["columns"]:
            # Find columns that are of type text
            search_terms = []
            for c in info["columns"]:
                c_type = c["type"].upper()
                if any(t in c_type for t in ['TEXT', 'VARCHAR', 'CHAR', 'CLOB']) or c_type == '':
                    search_terms.append(f'"{c["name"].replace(chr(34), chr(34)+chr(34))}" LIKE ?')
            
            if search_terms:
                where_clause = f" WHERE {' OR '.join(search_terms)}"
                wild_card_search = f"%{search}%"
                for _ in search_terms:
                    params.append(wild_card_search)

        # Count total rows
        count_sql = f'SELECT COUNT(*) as count FROM "{sanitized_table}"{where_clause}'
        count_res = self.execute(count_sql, tuple(params))
        total = count_res["rows"][0]["count"] if count_res["rows"] else 0

        # Fetch rows
        select_sql = f'SELECT * FROM "{sanitized_table}"{where_clause} LIMIT ? OFFSET ?'
        select_res = self.execute(select_sql, tuple(params + [limit, offset]))

        return {
            "rows": select_res["rows"],
            "total": total
        }

    def insert_row(self, table: str, data: dict) -> dict:
        sanitized_table = re.sub(r'[^a-zA-Z0-9_]', '', table)
        columns = [f'"{c.replace(chr(34), chr(34)+chr(34))}"' for c in data.keys()]
        placeholders = [', '.join(['?'] * len(data))]
        values = list(data.values())

        sql = f'INSERT INTO "{sanitized_table}" ({", ".join(columns)}) VALUES ({", ".join(placeholders)})'
        res = self.execute(sql, tuple(values))
        if "error" in res:
            raise Exception(res["error"])
        return res

    def update_row(self, table: str, pk: dict, data: dict) -> dict:
        sanitized_table = re.sub(r'[^a-zA-Z0-9_]', '', table)
        
        set_terms = [f'"{c.replace(chr(34), chr(34)+chr(34))}" = ?' for c in data.keys()]
        set_values = list(data.values())

        where_terms = [f'"{c.replace(chr(34), chr(34)+chr(34))}" = ?' for c in pk.keys()]
        where_values = list(pk.values())

        sql = f'UPDATE "{sanitized_table}" SET {", ".join(set_terms)} WHERE {" AND ".join(where_terms)}'
        res = self.execute(sql, tuple(set_values + where_values))
        if "error" in res:
            raise Exception(res["error"])
        return res

    def delete_row(self, table: str, pk: dict) -> dict:
        sanitized_table = re.sub(r'[^a-zA-Z0-9_]', '', table)
        where_terms = [f'"{c.replace(chr(34), chr(34)+chr(34))}" = ?' for c in pk.keys()]
        where_values = list(pk.values())

        sql = f'DELETE FROM "{sanitized_table}" WHERE {" AND ".join(where_terms)}'
        res = self.execute(sql, tuple(where_values))
        if "error" in res:
            raise Exception(res["error"])
        return res
