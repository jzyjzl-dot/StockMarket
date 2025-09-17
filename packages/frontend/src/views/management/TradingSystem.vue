<template>
  <div class="trading-system">
    <div class="page-header">
      <h2>交易系统</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button :loading="loading" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="paginatedData"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="交易系统ID" width="120" />
        <el-table-column prop="name" label="交易系统名称" width="180" />
        <el-table-column prop="type" label="交易系统类型" width="150">
          <template #default="{ row }">
            {{ getTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="共享目录" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="交易系统名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入交易系统名称" />
        </el-form-item>
        <el-form-item label="交易系统类型" prop="type">
          <el-select
            v-model="form.type"
            placeholder="请选择类型"
            style="width: 100%"
          >
            <el-option label="LDP" value="ldp" />
            <el-option label="QMT" value="qmt" />
            <el-option label="ATX" value="atx" />
          </el-select>
        </el-form-item>
        <el-form-item label="共享目录" prop="path">
          <el-input v-model="form.path" placeholder="请输入共享目录路径" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { tradingSystemAPI } from '../../utils/api.js';

const loading = ref(false);
const saving = ref(false);
const tableData = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const isEdit = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

const form = ref({
  id: '',
  name: '',
  type: '',
  path: '',
  status: 'active',
});

const formRef = ref();

const rules = {
  name: [{ required: true, message: '请输入交易系统名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择交易系统类型', trigger: 'change' }],
  path: [{ required: true, message: '请输入共享目录路径', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return tableData.value.slice(start, start + pageSize.value);
});

const ensurePageInRange = () => {
  const maxPage = Math.max(Math.ceil(total.value / pageSize.value), 1);
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage;
  }
  if (currentPage.value < 1) {
    currentPage.value = 1;
  }
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const fetchTradingSystems = async () => {
  loading.value = true;
  try {
    const systems = await tradingSystemAPI.getTradingSystems();
    tableData.value = Array.isArray(systems) ? systems : [];
    total.value = tableData.value.length;
    ensurePageInRange();
    return true;
  } catch (error) {
    console.error('加载交易系统失败:', error);
    ElMessage.error('加载交易系统失败');
    return false;
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  dialogTitle.value = '新增交易系统';
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑交易系统';
  isEdit.value = true;
  form.value = {
    id: row.id,
    name: row.name,
    type: row.type,
    path: row.path,
    status: row.status,
    creator: row.creator,
    createTime: row.createTime,
  };
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除交易系统 "${row.name}" 吗？`,
      '确认删除',
      {
        type: 'warning',
      }
    );
    await tradingSystemAPI.deleteTradingSystem(row.id);
    ElMessage.success('删除成功');
    const success = await fetchTradingSystems();
    if (success && total.value === 0) {
      currentPage.value = 1;
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除交易系统失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    saving.value = true;

    if (isEdit.value) {
      const payload = {
        name: form.value.name,
        type: form.value.type,
        path: form.value.path,
        status: form.value.status,
        creator: form.value.creator,
        createTime: form.value.createTime,
        updateTime: new Date().toISOString(),
      };
      await tradingSystemAPI.updateTradingSystem(form.value.id, payload);
      ElMessage.success('编辑成功');
    } else {
      const now = new Date().toISOString();
      const payload = {
        name: form.value.name,
        type: form.value.type,
        path: form.value.path,
        status: form.value.status,
        creator: 'hx00001',
        createTime: now,
        updateTime: now,
      };
      await tradingSystemAPI.createTradingSystem(payload);
      ElMessage.success('新增成功');
    }

    dialogVisible.value = false;
    currentPage.value = 1;
    await fetchTradingSystems();
  } catch (error) {
    if (error !== false) {
      console.error('保存交易系统失败:', error);
      ElMessage.error('保存失败');
    }
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  form.value = {
    id: '',
    name: '',
    type: '',
    path: '',
    status: 'active',
  };
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

const getTypeLabel = (type) => {
  const typeMap = {
    ldp: 'LDP',
    qmt: 'QMT',
    atx: 'ATX',
  };
  return typeMap[type] || type;
};

const handleRefresh = async () => {
  const success = await fetchTradingSystems();
  if (success) {
    ElMessage.success('刷新成功');
  }
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  ensurePageInRange();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  ensurePageInRange();
};

onMounted(() => {
  fetchTradingSystems();
});
</script>

<style scoped>
.trading-system {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 80vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
  background: white;
  border-radius: 8px;
  height: 60px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.table-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table__header-wrapper) {
  background-color: #fafafa;
}

:deep(.el-table th) {
  background-color: #fafafa !important;
}
</style>
