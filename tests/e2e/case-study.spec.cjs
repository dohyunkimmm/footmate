const { test, expect } = require('@playwright/test');

test('case study uses the consolidated 16-slide information architecture', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('.slide').length === 16);
  await page.waitForFunction(() => typeof window.goTo === 'function');

  await expect(page.locator('.slide')).toHaveCount(16);
  await expect(page.locator('.toc-item')).toHaveCount(16);
  await expect(page.locator('#cnt')).toContainText('/ 16');
  await expect(page.locator('.sb-sub')).toContainText('16장');

  await page.evaluate(() => window.goTo(4));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('User Journey');
  await expect(page.locator('.slide[aria-hidden="false"] .timeline > div')).toHaveCount(5);

  await page.evaluate(() => window.goTo(6));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('Fair Match · Trust · Growth');
  await expect(page.locator('.slide[aria-hidden="false"] .moscow > div')).toHaveCount(4);

  await page.evaluate(() => window.goTo(7));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('서비스 구조를 4개 핵심 탭으로 단순화');
  await expect(page.locator('.slide[aria-hidden="false"] .ia-row > span')).toHaveCount(4);

  await page.evaluate(() => window.goTo(8));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('입력부터 경기 결과까지 이어지는 동적 ELO 구조');

  await page.evaluate(() => window.goTo(10));
  await expect(page.locator('.slide[aria-hidden="false"] .note')).toContainText('PASS·CHECK');

  await page.evaluate(() => window.goTo(12));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toContainText('운영 상태와 복구 행동');
  await expect(page.locator('.slide[aria-hidden="false"] .cards.three .card')).toHaveCount(3);

  await page.goto('/#key-screens', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.slide[aria-hidden="false"] h2')?.textContent.includes('User Journey'));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('User Journey');

  await page.goto('/#moscow', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.slide[aria-hidden="false"] h2')?.textContent.includes('Fair Match'));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('Fair Match · Trust · Growth');

  await page.goto('/#v2-concept-extension', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.slide[aria-hidden="false"] h2')?.textContent.includes('운영 상태와 복구 행동'));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toContainText('운영 상태와 복구 행동');

  await page.evaluate(() => window.goTo(13));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toContainText('FootMate');
  await page.waitForFunction(() => {
    const frame = document.getElementById('demoFrame');
    return frame && frame.getAttribute('src') && frame.getAttribute('src') !== 'about:blank';
  });
});

test('removed duplicate case study sections are not rendered as separate slides', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('.slide').length === 16);

  const text = await page.locator('#track').innerText();
  expect(text).not.toContain('프로토타입 대표 화면 흐름');
  expect(text).not.toContain('사용자 행동이 끊기지 않도록 설계한 핵심 플로우');
  expect(text).not.toContain('핵심 흐름은 유지하고,');
});


test('long Case Study TOC heading stays on one line on desktop', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelectorAll('.toc-item').length === 16);

    const title = page.locator('.toc-item[data-i="11"] .toc-t');
    await expect(title).toHaveText('Prototype Build · QA · Deployment');

    const metrics = await title.evaluate(element => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        lineHeight: parseFloat(style.lineHeight)
      };
    });

    expect(metrics.height).toBeLessThanOrEqual(metrics.lineHeight * 1.25);
  }
});
