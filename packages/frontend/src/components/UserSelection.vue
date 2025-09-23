<template>
  <div class="user-selection-container">
    <el-card class="user-selection-card">
      <template #header>
        <div class="card-header">
          <h2>选择用户登录</h2>
          <p>点击下方按钮选择要登录的用户</p>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>加载用户列表中...</span>
      </div>

      <div v-else-if="users.length === 0" class="empty-container">
        <el-empty description="暂无用户数据">
          <el-button type="primary" @click="goToRegister">前往注册</el-button>
        </el-empty>
      </div>

      <div v-else class="users-grid">
        <el-row :gutter="20">
          <el-col
            v-for="user in users"
            :key="user.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <el-card
              class="user-card"
              shadow="hover"
              @click="selectUser(user.username)"
            >
              <div class="user-info">
                <div class="username">{{ user.username }}</div>
                <div class="role-badge">
                  <el-tag :type="getRoleType(user.role)" size="small">
                    {{ getRoleText(user.role) }}
                  </el-tag>
                </div>
                <div class="email">{{ user.email }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="actions">
        <el-button type="primary" @click="goToRegister">新用户注册</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userAPI } from '../utils/api.js';
import { Loading } from '@element-plus/icons-vue';

const router = useRouter();
const users = ref([]);
const loading = ref(false);

// 角色类型映射
const getRoleType = (role) => {
  const roleTypes = {
    manager: 'danger',
    trader: 'success',
    viewer: 'info',
  };
  return roleTypes[role] || 'info';
};

// 角色文本映射
const getRoleText = (role) => {
  const roleTexts = {
    manager: '管理员',
    trader: '交易员',
    viewer: '观察者',
  };
  return roleTexts[role] || role;
};

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    const userList = await userAPI.getUsers();
    users.value = userList;
  } catch (error) {
    console.error('获取用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 选择用户并跳转到登录页面
const selectUser = (username) => {
  // 将选中的用户名存储到 sessionStorage
  sessionStorage.setItem('selectedUsername', username);
  // 跳转到登录页
  router.push('/login');
};

// 跳转到注册页
const goToRegister = () => {
  // 清除任何预选的用户
  sessionStorage.removeItem('selectedUsername');
  // 跳转到登录页面（注册模式）
  router.push('/login');
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-selection-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.user-selection-card {
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.loading-container {
  text-align: center;
  padding: 40px;
}

.loading-container .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-container {
  text-align: center;
  padding: 40px;
}

.users-grid {
  margin-bottom: 30px;
}

.user-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.user-info {
  text-align: center;
  width: 100%;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.role-badge {
  margin-bottom: 8px;
}

.email {
  font-size: 12px;
  color: #999;
}

.actions {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设置 */
@media (max-width: 768px) {
  .user-selection-container {
    padding: 10px;
  }

  .user-selection-card {
    margin: 10px;
  }

  .card-header h2 {
    font-size: 20px;
  }

  .user-card {
    height: 100px;
  }

  .username {
    font-size: 16px;
  }
}
</style>
