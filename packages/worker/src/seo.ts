/**
 * SEO / 分享：按"本次下发的皮肤"注入完整 head，并把该皮肤的首屏内容预渲染进 #app。
 *
 * 为什么不是真 SSR：
 *   14 套皮肤全是静态文案，没有任何需要实时数据的内容；真 SSR 还要处理
 *   localStorage / window / 每秒计时带来的 hydration 不一致，并让 CF 与 EdgeOne
 *   各带一份 @vue/server-renderer。这里改成"预渲染首屏占位 + 按皮肤注入 head"：
 *   - 不执行 JS 的爬虫与分享预览能读到完整正文、标题与 og 信息
 *   - Vue 挂载时会整体替换 #app 里的这段静态内容，所以不存在 hydration 问题
 *   - 服务端把选中的皮肤注入 window.__RELAY_SKIN__，客户端首访直接采用，不会闪
 */
import type { SkinMeta } from './skin-meta';
import { SKIN_META } from './skin-meta';
import { OG_CARDS } from './og-cards';
import { STATIC_MODELS } from './deepseek';

export const SKIN_COOKIE = 'relay_skin';

/** 站点长期口径，head 与首屏都要用到 */
export const OPERATING_PLEDGE = '永久免费 · 永久开启 · 永不关站；如遇不可抗力将提前 180 天公告';

export function listSkins(): SkinMeta[] {
  return SKIN_META;
}

export function findSkinMeta(id: string | null | undefined): SkinMeta | undefined {
  if (!id) return undefined;
  return SKIN_META.find((s) => s.id === id);
}

export function randomSkinId(): string {
  return SKIN_META[Math.floor(Math.random() * SKIN_META.length)].id;
}

