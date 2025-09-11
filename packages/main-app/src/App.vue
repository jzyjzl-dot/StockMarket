<template>
  <div class="host-layout">
    <header class="host-header">
      <div class="logo">Host</div>
      <nav class="nav">
        <a href="/">首页</a>
        <a href="/frontend">前端子应用</a>
      </nav>
    </header>

    <main class="host-main">
      <!-- qiankun 子应用的容器 -->
      <div id="micro-container" class="micro-container"></div>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.host-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.host-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
}
.logo {
  font-weight: 700;
}
.nav a {
  margin-right: 12px;
  color: #409eff;
  text-decoration: none;
}
.host-main {
  flex: 1;
  overflow: auto;
}
.micro-container {
  height: 100%;
}
</style>

