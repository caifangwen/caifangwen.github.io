import { test, expect } from '@playwright/test';
const base = process.env.TEST_BASE || '';

test('category catalog and archive timeline work on desktop and mobile', async ({ page }) => {
  await page.route('https://giscus.app/**', route => route.abort());
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/categories/`);
    await expect(page.locator('.category-list > a').first()).toContainText('收录');
    await page.locator('.category-list > a').first().click();
    await expect(page.locator('main article').first()).toBeVisible();
    await page.goto(`${base}/archives/`);
    await expect(page.locator('.month-header').first()).toContainText(/\d{4} 年 \d{2} 月/);
    const row = page.locator('.archive-entry').first();
    await expect(row.locator('time')).toHaveText(/^\d{2}-\d{2}$/);
    const dateRect = await row.locator('time').boundingBox();
    const linkRect = await row.locator('a').boundingBox();
    expect(dateRect!.x + dateRect!.width).toBeLessThan(linkRect!.x);
    await expect(row).not.toContainText('分钟');
    const timeline = await page.locator('.month-group').first().evaluate(group => {
      const first = group.querySelector('.archive-entry')!;
      const last = group.querySelector('.archive-entry:last-child')!;
      const firstDot = first.querySelector('.archive-dot')!.getBoundingClientRect();
      const lastDot = last.querySelector('.archive-dot')!.getBoundingClientRect();
      return { top: first.querySelector('.archive-line')!.getBoundingClientRect().top, bottom: last.querySelector('.archive-line')!.getBoundingClientRect().bottom, start: firstDot.top + firstDot.height / 2, end: lastDot.top + lastDot.height / 2 };
    });
    expect(Math.abs(timeline.top - timeline.start)).toBeLessThan(1);
    expect(Math.abs(timeline.bottom - timeline.end)).toBeLessThan(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`archives-${width}.png`) });
    const href = await row.locator('a').getAttribute('href');
    await row.locator('a').click();
    await expect(page).toHaveURL(url => decodeURI(url.pathname) === decodeURI(href!));
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
  const active = page.locator('.article-toc [aria-current="location"]');
  const hovered = page.locator('.article-toc nav a').first();
  await expect(active).toHaveCSS('border-radius', '0px');
  const activeColor = await active.evaluate(node => getComputedStyle(node).borderLeftColor);
  const hoverRect = await hovered.boundingBox();
  await hovered.hover();
  await expect(hovered).toHaveCSS('border-left-color', activeColor);
  await expect(active).toHaveCSS('border-left-color', 'rgba(0, 0, 0, 0)');
  expect((await hovered.boundingBox())!.x).toBe(hoverRect!.x);
  await page.mouse.move(0, 0);
  await expect(active).toHaveCSS('border-left-color', activeColor);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#article-toc summary').click();
  await expect(page.locator('#article-toc nav')).toBeVisible();
  await page.locator('#article-toc nav a').nth(1).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('card tags navigate to their collection and cards still open articles', async ({ page }) => {
  await page.route('https://giscus.app/**', route => route.abort());
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const section of ['articles', 'shares']) {
      await page.goto(`${base}/${section}/`);
      const tag = page.locator('main article a[href*="/tags/"]').first();
      const href = await tag.getAttribute('href');
      const name = await tag.innerText();
      await tag.click();
      await expect(page).toHaveURL(url => decodeURI(url.pathname) === decodeURI(href!));
      await expect(page.locator('main h1')).toHaveText(name, { ignoreCase: true });
      await expect(page.locator('main article').first()).toBeVisible();
    }
    await page.goto(`${base}/articles/`);
    const card = page.locator('main article').first();
    const href = await card.locator('a[aria-label]').getAttribute('href');
    const title = await card.locator('h3').boundingBox();
    await page.mouse.click(title!.x + title!.width / 2, title!.y + title!.height / 2);
    await expect(page).toHaveURL(url => decodeURI(url.pathname) === decodeURI(href!));
  }
});
