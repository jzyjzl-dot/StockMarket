import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../utils/api.js';

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false);
  const userInfo = ref(null);

  // 初始化时从localStorage读取
  const storedUser = localStorage.getItem('userInfo');
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser);
    isLoggedIn.value = true;
  }

  const login = async (account, password) => {
    try {
      const response = await api.get('/users');
      const users = response.data;
      const user = users.find(
        (u) =>
          (u.email === account || u.username === account) &&
          u.password === password
      );
      if (user) {
        isLoggedIn.value = true;
        userInfo.value = {
          username: user.username,
          email: user.email,
          id: user.id,
          role: user.role,
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
        console.log('User logged in:', account);
      } else {
        throw new Error('账号或密码错误');
      }
    } catch (error) {
      throw new Error('登录失败: ' + error.message);
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.get('/users');
      const users = response.data;
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        throw new Error('用户已存在');
      }
      const newUserResponse = await api.post('/users', {
        username,
        email,
        password,
        role: 'trader', // 默认角色
      });
      const newUser = newUserResponse.data;
      isLoggedIn.value = true;
      userInfo.value = {
        username: newUser.username,
        email: newUser.email,
        id: newUser.id,
        role: newUser.role,
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
      console.log('User registered:', username, email);
    } catch (error) {
      throw new Error('注册失败: ' + error.message);
    }
  };

  const logout = () => {
    isLoggedIn.value = false;
    userInfo.value = null;
    localStorage.removeItem('userInfo');
  };

  const updatePassword = async (oldPassword, newPassword) => {
    try {
      const userId = userInfo.value.id;
      const response = await api.get(`/users/${userId}`);
      const user = response.data;
      if (user.password !== oldPassword) {
        throw new Error('旧密码错误');
      }
      await api.patch(`/users/${userId}`, { password: newPassword });
      console.log('Password updated for:', user.email);
      return true;
    } catch (error) {
      throw new Error('密码更新失败: ' + error.message);
    }
  };

  return {
    isLoggedIn,
    userInfo,
    login,
    register,
    logout,
    updatePassword,
  };
});
