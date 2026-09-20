import assert from 'node:assert/strict';
import {EVENT_NAMES,PLATFORM_VERSION,SESSION_SCHEMA_VERSION} from '../../src/v4/platform/domain/contracts.js';
import {ACCESSIBILITY_CONTRACT,ANALYTICS_CONTRACT,EVENT_CATALOG,IA_CONTRACT,PERFORMANCE_BUDGET,PROVIDER_CONTRACTS,RELEASE_CANDIDATE_VERSION,rehearseSessionMigration} from '../../src/v4/platform/domain/release-candidate.js';
import {createProviderMocks} from '../../src/v4/platform/infrastructure/provider-mocks.js';
import {createReleaseCandidateGate} from '../../src/v4/platform/application/release-candidate.js';

assert.equal(PLATFORM_VERSION,'4.9.0');
assert.equal(RELEASE_CANDIDATE_VERSION,'4.9.0');
assert.equal(SESSION_SCHEMA_VERSION,2);
assert.deepEqual(IA_CONTRACT.map(item=>item.route),['welcome','setup','home','discover','detail','auth','checkout','success','schedule','profile']);
assert.deepEqual(Object.keys(EVENT_CATALOG),EVENT_NAMES);
assert.equal(ANALYTICS_CONTRACT.delivery,'local-only');
assert.equal(ANALYTICS_CONTRACT.externalAnalytics,false);
assert.deepEqual(ACCESSIBILITY_CONTRACT.widths,[320,375,390,430]);
assert.equal(ACCESSIBILITY_CONTRACT.seriousOrCriticalViolations,0);
assert.equal(PERFORMANCE_BUDGET.firstPartyAssetRequests,24);

const providers=createProviderMocks();
for(const [name,contract] of Object.entries(PROVIDER_CONTRACTS))for(const method of contract.methods)assert.equal(typeof providers[name][method],'function',`${name}.${method}`);
const auth=await providers.auth.signIn({user:'sample'});assert.equal(auth.status,'simulated');assert.equal(auth.external,false);assert.equal(providers.auth.calls().length,1);
const payment=await providers.payment.authorize({matchId:'gwanggyo-2130',amount:13000});assert.equal(payment.status,'simulated');assert.equal(payment.external,false);

const legacy={route:'home',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',legacyFlag:'preserve'};
const rehearsal=rehearseSessionMigration(legacy);assert.equal(rehearsal.migration.toVersion,2);assert.equal(rehearsal.migration.state.schemaVersion,2);assert.equal(rehearsal.migration.state.legacyFlag,'preserve');assert.equal(rehearsal.rollbackMatches,true);assert.deepEqual(rehearsal.rolledBack,legacy);

const gate=createReleaseCandidateGate({providers});assert.equal(gate.readyForV5,true);assert.equal(gate.providerMode,'mock-only');assert.equal(gate.externalProviders,false);assert.equal(gate.externalAnalytics,false);assert.equal(gate.rehearseMigration(legacy).rollbackMatches,true);
console.log('PASS v4.9 release candidate contracts');
