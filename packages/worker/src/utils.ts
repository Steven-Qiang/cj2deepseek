import type { UpstreamStats } from './types';
import { DEFAULT_MODEL_ID, MODEL_IDS } from './deepseek';

/** 对外展示的默认模型名（客户端不传 model 时的回显值） */
export const DEFAULT_MODEL = DEFAULT_MODEL_ID;

/** 模型清单里的可用模型 id（与 /v1/models 返回一致） */
export const AVAILABLE_MODELS: string[] = MODEL_IDS;

/** 实际上游固定调用的真实模型（不对客户端暴露） */
export const UPSTREAM_MODEL = 'llama3.1-8B';

/**
 * 模型名原样回显：客户端传什么就回什么（gpt-4o / claude-3-5 / 乱填的都接受），
 * 不传或传空串时回退到 DEFAULT_MODEL。
 * 上游固定调 ChatJimmy 的 llama3.1-8B，这里的模型名纯粹用于回显，不参与路由。
 */
export function resolveDisplayModel(requested: string | undefined): string {
  const m = typeof requested === 'string' ? requested.trim() : '';
  return m || DEFAULT_MODEL;
}

export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `chatcmpl-${id}`;
}

/** 生成指定长度的随机十六进制串（用于 resp_/msg_/fc_ 等 id） */
export function randomHex(len: number): string {
  const chars = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < len; i++) {
    s += chars[Math.floor(Math.random() * 16)];
  }
  return s;
}

export function parseUpstreamResponse(raw: string): {
  content: string;
  stats: UpstreamStats | null;
} {
  const statsStart = raw.lastIndexOf('<|stats|>');
  if (statsStart === -1) {
    return { content: raw, stats: null };
  }

  const content = raw.substring(0, statsStart);
  const statsEnd = raw.lastIndexOf('<|/stats|>');
  if (statsEnd === -1) {
    return { content, stats: null };
  }

  const statsJson = raw.substring(statsStart + 9, statsEnd);
  try {
    return { content, stats: JSON.parse(statsJson) };
  } catch {
    return { content, stats: null };
  }
}

export function buildUsage(stats: UpstreamStats | null) {
  return {
    prompt_tokens: stats?.prefill_tokens ?? -1,
    completion_tokens: stats?.decode_tokens ?? -1,
    total_tokens: stats?.total_tokens ?? -1,
  };
}

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
