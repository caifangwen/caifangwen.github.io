import { test, expect } from '@playwright/test';
const base = process.env.TEST_BASE || '';

test('portfolio preserves the resume sections and works on desktop and mobile', async ({ page, request }) => {
  await page.goto(`${base}/`);
  await page.getByRole('link', { name: 'Portfolio', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/portfolio/$'));
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/portfolio/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('蔡方闻');
    await expect(page.locator('.portfolio h2')).toHaveText(['专业技能', '工作经验', '项目亮点', '教育经历']);
    await expect(page.locator('#skills > ul > li')).toHaveCount(7);
    await expect(page.locator('.resume-experience')).toHaveCount(2);
    await expect(page.locator('.resume-experience ul > li')).toHaveCount(8);
    await expect(page.locator('.resume-project')).toHaveCount(2);
    await expect(page.locator('.resume-profile')).not.toContainText('25岁');
    await expect(page.locator('.resume-profile')).not.toContainText('女');
    await expect(page.locator('.portfolio a[href="mailto:frida_cai@qq.com"]')).toHaveCount(1);
    await expect(page.locator('.portfolio a[href="tel:15706770218"]')).toHaveCount(1);
    await expect(page.locator('#experience')).toContainText('将全站 LCP（最大内容渲染时间）从 4.2s 压缩至 1.6s');
    await expect(page.locator('#skills h3')).toHaveText(['Google SEO', '独立站开发', 'AI 工具与自动化工作流', '全栈技术', '数据分析', '海外社媒运营', '平台投放与内容创作']);
    const react = page.locator('#skills').getByRole('link', { name: 'React', exact: true });
    await expect(react).toHaveAttribute('href', 'https://react.dev/');
    await expect(react).toHaveAttribute('target', '_blank');
    await expect(react).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(page.locator('#skills').getByRole('link', { name: 'Shopify Theme', exact: true })).toHaveAttribute('href', 'https://shopify.dev/docs/storefronts/themes');
    await expect(page.locator('#skills').getByRole('link', { name: '剪映', exact: true })).toHaveAttribute('href', 'https://www.capcut.cn/');
    await expect(page.getByRole('navigation', { name: '作品集目录' })).toHaveCount(0);
    await expect(react.locator('img')).toBeVisible();
    const firstSkill = page.locator('.resume-skill').first();
    const firstSkillRect = await firstSkill.boundingBox();
    const secondSkillRect = await page.locator('.resume-skill').nth(1).boundingBox();
    const skillsHeadingRect = await page.locator('#skills > div').boundingBox();
    expect(Math.abs(firstSkillRect!.x - skillsHeadingRect!.x)).toBeLessThan(1);
    await expect(firstSkill).toHaveCSS('border-width', '1px');
    if (width >= 640) {
      expect(secondSkillRect!.x).toBeGreaterThan(firstSkillRect!.x + firstSkillRect!.width);
      expect(Math.abs(firstSkillRect!.y - secondSkillRect!.y)).toBeLessThan(1);
    }
    await expect(page.locator('.resume-profile .profile-hero')).toHaveCSS('border-radius', '12px');
    await expect(page.locator('.resume-profile img')).toHaveAttribute('src', /\/images\/avatar.svg$/);
    await expect(page.locator('.portfolio a[href="tel:15706770218"] svg path')).toHaveAttribute('d', /^M22 16\.92/);
    await expect(page.locator('#projects .project-card')).toHaveCount(2);
    await expect(page.locator('#projects')).toContainText('确保自动化流程 7×24 小时稳定运行。');
    await expect(page.locator('.resume-education h3')).toHaveCount(0);
    await expect(page.locator('.resume-experience h3')).toHaveText(['AI驱动增长', 'Google SEO 优化']);
    const experienceItem = page.locator('.resume-experience').first();
    const periodRect = await experienceItem.locator('.resume-period').boundingBox();
    const roleRect = await experienceItem.locator('h3').boundingBox();
    expect(periodRect!.x + periodRect!.width).toBeLessThan(roleRect!.x);
    if (width >= 640) {
      const companyRect = await experienceItem.locator('h3 + p').boundingBox();
      expect(companyRect!.x).toBeGreaterThan(roleRect!.x + roleRect!.width);
      expect(Math.abs(companyRect!.y - roleRect!.y)).toBeLessThan(6);
    }
    const lines = await page.locator('[data-timeline-line]').evaluateAll(nodes => nodes.map(node => ({ top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom })));
    const firstDot = await page.locator('[data-timeline-dot]').first().boundingBox();
    expect(Math.abs(lines[0].top - (firstDot!.y + firstDot!.height / 2))).toBeLessThan(1);
    expect(Math.abs(lines[0].bottom - lines[1].top)).toBeLessThan(1);
    const lastItemRect = await page.locator('.resume-experience').last().boundingBox();
    expect(Math.abs(lines[1].bottom - (lastItemRect!.y + lastItemRect!.height))).toBeLessThan(1);
    await expect(page.locator('.resume-education')).toContainText('经济学 | 本科');
    await expect(page.locator('.resume-education')).toContainText('2019.9-2023.6');
    await expect(page.locator('.resume-education')).toContainText('英语六级');
    await expect(page.locator('.resume-education')).toContainText('计算机三级');
    const schoolImage = page.getByRole('img', { name: '浙江工商大学校徽及校名' });
    const schoolDetails = page.locator('.resume-education-details');
    const schoolTimeRect = await schoolDetails.locator('p').first().boundingBox();
    const qualificationRect = await schoolDetails.locator('p').last().boundingBox();
    expect(qualificationRect!.y).toBeGreaterThan(schoolTimeRect!.y);
    const profileRect = await page.locator('.resume-profile').boundingBox();
    const downloadRect = await page.getByRole('link', { name: '下载简历 · DOCX' }).boundingBox();
    const contactRect = await page.locator('.resume-contact').boundingBox();
    await expect(page.getByRole('navigation', { name: '面包屑' })).toHaveCount(0);
    await expect(page.locator('.resume-contact')).toHaveCSS('font-size', '16px');
    await expect(page.locator('.resume-actions')).toHaveCSS('justify-content', width >= 768 ? 'flex-start' : 'center');
    expect(downloadRect!.y + downloadRect!.height).toBeGreaterThanOrEqual(contactRect!.y + contactRect!.height);
    const footerLineRect = await page.locator('footer > div > .border-t').boundingBox();
    expect(Math.abs(footerLineRect!.x - profileRect!.x)).toBeLessThan(1);
    expect(Math.abs(footerLineRect!.width - profileRect!.width)).toBeLessThan(1);
    await schoolImage.scrollIntoViewIfNeeded();
    await expect.poll(() => schoolImage.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    await page.locator('.resume-skill').last().scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('#skills a img').evaluateAll(nodes => nodes.every(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: test.info().outputPath(`portfolio-${width}.png`), fullPage: true });
  }
  const response = await request.get((await page.getByRole('link', { name: '下载简历 · DOCX' }).getAttribute('href'))!);
  expect(response.ok()).toBe(true);
  expect((await response.body()).subarray(0, 2).toString()).toBe('PK');
  await expect(page.getByRole('link', { name: 'frida_cai@qq.com', exact: true })).toHaveAttribute('href', 'mailto:frida_cai@qq.com');
  expect(await (await request.get(`${base}/sitemap.xml`)).text()).toContain('/portfolio/');
});

test('portfolio project highlights open their detail pages', async ({ page }) => {
  await page.route('https://giscus.app/**', route => route.abort());
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const title of ['智能表格与数据看板搭建', '全栈打通与轻量部署']) {
      await page.goto(`${base}/portfolio/`);
      await page.locator('#projects').getByRole('link', { name: title, exact: true }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(page.locator('.prose')).toContainText('项目概述');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole('link', { name: '返回 Portfolio', exact: true }).click();
      await expect(page).toHaveURL(new RegExp('/portfolio/$'));
    }
  }
});

test('portfolio follows site themes and supports printing', async ({ page }) => {
  await page.goto(`${base}/portfolio/`);
  const profile = page.locator('.portfolio .project-card').first();
  const initial = await profile.evaluate(node => getComputedStyle(node).backgroundColor);
  await page.getByRole('button', { name: '配色主题', exact: true }).click();
  await page.getByRole('button', { name: 'Claude', exact: true }).click();
  await expect(profile).not.toHaveCSS('background-color', initial);
  const cardColor = await page.locator('.site-header > div').evaluate(node => getComputedStyle(node).borderColor);
  await expect(profile).toHaveCSS('border-color', cardColor);
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    window.print = () => document.body.setAttribute('data-print-requested', 'true');
  });
  await expect(profile).not.toHaveCSS('background-color', initial);
  await page.getByRole('button', { name: '打印 / 保存 PDF' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-print-requested', 'true');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.getByRole('button', { name: '打印 / 保存 PDF' })).toBeHidden();
  await expect(page.locator('#experience')).toBeVisible();
  await expect(page.locator('.resume-skill').first()).toContainText('Google SEO（Semrush / Ahrefs / GSC / GA4 / 竞品分析 / 站内优化）；');
  await expect(page.locator('.resume-contact')).toBeVisible();
});
