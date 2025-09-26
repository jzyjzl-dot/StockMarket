<template>
  <div class="account-group-page">
    <el-card class="management-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <h2>账户组管理</h2>
            <p>维护账户组并调整组内账号的权重分配</p>
          </div>
          <el-button type="primary" @click="toggleCreateMode">
            <el-icon class="button-icon"><Plus /></el-icon>
            {{ showCreate ? '取消新增' : '新增账户组' }}
          </el-button>
        </div>
      </template>

      <div class="content">
        <div class="editor-layout">
          <section class="panel panel-groups">
            <header class="panel-header">
              <span class="panel-title">账户组</span>
              <span class="panel-subtitle">
                共 {{ groupsWithStats.length }} 组
              </span>
            </header>

            <transition name="fade">
              <div v-if="showCreate" class="new-group-block">
                <el-input
                  v-model="newGroupName"
                  placeholder="输入新增账户组名称"
                  size="small"
                  @keyup.enter="createGroup"
                />
                <div class="new-group-actions">
                  <el-button size="small" type="primary" @click="createGroup">
                    保存
                  </el-button>
                  <el-button size="small" text @click="cancelCreate">
                    取消
                  </el-button>
                </div>
              </div>
            </transition>

            <el-scrollbar class="group-list">
              <div
                v-for="group in groupsWithStats"
                :key="group.groupId"
                :class="[
                  'group-item',
                  {
                    active: group.groupId === activeGroupId,
                  },
                ]"
                @click="selectGroup(group.groupId)"
              >
                <div class="group-info">
                  <div class="group-name">{{ group.displayName }}</div>
                  <div class="group-meta">{{ group.accountCount }} 个账号</div>
                </div>
                <div class="group-actions" @click.stop>
                  <el-popconfirm
                    v-if="group.groupId !== '0'"
                    title="确定删除该账户组？"
                    confirm-button-text="删除"
                    cancel-button-text="取消"
                    confirm-button-type="danger"
                    @confirm="deleteGroup(group)"
                  >
                    <template #reference>
                      <el-button text size="small">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </el-scrollbar>
          </section>

          <section class="panel panel-selected">
            <header class="panel-header">
              <span class="panel-title">已选账号</span>
              <span
                class="weight-total"
                :class="{ warning: totalWeight > 100 }"
              >
                权重合计 {{ totalWeight.toFixed(2) }}%
              </span>
            </header>

            <el-table
              :data="selectedAccounts"
              row-key="id"
              height="420"
              stripe
              :empty-text="
                activeGroupId ? '暂无已选账号' : '请先选择左侧账户组'
              "
              @selection-change="handleSelectedSelect"
            >
              <el-table-column type="selection" width="48" />
              <el-table-column
                prop="accountName"
                label="账户名称"
                min-width="160"
              />
              <el-table-column
                prop="accountNumber"
                label="资金账号"
                min-width="150"
              />
              <el-table-column label="账户权重%" width="160">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.weightPercent"
                    :min="0"
                    :max="100"
                    :step="1"
                    size="small"
                    controls-position="right"
                    @change="() => normalizeRowWeight(row)"
                  />
                </template>
              </el-table-column>
            </el-table>

            <div class="panel-footer">
              <el-button
                type="danger"
                plain
                size="small"
                :disabled="!selectedSelection.length"
                @click="removeSelectedAccounts"
              >
                移出选中账号
              </el-button>
            </div>
          </section>

          <div class="transfer-controls">
            <el-button
              circle
              type="primary"
              :disabled="!availableSelection.length || !activeGroupId"
              @click="addAccountsToGroup"
            >
              <el-icon><ArrowLeftBold /></el-icon>
            </el-button>
            <el-button
              circle
              type="info"
              :disabled="!selectedSelection.length"
              @click="removeSelectedAccounts"
            >
              <el-icon><ArrowRightBold /></el-icon>
            </el-button>
          </div>

          <section class="panel panel-available">
            <header class="panel-header">
              <span class="panel-title">待选账号</span>
              <el-input
                v-model="availableSearch"
                size="small"
                placeholder="搜索账户名称或资金账号"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </header>

            <el-table
              :data="filteredAvailableAccounts"
              row-key="id"
              height="420"
              stripe
              :empty-text="availableEmptyText"
              @selection-change="handleAvailableSelect"
            >
              <el-table-column type="selection" width="48" />
              <el-table-column
                prop="accountName"
                label="账户名称"
                min-width="160"
              />
              <el-table-column
                prop="accountNumber"
                label="资金账号"
                min-width="150"
              />
              <el-table-column label="当前所属组" min-width="140">
                <template #default="{ row }">
                  <el-tag size="small" effect="light">{{
                    groupLabel(row.group)
                  }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </section>
        </div>

        <footer class="action-bar">
          <el-button :disabled="!activeGroupId" @click="resetCurrentGroup"
            >取消</el-button
          >
          <el-button
            type="primary"
            :loading="saving"
            :disabled="!activeGroupId"
            @click="saveChanges"
            >确认</el-button
          >
        </footer>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus,
  ArrowLeftBold,
  ArrowRightBold,
  Search,
  Delete,
} from '@element-plus/icons-vue';
import { accountGroupAPI, stockAccountAPI } from '../../utils/api.js';

