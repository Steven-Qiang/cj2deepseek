# CJ2DeepSeek 🎭

> 恶搞项目：把 [ChatJimmy](https://chatjimmy.ai) 的底层模型（llama3.1-8B）**伪装成 DeepSeek V4 API**。
> 客户端以为自己连的是 `deepseek-v4-flash`，实际上背后跑的是廉价小模型——拿去逗朋友刚刚好。

本项目是 [qingchencloud/cj2api](https://github.com/qingchencloud/cj2api) 的 fork，在原来「ChatJimmy → OpenAI 兼容代理」的基础上改造成了一个独立的恶搞项目：

- 🎭 **DeepSeek 伪装** — 对外模型名是 `deepseek-v4-flash` / `deepseek-v4-pro`，绝不上传真实模型名
- 🛠 **Function Calling** — 支持 `tools` / `tool_choice`，历史 `tool_calls` / `tool` 消息自动转换，可直接驱动 agent 工具循环
- 🧩 **Responses API** — 新增 OpenAI Responses 兼容接口（`/v1/responses`），支持流式事件序列
- ⚡ **多平台部署** — 同时支持 Cloudflare Workers 和腾讯云 EdgeOne Pages
- 🖥 **自带测试页** — Vue 3 + TypeScript 构建，支持工具调用可视化、流式输出、实时 Token 统计
- 📦 **pnpm monorepo** — `packages/worker`（Worker 核心）+ `packages/web`（测试页源码，编译后内嵌进 Worker）

> ⚠️ **免责声明**：本项目仅供学习研究与朋友间娱乐，请勿用于商业用途或生产环境。

## 仓库结构（pnpm monorepo）

```
cj2deepseek/
├── packages/
│   ├── worker/            # Cloudflare Worker / EdgeOne 函数（核心代理逻辑）
│   │   ├── src/           #   chat / responses / tools / upstream / page(生成)
│   │   ├── functions/     #   EdgeOne Pages Functions 入口
│   │   ├── wrangler.toml  #   Cloudflare Workers 配置
│   │   └── edgeone.json   #   EdgeOne Pages 配置
│   └── web/               # 内置测试页面（Vue 3 + TypeScript + Vite）
│       └── src/App.vue    #   页面源码（改这里！）
├── scripts/
│   └── inline-page.mjs    # 把 web 构建产物内嵌进 worker/src/page.ts
├── pnpm-workspace.yaml
└── package.json           # 根编排脚本（private）
```

**测试页工作流**：页面源码在 `packages/web/`，改完后执行 `pnpm run build:page`，Vite 会把整个页面编译成单文件 HTML，再由 `scripts/inline-page.mjs` 转义后写入 `packages/worker/src/page.ts`（生成文件，勿手改）。`pnpm run deploy` 会自动先执行这一步。

## 快速开始

### 前置条件

- [Node.js](https://nodejs.org/) 18+ 与 [pnpm](https://pnpm.io/)（推荐 9+）
- [Cloudflare 账号](https://dash.cloudflare.com/sign-up) 或 [腾讯云账号](https://console.cloud.tencent.com/)

### 方式一：部署到 Cloudflare Workers (从 GitHub 克隆)

```bash
git clone https://github.com/Steven-Qiang/cj2api.git
cd cj2api
pnpm install
npx wrangler login    # 首次使用需登录 Cloudflare
pnpm run deploy
```

`pnpm run deploy` = 构建测试页（`build:page`）→ `wrangler deploy`。部署完成后，Wrangler 会输出你的 Worker URL，形如 `https://cj2deepseek.<你的子域>.workers.dev`。

### 方式二：部署到腾讯云 EdgeOne Pages (推荐国内直连)

EdgeOne Pages 提供了更佳的国内访问体验，支持一键部署：

[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://console.cloud.tencent.com/edgeone/pages/new?repository-url=https%3A%2F%2Fgithub.com%2FSteven-Qiang%2Fcj2api)

或者手动部署：
```bash
pnpm install
pnpm run build:page
pnpm run deploy:edgeone
```

> **国内访问提示：**
> - **Cloudflare**: `*.workers.dev` 域名在国内访问可能不稳定，建议绑定自定义域名走 CDN，或通过 Dashboard → Workers → cj2deepseek → Settings → Domains & Routes 绑定域名。
> - **EdgeOne**: 默认提供国内边缘节点加速，延迟极低，无需额外配置即可直连。

> **提示：** 客户端要求填写 API Key 时，直接用测试页上自动生成的假 Key（`sk-…`）即可——任意字符串都行，页面每次访问都会重新生成一个并存入 localStorage。

## 恶搞原理（工作原理）

```
┌─────────────────────────────────────────────────────────┐
│  受害者视角                                            │
│  OpenAI SDK / curl → POST /v1/chat/completions          │
│  model: "deepseek-v4-flash"                             │
│  ↑ 标准 OpenAI 请求格式，完全看不出破绽                   │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Worker / Edge Function（cj2deepseek）                   │
│  1. 解析请求体（messages / tools / tool_choice）          │
│  2. 工具定义 → llama 友好的 <tool_call> 提示词             │
│  3. 翻译消息 → ChatJimmy 私有协议                          │
│  4. 固定调用 UPSTREAM_MODEL（绝不使用客户端模型名）          │
│  5. 解析 <tool_call> 块 + stats → 封装为 OpenAI 格式       │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│  chatjimmy.ai/api/chat                                   │
│  llama3.1-8B（真正的"垃圾模型"，DeepSeek 只是外皮）        │
└─────────────────────────────────────────────────────────┘
```

关键点：**客户端请求什么模型都无所谓**，上游固定使用 `llama3.1-8B`（见 `packages/worker/src/utils.ts` 的 `UPSTREAM_MODEL`），模型名只是对外展示的假名。工具调用则通过 `<tool_call>` / `<tool_result>` 文本块与底层模型交互，再转换回标准 OpenAI `tool_calls` 格式。

## API 接口

### POST `/v1/chat/completions`

标准 OpenAI Chat Completions 接口，支持流式和非流式响应。

**请求体：**

```json
{
  "model": "deepseek-v4-flash",
  "messages": [
    { "role": "system", "content": "你是一个有帮助的助手" },
    { "role": "user", "content": "你好" }
  ],
  "stream": false,
  "top_k": 8
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 否 | 模型名称，默认 `deepseek-v4-flash` |
| `messages` | array | 是 | 消息列表，支持 `system` / `user` / `assistant` / `tool` 角色 |
| `stream` | boolean | 否 | 是否启用流式输出，默认 `false` |
| `top_k` | number | 否 | Top-K 采样参数，默认 `8` |
| `tools` | array | 否 | 函数工具定义（Function Calling），自动转换为模型可理解的调用格式 |
| `tool_choice` | string/object | 否 | `auto` / `none` / `required` / `{"type":"function","function":{"name":"..."}}` |

**非流式响应：**

```json
{
  "id": "chatcmpl-xxxx",
  "object": "chat.completion",
  "created": 1740000000,
  "model": "deepseek-v4-flash",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "你好！有什么可以帮助你的吗？" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 85,
    "total_tokens": 97
  }
}
```

**流式响应 (SSE)：**

当 `stream: true` 时，返回 `text/event-stream` 格式：

```
data: {"id":"chatcmpl-xxxx","object":"chat.completion.chunk","created":1740000000,"model":"deepseek-v4-flash","choices":[{"index":0,"delta":{"role":"assistant","content":"你好"},"finish_reason":null}]}

data: {"id":"chatcmpl-xxxx","object":"chat.completion.chunk","created":1740000000,"model":"deepseek-v4-flash","choices":[{"index":0,"delta":{"content":"！"},"finish_reason":null}]}

data: {"id":"chatcmpl-xxxx","object":"chat.completion.chunk","created":1740000000,"model":"deepseek-v4-flash","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":12,"completion_tokens":85,"total_tokens":97}}

data: [DONE]
```

### GET `/v1/models`

返回可用模型列表（假名）。

```json
{
  "object": "list",
  "data": [
    { "id": "deepseek-v4-flash", "object": "model", "owned_by": "system" },
    { "id": "deepseek-v4-pro", "object": "model", "owned_by": "system" }
  ]
}
```

### POST `/v1/responses`

OpenAI Responses API 兼容接口（agent / 工具调用场景），支持流式和非流式。

**请求体：**

```json
{
  "model": "deepseek-v4-flash",
  "input": "北京今天天气怎么样？",
  "tools": [
    {
      "type": "function",
      "name": "get_weather",
      "description": "查询指定城市的天气",
      "parameters": {
        "type": "object",
        "properties": { "city": { "type": "string" } },
        "required": ["city"]
      }
    }
  ],
  "stream": false
}
```

- `input` 支持字符串或数组（`message` / `function_call` / `function_call_output` 项，可组合成多轮 agent 对话）
- 模型输出中的函数调用会以 `function_call` 项返回，供 agent 继续执行工具循环
- 流式响应遵循 Responses API 事件序列：`response.created` → `response.output_item.added` → `response.output_text.delta` … → `response.completed`

**Function Calling 说明：**

`/v1/chat/completions` 与 `/v1/responses` 均支持工具调用。历史消息中的 `assistant.tool_calls` 与 `role: "tool"` 结果会自动转换为模型可理解的调用/结果格式，模型以标准 OpenAI `tool_calls`（chat）或 `function_call`（responses）返回，可直接驱动 agent 工具循环（如 OpenCode / OpenAI Agents SDK 等客户端）。

## 使用示例

### cURL（含工具调用）

```bash
curl -X POST https://your-domain/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
  "model": "deepseek-v4-flash",
  "messages": [{"role": "user", "content": "北京今天天气怎么样？"}],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "查询指定城市的天气",
        "parameters": {
          "type": "object",
          "properties": { "city": { "type": "string" } },
          "required": ["city"]
        }
      }
    }
  ],
  "stream": false
}'
```

### Python

```python
import requests

