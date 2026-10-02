import type { APIContext } from 'astro';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { walk, contentRoot } from '../../lib/content';
export function getStaticPaths() {
  return walk(contentRoot).filter(file => /\.(avif|webp|png|jpe?g|gif|svg|pdf|txt)$/i.test(file)).map(file => ({ params: { asset: path.relative(contentRoot, file).replaceAll('\\', '/') }, props: { file } }));
}
export function GET({ props }: APIContext) {
  return new Response(new Uint8Array(readFileSync(props.file)));
}
