<template>
  <div class="management-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>设备信息采集</h2>
          <p>采集和管理设备信息</p>
        </div>
      </template>

      <div class="content">
        <el-empty description="设备信息采集功能开发中...">
          <el-button type="primary">开始配置</el-button>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

onMounted(() => {
  console.log('设备信息采集页面加载完成')
})
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
