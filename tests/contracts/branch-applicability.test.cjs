'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isQaPath, isDocumentationOrAsset, classify, parsePatchReport
} = require('../tools/branch-applicability.cjs');

test('classifies current active runtime, QA and historical paths conservatively', () => {
  const example = {
    patchUnique: 1, changedPaths: 5,
    activeRuntime: 1, activeQa: 1, activeDocs: 1
  };
  assert.equal(classify(example), 'active-runtime-manual-review');
  assert.equal(classify({...example, activeRuntime: 0}),
    'active-qa-manual-review');
  assert.equal(classify({...example, activeRuntime: 0, activeQa: 0}),
    'active-docs-assets-manual-review');
  assert.equal(classify({...example, activeRuntime: 0, activeQa: 0, activeDocs: 0}),
    'retired-paths-manual-review');
  assert.equal(classify({...example, patchUnique: 0}),
    'patch-equivalent-review');
  assert.equal(classify({...example, changedPaths: 0}),
    'no-delta-review');
  assert.equal(classify({...example, changedPaths: 0, activeRuntime: 0,
    activeQa: 0, activeDocs: 0}), 'no-delta-review');
});

test('labels generated preview assets and QA separately from runtime', () => {
  assert.ok(isQaPath('tests/e2e/reader.spec.cjs'));
  assert.ok(isQaPath('.github/workflows/qa.yml'));
  assert.equal(isQaPath('src/beta/app.js'), false);
  assert.ok(isDocumentationOrAsset('src/case-study/report-previews.js'));
  assert.ok(isDocumentationOrAsset('src/case-study/downloads/footmate_report.pptx'));
  assert.ok(isDocumentationOrAsset('docs/README.md'));
  assert.equal(isDocumentationOrAsset('src/beta/app.js'), false);
});

test('parses verified patch rows and rejects malformed, repeated or missing inventory', () => {
  const header = 'branch\tahead\tbehind\tpatch_unique\tpatch_equivalent\tclassification';
  const line = 'origin/fix/example\t2\t5\t1\t1\tunique-patches-preserve';
  assert.deepEqual(parsePatchReport(header + '\n' + line + '\n'), [{
    branch: 'origin/fix/example', ahead: 2, behind: 5, patchUnique: 1
  }]);
  assert.throws(() => parsePatchReport(header + '\n' + line + '\n' + line),
    /Duplicate branch/);
  assert.throws(() => parsePatchReport('invalid\n' + line),
    /Unexpected patches.tsv header/);
  assert.throws(() => parsePatchReport(header + '\norigin/main\t1\t2\t1\t0\tx'),
    /Malformed patches.tsv row/);
});
