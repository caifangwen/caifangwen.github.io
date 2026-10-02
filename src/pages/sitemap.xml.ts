import type { APIContext } from 'astro';
import { entries, getTerms, getEntries } from '../lib/content';
import { sections, taxonomies, withBase, type Section, type Taxonomy } from '../lib/site';
import { escapeHtml } from '../lib/markdown';
export function GET(context: APIContext) {
  const paths = ['/', '/about/', '/archives/', '/reports/', ...entries.map(entry => entry.url)];
  function addPages(root: string, count: number) {
    paths.push(`/${root}/`);
    for (let page = 2; page <= Math.ceil(count / 12); page++) paths.push(`/${root}/page/${page}/`);
  }
  for (const key of Object.keys(sections)) addPages(key, getEntries(key as Section).length);
  for (const type of Object.keys(taxonomies)) {
    paths.push(`/${type}/`);
    for (const term of getTerms(type as Taxonomy)) addPages(`${type}/${term.slug}`, term.entries.length);
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${escapeHtml(new URL(withBase(path), context.site).href)}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
