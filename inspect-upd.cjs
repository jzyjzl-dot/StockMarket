const fs = require('fs');
const text = fs.readFileSync('packages/backend/start-server.js', 'utf8');
const start = text.indexOf('UPDATE trading_systems SET');
console.log(text.slice(start, start + 120));
