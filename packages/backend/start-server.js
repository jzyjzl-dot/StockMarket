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
  RESET_DB_ON_STARTUP = 'false',
} = process.env;

const dataDir = path.join(__dirname, 'data');
let pool;

const parseBoolean = (value) => {
  if (value === true || value === false) return Boolean(value);
  if (value == null) return false;
  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'on'].includes(normalized);
};

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
  const shouldResetTables = parseBoolean(RESET_DB_ON_STARTUP);
  if (shouldResetTables) {
    const tablesToDrop = [
      't0_orders',
      't0_buys',
      'algo_orders',
      'algo_buys',
      'normal_orders',
      'normal_buys',
    ];

    for (const table of tablesToDrop) {
      await pool.query(`DROP TABLE IF EXISTS \`${table}\``);
    }
    console.warn(
      '[DB] All trading tables were reset because RESET_DB_ON_STARTUP is enabled.'
    );
  }

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
    `CREATE TABLE IF NOT EXISTS trading_systems (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(64),
      path VARCHAR(512),
      status VARCHAR(32),
      creator VARCHAR(64),
      create_time DATETIME,
      update_time DATETIME
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
      weight_percent DECIMAL(5,2) DEFAULT 0,
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
      account_name VARCHAR(255),
      group_id VARCHAR(64),
      group_name VARCHAR(255),
  terminal_id INT DEFAULT 1,
  system_user_id VARCHAR(64) NOT NULL DEFAULT 'admin',
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
      account_name VARCHAR(255),
      group_id VARCHAR(64),
      group_name VARCHAR(255),
  terminal_id INT DEFAULT 1,
  system_user_id VARCHAR(64) NOT NULL DEFAULT 'admin',
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
    `CREATE TABLE IF NOT EXISTS algo_buys (
      id VARCHAR(64) PRIMARY KEY,
      buy_time DATETIME,
      account VARCHAR(128),
      account_name VARCHAR(255),
      group_id VARCHAR(64),
      group_name VARCHAR(255),
  terminal_id INT DEFAULT 1,
  system_user_id VARCHAR(64) NOT NULL DEFAULT 'admin',
      side VARCHAR(16),
      symbol VARCHAR(64),
      price DECIMAL(18,2) DEFAULT 0,
      qty INT DEFAULT 0,
      amount DECIMAL(18,2) DEFAULT 0,
      price_type VARCHAR(32),
      strategy VARCHAR(64),
      distribution VARCHAR(64),
      algo_type VARCHAR(32),
      algo_instance VARCHAR(128),
      start_time VARCHAR(16),
      end_time VARCHAR(16),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS algo_orders (
      id VARCHAR(64) PRIMARY KEY,
      order_time DATETIME,
      account VARCHAR(128),
      account_name VARCHAR(255),
      group_id VARCHAR(64),
      group_name VARCHAR(255),
  terminal_id INT DEFAULT 1,
  system_user_id VARCHAR(64) NOT NULL DEFAULT 'admin',
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
      algo_type VARCHAR(32),
      algo_instance VARCHAR(128),
      start_time VARCHAR(16),
      end_time VARCHAR(16),
      strategy VARCHAR(64),
      distribution VARCHAR(64),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS t0_buys (
      id VARCHAR(64) PRIMARY KEY,
      buy_time DATETIME,
      account VARCHAR(128),
      account_name VARCHAR(255),
      group_id VARCHAR(64),
      group_name VARCHAR(255),
  terminal_id INT DEFAULT 1,
  system_user_id VARCHAR(64) NOT NULL DEFAULT 'admin',
      entrust_method VARCHAR(32),
      symbol VARCHAR(64),
      algo_instance VARCHAR(128),
      business_start_time VARCHAR(16),
      business_end_time VARCHAR(16),
      buy_direction VARCHAR(32),
      sell_direction VARCHAR(32),
      strategy VARCHAR(64),
      qty INT DEFAULT 0,
      price DECIMAL(18,2) DEFAULT 0,
      amount DECIMAL(18,2) DEFAULT 0,
      distribution VARCHAR(64),
      basket_no VARCHAR(128),
      external_no VARCHAR(128),
      risk_exposure VARCHAR(32),
      exec_after_expire BOOLEAN DEFAULT FALSE,
      execute_immediately BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS t0_orders (
      id VARCHAR(64) PRIMARY KEY,
      order_time DATETIME,
      account VARCHAR(128),
      account_name VARCHAR(255),
      group_id VARCHAR(64),
      group_name VARCHAR(255),
  terminal_id INT DEFAULT 1,
  system_user_id VARCHAR(64) NOT NULL DEFAULT 'admin',
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
      source VARCHAR(64) DEFAULT 'T0',
      algo_instance VARCHAR(128),
      business_start_time VARCHAR(16),
      business_end_time VARCHAR(16),
      buy_direction VARCHAR(32),
      sell_direction VARCHAR(32),
      strategy VARCHAR(64),
      distribution VARCHAR(64),
      basket_no VARCHAR(128),
      external_no VARCHAR(128),
      risk_exposure VARCHAR(32),
      exec_after_expire BOOLEAN DEFAULT FALSE,
      execute_immediately BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  ];

  for (const sql of tableStatements) {
    await pool.query(sql);
  }
}

// Ensure schema compatibility with older DBs
async function ensureColumn(tableName, columnName, addColumnDDL) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?` ,
    [MYSQL_DATABASE, tableName, columnName]
  );
  if (!rows.length) {
    await pool.query(`ALTER TABLE \`${tableName}\` ${addColumnDDL}`);
  }
}

