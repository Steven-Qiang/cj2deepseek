<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import CodeBlock from './components/CodeBlock.vue';
import ToolCard, { type ToolCallItem } from './components/ToolCard.vue';
import { md5 } from './md5';

// OpenAI SDK 从 jsDelivr CDN 动态加载（+esm = esm.sh 浏览器构建），不打包进 bundle
const OPENAI_CDN = 'https://cdn.jsdelivr.net/npm/openai@7.5.0/+esm';

interface OpenAIClient {
  chat: { completions: { create: (params: any) => Promise<any> } };
  responses: { create: (params: any) => Promise<any> };
}
interface OpenAIStatic {
  new (opts: { baseURL: string; apiKey: string; dangerouslyAllowBrowser: boolean }): OpenAIClient;
}

const DEFAULT_MODEL = 'deepseek-v4-flash';
const ALL_MODELS = ['deepseek-v4-flash', 'deepseek-v4-pro'];

// ---------- 表单状态 ----------
type Endpoint = 'chat' | 'responses';
const ep = ref<Endpoint>('chat');
const model = ref(DEFAULT_MODEL);
const topk = ref(8);
const system = ref('');
const msg = ref('你好');
const toolsRaw = ref('');
const toolChoice = ref('auto');
const stream = ref(true);
const sending = ref(false);

// ---------- 输出状态 ----------
const output = reactive<{ meta: string; content: string; tools: ToolCallItem[] }>({
  meta: '',
  content: '点击「发送请求」查看结果',
  tools: [],
});
const stats = reactive({
  visible: false,
  time: '-',
  prompt: '-',
  comp: '-',
  total: '-',
  speed: '-',
  err: false,
});

// ---------- 页面杂项 ----------
const activeTab = ref('test');
const tabs = [
  { id: 'test', label: '测试' },
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'node', label: 'Node.js' },
  { id: 'sdk', label: 'OpenAI SDK' },
  { id: 'agents', label: 'Agent 接入' },
];
const modelChips = ref<string[]>(ALL_MODELS);

// 域名直接内嵌 + localStorage 持久化；API Key 只在首次访问时生成，之后稳定复用
const LS_BASE_URL = 'cj2deepseek:baseUrl';
const LS_API_KEY = 'cj2deepseek:apiKey';
const origin = window.location.origin;

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

const baseUrl = ref(safeGet(LS_BASE_URL) || `${origin}/v1`);
const apiKey = ref(validStoredKey(safeGet(LS_API_KEY)) || generateFakeKey());

// 只认 sk-<32位hex> 格式；旧格式（如 48 位随机串）视为无效，重新生成
function validStoredKey(k: string | null): string | null {
  return k && /^sk-[0-9a-f]{32}$/.test(k) ? k : null;
}

// DeepSeek 风格假 Key：sk- + 32 位 MD5 十六进制
function generateFakeKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `sk-${md5(bytes)}`;
}

function persistLocal() {
  try {
    localStorage.setItem(LS_BASE_URL, baseUrl.value);
    localStorage.setItem(LS_API_KEY, apiKey.value);
  } catch {
    /* 隐私模式下可能抛错，忽略 */
  }
}

function copyText(text: string, btn: EventTarget | null) {
  const el = btn as HTMLButtonElement | null;
  if (!el) return;
  navigator.clipboard.writeText(text);
  el.textContent = '已复制';
  setTimeout(() => (el.textContent = '复制'), 1500);
}

