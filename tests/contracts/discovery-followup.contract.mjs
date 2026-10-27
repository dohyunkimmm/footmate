import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeReactions,personalizeRecommendations,chooseOpeningVariant} from '../../src/beta/domain/discovery-followup.js';
import {configureDiscoveryTransport,setDiscoveryConsent,discoveryTransportStatus,queueDiscoveryMeasurement} from '../../src/beta/discovery-transport.js';

const now=Date.now(),at=now-1000;
assert.equal(normalizeReactions([{matchId:'a',kind:'interested',at:now+1000},{matchId:'b',kind:'bad',at},{matchId:'c',kind:'interested',at:now-31*86400000}]).length,0);
assert.equal(normalizeReactions(Array.from({length:60},(_,i)=>({matchId:String(i),kind:'interested',at}))).length,50);
const candidates=[{id:'a',place:'A',startsAt:'2099-01-01T20:00:00+09:00'},{id:'b',place:'B',startsAt:'2099-01-01T21:00:00+09:00'},{id:'c',place:'B',startsAt:'2099-01-01T22:00:00+09:00'}];
const interest={matchId:'past',kind:'interested',venue:'B',at,scope:'live'};
assert.deepEqual(personalizeRecommendations(candidates,[interest]).map(m=>m.id),['b','a','c']);
assert.deepEqual(personalizeRecommendations(candidates,[{...interest,kind:'too_far',venue:'A'}]).map(m=>m.id),['b','a','c']);
assert.deepEqual(personalizeRecommendations(candidates,[interest,interest]).map(m=>m.id),['b','c','a']);
assert.deepEqual(personalizeRecommendations(candidates,[{...interest,scope:'demo'}]),candidates);
assert.deepEqual(personalizeRecommendations(candidates,[{...interest,kind:'too_far',venue:'A'},{...interest,kind:'too_far',venue:'A'}]).map(m=>m.id),['b','c','a']);
assert.deepEqual(new Set(personalizeRecommendations(candidates,[interest]).map(m=>m.id)),new Set(candidates.map(m=>m.id)));
assert.deepEqual(personalizeRecommendations(candidates,[{...interest,kind:'different_time',hour:'20'},{...interest,kind:'different_time',hour:'20'}]).map(m=>m.id),['b','c','a']);
assert.equal(chooseOpeningVariant(null,'quick'),'control');
assert.equal(chooseOpeningVariant('quick','control'),'quick');
assert.equal(chooseOpeningVariant('compare',null,()=>0.9),'quick');
assert.equal(chooseOpeningVariant('compare','quick',()=>0),'quick');

const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const config={url:'https://example.invalid',publishableKey:'public'},uid='11111111-1111-4111-8111-111111111111';
const root={dataset:{betaCatalogSource:'server',betaGuest:'false'}};
globalThis.document={getElementById:()=>root};
let calls=[],enabled=false,fail=false;
globalThis.fetch=async(url,options={})=>{
 calls.push({url,options});if(fail)throw new Error('offline');
 if(!options.method)return new Response(JSON.stringify([{enabled}]));
 return new Response(null,{status:201});
};
const record={eventId:uid,discoveryFlowId:uid,event:'match_detail_opened',source:'connected-beta',variant:'quick',matchId:uid,email:'never transmit',region:'never transmit'};
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
await configureDiscoveryTransport(config,'','');queueDiscoveryMeasurement(record);await tick();assert.equal(calls.length,0);
await configureDiscoveryTransport(config,uid,'token');queueDiscoveryMeasurement(record);await tick();assert.equal(calls.length,1);
await setDiscoveryConsent(true);assert.equal(discoveryTransportStatus().enabled,true);
queueDiscoveryMeasurement({...record,source:'demo'});root.dataset.betaCatalogSource='demo';queueDiscoveryMeasurement(record);root.dataset.betaCatalogSource='server';
queueDiscoveryMeasurement({...record,matchId:'demo-example'});queueDiscoveryMeasurement({...record,event:'unsupported'});await tick();assert.equal(calls.filter(c=>c.url.includes('discovery_events')).length,0);
queueDiscoveryMeasurement(record);await tick();const row=JSON.parse(calls.at(-1).options.body)[0];assert.deepEqual(Object.keys(row).sort(),['event_id','session_id','event_name','variant','match_id'].sort());
assert.equal(row.variant,'quick');
await setDiscoveryConsent(false);assert.equal(discoveryTransportStatus().enabled,false);const count=calls.length;queueDiscoveryMeasurement(record);await tick();assert.equal(calls.length,count);
enabled=true;await configureDiscoveryTransport(config,uid,'token');fail=true;queueDiscoveryMeasurement(record);await tick();await configureDiscoveryTransport(null,'','');fail=false;queueDiscoveryMeasurement(record);await tick();assert.equal(discoveryTransportStatus().enabled,false);
let finish;
globalThis.fetch=()=>new Promise(resolve=>finish=resolve);
const configuring=configureDiscoveryTransport(config,uid,'token');await configureDiscoveryTransport(null,'','');finish(new Response('[{"enabled":true}]'));await configuring;assert.equal(discoveryTransportStatus().enabled,false);
console.log('PASS reaction scope/expiry/order/candidate fidelity, stable comparison assignment, consent gating, privacy allowlist, withdrawal, failure and account-switch isolation');

