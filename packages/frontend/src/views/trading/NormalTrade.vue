<template>
  <div class="trading-terminal">
    <div class="terminal-container">
      <!-- 交易终端卡片 -->
      <div class="trading-terminal-card">
        <div class="card-header">
          <span class="logo">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 12H7V22H17V12H22L12 2Z" fill="currentColor" />
            </svg>
            QUANTUM Terminal
          </span>
          <div class="header-icons">
            <button class="icon-btn" aria-label="Info" @click="showInfo">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              class="icon-btn"
              aria-label="Settings"
              @click="showSettings"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.43 12.98C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11.02L21.54 9.32C21.73 9.17 21.79 8.92 21.66 8.71L19.7 5.34C19.57 5.12 19.31 5.05 19.1 5.14L16.6 6.13C16.03 5.76 15.4 5.47 14.71 5.27L14.38 2.76C14.33 2.5 14.12 2.32 13.86 2.32H10.14C9.88 2.32 9.67 2.5 9.62 2.76L9.29 5.27C8.6 5.47 7.97 5.76 7.4 6.13L4.9 5.14C4.69 5.05 4.43 5.12 4.3 5.34L2.34 8.71C2.21 8.92 2.27 9.17 2.46 9.32L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.98L2.46 14.68C2.27 14.83 2.21 15.08 2.34 15.29L4.3 18.66C4.43 18.88 4.69 18.95 4.9 18.86L7.4 17.87C7.97 18.24 8.6 18.53 9.29 18.73L9.62 21.24C9.67 21.5 9.88 21.68 10.14 21.68H13.86C14.12 21.68 14.33 21.5 14.38 21.24L14.71 18.73C15.4 18.53 16.03 18.24 16.6 17.87L19.1 18.86C19.31 18.95 19.57 18.88 19.7 18.66L21.66 15.29C21.79 15.08 21.73 14.83 21.54 14.68L19.43 12.98ZM12 15.5C10.11 15.5 8.5 13.89 8.5 12C8.5 10.11 10.11 8.5 12 8.5C13.89 8.5 15.5 10.11 15.5 12C15.5 13.89 13.89 15.5 12 15.5Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="card-content">
          <div class="form-group">
            <label for="symbol">股票代码</label>
            <input
              type="text"
              id="symbol"
              v-model="orderForm.symbol"
              placeholder="例如: 000001"
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label for="orderType">订单类型</label>
            <select
              id="orderType"
              v-model="orderForm.orderType"
              class="select-field"
            >
              <option value="Market">市价单</option>
              <option value="Limit">限价单</option>
              <option value="Stop">止损单</option>
            </select>
          </div>

          <div class="form-group">
            <label for="quantity">数量</label>
            <div class="input-with-controls">
              <button @click="changeQuantity(-1)" class="quantity-btn">
                -
              </button>
              <input
                type="number"
                id="quantity"
                v-model.number="orderForm.quantity"
                class="input-field quantity-input"
              />
              <button @click="changeQuantity(1)" class="quantity-btn">+</button>
            </div>
          </div>

          <div
            class="form-group"
            v-if="
              orderForm.orderType === 'Limit' || orderForm.orderType === 'Stop'
            "
          >
            <label for="limitPrice">限价</label>
            <input
              type="number"
              id="limitPrice"
              v-model.number="orderForm.limitPrice"
              class="input-field"
              step="0.01"
            />
          </div>

          <div class="account-summary">
            <h3>账户摘要</h3>
            <p>
              可用资金: <span>{{ availableFunds.toFixed(2) }} 元</span>
            </p>
            <p>
              预估成本:
              <span :class="{ 'red-text': estimatedCost > availableFunds }"
                >{{ estimatedCost.toFixed(2) }} 元</span
              >
            </p>
          </div>

          <div class="actions">
            <button
              class="btn buy-btn"
              @click="placeOrder('BUY')"
              :disabled="buyLoading"
            >
              <span v-if="buyLoading">执行中...</span>
              <span v-else>买入</span>
            </button>
            <button
              class="btn sell-btn"
              @click="placeOrder('SELL')"
              :disabled="sellLoading"
            >
              <span v-if="sellLoading">执行中...</span>
              <span v-else>卖出</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Level II 数据 -->
      <div class="level-ii-data">
        <h3>Level II 数据</h3>
        <div class="level-tables">
          <table class="level-table">
            <thead>
              <tr>
                <th>卖价</th>
                <th>数量</th>
                <th>交易所</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in levelIIData.asks"
                :key="'ask-' + index"
              >
                <td class="ask-price">{{ item.price.toFixed(2) }}</td>
                <td>{{ item.size }}</td>
                <td>{{ item.exchange }}</td>
              </tr>
            </tbody>
          </table>

          <div class="spread-indicator">
            <div class="spread-line"></div>
            <span class="spread-text">价差: {{ spread.toFixed(2) }}</span>
          </div>

          <table class="level-table">
            <thead>
              <tr>
                <th>买价</th>
                <th>数量</th>
                <th>交易所</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in levelIIData.bids"
                :key="'bid-' + index"
              >
                <td class="bid-price">{{ item.price.toFixed(2) }}</td>
                <td>{{ item.size }}</td>
                <td>{{ item.exchange }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 交易记录 -->
      <div class="trade-records">
        <h3>交易记录</h3>
        <div class="records-table">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>类型</th>
                <th>股票代码</th>
                <th>价格</th>
                <th>数量</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in tradeRecords" :key="index">
                <td>{{ record.time }}</td>
                <td>
                  <span
                    :class="record.type === '买入' ? 'buy-tag' : 'sell-tag'"
                  >
                    {{ record.type }}
                  </span>
                </td>
                <td>{{ record.stockCode }}</td>
                <td>{{ record.price.toFixed(2) }}</td>
                <td>{{ record.quantity }}</td>
                <td>{{ record.amount.toFixed(2) }}</td>
                <td>
                  <span
                    :class="
                      record.status === '成功' ? 'success-tag' : 'warning-tag'
                    "
                  >
                    {{ record.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 订单表单数据
const orderForm = ref({
  symbol: '000001',
  orderType: 'Market',
  quantity: 100,
  limitPrice: null,
});

// 模拟账户资金
const availableFunds = ref(150000.0);

// 模拟实时价格
const currentPrice = ref(15.5);

// 模拟 Level II 数据
const levelIIData = ref({
  bids: [
    { price: 15.45, size: 1000, exchange: '上交所' },
    { price: 15.4, size: 2000, exchange: '深交所' },
    { price: 15.35, size: 1500, exchange: '北交所' },
  ],
  asks: [
    { price: 15.55, size: 800, exchange: '上交所' },
    { price: 15.6, size: 1200, exchange: '深交所' },
    { price: 15.65, size: 900, exchange: '北交所' },
  ],
});

// 交易记录
const tradeRecords = ref([
  {
    time: '2024-01-15 09:30:00',
    type: '买入',
    stockCode: '000001',
    price: 15.5,
    quantity: 100,
    amount: 1550.0,
    status: '成功',
  },
  {
    time: '2024-01-15 09:35:00',
    type: '卖出',
    stockCode: '000002',
    price: 25.8,
    quantity: 50,
    amount: 1290.0,
    status: '成功',
  },
]);

// 加载状态
const buyLoading = ref(false);
const sellLoading = ref(false);

// 计算预估成本
const estimatedCost = computed(() => {
  const price =
    orderForm.value.orderType === 'Limit'
      ? orderForm.value.limitPrice
      : currentPrice.value;
  if (!price || !orderForm.value.quantity || orderForm.value.quantity <= 0) {
    return 0;
  }
  return price * orderForm.value.quantity;
});

// 计算价差
const spread = computed(() => {
  if (levelIIData.value.asks.length > 0 && levelIIData.value.bids.length > 0) {
    return levelIIData.value.asks[0].price - levelIIData.value.bids[0].price;
  }
  return 0;
});

// 数量增减
const changeQuantity = (delta) => {
  if (orderForm.value.quantity + delta >= 1) {
    orderForm.value.quantity += delta;
  } else if (orderForm.value.quantity + delta < 1) {
    orderForm.value.quantity = 1;
  }
};

// 放置订单（BUY/SELL）
const placeOrder = async (type) => {
  if (!orderForm.value.symbol || !orderForm.value.quantity) {
    ElMessage.warning('请填写完整的交易信息');
    return;
  }

  if (orderForm.value.orderType !== 'Market' && !orderForm.value.limitPrice) {
    ElMessage.warning('请设置限价');
    return;
  }

  const isBuy = type === 'BUY';
  const loadingRef = isBuy ? buyLoading : sellLoading;
  loadingRef.value = true;

  try {
    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const price =
      orderForm.value.orderType === 'Limit'
        ? orderForm.value.limitPrice
        : currentPrice.value;
    const amount = price * orderForm.value.quantity;

    if (isBuy && amount > availableFunds.value) {
      ElMessage.error('资金不足，无法完成购买！');
      return;
    }

    // 创建交易记录
    const newRecord = {
      time: new Date().toLocaleString(),
      type: isBuy ? '买入' : '卖出',
      stockCode: orderForm.value.symbol,
      price: price,
      quantity: orderForm.value.quantity,
      amount: amount,
      status: '成功',
    };

    tradeRecords.value.unshift(newRecord);

    if (isBuy) {
      availableFunds.value -= amount;
      ElMessage.success(`买入订单已提交！预估花费: ¥${amount.toFixed(2)}`);
    } else {
      availableFunds.value += amount;
      ElMessage.success(`卖出订单已提交！获得金额: ¥${amount.toFixed(2)}`);
    }

    // 清空限价（如果是限价单）
    if (orderForm.value.orderType !== 'Market') {
      orderForm.value.limitPrice = null;
    }
  } catch (error) {
    ElMessage.error(`${isBuy ? '买入' : '卖出'}订单执行失败`);
  } finally {
    loadingRef.value = false;
  }
};

// 显示信息
const showInfo = () => {
  ElMessage.info('QUANTUM Terminal - 专业股票交易平台');
};

// 显示设置
const showSettings = () => {
  ElMessage.info('设置功能即将上线');
};

// 监听订单类型变化，如果不是限价或止损单，则清空限价
watch(
  () => orderForm.value.orderType,
  (newType) => {
    if (newType === 'Market') {
      orderForm.value.limitPrice = null;
    }
  }
);

// 模拟实时价格更新
onMounted(() => {
  console.log('QUANTUM Terminal 交易界面加载完成');

  // 模拟价格实时更新
  const priceInterval = setInterval(() => {
    currentPrice.value += (Math.random() - 0.5) * 0.1;

    // 更新Level II数据
    levelIIData.value.bids.forEach((bid) => {
      bid.price += (Math.random() - 0.5) * 0.05;
    });
    levelIIData.value.asks.forEach((ask) => {
      ask.price += (Math.random() - 0.5) * 0.05;
    });
  }, 3000);

  // 清理定时器
  return () => clearInterval(priceInterval);
});
</script>

<style scoped>
/* 整体布局 */
.trading-terminal {
  padding: 20px;
  background-color: #1a1d23;
  min-height: 100vh;
  color: #e0e0e0;
}

.terminal-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  align-items: start;
}

/* 交易终端卡片 */
.trading-terminal-card {
  background-color: #2a2e39;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  width: 100%;
  color: #e0e0e0;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #3c414c;
  background-color: #232731;
}

.logo {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #5d9cec;
}

.logo svg {
  margin-right: 8px;
  color: #5d9cec;
}

.header-icons .icon-btn {
  background: none;
  border: none;
  color: #9da3af;
  cursor: pointer;
  margin-left: 10px;
  padding: 5px;
  border-radius: 5px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.header-icons .icon-btn:hover {
  color: #e0e0e0;
  background-color: #3c414c;
}

.card-content {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #b0b8c4;
  margin-bottom: 5px;
}

.input-field,
.select-field {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #3c414c;
  background-color: #313540;
  color: #e0e0e0;
  font-size: 14px;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.input-field:focus,
.select-field:focus {
  outline: none;
  border-color: #5d9cec;
  box-shadow: 0 0 0 2px rgba(93, 156, 236, 0.3);
}

.select-field {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23b0b8c4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 18px;
  padding-right: 35px;
}

.input-with-controls {
  display: flex;
  align-items: center;
}

.quantity-input {
  flex-grow: 1;
  text-align: center;
  border-left: none;
  border-right: none;
  border-radius: 0;
}

.quantity-btn {
  background-color: #3c414c;
  border: 1px solid #3c414c;
  color: #e0e0e0;
  font-size: 18px;
  font-weight: bold;
  width: 35px;
  height: 35px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.quantity-btn:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.quantity-btn:last-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: none;
}

.quantity-btn:hover {
  background-color: #4c525f;
}

.account-summary {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #3c414c;
  font-size: 14px;
}

.account-summary h3 {
  font-size: 15px;
  color: #e0e0e0;
  margin-bottom: 10px;
  font-weight: 600;
}

.account-summary p {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  color: #b0b8c4;
}

.account-summary p span {
  font-weight: 500;
  color: #e0e0e0;
}

.red-text {
  color: #ff5c5c !important;
}

.actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.btn {
  flex: 1;
  padding: 12px 15px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.buy-btn {
  background-color: #4caf50;
  color: white;
}

.buy-btn:hover:not(:disabled) {
  background-color: #45a049;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.sell-btn {
  background-color: #f44336;
  color: white;
}

.sell-btn:hover:not(:disabled) {
  background-color: #da342c;
  box-shadow: 0 4px 10px rgba(244, 67, 54, 0.3);
}

/* Level II 数据 */
.level-ii-data {
  background-color: #2a2e39;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.level-ii-data h3 {
  font-size: 15px;
  color: #e0e0e0;
  margin-bottom: 15px;
  font-weight: 600;
}

.level-tables {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.level-table {
  flex: 1;
  border-collapse: collapse;
  font-size: 13px;
  background-color: #232731;
  border-radius: 8px;
  overflow: hidden;
}

.level-table th,
.level-table td {
  padding: 8px 12px;
  text-align: left;
}

.level-table th {
  color: #9da3af;
  font-weight: 500;
  border-bottom: 1px solid #3c414c;
  background-color: #2a2e39;
}

.bid-price {
  color: #4caf50;
  font-weight: 600;
}

.ask-price {
  color: #f44336;
  font-weight: 600;
}

.spread-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.spread-line {
  width: 2px;
  height: 100px;
  background-color: #5d9cec;
  border-radius: 1px;
}

.spread-text {
  margin-top: 10px;
  font-size: 12px;
  color: #b0b8c4;
  font-weight: 500;
}

/* 交易记录 */
.trade-records {
  background-color: #2a2e39;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  grid-column: 1 / -1;
}

.trade-records h3 {
  font-size: 15px;
  color: #e0e0e0;
  margin-bottom: 15px;
  font-weight: 600;
}

.records-table {
  background-color: #232731;
  border-radius: 8px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.records-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.records-table th,
.records-table td {
  padding: 10px 12px;
  text-align: left;
}

.records-table th {
  color: #9da3af;
  font-weight: 500;
  border-bottom: 1px solid #3c414c;
  background-color: #2a2e39;
  position: sticky;
  top: 0;
}

.buy-tag {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.sell-tag {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.success-tag {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.warning-tag {
  background-color: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .terminal-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .level-tables {
    flex-direction: column;
    gap: 15px;
  }

  .actions {
    flex-direction: column;
  }

  .trading-terminal-card {
    order: 2;
  }

  .level-ii-data {
    order: 1;
  }
}
</style>
