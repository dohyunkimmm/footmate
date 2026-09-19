const fs=require('node:fs');

function read(path){return fs.readFileSync(path,'utf8')}
function assert(condition,message){if(!condition)throw new Error(message)}

const shell=read('demo-shell.html');
const release=read('src/v3/release.js');
const appShell=read('src/v3/app-shell.js');
const navigation=read('src/v3/ia/navigation.js');
const viewState=read('src/v3/state/view-state.js');
const appNav=read('src/v3/components/app-navigation.js');
const tokens=read('src/v3/styles/tokens.css');
const shellCss=read('src/v3/styles/app-shell.css');
const componentsCss=read('src/v3/styles/components.css');
const legacySource=read('demo-source.html');
const legacyPatch=read('footmate-patches.js');
const caseStudy=read('index-experience.js');
const caseStudyPatches=read('index-patches.js');

for(const asset of [
  '/src/v3/styles/tokens.css',
  '/src/v3/styles/app-shell.css',
  '/src/v3/styles/components.css',
  '/src/v3/release.js'
])assert(shell.includes(asset),`demo shell missing ${asset}`);
assert(shell.indexOf('/src/v2/v28-release.js')<shell.indexOf('/src/v3/release.js'),'v3 release must load after v2.8 baseline');

for(const marker of [
  "RELEASE_VERSION='3.0.0'",
  "PREVIOUS_RELEASE_VERSION='2.8.0'",
  "SCHEMA_VERSION='2.1.0'",
  'FootMateV3Runtime',
  'FootMateV30',
  "releaseArchitecture:'v3.0-unified-app-architecture'",
  "stateCompatibility:'v2.1-domain-state-preserved'"
])assert(release.includes(marker),`v3 release missing ${marker}`);

for(const id of ['discover','recommendations','participation','profile'])assert(navigation.includes(`id:'${id}'`),`v3 IA missing ${id}`);
assert(navigation.includes('PRIMARY_DESTINATIONS'),'v3 primary destination registry missing');
assert(navigation.includes("target:'s-home'"),'discover destination target missing');
assert(navigation.includes("target:'s-results'"),'recommendations destination target missing');
assert(navigation.includes("target:'s-pay'"),'participation destination target missing');
assert(navigation.includes("target:'s-profile'"),'profile destination target missing');

assert(viewState.includes("VIEW_STATE_KEY='footmate:v3:view'"),'v3 view state key missing');
assert(!viewState.includes('scenarioStore'),'v3 view state must not own domain scenario state');
assert(!viewState.includes('matching-engine'),'v3 view state must not own matching domain');
assert(!viewState.includes('elo-engine'),'v3 view state must not own ELO domain');

for(const marker of ['createAppNavigation','createViewState','MutationObserver','scenarioStore'])assert(appShell.includes(marker),`v3 app shell missing ${marker}`);
assert(appShell.includes("architecture:'v3.0-unified-app-shell'"),'v3 app shell architecture marker missing');
assert(appShell.includes("componentArchitecture:'v3.0-reusable-component-system'"),'v3 component architecture marker missing');
assert(appNav.includes("aria-label','FootMate 주요 메뉴'"),'v3 navigation accessibility label missing');
assert(appNav.includes("aria-current','page'"),'v3 active navigation semantics missing');

assert(tokens.includes('FootMate v3.0'),'v3 token marker missing');
assert(shellCss.includes('@media(min-width:800px)'),'v3 desktop app-shell breakpoint missing');
assert(shellCss.includes('@media(prefers-reduced-motion:reduce)'),'v3 reduced-motion guard missing');
assert(componentsCss.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'v3 four-destination mobile navigation layout missing');
assert(componentsCss.includes('min-height:52px'),'v3 mobile touch target floor missing');

for(const source of [legacySource,legacyPatch]){
  assert(!source.includes('FootMateV30'),'v3 runtime ownership leaked into legacy source');
  assert(!source.includes('/src/v3/'),'v3 module ownership leaked into legacy source');
  assert(!source.includes('fm30-'),'v3 component ownership leaked into legacy source');
}

assert(caseStudy.includes('V3.0 · UNIFIED APP ARCHITECTURE'),'case study v3 release badge missing');
for(const label of ['탐색','추천','참가','내 정보'])assert(caseStudyPatches.includes(label),`case study IA missing ${label}`);

console.log('v3.0 architecture boundary: PASS');