// ---------- 代码示例（域名与假 API Key 直接内嵌，无需占位符替换） ----------
const curlSamples = computed(() => [
  {
    title: 'Chat Completions',
    code: `curl -X POST ${baseUrl.value}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey.value}" \\
  -d '{
  "model": "${DEFAULT_MODEL}",
  "messages": [{"role": "user", "content": "你好"}],
  "stream": false
}'`,
  },
  {
    title: 'Function Calling',
    code: `curl -X POST ${baseUrl.value}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey.value}" \\
  -d '{
  "model": "${DEFAULT_MODEL}",
  "messages": [{"role": "user", "content": "北京今天天气怎么样？"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "查询指定城市的天气",
      "parameters": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"]
      }
    }
  }],
  "stream": false
}'`,
  },
  {
    title: 'Responses API',
    code: `curl -X POST ${baseUrl.value}/responses \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey.value}" \\
  -d '{
  "model": "${DEFAULT_MODEL}",
  "input": "北京今天天气怎么样？",
  "tools": [{
    "type": "function",
    "name": "get_weather",
    "description": "查询指定城市的天气",
    "parameters": {
      "type": "object",
      "properties": {"city": {"type": "string"}},
      "required": ["city"]
    }
  }],
  "stream": false
}'`,
  },
]);

const pythonSamples = computed(() => [
  {
    title: 'Chat Completions',
    code: `import requests

resp = requests.post(
    "${baseUrl.value}/chat/completions",
    headers={"Authorization": "Bearer ${apiKey.value}"},
    json={
        "model": "${DEFAULT_MODEL}",
        "messages": [{"role": "user", "content": "你好"}],
        "stream": False
    }
)
print(resp.json()["choices"][0]["message"]["content"])`,
  },
  {
    title: 'Responses API',
    code: `import requests

resp = requests.post(
    "${baseUrl.value}/responses",
    headers={"Authorization": "Bearer ${apiKey.value}"},
    json={
        "model": "${DEFAULT_MODEL}",
        "input": "你好",
        "stream": False
    }
)
data = resp.json()
for item in data["output"]:
    if item["type"] == "message":
        print(item["content"][0]["text"])`,
  },
]);

const nodeSamples = computed(() => [
  {
    title: 'Chat Completions',
    code: `const resp = await fetch("${baseUrl.value}/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey.value}"
  },
  body: JSON.stringify({
    model: "${DEFAULT_MODEL}",
    messages: [{ role: "user", content: "你好" }],
    stream: false
  })
});
const data = await resp.json();
console.log(data.choices[0].message.content);`,
  },
  {
    title: 'Function Calling',
    code: `const resp = await fetch("${baseUrl.value}/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey.value}"
  },
  body: JSON.stringify({
    model: "${DEFAULT_MODEL}",
    messages: [{ role: "user", content: "北京今天天气怎么样？" }],
    tools: [{
      type: "function",
      function: {
        name: "get_weather",
        description: "查询指定城市的天气",
        parameters: {
          type: "object",
          properties: { city: { type: "string" } },
          required: ["city"]
        }
      }
    }],
    stream: false
  })
});
const data = await resp.json();
const msg = data.choices[0].message;
if (msg.tool_calls) {
  msg.tool_calls.forEach(c => console.log(c.function.name, c.function.arguments));
}`,
  },
]);

