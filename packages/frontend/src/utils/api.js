import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_JSON_SERVER_BASE || 'http://localhost:3004',
  timeout: 10000,
});

// 订单管理API
export const orderAPI = {
  // 获取所有订单
  async getOrders() {
    try {
      // 从我们的自定义服务器获取订单数据
      const response = await api.get('/orders');
      const orders = response.data;
      console.log('Orders loaded from server:', orders);
      return orders;
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
      await api.post('/orders', {
        orders: orders,
        timestamp: new Date().toISOString(),
      });

      console.log('Orders saved to json-server successfully');
      return true;
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
      const response = await api.patch(`/orders/${orderId}`, updates);
      return response.data;
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

// 用户管理API
export const userAPI = {
  // 获取所有用户
  async getUsers() {
    try {
      const response = await api.get('/users');
      const users = response.data;
      console.log('Users loaded from server:', users);
      console.log('First user ID type:', typeof users[0]?.id);
      return users;
    } catch (error) {
      console.warn('Server not available for users:', error.message);
    }
    return [];
  },

  // 更新用户权限
  async updateUserRole(userId, newRole) {
    console.log('updateUserRole called with:', {
      userId,
      newRole,
      type: typeof userId,
    });

    try {
      const response = await api.patch(`/users/${userId}`, { role: newRole });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.status < 300);

      const updatedUser = response.data;
      console.log('User role updated:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.warn('Failed to update user role:', error.message);
      console.error('Full error:', error);

      if (error.response) {
        console.error('Update failed with status:', error.response.status);
        console.error('Error response:', error.response.data);
      }
    }
    return null;
  },

  // 删除用户
  async deleteUser(userId) {
    try {
      await api.delete(`/users/${userId}`);
      console.log('User deleted:', userId);
      return true;
    } catch (error) {
      console.warn('Failed to delete user:', error.message);
    }
    return false;
  },
};
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

// 产品管理API
export const productAPI = {
  // 获取所有产品
  async getProducts() {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('获取产品失败:', error);
      throw error;
    }
  },

  // 添加产品
  async addProduct(product) {
    try {
      const response = await api.post('/products', product);
      return response.data;
    } catch (error) {
      console.error('添加产品失败:', error);
      throw error;
    }
  },

  // 更新产品
  async updateProduct(id, product) {
    try {
      const response = await api.put(`/products/${id}`, product);
      return response.data;
    } catch (error) {
      console.error('更新产品失败:', error);
      throw error;
    }
  },

  // 删除产品
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除产品失败:', error);
      throw error;
    }
  },
};

