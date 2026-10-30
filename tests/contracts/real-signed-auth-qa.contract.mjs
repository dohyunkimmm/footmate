import assert from 'node:assert/strict';
import {auditConfig,jwtClaims,runSignedAuthAudit} from '../../scripts/qa-real-signed-auth.mjs';

// Fake Auth responses validate harness orchestration only. They are not signed JWT evidence.
const userId='11111111-1111-4111-8111-111111111111';
const operatorId='22222222-2222-4222-8222-222222222222';
const fakeJwt=(sub,aal)=>'eyJhbGciOiJub25lIn0.'+Buffer.from(JSON.stringify({sub,aal})).toString('base64url')+'.NOT_A_REAL_SIGNATURE';
const userToken=fakeJwt(userId,'aal1'),opToken=fakeJwt(operatorId,'aal1'),aal2Token=fakeJwt(operatorId,'aal2');
const env={
 FOOTMATE_QA_DEDICATED_ACCOUNT_ACK:'I_HAVE_AUTHORIZED_BOTH_TEST_ACCOUNTS',
 FOOTMATE_QA_URL:'https://iihitfjphowjplxzfxtn.supabase.co',
 FOOTMATE_QA_PUBLIC_KEY:'fake-public-key',
 FOOTMATE_QA_USER_EMAIL:'qa-user@example.test',FOOTMATE_QA_USER_PASSWORD:'QA-only-user-secret',
 FOOTMATE_QA_OPERATOR_EMAIL:'qa-operator@example.test',FOOTMATE_QA_OPERATOR_PASSWORD:'QA-only-operator-secret',
 FOOTMATE_QA_OPERATOR_TOTP:'123456'
};
assert.equal(auditConfig(env).base,env.FOOTMATE_QA_URL);
assert.equal(jwtClaims(opToken).aal,'aal1');
assert.throws(()=>jwtClaims('not-a-token'),/Invalid JWT/);
assert.throws(()=>auditConfig({...env,FOOTMATE_QA_DEDICATED_ACCOUNT_ACK:''}),/authorization/);
assert.throws(()=>auditConfig({...env,FOOTMATE_QA_URL:'https://attacker.example.test'}),/expected/);
assert.throws(()=>auditConfig({...env,FOOTMATE_QA_OPERATOR_TOTP:'0000000'}),/six-digit/);
assert.throws(()=>auditConfig({...env,FOOTMATE_QA_OPERATOR_EMAIL:env.FOOTMATE_QA_USER_EMAIL}),/different/);

let verified=false,revoked=false,logoutCount=0,requestCount=0;
const body=(status,payload)=>new Response(status===204?null:JSON.stringify(payload),{status,headers:{'content-type':'application/json'}});
const fetchImpl=async(url,options)=>{
 requestCount++;
 const u=new URL(url),token=options.headers.authorization?.replace('Bearer ','')||'';
 const data=options.body?JSON.parse(options.body):{};
 if(u.pathname==='/auth/v1/token'&&u.searchParams.get('grant_type')==='password'){
  if(data.email===env.FOOTMATE_QA_USER_EMAIL)return body(200,{access_token:userToken,refresh_token:'refresh-user'});
  if(data.email===env.FOOTMATE_QA_OPERATOR_EMAIL)return body(200,{access_token:opToken,refresh_token:'refresh-operator'});
 }
 if(u.pathname==='/auth/v1/token'&&u.searchParams.get('grant_type')==='refresh_token'){
  if(data.refresh_token==='refresh-aal2')return body(200,{access_token:aal2Token,refresh_token:'refresh-aal2-latest'});
  if(data.refresh_token==='refresh-aal2-latest'&&revoked)return body(400,{});
 }
 if(u.pathname==='/auth/v1/user'){
  if(token===userToken)return body(200,{id:userId,factors:[]});
  if(token===opToken||token===aal2Token)return body(200,{id:operatorId,factors:[{id:'factor-verified',factor_type:'totp',status:'verified'}]});
 }
 if(u.pathname==='/rest/v1/operators'){
  return token===userToken?body(200,[]):body(200,[{user_id:operatorId}]);
 }
 if(u.pathname==='/rest/v1/beta_user_preferences')return body(200,[]);
 if(u.pathname==='/rest/v1/rpc/operator_discovery_kpi_baseline'){
  assert.ok(Math.abs(Date.now()-new Date(data.p_since).getTime()-21*86400000)<10000);
  return token===aal2Token?body(200,[{metric_name:'search_to_detail',rate_percent:null}]):body(403,{code:'42501'});
 }
 if(u.pathname==='/auth/v1/factors/factor-verified/challenge')return body(200,{id:'challenge-1'});
 if(u.pathname==='/auth/v1/factors/factor-verified/verify'){
  assert.equal(data.challenge_id,'challenge-1');assert.equal(data.code,'123456');verified=true;
  return body(200,{access_token:aal2Token,refresh_token:'refresh-aal2'});
 }
 if(u.pathname==='/auth/v1/logout'&&u.searchParams.get('scope')==='local'){
  logoutCount++;if(token===aal2Token)revoked=true;return body(204,null);
 }
 return body(500,{error:'unexpected mock request'});
};
const output=[];
const r=await runSignedAuthAudit({env,fetchImpl,log:line=>output.push(line)});
assert.equal(r.passed,output.length);
assert.ok(r.passed>=14);
assert.ok(verified);
assert.equal(logoutCount,2);
assert.ok(requestCount>=18);
const logText=output.join(' ');
for(const secret of [env.FOOTMATE_QA_USER_EMAIL,env.FOOTMATE_QA_OPERATOR_EMAIL,env.FOOTMATE_QA_USER_PASSWORD,env.FOOTMATE_QA_OPERATOR_PASSWORD,env.FOOTMATE_QA_OPERATOR_TOTP,userToken,opToken,aal2Token])assert.ok(!logText.includes(secret));
console.log('PASS isolated live signed-Auth QA harness contract (mocked; no real Auth tokens)');
