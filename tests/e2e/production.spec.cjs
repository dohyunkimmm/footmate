const { test, expect } = require('@playwright/test');

const enabled = process.env.PRODUCTION_SMOKE === '1';
const strictProduction = ['1','true','yes'].includes(String(process.env.FOOTMATE_STRICT_PRODUCTION || '').toLowerCase());
test.skip(!enabled, 'Production browser smoke runs only after a main deployment.');

function collectFailures(page) {
  const failures = [];
  const origin = new URL(process.env.BASE_URL).origin;
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (!text.includes('Failed to load resource')) failures.push(`console.error: ${text}`);
  });
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === origin && response.status() >= 400) failures.push(`HTTP ${response.status()}: ${url.pathname}`);
  });
  return failures;
}

test('production case study and v2 product/portfolio modes render after deployment', async ({ page }) => {
  const failures = collectFailures(page);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body.textContent.includes('FootMate') || document.body.textContent.includes('풋메이트'));
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://footmate-black.vercel.app/');
  await expect(page.locator('#fmDecisionSummary')).toContainText('Validation');
  if (strictProduction) {
    await page.waitForFunction(() => typeof window.goTo === 'function');
    await expect(page.locator('.slide')).toHaveCount(16);
    await expect(page.locator('.toc-item')).toHaveCount(16);
    await expect(page.locator('#cnt')).toContainText('/ 16');

    await page.evaluate(() => window.goTo(4));
    await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('User Journey');

    await page.evaluate(() => window.goTo(7));
    await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('서비스 구조를 4개 핵심 탭으로 단순화');
    await expect(page.locator('.slide[aria-hidden="false"] .ia-row > span')).toHaveCount(4);

    await page.evaluate(() => window.goTo(8));
    await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('입력부터 경기 결과까지 이어지는 동적 ELO 구조');

    await page.evaluate(() => window.goTo(10));
    await expect(page.locator('.slide[aria-hidden="false"] .note')).toContainText('PASS·CHECK');
  }

  await page.goto('/demo', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__footmateV2 === true && document.querySelectorAll('.screen').length === 39);
  await expect(page.locator('.top-bar')).toBeHidden();
  await expect(page.locator('.flow-nav')).toBeHidden();
  await page.evaluate(() => window.goScreen('s-home'));
  await expect(page.locator('#s-home')).toHaveClass(/active/);
  await expect(page.locator('#v3Launcher')).toBeHidden();
  let state = await page.evaluate(() => ({
    mode: window.FootMateV2Runtime.mode,
    operation: window.FootMateProductOps.operation()
  }));
  expect(state.mode).toBe('product');
  expect(state.operation).toMatchObject({ match: 'open', participation: 'available' });

  await page.goto('/demo?mode=portfolio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__footmateV2 === true);
  const intro = page.locator('#demoOnboarding');
  if (await intro.isVisible()) await page.locator('.demo-onboarding-start').click();
  await page.evaluate(() => window.goScreen('s-home'));
  await expect(page.getByRole('button', { name: '제품 검증 패널 열기' })).toBeVisible();
  state = await page.evaluate(() => ({ mode: window.FootMateV2Runtime.mode }));
  expect(state.mode).toBe('portfolio');

  expect(failures, failures.join('\n')).toEqual([]);
});
