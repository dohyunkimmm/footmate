import assert from 'node:assert/strict';
import {matchesRecommendationConditions as eligible,pickUnseenRecommendation as pick} from '../../src/beta/domain/recommendation-discovery.js';
const now=Date.parse('2026-10-26T00:00:00Z');
const match={id:'a',status:'open',remaining_spots:2,starts_at:'2026-10-27T20:00:00+09:00',region:'수원 · 영통',level:'입문',positions:['MF','GK'],match_slots:[{position:'MF',remaining_spots:2},{position:'GK',remaining_spots:0}],price_krw:0};
const conditions={region:'수원 · 영통',level:'입문',position:'MF',afterTime:'20:00'};
assert.ok(eligible(match,conditions,now));
for(const patch of [{status:'full'},{remaining_spots:0},{starts_at:'2000-01-01T00:00:00Z'},{starts_at:'invalid'},{region:'서울 · 강남'},{level:'중급'},{positions:['GK']},{match_slots:[{position:'MF',remaining_spots:0}]}])assert.equal(eligible({...match,...patch},conditions,now),false,JSON.stringify(patch));
assert.equal(eligible(match,{...conditions,afterTime:'20:01'},now),false);
assert.equal(eligible(match,{position:'GK'},now),false);
assert.ok(eligible(match,{},now));
const ids=['a','b','c','d'];
for(const sample of [0,0.2,0.5,0.999999]){
 const seen=new Set(['a']);
 for(let i=0;i<ids.length-1;i++){const next=pick(ids,seen,()=>sample);assert.ok(ids.includes(next));assert.ok(!seen.has(next));seen.add(next)}
 assert.equal(pick(ids,seen),null);
}
assert.equal(pick([],new Set()),null);
assert.equal(pick(['a'],new Set(['a'])),null);
assert.equal(pick(['a','a','b'],new Set(['a']),()=>0),'b');
// Catalog fidelity and every supported filter combination remain exercisable.
globalThis.location={pathname:'/demo'};globalThis.localStorage={getItem:()=>null};
const {demoCatalog}=await import('../../src/beta/demo-catalog.js');
const catalog=demoCatalog('',now);
assert.equal(catalog.find(m=>m.title==='영통 초보 풋살').level,'입문');
for(const region of ['수원 · 영통','수원 · 인계','용인 · 기흥','서울 · 강남'])for(const level of ['입문','초중급','중급','중급+'])for(const position of ['MF','FW','DF','GK'])assert.ok(catalog.some(m=>eligible(m,{region,level,position,afterTime:'20:00'},now)),`${region}/${level}/${position}`);
console.log('PASS candidate availability, exact filters, Seoul time, unseen weighted draws, exhaustion, and all demo filter combinations');

const {recommendationFingerprint:fingerprint,validRecommendationCache:valid,diverseRecommendationCandidates:shortlist,RECOMMENDATION_CACHE_TTL_MS:ttl}=await import('../../src/beta/domain/recommendation-discovery.js');
const boundary=Date.parse('2026-10-26T15:00:00Z'); // Tuesday 00:00 Seoul
const dated=(when)=>({...match,starts_at:when});
assert.ok(eligible(dated('2026-10-27T01:00:00+09:00'),{dateWindow:'today'},boundary));
assert.equal(eligible(dated('2026-10-28T01:00:00+09:00'),{dateWindow:'today'},boundary),false);
assert.ok(eligible(dated('2026-10-28T01:00:00+09:00'),{dateWindow:'tomorrow'},boundary));
assert.ok(eligible(dated('2026-10-31T20:00:00+09:00'),{dateWindow:'weekend'},boundary));
assert.equal(eligible(dated('2026-10-30T20:00:00+09:00'),{dateWindow:'weekend'},boundary),false);
assert.ok(eligible(dated('2026-11-01T20:00:00+09:00'),{dateWindow:'weekend'},Date.parse('2026-11-01T00:00:00+09:00')));
assert.equal(eligible(match,{afterTime:'20:00',beforeTime:'20:00'},now),false);
assert.equal(eligible(match,{beforeTime:'20:00'},now),false);
assert.ok(eligible(match,{afterTime:'20:00',beforeTime:'22:00'},now));
const key=fingerprint([match],conditions,now),cache={ids:['a'],createdAt:now,fingerprint:key};
assert.ok(valid(cache,key,now+ttl-1));assert.equal(valid(cache,key,now+ttl),false);
assert.equal(valid(cache,key,now-1),false);assert.equal(valid({ids:['a']},key,now),false);
assert.notEqual(fingerprint([{...match,remaining_spots:1}],conditions,now),key);
assert.notEqual(fingerprint([match],{...conditions,dateWindow:'today'},now),key);
const grouped=[...Array.from({length:15},(_,i)=>({m:{id:'a'+i,venue_name:'A'}})),{m:{id:'b',venue_name:'B'}},{m:{id:'c',venue_name:'C'}}];
const chosen=shortlist(grouped);assert.equal(chosen.length,12);assert.deepEqual(chosen.slice(0,3).map(x=>x.m.id),['a0','b','c']);
console.log('PASS Seoul date boundaries/weekend, exclusive upper time, cache expiry/catalog invalidation, venue-diverse shortlist');

const {createDiscoveryMeasurement}=await import('../../src/beta/measurement-events.js');
const measured=createDiscoveryMeasurement('recommendation_completed',{resultCount:7,email:'private',region:'private',mode:'ai'},'demo');
assert.equal(measured.source,'demo');assert.equal(measured.cohort,'demo');assert.equal(measured.email,undefined);assert.equal(measured.region,undefined);assert.equal(measured.resultCount,7);
assert.equal(createDiscoveryMeasurement('filters_applied',{},'beta').cohort,'unclassified');
assert.throws(()=>createDiscoveryMeasurement('arbitrary'),/Unsupported/);
