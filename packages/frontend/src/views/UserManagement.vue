<template>
  <div class="user-management">
    <h2>用户管理</h2>

    <el-table
      v-resizable-columns
      v-loading="loading"
      :data="users"
      style="width: 100%; max-width: 1200px"
      :header-cell-style="{ textAlign: 'center', padding: '16px 8px' }"
      :cell-style="{ textAlign: 'center', padding: '16px 8px' }"
    >
      <el-table-column
        prop="username"
        label="用户名"
        min-width="150"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        min-width="250"
        align="center"
      ></el-table-column>
      <el-table-column prop="role" label="角色" min-width="120" align="center">
        <template #default="scope">
          <el-tag :type="getRoleTagType(scope.row.role)">
            {{ getRoleDisplayName(scope.row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200" align="center">
        <template #default="scope">
          <el-button
            size="small"
            :disabled="scope.row.id === currentUser?.id"
            type="primary"
            @click="editUserRole(scope.row)"
          >
            编辑权限
          </el-button>
          <el-button
            size="small"
            :disabled="scope.row.id === currentUser?.id"
            type="danger"
            @click="deleteUser(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑权限对话框 -->
    <el-dialog v-model="roleDialogVisible" title="编辑用户权限" width="400px">
      <div class="role-edit-form">
        <p><strong>用户：</strong>{{ selectedUser?.username }}</p>
        <p><strong>邮箱：</strong>{{ selectedUser?.email }}</p>

        <el-form :model="roleForm" label-width="80px">
          <el-form-item label="角色">
            <el-select v-model="roleForm.role" placeholder="选择角色">
              <el-option label="管理员" value="manager"></el-option>
              <el-option label="交易员" value="trader"></el-option>
              <el-option label="观察者" value="viewer"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="updating"
            @click="confirmRoleUpdate"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px">
      <p>
        确定要删除用户 <strong>{{ selectedUser?.username }}</strong> 吗？
      </p>
      <p class="warning-text">此操作不可撤销！</p>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" :loading="deleting" @click="confirmDelete">
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { userAPI } from '@/utils/api.js';
import { useUserStore } from '@/stores/userStore.js';

// 响应式数据
const users = ref([]);
const loading = ref(false);
const updating = ref(false);
const deleting = ref(false);

// 对话框状态
const roleDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const selectedUser = ref(null);
const roleForm = ref({ role: '' });

// 用户store
const userStore = useUserStore();
const currentUser = userStore.userInfo;

// 获取角色显示名称
const getRoleDisplayName = (role) => {
  const roleMap = {
    manager: '管理员',
    trader: '交易员',
    viewer: '观察者',
  };
  return roleMap[role] || role;
};

// 获取角色标签类型
const getRoleTagType = (role) => {
  const typeMap = {
    manager: 'danger',
    trader: 'success',
    viewer: 'info',
  };
  return typeMap[role] || '';
};

// 加载用户列表
const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await userAPI.getUsers();
  } catch (error) {
    ElMessage.error('加载用户列表失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

// 编辑用户权限
const editUserRole = (user) => {
  selectedUser.value = user;
  roleForm.value.role = user.role;
  roleDialogVisible.value = true;
};

// 确认更新权限
const confirmRoleUpdate = async () => {
  if (!selectedUser.value || !roleForm.value.role) {
    ElMessage.warning('请选择角色');
    return;
  }

  console.log('Updating user:', selectedUser.value);
  console.log('New role:', roleForm.value.role);
  console.log('User ID type:', typeof selectedUser.value.id);
  console.log('User ID value:', selectedUser.value.id);

  updating.value = true;
  try {
    const updatedUser = await userAPI.updateUserRole(
      String(selectedUser.value.id), // 确保ID是字符串类型
      roleForm.value.role
    );

    console.log('API response:', updatedUser);

    if (updatedUser) {
      // 更新本地用户列表
      console.log('Users before update:', users.value);
      const index = users.value.findIndex((u) => {
        console.log(
          'Comparing:',
          u.id,
          'with',
          selectedUser.value.id,
          'types:',
          typeof u.id,
          typeof selectedUser.value.id
        );
        return String(u.id) === String(selectedUser.value.id); // 确保类型一致
      });
      console.log('Found index:', index);

      if (index !== -1) {
        users.value[index] = updatedUser;
        console.log('Users after update:', users.value);
      }

      ElMessage.success('用户权限更新成功');
      roleDialogVisible.value = false;
    } else {
      ElMessage.error('用户权限更新失败 - API返回空值');
    }
  } catch (error) {
    console.error('Update error:', error);
    ElMessage.error('更新失败：' + error.message);
  } finally {
    updating.value = false;
  }
};

// 删除用户
const deleteUser = (user) => {
  selectedUser.value = user;
  deleteDialogVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  deleting.value = true;
  try {
    const success = await userAPI.deleteUser(selectedUser.value.id);

    if (success) {
      // 从本地用户列表中移除
      users.value = users.value.filter((u) => u.id !== selectedUser.value.id);
      ElMessage.success('用户删除成功');
      deleteDialogVisible.value = false;
    } else {
      ElMessage.error('用户删除失败');
    }
  } catch (error) {
    ElMessage.error('删除失败：' + error.message);
  } finally {
    deleting.value = false;
  }
};

// 组件挂载时加载用户列表
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-management {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-management h2 {
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  width: 100%;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e4e7ed;
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057 !important;
  font-weight: 600 !important;
  border-bottom: 2px solid #dee2e6 !important;
  padding: 16px 8px !important;
  text-align: center !important;
  font-size: 14px;
}

:deep(.el-table td) {
  padding: 16px 8px !important;
  text-align: center !important;
  border-bottom: 1px solid #f1f3f4 !important;
  color: #495057;
  font-size: 14px;
}

:deep(.el-table tr:hover td) {
  background-color: #f8f9fa !important;
}

/* 表格行交替颜色 */
:deep(.el-table .el-table__row--striped td) {
  background-color: #fafbfc !important;
}

:deep(.el-table .el-table__row--striped:hover td) {
  background-color: #f1f3f4 !important;
}

/* 表格边框优化 */
:deep(.el-table__inner-wrapper) {
  border-radius: 12px;
}

/* 表格头部优化 */
:deep(.el-table__header-wrapper) {
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

/* 表格主体优化 */
:deep(.el-table__body-wrapper) {
  border-radius: 0 0 12px 12px;
}

/* 强制表头和内容居中对齐 */
:deep(.el-table .el-table__cell) {
  text-align: center !important;
  padding: 16px 8px !important;
}

:deep(.el-table th .cell) {
  justify-content: center !important;
  padding: 0 !important;
}

:deep(.el-table td .cell) {
  justify-content: center !important;
  padding: 0 !important;
}

/* 按钮样式 */
:deep(.el-button) {
  margin: 0 4px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-button--small) {
  padding: 8px 16px;
  font-size: 12px;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 标签样式 */
:deep(.el-tag) {
  margin: 0;
  border-radius: 4px;
  font-weight: 500;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  margin: 0;
  padding: 24px 24px 16px;
  border-radius: 12px 12px 0 0;
}

:deep(.el-dialog__title) {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

.warning-text {
  color: #f56c6c;
  margin: 10px 0;
  font-weight: 500;
}

.role-edit-form {
  padding: 10px 0;
}

.role-edit-form p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.role-edit-form p strong {
  color: #303133;
  margin-right: 8px;
}

/* 表单样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-select) {
  width: 100%;
}

/* 加载状态样式 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management {
    padding: 15px;
    max-width: 100%;
  }

  .user-management h2 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  :deep(.el-table) {
    font-size: 14px;
    max-width: 100%;
  }

  :deep(.el-button--small) {
    padding: 5px 10px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .user-management {
    padding: 10px;
  }

  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 12px 4px !important;
    font-size: 12px;
  }

  :deep(.el-button--small) {
    padding: 4px 8px;
    font-size: 10px;
  }
}
</style>
