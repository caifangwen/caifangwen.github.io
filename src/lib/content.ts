import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import legacyUrls from '../data/legacy-urls.json';
import { sections, slugify, type Section, type Taxonomy } from './site';

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
const list = (value: unknown): string[] => [...new Set((Array.isArray(value) ? value : [value]).filter((item): item is string => typeof item === 'string' && !!item.trim()))];
const dateValue = (value: unknown, fallback = new Date('2024-01-01T00:00:00+08:00')) => {
  const date = value ? new Date(value as string) : fallback;
  return Number.isNaN(date.valueOf()) ? fallback : date;
};
export function loadEntries(root = contentRoot): Entry[] {
  const files = walk(root).filter(file => file.endsWith('.md'));
  const selected = new Map<string, string>();
  // Hugo's default language is Chinese. Explicit Chinese files win over unsuffixed duplicates.
  for (const file of files) {
    const key = file.replace(/\.zh-cn\.md$/, '.md');
    if (!selected.has(key) || file.endsWith('.zh-cn.md')) selected.set(key, file);
  }
  const entries: Entry[] = [];
  const urls = new Set<string>();
  for (const file of selected.values()) {
    const source = path.relative(root, file).replaceAll('\\', '/');
    const section = source.split('/')[0] as Section;
    if (!(section in sections) || path.basename(file).startsWith('_index')) continue;
    const { data, content } = matter(readFileSync(file, 'utf8'));
    if (data.draft === true) continue;
    const stem = path.basename(file).replace(/(?:\.zh-cn)?\.md$/, '');
    const slug = slugify(String(data.slug || (stem === 'index' ? path.basename(path.dirname(file)) : stem)));
    const prefix = section === 'posts' ? 'blog' : section === 'projects' ? 'project' : section;
    const legacyUrl = root === contentRoot && !data.slug ? (legacyUrls as Record<string, string>)[source] : undefined;
    const url = typeof data.url === 'string' && data.url.startsWith('/') ? data.url : legacyUrl || `/${prefix}/${slug}/`;
    if (urls.has(url)) throw new Error(`Duplicate content URL ${url}: ${source}`);
    urls.add(url);
    const date = dateValue(data.date);
    entries.push({
      source, section, slug, url, title: String(data.title || stem),
      description: String(data.description || data.summary || ''), date,
      updated: dateValue(data.lastmod, date), body: content, draft: false,
      featured: data.featured === true, tags: list(data.tags), categories: list(data.categories), series: list(data.series),
      cover: typeof data.cover === 'string' ? data.cover : '',
      github: String(data.github || ''), website: String(data.website || data.demo || ''), linkUrl: String(data.linkUrl || ''), linkSource: String(data.linkSource || ''),
      tech: list(data.tech_stack), minutes: Math.max(1, Math.ceil(content.replace(/\s/g, '').length / 600)),
    });
  }
  return entries.sort((a, b) => b.date.valueOf() - a.date.valueOf() || a.url.localeCompare(b.url));
}
export const entries = loadEntries();
export const getEntries = (section: Section) => entries.filter(entry => entry.section === section);
export function getTerms(type: Taxonomy) {
  const terms = new Map<string, { name: string; slug: string; entries: Entry[] }>();
  for (const entry of entries) for (const name of entry[type]) {
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