resp = requests.post(
    "https://your-domain/v1/chat/completions",
    json={
        "model": "deepseek-v4-flash",
        "messages": [{"role": "user", "content": "你好"}],
        "stream": False
    }
)
print(resp.json()["choices"][0]["message"]["content"])
```

### Node.js

```javascript
const resp = await fetch("https://your-domain/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "deepseek-v4-flash",
    messages: [{ role: "user", content: "你好" }],
    stream: false
  })
});
const data = await resp.json();
console.log(data.choices[0].message.content);
```

### OpenAI SDK（Python，含工具循环）

完全兼容 OpenAI API 格式，可以直接使用官方 SDK，连 Function Calling 都能正常驱动：

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-domain/v1",
    api_key="any-string"  # 无需真实 API Key
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "查询指定城市的天气",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"],
            },
        },
    }
]

response = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools,
)

# 工具调用结果
msg = response.choices[0].message
if msg.tool_calls:
    for call in msg.tool_calls:
        print(call.function.name, call.function.arguments)

# 把工具结果喂回去，继续对话
response2 = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"},
        msg,
        {"role": "tool", "tool_call_id": msg.tool_calls[0].id, "content": "晴，25°C"},
    ],
    tools=tools,
)
print(response2.choices[0].message.content)
```

## 本地开发

