import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createSupabaseBetaClient} from '../../src/v5/infrastructure/supabase-beta.js';

const hotfix=await readFile(new URL('../../supabase/migrations/20260921_cancel_participation_ambiguity_fix.sql',import.meta.url),'utf8');

for(const required of [
  'create or replace function public.cancel_participation',
  'update public.matches m',
  'greatest(m.joined_count - 1, 0)',
  "when m.status = 'full' and m.starts_at > now() then 'open'",
  'where m.id = p_match_id',
  'returning m.remaining_spots into v_remaining',
  'grant execute on function public.cancel_participation(uuid) to authenticated'
])assert.ok(hotfix.includes(required),`missing cancel hotfix contract: ${required}`);

assert.ok(!hotfix.includes('returning remaining_spots into v_remaining'),'unqualified remaining_spots must not return');
assert.ok(!hotfix.includes('service_role'),'service-role credentials must not be embedded');

const originalLocation=Object.getOwnPropertyDescriptor(globalThis,'location');
Object.defineProperty(globalThis,'location',{value:{origin:'https://footmate.example'},configurable:true});
try{
  const calls=[];
  const client=createSupabaseBetaClient({
    url:'https://demo.supabase.co',
    publishableKey:'public-key',
    fetchImpl:async(url,options={})=>{
      calls.push({url:String(url),options});
      return new Response(JSON.stringify({}),{status:200,headers:{'content-type':'application/json'}});
    }
  });
  await client.auth.signUp({email:'beta@example.com',password:'safe-password',displayName:'Beta'});
  const signupCall=calls.find(call=>call.url.includes('/auth/v1/signup'));
  assert.ok(signupCall,'signup request must be sent');
  const signupUrl=new URL(signupCall.url);
  assert.equal(signupUrl.searchParams.get('redirect_to'),'https://footmate.example/beta','signup confirmations must return to /beta');
  assert.deepEqual(JSON.parse(signupCall.options.body),{email:'beta@example.com',password:'safe-password',data:{display_name:'Beta'}});
}finally{
  if(originalLocation)Object.defineProperty(globalThis,'location',originalLocation);
  else delete globalThis.location;
}

console.log('PASS beta Must cancel-participation hotfix + signup confirmation redirect contracts');
