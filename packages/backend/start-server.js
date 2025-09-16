const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const {
  MYSQL_HOST = 'localhost',
  MYSQL_PORT = '3306',
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = '',
  MYSQL_DATABASE = 'stock_app',
  PORT = '3004',
} = process.env;

const numeric = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toISOString = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const dataDir = path.join(__dirname, 'data');
let pool;

async function ensureDatabaseExists() {
  const bootstrapPool = mysql.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: 2,
  });

  try {
    await bootstrapPool.query(
      `CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await bootstrapPool.end();
  }
}

async function initPool() {
  pool = mysql.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
  });
}

async function initTables() {
  const tableStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255),
      password VARCHAR(255),
      role VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(18,2) DEFAULT 0,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      stock_id VARCHAR(64),
      stock_name VARCHAR(255),
      stock_symbol VARCHAR(50),
      price DECIMAL(18,2) DEFAULT 0,
      quantity INT DEFAULT 0,
      total DECIMAL(18,2) DEFAULT 0,
      order_date DATETIME,
      status VARCHAR(32)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS stock_accounts (
      id VARCHAR(64) PRIMARY KEY,
      account_name VARCHAR(255) NOT NULL,
      account_type VARCHAR(120),
      broker VARCHAR(120),
      account_number VARCHAR(128),
      balance DECIMAL(18,2) DEFAULT 0,
      available_funds DECIMAL(18,2) DEFAULT 0,
      status VARCHAR(32),
      group_id VARCHAR(64),
      created_date DATETIME,
      last_updated DATETIME
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  ];

  for (const sql of tableStatements) {
    await pool.query(sql);
  }
}

function readSeedFile(fileName, key) {
  try {
    const filePath = path.join(dataDir, fileName);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    const data = json[key];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`Seed file ${fileName} could not be read:`, error.message);
    return [];
  }
}

async function seedUsers() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (rows[0]?.count > 0) return;
  const users = readSeedFile('users.json', 'users');
  if (!users.length) return;
  const values = users.map((user) => [
    user.id?.toString() || crypto.randomUUID(),
    user.username || '',
    user.email || null,
    user.password || null,
    user.role || null,
  ]);
  await pool.query(
    'INSERT INTO users (id, username, email, password, role) VALUES ?',[values]
  );
}

async function seedProducts() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM products');
  if (rows[0]?.count > 0) return;
  const products = readSeedFile('products.json', 'products');
  if (!products.length) return;
  const values = products.map((product) => [
    product.id?.toString() || crypto.randomUUID(),
    product.name || '',
    numeric(product.price) ?? 0,
    product.description || null,
  ]);
  await pool.query(
    'INSERT INTO products (id, name, price, description) VALUES ?',
    [values]
  );
}

async function seedStockAccounts() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM stock_accounts');
  if (rows[0]?.count > 0) return;
  const accounts = readSeedFile('stockAccounts.json', 'stockAccounts');
  if (!accounts.length) return;
  const values = accounts.map((account) => [
    account.id?.toString() || crypto.randomUUID(),
    account.accountName || '',
    account.accountType || null,
    account.broker || null,
    account.accountNumber || null,
    numeric(account.balance) ?? 0,
    numeric(account.availableFunds) ?? 0,
    account.status || null,
    account.group || null,
    toDate(account.createdDate) || new Date(),
    toDate(account.lastUpdated) || new Date(),
  ]);
  await pool.query(
    `INSERT INTO stock_accounts (
      id, account_name, account_type, broker, account_number,
      balance, available_funds, status, group_id, created_date, last_updated
    ) VALUES ?`,
    [values]
  );
}

async function seedReferenceData() {
  await seedUsers();
  await seedProducts();
  await seedStockAccounts();
}

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const mapOrderRow = (row) => ({
  id: row.id,
  stockId: row.stock_id,
  stockName: row.stock_name,
  stockSymbol: row.stock_symbol,
  price: numeric(row.price) ?? 0,
  quantity: row.quantity,
  total: numeric(row.total) ?? 0,
  date: toISOString(row.order_date),
  status: row.status,
});

const mapStockAccountRow = (row) => ({
  id: row.id,
  accountName: row.account_name,
  accountType: row.account_type,
  broker: row.broker,
  accountNumber: row.account_number,
  balance: numeric(row.balance) ?? 0,
  availableFunds: numeric(row.available_funds) ?? 0,
  status: row.status,
  group: row.group_id,
  createdDate: toISOString(row.created_date),
  lastUpdated: toISOString(row.last_updated),
});

function normaliseOrder(order) {
  const price = numeric(order.price) ?? 0;
  const quantity = numeric(order.quantity) ?? 0;
  const total = numeric(order.total) ?? price * quantity;

  return [
    (order.id ?? Date.now()).toString(),
    order.stockId ?? null,
    order.stockName ?? null,
    order.stockSymbol ?? null,
    price,
    quantity,
    total ?? 0,
    toDate(order.date) || new Date(),
    order.status ?? 'pending',
  ];
}

function buildUpdateParts(payload, fieldMap) {
  const updates = [];
  const values = [];

  Object.entries(fieldMap).forEach(([property, { column, transform }]) => {
    if (payload[property] !== undefined) {
      updates.push(`${column} = ?`);
      values.push(transform ? transform(payload[property]) : payload[property]);
    }
  });

  return { updates, values };
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', asyncHandler(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
}));

app.get('/orders', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
  res.json(rows.map(mapOrderRow));
}));

app.post('/orders', asyncHandler(async (req, res) => {
  const { orders } = req.body || {};
  if (!Array.isArray(orders)) {
    return res.status(400).json({ message: 'orders must be an array' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM orders');
    if (orders.length > 0) {
      const values = orders.map(normaliseOrder);
      await connection.query(
        `INSERT INTO orders (
          id, stock_id, stock_name, stock_symbol, price,
          quantity, total, order_date, status
        ) VALUES ?`,
        [values]
      );
    }
    await connection.commit();
    res.status(201).json({ inserted: orders.length });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.patch('/orders/:id', asyncHandler(async (req, res) => {
  const fieldMap = {
    stockId: { column: 'stock_id' },
    stockName: { column: 'stock_name' },
    stockSymbol: { column: 'stock_symbol' },
    price: { column: 'price', transform: numeric },
    quantity: { column: 'quantity', transform: numeric },
    total: { column: 'total', transform: numeric },
    date: { column: 'order_date', transform: toDate },
    status: { column: 'status' },
  };

  const { updates, values } = buildUpdateParts(req.body || {}, fieldMap);
  if (!updates.length) {
    return res.status(400).json({ message: 'no updatable fields provided' });
  }
  values.push(req.params.id);

  const [result] = await pool.query(
    `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'order not found' });
  }

  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  res.json(mapOrderRow(rows[0]));
}));

