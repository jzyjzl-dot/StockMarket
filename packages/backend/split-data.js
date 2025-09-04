const fs = require('fs');
const path = require('path');

// 读取原始db.json文件
const dbPath = path.join(__dirname, 'db.json');
const dataDir = path.join(__dirname, 'data');

try {
  const rawData = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(rawData);

  // 提取各个数据表
  const tables = ['users', 'products', 'trades', 'orders', 'stocks', 'stockAccounts', 'accountGroups'];

  tables.forEach(tableName => {
    if (db[tableName]) {
      const tableData = { [tableName]: db[tableName] };
      const filePath = path.join(dataDir, `${tableName}.json`);

      fs.writeFileSync(filePath, JSON.stringify(tableData, null, 2));
      console.log(`✅ 已创建 ${tableName}.json`);
    }
  });

  console.log('🎉 所有数据表已成功分离！');
} catch (error) {
  console.error('❌ 处理过程中出错:', error.message);
}
