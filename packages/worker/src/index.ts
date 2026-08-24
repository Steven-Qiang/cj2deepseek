import { handleChatCompletions } from './chat';
import { handleModels } from './models';
import { renderDemoPage } from './page';
import { handleResponses } from './responses';
import { CORS_HEADERS } from './utils';
import { log } from './logger';

/** QQ 分享卡片图（1200x630，og 尺寸） */
const SHARE_CARD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#101830"/>
      <stop offset="1" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="acc" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4a9eff"/>
      <stop offset="1" stop-color="#4ade80"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="40" y="40" width="1120" height="550" rx="28" fill="none" stroke="url(#acc)" stroke-width="3" opacity="0.55"/>
  <text x="120" y="315" font-family="system-ui,Segoe UI,sans-serif" font-size="104" font-weight="700" fill="url(#acc)">RelayHub</text>
  <text x="122" y="392" font-family="system-ui,Segoe UI,sans-serif" font-size="34" fill="#8aa0c0">开源 AI 转发工具 · OpenAI 兼容</text>
  <text x="122" y="450" font-family="system-ui,Segoe UI,sans-serif" font-size="26" fill="#6a80a0">聚合转发 ChatGPT / Claude / DeepSeek / Gemini 等主流模型</text>
</svg>`;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (path === '/' && request.method === 'GET') {
      return new Response(renderDemoPage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (path === '/share-card.svg' && request.method === 'GET') {
      return new Response(SHARE_CARD_SVG, {
        headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
      });
    }

    if (
      (path === '/v1/chat/completions' || path === '/chat/completions') &&
      request.method === 'POST'
    ) {
      return handleChatCompletions(request);
    }

    if (
      (path === '/v1/responses' || path === '/responses') &&
      request.method === 'POST'
    ) {
      return handleResponses(request);
    }

    if (
      (path === '/v1/models' || path === '/models') &&
      request.method === 'GET'
    ) {
      return handleModels();
    }

    log('404', { method: request.method, path });
    return new Response(
      JSON.stringify({ error: { message: 'Not Found', type: 'invalid_request_error' } }),
      { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  },
};