```bash
pnpm install
pnpm run dev          # wrangler dev，默认监听 http://localhost:8787
pnpm run dev:page     # 单独开发测试页（Vite dev server，热更新）
pnpm run build:page   # 构建测试页并重新生成 src/page.ts
pnpm run typecheck    # 全仓类型检查（worker + web）
```

## Claude Code Skills

本项目内置了 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 维护 Skills：

| Skill | 说明 |
|-------|------|
| `/release` | 版本发布（bump + tag + push） |
| `/deploy` | 部署到 Cloudflare Workers（自动先构建测试页） |
| `/update-page` | 维护内置测试页面（改 packages/web 源码 → build:page） |

## 免责声明

- 🎭 本项目会**故意谎报模型身份**：客户端看到的模型名是 `deepseek-v4-flash` / `deepseek-v4-pro`，实际调用的是 ChatJimmy 的 `llama3.1-8B`。**请勿**将其用于任何严肃的、对模型能力有要求的场景。
- 仅供**学习研究和技术测试**使用，请勿用于任何商业用途。
- 作者不对因使用本项目产生的任何损失承担责任。

## License

[MIT](LICENSE) © Steven-Qiang（fork 自 [qingchencloud/cj2api](https://github.com/qingchencloud/cj2api) © QingChen Cloud）
