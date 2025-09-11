import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router';
import './style.css';
import './styles/responsive.css';
import './styles/theme.css';
import resizableColumns from './directives/resizableColumns.js';
import App from './App.vue';

let appInstance = null;

function render(props = {}) {
  const { container } = props;
  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.use(ElementPlus);
  app.directive('resizable-columns', resizableColumns);

  const mountPoint = container || document.querySelector('#app');
  app.mount(mountPoint || '#app');
  appInstance = app;
}

// 独立运行时直接渲染
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// qiankun 生命周期钩子
export async function bootstrap() {
  // 可做预加载、全局初始化等
}

export async function mount(props) {
  render(props);
}

export async function unmount() {
  if (appInstance) {
    appInstance.unmount();
    appInstance = null;
  }
}
