import {matchesRecommendationConditions,pickUnseenRecommendation} from './domain/recommendation-discovery.js';
import {isDemoEntry,isFutsalMatch,demoCatalog,demoParticipations,joinDemoMatch,cancelDemoMatch} from './demo-catalog.js';
import {createSupabaseBetaClient,loadBetaBackendConfig,SupabaseBetaError,BETA_SIGNUP_PASSWORD_MIN_LENGTH} from './infrastructure/supabase.js';
import {normalizeBetaMatches,BETA_MATCH_POSITIONS} from './domain/match-contract.js';
import {betaDirectionsUrl,betaCalendarUrl} from './attendance-links.js';
import {emitBetaMeasurement} from './measurement-events.js';

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
  let view=['home','matches','my'].includes(sessionStorage.getItem('footmate:beta:view:v1'))?sessionStorage.getItem('footmate:beta:view:v1'):'home';
  let visibleLimit=8;
  let demoPage=0;
  let previewExpanded=false;
  root.dataset.betaDemo=String(isDemoEntry);
  root.dataset.betaApp='true';
  let accountTab='profile';
  let openingOpen=isDemoEntry&&sessionStorage.getItem('footmate:beta:entered:v1')!=='1';
  let joinedPage=0;
  let matchesTab='joined';
  let authEntry='results';
  let detailMatchId=sessionStorage.getItem('footmate:beta:detail-match:v1')||'';
  let detailTab='info';
  function closeDetail(){detailMatchId='';detailTab='info';sessionStorage.removeItem('footmate:beta:detail-match:v1')}
  function setView(next){closeDetail();view=next;matchesTab='joined';sessionStorage.setItem('footmate:beta:view:v1',next);authOpen=false;render();window.scrollTo({top:0,behavior:'smooth'})}
  function exampleMatch(id){return matches.some(m=>m.id===id&&m.isDemo)||participations.some(p=>p.match_id===id&&p.is_demo)}
  let authOpen=Boolean(location.hash.includes('error')||sessionStorage.getItem('footmate:beta:social-auth-error:v1'));
  let recommendedIds=null,recommendationReasons={};
  let recommendationBusy=false,recommendationConditions='',recommendationAnchorId='';
  let seenRecommendations=new Set();
  let pendingMatchId=sessionStorage.getItem('footmate:beta:pending-match:v1')||'';
  function selectedPreferences(){try{return JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')||'null')||{}}catch{return{}}}


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
    profile=null;closeDetail();
    participations=[];view='home';sessionStorage.removeItem('footmate:beta:view:v1');
  }

  function formatStart(value){
    const date=new Date(value);
    return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
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
      const pending=matches.find(match=>match.id===pendingMatchId);
      return `<div class="fm-beta-panel fm-beta-auth-card" id="beta-auth-panel" data-auth-mode="${signup?'signup':'signin'}">
        <div class="fm-beta-login-brand"><img src="/src/app/assets/footmate-original.png" width="112" height="112" alt="FootMate 축구공 로고"><strong>FootMate</strong><p>로그인하고 함께 뛸 경기를 찾아보세요.</p></div>
        ${pending?`<section class="fm-beta-auth-match" aria-label="참가할 경기"><span>참가할 경기</span><strong>${esc(pending.title)}</strong><p>${esc(formatStart(pending.startsAt))}${selectedPreferences().position?` · ${esc(POSITION_LABELS[selectedPreferences().position]||selectedPreferences().position)}`:''}</p><p>로그인 후 이 경기의 참가를 이어갈 수 있어요. 로그인만으로 참가가 확정되지는 않아요.</p></section>`:''}
        <div class="fm-beta-panel-head"><div><h2 tabindex="-1">${signup?'회원가입':'로그인'}</h2><p>${signup?'경기 참가 정보를 저장할 계정을 만듭니다.':''}</p></div></div>
        <form class="fm-beta-stack" data-form="auth">
          ${signup?`<label class="fm-beta-field"><span>이름 · 선택</span><input name="displayName" autocomplete="name" maxlength="40" placeholder="풋살러 이름"></label>`:''}
          <label class="fm-beta-field"><span>이메일</span><input name="email" type="email" autocomplete="email" required placeholder="이메일" value="${esc(localStorage.getItem('footmate:beta:remember-email:v1')||'')}"></label>
          <label class="fm-beta-field"><span>비밀번호</span><input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" ${signup?`minlength="${BETA_SIGNUP_PASSWORD_MIN_LENGTH}"`:''} required placeholder="${signup?`${BETA_SIGNUP_PASSWORD_MIN_LENGTH}자 이상`:'비밀번호'}"></label>
          ${signup?`<p class="fm-beta-form-hint" id="beta-password-hint">비밀번호는 최소 ${BETA_SIGNUP_PASSWORD_MIN_LENGTH}자 이상입니다. 가입 후 이메일 인증이 필요할 수 있습니다.</p>
          <details class="fm-beta-data-details"><summary>가입 전 데이터 이용 안내</summary><p>이메일과 암호화된 로그인 정보, 선택한 이름과 경기·포지션·참가 기록이 실제 서버 계정과 연결됩니다. 결제는 연결하지 않았습니다.</p><p><a href="/beta-data-notice.html" target="_blank" rel="noopener noreferrer">Beta 데이터 이용 안내 전문 보기</a></p></details>
          <label class="fm-beta-consent"><input type="checkbox" name="dataNoticeAcknowledged" required> Beta의 실제 계정·참가 정보 처리 안내를 확인했습니다.</label>`:''}
          ${!signup?`<label class="fm-beta-remember-email"><input name="rememberEmail" type="checkbox" ${localStorage.getItem('footmate:beta:remember-email:v1')?'checked':''}><span>아이디 저장</span></label>`:''}
          <button class="fm-beta-button fm-beta-button--primary" type="submit" ${busy?'disabled':''}>${busy?'<span class="fm-beta-spinner"></span>처리 중':signup?'가입하기':'로그인'}</button>
          ${signup?'<button class="fm-beta-link" type="button" data-action="toggle-auth">이미 계정이 있어요 · 로그인</button>':'<nav class="fm-beta-account-links" aria-label="계정 도움말"><button class="fm-beta-link" type="button" data-readiness-action="forgot-password">비밀번호 찾기</button><span aria-hidden="true">|</span><button class="fm-beta-link" type="button" data-action="toggle-auth">회원가입</button></nav>'}
        </form>
      </div>`;
    }

    const saved=selectedPreferences();
    const p={...saved,...Object.fromEntries(Object.entries(profile||{}).filter(([,v])=>v!=null&&v!==''))};
    return `<div class="fm-beta-panel" id="beta-auth-panel">
      <div class="fm-beta-panel-head"><div class="fm-beta-user"><span class="fm-beta-avatar">${esc((p.display_name||user.email||'F').slice(0,1).toUpperCase())}</span><div><strong>${esc(p.display_name||'FootMate 사용자')}</strong><span>${esc(user.email||'')}</span></div></div><button class="fm-beta-link" type="button" data-action="signout">로그아웃</button></div>
      <form class="fm-beta-stack" data-form="profile">
        <label class="fm-beta-field"><span>이름</span><input name="displayName" maxlength="40" value="${esc(p.display_name||'')}" placeholder="풋살러 이름"></label>
        <label class="fm-beta-field"><span>생활권</span><input name="region" maxlength="80" value="${esc(p.region||'')}" placeholder="예: 수원 · 영통"></label>
        <label class="fm-beta-field"><span>선호 포지션</span><select name="position"><option value="">선택해주세요</option>${BETA_MATCH_POSITIONS.map(position=>`<option value="${position}" ${p.position===position?'selected':''}>${POSITION_LABELS[position]}</option>`).join('')}</select></label>
        <label class="fm-beta-field"><span>체감 레벨</span><select name="level"><option value="">선택해주세요</option>${LEVELS.map(level=>`<option value="${level}" ${p.level===level?'selected':''}>${level}</option>`).join('')}</select></label>
        <button class="fm-beta-button" type="submit" ${busy?'disabled':''}>프로필 저장</button>
      </form><details class="fm-beta-data-details"><summary>개인정보 안내</summary><p>저장 데이터: 이메일 · 이름 · 생활권 · 포지션 · 레벨 · 참가 상태. 결제 정보와 메시지 내용은 저장하지 않습니다.</p><a href="/beta-data-notice.html">자세히 보기</a></details>
      
      <div class="fm-beta-actions" style="margin-top:12px"><button class="fm-beta-button fm-beta-button--danger" type="button" data-action="delete-account" ${busy?'disabled':''}>계정·참가 데이터 삭제</button></div>
    </div>`;
  }

  function renderParticipation(){
    if(!session||!user)return '';
    const confirmed=participations.filter(item=>item.status==='confirmed');
    joinedPage=Math.min(joinedPage,Math.max(0,confirmed.length-1));
    return `<div class="fm-beta-panel">
      <div class="fm-beta-panel-head"><div><h3>내 경기</h3></div></div>
      ${confirmed.length?confirmed.slice(joinedPage,joinedPage+1).map(item=>{
        const match=matches.find(candidate=>candidate.id===item.match_id);
        return `<div class="fm-beta-participation">${item.is_demo?'<small class="fm-beta-demo-record">데모 경기</small>':''}<strong>${esc(match?.title||'참가 경기')} · ${esc(item.position||'')}</strong><p>${match?`${esc(formatStart(match.startsAt))} · ${esc(match.place)}`:'경기 정보를 불러오는 중입니다.'}</p>${match?attendanceLinks(match,true):''}<div class="fm-beta-actions" style="margin-top:10px"><button class="fm-beta-button fm-beta-button--danger" type="button" data-action="cancel" data-match-id="${esc(item.match_id)}" ${busy?'disabled':''}>참가 취소</button></div></div>`;
      }).join(''):`<div class="fm-beta-empty"><strong>아직 참가한 경기가 없습니다.</strong>경기를 고른 뒤 포지션 자리까지 확인하고 참가할 수 있어요.</div>`}
      ${confirmed.length>1?`<nav class="fm-beta-demo-pager" aria-label="내 경기 페이지"><button class="fm-beta-button" type="button" data-action="joined-prev" ${joinedPage===0?'disabled':''}>이전</button><span>${joinedPage+1} / ${confirmed.length}</span><button class="fm-beta-button" type="button" data-action="joined-next" ${joinedPage===confirmed.length-1?'disabled':''}>다음</button></nav>`:''}
    </div>`;
  }

  function attendanceLinks(match,joined){
    if(match.isDemo)return '';
    const directions=betaDirectionsUrl(match);
    const calendar=joined?betaCalendarUrl(match):null;
    if(!directions&&!calendar)return '';
    return `<nav class="fm-beta-attendance-links" aria-label="경기 장소·일정 편의 기능">
      ${directions?`<a href="${esc(directions)}" data-beta-measure="directions_opened" data-match-id="${esc(match.id)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(match.place)} 지도에서 검색, 새 창">지도에서 위치 확인 ↗</a>`:''}
      ${calendar?`<a href="${esc(calendar)}" data-beta-measure="calendar_opened" data-match-id="${esc(match.id)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(match.title)} Google 캘린더 일정 초안 열기, 새 창">일정에 추가 ↗</a>`:''}
    </nav>`;
  }

  function renderMatch(match,{detail=false}={}){
    const p=profile||{};
    const position=selectedPreferences().position||p.position||(match.isDemo?'MF':'');
    const slot=position?Number(match.positionSlots[position]||0):null;
    const joined=participationFor(match.id);
    let label='참가하기';
    let disabled=false;
    let action='focus-auth';
    if(session&&user){
      action='join';
      if(joined){label='참가 중';disabled=true}
      else if(!position){label='포지션 설정 필요';action='setup-position'}
      else if(match.status!=='open'||match.remaining<=0){label='경기 마감';disabled=true}
      else if(slot<=0){label=`${position} 마감`;disabled=true}
      else label=`${position}로 참가`;
    }
    const availability=match.status==='full'||match.remaining<=0?'마감':`${match.remaining}자리 남음`;
    return `<article class="fm-beta-match ${match.isDemo?'fm-beta-match--demo':''}" data-match-id="${esc(match.id)}" ${pendingMatchId===match.id?'data-pending-match="true"':''}>
      ${detail?'<div class="fm-beta-detail-body">':''}
      ${match.isDemo?`<div class="fm-beta-match-cover" aria-label="데모 경기"><span>${esc(match.format)} · 풋살</span><small>데모 경기</small><i aria-hidden="true"></i></div>`:''}
      ${recommendationReasons[match.id]?.some(reason=>reason!=='무료 참가')?`<p class="fm-beta-match-reason">${esc(recommendationReasons[match.id].filter(reason=>reason!=='무료 참가').join(' · '))}</p>`:''}
      <div class="fm-beta-match-top"><div><h3>${esc(match.title)}</h3><div class="fm-beta-match-place"><svg class="fm-beta-ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>${esc(match.place)}${match.area?` · ${esc(match.area)}`:''}</div></div><span class="fm-beta-badge">${esc(availability)}</span></div>
      <div class="fm-beta-meta"><span><svg class="fm-beta-ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${esc(formatStart(match.startsAt))}</span><span>${esc(match.level)}</span><span>${esc(match.format||'경기')}</span><span>${esc(match.surface||'구장')}</span><span>${match.durationMin}분</span></div>
      ${match.isDemo?'<details class="fm-beta-demo-slots"><summary>모집 포지션</summary>':''}<div class="fm-beta-slots">${BETA_MATCH_POSITIONS.map(item=>`<div class="fm-beta-slot"><b>${({MF:"미드필더",FW:"공격수",DF:"수비수",GK:"골키퍼"})[item]} <small>${item}</small></b><span><strong>${Number(match.positionSlots[item]||0)}</strong>자리</span></div>`).join('')}</div>
      ${match.isDemo?'</details>':''}${attendanceLinks(match,Boolean(joined))}
      ${detail?`<dl class="fm-beta-detail-facts"><div><dt>경기 일시</dt><dd>${esc(formatStart(match.startsAt))}</dd></div><div><dt>경기 장소</dt><dd>${esc(match.place)}${match.area?` · ${esc(match.area)}`:''}</dd></div><div><dt>경기 방식</dt><dd>${esc(match.format||'경기')} · ${match.durationMin}분 · ${esc(match.surface||'구장')}</dd></div><div><dt>권장 실력</dt><dd>${esc(match.level)}</dd></div></dl>`:''}
      ${detail?'</div>':''}<div class="fm-beta-match-actions"><span class="fm-beta-price">${match.price===0?'무료 참가':`${new Intl.NumberFormat('ko-KR').format(match.price)}원`}</span>${!detail?`<button class="fm-beta-button" type="button" data-action="match-detail" data-match-id="${esc(match.id)}">상세 보기</button>`:''}<button class="fm-beta-button fm-beta-button--primary" type="button" data-action="${action}" data-match-id="${esc(match.id)}" ${disabled||busy?'disabled':''}>${esc(label)}</button></div>
    </article>`;
  }

  function recommendationMatches(){
    const conditions=selectedPreferences();
    const available=matches.filter(match=>isFutsalMatch(match)&&matchesRecommendationConditions({
      ...match,remaining_spots:match.remaining,starts_at:match.startsAt,price_krw:match.price,
      positions:Object.keys(match.positionSlots),match_slots:Object.entries(match.positionSlots).map(([position,remaining_spots])=>({position,remaining_spots}))
    },conditions));
    return recommendedIds===null?available:recommendedIds.map(id=>available.find(match=>match.id===id)).filter(Boolean);
  }

  function renderMatches(){
    if(recommendationBusy)return '<div class="fm-beta-empty" role="status"><span class="fm-beta-spinner"></span>선택한 조건으로 추천을 준비하고 있어요.</div>';
    if(backendState==='connecting')return `<div class="fm-beta-empty"><span class="fm-beta-spinner"></span>경기를 불러오는 중입니다.</div>`;
    if(matchesError)return `<div class="fm-beta-empty"><strong>경기 데이터를 불러오지 못했습니다.</strong>${esc(matchesError)}<div class="fm-beta-actions" style="justify-content:center;margin-top:12px"><button class="fm-beta-button" data-action="refresh" type="button">다시 시도</button></div></div>`;
    if(!matches.length)return `<div class="fm-beta-empty"><strong>지금 참가할 수 있는 경기가 없어요.</strong><button class="fm-beta-button" type="button" data-action="refresh" ${busy?'disabled':''}>다시 확인</button></div>`;
    const visible=recommendationMatches();
    if(!visible.length)return `<div class="fm-beta-empty"><strong>조건에 맞는 경기가 없어요.</strong></div>`;

    const guest=!session||!user;
    const preview=guest&&!previewExpanded?visible.slice(0,3):visible;
    demoPage=Math.min(demoPage,preview.length-1);
    const current=preview[demoPage];
    seenRecommendations.add(current.id);
    const exhausted=visible.every(match=>seenRecommendations.has(match.id));
    const discovery=visible.length>1?`<div class="fm-beta-discovery"><p role="status">${exhausted?'조건에 맞는 경기를 모두 봤어요.':'조건은 유지하고, 아직 보지 않은 경기를 추천해요.'}</p><button class="fm-beta-button fm-beta-button--primary" type="button" data-action="${exhausted?'restart-discovery':'random-recommendation'}">${exhausted?'다시 둘러보기':'다른 경기 추천'}</button></div>`:'<p class="fm-beta-discovery-note">조건에 맞는 경기는 1개예요. 필터를 바꾸면 다른 경기를 찾을 수 있어요.</p>';
    const gatedNext=guest&&!previewExpanded&&demoPage===preview.length-1&&visible.length>preview.length;
    return `${guest?`<div class="fm-beta-preview-note"><span>조건에 맞는 경기 <b>${visible.length}개</b> · ${previewExpanded?'전체 보기':`${preview.length}개 미리보기`}</span></div>`:''}<div class="fm-beta-match-list">${renderMatch(current)}</div>${discovery}${preview.length>1?`<nav class="fm-beta-demo-pager" aria-label="추천 경기 페이지"><button class="fm-beta-button" type="button" data-action="demo-prev" ${demoPage===0?'disabled':''}>이전</button><span role="status">${demoPage+1} / ${preview.length}</span><button class="fm-beta-button" type="button" data-action="${gatedNext?'expand-preview':'demo-next'}" ${!gatedNext&&demoPage===preview.length-1?'disabled':''}>${gatedNext?'전체 추천 보기':'다음'}</button></nav>`:''}`;
  }



  function renderDetail(match){
    const card=renderMatch(match,{detail:true}).replace('<details class="fm-beta-demo-slots">','<details class="fm-beta-demo-slots" open>');
    return `<div class="fm-beta-shell fm-beta-detail" data-detail-tab="${detailTab}">
      <header class="fm-beta-detail-header"><button class="fm-beta-link" type="button" data-action="detail-back" aria-label="추천으로 돌아가기"><svg class="fm-beta-ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 5-7 7 7 7M5 12h14"/></svg></button><h1>경기 상세</h1><span aria-hidden="true"></span></header>
      <nav class="fm-beta-account-tabs" aria-label="경기 상세 메뉴">${[['info','경기 정보'],['slots','모집 포지션']].map(([id,label])=>`<button class="fm-beta-button" type="button" data-action="detail-tab" data-tab="${id}" ${detailTab===id?'aria-current="page"':''}>${label}</button>`).join('')}</nav>
      ${detailTab==='slots'?'<p class="fm-beta-detail-hint">포지션별 남은 자리를 확인하세요.</p>':''}
      ${card}
      ${notice?`<div class="fm-beta-note" data-tone="${esc(notice.tone)}">${esc(notice.message)}</div>`:''}
    </div>`;
  }

  function renderOpening(){
    const example=matches.find(match=>match.isDemo&&match.status==='open'&&match.remaining>0&&new Date(match.startsAt)>new Date());
    return `<div class="fm-beta-shell fm-beta-opening" data-screen="welcome" data-welcome-entry="app"><div class="fm-app-entry">
      <div class="fm-app-entry-brand"><img class="fm-app-entry-logo" src="/src/app/assets/footmate-original.png" width="112" height="112" alt="FootMate 축구공 로고"><strong class="fm-app-entry-name">FootMate</strong><span class="fm-app-entry-tagline">나에게 맞는 풋살, 함께 뛰는 즐거움</span></div>
      <div class="fm-next-intro-copy"><h1>조건만 고르면,<br>함께 뛸 경기를 추천해요.</h1><p>지역·실력·포지션·시간을 고르고<br>조건에 맞는 다른 경기도 만나보세요.</p></div>
      ${example?`<section class="fm-beta-opening-preview" aria-label="추천 예시"><small>추천 예시 · 데모 경기</small><h2>${esc(example.title)}</h2><p>${esc(example.place)} · ${esc(example.level)}</p><p>${esc(formatStart(example.startsAt))}</p></section>`:''}
      <div class="fm-next-actions"><button class="fm-beta-button fm-beta-button--primary" type="button" data-action="opening-start">${session&&user?'계속하기':'내 조건으로 추천받기'}</button></div>
    </div></div>`;
  }

  function render(){
    try{root.dataset.betaOnboarding=String(!JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')||'null'))}catch{root.dataset.betaOnboarding='true'}
    root.dataset.betaCatalogSource=matches.some(m=>m.isDemo)?'demo':'server';
    root.dataset.betaView=view;
    root.dataset.betaAccountTab=accountTab;
    root.dataset.betaMatchesTab=matchesTab;
    root.dataset.betaAuthOpen=String(authOpen);
    root.dataset.betaGuest=String(!session||!user);
    root.dataset.betaRecommendationsReady=String(recommendedIds!==null);
    root.dataset.betaState=backendState==='error'?'error':backendState==='connected'?'ready':'booting';
    const connected=backendState==='connected';
    root.dataset.betaOpening=String(openingOpen);
    root.dataset.betaDetail=String(Boolean(detailMatchId&&!authOpen&&view==='home'));
    if(openingOpen){root.innerHTML=renderOpening();return}
    const detailMatch=matches.find(m=>m.id===detailMatchId);
    if(detailMatch&&!authOpen&&view==='home'){root.innerHTML=renderDetail(detailMatch);return}
    root.innerHTML=`<div class="fm-beta-shell">
      <header class="fm-beta-topbar"><div class="fm-beta-brand"><button class="fm-beta-brand-home" type="button" data-action="opening" aria-label="앱 시작 화면"><img src="/src/app/assets/footmate-original.png" width="36" height="36" alt=""></button><h1>FootMate</h1><span class="fm-beta-live" data-beta-backend="${connected?'connected':backendState==='error'?'error':'connecting'}">${backendState==='error'?'연결 오류':'Demo'}</span></div><button class="fm-beta-link" type="button" data-action="open-account" ${authOpen?'hidden':''}>${session&&user?esc(profile?.display_name||'내 정보'):'로그인'}</button></header>
      
      ${session&&user&&view==='matches'?`<nav class="fm-beta-account-tabs" aria-label="내 경기 메뉴">${[['joined','참가 경기'],['waitlist','대기'],['history','참석 이력']].map(([tab,label])=>`<button class="fm-beta-button" type="button" data-action="matches-tab" data-tab="${tab}" ${matchesTab===tab?'aria-current="page"':''}>${label}</button>`).join('')}</nav>`:''}
      ${notice?`<div class="fm-beta-note" data-tone="${esc(notice.tone)}" style="margin-bottom:18px">${esc(notice.message)}</div>`:''}
      ${backendState==='error'?`<div class="fm-beta-panel"><div class="fm-beta-empty"><strong>서버에 연결할 수 없어요.</strong>잠시 후 다시 시도해주세요.<div class="fm-beta-actions" style="justify-content:center;margin-top:12px"><button class="fm-beta-button" type="button" data-action="retry-backend">연결 다시 시도</button></div></div></div>`:`<div class="fm-beta-grid"><aside><div class="fm-beta-account-view" ${!(authOpen||(session&&user&&view==='my'))?'hidden':''}>${authOpen?'<button class="fm-beta-link fm-beta-back" type="button" data-action="close-account" aria-label="← 뒤로"><span class="fm-icon" aria-hidden="true">⬅️</span> 뒤로</button>':''}${session&&user?`<nav class="fm-beta-account-tabs" aria-label="내 정보 메뉴">${[['profile','프로필'],['notifications','알림'],['settings','설정']].map(([tab,label])=>`<button class="fm-beta-button" type="button" data-action="account-tab" data-tab="${tab}" ${accountTab===tab?'aria-current="page"':''}>${label}</button>`).join('')}</nav>`:''}${renderAuth()}</div><div class="fm-beta-joined-view">${renderParticipation()}</div></aside><section data-beta-main><div class="fm-beta-panel fm-beta-catalog"><div class="fm-beta-panel-head"><div><h2>추천 경기</h2><p>${esc(formatSync(lastSyncedAt))}</p></div><button class="fm-beta-button fm-beta-refresh" type="button" data-action="refresh" aria-label="새로고침" title="새로고침" ${busy?'disabled':''}><svg class="fm-beta-ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17"/></svg></button></div>${renderMatches()}</div></section></div>`}
      ${session&&user?`<nav class="fm-beta-app-nav" aria-label="Beta 메뉴">${[['home','추천','✨'],['matches','내 경기','🗓️'],['my','MY','👤']].map(([tab,label,icon])=>`<button type="button" data-action="navigate" data-view="${tab}" ${view===tab?'aria-current="page"':''}><i class="fm-icon" aria-hidden="true">${icon}</i><span>${label}</span></button>`).join('')}</nav>`:''}
      <footer class="fm-beta-footer">${isDemoEntry?'FootMate Demo · 데모 경기':'FootMate Demo · 무료 참가'}</footer>
    </div>`;
  }

  async function loadMatches(){
    if(!client)return;
    try{
      matchesError=null;
      const rows=isDemoEntry?demoCatalog(user?.id):await client.matches.list({limit:50});
      const futsal=(Array.isArray(rows)?rows:[]).filter(isFutsalMatch);
      const live=futsal.some(m=>['open','full'].includes(m.status)&&new Date(m.starts_at)>new Date());
      matches=normalizeBetaMatches(!isDemoEntry&&session&&user&&!live?[...futsal,...demoCatalog(user.id)]:futsal);
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
      isDemoEntry?Promise.resolve([]):client.participation.listMine({accessToken:session.accessToken})
    ]);
    profile=nextProfile;
    participations=[...(Array.isArray(nextParticipations)?nextParticipations:[]),...demoParticipations(user.id)];
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
      if(session&&user&&isDemoEntry&&!openingOpen){sessionStorage.setItem('footmate:beta:view:v1','home');sessionStorage.removeItem('footmate:beta:demo-return:v1');location.replace('/beta');return}
      if(session&&user)await loadMatches();
      if(!matchesError){
        lastSyncedAt=Date.now();
        emitBetaMeasurement('match_list_available');
      }
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
        if(authMode==='signin'){if(data.get('rememberEmail')==='on')localStorage.setItem('footmate:beta:remember-email:v1',email);else localStorage.removeItem('footmate:beta:remember-email:v1')}
        if(authMode==='signup'){
          if(data.get('dataNoticeAcknowledged')!=='on')throw new Error('실제 Beta 데이터 이용 안내 확인이 필요합니다.');
          const result=await client.auth.signUp({email,password,displayName:String(data.get('displayName')||'').trim()});
          if(result?.access_token){
            writeSession(result);if(isDemoEntry){sessionStorage.setItem('footmate:beta:view:v1','home');sessionStorage.removeItem('footmate:beta:demo-return:v1');location.replace('/beta');return}await loadPrivate();await loadMatches();view='home';sessionStorage.setItem('footmate:beta:view:v1',view);authOpen=false;if(!matchesError)lastSyncedAt=Date.now();setNotice(null);window.dispatchEvent(new Event('footmate:beta:session-changed'));
          }else{
            authMode='signin';setNotice('가입 요청이 완료됐습니다. 확인 이메일이 온 경우 인증한 뒤 로그인해주세요.','success');
          }
        }else{
          const result=await client.auth.signIn({email,password});
          writeSession(result);if(isDemoEntry){sessionStorage.setItem('footmate:beta:view:v1','home');sessionStorage.removeItem('footmate:beta:demo-return:v1');location.replace('/beta');return}await loadPrivate();await loadMatches();view='home';sessionStorage.setItem('footmate:beta:view:v1',view);authOpen=false;if(!matchesError)lastSyncedAt=Date.now();setNotice(null);window.dispatchEvent(new Event('footmate:beta:session-changed'));
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
    const utility=event.target.closest('[data-beta-measure]');
    if(utility){emitBetaMeasurement(utility.dataset.betaMeasure,{matchId:utility.dataset.matchId});return;}
    const target=event.target.closest('[data-action]');
    if(!target)return;
    const action=target.dataset.action;
    if(action==='match-detail'){detailMatchId=target.dataset.matchId;detailTab='info';sessionStorage.setItem('footmate:beta:detail-match:v1',detailMatchId);render();return}
    if(action==='detail-back'){closeDetail();render();return}
    if(action==='detail-tab'){detailTab=target.dataset.tab;render();return}
    if(action==='setup-position'){setView('my');accountTab='profile';render();return}
    if(action==='opening'){closeDetail();openingOpen=true;authOpen=false;render();return}
    if(action==='opening-start'||action==='opening-login'){
      openingOpen=false;sessionStorage.setItem('footmate:beta:entered:v1','1');
      if(session&&user){if(isDemoEntry){sessionStorage.setItem('footmate:beta:view:v1',action==='opening-login'?'my':'home');location.replace('/beta');return}setView(action==='opening-login'?'my':'home');return}
      authEntry=action==='opening-login'?'opening':'results';authOpen=action==='opening-login';
      if(!authOpen&&!isDemoEntry){location.assign('/demo');return}
      render();return;
    }
    if(action==='random-recommendation'||action==='restart-discovery'){
      if(recommendationBusy)return;
      const eligible=recommendationMatches();
      if(action==='restart-discovery'){
        const current=root.querySelector('.fm-beta-match')?.dataset.matchId;
        seenRecommendations=new Set(current?[current]:[]);
      }
      const next=pickUnseenRecommendation(eligible.map(match=>match.id),seenRecommendations);
      if(next){previewExpanded=true;demoPage=eligible.findIndex(match=>match.id===next);render();}
      return;
    }
    if(action==='demo-prev'||action==='demo-next'){demoPage=Math.max(0,demoPage+(action==='demo-next'?1:-1));render();return}
    if(action==='matches-tab'){matchesTab=target.dataset.tab;render();return}
    if(action==='account-tab'){accountTab=target.dataset.tab;render();return}
    if(action==='joined-prev'||action==='joined-next'){joinedPage=Math.max(0,joinedPage+(action==='joined-next'?1:-1));render();return}
    if(action==='navigate'){setView(target.dataset.view);return}
    if(action==='more-matches'){visibleLimit+=8;render();return}
    if(action==='toggle-auth'){authMode=authMode==='signin'?'signup':'signin';setNotice(null);render();return}
    if(action==='expand-preview'){previewExpanded=true;render();return}
    if(action==='unlock-preview'){authEntry='results';authOpen=true;render();root.querySelector('#beta-auth-panel h2, #beta-auth-panel input')?.focus();return}
    if(action==='open-account'||action==='focus-auth'){
      authEntry='results';
      if(session&&user&&action==='open-account'){setView('my');return}
      if(action==='focus-auth'){pendingMatchId=target.dataset.matchId||'';sessionStorage.setItem('footmate:beta:pending-match:v1',pendingMatchId)}
      else{pendingMatchId='';sessionStorage.removeItem('footmate:beta:pending-match:v1')}
      authOpen=true;render();root.querySelector('#beta-auth-panel h2, #beta-auth-panel input')?.focus();window.scrollTo({top:0,behavior:'smooth'});return;
    }
    if(action==='close-account'){if((!session||!user)&&authEntry==='opening'){openingOpen=true;authOpen=false;render();return}authOpen=false;render();root.querySelector('[data-pending-match] button, [data-action="open-account"]')?.focus();return} 
    if(action==='retry-backend'){boot();return}
    if(action==='refresh'){
      run(async()=>{await refreshData();setNotice(matchesError?matchesError:'경기와 참가 상태를 새로고침했습니다.',matchesError?'error':'success')});return;
    }
    if(action==='signout'){
      run(async()=>{try{await client.auth.signOut({accessToken:session.accessToken})}finally{clearSession();sessionStorage.removeItem('footmate:beta:entered:v1');authOpen=true;setNotice('로그아웃했습니다.','success')}});return;
    }
    if(action==='delete-account'){
      const confirmed=window.confirm('FootMate Closed Beta 계정 및 연동된 프로필·참가·알림 기록 삭제를 요청합니다. 이 작업은 되돌릴 수 없습니다. 다음 단계에서 삭제 문구를 다시 입력해야 합니다. 계속할까요?');
      if(!confirmed)return;
      const typed=window.prompt('마지막 확인: 삭제하려면 아래 칸에 정확히 “계정 삭제”를 입력하세요. 취소하면 아무 작업도 하지 않습니다.','');
      if(typed!=='계정 삭제'){setNotice('계정 삭제를 취소했습니다. 데이터는 변경되지 않았어요.');return;}
      run(async()=>{
        await client.auth.deleteAccount({accessToken:session.accessToken});
        clearSession();
        setNotice('계정과 연결된 Beta 개인정보·참가 기록을 삭제했습니다.','success');
      });return;
    }
    if(action==='join'){
      const matchId=target.dataset.matchId;
      const flowId=crypto.randomUUID();
      emitBetaMeasurement('join_attempt',{matchId,flowId});
      run(async()=>{
        try{
          const position=selectedPreferences().position||profile?.position||(exampleMatch(matchId)?'MF':'');
          if(!position)throw new Error('프로필에서 선호 포지션을 먼저 설정해주세요.');
          const example=exampleMatch(matchId);
          if(example){joinDemoMatch(user.id,matchId,position)}else await client.participation.join({accessToken:session.accessToken,matchId,position});
          pendingMatchId='';sessionStorage.removeItem('footmate:beta:pending-match:v1');closeDetail();
          emitBetaMeasurement('join_succeeded',{matchId,flowId});
          await refreshData();
          view='matches';matchesTab='joined';sessionStorage.setItem('footmate:beta:view:v1',view);
          setNotice(example?`${position} 데모 참가를 완료했어요.`:`${position} 포지션으로 참가가 확정됐습니다.`,'success');
        }catch(error){
          emitBetaMeasurement('join_failed',{matchId,flowId});
          throw error;
        }
      });return;
    }
    if(action==='cancel'){
      const matchId=target.dataset.matchId;
      run(async()=>{
        const example=exampleMatch(matchId);
        if(example){cancelDemoMatch(user.id,matchId)}else await client.participation.cancel({accessToken:session.accessToken,matchId});
        await refreshData();
        setNotice(example?'데모 참가를 취소했어요.':'참가를 취소했습니다. 잔여 자리가 복구됐습니다.','success');
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

  window.addEventListener('footmate:beta:recommendations',event=>{
    const focusedFilter=document.activeElement?.id;
    const current=root.querySelector('.fm-beta-match')?.dataset.matchId;
    const conditions=event.detail?.conditions||'';
    const changed=conditions!==recommendationConditions;
    recommendationConditions=conditions;
    recommendationBusy=Boolean(event.detail?.busy);
    recommendedIds=event.detail?.ids??null;recommendationReasons=event.detail?.reasons||{};
    if(changed){demoPage=0;previewExpanded=false;seenRecommendations.clear();recommendationAnchorId='';}
    else{
      if(recommendationBusy&&current)recommendationAnchorId=current;
      const anchor=recommendationAnchorId||current;
      if(anchor&&recommendedIds?.includes(anchor)){demoPage=recommendedIds.indexOf(anchor);if(demoPage>=3)previewExpanded=true;}
    }
    if(!recommendationBusy)recommendationAnchorId='';
    render();
    // Growth restores its controls after the base view is rendered.
    if(focusedFilter?.startsWith('quick-filter-'))queueMicrotask(()=>document.getElementById(focusedFilter)?.focus());
  });
  boot();
}
