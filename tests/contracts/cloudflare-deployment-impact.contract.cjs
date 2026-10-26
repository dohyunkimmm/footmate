'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { classify, parseChangedFiles } = require('../../scripts/classify-cloudflare-impact.cjs');

test('documentation-only updates use lightweight QA and no deployment', () => {
  assert.deepEqual(classify(['README.md', 'docs/README.md', '.github/pull_request_template.md']),
    { runtime: false, production: false, production_smoke: false });
});

test('new scripts, Worker, routing, lockfile, and UI changes require a Cloudflare deployment', () => {
  for (const file of ['worker/index.js', 'wrangler.jsonc', 'scripts/build-cloudflare.mjs',
                      'scripts/classify-cloudflare-impact.cjs', 'package-lock.json',
                      'src/app/app.js', '.gitignore', 'api/beta-config.js']) {
    assert.deepEqual(classify([file]), { runtime: true, production: true, production_smoke: true }, file);
  }
});

test('test changes still run regression without redeploying unchanged assets', () => {
  assert.deepEqual(classify(['tests/contracts/matching.contract.mjs']),
    { runtime: true, production: false, production_smoke: false });
  assert.deepEqual(classify(['tests/production-smoke.cjs']),
    { runtime: true, production: false, production_smoke: true });
  assert.deepEqual(classify(['tests/e2e/beta-production-core.spec.cjs']),
    { runtime: true, production: false, production_smoke: true });
  assert.deepEqual(classify(['tests/e2e/release-app.spec.cjs']),
    { runtime: true, production: false, production_smoke: true });
});

test('workflow edits require full QA and production smoke, not a duplicate deploy', () => {
  assert.deepEqual(classify(['.github/workflows/qa.yml']),
    { runtime: true, production: false, production_smoke: true });
  assert.deepEqual(classify(['.github/dependabot.yml']),
    { runtime: true, production: false, production_smoke: false });
});

test('mixed PRs use all changed paths, not just a docs-only final commit', () => {
  assert.deepEqual(classify(['src/beta/app.js', 'docs/README.md']),
    { runtime: true, production: true, production_smoke: true });
  assert.deepEqual(classify(['docs/README.md', 'tests/e2e/production-app.spec.cjs']),
    { runtime: true, production: false, production_smoke: true });
});

test('missing or malformed input fails open rather than skipping deploy checks', () => {
  for (const files of [[], null, undefined, [''], ['src/app/app.js', '']]) {
    assert.deepEqual(classify(files), { runtime: true, production: true, production_smoke: true });
  }
  assert.deepEqual(parseChangedFiles(''), []);
  assert.deepEqual(parseChangedFiles('src/app/app.js\r\ndocs/README.md\n'),
    ['src/app/app.js', 'docs/README.md']);
});

test('workflow emits three strict boolean outputs to GitHub Actions', () => {
  const runner = path.resolve(__dirname, '../../scripts/classify-cloudflare-impact.cjs');
  const run = files => spawnSync(process.execPath, [runner], {
    encoding: 'utf8',
    env: { ...process.env, FOOTMATE_CHANGED_FILES: files }
  });
  const docs = run('docs/README.md');
  assert.equal(docs.status, 0, docs.stderr);
  assert.equal(docs.stdout, 'runtime=false\nproduction=false\nproduction_smoke=false\n');
  const runtime = run('worker/index.js');
  assert.equal(runtime.status, 0, runtime.stderr);
  assert.equal(runtime.stdout, 'runtime=true\nproduction=true\nproduction_smoke=true\n');
  const empty = run('');
  assert.equal(empty.status, 0, empty.stderr);
  assert.equal(empty.stdout, 'runtime=true\nproduction=true\nproduction_smoke=true\n');
});

test('CI keeps explicit required check names and Cloudflare deploy ordering', () => {
  const workflow = fs.readFileSync(path.resolve(__dirname, '../../.github/workflows/qa.yml'), 'utf8');
  assert.match(workflow, /FOOTMATE_CHANGED_FILES="\$changed_files" node scripts\/classify-cloudflare-impact\.cjs >> "\$GITHUB_OUTPUT"/);
  assert.match(workflow, /name: Regression 36/);
  assert.match(workflow, /name: Browser E2E \+ axe/);
  assert.match(workflow, /name: Deploy Cloudflare/);
  assert.match(workflow, /name: Production Smoke/);
  assert.match(workflow, /needs\.deploy_cloudflare\.result == 'success'/);
  assert.doesNotMatch(workflow, /FOOTMATE_VERCEL_CHANGED_FILES|vercel-preview-deployment|vercel-ignore-build/);
});

test('retired Vercel hosting files are absent while AI Gateway integration remains', () => {
  const root=path.resolve(__dirname, '../..');
  for (const file of ['vercel.json', 'scripts/vercel-ignore-build.cjs',
                      'tests/contracts/vercel-preview-deployment.contract.cjs']) {
    assert.equal(fs.existsSync(path.resolve(root,file)), false, file);
  }
  const gateway=fs.readFileSync(path.resolve(root,'api/ai-match-assistant.js'),'utf8');
  const packageJson=JSON.parse(fs.readFileSync(path.resolve(root,'package.json'),'utf8'));
  assert.match(gateway,/ai-gateway\.vercel\.sh/);
  const version=packageJson.dependencies['@vercel/oidc'];
  const lock=JSON.parse(fs.readFileSync(path.resolve(root,'package-lock.json'),'utf8'));
  assert.match(version,/^4\\.0\\.\\d+$/);
  assert.equal(lock.packages[''].dependencies['@vercel/oidc'],version);
  assert.equal(lock.packages['node_modules/@vercel/oidc'].version,version);
});
