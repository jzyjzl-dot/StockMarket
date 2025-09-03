import jsonServer from 'json-server';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// 设置中间件
server.use(middlewares);

// 添加自定义路由或中间件（如果需要）
server.use(jsonServer.bodyParser);

// 使用默认路由
server.use(router);

// 启动服务器
const port = 3002;
server.listen(port, () => {
  console.log(`JSON Server is running on http://localhost:${port}`);
  console.log('Available routes:');
  console.log('  GET    /users');
  console.log('  GET    /products');
  console.log('  GET    /trades');
  console.log('  GET    /orders');
  console.log('  POST   /users');
  console.log('  POST   /products');
  console.log('  POST   /trades');
  console.log('  POST   /orders');
  console.log('  PUT    /users/:id');
  console.log('  PUT    /products/:id');
  console.log('  PUT    /trades/:id');
  console.log('  PUT    /orders/:id');
  console.log('  DELETE /users/:id');
  console.log('  DELETE /products/:id');
  console.log('  DELETE /trades/:id');
  console.log('  DELETE /orders/:id');
});
