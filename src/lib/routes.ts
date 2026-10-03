import path from 'node:path';
import { entries, getTerms, walk, contentRoot, type Entry } from './content';
import { businessTopics } from './business';
import { learningPaths } from '../data/business-navigation';
import { sections, taxonomies, type Taxonomy } from './site';

export const pageSize = 12;
export type ContentPage =
  | { kind: 'article'; entry: Entry }
  | { kind: 'list'; title: string; entries: Entry[]; current: number; total: number; root: string; description: string }
  | { kind: 'terms'; type: Taxonomy }
  | { kind: 'redirect'; target: string };
export interface ContentRoute { url: string; page: ContentPage; }
export interface OwnedRoute { url: string; owner: string; }

export const fixedPagePaths = ['/', '/about/', '/contact/', '/portfolio/', '/archives/', '/reports/', '/learn/', '/shares/'];

export function createContentRoutes(content: Entry[] = entries): ContentRoute[] {
  const routes: ContentRoute[] = content.map(entry => ({ url: entry.url, page: { kind: 'article', entry } }));
  function addList(root: string, title: string, items: Entry[], description: string) {
    const total = Math.max(1, Math.ceil(items.length / pageSize));
    for (let current = 1; current <= total; current++) {
      routes.push({
        url: current === 1 ? `/${root}/` : `/${root}/page/${current}/`,
        page: { kind: 'list', title, entries: items.slice((current - 1) * pageSize, current * pageSize), current, total, root: `/${root}`, description },
      });
    }
  }
  for (const [section, title] of Object.entries(sections)) {
    const items = content.filter(entry => entry.section === section);
    if (section === 'shares') {
      // The filterable index shows all resources. Keep old pagination URLs as aliases.
      for (let page = 2; page <= Math.ceil(items.length / pageSize); page++) {
        routes.push({ url: `/shares/page/${page}/`, page: { kind: 'redirect', target: '/shares/' } });
      }
    } else addList(section === 'posts' ? 'articles' : section, title, items, `共 ${items.length} 篇内容`);
  }
  for (const [type, title] of Object.entries(taxonomies)) {
    routes.push({ url: `/${type}/`, page: { kind: 'terms', type: type as Taxonomy } });
    for (const term of getTerms(type as Taxonomy, content)) {
      addList(`${type}/${term.slug}`, term.name, term.entries, `${title} · ${term.entries.length} 篇内容`);
    }
  }
  return routes;
}

export function assertUniqueRoutes(routes: OwnedRoute[]): void {
  const owners = new Map<string, string>();
  for (const { url, owner } of routes) {
    const key = decodeURIComponent(url).replace(/\/+$/, '') || '/';
    const previous = owners.get(key);
    if (previous) throw new Error(`Route conflict at ${url}: ${previous} and ${owner}`);
    owners.set(key, owner);
  }
}

export const contentRoutes = createContentRoutes();
const businessPaths = businessTopics.map(topic => topic.path);
const learningPathsUrls = learningPaths.map(item => `/learn/${item.slug}/`);
const attachments = walk(contentRoot).filter(file => /\.(avif|webp|png|jpe?g|gif|svg|pdf|txt)$/i.test(file));
assertUniqueRoutes([
  ...fixedPagePaths.map(url => ({ url, owner: 'fixed page' })),
  ...['/404.html', '/index.json', '/index.json.gz', '/index.xml', '/sitemap.xml', '/robots.txt'].map(url => ({ url, owner: 'static endpoint' })),
  ...businessPaths.map(url => ({ url, owner: 'business topic' })),
  ...learningPathsUrls.map(url => ({ url, owner: 'learning path' })),
  ...attachments.map(file => ({ url: `/media/${path.relative(contentRoot, file).replaceAll('\\', '/')}`, owner: file })),
  ...walk('public').map(file => ({ url: `/${path.relative('public', file).replaceAll('\\', '/')}`, owner: file })),
  ...contentRoutes.map(({ url, page }) => ({ url, owner: page.kind === 'article' ? page.entry.source : `${page.kind} page` })),
]);

export const sitemapPaths = [...fixedPagePaths, ...businessPaths, ...learningPathsUrls,
  ...contentRoutes.filter(route => route.page.kind !== 'redirect').map(route => route.url)];
