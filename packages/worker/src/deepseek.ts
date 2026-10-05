/**
 * DeepSeek 官方模型清单（写死快照）。
 *
 * 数据来源：DeepSeek 官方文档，抓取日期见 STATIC_SNAPSHOT_DATE
 *   - 模型 & 价格：https://api-docs.deepseek.com/quick_start/pricing
 *   - 获取模型列表：https://api-docs.deepseek.com/api/list-models
 *   - 更新日志：https://api-docs.deepseek.com/updates
 *   - 思考模式（effort 档位）：https://api-docs.deepseek.com/guides/thinking_mode
 *
 * 不联网、不需要任何 key。官方发新模型时手改下面的 STATIC_MODELS 即可。
 *
 * 字段对齐官方 `GET /models` 的返回：
 *   id / object / owned_by / name / context_window / max_output_tokens /
 *   input_modalities / output_modalities / effort / api_capabilities
 * 标注「推断」的是文档只给了字段含义、没明写取值，按文档描述填的。
 *
 * 已退役但官方仍接受的别名：`deepseek-v4-flash`、`deepseek-v4-flash-vision-exp`
 *   （请求会路由到 V4.1-Flash 并按 Flash 计费）。因为客户端传什么 model 我们都原样回显，
 *   所以用别名一样能用；想让它们也出现在列表里，往 STATIC_MODELS 里加一条即可。
 */
import type { DeepSeekModel } from './types';

/** 下面这份清单的抓取日期 */
export const STATIC_SNAPSHOT_DATE = '2026-09-10';

/** 客户端不传 model 时回显的模型名，对齐 DeepSeek 当前正式名 */
export const DEFAULT_MODEL_ID = 'deepseek-flash';

/**
 * 官方当前可用的正式模型：
 *   - deepseek-flash   = DeepSeek-V4.1-Flash，原生多模态，1M 上下文，最大输出 384K
 *   - deepseek-v4-pro  = DeepSeek-V4-Pro-0813，纯文本，1M 上下文，最大输出 384K
 *   - 思考模式默认开启，默认 effort = high，支持 low / high / max
 */
export const STATIC_MODELS: DeepSeekModel[] = [
  {
    id: 'deepseek-flash',
    object: 'model',
    owned_by: 'deepseek',
    name: 'DeepSeek-V4.1-Flash', // 推断：展示名
    context_window: 1000000, // 文档：CONTEXT LENGTH 1M
    max_output_tokens: 384 * 1024, // 文档：MAX OUTPUT 384K
    input_modalities: ['text', 'image'], // 文档：V4.1-Flash 支持 Vision
    output_modalities: ['text'],
    effort: { supported_levels: ['low', 'high', 'max'], default_level: 'high' }, // 文档：low/high/max，默认 high
    api_capabilities: {
      anthropic_messages: { system_prompt_update: 'leading-only' }, // 推断：二选一
    },
  },
  {
    id: 'deepseek-v4-pro',
    object: 'model',
    owned_by: 'deepseek',
    name: 'DeepSeek-V4-Pro', // 推断：展示名
    context_window: 1000000,
    max_output_tokens: 384 * 1024,
    input_modalities: ['text'], // 文档：V4-Pro 不支持 Vision
    output_modalities: ['text'],
    effort: { supported_levels: ['low', 'high', 'max'], default_level: 'high' },
    api_capabilities: {
      anthropic_messages: { system_prompt_update: 'leading-only' }, // 推断
    },
  },
];

/** 清单里的模型 id（顺序即展示顺序） */
export const MODEL_IDS: string[] = STATIC_MODELS.map((m) => m.id);
