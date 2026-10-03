import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import legacyUrls from '../data/legacy-urls.json';
import { sections, slugify, type Section, type Taxonomy } from './site';
import { readFrontmatter, normalizeContentUrl } from './frontmatter';

export interface Entry {
  source: string;
  section: Section;
  title: string;
  description: string;
  date: Date;
  updated: Date;
  body: string;
  url: string;
  slug: string;
  draft: boolean;
  featured: boolean;
  tags: string[];
  categories: string[];
  series: string[];
  cover: string;
  github: string;
  website: string;
  linkUrl: string;
  linkSource: string;
  tech: string[];
  minutes: number;
}
export function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(path.join(dir, item.name)) : [path.join(dir, item.name)]);
}
export const contentRoot = path.resolve('content');
export function loadEntries(root = contentRoot): Entry[] {
  const files = walk(root).filter(file => file.endsWith('.md'));
  const selected = new Map<string, string>();
  // Hugo's default language is Chinese. Explicit Chinese files win over unsuffixed duplicates.
  for (const file of files) {
    const key = file.replace(/\.zh-cn\.md$/, '.md');
    if (!selected.has(key) || file.endsWith('.zh-cn.md')) selected.set(key, file);
  }
  const entries: Entry[] = [];
  const urls = new Map<string, string>();
  for (const file of selected.values()) {
    const source = path.relative(root, file).replaceAll('\\', '/');
    const directory = source.split('/')[0];
    const section = (['strategy', 'acquire', 'convert', 'retain', 'global'].includes(directory) ? 'posts' : directory) as Section;
    if (!(section in sections) || path.basename(file).startsWith('_index')) continue;
    let parsed: ReturnType<typeof matter>;
    try { parsed = matter(readFileSync(file, 'utf8')); }
    catch (error) { throw new Error(`${source}: invalid frontmatter`, { cause: error }); }
    const data = readFrontmatter(parsed.data, source);
    const content = parsed.content;
    if (data.draft) continue;
    const stem = path.basename(file).replace(/(?:\.zh-cn)?\.md$/, '');
    const slug = slugify(data.slug || (stem === 'index' ? path.basename(path.dirname(file)) : stem));
    if (!slug) throw new Error(`${source}: slug must contain a letter or number`);
    const prefix = section === 'posts' ? 'blog' : section === 'projects' ? 'project' : section;
    const legacyUrl = root === contentRoot && !data.slug ? (legacyUrls as Record<string, string>)[source] : undefined;
    const url = normalizeContentUrl(data.url || legacyUrl || `/${prefix}/${slug}/`, source);
    if (urls.has(url)) throw new Error(`Duplicate content URL ${url}: ${urls.get(url)} and ${source}`);
    urls.set(url, source);
    entries.push({
      ...data, source, section, slug, url, title: data.title || stem,
      body: content, draft: false,
      minutes: Math.max(1, Math.ceil(content.replace(/\s/g, '').length / 600)),
    });
  }
  return entries.sort((a, b) => b.date.valueOf() - a.date.valueOf() || a.url.localeCompare(b.url));
}
export const entries = loadEntries();
export const getEntries = (section: Section) => entries.filter(entry => entry.section === section);
export function getTerms(type: Taxonomy, content: Entry[] = entries) {
  const terms = new Map<string, { name: string; slug: string; entries: Entry[] }>();
  for (const entry of content) for (const name of entry[type]) {
    const slug = slugify(name);
    if (!slug) continue;
    const group = terms.get(slug) || { name, slug, entries: [] };
    if (!group.entries.includes(entry)) group.entries.push(entry);
    terms.set(slug, group);
  }
  return [...terms.values()].sort((a, b) => b.entries.length - a.entries.length);
}
export function assetPath(entry: Entry, url: string): string {
  if (/^(?:[a-z]+:|\/|#)/i.test(url)) return url;
  const relative = path.posix.normalize(path.posix.join(path.posix.dirname(entry.source), url));
  return existsSync(path.join(contentRoot, relative)) ? `/media/${relative}` : `/${url}`;
}
