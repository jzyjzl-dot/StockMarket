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
                :class="{ 'active-sub-tab': activeSubTab === 'task' }"
                class="sub-tab-button"
                @click="handleSubTabClick('task')"
              >
                任务监控
              </el-button>
              <el-button
                :class="{ 'active-sub-tab': activeSubTab === 'basket' }"
                class="sub-tab-button"
                @click="handleSubTabClick('basket')"
              >
                篮子监控
              </el-button>
              <el-button
                :class="{ 'active-sub-tab': activeSubTab === '废单' }"
                class="sub-tab-button"
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

            <el-table
              v-if="showTables"
              :data="getCurrentData()"
              style="width: 100%"
              stripe
              border
            >
              <el-table-column
                prop="stockName"
                label="股票名称"
                min-width="120"
                align="center"
              />

              <!-- 买入 -->
              <el-table-column label="买入" align="center">
                <el-table-column
                  prop="buyTaskProgress"
                  label="任务进度"
                  min-width="80"
                  align="center"
                />
                <el-table-column
                  prop="buyCompletedAmount"
                  label="已成(元)"
                  min-width="100"
                  align="center"
                />
                <el-table-column
                  prop="buyCompletedProgress"
                  label="任务进度"
                  min-width="80"
                  align="center"
                />
              </el-table-column>

              <!-- 卖出 -->
              <el-table-column label="卖出" align="center">
                <el-table-column
                  prop="sellTaskProgress"
                  label="任务进度"
                  min-width="80"
                  align="center"
                />
                <el-table-column
                  prop="sellCompletedAmount"
                  label="已成(元)"
                  min-width="100"
                  align="center"
                />
                <el-table-column
                  prop="sellCompletedProgress"
                  label="任务进度"
                  min-width="80"
                  align="center"
                />
              </el-table-column>

              <!-- 买入+卖出 -->
              <el-table-column label="买入+卖出" align="center">
                <el-table-column
                  prop="totalTaskProgress"
                  label="任务进度"
                  min-width="80"
                  align="center"
                />
                <el-table-column
                  prop="totalCompletedAmount"
                  label="已成(元)"
                  min-width="100"
                  align="center"
                />
                <el-table-column
                  prop="totalCompletedProgress"
                  label="任务进度"
                  min-width="80"
                  align="center"
                />
              </el-table-column>

              <el-table-column
                prop="longShortRatio"
                label="多空盈比"
                min-width="100"
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
                :class="{ 'active-sub-tab': activeSubTab === 'task' }"
                class="sub-tab-button"
                @click="handleSubTabClick('task')"
              >
                任务监控
              </el-button>
              <el-button
                :class="{ 'active-sub-tab': activeSubTab === 'basket' }"
                class="sub-tab-button"
                @click="handleSubTabClick('basket')"
              >
                篮子监控
              </el-button>
              <el-button
                :class="{ 'active-sub-tab': activeSubTab === '废单' }"
                class="sub-tab-button"
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

            <el-table
              v-if="showTables"
              :data="getCurrentData()"
              style="width: 100%"
              stripe
              border
            >
              <el-table-column
                prop="stockName"
                label="股票名称"
                align="center"
              />
              <el-table-column
                prop="t0Progress"
                label="T0进度"
                align="center"
              />
              <el-table-column
                prop="t0Amount"
                label="T0成交金额"
                align="center"
              />
              <el-table-column prop="t0Profit" label="T0收益" align="center" />
              <el-table-column
                prop="t0ProfitRatio"
                label="T0收益率"
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
                :class="{ 'active-sub-tab': activeSubTab === 'task' }"
                class="sub-tab-button"
                @click="handleSubTabClick('task')"
              >
                任务监控
              </el-button>
              <el-button
                :class="{ 'active-sub-tab': activeSubTab === 'basket' }"
                class="sub-tab-button"
                @click="handleSubTabClick('basket')"
              >
                篮子监控
              </el-button>
              <el-button
                :class="{ 'active-sub-tab': activeSubTab === '废单' }"
                class="sub-tab-button"
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

            <el-table
              v-if="showTables"
              :data="getCurrentData()"
              style="width: 100%"
              stripe
              border
            >
              <el-table-column
                prop="stockName"
                label="股票名称"
                align="center"
              />
              <el-table-column
                prop="totalPosition"
                label="总持仓"
                align="center"
              />
              <el-table-column
                prop="availablePosition"
                label="可用持仓"
                align="center"
              />
              <el-table-column
                prop="frozenPosition"
                label="冻结持仓"
                align="center"
              />
              <el-table-column prop="avgCost" label="平均成本" align="center" />
              <el-table-column prop="marketValue" label="市值" align="center" />
              <el-table-column
                prop="unrealizedPnl"
                label="浮动盈亏"
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
                :class="{ 'active-sub-tab': activeSubTab === 'task' }"
                class="sub-tab-button"
                @click="handleSubTabClick('task')"
              >
                任务监控
              </el-button>
              <el-button
                :class="{ 'active-sub-tab': activeSubTab === 'basket' }"
                class="sub-tab-button"
                @click="handleSubTabClick('basket')"
              >
                篮子监控
              </el-button>
              <el-button
                :class="{ 'active-sub-tab': activeSubTab === '废单' }"
                class="sub-tab-button"
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

            <el-table
              v-if="showTables"
              :data="getCurrentData()"
              style="width: 100%"
              stripe
              border
            >
              <el-table-column
                prop="accountName"
                label="账户名称"
                align="center"
              />
              <el-table-column
                prop="totalAssets"
                label="总资产"
                align="center"
              />
              <el-table-column
                prop="availableFunds"
                label="可用资金"
                align="center"
              />
              <el-table-column
                prop="frozenFunds"
                label="冻结资金"
                align="center"
              />
              <el-table-column
                prop="marketValue"
                label="持仓市值"
                align="center"
              />
              <el-table-column prop="todayPnl" label="今日盈亏" align="center">
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