async function migrateSchema() {
  const enforceSystemUserDefaults = async (tableName) => {
    try {
      await pool.query(
        `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`system_user_id\` VARCHAR(64) NOT NULL DEFAULT 'admin'`
      );
    } catch (error) {
      console.warn(
        `Could not enforce system_user_id default on ${tableName}:`,
        error.message
      );
    }
  };
  // Keep legacy databases in sync with the latest T0 schema
  const t0OrderColumnEnsures = [
    ['type', 'ADD COLUMN `type` VARCHAR(32) NULL AFTER `symbol`'],
    ['source', "ADD COLUMN `source` VARCHAR(64) DEFAULT 'T0' AFTER `status`"],
    ['algo_instance', 'ADD COLUMN `algo_instance` VARCHAR(128) NULL AFTER `source`'],
    ['business_start_time', 'ADD COLUMN `business_start_time` VARCHAR(16) NULL AFTER `algo_instance`'],
    ['business_end_time', 'ADD COLUMN `business_end_time` VARCHAR(16) NULL AFTER `business_start_time`'],
    ['buy_direction', 'ADD COLUMN `buy_direction` VARCHAR(32) NULL AFTER `business_end_time`'],
    ['sell_direction', 'ADD COLUMN `sell_direction` VARCHAR(32) NULL AFTER `buy_direction`'],
    ['strategy', 'ADD COLUMN `strategy` VARCHAR(64) NULL AFTER `sell_direction`'],
    ['distribution', 'ADD COLUMN `distribution` VARCHAR(64) NULL AFTER `strategy`'],
    ['basket_no', 'ADD COLUMN `basket_no` VARCHAR(128) NULL AFTER `distribution`'],
    ['external_no', 'ADD COLUMN `external_no` VARCHAR(128) NULL AFTER `basket_no`'],
    ['risk_exposure', 'ADD COLUMN `risk_exposure` VARCHAR(32) NULL AFTER `external_no`'],
    ['exec_after_expire', 'ADD COLUMN `exec_after_expire` BOOLEAN DEFAULT FALSE AFTER `risk_exposure`'],
    ['execute_immediately', 'ADD COLUMN `execute_immediately` BOOLEAN DEFAULT FALSE AFTER `exec_after_expire`'],
    ['account_name', 'ADD COLUMN `account_name` VARCHAR(255) NULL AFTER `account`'],
    ['group_id', 'ADD COLUMN `group_id` VARCHAR(64) NULL AFTER `account_name`'],
    ['group_name', 'ADD COLUMN `group_name` VARCHAR(255) NULL AFTER `group_id`'],
    ['terminal_id', 'ADD COLUMN `terminal_id` INT DEFAULT 1 AFTER `group_name`'],
  ['system_user_id', "ADD COLUMN `system_user_id` VARCHAR(64) NOT NULL DEFAULT 'admin' AFTER `terminal_id`"],
  ];

  for (const [column, ddl] of t0OrderColumnEnsures) {
    await ensureColumn('t0_orders', column, ddl);
  }
  await enforceSystemUserDefaults('t0_orders');

  const t0BuyColumnEnsures = [
    ['entrust_method', 'ADD COLUMN `entrust_method` VARCHAR(32) NULL AFTER `account`'],
    ['algo_instance', 'ADD COLUMN `algo_instance` VARCHAR(128) NULL AFTER `symbol`'],
    ['business_start_time', 'ADD COLUMN `business_start_time` VARCHAR(16) NULL AFTER `algo_instance`'],
    ['business_end_time', 'ADD COLUMN `business_end_time` VARCHAR(16) NULL AFTER `business_start_time`'],
    ['buy_direction', 'ADD COLUMN `buy_direction` VARCHAR(32) NULL AFTER `business_end_time`'],
    ['sell_direction', 'ADD COLUMN `sell_direction` VARCHAR(32) NULL AFTER `buy_direction`'],
    ['strategy', 'ADD COLUMN `strategy` VARCHAR(64) NULL AFTER `sell_direction`'],
    ['distribution', 'ADD COLUMN `distribution` VARCHAR(64) NULL AFTER `strategy`'],
    ['basket_no', 'ADD COLUMN `basket_no` VARCHAR(128) NULL AFTER `distribution`'],
    ['external_no', 'ADD COLUMN `external_no` VARCHAR(128) NULL AFTER `basket_no`'],
    ['risk_exposure', 'ADD COLUMN `risk_exposure` VARCHAR(32) NULL AFTER `external_no`'],
    ['exec_after_expire', 'ADD COLUMN `exec_after_expire` BOOLEAN DEFAULT FALSE AFTER `risk_exposure`'],
    ['execute_immediately', 'ADD COLUMN `execute_immediately` BOOLEAN DEFAULT FALSE AFTER `exec_after_expire`'],
    ['account_name', 'ADD COLUMN `account_name` VARCHAR(255) NULL AFTER `account`'],
    ['group_id', 'ADD COLUMN `group_id` VARCHAR(64) NULL AFTER `account_name`'],
    ['group_name', 'ADD COLUMN `group_name` VARCHAR(255) NULL AFTER `group_id`'],
    ['terminal_id', 'ADD COLUMN `terminal_id` INT DEFAULT 1 AFTER `group_name`'],
  ['system_user_id', "ADD COLUMN `system_user_id` VARCHAR(64) NOT NULL DEFAULT 'admin' AFTER `terminal_id`"],
  ];

  for (const [column, ddl] of t0BuyColumnEnsures) {
    await ensureColumn('t0_buys', column, ddl);
  }
  await enforceSystemUserDefaults('t0_buys');

  const normalBuyColumnEnsures = [
    ['account_name', 'ADD COLUMN `account_name` VARCHAR(255) NULL AFTER `account`'],
    ['group_id', 'ADD COLUMN `group_id` VARCHAR(64) NULL AFTER `account_name`'],
    ['group_name', 'ADD COLUMN `group_name` VARCHAR(255) NULL AFTER `group_id`'],
    ['terminal_id', 'ADD COLUMN `terminal_id` INT DEFAULT 1 AFTER `group_name`'],
  ['system_user_id', "ADD COLUMN `system_user_id` VARCHAR(64) NOT NULL DEFAULT 'admin' AFTER `terminal_id`"],
  ];

  for (const [column, ddl] of normalBuyColumnEnsures) {
    await ensureColumn('normal_buys', column, ddl);
  }
  await enforceSystemUserDefaults('normal_buys');

  const normalOrderColumnEnsures = [
    ['account_name', 'ADD COLUMN `account_name` VARCHAR(255) NULL AFTER `account`'],
    ['group_id', 'ADD COLUMN `group_id` VARCHAR(64) NULL AFTER `account_name`'],
    ['group_name', 'ADD COLUMN `group_name` VARCHAR(255) NULL AFTER `group_id`'],
    ['terminal_id', 'ADD COLUMN `terminal_id` INT DEFAULT 1 AFTER `group_name`'],
  ['system_user_id', "ADD COLUMN `system_user_id` VARCHAR(64) NOT NULL DEFAULT 'admin' AFTER `terminal_id`"],
  ];

  for (const [column, ddl] of normalOrderColumnEnsures) {
    await ensureColumn('normal_orders', column, ddl);
  }
  await enforceSystemUserDefaults('normal_orders');

  const algoBuyColumnEnsures = [
    ['account_name', 'ADD COLUMN `account_name` VARCHAR(255) NULL AFTER `account`'],
    ['group_id', 'ADD COLUMN `group_id` VARCHAR(64) NULL AFTER `account_name`'],
    ['group_name', 'ADD COLUMN `group_name` VARCHAR(255) NULL AFTER `group_id`'],
    ['terminal_id', 'ADD COLUMN `terminal_id` INT DEFAULT 1 AFTER `group_name`'],
  ['system_user_id', "ADD COLUMN `system_user_id` VARCHAR(64) NOT NULL DEFAULT 'admin' AFTER `terminal_id`"],
  ];

  for (const [column, ddl] of algoBuyColumnEnsures) {
    await ensureColumn('algo_buys', column, ddl);
  }
  await enforceSystemUserDefaults('algo_buys');

  const algoOrderColumnEnsures = [
    ['account_name', 'ADD COLUMN `account_name` VARCHAR(255) NULL AFTER `account`'],
    ['group_id', 'ADD COLUMN `group_id` VARCHAR(64) NULL AFTER `account_name`'],
    ['group_name', 'ADD COLUMN `group_name` VARCHAR(255) NULL AFTER `group_id`'],
    ['terminal_id', 'ADD COLUMN `terminal_id` INT DEFAULT 1 AFTER `group_name`'],
    ['system_user_id', 'ADD COLUMN `system_user_id` VARCHAR(64) NULL AFTER `terminal_id`'],
  ];

  for (const [column, ddl] of algoOrderColumnEnsures) {
    await ensureColumn('algo_orders', column, ddl);
  }
  await enforceSystemUserDefaults('algo_orders');
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

async function seedTradingSystems() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM trading_systems');
  if (rows[0]?.count > 0) return;
  const systems = readSeedArray('tradingSystems.json', 'tradingSystems');
  if (!systems.length) return;
  const values = systems.map((system) => [
    system.id?.toString() || crypto.randomUUID(),
    system.name || '',
    system.type || null,
    system.path || null,
    system.status || 'inactive',
    system.creator || null,
    toDate(system.createTime) || new Date(),
    toDate(system.updateTime || system.createTime) || new Date(),
  ]);
  await pool.query(
    `INSERT INTO trading_systems (
      id, name, type, path, status, creator, create_time, update_time
    ) VALUES ?`,
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
    numeric(account.weightPercent) ?? 0,
    account.status || null,
    account.group || null,
    toDate(account.createdDate) || new Date(),
    toDate(account.lastUpdated) || new Date(),
  ]);
  await pool.query(
    `INSERT INTO stock_accounts (
      id, account_name, account_type, broker, account_number,
      balance, available_funds, weight_percent, status, group_id, created_date, last_updated
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
    buy.accountName || null,
    buy.groupId || buy.group?.toString() || null,
    buy.groupName || null,
    buy.terminalId != null ? Number(buy.terminalId) : 1,
  buy.systemUserId ?? buy.system_user_id ?? 'admin',
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
      id, buy_time, account, account_name, group_id, group_name, terminal_id, system_user_id,
      side, symbol, price, qty, amount,
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
    order.accountName || null,
    order.groupId || order.group?.toString() || null,
    order.groupName || null,
    order.terminalId != null ? Number(order.terminalId) : 1,
  order.systemUserId ?? order.system_user_id ?? 'admin',
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
      id, order_time, account, account_name, group_id, group_name, terminal_id, system_user_id,
      symbol, type, side, price, quantity,
      dealt, amount, market, order_type, status, source
    ) VALUES ?`,
    [values]
  );
}

