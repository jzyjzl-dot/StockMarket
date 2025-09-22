<template>
  <div class="nt-page">
    <div class="nt-top">
      <!-- 行情（可按需启用） -->
      <section v-if="false" class="pane pane-market">
        <header class="pane-header"><div class="title">行情</div></header>
        <div class="pane-body scroll-y">
          <div class="market-head">
            <div class="stock">
              <div class="name">{{ t0Stock.name }}</div>
              <div class="code">{{ t0Stock.code }}</div>
            </div>
            <div class="price-box">
              <div class="price">{{ t0Stock.price.toFixed(2) }}</div>
              <div
                class="delta"
                :class="{ up: t0Stock.change >= 0, down: t0Stock.change < 0 }"
              >
                <span
                  >{{ t0Stock.change >= 0 ? '+' : ''
                  }}{{ t0Stock.change.toFixed(2) }}</span
                >
                <span>({{ (t0Stock.changePct * 100).toFixed(2) }}%)</span>
              </div>
            </div>
          </div>
          <div class="market-table">
            <table>
              <tbody>
                <tr v-for="(row, idx) in t0MarketRows" :key="'ask-' + idx">
                  <td class="side sell">卖{{ 10 - idx }}</td>
                  <td class="price sell">{{ row.ask.price.toFixed(2) }}</td>
                  <td class="vol">{{ row.ask.vol }}</td>
                </tr>
                <tr class="sep">
                  <td colspan="3"></td>
                </tr>
                <tr v-for="(row, idx) in t0MarketRows" :key="'bid-' + idx">
                  <td class="side buy">买{{ idx + 1 }}</td>
                  <td class="price buy">{{ row.bid.price.toFixed(2) }}</td>
                  <td class="vol">{{ row.bid.vol }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="preview-summary">
            <span>合计</span>
            <span class="mono">{{ t0TotalPrice.toFixed(2) }}</span>
            <span class="mono">{{ t0TotalAvailable.toFixed(2) }}</span>
            <span class="mono">0</span>
          </div>
        </div>
      </section>

      <!-- T0策略交易 -->
      <section class="pane pane-algo-trade">
        <header class="pane-header"><div class="title">T0策略交易</div></header>
        <div class="pane-body scroll-y">
          <el-form :model="t0OrderForm" label-width="60px" size="small">
            <el-form-item label="委托账户">
              <el-select v-model="t0OrderForm.account" style="width: 100%">
                <el-option
                  v-for="g in t0AccountGroups"
                  :key="g.id"
                  :label="g.name"
                  :value="g.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="委托方式">
              <el-select
                v-model="t0OrderForm.entrustMethod"
                style="width: 100%"
              >
                <el-option label="股票" value="stock" />
                <el-option label="债券" value="bond" />
                <el-option label="基金" value="fund" />
              </el-select>
            </el-form-item>
            <el-form-item label="证券代码">
              <el-input
                v-model="t0OrderForm.symbol"
                placeholder="如600000"
                style="width: 70%"
              >
              </el-input>
            </el-form-item>
            <el-form-item label="算法实例">
              <el-select v-model="t0OrderForm.algoInstance" style="width: 100%">
                <el-option label="KT_10" value="KT_10" />
                <el-option label="KT_20" value="KT_20" />
                <el-option label="KT_30" value="KT_30" />
              </el-select>
            </el-form-item>
            <el-form-item label="算法时间">
              <el-time-picker
                v-model="t0OrderForm.businessHours"
                is-range
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="买入方向">
              <el-select v-model="t0OrderForm.buyDirection" style="width: 100%">
                <el-option label="普通买入" value="normal_buy" />
                <el-option label="融资买入" value="margin_buy" />
              </el-select>
            </el-form-item>
            <el-form-item label="卖出方向">
              <el-select
                v-model="t0OrderForm.sellDirection"
                style="width: 100%"
              >
                <el-option label="普通卖出" value="normal_sell" />
                <el-option label="融券卖出" value="short_sell" />
              </el-select>
            </el-form-item>
            <el-form-item label="委托策略">
              <el-select v-model="t0OrderForm.strategy" style="width: 100%">
                <el-option label="固定数量" value="fixedQty" />
                <el-option label="固定金额" value="fixedAmt" />
                <el-option label="百分比" value="percentage" />
              </el-select>
            </el-form-item>
            <el-form-item label="任务数量">
              <div class="qty-row">
                <el-input-number
                  v-model="t0OrderForm.qty"
                  :min="0"
                  :step="100"
                  style="flex: 1"
                />
                <span>股</span>
                <el-button size="small" style="margin-left: 8px">+</el-button>
                <el-button size="small">-</el-button>
              </div>
            </el-form-item>
            <el-form-item label="分配方式">
              <el-select v-model="t0OrderForm.distribution" style="width: 100%">
                <el-option label="每客户固定数量" value="eachFixedQty" />
                <el-option label="按可用资金比例" value="byProportion" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                style="width: 100%"
                @click="t0PlaceOrder"
              >
                下达策略
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- T0参数设置 -->
      <section class="pane pane-algo-params">
        <header class="pane-header"><div class="title">T0参数设置</div></header>
        <div class="pane-body scroll-y">
          <el-form :model="t0Params" label-width="80px" size="small">
            <el-form-item label="篮子编号">
              <el-input v-model="t0Params.basketNo" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="外部编号">
              <el-input v-model="t0Params.externalNo" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="风险敞口">
              <el-select v-model="t0Params.riskExposure" style="width: 100%">
                <el-option label="低风险" value="low" />
                <el-option label="中风险" value="medium" />
                <el-option label="高风险" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <div style="display: flex; align-items: center">
                <el-checkbox v-model="t0Params.execAfterExpire">
                  过期后执行
                </el-checkbox>
                <el-icon style="margin-left: 8px; color: #999">
                  <QuestionFilled />
                </el-icon>
              </div>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="t0Params.executeImmediately">
                立即交易
              </el-checkbox>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- 预览（多账号逐行） -->
      <section class="pane pane-preview">
        <header class="pane-header">
          <div class="title">预览</div>
          <div class="sub">
            账户数：{{ t0PreviewAccountCount }} 委托笔数：{{
              t0PreviewRows.length
            }}
          </div>
        </header>
        <div class="pane-body">
          <div class="scroll-x">
            <el-table
              v-resizable-columns
              :data="t0PreviewRows"
              size="small"
              style="width: 100%"
              max-height="350px"
              @selection-change="t0OnSelectionChange"
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
            <span class="mono">{{ t0TotalPrice.toFixed(2) }}</span>
            <span class="mono">{{ t0TotalAvailable.toFixed(2) }}</span>
            <span class="mono">0</span>
            <el-button
              type="primary"
              size="small"
              :disabled="t0SelectedRows.length === 0"
              @click="t0ConfirmSelected"
              >确认</el-button
            >
          </div>
        </div>
      </section>
    </div>

    <!-- 查询（与算法多账号同布局，但使用T0数据源） -->
    <section class="pane pane-query" style="margin-top: 12px">
      <header class="pane-header"><div class="title">查询</div></header>
      <div class="pane-body">
        <el-tabs v-model="t0ActiveTab" type="card" class="nt-tabs">
          <el-tab-pane label="资金" name="fund">
            <div class="scroll-x">
              <el-table
                v-resizable-columns
                :data="t0FundRows"
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
                :data="t0PositionRows"
                size="small"
                style="width: 100%"
              >
                <el-table-column
                  prop="stockCode"
                  label="证券代码"
                  width="120"
                />
                <el-table-column prop="qty" label="数量" width="100" />
                <el-table-column prop="price" label="成本价" width="100" />
                <el-table-column prop="pnl" label="盈亏" width="100" />
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
                ref="t0VirtualScrollContainer"
                class="virtual-scroll-container"
                @scroll="t0HandleScroll"
              >
                <!-- 虚拟滚动内容 -->
                <div
                  class="virtual-scroll-content"
                  :style="{ height: t0TotalHeight + 'px' }"
                >
                  <div
                    class="virtual-scroll-viewport"
                    :style="{ transform: `translateY(${t0StartOffset}px)` }"
                  >
                    <!-- 可见行 -->
                    <div class="virtual-table-body">
                      <div
                        v-for="(item, index) in t0VisibleItems"
                        :key="item.id || `${t0StartIndex + index}`"
                        class="virtual-table-row data-row"
                        :class="{
                          'row-even': (t0StartIndex + index) % 2 === 0,
                        }"
                      >
                        <div class="virtual-table-cell" style="width: 100px">
                          {{ item.account }}
                        </div>
                        <div class="virtual-table-cell" style="width: 160px">
                          {{ t0FormatTime(item.time) }}
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
                          <span :class="t0GetStatusClass(item.status)">{{
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
                :data="t0DealRows"
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
import { QuestionFilled } from '@element-plus/icons-vue';
import axios from 'axios';

const t0Stock = ref({
  name: '示例股票',
  code: '600000',
  price: 7.49,
  change: 0.01,
  changePct: 0.0013,
});
const t0MarketRows = ref(
  Array.from({ length: 10 }).map((_, i) => ({
    ask: { price: 7.6 - i * 0.01, vol: 2000 + i * 100 },
    bid: { price: 7.46 - i * 0.01, vol: 1800 + i * 100 },
  }))
);

const t0OrderForm = ref({
  account: null,
  entrustMethod: 'stock',
  symbol: '600000',
  algoInstance: 'KT_10',
  businessHours: ['09:30:00', '14:57:00'],
  buyDirection: 'normal_buy',
  sellDirection: 'normal_sell',
  strategy: 'fixedQty',
  qty: 1000,
  distribution: 'eachFixedQty',
});
const t0Params = ref({
  basketNo: '',
  externalNo: '',
  riskExposure: 'medium',
  execAfterExpire: false,
  executeImmediately: false,
});

const jsBase = import.meta.env.VITE_JSON_SERVER_BASE || 'http://localhost:3004';

const t0PreviewRows = ref([]);
const t0SelectedRows = ref([]);
const t0OrderRows = ref([]);
const stockAccounts = ref([]);
const t0AccountGroups = ref([]);

const t0OnSelectionChange = (rows) => {
  t0SelectedRows.value = rows || [];
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
  const groupId = t0OrderForm.value.account?.toString() ?? '';
  return accountsByGroup.value.get(groupId) ?? [];
});

const ensureGroupSelection = () => {
  const current = t0OrderForm.value.account?.toString() ?? '';
  if (current && accountsByGroup.value.has(current)) {
    return;
  }
  const firstWithAccounts = t0AccountGroups.value.find((group) => {
    const list = accountsByGroup.value.get(group.id) ?? [];
    return list.length > 0;
  });
  if (firstWithAccounts) {
    t0OrderForm.value.account = firstWithAccounts.id;
    return;
  }
  if (t0AccountGroups.value.length) {
    t0OrderForm.value.account = t0AccountGroups.value[0].id;
  } else {
    t0OrderForm.value.account = null;
  }
};

// const t0SelectedAccountIds = computed(() => {
//   return selectedGroupAccounts.value.map((account) => account.id ?? '');
// });

const t0BuildPreviewRows = () => {
  const accounts = selectedGroupAccounts.value;
  if (!accounts.length) {
    return [];
  }
  const qty = Number(t0OrderForm.value.qty) || 0;
  const price = Number(t0Stock.value.price) || 0;
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
      symbol: t0OrderForm.value.symbol,
      side: '买入',
      qty,
      price: price ? price.toFixed(2) : '-',
      amount: amount ? amount.toFixed(2) : '-',
      available: availableFunds.toFixed(2),
      buyable,
      rawPrice: price,
      rawQty: qty,
      rawAmount: amount,
    };
  });
};

