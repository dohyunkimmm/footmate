const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.FOOTMATE_SOURCE_DIR || path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('v2.2 product inspector owns DOM rendering outside product hardening', () => {
  const hardening = read('footmate-product-hardening.js');
  const inspector = read('src/v2/ui/product-inspector.js');
  const validation = read('src/v2/ui/validation-entry.js');
  assert.ok(hardening.includes("architecture:'v2.2-policy-adapter-ui-bridge'"));
  assert.ok(hardening.includes('attachInspectorUi'));
  assert.equal(hardening.includes('function renderOperations'), false);
  assert.equal(hardening.includes('fm-inspector-card'), false);
  assert.equal(hardening.includes('document.createElement'), false);
  assert.ok(inspector.includes('installProductInspector'));
  assert.ok(inspector.includes('function renderOperations'));
  assert.ok(inspector.includes('fm-inspector-card'));
  assert.ok(inspector.includes("architecture:'v2.2-product-inspector-module'"));
  assert.equal(validation.includes('fmProductLauncher'), false);
});

test('v2.6 release metadata preserves v2.2-v2.5 compatibility and v2.1 storage/event contracts', () => {
  const bootstrap = read('src/v2/bootstrap.js');
  const hardening = read('footmate-product-hardening.js');
  const caseStudy = read('index-experience.js');
  assert.ok(bootstrap.includes("const VERSION='2.1.0'"));
  assert.ok(bootstrap.includes("const V22_RELEASE_VERSION='2.2.0'"));
  assert.ok(bootstrap.includes("const V23_RELEASE_VERSION='2.3.0'"));
  assert.ok(bootstrap.includes("const V24_RELEASE_VERSION='2.4.0'"));
  assert.ok(bootstrap.includes("const V25_RELEASE_VERSION='2.5.0'"));
  assert.ok(bootstrap.includes("const RELEASE_VERSION='2.6.0'"));
  assert.ok(bootstrap.includes("releaseArchitecture:'v2.6-architecture-hardening'"));
  assert.ok(bootstrap.includes("previousReleaseArchitecture:'v2.5-decision-recovery-experience'"));
  for(const event of ['v2.2','v2.3','v2.4','v2.5','v2.6'])assert.ok(bootstrap.includes(`'footmate:${event}:ready'`));
  for(const alias of ['FootMateV22','FootMateV23','FootMateV24','FootMateV25','FootMateV26'])assert.ok(bootstrap.includes(`window.${alias}`));
  assert.ok(hardening.includes("eventContractVersion:'2.1.0'"));
  assert.ok(caseStudy.includes('v2.6.0 Architecture Hardening'));
});

test('v2.2 inspector CSS compatibility alias remains while v2.6 shell loads canonical ownership', () => {
  const alias = read('footmate-product-hardening.css');
  const styles = read('src/v2/styles/product-inspector.css');
  const shell = read('demo-shell.html');
  assert.ok(alias.includes("@import url('/src/v2/styles/product-inspector.css"));
  assert.equal(alias.includes('.fm-inspector-card{'), false);
  assert.ok(styles.includes('.fm-inspector-card{'));
  assert.ok(shell.includes('/src/v2/styles/product-inspector.css?v=20260918-1'));
  assert.ok(shell.includes('/src/v2/styles/core-funnel.css?v=20260919-1'));
  assert.ok(shell.includes('/src/v2/styles/decision-recovery.css?v=20260919-1'));
  assert.ok(shell.includes('bootstrap.js?v=20260919-2'));
});
