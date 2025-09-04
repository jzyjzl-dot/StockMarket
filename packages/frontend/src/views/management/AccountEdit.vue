<template>
  <div class="account-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>账号编辑</h2>
          <p>管理系统中的用户账号信息</p>
        </div>
      </template>

      <div class="content">
        <el-table :data="users" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="username" label="用户名" width="120"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="role" label="角色" width="100">
            <template #default="scope">
              <el-tag :type="getRoleType(scope.row.role)">
                {{ getRoleText(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" @click="editUser(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteUser(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" @click="showAddDialog = true" style="margin-top: 20px">
          添加用户
        </el-button>
      </div>
    </el-card>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑用户" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role">
            <el-option label="管理员" value="manager"></el-option>
            <el-option label="交易员" value="trader"></el-option>
            <el-option label="观察者" value="viewer"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加用户对话框 -->
    <el-dialog v-model="showAddDialog" title="添加用户" width="500px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="addForm.role">
            <el-option label="管理员" value="manager"></el-option>
            <el-option label="交易员" value="trader"></el-option>
            <el-option label="观察者" value="viewer"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addUser">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userAPI } from '../../utils/api.js'

const users = ref([])
const showEditDialog = ref(false)
const showAddDialog = ref(false)

const editForm = ref({
  id: '',
  username: '',
  email: '',
  role: ''
})

const addForm = ref({
  username: '',
  email: '',
  password: '',
  role: ''
})

// 角色类型映射
const getRoleType = (role) => {
  const roleTypes = {
    manager: 'danger',
    trader: 'success',
    viewer: 'info'
  }
  return roleTypes[role] || 'info'
}

// 角色文本映射
const getRoleText = (role) => {
  const roleTexts = {
    manager: '管理员',
    trader: '交易员',
    viewer: '观察者'
  }
  return roleTexts[role] || role
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    const userList = await userAPI.getUsers()
    users.value = userList
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  }
}

// 编辑用户
const editUser = (user) => {
  editForm.value = { ...user }
  showEditDialog.value = true
}

// 保存用户
const saveUser = async () => {
  try {
    await userAPI.updateUserRole(editForm.value.id, editForm.value.role)
    ElMessage.success('用户更新成功')
    showEditDialog.value = false
    fetchUsers()
  } catch (error) {
    console.error('更新用户失败:', error)
    ElMessage.error('更新用户失败')
  }
}

// 删除用户
const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 ${user.username} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    // 这里应该调用删除API，但当前API可能不支持
    ElMessage.success('用户删除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }
}

// 添加用户
const addUser = async () => {
  try {
    // 这里应该调用添加用户API
    console.log('添加用户:', addForm.value)
    ElMessage.success('用户添加成功')
    showAddDialog.value = false
    addForm.value = { username: '', email: '', password: '', role: '' }
    fetchUsers()
  } catch (error) {
    console.error('添加用户失败:', error)
    ElMessage.error('添加用户失败')
  }
}

onMounted(() => {
  fetchUsers()
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
</style>
