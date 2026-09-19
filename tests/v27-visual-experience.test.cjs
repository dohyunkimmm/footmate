const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=process.env.FOOTMATE_SOURCE_DIR||path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('v2.7 owns visual experience without leaking into legacy sources',()=>{
  const bootstrap=read('src/v2/bootstrap.js');
  const shell=read('demo-shell.html');
  const visual=read('src/v2/styles/visual-experience.css');
  const source=read('demo-source.html');
  const patch=read('footmate-patches.js');
  assert.ok(bootstrap.includes("const RELEASE_VERSION='2.7.0'"));
  assert.ok(bootstrap.includes('window.FootMateV27'));
  assert.ok(bootstrap.includes("releaseArchitecture:'v2.7-visual-experience'"));
  assert.ok(bootstrap.includes("visualOwnership:'src/v2/styles/visual-experience.css'"));
  assert.ok(shell.includes('/src/v2/styles/visual-experience.css?v=20260919-1'));
  assert.ok(visual.includes('FootMate v2.7 · Visual Experience'));
  assert.ok(visual.includes('html[data-footmate-release="2.7"] .fm24-panel'));
  assert.ok(visual.includes('html[data-footmate-release="2.7"] .fm25-panel'));
  assert.ok(visual.includes('@media(max-width:340px)'));
  assert.ok(visual.includes('@media(prefers-reduced-motion:reduce)'));
  assert.equal(source.includes('fm27-'),false);
  assert.equal(patch.includes('FootMateV27'),false);
});

test('v2.7 keeps the v2.6 architecture baseline and stable QA keys',()=>{
  const bootstrap=read('src/v2/bootstrap.js');
  const workflow=read('.github/workflows/qa.yml');
  assert.ok(bootstrap.includes("const V26_RELEASE_VERSION='2.6.0'"));
  assert.ok(bootstrap.includes("previousReleaseArchitecture:'v2.6-architecture-hardening'"));
  assert.ok(bootstrap.includes("architecture:'v2.6-architecture-hardening'"));
  assert.ok(workflow.includes('name: Regression 36'));
  assert.ok(workflow.includes('name: Browser E2E + axe'));
  assert.ok(workflow.includes('node scripts/check-v27-boundary.cjs'));
  assert.ok(workflow.includes('tests/e2e/v27-visual-experience.spec.cjs'));
});
