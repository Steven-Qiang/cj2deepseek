// 把 packages/web 构建出的单文件 HTML 内嵌进 packages/worker/src/page.ts。
// 用法：pnpm run build:page（先 vite build 再跑本脚本）。
// 产物 page.ts 是生成文件：页面源码请改 packages/web/src/，不要手改 page.ts。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'packages', 'web', 'dist', 'index.html');
const outPath = path.join(root, 'packages', 'worker', 'src', 'page.ts');

const html = readFileSync(htmlPath, 'utf8');

// 转义，使其能安全嵌入 TS 模板字符串：\ → \\，` → \`，${ → \${（顺序不能换）
const escaped = html
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const banner = [
  '// ============================================================',
  '// 本文件由 scripts/inline-page.mjs 自动生成 —— 请勿手改！',
  '// 页面源码在 packages/web/（Vue 3 + TypeScript），',
  '// 执行 `pnpm run build:page` 重新生成后再部署。',
  '// ============================================================',
].join('\n');

const ts = `${banner}
export function renderDemoPage(): string {
  return \`${escaped}\`;
}
`;

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, ts);
console.log(`[inline-page] ${outPath} generated (${ts.length} bytes, html ${html.length} bytes)`);
