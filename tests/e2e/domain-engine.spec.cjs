const { test, expect } = require('@playwright/test');

async function boot(page) {
  const failures = [];
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      failures.push(`console.error: ${message.text()}`);
    }
  });
  await page.goto('/demo', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() =>
    window.__footmateV2 === true &&
    window.FootMateV21?.version === '2.1.0' &&
    document.querySelectorAll('.screen').length === 39
  );
  return failures;
}

test('v2.1 domain engines preserve match scoring parity', async ({ page }) => {
  const failures = await boot(page);

  const result = await page.evaluate(() => {
    const runtime = window.FootMateV21;
    const store = runtime.scenarioStore.getState();
    const raw = window.FootMateScenarioAdapter.snapshot();

    const expected = Object.fromEntries(Object.entries(raw.matches).map(([key, base]) => {
      const scored = window.FootMateCore.scoreMatch(base, raw.profile, raw.eloState, raw.weights);
      return [key, {
        eligible: scored.eligible,
        pct: scored.pct,
        eloScore: scored.eloScore,
        styleScore: scored.styleScore,
        locationScore: scored.locationScore,
        eloDiff: scored.eloDiff
      }];
    }));

    const actual = Object.fromEntries(Object.entries(store.matches).map(([key, match]) => [key, {
      eligible: match.eligible,
      pct: match.pct,
      eloScore: match.eloScore,
      styleScore: match.styleScore,
      locationScore: match.locationScore,
      eloDiff: match.eloDiff
    }]));

    return {
      matchArchitecture: runtime.matchEngine.architecture,
      eloArchitecture: runtime.eloEngine.architecture,
      storeArchitecture: runtime.scenarioStore.architecture,
      adapterArchitecture: window.FootMateScenarioAdapter.architecture,
      recommendationSource: window.FootMateProductOps.recommendationSource(),
      rankedKeys: store.rankedMatches.map(match => match.key),
      selectedKey: store.selectedScenario?.key,
      expected,
      actual
    };
  });

  expect(result.matchArchitecture).toBe('v2.1-domain-engine');
  expect(result.eloArchitecture).toBe('v2.1-domain-engine');
  expect(result.storeArchitecture).toBe('v2.1-domain-derived-store');
  expect(result.adapterArchitecture).toBe('v2.1-render-compatibility-adapter');
  expect(result.recommendationSource).toBe('v2.1-domain-store');
  expect(result.rankedKeys).toHaveLength(3);
  expect(result.selectedKey).toBeTruthy();
  expect(result.actual).toEqual(result.expected);
  expect(failures).toEqual([]);
});

test('v2.1 scenario store owns filter-derived state', async ({ page }) => {
  const failures = await boot(page);

  const before = await page.evaluate(() => window.FootMateV21.scenarioStore.getState());
  await page.evaluate(() => {
    window.FootMateV21.scenarioStore.setDistance(1);
    window.FootMateV21.scenarioStore.setFilter({ time: 'morning', format: '5vs5' });
  });
  const after = await page.evaluate(() => {
    const state = window.FootMateV21.scenarioStore.getState();
    const selected = window.FootMateProductOps.currentScenario();
    return {
      profile: state.profile,
      eligibleCount: state.eligibleCount,
      rankedKeys: state.rankedMatches.map(match => match.key),
      selected: selected && {
        key: selected.key,
        pct: selected.pct,
        eligible: selected.eligible
      }
    };
  });

  expect(before.profile.distanceKm).toBeGreaterThanOrEqual(1);
  expect(after.profile.distanceKm).toBe(1);
  expect(after.profile.time).toBe('morning');
  expect(after.profile.format).toBe('5vs5');
  expect(after.rankedKeys).toHaveLength(3);
  expect(after.eligibleCount).toBeGreaterThanOrEqual(0);
  expect(after.selected?.key).toBeTruthy();
  expect(failures).toEqual([]);
});

test('v2.1 ELO engine matches the compatibility calculation', async ({ page }) => {
  const failures = await boot(page);

  const result = await page.evaluate(() => {
    const preview = window.FootMateV21.scenarioStore.previewElo();
    const legacy = window.calculateEloUpdate();
    return { preview, legacy };
  });

  expect(result.preview).not.toBeNull();
  expect(result.preview).toMatchObject({
    baseElo: result.legacy.baseElo,
    opponentElo: result.legacy.opponentElo,
    delta: result.legacy.delta,
    updatedElo: result.legacy.updatedElo
  });
  expect(failures).toEqual([]);
});
