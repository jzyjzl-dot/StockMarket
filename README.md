# Vue 3 股票交易应用

一个基于Vue 3 + Vite + Element Plus的现代化股票交易应用，包含完整的订单管理系统。

## ✨ 功能特性

- 🏢 **用户管理** - 支持多用户登录和权限管理
- 📈 **股票数据** - 实时股票价格和变动信息展示
- 🛒 **交易功能** - 支持股票购买和订单管理
- 🔍 **订单查询** - 支持订单搜索和分页浏览
- 💾 **数据持久化** - 订单数据保存到db.json文件
- 🎨 **深色主题** - 现代化UI设计，支持深色主题

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 启动API服务器（订单数据持久化）
```bash
# 方式1：使用自定义服务器（推荐）
npm run server

# 方式2：使用json-server
npm run json-server
```

应用将在 `http://localhost:5173` 启动，API服务器将在 `http://localhost:3001` 启动。

## 📁 项目结构

```
src/
├── components/          # Vue组件
│   ├── StockPreview.vue # 股票预览组件
│   └── OrderList.vue    # 订单列表组件
├── stores/             # Pinia状态管理
│   ├── orderStore.js   # 订单状态管理
│   └── userStore.js    # 用户状态管理
├── utils/              # 工具函数
│   └── api.js          # API接口封装
├── views/              # 页面视图
│   ├── Trade.vue       # 交易页面
│   └── Home.vue        # 首页
└── router/             # 路由配置
    └── index.js

db.json                 # 数据文件（包含订单数据）
server.js               # 自定义API服务器
```

## 💾 订单数据存储

### 数据结构
订单数据保存在 `db.json` 文件的 `orders` 数组中：

```json
{
  "orders": [
    {
      "id": "订单ID",
      "stockId": "股票ID",
      "stockName": "股票名称",
      "stockSymbol": "股票代码",
      "price": "购买价格",
      "quantity": "购买数量",
      "total": "总金额",
      "date": "购买日期",
      "status": "订单状态"
    }
  ]
}
```

### 存储机制
1. **购买股票时**：订单自动保存到 `db.json`
2. **页面刷新时**：从 `db.json` 加载历史订单
3. **API服务器**：提供RESTful API接口进行数据操作

## 🔧 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **API服务器**: json-server + 自定义服务器
- **代码规范**: ESLint + Prettier

## 📜 可用脚本

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format

# 启动API服务器（订单持久化）
npm run server

# 启动json-server
npm run json-server
```

## 🎯 使用说明

1. **查看股票**：在交易页面查看实时股票信息
2. **购买股票**：点击"购买"按钮创建订单
3. **查看订单**：在订单列表中查看和管理所有订单
4. **搜索订单**：使用搜索框按股票名称或代码搜索
5. **分页浏览**：支持大量订单的分页显示

## 🔒 数据安全

- 订单数据持久化保存，不会因浏览器刷新丢失
- 支持数据导出和备份
- 本地开发环境，无需担心数据泄露

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License
