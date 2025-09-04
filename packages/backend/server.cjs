const jsonServer = require('json-server');
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

const server = jsonServer.create();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

// 设置中间件
server.use(middlewares);

// 添加自定义路由或中间件（如果需要）
server.use(jsonServer.bodyParser);

// 使用默认路由
server.use(router);

// 启动服务器
const port = 3004;
server.listen(port, () => {
  console.log(`JSON Server is running on http://localhost:${port}`);
  console.log('Available routes:');
  Object.keys(db).forEach(table => {
    console.log(`  GET    /${table}`);
    console.log(`  POST   /${table}`);
    console.log(`  PUT    /${table}/:id`);
    console.log(`  DELETE /${table}/:id`);
  });
});

module.exports = server;
