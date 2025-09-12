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
            <el-form :inline="true" :model="fundsForm" class="query-form">
              <el-form-item label="账户">
                <el-select
                  v-model="fundsForm.account"
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
                  v-model="fundsForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryFunds">查询</el-button>
                <el-button @click="resetFunds">重置</el-button>
              </el-form-item>
            </el-form>

            <el-table :data="fundsData" style="width: 100%" stripe>
              <el-table-column prop="account" label="账户" />
              <el-table-column prop="balance" label="余额" />
              <el-table-column prop="available" label="可用资金" />
              <el-table-column prop="frozen" label="冻结资金" />
              <el-table-column prop="date" label="日期" />
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
              <el-form-item label="股票代码">
                <el-input
                  v-model="ordersForm.stockCode"
                  placeholder="输入股票代码"
                  clearable
                />
              </el-form-item>
              <el-form-item label="委托类型">
                <el-select
                  v-model="ordersForm.orderType"
                  placeholder="选择委托类型"
                  clearable
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
                >
                  <el-option label="已报" value="pending" />
                  <el-option label="部分成交" value="partial" />
                  <el-option label="全部成交" value="filled" />
                  <el-option label="已撤销" value="cancelled" />
                </el-select>
              </el-form-item>
              <el-form-item label="日期范围">
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
              <el-form-item>
                <el-button type="primary" @click="queryOrders">查询</el-button>
                <el-button @click="resetOrders">重置</el-button>
              </el-form-item>
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
import { ref, reactive, h } from 'vue';
import { ElMessage, ElTag } from 'element-plus';
import axios from 'axios';

const activeTab = ref('funds');

// 账户数据（示例）
const accounts = ref([
  { id: '001', name: '主账户' },
  { id: '002', name: '子账户A' },
  { id: '003', name: '子账户B' },
]);

// 资金查询
const fundsForm = reactive({ account: '', dateRange: [] });
const fundsData = ref([]);

// 持仓查询
const positionsForm = reactive({
  stockCode: '',
  account: '',
  profitStatus: '',
});
const positionsData = ref([]);

// 委托查询
const ordersForm = reactive({
  stockCode: '',
  orderType: '',
  status: '',
  dateRange: [],
});
const ordersData = ref([]);

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

// 资金查询示例
const queryFunds = async () => {
  ElMessage.success('资金查询成功');
  fundsData.value = [
    {
      account: '主账户',
      balance: '100,000.00',
      available: '95,000.00',
      frozen: '5,000.00',
      date: '2024-01-15',
    },
    {
      account: '子账户A',
      balance: '50,000.00',
      available: '48,000.00',
      frozen: '2,000.00',
      date: '2024-01-15',
    },
  ];
};
const resetFunds = () => {
  fundsForm.account = '';
  fundsForm.dateRange = [];
  fundsData.value = [];
};

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

// JSON Server base（委托查询）
const jsBase = import.meta.env.VITE_JSON_SERVER_BASE || 'http://localhost:3004';

// 委托查询，支持过滤并写入虚拟表格数据源
const queryOrders = async () => {
  try {
    const { data } = await axios.get(`${jsBase}/normalOrders`);
    let rows = Array.isArray(data)
      ? data.map((o) => ({
          orderId: o.id,
          stockCode: o.symbol || o.stockCode,
          stockName: o.name || '-',
          orderType: o.type || (o.side === 'SELL' ? '卖出' : '买入'),
          quantity: o.quantity ?? o.qty ?? 0,
          price: o.price ?? 0,
          status: o.status || '-',
          time: o.time || o.timestamp || '-',
        }))
      : [];

    const statusMap = {
      pending: '已报',
      partial: '部分成交',
      filled: '全部成交',
      cancelled: '已撤销',
    };
    const sideMap = { buy: 'BUY', sell: 'SELL' };

    if (ordersForm.stockCode) {
      rows = rows.filter((r) =>
        String(r.stockCode || '').includes(ordersForm.stockCode.trim())
      );
    }
    if (ordersForm.orderType) {
      const side = sideMap[ordersForm.orderType];
      rows = rows.filter((r) =>
        side === 'SELL' ? r.orderType === '卖出' : r.orderType === '买入'
      );
    }
    if (ordersForm.status) {
      const zh = statusMap[ordersForm.status];
      if (zh) rows = rows.filter((r) => r.status === zh);
    }
    if (
      Array.isArray(ordersForm.dateRange) &&
      ordersForm.dateRange.length === 2
    ) {
      const [start, end] = ordersForm.dateRange;
      const s = new Date(start);
      const e = new Date(end);
      rows = rows.filter((r) => {
        const t = new Date(r.time);
        return !isNaN(t) && t >= s && t <= e;
      });
    }

    ordersData.value = rows;
    ElMessage.success('委托查询成功');
  } catch (error) {
    console.error('委托查询失败:', error);
    ElMessage.error('委托查询失败，请检查后端 json-server');
    ordersData.value = [];
  }
};
const resetOrders = () => {
  ordersForm.stockCode = '';
  ordersForm.orderType = '';
  ordersForm.status = '';
  ordersForm.dateRange = [];
  ordersData.value = [];
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
            rowData.status === '全部成交'
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
