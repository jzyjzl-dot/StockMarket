import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../shared/src'),
      '@ui': resolve(__dirname, '../ui/src'),
    },
  },
  server: {
    port: 5175,
    host: '0.0.0.0',
  },
});
