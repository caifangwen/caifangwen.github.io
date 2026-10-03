import { prepareSearchIndex, searchEntries, type SearchEntry, type SearchDocument } from '../lib/search';

export function initSearch(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#search-dialog');
  const input = document.querySelector<HTMLInputElement>('#search-input');
  const status = document.querySelector('#search-status');
  const results = document.querySelector('#search-results');
  if (!dialog || !input || !status || !results) return;

  let index: Promise<SearchDocument[]> | undefined;
  let queryVersion = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const base = document.body.dataset.base || '';

  async function loadIndex(): Promise<SearchDocument[]> {
    let data: SearchEntry[];
    try {
      if (typeof DecompressionStream === 'undefined') throw new Error('Use plain index');
      const response = await fetch(`${base}/index.json.gz`);
      if (!response.ok || !response.body) throw new Error('Use plain index');
      data = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).json();
    } catch {
      const response = await fetch(`${base}/index.json`);
      if (!response.ok) throw new Error('Search unavailable');
      data = await response.json();
    }
    return prepareSearchIndex(data);
  }

  function getIndex(): Promise<SearchDocument[]> {
    return index ??= loadIndex().catch(error => { index = undefined; throw error; });
  }

  function openSearch() { dialog!.showModal(); input!.focus(); }
  for (const id of ['#search-open', '#dock-search']) document.querySelector(id)?.addEventListener('click', openSearch);
  document.querySelector('#search-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open) { event.preventDefault(); dialog.close(); return; }
    if (event.key === '/' && !(event.target instanceof HTMLElement
      && (event.target.matches('input, textarea, select') || event.target.isContentEditable))) {
      event.preventDefault(); openSearch();
    }
  });
  dialog.addEventListener('close', () => {
    clearTimeout(timer);
    queryVersion++;
  });

  input.addEventListener('input', () => {
    const version = ++queryVersion;
    clearTimeout(timer);
    const query = input.value.trim();
    results.replaceChildren();
    if (!query) { status.textContent = '输入关键词开始搜索'; return; }
    status.textContent = '搜索中…';
    timer = setTimeout(async () => {
      try {
        const items = await getIndex();
        if (version !== queryVersion) return;
        const found = searchEntries(items, query);
        status.textContent = found.length ? `找到 ${found.length} 条结果${found.length > 40 ? '，显示前 40 条' : ''}` : '没有匹配的内容，试试其他关键词';
        const fragment = document.createDocumentFragment();
        for (const item of found.slice(0, 40)) {
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = item.url;
          link.className = 'block rounded-lg p-3 hover:bg-muted';
          const title = document.createElement('strong');
          title.textContent = item.title;
          const description = document.createElement('p');
          description.className = 'mt-1 line-clamp-2 text-sm text-muted-foreground';
          description.textContent = item.description;
          link.append(title, description);
          li.append(link);
          fragment.append(li);
        }
        results.append(fragment);
      } catch { if (version === queryVersion) status.textContent = '搜索加载失败，请重试'; }
    }, 150);
  });
}
