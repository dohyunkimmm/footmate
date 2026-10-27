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
  assert.match(version,/^4[.]0[.][0-9]+$/);
  assert.equal(lock.packages[''].dependencies['@vercel/oidc'],version);
  assert.equal(lock.packages['node_modules/@vercel/oidc'].version,version);
});


test('local branch audit only observes refs and separates ancestry from patch equivalence', () => {
  const { parseAheadBehind, classify } = require('../tools/branch-hygiene.cjs');
  assert.deepEqual(parseAheadBehind('55\t0\n'), { behind: 55, ahead: 0 });
  assert.deepEqual(parseAheadBehind('4  9'), { behind: 4, ahead: 9 });
  assert.throws(() => parseAheadBehind('not a count'), /Unexpected/);
  assert.equal(classify({ahead:0,patchUnique:0}), 'ancestry-contained-review');
  assert.equal(classify({ahead:3,patchUnique:0}), 'patch-equivalent-review');
  assert.equal(classify({ahead:3,patchUnique:1}), 'unique-patches-preserve');
  const code=fs.readFileSync(path.resolve(__dirname,'../tools/branch-hygiene.cjs'),'utf8');
  assert.match(code,/\['cherry', base, branch\]/);
  assert.match(code,/\['rev-list', '--left-right', '--count'/);
  assert.doesNotMatch(code,/execFileSync\('(?:gh|curl)'|git\(\['(?:push|reset|checkout|branch|update-ref|fetch)'/,
    'branch audit must never mutate remote refs or fetch/change worktree');
});


test('single-use branch pruning is SHA-guarded, main-only and scoped', () => {
  const workflow=fs.readFileSync(path.resolve(__dirname,
    '../../.github/workflows/prune-verified-merged-branch.yml'),'utf8');
  assert.match(workflow,/^on:\n  push:\n    branches: \[main\]/m);
  assert.match(workflow,/paths:\n      - \.github\/workflows\/prune-verified-merged-branch\.yml/);
  assert.match(workflow,/github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow,/permissions:\n  contents: write\n  pull-requests: read/);
  assert.match(workflow,/branch='docs\/compact-demo-release-654'/);
  assert.match(workflow,/expected='81819f79d011f084c2f1aaf87d398aacae089438'/);
  for(const gate of [
    'if [[ "$current" != "$expected" ]]',
    'if [[ "$merged" != "true" || "$merge_sha" != "$expected" ]]',
    'if [[ "$protected" != "false" ]]',
    'if [[ "$ahead" != "0" ]]',
    'if [[ "$open_prs" != "0" ]]',
    'if [[ "$again" != "$expected" ]]'
  ])assert.ok(workflow.includes(gate),'branch deletion lacks safety gate: '+gate);
  assert.match(workflow,/gh api --method DELETE "repos\/\$repo\/git\/refs\/heads\/\$branch"/);
  assert.doesNotMatch(workflow,/workflow_dispatch:|pull_request:|--force|-f\s|update-ref/);
});
