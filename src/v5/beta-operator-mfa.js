import {loadBetaBackendConfig} from './infrastructure/supabase-beta.js';

const root=document.getElementById('footmate-beta-operator');
const SESSION_KEY='footmate:beta:auth:v1';

if(root){
  let config=null;
  let session=null;
  let user=null;
  let factor=null;
  let enrollment=null;
  let busy=false;
  let error='';

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char));
  const readSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
  const writeSession=payload=>{
    const accessToken=String(payload?.access_token||'').trim(),refreshToken=String(payload?.refresh_token||'').trim();
    if(!accessToken||!refreshToken)return false;
    session={accessToken,refreshToken,expiresAt:Number(payload?.expires_at||0)||Math.floor(Date.now()/1000)+Number(payload?.expires_in||3600)};
    localStorage.setItem(SESSION_KEY,JSON.stringify(session));return true;
  };
  const parseAal=token=>{
    try{const raw=String(token||'').split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return String(JSON.parse(atob(raw))?.aal||'aal1')}catch{return null}
  };
  async function request(path,{method='GET',body=null,accessToken=session?.accessToken}={}){
    const response=await fetch(`${config.url}${path}`,{method,headers:{apikey:config.publishableKey,accept:'application/json',...(accessToken?{authorization:`Bearer ${accessToken}`}:{}),...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});
    const payload=await response.json().catch(()=>null);
    if(!response.ok)throw new Error(payload?.message||payload?.error_description||payload?.error||`요청 실패 (${response.status})`);
    return payload;
  }
  async function refreshSession(){
    const stored=readSession();if(!stored?.refreshToken)return false;
    const payload=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:stored.refreshToken},accessToken:null});
    return writeSession(payload);
  }
  async function operatorMembership(){
    const rows=await request('/rest/v1/operators?select=user_id&limit=1');return Array.isArray(rows)?rows[0]||null:null;
  }
  async function launchConsole(){
    await import('/src/v5/beta-operator.js?v=1');
    const launchReadiness=()=>{
      const status=root.querySelector('.fm-beta-status-card p');if(status)status.textContent='Closed Beta는 무료 경기 운영만 지원합니다. DB 기반 in-app·transactional email·Web Push와 media storage가 연결되어 있고 실제 PG는 연결하지 않습니다.';
      const footer=root.querySelector('.fm-beta-footer');if(footer)footer.textContent='Operator Console · Supabase connected · MFA protected · In-app + Transactional email + Web Push + Media connected · Payment = not connected';
      return import('/src/v5/beta-operator-readiness.js?v=1');
    };
    if(root.dataset.operatorState!=='booting')void launchReadiness();
    else{
      const observer=new MutationObserver(()=>{if(root.dataset.operatorState==='booting')return;observer.disconnect();void launchReadiness()});
      observer.observe(root,{attributes:true,attributeFilter:['data-operator-state']});
    }
  }
  function verifiedTotp(){return (user?.factors||[]).find(item=>item.factor_type==='totp'&&item.status==='verified')||null}
  function unverifiedTotp(){return (user?.factors||[]).find(item=>item.factor_type==='totp'&&item.status!=='verified')||null}
  function renderGate(){
    root.dataset.operatorState='mfa-required';
    const qr=enrollment?.totp?.qr_code||'';
    const secret=enrollment?.totp?.secret||'';
    const hasVerified=Boolean(factor);
    root.innerHTML=`<div class="fm-beta-shell"><header class="fm-beta-topbar"><div class="fm-beta-brand"><span class="fm-beta-mark">FM</span><span>FootMate Operator</span></div><a class="fm-beta-button" href="/beta">사용자 Beta</a></header><section class="fm-beta-panel fm-operator-mfa" aria-labelledby="operator-mfa-title"><span class="fm-beta-eyebrow">OPERATOR SECURITY · TOTP</span><h1 id="operator-mfa-title">${hasVerified?'운영자 MFA 확인':'운영자 MFA 설정'}</h1><p>${hasVerified?'Authenticator 앱의 6자리 코드를 확인하면 운영 콘솔을 엽니다.':'운영자 전용 데이터와 변경 작업은 AAL2 세션에서만 허용됩니다. Authenticator 앱에 TOTP를 등록해주세요.'}</p>${error?`<div class="fm-beta-note" data-tone="error">${esc(error)}</div>`:''}${!hasVerified&&!enrollment?`<button class="fm-beta-button fm-beta-button--primary" type="button" data-mfa-action="enroll" ${busy?'disabled':''}>Authenticator 설정 시작</button>`:''}${enrollment?`<div class="fm-operator-mfa-setup">${qr?`<img src="${esc(qr)}" alt="FootMate Operator TOTP QR 코드">`:''}<div><strong>Authenticator 앱에 등록</strong>${secret?`<code>${esc(secret)}</code>`:''}<small>QR을 스캔한 뒤 앱에 표시되는 코드를 입력하세요.</small></div></div>`:''}${hasVerified||enrollment?`<form data-mfa-form="verify"><label class="fm-beta-field"><span>인증 코드</span><input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required placeholder="000000"></label><button class="fm-beta-button fm-beta-button--primary" ${busy?'disabled':''}>${busy?'확인 중…':'MFA 확인'}</button></form>`:''}${!hasVerified&&unverifiedTotp()&&!enrollment?'<button class="fm-beta-link" type="button" data-mfa-action="reset">미완료 설정 다시 시작</button>':''}<div class="fm-beta-note">운영자 membership 확인은 1차 로그인으로 가능하지만, draft 경기·참가자·운영 지표 조회와 모든 operator RPC는 DB에서 <b>aal2</b>를 요구합니다.</div></section></div>`;
  }
  async function enroll(){
    busy=true;error='';renderGate();
    try{
      const pending=unverifiedTotp();if(pending?.id)await request(`/auth/v1/factors/${encodeURIComponent(pending.id)}`,{method:'DELETE'});
      enrollment=await request('/auth/v1/factors',{method:'POST',body:{factor_type:'totp',friendly_name:'FootMate Operator'}});
      factor=enrollment;user=await request('/auth/v1/user');
    }catch(e){error=String(e?.message||e)}finally{busy=false;renderGate()}
  }
  async function verify(code){
    busy=true;error='';renderGate();
    try{
      const active=factor||enrollment;if(!active?.id)throw new Error('TOTP factor를 찾지 못했습니다.');
      const challenge=await request(`/auth/v1/factors/${encodeURIComponent(active.id)}/challenge`,{method:'POST',body:{}});
      const payload=await request(`/auth/v1/factors/${encodeURIComponent(active.id)}/verify`,{method:'POST',body:{challenge_id:challenge.id,code}});
      if(!writeSession(payload))throw new Error('MFA 세션을 갱신하지 못했습니다.');
      location.reload();
    }catch(e){error=String(e?.message||e);busy=false;renderGate()}
  }
  async function boot(){
    try{
      config=await loadBetaBackendConfig();session=readSession();
      if(!session?.refreshToken){await launchConsole();return}
      try{await refreshSession()}catch{await launchConsole();return}
      const membership=await operatorMembership();if(!membership){await launchConsole();return}
      const aal=parseAal(session.accessToken);
      // Real Supabase access tokens always carry AAL. Null keeps legacy QA/local mock tokens compatible;
      // database policies remain the authoritative production enforcement boundary.
      if(aal===null||aal==='aal2'){await launchConsole();return}
      user=await request('/auth/v1/user');factor=verifiedTotp();renderGate();
    }catch(e){error=String(e?.message||e);renderGate()}
  }
  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-mfa-action]');if(!target)return;
    if(target.dataset.mfaAction==='enroll'||target.dataset.mfaAction==='reset')void enroll();
  });
  root.addEventListener('submit',event=>{
    const form=event.target.closest('[data-mfa-form="verify"]');if(!form)return;
    event.preventDefault();const code=String(new FormData(form).get('code')||'').trim();if(/^\d{6}$/.test(code))void verify(code);
  });
  void boot();
}
