const fs = require('fs');
const path = require('path');

// 读取所有分离的数据文件
const dataDir = path.join(__dirname, 'data');
const db = {};

// 读取所有JSON文件
const dataFiles = [
  'users.json',
  'products.json',
  'trades.json',
  'orders.json',
  'stocks.json',
  'stockAccounts.json',
  'accountGroups.json'
];

console.log('正在加载数据文件...');
dataFiles.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      Object.assign(db, data);
      console.log(`✅ 已加载数据文件: ${file}`);
    } catch (error) {
      console.error(`❌ 加载数据文件失败 ${file}:`, error.message);
    }
  } else {
    console.warn(`⚠️ 数据文件不存在: ${file}`);
  }
});

// 生成合并的db.json文件
const outputPath = path.join(__dirname, 'db-generated.json');
fs.writeFileSync(outputPath, JSON.stringify(db, null, 2));
console.log(`\n✅ 已生成合并的数据文件: ${outputPath}`);

// 启动json-server
const { spawn } = require('child_process');
const jsonServerPath = path.join(__dirname, 'node_modules', 'json-server', 'lib', 'bin.js');

console.log('正在启动JSON Server...');
const server = spawn('node', [jsonServerPath, '--watch', outputPath, '--port', '3004', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('close', (code) => {
  console.log(`JSON Server exited with code ${code}`);
});

server.on('error', (error) => {
  console.error('Failed to start JSON Server:', error);
});