app.get('/users', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, username, email, password, role FROM users ORDER BY username');
  res.json(rows);
}));

app.post('/users', asyncHandler(async (req, res) => {
  const user = req.body || {};
  const id = (user.id ?? crypto.randomUUID()).toString();
  await pool.query(
    'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [id, user.username || '', user.email || null, user.password || null, user.role || null]
  );
  const [rows] = await pool.query('SELECT id, username, email, password, role FROM users WHERE id = ?', [id]);
  res.status(201).json(rows[0]);
}));

app.patch('/users/:id', asyncHandler(async (req, res) => {
  const fieldMap = {
    username: { column: 'username' },
    email: { column: 'email' },
    password: { column: 'password' },
    role: { column: 'role' },
  };
  const { updates, values } = buildUpdateParts(req.body || {}, fieldMap);
  if (!updates.length) {
    return res.status(400).json({ message: 'no updatable fields provided' });
  }
  values.push(req.params.id);

  const [result] = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'user not found' });
  }
  const [rows] = await pool.query('SELECT id, username, email, password, role FROM users WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
}));

app.delete('/users/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'user not found' });
  }
  res.status(204).end();
}));

app.get('/products', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, price, description FROM products ORDER BY name');
  res.json(rows.map((row) => ({
    ...row,
    price: numeric(row.price) ?? 0,
  })));
}));