const t0PreviewAccountCount = computed(() => {
  const set = new Set(
    t0PreviewRows.value.map((row) => row.accountId ?? row.account)
  );
  return set.size;
});

const t0TotalPrice = computed(() => {
  return t0PreviewRows.value.reduce(
    (sum, row) => sum + (Number(row.rawAmount ?? row.amount) || 0),
    0
  );
});

const t0TotalAvailable = computed(() => {
  return selectedGroupAccounts.value.reduce((sum, account) => {
    return sum + Number(account.availableFunds ?? account.balance ?? 0);
  }, 0);
});

const t0ActiveTab = ref('order');
const t0FundRows = computed(() =>
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
const t0PositionRows = ref([]);
const t0DealRows = ref([]);

const fetchT0AccountGroups = async () => {
  try {
    const { data } = await axios.get(jsBase + '/accountGroups');
    if (Array.isArray(data)) {
      t0AccountGroups.value = data.map((group) => ({
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
      t0AccountGroups.value = [];
    }
  } catch (error) {
    console.warn('加载T0账户组失败: ', error?.message || error);
    t0AccountGroups.value = [];
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

const mapToT0PreviewRow = (item) => {
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
    groupId: item.groupId || t0OrderForm.value.account?.toString() || '',
    symbol: item.symbol,
    side: '买入',
    qty: qtyNum,
    price: priceNum ? priceNum.toFixed(2) : '-',
    amount: amountNum ? amountNum.toFixed(2) : '-',
    available: availableNum ? availableNum.toFixed(2) : '-',
    buyable: Math.floor(availableNum / (priceNum || 1) / 100) * 100,
    rawPrice: priceNum,
    rawQty: qtyNum,
    rawAmount: amountNum,
  };
};

const t0RefreshPreview = async () => {
  try {
    const { data } = await axios.get(jsBase + '/t0Buys');
    if (Array.isArray(data)) {
      t0PreviewRows.value = data.map(mapToT0PreviewRow);
    } else {
      t0PreviewRows.value = [];
    }
  } catch (error) {
    console.warn('加载 T0 buys 失败: ', error?.message || error);
  }
};

const t0RefreshOrders = async () => {
  try {
    const { data } = await axios.get(jsBase + '/t0Orders');
    if (Array.isArray(data)) {
      t0OrderRows.value = data.map((o) => ({
        id: o.id,
        accountId: o.accountId || o.account || '',
        account: o.accountName || o.account || o.accountId || '资金账号',
        time: o.time || o.order_time || o.timestamp || new Date().toISOString(),
        stockCode: o.symbol,
        type: o.type || (o.side === 'SELL' ? '卖出' : '买入'),
        price: Number(o.price) || 0,
        quantity: Number(o.quantity ?? o.qty ?? 0) || 0,
        dealt: Number(o.dealt ?? 0) || 0,
        amount: Number(o.amount) || 0,
        market: o.market || '沪深市场',
        orderType: o.orderType || '限价',
        status: o.status || '已报',
      }));
    } else {
      t0OrderRows.value = [];
    }
  } catch (error) {
    console.warn('加载 T0 orders 失败: ', error?.message || error);
  }
};

const t0PlaceOrder = async () => {
  if (
    !t0OrderForm.value.symbol ||
    !t0OrderForm.value.qty ||
    !t0OrderForm.value.account
  ) {
    ElMessage.warning('请完善下单信息并选择账户组');
    return;
  }
  const newRows = t0BuildPreviewRows();
  if (!newRows.length) {
    ElMessage.warning('所选账户组暂无资金账号');
    return;
  }
  try {
    await Promise.all(
      newRows.map((row) =>
        axios.post(jsBase + '/t0Buys', {
          buyTime: new Date().toISOString(),
          accountId: row.accountId,
          account: row.accountId,
          accountName: row.account,
          groupId: row.groupId,
          entrustMethod: t0OrderForm.value.entrustMethod,
          symbol: row.symbol,
          price: row.rawPrice || Number(t0Stock.value.price) || 0,
          qty: row.rawQty || Number(t0OrderForm.value.qty) || 0,
          amount: row.rawAmount || 0,
          algoInstance: t0OrderForm.value.algoInstance,
          strategy: t0OrderForm.value.strategy,
          distribution: t0OrderForm.value.distribution,
          basketNo: t0Params.value.basketNo,
          externalNo: t0Params.value.externalNo,
          riskExposure: t0Params.value.riskExposure,
          execAfterExpire: t0Params.value.execAfterExpire,
          executeImmediately: t0Params.value.executeImmediately,
          businessStartTime: t0OrderForm.value.businessHours?.[0] ?? null,
          businessEndTime: t0OrderForm.value.businessHours?.[1] ?? null,
          buyDirection: t0OrderForm.value.buyDirection,
          sellDirection: t0OrderForm.value.sellDirection,
        })
      )
    );
    ElMessage.success('T0 订单已导入预览，等待确认');
    await t0RefreshPreview();
  } catch (error) {
    console.error('提交 T0 订单失败: ', error);
    ElMessage.error('提交 T0 订单失败，请检查服务端');
  }
};

const t0ConfirmSelected = async () => {
  if (!t0SelectedRows.value.length) {
    ElMessage.warning('请先选择要确认的预览数据');
    return;
  }
  try {
    const selectedIds = t0SelectedRows.value
      .map((row) => row.id)
      .filter(Boolean);

    if (!selectedIds.length) {
      ElMessage.warning('暂无可确认的预览记录');
      return;
    }

    await axios.post(jsBase + '/t0Orders/confirmFromBuys', {
      buyIds: selectedIds,
    });

    ElMessage.success('T0 订单已确认并转入委托');
    await t0RefreshPreview();
    await t0RefreshOrders();
    t0SelectedRows.value = [];
  } catch (error) {
    console.error('确认 T0 订单失败: ', error);
    ElMessage.error(
      '确认 T0 订单失败: ' +
        (error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message)
    );
  }
};

const t0VirtualScrollContainer = ref();
const t0ItemHeight = 35;
const t0ContainerHeight = 400;
const t0VisibleCount = Math.ceil(t0ContainerHeight / t0ItemHeight);
const t0BufferSize = 5;
const t0ScrollTop = ref(0);
const t0StartIndex = computed(() =>
  Math.max(0, Math.floor(t0ScrollTop.value / t0ItemHeight) - t0BufferSize)
);
const t0EndIndex = computed(() =>
  Math.min(
    t0OrderRows.value.length - 1,
    t0StartIndex.value + t0VisibleCount + t0BufferSize * 2
  )
);
const t0VisibleItems = computed(() =>
  t0OrderRows.value.slice(t0StartIndex.value, t0EndIndex.value + 1)
);
const t0TotalHeight = computed(() => t0OrderRows.value.length * t0ItemHeight);
const t0StartOffset = computed(() => t0StartIndex.value * t0ItemHeight);
const t0HandleScroll = (event) => {
  t0ScrollTop.value = event.target.scrollTop;
};

const t0FormatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return String(time);
  return date.toLocaleString('zh-CN', { hour12: false });
};

const t0GetStatusClass = (status) => {
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

onMounted(async () => {
  await fetchT0AccountGroups();
  await fetchStockAccounts();
  await t0RefreshPreview();
  await t0RefreshOrders();
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
  grid-template-columns: 1fr 1fr 3fr;
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
  grid-template-columns: 1fr 1fr 3fr;
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

.status-pending { color: #e6a23c; } .status-filled { color: #67c23a; }
.status-cancelled { color: #f56c6c; }
