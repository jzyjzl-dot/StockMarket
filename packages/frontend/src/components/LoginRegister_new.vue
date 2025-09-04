<script setup>
import { ref, watch, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();

watch(
  () => userStore.isLoggedIn,
  (newVal) => {
    if (!newVal) {
      formData.value = {
        username: '',
        account: '',
        email: '',
        password: '',
        confirmPassword: '',
      };
    }
  }
);

const formData = ref({
  username: '',
  account: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// 检查是否有预选的用户名
onMounted(() => {
  const selectedUsername = sessionStorage.getItem('selectedUsername');
  if (selectedUsername) {
    formData.value.account = selectedUsername;
    // 清除sessionStorage中的数据，避免重复使用
    sessionStorage.removeItem('selectedUsername');
  }
});

const handleSubmit = async () => {
  try {
    await userStore.login(formData.value.account, formData.value.password);
    ElMessage({
      message: '登录成功',
      type: 'success',
      plain: true,
    });
    router.push('/main');
  } catch (error) {
    ElMessage({
      message: error.message,
      type: 'error',
      plain: true,
    });
  }
};
</script>

<template>
  <div class="auth-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>弈宸多券商交易系统</span>
        </div>
      </template>
      <el-form
        :model="formData"
        size="large"
        class="center-form"
        style="margin: 20px"
      >
        <el-form-item>
          <el-input
            v-model="formData.account"
            placeholder="请输入账号"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 250px" @click="handleSubmit">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.card-header {
  text-align: center;
}

.center-form :deep(.el-form-item__content) {
  justify-content: center;
}
</style>
