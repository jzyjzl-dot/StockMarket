<template>
  <div class="nt-page">
    <div class="nt-top">
      <!-- 行情 -->
      <section v-if="false" class="pane pane-market">
        <header class="pane-header"><div class="title">行情</div></header>
        <div class="pane-body scroll-y">
          <div class="market-head">
            <div class="stock">
              <div class="name">{{ currentStock.name }}</div>
              <div class="code">{{ currentStock.code }}</div>
            </div>
            <div class="price-box">
              <div class="price">{{ currentStock.price.toFixed(2) }}</div>
              <div
                class="delta"
                :class="{
                  up: currentStock.change >= 0,
                  down: currentStock.change < 0,
                }"
              >
                <span
                  >{{ currentStock.change >= 0 ? '+' : ''
                  }}{{ currentStock.change.toFixed(2) }}</span
                >
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
                <tr class="sep">
                  <td colspan="3"></td>
                </tr>
                <tr v-for="(row, idx) in marketRows" :key="'bid-' + idx">
                  <td class="side buy">买{{ idx + 1 }}</td>
                  <td class="price buy">{{ row.bid.price.toFixed(2) }}</td>
                  <td class="vol">{{ row.bid.vol }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="preview-summary">
            <span>合计</span>
            <span class="mono">{{ totalPrice.toFixed(2) }}</span>
            <span class="mono">{{ totalAvailable.toFixed(2) }}</span>
            <span class="mono">0</span>
          </div>
        </div>
      </section>

      <!-- 算法交易 -->
      <section class="pane pane-algo-trade">
        <header class="pane-header"><div class="title">算法交易</div></header>
        <div class="pane-body scroll-y">
          <el-form :model="orderForm" label-width="60px" size="small">
            <el-form-item label="委托账户">
              <el-select v-model="orderForm.account" style="width: 100%">
                <el-option
                  v-for="g in accountGroups"
                  :key="g.id"
                  :label="g.name"
                  :value="g.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="证券代码">
              <el-input v-model="orderForm.symbol" placeholder="如600000">
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
              <el-select
                v-model="orderForm.algoInstance"
                style="width: 100%"
                placeholder="选择算法实例"
              >
                <el-option label="kf_twap_plus" value="kf_twap_plus" />
                <el-option label="kf_vwap_plus" value="kf_vwap_plus" />
                <el-option label="algorithm_001" value="algorithm_001" />
                <el-option label="algorithm_002" value="algorithm_002" />
              </el-select>
            </el-form-item>
            <el-form-item label="委托时间">
              <div class="time-row">
                <el-time-select
                  v-model="orderForm.startTime"
                  :start="'09:30'"
                  :end="'14:57'"
                  :step="'00:01'"
                  placeholder="开始"
                />
                <el-time-select
                  v-model="orderForm.endTime"
                  :start="'09:30'"
                  :end="'15:00'"
                  :step="'00:01'"
                  placeholder="结束"
                />
              </div>
            </el-form-item>
            <el-form-item label="交易方向">
              <el-select v-model="orderForm.entrustType" style="width: 100%">
                <el-option label="普通买入" value="BUY" />
                <el-option label="普通卖出" value="SELL" />
              </el-select>
            </el-form-item>
            <el-form-item label="价格类型">
              <el-select v-model="orderForm.priceType" style="width: 100%">
                <el-option label="限价" value="fixed" />
                <el-option label="对手价" value="counter" />
                <el-option label="排队价" value="queue" />
              </el-select>
            </el-form-item>
            <el-form-item label="委托价格">
              <el-input-number
                v-model="orderForm.price"
                :precision="2"
                :step="0.01"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="委托策略">
              <el-select v-model="orderForm.strategy" style="width: 100%">
                <el-option label="固定数量" value="fixedQty" />
                <el-option label="固定金额" value="fixedAmt" />
                <el-option label="百分比" value="percentage" />
              </el-select>
            </el-form-item>
            <el-form-item label="任务数量">
              <div class="qty-row">
                <el-input-number
                  v-model="orderForm.qty"
                  :min="0"
                  :step="100"
                  style="flex: 1"
                />
                <span>股</span>
              </div>
            </el-form-item>
            <el-form-item label="分配方式">
              <el-select v-model="orderForm.distribution" style="width: 100%">
                <el-option label="每账户固定数量" value="eachFixedQty" />
                <el-option label="按账户可用资金比例" value="byProportion" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                type="danger"
                style="width: 100%"
                @click="placeOrder"
                >{{
                  orderForm.entrustType === 'BUY' ? '买入' : '卖出'
                }}</el-button
              >
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- 算法参数设置 -->
      <section v-if="false" class="pane pane-algo-params">
        <header class="pane-header">
          <div class="title">算法参数设置</div>
        </header>
        <div class="pane-body scroll-y">
          <el-form :model="algoParams" label-width="80px" size="small">
            <el-form-item label="算法编号">
              <el-select
                v-model="orderForm.algoInstance"
                style="width: 100%"
                placeholder="选择算法编号"
              >
                <el-option label="kf_twap_plus" value="kf_twap_plus" />
                <el-option label="kf_vwap_plus" value="kf_vwap_plus" />
                <el-option label="algorithm_001" value="algorithm_001" />
                <el-option label="algorithm_002" value="algorithm_002" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="false" label="盒子编号">
              <el-input v-model="algoParams.boxNo" placeholder="请输入" />
            </el-form-item>
            <el-form-item v-if="false" label="外部编号">
              <el-input v-model="algoParams.externalNo" placeholder="请输入" />
            </el-form-item>
            <el-form-item v-if="false" label="母单限价">
              <el-input-number
                v-model="algoParams.parentLimitPrice"
                :min="0"
                :step="0.01"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item v-if="false" label="涨幅限制(%)">
              <el-input-number
                v-model="algoParams.riseLimitPct"
                :min="0"
                :step="0.1"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item v-if="false" label="跌幅限制(%)">
              <el-input-number
                v-model="algoParams.fallLimitPct"
                :min="0"
                :step="0.1"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item v-if="false" label="滑点基点">
              <el-input-number
                v-model="algoParams.slippageBps"
                :min="0"
                :step="1"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item v-if="false" label="涨跌停设置">
              <el-select v-model="algoParams.limitRule" style="width: 100%">
                <el-option label="涨停不卖跌停不买" value="strict" />
                <el-option label="不限制" value="none" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="false" label="盘口限制(元)">
              <el-input-number
                v-model="algoParams.orderbookLimit"
                :min="0"
                :step="0.01"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item v-if="false">
              <el-checkbox v-model="algoParams.execAfterExpire"
                >过期后执行</el-checkbox
              >
            </el-form-item>
            <el-form-item v-if="false">
              <el-checkbox v-model="algoParams.executeImmediately"
                >立即交易</el-checkbox
              >
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- 预览（多账号逐行�?-->
      <section class="pane pane-preview">
        <header class="pane-header">
          <div class="title">预览</div>
          <div class="sub">
            账户数：{{ previewAccountCount }} 委托笔数：{{ previewRows.length }}
          </div>
        </header>
        <div class="pane-body">
          <div class="scroll-x">
            <el-table
              v-resizable-columns
              :data="previewRows"
              size="small"
              style="width: 100%"
              max-height="350px"
              @selection-change="onSelectionChange"
            >
              <el-table-column type="selection" width="44" />
              <el-table-column prop="account" label="账户" width="120" />
              <el-table-column prop="symbol" label="证券代码" width="120" />
              <el-table-column prop="side" label="方向" width="90" />
              <el-table-column prop="qty" label="委托量" width="100" />
              <el-table-column prop="price" label="委托价" width="100" />
              <el-table-column prop="amount" label="委托金额" min-width="140" />
              <el-table-column
                prop="available"
                label="可用资金"
                min-width="140"
              />
              <el-table-column
                prop="buyable"
                label="可买数量"
                min-width="100"
              />
            </el-table>
          </div>
          <div class="preview-summary">
            <span>合计</span>
            <span class="mono">{{ totalPrice.toFixed(2) }}</span>
            <span class="mono">{{ totalAvailable.toFixed(2) }}</span>
            <span class="mono">0</span>
            <el-button
              type="primary"
              size="small"
              :disabled="selectedRows.length === 0"
              @click="confirmSelected"
              >确认</el-button
            >
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
              <el-table
                v-resizable-columns
                :data="fundRows"
                size="small"
                style="width: 100%"
              >
                <el-table-column
                  prop="available"
                  label="可用资金"
                  width="140"
                />
                <el-table-column prop="frozen" label="冻结资金" width="140" />
                <el-table-column prop="marketValue" label="市值" width="140" />
                <el-table-column
                  prop="totalAssets"
                  label="总资产"
                  width="160"
                />
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="持仓" name="pos">
            <div class="scroll-x">
              <el-table
                v-resizable-columns
                :data="positionRows"
                size="small"
                style="width: 100%"
              >
                <el-table-column prop="symbol" label="证券代码" width="120" />
                <el-table-column prop="name" label="证券名称" width="140" />
                <el-table-column prop="quantity" label="持仓数量" width="100" />
                <el-table-column prop="cost" label="持仓成本" width="100" />
                <el-table-column prop="marketPrice" label="现价" width="100" />
                <el-table-column
                  prop="marketValue"
                  label="市值"
                  min-width="140"
                />
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="委托" name="order">
            <div class="order-virtual-list">
              <!-- 固定表头 -->
              <div class="virtual-table-header">
                <div class="virtual-table-row header-row">
                  <div class="virtual-table-cell" style="width: 100px">
                    账户
                  </div>
                  <div class="virtual-table-cell" style="width: 160px">
                    委托时间
                  </div>
                  <div class="virtual-table-cell" style="width: 120px">
                    证券代码
                  </div>
                  <div class="virtual-table-cell" style="width: 80px">方向</div>
                  <div class="virtual-table-cell" style="width: 100px">
                    委托价
                  </div>
                  <div class="virtual-table-cell" style="width: 100px">
                    委托量
                  </div>
                  <div class="virtual-table-cell" style="width: 100px">
                    成交量
                  </div>
                  <div class="virtual-table-cell" style="width: 140px">
                    委托金额
                  </div>
                  <div class="virtual-table-cell" style="width: 100px">
                    交易市场
                  </div>
                  <div class="virtual-table-cell" style="width: 100px">
                    价格类型
                  </div>
                  <div class="virtual-table-cell" style="width: 100px">
                    状态
                  </div>
                </div>
              </div>

              <!-- 虚拟滚动容器 -->
              <div
                ref="virtualScrollContainer"
                class="virtual-scroll-container"
                @scroll="handleScroll"
              >
                <!-- 虚拟滚动内容 -->
                <div
                  class="virtual-scroll-content"
                  :style="{ height: totalHeight + 'px' }"
                >
                  <div
                    class="virtual-scroll-viewport"
                    :style="{ transform: `translateY(${startOffset}px)` }"
                  >
                    <!-- 可见行 -->
                    <div class="virtual-table-body">
                      <div
                        v-for="(item, index) in visibleItems"
                        :key="item.id || `${startIndex + index}`"
                        class="virtual-table-row data-row"
                        :class="{ 'row-even': (startIndex + index) % 2 === 0 }"
                      >
                        <div class="virtual-table-cell" style="width: 100px">
                          {{ item.account }}
                        </div>
                        <div class="virtual-table-cell" style="width: 160px">
                          {{ formatTime(item.time) }}
                        </div>
                        <div class="virtual-table-cell" style="width: 120px">
                          {{ item.stockCode }}
                        </div>
                        <div class="virtual-table-cell" style="width: 80px">
                          <span
                            :class="{
                              'buy-type': item.type === '买入',
                              'sell-type': item.type === '卖出',
                            }"
                            >{{ item.type }}</span
                          >
                        </div>
                        <div class="virtual-table-cell" style="width: 100px">
                          {{ Number(item.price || 0).toFixed(2) }}
                        </div>
                        <div class="virtual-table-cell" style="width: 100px">
                          {{ item.quantity }}
                        </div>
                        <div class="virtual-table-cell" style="width: 100px">
                          {{ item.dealt }}
                        </div>
                        <div class="virtual-table-cell" style="width: 140px">
                          {{ Number(item.amount || 0).toFixed(2) }}
                        </div>
                        <div class="virtual-table-cell" style="width: 100px">
                          {{ item.market }}
                        </div>
                        <div class="virtual-table-cell" style="width: 100px">
                          {{ item.orderType }}
                        </div>
                        <div class="virtual-table-cell" style="width: 100px">
                          <span :class="getStatusClass(item.status)">{{
                            item.status
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="成交" name="deal">
            <div class="scroll-x">
              <el-table
                v-resizable-columns
                :data="dealRows"
                size="small"
                style="width: 100%"
              >
                <el-table-column prop="time" label="时间" width="160" />
                <el-table-column
                  prop="stockCode"
                  label="证券代码"
                  width="120"
                />
                <el-table-column prop="type" label="方向" width="80" />
                <el-table-column prop="price" label="成交价" width="100" />
                <el-table-column prop="quantity" label="成交量" width="100" />
                <el-table-column
                  prop="amount"
                  label="成交金额"
                  min-width="140"
                />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const currentStock = ref({
  name: '示例股票',
  code: '600000',
  price: 7.49,
  change: 0.01,
  changePct: 0.0013,
});
const marketRows = ref(
  Array.from({ length: 10 }).map((_, i) => ({
    ask: { price: 7.6 - i * 0.01, vol: 2000 + i * 100 },
    bid: { price: 7.46 - i * 0.01, vol: 1800 + i * 100 },
  }))
);

const orderForm = ref({
  account: null,
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

const jsBase = import.meta.env.VITE_JSON_SERVER_BASE || 'http://localhost:3004';

const previewRows = ref([]);
const selectedRows = ref([]);
const orderRows = ref([]);
const stockAccounts = ref([]);
const accountGroups = ref([]);

const isToday = (value) => {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const onSelectionChange = (rows) => {
  selectedRows.value = rows || [];
};

const accountsByGroup = computed(() => {
  const map = new Map();
  stockAccounts.value.forEach((account) => {
    const groupId = account.group ?? '';
    if (!map.has(groupId)) {
      map.set(groupId, []);
    }
    map.get(groupId).push(account);
  });
  return map;
});

const selectedGroupAccounts = computed(() => {
  const groupId = orderForm.value.account?.toString() ?? '';
  return accountsByGroup.value.get(groupId) ?? [];
});

const ensureGroupSelection = () => {
  const current = orderForm.value.account?.toString() ?? '';
  if (current && accountsByGroup.value.has(current)) {
    return;
  }
  const firstWithAccounts = accountGroups.value.find((group) => {
    const list = accountsByGroup.value.get(group.id) ?? [];
    return list.length > 0;
  });
  if (firstWithAccounts) {
    orderForm.value.account = firstWithAccounts.id;
    return;
  }
  if (accountGroups.value.length) {
    orderForm.value.account = accountGroups.value[0].id;
  } else {
    orderForm.value.account = null;
  }
};

// const selectedAccountIds = computed(() => {
//   return selectedGroupAccounts.value.map((account) => account.id ?? '');
// });

const buildPreviewRows = () => {
  const accounts = selectedGroupAccounts.value;
  if (!accounts.length) {
    return [];
  }
  const qty = Number(orderForm.value.qty) || 0;
  const price = Number(orderForm.value.price) || 0;
  const amount = price * qty;
  return accounts.map((account) => {
    const availableFunds = Number(
      account.availableFunds ?? account.balance ?? 0
    );
    const buyable = Math.floor(availableFunds / (price || 1) / 100) * 100;
    return {
      id: undefined,
      accountId: account.id ?? '',
      account:
        account.accountName ||
        account.accountNumber ||
        account.id ||
        '资金账号',
      groupId: account.group ?? '',
      symbol: orderForm.value.symbol,
      side: orderForm.value.entrustType === 'BUY' ? '买入' : '卖出',
      qty,
      price: price ? price.toFixed(2) : '-',
      amount: amount ? amount.toFixed(2) : '-',
      available: availableFunds.toFixed(2),
      buyable,
      algoType: orderForm.value.algoType,
      algoInstance: orderForm.value.algoInstance,
      startTime: orderForm.value.startTime,
      endTime: orderForm.value.endTime,
      priceType: orderForm.value.priceType,
      strategy: orderForm.value.strategy,
      distribution: orderForm.value.distribution,
      rawPrice: price,
      rawQty: qty,
      rawAmount: amount,
    };
  });
};

const previewAccountCount = computed(() => {
  const set = new Set(
    previewRows.value.map((row) => row.accountId ?? row.account)
  );
  return set.size;
});

const totalPrice = computed(() => {
  return previewRows.value.reduce(
    (sum, row) => sum + (Number(row.rawAmount ?? row.amount) || 0),
    0
  );
});

const totalAvailable = computed(() => {
  return selectedGroupAccounts.value.reduce((sum, account) => {
    return sum + Number(account.availableFunds ?? account.balance ?? 0);
  }, 0);
});

const activeTab = ref('order');
const fundRows = computed(() =>
  selectedGroupAccounts.value.map((account) => {
    const availableFunds = Number(
      account.availableFunds ?? account.balance ?? 0
    );
    return {
      available: availableFunds.toFixed(2),
      frozen: (0).toFixed(2),
      marketValue: (0).toFixed(2),
      totalAssets: availableFunds.toFixed(2),
    };
  })
);
const positionRows = ref([]);
const dealRows = ref([]);

const fetchAccountGroups = async () => {
  try {
    const { data } = await axios.get(jsBase + '/accountGroups');
    if (Array.isArray(data)) {
      accountGroups.value = data.map((group) => ({
        id:
          group.id != null
            ? String(group.id)
            : group.groupId != null
              ? String(group.groupId)
              : '',
        groupId:
          group.groupId != null
            ? String(group.groupId)
            : group.id != null
              ? String(group.id)
              : '',
        name: group.name ?? 组,
      }));
    } else {
      accountGroups.value = [];
    }
  } catch (error) {
    console.warn('加载账户组失败: ', error?.message || error);
    accountGroups.value = [];
  }
  ensureGroupSelection();
};

const fetchStockAccounts = async () => {
  try {
    const { data } = await axios.get(jsBase + '/stockAccounts');
    if (Array.isArray(data)) {
      stockAccounts.value = data.map((account) => ({
        ...account,
        id: account.id != null ? String(account.id) : '',
        group: account.group != null ? String(account.group) : '',
      }));
    } else {
      stockAccounts.value = [];
    }
  } catch (error) {
    console.warn('加载资金账号失败: ', error?.message || error);
    stockAccounts.value = [];
  }
  ensureGroupSelection();
};

const mapToPreviewRow = (item) => {
  const priceNum = Number(item.rawPrice ?? item.price) || 0;
  const qtyNum = Number(item.rawQty ?? item.qty) || 0;
  const amountNum =
    item.rawAmount != null
      ? Number(item.rawAmount)
      : item.amount != null
        ? Number(item.amount)
        : priceNum * qtyNum;
  const availableNum = Number(item.available ?? item.availableFunds ?? 0) || 0;
  return {
    id: item.id,
    accountId: item.accountId || item.account || '',
    account: item.accountName || item.account || item.accountId || '资金账号',
    groupId: item.groupId || orderForm.value.account?.toString() || '',
    symbol: item.symbol,
    side: item.side === 'SELL' ? '卖出' : '买入',
    qty: qtyNum,
    price: priceNum ? priceNum.toFixed(2) : '-',
    amount: amountNum ? amountNum.toFixed(2) : '-',
    available: availableNum ? availableNum.toFixed(2) : '-',
    buyable: Math.floor(availableNum / (priceNum || 1) / 100) * 100,
    algoType: item.algoType || item.algo_type || orderForm.value.algoType,
    algoInstance:
      item.algoInstance || item.algo_instance || orderForm.value.algoInstance,
    startTime: item.startTime || item.start_time || orderForm.value.startTime,
    endTime: item.endTime || item.end_time || orderForm.value.endTime,
    priceType: item.priceType || item.price_type || orderForm.value.priceType,
    strategy: item.strategy || orderForm.value.strategy,
    distribution: item.distribution || orderForm.value.distribution,
    rawPrice: priceNum,
    rawQty: qtyNum,
    rawAmount: amountNum,
  };
};

const refreshPreview = async () => {
  try {
    const { data } = await axios.get(jsBase + '/algoBuys');
    if (Array.isArray(data)) {
      previewRows.value = data.map(mapToPreviewRow);
    } else {
      previewRows.value = [];
    }
  } catch (error) {
    console.warn('加载 algoBuys 失败: ', error?.message || error);
  }
};

const virtualScrollContainer = ref();
const itemHeight = 35;
const containerHeight = 400;
const visibleCount = Math.ceil(containerHeight / itemHeight);
const bufferSize = 5;
const scrollTop = ref(0);

const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferSize)
);
const endIndex = computed(() =>
  Math.min(
    orderRows.value.length - 1,
    startIndex.value + visibleCount + bufferSize * 2
  )
);
const visibleItems = computed(() =>
  orderRows.value.slice(startIndex.value, endIndex.value + 1)
);
const totalHeight = computed(() => orderRows.value.length * itemHeight);
const startOffset = computed(() => startIndex.value * itemHeight);
const handleScroll = (event) => {
  scrollTop.value = event.target.scrollTop;
};

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return String(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case '已报':
    case '部分成交':
      return 'status-pending';
    case '全部成交':
      return 'status-filled';
    case '已撤单':
      return 'status-cancelled';
    default:
      return '';
  }
};

const refreshOrders = async () => {
  try {
    const { data } = await axios.get(jsBase + '/algoOrders');
    if (Array.isArray(data)) {
      orderRows.value = data
        .map((o) => ({
          id: o.id,
          accountId: o.accountId || o.account || '',
          account: o.accountName || o.account || o.accountId || '????',
          time:
            o.time || o.order_time || o.timestamp || new Date().toISOString(),
          stockCode: o.symbol,
          type: o.type || (o.side === 'SELL' ? '??' : '??'),
          price: Number(o.price) || 0,
          quantity: Number(o.quantity ?? o.qty ?? 0) || 0,
          dealt: Number(o.dealt ?? 0) || 0,
          amount: Number(o.amount) || 0,
          market: o.market || '????',
          orderType: o.orderType || '??',
          status: o.status || '??',
        }))
        .filter((row) => isToday(row.time));
      orderRows.value.sort((a, b) => new Date(b.time) - new Date(a.time));
    } else {
      orderRows.value = [];
    }
  } catch (error) {
    console.warn('加载 algoOrders 失败: ', error?.message || error);
  }
};

const placeOrder = async () => {
  if (!orderForm.value.symbol || !orderForm.value.qty) {
    ElMessage.warning('请填写完整的下单信息');
    return;
  }
  if (!orderForm.value.account) {
    ElMessage.warning('请选择委托账户组');
    return;
  }
  const newRows = buildPreviewRows();
  if (!newRows.length) {
    ElMessage.warning('所选账户组暂无资金账号');
    return;
  }
  previewRows.value.push(...newRows);
  if (orderForm.value.entrustType === 'BUY') {
    try {
      const created = await Promise.all(
        newRows.map((row) =>
          axios
            .post(jsBase + '/algoBuys', {
              timestamp: new Date().toISOString(),
              accountId: row.accountId,
              account: row.accountId,
              accountName: row.account,
              groupId: row.groupId,
              side: 'BUY',
              symbol: row.symbol,
              price: row.rawPrice || Number(orderForm.value.price) || 0,
              qty: row.rawQty || Number(orderForm.value.qty) || 0,
              amount: row.rawAmount || 0,
              priceType: row.priceType,
              strategy: row.strategy,
              distribution: row.distribution,
              algoType: row.algoType,
              algoInstance: row.algoInstance,
              startTime: row.startTime,
              endTime: row.endTime,
            })
            .then((response) => response.data)
        )
      );
      created.forEach((item, index) => {
        if (item && item.id) {
          newRows[index].id = item.id;
        }
      });
      ElMessage.success('买入已导入预览并保存');
      await refreshPreview();
    } catch (error) {
      console.error('保存买入失败: ', error);
      ElMessage.error('保存买入数据失败，请检查 json-server');
    }
  } else {
    ElMessage.success('卖出已导入预览');
  }
};

const confirmSelected = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要确认的预览数据');
    return;
  }
  try {
    const toConfirm = [...selectedRows.value];
    await Promise.all(
      toConfirm.map((row) =>
        axios.post(jsBase + '/algoOrders', {
          time: new Date().toISOString(),
          accountId: row.accountId || row.account,
          account: row.accountId || row.account,
          accountName: row.account,
          groupId: row.groupId || orderForm.value.account || '',
          symbol: row.symbol,
          type: row.side,
          side: row.side === '卖出' ? 'SELL' : 'BUY',
          price: Number(row.rawPrice ?? row.price) || 0,
          quantity: Number(row.rawQty ?? row.qty) || 0,
          amount: Number(row.rawAmount ?? row.amount) || 0,
          market: '沪深市场',
          orderType: '限价',
          status: '已报',
          source: 'algo-multi-confirm',
          algoType: row.algoType,
          algoInstance: row.algoInstance,
          startTime: row.startTime,
          endTime: row.endTime,
          strategy: row.strategy,
          distribution: row.distribution,
        })
      )
    );
    const ids = toConfirm.map((row) => row.id).filter(Boolean);
    if (ids.length) {
      await Promise.all(
        ids.map((id) => axios.delete(jsBase + '/algoBuys/' + id))
      );
    }
    ElMessage.success('已确认并生成委托');
    await refreshOrders();
    await refreshPreview();
  } catch (error) {
    console.error('确认失败: ', error);
    ElMessage.error('确认失败，请检查 json-server');
  }
};