async function seedReferenceData() {
  await seedUsers();
  await seedProducts();
  await seedStockAccounts();
  await seedTradingSystems();
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

const mapTradingSystemRow = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  path: row.path,
  status: row.status,
  creator: row.creator,
  createTime: toISOString(row.create_time),
  updateTime: toISOString(row.update_time),
});

const mapStockAccountRow = (row) => ({
  id: row.id,
  accountName: row.account_name,
  accountType: row.account_type,
  broker: row.broker,
  accountNumber: row.account_number,
  balance: numeric(row.balance) ?? 0,
  availableFunds: numeric(row.available_funds) ?? 0,
  weightPercent: numeric(row.weight_percent) ?? 0,
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
  accountName: row.account_name,
  groupId: row.group_id,
  groupName: row.group_name,
  terminalId: row.terminal_id != null ? Number(row.terminal_id) : 1,
  systemUserId: row.system_user_id,
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
  accountName: row.account_name,
  groupId: row.group_id,
  groupName: row.group_name,
  terminalId: row.terminal_id != null ? Number(row.terminal_id) : 1,
  systemUserId: row.system_user_id,
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

const mapAlgoBuyRow = (row) => ({
  id: row.id,
  timestamp: toISOString(row.buy_time),
  account: row.account,
  accountName: row.account_name,
  groupId: row.group_id,
  groupName: row.group_name,
  terminalId: row.terminal_id != null ? Number(row.terminal_id) : 1,
  systemUserId: row.system_user_id,
  side: row.side,
  symbol: row.symbol,
  price: numeric(row.price) ?? 0,
  qty: row.qty,
  amount: numeric(row.amount) ?? 0,
  priceType: row.price_type,
  strategy: row.strategy,
  distribution: row.distribution,
  algoType: row.algo_type,
  algoInstance: row.algo_instance,
  startTime: row.start_time,
  endTime: row.end_time,
});

const mapAlgoOrderRow = (row) => ({
  id: row.id,
  time: toISOString(row.order_time),
  account: row.account,
  accountName: row.account_name,
  groupId: row.group_id,
  groupName: row.group_name,
  terminalId: row.terminal_id != null ? Number(row.terminal_id) : 1,
  systemUserId: row.system_user_id,
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
  algoType: row.algo_type,
  algoInstance: row.algo_instance,
  startTime: row.start_time,
  endTime: row.end_time,
  strategy: row.strategy,
  distribution: row.distribution,
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

app.get('/tradingSystems', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM trading_systems ORDER BY create_time DESC, name');
  res.json(rows.map(mapTradingSystemRow));
}));

app.post('/tradingSystems', asyncHandler(async (req, res) => {
  const system = req.body || {};
  const id = (system.id ?? crypto.randomUUID()).toString();
  const createTime = toDate(system.createTime) || new Date();
  const updateTime = toDate(system.updateTime) || createTime;

  await pool.query(
    `INSERT INTO trading_systems (
      id, name, type, path, status, creator, create_time, update_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      system.name || '',
      system.type || null,
      system.path || null,
      system.status || 'active',
      system.creator || null,
      createTime,
      updateTime,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM trading_systems WHERE id = ?', [id]);
  res.status(201).json(mapTradingSystemRow(rows[0]));
}));

app.put('/tradingSystems/:id', asyncHandler(async (req, res) => {
  const system = req.body || {};
  const id = req.params.id;
  const updateTime = toDate(system.updateTime) || new Date();
  const createTime = toDate(system.createTime);

  const [result] = await pool.query(
    `UPDATE trading_systems SET
      name = ?,
      type = ?,
      path = ?,
      status = ?,
      creator = ?,
      create_time = COALESCE(?, create_time),
      update_time = ?
    WHERE id = ?`,
    [
      system.name || '',
      system.type || null,
      system.path || null,
      system.status || 'active',
      system.creator || null,
      createTime,
      updateTime,
      id,
    ]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'trading system not found' });
  }

  const [rows] = await pool.query('SELECT * FROM trading_systems WHERE id = ?', [id]);
  res.json(mapTradingSystemRow(rows[0]));
}));

app.delete('/tradingSystems/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM trading_systems WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'trading system not found' });
  }
  res.status(204).end();
}));

app.get('/accountFunds', asyncHandler(async (req, res) => {
  const { fundAccount, accountName } = req.query;
  const conditions = [];
  const params = [];

  const normalizedFundAccount =
    typeof fundAccount === 'string'
      ? fundAccount.trim()
      : fundAccount != null
        ? String(fundAccount).trim()
        : '';
  const normalizedAccountName =
    typeof accountName === 'string'
      ? accountName.trim()
      : accountName != null
        ? String(accountName).trim()
        : '';

  if (normalizedFundAccount) {
    conditions.push('(account_number LIKE ? OR id LIKE ?)');
    params.push(`%${normalizedFundAccount}%`, `%${normalizedFundAccount}%`);
  }
  if (normalizedAccountName) {
    conditions.push('account_name LIKE ?');
    params.push(`%${normalizedAccountName}%`);
  }

  let sql = 'SELECT * FROM stock_accounts';
  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY account_name';

  const [rows] = await pool.query(sql, params);
  const funds = rows.map((row) => {
    const balance = numeric(row.balance) ?? 0;
    const availableFunds = numeric(row.available_funds) ?? 0;
    const subAvailable =
      numeric(row.sub_available) ??
      numeric(row.subAvailable) ??
      availableFunds;
    const masterAvailable =
      numeric(row.master_available) ??
      numeric(row.masterAvailable) ??
      availableFunds;
    const totalAsset =
      numeric(row.total_asset) ??
      numeric(row.totalAsset) ??
      balance;
    const marketValue =
      numeric(row.market_value) ??
      numeric(row.marketValue) ??
      0;

    return {
      id: row.id,
      fundAccount: row.account_number || row.id,
      accountName: row.account_name,
      currency: row.currency || 'CNY',
      balance,
      subAvailable,
      masterAvailable,
      totalAsset,
      marketValue,
      availableFunds,
      accountNumber: row.account_number,
      groupId: row.group_id,
      createdAt: toISOString(row.created_date),
      updatedAt: toISOString(row.last_updated),
    };
  });

  res.json(funds);
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
      balance, available_funds, weight_percent, status, group_id, created_date, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      account.accountName || '',
      account.accountType || null,
      account.broker || null,
      account.accountNumber || null,
      numeric(account.balance) ?? 0,
      numeric(account.availableFunds) ?? 0,
      numeric(account.weightPercent) ?? 0,
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
      weight_percent = ?,
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
      numeric(account.weightPercent) ?? 0,
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
      id, buy_time, account, account_name, group_id, group_name, terminal_id, system_user_id,
      side, symbol, price, qty, amount, price_type, strategy, distribution
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      buyTime,
      buy.account || null,
      buy.accountName || null,
      buy.groupId != null ? buy.groupId.toString() : null,
      buy.groupName || null,
      buy.terminalId != null ? Number(buy.terminalId) : 1,
  buy.systemUserId ?? buy.system_user_id ?? 'admin',
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
      id, order_time, account, account_name, group_id, group_name, terminal_id, system_user_id,
      symbol, type, side, price, quantity, dealt, amount, market,
      order_type, status, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderTime,
      order.account || null,
      order.accountName || null,
      order.groupId != null ? order.groupId.toString() : null,
      order.groupName || null,
      order.terminalId != null ? Number(order.terminalId) : 1,
  order.systemUserId ?? order.system_user_id ?? 'admin',
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

// Algo multi-account endpoints
app.get('/algoBuys', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM algo_buys ORDER BY buy_time DESC');
  res.json(rows.map(mapAlgoBuyRow));
}));

app.post('/algoBuys', asyncHandler(async (req, res) => {
  const buy = req.body || {};
  const id = (buy.id ?? crypto.randomUUID()).toString();
  const buyTime = toDate(buy.timestamp) || new Date();

  await pool.query(
    `INSERT INTO algo_buys (
      id, buy_time, account, account_name, group_id, group_name, terminal_id, system_user_id,
      side, symbol, price, qty, amount,
      price_type, strategy, distribution, algo_type, algo_instance,
      start_time, end_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      buyTime,
      buy.account || null,
      buy.accountName || null,
      buy.groupId != null ? buy.groupId.toString() : null,
      buy.groupName || null,
      buy.terminalId != null ? Number(buy.terminalId) : 1,
  buy.systemUserId ?? buy.system_user_id ?? 'admin',
      buy.side || null,
      buy.symbol || null,
      numeric(buy.price) ?? 0,
      Number(buy.qty) || 0,
      numeric(buy.amount) ?? 0,
      buy.priceType || null,
      buy.strategy || null,
      buy.distribution || null,
      buy.algoType || null,
      buy.algoInstance || null,
      buy.startTime || null,
      buy.endTime || null,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM algo_buys WHERE id = ?', [id]);
  res.status(201).json(mapAlgoBuyRow(rows[0]));
}));

app.delete('/algoBuys/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM algo_buys WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'algo buy not found' });
  }
  res.status(204).end();
}));

app.get('/algoOrders', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM algo_orders ORDER BY order_time DESC');
  res.json(rows.map(mapAlgoOrderRow));
}));

