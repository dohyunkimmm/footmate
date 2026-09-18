const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.env.FOOTMATE_SOURCE_DIR || path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('v2.3 candidate moves product experience CSS ownership into src/v2', () => {
  const alias = read('footmate-experience.css');
  const experience = read('src/v2/styles/experience.css');
  const shell = read('demo-shell.html');

  assert.ok(alias.includes("@import url('/src/v2/styles/experience.css?v=20260918-1')"));
  assert.equal(alias.includes('.btn-primary{'), false);
  assert.equal(alias.includes('#s-home .pcnt'), false);
  assert.equal(alias.includes('.v3-launcher{'), false);

  assert.ok(experience.includes('FootMate v2.3 candidate'));
  assert.ok(experience.includes('.btn-primary{'));
  assert.ok(experience.includes('#s-home .pcnt'));
  assert.ok(experience.includes('.fm-inspector-card'));
  assert.ok(experience.includes('.v3-launcher{'));
  assert.ok(experience.includes('@media(prefers-reduced-motion:reduce)'));

  assert.ok(shell.includes('footmate-experience.css?v=20260918-4'));
});

test('v2.3 CSS ownership keeps the existing v2 app layer and release runtime untouched', () => {
  const app = read('src/v2/styles/app.css');
  const bootstrap = read('src/v2/bootstrap.js');
  const experience = read('src/v2/styles/experience.css');

  assert.ok(app.includes('html[data-footmate-mode="product"] body'));
  assert.ok(app.includes('html[data-footmate-mode="portfolio"] .v3-launcher'));
  assert.ok(experience.includes(':root{'));

  // This first v2.3 architecture PR is intentionally pre-release: public runtime
  // metadata stays on the v2.2 baseline until v2.2 exact Production verification closes.
  assert.ok(bootstrap.includes("const RELEASE_VERSION='2.2.0'"));
  assert.ok(bootstrap.includes("releaseArchitecture:'v2.2-inspector-modular-ui-runtime'"));
});
