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

test('production case study and v3 product/portfolio modes render after deployment', async ({ page }) => {
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
    await expect(page.locator('#fmReleaseVersionBadge')).toContainText('V3.0');
    await page.evaluate(() => window.goTo(4));
    await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('User Journey');
    await page.evaluate(() => window.goTo(7));
    await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('서비스 구조를 4개 핵심 탭으로 단순화');
    await expect(page.locator('.slide[aria-hidden="false"] .ia-row > span')).toHaveCount(4);
    await expect(page.locator('.slide[aria-hidden="false"] .ia-row')).toContainText('탐색');
    await expect(page.locator('.slide[aria-hidden="false"] .ia-row')).toContainText('추천');
    await expect(page.locator('.slide[aria-hidden="false"] .ia-row')).toContainText('참가');
    await expect(page.locator('.slide[aria-hidden="false"] .ia-row')).toContainText('내 정보');
    await page.evaluate(() => window.goTo(8));
    await expect(page.locator('.slide[aria-hidden="false"] h2')).toHaveText('입력부터 경기 결과까지 이어지는 동적 ELO 구조');
    await page.evaluate(() => window.goTo(10));
    await expect(page.locator('.slide[aria-hidden="false"] .note')).toContainText('PASS·CHECK');
  }

  await page.goto('/demo', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__footmateV2 === true && document.querySelectorAll('.screen').length === 39);
  if (strictProduction) await page.waitForFunction(() => window.__footmateV3 === true && !!window.FootMateV30 && !!window.FootMateV28 && !!window.FootMateV27 && !!window.FootMateV26 && window.FootMateV3Runtime?.version === '3.0.0' && window.FootMateV2Runtime?.version === '2.8.0');
  await expect(page.locator('.top-bar')).toBeHidden();
  await expect(page.locator('.flow-nav')).toBeHidden();
  await page.evaluate(() => window.goScreen('s-home'));
  await expect(page.locator('#s-home')).toHaveClass(/active/);
  if (strictProduction) {
    await expect(page.locator('#s-home [data-fm25-slot="next-action"]')).toBeVisible();
    await expect(page.locator('#s-home')).toHaveAttribute('data-fm28-identity','true');
    await expect(page.locator('#s-home')).toHaveAttribute('data-fm30-area','discover');
    await expect(page.locator('#fm30AppNav')).toBeVisible();
    await expect(page.locator('#fm30AppNav [data-fm30-destination]')).toHaveCount(4);
  }
  await expect(page.locator('#v3Launcher')).toBeHidden();
  let state = await page.evaluate(() => ({mode: window.FootMateV2Runtime.mode,operation: window.FootMateProductOps.operation()}));
  expect(state.mode).toBe('product');
  expect(state.operation).toMatchObject({ match: 'open', participation: 'available' });

  if (!strictProduction) {
    const compatibility = await page.evaluate(() => ({
      runtimeVersion: window.FootMateV3Runtime?.version || window.FootMateV2Runtime?.version || null,
      availableReleaseVersion: window.FootMateV30?.version || window.FootMateV28?.version || window.FootMateV27?.version || window.FootMateV26?.version || window.FootMateV25?.version || null
    }));
    expect(compatibility.runtimeVersion).toBeTruthy();
    expect(compatibility.availableReleaseVersion).toBeTruthy();
  }

  if (strictProduction) {
    const release = await page.evaluate(() => ({
      v3Runtime:{
        version:window.FootMateV3Runtime?.version,
        schemaVersion:window.FootMateV3Runtime?.schemaVersion,
        architecture:window.FootMateV3Runtime?.architecture,
        releaseArchitecture:window.FootMateV3Runtime?.releaseArchitecture,
        previousReleaseArchitecture:window.FootMateV3Runtime?.previousReleaseArchitecture,
        shellOwnership:window.FootMateV3Runtime?.shellOwnership,
        componentOwnership:window.FootMateV3Runtime?.componentOwnership,
        visualBaselineOwnership:window.FootMateV3Runtime?.visualBaselineOwnership
      },
      v30:window.FootMateV30,
      currentReleaseDataset:document.documentElement.dataset.footmateCurrentRelease,
      currentArchitectureDataset:document.documentElement.dataset.footmateArchitecture,
      visualBaselineDataset:document.documentElement.dataset.footmateVisualBaseline,
      version: window.FootMateV2Runtime?.version,
      schemaVersion: window.FootMateV2Runtime?.schemaVersion,
      releaseArchitecture: window.FootMateV2Runtime?.releaseArchitecture,
      previousReleaseArchitecture: window.FootMateV2Runtime?.previousReleaseArchitecture,
      visualOwnership: window.FootMateV2Runtime?.visualOwnership,
      visualTokenOwnership: window.FootMateV2Runtime?.visualTokenOwnership,
      releaseDataset: document.documentElement.dataset.footmateRelease,
      visualIdentityDataset: document.documentElement.dataset.footmateVisualIdentity,
      uiArchitecture: window.FootMateV2Runtime?.uiArchitecture,
      inspectorReady: window.__footmateV22Inspector === true,
      policyArchitecture: window.FootMateProductOps?.architecture,
      v28: window.FootMateV28,
      v27: window.FootMateV27,
      v26: window.FootMateV26,
      v25: window.FootMateV25,
      v24: window.FootMateV24,
      v23: window.FootMateV23,
      v22: window.FootMateV22,
      availability: window.FootMateV2Runtime?.availabilityGateway?.read(),
      viewState:window.FootMateV3Runtime?.viewState?.getState?.()
    }));
    expect(release.v3Runtime).toMatchObject({version:'3.0.0',schemaVersion:'2.1.0',architecture:'v3.0-modular-app-runtime',releaseArchitecture:'v3.0-unified-app-architecture',previousReleaseArchitecture:'v2.8-visual-identity',shellOwnership:'src/v3/styles/app-shell.css',componentOwnership:'src/v3/components',visualBaselineOwnership:'src/v2/styles/visual-identity.css'});
    expect(release.v30).toMatchObject({version:'3.0.0',previousReleaseVersion:'2.8.0',schemaVersion:'2.1.0',architecture:'v3.0-unified-app-architecture',runtimeArchitecture:'v3.0-modular-app-runtime',appShell:'v3.0-unified-app-shell',componentArchitecture:'v3.0-reusable-component-system',componentOwnership:'src/v3/components',ia:'4-primary-destinations',primaryDestinationCount:4,preservedLegacyScreens:39,visualBaseline:'v2.8-matchday',stateCompatibility:'v2.1-domain-state-preserved'});
    expect(release.currentReleaseDataset).toBe('3.0');
    expect(release.currentArchitectureDataset).toBe('unified-app');
    expect(release.visualBaselineDataset).toBe('2.8');
    expect(release.viewState).toMatchObject({version:'3.0.0'});

    expect(release.version).toBe('2.8.0');
    expect(release.schemaVersion).toBe('2.1.0');
    expect(release.releaseArchitecture).toBe('v2.8-visual-identity');
    expect(release.previousReleaseArchitecture).toBe('v2.7-visual-experience');
    expect(release.visualOwnership).toBe('src/v2/styles/visual-identity.css');
    expect(release.visualTokenOwnership).toBe('src/v2/styles/visual-tokens.css');
    expect(release.releaseDataset).toBe('2.8');
    expect(release.visualIdentityDataset).toBe('matchday');
    expect(release.uiArchitecture).toBe('v2.2-product-inspector-module');
    expect(release.inspectorReady).toBe(true);
    expect(release.policyArchitecture).toBe('v2.2-policy-adapter-ui-bridge');
    expect(release.v28).toMatchObject({version:'2.8.0',previousReleaseVersion:'2.7.0',schemaVersion:'2.1.0',identity:'matchday',preservedScreens:39,caseStudySlides:16,baselineArchitecture:'v2.7-visual-experience',architecture:'v2.8-visual-identity'});
    expect(release.v27).toMatchObject({version:'2.7.0',currentReleaseVersion:'2.8.0',previousReleaseVersion:'2.6.0',visualOwnership:'src/v2/styles/visual-experience.css',compatibility:true});
    expect(release.v26).toMatchObject({version:'2.6.0',currentReleaseVersion:'2.8.0',previousReleaseVersion:'2.5.0',runtimeBoundary:'v2.6-build-source-component-boundary',availabilityGateway:'v2.6-availability-verification-boundary',decisionTracePersistence:'v2.6-decision-trace-persistence',persistentDecisionReplay:true,compatibility:true});
    expect(release.v25).toMatchObject({version:'2.5.0',currentReleaseVersion:'2.8.0',previousReleaseVersion:'2.4.0',decisionEngine:'v2.5-decision-recovery-engine',decisionRecoveryExperience:'v2.5-decision-recovery-experience',componentSource:'src/v2/demo/decision-recovery-components.js',cssOwnership:'src/v2/styles/decision-recovery.css',compatibility:true});
    expect(release.v24).toMatchObject({version:'2.4.0',currentReleaseVersion:'2.8.0',compatibility:true});
    expect(release.v23).toMatchObject({version:'2.3.0',currentReleaseVersion:'2.8.0',compatibility:true});
    expect(release.v22).toMatchObject({version:'2.2.0',currentReleaseVersion:'2.8.0',compatibility:true});
    expect(release.availability).toMatchObject({architecture:'v2.6-availability-verification-boundary',freshness:{source:'prototype-session',realtime:false,serverVerified:false}});

    await page.locator('#fm30AppNav [data-fm30-destination="recommendations"]').click();
    await expect(page.locator('#s-results')).toHaveClass(/active/);
    await expect(page.locator('#s-results')).toHaveAttribute('data-fm30-area','recommendations');
    await page.evaluate(() => window.FootMateV2Runtime.scenarioStore.navigateToMatch('seongnam', true));
    await expect(page.locator('#s-detail')).toHaveAttribute('data-v2-presentation', 'scenario-presenter');
    await expect(page.locator('#s-detail')).toHaveAttribute('data-fm28-identity','true');
    await expect(page.locator('#s-detail')).toHaveAttribute('data-fm30-area','recommendations');
    await expect(page.locator('#s-detail .fm24-detail-decision')).toBeVisible();
    await expect(page.locator('#s-detail [data-fm25-slot="preflight"]')).toBeVisible();
    const decision = await page.evaluate(() => window.FootMateV2Runtime.decisionEngine.evaluate('s-detail',{record:false}));
    expect(decision.traceId).toMatch(/^fm25-/);
  }

  await page.goto('/demo?mode=portfolio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__footmateV2 === true && document.querySelectorAll('.screen').length === 39);
  if (strictProduction) await page.waitForFunction(() => window.__footmateV3 === true && !!window.FootMateV30 && !!window.FootMateV28 && window.FootMateV3Runtime?.version === '3.0.0' && window.FootMateV2Runtime?.version === '2.8.0');
  const intro = page.locator('#demoOnboarding');
  if (await intro.isVisible()) await page.locator('.demo-onboarding-start').click();
  await page.evaluate(() => window.goScreen('s-home'));
  const validationLauncher = page.getByRole('button', { name: '제품 검증 패널 열기' });
  await expect(validationLauncher).toBeVisible();
  if (strictProduction) {
    await expect(page.locator('#s-home [data-fm25-slot="next-action"]')).toBeVisible();
    await expect(page.locator('#fm30AppNav [data-fm30-destination]')).toHaveCount(4);
  }
  state = await page.evaluate(() => ({ mode: window.FootMateV2Runtime.mode, v3Mode:window.FootMateV3Runtime?.mode }));
  expect(state.mode).toBe('portfolio');
  if(strictProduction)expect(state.v3Mode).toBe('portfolio');

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
