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
import {
  renderWithQiankun,
  qiankunWindow,
} from 'vite-plugin-qiankun/dist/helper';

let appInstance = null;
let mounted = false;

function render(props = {}) {
  if (mounted) {
    console.log('App already mounted, skipping...');
    return;
  }

  const { container } = props;
  console.log('Rendering with container:', container);

  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.use(ElementPlus);
  app.directive('resizable-columns', resizableColumns);

  // Prefer mounting inside the host-provided container
  const preferred =
    container && (container.querySelector?.('#app') || container);
  const mountPoint = preferred || document.querySelector('#app');

  console.log('Mount point:', mountPoint);

  if (!mountPoint) {
    console.error('No mount point found!');
    return;
  }

  app.mount(mountPoint);
  appInstance = app;
  mounted = true;

  console.log('Frontend app mounted successfully');
}

// Standalone run
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}

// Qiankun lifecycle (dev/prod compatible)
renderWithQiankun({
  async bootstrap() {
    console.log('Frontend sub-app bootstrapped');
  },
  async mount(props) {
    console.log('Frontend sub-app mounting with props:', props);
    if (mounted) {
      console.log('Already mounted, skipping...');
      return;
    }
    render(props);
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      await router.isReady();
      router.push('/');
    }
  },
  async unmount(props) {
    console.log('Frontend sub-app unmounting');
    if (appInstance) {
      appInstance.unmount();
      appInstance = null;
    }
    const { container } = props || {};
    const target =
      container && (container.querySelector?.('#app') || container);
    if (target && target.innerHTML) target.innerHTML = '';
    mounted = false;
  },
});