export function defaultSkinId(): string {
  return SKIN_META[0]?.id ?? 'relay-dark';
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 极简首屏样式（只作用于预渲染块；Vue 挂载后这块会被整体替换掉） */
function firstScreenStyle(meta: SkinMeta): string {
  const dark = meta.theme === 'dark';
  const bg = dark ? '#0b0e15' : '#ffffff';
  const fg = dark ? '#e6ebf5' : '#101828';
  const muted = dark ? '#94a3b8' : '#64748b';
  const line = dark ? 'rgba(148,163,184,.22)' : 'rgba(15,23,42,.12)';
  return [
    '<style>',
    `.relay-first{min-height:100vh;box-sizing:border-box;padding:40px 20px 64px;background:${bg};color:${fg};`,
    `font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;line-height:1.7}`,
    `.relay-first .wrap{max-width:760px;margin:0 auto}`,
    `.relay-first .brand{display:flex;align-items:center;gap:8px;font-weight:700;font-size:17px}`,
    `.relay-first .tag{font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid ${line};color:${meta.accent}}`,
    `.relay-first h1{font-size:30px;line-height:1.3;margin:22px 0 10px;letter-spacing:-.01em}`,
    `.relay-first .sub{color:${muted};font-size:15px;margin-bottom:18px}`,
    `.relay-first .bar{height:3px;width:72px;background:${meta.accent};border-radius:2px;margin:18px 0 22px}`,
    `.relay-first ul{margin:0 0 22px;padding-left:20px;font-size:15px}`,
    `.relay-first li{margin:4px 0}`,
    `.relay-first h2{font-size:15px;margin:26px 0 10px;padding-top:16px;border-top:1px solid ${line}}`,
    `.relay-first code,.relay-first pre{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px}`,
    `.relay-first pre{background:${dark ? 'rgba(255,255,255,.05)' : '#f8fafc'};border:1px solid ${line};`,
    `border-radius:10px;padding:12px 14px;overflow-x:auto;margin:0 0 14px;white-space:pre-wrap;word-break:break-all}`,
    `.relay-first dl{margin:0;font-size:15px}`,
    `.relay-first dt{font-weight:600;margin-top:12px}`,
    `.relay-first dd{margin:2px 0 0;color:${muted}}`,
    `.relay-first .pledge{margin-top:26px;padding-top:14px;border-top:1px solid ${line};color:${muted};font-size:13px}`,
    '</style>',
  ].join('');
}

/** 预渲染首屏：不执行 JS 时看到的完整正文；Vue 挂载后整体替换 */
export function buildFirstScreen(meta: SkinMeta, origin: string): string {
  const models = STATIC_MODELS.map((m) => m.id);
  const endpoints = ['POST ' + origin + '/v1/chat/completions', 'POST ' + origin + '/v1/responses', 'GET ' + origin + '/v1/models'];

  return [
    '<div class="relay-first"><div class="wrap">',
    '<div class="brand">' + escapeHtml(meta.brand) + '<span class="tag">免费中转</span></div>',
    '<h1>' + escapeHtml(meta.headline) + '</h1>',
    '<p class="sub">' + escapeHtml(meta.tagline) + '</p>',
    '<div class="bar"></div>',
    '<ul>' + meta.features.map((f) => '<li>' + escapeHtml(f) + '</li>').join('') + '</ul>',
    '<h2>接入信息</h2>',
    '<pre>' + escapeHtml('Base URL: ' + origin + '/v1' + '\n' + endpoints.join('\n')) + '</pre>',
    '<p class="sub">API Key：打开页面后自动生成；填任意 sk- 开头的字符串同样可以调用。</p>',
    '<h2>可用模型</h2>',
    '<ul>' + models.map((m) => '<li><code>' + escapeHtml(m) + '</code></li>').join('') + '</ul>',
    '<h2>常见问题</h2>',
    '<dl>' +
      meta.faq
        .map((item) => '<dt>' + escapeHtml(item.q) + '</dt><dd>' + escapeHtml(item.a) + '</dd>')
        .join('') +
      '</dl>',
    '<p class="pledge">' + escapeHtml(OPERATING_PLEDGE) + ' · 仅供学习研究与娱乐使用。</p>',
    '</div></div>',
  ].join('');
}

/** 按皮肤生成 head 片段（title / description / og / twitter / canonical / JSON-LD） */
export function buildHead(meta: SkinMeta, origin: string, canonical: string): string {
  const ogImage = `${origin}/og/${meta.id}.png`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: meta.brand,
        url: canonical,
        description: meta.description,
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'FAQPage',
        mainEntity: meta.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };

  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}">`,
    meta.keywords.length ? `<meta name="keywords" content="${escapeHtml(meta.keywords.join(','))}">` : '',
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    `<meta name="theme-color" content="${escapeHtml(meta.accent)}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${escapeHtml(meta.brand)}">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:type" content="image/png">',
    '<meta property="og:locale" content="zh_CN">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}">`,
    firstScreenStyle(meta),
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
    `<script>window.__RELAY_SKIN__=${JSON.stringify(meta.id)};</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');
}

/**
 * 把预渲染内容注入单文件页面：
 *   - 去掉构建产物里的兜底 title/description（换成本次皮肤的真实值）
 *   - head 注入 SEO 片段
 *   - #app 里塞入首屏静态内容
 */
export function injectPage(baseHtml: string, meta: SkinMeta, origin: string, canonical: string): string {
  return baseHtml
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/i, '')
    .replace('</head>', `${buildHead(meta, origin, canonical)}\n  </head>`)
    .replace('<div id="app"></div>', `<div id="app">${buildFirstScreen(meta, origin)}</div>`);
}

export function renderRobots(origin: string): string {
  return ['User-agent: *', 'Allow: /', 'Disallow: /v1/', 'Disallow: /og/', '', `Sitemap: ${origin}/sitemap.xml`, ''].join('\n');
}

export function renderSitemap(origin: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = SKIN_META.map(
    (m) =>
      `  <url>\n    <loc>${origin}/skin/${m.id}</loc>\n    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function renderSkinIndex(origin: string): string {
  const links = SKIN_META.map((m) => `<li><a href="${origin}/skin/${m.id}">${escapeHtml(m.brand)}</a></li>`).join('');
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>站点皮肤索引</title></head><body><h1>皮肤索引</h1><ul>${links}</ul></body></html>`;
}

/** base64 → 二进制（workerd 与 Node 18 都能用） */
export function decodeBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function findOgCard(id: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(OG_CARDS, id) ? OG_CARDS[id] : undefined;
}

export function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

export function skinCookie(id: string): string {
  return `${SKIN_COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
