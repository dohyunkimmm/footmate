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
    await expect(page.locator('#fmReleaseVersionBadge')).toContainText('V2.7');
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
  if (strictProduction) await page.waitForFunction(() => !!window.FootMateV27 && !!window.FootMateV26 && !!window.FootMateV25);
  await expect(page.locator('.top-bar')).toBeHidden();
  await expect(page.locator('.flow-nav')).toBeHidden();
  await page.evaluate(() => window.goScreen('s-home'));
  await expect(page.locator('#s-home')).toHaveClass(/active/);
  if (strictProduction) await expect(page.locator('#s-home [data-fm25-slot="next-action"]')).toBeVisible();
  await expect(page.locator('#v3Launcher')).toBeHidden();
  let state = await page.evaluate(() => ({mode: window.FootMateV2Runtime.mode,operation: window.FootMateProductOps.operation()}));
  expect(state.mode).toBe('product');
  expect(state.operation).toMatchObject({ match: 'open', participation: 'available' });

  if (!strictProduction) {
    const compatibility = await page.evaluate(() => ({
      runtimeVersion: window.FootMateV2Runtime?.version || null,
      availableReleaseVersion: window.FootMateV27?.version || window.FootMateV26?.version || window.FootMateV25?.version || window.FootMateV24?.version || window.FootMateV23?.version || window.FootMateV22?.version || null
    }));
    expect(compatibility.runtimeVersion).toBeTruthy();
    expect(compatibility.availableReleaseVersion).toBeTruthy();
  }

  if (strictProduction) {
    const release = await page.evaluate(() => ({
      version: window.FootMateV2Runtime?.version,
      schemaVersion: window.FootMateV2Runtime?.schemaVersion,
      releaseArchitecture: window.FootMateV2Runtime?.releaseArchitecture,
      previousReleaseArchitecture: window.FootMateV2Runtime?.previousReleaseArchitecture,
      visualOwnership: window.FootMateV2Runtime?.visualOwnership,
      uiArchitecture: window.FootMateV2Runtime?.uiArchitecture,
      releaseDataset: document.documentElement.dataset.footmateRelease,
      inspectorReady: window.__footmateV22Inspector === true,
      policyArchitecture: window.FootMateProductOps?.architecture,
      v27Version: window.FootMateV27?.version,
      v27PreviousReleaseVersion: window.FootMateV27?.previousReleaseVersion,
      v27VisualOwnership: window.FootMateV27?.visualOwnership,
      v27BaselineArchitecture: window.FootMateV27?.baselineArchitecture,
      v26Version: window.FootMateV26?.version,
      v26CurrentReleaseVersion: window.FootMateV26?.currentReleaseVersion,
      v26PreviousReleaseVersion: window.FootMateV26?.previousReleaseVersion,
      v26RuntimeBoundary: window.FootMateV26?.runtimeBoundary,
      v26AvailabilityGateway: window.FootMateV26?.availabilityGateway,
      v26TracePersistence: window.FootMateV26?.decisionTracePersistence,
      v26PersistentDecisionReplay: window.FootMateV26?.persistentDecisionReplay,
      v26Compatibility: window.FootMateV26?.compatibility,
      v25Version: window.FootMateV25?.version,
      v25CurrentReleaseVersion: window.FootMateV25?.currentReleaseVersion,
      v25PreviousReleaseVersion: window.FootMateV25?.previousReleaseVersion,
      v25DecisionEngine: window.FootMateV25?.decisionEngine,
      v25Experience: window.FootMateV25?.decisionRecoveryExperience,
      v25ComponentSource: window.FootMateV25?.componentSource,
      v25CssOwnership: window.FootMateV25?.cssOwnership,
      v25Compatibility: window.FootMateV25?.compatibility,
      v24Version: window.FootMateV24?.version,
      v24CurrentReleaseVersion: window.FootMateV24?.currentReleaseVersion,
      v24Compatibility: window.FootMateV24?.compatibility,
      v23Version: window.FootMateV23?.version,
      v23CurrentReleaseVersion: window.FootMateV23?.currentReleaseVersion,
      v22Version: window.FootMateV22?.version,
      v22CurrentReleaseVersion: window.FootMateV22?.currentReleaseVersion,
      availability: window.FootMateV2Runtime?.availabilityGateway?.read()
    }));
    expect(release.version).toBe('2.7.0');
    expect(release.schemaVersion).toBe('2.1.0');
    expect(release.releaseArchitecture).toBe('v2.7-visual-experience');
    expect(release.previousReleaseArchitecture).toBe('v2.6-architecture-hardening');
    expect(release.visualOwnership).toBe('src/v2/styles/visual-experience.css');
    expect(release.uiArchitecture).toBe('v2.2-product-inspector-module');
    expect(release.releaseDataset).toBe('2.7');
    expect(release.inspectorReady).toBe(true);
    expect(release.policyArchitecture).toBe('v2.2-policy-adapter-ui-bridge');
    expect(release.v27Version).toBe('2.7.0');
    expect(release.v27PreviousReleaseVersion).toBe('2.6.0');
    expect(release.v27VisualOwnership).toBe('src/v2/styles/visual-experience.css');
    expect(release.v27BaselineArchitecture).toBe('v2.6-architecture-hardening');
    expect(release.v26Version).toBe('2.6.0');
    expect(release.v26CurrentReleaseVersion).toBe('2.7.0');
    expect(release.v26PreviousReleaseVersion).toBe('2.5.0');
    expect(release.v26RuntimeBoundary).toBe('v2.6-build-source-component-boundary');
    expect(release.v26AvailabilityGateway).toBe('v2.6-availability-verification-boundary');
    expect(release.v26TracePersistence).toBe('v2.6-decision-trace-persistence');
    expect(release.v26PersistentDecisionReplay).toBe(true);
    expect(release.v26Compatibility).toBe(true);
    expect(release.v25Version).toBe('2.5.0');
    expect(release.v25CurrentReleaseVersion).toBe('2.7.0');
    expect(release.v25PreviousReleaseVersion).toBe('2.4.0');
    expect(release.v25DecisionEngine).toBe('v2.5-decision-recovery-engine');
    expect(release.v25Experience).toBe('v2.5-decision-recovery-experience');
    expect(release.v25ComponentSource).toBe('src/v2/demo/decision-recovery-components.js');
    expect(release.v25CssOwnership).toBe('src/v2/styles/decision-recovery.css');
    expect(release.v25Compatibility).toBe(true);
    expect(release.v24Version).toBe('2.4.0');
    expect(release.v24CurrentReleaseVersion).toBe('2.7.0');
    expect(release.v24Compatibility).toBe(true);
    expect(release.v23Version).toBe('2.3.0');
    expect(release.v23CurrentReleaseVersion).toBe('2.7.0');
    expect(release.v22Version).toBe('2.2.0');
    expect(release.v22CurrentReleaseVersion).toBe('2.7.0');
    expect(release.availability).toMatchObject({
      architecture:'v2.6-availability-verification-boundary',
      freshness:{source:'prototype-session',realtime:false,serverVerified:false}
    });
    await page.evaluate(() => window.FootMateV2Runtime.scenarioStore.navigateToMatch('seongnam', true));
    await expect(page.locator('#s-detail')).toHaveAttribute('data-v2-presentation', 'scenario-presenter');
    await expect(page.locator('#s-detail .fm24-detail-decision')).toBeVisible();
    await expect(page.locator('#s-detail [data-fm25-slot="preflight"]')).toBeVisible();
    const decision = await page.evaluate(() => window.FootMateV2Runtime.decisionEngine.evaluate('s-detail',{record:false}));
    expect(decision.traceId).toMatch(/^fm25-/);
  }

  await page.goto('/demo?mode=portfolio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__footmateV2 === true && document.querySelectorAll('.screen').length === 39);
  if (strictProduction) await page.waitForFunction(() => !!window.FootMateV27 && !!window.FootMateV26 && !!window.FootMateV25);
  const intro = page.locator('#demoOnboarding');
  if (await intro.isVisible()) await page.locator('.demo-onboarding-start').click();
  await page.evaluate(() => window.goScreen('s-home'));
  const validationLauncher = page.getByRole('button', { name: '제품 검증 패널 열기' });
  await expect(validationLauncher).toBeVisible();
  if (strictProduction) await expect(page.locator('#s-home [data-fm25-slot="next-action"]')).toBeVisible();
  state = await page.evaluate(() => ({ mode: window.FootMateV2Runtime.mode }));
  expect(state.mode).toBe('portfolio');

  if (strictProduction) {
    await validationLauncher.click();
    const inspector = page.locator('#fmProductInspector');
    await expect(inspector).toHaveAttribute('aria-hidden', 'false');
    await expect(page.getByRole('tab', { name: '추천 설명' })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('button', { name: /제품 검증 패널 닫기/ }).click();
    await expect(validationLauncher).toBeFocused();
  }

  expect(failures, failures.join('\n')).toEqual([]);
});
