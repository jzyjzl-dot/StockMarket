import { createApp, h } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { registerMicroApps, start } from 'qiankun';
import App from './App.vue';

// 简单的宿主路由：/ 与 /frontend*
const routes = [
  { path: '/', name: 'home' },
  { path: '/frontend', name: 'frontend' },
  { path: '/frontend/:pathMatch(.*)*', name: 'frontendCatchAll' },
];
const router = createRouter({ history: createWebHistory('/'), routes });

// 注册子应用：frontend（当前仓库里的 packages/frontend）
registerMicroApps([
  {
    name: 'frontend',
    entry: 'http://localhost:5175',
    container: '#micro-container',
    activeRule: (location) => location.pathname.startsWith('/frontend'),
    props: {},
  },
]);

// 启动 qiankun
start({ sandbox: { experimentalStyleIsolation: false } });

const app = createApp({
  render: () => h(App),
});
app.use(ElementPlus);
app.use(router);
app.mount('#app');

