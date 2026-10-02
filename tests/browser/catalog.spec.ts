import { test, expect } from '@playwright/test';
const base = process.env.TEST_BASE || '';

test('category catalog and monthly archives retain their detailed layout', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/categories/`);
    await expect(page.locator('.category-list > a').first()).toContainText('收录');
    await page.locator('.category-list > a').first().click();
    await expect(page.locator('main article').first()).toBeVisible();
    await page.goto(`${base}/archives/`);
    await expect(page.locator('.month-header').first()).toContainText(/\d{4} 年 \d{2} 月/);
    await expect(page.locator('.month-group article').first()).toContainText('分钟');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`archives-${width}.png`) });
  }
});

test('article directory follows the reading position and works on mobile', async ({ page }) => {
  await page.route('https://giscus.app/**', route => route.abort());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/blog/ssh-config-guide/`);
  const heading = page.locator('.prose h2[id]').nth(1);
  const id = await heading.getAttribute('id');
  await heading.evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().top + scrollY - 110, behavior: 'instant' }));
  await expect(page.locator('.article-toc [aria-current="location"]')).toHaveAttribute('href', `#${id}`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#article-toc summary').click();
  await expect(page.locator('#article-toc nav')).toBeVisible();
  await page.locator('#article-toc nav a').nth(1).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('card tags navigate to their collection and cards still open articles', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const section of ['posts', 'shares']) {
      await page.goto(`${base}/${section}/`);
      const tag = page.locator('main article a[href*="/tags/"]').first();
      const href = await tag.getAttribute('href');
      const name = await tag.innerText();
      await tag.click();
      await expect(page).toHaveURL(url => decodeURI(url.pathname) === decodeURI(href!));
      await expect(page.locator('main h1')).toHaveText(name, { ignoreCase: true });
      await expect(page.locator('main article').first()).toBeVisible();
    }
    await page.goto(`${base}/posts/`);
    const card = page.locator('main article').first();
    const href = await card.locator('a[aria-label]').getAttribute('href');
    const title = await card.locator('h3').boundingBox();
    await page.mouse.click(title!.x + title!.width / 2, title!.y + title!.height / 2);
    await expect(page).toHaveURL(url => decodeURI(url.pathname) === decodeURI(href!));
  }
});
