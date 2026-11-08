'use strict';

// Read-only review aid for already-fetched origin/* refs.
// A unique commit patch does not prove a missing product feature.
// This script never merges, checks out, deletes, pushes, or rewrites refs.
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');

const BASE = 'origin/main';
const DEFAULT_REPORT = 'verification/git-branch-audit/patches.tsv';

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function isQaPath(path) {
  return /^tests\//.test(path) || /^\.github\/workflows\//.test(path);
}

function isDocumentationOrAsset(path) {
  return /^(docs\/|qa\/|\.github\/ISSUE_TEMPLATE\/)/.test(path) ||
    /^(README\.md|CHANGELOG\.md|LICENSE|\.gitignore)$/.test(path) ||
    /\.(?:md|mdx|png|jpe?g|svg|webp|gif|pdf|pptx|xlsx|zip)$/i.test(path) ||
    /^src\/case-study\/(?:downloads|evidence|report-previews\.js)/.test(path) ||
    /(?:^|\/)__snapshots__\//.test(path);
}

function classify({patchUnique, changedPaths, activeRuntime, activeQa, activeDocs}) {
  if (patchUnique === 0) return 'patch-equivalent-review';
  if (changedPaths === 0) return 'no-delta-review';
  if (activeRuntime > 0) return 'active-runtime-manual-review';
  if (activeQa > 0) return 'active-qa-manual-review';
  if (activeDocs > 0) return 'active-docs-assets-manual-review';
  return 'retired-paths-manual-review';
}

function parsePatchReport(content) {
  const rows = content.trimEnd().split(/\r?\n/);
  if (rows.shift() !==
    'branch\tahead\tbehind\tpatch_unique\tpatch_equivalent\tclassification') {
    throw new Error('Unexpected patches.tsv header');
  }
  const seen = new Set();
  return rows.map((row) => {
    const columns = row.split('\t');
    if (columns.length !== 6 || !/^origin\/.+/.test(columns[0]) ||
        columns[0] === 'origin/main' || columns[0] === 'origin/HEAD' ||
        !columns.slice(1, 5).every(value => /^\d+$/.test(value))) {
      throw new Error('Malformed patches.tsv row');
    }
    if (seen.has(columns[0])) throw new Error('Duplicate branch in patches.tsv');
    seen.add(columns[0]);
    return {
      branch: columns[0],
      ahead: Number(columns[1]),
      behind: Number(columns[2]),
      patchUnique: Number(columns[3])
    };
  });
}

function safeCell(value) {
  return String(value).replace(/[\t\r\n]/g, ' ');
}

function audit(reportPath = DEFAULT_REPORT) {
  git(['rev-parse', '--verify', BASE]);
  const mainFiles = new Set(git(['ls-tree', '-r', '--name-only', '-z', BASE])
    .split('\0').filter(Boolean));
  if (!mainFiles.size) throw new Error('Main file inventory is empty');
  const rows = parsePatchReport(fs.readFileSync(reportPath, 'utf8'));
  console.log('branch\tahead\tbehind\tpatch_unique\tbranch_delta_paths\tcurrent_paths\tretired_paths\tactive_runtime\tactive_qa\tactive_docs_assets\treview_bucket\tsample_current_paths\tsample_retired_paths');
  const buckets = new Map();
  for (const row of rows) {
    const changed = git(['diff', '--name-only', '--no-renames', '-z',
      BASE + '...' + row.branch]).split('\0').filter(Boolean);
    const active = changed.filter(path => mainFiles.has(path));
    const retired = changed.filter(path => !mainFiles.has(path));
    const qa = active.filter(isQaPath);
    const docs = active.filter(path => !isQaPath(path) && isDocumentationOrAsset(path));
    const runtime = active.filter(path =>
      !isQaPath(path) && !isDocumentationOrAsset(path));
    const bucket = classify({
      patchUnique: row.patchUnique, changedPaths: changed.length,
      activeRuntime: runtime.length, activeQa: qa.length, activeDocs: docs.length
    });
    buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
    console.log([
      row.branch, row.ahead, row.behind, row.patchUnique, changed.length,
      active.length, retired.length, runtime.length, qa.length, docs.length,
      bucket, active.slice(0, 6).map(safeCell).join(';'),
      retired.slice(0, 6).map(safeCell).join(';')
    ].join('\t'));
  }
  console.error('Applicability review: ' + rows.length + ' branches; ' +
    [...buckets].map(([key, value]) => key + '=' + value).join(', ') + '.');
  console.error('These are current-path overlaps, NOT proof of missing behavior. ' +
    'Do not merge or delete branches without individual review.');
}

if (require.main === module) {
  try {
    audit(process.argv[2] || DEFAULT_REPORT);
  } catch (error) {
    console.error('Applicability review failed:', error.message);
    process.exitCode = 1;
  }
}

module.exports = {isQaPath, isDocumentationOrAsset, classify, parsePatchReport};
