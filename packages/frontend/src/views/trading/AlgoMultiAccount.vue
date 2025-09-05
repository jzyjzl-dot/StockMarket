<template>
  <div class="nt-page">
    <div class="nt-top">
      <!-- 行情 -->
      <section class="pane pane-market">
        <header class="pane-header"><div class="title">行情</div></header>
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

      <!-- 下单（多账号） -->
      <section class="pane pane-order">
        <header class="pane-header"><div class="title">下单</div></header>
        <div class="order-form pane-body scroll-y">
          <el-form :model="orderForm" label-width="84px" size="small">
            <el-form-item label="委托类别">
              <el-select v-model="orderForm.entrustType" style="width: 100%">
                <el-option label="买入" value="BUY" />
                <el-option label="卖出" value="SELL" />
              </el-select>
            </el-form-item>
            <el-form-item label="证券代码">
              <el-input v-model="orderForm.symbol" placeholder="如 600000" />
            </el-form-item>
            <el-form-item label="委托价格">
              <el-select v-model="orderForm.priceType" style="width: 100%">
                <el-option label="固定价格" value="fixed" />
                <el-option label="对手价" value="counter" />
                <el-option label="排队价" value="queue" />
              </el-select>
            </el-form-item>
            <el-form-item label="价格">
              <el-input-number v-model="orderForm.price" :precision="2" :step="0.01" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="委托数量">
              <el-input-number v-model="orderForm.qty" :min="0" :step="100" style="width: 100%" />
            </el-form-item>
            <el-form-item label="选择账户">
              <el-checkbox-group v-model="selectedAccounts">
                <el-checkbox v-for="acc in accounts" :key="acc.id" :label="acc.id">{{ acc.name }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <div class="quick-ops">
                <el-button size="small" @click="setQty(100)">100</el-button>
                <el-button size="small" @click="setQty(500)">500</el-button>
                <el-button size="small" @click="setQty(1000)">1000</el-button>
                <el-button size="small" @click="setQty(2000)">2000</el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" style="width: 100%" @click="placeOrder">{{ orderForm.entrustType === 'BUY' ? '买入' : '卖出' }}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- 预览（多账号逐行） -->
      <section class="pane pane-preview">
        <header class="pane-header">
          <div class="title">预览</div>
          <div class="sub">账户数：{{ previewRows.length }}</div>
        </header>
        <div class="pane-body">
          <div class="scroll-x">
            <el-table v-resizable-columns :data="previewRows" size="small" style="width: 100%">
              <el-table-column type="selection" width="44" />
              <el-table-column prop="account" label="账户" width="120" />
              <el-table-column prop="symbol" label="证券代码" width="120" />
              <el-table-column prop="side" label="方向" width="80" />
              <el-table-column prop="qty" label="委托量" width="100" />
              <el-table-column prop="price" label="委托价" width="100" />
              <el-table-column prop="amount" label="委托金额" min-width="140" />
              <el-table-column prop="available" label="可用资金" min-width="140" />
              <el-table-column prop="buyable" label="可买数量" width="120" />
            </el-table>
          </div>
        </div>
      </section>
    </div>

    <!-- 查询 -->
    <section class="pane pane-query">
      <header class="pane-header"><div class="title">查询</div></header>
      <div class="pane-body">
        <el-tabs v-model="activeTab" type="card" class="nt-tabs">
          <el-tab-pane label="资金" name="fund">
            <div class="scroll-x">
              <el-table v-resizable-columns :data="fundRows" size="small" style="width: 100%">
                <el-table-column prop="available" label="可用资金" width="140" />
                <el-table-column prop="frozen" label="冻结资金" width="140" />
                <el-table-column prop="marketValue" label="市值" width="140" />
                <el-table-column prop="totalAssets" label="总资产" width="160" />
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="持仓" name="pos">
            <div class="scroll-x">
              <el-table v-resizable-columns :data="positionRows" size="small" style="width: 100%">
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
              <el-table v-resizable-columns :data="orderRows" size="small" style="width: 100%">
                <el-table-column prop="account" label="账户" width="100" />
                <el-table-column prop="time" label="委托时间" width="160" />
                <el-table-column prop="stockCode" label="证券代码" width="120" />
                <el-table-column prop="type" label="方向" width="80" />
                <el-table-column prop="strategy" label="算法" width="120" />
                <el-table-column prop="price" label="委托价" width="100" />
                <el-table-column prop="quantity" label="委托量" width="100" />
                <el-table-column prop="dealt" label="成交量" width="100" />
                <el-table-column prop="amount" label="委托金额" min-width="140" />
                <el-table-column prop="market" label="市场" width="100" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="成交" name="deal">
            <div class="scroll-x">
              <el-table v-resizable-columns :data="dealRows" size="small" style="width: 100%">
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

// 行情
const currentStock = ref({ name: '浦发银行', code: '600000', price: 7.49, change: 0.01, changePct: 0.0013 });
const marketRows = ref(Array.from({ length: 10 }).map((_, i) => ({ ask: { price: 7.60 - i * 0.01, vol: 2000 + i * 100 }, bid: { price: 7.46 - i * 0.01, vol: 1800 + i * 100 } })));

// 多账号
const accounts = ref([
  { id: 'A01', name: '账户1', available: 884760.0 },
  { id: 'A02', name: '账户2', available: 707258.0 },
  { id: 'A03', name: '账户3', available: 120300.0 },
]);
const selectedAccounts = ref(accounts.value.map((a) => a.id));

// 下单
const orderForm = ref({ entrustType: 'BUY', symbol: '600000', priceType: 'fixed', price: 7.49, qty: 100 });
const setQty = (n) => (orderForm.value.qty = n);
const placeOrder = () => {
  if (!orderForm.value.symbol || !orderForm.value.qty || selectedAccounts.value.length === 0) {
    ElMessage.warning('请完善下单信息与选择账户');
    return;
  }
  ElMessage.success('多账号指令已提交');
};

// 预览
const previewRows = computed(() => {
  const price = Number(orderForm.value.price) || 0;
  const qty = Number(orderForm.value.qty) || 0;
  return selectedAccounts.value.map((id) => {
    const acc = accounts.value.find((a) => a.id === id);
    const amount = price * qty;
    return {
      account: acc?.name || id,
      symbol: orderForm.value.symbol,
      side: orderForm.value.entrustType === 'BUY' ? '买入' : '卖出',
      qty,
      price: price ? price.toFixed(2) : '-',
      amount: amount ? amount.toFixed(2) : '-',
      available: (acc?.available ?? 0).toFixed(2),
      buyable: Math.floor(((acc?.available ?? 0) / (price || 1)) / 100) * 100,
    };
  });
});

// 查询
const activeTab = ref('order');
const fundRows = computed(() => accounts.value.map((a) => ({ available: a.available.toFixed(2), frozen: (0).toFixed(2), marketValue: (0).toFixed(2), totalAssets: a.available.toFixed(2) })));
const positionRows = ref([]);
const orderRows = ref([
  { account: '账户1', time: '2023-08-03 11:17:35', stockCode: '600000', type: '买入', strategy: 'TWAP', price: 7.49, quantity: 1000, dealt: 0, amount: 7490.0, market: '上交所', status: '已报' },
]);
const dealRows = ref([]);
</script>

<style scoped>
/* 与 NormalTrade 一致的布局与风格 */
.nt-page { padding: 10px; color: inherit; background: transparent; height: 100%; min-height: 0; display: flex; flex-direction: column; overflow: auto; }
.nt-top { display: grid; grid-template-columns: 260px 320px 1fr; gap: 16px; flex: 1 1 60%; min-height: 0; }
.pane { background: #fff; border: 1px solid #ebeef5; border-radius: var(--radius, 8px); min-width: 0; display: flex; flex-direction: column; min-height: 0; }
.pane-header { height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; color: #303133; background: #f5f7fa; border-bottom: 1px solid #ebeef5; }
.pane-header .title { font-weight: 600; }
.pane-header .sub { font-size: 12px; color: #606266; }
.pane .pane-body { flex: 1 1 auto; min-height: 0; overflow: auto; }
.scroll-y { overflow-y: auto; }
.scroll-x { overflow-x: auto; width: 100%; }
.scroll-x :deep(.el-table) { min-width: 900px; }
.pane-query { margin-top: 16px; background: #fff; border: 1px solid #ebeef5; border-radius: var(--radius, 8px); flex: 1 1 40%; display: flex; flex-direction: column; min-height: 0; }
.nt-tabs { padding: 0 6px; }
.nt-pagination { height: 40px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px 8px; color: #606266; border-top: 1px solid #ebeef5; }

/* 行情样式 */
.market-head { display: flex; align-items: flex-end; justify-content: space-between; padding: 10px; }
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

/* 下单 */
.order-form { padding: 10px; }
.quick-ops { display: flex; gap: 6px; }
</style>

