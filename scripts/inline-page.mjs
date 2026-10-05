// 把 packages/web 构建出的单文件 HTML 内嵌进 packages/worker/src/page.ts，
// 同时把两份"构建期生成"的数据也投递给 Worker（skin-meta.ts / og-cards.ts）。
//
// 用法：pnpm run build:page（先 vite build，再跑本脚本）。
// 产物 page.ts / skin-meta.ts / og-cards.ts 都是生成文件：
//   页面源码改 packages/web/src/，皮肤 SEO 元数据改 packages/web/src/skins/skin-meta.ts，
//   分享卡片改 packages/web/og-cards/*.png（用 scripts/og-card-generator.py 生成）。
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'packages', 'web', 'dist', 'index.html');
const outPath = path.join(root, 'packages', 'worker', 'src', 'page.ts');
const metaSrcPath = path.join(root, 'packages', 'web', 'src', 'skins', 'skin-meta.ts');
const metaOutPath = path.join(root, 'packages', 'worker', 'src', 'skin-meta.ts');
const ogDir = path.join(root, 'packages', 'web', 'og-cards');
const ogOutPath = path.join(root, 'packages', 'worker', 'src', 'og-cards.ts');

const banner = (what) =>
  [
    '// ============================================================',
    `// 本文件由 scripts/inline-page.mjs 自动生成 —— 请勿手改！`,
    `// 源：${what}`,
    '// 执行 `pnpm run build:page` 重新生成后再部署。',
    '// ============================================================',
  ].join('\n');

// ---------- 1) 单文件页面 → page.ts ----------
const html = readFileSync(htmlPath, 'utf8');

// 转义，使其能安全嵌入 TS 模板字符串：\ → \\，` → \`，${ → \${（顺序不能换）
const escaped = html
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  `${banner('packages/web/（Vue 3 + TypeScript）')}
export function renderDemoPage(): string {
  return \`${escaped}\`;
}
`,
);
console.log(`[inline-page] ${outPath} generated (html ${html.length} bytes)`);

// ---------- 2) 皮肤 SEO 元数据 → worker/src/skin-meta.ts ----------
if (existsSync(metaSrcPath)) {
  const src = readFileSync(metaSrcPath, 'utf8');
  writeFileSync(
    metaOutPath,
    `${banner('packages/web/src/skins/skin-meta.ts')}
${src}`,
  );
  console.log(`[inline-page] ${metaOutPath} generated (${src.length} bytes)`);
} else {
  console.warn(`[inline-page] 跳过 skin-meta：找不到 ${metaSrcPath}`);
}

// ---------- 3) 分享卡片 → worker/src/og-cards.ts（base64 内联，无需静态托管） ----------
const cards = existsSync(ogDir)
  ? readdirSync(ogDir).filter((f) => f.toLowerCase().endsWith('.png')).sort()
  : [];

let inlined = 0;
const entries = cards.map((file) => {
  const buf = readFileSync(path.join(ogDir, file));
  inlined += buf.length;
  const id = file.replace(/\.png$/i, '');
  return `  ${JSON.stringify(id)}: '${buf.toString('base64')}',`;
});

writeFileSync(
  ogOutPath,
  `${banner('packages/web/og-cards/*.png（scripts/og-card-generator.py 生成）')}
/** 皮肤 id → og:image 的 PNG（base64），由 /og/<id>.png 路由下发 */
export const OG_CARDS: Record<string, string> = {
${entries.join('\n')}
};
`,
);
console.log(
  `[inline-page] ${ogOutPath} generated (${cards.length} cards, ${Math.round(inlined / 1024)} KB png → ${Math.round(
    entries.join('').length / 1024,
  )} KB base64)`,
);
