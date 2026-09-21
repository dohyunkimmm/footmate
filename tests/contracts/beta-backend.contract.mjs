import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createSupabaseBetaClient,loadBetaBackendConfig,SupabaseBetaError,BETA_CONFIG_TIMEOUT_MS,BETA_REQUEST_TIMEOUT_MS} from '../../src/v5/infrastructure/supabase-beta.js';
import {normalizeBetaMatch} from '../../src/v5/domain/beta-match-contract.js';

function json(payload,status=200){
  return new Response(JSON.stringify(payload),{status,headers:{'content-type':'application/json'}});
}

function abortableNever(options={}){
  return new Promise((resolve,reject)=>{
    const signal=options.signal;
    if(signal?.aborted){
      const error=new Error('aborted');error.name='AbortError';reject(error);return;
    }
    signal?.addEventListener('abort',()=>{const error=new Error('aborted');error.name='AbortError';reject(error)},{once:true});
  });
}

const connectedMatch={
  id:'11111111-1111-4111-8111-111111111111',
  title:'영통 금요일 저녁 경기',
  venue_name:'영통 풋살장',
  area_label:'영통',
  address:'경기도 수원시 영통구',
  region:'수원 · 영통',
  level:'초중급',
  starts_at:'2026-09-25T20:00:00+09:00',
  price_krw:0,
  capacity_total:12,
  joined_count:8,
  remaining_spots:4,
  format_label:'6 vs 6',
  surface:'인조잔디',
  duration_minutes:80,
  status:'open',
  match_slots:[
    {position:'MF',capacity_total:4,joined_count:3,remaining_spots:1},
    {position:'FW',capacity_total:3,joined_count:2,remaining_spots:1},
    {position:'DF',capacity_total:4,joined_count:2,remaining_spots:2},
    {position:'GK',capacity_total:1,joined_count:1,remaining_spots:0}
  ]
};

assert.equal(BETA_CONFIG_TIMEOUT_MS,5000);
assert.equal(BETA_REQUEST_TIMEOUT_MS,8000);

const calls=[];
const fetchImpl=async (url,options={})=>{
  calls.push({url:String(url),options});
  if(String(url)==='/api/beta-config')return json({connected:true,url:'https://demo.supabase.co',publishableKey:'public-key'});
  if(String(url).includes('/auth/v1/token?grant_type=password'))return json({access_token:'access-token',refresh_token:'refresh-token',user:{id:'user-1'}});
  if(String(url).includes('/auth/v1/token?grant_type=refresh_token'))return json({access_token:'refreshed-access-token',refresh_token:'next-refresh-token',user:{id:'user-1'}});
  if(String(url).includes('/rest/v1/rpc/join_match_position'))return json([{participation_id:'p-1',joined_match_id:connectedMatch.id,joined_position:'MF',participation_status:'confirmed',remaining_position_spots:0,remaining_match_spots:3,already_joined:false}]);
  if(String(url).includes('/rest/v1/matches?'))return json([connectedMatch]);
  return json({});
};

const config=await loadBetaBackendConfig({fetchImpl});
assert.deepEqual(config,{url:'https://demo.supabase.co',publishableKey:'public-key'});

const client=createSupabaseBetaClient({...config,fetchImpl});
assert.equal(client.origin,'https://demo.supabase.co');

const signIn=await client.auth.signIn({email:'beta@example.com',password:'safe-password'});
assert.equal(signIn.access_token,'access-token');
const authCall=calls.find(call=>call.url.includes('/auth/v1/token?grant_type=password'));
assert.equal(authCall.options.method,'POST');
assert.equal(authCall.options.headers.apikey,'public-key');
assert.ok(authCall.options.signal,'Supabase requests must carry an abort signal');
assert.deepEqual(JSON.parse(authCall.options.body),{email:'beta@example.com',password:'safe-password'});

const refreshed=await client.auth.refresh({refreshToken:'refresh-token'});
assert.equal(refreshed.access_token,'refreshed-access-token');
const refreshCall=calls.find(call=>call.url.includes('/auth/v1/token?grant_type=refresh_token'));
assert.deepEqual(JSON.parse(refreshCall.options.body),{refresh_token:'refresh-token'});

const matches=await client.matches.list({region:'수원 · 영통',limit:999});
assert.equal(matches[0].id,connectedMatch.id);
const matchCall=calls.find(call=>call.url.includes('/rest/v1/matches?'));
const matchUrl=new URL(matchCall.url);
assert.equal(matchUrl.searchParams.get('status'),'in.(open,full)');
assert.equal(matchUrl.searchParams.get('region'),'eq.수원 · 영통');
assert.equal(matchUrl.searchParams.get('limit'),'50');
assert.ok(matchUrl.searchParams.get('starts_at').startsWith('gt.'));
assert.ok(matchUrl.searchParams.get('select').includes('match_slots(position,capacity_total,joined_count,remaining_spots)'));
assert.ok(matchUrl.searchParams.get('select').includes('duration_minutes'));

const normalized=normalizeBetaMatch(connectedMatch);
assert.equal(normalized.source,'connected-beta');
assert.equal(normalized.place,'영통 풋살장');
assert.equal(normalized.positionSlots.MF,1);
assert.equal(normalized.positionSlots.GK,0);
assert.equal(normalized.durationMin,80);
assert.equal(normalized.price,0);
assert.throws(()=>normalizeBetaMatch({...connectedMatch,level:'프로'}),/level is invalid/);

