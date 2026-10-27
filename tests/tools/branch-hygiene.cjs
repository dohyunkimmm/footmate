'use strict';

// Read-only local audit of *already fetched* origin/* branch refs.
// Never fetch, push, delete, checkout, reset, or rewrite any branch.
// Run from a complete Git clone after separately fetching remote refs.
const { execFileSync } = require('node:child_process');

function parseAheadBehind(output) {
  const match = /^\s*(\d+)\s+(\d+)\s*$/.exec(String(output));
  if (!match) throw new Error('Unexpected git rev-list ahead/behind output');
  return { behind: Number(match[1]), ahead: Number(match[2]) };
}

function classify({ ahead, patchUnique }) {
  if (ahead === 0) return 'ancestry-contained-review';
  if (patchUnique === 0) return 'patch-equivalent-review';
  return 'unique-patches-preserve';
}

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

function audit() {
  const base = 'origin/main';
  git(['rev-parse', '--verify', 'refs/remotes/origin/main']);
  const branches = git(['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin'])
    .split('\n').filter(ref => ref.startsWith('origin/') &&
      ref !== 'origin/main' && ref !== 'origin/HEAD').sort();
  console.log('branch\tahead\tbehind\tpatch_unique\tpatch_equivalent\tclassification');
  for (const branch of branches) {
    const counts = parseAheadBehind(git(['rev-list', '--left-right', '--count', base + '...' + branch]));
    const cherry = git(['cherry', base, branch]).split('\n').filter(Boolean);
    const patchUnique = cherry.filter(line => line.startsWith('+ ')).length;
    const patchEquivalent = cherry.filter(line => line.startsWith('- ')).length;
    if (patchUnique + patchEquivalent !== cherry.length) {
      throw new Error('Unexpected git cherry output for ' + branch);
    }
    console.log([branch, counts.ahead, counts.behind, patchUnique, patchEquivalent,
      classify({ ahead: counts.ahead, patchUnique })].join('\t'));
  }
  console.error('Audited ' + branches.length +
    ' local remote-tracking refs. These results DO NOT authorize deletion. ' +
    'Verify PR state, history, external references, and backup before changing a remote ref.');
}

if (require.main === module) {
  try { audit(); } catch (error) {
    console.error('Audit failed:', error.message);
    process.exitCode = 1;
  }
}

module.exports = { parseAheadBehind, classify };
