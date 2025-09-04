# 数据文件结构说明

## 📁 文件组织

本项目的数据库已被重新组织为模块化的JSON文件结构，便于维护和管理。

```
packages/backend/data/
├── index.json          # 主索引文件
├── users.json          # 用户数据
├── products.json       # 产品数据
├── trades.json         # 交易记录
├── orders.json         # 订单记录
├── stocks.json         # 股票信息
├── stockAccounts.json  # 股票账户
└── accountGroups.json  # 账户组别
```

## 📋 文件说明

### index.json
- **用途**: 主索引文件，引用所有数据文件
- **内容**: 文件路径映射和描述信息

### users.json
- **用途**: 存储用户账户信息
- **字段**: id, username, email, password, role

### products.json
- **用途**: 存储产品信息
- **字段**: id, name, price, description

### trades.json
- **用途**: 存储交易记录
- **字段**: id, userId, productId, amount, status

### orders.json
- **用途**: 存储订单记录
- **字段**: id, stockId, stockName, stockSymbol, price, quantity, total, date, status

### stocks.json
- **用途**: 存储股票基本信息
- **字段**: id, name, symbol, price, change, changePercent

### stockAccounts.json
- **用途**: 存储股票账户信息
- **字段**: id, accountName, accountType, broker, accountNumber, balance, availableFunds, status, group, createdDate, lastUpdated

### accountGroups.json
- **用途**: 存储账户组别信息
- **字段**: id, groupId, name, description, createdDate, lastUpdated

## 🔧 使用方法

### 读取数据
```javascript
// 读取用户数据
const users = require('./data/users.json');

// 读取股票账户
const accounts = require('./data/stockAccounts.json');
```

### 引用主索引
```javascript
const dataIndex = require('./data/index.json');

// 获取所有数据文件路径
console.log(dataIndex.dataFiles);
```

## 📈 优势

1. **模块化**: 每个数据类型独立管理
2. **易维护**: 文件分离便于版本控制
3. **可扩展**: 新增数据类型只需添加新文件
4. **性能优化**: 只加载所需的数据文件
5. **团队协作**: 不同开发者可同时编辑不同数据文件

## ⚠️ 注意事项

- 修改数据文件时请确保JSON格式正确
- 建议使用版本控制系统跟踪数据变更
- 生产环境建议使用真正的数据库系统
