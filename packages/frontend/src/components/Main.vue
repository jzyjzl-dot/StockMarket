<script setup>
import { useUserStore } from '../stores/userStore';
import { ref, onMounted, watch } from 'vue';
import {
  ArrowDown,
  Management,
  Money,
  Fold,
  Expand,
  Document,
} from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const dialogVisible = ref(false);
const isLocked = ref(false);
const unlockPassword = ref('');
const isSidebarCollapsed = ref(false);

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

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
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
      <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
        <div class="sidebar-header">
          <el-button
            size="small"
            text
            :title="isSidebarCollapsed ? '展开侧栏' : '收起侧栏'"
            @click="toggleSidebar"
          >
            <el-icon>
              <component :is="isSidebarCollapsed ? Expand : Fold" />
            </el-icon>
          </el-button>
        </div>
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          :router="true"
          :collapse="isSidebarCollapsed"
        >
          <el-menu-item index="/"> 首页 </el-menu-item>
          <el-menu-item index="/monitoring"> 交易监控 </el-menu-item>
          <el-menu-item index="/reports">
            <el-icon><Document /></el-icon>
            报表查询
          </el-menu-item>
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

      <!-- 收起后显示一个悬浮展开按钮，不占用布局宽度 -->
      <div
        v-if="isSidebarCollapsed"
        class="sidebar-floating-toggle"
        :title="'展开侧栏'"
      >
        <el-button circle size="small" @click="toggleSidebar">
          <el-icon><Expand /></el-icon>
        </el-button>
      </div>

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
  justify-content: flex-start;
  height: 100vh;
  width: 100%;
  overflow-x: hidden; /* 避免页面级横向滚动 */
}

.top-bar {
  background-color: #333;
  color: white;
  padding: 0 16px;
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
  /* 固定内容区高度，确保侧边栏内部滚动而非撑高页面 */
  height: calc(100vh - var(--topbar-height));
  min-height: 0;
  overflow: hidden;
  position: relative;
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
  overflow: auto; /* 允许内部滚动，避免裁剪内容 */
  position: relative;
  z-index: 1;
}

.sidebar {
  width: 200px;
  background-color: #f4f4f4;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative; /* 建立堆叠上下文 */
  z-index: 10; /* 保持在主内容之上 */
  transition: width 0.2s ease;
}

.sidebar-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  box-sizing: border-box;
}

.sidebar.collapsed {
  width: 0;
  min-width: 0;
  border: 0;
}

.sidebar.collapsed > * {
  display: none; /* 收起时隐藏侧栏内部内容 */
}

.sidebar-floating-toggle {
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 20;
}

/* 确保侧栏收起时主内容占满空间 */
.sidebar {
  width: var(--sidebar-width);
  flex: 0 0 var(--sidebar-width);
}
.sidebar.collapsed {
  flex-basis: 0;
}
.main-content {
  min-width: 0;
}
</style>
