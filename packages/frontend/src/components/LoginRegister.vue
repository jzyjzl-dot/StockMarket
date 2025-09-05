<script setup>
import { ref, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

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

const isLogin = ref(true);

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

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  // 清除表单
  formData.value = {
    username: '',
    account: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
};

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      await userStore.login(formData.value.account, formData.value.password);
      ElMessage.success('登录成功');
      router.push('/main');
    } else {
      if (formData.value.password === formData.value.confirmPassword) {
        await userStore.register(
          formData.value.username,
          formData.value.email,
          formData.value.password
        );
        alert('注册成功');
        router.push('/main');
      } else {
        alert('密码不匹配');
      }
    }
  } catch (error) {
    alert(error.message);
  }
};
</script>

<template>
  <div class="auth-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ isLogin ? '登录' : '注册' }}</span>
        </div>
      </template>
      <el-form :model="formData" label-width="80px">
        <el-form-item v-if="!isLogin" label="用户名">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="isLogin" label="账号">
          <el-input v-model="formData.account" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item v-if="!isLogin" label="邮箱">
          <el-input
            v-model="formData.email"
            type="email"
            placeholder="请输入邮箱"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item v-if="!isLogin" label="确认密码">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请确认密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">{{
            isLogin ? '登录' : '注册'
          }}</el-button>
          <el-button @click="toggleMode">{{
            isLogin ? '切换到注册' : '切换到登录'
          }}</el-button>
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
</style>
