<template>
  <div class="trading-system">
    <div class="page-header">
      <h2>交易系统</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="交易系统ID" width="120" />
        <el-table-column prop="name" label="交易系统名称" width="180" />
        <el-table-column prop="type" label="交易系统类型" width="150">
          <template #default="scope">
            {{ getTypeLabel(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="共享目录" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'active' ? 'success' : 'danger'"
            >
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="creator" label="创建人" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
            >
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

    <!-- 新增/编辑对话框 -->
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
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 响应式数据
const loading = ref(false);
const tableData = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const isEdit = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 表单数据
const form = ref({
  id: '',
  name: '',
  type: '',
  path: '',
  status: 'active',
});

const formRef = ref();

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入交易系统名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择交易系统类型', trigger: 'change' }],
  path: [{ required: true, message: '请输入共享目录路径', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 初始化数据
const initData = () => {
  tableData.value = [
    {
      id: '72',
      name: 'TradeData_Wu',
      type: 'ldp',
      path: '/home/hts_hx/tradeData_Wu',
      status: 'active',
      createTime: '2024-03-20 14:51:16',
      creator: 'hx00007',
    },
    {
      id: '71',
      name: 'TradeData_web',
      type: 'qmt',
      path: '/home/hts_hx/tradeData_web',
      status: 'active',
      createTime: '2024-03-18 17:15:22',
      creator: 'hx00006',
    },
    {
      id: '70',
      name: 'TradeData_web',
      type: 'atx',
      path: '/home/hts_hx/tradeData_web',
      status: 'active',
      createTime: '2024-03-14 15:03:18',
      creator: 'hx00006',
    },
    {
      id: '55',
      name: 'TradeData_x50',
      type: 'ldp',
      path: '/home/hts_hx/tradeData_x50',
      status: 'inactive',
      createTime: '2024-03-11 17:07:34',
      creator: 'hx00007',
    },
  ];
  total.value = tableData.value.length;
};

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增交易系统';
  isEdit.value = false;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑交易系统';
  isEdit.value = true;
  form.value = { ...row };
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除交易系统 "${row.name}" 吗？`,
      '确认删除',
      {
        type: 'warning',
      }
    );

    const index = tableData.value.findIndex((item) => item.id === row.id);
    if (index > -1) {
      tableData.value.splice(index, 1);
      total.value = tableData.value.length;
      ElMessage.success('删除成功');
    }
  } catch {
    // 用户取消删除
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    if (isEdit.value) {
      // 编辑
      const index = tableData.value.findIndex(
        (item) => item.id === form.value.id
      );
      if (index > -1) {
        tableData.value[index] = { ...form.value };
        ElMessage.success('编辑成功');
      }
    } else {
      // 新增
      const newItem = {
        ...form.value,
        id: Date.now().toString(),
        createTime: new Date().toLocaleString('zh-CN'),
        creator: 'hx00001', // 当前用户
      };
      tableData.value.unshift(newItem);
      total.value = tableData.value.length;
      ElMessage.success('新增成功');
    }

    dialogVisible.value = false;
  } catch {
    // 表单验证失败
  }
};

// 重置表单
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

// 获取类型标签
const getTypeLabel = (type) => {
  const typeMap = {
    ldp: 'LDP',
    qmt: 'QMT',
    atx: 'ATX',
  };
  return typeMap[type] || type;
};

// 刷新
const handleRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    initData();
    loading.value = false;
    ElMessage.success('刷新成功');
  }, 500);
};

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 组件挂载时初始化数据
onMounted(() => {
  initData();
});
</script>

<style scoped>
.trading-system {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
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