const showTables = ref(false);

// 根据当前选中的标签页和子标签页获取对应数据
const getCurrentData = () => {
  const key = `${activeTab.value}_${activeSubTab.value}`;
  return monitoringDataMap.value[key] || [];
};

// 不同标签页和子标签页对应的数据映射
const monitoringDataMap = ref({
  // 算法监控 - 任务监控
  algorithm_task: [
    {
      stockName: '算法任务-HTR_G001',
      buyTaskProgress: '85%',
      buyCompletedAmount: '85,000.00',
      buyCompletedProgress: '85%',
      sellTaskProgress: '75%',
      sellCompletedAmount: '45,000.00',
      sellCompletedProgress: '75%',
      totalTaskProgress: '80%',
      totalCompletedAmount: '130,000.00',
      totalCompletedProgress: '80%',
      longShortRatio: '1.89',
    },
    {
      stockName: '算法任务-000001平安银行',
      buyTaskProgress: '92%',
      buyCompletedAmount: '92,000.00',
      buyCompletedProgress: '92%',
      sellTaskProgress: '88%',
      sellCompletedAmount: '52,800.00',
      sellCompletedProgress: '88%',
      totalTaskProgress: '90%',
      totalCompletedAmount: '144,800.00',
      totalCompletedProgress: '90%',
      longShortRatio: '1.74',
    },
  ],
  // 算法监控 - 篮子监控
  algorithm_basket: [
    {
      stockName: '算法篮子-科技股篮子',
      buyTaskProgress: '65%',
      buyCompletedAmount: '195,000.00',
      buyCompletedProgress: '65%',
      sellTaskProgress: '70%',
      sellCompletedAmount: '140,000.00',
      sellCompletedProgress: '70%',
      totalTaskProgress: '67%',
      totalCompletedAmount: '335,000.00',
      totalCompletedProgress: '67%',
      longShortRatio: '1.39',
    },
  ],
  // 算法监控 - 废单监控
  algorithm_废单: [
    {
      stockName: '算法废单-异常订单',
      buyTaskProgress: '0%',
      buyCompletedAmount: '0.00',
      buyCompletedProgress: '0%',
      sellTaskProgress: '0%',
      sellCompletedAmount: '0.00',
      sellCompletedProgress: '0%',
      totalTaskProgress: '0%',
      totalCompletedAmount: '0.00',
      totalCompletedProgress: '0%',
      longShortRatio: '0.00',
    },
  ],
  // T0监控 - 任务监控
  t0_task: [
    {
      stockName: 'T0任务-招商银行',
      buyTaskProgress: '78%',
      buyCompletedAmount: '156,000.00',
      buyCompletedProgress: '78%',
      sellTaskProgress: '82%',
      sellCompletedAmount: '164,000.00',
      sellCompletedProgress: '82%',
      totalTaskProgress: '80%',
      totalCompletedAmount: '320,000.00',
      totalCompletedProgress: '80%',
      longShortRatio: '0.95',
    },
  ],
  // T0监控 - 篮子监控
  t0_basket: [
    {
      stockName: 'T0篮子-银行股篮子',
      buyTaskProgress: '55%',
      buyCompletedAmount: '275,000.00',
      buyCompletedProgress: '55%',
      sellTaskProgress: '60%',
      sellCompletedAmount: '180,000.00',
      sellCompletedProgress: '60%',
      totalTaskProgress: '57%',
      totalCompletedAmount: '455,000.00',
      totalCompletedProgress: '57%',
      longShortRatio: '1.53',
    },
  ],
  // T0监控 - 废单监控
  t0_废单: [
    {
      stockName: 'T0废单-超时订单',
      buyTaskProgress: '0%',
      buyCompletedAmount: '0.00',
      buyCompletedProgress: '0%',
      sellTaskProgress: '0%',
      sellCompletedAmount: '0.00',
      sellCompletedProgress: '0%',
      totalTaskProgress: '0%',
      totalCompletedAmount: '0.00',
      totalCompletedProgress: '0%',
      longShortRatio: '0.00',
    },
  ],
  // 合仓监控 - 任务监控
  position_task: [
    {
      stockName: '合仓任务-中国平安',
      buyTaskProgress: '95%',
      buyCompletedAmount: '285,000.00',
      buyCompletedProgress: '95%',
      sellTaskProgress: '88%',
      sellCompletedAmount: '220,000.00',
      sellCompletedProgress: '88%',
      totalTaskProgress: '91%',
      totalCompletedAmount: '505,000.00',
      totalCompletedProgress: '91%',
      longShortRatio: '1.30',
    },
  ],
  // 合仓监控 - 篮子监控
  position_basket: [
    {
      stockName: '合仓篮子-保险股篮子',
      buyTaskProgress: '72%',
      buyCompletedAmount: '360,000.00',
      buyCompletedProgress: '72%',
      sellTaskProgress: '68%',
      sellCompletedAmount: '272,000.00',
      sellCompletedProgress: '68%',
      totalTaskProgress: '70%',
      totalCompletedAmount: '632,000.00',
      totalCompletedProgress: '70%',
      longShortRatio: '1.32',
    },
  ],
  // 合仓监控 - 废单监控
  position_废单: [
    {
      stockName: '合仓废单-撤销订单',
      buyTaskProgress: '0%',
      buyCompletedAmount: '0.00',
      buyCompletedProgress: '0%',
      sellTaskProgress: '0%',
      sellCompletedAmount: '0.00',
      sellCompletedProgress: '0%',
      totalTaskProgress: '0%',
      totalCompletedAmount: '0.00',
      totalCompletedProgress: '0%',
      longShortRatio: '0.00',
    },
  ],
  // 资金监控 - 任务监控
  fund_task: [
    {
      stockName: '资金任务-总资金池',
      buyTaskProgress: '86%',
      buyCompletedAmount: '2,580,000.00',
      buyCompletedProgress: '86%',
      sellTaskProgress: '79%',
      sellCompletedAmount: '1,975,000.00',
      sellCompletedProgress: '79%',
      totalTaskProgress: '82%',
      totalCompletedAmount: '4,555,000.00',
      totalCompletedProgress: '82%',
      longShortRatio: '1.31',
    },
  ],
  // 资金监控 - 篮子监控
  fund_basket: [
    {
      stockName: '资金篮子-全市场篮子',
      buyTaskProgress: '64%',
      buyCompletedAmount: '3,200,000.00',
      buyCompletedProgress: '64%',
      sellTaskProgress: '72%',
      sellCompletedAmount: '2,880,000.00',
      sellCompletedProgress: '72%',
      totalTaskProgress: '68%',
      totalCompletedAmount: '6,080,000.00',
      totalCompletedProgress: '68%',
      longShortRatio: '1.11',
    },
  ],
  // 资金监控 - 废单监控
  fund_废单: [
    {
      stockName: '资金废单-资金不足',
      buyTaskProgress: '0%',
      buyCompletedAmount: '0.00',
      buyCompletedProgress: '0%',
      sellTaskProgress: '0%',
      sellCompletedAmount: '0.00',
      sellCompletedProgress: '0%',
      totalTaskProgress: '0%',
      totalCompletedAmount: '0.00',
      totalCompletedProgress: '0%',
      longShortRatio: '0.00',
    },
  ],
});

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
  margin-bottom: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #e4e7ed;
}

.sub-tab-button {
  margin-right: 8px;
  margin-bottom: 4px;
  border: none;
  background: transparent;
  color: #606266;
  border-radius: 0;
  border-bottom: 2px solid transparent;
  padding: 8px 16px;
  font-size: 14px;
}

.sub-tab-button:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.active-sub-tab {
  color: #409eff !important;
  border-bottom-color: #409eff !important;
  background: rgba(64, 158, 255, 0.1) !important;
}

.el-table {
  width: 100% !important;
}

.el-table .el-table__header-wrapper,
.el-table .el-table__body-wrapper {
  width: 100% !important;
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