app.post('/products', asyncHandler(async (req, res) => {
  const product = req.body || {};
  const id = (product.id ?? crypto.randomUUID()).toString();
  await pool.query(
    'INSERT INTO products (id, name, price, description) VALUES (?, ?, ?, ?)',
    [id, product.name || '', numeric(product.price) ?? 0, product.description || null]
  );
  const [rows] = await pool.query('SELECT id, name, price, description FROM products WHERE id = ?', [id]);
  res.status(201).json(rows[0]);
}));

app.put('/products/:id', asyncHandler(async (req, res) => {
  const product = req.body || {};
  await pool.query(
    'UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?',
    [product.name || '', numeric(product.price) ?? 0, product.description || null, req.params.id]
  );
  const [rows] = await pool.query('SELECT id, name, price, description FROM products WHERE id = ?', [req.params.id]);
  if (!rows.length) {
    return res.status(404).json({ message: 'product not found' });
  }
  res.json(rows[0]);
}));

app.delete('/products/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'product not found' });
  }
  res.status(204).end();
}));

app.get('/stockAccounts', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM stock_accounts ORDER BY account_name');
  res.json(rows.map(mapStockAccountRow));
}));

app.post('/stockAccounts', asyncHandler(async (req, res) => {
  const account = req.body || {};
  const id = (account.id ?? crypto.randomUUID()).toString();
  const createdDate = toDate(account.createdDate) || new Date();
  const lastUpdated = toDate(account.lastUpdated) || new Date();

  await pool.query(
    `INSERT INTO stock_accounts (
      id, account_name, account_type, broker, account_number,
      balance, available_funds, status, group_id, created_date, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      account.accountName || '',
      account.accountType || null,
      account.broker || null,
      account.accountNumber || null,
      numeric(account.balance) ?? 0,
      numeric(account.availableFunds) ?? 0,
      account.status || null,
      account.group || null,
      createdDate,
      lastUpdated,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM stock_accounts WHERE id = ?', [id]);
  res.status(201).json(mapStockAccountRow(rows[0]));
}));

app.put('/stockAccounts/:id', asyncHandler(async (req, res) => {
  const account = req.body || {};
  const lastUpdated = toDate(account.lastUpdated) || new Date();

  await pool.query(
    `UPDATE stock_accounts SET
      account_name = ?,
      account_type = ?,
      broker = ?,
      account_number = ?,
      balance = ?,
      available_funds = ?,
      status = ?,
      group_id = ?,
      created_date = ?,
      last_updated = ?
    WHERE id = ?`,
    [
      account.accountName || '',
      account.accountType || null,
      account.broker || null,
      account.accountNumber || null,
      numeric(account.balance) ?? 0,
      numeric(account.availableFunds) ?? 0,
      account.status || null,
      account.group || null,
      toDate(account.createdDate) || new Date(),
      lastUpdated,
      req.params.id,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM stock_accounts WHERE id = ?', [req.params.id]);
  if (!rows.length) {
    return res.status(404).json({ message: 'stock account not found' });
  }
  res.json(mapStockAccountRow(rows[0]));
}));

app.delete('/stockAccounts/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM stock_accounts WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'stock account not found' });
  }
  res.status(204).end();
}));

app.use((err, req, res, next) => {
  console.error('API error:', err);
  res.status(500).json({ message: 'internal server error', detail: err.message });
});

async function start() {
  try {
    await ensureDatabaseExists();
    await initPool();
    await initTables();
    await seedReferenceData();

    const port = Number(PORT) || 3004;
    app.listen(port, () => {
      console.log(`API server is running on port ${port}`);
      console.log(`Connected to MySQL database ${MYSQL_DATABASE} at ${MYSQL_HOST}:${MYSQL_PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();


