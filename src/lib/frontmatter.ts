const defaultDate = new Date('2024-01-01T00:00:00+08:00');

export function normalizeContentUrl(value: string, source: string): string {
  const fail = () => { throw new Error(`${source}: url must be a local path without query, hash or traversal`); };
  if (!value.startsWith('/') || value.startsWith('//') || /[?#\\\s]/.test(value)) fail();
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return fail(); }
  if (decoded.includes('//') || /[?#\\\s]/.test(decoded)
    || decoded.split('/').some(segment => segment === '..' || segment === '.')) fail();
  const normalized = decoded.replace(/\/+/g, '/').replace(/\/$/, '');
  if (!normalized) fail();
  return `${normalized}/`;
}

export function readFrontmatter(data: Record<string, unknown>, source: string) {
  const fail = (field: string, expected: string): never => {
    throw new Error(`${source}: ${field} must be ${expected}`);
  };
  const text = (field: string, fallback = ''): string => {
    const value = data[field];
    if (value == null) return fallback;
    if (typeof value !== 'string') return fail(field, 'a string');
    return value.trim();
  };
  const flag = (field: string): boolean => {
    const value = data[field];
    if (value == null) return false;
    if (typeof value !== 'boolean') return fail(field, 'a boolean');
    return value;
  };
  const list = (field: string, alias?: string): string[] => {
    const value = data[field] ?? (alias ? data[alias] : undefined);
    if (value == null) return [];
    const values = Array.isArray(value) ? value : [value];
    // Empty YAML list items are common in unfinished drafts; ignore only nulls.
    if (values.some(item => item != null && typeof item !== 'string')) return fail(field, 'a string or a list of strings');
    return [...new Set(values.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean))];
  };
  const date = (field: string, fallback: Date): Date => {
    const value = data[field];
    if (value == null || value === '') return fallback;
    if (!(value instanceof Date) && typeof value !== 'string') return fail(field, 'a valid date');
    const parsed = new Date(value);
    if (!Number.isFinite(parsed.valueOf())) return fail(field, 'a valid date');
    return parsed;
  };
  const published = date('date', defaultDate);
  const cover = data.cover;
  const coverImage = cover && typeof cover === 'object' && !Array.isArray(cover)
    ? (cover as Record<string, unknown>).image : cover;
  if (coverImage != null && typeof coverImage !== 'string') fail('cover', 'an image path or an object with an image path');
  return {
    title: text('title'), description: text('description') || text('summary'),
    slug: text('slug'), url: text('url'), draft: flag('draft'), featured: flag('featured'),
    date: published, updated: date('lastmod', published),
    tags: list('tags', 'tag'), categories: list('categories', 'cat'), series: list('series'),
    tech: list('tech_stack'), cover: typeof coverImage === 'string' ? coverImage.trim() : '',
    github: text('github'), website: text('website') || text('demo'),
    linkUrl: text('linkUrl'), linkSource: text('linkSource'),
  };
}
