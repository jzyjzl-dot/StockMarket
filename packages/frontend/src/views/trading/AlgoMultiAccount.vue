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
        <div class="preview-summary">
          <span>合计</span>
          <span class="mono">{{ totalPrice.toFixed(2) }}</span>
          <span class="mono">{{ totalAvailable.toFixed(2) }}</span>
          <span class="mono">0</span>
        </div>
      </section>

      <!-- 下单（多账号�?-->
      <section class="pane pane-order">
        <header class="pane-header"><div class="title">算法交易</div></header>
        <div class="order-form pane-body scroll-y">
          <!-- 新版：算法交�?+ 参数设置（两个独立表格，各自滚动�?-->
          <div class="algo-order-grid">
            <!-- 算法交易表格 -->
            <div class="algo-col">
              <div class="algo-table-wrapper">
                <h3 class="table-title">算法交易</h3>
                <div class="table-content scroll-y-independent">
                  <el-form :model="orderForm" label-width="96px" size="small">
                    <el-form-item label="委托账户">
                      <el-select v-model="orderForm.account" style="width: 100%">
                        <el-option label="全部账户" value="ALL" />
                        <el-option v-for="acc in accounts" :key="acc.id" :label="acc.name" :value="acc.id" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="证券代码">
                      <el-input v-model="orderForm.symbol" placeholder="�?600000">
                        <template #append>{{ currentStock.name }}</template>
                      </el-input>
                    </el-form-item>
                    <el-form-item label="算法类型">
                      <el-select v-model="orderForm.algoType" style="width: 100%">
                        <el-option label="TWAP" value="TWAP" />
                        <el-option label="VWAP" value="VWAP" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="算法实例">
                      <el-input v-model="orderForm.algoInstance" placeholder="�?kf_twap_plus" />
                    </el-form-item>
                    <el-form-item label="委托时间">
                      <div class="time-row">
                        <el-time-select v-model="orderForm.startTime" :start="'09:30'" :end="'14:57'" :step="'00:01'" placeholder="开�? />
                        <el-time-select v-model="orderForm.endTime" :start="'09:30'" :end="'15:00'" :step="'00:01'" placeholder="结束" />
                      </div>
                    </el-form-item>
                    <el-form-item label="交易方向">
                      <el-select v-model="orderForm.entrustType" style="width: 100%">
                        <el-option label="普通买�? value="BUY" />
                        <el-option label="普通卖�? value="SELL" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="价格类型">
                      <el-select v-model="orderForm.priceType" style="width: 100%">
                        <el-option label="限价" value="fixed" />
                        <el-option label="对手�? value="counter" />
                        <el-option label="排队�? value="queue" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="委托价格">
                      <el-input-number v-model="orderForm.price" :precision="2" :step="0.01" :min="0" controls-position="right" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="委托策略">
                      <el-select v-model="orderForm.strategy" style="width: 100%">
                        <el-option label="固定数量" value="fixedQty" />
                        <el-option label="固定金额" value="fixedAmt" />
                        <el-option label="百分�? value="percentage" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="任务数量">
                      <div class="qty-row">
                        <el-input-number v-model="orderForm.qty" :min="0" :step="100" style="flex:1" />
                        <span>�?/span>
                      </div>
                    </el-form-item>
                    <el-form-item label="分配方式">
                      <el-select v-model="orderForm.distribution" style="width: 100%">
                        <el-option label="每账户固定数�? value="eachFixedQty" />
                        <el-option label="按账户可用资金比�? value="byProportion" />
                      </el-select>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="danger" style="width: 100%" @click="placeOrder">{{ orderForm.entrustType === 'BUY' ? '买入' : '卖出' }}</el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </div>

            <!-- 算法参数设置表格 -->
            <div class="algo-col">
              <div class="algo-table-wrapper">
                <h3 class="table-title">算法参数设置</h3>
                <div class="table-content scroll-y-independent">
                  <el-form :model="algoParams" label-width="96px" size="small">
                    <el-form-item label="盒子编号">
                      <el-input v-model="algoParams.boxNo" placeholder="请输�? />
                    </el-form-item>
                    <el-form-item label="外部编号">
                      <el-input v-model="algoParams.externalNo" placeholder="请输�? />
                    </el-form-item>
                    <el-form-item label="母单限价">
                      <el-input-number v-model="algoParams.parentLimitPrice" :min="0" :step="0.01" controls-position="right" style="width:100%" />
                    </el-form-item>
                    <el-form-item label="涨幅限制(%)">
                      <el-input-number v-model="algoParams.riseLimitPct" :min="0" :step="0.1" style="width:100%" />
                    </el-form-item>
                    <el-form-item label="跌幅限制(%)">
                      <el-input-number v-model="algoParams.fallLimitPct" :min="0" :step="0.1" style="width:100%" />
                    </el-form-item>
                    <el-form-item label="滑点基点">
                      <el-input-number v-model="algoParams.slippageBps" :min="0" :step="1" style="width:100%" />
                    </el-form-item>
                    <el-form-item label="涨跌停设�?>
                      <el-select v-model="algoParams.limitRule" style="width: 100%">
                        <el-option label="涨停不卖跌停不买" value="strict" />
                        <el-option label="不限�? value="none" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="盘口限制(�?">
                      <el-input-number v-model="algoParams.orderbookLimit" :min="0" :step="0.01" style="width:100%" />
                    </el-form-item>
                    <el-form-item>
                      <el-checkbox v-model="algoParams.execAfterExpire">过期后执�?/el-checkbox>
                    </el-form-item>
                    <el-form-item>
                      <el-checkbox v-model="algoParams.executeImmediately">立即交易</el-checkbox>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 算法参数设置（独�?Section�?-->
      <section class="pane pane-params">
        <header class="pane-header"><div class="title">算法参数设置</div></header>
        <div class="pane-body scroll-y">
          <el-form :model="algoParams" label-width="96px" size="small">
            <el-form-item label="盒子编号">
              <el-input v-model="algoParams.boxNo" placeholder="请输�? />
            </el-form-item>
            <el-form-item label="外部编号">
              <el-input v-model="algoParams.externalNo" placeholder="请输�? />
            </el-form-item>
            <el-form-item label="母单限价">
              <el-input-number v-model="algoParams.parentLimitPrice" :min="0" :step="0.01" controls-position="right" style="width:100%" />
            </el-form-item>
            <el-form-item label="涨幅限制(%)">
              <el-input-number v-model="algoParams.riseLimitPct" :min="0" :step="0.1" style="width:100%" />
            </el-form-item>
            <el-form-item label="跌幅限制(%)">
              <el-input-number v-model="algoParams.fallLimitPct" :min="0" :step="0.1" style="width:100%" />
            </el-form-item>
            <el-form-item label="滑点基点">
              <el-input-number v-model="algoParams.slippageBps" :min="0" :step="1" style="width:100%" />
            </el-form-item>
            <el-form-item label="涨跌停设�?>
              <el-select v-model="algoParams.limitRule" style="width: 100%">
                <el-option label="涨停不卖跌停不买" value="strict" />
                <el-option label="不限�? value="none" />
              </el-select>
            </el-form-item>
            <el-form-item label="盘口限制(�?">
              <el-input-number v-model="algoParams.orderbookLimit" :min="0" :step="0.01" style="width:100%" />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="algoParams.execAfterExpire">过期后执�?/el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="algoParams.executeImmediately">立即交易</el-checkbox>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- 预览（多账号逐行�?-->
      <section class="pane pane-preview">
        <header class="pane-header">
          <div class="title">预览</div>
          <div class="sub">账户数：{{ selectedAccounts.length }}  委托笔数：{{ previewRows.length }}</div>
        </header>
        <div class="pane-body">
          <div class="scroll-x">
            <el-table v-resizable-columns :data="previewRows" size="small" style="width: 100%">
              <el-table-column type="selection" width="44" />
              <el-table-column prop="account" label="账户" width="120" />
              <el-table-column prop="symbol" label="证券代码" width="120" />
              <el-table-column prop="side" label="方向" width="90" />
              <el-table-column prop="qty" label="委托�? width="100" />
              <el-table-column prop="price" label="委托�? width="100" />
              <el-table-column prop="amount" label="委托金额" min-width="140" />
              <el-table-column prop="available" label="可用资金" min-width="140" />
              <el-table-column prop="buyable" label="可买数量" min-width="100" />
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
              <el-table v-resizable-columns :data="fundRows" size="small" style="width: 100%" height="260">
                <el-table-column prop="available" label="可用资金" width="140" />
                <el-table-column prop="frozen" label="冻结资金" width="140" />
                <el-table-column prop="marketValue" label="市�? width="140" />
                <el-table-column prop="totalAssets" label="总资�? width="160" />
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
                <el-table-column prop="marketValue" label="市�? min-width="140" />
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
                <el-table-column prop="strategy" label="算法" width="120" />
                <el-table-column prop="price" label="委托�? width="100" />
                <el-table-column prop="quantity" label="委托�? width="100" />
                <el-table-column prop="dealt" label="成交�? width="100" />
                <el-table-column prop="amount" label="委托金额" min-width="140" />
                <el-table-column prop="market" label="市场" width="100" />
                <el-table-column prop="status" label="状�? width="100" />
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="成交" name="deal">
            <div class="scroll-x">
              <el-table v-resizable-columns :data="dealRows" size="small" style="width: 100%" height="260">
                <el-table-column prop="time" label="时间" width="160" />
                <el-table-column prop="stockCode" label="证券代码" width="120" />
                <el-table-column prop="type" label="方向" width="80" />
                <el-table-column prop="price" label="成交�? width="100" />
                <el-table-column prop="quantity" label="成交�? width="100" />
                <el-table-column prop="amount" label="成交金额" min-width="140" />
                <el-table-column prop="status" label="状�? width="100" />
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <footer class="nt-pagination">
        <div class="left">�?{{ orderRows.length }} �?/div>
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

// 多账�?
const accounts = ref([
  { id: 'A01', name: '账户1', available: 884760.0 },
  { id: 'A02', name: '账户2', available: 707258.0 },
  { id: 'A03', name: '账户3', available: 120300.0 },
]);
const selectedAccounts = ref(accounts.value.map((a) => a.id));

// 下单
const orderForm = ref({
  account: 'ALL',
  symbol: '600000',
  algoType: 'TWAP',
  algoInstance: 'kf_twap_plus',
  startTime: '09:30',
  endTime: '14:57',
  entrustType: 'BUY',
  priceType: 'fixed',
  price: 7.49,
  strategy: 'fixedQty',
  qty: 1000,
  distribution: 'eachFixedQty',
});
const setQty = (n) => (orderForm.value.qty = n);
const placeOrder = () => {
  if (!orderForm.value.symbol || !orderForm.value.qty || selectedAccounts.value.length === 0) {
    ElMessage.warning('请完善下单信息与选择账户');
    return;
  }
  ElMessage.success('多账号指令已提交');
};
// 算法参数设置
const algoParams = ref({
  boxNo: '',
  externalNo: '',
  parentLimitPrice: null,
  riseLimitPct: null,
  fallLimitPct: null,
  slippageBps: null,
  limitRule: 'strict',
  orderbookLimit: null,
  execAfterExpire: false,
  executeImmediately: true,
});

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

const totalPrice = computed(() =>
  previewRows.value.reduce((sum, r) => sum + (r.amount === '-' ? 0 : Number(r.amount)), 0)
);

const totalAvailable = computed(() =>
  selectedAccounts.value.reduce((sum, id) => {
    const acc = accounts.value.find((a) => a.id === id);
    return sum + (acc?.available ?? 0);
  }, 0)
);

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
/* �?NormalTrade 一致的布局与风�?*/
.scroll-x :deep(.el-table) { min-width: 900px; }

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

/* 下单面板 */
.pane-order .pane-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px; /* 给栅格留一些外边距 */
}
.quick-ops { display: flex; gap: 6px; }

