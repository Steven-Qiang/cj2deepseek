import type { ChatMessage, ChatToolCall, FunctionTool, UpstreamMessage } from './types';
import { log } from './logger';

/** 这些工具对 llama3.1-8B 而言不可用/无意义，直接过滤掉 */
export const FILTERED_TOOLS = new Set(['webfetch', 'todowrite', 'skill', 'question', 'task']);

/**
 * 系统提示词字节预算。实测 chatjimmy 在工具段 >~22.8K 字符时开始概率性返回空响应
 * （无确定性阈值，越大越不稳）。取 21K：常规 82 个工具约 20.2K 可全量容纳，并留出余量。
 * 残余的偶发空响应由 chat.ts 的 3 次重试兜底。
 */
export const MAX_SYSTEM_PROMPT = 21000;

/** 过滤掉黑名单工具，返回 chat 格式工具列表 */
export function filterTools(tools: FunctionTool[] | undefined): FunctionTool[] {
  if (!Array.isArray(tools)) return [];
  return tools.filter(
    (t) =>
      t &&
      t.type === 'function' &&
      t.function &&
      !FILTERED_TOOLS.has(String(t.function.name || '').toLowerCase()),
  );
}

/** 取描述第一句（或前 120 字符） */
export function firstSentence(text: string | undefined): string {
  if (!text) return '';
  for (const end of ['. ', '.\n', '\n']) {
    const idx = text.indexOf(end);
    if (idx !== -1) return text.slice(0, idx + 1).trim();
  }
  return text.slice(0, 120).trim();
}

/** 把 OpenAI 工具定义转换为 llama 友好的系统提示词段落（复刻 proxy.py） */
export function formatToolsForPrompt(
  tools: FunctionTool[],
  toolChoice: unknown,
): string {
  if (!tools.length) return '';

  const lines: string[] = [
    '',
    '# Tools',
    'When you need a tool, respond with one or more <tool_call> blocks and nothing else.',
    'Format:',
    '<tool_call>',
    '{"name": "tool_name", "arguments": {"required_param": "value"}}',
    '</tool_call>',
    'The `arguments` object MUST include all required parameters and only valid JSON.',
    'Do not invent tool results. Tool results will be provided in <tool_result> tags.',
    '',
  ];

  const choice = toolChoice as any;
  if (choice === 'none') {
    lines.push('Do NOT use tools for this request.', '');
  } else if (choice === 'required') {
    lines.push('You MUST call at least one tool.', '');
  } else if (choice && choice.type === 'function') {
    const fname = choice?.function?.name;
    if (fname) lines.push(`You MUST call '${fname}'.`, '');
  }

  for (const tool of tools) {
    const func = tool.function;
    const name = func.name || '';
    const desc = firstSentence(func.description);
    const params = (func.parameters || {}) as Record<string, any>;
    const props = (params.properties || {}) as Record<string, any>;
    const required = new Set<string>(Array.isArray(params.required) ? params.required : []);

    const parts: string[] = [];
    for (const [pname, pinfo] of Object.entries(props)) {
      const ptype = pinfo?.type || 'string';
      const opt = required.has(pname) ? '' : '?';
      parts.push(`${pname}${opt}: ${ptype}`);
    }
    let line = `- ${name}(${parts.join(', ')})`;
    if (desc) line += ` — ${desc}`;
    lines.push(line);
  }

  // 紧凑 JSON schema（去掉冗长描述，控制上游提示词长度）
  try {
    const compactTools = tools
      .filter((t) => t.type === 'function' && t.function)
      .map((tool) => {
        const func = tool.function;
        const params = (func.parameters || {}) as Record<string, any>;
        const compactProps: Record<string, any> = {};
        for (const [pname, pinfo] of Object.entries(params.properties || {})) {
          const p = pinfo as Record<string, any> | undefined;
          const entry: Record<string, any> = { type: p?.type || 'string' };
          if (p && Array.isArray(p.enum)) entry.enum = p.enum;
          if (p && p.items && typeof p.items === 'object') {
            entry.items = { type: (p.items as any).type || 'object' };
          }
          compactProps[pname] = entry;
        }
        return {
          name: func.name || '',
          parameters: {
            type: 'object',
            properties: compactProps,
            required: Array.isArray(params.required) ? params.required : [],
          },
        };
      });
    lines.push('', '<tools>', JSON.stringify(compactTools), '</tools>');
  } catch {
    // 忽略 schema 序列化失败
  }

  lines.push('');
  return lines.join('\n');
}

