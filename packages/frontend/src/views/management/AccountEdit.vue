<template>
  <div class="account-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>股票账户管理</h2>
          <p>管理系统中的股票交易账户信息</p>
        </div>
      </template>

      <div class="content">
        <!-- 搜索栏 -->
        <div class="search-bar" style="margin-bottom: 20px;">
          <el-row :gutter="20">
            <el-col :span="4">
              <el-input
                v-model="searchForm.accountName"
                placeholder="搜索账户名称"
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="3">
              <el-select
                v-model="searchForm.accountType"
                placeholder="选择账户类型"
                clearable
                @change="handleSearch"
                style="width: 100%"
              >
                <el-option label="现金账户" value="现金账户"></el-option>
                <el-option label="保证金账户" value="保证金账户"></el-option>
                <el-option label="IRA账户" value="IRA账户"></el-option>
                <el-option label="Roth IRA账户" value="Roth IRA账户"></el-option>
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-input
                v-model="searchForm.broker"
                placeholder="搜索经纪商"
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="3">
              <el-select
                v-model="searchForm.group"
                placeholder="选择组别"
                clearable
                @change="handleSearch"
                style="width: 100%"
              >
                <el-option label="交易账户 (1)" value="1"></el-option>
                <el-option label="退休账户 (2)" value="2"></el-option>
                <el-option label="个人投资 (3)" value="3"></el-option>
                <el-option label="外汇交易 (4)" value="4"></el-option>
                <el-option label="机构投资 (5)" value="5"></el-option>
                <el-option label="未分组 (0)" value="0"></el-option>
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-select
                v-model="searchForm.status"
                placeholder="选择状态"
                clearable
                @change="handleSearch"
                style="width: 100%"
              >
                <el-option label="活跃" value="active"></el-option>
                <el-option label="冻结" value="frozen"></el-option>
                <el-option label="关闭" value="closed"></el-option>
              </el-select>
            </el-col>
            <el-col :span="2">
              <el-button type="primary" @click="resetSearch" style="width: 100%">
                <el-icon><RefreshRight /></el-icon>
                重置
              </el-button>
            </el-col>
            <el-col :span="2">
              <el-button type="success" @click="showAddDialog = true" style="width: 100%">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </el-col>
          </el-row>
        </div>

        <el-table 
          :data="paginatedAccounts" 
          style="width: 100%" 
          max-height="500px"
          stripe
        >
          <el-table-column prop="id" label="ID" width="80" fixed="left"></el-table-column>
          <el-table-column prop="accountName" label="账户名称" min-width="150"></el-table-column>
          <el-table-column prop="accountType" label="账户类型" width="120">
            <template #default="scope">
              <el-tag :type="getAccountTypeColor(scope.row.accountType)">
                {{ scope.row.accountType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="broker" label="经纪商" min-width="120"></el-table-column>
          <el-table-column prop="accountNumber" label="账户号码" min-width="150"></el-table-column>
          <el-table-column prop="group" label="组别" width="120">
            <template #default="scope">
              <el-tag :type="getGroupColor(scope.row.group)">
                {{ scope.row.group }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="balance" label="账户余额" width="120">
            <template #default="scope">
              ${{ scope.row.balance.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="availableFunds" label="可用资金" width="120">
            <template #default="scope">
              ${{ scope.row.availableFunds.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusColor(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="editAccount(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteAccount(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-container" style="margin-top: 20px; text-align: center;">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredAccounts.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 编辑账户对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑股票账户" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="账户名称">
          <el-input v-model="editForm.accountName"></el-input>
        </el-form-item>
        <el-form-item label="账户类型">
          <el-select v-model="editForm.accountType">
            <el-option label="现金账户" value="现金账户"></el-option>
            <el-option label="保证金账户" value="保证金账户"></el-option>
            <el-option label="IRA账户" value="IRA账户"></el-option>
            <el-option label="Roth IRA账户" value="Roth IRA账户"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="经纪商">
          <el-input v-model="editForm.broker"></el-input>
        </el-form-item>
        <el-form-item label="账户号码">
          <el-input v-model="editForm.accountNumber"></el-input>
        </el-form-item>
        <el-form-item label="组别">
          <el-select v-model="editForm.group">
            <el-option label="交易账户 (1)" value="1"></el-option>
            <el-option label="退休账户 (2)" value="2"></el-option>
            <el-option label="个人投资 (3)" value="3"></el-option>
            <el-option label="外汇交易 (4)" value="4"></el-option>
            <el-option label="机构投资 (5)" value="5"></el-option>
            <el-option label="未分组 (0)" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账户余额">
          <el-input-number v-model="editForm.balance" :precision="2" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="可用资金">
          <el-input-number v-model="editForm.availableFunds" :precision="2" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="活跃" value="active"></el-option>
            <el-option label="冻结" value="frozen"></el-option>
            <el-option label="关闭" value="closed"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAccount">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加账户对话框 -->
    <el-dialog v-model="showAddDialog" title="添加股票账户" width="600px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="账户名称">
          <el-input v-model="addForm.accountName"></el-input>
        </el-form-item>
        <el-form-item label="账户类型">
          <el-select v-model="addForm.accountType">
            <el-option label="现金账户" value="现金账户"></el-option>
            <el-option label="保证金账户" value="保证金账户"></el-option>
            <el-option label="IRA账户" value="IRA账户"></el-option>
            <el-option label="Roth IRA账户" value="Roth IRA账户"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="经纪商">
          <el-input v-model="addForm.broker"></el-input>
        </el-form-item>
        <el-form-item label="账户号码">
          <el-input v-model="addForm.accountNumber"></el-input>
        </el-form-item>
        <el-form-item label="组别">
          <el-select v-model="addForm.group">
            <el-option label="交易账户 (1)" value="1"></el-option>
            <el-option label="退休账户 (2)" value="2"></el-option>
            <el-option label="个人投资 (3)" value="3"></el-option>
            <el-option label="外汇交易 (4)" value="4"></el-option>
            <el-option label="机构投资 (5)" value="5"></el-option>
            <el-option label="未分组 (0)" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账户余额">
          <el-input-number v-model="addForm.balance" :precision="2" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="可用资金">
          <el-input-number v-model="addForm.availableFunds" :precision="2" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="addForm.status">
            <el-option label="活跃" value="active"></el-option>
            <el-option label="冻结" value="frozen"></el-option>
            <el-option label="关闭" value="closed"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addAccount">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshRight, Plus } from '@element-plus/icons-vue'
import { stockAccountAPI } from '../../utils/api.js'

const stockAccounts = ref([])
const showEditDialog = ref(false)
const showAddDialog = ref(false)

// 搜索表单
const searchForm = ref({
  accountName: '',
  accountType: '',
  broker: '',
  group: '',
  status: ''
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

const editForm = ref({
  id: '',
  accountName: '',
  accountType: '',
  broker: '',
  accountNumber: '',
  group: '0',
  balance: 0,
  availableFunds: 0,
  status: 'active'
})

const addForm = ref({
  accountName: '',
  accountType: '',
  broker: '',
  accountNumber: '',
  group: '0',
  balance: 0,
  availableFunds: 0,
  status: 'active'
})

// 账户类型颜色映射
const getAccountTypeColor = (accountType) => {
  const typeColors = {
    '现金账户': 'success',
    '保证金账户': 'warning',
    'IRA账户': 'info',
    'Roth IRA账户': 'primary'
  }
  return typeColors[accountType] || 'info'
}

// 状态颜色映射
const getStatusColor = (status) => {
  const statusColors = {
    active: 'success',
    frozen: 'warning',
    closed: 'danger'
  }
  return statusColors[status] || 'info'
}

// 状态文本映射
const getStatusText = (status) => {
  const statusTexts = {
    active: '活跃',
    frozen: '冻结',
    closed: '关闭'
  }
  return statusTexts[status] || status
}

// 组别颜色映射
const getGroupColor = (group) => {
  const groupColors = {
    '1': 'warning',  // 交易账户
    '2': 'info',     // 退休账户
    '3': 'success',  // 个人投资
    '4': 'primary',  // 外汇交易
    '5': 'danger',   // 机构投资
    '0': 'secondary' // 未分组
  }
  return groupColors[group] || 'info'
}

// 过滤后的账户列表
const filteredAccounts = computed(() => {
  let filtered = stockAccounts.value

  if (searchForm.value.accountName) {
    filtered = filtered.filter(account =>
      account.accountName.toLowerCase().includes(searchForm.value.accountName.toLowerCase())
    )
  }

  if (searchForm.value.accountType) {
    filtered = filtered.filter(account =>
      account.accountType === searchForm.value.accountType
    )
  }

  if (searchForm.value.broker) {
    filtered = filtered.filter(account =>
      account.broker.toLowerCase().includes(searchForm.value.broker.toLowerCase())
    )
  }

  if (searchForm.value.group) {
    filtered = filtered.filter(account =>
      account.group === searchForm.value.group
    )
  }

  if (searchForm.value.status) {
    filtered = filtered.filter(account =>
      account.status === searchForm.value.status
    )
  }

  return filtered
})

// 分页后的账户列表
const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAccounts.value.slice(start, end)
})

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 搜索时重置到第一页
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    accountName: '',
    accountType: '',
    broker: '',
    group: '',
    status: ''
  }
  currentPage.value = 1 // 重置搜索时回到第一页
}

// 处理每页大小变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

// 处理页码变化
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

// 获取股票账户列表
const fetchStockAccounts = async () => {
  try {
    const accountList = await stockAccountAPI.getStockAccounts()
    stockAccounts.value = accountList
  } catch (error) {
    console.error('获取股票账户列表失败:', error)
    ElMessage.error('获取股票账户列表失败')
  }
}

// 编辑账户
const editAccount = (account) => {
  editForm.value = { ...account }
  showEditDialog.value = true
}

// 保存账户
const saveAccount = async () => {
  try {
    await stockAccountAPI.updateStockAccount(editForm.value.id, {
      ...editForm.value,
      lastUpdated: new Date().toISOString()
    })
    ElMessage.success('账户更新成功')
    showEditDialog.value = false
    await fetchStockAccounts()
    currentPage.value = 1 // 操作后重置到第一页
  } catch (error) {
    console.error('更新账户失败:', error)
    ElMessage.error('更新账户失败')
  }
}

// 删除账户
const deleteAccount = async (account) => {
  try {
    await ElMessageBox.confirm(`确定要删除账户 ${account.accountName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await stockAccountAPI.deleteStockAccount(account.id)
    ElMessage.success('账户删除成功')
    await fetchStockAccounts()
    currentPage.value = 1 // 操作后重置到第一页
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除账户失败:', error)
      ElMessage.error('删除账户失败')
    }
  }
}

// 添加账户
const addAccount = async () => {
  try {
    await stockAccountAPI.createStockAccount(addForm.value)
    ElMessage.success('账户添加成功')
    showAddDialog.value = false
    addForm.value = {
      accountName: '',
      accountType: '',
      broker: '',
      accountNumber: '',
      group: '未分组',
      balance: 0,
      availableFunds: 0,
      status: 'active'
    }
    await fetchStockAccounts()
    currentPage.value = 1 // 操作后重置到第一页
  } catch (error) {
    console.error('添加账户失败:', error)
    ElMessage.error('添加账户失败')
  }
}

onMounted(() => {
  fetchStockAccounts()
})
</script>

<style scoped>
.account-edit {
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
</style>
