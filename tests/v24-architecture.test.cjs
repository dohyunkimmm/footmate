const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=process.env.FOOTMATE_SOURCE_DIR||path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('v2.4 keeps new core funnel markup out of the legacy demo source',()=>{
  const source=read('demo-source.html');
  const components=read('src/v2/demo/core-funnel-components.js');
  const experience=read('src/v2/ui/core-funnel-experience.js');
  const boundary=read('scripts/check-v24-boundary.cjs');
  for(const id of ['s-home','s-filter','s-results','s-detail','s-pay']){
    assert.equal(source.split(`id="${id}"`).length-1,1,`${id} must remain a single legacy source screen`);
    assert.ok(components.includes(`'${id}'`));
  }
  assert.equal(source.includes('fm24-'),false);
  assert.ok(experience.includes("componentSource:'src/v2/demo/core-funnel-components.js'"));
  assert.ok(boundary.includes("if(source.includes('fm24-'))"));
});

test('v2.4 promotes the core funnel experience while preserving older release aliases',()=>{
  const bootstrap=read('src/v2/bootstrap.js');
  const shell=read('demo-shell.html');
  assert.ok(bootstrap.includes("const PREVIOUS_RELEASE_VERSION='2.3.0'"));
  assert.ok(bootstrap.includes("const RELEASE_VERSION='2.4.0'"));
  assert.ok(bootstrap.includes("document.documentElement.dataset.footmateRelease='2.4'"));
  assert.ok(bootstrap.includes('window.FootMateV24'));
  assert.ok(bootstrap.includes("architecture:'v2.4-core-funnel-experience'"));
  assert.ok(bootstrap.includes("releaseArchitecture:'v2.4-core-funnel-experience'"));
  assert.ok(bootstrap.includes("previousReleaseArchitecture:'v2.3-compatibility-boundary-reduction'"));
  assert.ok(bootstrap.includes('window.FootMateV23'));
  assert.ok(bootstrap.includes('window.FootMateV22'));
  assert.ok(bootstrap.includes("'footmate:v2.4:ready'"));
  assert.ok(shell.includes('/src/v2/styles/core-funnel.css?v=20260918-1'));
  assert.ok(shell.includes('/src/v2/bootstrap.js?v=20260918-9'));
});

test('v2.4 moves detail presentation into the v2 presenter boundary',()=>{
  const presenter=read('src/v2/ui/scenario-presenter.js');
  assert.ok(presenter.includes("new Set(['s-filter','s-results','s-reason','s-detail'])"));
  assert.ok(presenter.includes('function renderDetail(state)'));
  assert.ok(presenter.includes("architecture:'v2.4-core-funnel-presenter'"));
  assert.ok(presenter.includes("setText('detail-team-name'"));
  assert.ok(presenter.includes("setText('detail-open-position'"));
});

test('v2.4 QA keeps required check keys stable and adds the new architecture/browser gate',()=>{
  const workflow=read('.github/workflows/qa.yml');
  assert.ok(workflow.includes('name: Regression 36'));
  assert.ok(workflow.includes('name: Browser E2E + axe'));
  assert.ok(workflow.includes('node scripts/check-v24-boundary.cjs'));
  assert.ok(workflow.includes('tests/e2e/v24-core-funnel.spec.cjs'));
});
