import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CONNECTED_PLATFORM_VERSION,DOMAIN_OWNERSHIP,JOURNEY_CONTRACT,evaluateJourneyConsistency} from '../../src/domain/journey.js';
import {createProviderRegistry} from '../../src/platform/infrastructure/providers.js';
import {createConnectedMatchdayPlatform} from '../../src/platform/application/connected-platform.js';

assert.equal(CONNECTED_PLATFORM_VERSION,'5.1.1');
assert.deepEqual(JOURNEY_CONTRACT,['Find','Decide','Join','Play','Return']);
assert.deepEqual(Object.keys(DOMAIN_OWNERSHIP),['recommendation','participation','matchday','return']);
const good=evaluateJourneyConsistency({recommendation:{selectedMatchId:'match-1'},participation:{status:'success',matchId:'match-1'},matchday:{status:'checked-in',matchId:'match-1'},returnState:{completed:true,matchId:'match-1',repeatIntent:true}});
assert.equal(good.valid,true);
const bad=evaluateJourneyConsistency({recommendation:{selectedMatchId:'match-1'},participation:{status:'success',matchId:'match-2'},matchday:{status:'checked-in',matchId:'match-2'},returnState:{completed:true,matchId:'match-3'}});
assert.equal(bad.valid,false);
assert.ok(bad.problems.includes('selected-participation-mismatch'));
assert.ok(bad.problems.includes('matchday-return-mismatch'));
const registry=createProviderRegistry();
assert.equal(registry.mode,'mock-only');
assert.deepEqual(registry.connectedNames,[]);
assert.deepEqual(registry.mockNames,['auth','payment','capacity','notification']);
assert.equal(registry.externalProductionFeatures,false);
assert.deepEqual(registry.productionClaims(),[]);
const simulated=await registry.execute('payment','authorize',{matchId:'match-1',amount:13000});
assert.equal(simulated.status,'simulated');
assert.equal(simulated.external,false);
const platform=createConnectedMatchdayPlatform();
assert.equal(platform.version,'5.1.1');
assert.equal(platform.architecture,'connected-capable');
assert.equal(platform.connectionMode,'mock-only');
assert.equal(platform.externalProductionFeatures,false);

const connectedBootstrap=await readFile(new URL('../../src/platform/presentation/connected-bootstrap.js',import.meta.url),'utf8');
assert.ok(connectedBootstrap.includes("import {footmatePlatform} from '../application/platform.js';"),'connected bootstrap must read browser state through platform ownership');
assert.equal(connectedBootstrap.includes('localStorage.getItem'),false,'connected bootstrap must not bypass the platform storage provider');
for(const legacyKey of ['footmate:v4:session','footmate:v4:participation','footmate:v4:matchday','footmate:v4:return']){
  assert.equal(connectedBootstrap.includes(legacyKey),false,`connected bootstrap must not own legacy storage key ${legacyKey}`);
}

const rootApp=await readFile(new URL('../../src/app/app.js',import.meta.url),'utf8');
assert.ok(rootApp.includes("import {footmatePlatform} from '../platform/application/platform.js';"),'root app must import platform session ownership');
assert.ok(rootApp.includes('footmatePlatform.session.read()'),'root app must read through platform session service');
assert.ok(rootApp.includes('footmatePlatform.session.write(state)'),'root app must persist through platform session service');
assert.equal(/\blocalStorage\b/.test(rootApp),false,'root app must not access browser localStorage directly');
assert.equal(rootApp.includes('NEXT_STORAGE_KEY'),false,'root app must not own the legacy session storage key constant');
assert.equal(rootApp.includes('footmate:v4:'),false,'root app must not own legacy storage keys');

for(const [path,repositoryName] of [
  ['../../src/app/discovery.js','discovery'],
  ['../../src/app/decision.js','decision'],
  ['../../src/app/participation.js','participation'],
  ['../../src/app/matchday.js','matchday'],
  ['../../src/app/return.js','returnLoop'],
  ['../../src/app/personalization.js','personalization'],
  ['../../src/app/experience.js','interaction']
]){
  const source=await readFile(new URL(path,import.meta.url),'utf8');
  assert.ok(source.includes("import {footmatePlatform} from '../platform/application/platform.js';"),`${path} must import platform ownership`);
  assert.ok(source.includes(`footmatePlatform.repositories.${repositoryName}`),`${path} must use ${repositoryName} repository`);
  assert.equal(/\blocalStorage\b/.test(source),false,`${path} must not access browser localStorage directly`);
  assert.equal(source.includes('footmate:v4:'),false,`${path} must not own legacy storage keys`);
}

// The live Case Study is now a nine-section strategy report, not the retired
// 13-slide connected-platform presentation. Verify real production copy.
const caseStudy=await readFile(new URL('../../src/case-study/nine-sections.js',import.meta.url),'utf8');
const caseSections=[...caseStudy.matchAll(/^\s+"name": "([^"]+)"/gm)].map(match=>match[1]);
assert.deepEqual(caseSections,[
  '추진 배경·검토 결론',
  '시장·경쟁 분석',
  '사업모델·역할',
  '수요·공급 시나리오',
  '수익성·손익분기점',
  'IT 투자·시스템 구조',
  '운영 안정성·통제',
  '실행계획·성과관리',
  '종합 판단·근거'
]);
for(const required of [
  '초기 모델은 운영자 제휴형',
  '결제·정산은 후속',
  '실제 결제·환불·운영자 정산',
  '동시 요청',
  '기회비용',
  '데이터 정정',
  'PPT 9장'
])assert.ok(caseStudy.includes(required),`missing current strategy Case Study boundary copy: ${required}`);

console.log('PASS connected platform contracts');

