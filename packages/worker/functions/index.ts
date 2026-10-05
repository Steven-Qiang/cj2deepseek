/**
 * EdgeOne Pages 函数入口（与 Cloudflare Worker 共用 packages/worker/src/handler.ts）。
 * edgeone.json 把 /、/skin/*、/robots.txt、/sitemap.xml、/og/* 都指到这里。
 */
import { handleRequest } from '../src/handler';

export async function onRequest(context: any): Promise<Response> {
  return handleRequest(context.request);
}
