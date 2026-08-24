import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';

// 单文件构建：所有 JS/CSS 内联进 dist/index.html，便于整体嵌入 Worker 的 TS 模板字符串
export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 10000,
  },
});
