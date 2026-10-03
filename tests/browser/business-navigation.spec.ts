import { test, expect } from '@playwright/test';
import { businessNavigation, businessAliases, learningPaths, problemNavigation } from '../../src/data/business-navigation';
const base = process.env.TEST_BASE || '';

test('business directories, secondary content links and desktop mega menus work', async ({ page }) => {
  for (const width of [1440, 1024, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/`);
    const nav = page.getByRole('navigation', { name: '主导航', exact: true });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: '首页', exact: true })).toHaveCount(0);
    for (const label of ['文章', '分享', '讨论', '分类', '学习路径']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toHaveCount(0);
      await expect(page.getByRole('navigation', { name: '内容索引' }).getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    const acquire = nav.locator('[data-business-menu]').filter({ has: page.locator('.business-trigger', { hasText: '获客' }) });
    const topRow = page.locator('.business-desktop .business-trigger, #search-open, #theme-toggle, .site-header a[aria-label="Frida Home 首页"]');
    const positions = await topRow.evaluateAll(nodes => nodes.map(node => { const rect = node.getBoundingClientRect(); return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }; }));
    const mainPosition = await page.locator('main').boundingBox();
    await acquire.locator(':scope > .business-trigger').hover();
    await expect(acquire).toHaveAttribute('data-open', '');
    await expect.poll(() => topRow.evaluateAll(nodes => nodes.map(node => { const rect = node.getBoundingClientRect(); return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }; }))).toEqual(positions);
    const panel = acquire.locator('.business-panel');
    const headerBox = await page.locator('.site-header > div').boundingBox();
    const panelBox = await panel.boundingBox();
    expect(panelBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);
    expect(await page.locator('main').boundingBox()).toEqual(mainPosition);
    await expect(panel.getByText(/浏览全部/)).toHaveCount(0);
    expect(await panel.locator('.business-menu-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(3);
    await acquire.getByRole('link', { name: '联盟营销体系', exact: true }).hover();
    await expect(acquire).toHaveAttribute('data-open', '');
    await acquire.getByRole('link', { name: '联盟营销体系', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('联盟营销体系');
    const convert = page.getByRole('navigation', { name: '主导航', exact: true }).locator('[data-business-menu]').filter({ has: page.locator('.business-trigger', { hasText: '转化' }) });
    await page.mouse.move(0, 0);
    await convert.locator(':scope > .business-trigger').focus();
    await page.keyboard.press('ArrowDown');
    await expect(convert).toHaveAttribute('data-open', '');
    await page.keyboard.press('Escape');
    await expect(convert).not.toHaveAttribute('data-open', '');
    await expect(convert.locator(':scope > .business-trigger')).toBeFocused();
    await convert.locator(':scope > .business-trigger').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('转化');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('mobile business menus navigate without losing access to content indexes', async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/`);
    await page.getByRole('button', { name: '菜单', exact: true }).click();
    const nav = page.getByRole('navigation', { name: '移动导航' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: '首页', exact: true })).toHaveCount(0);
    await nav.getByRole('button', { name: '展开出海子菜单', exact: true }).click();
    await nav.getByRole('link', { name: '隐私与数据', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('隐私与数据');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('navigation', { name: '内容索引' }).getByRole('link', { name: '分类', exact: true }).click();
    await expect(page).toHaveURL(new RegExp('/categories/$'));
    await page.getByRole('link', { name: 'Frida Home 首页', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${base}/$`));
  }
});

test('all business, problem and learning routes exist and aliases resolve', async ({ page, request }) => {
  function paths(nodes: typeof businessNavigation | typeof businessNavigation[number]['children']): string[] {
    return nodes.flatMap(node => [node.path, ...paths(node.children)]);
  }
  const urls = [...new Set([...paths(businessNavigation), ...problemNavigation.map(item => item.path), '/learn/', ...learningPaths.map(item => `/learn/${item.slug}/`)])];
  for (const url of urls) {
    const response = await request.get(`${base}${url}`);
    expect(response.ok(), url).toBe(true);
    expect(await response.text(), url).toContain('<h1');
  }
  for (const [alias, target] of Object.entries(businessAliases)) {
    await page.goto(`${base}${alias}`);
    await expect(page).toHaveURL(url => url.pathname === `${base}${target}`);
  }
  await page.goto(`${base}/learn/seo-foundations/`);
  await expect(page.locator('main ol > li')).toHaveCount(6);
  await page.locator('main ol > li').first().getByRole('link').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('战略与规划');
  await expect(page.locator('.business-sidebar a[aria-current="page"]')).toHaveText('战略与规划');
  const footerDirectory = page.locator('footer');
  for (const root of businessNavigation) {
    for (const item of [root, ...root.children]) {
      await expect(footerDirectory.locator(`a[href="${base}${item.path}"]`)).toHaveCount(1);
    }
    for (const leaf of root.children.flatMap(group => group.children)) {
      await expect(footerDirectory.locator(`a[href="${base}${leaf.path}"]`)).toHaveCount(0);
    }
  }
  expect((await footerDirectory.boundingBox())!.width).toBe((await page.locator('main').boundingBox())!.width);
  await expect(footerDirectory.getByRole('link', { name: 'Frida', exact: true })).toBeVisible();
  await footerDirectory.getByRole('link', { name: '联系', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('联系');
  for (const root of businessNavigation) {
    await page.goto(`${base}${root.path}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(root.title);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.business-sidebar').getByRole('navigation', { name: '子类别' })).toBeVisible();
    const sidebar = await page.locator('.business-sidebar').boundingBox();
    const main = await page.locator('main').boundingBox();
    expect(sidebar!.x + sidebar!.width).toBeLessThanOrEqual(main!.x);
    await expect(page.getByRole('heading', { name: '文章', exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '推荐学习路径' })).toHaveCount(0);
  }
  await page.goto(`${base}/`);
  for (const name of ['按业务目标探索', '你想解决什么问题？', '学习路径']) {
    await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
  }
  const sitemap = await (await request.get(`${base}/sitemap.xml`)).text();
  for (const url of urls) expect(sitemap).toContain(url);
});
