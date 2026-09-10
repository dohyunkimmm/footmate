const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

function attachFailureWatch(page) {
  const failures = [];
  const origin = new URL(process.env.BASE_URL || 'http://127.0.0.1:4173').origin;
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

async function bootDemo(page, target = '/demo') {
  const failures = attachFailureWatch(page);
  await page.goto(target, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.goScreen === 'function' && document.querySelectorAll('.screen').length === 39);
  const onboarding = page.locator('#demoOnboarding');
  if (await onboarding.isVisible()) await page.locator('.demo-onboarding-start').click();
  await expect(page.locator('#s-splash')).toHaveClass(/active/);
  return failures;
}

function expectNoRuntimeFailures(failures) {
  expect(failures, failures.join('\n')).toEqual([]);
}

test('production-like demo shell boots all 39 screens and runtime layers', async ({ page }) => {
  const failures = await bootDemo(page);
  await expect(page.locator('.screen')).toHaveCount(39);
  const runtime = await page.evaluate(() => ({
    core: !!window.FootMateCore,
    finalize: window.__footmateFinalize === true,
    active: document.querySelector('.screen.active')?.id
  }));
  expect(runtime).toEqual({ core: true, finalize: true, active: 's-splash' });
  expectNoRuntimeFailures(failures);
});

test('onboarding can be completed through visible controls', async ({ page }) => {
  const failures = await bootDemo(page);

  await page.getByRole('button', { name: /카카오/ }).click();
  await expect(page.locator('#s-quiz')).toHaveClass(/active/, { timeout: 10_000 });

  for (let step = 0; step < 5; step += 1) {
    await page.locator('#s-quiz .quiz-opt').first().click();
    if (step < 4) await page.waitForTimeout(450);
  }
  await expect(page.locator('#s-location')).toHaveClass(/active/, { timeout: 3_000 });

  await page.getByRole('button', { name: /직접 지역 입력/ }).click();
  await expect(page.locator('#s-manual-location')).toHaveClass(/active/);
  await page.locator('#s-manual-location button[data-region-key="suwon"]').first().click();
  await page.locator('#regionConfirmBtn').click();
  await expect(page.locator('#s-elo')).toHaveClass(/active/);
  await page.locator('#s-elo .btn-primary').click();
  await expect(page.locator('#s-home')).toHaveClass(/active/);

  expectNoRuntimeFailures(failures);
});

test('deep links restore the requested screen in a real browser', async ({ page }) => {
  const failures = attachFailureWatch(page);
  await page.goto('/demo#profile', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.screen.active')?.id === 's-profile');
  await expect(page).toHaveURL(/#profile$/);
  await expect(page.locator('#s-profile')).toHaveClass(/active/);
  expectNoRuntimeFailures(failures);
});

test('low-credit screen navigation is side-effect free and explicit simulation persists', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('footmateFinalStateV3', JSON.stringify({
      creditBalance: 20000,
      paidMatchKeys: [],
      homeDayIndex: 1,
      homeFilterMode: 'all',
      favoriteMatchKeys: [],
      friendIds: [],
      evalStars: 0,
      chatMessages: []
    }));
  });
  const failures = await bootDemo(page);

  await page.evaluate(() => window.goScreen('s-pay-low'));
  let state = await page.evaluate(() => JSON.parse(localStorage.getItem('footmateFinalStateV3')));
  expect(state.creditBalance).toBe(20000);

  await page.evaluate(() => window.goScreen('s-pay'));
  await page.getByRole('button', { name: /크레딧 부족 시뮬레이션/ }).click();
  await expect(page.locator('#s-pay-low')).toHaveClass(/active/);
  state = await page.evaluate(() => JSON.parse(localStorage.getItem('footmateFinalStateV3')));
  expect(state.creditBalance).toBe(3000);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.goScreen === 'function');
  state = await page.evaluate(() => JSON.parse(localStorage.getItem('footmateFinalStateV3')));
  expect(state.creditBalance).toBe(3000);
  expectNoRuntimeFailures(failures);
});

test('representative screens have no serious or critical axe violations', async ({ page }) => {
  const failures = await bootDemo(page);
  const screens = ['s-splash', 's-home', 's-detail', 's-pay', 's-profile'];

  for (const id of screens) {
    await page.evaluate(screenId => window.goScreen(screenId), id);
    await expect(page.locator(`#${id}`)).toHaveClass(/active/);
    const results = await new AxeBuilder({ page })
      .include(`#${id}`)
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact));
    expect(blocking, `${id}: ${blocking.map(v => `${v.id}(${v.impact})`).join(', ')}`).toEqual([]);
  }

  expectNoRuntimeFailures(failures);
});
