<template>
  <div class="account-group-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>账户组管理</h2>
          <p>管理系统中的股票账户分组信息</p>
        </div>
      </template>

      <div class="content">
        <!-- 搜索栏 -->
        <div class="search-bar" style="margin-bottom: 20px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-input
                v-model="searchForm.groupId"
                placeholder="搜索组ID"
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-button
                type="primary"
                style="width: 100%"
                @click="resetSearch"
              >
                <el-icon><RefreshRight /></el-icon>
                重置
              </el-button>
            </el-col>
            <el-col :span="4">
              <el-button
                type="success"
                style="width: 100%"
                @click="showAddDialog = true"
              >
                <el-icon><Plus /></el-icon>
                添加组
              </el-button>
            </el-col>
            <el-col :span="4">
              <el-button
                type="info"
                style="width: 100%"
                @click="showGroupStats"
              >
                <el-icon><DataAnalysis /></el-icon>
                统计
              </el-button>
            </el-col>
          </el-row>
        </div>

        <el-table
          v-resizable-columns
          :data="paginatedGroups"
          style="width: 100%"
          height="57vh"
          stripe
        >
          <el-table-column prop="groupId" label="组ID" width="150">
            <template #default="scope">
              <el-tag :type="getGroupColor(scope.row.groupId)">
                {{ scope.row.groupId }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="accountCount" label="账户数量" width="120">
            <template #default="scope">
              {{ scope.row.accountCount }}
            </template>
          </el-table-column>
          <el-table-column prop="totalBalance" label="总余额" width="120">
            <template #default="scope">
              ${{ scope.row.totalBalance.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="createdDate" label="创建日期" width="150">
            <template #default="scope">
              {{ formatDate(scope.row.createdDate) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="10%">
            <template #default="scope">
              <el-button size="small" @click="viewGroupAccounts(scope.row)"
                >查看账户</el-button
              >
              <el-button size="small" @click="editGroup(scope.row)"
                >编辑</el-button
              >
              <el-button
                size="small"
                type="danger"
                @click="deleteGroup(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div
          class="pagination-container"
          style="margin-top: 20px; text-align: center"
        >
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredGroups.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 编辑组对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑账户组" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="组ID">
          <el-input-number
            v-model="editForm.groupId"
            :min="1"
            :precision="0"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveGroup">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加组对话框 -->
    <el-dialog v-model="showAddDialog" title="添加账户组" width="600px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="组ID">
          <el-input-number
            v-model="addForm.groupId"
            :min="1"
            :precision="0"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addGroup">添加</el-button>
      </template>
    </el-dialog>

    <!-- 查看账户对话框 -->
    <el-dialog
      v-model="showAccountsDialog"
      :title="`查看账户 - 组 ${selectedGroup?.groupId}`"
      width="80%"
    >
      <div style="margin-bottom: 20px">
        <el-button type="success" @click="showAddAccountDialog = true">
          <el-icon><Plus /></el-icon>
          添加账户
        </el-button>
      </div>
      <el-table
        v-resizable-columns
        :data="groupAccounts"
        style="width: 100%"
        max-height="400px"
        stripe
      >
        <el-table-column
          prop="accountName"
          label="账户名称"
          min-width="150"
        ></el-table-column>
        <el-table-column prop="accountType" label="账户类型" width="120">
          <template #default="scope">
            <el-tag :type="getAccountTypeColor(scope.row.accountType)">
              {{ scope.row.accountType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="broker"
          label="经纪商"
          min-width="120"
        ></el-table-column>
        <el-table-column prop="balance" label="账户余额" width="120">
          <template #default="scope">
            ${{ scope.row.balance.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusColor(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button
              size="small"
              type="danger"
              @click="removeAccountFromGroup(scope.row)"
              >移除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showAccountsDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加账户到组对话框 -->
    <el-dialog
      v-model="showAddAccountDialog"
      :title="`添加账户到组 ${selectedGroup?.groupId}`"
      width="600px"
    >
      <div style="margin-bottom: 20px">
        <el-input
          v-model="accountSearchQuery"
          placeholder="搜索账户名称或账户号"
          clearable
          @input="filterAvailableAccounts"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-table
        v-resizable-columns
        :data="filteredAvailableAccounts"
        style="width: 100%"
        max-height="300px"
        stripe
        @selection-change="handleAccountSelection"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column
          prop="accountName"
          label="账户名称"
          min-width="150"
        ></el-table-column>
        <el-table-column prop="accountType" label="账户类型" width="120">
          <template #default="scope">
            <el-tag :type="getAccountTypeColor(scope.row.accountType)">
              {{ scope.row.accountType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="broker"
          label="经纪商"
          min-width="120"
        ></el-table-column>
        <el-table-column prop="balance" label="账户余额" width="120">
          <template #default="scope">
            ${{ scope.row.balance.toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showAddAccountDialog = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="selectedAccounts.length === 0"
          @click="addAccountsToGroup"
        >
          添加选中账户 ({{ selectedAccounts.length }})
        </el-button>
      </template>
    </el-dialog>

    <!-- 统计对话框 -->
    <el-dialog v-model="showStatsDialog" title="账户组统计" width="600px">
      <div class="stats-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="stat-header">
                  <el-icon><DataAnalysis /></el-icon>
                  <span>总组数</span>
                </div>
              </template>
              <div class="stat-value">{{ accountGroups.length }}</div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="stat-header">
                  <el-icon><Money /></el-icon>
                  <span>总资产</span>
                </div>
              </template>
              <div class="stat-value">${{ totalAssets.toLocaleString() }}</div>
            </el-card>
          </el-col>
        </el-row>
        <el-divider>各组详情</el-divider>
        <div class="group-stats">
          <div
            v-for="group in accountGroups"
            :key="group.id"
            class="group-stat-item"
          >
            <div class="group-info">
              <span class="group-name">组 {{ group.groupId }}</span>
              <span class="group-count">{{ group.accountCount }} 个账户</span>
            </div>
            <div class="group-balance">
              ${{ group.totalBalance.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showStatsDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  RefreshRight,
  Plus,
  DataAnalysis,
  Money,
} from '@element-plus/icons-vue';
import { stockAccountAPI } from '../../utils/api.js';

const accountGroups = ref([]);
const allAccounts = ref([]);
const showEditDialog = ref(false);
const showAddDialog = ref(false);
const showAccountsDialog = ref(false);
const showStatsDialog = ref(false);
const showAddAccountDialog = ref(false);
const selectedGroup = ref(null);
const groupAccounts = ref([]);
const selectedAccounts = ref([]);
const accountSearchQuery = ref('');

// 搜索表单
const searchForm = ref({
  groupId: '',
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

const editForm = ref({
  id: '',
  groupId: '',
  description: '',
  createdDate: '',
  lastUpdated: '',
});

const addForm = ref({
  groupId: '',
  description: '',
});

// 组颜色映射
const getGroupColor = (groupId) => {
  // 基于组ID的颜色映射，可以根据需要调整
  const colors = ['success', 'warning', 'info', 'primary', 'danger'];
  return colors[Math.abs(groupId) % colors.length] || 'info';
};

// 账户类型颜色映射
const getAccountTypeColor = (accountType) => {
  const typeColors = {
    现金账户: 'success',
    保证金账户: 'warning',
    IRA账户: 'info',
    'Roth IRA账户': 'primary',
  };
  return typeColors[accountType] || 'info';
};

// 状态颜色映射
const getStatusColor = (status) => {
  const statusColors = {
    active: 'success',
    frozen: 'warning',
    closed: 'danger',
  };
  return statusColors[status] || 'info';
};

// 状态文本映射
const getStatusText = (status) => {
  const statusTexts = {
    active: '活跃',
    frozen: '冻结',
    closed: '关闭',
  };
  return statusTexts[status] || status;
};

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

// 计算账户组统计信息
const processedGroups = computed(() => {
  const groupMap = new Map();

  // 统计每个组的账户数量和总余额
  allAccounts.value.forEach((account) => {
    const groupId = account.group;
    if (!groupMap.has(groupId)) {
      groupMap.set(groupId, {
        id: Date.now() + Math.random(),
        groupId: groupId,
        description: getGroupDescription(groupId),
        accountCount: 0,
        totalBalance: 0,
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }

    const group = groupMap.get(groupId);
    group.accountCount += 1;
    group.totalBalance += account.balance;
  });

  return Array.from(groupMap.values());
});

// 获取组描述
const getGroupDescription = (groupId) => {
  const descriptions = {
    1: '交易账户 - 用于股票、期权、外汇等交易的账户组',
    2: '退休账户 - IRA、Roth IRA等退休投资账户',
    3: '个人投资 - 个人长期投资组合',
    4: '外汇交易 - 外汇交易专用账户',
    5: '机构投资 - 机构投资者和创业投资账户',
  };
  return descriptions[groupId] || `组 ${groupId} 的账户集合`;
};

// 过滤后的组列表
const filteredGroups = computed(() => {
  let filtered = processedGroups.value;

  if (searchForm.value.groupId) {
    filtered = filtered.filter((group) =>
      group.groupId.toString().includes(searchForm.value.groupId.toString())
    );
  }

  return filtered;
});

// 分页后的组列表
const paginatedGroups = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredGroups.value.slice(start, end);
});

// 可用的账户列表（不在当前组中的账户）
const availableAccounts = computed(() => {
  if (!selectedGroup.value) return [];
  return allAccounts.value.filter(
    (account) => account.group !== selectedGroup.value.groupId.toString()
  );
});

// 过滤后的可用账户列表
const filteredAvailableAccounts = computed(() => {
  let filtered = availableAccounts.value;

  if (accountSearchQuery.value) {
    const query = accountSearchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (account) =>
        account.accountName.toLowerCase().includes(query) ||
        account.accountNumber.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// 总资产
const totalAssets = computed(() => {
  return processedGroups.value.reduce(
    (sum, group) => sum + group.totalBalance,
    0
  );
});

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 搜索时重置到第一页
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    groupId: '',
  };
  currentPage.value = 1; // 重置搜索时回到第一页
};

// 处理每页大小变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

// 处理页码变化
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
};

// 获取股票账户列表
const fetchStockAccounts = async () => {
  try {
    const accountList = await stockAccountAPI.getStockAccounts();
    allAccounts.value = accountList;
  } catch (error) {
    console.error('获取股票账户列表失败:', error);
    ElMessage.error('获取股票账户列表失败');
  }
};

// 查看组内账户
const viewGroupAccounts = (group) => {
  selectedGroup.value = group;
  groupAccounts.value = allAccounts.value.filter(
    (account) => account.group === group.groupId.toString()
  );
  showAccountsDialog.value = true;
};

// 移除账户从组
const removeAccountFromGroup = async (account) => {
  try {
    await ElMessageBox.confirm(
      `确定要将账户 "${account.accountName}" 移除出组 ${selectedGroup.value.groupId} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await stockAccountAPI.updateStockAccount(account.id, {
      ...account,
      group: '0',
      lastUpdated: new Date().toISOString(),
    });

    ElMessage.success('账户已移除出组');
    await fetchStockAccounts();
    // 重新加载当前组的账户列表
    groupAccounts.value = allAccounts.value.filter(
      (acc) => acc.group === selectedGroup.value.groupId.toString()
    );
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除账户失败:', error);
      ElMessage.error('移除账户失败');
    }
  }
};

// 处理账户选择
const handleAccountSelection = (selection) => {
  selectedAccounts.value = selection;
};

// 添加账户到组
const addAccountsToGroup = async () => {
  try {
    for (const account of selectedAccounts.value) {
      await stockAccountAPI.updateStockAccount(account.id, {
        ...account,
        group: selectedGroup.value.groupId.toString(),
        lastUpdated: new Date().toISOString(),
      });
    }

    ElMessage.success(
      `已添加 ${selectedAccounts.value.length} 个账户到组 ${selectedGroup.value.groupId}`
    );
    selectedAccounts.value = [];
    showAddAccountDialog.value = false;
    await fetchStockAccounts();
    // 重新加载当前组的账户列表
    groupAccounts.value = allAccounts.value.filter(
      (acc) => acc.group === selectedGroup.value.groupId.toString()
    );
  } catch (error) {
    console.error('添加账户失败:', error);
    ElMessage.error('添加账户失败');
  }
};

// 过滤可用账户
const filterAvailableAccounts = () => {
  // 计算属性会自动更新，这里不需要额外逻辑
};

// 编辑组
const editGroup = (group) => {
  editForm.value = { ...group };
  showEditDialog.value = true;
};

// 保存组
const saveGroup = async () => {
  try {
    // 这里可以添加保存组信息的逻辑
    // 目前只是更新本地数据
    const index = accountGroups.value.findIndex(
      (g) => g.id === editForm.value.id
    );
    if (index !== -1) {
      accountGroups.value[index] = {
        ...editForm.value,
        lastUpdated: new Date().toISOString(),
      };
    }
    ElMessage.success('组信息更新成功');
    showEditDialog.value = false;
  } catch (error) {
    console.error('更新组信息失败:', error);
    ElMessage.error('更新组信息失败');
  }
};

// 删除组
const deleteGroup = async (group) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除组 ${group.groupId} 吗？此操作将影响 ${group.accountCount} 个账户。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 将该组的所有账户移到默认组
    const accountsToUpdate = allAccounts.value.filter(
      (account) => account.group === group.groupId.toString()
    );
    for (const account of accountsToUpdate) {
      await stockAccountAPI.updateStockAccount(account.id, {
        ...account,
        group: '0',
        lastUpdated: new Date().toISOString(),
      });
    }

    ElMessage.success('组删除成功，相关账户已移至未分组');
    await fetchStockAccounts();
    currentPage.value = 1; // 操作后重置到第一页
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除组失败:', error);
      ElMessage.error('删除组失败');
    }
  }
};

// 添加组
const addGroup = async () => {
  try {
    // 这里可以添加创建新组的逻辑
    // 目前只是添加本地数据
    const newGroup = {
      id: Date.now(),
      groupId: addForm.value.groupId,
      description: addForm.value.description,
      accountCount: 0,
      totalBalance: 0,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    accountGroups.value.push(newGroup);

    ElMessage.success('组添加成功');
    showAddDialog.value = false;
    addForm.value = {
      groupId: '',
      description: '',
    };
  } catch (error) {
    console.error('添加组失败:', error);
    ElMessage.error('添加组失败');
  }
};

// 显示统计对话框
const showGroupStats = () => {
  showStatsDialog.value = true;
};

onMounted(() => {
  fetchStockAccounts();
});
</script>

<style scoped>
.account-group-edit {
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

.content {
  margin-top: 20px;
}

.search-bar {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.search-bar .el-row {
  align-items: center;
}

.search-bar .el-col {
  margin-bottom: 0;
}

.search-bar .el-button {
  height: 40px;
  font-weight: 500;
}

.search-bar .el-button .el-icon {
  margin-right: 5px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination-container .el-pagination {
  margin: 0;
}

.stats-content {
  padding: 20px 0;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  text-align: center;
}

.group-stats {
  max-height: 300px;
  overflow-y: auto;
}

.group-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #fafafa;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-name {
  font-weight: 500;
  color: #333;
}

.group-count {
  font-size: 12px;
  color: #666;
}

.group-balance {
  font-weight: 500;
  color: #409eff;
}
</style>