/* 横向溢出时使用滚动条 */
.scroll-x :deep(.el-table) { min-width: 900px; }

/* 修复查询面板标签切换时的抖动问题 */
.pane-query .el-tabs__content {
  /* 固定标签页内容区域的最小高度，防止不同标签页高度不一致导致抖�?*/
  min-height: 300px;
}

/* 稳定滚动条布局 */
.scroll-x {
  /* 始终为滚动条预留空间，避免滚动条出现/消失时的布局变化 */
  overflow-x: auto;
  scrollbar-gutter: stable;
}

/* 本页：压缩预览宽度，扩大下单区域 */
.nt-page .nt-top { grid-template-columns: 260px 420px 420px 360px; }

/* 预览表格占满剩余宽度 */
.pane-preview .scroll-x {
  width: 100%;
}

.pane-preview .scroll-x .el-table {
  /* 确保表格能够利用所有可用宽�?*/
  width: 100% !important;
  min-width: 800px; /* 设置最小宽度确保表格不会过度压�?*/
}

/* 让某些列能够自适应宽度 */
.pane-preview .el-table .el-table__body-wrapper {
  overflow-x: auto;
}

/* 两列下单栅格 */
.algo-order-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; min-width: 0; height: 100%; }
.pane-order .algo-order-grid { display: block; }
.pane-order .algo-col + .algo-col { display: none; }
.algo-col { 
  min-width: 0; 
  display: flex; 
  flex-direction: column; /* 让表格包装器能够伸展 */
}

/* 表格样式 */
.algo-table-wrapper {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1; /* 让表格占满可用空�?*/
}

.table-title {
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 16px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  flex-shrink: 0; /* 标题不收�?*/
}

.table-content {
  padding: 16px;
  flex: 1; /* 内容区占满剩余空�?*/
  overflow: hidden; /* 为滚动容器准�?*/
}

/* 独立滚动区域 */
.scroll-y-independent {
  max-height: calc(100vh - 300px); /* 设置最大高度，根据需要调�?*/
  overflow-y: auto;
  overflow-x: hidden;
  /* 美化滚动�?*/
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.scroll-y-independent::-webkit-scrollbar {
  width: 6px;
}

.scroll-y-independent::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scroll-y-independent::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.scroll-y-independent::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
.sub-title { margin: 6px 0 8px; font-weight: 600; }
.time-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.qty-row { display: flex; gap: 8px; align-items: center; }
</style>


