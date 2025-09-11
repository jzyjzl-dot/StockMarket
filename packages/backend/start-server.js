const fs = require('fs');
const path = require('path');

// 基础路径
const dataDir = path.join(__dirname, 'data');
const outputPath = path.join(__dirname, 'db-generated.json');

// 分离的数据文件列表（包含 normal-buys.json 用于普通交易买入记录）
const dataFiles = [
  'users.json',
  'products.json',
  'trades.json',
  'orders.json',
  'stocks.json',
  'stockAccounts.json',
  'accountGroups.json',
  'normal-buys.json',
  'normal-orders.json',
];

// 读取并合并数据文件
function loadDataFiles() {
  const merged = {};
  console.log('正在加载数据文件...');
  dataFiles.forEach((file) => {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        Object.assign(merged, data);
        console.log(`✅ 已加载数据文件 ${file}`);
      } catch (error) {
        console.error(`❌ 加载数据文件失败 ${file}:`, error.message);
      }
    } else {
      console.warn(`⚠️ 数据文件不存在 ${file}`);
    }
  });
  return merged;
}

// 写入合并后的 db 文件
function writeDbJson(dbObj) {
  fs.writeFileSync(outputPath, JSON.stringify(dbObj, null, 2));
  console.log(`\n✅ 已生成合并的数据文件: ${outputPath}`);
}

// 初始化合并输出
const initialDb = loadDataFiles();
writeDbJson(initialDb);

// 启动 json-server 以提供 REST 读取与默认写入（写入到 db-generated.json）
const { spawn } = require('child_process');
const jsonServerPath = path.join(
  __dirname,
  'node_modules',
  'json-server',
  'lib',
  'bin.js'
);

console.log('正在启动 JSON Server...');
const server = spawn(
  'node',
  [jsonServerPath, '--watch', outputPath, '--port', '3004', '--host', '0.0.0.0'],
  {
    stdio: 'inherit',
    cwd: __dirname,
  }
);

server.on('close', (code) => {
  console.log(`JSON Server exited with code ${code}`);
});

server.on('error', (error) => {
  console.error('Failed to start JSON Server:', error);
});

// 确保 normal-buys.json 存在
function ensureDataFile(filename, initObj) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initObj, null, 2));
  }
  return filePath;
}

ensureDataFile('normal-buys.json', { normalBuys: [] });
ensureDataFile('normal-orders.json', { normalOrders: [] });

// 同步：当 json-server 写入合并库时，把 normalBuys/normalOrders 同步回 data 文件
let syncTimer = null;
fs.watch(outputPath, { persistent: true }, () => {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    try {
      const merged = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      const syncPairs = [
        { key: 'normalBuys', filename: 'normal-buys.json' },
        { key: 'normalOrders', filename: 'normal-orders.json' },
      ];
      for (const { key, filename } of syncPairs) {
        const arr = Array.isArray(merged[key]) ? merged[key] : [];
        const filePath = ensureDataFile(filename, { [key]: [] });
        const current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        current[key] = arr;
        fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
        console.log(`✅ 已同步 ${key} 至 data/${filename}`);
      }
    } catch (e) {
      console.warn('同步 normal-buys.json 失败：', e.message);
    }
  }, 200);
});
