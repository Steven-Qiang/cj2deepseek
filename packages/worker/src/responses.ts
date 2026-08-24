import type {
  ResponsesRequest,
  ChatMessage,
  ChatToolCall,
  FunctionTool,
} from './types';
import { CORS_HEADERS, randomHex, resolveDisplayModel, buildUsage } from './utils';
import { runUpstream } from './chat';
import { filterTools, extractTextContent } from './tools';
import { log, logError } from './logger';

/** 把 Responses API 的 input 规范化为内部 ChatMessage[] */
function normalizeInput(input: unknown): ChatMessage[] {
  const messages: ChatMessage[] = [];
  if (typeof input === 'string') {
    messages.push({ role: 'user', content: input });
    return messages;
  }
  if (!Array.isArray(input)) {
    messages.push({
      role: 'user',
      content: input === null || input === undefined ? '' : JSON.stringify(input),
    });
    return messages;
  }

  let pendingCalls: ChatToolCall[] = [];
  const flushCalls = () => {
    if (pendingCalls.length) {
      messages.push({ role: 'assistant', content: null, tool_calls: pendingCalls });
      pendingCalls = [];
    }
  };

  for (const item of input) {
    if (typeof item === 'string') {
      flushCalls();
      messages.push({ role: 'user', content: item });
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const it = item as Record<string, any>;
    const type = it.type;

    if (type === 'message') {
      flushCalls();
      const role = it.role === 'assistant' ? 'assistant' : it.role === 'system' ? 'system' : 'user';
      messages.push({ role, content: it.content ?? '' });
    } else if (type === 'function_call') {
      const name = String(it.name ?? '');
      const args =
        typeof it.arguments === 'string'
          ? it.arguments
          : JSON.stringify(it.arguments ?? {});
      pendingCalls.push({
        id: it.call_id || `call_${randomHex(8)}`,
        type: 'function',
        function: { name, arguments: args },
      });
    } else if (type === 'function_call_output') {
      flushCalls();
      const output =
        typeof it.output === 'string' ? it.output : JSON.stringify(it.output ?? '');
      messages.push({
        role: 'tool',
        tool_call_id: it.call_id || '',
        name: it.name,
        content: output,
      });
    } else if (type === 'reasoning') {
      // 忽略推理项
    } else if (it.role === 'system' || it.role === 'user' || it.role === 'assistant') {
      flushCalls();
      messages.push({ role: it.role, content: it.content ?? '' });
    } else {
      flushCalls();
      messages.push({ role: 'user', content: JSON.stringify(it) });
    }
  }
  flushCalls();
  return messages;
}

/** 把 Responses API 的工具定义（含 chat 格式兼容）规范化为内部 FunctionTool[] */
function normalizeTools(tools: unknown): FunctionTool[] {
  if (!Array.isArray(tools)) return [];
  const out: FunctionTool[] = [];
  for (const t of tools) {
    if (!t || typeof t !== 'object') continue;
    const it = t as Record<string, any>;
    if (it.type !== 'function') continue;
    if (it.function && typeof it.function === 'object' && it.function.name) {
      out.push({
        type: 'function',
        function: {
          name: String(it.function.name),
          description: it.function.description,
          parameters: it.function.parameters,
        },
      });
    } else if (it.name) {
      out.push({
        type: 'function',
        function: {
          name: String(it.name),
          description: it.description,
          parameters: it.parameters,
        },
      });
    }
  }
  return out;
}

function toResponsesUsage(u: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) {
  return {
    input_tokens: u.prompt_tokens,
    input_tokens_details: { cached_tokens: 0 },
    output_tokens: u.completion_tokens,
    output_tokens_details: { reasoning_tokens: 0 },
    total_tokens: u.total_tokens,
  };
}

interface OutputItem {
  type: 'message' | 'function_call';
  [k: string]: unknown;
}

function buildOutput(text: string, toolCalls: ChatToolCall[]): OutputItem[] {
  const output: OutputItem[] = [];
  if (text) {
    output.push({
      type: 'message',
      id: `msg_${randomHex(24)}`,
      status: 'completed',
      role: 'assistant',
      content: [{ type: 'output_text', text, annotations: [] }],
    });
  }
  for (const tc of toolCalls) {
    output.push({
      type: 'function_call',
      id: `fc_${randomHex(24)}`,
      call_id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
      status: 'completed',
    });
  }
  return output;
}

function buildResponseObject(
  id: string,
  model: string,
  output: OutputItem[],
  usage: ReturnType<typeof toResponsesUsage>,
  toolChoice: unknown,
) {
  return {
    id,
    object: 'response',
    created_at: Math.floor(Date.now() / 1000),
    status: 'completed',
    error: null,
    incomplete_details: null,
    instructions: null,
    max_output_tokens: null,
    model,
    output,
    parallel_tool_calls: true,
    previous_response_id: null,
    reasoning: { effort: null, summary: null },
    store: false,
    temperature: null,
    text: { format: { type: 'text' } },
    tool_choice: toolChoice ?? 'auto',
    tools: [],
    top_p: null,
    truncation: null,
    usage,
    user: null,
    metadata: {},
  };
}

function createStreamResponse(
  body: ResponsesRequest,
  text: string,
  toolCalls: ChatToolCall[],
  usage: ReturnType<typeof toResponsesUsage>,
): Response {
  const model = resolveDisplayModel(body.model);
  const id = `resp_${randomHex(24)}`;
  const encoder = new TextEncoder();
  const pieces = splitContent(text);

  const baseResponse = {
    id,
    object: 'response',
    created_at: Math.floor(Date.now() / 1000),
    status: 'in_progress',
    model,
    output: [] as unknown[],
  };

  const events: { event: string; data: unknown }[] = [];
  events.push({ event: 'response.created', data: { type: 'response.created', response: { ...baseResponse } } });
  events.push({ event: 'response.in_progress', data: { type: 'response.in_progress', response: { ...baseResponse } } });

  let outputIndex = 0;
  if (text) {
    const msgId = `msg_${randomHex(24)}`;
    const outputText = { type: 'output_text', text, annotations: [] };
    const messageItem = {
      type: 'message',
      id: msgId,
      status: 'completed',
      role: 'assistant',
      content: [outputText],
    };
    const inProgressMessage = {
      type: 'message',
      id: msgId,
      status: 'in_progress',
      role: 'assistant',
      content: [] as unknown[],
    };
    const inProgressPart = { type: 'output_text', text: '', annotations: [] };

    events.push({
      event: 'response.output_item.added',
      data: { type: 'response.output_item.added', output_index: outputIndex, item: inProgressMessage },
    });
    events.push({
      event: 'response.content_part.added',
      data: {
        type: 'response.content_part.added',
        item_id: msgId,
        output_index: outputIndex,
        content_index: 0,
        part: inProgressPart,
      },
    });
    for (const piece of pieces) {
      events.push({
        event: 'response.output_text.delta',
        data: { type: 'response.output_text.delta', item_id: msgId, output_index: outputIndex, content_index: 0, delta: piece },
      });
    }
    events.push({
      event: 'response.output_text.done',
      data: { type: 'response.output_text.done', item_id: msgId, output_index: outputIndex, content_index: 0, text },
    });
    events.push({
      event: 'response.content_part.done',
      data: { type: 'response.content_part.done', item_id: msgId, output_index: outputIndex, content_index: 0, part: outputText },
    });
    events.push({
      event: 'response.output_item.done',
      data: { type: 'response.output_item.done', output_index: outputIndex, item: messageItem },
    });
    outputIndex += 1;
  }

  for (const tc of toolCalls) {
    const fcId = `fc_${randomHex(24)}`;
    const completedItem = {
      type: 'function_call',
      id: fcId,
      call_id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
      status: 'completed',
    };
    const inProgressItem = { ...completedItem, arguments: '', status: 'in_progress' };
    events.push({
      event: 'response.output_item.added',
      data: { type: 'response.output_item.added', output_index: outputIndex, item: inProgressItem },
    });
    events.push({
      event: 'response.function_call_arguments.delta',
      data: { type: 'response.function_call_arguments.delta', item_id: fcId, output_index: outputIndex, delta: tc.function.arguments },
    });
    events.push({
      event: 'response.function_call_arguments.done',
      data: { type: 'response.function_call_arguments.done', item_id: fcId, output_index: outputIndex, arguments: tc.function.arguments },
    });
    events.push({
      event: 'response.output_item.done',
      data: { type: 'response.output_item.done', output_index: outputIndex, item: completedItem },
    });
    outputIndex += 1;
  }

  const finalOutput = buildOutput(text, toolCalls);
  events.push({
    event: 'response.completed',
    data: {
      type: 'response.completed',
      response: {
        ...buildResponseObject(id, model, finalOutput, usage, body.tool_choice),
        status: 'completed',
      },
    },
  });

  const readable = new ReadableStream({
    start(controller) {
      for (const ev of events) {
        controller.enqueue(encoder.encode(`event: ${ev.event}\ndata: ${JSON.stringify(ev.data)}\n\n`));
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

export async function handleResponses(request: Request): Promise<Response> {
  let body: ResponsesRequest;
  try {
    body = await request.json() as ResponsesRequest;
  } catch {
    return new Response(
      JSON.stringify({ error: { message: '请求体 JSON 解析失败', type: 'invalid_request_error' } }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  if (body.input === undefined || body.input === null) {
    return new Response(
      JSON.stringify({ error: { message: 'input 字段不能为空', type: 'invalid_request_error' } }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const reqId = randomHex(6);
    const model = resolveDisplayModel(body.model);
    const messages = normalizeInput(body.input);
    if (body.instructions) {
      messages.unshift({ role: 'system', content: body.instructions });
    }
    const tools = filterTools(normalizeTools(body.tools));
    const topK = body.top_k ?? body.topK ?? 8;

    const last = messages[messages.length - 1];
    log('req', {
      req: reqId,
      path: '/v1/responses',
      model,
      msgs: messages.length,
      tools: tools.length,
      stream: !!body.stream,
      topK,
      instructions: !!body.instructions,
    });
    log('prompt', { req: reqId, last: extractTextContent(last?.content).slice(0, 200) });

    const { text, toolCalls, stats } = await runUpstream(
      messages,
      tools,
      body.tool_choice,
      topK,
      { reqId },
    );
    const usage = toResponsesUsage(buildUsage(stats));
    log('resp-out', { req: reqId, textLen: text.length, toolCalls: toolCalls.length });

    if (body.stream) {
      return createStreamResponse(body, text, toolCalls, usage);
    }

    const id = `resp_${randomHex(24)}`;
    const output = buildOutput(text, toolCalls);
    const result = buildResponseObject(id, model, output, usage, body.tool_choice);
    return new Response(JSON.stringify(result), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    logError('responses-err', err, { status: 502 });
    return new Response(
      JSON.stringify({ error: { message: err.message || '内部错误', type: 'server_error' } }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
}
