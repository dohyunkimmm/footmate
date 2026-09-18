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
    await expect(page.locator('#fmReleaseVersionBadge')).toContainText('V2.4');

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
  if (strictProduction) await page.waitForFunction(() => !!window.FootMateV24);
  await expect(page.locator('.top-bar')).toBeHidden();
  await expect(page.locator('.flow-nav')).toBeHidden();
  await page.evaluate(() => window.goScreen('s-home'));
  await expect(page.locator('#s-home')).toHaveClass(/active/);
  if (strictProduction) await expect(page.locator('#s-home .fm24-home-decision')).toBeVisible();
  await expect(page.locator('#v3Launcher')).toBeHidden();
  let state = await page.evaluate(() => ({
    mode: window.FootMateV2Runtime.mode,
    operation: window.FootMateProductOps.operation()
  }));
  expect(state.mode).toBe('product');
  expect(state.operation).toMatchObject({ match: 'open', participation: 'available' });

  if (!strictProduction) {
    const compatibility = await page.evaluate(() => ({
      runtimeVersion: window.FootMateV2Runtime?.version || null,
      availableReleaseVersion: window.FootMateV24?.version || window.FootMateV23?.version || window.FootMateV22?.version || null
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
      uiArchitecture: window.FootMateV2Runtime?.uiArchitecture,
      releaseDataset: document.documentElement.dataset.footmateRelease,
      inspectorReady: window.__footmateV22Inspector === true,
      policyArchitecture: window.FootMateProductOps?.architecture,
      v24Version: window.FootMateV24?.version,
      v24PreviousReleaseVersion: window.FootMateV24?.previousReleaseVersion,
      v24ScenarioPresentation: window.FootMateV24?.scenarioPresentation,
      v24CoreFunnelExperience: window.FootMateV24?.coreFunnelExperience,
      v24ComponentSource: window.FootMateV24?.componentSource,
      v24CssOwnership: window.FootMateV24?.cssOwnership,
      v23Version: window.FootMateV23?.version,
      v23CurrentReleaseVersion: window.FootMateV23?.currentReleaseVersion,
      v23Compatibility: window.FootMateV23?.compatibility,
      v22Version: window.FootMateV22?.version,
      v22CurrentReleaseVersion: window.FootMateV22?.currentReleaseVersion,
      v22Compatibility: window.FootMateV22?.compatibility
    }));
    expect(release).toEqual({
      version: '2.4.0',
      schemaVersion: '2.1.0',
      releaseArchitecture: 'v2.4-core-funnel-experience',
      previousReleaseArchitecture: 'v2.3-compatibility-boundary-reduction',
      uiArchitecture: 'v2.2-product-inspector-module',
      releaseDataset: '2.4',
      inspectorReady: true,
      policyArchitecture: 'v2.2-policy-adapter-ui-bridge',
      v24Version: '2.4.0',
      v24PreviousReleaseVersion: '2.3.0',
      v24ScenarioPresentation: 'v2.4-core-funnel-presenter',
      v24CoreFunnelExperience: 'v2.4-core-funnel-experience',
      v24ComponentSource: 'src/v2/demo/core-funnel-components.js',
      v24CssOwnership: 'src/v2/styles/core-funnel.css',
      v23Version: '2.3.0',
      v23CurrentReleaseVersion: '2.4.0',
      v23Compatibility: true,
      v22Version: '2.2.0',
      v22CurrentReleaseVersion: '2.4.0',
      v22Compatibility: true
    });

    await page.evaluate(() => window.FootMateV2Runtime.scenarioStore.navigateToMatch('seongnam', true));
    await expect(page.locator('#s-detail')).toHaveAttribute('data-v2-presentation', 'scenario-presenter');
    await expect(page.locator('#s-detail .fm24-detail-decision')).toBeVisible();
  }

  await page.goto('/demo?mode=portfolio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__footmateV2 === true && document.querySelectorAll('.screen').length === 39);
  if (strictProduction) await page.waitForFunction(() => !!window.FootMateV24);
  const intro = page.locator('#demoOnboarding');
  if (await intro.isVisible()) await page.locator('.demo-onboarding-start').click();
  await page.evaluate(() => window.goScreen('s-home'));
  const validationLauncher = page.getByRole('button', { name: '제품 검증 패널 열기' });
  await expect(validationLauncher).toBeVisible();
  if (strictProduction) await expect(page.locator('#s-home .fm24-home-decision')).toBeVisible();
  state = await page.evaluate(() => ({ mode: window.FootMateV2Runtime.mode }));
  expect(state.mode).toBe('portfolio');

  if (strictProduction) {
    await validationLauncher.click();
    const inspector = page.locator('#fmProductInspector');
    await expect(inspector).toHaveAttribute('aria-hidden', 'false');
    await expect(page.getByRole('tab', { name: '추천 설명' })).toHaveAttribute('aria-selected', 'true');
    const inspectorStyle = await page.locator('.fm-inspector-card').evaluate(element => ({
      width: element.getBoundingClientRect().width,
      backgroundColor: getComputedStyle(element).backgroundColor
    }));
    expect(inspectorStyle.width).toBeGreaterThan(0);
    expect(inspectorStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    await page.getByRole('button', { name: /제품 검증 패널 닫기/ }).click();
    await expect(validationLauncher).toBeFocused();
  }

  expect(failures, failures.join('\n')).toEqual([]);
});
