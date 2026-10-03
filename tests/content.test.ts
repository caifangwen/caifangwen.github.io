import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { entries, loadEntries, getTerms, assetPath } from '../src/lib/content';
import { renderMarkdown } from '../src/lib/markdown';
import { readFrontmatter, normalizeContentUrl } from '../src/lib/frontmatter';
import { assertUniqueRoutes, contentRoutes, sitemapPaths } from '../src/lib/routes';

test('task markers become disabled checkboxes in nested and loose lists', () => {
  const { html } = renderMarkdown({ ...entries[0], body: '- [] Empty\n- [ ] Pending\n- [x] Done\n  - [X] Nested\n\n- [ ] Loose\n\n  Another paragraph\n\n1. [ ] Ordered\n\n`- [ ] Code`\n\n```md\n- [ ] Code block\n```' });
  assert.equal((html.match(/class="task-list-item"/g) || []).length, 6);
  assert.equal((html.match(/type="checkbox"/g) || []).length, 6);
  assert.equal((html.match(/disabled checked/g) || []).length, 2);
  assert.match(html, /<code>- \[ \] Code<\/code>/);
  assert.match(html, /<input[^>]+aria-label="未完成"/);
});

test('shortcodes preserve fenced, indented, inline and nested code examples', () => {
  const card = '{{< linkcard url="https://example.com" title="Demo" >}}';
  const reference = '{{< ref "/docs/faq.md" >}}';
  const highlight = '{{< highlight html >}}\n<div>Example</div>\n{{< /highlight >}}';
  const examples = [
    `\`\`\`text\n${card}\n${reference}\n${highlight}\n\`\`\``,
    `~~~~text\n${card}\n~~~~`,
    `    ${card}`, `\`${card}\``, `\`\`${card} with a \` character\`\``,
    `> \`\`\`text\n> ${card}\n> \`\`\``,
    `- Example\n\n  \`\`\`text\n  ${card}\n  \`\`\``,
  ];
  for (const body of examples) {
    const { html } = renderMarkdown({ ...entries[0], body });
    assert.match(html, /\{\{&lt; linkcard/, body);
    assert.doesNotMatch(html, /class="link-card"/, body);
  }
  const { html } = renderMarkdown({ ...entries[0], body: `${card}\n\n[FAQ](${reference} "Read FAQ")\n\n${highlight}` });
  assert.match(html, /class="link-card"/);
  assert.match(html, /href="\/docs\/faq\/" title="Read FAQ"/);
  assert.match(html, /language-html/);
  assert.doesNotMatch(html, /<div>Example<\/div>/);
});

test('frontmatter validates types and dates while preserving legacy cover and blank YAML items', () => {
  const data = readFrontmatter({ title: ' Example ', tags: [' Astro ', 'Astro', null, ''], cover: { image: '/cover.png' } }, 'posts/example.md');
  assert.equal(data.title, 'Example');
  assert.deepEqual(data.tags, ['Astro']);
  assert.equal(data.cover, '/cover.png');
  assert.equal(data.date.toISOString(), '2023-12-31T16:00:00.000Z');
  for (const data of [{ title: {} }, { tags: [7] }, { draft: 'false' }, { date: 'invalid' }, { lastmod: 'invalid' }]) {
    assert.throws(() => readFrontmatter(data, 'posts/example.md'), /posts\/example.md:/);
  }
  assert.equal(normalizeContentUrl('/blog/%E4%B8%AD%E6%96%87', 'sample.md'), '/blog/中文/');
  for (const url of ['//evil.test/path', '/blog/../about', '/blog/%2E%2E/about', '/blog/x?draft=true', '/blog/%5Cevil', '/blog/%2Fx', '/blog/%zz']) {
    assert.throws(() => normalizeContentUrl(url, 'sample.md'), /sample.md:/);
  }
});

test('all route families share collision checks and sitemap omits share aliases', () => {
  assert.throws(() => assertUniqueRoutes([{ url: '/about/', owner: 'fixed page' }, { url: '/about', owner: 'posts/about.md' }]), /fixed page and posts\/about.md/);
  assert.throws(() => assertUniqueRoutes([{ url: '/blog/中文/', owner: 'first' }, { url: '/blog/%E4%B8%AD%E6%96%87/', owner: 'second' }]), /Route conflict/);
  assert.equal(new Set(sitemapPaths).size, sitemapPaths.length);
  assert.equal(contentRoutes.find(route => route.url === '/shares/page/2/')?.page.kind, 'redirect');
  assert.ok(!sitemapPaths.includes('/shares/page/2/'));
});

test('all published content has distinct URLs and valid dates', () => {
  assert.ok(entries.length > 200);
  assert.equal(new Set(entries.map(entry => entry.url)).size, entries.length);
  assert.ok(entries.every(entry => !entry.draft && !Number.isNaN(entry.date.valueOf())));
  assert.ok(entries.some(entry => entry.url === '/blog/ssh-config-guide/'));
  assert.ok(entries.some(entry => entry.url === '/project/honglou/'));
  assert.equal(entries.find(entry => entry.source.endsWith('/alibaba-to-woocommerce.md'))?.url, '/blog/阿里巴巴国际站产品迁移到-woocommercewoodmart完整指南/');
});

test('Chinese overrides, drafts, leaf bundles and duplicate URLs follow migration rules', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'frida-content-'));
  try {
    mkdirSync(path.join(root, 'posts', 'bundle'), { recursive: true });
    writeFileSync(path.join(root, 'posts', 'example.md'), '---\ntitle: English\n---\nHello');
    writeFileSync(path.join(root, 'posts', 'example.zh-cn.md'), '---\ntitle: 中文\n---\n你好');
    writeFileSync(path.join(root, 'posts', 'draft.md'), '---\ntitle: Draft\ndraft: true\n---\nPrivate');
    writeFileSync(path.join(root, 'posts', '_index.md'), '---\ntitle: Index\n---');
    writeFileSync(path.join(root, 'posts', 'bundle', 'index.md'), '---\ntitle: Bundle\n---');
    const result = loadEntries(root);
    assert.equal(result.length, 2);
    assert.equal(result.find(entry => entry.slug === 'example')?.title, '中文');
    assert.ok(result.some(entry => entry.url === '/blog/bundle/'));
    writeFileSync(path.join(root, 'posts', 'collision.md'), '---\ntitle: Collision\nslug: example\n---');
    assert.throws(() => loadEntries(root), /Duplicate content URL/);
  } finally {
    const target = path.resolve(root);
    assert.ok(target.startsWith(path.resolve(tmpdir()) + path.sep) && path.basename(target).startsWith('frida-content-'));
    rmSync(target, { recursive: true });
  }
});