// A successful response must drain events accumulated while a request was in flight.
let batches=[],withdrawFails=false,serverEnabled=true;
globalThis.fetch=async(url,options={})=>{
 if(url.includes('discovery_events')){batches.push(JSON.parse(options.body));return new Response(null,{status:201})}
 if(options.method==='POST'){
  if(withdrawFails)return new Response('{}',{status:503});
  serverEnabled=JSON.parse(options.body).enabled;return new Response(null,{status:201});
 }
 return new Response(JSON.stringify([{enabled:serverEnabled}]));
};
const enqueue=()=>queueDiscoveryMeasurement({...record,eventId:crypto.randomUUID()});
await configureDiscoveryTransport(config,uid,'token');
await setDiscoveryConsent(true);
for(let i=0;i<23;i++)enqueue();await tick();
assert.equal(batches.flat().length,23);assert.ok(batches.every(b=>b.length<=10));
withdrawFails=true;await assert.rejects(setDiscoveryConsent(false),/서버 기록 삭제는 확인되지/);
assert.equal(discoveryTransportStatus().withdrawalPending,true);assert.equal(discoveryTransportStatus().enabled,false);
const before=batches.flat().length;enqueue();await tick();assert.equal(batches.flat().length,before);
// New module instance models a full reload, retaining only browser storage.
const reloaded=await import('../../src/beta/discovery-transport.js?reload-withdrawal');
await reloaded.configureDiscoveryTransport(config,uid,'token');
assert.equal(reloaded.discoveryTransportStatus().enabled,false);assert.equal(reloaded.discoveryTransportStatus().withdrawalPending,true);
await assert.rejects(reloaded.setDiscoveryConsent(true),/해제를 먼저 재시도/);
withdrawFails=false;await reloaded.setDiscoveryConsent(false);
assert.equal(serverEnabled,false);assert.equal(reloaded.discoveryTransportStatus().withdrawalPending,false);
await reloaded.setDiscoveryConsent(true);assert.equal(reloaded.discoveryTransportStatus().enabled,true);
// Failed event batches do not spin, and retry on the next user event.
let posts=0,eventFails=true;
globalThis.fetch=async(url,options={})=>{
 if(url.includes('discovery_events')){posts++;return new Response(eventFails?'{}':null,{status:eventFails?503:201})}
 return new Response('[{"enabled":true}]');
};
await reloaded.configureDiscoveryTransport(config,uid,'token');
reloaded.queueDiscoveryMeasurement({...record,eventId:crypto.randomUUID()});await tick();await tick();assert.equal(posts,1);
eventFails=false;reloaded.queueDiscoveryMeasurement({...record,eventId:crypto.randomUUID()});await tick();assert.equal(posts,2);
console.log('PASS 23-event idle drain, bounded batches, failed withdrawal across reload, retry acknowledgement, explicit re-opt-in and no failure retry loop');

const workflow=readFileSync(new URL('../../.github/workflows/qa.yml',import.meta.url),'utf8');
const production=workflow.slice(workflow.indexOf('\n  production_smoke:'));
const pins=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8')).qaToolchain;
assert.ok(production.includes(`image: mcr.microsoft.com/playwright:v${pins.playwright}-noble`));
assert.ok(!production.includes('playwright install'),'Production must use the installed browser image');
assert.ok(production.includes('node scripts/check-qa-toolchain.cjs'));
console.log('PASS Production browser image matches the package pin without apt/browser installation');

