// One-shot, explicitly authorized real Auth QA. No privileged keys and no data mutations.
// Do not commit credentials, signed JWTs, refresh tokens, or TOTP codes.
import {pathToFileURL} from 'node:url';

const PROJECT_HOST='iihitfjphowjplxzfxtn.supabase.co';
const ACK='I_HAVE_AUTHORIZED_BOTH_TEST_ACCOUNTS';

export function auditConfig(env){
 const required=['FOOTMATE_QA_PUBLIC_KEY','FOOTMATE_QA_USER_EMAIL','FOOTMATE_QA_USER_PASSWORD','FOOTMATE_QA_OPERATOR_EMAIL','FOOTMATE_QA_OPERATOR_PASSWORD','FOOTMATE_QA_OPERATOR_TOTP'];
 if(env.FOOTMATE_QA_DEDICATED_ACCOUNT_ACK!==ACK)throw new Error('Dedicated-test-account authorization acknowledgement required');
 const missing=required.filter(key=>!String(env[key]||'').trim());
 if(missing.length)throw new Error('Missing QA environment variable names: '+missing.join(', '));
 const url=new URL(String(env.FOOTMATE_QA_URL||''));
 if(url.protocol!=='https:'||url.hostname!==PROJECT_HOST||url.port||url.pathname!=='/'||url.search||url.hash)
  throw new Error('QA endpoint must be the expected FootMate Supabase HTTPS project');
 if(env.FOOTMATE_QA_USER_EMAIL.trim().toLowerCase()===env.FOOTMATE_QA_OPERATOR_EMAIL.trim().toLowerCase())
  throw new Error('QA user and QA operator must be different authorized test accounts');
 if(!/^\d{6}$/.test(env.FOOTMATE_QA_OPERATOR_TOTP))throw new Error('A current six-digit operator TOTP is required');
 return {base:url.origin,publicKey:env.FOOTMATE_QA_PUBLIC_KEY};
}

export function jwtClaims(token){
 try{
  const part=String(token||'').split('.')[1];
  const payload=JSON.parse(Buffer.from(part,'base64url').toString('utf8'));
  if(!payload||typeof payload.sub!=='string'||!['aal1','aal2'].includes(payload.aal))throw new Error();
  return {sub:payload.sub,aal:payload.aal};
 }catch{throw new Error('Invalid JWT claims; no credentials printed')}
}

