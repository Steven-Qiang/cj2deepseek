/**
 * 全部请求处理逻辑（Cloudflare Worker 与 EdgeOne 函数共用）。
 *
 * 两条平台入口都很薄：
 *   - packages/worker/src/index.ts    → CF Workers 的 default.fetch
 *   - packages/worker/functions/index.ts → EdgeOne 的 onRequest
 */
import { handleChatCompletions } from './chat';
import { handleModels } from './models';
import { renderDemoPage } from './page';
import { handleResponses } from './responses';
import { CORS_HEADERS } from './utils';
import { log } from './logger';
import {
  SKIN_COOKIE,
  decodeBase64,
  defaultSkinId,
  findOgCard,
  findSkinMeta,
  injectPage,
  listSkins,
  randomSkinId,
  readCookie,
  renderRobots,
  renderSkinIndex,
  renderSitemap,
  skinCookie,
} from './seo';

/** QQ 分享卡片图（1200x630，og 尺寸）—— 兜底图，按皮肤的图在 /og/<id>.png */
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

const HTML_HEADERS = { 'Content-Type': 'text/html; charset=utf-8' } as const;

/** 解析 ?skin= 换肤入口：支持 1 起序号 / 皮肤 id / random */
function resolveRequestedSkin(raw: string | null): string | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (key === 'random') return randomSkinId();
  if (/^\d+$/.test(key)) return listSkins()[Number(key) - 1]?.id ?? null;
  return findSkinMeta(key)?.id ?? null;
}

/**
 * 渲染页面：按皮肤注入 head 与预渲染首屏。
 *   /            随机（或沿用 cookie / ?skin=）并写 cookie
 *   /skin/<id>   固定该皮肤，内容对爬虫完全确定
 * canonical 一律指向 /skin/<id>，避免首页与皮肤页重复内容。
 */
function renderPage(request: Request, url: URL): Response {
  const origin = url.origin;
  const cookieSkin = findSkinMeta(readCookie(request.headers.get('Cookie'), SKIN_COOKIE))?.id ?? null;
  const isSkinPath = url.pathname.startsWith('/skin/');
  let skinId: string;
  let setCookie = false;

  if (isSkinPath) {
    const requested = decodeURIComponent(url.pathname.slice('/skin/'.length).replace(/\/+$/, ''));
    const meta = findSkinMeta(requested);
    if (!meta) {
      return new Response(
        `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>404 · 皮肤不存在</title></head>` +
          `<body style="font-family:system-ui;padding:40px"><h1>404</h1><p>没有这套皮肤。</p>` +
          `<p><a href="/">回首页</a> · <a href="/skin">皮肤索引</a></p></body></html>`,
        { status: 404, headers: HTML_HEADERS },
      );
    }
    skinId = meta.id;
  } else {
    const forced = resolveRequestedSkin(url.searchParams.get('skin'));
    if (forced) {
      skinId = forced;
      setCookie = cookieSkin !== skinId;
    } else if (cookieSkin) {
      skinId = cookieSkin;
    } else {
      skinId = randomSkinId();
      setCookie = true;
    }
  }

  const meta = findSkinMeta(skinId) ?? findSkinMeta(defaultSkinId())!;
  const canonical = `${origin}/skin/${meta.id}`;
  const html = injectPage(renderDemoPage(), meta, origin, canonical);

  const headers: Record<string, string> = {
    ...HTML_HEADERS,
    'X-Relay-Skin': meta.id,
  };
  if (isSkinPath) {
    // 可收录 URL：内容完全确定，可以直接缓存（/skin/<id> 不下发 cookie，避免 CDN 缓存带 Set-Cookie 的响应）
    headers['Cache-Control'] = 'public, max-age=300, s-maxage=3600';
  } else {
    // 首页内容随 cookie 变，不能缓存串味
    headers['Cache-Control'] = 'no-store';
    headers.Vary = 'Cookie';
    if (setCookie) headers['Set-Cookie'] = skinCookie(meta.id);
  }

  log('page', { path: url.pathname, skin: meta.id, cookie: cookieSkin ?? 'none' });
  return new Response(html, { headers });
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const origin = url.origin;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (request.method === 'GET') {
    // 页面（含按皮肤的可收录 URL）
    if (path === '/' || path.startsWith('/skin/')) {
      return renderPage(request, url);
    }

    if (path === '/skin') {
      return new Response(renderSkinIndex(origin), { headers: HTML_HEADERS });
    }

    if (path === '/robots.txt') {
      return new Response(renderRobots(origin), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    if (path === '/sitemap.xml') {
      return new Response(renderSitemap(origin), {
        headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    // 按皮肤的分享卡片
    if (path.startsWith('/og/') && path.endsWith('.png')) {
      const card = findOgCard(decodeURIComponent(path.slice('/og/'.length, -'.png'.length)));
      if (!card) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response(decodeBase64(card), {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800, immutable' },
      });
    }

    if (path === '/share-card.svg') {
      return new Response(SHARE_CARD_SVG, {
        headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
      });
    }
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
}
