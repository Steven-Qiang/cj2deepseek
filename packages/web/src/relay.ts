/**
 * 中转站的核心请求逻辑（与长相无关，四个皮肤共用）。
 *
 * 这里封装了：假 API Key 与 Base URL 的生成/持久化、模型列表拉取、
 * chat/completions 与 responses 两个通道的流式/非流式请求、工具调用与用量统计。
 * 皮肤组件只负责把这些状态渲染成各自的风格。
 */
import { onMounted, reactive, ref } from 'vue';
import { md5 } from './md5';
import type { ToolCallItem } from './components/ToolCard.vue';

// OpenAI SDK 从 jsDelivr CDN 动态加载（+esm = 浏览器构建），不打包进 bundle
const OPENAI_CDN = 'https://cdn.jsdelivr.net/npm/openai@7.5.0/+esm';

interface OpenAIClient {
  chat: { completions: { create: (params: any) => Promise<any> } };
  responses: { create: (params: any) => Promise<any> };
}
interface OpenAIStatic {
  new (opts: { baseURL: string; apiKey: string; dangerouslyAllowBrowser: boolean }): OpenAIClient;
}

/** 客户端不传 model 时的默认值 */
export const DEFAULT_MODEL = 'deepseek-flash';

/** /v1/models 拉取失败时的兜底 */
export const FALLBACK_MODELS = ['deepseek-flash', 'deepseek-v4-pro'];

type Endpoint = 'chat' | 'responses';

const LS_BASE_URL = 'cj2deepseek:baseUrl';
const LS_API_KEY = 'cj2deepseek:apiKey';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** 只认 sk-<32位hex> 格式；旧格式视为无效，重新生成 */
function validStoredKey(k: string | null): string | null {
  return k && /^sk-[0-9a-f]{32}$/.test(k) ? k : null;
}

/** DeepSeek 风格假 Key：sk- + 32 位 MD5 十六进制 */
function generateFakeKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `sk-${md5(bytes)}`;
}

export interface UseRelayOptions {
  /** 输出区初始文案（各皮肤语气不同） */
  placeholder?: string;
  /** 系统提示词初始值 */
  system?: string;
  /** 消息输入框初始值 */
  message?: string;
  /** 是否默认开启流式 */
  stream?: boolean;
}

export function useRelay(options: UseRelayOptions = {}) {
  // ---------- 表单状态 ----------
  const ep = ref<Endpoint>('chat');
  const model = ref(DEFAULT_MODEL);
  const topk = ref(8);
  const system = ref(options.system ?? '');
  const msg = ref(options.message ?? '你好');
  const toolsRaw = ref('');
  const toolChoice = ref('auto');
  const stream = ref(options.stream ?? true);
  const sending = ref(false);

  // ---------- 输出状态 ----------
  const output = reactive<{ meta: string; content: string; tools: ToolCallItem[] }>({
    meta: '',
    content: options.placeholder ?? '点击「发送请求」查看结果',
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

  // 域名直接内嵌 + localStorage 持久化；API Key 只在首次访问时生成，之后稳定复用
  const origin = window.location.origin;
  const baseUrl = ref(safeGet(LS_BASE_URL) || `${origin}/v1`);
  const apiKey = ref(validStoredKey(safeGet(LS_API_KEY)) || generateFakeKey());

  /** 接口返回的模型列表（各皮肤共享同一份） */
  const models = ref<string[]>([...FALLBACK_MODELS]);

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

  async function send() {
    if (sending.value) return;
    sending.value = true;
    stats.visible = false;
    stats.err = false;
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

    const t0 = performance.now();
    try {
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
      } else if (!stream.value) {
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
    } catch (e: any) {
      output.content = '请求失败: ' + (e?.error?.message || e?.message || String(e));
      const ms = ((performance.now() - t0) / 1000).toFixed(2);
      stats.err = true;
      showStats(ms + 's', '-', '-', '-', '-');
    }
    sending.value = false;
  }

  onMounted(async () => {
    persistLocal();
    try {
      const r = await fetch('/v1/models');
      const d = await r.json();
      if (Array.isArray(d.data) && d.data.length) {
        const ids = d.data
          .map((m: any) => m?.id)
          .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);
        if (ids.length) models.value = ids;
      }
    } catch {
      /* 模型列表拉取失败时保留默认值 */
    }
  });

  return {
    // 表单
    ep, model, topk, system, msg, toolsRaw, toolChoice, stream, sending,
    // 输出
    output, stats, models,
    // 接入信息
    baseUrl, apiKey,
    // 方法
    send, copyText,
  };
}
