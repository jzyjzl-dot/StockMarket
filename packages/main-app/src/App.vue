<template>
  <div class="host-layout">
    <header class="host-header">
      <div class="logo">Host</div>
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/frontend">前端子应用</router-link>
      </nav>
    </header>

    <main class="host-main">
      <!-- 路由视图 -->
      <router-view />
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
.nav a.router-link-active {
  font-weight: 600;
}
.host-main {
  flex: 1;
  overflow: auto;
}
.micro-container {
  height: 100%;
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.home-content h1 {
  color: #409eff;
  margin-bottom: 16px;
}

.home-content p {
  color: #606266;
  font-size: 14px;
}
</style>

