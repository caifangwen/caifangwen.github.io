/// <reference types="astro/client" />
declare module 'markdown-it-texmath' {
  import type { PluginWithOptions } from 'markdown-it';
  const plugin: PluginWithOptions<{ engine: unknown; delimiters: string[]; katexOptions?: Record<string, unknown> }>;
  export default plugin;
}