const groups = ref([]);
const allAccounts = ref([]);
const activeGroupId = ref('');
const selectedAccounts = ref([]);
const selectedSelection = ref([]);
const availableSelection = ref([]);
const availableSearch = ref('');
const showCreate = ref(false);
const newGroupName = ref('');
const saving = ref(false);

const normalizeWeight = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.min(100, Math.max(0, Number(num.toFixed(2))));
};

const cloneAccount = (account) => ({
  ...account,
  group: account.group != null ? account.group.toString() : '0',
  weightPercent: normalizeWeight(account.weightPercent ?? 0),
});

const groupsWithStats = computed(() => {
  const stats = allAccounts.value.reduce((acc, account) => {
    const key = account.group != null ? account.group.toString() : '0';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return groups.value
    .map((group) => {
      const id = group.groupId != null ? group.groupId.toString() : '';
      return {
        ...group,
        groupId: id,
        displayName: group.name || (id === '0' ? '未分配' : '组 ' + id),
        accountCount: stats[id] || 0,
      };
    })
    .sort((a, b) => {
      if (a.groupId === b.groupId) return 0;
      if (a.groupId === '0') return 1;
      if (b.groupId === '0') return -1;
      return a.groupId.localeCompare(b.groupId, 'zh-Hans-CN', {
        numeric: true,
      });
    });
});

const groupLabel = (groupId) => {
  const id = groupId != null ? groupId.toString() : '0';
  if (id === '0' || !id) return '未分配';
  const found = groups.value.find((group) => group.groupId === id);
  return found?.name || '组 ' + id;
};

const selectedIds = computed(
  () => new Set(selectedAccounts.value.map((item) => item.id))
);

const availableAccounts = computed(() =>
  allAccounts.value.filter((account) => !selectedIds.value.has(account.id))
);

const filteredAvailableAccounts = computed(() => {
  const keyword = availableSearch.value.trim().toLowerCase();
  if (!keyword) return availableAccounts.value;
  return availableAccounts.value.filter((account) => {
    const name = account.accountName?.toLowerCase?.() || '';
    const number = account.accountNumber?.toLowerCase?.() || '';
    return name.includes(keyword) || number.includes(keyword);
  });
});

const availableEmptyText = computed(() =>
  activeGroupId.value ? '暂无可选账号' : '请先选择左侧账户组'
);

const totalWeight = computed(() =>
  selectedAccounts.value.reduce(
    (sum, account) => sum + (Number(account.weightPercent) || 0),
    0
  )
);

const toggleCreateMode = () => {
  showCreate.value = !showCreate.value;
  if (!showCreate.value) {
    newGroupName.value = '';
  }
};

const cancelCreate = () => {
  showCreate.value = false;
  newGroupName.value = '';
};

const createGroup = async () => {
  const name = newGroupName.value.trim();
  if (!name) {
    ElMessage.warning('请输入账户组名称');
    return;
  }
  const exists = groups.value.some((group) => group.groupId === name);
  if (exists) {
    ElMessage.warning('该账户组已存在');
    return;
  }
  try {
    const now = new Date().toISOString();
    await accountGroupAPI.createAccountGroup({
      groupId: name,
      name,
      description: '',
      createdDate: now,
      lastUpdated: now,
    });
    ElMessage.success('账户组创建成功');
    cancelCreate();
    await fetchAccountGroups();
    selectGroup(name);
  } catch (error) {
    console.error('创建账户组失败:', error);
    ElMessage.error('创建账户组失败');
  }
};

const selectGroup = (groupId) => {
  const id = groupId != null ? groupId.toString() : '';
  activeGroupId.value = id;
  availableSearch.value = '';
  populateSelection();
};

const populateSelection = () => {
  if (!activeGroupId.value) {
    selectedAccounts.value = [];
    selectedSelection.value = [];
    availableSelection.value = [];
    return;
  }
  const id = activeGroupId.value.toString();
  selectedAccounts.value = allAccounts.value
    .filter((account) => (account.group ?? '0').toString() === id)
    .map(cloneAccount);
  selectedSelection.value = [];
  availableSelection.value = [];
};

const handleSelectedSelect = (rows) => {
  selectedSelection.value = rows.map((row) => row.id);
};

const handleAvailableSelect = (rows) => {
  availableSelection.value = rows.map((row) => row.id);
};

const addAccountsToGroup = () => {
  if (!activeGroupId.value) {
    ElMessage.warning('请先选择账户组');
    return;
  }
  if (!availableSelection.value.length) return;
  const current = new Set(selectedAccounts.value.map((account) => account.id));
  const additions = allAccounts.value
    .filter((account) => availableSelection.value.includes(account.id))
    .filter((account) => !current.has(account.id))
    .map((account) => ({ ...cloneAccount(account), weightPercent: 0 }));
  if (!additions.length) {
    availableSelection.value = [];
    return;
  }
  selectedAccounts.value = selectedAccounts.value.concat(additions);
  availableSelection.value = [];
};

const removeSelectedAccounts = () => {
  if (!selectedSelection.value.length) return;
  const removeIds = new Set(selectedSelection.value);
  selectedAccounts.value = selectedAccounts.value.filter(
    (account) => !removeIds.has(account.id)
  );
  selectedSelection.value = [];
};

const resetCurrentGroup = () => {
  populateSelection();
};

const normalizeRowWeight = (row) => {
  row.weightPercent = normalizeWeight(row.weightPercent ?? 0);
};

const saveChanges = async () => {
  if (!activeGroupId.value) {
    ElMessage.warning('请先选择账户组');
    return;
  }
  if (totalWeight.value > 100.001) {
    ElMessage.warning('权重合计不能超过 100%');
    return;
  }

  const targetGroup = activeGroupId.value.toString();
  const desiredMap = new Map(
    selectedAccounts.value.map((account) => [
      account.id,
      {
        group: targetGroup,
        weightPercent: normalizeWeight(account.weightPercent ?? 0),
      },
    ])
  );

  const updates = [];
  const now = new Date().toISOString();

  allAccounts.value.forEach((account) => {
    const id = account.id;
    const desired = desiredMap.get(id);
    const currentGroup = account.group != null ? account.group.toString() : '0';
    const nextGroup = desired ? desired.group : '0';
    const nextWeight = desired ? desired.weightPercent : 0;
    const groupChanged = currentGroup !== nextGroup;
    const weightChanged =
      normalizeWeight(account.weightPercent ?? 0) !== nextWeight;

    if (groupChanged || weightChanged) {
      updates.push({
        ...account,
        group: nextGroup,
        weightPercent: nextWeight,
        lastUpdated: now,
      });
    }
  });

  if (!updates.length) {
    ElMessage.info('没有需要保存的更改');
    return;
  }

  saving.value = true;
  try {
    await Promise.all(
      updates.map((account) =>
        stockAccountAPI.updateStockAccount(account.id, {
          accountName: account.accountName,
          accountType: account.accountType,
          broker: account.broker,
          accountNumber: account.accountNumber,
          balance: account.balance,
          availableFunds: account.availableFunds,
          status: account.status,
          group: account.group,
          createdDate: account.createdDate,
          weightPercent: account.weightPercent,
          lastUpdated: account.lastUpdated,
        })
      )
    );
    ElMessage.success('账户组设置已保存');
    await fetchStockAccounts();
    populateSelection();
  } catch (error) {
    console.error('保存账户组失败:', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    saving.value = false;
  }
};

const fetchAccountGroups = async () => {
  try {
    const data = await accountGroupAPI.getAccountGroups();
    groups.value = (data || []).map((group) => ({
      ...group,
      groupId: group.groupId != null ? group.groupId.toString() : '0',
    }));
  } catch (error) {
    console.error('获取账户组失败:', error);
    ElMessage.error('获取账户组失败');
  }
};

const fetchStockAccounts = async () => {
  try {
    const data = await stockAccountAPI.getStockAccounts();
    allAccounts.value = (data || []).map(cloneAccount);
  } catch (error) {
    console.error('获取资金账户失败:', error);
    ElMessage.error('获取资金账户失败');
  }
};

const ensureActiveGroup = () => {
  if (!groups.value.length) {
    activeGroupId.value = '';
    selectedAccounts.value = [];
    return;
  }
  if (activeGroupId.value) {
    populateSelection();
    return;
  }
  const first =
    groups.value.find((group) => group.groupId !== '0') || groups.value[0];
  if (first) {
    activeGroupId.value = first.groupId;
    populateSelection();
  }
};

const deleteGroup = async (group) => {
  if (!group || group.groupId === '0') return;
  try {
    await ElMessageBox.confirm(
      '删除后该组内账号将回到未分配状态，是否继续？',
      '提示',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
  } catch {
    return;
  }

  try {
    const resetAccounts = allAccounts.value.filter(
      (account) => (account.group ?? '0').toString() === group.groupId
    );
    const now = new Date().toISOString();
    await Promise.all(
      resetAccounts.map((account) =>
        stockAccountAPI.updateStockAccount(account.id, {
          accountName: account.accountName,
          accountType: account.accountType,
          broker: account.broker,
          accountNumber: account.accountNumber,
          balance: account.balance,
          availableFunds: account.availableFunds,
          status: account.status,
          group: '0',
          weightPercent: 0,
          createdDate: account.createdDate,
          lastUpdated: now,
        })
      )
    );

    await accountGroupAPI.deleteAccountGroup(group.id);
    ElMessage.success('账户组已删除');
    if (activeGroupId.value === group.groupId) {
      activeGroupId.value = '';
    }
    await Promise.all([fetchAccountGroups(), fetchStockAccounts()]);
    ensureActiveGroup();
  } catch (error) {
    console.error('删除账户组失败:', error);
    ElMessage.error('删除账户组失败');
  }
};

onMounted(async () => {
  await fetchAccountGroups();
  await fetchStockAccounts();
  ensureActiveGroup();
});
</script>

<style scoped>
.account-group-page {
  padding: 20px;
}

.management-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.card-header p {
  margin: 4px 0 0;
  color: #909399;
  font-size: 14px;
}

.card-header .el-button {
  display: inline-flex;
  align-items: center;
}

.button-icon {
  margin-right: 6px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-layout {
  display: grid;
  grid-template-columns: 260px 1fr 60px 1fr;
  gap: 16px;
  align-items: stretch;
}

.panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 480px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.panel-subtitle {
  font-size: 12px;
  color: #909399;
}

.panel-groups {
  padding-right: 8px;
}

.group-list {
  flex: 1;
  overflow: hidden;
}

.group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-item + .group-item {
  margin-top: 8px;
}

.group-item:hover {
  background: #f5f7fa;
  border-color: #dcdfe6;
}

.group-item.active {
  background: #ecf5ff;
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.18);
}

.group-name {
  font-weight: 600;
  color: #303133;
}

.group-meta {
  font-size: 12px;
  color: #909399;
}

.group-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.group-item:hover .group-actions,
.group-item.active .group-actions {
  opacity: 1;
}

.new-group-block {
  background: #f5f7fa;
  border: 1px dashed #409eff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.new-group-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.panel-selected,
.panel-available {
  position: relative;
}

.panel-footer {
  margin-top: 12px;
  text-align: right;
}

.weight-total {
  font-size: 13px;
  color: #909399;
}

.weight-total.warning {
  color: #f56c6c;
}

.transfer-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.transfer-controls .el-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.18);
}

.panel-available .panel-header {
  align-items: flex-start;
}

.panel-available .panel-header .el-input {
  flex: 1;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

:deep(.el-table) {
  flex: 1;
}

:deep(.el-table__empty-text) {
  color: #909399;
}

@media (max-width: 1200px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }

  .transfer-controls {
    flex-direction: row;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .card-header {
    align-items: flex-start;
  }

  .transfer-controls {
    flex-direction: row;
  }
}
</style>
