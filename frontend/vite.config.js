import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // 代理所有 /api 请求到后端服务器
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // 代理所有 /uploads 请求到后端服务器，用于访问上传的图片
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
