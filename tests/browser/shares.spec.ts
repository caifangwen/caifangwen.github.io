import { test, expect } from '@playwright/test';
const base = process.env.TEST_BASE || '';

test('sharing resources filter by category and retain repository and taxonomy links', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/shares/`);
    await expect(page.locator('[data-share-resource]:visible')).toHaveCount(15);
    const filters = page.getByRole('navigation', { name: '分享分类' });
    await filters.getByRole('button', { name: '后端与数据', exact: false }).click();
    await expect(page.locator('[data-share-resource]:visible')).toHaveCount(3);
    await expect(page.locator('#share-count')).toHaveText('3 个资源');
    await page.reload();
    await expect(page.locator('[data-share-resource]:visible')).toHaveCount(3);
    await filters.getByRole('button', { name: '前端与界面', exact: false }).click();
    await expect(page.locator('[data-share-resource]:visible')).toHaveCount(5);
    const astro = page.locator('[data-share-resource]').filter({ has: page.getByRole('heading', { name: 'Astro', exact: true }) });
    await expect(astro.locator('a[href="https://github.com/withastro/astro"]')).toHaveAttribute('target', '_blank');
    await astro.locator('a[href*="/categories/"]').click();
    await expect(page.locator('main h1')).toHaveText('前端与界面');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
