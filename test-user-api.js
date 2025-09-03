// 测试用户管理API
async function testUserManagement() {
  console.log('Testing User Management API...');

  try {
    // 测试获取用户
    const usersResponse = await fetch('http://localhost:3001/users');
    const users = await usersResponse.json();
    console.log('Users:', users);

    // 测试更新用户权限
    const updateResponse = await fetch('http://localhost:3001/users/2', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'viewer' }),
    });

    if (updateResponse.ok) {
      const updatedUser = await updateResponse.json();
      console.log('Updated user:', updatedUser);
    } else {
      console.log('Update failed:', updateResponse.status);
    }

    // 再次获取用户验证更新
    const usersAfterUpdate = await fetch('http://localhost:3001/users');
    const users2 = await usersAfterUpdate.json();
    console.log('Users after update:', users2);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUserManagement();
