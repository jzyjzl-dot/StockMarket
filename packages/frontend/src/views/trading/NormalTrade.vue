<template>
  <div class="nt-page">
    <!-- 顶部三栏：行情 / 下单 / 预览 -->
    <div class="nt-top">
      <!-- 行情界面 -->
      <section class="pane pane-market">
        <header class="pane-header">
          <div class="title">行情</div>
        </header>
        <div class="pane-body scroll-y">
          <div class="market-head">
            <div class="stock">
              <div class="name">{{ currentStock.name }}</div>
              <div class="code">{{ currentStock.code }}</div>
            </div>
            <div class="price-box">
              <div class="price">{{ currentStock.price.toFixed(2) }}</div>
              <div class="delta" :class="{ up: currentStock.change >= 0, down: currentStock.change < 0 }">
                <span>{{ currentStock.change >= 0 ? '+' : '' }}{{ currentStock.change.toFixed(2) }}</span>
                <span>({{ (currentStock.changePct * 100).toFixed(2) }}%)</span>
              </div>
            </div>
          </div>
          <div class="market-table">
            <table>
              <tbody>
                <tr v-for="(row, idx) in marketRows" :key="'ask-' + idx">
                  <td class="side sell">卖{{ 10 - idx }}</td>
                  <td class="price sell">{{ row.ask.price.toFixed(2) }}</td>
                  <td class="vol">{{ row.ask.vol }}</td>
                </tr>
                <tr class="sep"><td colspan="3"></td></tr>
                <tr v-for="(row, idx) in marketRows" :key="'bid-' + idx">
                  <td class="side buy">买{{ idx + 1 }}</td>
                  <td class="price buy">{{ row.bid.price.toFixed(2) }}</td>
                  <td class="vol">{{ row.bid.vol }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 下单界面 -->
      <section class="pane pane-order">
        <header class="pane-header">
          <div class="title">普通交易</div>
        </header>
        <div class="order-form pane-body scroll-y">
          <el-form :model="orderForm" label-width="84px" size="small">
            <el-form-item label="委托账户">
              <el-select v-model="orderForm.account" style="width: 100%">
                <el-option label="全部账户" value="ALL" />
                <el-option label="模拟账户" value="ACC1" />
              </el-select>
            </el-form-item>
            <el-form-item label="交易方向">
              <el-radio-group v-model="orderForm.entrustType" size="small">
                <el-radio-button label="BUY">买入</el-radio-button>
                <el-radio-button label="SELL">卖出</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="证券代码">
              <el-input v-model="orderForm.symbol" placeholder="如 600000">
                <template #append>{{ currentStock.name }}</template>
              </el-input>
            </el-form-item>
            <el-form-item label="价格类型">
              <el-select v-model="orderForm.priceType" style="width: 100%">
                <el-option label="限价" value="fixed" />
                <el-option label="对手价" value="counter" />
                <el-option label="排队价" value="queue" />
              </el-select>
            </el-form-item>
            <el-form-item label="委托价格">
              <el-input-number v-model="orderForm.price" :precision="2" :step="0.01" :min="0" style="width: 100%" controls-position="right" />
            </el-form-item>
            <el-form-item label="委托策略">
              <el-select v-model="orderForm.strategy" style="width: 100%">
                <el-option label="固定数量" value="fixedQty" />
                <el-option label="固定金额" value="fixedAmt" />
                <el-option label="百分比" value="percentage" />
              </el-select>
            </el-form-item>
            <el-form-item label="委托数量">
              <div style="display:flex; gap:8px; align-items:center; width:100%">
                <el-input-number v-model="orderForm.qty" :min="0" :step="100" style="flex:1" />
                <span>股</span>
              </div>
            </el-form-item>
            <el-form-item label="快捷比例">
              <div class="quick-ops">
                <el-button size="small" @click="setPercent(10)">10%</el-button>
                <el-button size="small" @click="setPercent(20)">20%</el-button>
                <el-button size="small" @click="setPercent(50)">50%</el-button>
                <el-button size="small" @click="setPercent(100)">100%</el-button>
              </div>
            </el-form-item>
            <el-form-item label="分配方式">
              <el-select v-model="orderForm.distribution" style="width: 100%">
                <el-option label="每账户固定数量" value="eachFixedQty" />
                <el-option label="按账户可用资金比例" value="byProportion" />
              </el-select>
            </el-form-item>
            <el-form-item label="账户可用">
              <div class="mono">{{ funds.available.toLocaleString() }}</div>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" style="width: 100%" @click="placeOrder">{{ orderForm.entrustType === 'BUY' ? '买入' : '卖出' }}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- 预览界面 -->
      <section class="pane pane-preview">
        <header class="pane-header">
          <div class="title">预览</div>
          <div class="sub">账户数：1  委托笔数：{{ previewRows.length }}</div>
        </header>
        <div class="pane-body">
          <div class="scroll-x">
          <el-table v-resizable-columns :data="previewRows" size="small" style="width: 100%">
            <el-table-column type="selection" width="44" />
            <el-table-column prop="account" label="账户" width="120" />
            <el-table-column prop="symbol" label="证券代码" width="120" />
            <el-table-column prop="side" label="交易方向" width="90" />
            <el-table-column prop="qty" label="委托数量" width="100" />
            <el-table-column prop="price" label="委托价格" width="100" />
            <el-table-column prop="amount" label="委托金额" min-width="140" />
            <el-table-column prop="available" label="可用资金" min-width="140" />
            <el-table-column prop="position" label="持仓数量" width="100" />
            <el-table-column prop="buyable" label="可买数量" width="100" />
          </el-table>
          </div>
        </div>
        <div class="preview-summary">
          <span>合计</span>
          <span class="mono">{{ totalPrice.toFixed(2) }}</span>
          <span class="mono">{{ funds.available.toFixed(2) }}</span>
          <span class="mono">0</span>
        </div>
      </section>
    </div>

    <!-- 查询界面 -->
    <section class="pane pane-query">
      <header class="pane-header">
        <div class="title">查询</div>
      </header>
      <div class="pane-body">
        <el-tabs v-model="activeTab" type="card" class="nt-tabs">
          <el-tab-pane label="资金" name="fund">
            <div class="scroll-x">
            <el-table v-resizable-columns :data="fundRows" size="small" style="width: 100%" height="260">
              <el-table-column prop="available" label="可用资金" width="140" />
              <el-table-column prop="frozen" label="冻结资金" width="140" />
              <el-table-column prop="marketValue" label="市值" width="140" />
              <el-table-column prop="totalAssets" label="总资产" width="160" />
            </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="持仓" name="pos">
            <div class="scroll-x">
            <el-table v-resizable-columns :data="positionRows" size="small" style="width: 100%" height="260">
              <el-table-column prop="symbol" label="证券代码" width="120" />
              <el-table-column prop="name" label="证券名称" width="140" />
              <el-table-column prop="quantity" label="持仓数量" width="100" />
              <el-table-column prop="cost" label="持仓成本" width="100" />
              <el-table-column prop="marketPrice" label="现价" width="100" />
              <el-table-column prop="marketValue" label="市值" min-width="140" />
            </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="委托" name="order">
            <div class="scroll-x">
            <el-table v-resizable-columns :data="orderRows" size="small" style="width: 100%" height="260">
              <el-table-column prop="account" label="账户" width="100" />
              <el-table-column prop="time" label="委托时间" width="160" />
              <el-table-column prop="stockCode" label="证券代码" width="120" />
              <el-table-column prop="type" label="方向" width="80" />
              <el-table-column prop="price" label="委托价" width="100" />
              <el-table-column prop="quantity" label="委托量" width="100" />
              <el-table-column prop="dealt" label="成交量" width="100" />
              <el-table-column prop="amount" label="委托金额" min-width="140" />
              <el-table-column prop="market" label="交易市场" width="100" />
              <el-table-column prop="orderType" label="价格类型" width="100" />
              <el-table-column prop="status" label="状态" width="100" />
            </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="成交" name="deal">
            <div class="scroll-x">
            <el-table v-resizable-columns :data="dealRows" size="small" style="width: 100%" height="260">
              <el-table-column prop="time" label="时间" width="160" />
              <el-table-column prop="stockCode" label="证券代码" width="120" />
              <el-table-column prop="type" label="方向" width="80" />
              <el-table-column prop="price" label="成交价" width="100" />
              <el-table-column prop="quantity" label="成交量" width="100" />
              <el-table-column prop="amount" label="成交金额" min-width="140" />
              <el-table-column prop="status" label="状态" width="100" />
            </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <footer class="nt-pagination">
        <div class="left">共 {{ orderRows.length }} 条</div>
        <el-pagination background layout="prev, pager, next" :total="orderRows.length" :page-size="20" />
        <div class="right">当前每页显示: 20</div>
      </footer>
    </section>
  </div>
  
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

// 行情基础数据
const currentStock = ref({ name: '浦发银行', code: '600000', price: 7.48, change: -0.12, changePct: -0.0158 });
const marketRows = ref(
  Array.from({ length: 10 }).map((_, i) => ({
    ask: { price: 7.60 - i * 0.01, vol: 2000 + i * 100 },
    bid: { price: 7.46 - i * 0.01, vol: 1800 + i * 100 },
  }))
);

// 资金、下单与预览
const funds = ref({ available: 900000.0 });
const orderForm = ref({
  account: 'ALL',
  entrustType: 'BUY',
  symbol: '600000',
  priceType: 'fixed',
  price: 7.48,
  strategy: 'fixedQty',
  qty: 100,
  distribution: 'eachFixedQty',
});
const setQty = (n) => (orderForm.value.qty = n);
const setPercent = (p) => {
  const price = Number(orderForm.value.price) || 0;
  const buyable = Math.floor(funds.value.available / (price || 1) / 100) * 100;
  const target = Math.floor((buyable * (p / 100)) / 100) * 100;
  orderForm.value.qty = target > 0 ? target : 0;
};

const previewRows = computed(() => {
  const qty = Number(orderForm.value.qty) || 0;
  const price = Number(orderForm.value.price) || 0;
  const amount = qty * price;
  return [
    {
      account: '模拟账户',
      symbol: orderForm.value.symbol,
      side: orderForm.value.entrustType === 'BUY' ? '买入' : '卖出',
      qty,
      price: price ? price.toFixed(2) : '-',
      amount: amount ? amount.toFixed(2) : '-',
      available: funds.value.available.toFixed(2),
      position: 0,
      buyable: Math.floor(funds.value.available / (price || 1) / 100) * 100,
    },
  ];
});

const totalPrice = computed(() => {
  const r = previewRows.value[0];
  return r && r.amount !== '-' ? Number(r.amount) : 0;
});

const placeOrder = () => {
  if (!orderForm.value.symbol || !orderForm.value.qty) {
    ElMessage.warning('请填写完整的下单信息');
    return;
  }
  ElMessage.success(`${orderForm.value.entrustType === 'BUY' ? '买入' : '卖出'}指令已提交`);
};

// 查询数据（示例）
const activeTab = ref('order');
const fundRows = computed(() => [
  {
    available: funds.value.available.toFixed(2),
    frozen: (0).toFixed(2),
    marketValue: (0).toFixed(2),
    totalAssets: funds.value.available.toFixed(2),
  },
]);
const positionRows = ref([]);
const orderRows = ref([
  {
    account: '模拟账户',
    time: '2023-08-02 16:46:59',
    stockCode: '600000',
    type: '买入',
    price: 7.48,
    quantity: 100,
    dealt: 0,
    amount: 748.0,
    market: '上交所',
    orderType: '限价',
    status: '已报',
  },
]);
const dealRows = ref([]);
</script>

<style scoped>
/* 页面骨架（与全局风格一致：浅色、卡片式） */




/* 行情面板 */
.market-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 10px;
}
.market-head .name { font-size: 14px; color: #606266; }
.market-head .code { font-size: 12px; color: #909399; }
.market-head .price { font-size: 22px; font-weight: 700; color: #303133; }
.market-head .delta { font-size: 12px; }
.market-head .delta.up { color: #2ecb70; }
.market-head .delta.down { color: #ff6b6b; }

.market-table { padding: 0 10px 10px; }
.market-table table { width: 100%; border-collapse: collapse; }
.market-table td { padding: 6px 4px; font-size: 12px; }
.market-table .side { width: 42px; color: #8a9098; }
.market-table .price { width: 70px; font-weight: 600; }
.market-table .price.buy { color: #2ecb70; }
.market-table .price.sell { color: #ff6b6b; }
.market-table .sep td { height: 6px; border-top: 1px dashed #ebeef5; }
.market-table .vol { text-align: right; color: #606266; }

/* 下单面板 */
.order-form { padding: 10px; }
.quick-ops { display: flex; gap: 6px; }

/* 预览面板 */

/* 查询面板 */

/* 沿用全局表格风格（不覆写 Element Plus 默认浅色样式） */

/* 横向溢出时使用滚动条 */
.scroll-x :deep(.el-table) { min-width: 900px; }

/* 修复查询面板标签切换时的抖动问题 */
.pane-query .el-tabs__content {
  /* 固定标签页内容区域的最小高度，防止不同标签页高度不一致导致抖动 */
  min-height: 300px;
}

/* 稳定滚动条布局 */
.scroll-x {
  /* 始终为滚动条预留空间，避免滚动条出现/消失时的布局变化 */
  overflow-x: auto;
  scrollbar-gutter: stable;
}
</style>
