const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=process.env.FOOTMATE_SOURCE_DIR||path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('v2.5 promotes decision and recovery ownership while preserving compatibility',()=>{
  const bootstrap=read('src/v2/bootstrap.js');
  const engine=read('src/v2/domain/decision-engine.js');
  const components=read('src/v2/demo/decision-recovery-components.js');
  const experience=read('src/v2/ui/decision-recovery-experience.js');
  const payment=read('src/v2/ui/payment-controller.js');
  const shell=read('demo-shell.html');
  assert.ok(bootstrap.includes("const RELEASE_VERSION='2.5.0'"));
  assert.ok(bootstrap.includes("const PREVIOUS_RELEASE_VERSION='2.4.0'"));
  assert.ok(bootstrap.includes('window.FootMateV25'));
  assert.ok(bootstrap.includes("releaseArchitecture:'v2.5-decision-recovery-experience'"));
  assert.ok(bootstrap.includes("previousReleaseArchitecture:'v2.4-core-funnel-experience'"));
  assert.ok(bootstrap.includes("'footmate:v2.5:ready'"));
  assert.ok(bootstrap.includes('window.FootMateV24'));
  assert.ok(bootstrap.includes('window.FootMateV23'));
  assert.ok(bootstrap.includes('window.FootMateV22'));
  assert.ok(engine.includes("architecture:'v2.5-decision-recovery-engine'"));
  assert.ok(engine.includes('traceId'));
  assert.ok(engine.includes("submission:'block'"));
  assert.ok(components.includes('createComparisonBoard'));
  assert.ok(components.includes('createPreflightCard'));
  assert.ok(experience.includes("architecture:'v2.5-decision-recovery-experience'"));
  assert.ok(experience.includes("componentSource:'src/v2/demo/decision-recovery-components.js'"));
  assert.ok(payment.includes("'footmate:v2.5:decision-blocked'"));
  assert.ok(payment.includes("guard?.submission==='block'"));
  assert.ok(shell.includes('/src/v2/styles/decision-recovery.css?v=20260919-1'));
  assert.ok(shell.includes('/src/v2/bootstrap.js?v=20260919-1'));
});

test('v2.5 keeps component markup out of the canonical legacy source',()=>{
  const source=read('demo-source.html');
  const boundary=read('scripts/check-v25-boundary.cjs');
  assert.equal(source.includes('fm25-'),false);
  assert.ok(boundary.includes("if(source.includes('fm25-'))"));
});

test('v2.5 keeps required check names stable and adds its browser gate',()=>{
  const workflow=read('.github/workflows/qa.yml');
  assert.ok(workflow.includes('name: Regression 36'));
  assert.ok(workflow.includes('name: Browser E2E + axe'));
  assert.ok(workflow.includes('node scripts/check-v25-boundary.cjs'));
  assert.ok(workflow.includes('tests/e2e/v25-decision-recovery.spec.cjs'));
});
