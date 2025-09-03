// 简单测试API
import fetch from 'node-fetch';

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3001/users');
    const users = await response.json();
    console.log('✅ API测试成功！用户数量:', users.length);
    console.log('第一个用户:', users[0]);
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

testAPI();
