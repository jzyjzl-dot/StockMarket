<template>
  <div class="trade-monitoring">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>交易监控</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 算法监控 -->
        <el-tab-pane label="算法监控" name="algorithm">
          <div class="monitoring-section">
            <!-- 二级按钮 -->
            <div class="sub-tabs">
              <el-button
                :type="activeSubTab === 'task' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('task')"
              >
                任务监控
              </el-button>
              <el-button
                :type="activeSubTab === 'basket' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('basket')"
              >
                篮子监控
              </el-button>
              <el-button
                :type="activeSubTab === '废单' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('废单')"
              >
                废单监控
              </el-button>
            </div>

            <el-form :inline="true" :model="queryForm" class="query-form">
              <el-form-item label="请选择账户组合">
                <el-select
                  v-model="queryForm.accountGroup"
                  placeholder="请选择"
                  clearable
                  style="width: 200px"
                >
                  <el-option
                    v-for="group in accountGroups"
                    :key="group.id"
                    :label="group.name"
                    :value="group.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryData">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-table :data="monitoringData" style="width: 100%" stripe border>
              <el-table-column
                prop="stockName"
                label="股票名称"
                width="120"
                align="center"
              />

              <!-- 买入 -->
              <el-table-column label="买入" align="center">
                <el-table-column
                  prop="buyTaskProgress"
                  label="任务进度"
                  width="80"
                  align="center"
                />
                <el-table-column
                  prop="buyCompletedAmount"
                  label="已成(元)"
                  width="100"
                  align="center"
                />
                <el-table-column
                  prop="buyCompletedProgress"
                  label="任务进度"
                  width="80"
                  align="center"
                />
              </el-table-column>

              <!-- 卖出 -->
              <el-table-column label="卖出" align="center">
                <el-table-column
                  prop="sellTaskProgress"
                  label="任务进度"
                  width="80"
                  align="center"
                />
                <el-table-column
                  prop="sellCompletedAmount"
                  label="已成(元)"
                  width="100"
                  align="center"
                />
                <el-table-column
                  prop="sellCompletedProgress"
                  label="任务进度"
                  width="80"
                  align="center"
                />
              </el-table-column>

              <!-- 买入+卖出 -->
              <el-table-column label="买入+卖出" align="center">
                <el-table-column
                  prop="totalTaskProgress"
                  label="任务进度"
                  width="80"
                  align="center"
                />
                <el-table-column
                  prop="totalCompletedAmount"
                  label="已成(元)"
                  width="100"
                  align="center"
                />
                <el-table-column
                  prop="totalCompletedProgress"
                  label="任务进度"
                  width="80"
                  align="center"
                />
              </el-table-column>

              <el-table-column
                prop="longShortRatio"
                label="多空盈比"
                width="100"
                align="center"
              />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- T0监控 -->
        <el-tab-pane label="T0监控" name="t0">
          <div class="monitoring-section">
            <!-- 二级按钮 -->
            <div class="sub-tabs">
              <el-button
                :type="activeSubTab === 'task' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('task')"
              >
                任务监控
              </el-button>
              <el-button
                :type="activeSubTab === 'basket' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('basket')"
              >
                篮子监控
              </el-button>
              <el-button
                :type="activeSubTab === '废单' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('废单')"
              >
                废单监控
              </el-button>
            </div>

            <el-form :inline="true" :model="queryForm" class="query-form">
              <el-form-item label="请选择账户组合">
                <el-select
                  v-model="queryForm.accountGroup"
                  placeholder="请选择"
                  clearable
                  style="width: 200px"
                >
                  <el-option
                    v-for="group in accountGroups"
                    :key="group.id"
                    :label="group.name"
                    :value="group.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryData">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-table :data="t0Data" style="width: 100%" stripe border>
              <el-table-column
                prop="stockName"
                label="股票名称"
                width="120"
                align="center"
              />
              <el-table-column
                prop="t0Progress"
                label="T0进度"
                width="100"
                align="center"
              />
              <el-table-column
                prop="t0Amount"
                label="T0成交金额"
                width="120"
                align="center"
              />
              <el-table-column
                prop="t0Profit"
                label="T0收益"
                width="100"
                align="center"
              />
              <el-table-column
                prop="t0ProfitRatio"
                label="T0收益率"
                width="100"
                align="center"
              />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 合仓监控 -->
        <el-tab-pane label="合仓监控" name="position">
          <div class="monitoring-section">
            <!-- 二级按钮 -->
            <div class="sub-tabs">
              <el-button
                :type="activeSubTab === 'task' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('task')"
              >
                任务监控
              </el-button>
              <el-button
                :type="activeSubTab === 'basket' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('basket')"
              >
                篮子监控
              </el-button>
              <el-button
                :type="activeSubTab === '废单' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('废单')"
              >
                废单监控
              </el-button>
            </div>

            <el-form :inline="true" :model="queryForm" class="query-form">
              <el-form-item label="请选择账户组合">
                <el-select
                  v-model="queryForm.accountGroup"
                  placeholder="请选择"
                  clearable
                  style="width: 200px"
                >
                  <el-option
                    v-for="group in accountGroups"
                    :key="group.id"
                    :label="group.name"
                    :value="group.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryData">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-table :data="positionData" style="width: 100%" stripe border>
              <el-table-column
                prop="stockName"
                label="股票名称"
                width="120"
                align="center"
              />
              <el-table-column
                prop="totalPosition"
                label="总持仓"
                width="100"
                align="center"
              />
              <el-table-column
                prop="availablePosition"
                label="可用持仓"
                width="100"
                align="center"
              />
              <el-table-column
                prop="frozenPosition"
                label="冻结持仓"
                width="100"
                align="center"
              />
              <el-table-column
                prop="avgCost"
                label="平均成本"
                width="100"
                align="center"
              />
              <el-table-column
                prop="marketValue"
                label="市值"
                width="100"
                align="center"
              />
              <el-table-column
                prop="unrealizedPnl"
                label="浮动盈亏"
                width="120"
                align="center"
              >
                <template #default="scope">
                  <span
                    :class="{
                      'profit-positive':
                        parseFloat(scope.row.unrealizedPnl) > 0,
                      'profit-negative':
                        parseFloat(scope.row.unrealizedPnl) < 0,
                    }"
                  >
                    {{ scope.row.unrealizedPnl }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 资金监控 -->
        <el-tab-pane label="资金监控" name="fund">
          <div class="monitoring-section">
            <!-- 二级按钮 -->
            <div class="sub-tabs">
              <el-button
                :type="activeSubTab === 'task' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('task')"
              >
                任务监控
              </el-button>
              <el-button
                :type="activeSubTab === 'basket' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('basket')"
              >
                篮子监控
              </el-button>
              <el-button
                :type="activeSubTab === '废单' ? 'primary' : ''"
                size="small"
                @click="handleSubTabClick('废单')"
              >
                废单监控
              </el-button>
            </div>

            <el-form :inline="true" :model="queryForm" class="query-form">
              <el-form-item label="请选择账户组合">
                <el-select
                  v-model="queryForm.accountGroup"
                  placeholder="请选择"
                  clearable
                  style="width: 200px"
                >
                  <el-option
                    v-for="group in accountGroups"
                    :key="group.id"
                    :label="group.name"
                    :value="group.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryData">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-table :data="fundData" style="width: 100%" stripe border>
              <el-table-column
                prop="accountName"
                label="账户名称"
                width="120"
                align="center"
              />
              <el-table-column
                prop="totalAssets"
                label="总资产"
                width="120"
                align="center"
              />
              <el-table-column
                prop="availableFunds"
                label="可用资金"
                width="120"
                align="center"
              />
              <el-table-column
                prop="frozenFunds"
                label="冻结资金"
                width="120"
                align="center"
              />
              <el-table-column
                prop="marketValue"
                label="持仓市值"
                width="120"
                align="center"
              />
              <el-table-column
                prop="todayPnl"
                label="今日盈亏"
                width="120"
                align="center"
              >
                <template #default="scope">
                  <span
                    :class="{
                      'profit-positive': parseFloat(scope.row.todayPnl) > 0,
                      'profit-negative': parseFloat(scope.row.todayPnl) < 0,
                    }"
                  >
                    {{ scope.row.todayPnl }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 响应式数据
const activeTab = ref('algorithm');
const activeSubTab = ref('task'); // 默认选中任务监控

// 账户组合数据
const accountGroups = ref([
  { id: '1', name: 'HTR_G001(首选)' },
  { id: '2', name: 'HTR_G002' },
  { id: '3', name: 'HTR_G003' },
]);

// 查询表单
const queryForm = reactive({
  accountGroup: '',
});

// 监控数据
const monitoringData = ref([
  {
    stockName: 'HTR_G001(首选)',
    // 买入部分
    buyTaskProgress: '0%',
    buyCompletedAmount: '0.00',
    buyCompletedProgress: '0%',
    // 卖出部分
    sellTaskProgress: '0%',
    sellCompletedAmount: '0.00',
    sellCompletedProgress: '0%',
    // 买入+卖出部分
    totalTaskProgress: '0%',
    totalCompletedAmount: '0.00',
    totalCompletedProgress: '0%',
    // 多空盈比
    longShortRatio: '0.00',
  },
  {
    stockName: '000001 平安银行',
    // 买入部分
    buyTaskProgress: '50%',
    buyCompletedAmount: '25,000.00',
    buyCompletedProgress: '50%',
    // 卖出部分
    sellTaskProgress: '30%',
    sellCompletedAmount: '15,000.00',
    sellCompletedProgress: '30%',
    // 买入+卖出部分
    totalTaskProgress: '40%',
    totalCompletedAmount: '40,000.00',
    totalCompletedProgress: '40%',
    // 多空盈比
    longShortRatio: '1.67',
  },
  {
    stockName: '000002 万科A',
    // 买入部分
    buyTaskProgress: '75%',
    buyCompletedAmount: '37,500.00',
    buyCompletedProgress: '75%',
    // 卖出部分
    sellTaskProgress: '60%',
    sellCompletedAmount: '30,000.00',
    sellCompletedProgress: '60%',
    // 买入+卖出部分
    totalTaskProgress: '67%',
    totalCompletedAmount: '67,500.00',
    totalCompletedProgress: '67%',
    // 多空盈比
    longShortRatio: '1.25',
  },
]);

const t0Data = ref([
  {
    stockName: '平安银行',
    t0Progress: '50%',
    t0Amount: '50,000.00',
    t0Profit: '+1,200.50',
    t0ProfitRatio: '2.4%',
  },
  {
    stockName: '招商银行',
    t0Progress: '75%',
    t0Amount: '75,000.00',
    t0Profit: '-500.20',
    t0ProfitRatio: '-0.67%',
  },
]);

const positionData = ref([
  {
    stockName: '平安银行',
    totalPosition: '10,000',
    availablePosition: '8,000',
    frozenPosition: '2,000',
    avgCost: '12.50',
    marketValue: '125,000.00',
    unrealizedPnl: '+2,500.00',
  },
  {
    stockName: '招商银行',
    totalPosition: '5,000',
    availablePosition: '5,000',
    frozenPosition: '0',
    avgCost: '45.20',
    marketValue: '226,000.00',
    unrealizedPnl: '-1,200.50',
  },
]);

const fundData = ref([
  {
    accountName: '主账户001',
    totalAssets: '1,000,000.00',
    availableFunds: '500,000.00',
    frozenFunds: '50,000.00',
    marketValue: '450,000.00',
    todayPnl: '+12,580.30',
  },
  {
    accountName: '主账户002',
    totalAssets: '800,000.00',
    availableFunds: '300,000.00',
    frozenFunds: '20,000.00',
    marketValue: '480,000.00',
    todayPnl: '-5,230.80',
  },
]);

// 标签页切换
const handleTabClick = (tab) => {
  console.log('切换到:', tab.props.name);
  queryData();
};

// 二级按钮切换
const handleSubTabClick = (subTab) => {
  activeSubTab.value = subTab;
  console.log('切换到二级按钮:', subTab);
  queryData(); // 可以根据不同的二级按钮加载不同的数据
};

// 查询数据
const queryData = async () => {
  try {
    console.log('查询数据:', queryForm);
    ElMessage.success('数据查询成功');

    // 根据不同的标签页加载不同的模拟数据
    if (activeTab.value === 'algorithm') {
      // 算法监控数据已在上面定义
    } else if (activeTab.value === 't0') {
      // T0监控数据已在上面定义
    } else if (activeTab.value === 'position') {
      // 合仓监控数据已在上面定义
    } else if (activeTab.value === 'fund') {
      // 资金监控数据已在上面定义
    }
  } catch (error) {
    console.error('数据查询失败:', error);
    ElMessage.error('数据查询失败');
  }
};

const resetQuery = () => {
  queryForm.accountGroup = '';
  ElMessage.info('查询条件已重置');
};

// 组件挂载时初始化
onMounted(() => {
  queryData();
});
</script>

<style scoped>
.trade-monitoring {
  padding: 20px;
}

.sub-tabs {
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
}

.sub-tabs .el-button {
  margin-right: 12px;
  margin-bottom: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitoring-section {
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

.profit-positive {
  color: #67c23a;
  font-weight: bold;
}

.profit-negative {
  color: #f56c6c;
  font-weight: bold;
}

/* 表格样式 */
:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-table--border .el-table__cell) {
  border-right: 1px solid #ebeef5;
}
</style>
