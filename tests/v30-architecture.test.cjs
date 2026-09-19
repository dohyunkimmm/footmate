const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

function read(path){return fs.readFileSync(path,'utf8')}

const release=read('src/v3/release.js');
const navigation=read('src/v3/ia/navigation.js');
const viewState=read('src/v3/state/view-state.js');
const appShell=read('src/v3/app-shell.js');
const shell=read('demo-shell.html');
const shellCss=read('src/v3/styles/app-shell.css');
const componentCss=read('src/v3/styles/components.css');

test('v3.0 promotes a new app runtime while preserving the v2.8 domain baseline',()=>{
  assert.match(release,/RELEASE_VERSION='3\.0\.0'/);
  assert.match(release,/PREVIOUS_RELEASE_VERSION='2\.8\.0'/);
  assert.match(release,/SCHEMA_VERSION='2\.1\.0'/);
  assert.match(release,/window\.FootMateV3Runtime=runtime/);
  assert.match(release,/window\.FootMateV30=/);
  assert.match(release,/baseRuntime:baseRuntime|baseRuntime,/);
  assert.match(release,/scenarioStore:baseRuntime\.scenarioStore/);
  assert.match(release,/decisionEngine:baseRuntime\.decisionEngine/);
  assert.match(release,/availabilityGateway:baseRuntime\.availabilityGateway/);
  assert.match(release,/stateCompatibility:'v2\.1-domain-state-preserved'/);
});

test('v3.0 IA has four primary destinations with stable entry targets',()=>{
  const ids=[...navigation.matchAll(/id:'([^']+)'/g)].map(match=>match[1]).filter(id=>['discover','recommendations','participation','profile'].includes(id));
  assert.deepEqual([...new Set(ids)],['discover','recommendations','participation','profile']);
  assert.match(navigation,/id:'discover'[\s\S]*?target:'s-home'/);
  assert.match(navigation,/id:'recommendations'[\s\S]*?target:'s-results'/);
  assert.match(navigation,/id:'participation'[\s\S]*?target:'s-pay'/);
  assert.match(navigation,/id:'profile'[\s\S]*?target:'s-profile'/);
});

test('v3.0 view state is isolated from product domain persistence',()=>{
  assert.match(viewState,/VIEW_STATE_VERSION='3\.0\.0'/);
  assert.match(viewState,/VIEW_STATE_KEY='footmate:v3:view'/);
  assert.doesNotMatch(viewState,/scenarioStore|decisionEngine|matching-engine|elo-engine|payment/i);
  assert.match(appShell,/createViewState\(currentDestination\)/);
  assert.match(appShell,/runtime\.scenarioStore/);
});

test('v3.0 shell is loaded after v2.8 and owns responsive navigation chrome',()=>{
  assert.ok(shell.indexOf('/src/v2/v28-release.js')<shell.indexOf('/src/v3/release.js'));
  for(const asset of ['/src/v3/styles/tokens.css','/src/v3/styles/app-shell.css','/src/v3/styles/components.css'])assert.ok(shell.includes(asset));
  assert.match(shellCss,/grid-template-rows:minmax\(0,1fr\) 72px/);
  assert.match(shellCss,/@media\(min-width:800px\)/);
  assert.match(shellCss,/width:min\(560px,calc\(100vw - 48px\)\)/);
  assert.match(shellCss,/grid-template-columns:104px minmax\(0,1fr\)/);
  assert.match(shellCss,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(componentCss,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(componentCss,/min-height:52px/);
});

test('v3.0 does not override v2.8 legacy screen color, typography or surface geometry',()=>{
  assert.doesNotMatch(shellCss,/\.screen\{[^}]*background/s);
  assert.doesNotMatch(shellCss,/\.pcnt\{/);
  assert.doesNotMatch(shellCss,/\.nbar\{/);
  assert.doesNotMatch(shellCss,/\.nbar-title\{/);
  assert.doesNotMatch(componentCss,/:is\(\.fm24-panel,\.fm25-panel\)/);
  assert.doesNotMatch(componentCss,/#s-home \.fm24-home-decision/);
  assert.doesNotMatch(componentCss,/#s-results \.fm25-compare-grid/);
  assert.match(componentCss,/v2\.8 remains the visual owner of legacy screens/);
});
