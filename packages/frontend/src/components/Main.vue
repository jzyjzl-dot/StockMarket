<script setup>
import { useUserStore } from '../stores/userStore';
import { ref, onMounted, watch } from 'vue';
import { ArrowDown, Management, Money } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const dialogVisible = ref(false);
const isLocked = ref(false);
const unlockPassword = ref('');

onMounted(() => {
  const locked = localStorage.getItem('isLocked');
  if (locked === 'true') {
    isLocked.value = true;
  }
});

watch(isLocked, (newVal) => {
  localStorage.setItem('isLocked', newVal.toString());
});

watch(unlockPassword, (newVal) => {
  if (newVal === '1234') {
    unlock();
  }
});

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const logout = () => {
  userStore.logout();
  isLocked.value = false;
  alert('已登出');
  router.push('/login');
};

const switchUser = () => {
  // 先登出当前用户，然后跳转到用户选择页面
  userStore.logout();
  router.push('/user-selection');
};

const openPasswordDialog = () => {
  dialogVisible.value = true;
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
};

const updatePassword = async () => {
  try {
    if (passwordForm.value.newPassword === passwordForm.value.confirmPassword) {
      await userStore.updatePassword(
        passwordForm.value.oldPassword,
        passwordForm.value.newPassword
      );
      alert('密码修改成功，已登出');
      userStore.logout();
      dialogVisible.value = false;
    } else {
      alert('新密码不匹配');
    }
  } catch (error) {
    alert(error.message);
  }
};

const handleCommand = (command) => {
  if (command === 'changePassword') {
    openPasswordDialog();
  } else if (command === 'switchUser') {
    switchUser();
  } else if (command === 'logout') {
    logout();
  }
};

const lockScreen = () => {
  isLocked.value = true;
};

const unlock = () => {
  if (unlockPassword.value === '1234') {
    isLocked.value = false;
    unlockPassword.value = '';
  } else {
    alert('密码错误');
  }
};
</script>

<template>
  <div class="main-layout">
    <!-- 顶部栏 -->
    <header class="top-bar">
      <h1>主界面</h1>
      <div class="user-info">
        <span>欢迎,</span>

        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            {{ userStore.userInfo?.username || userStore.userInfo?.email }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="changePassword"
                >修改密码</el-dropdown-item
              >
              <el-dropdown-item command="switchUser">切换用户</el-dropdown-item>
              <el-dropdown-item command="logout">登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button size="small" @click="lockScreen">锁定</el-button>
      </div>
    </header>

    <div class="content">
      <!-- 左侧栏 -->
      <aside class="sidebar">
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          :router="true"
        >
          <el-menu-item index="/"> 首页 </el-menu-item>
          <el-menu-item index="/products"> 产品管理 </el-menu-item>
          <el-menu-item index="/monitoring"> 交易监控 </el-menu-item>
          <el-menu-item index="/trade"> 交易 </el-menu-item>
          <el-menu-item index="/risk"> 风控设置 </el-menu-item>
          <el-menu-item index="/users"> 用户管理 </el-menu-item>

          <!-- 交易子菜单 -->
          <el-sub-menu index="trading">
            <template #title>
              <el-icon><Money /></el-icon>
              <span>交易</span>
            </template>
            <el-menu-item index="/trading/normal">普通交易</el-menu-item>
            <el-menu-item index="/trading/algo-multi"
              >算法多账号交易</el-menu-item
            >
            <el-menu-item index="/trading/t0-multi"
              >T0多账户号交易</el-menu-item
            >
          </el-sub-menu>

          <!-- 管理子菜单 -->
          <el-sub-menu index="management">
            <template #title>
              <el-icon><Management /></el-icon>
              <span>管理</span>
            </template>
            <el-menu-item index="/management/account-edit"
              >账号编辑</el-menu-item
            >
            <el-menu-item index="/management/account-group-edit"
              >账号组编辑</el-menu-item
            >
            <el-menu-item index="/management/risk-management"
              >风控管理</el-menu-item
            >
            <el-menu-item index="/management/role-management"
              >角色管理</el-menu-item
            >
            <el-menu-item index="/management/process-management"
              >流程管理</el-menu-item
            >
            <el-menu-item index="/management/approval-function"
              >审批功能</el-menu-item
            >
            <el-menu-item index="/management/device-info"
              >设备信息采集</el-menu-item
            >
          </el-sub-menu>
        </el-menu>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="dialogVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="旧密码">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updatePassword">确定</el-button>
      </template>
    </el-dialog>

    <!-- 解锁对话框 -->
    <el-dialog
      v-model="isLocked"
      title="解锁"
      :close-on-click-modal="false"
      :show-close="false"
      width="300px"
    >
      <el-form>
        <el-form-item label="密码">
          <el-input
            v-model="unlockPassword"
            type="password"
            @keyup.enter="unlock"
          />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}

.top-bar {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #f8f8f8;
  display: flex;
  align-items: center;
}

.content {
  display: flex;
  flex: 1;
  height: calc(100vh - 60px); /* 减去顶部栏的高度 */
}

.sidebar {
  width: 200px;
  background-color: #f4f4f4;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.main-content {
  flex: 1;
  padding: 20px;
}
</style>