const joined=await client.participation.join({accessToken:'access-token',matchId:connectedMatch.id,position:'mf'});
assert.equal(joined.participation_status,'confirmed');
assert.equal(joined.joined_position,'MF');
assert.equal(joined.remaining_position_spots,0);
const joinCall=calls.find(call=>call.url.includes('/rest/v1/rpc/join_match_position'));
assert.equal(joinCall.options.headers.authorization,'Bearer access-token');
assert.deepEqual(JSON.parse(joinCall.options.body),{p_match_id:connectedMatch.id,p_position:'MF'});
assert.throws(()=>client.participation.join({accessToken:'access-token',matchId:connectedMatch.id,position:'ANY'}),/position must be/);

const failing=createSupabaseBetaClient({
  url:'https://demo.supabase.co',
  publishableKey:'public-key',
  fetchImpl:async()=>json({code:'P0001',message:'POSITION_FULL'},409)
});
await assert.rejects(
  ()=>failing.participation.join({accessToken:'access-token',matchId:connectedMatch.id,position:'MF'}),
  error=>error instanceof SupabaseBetaError&&error.status===409&&error.code==='P0001'
);

const timeoutClient=createSupabaseBetaClient({
  url:'https://demo.supabase.co',
  publishableKey:'public-key',
  requestTimeoutMs:50,
  fetchImpl:async(_url,options)=>abortableNever(options)
});
await assert.rejects(
  ()=>timeoutClient.matches.list(),
  error=>error instanceof SupabaseBetaError&&error.code==='BETA_REQUEST_TIMEOUT'&&/시간이 초과/.test(error.message)
);
await assert.rejects(
  ()=>loadBetaBackendConfig({timeoutMs:50,fetchImpl:async(_url,options)=>abortableNever(options)}),
  error=>error instanceof SupabaseBetaError&&error.code==='BETA_REQUEST_TIMEOUT'
);

const networkFailure=createSupabaseBetaClient({
  url:'https://demo.supabase.co',
  publishableKey:'public-key',
  fetchImpl:async()=>{throw new TypeError('fetch failed')}
});
await assert.rejects(
  ()=>networkFailure.matches.list(),
  error=>error instanceof SupabaseBetaError&&error.code==='BETA_NETWORK_ERROR'&&/네트워크/.test(error.message)
);

const foundationMigration=await readFile(new URL('../../supabase/migrations/20260920_beta_foundation.sql',import.meta.url),'utf8');
for(const required of [
  'create table if not exists public.profiles',
  'create table if not exists public.matches',
  'create table if not exists public.participations',
  'alter table public.matches enable row level security',
  'alter table public.participations enable row level security',
  'create or replace function public.join_match',
  'create or replace function public.cancel_participation',
  'for update;',
  'joined_count = joined_count + 1',
  "grant execute on function public.join_match(uuid) to authenticated",
  "alter publication supabase_realtime add table public.matches"
])assert.ok(foundationMigration.includes(required),`missing foundation migration contract: ${required}`);
assert.ok(!foundationMigration.includes('service_role'),'service-role credentials must not be embedded in the migration');

const positionMigration=await readFile(new URL('../../supabase/migrations/20260920_position_aware_beta.sql',import.meta.url),'utf8');
for(const required of [
  'create table if not exists public.match_slots',
  'alter table public.match_slots enable row level security',
  'create or replace function public.validate_open_match_contract',
  'create or replace function public.join_match_position',
  "revoke execute on function public.join_match(uuid) from authenticated",
  "grant execute on function public.join_match_position(uuid, text) to authenticated",
  "raise exception 'POSITION_FULL'",
  'update public.match_slots',
  'joined_count = joined_count + 1',
  'joined_count = greatest(joined_count - 1, 0)',
  'for update;',
  'alter publication supabase_realtime add table public.match_slots'
])assert.ok(positionMigration.includes(required),`missing position migration contract: ${required}`);
assert.ok(!positionMigration.includes('service_role'),'service-role credentials must not be embedded in the position migration');

const openMatchIntegrityMigration=await readFile(new URL('../../supabase/migrations/20260920_open_match_integrity.sql',import.meta.url),'utf8');
for(const required of [
  'select coalesce(sum(capacity_total), 0)::integer',
  'where match_id = new.id',
  'v_slot_capacity <> new.capacity_total',
  "raise exception 'POSITION_CAPACITY_INCOMPLETE'",
  'new.price_krw <> 0',
  "raise exception 'PAYMENT_NOT_CONNECTED'"
])assert.ok(openMatchIntegrityMigration.includes(required),`missing open match integrity contract: ${required}`);
assert.ok(!openMatchIntegrityMigration.includes('service_role'),'service-role credentials must not be embedded in the open match integrity migration');

const configRoute=await readFile(new URL('../../api/beta-config.js',import.meta.url),'utf8');
assert.ok(configRoute.includes('SUPABASE_PUBLISHABLE_KEY'));
assert.ok(configRoute.includes('SUPABASE_ANON_KEY'));
assert.ok(!configRoute.includes('SUPABASE_SERVICE_ROLE_KEY'));

console.log('PASS beta backend foundation + position-aware + network resilience contracts');
