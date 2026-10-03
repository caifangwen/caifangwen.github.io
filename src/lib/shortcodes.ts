import type MarkdownIt from 'markdown-it';
import { entries } from './content';
import { withBase } from './site';

const escapeAttribute = (value: string) => value.replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

function resolveReference(source: string): string {
  const target = source.replace(/^\//, '');
  return withBase(entries.find(entry => entry.source === target)?.url
    || source.replace(/\/_index\.md$/, '/').replace(/\.md$/, '/'));
}

function convertText(text: string): string {
  return text.replace(/\{\{[<%]\s*(?:ref|relref)\s+"([^"]+)"\s*[>%]\}\}/g,
    (_, source: string) => resolveReference(source)
  ).replace(/\{\{<\s*linkcard\s+([\s\S]*?)>\}\}/g, (_, attributes: string) => {
    const values = Object.fromEntries([...attributes.matchAll(/(\w+)="([^"]*)"/g)]
      .map(match => [match[1], match[2]]));
    const url = /^(https?:\/\/|\/(?!\/))/.test(values.url || '') ? values.url : '#';
    return `<a class="link-card" href="${escapeAttribute(withBase(url))}" rel="noopener noreferrer"><strong>${escapeAttribute(values.title || url)}</strong><span>${escapeAttribute(values.desc || '')}</span><small>${escapeAttribute(values.source || '')} ↗</small></a>`;
  });
}

// Code spans can use any number of backticks. Only an equal-length run closes one.
function convertInline(source: string): string {
  const runs = [...source.matchAll(/`+/g)];
  let result = '';
  let offset = 0;
  for (let index = 0; index < runs.length; index++) {
    const opening = runs[index];
    if (opening.index! < offset) continue;
    const slashes = source.slice(0, opening.index).match(/\\+$/)?.[0].length || 0;
    if (slashes % 2) continue;
    const closingIndex = runs.findIndex((run, candidate) => candidate > index && run[0].length === opening[0].length);
    if (closingIndex < 0) continue;
    const closing = runs[closingIndex];
    const end = closing.index! + closing[0].length;
    result += convertText(source.slice(offset, opening.index)) + source.slice(opening.index, end);
    offset = end;
    index = closingIndex;
  }
  return result + convertText(source.slice(offset));
}

export function hugoShortcodes(md: InstanceType<typeof MarkdownIt>): void {
  md.block.ruler.before('blockquote', 'hugo-linkcard', (state, startLine, endLine, silent) => {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    const line = state.src.slice(state.bMarks[startLine] + state.tShift[startLine], state.eMarks[startLine]);
    if (!/^\{\{<\s*linkcard\b/.test(line)) return false;
    const source = state.getLines(startLine, endLine, state.blkIndent, false);
    const card = source.match(/^\{\{<\s*linkcard\s+[\s\S]*?>\}\}[ \t]*(?:\n|$)/);
    if (!card) return false;
    if (silent) return true;
    const lineCount = card[0].replace(/\n$/, '').split('\n').length;
    const token = state.push('html_block', '', 0);
    token.content = convertText(card[0]) + '\n';
    token.map = [startLine, startLine + lineCount];
    state.line = startLine + lineCount;
    return true;
  }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });

  // Block parsing protects fenced/indented examples, including nested blocks.
  md.block.ruler.before('fence', 'hugo-highlight', (state, startLine, endLine, silent) => {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    const line = state.src.slice(state.bMarks[startLine] + state.tShift[startLine], state.eMarks[startLine]);
    const opening = line.match(/^\{\{<\s*highlight\s+([\w+-]+)\s*>\}\}\s*$/);
    if (!opening) return false;
    let closingLine = startLine + 1;
    while (closingLine < endLine) {
      const candidate = state.src.slice(state.bMarks[closingLine] + state.tShift[closingLine], state.eMarks[closingLine]);
      if (/^\{\{<\s*\/highlight\s*>\}\}\s*$/.test(candidate)) break;
      closingLine++;
    }
    if (closingLine === endLine) return false;
    if (silent) return true;
    const token = state.push('fence', 'code', 0);
    token.info = opening[1];
    token.content = state.getLines(startLine + 1, closingLine, state.blkIndent, false) + '\n';
    token.map = [startLine, closingLine + 1];
    state.line = closingLine + 1;
    return true;
  }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });

  md.core.ruler.before('inline', 'hugo-inline-shortcodes', state => {
    for (const token of state.tokens) {
      if (token.type === 'inline') token.content = convertInline(token.content);
    }
  });
}
