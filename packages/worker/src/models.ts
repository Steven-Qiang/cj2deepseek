import { STATIC_MODELS } from './deepseek';
import { CORS_HEADERS } from './utils';

/**
 * GET /v1/models
 *
 * 返回 deepseek.ts 里写死的 DeepSeek 官方模型清单（含 name / context_window /
 * max_output_tokens / 模态 / effort / api_capabilities 等完整元数据）。
 * 响应体保持纯正的 OpenAI 结构，不塞任何自定义字段。
 */
export function handleModels(): Response {
  return new Response(JSON.stringify({ object: 'list', data: STATIC_MODELS }), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
