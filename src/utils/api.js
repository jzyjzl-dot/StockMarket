import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
});

// 统一的拦截器配置
const setupInterceptors = (apiInstance) => {
  // 请求拦截器
  apiInstance.interceptors.request.use(
    (config) => {
      // 显示加载状态
      console.log('请求发送:', config.method?.toUpperCase(), config.url);
      // 可以添加 token: config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => {
      console.error('请求错误:', error);
      // 可以隐藏加载状态
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  apiInstance.interceptors.response.use(
    (response) => {
      console.log('响应接收:', response.status, response.config.url);
      // 可以隐藏加载状态
      return response;
    },
    (error) => {
      console.error('响应错误:', error.response?.status, error.message);
      // 可以处理特定错误，如 401 跳转登录
      if (error.response?.status === 401) {
        // 处理未授权
        console.log('未授权，跳转登录');
      }
      // 可以隐藏加载状态
      return Promise.reject(error);
    }
  );
};

// 设置拦截器
setupInterceptors(api);

export default api;