app.post('/algoOrders', asyncHandler(async (req, res) => {
  const order = req.body || {};
  const id = (order.id ?? crypto.randomUUID()).toString();
  const orderTime = toDate(order.time || order.timestamp) || new Date();

  await pool.query(
    `INSERT INTO algo_orders (
      id, order_time, account, account_name, group_id, group_name, terminal_id, system_user_id,
      symbol, type, side, price, quantity, dealt, amount, market, order_type,
      status, source,
      algo_type, algo_instance, start_time, end_time, strategy, distribution
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderTime,
      order.account || null,
      order.accountName || null,
      order.groupId != null ? order.groupId.toString() : null,
      order.groupName || null,
      order.terminalId != null ? Number(order.terminalId) : 1,
  order.systemUserId ?? order.system_user_id ?? 'admin',
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
      order.algoType || null,
      order.algoInstance || null,
      order.startTime || null,
      order.endTime || null,
      order.strategy || null,
      order.distribution || null,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM algo_orders WHERE id = ?', [id]);
  res.status(201).json(mapAlgoOrderRow(rows[0]));
}));

app.delete('/algoOrders/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM algo_orders WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'algo order not found' });
  }
  res.status(204).end();
}));

function mapT0BuyRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    buyTime: toISOString(row.buy_time),
    account: row.account,
    accountName: row.account_name,
    groupId: row.group_id,
    groupName: row.group_name,
    terminalId: row.terminal_id != null ? Number(row.terminal_id) : 1,
    systemUserId: row.system_user_id,
    entrustMethod: row.entrust_method,
    symbol: row.symbol,
    algoInstance: row.algo_instance,
    businessStartTime: row.business_start_time,
    businessEndTime: row.business_end_time,
    buyDirection: row.buy_direction,
    sellDirection: row.sell_direction,
    strategy: row.strategy,
    qty: Number(row.qty || 0),
    price: Number(row.price || 0),
    amount: Number(row.amount || 0),
    distribution: row.distribution,
    basketNo: row.basket_no,
    externalNo: row.external_no,
    riskExposure: row.risk_exposure,
    execAfterExpire: Boolean(row.exec_after_expire),
    executeImmediately: Boolean(row.execute_immediately),
    createdAt: toISOString(row.created_at),
  };
}

function mapT0OrderRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderTime: toISOString(row.order_time),
    account: row.account,
    accountName: row.account_name,
    groupId: row.group_id,
    groupName: row.group_name,
    terminalId: row.terminal_id != null ? Number(row.terminal_id) : 1,
    systemUserId: row.system_user_id,
    symbol: row.symbol,
    type: row.type,
    side: row.side,
    price: Number(row.price || 0),
    quantity: Number(row.quantity || 0),
    dealt: Number(row.dealt || 0),
    amount: Number(row.amount || 0),
    market: row.market,
    orderType: row.order_type,
    status: row.status,
    source: row.source,
    algoInstance: row.algo_instance,
    businessStartTime: row.business_start_time,
    businessEndTime: row.business_end_time,
    buyDirection: row.buy_direction,
    sellDirection: row.sell_direction,
    strategy: row.strategy,
    distribution: row.distribution,
    basketNo: row.basket_no,
    externalNo: row.external_no,
    riskExposure: row.risk_exposure,
    execAfterExpire: Boolean(row.exec_after_expire),
    executeImmediately: Boolean(row.execute_immediately),
    createdAt: toISOString(row.created_at),
  };
}

app.get('/t0Buys', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM t0_buys ORDER BY buy_time DESC');
  res.json(rows.map(mapT0BuyRow));
}));

app.post('/t0Buys', asyncHandler(async (req, res) => {
  const buy = req.body || {};
  const id = (buy.id ?? crypto.randomUUID()).toString();
  const buyTime = toDate(buy.buyTime || buy.timestamp) || new Date();

  await pool.query(
    `INSERT INTO t0_buys (
      id, buy_time, account, account_name, group_id, group_name, terminal_id, system_user_id,
      entrust_method, symbol, algo_instance,
      business_start_time, business_end_time, buy_direction, sell_direction,
      strategy, qty, price, amount, distribution, basket_no, external_no, 
      risk_exposure, exec_after_expire, execute_immediately
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      buyTime,
      buy.account || null,
      buy.accountName || null,
      buy.groupId != null ? buy.groupId.toString() : null,
      buy.groupName || null,
      buy.terminalId != null ? Number(buy.terminalId) : 1,
  buy.systemUserId ?? buy.system_user_id ?? 'admin',
      buy.entrustMethod || null,
      buy.symbol || null,
      buy.algoInstance || null,
      buy.businessStartTime || null,
      buy.businessEndTime || null,
      buy.buyDirection || null,
      buy.sellDirection || null,
      buy.strategy || null,
      Number(buy.qty || 0),
      numeric(buy.price) ?? 0,
      numeric(buy.amount) ?? 0,
      buy.distribution || null,
      buy.basketNo || null,
      buy.externalNo || null,
      buy.riskExposure || null,
      Boolean(buy.execAfterExpire),
      Boolean(buy.executeImmediately),
    ]
  );

  const [rows] = await pool.query('SELECT * FROM t0_buys WHERE id = ?', [id]);
  res.status(201).json(mapT0BuyRow(rows[0]));
}));