// Quota can reject a new withdrawal marker while existing account/auth storage remains readable.
for(const fallbackRemoval of [false,true]){
 const saved=new Map();let quota=false,withdrawalFails=true,server=false;
 globalThis.localStorage={getItem:k=>saved.get(k)??null,removeItem:k=>saved.delete(k),setItem:(k,v)=>{
  if(quota&&(k.includes('discovery-withdrawal')||(fallbackRemoval&&k.includes('discovery-permission'))))throw new Error('QuotaExceededError');
  saved.set(k,String(v));
 }};
 globalThis.fetch=async(url,o={})=>{
  if(o.method==='POST'){
   const value=JSON.parse(o.body).enabled;
   if(!value&&withdrawalFails)return new Response('{}',{status:503});
   server=value;return new Response(null,{status:201});
  }
  return new Response(JSON.stringify([{enabled:server}]));
 };
 const mod=await import(`../../src/beta/discovery-transport.js?quota-start-${fallbackRemoval}`);
 await mod.configureDiscoveryTransport(config,uid,'token');await mod.setDiscoveryConsent(true);
 assert.equal(mod.discoveryTransportStatus().enabled,true);quota=true;
 await assert.rejects(mod.setDiscoveryConsent(false));
 const after=await import(`../../src/beta/discovery-transport.js?quota-reload-${fallbackRemoval}`);
 await after.configureDiscoveryTransport(config,uid,'token');
 assert.equal(after.discoveryTransportStatus().enabled,false);
 if(fallbackRemoval)assert.equal(after.discoveryTransportStatus().serverEnabled,true);
 else assert.equal(after.discoveryTransportStatus().withdrawalPending,true);
 withdrawalFails=false;await after.setDiscoveryConsent(false);assert.equal(server,false);
 quota=false;await after.setDiscoveryConsent(true);assert.equal(after.discoveryTransportStatus().enabled,true);
}

for(const firstFails of [false,true]){
 const saved=new Map([['footmate:beta:discovery-permission:v2:'+uid,'enabled']]);
 globalThis.localStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)};
 let finishFirst,first=true;const delivered=[],auth=[];
 globalThis.fetch=async(url,o={})=>{
  if(!url.includes('discovery_events'))return new Response('[{"enabled":true}]');
  const rows=JSON.parse(o.body);auth.push(o.headers.authorization);
  if(first){first=false;return new Promise(resolve=>finishFirst=()=>{if(!firstFails)delivered.push(...rows);resolve(new Response(firstFails?'{}':null,{status:firstFails?401:201}))})}
  delivered.push(...rows);return new Response(null,{status:201});
 };
 const mod=await import(`../../src/beta/discovery-transport.js?refresh-${firstFails}`);
 await mod.configureDiscoveryTransport(config,uid,'old-token');
 for(let i=0;i<3;i++)mod.queueDiscoveryMeasurement({...record,eventId:crypto.randomUUID()});
 await mod.configureDiscoveryTransport(config,uid,'new-token');finishFirst();await tick();await tick();
 assert.equal(new Set(delivered.map(r=>r.event_id)).size,3);
 assert.equal(auth[0],'Bearer old-token');assert.equal(auth.at(-1),'Bearer new-token');
}

// Owner changes discard queued rows even if the old request fails after the switch.
const secondUser='33333333-3333-4333-8333-333333333333';
const saved=new Map([uid,secondUser].map(id=>['footmate:beta:discovery-permission:v2:'+id,'enabled']));
globalThis.localStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)};
let finishOld,first=true;const delivered=[];
globalThis.fetch=async(url,o={})=>{
 if(!url.includes('discovery_events'))return new Response('[{"enabled":true}]');
 if(first){first=false;return new Promise(resolve=>finishOld=()=>resolve(new Response('{}',{status:401})))}
 delivered.push({rows:JSON.parse(o.body),auth:o.headers.authorization});return new Response(null,{status:201});
};
const switched=await import('../../src/beta/discovery-transport.js?switch-in-flight');
await switched.configureDiscoveryTransport(config,uid,'owner-a');
for(let i=0;i<3;i++)switched.queueDiscoveryMeasurement({...record,eventId:crypto.randomUUID()});
await switched.configureDiscoveryTransport(config,secondUser,'owner-b');
const freshId=crypto.randomUUID();switched.queueDiscoveryMeasurement({...record,eventId:freshId});finishOld();await tick();await tick();
assert.deepEqual(delivered.map(b=>b.auth),['Bearer owner-b']);assert.deepEqual(delivered.flatMap(b=>b.rows.map(r=>r.event_id)),[freshId]);
console.log('PASS quota failure/reload with reserved-slot and removal fallback, explicit re-opt-in, same-owner refresh success/401 recovery, refreshed credentials and cross-owner in-flight isolation');
