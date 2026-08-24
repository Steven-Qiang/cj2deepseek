import type { UpstreamMessage, UpstreamPayload } from './types';
import { UPSTREAM_MODEL } from './utils';
import { log } from './logger';

const UPSTREAM_URL = 'https://chatjimmy.ai/api/chat';

const UPSTREAM_HEADERS = {
  'content-type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

export interface UpstreamCall {
  messages: UpstreamMessage[];
  systemPrompt: string;
  topK?: number;
}

export interface UpstreamMeta {
  reqId?: string;
}

export async function fetchUpstream(
  call: UpstreamCall,
  meta?: UpstreamMeta,
): Promise<Response> {
  // 客户端请求什么模型（deepseek-v4-flash / deepseek-v4-pro ...）都无所谓，
  // 实际固定使用 ChatJimmy 的 llama3.1-8B，绝不上传请求中的模型名。
  const payload: UpstreamPayload = {
    messages: call.messages,
    chatOptions: {
      selectedModel: UPSTREAM_MODEL,
      systemPrompt: call.systemPrompt,
      topK: call.topK ?? 8,
    },
    attachment: null,
  };

  const t0 = Date.now();
  log('upstream', {
    req: meta?.reqId,
    url: UPSTREAM_URL,
    msgs: call.messages.length,
    sysChars: call.systemPrompt.length,
    topK: call.topK ?? 8,
  });

  try {
    const resp = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: UPSTREAM_HEADERS,
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const detail = (await resp.text().catch(() => '')).slice(0, 1000);
      log('upstream-err', {
        req: meta?.reqId,
        status: resp.status,
        ms: Date.now() - t0,
        detail,
      });
      throw new Error(`上游返回 ${resp.status}: ${detail}`);
    }

    log('upstream-ok', { req: meta?.reqId, status: resp.status, ms: Date.now() - t0 });
    return resp;
  } catch (err: any) {
    if (!(err instanceof Error && String(err.message).startsWith('上游返回'))) {
      log('upstream-fail', {
        req: meta?.reqId,
        ms: Date.now() - t0,
        err: String(err?.message || err),
      });
    }
    throw err;
  }
}
