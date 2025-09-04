<template>
  <div class="trading-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>算法多账号交易</h2>
          <p>使用算法策略在多个账号间执行交易</p>
        </div>
      </template>

      <div class="content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="strategy-card" shadow="hover">
              <template #header>
                <div class="strategy-header">
                  <el-icon><TrendCharts /></el-icon>
                  <span>均线策略</span>
                </div>
              </template>
              <div class="strategy-content">
                <p>基于移动平均线的趋势跟踪策略</p>
                <el-button type="primary" size="small" @click="startStrategy('ma')">启动策略</el-button>
              </div>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card class="strategy-card" shadow="hover">
              <template #header>
                <div class="strategy-header">
                  <el-icon><DataAnalysis /></el-icon>
                  <span>量化策略</span>
                </div>
              </template>
              <div class="strategy-content">
                <p>基于量化模型的统计套利策略</p>
                <el-button type="primary" size="small" @click="startStrategy('quant')">启动策略</el-button>
              </div>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card class="strategy-card" shadow="hover">
              <template #header>
                <div class="strategy-header">
                  <el-icon><Timer /></el-icon>
                  <span>高频策略</span>
                </div>
              </template>
              <div class="strategy-content">
                <p>基于市场微观结构的快速交易策略</p>
                <el-button type="primary" size="small" @click="startStrategy('hft')">启动策略</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 账号配置 -->
        <el-card class="account-config" style="margin-top: 20px;">
          <template #header>
            <div class="config-header">
              <el-icon><User /></el-icon>
              <span>多账号配置</span>
            </div>
          </template>
          <el-form :model="accountConfig" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="主账号">
                  <el-select v-model="accountConfig.primaryAccount" placeholder="选择主账号">
                    <el-option label="交易账号1" value="account1"></el-option>
                    <el-option label="交易账号2" value="account2"></el-option>
                    <el-option label="交易账号3" value="account3"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="从账号">
                  <el-select v-model="accountConfig.secondaryAccounts" multiple placeholder="选择从账号">
                    <el-option label="交易账号1" value="account1"></el-option>
                    <el-option label="交易账号2" value="account2"></el-option>
                    <el-option label="交易账号3" value="account3"></el-option>
                    <el-option label="交易账号4" value="account4"></el-option>
                    <el-option label="交易账号5" value="account5"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="资金分配比例">
              <el-slider v-model="accountConfig.allocationRatio" :min="10" :max="50" :step="5" show-input></el-slider>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveAccountConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 策略运行状态 -->
        <el-card class="strategy-status" style="margin-top: 20px;">
          <template #header>
            <div class="status-header">
              <el-icon><Monitor /></el-icon>
              <span>策略运行状态</span>
            </div>
          </template>
          <el-table :data="runningStrategies" style="width: 100%" size="small">
            <el-table-column prop="strategyName" label="策略名称" width="150"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="accounts" label="运行账号数" width="120"></el-table-column>
            <el-table-column prop="pnl" label="当日盈亏" width="120"></el-table-column>
            <el-table-column prop="startTime" label="启动时间"></el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="stopStrategy(scope.row)">停止</el-button>
                <el-button size="small" type="info" @click="viewDetails(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TrendCharts, DataAnalysis, Timer, User, Monitor } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const accountConfig = ref({
  primaryAccount: '',
  secondaryAccounts: [],
  allocationRatio: 30
})

const runningStrategies = ref([
  {
    id: 1,
    strategyName: '均线策略',
    status: '运行中',
    accounts: 3,
    pnl: '+2,450.00',
    startTime: '2024-01-15 09:00:00'
  }
])

const getStatusType = (status) => {
  const types = {
    '运行中': 'success',
    '已停止': 'info',
    '异常': 'danger'
  }
  return types[status] || 'info'
}

const startStrategy = (strategyType) => {
  const strategyNames = {
    'ma': '均线策略',
    'quant': '量化策略',
    'hft': '高频策略'
  }

  ElMessage.success(`${strategyNames[strategyType]}已启动`)
  console.log(`启动策略: ${strategyNames[strategyType]}`)
}

const stopStrategy = (strategy) => {
  ElMessage.warning(`${strategy.strategyName}已停止`)
  console.log(`停止策略: ${strategy.strategyName}`)
}

const viewDetails = (strategy) => {
  ElMessage.info(`查看${strategy.strategyName}详情`)
  console.log(`查看策略详情: ${strategy.strategyName}`)
}

const saveAccountConfig = () => {
  ElMessage.success('账号配置已保存')
  console.log('保存账号配置:', accountConfig.value)
}

onMounted(() => {
  console.log('算法多账号交易页面加载完成')
})
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

.strategy-card {
  height: 100%;
}

.strategy-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategy-header .el-icon {
  color: #409eff;
}

.strategy-content {
  text-align: center;
  padding: 10px 0;
}

.strategy-content p {
  margin: 10px 0;
  color: #666;
  font-size: 14px;
}

.config-header, .status-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-header .el-icon, .status-header .el-icon {
  color: #409eff;
}

.account-config, .strategy-status {
  margin-top: 20px;
}
</style>
