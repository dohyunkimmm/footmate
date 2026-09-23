import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CONNECTED_PLATFORM_VERSION,DOMAIN_OWNERSHIP,JOURNEY_CONTRACT,evaluateJourneyConsistency} from '../../src/v5/domain/journey.js';
import {createProviderRegistry} from '../../src/v5/infrastructure/providers.js';
import {createConnectedMatchdayPlatform} from '../../src/v5/application/connected-platform.js';

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

const v5Bootstrap=await readFile(new URL('../../src/v5/presentation/bootstrap.js',import.meta.url),'utf8');
assert.ok(v5Bootstrap.includes("import {footmatePlatform} from '../../v4/platform/application/platform.js';"),'v5 bootstrap must read browser state through platform ownership');
assert.equal(v5Bootstrap.includes('localStorage.getItem'),false,'v5 bootstrap must not bypass the platform storage provider');
for(const legacyKey of ['footmate:v4:session','footmate:v4:participation','footmate:v4:matchday','footmate:v4:return']){
  assert.equal(v5Bootstrap.includes(legacyKey),false,`v5 bootstrap must not own legacy storage key ${legacyKey}`);
}

const rootApp=await readFile(new URL('../../src/v4/app.js',import.meta.url),'utf8');
assert.ok(rootApp.includes("import {footmatePlatform} from './platform/application/platform.js';"),'root app must import platform session ownership');
assert.ok(rootApp.includes('footmatePlatform.session.read()'),'root app must read through platform session service');
assert.ok(rootApp.includes('footmatePlatform.session.write(state)'),'root app must persist through platform session service');
assert.equal(/\blocalStorage\b/.test(rootApp),false,'root app must not access browser localStorage directly');
assert.equal(rootApp.includes('NEXT_STORAGE_KEY'),false,'root app must not own the legacy session storage key constant');
assert.equal(rootApp.includes('footmate:v4:'),false,'root app must not own legacy storage keys');

for(const [path,repositoryName] of [
  ['../../src/v4/discovery.js','discovery'],
  ['../../src/v4/decision.js','decision'],
  ['../../src/v4/participation.js','participation'],
  ['../../src/v4/matchday.js','matchday'],
  ['../../src/v4/return.js','returnLoop'],
  ['../../src/v4/personalization.js','personalization'],
  ['../../src/v4/experience.js','interaction']
]){
  const source=await readFile(new URL(path,import.meta.url),'utf8');
  assert.ok(source.includes("import {footmatePlatform} from './platform/application/platform.js';"),`${path} must import platform ownership`);
  assert.ok(source.includes(`footmatePlatform.repositories.${repositoryName}`),`${path} must use ${repositoryName} repository`);
  assert.equal(/\blocalStorage\b/.test(source),false,`${path} must not access browser localStorage directly`);
  assert.equal(source.includes('footmate:v4:'),false,`${path} must not own legacy storage keys`);
}

const caseStudy=await readFile(new URL('../../src/v5/case-study-connected.js',import.meta.url),'utf8');
for(const required of [
  "['Overview','AI Match Assistant']",
  "['Product Thesis','One Continuous Decision Flow']",
  "['Sign in · Join','Preserve Context Through Participation']",
  "['Domain · AI Boundary','Ownership, Providers, and Guardrails']",
  "['Production Boundary','Only Connected and Verified Capabilities']",
  'visibleSourceIndexes=[0,1,2,3,5,6,7,8,10,11,12,14,15]',
  'Real App의 인증·결제는 시뮬레이션',
  'Closed Beta의 인증·참가 경로는 Supabase에 실제 연결됩니다.',
  '결정론적 추천 엔진',
  'Google/Kakao OAuth',
  'Resend',
  'Web Push',
  'Storage',
  '실제 PG와 외부 분석 도구는 미연동입니다.',
  '사람 검수 (Human QA)',
  'AI 보조 검수 (AI-assisted QA)'
])assert.ok(caseStudy.includes(required),`missing current product boundary copy: ${required}`);

for(const stale of [
  "['개요','AI Match Assistant']",
  "['도메인 구조','recommendation · participation · matchday · return']",
  "['외부 연동 · AI 경계','실연동 · 시뮬레이션 · HITL 경계']",
  "['Production 범위','실제 연결·검증된 기능만 표기']",
  '외부 AI 모델, 회원 DB, 실시간 정원, 실제 결제, 알림 backend는 연결하지 않았습니다.',
  'OAuth · 회원 DB · PG · 실시간 정원 · 알림 backend',
  'sample records',
  'connected data path',
  'external analytics는 미연동입니다.'
])assert.equal(caseStudy.includes(stale),false,`stale Case Study boundary copy must be removed: ${stale}`);

console.log('PASS v5.1.1 connected platform contracts');
