import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { entries } from '../src/lib/content';
import { businessNavigation } from '../src/data/business-navigation';
import { getTopicEntries, businessTopics } from '../src/lib/business';

test('topic selection uses taxonomy and ignores title and description', () => {
  const topic = businessTopics.find(t => t.path === '/acquire/technical/')!;
  const sample = { ...entries[0], title: topic.title, description: topic.title, categories: [], tags: [] };
  assert.deepEqual(getTopicEntries(topic, [sample]), []);
  const tagged = { ...sample, title: 'Example', description: '', tags: [topic.term] };
  assert.deepEqual(getTopicEntries(topic, [tagged]), [tagged]);
  assert.deepEqual(getTopicEntries(businessNavigation[1], [tagged]), [tagged]);
  const categorized = { ...sample, categories: ['获客'] };
  assert.deepEqual(getTopicEntries(businessNavigation[1], [categorized]), [categorized]);
});

test('business routes have at most two segments and remain unique', () => {
  assert.equal(new Set(businessTopics.map(topic => topic.path)).size, businessTopics.length);
  assert.ok(businessTopics.every(topic => topic.path.split('/').filter(Boolean).length <= 2));
});

test('five categorized business directories replace posts', () => {
  assert.equal(existsSync('content/posts'), false);
  for (const root of businessNavigation) assert.ok(existsSync(`content${root.path}`));
  for (const entry of entries.filter(e => e.section === 'posts')) {
    const root = businessNavigation.find(r => entry.source.startsWith(r.path.slice(1)))!;
    assert.ok(root, entry.source);
    assert.ok(entry.categories.includes(root.title), entry.source);
  }
});
