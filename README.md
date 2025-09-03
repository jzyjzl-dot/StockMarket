# Vue 3 股票交易应用

一个基于Vue 3 + Vite + Element Plus的现代化股票交易应用，包含完整的订单管理系统。

## ✨ 功能特性

- 👥 **用户管理** - 完整的用户权限管理系统，支持用户注册、登录、角色管理
- 🏢 **权限控制** - 基于角色的访问控制，支持管理员和普通用户角色
- 📈 **股票数据** - 实时股票价格和变动信息展示
- 🛒 **交易功能** - 支持股票购买和订单管理
- 🔍 **订单查询** - 支持订单搜索和分页浏览
- 💾 **数据持久化** - 用户和订单数据保存到db.json文件
- 🎨 **现代化UI** - 基于Element Plus的现代化界面设计

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
│   ├── LoginRegister.vue # 用户登录注册组件
│   ├── Main.vue         # 主应用组件
│   ├── StockPreview.vue # 股票预览组件
│   └── OrderList.vue    # 订单列表组件
├── stores/             # Pinia状态管理
│   ├── orderStore.js   # 订单状态管理
│   └── userStore.js    # 用户状态管理
├── utils/              # 工具函数
│   ├── api.js          # API接口封装
│   └── server.js       # 自定义API服务器
├── views/              # 页面视图
│   ├── Home.vue        # 首页
│   ├── Trade.vue       # 交易页面
│   ├── UserManagement.vue # 用户管理页面
│   ├── ProductManagement.vue # 产品管理页面
│   ├── RiskControl.vue # 风险控制页面
│   └── TradeMonitoring.vue # 交易监控页面
└── router/             # 路由配置
    └── index.js

db.json                 # 数据文件（包含用户和订单数据）
package.json            # 项目配置和依赖
vite.config.js          # Vite构建配置
```

## 💾 数据存储

### 数据结构

用户数据保存在 `db.json` 文件的 `users` 数组中：

```json
{
  "users": [
    {
      "id": "用户ID",
      "username": "用户名",
      "email": "邮箱地址",
      "password": "加密密码",
      "role": "用户角色（admin/user）",
      "createdAt": "创建时间"
    }
  ]
}
```

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
- **API服务器**: 自定义Node.js HTTP服务器
- **数据存储**: JSON文件数据库
- **用户认证**: JWT令牌 + 会话管理
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

### 用户管理

1. **用户注册**：新用户可以通过注册页面创建账户
2. **用户登录**：使用用户名和密码登录系统
3. **权限管理**：管理员可以编辑用户角色和删除用户
4. **角色控制**：支持管理员（admin）和普通用户（user）两种角色

### 股票交易

1. **查看股票**：在交易页面查看实时股票信息
2. **购买股票**：点击"购买"按钮创建订单
3. **查看订单**：在订单列表中查看和管理所有订单
4. **搜索订单**：使用搜索框按股票名称或代码搜索
5. **分页浏览**：支持大量订单的分页显示

## 🔒 数据安全

- 用户数据和订单数据持久化保存，不会因浏览器刷新丢失
- 支持用户角色权限控制，保护敏感操作
- 支持数据导出和备份
- 本地开发环境，无需担心数据泄露
- 密码使用加密存储

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License
