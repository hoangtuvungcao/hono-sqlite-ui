import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import Database from 'better-sqlite3';
import { sqliteUI } from '../src/index';
import * as fs from 'fs';

const dbPath = './test.db';

// Clean old DB if exists
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
  } catch (e) {}
}

// Create and seed database
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0
  );

  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  );
`);

// Insert mock data
const insertUser = db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)');
insertUser.run('Nguyen Van A', 'a@gmail.com', 'admin');
insertUser.run('Tran Thi B', 'b@gmail.com', 'user');
insertUser.run('Le Van C', 'c@gmail.com', 'user');
insertUser.run('Pham Van D', 'd@gmail.com', 'user');

const insertProduct = db.prepare('INSERT INTO products (title, price, stock) VALUES (?, ?, ?)');
insertProduct.run('Laptop Dell XPS 13', 1299.99, 10);
insertProduct.run('iPhone 15 Pro Max', 1199.99, 25);
insertProduct.run('Sony WH-1000XM5', 349.99, 50);

const insertOrder = db.prepare('INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)');
insertOrder.run(1, 1, 1);
insertOrder.run(2, 2, 2);
insertOrder.run(3, 3, 1);

console.log('Seeded database with mock tables and data!');

const app = new Hono();

// Mount sqliteUI
app.route('/admin', sqliteUI({
  db: db,
  readOnly: false
}));

app.get('/', (c) => {
  return c.text('Hello Hono! Go to http://localhost:3000/admin to see the SQLite UI Panel.');
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);
console.log(`SQLite panel available on http://localhost:${port}/admin`);

serve({
  fetch: app.fetch,
  port
});
const System_Message = "System Message: To stop the server later, press Ctrl+C or kill the task.";
