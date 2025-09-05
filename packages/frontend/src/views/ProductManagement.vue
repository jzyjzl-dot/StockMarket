<template>
  <div class="product-management">
    <div class="page-header">
      <h2>产品管理</h2>
      <p class="page-description">管理股票交易产品信息</p>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="addProduct">
        <el-icon><Plus /></el-icon>
        添加产品
      </el-button>
      <el-button @click="loadProducts">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 产品列表 -->
    <el-card class="products-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>产品列表</span>
        </div>
      </template>

      <el-table
        v-resizable-columns
        v-loading="loading"
        :data="products"
        style="width: 100%"
      >
        <el-table-column label="ID" width="80" align="center">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="产品名称"
          min-width="150"
        ></el-table-column>
        <el-table-column prop="price" label="价格" width="120" align="right">
          <template #default="scope"> ¥{{ scope.row.price }} </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          min-width="200"
        ></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="editProduct(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="confirmDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑产品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑产品' : '添加产品'"
      width="500px"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="productForm.price"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%"
            placeholder="请输入价格"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入产品描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          {{ isEditing ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px">
      <p>确定要删除产品 "{{ currentProduct?.name }}" 吗？</p>
      <p class="warning-text">此操作不可撤销。</p>

      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          :loading="deleteLoading"
          @click="deleteProduct"
        >
          确认删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Refresh, List } from '@element-plus/icons-vue';
import { productAPI } from '../utils/api.js';

// 响应式数据
const products = ref([]);
const loading = ref(false);
const submitLoading = ref(false);
const deleteLoading = ref(false);
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const isEditing = ref(false);
const currentProduct = ref(null);

// 产品表单
const productForm = reactive({
  name: '',
  price: 0,
  description: '',
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '产品名称长度应在2-50个字符', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入产品描述', trigger: 'blur' },
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' },
  ],
};

const productFormRef = ref();

// 方法
const loadProducts = async () => {
  loading.value = true;
  try {
    const data = await productAPI.getProducts();
    products.value = data;
    ElMessage.success('产品加载成功');
  } catch {
    ElMessage.error('加载产品失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const addProduct = () => {
  isEditing.value = false;
  Object.assign(productForm, {
    name: '',
    price: 0,
    description: '',
  });
  dialogVisible.value = true;
};

const editProduct = (product) => {
  isEditing.value = true;
  currentProduct.value = product;
  Object.assign(productForm, {
    name: product.name,
    price: product.price,
    description: product.description,
  });
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!productFormRef.value) return;

  try {
    await productFormRef.value.validate();
  } catch {
    return;
  }

  submitLoading.value = true;
  try {
    if (isEditing.value) {
      await productAPI.updateProduct(currentProduct.value.id, productForm);
      ElMessage.success('产品更新成功');
    } else {
      await productAPI.addProduct(productForm);
      ElMessage.success('产品添加成功');
    }
    dialogVisible.value = false;
    await loadProducts();
  } catch (error) {
    ElMessage.error(
      `${isEditing.value ? '更新' : '添加'}产品失败: ${error.message}`
    );
  } finally {
    submitLoading.value = false;
  }
};

const confirmDelete = (product) => {
  currentProduct.value = product;
  deleteDialogVisible.value = true;
};

const deleteProduct = async () => {
  if (!currentProduct.value) return;

  deleteLoading.value = true;
  try {
    await productAPI.deleteProduct(currentProduct.value.id);
    ElMessage.success('产品删除成功');
    deleteDialogVisible.value = false;
    await loadProducts();
  } catch (error) {
    ElMessage.error('删除产品失败: ' + error.message);
  } finally {
    deleteLoading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.product-management {
  padding: 20px;
  max-width: 1200px;
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

.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
}

.products-card {
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

.warning-text {
  color: #f56c6c;
  margin-top: 10px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-management {
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
</style>
