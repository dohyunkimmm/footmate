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

  const output = execFileSync('git', ['diff', '--name-only', 'HEAD^', 'HEAD'], {
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
