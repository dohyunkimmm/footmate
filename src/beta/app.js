import {createSupabaseBetaClient,loadBetaBackendConfig,SupabaseBetaError,BETA_SIGNUP_PASSWORD_MIN_LENGTH} from './infrastructure/supabase-beta.js';
import {normalizeBetaMatches,BETA_MATCH_POSITIONS} from './domain/beta-match-contract.js';

const root=document.getElementById('footmate-beta');
const SESSION_KEY='footmate:beta:auth:v1';
const LEVELS=['입문','초중급','중급','중급+'];
const POSITION_LABELS={MF:'MF · 미드필더',FW:'FW · 공격수',DF:'DF · 수비수',GK:'GK · 골키퍼'};

if(root){
  let client=null;
  let backendState='connecting';
  let authMode='signin';
  let session=null;
  let user=null;
  let profile=null;
  let matches=[];
  let participations=[];
  let matchesError=null;
  let busy=false;
  let notice=null;
  let lastSyncedAt=null;

  function esc(value){
    return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  }

  function storedSession(){
    try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}
  }

  function writeSession(payload){
    const accessToken=String(payload?.access_token||'').trim();
    const refreshToken=String(payload?.refresh_token||'').trim();
    if(!accessToken||!refreshToken)return null;
    const next={
      accessToken,
      refreshToken,
      expiresAt:Number(payload?.expires_at||0)||Math.floor(Date.now()/1000)+Number(payload?.expires_in||3600)
    };
    localStorage.setItem(SESSION_KEY,JSON.stringify(next));
    session=next;
    if(payload?.user)user=payload.user;
    return next;
  }

  function clearSession(){
    localStorage.removeItem(SESSION_KEY);
    session=null;
    user=null;
    profile=null;
    participations=[];
  }

  function formatStart(value){
    const date=new Date(value);
    return new Intl.DateTimeFormat('ko-KR',{month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
  }

  function formatSync(value){
    if(!value)return '동기화 대기';
    return `${new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(value))} 동기화`;
  }

  function friendlyError(error){
    const raw=String(error?.message||'요청을 처리하지 못했습니다.');
    const code=String(error?.code||'').toUpperCase();
    if(/password must be at least/i.test(raw))return `가입 비밀번호는 ${BETA_SIGNUP_PASSWORD_MIN_LENGTH}자 이상으로 설정해주세요.`;
    if(code.includes('INVALID')||/invalid login credentials/i.test(raw))return '이메일 또는 비밀번호를 확인해주세요.';
    if(/email not confirmed/i.test(raw))return '가입 확인 이메일을 확인한 뒤 로그인해주세요.';
    if(/user already registered|already been registered/i.test(raw))return '이미 가입된 이메일입니다. 로그인해주세요.';
    if(/POSITION_FULL/.test(raw))return '선택한 포지션 자리가 방금 마감됐습니다. 경기 정보를 새로고침했습니다.';
    if(/MATCH_FULL/.test(raw))return '경기 정원이 방금 마감됐습니다.';
    if(/MATCH_STARTED/.test(raw))return '이미 시작된 경기에는 참가할 수 없습니다.';
    if(/AUTH_REQUIRED/.test(raw))return '로그인이 필요합니다.';
    if(error instanceof SupabaseBetaError&&error.status>=500)return '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.';
    return raw;
  }

  function setNotice(message,tone='info'){
    notice=message?{message,tone}:null;
  }

  function participationFor(matchId){
    return participations.find(item=>item.match_id===matchId&&item.status==='confirmed')||null;
  }

  function renderAuth(){
    if(!session||!user){
      const signup=authMode==='signup';
      return `<div class="fm-beta-panel" id="beta-auth-panel">
        <div class="fm-beta-panel-head"><div><h2>${signup?'Closed Beta 가입':'로그인'}</h2><p>${signup?'실제 참가 기록을 저장할 계정을 만듭니다.':'참가·취소 상태를 내 계정에 연결합니다.'}</p></div></div>
        <form class="fm-beta-stack" data-form="auth">
          ${signup?`<label class="fm-beta-field"><span>이름</span><input name="displayName" autocomplete="name" maxlength="40" placeholder="풋살러 이름"></label>`:''}
          <label class="fm-beta-field"><span>이메일</span><input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label>
          <label class="fm-beta-field"><span>비밀번호</span><input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" ${signup?`minlength="${BETA_SIGNUP_PASSWORD_MIN_LENGTH}"`:''} required placeholder="${signup?`${BETA_SIGNUP_PASSWORD_MIN_LENGTH}자 이상`:'비밀번호'}"></label>
          <button class="fm-beta-button fm-beta-button--primary" type="submit" ${busy?'disabled':''}>${busy?'<span class="fm-beta-spinner"></span>처리 중':signup?'가입하기':'로그인'}</button>
          <button class="fm-beta-link" type="button" data-action="toggle-auth">${signup?'이미 계정이 있어요 · 로그인':'처음이에요 · 가입하기'}</button>
        </form>
      </div>`;
    }

    const p=profile||{};
    return `<div class="fm-beta-panel">
      <div class="fm-beta-panel-head"><div class="fm-beta-user"><span class="fm-beta-avatar">${esc((p.display_name||user.email||'F').slice(0,1).toUpperCase())}</span><div><strong>${esc(p.display_name||'FootMate 사용자')}</strong><span>${esc(user.email||'')}</span></div></div><button class="fm-beta-link" type="button" data-action="signout">로그아웃</button></div>
      <form class="fm-beta-stack" data-form="profile">
        <label class="fm-beta-field"><span>이름</span><input name="displayName" maxlength="40" value="${esc(p.display_name||'')}" placeholder="풋살러 이름"></label>
        <label class="fm-beta-field"><span>생활권</span><input name="region" maxlength="80" value="${esc(p.region||'')}" placeholder="예: 수원 · 영통"></label>
        <label class="fm-beta-field"><span>선호 포지션</span><select name="position"><option value="">선택해주세요</option>${BETA_MATCH_POSITIONS.map(position=>`<option value="${position}" ${p.position===position?'selected':''}>${POSITION_LABELS[position]}</option>`).join('')}</select></label>
        <label class="fm-beta-field"><span>체감 레벨</span><select name="level"><option value="">선택해주세요</option>${LEVELS.map(level=>`<option value="${level}" ${p.level===level?'selected':''}>${level}</option>`).join('')}</select></label>
        <button class="fm-beta-button" type="submit" ${busy?'disabled':''}>프로필 저장</button>
      </form>
      <div class="fm-beta-note" style="margin-top:12px">저장 데이터: 이메일 · 이름 · 생활권 · 포지션 · 레벨 · 참가 상태. 결제 정보와 메시지 내용은 저장하지 않습니다.</div>
      <div class="fm-beta-actions" style="margin-top:12px"><button class="fm-beta-button fm-beta-button--danger" type="button" data-action="delete-account" ${busy?'disabled':''}>계정·참가 데이터 삭제</button></div>
    </div>`;
  }

  function renderParticipation(){
    if(!session||!user)return '';
    const confirmed=participations.filter(item=>item.status==='confirmed');
    return `<div class="fm-beta-panel">
      <div class="fm-beta-panel-head"><div><h3>내 참가</h3><p>Supabase에 저장된 현재 참가 상태입니다.</p></div></div>
      ${confirmed.length?confirmed.map(item=>{
        const match=matches.find(candidate=>candidate.id===item.match_id);
        return `<div class="fm-beta-participation"><strong>${esc(match?.title||'참가 경기')} · ${esc(item.position||'')}</strong><p>${match?`${esc(formatStart(match.startsAt))} · ${esc(match.place)}`:'경기 정보를 불러오는 중입니다.'}</p><div class="fm-beta-actions" style="margin-top:10px"><button class="fm-beta-button fm-beta-button--danger" type="button" data-action="cancel" data-match-id="${esc(item.match_id)}" ${busy?'disabled':''}>참가 취소</button></div></div>`;
      }).join(''):`<div class="fm-beta-empty"><strong>아직 참가한 경기가 없습니다.</strong>경기를 고른 뒤 포지션 자리까지 확인하고 참가할 수 있어요.</div>`}
    </div>`;
  }

  function renderMatch(match){
    const p=profile||{};
    const position=p.position||'';
    const slot=position?Number(match.positionSlots[position]||0):null;
    const joined=participationFor(match.id);
    let label='로그인 후 참가';
    let disabled=false;
    let action='focus-auth';
    if(session&&user){
      action='join';
      if(joined){label='참가 중';disabled=true}
      else if(!position){label='포지션 설정 필요';disabled=true}
      else if(match.status!=='open'||match.remaining<=0){label='경기 마감';disabled=true}
      else if(slot<=0){label=`${position} 마감`;disabled=true}
      else label=`${position}로 참가`;
    }
    const availability=match.status==='full'||match.remaining<=0?'마감':`${match.remaining}자리 남음`;
    return `<article class="fm-beta-match" data-match-id="${esc(match.id)}">
      <div class="fm-beta-match-top"><div><h3>${esc(match.title)}</h3><div class="fm-beta-match-place">${esc(match.place)}${match.area?` · ${esc(match.area)}`:''}</div></div><span class="fm-beta-badge">${esc(availability)}</span></div>
      <div class="fm-beta-meta"><span>${esc(formatStart(match.startsAt))}</span><span>${esc(match.level)}</span><span>${esc(match.format||'경기')}</span><span>${esc(match.surface||'구장')}</span><span>${match.durationMin}분</span></div>
      <div class="fm-beta-slots">${BETA_MATCH_POSITIONS.map(item=>`<div class="fm-beta-slot"><b>${item}</b><span>${Number(match.positionSlots[item]||0)}자리</span></div>`).join('')}</div>
      <div class="fm-beta-match-actions"><span class="fm-beta-price">${match.price===0?'Beta 무료 참가':`${new Intl.NumberFormat('ko-KR').format(match.price)}원`}</span><button class="fm-beta-button fm-beta-button--primary" type="button" data-action="${action}" data-match-id="${esc(match.id)}" ${disabled||busy?'disabled':''}>${esc(label)}</button></div>
    </article>`;
  }

  function renderMatches(){
    if(backendState==='connecting')return `<div class="fm-beta-empty"><span class="fm-beta-spinner"></span>실제 경기 데이터를 연결하고 있습니다.</div>`;
    if(matchesError)return `<div class="fm-beta-empty"><strong>경기 데이터를 불러오지 못했습니다.</strong>${esc(matchesError)}<div class="fm-beta-actions" style="justify-content:center;margin-top:12px"><button class="fm-beta-button" data-action="refresh" type="button">다시 시도</button></div></div>`;
    if(!matches.length)return `<div class="fm-beta-empty"><strong>아직 공개된 실제 경기가 없습니다.</strong>운영자가 Closed Beta 경기를 공개하면 이곳에 바로 표시됩니다.</div>`;
    return `<div class="fm-beta-match-list">${matches.map(renderMatch).join('')}</div>`;
  }

  function render(){
    root.dataset.betaState=backendState==='error'?'error':backendState==='connected'?'ready':'booting';
    const connected=backendState==='connected';
    root.innerHTML=`<div class="fm-beta-shell">
      <header class="fm-beta-topbar"><div class="fm-beta-brand"><span class="fm-beta-mark">FM</span><span>FootMate</span></div><span class="fm-beta-live" data-beta-backend="${connected?'connected':backendState==='error'?'error':'connecting'}">${connected?'Supabase Connected':backendState==='error'?'Backend Error':'Connecting'}</span></header>
      <section class="fm-beta-hero"><div class="fm-beta-hero-copy"><span class="fm-beta-eyebrow">Closed Beta · 실제 참가 데이터</span><h1>찾고,<br>자리 확인하고,<br>실제로 참가.</h1><p>이 경로는 sample catalog가 아니라 Supabase의 실제 경기·회원·참가 상태를 사용합니다. Beta 기간에는 결제 없이 무료 참가만 허용됩니다.</p></div><div class="fm-beta-status-card"><div><small>현재 연결 상태</small><strong>${connected?'Live backend':'연결 확인 중'}</strong></div><p>${session&&user?'로그인된 계정의 프로필과 참가 기록을 복구했습니다.':'경기 조회는 공개되어 있고, 참가하려면 이메일 계정으로 로그인합니다.'}</p></div></section>
      ${notice?`<div class="fm-beta-note" data-tone="${esc(notice.tone)}" style="margin-bottom:18px">${esc(notice.message)}</div>`:''}
      ${backendState==='error'?`<div class="fm-beta-panel"><div class="fm-beta-empty"><strong>Closed Beta backend에 연결할 수 없습니다.</strong>잠시 후 다시 시도해주세요.<div class="fm-beta-actions" style="justify-content:center;margin-top:12px"><button class="fm-beta-button" type="button" data-action="retry-backend">연결 다시 시도</button></div></div></div>`:`<div class="fm-beta-grid"><aside>${renderAuth()}${renderParticipation()}</aside><section><div class="fm-beta-panel"><div class="fm-beta-panel-head"><div><h2>실제 경기</h2><p>공개된 경기와 포지션별 잔여 자리를 DB에서 직접 읽습니다. · ${esc(formatSync(lastSyncedAt))}</p></div><button class="fm-beta-button" type="button" data-action="refresh" ${busy?'disabled':''}>새로고침</button></div>${renderMatches()}</div></section></div>`}
      <footer class="fm-beta-footer">Closed Beta · Auth / Match / Capacity / Participation = Supabase connected · Payment / Notification = not connected</footer>
    </div>`;
  }

  async function loadMatches(){
    if(!client)return;
    try{
      matchesError=null;
      matches=normalizeBetaMatches(await client.matches.list({limit:50}));
    }catch(error){
      matches=[];
      matchesError=friendlyError(error);
    }
  }

  async function loadPrivate(){
    if(!client||!session)return;
    const authUser=user||await client.auth.getUser({accessToken:session.accessToken}).then(result=>result?.user||result);
    user=authUser;
    const [nextProfile,nextParticipations]=await Promise.all([
      client.profile.get({accessToken:session.accessToken,userId:user.id}),
      client.participation.listMine({accessToken:session.accessToken})
    ]);
    profile=nextProfile;
    participations=Array.isArray(nextParticipations)?nextParticipations:[];
  }

  async function restoreAuth(){
    const stored=storedSession();
    if(!stored?.refreshToken)return;
    try{
      const refreshed=await client.auth.refresh({refreshToken:stored.refreshToken});
      writeSession(refreshed);
      await loadPrivate();
    }catch{
      clearSession();
    }
  }

  async function refreshData(){
    await loadMatches();
    if(session)await loadPrivate();
    if(!matchesError)lastSyncedAt=Date.now();
  }

  async function run(task){
    if(busy)return;
    busy=true;render();
    try{await task()}
    catch(error){setNotice(friendlyError(error),'error')}
    finally{busy=false;render()}
  }

  async function boot(){
    backendState='connecting';render();
    try{
      const config=await loadBetaBackendConfig();
      client=createSupabaseBetaClient(config);
      backendState='connected';
      await Promise.all([loadMatches(),restoreAuth()]);
      if(session&&!profile)await loadPrivate();
      if(!matchesError)lastSyncedAt=Date.now();
      setNotice(null);
    }catch(error){
      backendState='error';
      setNotice(friendlyError(error),'error');
    }
    render();
  }

  root.addEventListener('submit',event=>{
    const form=event.target.closest('form[data-form]');
    if(!form)return;
    event.preventDefault();
    const data=new FormData(form);
    if(form.dataset.form==='auth'){
      run(async()=>{
        setNotice(null);
        const email=String(data.get('email')||'').trim();
        const password=String(data.get('password')||'');
        if(authMode==='signup'){
          const result=await client.auth.signUp({email,password,displayName:String(data.get('displayName')||'').trim()});
          if(result?.access_token){
            writeSession(result);await loadPrivate();await loadMatches();if(!matchesError)lastSyncedAt=Date.now();setNotice('가입과 로그인이 완료됐습니다. 프로필을 설정해주세요.','success');
          }else{
            authMode='signin';setNotice('가입 요청이 완료됐습니다. 확인 이메일이 온 경우 인증한 뒤 로그인해주세요.','success');
          }
        }else{
          const result=await client.auth.signIn({email,password});
          writeSession(result);await loadPrivate();await loadMatches();if(!matchesError)lastSyncedAt=Date.now();setNotice('로그인했습니다.','success');
        }
      });
    }
    if(form.dataset.form==='profile'){
      run(async()=>{
        const changes={display_name:String(data.get('displayName')||'').trim(),region:String(data.get('region')||'').trim(),position:String(data.get('position')||'').trim()||null,level:String(data.get('level')||'').trim()||null};
        profile=await client.profile.update({accessToken:session.accessToken,userId:user.id,changes});
        setNotice('프로필을 저장했습니다.','success');
      });
    }
  });

  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-action]');
    if(!target)return;
    const action=target.dataset.action;
    if(action==='toggle-auth'){authMode=authMode==='signin'?'signup':'signin';setNotice(null);render();return}
    if(action==='focus-auth'){root.querySelector('#beta-auth-panel')?.scrollIntoView({behavior:'smooth',block:'center'});return}
    if(action==='retry-backend'){boot();return}
    if(action==='refresh'){
      run(async()=>{await refreshData();setNotice(matchesError?matchesError:'경기와 참가 상태를 새로고침했습니다.',matchesError?'error':'success')});return;
    }
    if(action==='signout'){
      run(async()=>{try{await client.auth.signOut({accessToken:session.accessToken})}finally{clearSession();setNotice('로그아웃했습니다.','success')}});return;
    }
    if(action==='delete-account'){
      const confirmed=window.confirm('FootMate Closed Beta 계정과 프로필·참가 기록을 삭제합니다. 이 작업은 되돌릴 수 없습니다. 계속할까요?');
      if(!confirmed)return;
      run(async()=>{
        await client.auth.deleteAccount({accessToken:session.accessToken});
        clearSession();
        setNotice('계정과 연결된 Beta 개인정보·참가 기록을 삭제했습니다.','success');
      });return;
    }
    if(action==='join'){
      const matchId=target.dataset.matchId;
      run(async()=>{
        if(!profile?.position)throw new Error('프로필에서 선호 포지션을 먼저 설정해주세요.');
        await client.participation.join({accessToken:session.accessToken,matchId,position:profile.position});
        await refreshData();
        setNotice(`${profile.position} 포지션으로 참가가 확정됐습니다.`,'success');
      });return;
    }
    if(action==='cancel'){
      const matchId=target.dataset.matchId;
      run(async()=>{
        await client.participation.cancel({accessToken:session.accessToken,matchId});
        await refreshData();
        setNotice('참가를 취소했습니다. 잔여 자리가 복구됐습니다.','success');
      });
    }
  });

  window.addEventListener('online',()=>{
    if(backendState!=='connected'||busy)return;
    run(async()=>{await refreshData();if(!matchesError)setNotice('네트워크가 복구되어 최신 상태를 다시 불러왔습니다.','success')});
  });

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible'||backendState!=='connected'||busy)return;
    if(lastSyncedAt&&Date.now()-lastSyncedAt<60_000)return;
    run(async()=>{await refreshData()});
  });

  boot();
}