// 交易系统管理API
export const tradingSystemAPI = {
  // 获取所有交易系统
  async getTradingSystems() {
    try {
      const response = await api.get('/tradingSystems');
      return response.data;
    } catch (error) {
      console.error('获取交易系统列表失败:', error);
      throw error;
    }
  },

  // 创建交易系统
  async createTradingSystem(system) {
    try {
      const response = await api.post('/tradingSystems', system);
      return response.data;
    } catch (error) {
      console.error('创建交易系统失败:', error);
      throw error;
    }
  },

  // 更新交易系统
  async updateTradingSystem(id, system) {
    try {
      const response = await api.put(`/tradingSystems/${id}`, system);
      return response.data;
    } catch (error) {
      console.error('更新交易系统失败:', error);
      throw error;
    }
  },

  // 删除交易系统
  async deleteTradingSystem(id) {
    try {
      await api.delete(`/tradingSystems/${id}`);
      return true;
    } catch (error) {
      console.error('删除交易系统失败:', error);
      throw error;
    }
  },
};
// 账户组管理API
export const accountGroupAPI = {
  async getAccountGroups() {
    try {
      const response = await api.get('/accountGroups');
      return response.data;
    } catch (error) {
      console.error('获取账户组列表失败:', error);
      throw error;
    }
  },

  async createAccountGroup(group) {
    try {
      const now = new Date().toISOString();
      const response = await api.post('/accountGroups', {
        createdDate: group?.createdDate ?? now,
        lastUpdated: group?.lastUpdated ?? now,
        ...group,
      });
      return response.data;
    } catch (error) {
      console.error('创建账户组失败:', error);
      throw error;
    }
  },

  async updateAccountGroup(id, group) {
    try {
      const response = await api.put('/accountGroups/' + id, {
        ...group,
        lastUpdated: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('更新账户组失败:', error);
      throw error;
    }
  },

  async deleteAccountGroup(id) {
    try {
      await api.delete('/accountGroups/' + id);
      return true;
    } catch (error) {
      console.error('删除账户组失败:', error);
      throw error;
    }
  },
};
// 股票账户管理API
export const stockAccountAPI = {
  // 获取所有股票账户
  async getStockAccounts() {
    try {
      const response = await api.get('/stockAccounts');
      const accounts = response.data;
      console.log('Stock accounts loaded from server:', accounts);
      return accounts;
    } catch (error) {
      console.warn('Server not available for stock accounts:', error.message);
    }
    return [];
  },

  // 更新股票账户
  async updateStockAccount(accountId, accountData) {
    try {
      const response = await api.put(`/stockAccounts/${accountId}`, {
        ...accountData,
        lastUpdated: new Date().toISOString(),
      });

      const updatedAccount = response.data;
      console.log('Stock account updated:', updatedAccount);
      return updatedAccount;
    } catch (error) {
      console.warn('Failed to update stock account:', error.message);
      console.error('Full error:', error);

      if (error.response) {
        console.error('Update failed with status:', error.response.status);
        console.error('Error response:', error.response.data);
      }
    }
    return null;
  },

  // 创建股票账户
  async createStockAccount(accountData) {
    try {
      const response = await api.post('/stockAccounts', {
        ...accountData,
        id: Date.now().toString(),
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });

      const newAccount = response.data;
      console.log('Stock account created:', newAccount);
      return newAccount;
    } catch (error) {
      console.warn('Failed to create stock account:', error.message);
      console.error('Full error:', error);

      if (error.response) {
        console.error('Create failed with status:', error.response.status);
        console.error('Error response:', error.response.data);
      }
    }
    return null;
  },

  // 删除股票账户
  async deleteStockAccount(accountId) {
    try {
      await api.delete(`/stockAccounts/${accountId}`);
      console.log('Stock account deleted successfully');
      return true;
    } catch (error) {
      console.warn('Failed to delete stock account:', error.message);
      console.error('Full error:', error);

      if (error.response) {
        console.error('Delete failed with status:', error.response.status);
        console.error('Error response:', error.response.data);
        return false;
      }
      return false;
    }
  },
};

// 交易订单API
export const tradingAPI = {
  // 获取资金数据
  async getAccountFunds(params = {}) {
    try {
      const response = await api.get('/accountFunds', { params });
      return response.data;
    } catch (error) {
      console.error('获取资金数据失败:', error);
      throw error;
    }
  },
  // 获取普通交易订单
  async getNormalOrders() {
    try {
      const response = await api.get('/normalOrders');
      return response.data;
    } catch (error) {
      console.error('获取普通交易订单失败:', error);
      throw error;
    }
  },

  // 获取普通交易买入记录
  async getNormalBuys() {
    try {
      const response = await api.get('/normalBuys');
      return response.data;
    } catch (error) {
      console.error('获取普通交易买入记录失败:', error);
      throw error;
    }
  },

  // 创建普通交易买入记录
  async createNormalBuy(buyData) {
    try {
      const response = await api.post('/normalBuys', buyData);
      return response.data;
    } catch (error) {
      console.error('创建普通交易买入记录失败:', error);
      throw error;
    }
  },

  // 创建普通交易订单
  async createNormalOrder(orderData) {
    try {
      const response = await api.post('/normalOrders', orderData);
      return response.data;
    } catch (error) {
      console.error('创建普通交易订单失败:', error);
      throw error;
    }
  },

  // 删除普通交易买入记录
  async deleteNormalBuy(id) {
    try {
      await api.delete(`/normalBuys/${id}`);
      return true;
    } catch (error) {
      console.error('删除普通交易买入记录失败:', error);
      throw error;
    }
  },

  // 批量删除普通交易买入记录
  async deleteMultipleNormalBuys(ids) {
    try {
      await Promise.all(ids.map((id) => this.deleteNormalBuy(id)));
      return true;
    } catch (error) {
      console.error('批量删除普通交易买入记录失败:', error);
      throw error;
    }
  },

  // 获取算法交易订单
  async getAlgoOrders() {
    try {
      const response = await api.get('/algoOrders');
      return response.data;
    } catch (error) {
      console.error('获取算法交易订单失败:', error);
      throw error;
    }
  },

  // 获取算法交易买入记录
  async getAlgoBuys() {
    try {
      const response = await api.get('/algoBuys');
      return response.data;
    } catch (error) {
      console.error('获取算法交易买入记录失败:', error);
      throw error;
    }
  },

  // 创建算法交易买入记录
  async createAlgoBuy(buyData) {
    try {
      const response = await api.post('/algoBuys', buyData);
      return response.data;
    } catch (error) {
      console.error('创建算法交易买入记录失败:', error);
      throw error;
    }
  },

  // 创建算法交易订单
  async createAlgoOrder(orderData) {
    try {
      const response = await api.post('/algoOrders', orderData);
      return response.data;
    } catch (error) {
      console.error('创建算法交易订单失败:', error);
      throw error;
    }
  },

  // 删除算法交易买入记录
  async deleteAlgoBuy(id) {
    try {
      await api.delete(`/algoBuys/${id}`);
      return true;
    } catch (error) {
      console.error('删除算法交易买入记录失败:', error);
      throw error;
    }
  },

  // 批量删除算法交易买入记录
  async deleteMultipleAlgoBuys(ids) {
    try {
      await Promise.all(ids.map((id) => this.deleteAlgoBuy(id)));
      return true;
    } catch (error) {
      console.error('批量删除算法交易买入记录失败:', error);
      throw error;
    }
  },

  // 获取T0交易订单
  async getT0Orders() {
    try {
      const response = await api.get('/t0Orders');
      return response.data;
    } catch (error) {
      console.error('获取T0交易订单失败:', error);
      throw error;
    }
  },

  // 获取T0交易买入记录
  async getT0Buys() {
    try {
      const response = await api.get('/t0Buys');
      return response.data;
    } catch (error) {
      console.error('获取T0交易买入记录失败:', error);
      throw error;
    }
  },

  // 创建T0交易买入记录
  async createT0Buy(buyData) {
    try {
      const response = await api.post('/t0Buys', buyData);
      return response.data;
    } catch (error) {
      console.error('创建T0交易买入记录失败:', error);
      throw error;
    }
  },

  // 确认T0买入记录转为订单
  async confirmT0BuysToOrders(confirmData) {
    try {
      const response = await api.post('/t0Orders/confirmFromBuys', confirmData);
      return response.data;
    } catch (error) {
      console.error('确认T0买入记录转为订单失败:', error);
      throw error;
    }
  },

  // 删除T0交易买入记录
  async deleteT0Buy(id) {
    try {
      await api.delete(`/t0Buys/${id}`);
      return true;
    } catch (error) {
      console.error('删除T0交易买入记录失败:', error);
      throw error;
    }
  },

  // 批量删除T0交易买入记录
  async deleteMultipleT0Buys(ids) {
    try {
      await Promise.all(ids.map((id) => this.deleteT0Buy(id)));
      return true;
    } catch (error) {
      console.error('批量删除T0交易买入记录失败:', error);
      throw error;
    }
  },
};

export default api;
