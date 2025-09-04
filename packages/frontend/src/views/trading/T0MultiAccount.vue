<template>
  <div class="trading-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>T0多账户号交易</h2>
          <p>当日买入卖出策略，在多个账户间进行T0操作</p>
        </div>
      </template>

      <div class="content">
        <!-- T0策略配置 -->
        <el-card class="t0-config" shadow="hover">
          <template #header>
            <div class="config-header">
              <el-icon><Setting /></el-icon>
              <span>T0策略配置</span>
            </div>
          </template>
          <el-form :model="t0Config" label-width="140px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="目标股票池">
                  <el-select
                    v-model="t0Config.stockPool"
                    multiple
                    placeholder="选择股票池"
                  >
                    <el-option label="沪深300" value="hs300"></el-option>
                    <el-option label="创业板" value="cyb"></el-option>
                    <el-option label="科创板" value="kcb"></el-option>
                    <el-option label="自定义池" value="custom"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="单股持仓比例">
                  <el-slider
                    v-model="t0Config.positionRatio"
                    :min="1"
                    :max="10"
                    :step="0.5"
                    show-input
                  ></el-slider>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="买入阈值(%)">
                  <el-input-number
                    v-model="t0Config.buyThreshold"
                    :min="0.1"
                    :max="5"
                    :step="0.1"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="卖出阈值(%)">
                  <el-input-number
                    v-model="t0Config.sellThreshold"
                    :min="0.1"
                    :max="5"
                    :step="0.1"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最大持仓时间(分钟)">
                  <el-input-number
                    v-model="t0Config.maxHoldTime"
                    :min="5"
                    :max="240"
                    :step="5"
                  ></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button type="primary" @click="saveT0Config"
                >保存配置</el-button
              >
              <el-button
                type="success"
                @click="startT0Strategy"
                :loading="strategyLoading"
                >启动T0策略</el-button
              >
              <el-button type="danger" @click="stopT0Strategy"
                >停止策略</el-button
              >
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 多账户状态监控 -->
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="12">
            <el-card class="account-monitor" shadow="hover">
              <template #header>
                <div class="monitor-header">
                  <el-icon><User /></el-icon>
                  <span>账户状态监控</span>
                </div>
              </template>
              <el-table :data="accountStatus" size="small" :show-header="false">
                <el-table-column prop="account" label="账户"></el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="scope">
                    <el-tag
                      :type="
                        scope.row.status === '正常' ? 'success' : 'warning'
                      "
                    >
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="balance"
                  label="可用资金"
                  align="right"
                ></el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card class="performance-monitor" shadow="hover">
              <template #header>
                <div class="monitor-header">
                  <el-icon><TrendCharts /></el-icon>
                  <span>当日表现</span>
                </div>
              </template>
              <div class="performance-stats">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="stat-item">
                      <div class="stat-label">总盈亏</div>
                      <div class="stat-value positive">+15,680.00</div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="stat-item">
                      <div class="stat-label">胜率</div>
                      <div class="stat-value">68.5%</div>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20" style="margin-top: 15px">
                  <el-col :span="12">
                    <div class="stat-item">
                      <div class="stat-label">交易次数</div>
                      <div class="stat-value">127</div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="stat-item">
                      <div class="stat-label">平均持仓</div>
                      <div class="stat-value">12.5min</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 实时交易记录 -->
        <el-card class="trade-records" style="margin-top: 20px">
          <template #header>
            <div class="records-header">
              <el-icon><List /></el-icon>
              <span>实时交易记录</span>
              <el-tag type="success" size="small">运行中</el-tag>
            </div>
          </template>
          <el-table
            :data="tradeRecords"
            style="width: 100%"
            size="small"
            height="300"
          >
            <el-table-column
              prop="time"
              label="时间"
              width="140"
            ></el-table-column>
            <el-table-column
              prop="account"
              label="账户"
              width="100"
            ></el-table-column>
            <el-table-column
              prop="stockCode"
              label="股票代码"
              width="100"
            ></el-table-column>
            <el-table-column prop="type" label="操作" width="80">
              <template #default="scope">
                <el-tag
                  :type="scope.row.type === '买入' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="price"
              label="价格"
              width="80"
            ></el-table-column>
            <el-table-column
              prop="quantity"
              label="数量"
              width="80"
            ></el-table-column>
            <el-table-column prop="pnl" label="盈亏" width="80">
              <template #default="scope">
                <span :class="scope.row.pnl >= 0 ? 'positive' : 'negative'">
                  {{ scope.row.pnl >= 0 ? '+' : ''
                  }}{{ scope.row.pnl.toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="holdTime"
              label="持仓时间"
              width="100"
            ></el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Setting, User, TrendCharts, List } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const t0Config = ref({
  stockPool: [],
  positionRatio: 5,
  buyThreshold: 1.5,
  sellThreshold: 2.0,
  maxHoldTime: 60,
});

const strategyLoading = ref(false);

const accountStatus = ref([
  { account: '主账户', status: '正常', balance: '500,000.00' },
  { account: '账户A', status: '正常', balance: '300,000.00' },
  { account: '账户B', status: '正常', balance: '250,000.00' },
  { account: '账户C', status: '正常', balance: '200,000.00' },
]);

const tradeRecords = ref([
  {
    time: '14:32:15',
    account: '主账户',
    stockCode: '000001',
    type: '买入',
    price: 15.25,
    quantity: 1000,
    pnl: 0,
    holdTime: '-',
  },
  {
    time: '14:35:22',
    account: '账户A',
    stockCode: '000001',
    type: '卖出',
    price: 15.45,
    quantity: 1000,
    pnl: 200.0,
    holdTime: '3分8秒',
  },
  {
    time: '14:38:45',
    account: '账户B',
    stockCode: '000002',
    type: '买入',
    price: 28.5,
    quantity: 500,
    pnl: 0,
    holdTime: '-',
  },
]);

const saveT0Config = () => {
  ElMessage.success('T0策略配置已保存');
  console.log('保存T0配置:', t0Config.value);
};

const startT0Strategy = async () => {
  strategyLoading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 模拟启动时间
    ElMessage.success('T0策略已启动，开始监控市场机会');
  } catch (error) {
    ElMessage.error('启动策略失败');
  } finally {
    strategyLoading.value = false;
  }
};

const stopT0Strategy = () => {
  ElMessage.warning('T0策略已停止');
  console.log('停止T0策略');
};

onMounted(() => {
  console.log('T0多账户号交易页面加载完成');
});
</script>

<style scoped>
.trading-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.config-header,
.monitor-header,
.records-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-header .el-icon,
.monitor-header .el-icon,
.records-header .el-icon {
  color: #409eff;
}

.t0-config,
.account-monitor,
.performance-monitor,
.trade-records {
  margin-top: 20px;
}

.performance-stats {
  padding: 15px 0;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-value.positive {
  color: #67c23a;
}

.positive {
  color: #67c23a;
  font-weight: 600;
}

.negative {
  color: #f56c6c;
  font-weight: 600;
}
</style>
