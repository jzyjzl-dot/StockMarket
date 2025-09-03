import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { orderAPI } from '@/utils/api.js';

export const useOrderStore = defineStore('order', () => {
  const orders = ref([]);
  const isLoading = ref(false);

  // 从db.json加载订单
  const loadOrders = async () => {
    try {
      orders.value = await orderAPI.getOrders();
    } catch (error) {
      console.error('Failed to load orders:', error);
      orders.value = [];
    }
  };

  // 保存订单到db.json（通过API调用）
  const saveOrdersToDB = async (newOrders) => {
    try {
      await orderAPI.saveOrders(newOrders);
    } catch (error) {
      console.error('Failed to save orders:', error);
      // 最后的备选方案
      localStorage.setItem('userOrders', JSON.stringify(newOrders));
    }
  };

  // 购买股票
  const buyStock = async (stock, quantity) => {
    if (!stock || quantity <= 0) {
      throw new Error('无效的股票或数量');
    }

    isLoading.value = true;
    try {
      const order = {
        id: Date.now().toString(),
        stockId: stock.id,
        stockName: stock.name,
        stockSymbol: stock.symbol,
        price: stock.price,
        quantity: quantity,
        total: stock.price * quantity,
        date: new Date().toISOString(),
        status: 'completed',
      };

      orders.value.push(order);
      await saveOrdersToDB(orders.value);

      console.log('Stock purchased and saved to DB:', order);
      return order;
    } catch (error) {
      throw new Error('购买失败: ' + error.message);
    } finally {
      isLoading.value = false;
    }
  };

  // 获取用户订单
  const getUserOrders = () => {
    return orders.value;
  };

  // 计算总投资金额
  const totalInvestment = computed(() => {
    return orders.value.reduce((total, order) => total + order.total, 0);
  });

  // 初始化时异步加载订单
  const initialize = async () => {
    await loadOrders();
  };

  // 自动初始化
  initialize();

  return {
    orders,
    isLoading,
    buyStock,
    getUserOrders,
    totalInvestment,
    loadOrders,
  };
});
