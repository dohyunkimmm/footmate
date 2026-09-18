const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.env.FOOTMATE_SOURCE_DIR || path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('v2.3 candidate moves compatibility and experience CSS ownership into src/v2', () => {
  const patchAlias = read('footmate-patches.css');
  const finalizeAlias = read('footmate-finalize.css');
  const experienceAlias = read('footmate-experience.css');
  const patchStyles = read('src/v2/styles/compatibility-patches.css');
  const finalizeStyles = read('src/v2/styles/compatibility-finalize.css');
  const experience = read('src/v2/styles/experience.css');
  const shell = read('demo-shell.html');

  assert.ok(patchAlias.includes("@import url('/src/v2/styles/compatibility-patches.css?v=20260918-1')"));
  assert.ok(finalizeAlias.includes("@import url('/src/v2/styles/compatibility-finalize.css?v=20260918-1')"));
  assert.ok(experienceAlias.includes("@import url('/src/v2/styles/experience.css?v=20260918-1')"));
  assert.equal(patchAlias.includes('#footmateRuntimeEmpty{'), false);
  assert.equal(finalizeAlias.includes('.footmate-home-empty{'), false);
  assert.equal(experienceAlias.includes('.btn-primary{'), false);

  assert.ok(patchStyles.includes('#footmateRuntimeEmpty{'));
  assert.ok(finalizeStyles.includes('.footmate-home-empty{'));
  assert.ok(experience.includes('FootMate v2.3 candidate'));
  assert.ok(experience.includes('.btn-primary{'));
  assert.ok(experience.includes('#s-home .pcnt'));
  assert.ok(experience.includes('.fm-inspector-card'));

  assert.ok(shell.includes('/src/v2/styles/compatibility-patches.css?v=20260918-1'));
  assert.ok(shell.includes('/src/v2/styles/compatibility-finalize.css?v=20260918-1'));
  assert.ok(shell.includes('/src/v2/styles/product-inspector.css?v=20260918-1'));
  assert.ok(shell.includes('/src/v2/styles/experience.css?v=20260918-2'));
  assert.equal(shell.includes('href="/footmate-patches.css'), false);
  assert.equal(shell.includes('href="/footmate-finalize.css'), false);
  assert.equal(shell.includes('href="/footmate-product-hardening.css'), false);
  assert.equal(shell.includes('href="/footmate-experience.css'), false);
});

test('v2.3 scenario persistence uses a guarded canonical-to-legacy migration boundary', () => {
  const persistence = read('src/v2/state/scenario-persistence.js');
  const bridge = read('src/v2/compat/scenario-persistence-bridge.js');
  const bootstrap = read('src/v2/bootstrap.js');
  const shell = read('demo-shell.html');

  assert.ok(persistence.includes("createStorage('scenario')"));
  assert.ok(persistence.includes("const LEGACY_KEY='footmateRuntimeStateV2'"));
  assert.ok(persistence.includes("architecture:'v2.3-scenario-persistence-migration'"));
  assert.ok(persistence.includes('__v23CanonicalUpdatedAt'));

  assert.ok(bridge.includes("const CANONICAL_KEY='footmate:v2:scenario'"));
  assert.ok(bridge.includes("const LEGACY_KEY='footmateRuntimeStateV2'"));
  assert.ok(bridge.includes('const markerMatches=legacyMarker>0&&legacyMarker===canonicalUpdatedAt'));
  assert.ok(bridge.includes('(!legacy||markerMatches)'));
  assert.ok(bridge.includes("architecture:'v2.3-canonical-to-legacy-hydration-bridge'"));

  const bridgeIndex=shell.indexOf('/src/v2/compat/scenario-persistence-bridge.js');
  const patchIndex=shell.indexOf('/footmate-patches.js');
  assert.ok(bridgeIndex>0&&patchIndex>bridgeIndex);

  assert.ok(bootstrap.includes("import{createScenarioPersistence}from'./state/scenario-persistence.js'"));
  assert.ok(bootstrap.includes('createScenarioPersistence(scenarioStore).start()'));
  assert.ok(bootstrap.includes('scenarioPersistence.clear()'));
});

test('v2.3 candidate gives filter, results and reason presentation to a v2 presenter', () => {
  const presenter = read('src/v2/ui/scenario-presenter.js');
  const store = read('src/v2/state/scenario-store.js');
  const bootstrap = read('src/v2/bootstrap.js');

  assert.ok(presenter.includes("new Set(['s-filter','s-results','s-reason'])"));
  assert.ok(presenter.includes('function renderFilter(state)'));
  assert.ok(presenter.includes('function renderResults(state)'));
  assert.ok(presenter.includes('function renderReason(state)'));
  assert.ok(presenter.includes("architecture:'v2.3-scenario-presenter'"));

  assert.ok(store.includes('presenter?.owns?.(screenId)'));
  assert.ok(store.includes("present('s-filter',value)"));
  assert.ok(store.includes("present('s-results',value)"));
  assert.ok(store.includes("present('s-reason',value)"));
  assert.ok(store.includes("presentationArchitecture:presenter?.architecture||'adapter-render-compatibility'"));

  assert.ok(bootstrap.includes("const CANDIDATE_VERSION='2.3.0'"));
  assert.ok(bootstrap.includes('window.FootMateV23Candidate'));
  assert.ok(bootstrap.includes("candidateArchitecture:'v2.3-compatibility-boundary-reduction'"));
});

test('v2.3 architecture prep keeps the public v2.2 release contract untouched', () => {
  const app = read('src/v2/styles/app.css');
  const bootstrap = read('src/v2/bootstrap.js');
  const experience = read('src/v2/styles/experience.css');

  assert.ok(app.includes('html[data-footmate-mode="product"] body'));
  assert.ok(app.includes('html[data-footmate-mode="portfolio"] .v3-launcher'));
  assert.ok(experience.includes(':root{'));

  assert.ok(bootstrap.includes("const RELEASE_VERSION='2.2.0'"));
  assert.ok(bootstrap.includes("document.documentElement.dataset.footmateRelease='2.2'"));
  assert.ok(bootstrap.includes("releaseArchitecture:'v2.2-inspector-modular-ui-runtime'"));
  assert.ok(bootstrap.includes("'footmate:v2.2:ready'"));
});
