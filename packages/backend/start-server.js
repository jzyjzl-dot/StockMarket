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

const dataDir = path.join(__dirname, 'data');
let pool;

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
    `CREATE TABLE IF NOT EXISTS account_groups (
      id VARCHAR(64) PRIMARY KEY,
      group_id VARCHAR(64),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_date DATETIME,
      last_updated DATETIME
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS stocks (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      symbol VARCHAR(50) NOT NULL,
      price DECIMAL(18,2) DEFAULT 0,
      change_value DECIMAL(18,2) DEFAULT 0,
      change_percent DECIMAL(18,2) DEFAULT 0
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS trades (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      product_id VARCHAR(64),
      amount DECIMAL(18,2) DEFAULT 0,
      status VARCHAR(32)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS normal_buys (
      id VARCHAR(64) PRIMARY KEY,
      buy_time DATETIME,
      account VARCHAR(128),
      side VARCHAR(16),
      symbol VARCHAR(64),
      price DECIMAL(18,2) DEFAULT 0,
      qty INT DEFAULT 0,
      amount DECIMAL(18,2) DEFAULT 0,
      price_type VARCHAR(32),
      strategy VARCHAR(64),
      distribution VARCHAR(64),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS normal_orders (
      id VARCHAR(64) PRIMARY KEY,
      order_time DATETIME,
      account VARCHAR(128),
      symbol VARCHAR(64),
      type VARCHAR(32),
      side VARCHAR(16),
      price DECIMAL(18,2) DEFAULT 0,
      quantity INT DEFAULT 0,
      dealt INT DEFAULT 0,
      amount DECIMAL(18,2) DEFAULT 0,
      market VARCHAR(64),
      order_type VARCHAR(64),
      status VARCHAR(32),
      source VARCHAR(64),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  ];

  for (const sql of tableStatements) {
    await pool.query(sql);
  }
}

function readSeedArray(fileName, key) {
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
  const users = readSeedArray('users.json', 'users');
  if (!users.length) return;
  const values = users.map((user) => [
    user.id?.toString() || crypto.randomUUID(),
    user.username || '',
    user.email || null,
    user.password || null,
    user.role || null,
  ]);
  await pool.query(
    'INSERT INTO users (id, username, email, password, role) VALUES ?',
    [values]
  );
}

async function seedProducts() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM products');
  if (rows[0]?.count > 0) return;
  const products = readSeedArray('products.json', 'products');
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
  const accounts = readSeedArray('stockAccounts.json', 'stockAccounts');
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

async function seedAccountGroups() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM account_groups');
  if (rows[0]?.count > 0) return;
  const groups = readSeedArray('accountGroups.json', 'accountGroups');
  if (!groups.length) return;
  const values = groups.map((group) => [
    group.id?.toString() || crypto.randomUUID(),
    group.groupId?.toString() || null,
    group.name || '',
    group.description || null,
    toDate(group.createdDate) || new Date(),
    toDate(group.lastUpdated) || new Date(),
  ]);
  await pool.query(
    `INSERT INTO account_groups (
      id, group_id, name, description, created_date, last_updated
    ) VALUES ?`,
    [values]
  );
}

async function seedStocks() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM stocks');
  if (rows[0]?.count > 0) return;
  const stocks = readSeedArray('stocks.json', 'stocks');
  if (!stocks.length) return;
  const values = stocks.map((stock) => [
    stock.id?.toString() || crypto.randomUUID(),
    stock.name || '',
    stock.symbol || '',
    numeric(stock.price) ?? 0,
    numeric(stock.change) ?? 0,
    numeric(stock.changePercent) ?? 0,
  ]);
  await pool.query(
    `INSERT INTO stocks (
      id, name, symbol, price, change_value, change_percent
    ) VALUES ?`,
    [values]
  );
}

async function seedTrades() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM trades');
  if (rows[0]?.count > 0) return;
  const trades = readSeedArray('trades.json', 'trades');
  if (!trades.length) return;
  const values = trades.map((trade) => [
    trade.id?.toString() || crypto.randomUUID(),
    trade.userId?.toString() || null,
    trade.productId?.toString() || null,
    numeric(trade.amount) ?? 0,
    trade.status || null,
  ]);
  await pool.query(
    'INSERT INTO trades (id, user_id, product_id, amount, status) VALUES ?',
    [values]
  );
}

async function seedNormalBuys() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM normal_buys');
  if (rows[0]?.count > 0) return;
  const buys = readSeedArray('normal-buys.json', 'normalBuys');
  if (!buys.length) return;
  const values = buys.map((buy) => [
    buy.id?.toString() || crypto.randomUUID(),
    toDate(buy.timestamp) || new Date(),
    buy.account || null,
    buy.side || null,
    buy.symbol || null,
    numeric(buy.price) ?? 0,
    Number(buy.qty) || 0,
    numeric(buy.amount) ?? 0,
    buy.priceType || null,
    buy.strategy || null,
    buy.distribution || null,
  ]);
  await pool.query(
    `INSERT INTO normal_buys (
      id, buy_time, account, side, symbol, price, qty, amount,
      price_type, strategy, distribution
    ) VALUES ?`,
    [values]
  );
}

async function seedNormalOrders() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM normal_orders');
  if (rows[0]?.count > 0) return;
  const orders = readSeedArray('normal-orders.json', 'normalOrders');
  if (!orders.length) return;
  const values = orders.map((order) => [
    order.id?.toString() || crypto.randomUUID(),
    toDate(order.time || order.timestamp) || new Date(),
    order.account || null,
    order.symbol || null,
    order.type || null,
    order.side || null,
    numeric(order.price) ?? 0,
    Number(order.quantity ?? order.qty ?? 0) || 0,
    Number(order.dealt ?? 0) || 0,
    numeric(order.amount) ?? 0,
    order.market || null,
    order.orderType || null,
    order.status || null,
    order.source || null,
  ]);
  await pool.query(
    `INSERT INTO normal_orders (
      id, order_time, account, symbol, type, side, price, quantity,
      dealt, amount, market, order_type, status, source
    ) VALUES ?`,
    [values]
  );
}

async function seedReferenceData() {
  await seedUsers();
  await seedProducts();
  await seedStockAccounts();
  await seedAccountGroups();
  await seedStocks();
  await seedTrades();
  await seedNormalBuys();
  await seedNormalOrders();
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

const mapAccountGroupRow = (row) => ({
  id: row.id,
  groupId: row.group_id,
  name: row.name,
  description: row.description,
  createdDate: toISOString(row.created_date),
  lastUpdated: toISOString(row.last_updated),
});

const mapStockRow = (row) => ({
  id: row.id,
  name: row.name,
  symbol: row.symbol,
  price: numeric(row.price) ?? 0,
  change: numeric(row.change_value) ?? 0,
  changePercent: numeric(row.change_percent) ?? 0,
});

const mapTradeRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  productId: row.product_id,
  amount: numeric(row.amount) ?? 0,
  status: row.status,
});

const mapNormalBuyRow = (row) => ({
  id: row.id,
  timestamp: toISOString(row.buy_time),
  account: row.account,
  side: row.side,
  symbol: row.symbol,
  price: numeric(row.price) ?? 0,
  qty: row.qty,
  amount: numeric(row.amount) ?? 0,
  priceType: row.price_type,
  strategy: row.strategy,
  distribution: row.distribution,
});

const mapNormalOrderRow = (row) => ({
  id: row.id,
  time: toISOString(row.order_time),
  account: row.account,
  symbol: row.symbol,
  type: row.type,
  side: row.side,
  price: numeric(row.price) ?? 0,
  quantity: row.quantity,
  dealt: row.dealt,
  amount: numeric(row.amount) ?? 0,
  market: row.market,
  orderType: row.order_type,
  status: row.status,
  source: row.source,
});

function buildUpdateParts(payload, fieldMap) {
  const updates = [];
  const values = [];

  Object.entries(fieldMap).forEach(([property, { column, transform }]) => {
    if (payload[property] !== undefined) {
      updates.push(`${column} = ?`);
      values.push(
        transform ? transform(payload[property]) : payload[property]
      );
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
      const values = orders.map((order) => {
        const price = numeric(order.price) ?? 0;
        const quantity = Number(order.quantity ?? 0) || 0;
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
      });
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

app.get('/accountGroups', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM account_groups ORDER BY group_id');
  res.json(rows.map(mapAccountGroupRow));
}));

app.post('/accountGroups', asyncHandler(async (req, res) => {
  const group = req.body || {};
  const id = (group.id ?? crypto.randomUUID()).toString();
  await pool.query(
    `INSERT INTO account_groups (id, group_id, name, description, created_date, last_updated)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      group.groupId?.toString() || null,
      group.name || '',
      group.description || null,
      toDate(group.createdDate) || new Date(),
      toDate(group.lastUpdated) || new Date(),
    ]
  );
  const [rows] = await pool.query('SELECT * FROM account_groups WHERE id = ?', [id]);
  res.status(201).json(mapAccountGroupRow(rows[0]));
}));

