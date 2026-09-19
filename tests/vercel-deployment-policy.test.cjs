const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { isIgnorable, requiresDeployment } = require('../scripts/vercel-ignore-build.cjs');

test('Vercel Git integration auto-deploys main only', () => {
  const configPath = path.join(__dirname, '..', 'vercel.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  assert.equal(config.git?.deploymentEnabled?.['*'], false);
  assert.equal(config.git?.deploymentEnabled?.main, true);
  assert.equal(config.ignoreCommand, 'node scripts/vercel-ignore-build.cjs');
});

test('docs and QA-only changes do not consume a Vercel build', () => {
  const files = [
    'README.md',
    'docs/RELEASE-HISTORY.md',
    'tests/vercel-deployment-policy.test.cjs',
    '.github/workflows/qa.yml',
    'playwright.config.cjs',
  ];

  assert.equal(files.every(isIgnorable), true);
  assert.equal(requiresDeployment(files), false);
});

test('runtime or deployment-policy changes still require a Vercel build', () => {
  assert.equal(requiresDeployment(['src/v2/bootstrap.js', 'tests/v27-architecture.test.cjs']), true);
  assert.equal(requiresDeployment(['vercel.json']), true);
  assert.equal(requiresDeployment(['scripts/vercel-ignore-build.cjs']), true);
  assert.equal(requiresDeployment([]), true);
});
