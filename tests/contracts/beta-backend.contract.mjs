import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createSupabaseBetaClient,loadBetaBackendConfig,SupabaseBetaError} from '../../src/v5/infrastructure/supabase-beta.js';

function json(payload,status=200){
  return new Response(JSON.stringify(payload),{status,headers:{'content-type':'application/json'}});
}

const calls=[];
const fetchImpl=async (url,options={})=>{
  calls.push({url:String(url),options});
  if(String(url)==='/api/beta-config')return json({connected:true,url:'https://demo.supabase.co',publishableKey:'public-key'});
  if(String(url).includes('/auth/v1/token?grant_type=password'))return json({access_token:'access-token',user:{id:'user-1'}});
  if(String(url).includes('/rest/v1/rpc/join_match'))return json([{participation_id:'p-1',joined_match_id:'match-1',participation_status:'confirmed',remaining_spots:2,already_joined:false}]);
  if(String(url).includes('/rest/v1/matches?'))return json([{id:'match-1',status:'open',remaining_spots:3}]);
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
assert.deepEqual(JSON.parse(authCall.options.body),{email:'beta@example.com',password:'safe-password'});

const matches=await client.matches.list({region:'수원 · 영통',limit:999});
assert.equal(matches[0].id,'match-1');
const matchCall=calls.find(call=>call.url.includes('/rest/v1/matches?'));
const matchUrl=new URL(matchCall.url);
assert.equal(matchUrl.searchParams.get('status'),'in.(open,full)');
assert.equal(matchUrl.searchParams.get('region'),'eq.수원 · 영통');
assert.equal(matchUrl.searchParams.get('limit'),'50');
assert.ok(matchUrl.searchParams.get('select').includes('remaining_spots'));

const joined=await client.participation.join({accessToken:'access-token',matchId:'match-1'});
assert.equal(joined.participation_status,'confirmed');
assert.equal(joined.remaining_spots,2);
const joinCall=calls.find(call=>call.url.includes('/rest/v1/rpc/join_match'));
assert.equal(joinCall.options.headers.authorization,'Bearer access-token');
assert.deepEqual(JSON.parse(joinCall.options.body),{p_match_id:'match-1'});

const failing=createSupabaseBetaClient({
  url:'https://demo.supabase.co',
  publishableKey:'public-key',
  fetchImpl:async()=>json({code:'23505',message:'duplicate'},409)
});
await assert.rejects(
  ()=>failing.participation.join({accessToken:'access-token',matchId:'match-1'}),
  error=>error instanceof SupabaseBetaError&&error.status===409&&error.code==='23505'
);

const migration=await readFile(new URL('../../supabase/migrations/20260920_beta_foundation.sql',import.meta.url),'utf8');
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
])assert.ok(migration.includes(required),`missing migration contract: ${required}`);
assert.ok(!migration.includes('service_role'),'service-role credentials must not be embedded in the migration');

const configRoute=await readFile(new URL('../../api/beta-config.js',import.meta.url),'utf8');
assert.ok(configRoute.includes('SUPABASE_PUBLISHABLE_KEY'));
assert.ok(configRoute.includes('SUPABASE_ANON_KEY'));
assert.ok(!configRoute.includes('SUPABASE_SERVICE_ROLE_KEY'));

console.log('PASS beta backend foundation contracts');