app.delete('/t0Buys/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM t0_buys WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'T0 buy not found' });
  }
  res.status(204).end();
}));

app.get('/t0Orders', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM t0_orders ORDER BY order_time DESC');
  res.json(rows.map(mapT0OrderRow));
}));

app.post('/t0Orders', asyncHandler(async (req, res) => {
  const order = req.body || {};
  const id = (order.id ?? crypto.randomUUID()).toString();
  const orderTime = toDate(order.orderTime) || new Date();

  await pool.query(
    `INSERT INTO t0_orders (
      id, order_time, account, account_name, group_id, group_name, terminal_id, system_user_id,
      symbol, \`type\`, side, price, quantity, dealt, amount,
      market, order_type, status, source, algo_instance, business_start_time,
      business_end_time, buy_direction, sell_direction, strategy, distribution,
      basket_no, external_no, risk_exposure, exec_after_expire, execute_immediately
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderTime,
      order.account || null,
      order.accountName || null,
      order.groupId != null ? order.groupId.toString() : null,
      order.groupName || null,
      order.terminalId != null ? Number(order.terminalId) : 1,
  order.systemUserId ?? order.system_user_id ?? 'admin',
      order.symbol || null,
      order.type || null,
      order.side || null,
      numeric(order.price) ?? 0,
      Number(order.quantity || 0),
      Number(order.dealt || 0),
      numeric(order.amount) ?? 0,
      order.market || 'SH',
      order.orderType || 'LIMIT',
      order.status || 'pending',
      order.source || 'T0',
      order.algoInstance || null,
      order.businessStartTime || null,
      order.businessEndTime || null,
      order.buyDirection || null,
      order.sellDirection || null,
      order.strategy || null,
      order.distribution || null,
      order.basketNo || null,
      order.externalNo || null,
      order.riskExposure || null,
      Boolean(order.execAfterExpire),
      Boolean(order.executeImmediately),
    ]
  );

  const [rows] = await pool.query('SELECT * FROM t0_orders WHERE id = ?', [id]);
  res.status(201).json(mapT0OrderRow(rows[0]));
}));

app.post('/t0Orders/confirmFromBuys', asyncHandler(async (req, res) => {
  const { buyIds } = req.body;
  
  if (!Array.isArray(buyIds) || buyIds.length === 0) {
    return res.status(400).json({ message: 'buyIds is required and must be an array' });
  }

  const placeholders = buyIds.map(() => '?').join(',');
  const [buyRows] = await pool.query(
    `SELECT * FROM t0_buys WHERE id IN (${placeholders})`,
    buyIds
  );

  if (buyRows.length === 0) {
    return res.status(404).json({ message: 'No T0 buys found for the provided IDs' });
  }

  const confirmedOrders = [];

  for (const buy of buyRows) {
    const orderId = crypto.randomUUID();
    const orderTime = new Date();

    await pool.query(
      `INSERT INTO t0_orders (
        id, order_time, account, account_name, group_id, group_name, terminal_id, system_user_id,
        symbol, \`type\`, side, price, quantity, dealt, amount,
        market, order_type, status, source, algo_instance, business_start_time,
        business_end_time, buy_direction, sell_direction, strategy, distribution,
        basket_no, external_no, risk_exposure, exec_after_expire, execute_immediately
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        orderTime,
        buy.account,
        buy.account_name,
        buy.group_id,
        buy.group_name,
        buy.terminal_id != null ? Number(buy.terminal_id) : 1,
  buy.system_user_id ?? 'admin',
        buy.symbol,
        'T0策略',
        'BUY', // 默认值，表示买入
        buy.price,
        buy.qty,
        0, // dealt
        buy.amount,
        'SH', // market
        'LIMIT', // order_type
        'pending', // status
        'T0',
        buy.algo_instance,
        buy.business_start_time,
        buy.business_end_time,
        buy.buy_direction,
        buy.sell_direction,
        buy.strategy,
        buy.distribution,
        buy.basket_no,
        buy.external_no,
        buy.risk_exposure,
        buy.exec_after_expire,
        buy.execute_immediately,
      ]
    );

    await pool.query('DELETE FROM t0_buys WHERE id = ?', [buy.id]);

    const [orderRows] = await pool.query('SELECT * FROM t0_orders WHERE id = ?', [orderId]);
    confirmedOrders.push(mapT0OrderRow(orderRows[0]));
  }

  res.status(201).json(confirmedOrders);
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
    await migrateSchema();
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


