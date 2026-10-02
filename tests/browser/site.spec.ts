import { test, expect } from '@playwright/test';
const base = process.env.TEST_BASE || '';

test('desktop navigation, search and persistent appearance', async ({ page }) => {
  await page.goto(`${base}/`);
  await expect(page.getByRole('heading', { name: '某方', exact: true })).toBeVisible();
  await expect(page.locator('header').first()).toHaveCSS('position', 'sticky');
  await page.screenshot({ path: test.info().outputPath('home-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: '搜索文章' }).click();
  await page.getByRole('searchbox').fill('SSH');
  await expect(page.locator('#search-results a').first()).toBeVisible();
  await expect(page.locator('#search-results')).toContainText('SSH');
  await page.keyboard.press('Escape');
  await expect(page.locator('#search-dialog')).not.toBeVisible();
  const before = await page.locator('html').evaluate(node => node.classList.contains('dark'));
  await page.getByRole('button', { name: '配色主题', exact: true }).click();
  await page.getByRole('button', { name: '切换深色模式' }).click();
  await page.reload();
  expect(await page.locator('html').evaluate(node => node.classList.contains('dark'))).toBe(!before);
  await page.getByRole('button', { name: '配色主题', exact: true }).click();
  await page.getByRole('button', { name: 'Emerald', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'emerald');
  await page.goto(`${base}/posts/page/2/`);
  await expect(page.getByRole('navigation', { name: '分页' }).locator('[aria-current="page"]')).toHaveText('2');
});

test('article anchors, code, feeds and bundle images', async ({ page, request }) => {
  await page.route('https://giscus.app/**', route => route.abort());
  await page.goto(`${base}/blog/ssh-config-guide/`);
  await expect(page.locator('h1')).toContainText('SSH');
  const link = page.getByRole('navigation', { name: '桌面文章目录' }).locator('a').first();
  const href = await link.getAttribute('href');
  expect(await page.evaluate(id => !!document.getElementById(id!.slice(1)), href)).toBe(true);
  await expect(page.getByRole('button', { name: '复制代码' }).first()).toBeVisible();
  await expect(page.locator('.code-block-container').first()).toHaveCSS('border-radius', '12px');
  await page.getByRole('button', { name: '折叠代码' }).first().click();
  await expect(page.locator('.prose pre').first()).toBeHidden();
  await page.getByRole('button', { name: '折叠代码' }).first().click();
  await expect(page.locator('.prose pre').first()).toBeVisible();
  for (const url of ['/index.xml', '/sitemap.xml', '/robots.txt', '/media/projects/narrow/narrow.webp', '/reports/seo.com.cn.html']) expect((await request.get(`${base}${url}`)).ok()).toBe(true);
  const index = await (await request.get(`${base}/index.json`)).json();
  expect(index.length).toBeGreaterThan(200);
  expect(index.every((entry: { url: string }) => entry.url.startsWith(`${base}/`))).toBe(true);
});

test('mobile layout and menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/`);
  await page.screenshot({ path: test.info().outputPath('home-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: '菜单' }).click();
  await expect(page.getByRole('navigation', { name: '移动导航' })).toBeVisible();
  await page.getByRole('navigation', { name: '移动导航' }).getByRole('link', { name: '文章', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('文章');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
