const { test, expect } = require('@playwright/test');

test('case study uses the consolidated 16-slide information architecture', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('.slide').length === 16);

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
