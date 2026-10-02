import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import hljs from 'highlight.js';
import { entries, assetPath, type Entry } from './content';
import { withBase, slugify } from './site';

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export function shortcodes(body: string): string {
  return body.replace(/\{\{<\s*highlight\s+(\w+)\s*>\}\}([\s\S]*?)\{\{<\s*\/highlight\s*>\}\}/g, (_, language: string, code: string) => `\n\`\`\`${language}\n${code.trim()}\n\`\`\`\n`).replace(/\{\{[<%]\s*(ref|relref)\s+"([^"]+)"\s*[>%]\}\}/g, (_, _name, source: string) => {
    const target = source.replace(/^\//, '');
    return withBase(entries.find(entry => entry.source === target)?.url || source.replace(/\/_index\.md$/, '/').replace(/\.md$/, '/'));
  }).replace(/\{\{<\s*linkcard\s+([\s\S]*?)>\}\}/g, (_, attrs: string) => {
    const values = Object.fromEntries([...attrs.matchAll(/(\w+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
    const url = /^(https?:\/\/|\/)/.test(values.url || '') ? values.url : '#';
    return `\n<a class="link-card" href="${escapeHtml(withBase(url))}" rel="noopener noreferrer"><strong>${escapeHtml(values.title || url)}</strong><span>${escapeHtml(values.desc || '')}</span><small>${escapeHtml(values.source || '')} ↗</small></a>\n`;
  });
}
export function renderMarkdown(entry: Entry) {
  const headings: { depth: number; text: string; slug: string }[] = [];
  const md = new MarkdownIt({ html: true, linkify: true, typographer: false, highlight(code, lang) {
    if (lang === 'mermaid') return `<pre class="mermaid">${escapeHtml(code)}</pre>`;
    return lang && hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang, ignoreIllegals: true }).value : escapeHtml(code);
  }});
  md.use(anchor, { slugify: (text: string) => slugify(text) || 'section', callback: (_token: unknown, info: { title: string; slug: string }) => {
    const token = _token as { tag: string };
    const depth = Number(token.tag.slice(1));
    if (depth >= 2 && depth <= 4) headings.push({ depth, text: info.title, slug: info.slug });
  }});
  md.use(texmath, { engine: katex, delimiters: ['dollars', 'brackets'], katexOptions: { throwOnError: false, strict: 'ignore' } });
  const defaultFence = md.renderer.rules.fence!;
  md.renderer.rules.fence = (tokens, i, options, env, self) => {
    const code = defaultFence(tokens, i, options, env, self);
    const language = tokens[i].info.trim().split(/\s+/)[0] || 'plaintext';
    if (language === 'mermaid') return code;
    return `<div class="code-block-container my-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div class="code-block-header flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3"><span class="text-sm font-medium text-muted-foreground">&lt;/&gt; ${escapeHtml(language.toUpperCase())}</span><div class="code-actions flex items-center gap-2"></div></div><div class="code-block-content">${code}</div></div>`;
  };
  const defaultImage = md.renderer.rules.image!;
  md.renderer.rules.image = (tokens, i, options, env, self) => {
    tokens[i].attrSet('src', withBase(assetPath(entry, String(tokens[i].attrGet('src') || ''))));
    tokens[i].attrSet('loading', 'lazy');
    return defaultImage(tokens, i, options, env, self);
  };
  md.renderer.rules.link_open = (tokens, i, options, _env, self) => {
    const href = String(tokens[i].attrGet('href') || '');
    const ref = href.replace(/^\//, '').split('#')[0];
    const target = entries.find(item => item.source === ref || item.source === `${entry.source.slice(0, entry.source.lastIndexOf('/') + 1)}${ref}`);
    tokens[i].attrSet('href', withBase(target ? target.url + (href.includes('#') ? `#${href.split('#')[1]}` : '') : href));
    if (/^https?:/.test(href)) tokens[i].attrSet('rel', 'noopener noreferrer');
    return self.renderToken(tokens, i, options);
  };
  let html = md.render(shortcodes(entry.body));
  // Raw HTML in existing articles also needs the deployment base prefix.
  html = html.replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g, (_, attr, url) => `${attr}="${withBase(url)}"`);
  return { html, headings };
}