function toolSchemaIndex(tools: FunctionTool[]): Record<string, Record<string, any>> {
  const index: Record<string, Record<string, any>> = {};
  for (const tool of tools || []) {
    if (tool?.type !== 'function' || !tool.function) continue;
    const name = tool.function.name;
    if (name) index[name] = (tool.function.parameters || {}) as Record<string, any>;
  }
  return index;
}

function defaultForType(ptype: string): unknown {
  switch (ptype) {
    case 'string': return '';
    case 'integer':
    case 'number': return 0;
    case 'boolean': return false;
    case 'array': return [];
    case 'object': return {};
    default: return '';
  }
}

function normalizeToolArgs(
  rawArgs: unknown,
  schema: Record<string, any>,
): Record<string, unknown> {
  let args: Record<string, unknown>;
  if (typeof rawArgs === 'string') {
    try {
      args = JSON.parse(rawArgs);
    } catch {
      args = {};
    }
  } else if (rawArgs && typeof rawArgs === 'object') {
    args = rawArgs as Record<string, unknown>;
  } else {
    args = {};
  }

  const props = (schema?.properties || {}) as Record<string, any>;
  const required: string[] = Array.isArray(schema?.required) ? schema.required : [];

  for (const key of required) {
    if (!(key in args) || args[key] === null || args[key] === undefined) {
      const pinfo = props[key] || {};
      args[key] = defaultForType(pinfo.type || 'string');
    } else {
      const pinfo = props[key] || {};
      const ptype = pinfo.type || 'string';
      const val = args[key];
      if (ptype === 'string' && typeof val !== 'string') args[key] = String(val);
      else if (ptype === 'integer' && typeof val !== 'number') {
        const n = Number(val);
        args[key] = Number.isInteger(n) ? n : 0;
      } else if (ptype === 'number' && typeof val !== 'number') {
        const n = Number(val);
        args[key] = Number.isNaN(n) ? 0 : n;
      } else if (ptype === 'boolean' && typeof val !== 'boolean') {
        args[key] = Boolean(val);
      } else if (ptype === 'array' && !Array.isArray(val)) {
        args[key] = [val];
      } else if (ptype === 'object' && (typeof val !== 'object' || val === null)) {
        args[key] = {};
      }
    }
  }
  return args;
}

function extractCallObjects(obj: unknown): unknown[] {
  if (Array.isArray(obj)) return obj;
  if (obj && typeof obj === 'object') {
    const o = obj as Record<string, unknown>;
    if (Array.isArray(o.tool_calls)) return o.tool_calls;
    return [obj];
  }
  return [];
}

/**
 * 从模型输出文本中解析 <tool_call>…</tool_call> 块。
 * 返回 (去掉标签后的纯文本, OpenAI 格式工具调用列表)。
 */
export function parseToolCalls(
  content: string,
  tools: FunctionTool[],
): { text: string; toolCalls: ChatToolCall[] } {
  const pattern = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g;
  const matches = [...content.matchAll(pattern)];
  if (!matches.length) return { text: content, toolCalls: [] };

  const schemaIndex = toolSchemaIndex(tools);
  const toolCalls: ChatToolCall[] = [];
  const hex = '0123456789abcdef';

  for (const m of matches) {
    try {
      const call = JSON.parse(m[1].trim());
      for (const item of extractCallObjects(call)) {
        if (!item || typeof item !== 'object') continue;
        const it = item as Record<string, any>;
        const name =
          it.name || it.tool || it.tool_name || it.function?.name;
        if (!name) continue;
        let arguments_ =
          it.arguments ?? it.parameters ?? it.args ?? it.tool_input ?? it.input;
        if (it.function && typeof it.function === 'object' && arguments_ === undefined) {
          arguments_ = it.function.arguments;
        }
        const normalized = normalizeToolArgs(arguments_, schemaIndex[name] || {});
        let id = 'call_';
        for (let i = 0; i < 8; i++) id += hex[Math.floor(Math.random() * 16)];
        toolCalls.push({
          id,
          type: 'function',
          function: { name: String(name), arguments: JSON.stringify(normalized) },
        });
      }
    } catch {
      // 跳过无法解析的块
    }
  }

  const text = content.replace(pattern, '').trim();
  return { text, toolCalls };
}

