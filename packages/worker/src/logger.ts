/**
 * 结构化日志：输出单行 key=value，便于 wrangler tail / Dashboard 检索。
 * 生产环境用 `npm run tail`（wrangler tail）实时查看。
 */
export function log(prefix: string, fields: Record<string, unknown>): void {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === '') continue;
    if (typeof v === 'object') {
      parts.push(`${k}=${JSON.stringify(v)}`);
    } else {
      const s = String(v);
      parts.push(s.includes(' ') ? `${k}=${JSON.stringify(s)}` : `${k}=${s}`);
    }
  }
  console.log(`[cj2deepseek] ${prefix} ${parts.join(' ')}`);
}

export function logError(prefix: string, err: unknown, fields: Record<string, unknown> = {}): void {
  const e = err as any;
  const msg = e && e.message ? String(e.message) : String(err);
  const stack = e && e.stack ? String(e.stack).split('\n').slice(0, 6).join(' | ') : '';
  console.error(`[cj2deepseek] ${prefix} error=${JSON.stringify(msg)} ${Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(' ')}${stack ? ` stack=${JSON.stringify(stack)}` : ''}`);
}