app.put('/accountGroups/:id', asyncHandler(async (req, res) => {
  const group = req.body || {};
  const fieldMap = {
    groupId: { column: 'group_id', transform: (v) => v?.toString() ?? null },
    name: { column: 'name' },
    description: { column: 'description' },
    createdDate: { column: 'created_date', transform: toDate },
    lastUpdated: { column: 'last_updated', transform: toDate },
  };
  const { updates, values } = buildUpdateParts(group, fieldMap);
  if (!updates.length) {
    return res.status(400).json({ message: 'no updatable fields provided' });
  }
  values.push(req.params.id);
  const [result] = await pool.query(
    `UPDATE account_groups SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'account group not found' });
  }
  const [rows] = await pool.query('SELECT * FROM account_groups WHERE id = ?', [req.params.id]);
  res.json(mapAccountGroupRow(rows[0]));
}));

app.delete('/accountGroups/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM account_groups WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'account group not found' });
  }
  res.status(204).end();
}));

app.get('/stocks', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM stocks ORDER BY name');
  res.json(rows.map(mapStockRow));
}));

app.get('/trades', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM trades');
  res.json(rows.map(mapTradeRow));
}));

app.get('/normalBuys', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM normal_buys ORDER BY buy_time DESC');
  res.json(rows.map(mapNormalBuyRow));
}));

app.post('/normalBuys', asyncHandler(async (req, res) => {
  const buy = req.body || {};
  const id = (buy.id ?? crypto.randomUUID()).toString();
  const buyTime = toDate(buy.timestamp) || new Date();

  await pool.query(
    `INSERT INTO normal_buys (
      id, buy_time, account, side, symbol, price, qty, amount,
      price_type, strategy, distribution
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      buyTime,
      buy.account || null,
      buy.side || null,
      buy.symbol || null,
      numeric(buy.price) ?? 0,
      Number(buy.qty) || 0,
      numeric(buy.amount) ?? 0,
      buy.priceType || null,
      buy.strategy || null,
      buy.distribution || null,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM normal_buys WHERE id = ?', [id]);
  res.status(201).json(mapNormalBuyRow(rows[0]));
}));

app.delete('/normalBuys/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM normal_buys WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'normal buy not found' });
  }
  res.status(204).end();
}));

app.get('/normalOrders', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM normal_orders ORDER BY order_time DESC');
  res.json(rows.map(mapNormalOrderRow));
}));

app.post('/normalOrders', asyncHandler(async (req, res) => {
  const order = req.body || {};
  const id = (order.id ?? crypto.randomUUID()).toString();
  const orderTime = toDate(order.time || order.timestamp) || new Date();

  await pool.query(
    `INSERT INTO normal_orders (
      id, order_time, account, symbol, type, side, price, quantity,
      dealt, amount, market, order_type, status, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderTime,
      order.account || null,
      order.symbol || null,
      order.type || null,
      order.side || null,
      numeric(order.price) ?? 0,
      Number(order.quantity ?? order.qty ?? 0) || 0,
      Number(order.dealt ?? 0) || 0,
      numeric(order.amount) ?? 0,
      order.market || null,
      order.orderType || null,
      order.status || null,
      order.source || null,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM normal_orders WHERE id = ?', [id]);
  res.status(201).json(mapNormalOrderRow(rows[0]));
}));

app.delete('/normalOrders/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM normal_orders WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'normal order not found' });
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
