import { Hono } from 'hono';
import { SQLiteDriver } from './driver';
import { getHtmlTemplate } from './ui';
import { SQLiteUIConfig } from './types';

export function sqliteUI(config: SQLiteUIConfig): Hono {
  const app = new Hono();
  let driverPromise: Promise<SQLiteDriver> | null = null;

  const getDriver = async () => {
    if (!driverPromise) {
      driverPromise = SQLiteDriver.create(config.db, config.readOnly);
    }
    return driverPromise;
  };

  // Serve Frontend UI Dashboard
  app.get('/', async (c) => {
    const path = c.req.path;
    // Normalize path to get the base path (e.g. /admin/ -> /admin)
    const basePath = path.endsWith('/') ? path.slice(0, -1) : path;
    return c.html(getHtmlTemplate(basePath));
  });

  app.get('/index.html', async (c) => {
    const path = c.req.path;
    const basePath = path.replace(/\/index\.html$/, '');
    return c.html(getHtmlTemplate(basePath));
  });

  // API: List Tables
  app.get('/api/tables', async (c) => {
    try {
      const driver = await getDriver();
      const tables = driver.getTables();
      return c.json({
        success: true,
        tables,
        readOnly: config.readOnly ?? false,
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || String(err) }, 500);
    }
  });

  // API: Get Table schema and paginated rows
  app.get('/api/tables/:tableName', async (c) => {
    try {
      const tableName = c.req.param('tableName');
      const page = parseInt(c.req.query('page') || '1', 10);
      const limit = parseInt(c.req.query('limit') || '10', 10);
      const search = c.req.query('search') || '';

      const offset = (page - 1) * limit;
      const driver = await getDriver();

      const info = driver.getTableInfo(tableName);
      const { rows, total } = driver.getRows(tableName, { limit, offset, search });

      return c.json({ success: true, info, rows, total });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || String(err) }, 500);
    }
  });

  // API: Run custom SQL query
  app.post('/api/query', async (c) => {
    try {
      const { sql, params } = await c.req.json<{ sql: string; params?: any[] }>();
      if (!sql) {
        return c.json({ success: false, error: 'SQL query is required' }, 400);
      }

      const driver = await getDriver();
      const result = driver.execute(sql, params || []);

      if (result.error) {
        return c.json({ success: false, error: result.error });
      }

      return c.json({
        success: true,
        rows: result.rows,
        columns: result.columns,
        affectedRows: result.affectedRows,
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || String(err) }, 500);
    }
  });

  // API: Create new row
  app.post('/api/tables/:tableName', async (c) => {
    if (config.readOnly) {
      return c.json({ success: false, error: 'Database is in read-only mode' }, 403);
    }
    try {
      const tableName = c.req.param('tableName');
      const { data } = await c.req.json<{ data: Record<string, any> }>();
      if (!data) {
        return c.json({ success: false, error: 'Data is required' }, 400);
      }

      const driver = await getDriver();
      driver.insertRow(tableName, data);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || String(err) }, 500);
    }
  });

  // API: Update row
  app.put('/api/tables/:tableName', async (c) => {
    if (config.readOnly) {
      return c.json({ success: false, error: 'Database is in read-only mode' }, 403);
    }
    try {
      const tableName = c.req.param('tableName');
      const { pk, data } = await c.req.json<{ pk: Record<string, any>; data: Record<string, any> }>();
      if (!pk || !data) {
        return c.json({ success: false, error: 'pk and data are required' }, 400);
      }

      const driver = await getDriver();
      driver.updateRow(tableName, pk, data);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || String(err) }, 500);
    }
  });

  // API: Delete row
  app.delete('/api/tables/:tableName', async (c) => {
    if (config.readOnly) {
      return c.json({ success: false, error: 'Database is in read-only mode' }, 403);
    }
    try {
      const tableName = c.req.param('tableName');
      const { pk } = await c.req.json<{ pk: Record<string, any> }>();
      if (!pk) {
        return c.json({ success: false, error: 'pk is required' }, 400);
      }

      const driver = await getDriver();
      driver.deleteRow(tableName, pk);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || String(err) }, 500);
    }
  });

  return app;
}

export * from './types';