onMounted(() => {
  fetchAccountGroups();
  fetchStockAccounts();
  refreshPreview();
  refreshOrders();
});
</script>

<style scoped>
/* 页面骨架与布局：统一为组件内样式（不依赖全局） */
.nt-page {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 97%;
  /* min-height: 0; */
}
.nt-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch;
  /* min-height: 220px; */
}

/* 卡片面板 */
.pane {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}
.pane-header {
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4%;
}
.pane-header .title {
  font-weight: 600;
  color: #303133;
}
.pane-body {
  flex: 1;
  min-height: 0;
}
.scroll-y {
  overflow-y: auto;
}

/* 表格横向溢出支持 */
.scroll-x :deep(.el-table),
.scroll-x :deep(.el-table-v2) {
  min-width: 900px;
}

/* 行情样式 */
.market-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 10px;
}
.market-head .name {
  font-size: 14px;
  color: #606266;
}
.market-head .code {
  font-size: 12px;
  color: #909399;
}
.market-head .price {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}
.market-head .delta {
  font-size: 12px;
}
.market-head .delta.up {
  color: #2ecb70;
}
.market-head .delta.down {
  color: #ff6b6b;
}
.market-table {
  padding: 0 10px 10px;
}
.market-table table {
  width: 100%;
  border-collapse: collapse;
}
.market-table td {
  padding: 6px 4px;
  font-size: 12px;
}
.market-table .side {
  width: 42px;
  color: #8a9098;
}
.market-table .price {
  width: 70px;
  font-weight: 600;
}
.market-table .price.buy {
  color: #2ecb70;
}
.market-table .price.sell {
  color: #ff6b6b;
}
.market-table .sep td {
  height: 6px;
  border-top: 1px dashed #ebeef5;
}
.market-table .vol {
  text-align: right;
  color: #606266;
}

