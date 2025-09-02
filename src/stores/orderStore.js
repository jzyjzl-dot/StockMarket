import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useOrderStore = defineStore('order', () => {
  const orders = ref([]);
  const isLoading = ref(false);

  // 从localStorage加载订单
  const loadOrders = () => {
    const storedOrders = localStorage.getItem('userOrders');
    if (storedOrders) {
      orders.value = JSON.parse(storedOrders);
    }
  };

  // 保存订单到localStorage
  const saveOrders = () => {
    localStorage.setItem('userOrders', JSON.stringify(orders.value));
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
      saveOrders();

      console.log('Stock purchased:', order);
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

  // 初始化时加载订单
  loadOrders();

  return {
    orders,
    isLoading,
    buyStock,
    getUserOrders,
    totalInvestment,
  };
});
