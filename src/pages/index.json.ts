import { entries } from '../lib/content';
import { withBase } from '../lib/site';
import { buildSearchIndex } from '../lib/search';
export function GET() {
  return Response.json(buildSearchIndex(entries, withBase));
}
