<template>
  <div class="risk-control-container">
    <div class="scrollable-container">
      <div class="risk-control">
        <div class="page-header">
          <h2>风控设置</h2>
          <p class="page-description">配置交易风险控制参数，保障交易安全</p>
        </div>

        <!-- 风险参数设置 -->
        <el-card class="config-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>风险参数设置</span>
            </div>
          </template>

          <el-form :model="riskParams" label-width="150px" size="small">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="单笔交易限额">
                  <el-input-number
                    v-model="riskParams.singleTradeLimit"
                    :min="1000"
                    :max="1000000"
                    :step="1000"
                    controls-position="right"
                    style="width: 100%"
                  />
                  <span class="unit">元</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="每日交易限额">
                  <el-input-number
                    v-model="riskParams.dailyTradeLimit"
                    :min="10000"
                    :max="10000000"
                    :step="10000"
                    controls-position="right"
                    style="width: 100%"
                  />
                  <span class="unit">元</span>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="单只股票持仓限额">
                  <el-input-number
                    v-model="riskParams.singleStockLimit"
                    :min="100"
                    :max="100000"
                    :step="100"
                    controls-position="right"
                    style="width: 100%"
                  />
                  <span class="unit">股</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最大持仓比例">
                  <el-input-number
                    v-model="riskParams.maxPositionRatio"
                    :min="1"
                    :max="100"
                    :step="1"
                    controls-position="right"
                    style="width: 100%"
                  />
                  <span class="unit">%</span>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="止损比例">
                  <el-input-number
                    v-model="riskParams.stopLossRatio"
                    :min="1"
                    :max="50"
                    :step="0.5"
                    controls-position="right"
                    style="width: 100%"
                  />
                  <span class="unit">%</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="止盈比例">
                  <el-input-number
                    v-model="riskParams.takeProfitRatio"
                    :min="1"
                    :max="100"
                    :step="1"
                    controls-position="right"
                    style="width: 100%"
                  />
                  <span class="unit">%</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <!-- 预警设置 -->
        <el-card class="config-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Warning /></el-icon>
              <span>预警设置</span>
            </div>
          </template>

          <el-form :model="alertSettings" label-width="150px" size="small">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="亏损预警阈值">
                  <el-input-number
                    v-model="alertSettings.lossThreshold"
                    :min="1000"
                    :max="100000"
                    :step="1000"
                    controls-position="right"
                    style="width: 100%"
                  />
                  <span class="unit">元</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="波动率预警">
                  <el-input-number
                    v-model="alertSettings.volatilityThreshold"
                    :min="1"
                    :max="50"
                    :step="0.5"
                    controls-position="right"
                    style="width: 100%"
                  />
                  <span class="unit">%</span>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="异常交易检测">
                  <el-switch v-model="alertSettings.anomalyDetection" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="实时监控">
                  <el-switch v-model="alertSettings.realTimeMonitoring" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="预警通知方式">
              <el-checkbox-group v-model="alertSettings.notificationMethods">
                <el-checkbox label="email">邮件</el-checkbox>
                <el-checkbox label="sms">短信</el-checkbox>
                <el-checkbox label="app">APP推送</el-checkbox>
                <el-checkbox label="wechat">微信</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 黑名单管理 -->
        <el-card class="config-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>黑名单管理</span>
              <el-button type="primary" size="small" @click="addToBlacklist">
                添加黑名单
              </el-button>
            </div>
          </template>

          <el-table v-resizable-columns :data="blacklist" style="width: 100%" size="small">
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag
                  :type="scope.row.type === 'user' ? 'danger' : 'warning'"
                >
                  {{ scope.row.type === 'user' ? '用户' : '股票' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="identifier" label="标识符" min-width="150">
            </el-table-column>
            <el-table-column prop="reason" label="原因" min-width="200">
            </el-table-column>
            <el-table-column prop="addedDate" label="添加时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.addedDate) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeFromBlacklist(scope.row)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 风险等级设置 -->
        <el-card class="config-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>风险等级设置</span>
            </div>
          </template>

          <el-table v-resizable-columns :data="riskLevels" style="width: 100%" size="small">
            <el-table-column prop="level" label="风险等级" width="120">
              <template #default="scope">
                <el-tag :type="getRiskLevelTagType(scope.row.level)">
                  {{ scope.row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200">
            </el-table-column>
            <el-table-column prop="maxLoss" label="最大亏损" width="120">
              <template #default="scope"> {{ scope.row.maxLoss }}% </template>
            </el-table-column>
            <el-table-column prop="maxPosition" label="最大持仓" width="120">
              <template #default="scope">
                {{ scope.row.maxPosition }}%
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="editRiskLevel(scope.row)"
                >
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 保存按钮 -->
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="saveSettings">
            保存设置
          </el-button>
          <el-button size="large" @click="resetSettings"> 重置 </el-button>
        </div>

        <!-- 添加黑名单对话框 -->
        <el-dialog
          v-model="blacklistDialogVisible"
          title="添加黑名单"
          width="500px"
        >
          <el-form :model="newBlacklistItem" label-width="100px">
            <el-form-item label="类型">
              <el-select v-model="newBlacklistItem.type" placeholder="选择类型">
                <el-option label="用户" value="user"></el-option>
                <el-option label="股票" value="stock"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="标识符">
              <el-input
                v-model="newBlacklistItem.identifier"
                :placeholder="
                  newBlacklistItem.type === 'user'
                    ? '输入用户名或ID'
                    : '输入股票代码'
                "
              />
            </el-form-item>
            <el-form-item label="原因">
              <el-input
                v-model="newBlacklistItem.reason"
                type="textarea"
                :rows="3"
                placeholder="输入加入黑名单的原因"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="blacklistDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAddToBlacklist">
              确定
            </el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Setting, Warning, User, TrendCharts } from '@element-plus/icons-vue';

// 风险参数设置
const riskParams = reactive({
  singleTradeLimit: 50000, // 单笔交易限额
  dailyTradeLimit: 200000, // 每日交易限额
  singleStockLimit: 1000, // 单只股票持仓限额
  maxPositionRatio: 20, // 最大持仓比例
  stopLossRatio: 5, // 止损比例
  takeProfitRatio: 10, // 止盈比例
});

// 预警设置
const alertSettings = reactive({
  lossThreshold: 10000, // 亏损预警阈值
  volatilityThreshold: 10, // 波动率预警
  anomalyDetection: true, // 异常交易检测
  realTimeMonitoring: true, // 实时监控
  notificationMethods: ['email', 'app'], // 预警通知方式
});

// 黑名单数据
const blacklist = ref([
  {
    id: 1,
    type: 'user',
    identifier: 'suspicious_user',
    reason: '异常交易行为',
    addedDate: '2024-01-15',
  },
  {
    id: 2,
    type: 'stock',
    identifier: 'XYZ001',
    reason: '涉嫌操纵股价',
    addedDate: '2024-01-10',
  },
]);

// 风险等级设置
const riskLevels = ref([
  {
    level: '低风险',
    description: '保守型投资者，风险承受能力低',
    maxLoss: 2,
    maxPosition: 10,
  },
  {
    level: '中风险',
    description: '平衡型投资者，风险承受能力中等',
    maxLoss: 5,
    maxPosition: 20,
  },
  {
    level: '高风险',
    description: '激进型投资者，风险承受能力高',
    maxLoss: 10,
    maxPosition: 50,
  },
]);

// 黑名单对话框
const blacklistDialogVisible = ref(false);
const newBlacklistItem = reactive({
  type: 'user',
  identifier: '',
  reason: '',
});

// 方法
const saveSettings = () => {
  // 这里可以调用API保存设置
  ElMessage.success('风控设置保存成功！');
};

const resetSettings = () => {
  // 重置为默认设置
  Object.assign(riskParams, {
    singleTradeLimit: 50000,
    dailyTradeLimit: 200000,
    singleStockLimit: 1000,
    maxPositionRatio: 20,
    stopLossRatio: 5,
    takeProfitRatio: 10,
  });

  Object.assign(alertSettings, {
    lossThreshold: 10000,
    volatilityThreshold: 10,
    anomalyDetection: true,
    realTimeMonitoring: true,
    notificationMethods: ['email', 'app'],
  });

  ElMessage.info('设置已重置为默认值');
};

const addToBlacklist = () => {
  blacklistDialogVisible.value = true;
  Object.assign(newBlacklistItem, {
    type: 'user',
    identifier: '',
    reason: '',
  });
};

const confirmAddToBlacklist = () => {
  if (!newBlacklistItem.identifier || !newBlacklistItem.reason) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  const newItem = {
    id: Date.now(),
    type: newBlacklistItem.type,
    identifier: newBlacklistItem.identifier,
    reason: newBlacklistItem.reason,
    addedDate: new Date().toISOString().split('T')[0],
  };

  blacklist.value.push(newItem);
  blacklistDialogVisible.value = false;
  ElMessage.success('已添加到黑名单');
};

const removeFromBlacklist = (item) => {
  const index = blacklist.value.findIndex((b) => b.id === item.id);
  if (index > -1) {
    blacklist.value.splice(index, 1);
    ElMessage.success('已从黑名单移除');
  }
};

const editRiskLevel = (level) => {
  // 这里可以打开编辑对话框
  ElMessage.info(`编辑风险等级: ${level.level}`);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

const getRiskLevelTagType = (level) => {
  const typeMap = {
    低风险: 'success',
    中风险: 'warning',
    高风险: 'danger',
  };
  return typeMap[level] || 'info';
};

// 组件挂载时加载数据
onMounted(() => {
  // 这里可以从API加载风控设置数据
  console.log('风控设置页面已加载');
});
</script>

<style scoped>
.risk-control {
  padding: 20px;
  max-width: 1500px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h2 {
  color: #303133;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.page-description {
  color: #606266;
  font-size: 16px;
}

.config-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.card-header .el-icon {
  color: #409eff;
}

.unit {
  color: #909399;
  font-size: 14px;
  margin-left: 8px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .risk-control {
    padding: 15px;
  }

  .page-header h2 {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .el-button {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .risk-control {
    padding: 10px;
  }

  .page-header h2 {
    font-size: 20px;
  }
}

/* 滚动容器样式 */
.scrollable-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}

/* 自定义滚动条样式 */
.scrollable-container::-webkit-scrollbar {
  width: 8px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Firefox 滚动条样式 */
.scrollable-container {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}
</style>
