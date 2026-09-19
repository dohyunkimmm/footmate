const { test, expect } = require('@playwright/test');

async function bootCaseStudy(page, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('.slide').length === 16);
  await page.waitForFunction(() => typeof window.goTo === 'function');
  await page.waitForSelector('.fm-next-story, .fm-next-cover');
}

test('case study tells the next-major product-first story across 16 compatibility sections', async ({ page }) => {
  await bootCaseStudy(page);

  await expect(page.locator('.slide')).toHaveCount(16);
  await expect(page.locator('.toc-item')).toHaveCount(16);
  await expect(page.locator('#cnt')).toContainText('/ 16');
  await expect(page.locator('.sb-sub')).toContainText('16장');

  await expect(page.locator('.slide[data-i="0"] .fm-next-cover')).toContainText('내 수준에 맞는 경기부터');
  await expect(page.locator('.slide[data-i="0"] .fm-next-cover')).toContainText('Find');
  await expect(page.locator('.slide[data-i="0"] .fm-next-cover-frame iframe')).toHaveAttribute('src', '/next?embed=1');

  await page.evaluate(() => window.goTo(1));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toContainText('나한테 맞는 경기인가');

  await page.evaluate(() => window.goTo(2));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toContainText('결정할 수 있는 확신');
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('JTBD');

  await page.evaluate(() => window.goTo(4));
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('Find');
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('Return');

  await page.evaluate(() => window.goTo(5));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toContainText('회원가입을 첫 화면에서 제거');
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('Value → Preferences → Recommendation → Sign in to Join');

  await page.evaluate(() => window.goTo(8));
  await expect(page.locator('.slide[aria-hidden="false"] h2')).toContainText('Sign in');
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('로그인 UX');
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('미연동');

  await page.evaluate(() => window.goTo(12));
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('REAL APP');
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('EVIDENCE');

  await page.evaluate(() => window.goTo(13));
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('Context');
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('Observe');

  await page.evaluate(() => window.goTo(14));
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('Regression');
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('axe');

  await page.evaluate(() => window.goTo(15));
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('실제');
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('다음');
});

test('case study removes the previous presentation-first headings from the rendered story', async ({ page }) => {
  await bootCaseStudy(page);
  const text = await page.locator('#track').innerText();
  expect(text).not.toContain('Fair Match · Trust · Growth');
  expect(text).not.toContain('서비스 구조를 4개 핵심 탭으로 단순화');
  expect(text).not.toContain('입력부터 경기 결과까지 이어지는 동적 ELO 구조');
});

test('next-major Case Study TOC stays readable on desktop', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 }
  ]) {
    await bootCaseStudy(page, viewport);
    const toc = page.locator('.toc-item');
    await expect(toc).toHaveCount(16);
    await expect(toc.nth(0)).toContainText('Overview');
    await expect(toc.nth(8)).toContainText('Sign in');
    await expect(toc.nth(13)).toContainText('System Evidence');
    await expect(toc.nth(15)).toContainText('Outcome · Limits');

    const titles = page.locator('.toc-t');
    const count = await titles.count();
    for (let i = 0; i < count; i += 1) {
      const metrics = await titles.nth(i).evaluate(element => {
        const style = getComputedStyle(element);
        return { height: element.getBoundingClientRect().height, lineHeight: parseFloat(style.lineHeight) };
      });
      expect(metrics.height).toBeLessThanOrEqual(metrics.lineHeight * 2.3);
    }
  }
});

test('mobile Case Study scrolls vertically and keeps the live next app reachable', async ({ page }) => {
  await bootCaseStudy(page, { width: 390, height: 844 });

  const cover = page.locator('.slide[data-i="0"] .fm-next-cover.cover');
  const metrics = await cover.evaluate(element => ({
    overflowY: getComputedStyle(element).overflowY,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight
  }));
  expect(['auto', 'scroll']).toContain(metrics.overflowY);
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);

  await cover.evaluate(element => { element.scrollTop = element.scrollHeight; });
  expect(await cover.evaluate(element => element.scrollTop)).toBeGreaterThan(0);

  const frame = page.locator('.slide[data-i="0"] .fm-next-cover-frame iframe');
  await frame.scrollIntoViewIfNeeded();
  await expect(frame).toHaveAttribute('src', '/next?embed=1');
  const box = await frame.boundingBox();
  expect(box).not.toBeNull();
  expect(box.y).toBeLessThan(844);
  expect(box.y + box.height).toBeGreaterThan(0);

  await page.evaluate(() => window.goTo(8));
  await expect(page.locator('.slide[aria-hidden="false"]')).toContainText('SIGN IN');
  const signInSlide = page.locator('.slide[aria-hidden="false"]');
  const signInMetrics = await signInSlide.evaluate(element => ({
    width: element.scrollWidth - element.clientWidth,
    height: element.scrollHeight - element.clientHeight
  }));
  expect(signInMetrics.width).toBeLessThanOrEqual(1);
  expect(signInMetrics.height).toBeGreaterThanOrEqual(0);
});
