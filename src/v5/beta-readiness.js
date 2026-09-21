import {loadBetaBackendConfig,BETA_SIGNUP_PASSWORD_MIN_LENGTH} from './infrastructure/supabase-beta.js';
import {createBetaReadinessClient} from './infrastructure/supabase-beta-readiness.js';

const root=document.getElementById('footmate-beta');
const SESSION_KEY='footmate:beta:auth:v1';
const RECOVERY_KEY='footmate:beta:recovery:v1';

if(root){
  let client=null;
  let refreshing=false;
  let lastRefresh=0;
  let participations=[];
  let matchById=new Map();
  let notifications=[];
  let localNotice=null;
  let suppressMutations=false;

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const readSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
  const recoveryPending=()=>sessionStorage.getItem(RECOVERY_KEY)==='1';

  function consumeRecoveryHash(){
    const params=new URLSearchParams(String(location.hash||'').replace(/^#/,''));
    if(params.get('type')!=='recovery')return;
    const accessToken=String(params.get('access_token')||'').trim();
    const refreshToken=String(params.get('refresh_token')||'').trim();
    if(!accessToken||!refreshToken)return;
    const expiresIn=Number(params.get('expires_in')||3600)||3600;
    localStorage.setItem(SESSION_KEY,JSON.stringify({accessToken,refreshToken,expiresAt:Math.floor(Date.now()/1000)+expiresIn}));
    sessionStorage.setItem(RECOVERY_KEY,'1');
  }

  function format(value){
    if(!value)return '미설정';
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return '미설정';
    return new Intl.DateTimeFormat('ko-KR',{month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
  }

  function notice(message,tone='info'){
    localNotice=message?{message,tone}:null;
    enhance();
  }

  function injectNotice(){
    const existing=root.querySelector('[data-readiness-notice]');
    if(!localNotice){existing?.remove();return}
    const signature=`${localNotice.tone}|${localNotice.message}`;
    if(existing?.dataset.readinessSignature===signature)return;
    if(existing){
      existing.dataset.readinessSignature=signature;
      existing.dataset.tone=localNotice.tone;
      existing.textContent=localNotice.message;
      return;
    }
    const hero=root.querySelector('.fm-beta-hero');
    if(!hero)return;
    hero.insertAdjacentHTML('afterend',`<div class="fm-beta-note" data-readiness-notice data-tone="${esc(localNotice.tone)}" style="margin-bottom:18px">${esc(localNotice.message)}</div>`);
    const node=root.querySelector('[data-readiness-notice]');
    if(node)node.dataset.readinessSignature=signature;
  }

  function currentEmail(){return String(root.querySelector('#beta-auth-panel input[name="email"]')?.value||'').trim()}

  function injectRecoveryActions(){
    const form=root.querySelector('#beta-auth-panel form[data-form="auth"]');
    if(!form||form.querySelector('[data-readiness-auth-actions]'))return;
    form.insertAdjacentHTML('beforeend',`<div data-readiness-auth-actions class="fm-beta-actions" style="justify-content:flex-start;gap:12px;flex-wrap:wrap"><button class="fm-beta-link" type="button" data-readiness-action="forgot-password">비밀번호 찾기</button><button class="fm-beta-link" type="button" data-readiness-action="resend-signup">가입 인증메일 다시 보내기</button></div>`);
  }

  function injectRecoveryPanel(){
    if(!recoveryPending()||!readSession()?.accessToken)return;
    const hero=root.querySelector('.fm-beta-hero');
    if(!hero||root.querySelector('[data-readiness-recovery]'))return;
    hero.insertAdjacentHTML('afterend',`<div class="fm-beta-panel" data-readiness-recovery style="margin-bottom:18px"><div class="fm-beta-panel-head"><div><h2>새 비밀번호 설정</h2><p>복구 링크가 확인됐습니다. 새 비밀번호를 설정하면 현재 기기에서 로그인 상태를 이어갑니다.</p></div></div><form class="fm-beta-stack" data-readiness-form="update-password"><label class="fm-beta-field"><span>새 비밀번호</span><input name="password" type="password" autocomplete="new-password" minlength="${BETA_SIGNUP_PASSWORD_MIN_LENGTH}" required placeholder="${BETA_SIGNUP_PASSWORD_MIN_LENGTH}자 이상"></label><label class="fm-beta-field"><span>새 비밀번호 확인</span><input name="confirmPassword" type="password" autocomplete="new-password" minlength="${BETA_SIGNUP_PASSWORD_MIN_LENGTH}" required></label><button class="fm-beta-button fm-beta-button--primary" type="submit">비밀번호 변경</button></form></div>`);
  }

  async function refreshState({force=false}={}){
    const session=readSession();
    if(!client||!session?.accessToken||refreshing)return;
    if(!force&&Date.now()-lastRefresh<5000)return;
    refreshing=true;
    try{
      const rows=await client.participation.listMine({accessToken:session.accessToken});
      participations=Array.isArray(rows)?rows:[];
      const ids=[...new Set(participations.map(item=>item.match_id).filter(Boolean))];
      const details=await Promise.all(ids.map(matchId=>client.matches.get({matchId,accessToken:session.accessToken}).catch(()=>null)));
      matchById=new Map(details.filter(Boolean).map(item=>[item.id,item]));
      const nextNotifications=await client.notifications.listMine({accessToken:session.accessToken,limit:20});
      notifications=Array.isArray(nextNotifications)?nextNotifications:[];
      lastRefresh=Date.now();
    }catch(error){
      lastRefresh=Date.now();
      notice(String(error?.message||'Beta 운영 상태를 불러오지 못했습니다.'),'error');
    }finally{
      refreshing=false;
      enhance();
    }
  }

  function injectParticipationReadiness(){
    root.querySelectorAll('.fm-beta-participation').forEach(container=>{
      const cancelButton=container.querySelector('[data-action="cancel"][data-match-id]');
      const matchId=cancelButton?.dataset.matchId;
      if(!matchId)return;
      const participation=participations.find(item=>item.match_id===matchId&&item.status==='confirmed');
      const match=matchById.get(matchId);
      if(!participation||!match){container.querySelector('[data-readiness-participation]')?.remove();delete container.dataset.readinessSignature;return}
      const now=Date.now();
      const cutoff=match.cancel_cutoff_at?new Date(match.cancel_cutoff_at).getTime():null;
      const checkOpen=match.check_in_opens_at?new Date(match.check_in_opens_at).getTime():null;
      const endAt=new Date(match.starts_at).getTime()+Number(match.duration_minutes||0)*60_000;
      const cancelClosed=cutoff!==null&&now>=cutoff;
      const canCheckIn=!participation.checked_in_at&&checkOpen!==null&&now>=checkOpen&&now<=endAt&&['open','full'].includes(match.status);
      const signature=[participation.checked_in_at||'',match.cancel_cutoff_at||'',match.check_in_opens_at||'',String(cancelClosed),String(canCheckIn)].join('|');
      if(container.dataset.readinessSignature===signature)return;
      container.dataset.readinessSignature=signature;
      container.querySelector('[data-readiness-participation]')?.remove();
      if(cancelButton){cancelButton.disabled=cancelClosed;cancelButton.textContent=cancelClosed?'취소 마감':'참가 취소'}
      const checkMarkup=participation.checked_in_at?`<span class="fm-beta-badge">체크인 완료 · ${esc(format(participation.checked_in_at))}</span>`:canCheckIn?`<button class="fm-beta-button fm-beta-button--primary" type="button" data-readiness-action="check-in" data-match-id="${esc(matchId)}">경기 체크인</button>`:`<span class="fm-beta-badge">체크인 ${esc(match.check_in_opens_at?format(match.check_in_opens_at):'시간 미설정')}</span>`;
      container.insertAdjacentHTML('beforeend',`<div data-readiness-participation class="fm-beta-note" style="margin-top:10px"><div>취소 마감 · <strong>${esc(match.cancel_cutoff_at?format(match.cancel_cutoff_at):'운영자 미설정')}</strong></div><div class="fm-beta-actions" style="margin-top:8px">${checkMarkup}</div></div>`);
    });
  }

  function injectNotifications(){
    const aside=root.querySelector('.fm-beta-grid aside');
    if(!aside)return;
    const signature=notifications.map(item=>`${item.id}:${item.read_at||''}:${item.created_at||''}`).join('|');
    const existing=aside.querySelector('[data-readiness-notifications]');
    if(existing?.dataset.readinessSignature===signature)return;
    existing?.remove();
    const unread=notifications.filter(item=>!item.read_at).length;
    const body=notifications.length?notifications.map(item=>`<div class="fm-beta-participation" style="margin-top:8px"><strong>${esc(item.title)}</strong><p>${esc(item.body)}</p><div class="fm-beta-actions" style="margin-top:8px"><span>${esc(format(item.created_at))}</span>${item.read_at?'':`<button class="fm-beta-link" type="button" data-readiness-action="read-notification" data-notification-id="${esc(item.id)}">확인</button>`}</div></div>`).join(''):`<div class="fm-beta-empty"><strong>새 알림이 없습니다.</strong>참가·취소·체크인·경기 종료 상태가 이곳에 기록됩니다.</div>`;
    aside.insertAdjacentHTML('beforeend',`<div class="fm-beta-panel" data-readiness-notifications><div class="fm-beta-panel-head"><div><h3>운영 알림</h3><p>실제 참가 상태에서 생성된 in-app 알림입니다.</p></div>${unread?`<span class="fm-beta-badge">미확인 ${unread}</span>`:''}</div>${body}</div>`);
    const panel=aside.querySelector('[data-readiness-notifications]');
    if(panel)panel.dataset.readinessSignature=signature;
  }

  function enhance(){
    suppressMutations=true;
    injectRecoveryActions();
    injectRecoveryPanel();
    injectNotice();
    if(readSession()?.accessToken){injectParticipationReadiness();injectNotifications();void refreshState()}
    queueMicrotask(()=>{suppressMutations=false});
  }

  function scheduleOwnEmailDispatch(){
    const session=readSession();
    if(!client||!session?.accessToken)return;
    for(const delay of [1200,4000]){
      setTimeout(()=>void client.notifications.dispatchEmail({accessToken:session.accessToken}),delay);
    }
  }

  root.addEventListener('click',async event=>{
    const target=event.target.closest('[data-readiness-action]');
    if(!target||!client)return;
    const action=target.dataset.readinessAction;
    if(action==='forgot-password'||action==='resend-signup'){
      const email=currentEmail();
      if(!email){notice('이메일을 입력한 뒤 다시 시도해주세요.','error');root.querySelector('#beta-auth-panel input[name="email"]')?.focus();return}
      target.disabled=true;
      try{
        const redirectTo=`${location.origin}/beta`;
        if(action==='forgot-password'){await client.auth.recover({email,redirectTo});notice('비밀번호 재설정 이메일을 요청했습니다. 메일의 복구 링크를 확인해주세요.','success')}
        else{await client.auth.resendSignup({email,redirectTo});notice('가입 인증메일을 다시 요청했습니다. 받은편지함과 스팸함을 확인해주세요.','success')}
      }catch(error){notice(String(error?.message||'이메일 요청을 처리하지 못했습니다.'),'error')}
      target.disabled=false;return;
    }
    if(action==='check-in'){
      const session=readSession();if(!session?.accessToken)return;target.disabled=true;
      try{await client.participation.checkIn({accessToken:session.accessToken,matchId:target.dataset.matchId});notice('체크인이 완료됐습니다.','success');await refreshState({force:true})}
      catch(error){notice(String(error?.message||'체크인을 완료하지 못했습니다.'),'error')}
      target.disabled=false;return;
    }
    if(action==='read-notification'){
      const session=readSession();if(!session?.accessToken)return;
      try{await client.notifications.markRead({accessToken:session.accessToken,notificationId:target.dataset.notificationId});await refreshState({force:true})}
      catch(error){notice(String(error?.message||'알림 상태를 변경하지 못했습니다.'),'error')}
    }
  });

  root.addEventListener('click',event=>{
    const baseAction=event.target.closest('[data-action]')?.dataset.action;
    if(baseAction==='join'||baseAction==='cancel')scheduleOwnEmailDispatch();
  },true);

  root.addEventListener('submit',async event=>{
    const form=event.target.closest('[data-readiness-form="update-password"]');
    if(!form||!client)return;
    event.preventDefault();
    const session=readSession();
    if(!session?.accessToken){notice('복구 세션이 만료됐습니다. 비밀번호 찾기를 다시 진행해주세요.','error');return}
    const data=new FormData(form),password=String(data.get('password')||''),confirmation=String(data.get('confirmPassword')||'');
    if(password.length<BETA_SIGNUP_PASSWORD_MIN_LENGTH){notice(`비밀번호는 ${BETA_SIGNUP_PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,'error');return}
    if(password!==confirmation){notice('새 비밀번호 확인이 일치하지 않습니다.','error');return}
    const button=form.querySelector('button[type="submit"]');if(button)button.disabled=true;
    try{await client.auth.updatePassword({accessToken:session.accessToken,password});sessionStorage.removeItem(RECOVERY_KEY);history.replaceState(null,'',`${location.pathname}${location.search}`);location.replace('/beta')}
    catch(error){notice(String(error?.message||'비밀번호를 변경하지 못했습니다.'),'error');if(button)button.disabled=false}
  },true);

  const observer=new MutationObserver(()=>{if(!suppressMutations)enhance()});
  observer.observe(root,{childList:true,subtree:true});

  consumeRecoveryHash();
  void (async()=>{
    try{const config=await loadBetaBackendConfig();client=createBetaReadinessClient(config);enhance();await refreshState({force:true})}
    catch(error){notice(String(error?.message||'Beta readiness 연결을 확인하지 못했습니다.'),'error')}
  })();
}
