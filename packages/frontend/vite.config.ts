import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 将本应用注册为 qiankun 子应用，名称需与主应用注册保持一致
    qiankun('frontend', {
      // 开发模式下启用，便于本地独立运行调试
      useDevMode: true,
    }),
  ],
  base: process.env.VITE_BASE || '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared/src', import.meta.url)),
      '@ui': fileURLToPath(new URL('../ui/src', import.meta.url)),
    },
  },
  server: {
    port: 5175,
    host: '0.0.0.0',
  },
});
