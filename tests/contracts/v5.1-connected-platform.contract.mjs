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

const caseStudy=await readFile(new URL('../../src/v5/case-study-connected.js',import.meta.url),'utf8');
for(const required of [
  '/app의 auth/payment/capacity/notification provider는 deterministic mock',
  '/beta는 Supabase Auth·Postgres·RLS·atomic RPC',
  '/beta/operator는 allowlist 운영 경로',
  '실제 PG·notification delivery·external analytics는 아직 연결하지 않았습니다.',
  'account deletion boundary',
  '물리 기기와 수동 접근성 점검은 별도 manual QA'
])assert.ok(caseStudy.includes(required),`missing current product boundary copy: ${required}`);

console.log('PASS v5.1.1 connected platform contracts');
