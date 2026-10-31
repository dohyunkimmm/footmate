import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cleanSyncPreferences,createPreferenceSyncClient,PREFERENCE_SYNC_TIMEOUT_MS} from '../../src/beta/preference-sync.js';

const uid='22222222-2222-4222-8222-222222222222';
const otherUid='33333333-3333-4333-8333-333333333333';
const input={sport:'futsal',region:'서울 · 송파',level:'중급',position:'GK',afterTime:'18:00',beforeTime:'22:00',dateWindow:'weekend'};
assert.equal(PREFERENCE_SYNC_TIMEOUT_MS,8000);
assert.deepEqual(cleanSyncPreferences(input),input);
assert.equal(cleanSyncPreferences({...input,position:'admin'}),null);
assert.equal(cleanSyncPreferences({...input,region:'X'.repeat(81)}),null);
assert.equal(cleanSyncPreferences([]),null);

const calls=[];
let saved=null;
const client=createPreferenceSyncClient({url:'https://test.supabase.co',publishableKey:'public-key',fetchImpl:async(url,options)=>{
 calls.push({url,options});
 if(options.method==='POST'){saved=JSON.parse(options.body);return new Response('',{status:201})}
 return new Response(JSON.stringify(saved&&new URL(url).searchParams.get('user_id')==='eq.'+saved.user_id?[saved]:[]),{status:200,headers:{'content-type':'application/json'}});
}});
assert.equal(await client.load({userId:uid,accessToken:'signed-in'}),null);
assert.deepEqual(await client.save({userId:uid,accessToken:'signed-in',preferences:input}),input);
assert.equal(saved.user_id,uid);
assert.deepEqual(await client.load({userId:uid,accessToken:'signed-in'}),input);
assert.equal(await client.load({userId:otherUid,accessToken:'signed-in'}),null);
assert.equal(calls[1].options.headers.apikey,'public-key');
assert.equal(calls[1].options.headers.authorization,'Bearer signed-in');
assert.ok(calls[1].options.signal,'authenticated preference requests must be abortable');
assert.equal(new URL(calls[1].url).searchParams.get('on_conflict'),'user_id');
await assert.rejects(()=>client.save({userId:uid,accessToken:'signed-in',preferences:{position:'invalid'}}),/Invalid/);
await assert.rejects(()=>client.load({userId:'demo-1',accessToken:'signed-in'}),/Authenticated/);

const timedOut=createPreferenceSyncClient({
 url:'https://test.supabase.co',publishableKey:'public-key',requestTimeoutMs:50,
 fetchImpl:(_url,options)=>new Promise((resolve,reject)=>{
  const abort=()=>{const error=new Error('aborted');error.name='AbortError';reject(error)};
  if(options.signal.aborted)return abort();
  options.signal.addEventListener('abort',abort,{once:true});
 })
});
await assert.rejects(()=>timedOut.load({userId:uid,accessToken:'signed-in'}),/timed out/);
await assert.rejects(()=>timedOut.save({userId:uid,accessToken:'signed-in',preferences:input}),/timed out/);
const retried=createPreferenceSyncClient({
 url:'https://test.supabase.co',publishableKey:'public-key',requestTimeoutMs:50,
 fetchImpl:async()=>new Response('[]',{headers:{'content-type':'application/json'}})
});
assert.equal(await retried.load({userId:uid,accessToken:'signed-in'}),null,'sync may retry after a timed-out request');

const migration=await readFile(new URL('../../supabase/migrations/20261030032856_beta_preferences_pilot_metrics.sql',import.meta.url),'utf8');
for(const part of [
 'references auth.users(id) on delete cascade',
 'alter table public.beta_user_preferences enable row level security',
 'revoke all on public.beta_user_preferences from public, anon, authenticated',
 'for select to authenticated using (user_id=(select auth.uid()))',
 'for insert to authenticated with check (user_id=(select auth.uid()))',
 'for update to authenticated using (user_id=(select auth.uid()))',
 'perform public.require_beta_operator_aal2();',
 "c.cohort='pilot'",
 'consent.enabled',
 'totals.u>=5 and totals.d>=5',
 'revoke all on function public.operator_discovery_kpi_baseline(timestamptz) from public,anon'
])assert.ok(migration.includes(part),'missing secure contract: '+part);
assert.ok(!migration.includes('grant select on public.discovery_events to anon'));
const app=await readFile(new URL('../../src/beta/growth.js',import.meta.url),'utf8');
assert.ok(app.includes('syncAccountPreferences()'));
assert.ok(app.includes("sessionStorage.setItem(PREF_DIRTY_KEY,'1')"));
const local=await readFile(new URL('../../src/beta/demo-catalog.js',import.meta.url),'utf8');
assert.ok(local.includes('rows.filter(p=>p.user_id!==userId)'));
console.log('PASS authenticated preference sync and pilot-only baseline security contracts');
