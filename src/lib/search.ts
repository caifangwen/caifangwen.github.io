import type { Entry } from './content';

export interface SearchEntry {
  title: string;
  url: string;
  description: string;
  tags: string[];
  content: string;
}

export interface SearchDocument extends SearchEntry {
  searchText: string;
  titleText: string;
}

export function buildSearchIndex(entries: Entry[], urlFor: (url: string) => string): SearchEntry[] {
  return entries.map(entry => ({
    title: entry.title, url: urlFor(entry.url), description: entry.description,
    tags: [...entry.tags, ...entry.categories],
    content: entry.body.replace(/<[^>]+>/g, '').replace(/[#*`]/g, '').replace(/\s+/g, ' ').trim(),
  }));
}

export function prepareSearchIndex(entries: SearchEntry[]): SearchDocument[] {
  return entries.map(entry => ({
    ...entry, titleText: entry.title.toLocaleLowerCase(),
    searchText: `${entry.title} ${entry.description} ${entry.tags.join(' ')} ${entry.content}`.toLocaleLowerCase(),
  }));
}

export function searchEntries(entries: SearchDocument[], query: string): SearchDocument[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  const words = normalized.split(/\s+/);
  const titleScore = (entry: SearchDocument) => Number(entry.titleText.includes(normalized)) * (words.length + 1)
    + words.filter(word => entry.titleText.includes(word)).length;
  return entries.filter(entry => words.every(word => entry.searchText.includes(word)))
    .sort((a, b) => titleScore(b) - titleScore(a));
}
