---
name: deploy
description: 部署到 Cloudflare Workers
license: MIT
metadata:
  version: "2.0.0"
  author: Steven-Qiang
  tags: ["cloudflare", "workers", "deploy", "pnpm"]
---
# 部署 Deploy

部署到 Cloudflare Workers（pnpm monorepo）。

## 流程

1. 检查是否已安装依赖（根目录 node_modules 是否存在），未安装则执行 `pnpm install`（pnpm store 如有沙箱问题可加 `--store-dir .pnpm-store`）
2. 执行 `pnpm run deploy`
   - 等价于 `pnpm run build:page && pnpm -F cj2deepseek-worker deploy`
   - `build:page` 会先构建 packages/web（Vite 单文件）并内嵌进 `packages/worker/src/page.ts`
3. 输出部署结果：Worker URL、部署状态

## 本地预览

- 整体本地测试：`pnpm run dev`（自动先 `build:page` 再 `wrangler dev`），默认监听 `http://localhost:8787`
- 只开发测试页：`pnpm run dev:page`（Vite dev server，热更新）

## 搭配 cftunnel

本地开发时可用 `cftunnel quick 8787` 生成临时公网地址，方便远程调试。

## 注意事项

- `packages/worker/src/page.ts` 是**生成文件且已加入 .gitignore**，不要手改也不要提交；改页面请改 `packages/web/src/`
- `dev` / `deploy` / `deploy:edgeone` / `typecheck` 都会自动先执行 `build:page`，无需手动生成
- EdgeOne 部署：`pnpm run deploy:edgeone`（自动先构建页面）
