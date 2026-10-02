import { entries } from '../lib/content';
import { withBase } from '../lib/site';
export function GET() {
  return Response.json(entries.map(entry => ({ title: entry.title, url: withBase(entry.url), description: entry.description, tags: [...entry.tags, ...entry.categories], content: entry.body.replace(/<[^>]+>/g, '').replace(/[#*`]/g, '') })));
}
