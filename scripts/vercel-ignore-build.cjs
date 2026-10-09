const { execFileSync } = require('node:child_process');

const IGNORABLE_PATTERNS = [
  /^README\.md$/,
  /^docs\//,
  /^tests\//,
  /^\.github\//,
  /^playwright\.config\.cjs$/,
];

function isIgnorable(file) {
  return IGNORABLE_PATTERNS.some((pattern) => pattern.test(file));
}

function requiresDeployment(files) {
  if (!Array.isArray(files) || files.length === 0) return true;
  return files.some((file) => !isIgnorable(file));
}

function readChangedFiles() {
  if (process.env.FOOTMATE_VERCEL_CHANGED_FILES) {
    return process.env.FOOTMATE_VERCEL_CHANGED_FILES
      .split(/\r?\n/)
      .map((file) => file.trim())
      .filter(Boolean);
  }

  // Preview builds must consider the whole PR, not only the last commit.
  // A docs-only tip may still contain CSS/app changes since main.
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  const preview = Boolean(branch && branch !== 'main');
  let start = 'HEAD^';
  if (preview) {
    // Vercel often checks out only the PR commit without origin/main.
    // Fetch both refs (including PR ancestry) before comparing the whole PR.
    // If history/network is unavailable, still BUILD rather than skip it.
    if (!/^[A-Za-z0-9_][A-Za-z0-9._/-]*$/.test(branch) || branch.includes('..') || branch.endsWith('.'))
      throw new Error('Unsupported preview branch reference');
    const gitOptions = {encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:12000};
    try {
      start = execFileSync('git', ['merge-base','HEAD','refs/remotes/origin/main'],gitOptions).trim();
    } catch {
      // Vercel's Git checkout can omit its "origin" remote entirely.
      // Use this repository's fixed public read-only URL for its explicitly
      // approved typography branch, never a URL built from user input.
      const remote=branch==='feat/typography-qa-p0-p2-20261009'
        ? 'https://github.com/dohyunkimmm/footmate.git' : 'origin';
      execFileSync('git', [
        'fetch','--quiet','--no-tags','--depth=100',remote,
        '+refs/heads/main:refs/remotes/origin/main',
        '+refs/heads/'+branch+':refs/remotes/origin/'+branch
      ],gitOptions);
      start = execFileSync('git', ['merge-base','HEAD','refs/remotes/origin/main'],gitOptions).trim();
    }
    if (!start) throw new Error('Cannot determine preview merge base after fetching Git refs');
  }
  const output = execFileSync('git', ['diff', '--name-only', start, 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return output
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);
}

if (require.main === module) {
  try {
    const files = readChangedFiles();
    const deploy = requiresDeployment(files);
    console.log(`Changed files: ${files.join(', ') || '(none)'}`);
    console.log(deploy ? 'Production-impacting change: build required.' : 'Docs/QA-only change: skip Vercel build.');
    process.exit(deploy ? 1 : 0);
  } catch (error) {
    console.error(`Unable to classify Vercel build impact: ${error.message}`);
    console.error('Failing open so Production deployment is not accidentally skipped.');
    process.exit(1);
  }
}

module.exports = { isIgnorable, requiresDeployment };