export async function runSignedAuthAudit({env=process.env,fetchImpl=fetch,log=console.log}={}){
 const {base,publicKey}=auditConfig(env);
 const result=[];
 let userSession=null,operatorSession=null;
 const report=(name,status)=>{
  const line='PASS '+name+' · HTTP '+status;
  result.push(line);log(line);
 };
 async function request(path,{method='GET',token=null,body}={}){
  let response;
  try{
   response=await fetchImpl(base+path,{
    method,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(20000),
    headers:{apikey:publicKey,accept:'application/json',...(token?{authorization:'Bearer '+token}:{}),...(body!==undefined?{'content-type':'application/json'}:{})},
    ...(body!==undefined?{body:JSON.stringify(body)}:{})
   });
  }catch{throw new Error('QA request failed; URL and credentials withheld')}
  let payload=null;
  try{payload=await response.json()}catch{}
  return {status:response.status,ok:response.ok,payload};
 }
 function expectHttp(name,res,allowed){
  if(!allowed.includes(res.status))throw new Error(name+' unexpected HTTP '+res.status);
  report(name,res.status);
 }
 function validSession(value,name){
  if(!value?.access_token||!value?.refresh_token)throw new Error(name+' did not return a complete session');
  return {access_token:value.access_token,refresh_token:value.refresh_token};
 }
 async function authUser(session,aal,name){
  const claims=jwtClaims(session.access_token);
  if(claims.aal!==aal)throw new Error(name+' has unexpected assurance level');
  // Actual Auth server validation is essential; offline JWT decoding is not a signature check.
  const res=await request('/auth/v1/user',{token:session.access_token});
  expectHttp(name+' signed JWT accepted by Supabase Auth',res,[200]);
  const id=res.payload?.id||res.payload?.user?.id;
  if(!id||id!==claims.sub)throw new Error(name+' Auth subject mismatch');
  return {id,profile:res.payload};
 }
 async function signOutLocal(session){
  if(!session?.access_token)return;
  await request('/auth/v1/logout?scope=local',{method:'POST',token:session.access_token}).catch(()=>null);
 }
 try{
  let res=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:env.FOOTMATE_QA_USER_EMAIL,password:env.FOOTMATE_QA_USER_PASSWORD}});
  expectHttp('dedicated user password sign-in',res,[200]);
  userSession=validSession(res.payload,'User');
  const user=await authUser(userSession,'aal1','user AAL1');

  res=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:env.FOOTMATE_QA_OPERATOR_EMAIL,password:env.FOOTMATE_QA_OPERATOR_PASSWORD}});
  expectHttp('dedicated operator password sign-in',res,[200]);
  operatorSession=validSession(res.payload,'Operator');
  const operator=await authUser(operatorSession,'aal1','operator AAL1');
  if(user.id===operator.id)throw new Error('Test identities are not isolated');

  res=await request('/rest/v1/operators?select=user_id&limit=1',{token:userSession.access_token});
  expectHttp('user operator membership read',res,[200]);
  if(!Array.isArray(res.payload)||res.payload.length!==0)throw new Error('Non-operator gained operator membership visibility');
  res=await request('/rest/v1/operators?select=user_id&limit=1',{token:operatorSession.access_token});
  expectHttp('operator membership read before MFA',res,[200]);
  if(!Array.isArray(res.payload)||!res.payload.some(item=>item.user_id===operator.id))
   throw new Error('Authorized operator account has no operator membership');

  res=await request('/rest/v1/beta_user_preferences?select=user_id&limit=5',{token:userSession.access_token});
  expectHttp('user-owned recommendation preference read',res,[200]);
  if(!Array.isArray(res.payload)||res.payload.some(row=>row.user_id!==user.id))
   throw new Error('Recommendation preference RLS breached');

  const rpc='/rest/v1/rpc/operator_discovery_kpi_baseline';
  const params={p_since:new Date(Date.now()-21*86400000).toISOString()};
  res=await request(rpc,{method:'POST',token:userSession.access_token,body:params});
  expectHttp('non-operator AAL1 denied KPI RPC',res,[401,403]);
  res=await request(rpc,{method:'POST',token:operatorSession.access_token,body:params});
  expectHttp('operator AAL1 denied KPI RPC',res,[401,403]);

  const factors=operator.profile?.factors||[];
  const factor=factors.find(item=>item.factor_type==='totp'&&item.status==='verified');
  if(!factor?.id)throw new Error('Authorized operator has no verified TOTP factor');
  const route='/auth/v1/factors/'+encodeURIComponent(factor.id);
  res=await request(route+'/challenge',{method:'POST',token:operatorSession.access_token,body:{}});
  expectHttp('operator TOTP challenge',res,[200]);
  const challengeId=res.payload?.id;
  if(!challengeId)throw new Error('TOTP challenge ID missing');
  res=await request(route+'/verify',{method:'POST',token:operatorSession.access_token,body:{challenge_id:challengeId,code:env.FOOTMATE_QA_OPERATOR_TOTP}});
  expectHttp('operator TOTP verification',res,[200]);
  operatorSession=validSession(res.payload,'AAL2 operator');
  await authUser(operatorSession,'aal2','operator AAL2');
  res=await request(rpc,{method:'POST',token:operatorSession.access_token,body:params});
  expectHttp('operator AAL2 allowed KPI RPC',res,[200]);
  if(!Array.isArray(res.payload)||!res.payload.every(row=>typeof row.metric_name==='string'))
   throw new Error('KPI RPC returned an invalid result shape');

  res=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:operatorSession.refresh_token}});
  expectHttp('operator AAL2 refresh',res,[200]);
  operatorSession=validSession(res.payload,'Refreshed operator');
  await authUser(operatorSession,'aal2','refreshed operator AAL2');
  res=await request(rpc,{method:'POST',token:operatorSession.access_token,body:params});
  expectHttp('refreshed operator AAL2 allowed KPI RPC',res,[200]);

  const usedRefresh=operatorSession.refresh_token;
  res=await request('/auth/v1/logout?scope=local',{method:'POST',token:operatorSession.access_token});
  expectHttp('operator local session logout',res,[200,204]);
  operatorSession=null;
  res=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:usedRefresh}});
  if(res.status<400)throw new Error('Logged-out operator refresh token still usable');
  report('logged-out refresh token rejected',res.status);
  // Supabase access JWTs may remain valid until expiry after sign-out.
  // This audit does not assert immediate invalidation of issued access JWTs.
  return {passed:result.length};
 }finally{
  // No global logout: do not terminate sessions on other devices.
  await signOutLocal(operatorSession);
  await signOutLocal(userSession);
 }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 runSignedAuthAudit().then(r=>console.log('Real signed Auth QA: '+r.passed+' checks passed; no credentials recorded'))
  .catch(e=>{console.error('Real signed Auth QA FAILED: '+e.message);process.exitCode=1});
}
