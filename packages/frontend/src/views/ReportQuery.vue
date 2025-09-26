<template>
  <div class="report-query">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报表查询</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 资金查询 -->
        <el-tab-pane label="资金查询" name="funds">
          <div class="query-section">
            <div class="funds-toolbar">
              <el-form :inline="true" :model="fundsForm" class="query-form">
                <el-form-item label="资金账号">
                  <el-select
                    v-model="fundsForm.fundAccount"
                    placeholder="选择资金账号"
                    clearable
                    filterable
                    style="width: 180px"
                  >
                    <el-option
                      v-for="item in fundAccountOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="账户名称">
                  <el-select
                    v-model="fundsForm.accountName"
                    placeholder="选择账户名称"
                    clearable
                    filterable
                    style="width: 180px"
                  >
                    <el-option
                      v-for="item in accountNameOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="fundsLoading"
                    @click="queryFunds"
                  >
                    查询
                  </el-button>
                  <el-button :disabled="fundsLoading" @click="resetFunds">
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
              <el-button
                type="success"
                :disabled="fundsData.length === 0"
                :loading="fundsExporting"
                @click="exportFunds"
              >
                导出数据
              </el-button>
            </div>

            <el-table
              :data="fundsData"
              style="width: 100%"
              stripe
              border
              :loading="fundsLoading"
              empty-text="暂无资金数据"
            >
              <el-table-column
                prop="fundAccount"
                label="资金账号"
                min-width="140"
              />
              <el-table-column
                prop="accountName"
                label="账户名称"
                min-width="140"
              />
              <el-table-column label="币种类别" min-width="120">
                <template #default="scope">
                  {{ currencyLabel(scope.row.currency) }}
                </template>
              </el-table-column>
              <el-table-column label="资金余额" min-width="140" align="right">
                <template #default="scope">
                  {{ formatAmount(scope.row.balance) }}
                </template>
              </el-table-column>
              <el-table-column
                label="子单可用资金"
                min-width="150"
                align="right"
              >
                <template #default="scope">
                  {{ formatAmount(scope.row.subAvailable) }}
                </template>
              </el-table-column>
              <el-table-column
                label="母单可用资金"
                min-width="150"
                align="right"
              >
                <template #default="scope">
                  {{ formatAmount(scope.row.masterAvailable) }}
                </template>
              </el-table-column>
              <el-table-column label="总资产" min-width="140" align="right">
                <template #default="scope">
                  {{ formatAmount(scope.row.totalAsset) }}
                </template>
              </el-table-column>
              <el-table-column label="总市值" min-width="140" align="right">
                <template #default="scope">
                  {{ formatAmount(scope.row.marketValue) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 持仓查询 -->
        <el-tab-pane label="持仓查询" name="positions">
          <div class="query-section">
            <el-form :inline="true" :model="positionsForm" class="query-form">
              <el-form-item label="股票代码">
                <el-input
                  v-model="positionsForm.stockCode"
                  placeholder="输入股票代码"
                  clearable
                />
              </el-form-item>
              <el-form-item label="账户">
                <el-select
                  v-model="positionsForm.account"
                  placeholder="选择账户"
                  clearable
                >
                  <el-option
                    v-for="account in accounts"
                    :key="account.id"
                    :label="account.name"
                    :value="account.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="盈亏状态">
                <el-select
                  v-model="positionsForm.profitStatus"
                  placeholder="选择盈亏状态"
                  clearable
                >
                  <el-option label="盈利" value="profit" />
                  <el-option label="亏损" value="loss" />
                  <el-option label="平衡" value="break-even" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryPositions"
                  >查询</el-button
                >
                <el-button @click="resetPositions">重置</el-button>
              </el-form-item>
            </el-form>

            <el-table :data="positionsData" style="width: 100%" stripe>
              <el-table-column prop="stockCode" label="股票代码" />
              <el-table-column prop="stockName" label="股票名称" />
              <el-table-column prop="account" label="账户" />
              <el-table-column prop="quantity" label="持仓数量" />
              <el-table-column prop="avgPrice" label="平均成本" />
              <el-table-column prop="currentPrice" label="当前价格" />
              <el-table-column prop="profit" label="盈亏">
                <template #default="scope">
                  <span
                    :class="{
                      'profit-positive': +scope.row.profit > 0,
                      'profit-negative': +scope.row.profit < 0,
                    }"
                  >
                    {{ scope.row.profit }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 委托查询（虚拟表格） -->
        <el-tab-pane label="委托查询" name="orders">
          <div class="query-section">
            <el-form :inline="true" :model="ordersForm" class="query-form">
              <el-form-item label="交易方式">
                <el-select
                  v-model="ordersForm.tradeType"
                  placeholder="选择交易方式"
                  clearable
                  style="width: 180px"
                  popper-class="wide-dropdown"
                >
                  <el-option label="全部" value="all" />
                  <el-option label="普通交易" value="normal" />
                  <el-option label="多账号算法交易" value="algo" />
                  <el-option label="T0策略交易" value="t0" />
                </el-select>
              </el-form-item>
              <el-form-item label="股票代码">
                <el-input
                  v-model="ordersForm.stockCode"
                  placeholder="输入股票代码"
                  clearable
                  style="width: 150px"
                />
              </el-form-item>
              <el-form-item label="委托类型">
                <el-select
                  v-model="ordersForm.orderType"
                  placeholder="选择委托类型"
                  clearable
                  style="width: 150px"
                  popper-class="wide-dropdown"
                >
                  <el-option label="买入" value="buy" />
                  <el-option label="卖出" value="sell" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select
                  v-model="ordersForm.status"
                  placeholder="选择状态"
                  clearable
                  style="width: 150px"
                  popper-class="wide-dropdown"
                >
                  <el-option label="已报" value="pending" />
                  <el-option label="部分成交" value="partial" />
                  <el-option label="全部成交" value="filled" />
                  <el-option label="已撤销" value="cancelled" />
                  <el-option label="已完成" value="completed" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="showHistoryQuery" label="日期范围">
                <el-date-picker
                  v-model="ordersForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <div style="display: flex; justify-content: flex-end">
                <el-form-item>
                  <el-button type="primary" @click="queryOrders"
                    >查询</el-button
                  >
                  <el-button @click="resetOrders">重置</el-button>
                  <el-button
                    type="success"
                    :disabled="ordersData.length === 0"
                    @click="exportOrders"
                  >
                    委托导出
                  </el-button>
                  <el-button
                    v-if="!showHistoryQuery"
                    type="info"
                    @click="toggleHistoryQuery"
                  >
                    历史报表
                  </el-button>
                  <el-button
                    v-if="showHistoryQuery"
                    type="warning"
                    @click="toggleHistoryQuery"
                  >
                    当日报表
                  </el-button>
                </el-form-item>
              </div>
            </el-form>

            <div class="orders-table-wrap">
              <el-auto-resizer v-slot="{ height, width }">
                <el-table-v2
                  :columns="ordersColumns"
                  :data="ordersData"
                  :row-key="'orderId'"
                  :height="ordersTableHeight || height"
                  :width="width"
                  class="orders-virtual-table"
                />
              </el-auto-resizer>
            </div>
          </div>
        </el-tab-pane>

        <!-- 成交查询 -->
        <el-tab-pane label="成交查询" name="deals">
          <div class="query-section">
            <el-form :inline="true" :model="dealsForm" class="query-form">
              <el-form-item label="股票代码">
                <el-input
                  v-model="dealsForm.stockCode"
                  placeholder="输入股票代码"
                  clearable
                />
              </el-form-item>
              <el-form-item label="成交类型">
                <el-select
                  v-model="dealsForm.dealType"
                  placeholder="选择成交类型"
                  clearable
                >
                  <el-option label="买入" value="buy" />
                  <el-option label="卖出" value="sell" />
                </el-select>
              </el-form-item>
              <el-form-item label="账户">
                <el-select
                  v-model="dealsForm.account"
                  placeholder="选择账户"
                  clearable
                >
                  <el-option
                    v-for="account in accounts"
                    :key="account.id"
                    :label="account.name"
                    :value="account.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="日期范围">
                <el-date-picker
                  v-model="dealsForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryDeals">查询</el-button>
                <el-button @click="resetDeals">重置</el-button>
              </el-form-item>
            </el-form>

            <el-table :data="dealsData" style="width: 100%" stripe>
              <el-table-column prop="dealId" label="成交编号" />
              <el-table-column prop="stockCode" label="股票代码" />
              <el-table-column prop="stockName" label="股票名称" />
              <el-table-column prop="dealType" label="成交类型">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.dealType === '买入' ? 'success' : 'danger'"
                    >{{ scope.row.dealType }}</el-tag
                  >
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="成交数量" />
              <el-table-column prop="price" label="成交价格" />
              <el-table-column prop="amount" label="成交金额" />
              <el-table-column prop="time" label="成交时间" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, h, onMounted } from 'vue';
import { ElMessage, ElTag } from 'element-plus';
import { tradingAPI } from '@/utils/api';
import * as XLSX from 'xlsx';

const activeTab = ref('funds');

// 账户数据（示例）
const defaultAccounts = [
  { id: '001', name: '主账户' },
  { id: '002', name: '子账户A' },
  { id: '003', name: '子账户B' },
];
const accounts = ref([...defaultAccounts]);

const loadAccounts = async () => {
  try {
    const data = await tradingAPI.getStockAccounts();
    if (Array.isArray(data) && data.length) {
      accounts.value = data.map((item, index) => {
        const fallbackId =
          item.id ??
          item.accountNumber ??
          item.account_number ??
          item.accountName ??
          item.account_name ??
          `account-${index}`;

        const nameSource =
          item.accountName ||
          item.account_name ||
          item.accountNumber ||
          item.account_number ||
          item.id ||
          fallbackId;

        return {
          id: fallbackId.toString(),
          name: nameSource.toString(),
        };
      });
    }
  } catch (error) {
    console.warn('加载账户列表失败:', error);
  }
};

// 资金查询
const fundsForm = reactive({
  fundAccount: '',
  accountName: '',
});
const fundsData = ref([]);
const fundsLoading = ref(false);
const fundsExporting = ref(false);
const fundAccountOptions = ref([]);
const accountNameOptions = ref([]);
const allFundsRows = ref([]);

// 持仓查询
const positionsForm = reactive({
  stockCode: '',
  account: '',
  profitStatus: '',
});
const positionsData = ref([]);

// 委托查询
const ordersForm = reactive({
  tradeType: 'all',
  stockCode: '',
  orderType: '',
  status: '',
  dateRange: [],
});
const ordersData = ref([]);
const showHistoryQuery = ref(false); // 控制历史报表查询的显示

// 成交查询
const dealsForm = reactive({
  stockCode: '',
  dealType: '',
  account: '',
  dateRange: [],
});
const dealsData = ref([]);

const handleTabClick = (tab) => {
  console.log('切换到:', tab.props.name);
};

const formatAmount = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const currencyLabel = (currency) => {
  if (!currency) return '--';
  const normalized = String(currency).trim().toUpperCase();
  const labelMap = {
    CNY: '人民币',
    RMB: '人民币',
    USD: '美元',
    HKD: '港币',
    JPY: '日元',
  };
  return labelMap[normalized] || currency;
};

const updateFundOptions = (rows) => {
  const accountSet = new Set();
  const nameSet = new Set();
  rows.forEach((row) => {
    if (!row) return;
    if (row.fundAccount) {
      accountSet.add(row.fundAccount);
    }
    if (row.accountName) {
      nameSet.add(row.accountName);
    }
  });
  fundAccountOptions.value = Array.from(accountSet);
  accountNameOptions.value = Array.from(nameSet);
};

const buildFundFilters = () => {
  const filters = {};
  if (fundsForm.fundAccount) {
    filters.fundAccount = fundsForm.fundAccount;
  }
  if (fundsForm.accountName) {
    filters.accountName = fundsForm.accountName;
  }
  return filters;
};

const requestFunds = async (filters = {}, { silent = false } = {}) => {
  fundsLoading.value = true;
  try {
    const data = await tradingAPI.getAccountFunds(filters);
    fundsData.value = Array.isArray(data) ? data : [];
    const hasFilters = Object.keys(filters).length > 0;
    if (!hasFilters) {
      allFundsRows.value = [...fundsData.value];
      updateFundOptions(fundsData.value);
    }
    if (!silent) {
      const message =
        fundsData.value.length > 0
          ? '查询成功，共 ' + fundsData.value.length + ' 条资金记录'
          : '未查询到资金记录';
      ElMessage.success(message);
    }
  } catch (error) {
    console.error('获取资金数据失败:', error);
    ElMessage.error('获取资金数据失败，请稍后重试');
  } finally {
    fundsLoading.value = false;
  }
};

const queryFunds = () => requestFunds(buildFundFilters());

const resetFunds = async () => {
  fundsForm.fundAccount = '';
  fundsForm.accountName = '';
  if (allFundsRows.value.length) {
    fundsData.value = [...allFundsRows.value];
    updateFundOptions(allFundsRows.value);
    ElMessage.success('已重置资金查询条件');
    return;
  }
  await requestFunds({}, { silent: true });
  ElMessage.success('已重置资金查询条件');
};

const toNumber = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Number(num.toFixed(2));
};

