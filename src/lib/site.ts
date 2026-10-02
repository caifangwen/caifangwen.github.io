export const site = {
  title: 'Frida Home',
  description: '某方的个人博客，记录技术、创作与日常思考。',
  author: '某方',
  tagline: '自信云过天将晴',
  bio: 'INTP / 逻辑派艺术爱好者 / 职业退坑选手',
  github: 'https://github.com/caifangwen',
  email: 'mailto:frida_cai@qq.com',
};

export const sections = { posts: '文章', projects: '项目', shares: '分享', discussions: '讨论', docs: '文档' };
export type Section = keyof typeof sections;
export const taxonomies = { categories: '分类', tags: '标签', series: '系列' };
export type Taxonomy = keyof typeof taxonomies;
export const base = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '');
export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (base && (path === base || path.startsWith(`${base}/`))) return path;
  return `${base}${path}`;
}
export function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_\-.~]/gu, '');
}
export function termUrl(type: Taxonomy, value: string): string {
  return withBase(`/${type}/${slugify(value)}/`);
}
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date);
}
export function formatLongDate(date: Date): string {
  const [year, month, day] = formatDate(date).split('/');
  return `${year} 年 ${month} 月 ${day} 日`;
}
