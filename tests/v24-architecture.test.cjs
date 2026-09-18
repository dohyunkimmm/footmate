const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=process.env.FOOTMATE_SOURCE_DIR||path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('v2.4 core funnel remains available as a compatibility layer under v2.6',()=>{
  const source=read('demo-source.html');
  const components=read('src/v2/demo/core-funnel-components.js');
  const experience=read('src/v2/ui/core-funnel-experience.js');
  const bootstrap=read('src/v2/bootstrap.js');
  const shell=read('demo-shell.html');
  for(const id of ['s-home','s-filter','s-results','s-detail','s-pay']){
    assert.equal(source.split(`id="${id}"`).length-1,1);
    assert.ok(components.includes(`'${id}'`));
  }
  assert.equal(source.includes('fm24-'),false);
  assert.ok(experience.includes("architecture:'v2.4-core-funnel-experience'"));
  assert.ok(bootstrap.includes("const V24_RELEASE_VERSION='2.4.0'"));
  assert.ok(bootstrap.includes("const V25_RELEASE_VERSION='2.5.0'"));
  assert.ok(bootstrap.includes("const RELEASE_VERSION='2.6.0'"));
  assert.ok(bootstrap.includes('window.FootMateV24'));
  assert.ok(bootstrap.includes("architecture:'v2.4-core-funnel-experience'"));
  assert.ok(bootstrap.includes('compatibility:true'));
  assert.ok(bootstrap.includes("'footmate:v2.4:ready'"));
  assert.ok(shell.includes('/src/v2/styles/core-funnel.css?v=20260919-1'));
});

test('v2.4 presenter ownership is preserved under v2.6',()=>{
  const presenter=read('src/v2/ui/scenario-presenter.js');
  assert.ok(presenter.includes("new Set(['s-filter','s-results','s-reason','s-detail'])"));
  assert.ok(presenter.includes("architecture:'v2.4-core-funnel-presenter'"));
});

test('required check keys remain stable while v2.6 extends QA',()=>{
  const workflow=read('.github/workflows/qa.yml');
  assert.ok(workflow.includes('name: Regression 36'));
  assert.ok(workflow.includes('name: Browser E2E + axe'));
  assert.ok(workflow.includes('node scripts/check-v24-boundary.cjs'));
  assert.ok(workflow.includes('node scripts/check-v25-boundary.cjs'));
  assert.ok(workflow.includes('node scripts/check-v26-boundary.cjs'));
});
