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

async function waitForRuntime(page) {
  await page.waitForFunction(() =>
    typeof window.goScreen === 'function' &&
    document.querySelectorAll('.screen').length === 39 &&
    window.__footmateV2 === true
  );
}

async function dismissOnboarding(page) {
  const onboarding = page.locator('#demoOnboarding');
  if (await onboarding.isVisible()) await page.locator('.demo-onboarding-start').click();
}

async function bootDemo(page, target = '/demo') {
  const failures = attachFailureWatch(page);
  await page.goto(target, { waitUntil: 'domcontentloaded' });
  await waitForRuntime(page);
  await dismissOnboarding(page);
  await expect(page.locator('#s-splash')).toHaveClass(/active/);
  return failures;
}

function expectNoRuntimeFailures(failures) {
  expect(failures, failures.join('\n')).toEqual([]);
}

test('v2 shell boots all 39 screens with modular runtime layers', async ({ page }) => {
  const failures = await bootDemo(page);
  await expect(page.locator('.screen')).toHaveCount(39);
  const runtime = await page.evaluate(() => ({
    core: !!window.FootMateCore,
    productCore: !!window.FootMateProductCore,
    finalize: window.__footmateFinalize === true,
    productHardening: window.__footmateProductHardening === true,
    v2: window.__footmateV2 === true,
    version: window.FootMateV2Runtime?.version,
    architecture: window.FootMateV2Runtime?.architecture,
    navigationWrapped: window.FootMateV2Runtime?.navigationWrapped,
    productOps: !!window.FootMateProductOps,
    active: document.querySelector('.screen.active')?.id,
    operation: window.FootMateProductOps.operation()
  }));
  expect(runtime.core).toBe(true);
  expect(runtime.productCore).toBe(true);
  expect(runtime.finalize).toBe(true);
  expect(runtime.productHardening).toBe(true);
  expect(runtime.v2).toBe(true);
  expect(runtime.version).toMatch(/^2\./);
  expect(runtime.architecture).toBe('native-es-modules');
  expect(runtime.navigationWrapped).toBe(false);
  expect(runtime.productOps).toBe(true);
  expect(runtime.active).toBe('s-splash');
  expect(runtime.operation).toMatchObject({ match: 'open', payment: 'idle', participation: 'available' });

  await expect(page.locator('#v3Launcher')).toBeHidden();
  await expect(page.locator('#fmProductLauncher')).toBeHidden();

  await page.evaluate(() => window.goScreen('s-home'));
  await page.waitForFunction(() => window.FootMateV2Runtime?.state?.lastActiveScreen === 's-home');
  const validationLauncher = page.getByRole('button', { name: '제품 검증 패널 열기' });
  await expect(validationLauncher).toBeVisible();
  await expect(page.locator('#v3Launcher')).toHaveText('제품 검증');
  await validationLauncher.click();

  const inspector = page.locator('#fmProductInspector');
  await expect(inspector).toHaveAttribute('aria-hidden', 'false');
  await expect(page.getByRole('tab', { name: '추천 설명' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-fm-panel="recommendation"]')).toContainText('추천 이유');
  await page.getByRole('tab', { name: /PM/ }).click();
  await expect(page.locator('[data-fm-panel="pm"]')).toContainText('Event contract');
  const inspectorAxe = await new AxeBuilder({ page })
    .include('#fmProductInspector')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const inspectorBlocking = inspectorAxe.violations.filter(v => ['serious', 'critical'].includes(v.impact));
  expect(inspectorBlocking, JSON.stringify(inspectorBlocking, null, 2)).toEqual([]);
  await page.getByRole('button', { name: /제품 검증 패널 닫기/ }).click();
  await expect(validationLauncher).toBeFocused();
  expectNoRuntimeFailures(failures);
});

test('v2 onboarding keeps portfolio utilities out of the product flow', async ({ page }) => {
  const failures = await bootDemo(page);

  await expect(page.locator('#v3Launcher')).toBeHidden();
  await expect(page.locator('#s-splash button[onclick*="s-v2-priority"]')).toBeHidden();

  await page.getByRole('button', { name: /카카오/ }).click();
  await expect(page.locator('#s-quiz')).toHaveClass(/active/, { timeout: 10_000 });
  await expect(page.locator('#v3Launcher')).toBeHidden();

  for (let step = 0; step < 5; step += 1) {
    await page.locator('#s-quiz .quiz-opt').first().click();
    if (step < 4) await page.waitForTimeout(450);
  }
  await expect(page.locator('#s-location')).toHaveClass(/active/, { timeout: 3_000 });
  await expect(page.locator('#v3Launcher')).toBeHidden();

  await page.getByRole('button', { name: /직접 지역 입력/ }).click();
  await expect(page.locator('#s-manual-location')).toHaveClass(/active/);
  await page.locator('#s-manual-location button[data-region-key="suwon"]').first().click();
  await page.locator('#regionConfirmBtn').click();
  await expect(page.locator('#s-elo')).toHaveClass(/active/);
  await expect(page.locator('#v3Launcher')).toBeHidden();
  await page.locator('#s-elo .btn-primary').click();
  await expect(page.locator('#s-home')).toHaveClass(/active/);
  await expect(page.getByRole('button', { name: '제품 검증 패널 열기' })).toBeVisible();

  expectNoRuntimeFailures(failures);
});

test('v2 UI state is versioned and screen state persists independently', async ({ page }) => {
  const failures = await bootDemo(page);
  await page.evaluate(() => window.goScreen('s-profile'));
  await page.waitForFunction(() => window.FootMateV2Runtime?.state?.lastActiveScreen === 's-profile');

  const snapshot = await page.evaluate(() => ({
    key: window.FootMateV2Runtime.storageKey,
    saved: JSON.parse(localStorage.getItem(window.FootMateV2Runtime.storageKey) || 'null')
  }));
  expect(snapshot.key).toBe('footmate:v2:ui');
  expect(snapshot.saved).toMatchObject({ version: '2.0.0-beta.1', lastActiveScreen: 's-profile' });
  expectNoRuntimeFailures(failures);
});

test('deep links restore the requested screen after the demo intro', async ({ page }) => {
  const failures = attachFailureWatch(page);
  await page.goto('/demo#profile', { waitUntil: 'domcontentloaded' });
  await waitForRuntime(page);
  await expect(page).toHaveURL(/#profile$/);
  await dismissOnboarding(page);
  await expect(page.locator('#s-profile')).toHaveClass(/active/);
  expectNoRuntimeFailures(failures);
});

test('low-credit screen navigation is side-effect free and explicit simulation persists', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('footmateFinalStateV3')) {
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
    }
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
  await waitForRuntime(page);
  state = await page.evaluate(() => JSON.parse(localStorage.getItem('footmateFinalStateV3')));
  expect(state.creditBalance).toBe(3000);
  expectNoRuntimeFailures(failures);
});

test('representative screens have no serious or critical axe violations', async ({ page }) => {
  const failures = await bootDemo(page);
  const screens = ['s-splash', 's-home', 's-detail', 's-pay', 's-profile'];
  const accessibilityFailures = [];

  for (const id of screens) {
    await page.evaluate(screenId => window.goScreen(screenId), id);
    await expect(page.locator(`#${id}`)).toHaveClass(/active/);
    const results = await new AxeBuilder({ page })
      .include(`#${id}`)
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact));
    for (const violation of blocking) {
      accessibilityFailures.push({
        screen: id,
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary }))
      });
    }
  }

  expect(accessibilityFailures, JSON.stringify(accessibilityFailures, null, 2)).toEqual([]);
  expectNoRuntimeFailures(failures);
});
