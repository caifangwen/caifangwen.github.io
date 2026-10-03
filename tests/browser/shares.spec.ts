import { test, expect } from '@playwright/test';
import { getEntries } from '../../src/lib/content';
const base = process.env.TEST_BASE || '';
const shares = getEntries('shares');

test('sharing resources filter by category and retain repository and taxonomy links', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/shares/`);
    await expect(page.locator('[data-share-resource]:visible')).toHaveCount(shares.length);
    const filters = page.getByRole('navigation', { name: '分享分类' });
    await filters.getByRole('button', { name: '后端与数据', exact: false }).click();
    const backendCount = shares.filter(entry => entry.categories.includes('后端与数据')).length;
    await expect(page.locator('[data-share-resource]:visible')).toHaveCount(backendCount);
    await expect(page.locator('#share-count')).toHaveText(`${backendCount} 个资源`);
    await page.reload();
    await expect(page.locator('[data-share-resource]:visible')).toHaveCount(backendCount);
    await filters.getByRole('button', { name: '前端与界面', exact: false }).click();
    await expect(page.locator('[data-share-resource]:visible')).toHaveCount(shares.filter(entry => entry.categories.includes('前端与界面')).length);
    const astro = page.locator('[data-share-resource]').filter({ has: page.getByRole('heading', { name: 'Astro', exact: true }) });
    await expect(astro.locator('a[href="https://github.com/withastro/astro"]')).toHaveAttribute('target', '_blank');
    await astro.locator('a[href*="/categories/"]').click();
    await expect(page.locator('main h1')).toHaveText('前端与界面');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('share details recommend related tools from the share collection', async ({ page }) => {
  await page.route('https://giscus.app/**', route => route.abort());
  await page.goto(`${base}/shares/astro/`);
  const related = page.locator('.related-posts');
  await expect(related.getByRole('heading')).toHaveText('相关工具');
  const links = await related.locator('a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
  expect(links.length).toBeGreaterThan(0);
  expect(links.every(href => href?.startsWith(`${base}/shares/`))).toBe(true);
});
