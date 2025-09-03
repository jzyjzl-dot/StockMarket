import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 简单的JSON服务器实现
const server = createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // 处理订单保存
  if (req.method === 'POST' && url.pathname === '/orders') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const dbPath = path.join(__dirname, 'db.json');
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        if (data.orders) {
          dbData.orders = data.orders;
          fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: true,
              message: 'Orders saved successfully',
            })
          );
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No orders data provided' }));
        }
      } catch (error) {
        console.error('Error saving orders:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to save orders' }));
      }
    });
    return;
  }

  // 处理GET请求 - 返回db.json数据
  if (req.method === 'GET') {
    try {
      const dbPath = path.join(__dirname, 'db.json');
      const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

      if (url.pathname === '/orders') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dbData.orders || []));
      } else if (url.pathname === '/users') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dbData.users || []));
      } else if (url.pathname === '/products') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dbData.products || []));
      } else if (url.pathname === '/trades') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dbData.trades || []));
      } else if (url.pathname === '/stocks') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dbData.stocks || []));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dbData));
      }
    } catch (error) {
      console.error('Error reading db.json:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read data' }));
    }
    return;
  }

  // 默认响应
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const port = 3001;
server.listen(port, () => {
  console.log(`Custom JSON Server is running on http://localhost:${port}`);
  console.log('Available routes:');
  console.log('  GET    /users');
  console.log('  GET    /products');
  console.log('  GET    /trades');
  console.log('  GET    /stocks');
  console.log('  GET    /orders');
  console.log('  POST   /orders (save orders)');
});