const sdkSamples = computed(() => [
  {
    title: 'OpenAI SDK（Python）· Chat Completions + 工具循环',
    code: `from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl.value}",
    api_key="${apiKey.value}"
)

tools = [{
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
}]

response = client.chat.completions.create(
    model="${DEFAULT_MODEL}",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools,
)

msg = response.choices[0].message
if msg.tool_calls:
    for call in msg.tool_calls:
        print(call.function.name, call.function.arguments)

# 把工具结果喂回去，继续对话
response2 = client.chat.completions.create(
    model="${DEFAULT_MODEL}",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"},
        msg,
        {"role": "tool", "tool_call_id": msg.tool_calls[0].id, "content": "晴，25°C"},
    ],
    tools=tools,
)
print(response2.choices[0].message.content)`,
  },
  {
    title: 'OpenAI SDK（Node.js）· Responses API',
    code: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${baseUrl.value}",
  apiKey: "${apiKey.value}",
});

const resp = await client.responses.create({
  model: "${DEFAULT_MODEL}",
  input: "你好",
});

for (const item of resp.output) {
  if (item.type === "message") {
    console.log(item.content[0].text);
  }
}`,
  },
]);

const agentSamples = computed(() => [
  {
    title: 'OpenAI Agents SDK（Python）· 函数工具',
    code: `import os

# 设置中转地址与密钥（Agent SDK 底层走 OpenAI 客户端）
os.environ["OPENAI_BASE_URL"] = "${baseUrl.value}"
os.environ["OPENAI_API_KEY"] = "${apiKey.value}"

from agents import Agent, Runner, function_tool

@function_tool
def get_weather(city: str) -> str:
    """查询指定城市的天气"""
    return f"{city} 晴，25°C"

agent = Agent(
    name="助手",
    instructions="你是助手，可调用工具回答天气等问题。",
    model="${DEFAULT_MODEL}",
    tools=[get_weather],
)

result = Runner.run_sync(agent, "北京今天天气怎么样？")
print(result.final_output)`,
  },
  {
    title: 'LangChain（Python）· ChatOpenAI + 工具绑定',
    code: `from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """查询指定城市的天气"""
    return f"{city} 晴，25°C"

llm = ChatOpenAI(
    base_url="${baseUrl.value}",
    api_key="${apiKey.value}",
    model="${DEFAULT_MODEL}",
    temperature=0,
)
llm = llm.bind_tools([get_weather])
resp = llm.invoke("北京今天天气怎么样？")
print(resp.tool_calls)   # 工具调用结果
print(resp.content)`,
  },
  {
    title: 'OpenCode · 配置自定义模型提供商',
    code: `// ~/.config/opencode/opencode.json
{
  "provider": {
    "relayhub": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "RelayHub",
      "options": {
        "baseURL": "${baseUrl.value}",
        "apiKey": "${apiKey.value}"
      },
      "models": {
        "${DEFAULT_MODEL}": { "name": "DeepSeek V4 Flash" }
      }
    }
  }
}`,
  },
]);

// ---------- 请求逻辑 ----------
function showStats(time: string, prompt: string, comp: string, total: string, speed: string) {
  stats.visible = true;
  stats.time = time;
  stats.prompt = prompt;
  stats.comp = comp;
  stats.total = total;
  stats.speed = speed;
}

function readTools(): any[] | null {
  const raw = toolsRaw.value.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('tools 必须是 JSON 数组');
    return parsed;
  } catch (e: any) {
    throw new Error('工具定义 JSON 解析失败: ' + (e?.message ?? e));
  }
}

async function send() {
  if (sending.value) return;
  sending.value = true;
  stats.visible = false;
  output.meta = '';
  output.tools = [];
  output.content = '请求中...';

  let tools: any[] | null = null;
  try {
    tools = readTools();
  } catch (e: any) {
    output.content = e.message;
    stats.err = true;
    sending.value = false;
    return;
  }

  // 官方 OpenAI SDK 从 CDN 动态加载（浏览器模式），驱动 chat / responses 请求
  const mod: any = await import(/* @vite-ignore */ OPENAI_CDN);
  const OpenAI: OpenAIStatic = mod.default;
  const client = new OpenAI({
    baseURL: baseUrl.value,
    apiKey: apiKey.value,
    dangerouslyAllowBrowser: true,
  });

  const common: Record<string, any> = {
    model: model.value,
    top_k: topk.value,
    tools: tools ?? undefined,
    tool_choice: tools ? toolChoice.value : undefined,
    stream: stream.value,
  };

  const t0 = performance.now();
  try {
    if (ep.value === 'chat') {
      const messages: any[] = [];
      if (system.value) messages.push({ role: 'system', content: system.value });
      messages.push({ role: 'user', content: msg.value });

      if (!stream.value) {
        const data: any = await client.chat.completions.create({ ...common, messages } as any);
        const ms = ((performance.now() - t0) / 1000).toFixed(2);
        const choice = data.choices?.[0] || {};
        const m = choice.message || {};
        output.content = m.content ?? '';
        output.tools = m.tool_calls || [];
        output.meta = `id ${data.id} · model ${data.model} · finish_reason ${choice.finish_reason ?? ''}`;
        const u = data.usage || {};
        const comp = u.completion_tokens || 0;
        const spd = comp > 0 ? (comp / parseFloat(ms)).toFixed(1) + ' tok/s' : '-';
        showStats(ms + 's', u.prompt_tokens ?? '-', comp || '-', u.total_tokens ?? '-', spd);
      } else {
        output.content = '';
        const s: any = await client.chat.completions.create({ ...common, messages } as any);
        let content = '';
        let usage: any = null;
        let finishReason: string | null = null;
        let metaId: string | null = null;
        const accTool: Record<string, { name: string; args: string }> = {};
        for await (const chunk of s) {
          const choice = chunk.choices?.[0];
          const delta = choice?.delta || {};
          if (delta.content) {
            content += delta.content;
            output.content = content;
          }
          if (delta.tool_calls) {
            delta.tool_calls.forEach((tc: any) => {
              const idx = tc.index || 0;
              if (!accTool[idx]) accTool[idx] = { name: '', args: '' };
              if (tc.function) {
                if (tc.function.name) accTool[idx].name += tc.function.name;
                if (tc.function.arguments) accTool[idx].args += tc.function.arguments;
              }
            });
          }
          if (choice?.finish_reason) finishReason = choice.finish_reason;
          if (chunk.usage) usage = chunk.usage;
          if (chunk.id) metaId = chunk.id;
        }
        finishStream(t0, content, usage, finishReason, metaId, null, accTool);
      }
    } else {
      if (!stream.value) {
        const data: any = await client.responses.create({
          ...common,
          input: msg.value,
          instructions: system.value || undefined,
        } as any);
        const ms = ((performance.now() - t0) / 1000).toFixed(2);
        let text = '';
        const calls: ToolCallItem[] = [];
        (data.output || []).forEach((item: any) => {
          if (item.type === 'message' && item.content?.length) text = item.content[0].text || '';
          else if (item.type === 'function_call') calls.push(item);
        });
        output.content = text;
        output.tools = calls;
        output.meta = `id ${data.id} · model ${data.model} · status ${data.status || 'completed'}`;
        const u = data.usage || {};
        const comp = u.output_tokens || 0;
        const spd = comp > 0 ? (comp / parseFloat(ms)).toFixed(1) + ' tok/s' : '-';
        showStats(ms + 's', u.input_tokens ?? '-', comp || '-', u.total_tokens ?? '-', spd);
      } else {
        output.content = '';
        const s: any = await client.responses.create({
          ...common,
          input: msg.value,
          instructions: system.value || undefined,
        } as any);
        let content = '';
        let usage: any = null;
        let finishReason: string | null = null;
        let metaId: string | null = null;
        let metaModel: string | null = null;
        const accTool: Record<string, { name: string; args: string }> = {};
        for await (const event of s) {
          if (event.type === 'response.output_text.delta') {
            content += event.delta || '';
            output.content = content;
          }
          if (event.type === 'response.function_call_arguments.done') {
            const key = 'r' + event.item_id;
            accTool[key] = accTool[key] || { name: '', args: '' };
            accTool[key].args = event.arguments || '';
          }
          if (event.type === 'response.output_item.added' && event.item?.type === 'function_call') {
            const key = 'r' + event.item.id;
            accTool[key] = accTool[key] || { name: event.item.name || '', args: '' };
          }
          if (event.type === 'response.output_item.done' && event.item?.type === 'function_call') {
            accTool['r' + event.item.id] = { name: event.item.name || '', args: event.item.arguments || '' };
          }
          if (event.type === 'response.completed') {
            usage = event.response?.usage;
            metaId = event.response?.id;
            metaModel = event.response?.model;
            finishReason = finishReason || 'completed';
          }
          if (event.type === 'response.created') {
            metaId = event.response?.id;
            metaModel = event.response?.model;
          }
        }
        finishStream(t0, content, usage, finishReason, metaId, metaModel, accTool);
      }
    }
  } catch (e: any) {
    output.content = '请求失败: ' + (e?.error?.message || e?.message || String(e));
    const ms = ((performance.now() - t0) / 1000).toFixed(2);
    stats.err = true;
    showStats(ms + 's', '-', '-', '-', '-');
  }
  sending.value = false;
}

/** 流式收尾：汇总工具调用 / usage / meta / 统计 */
function finishStream(
  t0: number,
  content: string,
  usage: any,
  finishReason: string | null,
  metaId: string | null,
  metaModel: string | null,
  accTool: Record<string, { name: string; args: string }>,
) {
  const calls: ToolCallItem[] = Object.values(accTool)
    .filter((v) => v.name)
    .map((v) => ({ function: { name: v.name, arguments: v.args } }));
  output.tools = calls;

  const ms = ((performance.now() - t0) / 1000).toFixed(2);
  const kind = (metaId ?? '').startsWith('resp_') ? 'responses' : 'chat';
  let promptN: any, compN: any, totalN: any;
  if (usage) {
    if (kind === 'responses') {
      promptN = usage.input_tokens;
      compN = usage.output_tokens;
    } else {
      promptN = usage.prompt_tokens;
      compN = usage.completion_tokens;
    }
    totalN = usage.total_tokens;
  }
  if (content || calls.length) {
    output.meta = `id ${metaId || '-'} · model ${metaModel || model.value} · finish_reason ${finishReason || 'stop'}`;
    const compVal = compN || 0;
    const spd = compVal > 0 ? (compVal / parseFloat(ms)).toFixed(1) + ' tok/s' : '-';
    showStats(ms + 's', promptN ?? '-', compVal || '-', totalN ?? '-', spd);
  } else {
    output.content = '(空响应，请稍后重试)';
    stats.err = true;
    showStats(ms + 's', '-', '-', '-', '-');
  }
}

onMounted(async () => {
  persistLocal();
  try {
    const r = await fetch('/v1/models');
    const d = await r.json();
    if (Array.isArray(d.data) && d.data.length) {
      modelChips.value = d.data.map((m: any) => m.id);
    }
  } catch {
    /* 模型列表拉取失败时保留默认值 */
  }
});
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>RelayHub</h1>
      <span class="badge">v1.1.0</span>
    </header>
    <p class="subtitle">聚合转发 ChatGPT / Claude / DeepSeek / Gemini 等主流大模型，开放闲置账号供朋友使用</p>
    <p class="subtitle-sub">OpenAI 兼容接口 · 支持流式输出（SSE）· Function Calling · Responses API</p>

    <section class="card">
      <div class="card-title">接入信息</div>
      <div class="endpoint"><span><span class="method">POST</span>/v1/chat/completions</span><span class="tag">聊天补全</span></div>
      <div class="endpoint"><span><span class="method">POST</span>/v1/responses</span><span class="tag">Responses API</span></div>
      <div class="endpoint"><span><span class="method">GET</span>/v1/models</span><span class="tag">模型列表</span></div>
      <div class="base-url">
        <span>Base URL: {{ baseUrl }}</span>
        <button class="btn-sm" @click="copyText(baseUrl, $event.currentTarget)">复制</button>
      </div>
      <div class="base-url">
        <span>API Key: {{ apiKey }}</span>
        <button class="btn-sm" @click="copyText(apiKey, $event.currentTarget)">复制</button>
      </div>
      <div class="chips">
        <span v-for="m in modelChips" :key="m" class="chip">{{ m }}</span>
      </div>
    </section>

    <section class="card">
      <div class="tab-bar">
        <div
          v-for="t in tabs"
          :key="t.id"
          class="tab"
          :class="{ active: activeTab === t.id }"
          @click="activeTab = t.id"
        >{{ t.label }}</div>
      </div>

      <div v-show="activeTab === 'test'" class="panel">
        <div class="form-grid">
          <div class="field">
            <label>接口通道</label>
            <select v-model="ep">
              <option value="chat">/v1/chat/completions</option>
              <option value="responses">/v1/responses</option>
            </select>
          </div>
          <div class="field">
            <label>模型</label>
            <select v-model="model">
              <option v-for="m in ALL_MODELS" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="field">
            <label>Top K</label>
            <input v-model.number="topk" type="number" min="1" max="50" />
          </div>
          <div class="field">
            <label>tool_choice</label>
            <select v-model="toolChoice">
              <option value="auto">auto</option>
              <option value="none">none</option>
              <option value="required">required</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label class="check-label"><input v-model="stream" type="checkbox" /> 流式输出（SSE）</label>
        </div>
        <div class="field">
          <label>系统提示词（Responses API 时作为 instructions）</label>
          <textarea v-model="system" rows="2" placeholder="可选"></textarea>
        </div>
        <div class="field">
          <label>消息内容</label>
          <textarea v-model="msg" rows="3" placeholder="输入消息..."></textarea>
        </div>
        <div class="field">
          <label>工具定义（Tools JSON，留空则不启用 Function Calling）</label>
          <textarea
            v-model="toolsRaw"
            class="mono"
            rows="4"
            placeholder='[{"type":"function","function":{"name":"get_weather","description":"查询指定城市的天气","parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}]'
          ></textarea>
        </div>
        <div class="actions">
          <button class="btn-primary" :disabled="sending" @click="send">发送请求</button>
        </div>
      </div>

      <div v-show="activeTab === 'curl'">
        <template v-for="s in curlSamples" :key="s.title">
          <div class="code-title">{{ s.title }}</div>
          <CodeBlock :code="s.code" />
        </template>
      </div>

      <div v-show="activeTab === 'python'">
        <template v-for="s in pythonSamples" :key="s.title">
          <div class="code-title">{{ s.title }}</div>
          <CodeBlock :code="s.code" />
        </template>
      </div>

      <div v-show="activeTab === 'node'">
        <template v-for="s in nodeSamples" :key="s.title">
          <div class="code-title">{{ s.title }}</div>
          <CodeBlock :code="s.code" />
        </template>
      </div>

      <div v-show="activeTab === 'sdk'">
        <template v-for="s in sdkSamples" :key="s.title">
          <div class="code-title">{{ s.title }}</div>
          <CodeBlock :code="s.code" />
        </template>
      </div>

      <div v-show="activeTab === 'agents'">
        <p class="intro">本中转为 OpenAI 兼容接口，支持 Function Calling（tools）与 Responses API，主流 Agent 框架可直接接入。Base URL 与 API Key 见上方「接入信息」，请使用您自己的访问密钥。</p>
        <template v-for="s in agentSamples" :key="s.title">
          <div class="code-title">{{ s.title }}</div>
          <CodeBlock :code="s.code" />
        </template>
      </div>
    </section>

    <section class="card">
      <div class="card-title">响应结果</div>
      <div class="output">
        <div class="resp-meta" v-if="output.meta">{{ output.meta }}</div>
        <div class="resp-content">{{ output.content }}</div>
        <div class="resp-tools">
          <ToolCard v-for="(c, i) in output.tools" :key="i" :call="c" />
        </div>
      </div>
      <div class="stats-bar" v-show="stats.visible">
        <div class="stat">耗时 <span class="val" :class="{ err: stats.err }">{{ stats.time }}</span></div>
        <div class="stat">Prompt <span class="val" :class="{ err: stats.err }">{{ stats.prompt }}</span></div>
        <div class="stat">Completion <span class="val" :class="{ err: stats.err }">{{ stats.comp }}</span></div>
        <div class="stat">Total <span class="val" :class="{ err: stats.err }">{{ stats.total }}</span></div>
        <div class="stat">速度 <span class="val" :class="{ err: stats.err }">{{ stats.speed }}</span></div>
      </div>
    </section>

    <footer class="footer">
      RelayHub · 开源项目 · 仅供学习研究使用 · 请勿用于商业用途
    </footer>
  </div>
</template>
