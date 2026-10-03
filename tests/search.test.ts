import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entries } from '../src/lib/content';
import { buildSearchIndex, prepareSearchIndex, searchEntries } from '../src/lib/search';
import { gzipSync, gunzipSync } from 'node:zlib';

test('search retains full body matching, AND queries, case insensitivity and title ranking', () => {
  const index = prepareSearchIndex([
    { title: 'Other', description: '', tags: ['Astro'], content: 'SSH 独有正文关键词', url: '/other/' },
    { title: 'SSH guide', description: '', tags: [], content: 'Astro', url: '/ssh/' },
  ]);
  assert.deepEqual(searchEntries(index, ' ssh ASTRO ').map(entry => entry.url), ['/ssh/', '/other/']);
  assert.deepEqual(searchEntries(index, '独有正文关键词').map(entry => entry.url), ['/other/']);
  assert.deepEqual(searchEntries(index, ''), []);
  assert.deepEqual(searchEntries(index, 'SSH missing'), []);
});

test('compressed search data round-trips without truncating content or deployment base', () => {
  const index = buildSearchIndex(entries, url => `/example${url}`);
  const json = JSON.stringify(index);
  const compressed = gzipSync(json);
  assert.deepEqual(JSON.parse(gunzipSync(compressed).toString()), index);
  assert.ok(compressed.length < Buffer.byteLength(json) / 2);
  assert.ok(index.every(entry => entry.url.startsWith('/example/')));
});
