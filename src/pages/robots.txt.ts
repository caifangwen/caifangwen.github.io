import type { APIContext } from 'astro';
import { withBase } from '../lib/site';
export function GET(context: APIContext) {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(withBase('/sitemap.xml'), context.site)}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
