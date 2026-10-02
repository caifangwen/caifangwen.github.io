import type { APIContext } from 'astro';
import { getEntries } from '../lib/content';
import { site, withBase } from '../lib/site';
import { escapeHtml } from '../lib/markdown';
export function GET(context: APIContext) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${site.title}</title><link>${context.site}</link><description>${site.description}</description><language>zh-CN</language>${getEntries('posts').map(entry => {
    const url = escapeHtml(new URL(withBase(entry.url), context.site).href);
    return `<item><title>${escapeHtml(entry.title)}</title><link>${url}</link><guid>${url}</guid><description>${escapeHtml(entry.description)}</description><pubDate>${entry.date.toUTCString()}</pubDate></item>`;
  }).join('')}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
