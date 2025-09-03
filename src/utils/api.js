import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
});

// 订单管理API
export const orderAPI = {
  // 获取所有订单
  async getOrders() {
    try {
      // 从我们的自定义服务器获取订单数据
      const response = await fetch('http://localhost:3001/orders');
      if (response.ok) {
        const orders = await response.json();
        console.log('Orders loaded from server:', orders);
        return orders;
      }
    } catch (error) {
      console.warn(
        'Server not available, falling back to localStorage:',
        error.message
      );
    }

    // 备选方案：从localStorage获取
    const stored = localStorage.getItem('userOrders');
    const orders = stored ? JSON.parse(stored) : [];
    console.log('Orders loaded from localStorage:', orders);
    return orders;
  },

  // 保存订单
  async saveOrders(orders) {
    try {
      // 尝试保存到json-server
      const response = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: orders,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log('Orders saved to json-server successfully');
        return true;
      }
    } catch (error) {
      console.warn('json-server not available:', error.message);
    }

    // 备选方案：保存到localStorage
    localStorage.setItem('userOrders', JSON.stringify(orders));
    console.log('Orders saved to localStorage');
    return true;
  },

  // 更新单个订单
  async updateOrder(orderId, updates) {
    try {
      const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to update order:', error.message);
    }

    // 备选方案：更新localStorage
    const orders = await this.getOrders();
    const index = orders.findIndex((order) => order.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      localStorage.setItem('userOrders', JSON.stringify(orders));
    }
    return orders[index];
  },
};

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