/** 把消息 content（字符串或数组）提取为纯文本 */
export function extractTextContent(content: unknown): string {
  if (content === null || content === undefined) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const item of content) {
      if (item && typeof item === 'object' && (item as any).type === 'text') {
        parts.push(String((item as any).text ?? ''));
      } else if (typeof item === 'string') {
        parts.push(item);
      }
    }
    return parts.join('\n');
  }
  return String(content);
}

/**
 * 把 OpenAI 消息 + 工具翻译为上游 ChatJimmy 需要的 (chatMessages, systemPrompt)。
 * - system 消息累积进 systemPrompt
 * - assistant 历史 tool_calls → <tool_call> 文本块
 * - tool 角色结果 → <tool_result> 文本块（以 user 消息呈现）
 * - 工具定义 → 追加到 systemPrompt
 */
export function translateMessages(
  messages: ChatMessage[],
  tools: FunctionTool[],
  toolChoice: unknown,
): { chatMessages: UpstreamMessage[]; systemPrompt: string } {
  const systemParts: string[] = [];
  const chatMessages: UpstreamMessage[] = [];
  let hasToolHistory = false;

  for (const msg of messages || []) {
    const role = msg.role || 'user';
    const content = extractTextContent(msg.content);

    if (role === 'system') {
      systemParts.push(content);
    } else if (role === 'assistant' && Array.isArray(msg.tool_calls) && msg.tool_calls.length) {
      hasToolHistory = true;
      const parts: string[] = [];
      if (content) parts.push(content);
      for (const tc of msg.tool_calls) {
        let args: unknown = {};
        try {
          args = JSON.parse(tc.function.arguments || '{}');
        } catch {
          args = tc.function.arguments || {};
        }
        parts.push(
          '<tool_call>\n' + JSON.stringify({ name: tc.function.name, arguments: args }, null, 2) + '\n</tool_call>',
        );
      }
      chatMessages.push({ role: 'assistant', content: parts.join('\n') });
    } else if (role === 'tool') {
      hasToolHistory = true;
      const toolResult = {
        name: msg.name || 'unknown',
        tool_call_id: msg.tool_call_id || '',
        content,
      };
      chatMessages.push({
        role: 'user',
        content: '<tool_result>\n' + JSON.stringify(toolResult, null, 2) + '\n</tool_result>',
      });
    } else {
      chatMessages.push({ role: role === 'assistant' ? 'assistant' : 'user', content });
    }
  }

  let systemPrompt = systemParts.join('\n').trim();
  if (hasToolHistory) {
    const guide =
      'The conversation history contains <tool_call> blocks (tool calls you made earlier) ' +
      'and <tool_result> blocks (the results returned by tools). Use the tool results to answer ' +
      'the user\'s latest question directly. Never echo <tool_call> or <tool_result> blocks back ' +
      'into your answer, and never repeat the raw JSON inside them.';
    systemPrompt = systemPrompt ? `${systemPrompt}\n\n${guide}` : guide;
  }
  if (tools.length) {
    // 工具段塞进系统提示词预算：超出时优先裁掉靠后的工具，绝不把 <tools> JSON 截成半截
    const baseLen = systemPrompt.length;
    let section = '';
    const chosen: FunctionTool[] = [];
    for (const t of tools) {
      const next = formatToolsForPrompt([...chosen, t], toolChoice);
      if (baseLen + next.length <= MAX_SYSTEM_PROMPT) {
        section = next;
        chosen.push(t);
      } else {
        break;
      }
    }
    systemPrompt += section;
    log('tools', { total: tools.length, kept: chosen.length, sectionChars: section.length });
  }
  if (systemPrompt.length > MAX_SYSTEM_PROMPT) {
    // 兜底：用户自带 system 消息本身超长时按字符截断
    systemPrompt = systemPrompt.slice(0, MAX_SYSTEM_PROMPT);
  }
  return { chatMessages, systemPrompt };
}
