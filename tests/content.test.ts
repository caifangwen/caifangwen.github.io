import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { entries, loadEntries, getTerms, assetPath } from '../src/lib/content';
import { renderMarkdown } from '../src/lib/markdown';

test('all published content has distinct URLs and valid dates', () => {
  assert.ok(entries.length > 200);
  assert.equal(new Set(entries.map(entry => entry.url)).size, entries.length);
  assert.ok(entries.every(entry => !entry.draft && !Number.isNaN(entry.date.valueOf())));
  assert.ok(entries.some(entry => entry.url === '/blog/ssh-config-guide/'));
  assert.ok(entries.some(entry => entry.url === '/project/honglou/'));
  assert.equal(entries.find(entry => entry.source === 'posts/alibaba-to-woocommerce.md')?.url, '/blog/阿里巴巴国际站产品迁移到-woocommercewoodmart完整指南/');
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
  const project = entries.find(item => item.source === 'projects/narrow/index.zh-cn.md')!;
  assert.equal(assetPath(project, project.cover), '/media/projects/narrow/narrow.webp');
});