/* 所有顶部面板保持统一高度 */
.pane-market .pane-body,
.pane-algo-trade .pane-body,
.pane-algo-params .pane-body,
.pane-preview .pane-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px; /* 给栅格留一些外边距 */
}
.quick-ops {
  display: flex;
  gap: 6px;
}

/* 横向溢出时使用滚动条 */
.scroll-x :deep(.el-table),
.scroll-x :deep(.el-table-v2) {
  min-width: 900px;
}

/* 修复查询面板标签切换时的抖动问题 */
.pane-query .el-tabs__content {
  /* 固定标签页内容区域的最小高度，防止不同标签页高度不一致导致抖动 */
  min-height: 300px;
  max-height: 450px;
  overflow: visible;
}

.pane-query .pane-body {
  overflow: visible;
  max-height: 500px;
}

.pane-query .el-tab-pane {
  overflow: visible;
  height: auto;
  max-height: 400px;
}

/* 稳定滚动条布局 - 只在表格容器内滚动 */
.scroll-x {
  /* 始终为滚动条预留空间，避免滚动条出现/消失时的布局变化 */
  overflow-x: auto;
  overflow-y: auto;
  scrollbar-gutter: stable;
  max-height: 350px;
}

/* 确保虚拟滚动表格容器有独立的滚动 */
.scroll-x .virtual-scroll-container {
  overflow: auto;
}

