'use strict';

// Classification for the Cloudflare Workers deployment gate.
// Strict Case Study allowlist: mixed and uncertain changes retain the full product QA.
const docsOnly = file => file === 'README.md' || file.startsWith('docs/') || file === '.github/pull_request_template.md' || file.endsWith('.md');
function caseStudyOnly(files) {
  if (!Array.isArray(files) || !files.length || files.some(f=>typeof f!=='string'||!f.trim())) return false;
  const caseFile = f => f === 'index.html' || f.startsWith('src/case-study/') || f === 'tests/e2e/case-study-eleven-stages.spec.cjs';
  return files.some(caseFile) && files.every(f=>caseFile(f)||docsOnly(f));
}
// Fail open on missing/empty file lists: never silently skip runtime QA or deployment.
function classify(files) {
  if (!Array.isArray(files) || files.length === 0 ||
      files.some(file => typeof file !== 'string' || !file.trim())) {
    return { runtime: true, production: true, production_smoke: true };
  }

  // QA-only changes still run regression, but do not rebuild the public Worker.
  const noProductionImpact = file =>
    docsOnly(file) ||
    file.startsWith('tests/') ||
    file.startsWith('.github/') ||
    file === 'playwright.config.cjs';

  const smokeContractChange = file =>
    /^tests\/production-[^/]+\.cjs$/.test(file) ||
    file === 'tests/e2e/production-app.spec.cjs' ||
    /^tests\/e2e\/beta-production-[^/]+\.spec\.cjs$/.test(file) ||
    file === 'tests/e2e/helpers/priority-ux.cjs' ||
    file === 'tests/e2e/release-app.spec.cjs' ||
    file === '.github/workflows/qa.yml';

  const runtime = files.some(file => !docsOnly(file));
  const production = files.some(file => !noProductionImpact(file));
  const production_smoke = production || files.some(smokeContractChange);
  return { runtime, production, production_smoke };
}

function parseChangedFiles(input) {
  if (typeof input !== 'string' || !input.trim()) return [];
  return input.split(/\r?\n/).filter(Boolean);
}

if (require.main === module) {
  const result = classify(parseChangedFiles(process.env.FOOTMATE_CHANGED_FILES));
  for (const [key, value] of Object.entries(result)) {
    process.stdout.write(`${key}=${value}\n`);
  }
  process.stdout.write(`case_study_only=${caseStudyOnly(parseChangedFiles(process.env.FOOTMATE_CHANGED_FILES))}\n`);
}

module.exports = { classify, caseStudyOnly, parseChangedFiles };
