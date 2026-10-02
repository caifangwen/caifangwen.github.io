import { test, expect } from '@playwright/test';
const base = process.env.TEST_BASE || '';

test('original desktop widths, three-column projects and theme colors', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/`);
  await expect(page.locator('.site-header')).toHaveCSS('max-width', '896px');
  await expect(page.locator('main')).toHaveCSS('max-width', '896px');
  await expect(page.locator('.author-section > div')).toHaveCSS('border-radius', '12px');
  await expect(page.locator('.author-section img')).toHaveCSS('width', '96px');
  const projects = page.locator('main > section').filter({ has: page.getByRole('heading', { name: '特色项目' }) });
  expect((await projects.locator('.grid').evaluate(node => getComputedStyle(node).gridTemplateColumns)).split(' ')).toHaveLength(3);
  await expect(page.locator('.home-list .cover-pattern').last()).toBeVisible();
  const initial = await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor);
  await page.getByRole('button', { name: '配色主题', exact: true }).click();
  await page.getByRole('button', { name: 'Claude', exact: true }).click();
  await expect(page.locator('body')).not.toHaveCSS('background-color', initial);
  const themeBackground = await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor);
  await expect(page.locator('.author-section > div')).toHaveCSS('background-color', themeBackground);
});

test('original compact mobile list and unboxed article', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/`);
  const card = page.locator('.home-list article').first();
  await expect(card.locator('h3')).toHaveCSS('font-size', '15.2px');
  await expect(card.locator('p')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.route('https://giscus.app/**', route => route.abort());
  await page.goto(`${base}/blog/ssh-config-guide/`);
  await expect(page.locator('.article-page')).toHaveCSS('border-width', '0px');
  await expect(page.locator('.article-page')).toHaveCSS('padding', '0px');
  await expect(page.locator('.prose h2').first()).toHaveCSS('font-size', '24px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
