import { gzipSync } from 'node:zlib';
import { entries } from '../lib/content';
import { buildSearchIndex } from '../lib/search';
import { withBase } from '../lib/site';

export function GET() {
  const compressed = gzipSync(JSON.stringify(buildSearchIndex(entries, withBase)));
  return new Response(new Uint8Array(compressed), {
    headers: { 'Content-Type': 'application/gzip' },
  });
}
