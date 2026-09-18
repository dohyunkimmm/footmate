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
  assert.equal(validation.includes('hideDuplicateLauncher'), false);
});

test('v2.3 release metadata preserves v2.2 compatibility and v2.1 storage/event contracts', () => {
  const bootstrap = read('src/v2/bootstrap.js');
  const hardening = read('footmate-product-hardening.js');
  const caseStudy = read('index-experience.js');

  assert.ok(bootstrap.includes("const VERSION='2.1.0'"));
  assert.ok(bootstrap.includes("const PREVIOUS_RELEASE_VERSION='2.2.0'"));
  assert.ok(bootstrap.includes("const RELEASE_VERSION='2.3.0'"));
  assert.ok(bootstrap.includes("releaseArchitecture:'v2.3-compatibility-boundary-reduction'"));
  assert.ok(bootstrap.includes("'footmate:v2.2:ready'"));
  assert.ok(bootstrap.includes("'footmate:v2.3:ready'"));
  assert.ok(bootstrap.includes('window.FootMateV22'));
  assert.ok(bootstrap.includes('window.FootMateV23'));
  assert.ok(hardening.includes("eventContractVersion:'2.1.0'"));
  assert.ok(caseStudy.includes('v2.3.0 Compatibility Boundary'));
});

test('v2.2 inspector css keeps its compatibility alias while the v2.3 shell loads canonical ownership directly', () => {
  const alias = read('footmate-product-hardening.css');
  const styles = read('src/v2/styles/product-inspector.css');
  const shell = read('demo-shell.html');

  assert.ok(alias.includes("@import url('/src/v2/styles/product-inspector.css"));
  assert.equal(alias.includes('.fm-inspector-card{'), false);
  assert.ok(styles.includes('.fm-inspector-card{'));
  assert.ok(styles.includes('.fm-product-inspector button:focus-visible'));
  assert.equal(styles.includes('.fm-product-launcher'), false);
  assert.ok(shell.includes('/src/v2/styles/product-inspector.css?v=20260918-1'));
  assert.equal(shell.includes('href="/footmate-product-hardening.css'), false);
  assert.ok(shell.includes('footmate-product-hardening.js?v=20260918-5'));
  assert.ok(shell.includes('bootstrap.js?v=20260918-8'));
});
