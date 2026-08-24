import type {
  ChatRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ChatToolCall,
  ChatMessage,
  FunctionTool,
  UpstreamStats,
} from './types';
import { generateId, parseUpstreamResponse, buildUsage, CORS_HEADERS, resolveDisplayModel, randomHex } from './utils';
import { fetchUpstream } from './upstream';
import { filterTools, parseToolCalls, translateMessages, extractTextContent } from './tools';
import { log, logError } from './logger';

export interface RunResult {
  text: string;
  toolCalls: ChatToolCall[];
  stats: UpstreamStats | null;
}

/** 统一的上游执行入口：翻译消息 → 调 ChatJimmy → 解析文本与工具调用（带空响应/失败重试） */
export async function runUpstream(
  messages: ChatMessage[],
  tools: FunctionTool[],
  toolChoice: unknown,
  topK: number,
  meta?: { reqId?: string },
): Promise<RunResult> {
  const MAX_ATTEMPTS = 3;
  const { chatMessages, systemPrompt } = translateMessages(messages, tools, toolChoice);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const t0 = Date.now();
    try {
      const resp = await fetchUpstream({ messages: chatMessages, systemPrompt, topK }, meta);
      const raw = await resp.text();
      const { content, stats } = parseUpstreamResponse(raw);
      const { text, toolCalls } = parseToolCalls(content, tools);

      if (raw.trim() === '') {
        // ChatJimmy 偶发返回空体（重负载/限流），重试
        if (attempt < MAX_ATTEMPTS) {
          log('retry', { req: meta?.reqId, attempt, reason: 'empty-upstream', ms: Date.now() - t0 });
          await sleep(400 * attempt);
          continue;
        }
        throw new Error(`上游 ChatJimmy 连续 ${MAX_ATTEMPTS} 次返回空响应，请稍后重试`);
      }

      log('parse', {
        req: meta?.reqId,
        attempt,
        rawLen: raw.length,
        textLen: text.length,
        toolCalls: toolCalls.length,
        stats: stats ? JSON.stringify(stats) : 'none',
        preview: text.slice(0, 200),
      });
      return { text, toolCalls, stats };
    } catch (err: any) {
      if (attempt < MAX_ATTEMPTS) {
        log('retry', {
          req: meta?.reqId,
          attempt,
          reason: String(err?.message || err).slice(0, 200),
          ms: Date.now() - t0,
        });
        await sleep(400 * attempt);
        continue;
      }
      throw err;
    }
  }

  throw new Error('上游 ChatJimmy 重试后仍然失败');
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function handleNonStream(body: ChatRequest, reqId?: string): Promise<Response> {
  const model = resolveDisplayModel(body.model);
  const tools = filterTools(body.tools);
  const topK = body.top_k ?? body.topK ?? 8;
  const { text, toolCalls, stats } = await runUpstream(
    body.messages,
    tools,
    body.tool_choice ?? body.toolChoice,
    topK,
    { reqId },
  );

  const message: ChatCompletionResponse['choices'][0]['message'] = toolCalls.length
    ? { role: 'assistant', content: text || null, tool_calls: toolCalls }
    : { role: 'assistant', content: text };

  const result: ChatCompletionResponse = {
    id: generateId(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message,
        finish_reason: toolCalls.length ? 'tool_calls' : 'stop',
      },
    ],
    usage: buildUsage(stats),
  };

  return new Response(JSON.stringify(result), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function toolCallDelta(toolCalls: ChatToolCall[]): ChatCompletionChunk['choices'][0]['delta'] {
  return {
    tool_calls: toolCalls.map((tc, i) => ({
      index: i,
      id: tc.id,
      type: 'function' as const,
      function: { name: tc.function.name, arguments: tc.function.arguments },
    })),
  };
}

function createStreamResponse(body: ChatRequest, run: RunResult): Response {
  const model = resolveDisplayModel(body.model);
  const { text, toolCalls, stats } = run;
  const id = generateId();
  const created = Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();
  const hasTools = toolCalls.length > 0;
  const pieces = hasTools ? (text ? [text] : []) : splitContent(text);

  const readable = new ReadableStream({
    async start(controller) {
      const roleChunk: ChatCompletionChunk = {
        id, object: 'chat.completion.chunk', created, model,
        choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(roleChunk)}\n\n`));

      for (const piece of pieces) {
        const chunk: ChatCompletionChunk = {
          id, object: 'chat.completion.chunk', created, model,
          choices: [{ index: 0, delta: { content: piece }, finish_reason: null }],
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }

      if (hasTools) {
        const toolChunk: ChatCompletionChunk = {
          id, object: 'chat.completion.chunk', created, model,
          choices: [{ index: 0, delta: toolCallDelta(toolCalls), finish_reason: null }],
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolChunk)}\n\n`));
      }

      const endChunk: ChatCompletionChunk = {
        id, object: 'chat.completion.chunk', created, model,
        choices: [{ index: 0, delta: {}, finish_reason: hasTools ? 'tool_calls' : 'stop' }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(endChunk)}\n\n`));

      if (stats) {
        const usageChunk = {
          id, object: 'chat.completion.chunk', created, model,
          choices: [],
          usage: buildUsage(stats),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(usageChunk)}\n\n`));
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function splitContent(text: string): string[] {
  if (!text) return [];
  const pieces: string[] = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + 3 + Math.floor(Math.random() * 10), text.length);
    if (end < text.length) {
      for (let j = end; j > i + 2; j--) {
        const ch = text[j];
        if (' ,.。，\n!？'.includes(ch)) { end = j + 1; break; }
      }
    }
    pieces.push(text.substring(i, end));
    i = end;
  }
  return pieces;
}

export async function handleChatCompletions(request: Request): Promise<Response> {
  let body: ChatRequest;
  try {
    body = await request.json() as ChatRequest;
  } catch {
    return new Response(
      JSON.stringify({ error: { message: '请求体 JSON 解析失败', type: 'invalid_request_error' } }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(
      JSON.stringify({ error: { message: 'messages 字段不能为空', type: 'invalid_request_error' } }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  const tools = filterTools(body.tools);
  const topK = body.top_k ?? body.topK ?? 8;
  const reqId = randomHex(6);
  const model = resolveDisplayModel(body.model);
  const last = body.messages[body.messages.length - 1];
  log('req', {
    req: reqId,
    path: '/v1/chat/completions',
    model,
    msgs: body.messages.length,
    tools: tools.length,
    stream: !!body.stream,
    topK,
  });
  log('prompt', { req: reqId, last: extractTextContent(last?.content).slice(0, 200) });

  try {
    if (body.stream) {
      const run = await runUpstream(
        body.messages,
        tools,
        body.tool_choice ?? body.toolChoice,
        topK,
        { reqId },
      );
      return createStreamResponse(body, run);
    }
    return await handleNonStream(body, reqId);
  } catch (err: any) {
    logError('chat-err', err, { req: reqId, status: 502 });
    return new Response(
      JSON.stringify({ error: { message: err.message || '内部错误', type: 'server_error' } }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
}