const exportFunds = async () => {
  if (fundsData.value.length === 0) {
    ElMessage.warning('没有数据可导出');
    return;
  }

  fundsExporting.value = true;
  try {
    const exportRows = fundsData.value.map((row) => ({
      资金账号: row.fundAccount,
      账户名称: row.accountName,
      币种类别: currencyLabel(row.currency),
      资金余额: toNumber(row.balance),
      子单可用资金: toNumber(row.subAvailable),
      母单可用资金: toNumber(row.masterAvailable),
      总资产: toNumber(row.totalAsset),
      总市值: toNumber(row.marketValue),
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '资金查询');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const filename = '资金查询_' + dateStr + '_' + timeStr + '.xlsx';
    XLSX.writeFile(wb, filename);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('资金数据导出失败:', error);
    ElMessage.error('导出失败，请重试');
  } finally {
    fundsExporting.value = false;
  }
};

onMounted(() => {
  loadAccounts();
  requestFunds({}, { silent: true });
});

// 持仓查询示例
const queryPositions = async () => {
  ElMessage.success('持仓查询成功');
  positionsData.value = [
    {
      stockCode: '000001',
      stockName: '平安银行',
      account: '主账户',
      quantity: '1,000',
      avgPrice: '10.50',
      currentPrice: '11.20',
      profit: '+700.00',
    },
    {
      stockCode: '000002',
      stockName: '万科A',
      account: '主账户',
      quantity: '500',
      avgPrice: '15.80',
      currentPrice: '15.20',
      profit: '-300.00',
    },
  ];
};
const resetPositions = () => {
  positionsForm.stockCode = '';
  positionsForm.account = '';
  positionsForm.profitStatus = '';
  positionsData.value = [];
};

// 委托查询，支持过滤并写入虚拟表格数据源
const queryOrders = async () => {
  try {
    let allRows = [];

    // 根据交易方式获取不同数据源
    if (ordersForm.tradeType === 'all' || ordersForm.tradeType === 'normal') {
      // 普通交易订单
      try {
        const normalData = await tradingAPI.getNormalOrders();
        if (Array.isArray(normalData)) {
          const normalRows = normalData.map((o) => ({
            orderId: o.id,
            stockCode: o.symbol || o.stockCode,
            stockName: o.name || '-',
            orderType: o.type || (o.side === 'SELL' ? '卖出' : '买入'),
            quantity: o.quantity ?? o.qty ?? 0,
            price: o.price ?? 0,
            status: o.status || '-',
            time: o.time || o.timestamp || '-',
            tradeType: '普通交易',
            source: 'normal',
          }));
          allRows = allRows.concat(normalRows);
        }
      } catch (error) {
        console.warn('普通交易数据获取失败:', error);
      }
    }

    if (ordersForm.tradeType === 'all' || ordersForm.tradeType === 'algo') {
      // 多账号算法交易订单
      try {
        const algoData = await tradingAPI.getAlgoOrders();
        if (Array.isArray(algoData)) {
          const algoRows = algoData.map((o) => ({
            orderId: o.id,
            stockCode: o.symbol || o.stockCode,
            stockName: o.name || o.stockName || '-',
            orderType: o.type || o.side || '买入',
            quantity: o.quantity ?? o.qty ?? 0,
            price: o.price ?? 0,
            status: o.status || '-',
            time: o.time || o.timestamp || o.created_at || '-',
            tradeType: '多账号算法交易',
            source: 'algo',
            algoType: o.algo_type || '-',
            algoInstance: o.algo_instance || '-',
          }));
          allRows = allRows.concat(algoRows);
        }
      } catch (error) {
        console.warn('算法交易数据获取失败:', error);
      }
    }

    if (ordersForm.tradeType === 'all' || ordersForm.tradeType === 't0') {
      // T0策略交易订单
      try {
        const t0Data = await tradingAPI.getT0Orders();
        if (Array.isArray(t0Data)) {
          const t0Rows = t0Data.map((o) => ({
            orderId: o.id,
            stockCode: o.symbol || o.stockCode,
            stockName: o.name || o.stockName || '-',
            orderType: o.type || (o.side === 'BUY' ? '买入' : '卖出'),
            quantity: o.quantity ?? o.qty ?? 0,
            price: o.price ?? 0,
            status: o.status === 'pending' ? '待成交' : o.status || '-',
            time: o.orderTime || o.time || o.timestamp || o.createdAt || '-',
            tradeType: 'T0策略交易',
            source: 't0',
            algoInstance: o.algoInstance || '-',
          }));
          allRows = allRows.concat(t0Rows);
        }
      } catch (error) {
        console.warn('T0策略交易数据获取失败:', error);
      }
    }

    // 应用过滤条件
    const statusMap = {
      pending: '已报',
      partial: '部分成交',
      filled: '全部成交',
      cancelled: '已撤销',
      completed: '已完成',
    };
    const sideMap = { buy: 'BUY', sell: 'SELL' };

    let filteredRows = allRows;

    if (ordersForm.stockCode) {
      filteredRows = filteredRows.filter(
        (r) =>
          String(r.stockCode || '').includes(ordersForm.stockCode.trim()) ||
          String(r.stockName || '').includes(ordersForm.stockCode.trim())
      );
    }
    if (ordersForm.orderType) {
      const side = sideMap[ordersForm.orderType];
      filteredRows = filteredRows.filter((r) =>
        side === 'SELL' ? r.orderType === '卖出' : r.orderType === '买入'
      );
    }
    if (ordersForm.status) {
      const zh = statusMap[ordersForm.status] || ordersForm.status;
      filteredRows = filteredRows.filter((r) => r.status === zh);
    }

    // 日期过滤逻辑
    let dateRangeToUse = ordersForm.dateRange;
    if (!showHistoryQuery.value) {
      // 当日报表模式：使用当日日期范围
      const today = new Date().toISOString().split('T')[0];
      dateRangeToUse = [today, today];
    }

    if (Array.isArray(dateRangeToUse) && dateRangeToUse.length === 2) {
      const [start, end] = dateRangeToUse;
      const s = new Date(start);
      const e = new Date(end);
      e.setHours(23, 59, 59, 999); // 设置为当天的最后一刻
      filteredRows = filteredRows.filter((r) => {
        const t = new Date(r.time);
        return !isNaN(t) && t >= s && t <= e;
      });
    }

    ordersData.value = filteredRows;
    ElMessage.success(`委托查询成功，共找到 ${filteredRows.length} 条记录`);
  } catch (error) {
    console.error('委托查询失败:', error);
    ElMessage.error('委托查询失败，请检查后端 json-server');
    ordersData.value = [];
  }
};
const resetOrders = () => {
  ordersForm.tradeType = 'all';
  ordersForm.stockCode = '';
  ordersForm.orderType = '';
  ordersForm.status = '';
  ordersForm.dateRange = [];
  ordersData.value = [];
};

// 切换历史报表查询
const toggleHistoryQuery = () => {
  showHistoryQuery.value = !showHistoryQuery.value;
  // 如果切换到当日报表，清空日期范围并自动查询当日数据
  if (!showHistoryQuery.value) {
    ordersForm.dateRange = [];
    queryOrders();
  }
};

// 导出委托数据为Excel
const exportOrders = () => {
  if (ordersData.value.length === 0) {
    ElMessage.warning('没有数据可导出');
    return;
  }

  try {
    // 准备导出数据
    const exportData = ordersData.value.map((row) => ({
      委托编号: row.orderId,
      股票代码: row.stockCode,
      股票名称: row.stockName,
      交易方式: row.tradeType,
      委托类型: row.orderType,
      委托数量: row.quantity,
      委托价格: row.price,
      状态: row.status,
      委托时间: row.time,
    }));

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '委托查询');

    // 生成文件名
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const filename = `委托查询_${dateStr}_${timeStr}.xlsx`;

    // 下载文件
    XLSX.writeFile(wb, filename);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败，请重试');
  }
};

// 成交查询示例
const queryDeals = async () => {
  ElMessage.success('成交查询成功');
  dealsData.value = [
    {
      dealId: 'DEL001',
      stockCode: '000001',
      stockName: '平安银行',
      dealType: '买入',
      quantity: '1,000',
      price: '10.50',
      amount: '10,500.00',
      time: '2024-01-15 09:30:00',
    },
    {
      dealId: 'DEL002',
      stockCode: '000002',
      stockName: '万科A',
      dealType: '卖出',
      quantity: '500',
      price: '15.20',
      amount: '7,600.00',
      time: '2024-01-15 10:15:00',
    },
  ];
};
const resetDeals = () => {
  dealsForm.stockCode = '';
  dealsForm.dealType = '';
  dealsForm.account = '';
  dealsForm.dateRange = [];
  dealsData.value = [];
};

// 虚拟表格列 & 自适应尺寸
const ordersColumns = [
  { key: 'orderId', title: '委托编号', dataKey: 'orderId', width: 140 },
  { key: 'stockCode', title: '股票代码', dataKey: 'stockCode', width: 120 },
  { key: 'stockName', title: '股票名称', dataKey: 'stockName', width: 140 },
  {
    key: 'tradeType',
    title: '交易方式',
    dataKey: 'tradeType',
    width: 140,
    cellRenderer: ({ rowData }) =>
      h(
        ElTag,
        {
          type:
            rowData.tradeType === '普通交易'
              ? 'primary'
              : rowData.tradeType === '多账号算法交易'
                ? 'success'
                : 'warning',
        },
        () => rowData.tradeType
      ),
  },
  {
    key: 'orderType',
    title: '委托类型',
    dataKey: 'orderType',
    width: 120,
    cellRenderer: ({ rowData }) =>
      h(
        ElTag,
        { type: rowData.orderType === '买入' ? 'success' : 'danger' },
        () => rowData.orderType
      ),
  },
  { key: 'quantity', title: '委托数量', dataKey: 'quantity', width: 120 },
  { key: 'price', title: '委托价格', dataKey: 'price', width: 120 },
  {
    key: 'status',
    title: '状态',
    dataKey: 'status',
    width: 120,
    cellRenderer: ({ rowData }) =>
      h(
        ElTag,
        {
          type:
            rowData.status === '全部成交' || rowData.status === '已完成'
              ? 'success'
              : rowData.status === '已撤销'
                ? 'danger'
                : 'warning',
        },
        () => rowData.status
      ),
  },
  { key: 'time', title: '委托时间', dataKey: 'time', width: 180 },
];

const ordersTableHeight = ref(480);
</script>

<style scoped>
.report-query {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.query-section {
  margin-top: 20px;
}
.query-form {
  margin-bottom: 20px;
}
.funds-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}
.funds-toolbar .query-form {
  margin-bottom: 0;
}
.funds-toolbar > .el-button {
  align-self: center;
}
.query-form .el-form-item {
  margin-bottom: 10px;
}
.el-table {
  margin-top: 20px;
}
.orders-virtual-table {
  margin-top: 20px;
}
.orders-table-wrap {
  width: 100%;
  height: 480px; /* 固定高度，保持宽度 100% 与原表一致 */
}
.profit-positive {
  color: #67c23a;
  font-weight: bold;
}
.profit-negative {
  color: #f56c6c;
  font-weight: bold;
}
</style>

<style>
/* 全局样式，用于下拉菜单弹出层 */
.wide-dropdown {
  min-width: 180px !important;
}
.wide-dropdown .el-select-dropdown__item {
  padding: 0 20px !important;
  white-space: nowrap !important;
}
</style>
