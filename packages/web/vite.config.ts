import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';
import importToCDN from 'vite-plugin-cdn-import';

// 单文件构建：应用 JS/CSS 内联进 dist/index.html，便于整体嵌入 Worker 的 TS 模板字符串；
// vue 由 vite-plugin-cdn-import 外置到 jsDelivr CDN（vue.global.prod.js → window.Vue），
// openai SDK 在 App.vue 里通过 jsDelivr +esm 动态加载，均不进 bundle。
export default defineConfig({
  plugins: [
    vue(),
    importToCDN({
      modules: [
        {
          name: 'vue',
          var: 'Vue',
          path: 'https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.prod.js',
        },
      ],
    }),
    viteSingleFile(),
  ],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 10000,
  },
});