test('every article renders, taxonomy ignores empty terms, linkcards become links', () => {
  for (const entry of entries) assert.equal(typeof renderMarkdown(entry).html, 'string', entry.source);
  for (const type of ['tags', 'categories', 'series'] as const) assert.ok(getTerms(type).every(term => term.name && term.entries.length));
  const share = entries.find(entry => entry.source === 'shares/tailwind-css-framework.md')!;
  const { html } = renderMarkdown(share);
  assert.match(html, /class="link-card"/);
  assert.match(html, /href="https:\/\/tailwindcss.com\/"/);
  assert.doesNotMatch(html, /\{\{< linkcard/);
});

test('headings get unique anchors; formulas and code are rendered safely', () => {
  const entry = { ...entries[0], body: '## 标题\n\n## 标题\n\n$x^2$\n\n```js\nconst x = "<script>";\n```\n\n```mermaid\ngraph TD\n A-->B\n```' };
  const { html, headings } = renderMarkdown(entry);
  assert.equal(new Set(headings.map(heading => heading.slug)).size, 2);
  assert.match(html, /class="katex"/);
  assert.match(html, /class="mermaid"/);
  assert.doesNotMatch(html, /<script>/);
  const highlight = renderMarkdown({ ...entry, body: '{{< highlight html >}}\n<div>Hello</div>\n{{< /highlight >}}' }).html;
  assert.match(highlight, /language-html/);
  assert.doesNotMatch(highlight, /\{\{<|<div>Hello/);
  const bundle = { ...entry, source: 'acquire/narrow/render-image/index.md' };
  assert.equal(assetPath(bundle, 'bundle.avif'), '/media/acquire/narrow/render-image/bundle.avif');
});
