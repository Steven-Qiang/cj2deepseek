/** 消息内容单元（OpenAI 风格 content 数组元素） */
export type ContentPart =
  | { type: 'text'; text: string }
  | { type: string; [k: string]: unknown };

/** OpenAI Chat Completions 风格的函数调用 */
export interface ChatToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

/** OpenAI Chat Completions 风格的函数工具定义 */
export interface FunctionTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[] | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ChatToolCall[];
}

export interface ChatRequest {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
  top_k?: number;
  topK?: number;
  temperature?: number;
  max_tokens?: number;
  tools?: FunctionTool[];
  tool_choice?: unknown;
  toolChoice?: unknown;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: ChatToolCall[];
    };
    finish_reason: 'stop' | 'length' | 'tool_calls';
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string | null;
      tool_calls?: {
        index: number;
        id?: string;
        type?: 'function';
        function?: { name?: string; arguments?: string };
      }[];
    };
    finish_reason: string | null;
  }[];
}

/** 发给上游 ChatJimmy 的消息（只有 user / assistant 纯文本） */
export interface UpstreamMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** 上游 ChatJimmy 请求体 */
export interface UpstreamPayload {
  messages: UpstreamMessage[];
  chatOptions: {
    selectedModel: string;
    systemPrompt: string;
    topK: number;
  };
  attachment: null;
}

export interface UpstreamStats {
  prefill_tokens?: number;
  decode_tokens?: number;
  total_tokens?: number;
  done_reason?: string;
}

/** OpenAI Responses API 请求 */
export interface ResponsesRequest {
  model?: string;
  input: unknown;
  instructions?: string;
  tools?: unknown[];
  tool_choice?: unknown;
  stream?: boolean;
  top_k?: number;
  topK?: number;
  temperature?: number;
  max_output_tokens?: number;
}