/* 限制普通表格的高度 */
.scroll-x .el-table {
  max-height: 300px;
}

/* 本页：四列布局 - 行情、算法交易、算法参数设置、预览 */
.nt-page .nt-top {
  grid-template-columns: 1.5fr 3fr;
}

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

/* 行情合计样式 */
.preview-summary {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
  color: #606266;
  margin-top: auto; /* 推到底部 */
}

.preview-summary .mono {
  font-family: 'Consolas', 'Monaco', monospace;
  font-weight: 600;
}

.sub-title {
  margin: 6px 0 8px;
  font-weight: 600;
}
.time-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.qty-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 统一清除顶部 Tabs Header 的外边距（仅作用于本页） */
.pane-query :deep(.el-tabs__header.is-top) {
  margin: 0 !important;
}

/* 表格容器样式 */
.table-container {
  height: 200px;
  overflow-y: auto;
}

.table-container :deep(.el-table__body-wrapper) {
  max-height: none !important;
}

/* 虚拟滚动样式（委托）- 对齐普通交易界面 */
.order-virtual-list {
  height: 17em;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.virtual-table-header {
  position: relative;
  z-index: 10;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.virtual-scroll-container {
  flex: 1;
  width: 100%;
  overflow: auto;
  min-height: 200px;
  max-height: 360px;
}

.virtual-scroll-content {
  position: relative;
  width: 100%;
}

.virtual-scroll-viewport {
  position: relative;
}

.virtual-table-row {
  display: flex;
  width: 100%;
  min-width: 1200px;
  height: 35px;
  align-items: center;
  border-bottom: 1px solid #f2f6fc;
}

.virtual-table-row.header-row {
  background: #fafafa;
  font-weight: 600;
  color: #909399;
  height: 40px;
}

.virtual-table-row.data-row:hover {
  background: #f5f7fa;
}

.virtual-table-row.row-even {
  background: #fafafa;
}

.virtual-table-row.row-even:hover {
  background: #f0f2f5;
}

.virtual-table-cell {
  padding: 0 12px;
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-right: 1px solid #ebeef5;
}

.virtual-table-cell:last-child {
  border-right: none;
}

.buy-type {
  color: #f56c6c;
  font-weight: 600;
}

.sell-type {
  color: #67c23a;
  font-weight: 600;
}

.status-pending {
  color: #e6a23c;
}

.status-filled {
  color: #67c23a;
}

.status-cancelled {
  color: #f56c6c;
}
</style>
