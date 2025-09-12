import { createApp, h, defineComponent } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { start, loadMicroApp } from 'qiankun';
import App from './App.vue';

// Host routes: provide stub components
const Home = defineComponent({
  name: 'HomeStub',
  render() {
    return h('div', { class: 'home-content' }, [
      h('h1', '欢迎使用股票交易系统'),
      h('p', '请选择要访问的子应用'),
    ]);
  },
});

const Micro = defineComponent({
  name: 'MicroStub',
  data() {
    return {
      microApp: null,
    };
  },
  render() {
    return h(
      'div',
      {
        id: 'micro-container',
        style: 'height: 100%; width: 100%; border: 1px solid red;',
      },
      'Loading micro app...'
    );
  },
  async mounted() {
    console.log('Micro container mounted');
    const container = document.querySelector('#micro-container');
    if (!container) {
      console.error('Container #micro-container not found!');
      return;
    }
    try {
      console.log('Container found, loading sub-app...');
      this.microApp = loadMicroApp({
        name: 'frontend',
        entry: '//localhost:5175',
        container,
        props: {
          routerBase: '/frontend',
        },
      });
      console.log('Sub-app loading initiated');
      await this.microApp.mountPromise;
      console.log('Sub-app mounted successfully');
    } catch (error) {
      console.error('Failed to load sub-app:', error);
    }
  },
  unmounted() {
    try {
      this.microApp?.unmount();
    } catch {}
  },
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/frontend', name: 'frontend', component: Micro },
    { path: '/frontend/:pathMatch(.*)*', name: 'frontendCatchAll', component: Micro },
  ],
});

// Mount host
const app = createApp({
  render: () => h(App),
});
app.use(ElementPlus);
app.use(router);
app.mount('#app');

// Start qiankun with minimal config
start({
  sandbox: { experimentalStyleIsolation: false },
  prefetch: false,
});

