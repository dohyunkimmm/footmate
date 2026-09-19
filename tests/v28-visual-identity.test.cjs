const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=process.env.FOOTMATE_SOURCE_DIR||path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('v2.8 promotes visual identity without changing legacy source ownership',()=>{
  const shell=read('demo-shell.html');
  const release=read('src/v2/v28-release.js');
  const identity=read('src/v2/ui/visual-identity-experience.js');
  const tokens=read('src/v2/styles/visual-tokens.css');
  const visual=read('src/v2/styles/visual-identity.css');
  const source=read('demo-source.html');
  const patch=read('footmate-patches.js');
  assert.ok(release.includes("const RELEASE_VERSION='2.8.0'"));
  assert.ok(release.includes('window.FootMateV28'));
  assert.ok(release.includes("runtime.releaseArchitecture='v2.8-visual-identity'"));
  assert.ok(release.includes("runtime.previousReleaseArchitecture='v2.7-visual-experience'"));
  assert.ok(identity.includes("architecture:'v2.8-visual-identity-experience'"));
  assert.ok(tokens.includes('--fm28-accent:#D3F36B'));
  assert.ok(visual.includes('FootMate v2.8 · Matchday Visual Identity'));
  assert.ok(shell.includes('/src/v2/styles/visual-tokens.css?v=20260919-1'));
  assert.ok(shell.includes('/src/v2/styles/visual-identity.css?v=20260919-1'));
  assert.ok(shell.includes('/src/v2/v28-release.js?v=20260919-1'));
  assert.equal(source.includes('fm28-'),false);
  assert.equal(patch.includes('FootMateV28'),false);
});

test('v2.8 preserves the v2.7 visual baseline and QA coverage',()=>{
  const bootstrap=read('src/v2/bootstrap.js');
  const workflow=read('.github/workflows/qa.yml');
  assert.ok(bootstrap.includes("const RELEASE_VERSION='2.7.0'"));
  assert.ok(bootstrap.includes('window.FootMateV27'));
  assert.ok(bootstrap.includes("releaseArchitecture:'v2.7-visual-experience'"));
  assert.ok(workflow.includes('node scripts/check-v27-boundary.cjs'));
  assert.ok(workflow.includes('node scripts/check-v28-boundary.cjs'));
  assert.ok(workflow.includes('tests/e2e/v27-visual-experience.spec.cjs'));
  assert.ok(workflow.includes('tests/e2e/v28-visual-identity.spec.cjs'));
});
