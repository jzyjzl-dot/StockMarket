<template>
  <div class="management-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>流程管理</h2>
          <p>管理系统业务流程</p>
        </div>
      </template>

      <div class="content">
        <el-empty description="流程管理功能开发中...">
          <el-button type="primary">开始配置</el-button>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

onMounted(() => {
  console.log('流程管理页面加载完成');
});
</script>

<style scoped>
.management-page {
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
