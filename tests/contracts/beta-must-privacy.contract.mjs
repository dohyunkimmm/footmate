import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BETA_SIGNUP_PASSWORD_MIN_LENGTH,createSupabaseBetaClient} from '../../src/v5/infrastructure/supabase-beta.js';

assert.equal(BETA_SIGNUP_PASSWORD_MIN_LENGTH,8);

let calls=[];
const client=createSupabaseBetaClient({
  url:'https://demo.supabase.co',
  publishableKey:'public-key',
  fetchImpl:async(url,options={})=>{
    calls.push({url:String(url),options});
    return new Response(JSON.stringify({deleted:true}),{status:200,headers:{'content-type':'application/json'}});
  }
});

assert.throws(
  ()=>client.auth.signUp({email:'beta@example.com',password:'short7'}),
  error=>error instanceof TypeError&&/at least 8 characters/.test(error.message)
);
assert.equal(calls.length,0,'weak signup password must fail before network request');

const deleted=await client.auth.deleteAccount({accessToken:'access-token'});
assert.equal(deleted.deleted,true);
assert.equal(calls.length,1);
assert.equal(calls[0].url,'https://demo.supabase.co/functions/v1/delete-account');
assert.equal(calls[0].options.method,'POST');
assert.equal(calls[0].options.headers.authorization,'Bearer access-token');
assert.equal(calls[0].options.headers.apikey,'public-key');

const fn=await readFile(new URL('../../supabase/functions/delete-account/index.ts',import.meta.url),'utf8');
for(const required of [
  "withSupabase({auth:'user'}",
  "ctx.userClaims?.id",
  'ctx.supabaseAdmin.auth.admin.deleteUser(userId)',
  "req.method!=='POST'",
  "code:'ACCOUNT_DELETE_FAILED'"
])assert.ok(fn.includes(required),`missing delete-account boundary: ${required}`);
for(const forbidden of ['SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SECRET_KEY','service_role']){
  assert.ok(!fn.includes(forbidden),`function source must not embed ${forbidden}`);
}

const indexes=await readFile(new URL('../../supabase/migrations/20260921_beta_operation_audit_indexes.sql',import.meta.url),'utf8');
for(const required of [
  'beta_operation_events_actor_idx',
  'beta_operation_events_subject_user_idx',
  'beta_operation_events_participation_idx'
])assert.ok(indexes.includes(required),`missing audit FK index: ${required}`);

const ui=await readFile(new URL('../../src/v5/beta.js',import.meta.url),'utf8');
for(const required of [
  '계정·참가 데이터 삭제',
  '이 작업은 되돌릴 수 없습니다',
  'client.auth.deleteAccount',
  '저장 데이터: 이메일 · 이름 · 생활권 · 포지션 · 레벨 · 참가 상태',
  "window.addEventListener('online'",
  "document.addEventListener('visibilitychange'",
  'lastSyncedAt'
])assert.ok(ui.includes(required),`missing beta privacy/freshness UI contract: ${required}`);

console.log('PASS beta Must privacy, password, freshness and account deletion contracts');
