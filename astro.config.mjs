import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { resolve, sep } from 'node:path';

// Markdown is read by our content loader rather than imported by Vite.
// Invalidate its module cache when an author edits or adds content during dev.
function watchContent() {
  return {
    name: 'frida-content-watch',
    configureServer(server) {
      const root = resolve('content');
      server.watcher.add(root);
      const onChange = (_event, file) => {
        if (!resolve(file).startsWith(root + sep)) return;
        server.moduleGraph.invalidateAll();
        for (const environment of Object.values(server.environments || {})) environment.moduleGraph?.invalidateAll();
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('all', onChange);
      server.httpServer?.once('close', () => server.watcher.off('all', onChange));
    },
  };
}

export default defineConfig({
  site: process.env.SITE_URL || 'https://caifangwen.github.io',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss(), watchContent()] },
});
