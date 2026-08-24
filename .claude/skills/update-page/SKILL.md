---
name: update-page
description: 维护内置测试页面（packages/web 的 Vue 源码 → build:page 生成 page.ts）
license: MIT
metadata:
  version: "2.0.0"
  author: Steven-Qiang
  tags: ["vue", "page", "vite", "pnpm"]
---
# 更新测试页面 Update Page

修改内置测试页面。页面是 **Vue 3 + TypeScript** 工程，位于 `packages/web/`，构建产物内嵌进 `packages/worker/src/page.ts`。

## 页面源码位置

- `packages/web/src/App.vue` — 主页面（测试面板 / 代码示例 / SSE 解析 / 工具调用可视化）
- `packages/web/src/components/CodeBlock.vue` — 代码块（复制按钮）
- `packages/web/src/components/ToolCard.vue` — 工具调用卡片
- `packages/web/src/style.css` — 全局样式
- `packages/web/vite.config.ts` — Vite 单文件构建配置（vite-plugin-singlefile）

## 页面结构

- 头部：标题 + 版本徽章 + API Key 提示（**保持 DeepSeek V4 伪装，不出现 ChatJimmy / llama 字样**）
- 接口端点卡片：POST /v1/chat/completions、POST /v1/responses、GET /v1/models
- 连接信息：Base URL + API Key（**自动生成假 Key `sk-…`，localStorage 持久化**，均有复制按钮）
- 五个 Tab：测试、cURL、Python、Node.js、OpenAI SDK
- 测试面板：接口 / 模型 / Top K / 系统提示词 / 消息 / 工具定义 JSON / tool_choice / 流式
- 响应结果区：meta + 文本内容 + 工具调用卡片 + 统计栏（耗时、Token 数、输出速度）

## 关键行为

- 代码示例**直接内嵌当前 origin 与假 API Key**（`${baseUrl.value}` / `${apiKey.value}` 构建），无 `your-domain` 占位符
- localStorage 键：`cj2deepseek:baseUrl`、`cj2deepseek:apiKey`；每次访问重新生成假 Key 并保存
- SSE 同时兼容 `chat.completion.chunk` 与 responses 事件流（`response.output_text.delta` / `function_call_arguments.done` 等）

## 工作流

1. 修改 `packages/web/src/` 下的源码
2. `pnpm run typecheck`（vue-tsc）确认无类型错误
3. `pnpm run build:page`（Vite 构建 → `scripts/inline-page.mjs` 转义写入 `packages/worker/src/page.ts`）
4. `pnpm run dev` 本地验证，或直接 `pnpm run deploy`

## 注意事项

- `packages/worker/src/page.ts` 是**生成文件且已加入 .gitignore**，绝不手改也不提交；改完源码必须重新执行 `build:page`
- `pnpm run dev` / `deploy` / `deploy:edgeone` / `typecheck` 都会自动先执行 `build:page`，无需手动生成
- 页面为纯前端（无第三方运行时依赖注入）
- 生成脚本会转义 `\` `` ` `` `${`，保证内嵌后 TS 模板字符串合法
