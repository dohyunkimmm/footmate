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
