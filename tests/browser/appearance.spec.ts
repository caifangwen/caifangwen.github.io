import { test, expect } from '@playwright/test';
const base = process.env.TEST_BASE || '';

test('original desktop widths, three-column projects and theme colors', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/`);
  await expect(page.locator('.site-header')).toHaveCSS('max-width', '920px');
  await expect(page.getByRole('navigation', { name: '页脚导航' })).toHaveCount(0);
  await expect(page.locator('.site-header img')).toHaveCSS('width', '36px');
  await expect(page.locator('main')).toHaveCSS('max-width', '896px');
  await expect(page.locator('.author-section > div')).toHaveCSS('border-radius', '12px');
  await expect(page.locator('.author-section img')).toHaveCSS('width', '96px');
  const projects = page.locator('main > section').filter({ has: page.getByRole('heading', { name: '特色项目' }) });
  expect((await projects.locator('.grid').evaluate(node => getComputedStyle(node).gridTemplateColumns)).split(' ')).toHaveLength(3);
  await expect(page.locator('.recent-articles .archive-entry')).toHaveCount(5);
  await expect(page.locator('.recent-articles .cover-pattern')).toHaveCount(0);
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
  const row = page.locator('.recent-articles .archive-entry').first();
  await expect(row.locator('a')).toHaveCSS('font-size', '14px');
  await expect(row.locator('time')).toBeVisible();
  await expect(row.locator('.archive-line')).toBeVisible();
  await expect(row.locator('img')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.route('https://giscus.app/**', route => route.abort());
  await page.goto(`${base}/blog/ssh-config-guide/`);
  await expect(page.locator('.article-page')).toHaveCSS('border-width', '0px');
  await expect(page.locator('.article-page')).toHaveCSS('padding', '0px');
  await expect(page.locator('.prose h2').first()).toHaveCSS('font-size', '24px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('article tables scroll independently and lists use native numbering', async ({ page }) => {
  await page.route('https://giscus.app/**', route => route.abort());
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/blog/ssh-config-guide/`);
    const table = page.locator('.prose table').first();
    await expect(table).toHaveCSS('display', 'table');
    const wrapper = page.locator('.table-wrapper').first();
    await expect(wrapper).toHaveCSS('overflow-x', 'auto');
    if (width === 390) {
      expect(await wrapper.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true);
      await wrapper.evaluate(node => { node.scrollLeft = 100; });
      expect(await wrapper.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.prose').evaluate(node => {
      node.insertAdjacentHTML('beforeend', '<ol start="3" id="numbering-check"><li>Third<ul><li>Bullet</li></ul><ol><li>Nested</li></ol></li><li value="8">Eighth</li><li>Ninth</li></ol>');
    });
    await expect(page.locator('#numbering-check')).toHaveCSS('list-style-type', 'none');
    await expect(page.locator('#numbering-check ol')).toHaveCSS('list-style-type', 'none');
    for (const selector of ['#numbering-check > li', '#numbering-check ol > li']) {
      expect(await page.locator(selector).first().evaluate(node => getComputedStyle(node, '::before').content)).toBe('counter(list-item)');
      expect(await page.locator(selector).first().evaluate(node => getComputedStyle(node, '::before').borderRadius)).toBe('999px');
    }
    expect(await page.locator('#numbering-check ul > li').evaluate(node => getComputedStyle(node, '::before').content)).toBe('""');
  }
});

test('task lists render checkboxes and adjacent articles use icons', async ({ page }) => {
  await page.route('https://giscus.app/**', route => route.abort());
  await page.goto(`${base}/blog/canonical-url-strategy-guide/`);
  const checkbox = page.locator('.prose .task-list-item input[type="checkbox"]').first();
  await expect(checkbox).toBeVisible();
  await expect(checkbox).toBeDisabled();
  expect(await checkbox.locator('..').evaluate(node => getComputedStyle(node, '::before').display)).toBe('none');
  await page.goto(`${base}/blog/ssh-config-guide/`);
  for (const label of ['上一篇', '下一篇']) {
    const link = page.locator('.post-navigation a').filter({ hasText: label });
    await expect(link).toBeVisible();
    await expect(link.locator('svg')).toHaveCount(1);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const toc = page.locator('.article-toc');
  await expect(toc).toBeVisible();
  expect(await toc.evaluate(node => node.getBoundingClientRect().right)).toBeLessThan(
    await page.locator('main').evaluate(node => node.getBoundingClientRect().left)
  );
});

test('archive date bars stick below the navigation at each viewport width', async ({ page }) => {
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/archives/`);
    const bar = page.locator('.month-header').first();
    await bar.evaluate(node => window.scrollTo(0, window.scrollY + node.getBoundingClientRect().top));
    await expect.poll(async () => bar.evaluate(node => Math.round(node.getBoundingClientRect().top))).toBe(
      Math.round(await page.locator('.site-header').evaluate(node => node.getBoundingClientRect().bottom))
    );
    expect(await bar.evaluate(node => getComputedStyle(node).backgroundColor)).toBe(
      await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor)
    );
    await expect(bar).toHaveCSS('box-shadow', 'none');
    const groupIndex = await page.locator('.month-group').evaluateAll(nodes => nodes.findIndex(node => node.querySelectorAll('article').length >= 3));
    expect(groupIndex).toBeGreaterThanOrEqual(0);
    const group = page.locator('.month-group').nth(groupIndex);
    const overlappingCard = group.locator('article a').nth(1);
    await overlappingCard.hover();
    await overlappingCard.evaluate(node => {
      const headerHeight = document.querySelector('.site-header')!.getBoundingClientRect().height;
      window.scrollTo({ top: scrollY + node.getBoundingClientRect().top - headerHeight - 8, behavior: 'instant' });
    });
    await expect.poll(() => group.locator('.month-header').evaluate(node => {
      const rect = node.getBoundingClientRect();
      return document.elementFromPoint(rect.x + rect.width / 2, rect.y + 16)?.closest('.month-header') === node;
    })).toBe(true);
    expect(await page.locator('.site-header').evaluate(node => {
      const rect = node.getBoundingClientRect();
      return node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.bottom - 4));
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
