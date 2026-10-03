import { initSearch } from './search';
export {};
const root = document.documentElement;
const siteHeader = document.querySelector<HTMLElement>('.site-header');
if (siteHeader) {
  const updateHeaderHeight = () => root.style.setProperty('--site-header-height', `${siteHeader.getBoundingClientRect().height}px`);
  updateHeaderHeight();
  new ResizeObserver(updateHeaderHeight).observe(siteHeader);
}
const save = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch {} };
document.querySelector('#mode-toggle')?.addEventListener('click', () => {
  root.classList.toggle('dark');
  save('mode', root.classList.contains('dark') ? 'dark' : 'light');
});
const themeToggle = document.querySelector<HTMLButtonElement>('#theme-toggle')!;
const themeMenu = document.querySelector<HTMLElement>('#theme-menu')!;
const setThemeMenu = (open: boolean) => { themeMenu.classList.toggle('hidden', !open); themeToggle.setAttribute('aria-expanded', String(open)); };
themeToggle.addEventListener('click', () => setThemeMenu(themeToggle.getAttribute('aria-expanded') !== 'true'));
const choices = document.querySelectorAll<HTMLButtonElement>('[data-theme-choice]');
const updateChoices = () => choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === root.dataset.theme)));
updateChoices();
choices.forEach(button => button.addEventListener('click', () => { root.dataset.theme = button.dataset.themeChoice; save('colorScheme', button.dataset.themeChoice!); updateChoices(); setThemeMenu(false); themeToggle.focus(); }));
document.addEventListener('click', event => { if (!themeMenu.contains(event.target as Node) && !themeToggle.contains(event.target as Node)) setThemeMenu(false); });
document.querySelector('#menu-toggle')?.addEventListener('click', (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  document.querySelector('#mobile-nav')?.classList.toggle('hidden', !open);
});
const businessMenus = [...document.querySelectorAll<HTMLElement>('[data-business-menu]')];
function setBusinessMenu(menu: HTMLElement, open: boolean) {
  menu.toggleAttribute('data-open', open);
  menu.querySelectorAll(':scope > [aria-expanded]').forEach(trigger => trigger.setAttribute('aria-expanded', String(open)));
}
function closeBusinessMenus(except?: HTMLElement) {
  for (const menu of businessMenus) if (menu !== except) setBusinessMenu(menu, false);
}
for (const menu of businessMenus) {
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;
  const openMenu = () => { clearTimeout(leaveTimer); closeBusinessMenus(menu); setBusinessMenu(menu, true); setThemeMenu(false); };
  menu.addEventListener('mouseenter', () => { if (menu.closest('.business-desktop') && matchMedia('(hover: hover)').matches) openMenu(); });
  menu.addEventListener('mouseleave', () => { if (menu.closest('.business-desktop')) leaveTimer = setTimeout(() => { if (!menu.matches(':hover') && !menu.contains(document.activeElement)) setBusinessMenu(menu, false); }, 180); });
  menu.addEventListener('focusin', () => { if (menu.closest('.business-desktop')) openMenu(); });
  menu.addEventListener('focusout', () => { queueMicrotask(() => { if (!menu.contains(document.activeElement) && !menu.matches(':hover')) setBusinessMenu(menu, false); }); });
  menu.querySelector('.business-submenu-toggle')?.addEventListener('click', () => { if (menu.hasAttribute('data-open')) setBusinessMenu(menu, false); else openMenu(); });
  menu.querySelector('.business-trigger')?.addEventListener('keydown', event => {
    if ((event as KeyboardEvent).key === 'ArrowDown') { event.preventDefault(); openMenu(); menu.querySelector<HTMLElement>('.business-panel a')?.focus(); }
  });
}
document.addEventListener('click', event => { if (!(event.target as Element).closest('[data-business-menu]')) closeBusinessMenus(); });
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const menu = businessMenus.find(item => item.hasAttribute('data-open'));
  if (menu) { menu.querySelector<HTMLElement>('.business-trigger')?.focus(); closeBusinessMenus(); }
  const mobileToggle = document.querySelector<HTMLButtonElement>('#menu-toggle');
  if (!menu && mobileToggle?.getAttribute('aria-expanded') === 'true') {
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.querySelector('#mobile-nav')?.classList.add('hidden');
    mobileToggle.focus();
  }
});
matchMedia('(min-width: 768px)').addEventListener('change', () => {
  closeBusinessMenus();
  document.querySelector('#menu-toggle')?.setAttribute('aria-expanded', 'false');
  document.querySelector('#mobile-nav')?.classList.add('hidden');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !themeMenu.classList.contains('hidden')) { setThemeMenu(false); themeToggle.focus(); }
});
initSearch();
for (const block of document.querySelectorAll<HTMLPreElement>('.prose pre:not(.mermaid)')) {
  const code = block.querySelector('code');
  if (!code) continue;
  const button = document.createElement('button'); button.className = 'copy-code'; button.textContent = '复制'; button.setAttribute('aria-label', '复制代码');
  button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(code.textContent || ''); button.textContent = '已复制'; } catch { button.textContent = '请手动复制'; } setTimeout(() => button.textContent = '复制', 1800); });
  const actions = block.closest('.code-block-container')?.querySelector('.code-actions');
  if (actions) {
    const collapse = document.createElement('button');
    collapse.className = 'copy-code'; collapse.textContent = '折叠'; collapse.setAttribute('aria-label', '折叠代码'); collapse.setAttribute('aria-expanded', 'true');
    collapse.addEventListener('click', () => { block.hidden = !block.hidden; collapse.textContent = block.hidden ? '展开' : '折叠'; collapse.setAttribute('aria-expanded', String(!block.hidden)); });
    actions.append(collapse, button);
  } else block.append(button);
}
const progress = document.querySelector<HTMLElement>('#reading-progress');
const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('#article-toc nav a, .article-toc nav a')];
const tocHeadings = [...document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id], .prose h4[id]')];
if (tocLinks.length && tocHeadings.length) {
  let scheduled = false;
  const updateToc = () => {
    scheduled = false;
    const current = tocHeadings.filter(heading => heading.getBoundingClientRect().top <= 140).at(-1) || tocHeadings[0];
    for (const link of tocLinks) {
      if (decodeURIComponent(link.hash.slice(1)) === current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateToc); } }, { passive: true });
  addEventListener('resize', updateToc);
  updateToc();
}
document.querySelector('a[aria-label="查看目录"]')?.addEventListener('click', () => {
  const toc = document.querySelector<HTMLDetailsElement>('#article-toc');
  if (toc) toc.open = true;
});
const dock = document.querySelector<HTMLElement>('#dock');
let lastScroll = scrollY;
addEventListener('scroll', () => {
  const visible = scrollY > 100 && scrollY < lastScroll;
  dock?.classList.toggle('translate-y-24', !visible);
  dock?.classList.toggle('opacity-0', !visible);
  dock?.classList.toggle('pointer-events-none', !visible);
  lastScroll = scrollY;
}, { passive: true });
if (progress) {
  const update = () => { const height = document.documentElement.scrollHeight - innerHeight; progress.style.width = `${height > 0 ? Math.min(100, scrollY / height * 100) : 100}%`; };
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
}
if (document.querySelector('.mermaid')) {
  import('mermaid').then(async ({ default: mermaid }) => {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: root.classList.contains('dark') ? 'dark' : 'default' });
    for (const node of document.querySelectorAll<HTMLElement>('.mermaid')) {
      const source = node.textContent || '';
      try { await mermaid.run({ nodes: [node] }); } catch { node.replaceChildren(document.createTextNode(source)); node.removeAttribute('data-processed'); }
    }
  }).catch(() => { /* Keep readable diagram source if the module is unavailable. */ });
}
