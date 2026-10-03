import type { APIContext } from 'astro';
import { sitemapPaths } from '../lib/routes';
import { withBase } from '../lib/site';
import { escapeHtml } from '../lib/markdown';

export function GET(context: APIContext) {
  const urls = sitemapPaths.map(path => `<url><loc>${escapeHtml(new URL(withBase(path), context.site).href)}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
