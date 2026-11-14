import {betaLevelLabel} from './level-label.js';
import {openQuickFilterIds,restoreQuickFilters} from './filter-interaction.js';
import {personalizeRecommendations,normalizeReactions,chooseOpeningVariant} from './domain/discovery-followup.js';
import {configureDiscoveryTransport,setDiscoveryConsent,discoveryTransportStatus} from './discovery-transport.js';
import {pickUnseenRecommendation} from './domain/recommendation-discovery.js';
import {discoveryPresetKey,readDiscoveryPresets,eligibleMatch,unseenPresetMatches,nextAtVenue,MAX_PRESETS,MAX_KNOWN_MATCHES} from './domain/discovery-presets.js';
import {cleanSyncPreferences} from './preference-sync.js?v=2';
import {isDemoEntry,isFutsalMatch,demoCatalog,demoParticipations,joinDemoMatch,cancelDemoMatch,clearDemoParticipations} from './demo-catalog.js?v=3';
import {createSupabaseBetaClient,loadBetaBackendConfig,SupabaseBetaError,BETA_SIGNUP_PASSWORD_MIN_LENGTH} from './infrastructure/supabase.js';
import {normalizeBetaMatches,BETA_MATCH_POSITIONS} from './domain/match-contract.js';
import {betaDirectionsUrl,betaCalendarUrl} from './attendance-links.js';
import {emitBetaMeasurement,emitDiscoveryMeasurement} from './measurement-events.js';

const root=document.getElementById('footmate-beta');
const SESSION_KEY='footmate:beta:auth:v1';
const LEVELS=['입문','초중급','중급','중급+'];
const POSITION_LABELS={MF:'MF · 미드필더',FW:'FW · 공격수',DF:'DF · 수비수',GK:'GK · 골키퍼'};

if(root){
  let client=null,analyticsConfig=null;
  let backendState='connecting';
  let authMode='signin';
  let session=null;
  let user=null;
  let profile=null;
  let matches=[];
  let participations=[];
  let participationMatchHistory=[];
  let matchesError=null;
  let busy=false;
  let notice=null;
  let lastSyncedAt=null;
  let view=['home','matches','my'].includes(sessionStorage.getItem('footmate:beta:view:v1'))?sessionStorage.getItem('footmate:beta:view:v1'):'home';
  let visibleLimit=8;
  let demoPage=0;
  let openingPreviewPage=0;
  let previewExpanded=false;
  root.dataset.betaDemo=String(isDemoEntry);
  root.dataset.betaApp='true';
  let accountTab='profile';
  const requestedOpening=new URL(location.href).searchParams.get('opening');
  const comparisonEntry=requestedOpening==='compare';
  const comparisonKey='footmate:beta:opening-comparison:v2';
  const openingVariant=chooseOpeningVariant(requestedOpening,comparisonEntry?sessionStorage.getItem(comparisonKey):null);
  if(comparisonEntry)sessionStorage.setItem(comparisonKey,openingVariant);
  const openingExperiment=['control','quick','compare'].includes(requestedOpening);
  const activeOpeningVariant=(isDemoEntry||openingExperiment)?openingVariant:(sessionStorage.getItem('footmate:beta:opening-variant:v1')||'control');
  sessionStorage.setItem('footmate:beta:opening-variant:v1',activeOpeningVariant);
  const entryStartedAt=Date.now();
  let serverReactions=[];
  const autoLaunch=isDemoEntry&&!requestedOpening;
  let launchPending=autoLaunch;
  let openingOpen=openingVariant!=='quick'&&(isDemoEntry||openingExperiment)&&(autoLaunch||comparisonEntry||sessionStorage.getItem('footmate:beta:entered:v1')!=='1');
  let joinedPage=0;
  let matchesTab='joined';
  let authEntry='results';
  let detailMatchId=sessionStorage.getItem('footmate:beta:detail-match:v1')||'';
  let detailTab='info';
  let comparisonIds=[],comparisonOpen=false;
  let detailOrigin='results';
  let resultsScrollTop=0;
  let savedDetailOrigin='';
  let venueOriginId='';
  let freshMatches=null;
  let presetsOpen=false;
  let savedMatchesOpen=false;
  function focusScreen(selector,{scroll=false}={}){requestAnimationFrame(()=>{const node=root.querySelector(selector);if(node){if(!node.hasAttribute('tabindex'))node.tabIndex=-1;node.focus({preventScroll:!scroll})}})}
  function restoreResults(){
    const savedId=savedDetailOrigin;
    savedDetailOrigin='';
    render();
    requestAnimationFrame(()=>{
      const main=root.querySelector('[data-beta-main]');if(main)main.scrollTop=resultsScrollTop;
      const savedButton=[...root.querySelectorAll('[data-saved-entry]')].find(button=>button.dataset.matchId===savedId&&!button.closest('details:not([open])')&&button.getClientRects().length);
      (savedButton||root.querySelector('.fm-beta-match [data-action="match-detail"]'))?.focus({preventScroll:true});
    });
  }
  function rememberResults(){resultsScrollTop=root.querySelector('[data-beta-main]')?.scrollTop||0}
  function closeDetail(){detailMatchId='';detailTab='info';detailOrigin='results';sessionStorage.removeItem('footmate:beta:detail-match:v1')}
  function setView(next){closeDetail();view=next;matchesTab='joined';sessionStorage.setItem('footmate:beta:view:v1',next);authOpen=false;render();window.scrollTo({top:0,behavior:'smooth'})}
  function exampleMatch(id){return matches.some(m=>m.id===id&&m.isDemo)||participations.some(p=>p.match_id===id&&p.is_demo)}
  let authOpen=Boolean(location.hash.includes('error')||sessionStorage.getItem('footmate:beta:social-auth-error:v1'));
  let recommendedIds=null,recommendationReasons={};
  let recommendationBusy=false,recommendationConditions='',recommendationAnchorId='';
  let seenRecommendations=new Set();
  let recommendationInteracted=false;
  let lastMeasuredRecommendation='';
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
    profile=null;serverReactions=[];comparisonIds=[];comparisonOpen=false;freshMatches=null;presetsOpen=false;closeDetail();
    void configureDiscoveryTransport(null,'','');
    participations=[];participationMatchHistory=[];view='home';sessionStorage.removeItem('footmate:beta:view:v1');
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
        <div class="fm-beta-login-brand"><img src="/src/app/assets/footmate-original.png" width="112" height="112" alt="FootMate 축구공 로고"><strong>FootMate</strong></div>
        ${pending?`<section class="fm-beta-auth-match" aria-label="참가할 경기"><span>참가할 경기</span><strong>${esc(pending.title)}</strong><p>${esc(formatStart(pending.startsAt))}${selectedPreferences().position?` · ${esc(POSITION_LABELS[selectedPreferences().position]||selectedPreferences().position)}`:''}</p><p>로그인 후 참가 버튼을 눌러주세요.</p></section>`:''}
        <div class="fm-beta-panel-head"><div><h2 tabindex="-1">${signup?'회원가입':'로그인'}</h2><p>${signup?'경기 참가 정보를 저장할 계정을 만듭니다.':''}</p></div></div>
        <form class="fm-beta-stack" data-form="auth">
          ${signup?`<label class="fm-beta-field"><span>이름 · 선택</span><input name="displayName" autocomplete="name" maxlength="40" placeholder="풋살러 이름"></label>`:''}
          <label class="fm-beta-field"><span>이메일</span><input name="email" type="email" autocomplete="email" required placeholder="이메일" value="${esc(localStorage.getItem('footmate:beta:remember-email:v1')||'')}"></label>
          <label class="fm-beta-field"><span>비밀번호</span><input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" ${signup?`minlength="${BETA_SIGNUP_PASSWORD_MIN_LENGTH}"`:''} required placeholder="${signup?`${BETA_SIGNUP_PASSWORD_MIN_LENGTH}자 이상`:'비밀번호'}"></label>
          ${signup?`<p class="fm-beta-form-hint" id="beta-password-hint">비밀번호는 최소 ${BETA_SIGNUP_PASSWORD_MIN_LENGTH}자 이상입니다. 가입 후 이메일 인증이 필요할 수 있습니다.</p>
          <details class="fm-beta-data-details"><summary>가입 전 데이터 이용 안내</summary><p>이메일과 암호화된 로그인 정보, 선택한 이름·경기·포지션·참가 기록 및 로그인 중 고른 추천 조건이 실제 서버 계정과 연결됩니다. 결제는 연결하지 않았습니다.</p><p><a href="/beta-data-notice.html" target="_blank" rel="noopener noreferrer">Beta 데이터 이용 안내 전문 보기</a></p></details>
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
        <label class="fm-beta-field"><span>체감 레벨</span><select name="level"><option value="">선택해주세요</option>${LEVELS.map(level=>`<option value="${level}" ${p.level===level?'selected':''}>${betaLevelLabel(level)}</option>`).join('')}</select></label>
        <button class="fm-beta-button" type="submit" ${busy?'disabled':''}>프로필 저장</button>
      </form><details class="fm-beta-data-details"><summary>추천 개선 통계 참여 · 선택</summary>${discoveryTransportStatus().withdrawalPending?'<p role="status">이 기기의 수집은 중지되어 있어요. 서버 기록 삭제는 아직 확인되지 않았어요. 해제를 재시도해주세요.</p>':''}<p>로그인 후 실제 경기의 추천·상세·참가 흐름을 서버에 기록해요. 이메일·조건 원문은 보내지 않아요. 데모는 제외하며 참여 해제 시 서버 탐색 기록을 삭제해요.</p><button class="fm-beta-button" type="button" data-action="discovery-consent" ${busy?'disabled':''}>${discoveryTransportStatus().withdrawalPending?'서버 통계 해제 재시도':discoveryTransportStatus().enabled?'통계 참여 해제':'통계 참여하기'}</button>${discoveryTransportStatus().serverEnabled&&!discoveryTransportStatus().enabled&&!discoveryTransportStatus().withdrawalPending?'<p>이 브라우저의 수집은 중지되어 있어요. 서버의 통계 참여는 켜져 있어요. 이 브라우저에서 참여하거나 서버 참여를 해제할 수 있어요.</p><button class="fm-beta-button" type="button" data-action="discovery-withdraw">서버 통계 참여 해제</button>':''}</details><details class="fm-beta-data-details"><summary>개인정보 안내</summary><p>저장 데이터: 이메일 · 이름 · 생활권 · 포지션 · 레벨 · 참가 상태 · 로그인 중 선택한 추천 조건. 결제 정보와 메시지 내용은 저장하지 않습니다.</p><a href="/beta-data-notice.html">자세히 보기</a></details>
      
      <div class="fm-beta-actions" style="margin-top:12px"><button class="fm-beta-button fm-beta-button--danger" type="button" data-action="delete-account" ${busy?'disabled':''}>계정·참가 데이터 삭제</button></div>
    </div>`;
  }

  function renderParticipation(){
    if(!session||!user)return '';
    const confirmed=participations.filter(item=>{
      if(item.status!=='confirmed')return false;
      const match=matches.find(candidate=>candidate.id===item.match_id)||participationMatchHistory.find(candidate=>candidate.id===item.match_id);
      return Boolean(match&&['open','full'].includes(match.status)&&new Date(match.startsAt).getTime()>Date.now());
    });
    joinedPage=Math.min(joinedPage,Math.max(0,confirmed.length-1));
    return `<div class="fm-beta-panel">
      <div class="fm-beta-panel-head"><div><h3>내 경기</h3></div></div>
      ${confirmed.length?confirmed.slice(joinedPage,joinedPage+1).map(item=>{
        const match=matches.find(candidate=>candidate.id===item.match_id)||participationMatchHistory.find(candidate=>candidate.id===item.match_id);
        return `<div class="fm-beta-participation">${item.is_demo?'<small class="fm-beta-demo-record">데모 경기</small>':''}<strong>${esc(match?.title||'참가 경기')} · ${esc(item.position||'')}</strong><p>${match?`${esc(formatStart(match.startsAt))} · ${esc(match.place)}`:'경기 정보를 불러오는 중입니다.'}</p>${match?attendanceLinks(match,true):''}<div class="fm-beta-actions" style="margin-top:10px"><button class="fm-beta-button fm-beta-button--danger" type="button" data-action="cancel" data-match-id="${esc(item.match_id)}" ${busy?'disabled':''}>참가 취소</button></div></div>`;
      }).join(''):`<div class="fm-beta-empty"><strong>아직 참가한 경기가 없습니다.</strong>참석했던 경기는 내 경기의 참석 이력에서 확인할 수 있어요.</div>`}
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

  function matchVisual(match){
    const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',hour12:false}).format(new Date(match.startsAt)));
    return hour<12?{tone:'morning',label:'오전 경기'}:hour<18?{tone:'day',label:'오후 경기'}:{tone:'evening',label:'저녁 경기'};
  }

  const savedDemoKey='footmate:beta:saved-demo-matches:v1';
  function savedDemoMatches(){
    if(!isDemoEntry)return [];
    try{
      const rows=JSON.parse(localStorage.getItem(savedDemoKey)||'[]');
      return Array.isArray(rows)?rows.filter(row=>row&&/^demo-\d+-\d{4}-\d{2}-\d{2}$/.test(row.id)&&typeof row.title==='string'&&Number.isFinite(Date.parse(row.startsAt))).slice(0,12):[];
    }catch{return []}
  }
  function renderSavedDemoMatches(){
    const rows=savedDemoMatches();
    if(!rows.length)return '';
    const items=rows.map(saved=>{
      const match=matches.find(item=>item.id===saved.id&&item.isDemo);
      const row={...saved,title:match?.title||saved.title.replace('중급+','고급')};
      const ended=Date.parse(row.startsAt)<=Date.now();
      const status=ended?'종료':!match?'확인 불가':match.status!=='open'||!match.remaining?'마감':`${match.remaining}자리`;
      const resume=match&&!ended?`<button type="button" class="fm-beta-link" data-action="match-detail" data-saved-entry data-match-id="${esc(row.id)}" aria-label="${esc(row.title)} 이어보기">이어보기</button>`:'';
      return {row,status,resume};
    });
    const latest=items.find(item=>item.resume);
    return `<section class="fm-beta-saved" aria-label="저장한 경기">
      <details class="fm-beta-saved-list" ${savedMatchesOpen?'open':''}><summary id="saved-match-menu">저장 경기 ${rows.length}</summary><ul>${items.map(({row,status,resume})=>
        `<li><div><strong>${esc(row.title)}</strong><small>${esc(formatStart(row.startsAt))} · ${status}</small></div>${resume}<button type="button" class="fm-beta-link" data-action="save-demo-match" data-saved-remove data-match-id="${esc(row.id)}" aria-label="${esc(row.title)} 저장 해제">해제</button></li>`
      ).join('')}</ul></details>${latest?`<div class="fm-beta-saved-shortcut">${latest.resume}</div>`:''}
    </section>`;
  }
  function renderSavedShelf(){
    const conditions=renderPresets(),games=renderSavedDemoMatches();
    return conditions||games?`<div class="fm-beta-saved-shelf">${conditions}${games}</div>`:'';
  }

  function presetKey(){return discoveryPresetKey(isDemoEntry,session&&user?.id)}
  function presets(){try{return readDiscoveryPresets(localStorage,presetKey())}catch{return []}}
  function presetCatalog(){return matches.filter(match=>match.isDemo===isDemoEntry)}
  function presetLabel(conditions){
    const date={today:'오늘',tomorrow:'내일',weekend:'주말'}[conditions.dateWindow];
    return [conditions.region,betaLevelLabel(conditions.level),conditions.position,date,conditions.afterTime&&`${conditions.afterTime} 이후`,conditions.beforeTime&&`${conditions.beforeTime} 전`].filter(Boolean).join(' · ')||'전체 경기';
  }
  function presetSignature(conditions){return JSON.stringify(cleanSyncPreferences(conditions))}
  function writePresets(rows){
    const key=presetKey();
    if(!key)return false;
    try{localStorage.setItem(key,JSON.stringify(rows));return true}
    catch{setNotice('조건을 저장하지 못했어요.','error');return false}
  }
  function knownPresetIds(catalog,previous=[]){
    return [...new Set([...catalog.map(match=>match.id),...previous])].slice(0,MAX_KNOWN_MATCHES);
  }
  function renderPresets(){
    if(!presetKey()||root.dataset.betaOnboarding==='true')return '';
    const rows=presets(),catalog=presetCatalog();
    const signature=presetSignature(selectedPreferences());
    const selected=rows.some(row=>presetSignature(row.conditions)===signature);
    const counts=rows.map(row=>unseenPresetMatches(catalog,row));
    const freshCount=new Set(counts.flat().map(match=>match.id)).size;
    return `<details class="fm-beta-presets" ${presetsOpen?'open':''}><summary id="preset-menu">저장한 조건${freshCount?`<span>새 경기 ${freshCount}개</span>`:''}</summary>
      <ul>${rows.map((row,index)=>{
        const label=esc(presetLabel(row.conditions)),count=counts[index].length;
        return `<li><button id="preset-apply-${index}" class="fm-beta-link" type="button" data-action="apply-preset" data-preset="${index}">${label}</button>
          ${count?`<button class="fm-beta-button" type="button" data-action="new-preset-matches" data-preset="${index}" aria-label="${label} 새 경기 ${count}개">새 경기 ${count}개</button>`:''}
          <button class="fm-beta-link" type="button" data-action="remove-preset" data-preset="${index}" aria-label="${label} 조건 해제">해제</button></li>`;
      }).join('')}</ul><button id="preset-save" class="fm-beta-button" type="button" data-action="save-preset" ${selected||rows.length>=MAX_PRESETS||matchesError||!lastSyncedAt?'disabled':''}>${selected?'저장됨':rows.length>=MAX_PRESETS?'최대 3개':'현재 조건 저장'}</button>
    </details>`;
  }
  function handlePresetAction(action,target){
    const rows=presets(),index=Number(target.dataset.preset),row=rows[index];
    const catalog=presetCatalog();
    presetsOpen=true;
    if(action==='save-preset'){
      const conditions=cleanSyncPreferences(selectedPreferences());
      if(!conditions||matchesError||!lastSyncedAt||rows.length>=MAX_PRESETS||rows.some(item=>presetSignature(item.conditions)===presetSignature(conditions)))return;
      if(writePresets([{conditions,knownIds:knownPresetIds(catalog)},...rows])){render();focusScreen('#preset-apply-0')}
      else{render();focusScreen('#preset-menu')}
      return;
    }
    if(!row)return;
    if(action==='remove-preset'){
      writePresets(rows.filter((_,i)=>i!==index));
      render();focusScreen('#preset-menu');return;
    }
    const isNew=action==='new-preset-matches';
    const unseen=isNew?unseenPresetMatches(catalog,row):[];
    if(isNew&&!unseen.length){render();focusScreen('#preset-menu');return}
    if(isNew)writePresets(rows.map((item,i)=>i===index?{...item,knownIds:knownPresetIds(catalog,item.knownIds)}:item));
    freshMatches=isNew?{signature:presetSignature(row.conditions),ids:new Set(unseen.map(match=>match.id))}:null;
    presetsOpen=false;
    demoPage=0;previewExpanded=false;recommendationAnchorId='';recommendationInteracted=false;seenRecommendations.clear();
    window.dispatchEvent(new CustomEvent('footmate:beta:apply-preset',{detail:row.conditions}));
    focusScreen('#recommendation-title',{scroll:true});
  }
  function renderMatch(match,{detail=false}={}){
    const p=profile||{};
    const preferredPosition=selectedPreferences().position||p.position;
    const position=preferredPosition||(match.isDemo?'MF':'');
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
    const saved=isDemoEntry&&match.isDemo&&savedDemoMatches().some(row=>row.id===match.id);
    const visual=matchVisual(match);
    const reasons=(recommendationReasons[match.id]||[]).filter(reason=>reason!=='무료 참가');
    const discoveryContext=reasons.length?reasons.slice(0,2).join(' · '):'';
    const availability=match.status==='full'||match.remaining<=0?'마감':`${match.remaining}자리 남음`;
    const positionAvailability=preferredPosition?`${preferredPosition} ${slot>0?`${slot}자리`:'마감'}`:'';
    const place=`<div class="fm-beta-match-place"><i class="fm-icon fm-beta-ui-icon" aria-hidden="true">📍</i>${esc(match.place)}${match.area&&!match.place.includes(match.area)?` · ${esc(match.area)}`:''}</div>`;
    const saveButton=isDemoEntry&&match.isDemo?`<button class="fm-beta-button fm-beta-save-toggle" type="button" data-action="save-demo-match" data-match-id="${esc(match.id)}" aria-label="경기 저장" aria-pressed="${saved}">${saved?'저장됨':'경기 저장'}</button>`:'';
    return `<article class="fm-beta-match ${match.isDemo?'fm-beta-match--demo':''}" data-match-id="${esc(match.id)}" data-match-tone="${visual.tone}" ${pendingMatchId===match.id?'data-pending-match="true"':''}>
      <div class="${detail?'fm-beta-detail-body':'fm-beta-recommendation-body'}" ${detail?'':'role="group" aria-label="추천 경기 정보"'}>
      ${detail?`<div class="fm-beta-match-cover"><span>${visual.label}</span>${match.isDemo?'<small>데모 경기</small>':''}<i aria-hidden="true"></i></div>`:''}
      <div class="fm-beta-match-top"><h3>${esc(match.title)}</h3>${detail?`<span class="fm-beta-badge">${esc(availability)}</span>`:match.isDemo?'<span class="fm-beta-sample-label">데모 경기</span>':''}</div>
      ${detail?`${place}${discoveryContext?`<p class="fm-beta-match-reason">${esc(discoveryContext)}</p>`:''}`:
      `<div class="fm-beta-meta"><span><i class="fm-icon fm-beta-ui-icon" aria-hidden="true">🕒</i>${esc(formatStart(match.startsAt))}</span>${positionAvailability?`<span class="fm-beta-own-slot" role="group" aria-label="내 포지션">${esc(positionAvailability)}</span>`:`<span class="fm-beta-badge">${esc(availability)}</span>`}</div>
      <div class="fm-beta-card-venue">${place}<span>${esc(betaLevelLabel(match.level))}</span></div>`}
      ${detail?`<details class="fm-beta-demo-slots" open><summary>모집 포지션</summary><div class="fm-beta-slots">${BETA_MATCH_POSITIONS.map(item=>`<div class="fm-beta-slot"><b>${({MF:"미드필더",FW:"공격수",DF:"수비수",GK:"골키퍼"})[item]} <small>${item}</small></b><span><strong>${Number(match.positionSlots[item]||0)}</strong>자리</span></div>`).join('')}</div>
      </details>${attendanceLinks(match,Boolean(joined))}`:''}
      ${detail?`<dl class="fm-beta-detail-facts"><div><dt>경기 일시</dt><dd>${esc(formatStart(match.startsAt))}</dd></div><div><dt>경기 방식</dt><dd>${esc(match.format||'경기')} · ${match.durationMin}분 · ${esc(match.surface||'구장')}</dd></div><div><dt>권장 실력</dt><dd>${esc(betaLevelLabel(match.level))}</dd></div></dl>${reactionPanel(match)}`:''}
      ${detail?saveButton:`<div class="fm-beta-card-tools"><button type="button" class="fm-beta-link fm-beta-compare-toggle" data-action="compare-toggle" data-match-id="${esc(match.id)}" aria-pressed="${comparisonIds.includes(match.id)}">${comparisonIds.includes(match.id)?'비교 선택됨':'비교에 담기'}</button>${saveButton}</div>`}
      </div><div class="fm-beta-match-actions"><span class="fm-beta-price">${match.price===0?'무료 참가':`${new Intl.NumberFormat('ko-KR').format(match.price)}원`}</span>${!detail?`<button class="fm-beta-button" type="button" data-action="match-detail" data-match-id="${esc(match.id)}">상세 보기</button>`:''}<button class="fm-beta-button fm-beta-button--primary" type="button" data-action="${action}" data-match-id="${esc(match.id)}" ${disabled||busy?'disabled':''}>${esc(label)}</button></div>
    </article>`;
  }

  function reactionKey(demo){return 'footmate:beta:reactions:v1:'+String(user?.id||'guest')+':'+(demo?'demo':'live')}
  function reactions(demo){try{return normalizeReactions(JSON.parse(localStorage.getItem(reactionKey(demo))||'[]'))}catch{return[]}}
  function reactionPanel(match){
    const selected=reactions(match.isDemo).find(r=>r.matchId===match.id)?.kind;
    return `<details class="fm-beta-reaction-panel" ${selected?'open':''}><summary>추천 조정${selected?' · 선택 저장됨':''}</summary><p>이 기기의 추천 순서에 반영돼요.</p><div class="fm-beta-actions">${[['interested','관심 있어요'],['different_time','다른 시간 원해요'],['too_far','다른 구장 원해요'],['different_level','다른 실력 원해요']].map(([kind,label])=>`<button type="button" class="fm-beta-button" data-action="recommendation-reaction" data-match-id="${esc(match.id)}" data-reaction="${kind}" aria-label="${label}" aria-pressed="${selected===kind}">${label}</button>`).join('')}<button type="button" class="fm-beta-link" data-action="clear-reactions">추천 반응 초기화</button></div></details>`;
  }

  function restoreReactionInteraction(scrollTop,selector){
    const panel=root.querySelector('.fm-beta-reaction-panel');if(panel)panel.open=true;
    const body=root.querySelector('.fm-beta-detail-body');if(body)body.scrollTop=scrollTop;
    root.querySelector(selector)?.focus({preventScroll:true});
  }

  function recommendationMatches(){
    const conditions=selectedPreferences();
    const available=matches.filter(match=>isFutsalMatch(match)&&(!freshMatches||freshMatches.ids.has(match.id))&&eligibleMatch(match,conditions));
    const ordered=recommendedIds===null?available:recommendedIds.map(id=>available.find(match=>match.id===id)).filter(Boolean);
    if(freshMatches&&recommendedIds!==null){
      const ranked=new Set(ordered.map(match=>match.id));
      ordered.push(...available.filter(match=>!ranked.has(match.id)));
    }
    return personalizeRecommendations(ordered,[...reactions(false),...reactions(true),...serverReactions.filter(r=>user&&r.userId===user.id)]);
  }

  function renderConnectionStatus(action){
    return `<div class="fm-beta-connection"><strong role="status">연결 실패</strong><button class="fm-beta-link" type="button" data-action="${action}" aria-label="연결 다시 시도" ${busy?'disabled':''}>다시 시도</button></div>`;
  }

  function renderMatches(){
    const rankingStatus=recommendationBusy?'<p class="fm-beta-ranking-status" role="status"><span class="fm-beta-spinner"></span>추천 순서 조정 중</p>':'';
    if(backendState==='connecting')return `<div class="fm-beta-empty"><span class="fm-beta-spinner"></span>경기를 불러오는 중입니다.</div>`;
    if(matchesError)return renderConnectionStatus('refresh');
    if(!matches.length)return `<div class="fm-beta-empty"><strong>지금 참가할 수 있는 경기가 없어요.</strong><button class="fm-beta-button" type="button" data-action="refresh" ${busy?'disabled':''}>다시 확인</button></div>`;
    const visible=recommendationMatches();
    if(!visible.length&&freshMatches)return '<div class="fm-beta-empty" role="status">새 경기 없음</div>';
    if(!visible.length)return `<div class="fm-beta-empty" role="status"><strong>조건에 맞는 경기가 없어요.</strong><p>다른 조건으로 찾아보세요.</p><button type="button" class="fm-beta-button" data-growth-action="edit-preferences">조건 다시 선택</button></div>`;

    const guest=!session||!user;
    const preview=guest&&!previewExpanded?visible.slice(0,3):visible;
    demoPage=Math.min(demoPage,preview.length-1);
    const current=preview[demoPage];
    if(!recommendationBusy||recommendationInteracted)seenRecommendations.add(current.id);
    if(recommendedIds!==null&&!recommendationBusy&&!openingOpen&&!authOpen&&view==='home'&&!detailMatchId){const key=recommendationConditions+'|'+current.id;if(key!==lastMeasuredRecommendation){lastMeasuredRecommendation=key;emitDiscoveryMeasurement('recommendation_viewed',{resultCount:visible.length,isDemo:current.isDemo,matchId:current.id,durationMs:Date.now()-entryStartedAt});}}
    const exhausted=visible.every(match=>seenRecommendations.has(match.id));
    const discovery=visible.length>1?`<div class="fm-beta-discovery">${exhausted?'<p role="status">모든 추천을 봤어요.</p>':''}<button class="fm-beta-button" type="button" data-action="${exhausted?'restart-discovery':'random-recommendation'}">${exhausted?'다시 둘러보기':'다른 경기 추천'}</button></div>`:'<p class="fm-beta-discovery-note">추천 1개</p>';
    const gatedNext=guest&&!previewExpanded&&demoPage===preview.length-1&&visible.length>preview.length;
    return `${rankingStatus}${guest?`<div class="fm-beta-preview-note"><span>조건에 맞는 경기 <b>${visible.length}개</b> · ${previewExpanded?'전체 보기':`${preview.length}개 미리보기`}</span></div>`:''}<div class="fm-beta-match-list">${renderMatch(current)}</div>${comparisonIds.length?`<div class="fm-beta-compare-tray"><span>비교 ${comparisonIds.length} / 2</span><ul class="fm-beta-compare-picks">${matches.filter(match=>comparisonIds.includes(match.id)).map(match=>`<li><span>${esc(match.title)}</span><button type="button" class="fm-beta-link" data-action="compare-remove" data-match-id="${esc(match.id)}" aria-label="${esc(match.title)} 비교에서 빼기">×</button></li>`).join('')}</ul><button type="button" class="fm-beta-button" data-action="compare-open" ${comparisonIds.length<2?'disabled':''}>두 경기 비교</button><button type="button" class="fm-beta-link" data-action="compare-clear">비우기</button></div>`:''}<div class="fm-beta-browse-controls">${discovery}${preview.length>1?`<nav class="fm-beta-demo-pager" aria-label="추천 경기 페이지"><button class="fm-beta-button" type="button" data-action="demo-prev" ${demoPage===0?'disabled':''}>이전</button><span role="status">${demoPage+1} / ${preview.length}</span><button class="fm-beta-button" type="button" data-action="${gatedNext?'expand-preview':'demo-next'}" ${!gatedNext&&demoPage===preview.length-1?'disabled':''}>${gatedNext?'다음 경기':'다음'}</button></nav>`:''}</div>`;
  }



  function renderComparison(){
    const selected=comparisonIds.map(id=>matches.find(m=>m.id===id)).filter(Boolean);
    const fields=[['일시',m=>formatStart(m.startsAt)],['장소',m=>m.place],['실력',m=>betaLevelLabel(m.level)],['경기 방식',m=>m.format+' · '+m.durationMin+'분'],['잔여 자리',m=>m.remaining+'자리'],['선택 포지션',m=>selectedPreferences().position?selectedPreferences().position+' '+Number(m.positionSlots[selectedPreferences().position]||0)+'자리':'포지션 제한 없음'],['참가비',m=>m.price===0?'무료 참가':new Intl.NumberFormat('ko-KR').format(m.price)+'원']];
    return `<div class="fm-beta-shell fm-beta-comparison"><header class="fm-beta-detail-header"><button type="button" class="fm-beta-link" data-action="compare-back" aria-label="추천으로 돌아가기"><i class="fm-icon fm-beta-ui-icon" aria-hidden="true">⬅</i></button><h1 tabindex="-1">경기 비교</h1><span></span></header><div class="fm-beta-compare-content"><table><caption>선택한 두 경기 비교</caption><thead><tr><th scope="col">기준</th>${selected.map(m=>`<th scope="col">${esc(m.title)}${m.isDemo?'<small>데모 경기</small>':''}</th>`).join('')}</tr></thead><tbody>${fields.map(([label,value])=>{
      const values=selected.map(value);
      const differs=values.length===2&&values[0]!==values[1];
      return `<tr${differs?' class="fm-beta-compare-difference"':''}><th scope="row">${label}</th>${values.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`;
    }).join('')}<tr><th scope="row">자세히</th>${selected.map(m=>`<td><button class="fm-beta-button" type="button" data-action="compare-detail" data-match-id="${esc(m.id)}" aria-label="${esc(m.title)} 상세 보기">상세 보기</button></td>`).join('')}</tr></tbody></table></div></div>`;
  }

  function renderDetail(match){
    const card=renderMatch(match,{detail:true}).replace('<details class="fm-beta-demo-slots">','<details class="fm-beta-demo-slots" open>');
    return `<div class="fm-beta-shell fm-beta-detail" data-detail-tab="${detailTab}">
      <header class="fm-beta-detail-header"><button class="fm-beta-link" type="button" data-action="detail-back" aria-label="${detailOrigin==='comparison'?'비교로 돌아가기':detailOrigin==='history'?'참석 이력으로 돌아가기':'추천으로 돌아가기'}"><i class="fm-icon fm-beta-ui-icon" aria-hidden="true">⬅</i></button><h1>경기 상세</h1><span aria-hidden="true"></span></header>
      <nav class="fm-beta-account-tabs" aria-label="경기 상세 메뉴">${[['info','경기 정보'],['slots','모집 포지션']].map(([id,label])=>`<button class="fm-beta-button" type="button" data-action="detail-tab" data-tab="${id}" ${detailTab===id?'aria-current="page"':''}>${label}</button>`).join('')}</nav>
      ${card}
      ${notice?`<div role="status" class="fm-beta-note" data-tone="${esc(notice.tone)}">${esc(notice.message)}</div>`:''}
    </div>`;
  }

  function renderRecommendationExample(heading='h3'){
    const examples=matches.filter(match=>match.isDemo&&match.status==='open'&&match.remaining>0&&new Date(match.startsAt)>new Date()).slice(0,3);
    const example=examples[openingPreviewPage%Math.max(1,examples.length)];
    return example?`<section class="fm-beta-opening-preview" aria-label="추천 예시"><div class="fm-beta-preview-card" data-match-tone="${matchVisual(example).tone}" role="status" aria-live="polite"><small>추천 예시</small><${heading}>${esc(example.title)}</${heading}><p>${esc(example.place)} · ${esc(betaLevelLabel(example.level))}</p><p>${esc(formatStart(example.startsAt))}</p></div>${examples.length>1?`<div class="fm-beta-preview-controls"><span>${openingPreviewPage%examples.length+1} / ${examples.length}</span><button type="button" class="fm-beta-link" data-action="opening-preview-next" aria-label="다른 추천 예시 보기">다른 예시 <i class="fm-icon fm-beta-ui-icon" aria-hidden="true">➡</i></button></div>`:''}</section>`:'';
  }

  function renderOpening(){
    return `<div class="fm-beta-shell fm-beta-opening" data-screen="welcome" data-auto-launch="${launchPending}" data-welcome-entry="app" data-preview-motion="${openingPreviewPage===0}"><div class="fm-app-entry">
      <div class="fm-app-entry-brand"><img class="fm-app-entry-logo" src="/src/app/assets/footmate-original.png" width="112" height="112" alt="FootMate"></div>
      ${renderRecommendationExample('h2')}
      <div class="fm-next-actions"><button class="fm-beta-button fm-beta-button--primary" type="button" data-action="opening-start">${session&&user?'계속하기':'내 조건으로 추천받기'}</button></div>
    </div></div>`;
  }

  function render(){
    try{root.dataset.betaOnboarding=String(!JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')||'null'))}catch{root.dataset.betaOnboarding='true'}
    root.dataset.betaConnection=backendState;
    root.dataset.betaCatalogSource=matches.some(m=>m.isDemo)?'demo':'server';
    root.dataset.betaView=view;
    root.dataset.betaAccountTab=accountTab;
    root.dataset.betaMatchesTab=matchesTab;
    root.dataset.betaAuthOpen=String(authOpen);
    root.dataset.betaGuest=String(!session||!user);
    root.dataset.betaRecommendationsReady=String(recommendedIds!==null);
    root.dataset.betaState=backendState==='error'?'error':['connected','preview'].includes(backendState)?'ready':'booting';
    const connected=backendState==='connected'||backendState==='preview';
    root.dataset.betaOpening=String(openingOpen);
    const detailMatch=matches.find(m=>m.id===detailMatchId);
    const detailVisible=Boolean(detailMatch&&!authOpen&&(view==='home'||detailOrigin==='history'&&view==='matches'));
    root.dataset.betaDetail=String(detailVisible);
    comparisonIds=comparisonIds.filter(id=>matches.some(match=>match.id===id));
    if(comparisonIds.length<2)comparisonOpen=false;
    if(openingOpen){
      if(launchPending&&root.querySelector('[data-auto-launch="true"]'))return;
      root.innerHTML=renderOpening();
      if(launchPending){
        const delay=matchMedia('(prefers-reduced-motion: reduce)').matches?0:900;
        setTimeout(()=>{launchPending=false;openingOpen=false;render()},delay);
      }
      return;
    }
    if(comparisonOpen&&!authOpen&&view==='home'){root.innerHTML=renderComparison();return}
    if(detailVisible){root.innerHTML=renderDetail(detailMatch);return}
    root.innerHTML=`<div class="fm-beta-shell">
      <header class="fm-beta-topbar"><div class="fm-beta-brand"><button class="fm-beta-brand-home" type="button" data-action="opening" aria-label="앱 시작 화면"><img src="/src/app/assets/footmate-original.png" width="36" height="36" alt=""></button><h1>FootMate</h1><span class="fm-beta-live" data-beta-backend="${connected?'connected':backendState==='error'?'error':'connecting'}">${backendState==='error'?'연결 오류':'Demo'}</span></div><button class="fm-beta-link" type="button" data-action="open-account" ${authOpen?'hidden':''}>${session&&user?esc(profile?.display_name||'내 정보'):'로그인'}</button></header>
      
      ${session&&user&&view==='matches'?`<nav class="fm-beta-account-tabs" aria-label="내 경기 메뉴">${[['joined','참가 경기'],['waitlist','대기'],['history','참석 이력']].map(([tab,label])=>`<button class="fm-beta-button" type="button" data-action="matches-tab" data-tab="${tab}" ${matchesTab===tab?'aria-current="page"':''}>${label}</button>`).join('')}</nav>`:''}
      ${notice?`<div class="fm-beta-note" data-tone="${esc(notice.tone)}" style="margin-bottom:18px">${esc(notice.message)}</div>`:''}
      ${['error','preview'].includes(backendState)?renderConnectionStatus('retry-backend'):''}
      ${backendState==='error'?'':`<div class="fm-beta-grid"><aside><div class="fm-beta-account-view" ${!(authOpen||(session&&user&&view==='my'))?'hidden':''}>${authOpen?'<button class="fm-beta-link fm-beta-back" type="button" data-action="close-account" aria-label="← 뒤로"><span class="fm-icon" aria-hidden="true">⬅</span> 뒤로</button>':''}${session&&user?`<nav class="fm-beta-account-tabs" aria-label="내 정보 메뉴">${[['profile','프로필'],['notifications','알림'],['settings','설정']].map(([tab,label])=>`<button class="fm-beta-button" type="button" data-action="account-tab" data-tab="${tab}" ${accountTab===tab?'aria-current="page"':''}>${label}</button>`).join('')}</nav>`:''}${renderAuth()}</div><div class="fm-beta-joined-view">${renderParticipation()}</div></aside><section data-beta-main${autoLaunch?' data-combined-discovery':''}>${isDemoEntry&&root.dataset.betaOnboarding==='true'?renderRecommendationExample():''}<div class="fm-beta-panel fm-beta-catalog"><div class="fm-beta-panel-head"><div><h2 id="recommendation-title">${freshMatches?'새 경기':'추천 경기'}</h2>${isDemoEntry?'':`<p>${esc(formatSync(lastSyncedAt))}</p>`}</div><button class="fm-beta-button fm-beta-refresh" type="button" data-action="refresh" aria-label="새로고침" title="${isDemoEntry?'경기 정보 업데이트':'새로고침'}" ${busy?'disabled':''}><i class="fm-icon fm-beta-ui-icon" aria-hidden="true">🔄</i></button></div>${freshMatches?'<button class="fm-beta-link" type="button" data-action="clear-new-matches">전체 보기</button>':`${renderSavedShelf()}`}${renderMatches()}</div></section></div>`}
      ${session&&user?`<nav class="fm-beta-app-nav" aria-label="Beta 메뉴">${[['home','추천','✨'],['matches','내 경기','🗓'],['my','MY','👤']].map(([tab,label,icon])=>`<button type="button" data-action="navigate" data-view="${tab}" ${view===tab?'aria-current="page"':''}><i class="fm-icon" aria-hidden="true">${icon}</i><span>${label}</span></button>`).join('')}</nav>`:''}
      <footer class="fm-beta-footer" ${isDemoEntry?'hidden':''}>${isDemoEntry?'':'FootMate Demo · 무료 참가'}</footer>
    </div>`;
  }

  async function loadMatches(){
    if(!client&&!isDemoEntry)return;
    try{
      matchesError=null;
      const rows=isDemoEntry?demoCatalog(user?.id,Date.now(),savedDemoMatches().map(row=>row.id)):await client.matches.list({limit:50});
      const futsal=(Array.isArray(rows)?rows:[]).filter(isFutsalMatch);
      const live=futsal.some(m=>['open','full'].includes(m.status)&&new Date(m.starts_at)>new Date());
      const savedDemoIds=session&&user?new Set([pendingMatchId,...demoParticipations(user.id).filter(p=>p.status==='confirmed').map(p=>p.match_id)].filter(Boolean)):new Set();
      const examples=!isDemoEntry&&session&&user?demoCatalog(user.id,Date.now(),savedDemoIds).filter(m=>!live||savedDemoIds.has(m.id)):[];
      matches=normalizeBetaMatches([...futsal,...examples]);
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
    const privateRows=Array.isArray(nextParticipations)?nextParticipations:[];
    const missingIds=[...new Set(privateRows.filter(p=>p.status==='confirmed'||p.checked_in_at).map(p=>p.match_id).filter(id=>id&&!matches.some(m=>m.id===id)))];
    const historyRows=!isDemoEntry&&missingIds.length?await client.matches.listByIds({matchIds:missingIds}).catch(()=>[]):[];
    participationMatchHistory=normalizeBetaMatches(historyRows);
    await configureDiscoveryTransport(analyticsConfig,user.id,session.accessToken);
    participations=[...privateRows,...demoParticipations(user.id)];
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
    window.dispatchEvent(new Event('footmate:beta:catalog-refreshed'));
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
      const config=await loadBetaBackendConfig();analyticsConfig=config;
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
    }catch{
      if(isDemoEntry){
        client=null;session=null;user=null;
        await loadMatches();
        lastSyncedAt=Date.now();
        backendState='preview';
        setNotice(null);
      }else{
        backendState='error';
        setNotice(null);
      }
    }
    render();
    if(backendState==='connected')window.dispatchEvent(new Event('footmate:beta:connection-ready'));
    emitDiscoveryMeasurement('entry_viewed',{durationMs:Date.now()-entryStartedAt,isDemo:isDemoEntry||matches.some(m=>m.isDemo)});
  }

  root.addEventListener('submit',event=>{
    const form=event.target.closest('form[data-form]');
    if(!form)return;
    event.preventDefault();
    const data=new FormData(form);
    if(form.dataset.form==='auth'){
      if(!client){focusScreen('[data-action="retry-backend"]',{scroll:true});return}
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
        if(pendingMatchId&&changes.position){view='home';sessionStorage.setItem('footmate:beta:view:v1',view);detailMatchId=pendingMatchId;detailTab='slots';sessionStorage.setItem('footmate:beta:detail-match:v1',detailMatchId)}
      });
    }
  });

  root.addEventListener('toggle',event=>{
    if(!root.contains(event.target))return;
    if(event.target.matches('.fm-beta-presets'))presetsOpen=event.target.open;
    if(event.target.matches('.fm-beta-saved-list'))savedMatchesOpen=event.target.open;
  },true);

  window.addEventListener('footmate:beta:same-venue',event=>{
    if(!session||!user||view!=='matches'||matchesTab!=='history')return;
    const id=event.detail?.matchId;
    const attended=participations.some(row=>row.match_id===id&&row.checked_in_at&&!row.is_demo);
    const previous=[...matches,...participationMatchHistory].find(match=>match.id===id);
    if(!attended||!previous)return;
    const conditions=selectedPreferences();
    const excluded=new Set(participations.filter(row=>row.status==='confirmed').map(row=>row.match_id));
    const next=nextAtVenue(matches,previous,{...conditions,position:conditions.position||profile?.position},excluded);
    if(!next){
      const status=[...root.querySelectorAll('[data-venue-status]')].find(node=>node.dataset.venueStatus===id);
      if(status)status.textContent='조건에 맞는 경기 없음';
      return;
    }
    venueOriginId=id;detailOrigin='history';detailMatchId=next.id;detailTab='info';
    render();focusScreen('h1');
  });

  root.addEventListener('click',event=>{
    const utility=event.target.closest('[data-beta-measure]');
    if(utility){emitBetaMeasurement(utility.dataset.betaMeasure,{matchId:utility.dataset.matchId});return;}
    const target=event.target.closest('[data-action]');
    if(!target)return;
    const action=target.dataset.action;
    if(['match-detail','save-demo-match','compare-toggle','demo-prev','demo-next','random-recommendation','restart-discovery','expand-preview','focus-auth'].includes(action))recommendationInteracted=true;
    if(['save-preset','apply-preset','remove-preset','new-preset-matches'].includes(action)){
      handlePresetAction(action,target);return;
    }
    if(action==='clear-new-matches'){
      freshMatches=null;demoPage=0;previewExpanded=false;recommendationInteracted=false;recommendationAnchorId='';seenRecommendations.clear();render();focusScreen('#recommendation-title',{scroll:true});return;
    }
    if(action==='save-demo-match'&&isDemoEntry){
      const id=target.dataset.matchId;
      const rows=savedDemoMatches();
      const match=matches.find(item=>item.id===id&&item.isDemo);
      const alreadySaved=rows.some(row=>row.id===id);
      if(!alreadySaved&&!match)return;
      const next=alreadySaved?rows.filter(row=>row.id!==id):[{id,title:match.title,startsAt:match.startsAt},...rows].slice(0,12);
      const scroll=root.querySelector('.fm-beta-detail-body')||root.querySelector('[data-beta-main]');
      const top=scroll?.scrollTop||0;
      const anchor=target.classList.contains('fm-beta-save-toggle')?target.getBoundingClientRect().top:null;
      try{localStorage.setItem(savedDemoKey,JSON.stringify(next))}catch{setNotice('경기를 저장하지 못했어요.','error')}
      render();
      requestAnimationFrame(()=>{
        const container=root.querySelector('.fm-beta-detail-body')||root.querySelector('[data-beta-main]');
        if(container)container.scrollTop=top;
        const button=[...root.querySelectorAll('.fm-beta-save-toggle')].find(item=>item.dataset.matchId===id);
        if(container&&button&&anchor!==null)container.scrollTop+=button.getBoundingClientRect().top-anchor;
        (button||root.querySelector('#saved-match-menu, .fm-beta-match [data-action="match-detail"]'))?.focus({preventScroll:true});
      });
      return;
    }
    if(action==='discovery-consent'||action==='discovery-withdraw'){
      run(async()=>{await setDiscoveryConsent(action==='discovery-withdraw'||discoveryTransportStatus().withdrawalPending?false:!discoveryTransportStatus().enabled);setNotice(discoveryTransportStatus().enabled?'통계 참여를 시작했어요.':'통계 참여를 해제했어요.','success')});return;
    }
    if(action==='recommendation-reaction'){
      const match=matches.find(m=>m.id===target.dataset.matchId);if(!match)return;
      const reactionScroll=root.querySelector('.fm-beta-detail-body')?.scrollTop||0;
      const reactionKind=target.dataset.reaction;
      const rows=reactions(match.isDemo),previous=rows.find(r=>r.matchId===match.id);
      const next=rows.filter(r=>r.matchId!==match.id);
      if(previous?.kind!==target.dataset.reaction)next.push({matchId:match.id,kind:target.dataset.reaction,venue:match.place,level:match.level,hour:new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',hour12:false}).format(new Date(match.startsAt)),at:Date.now(),scope:match.isDemo?'demo':'live'});
      try{localStorage.setItem(reactionKey(match.isDemo),JSON.stringify(next.slice(-50)))}catch{setNotice('추천 반응을 저장하지 못했어요.','error')}
      emitDiscoveryMeasurement('reaction_submitted',{isDemo:match.isDemo,matchId:match.id});render();
      restoreReactionInteraction(reactionScroll,`[data-action="recommendation-reaction"][data-reaction="${reactionKind}"]`);return;
    }
    if(action==='clear-reactions'){
      const match=matches.find(m=>m.id===detailMatchId);if(match){
        const reactionScroll=root.querySelector('.fm-beta-detail-body')?.scrollTop||0;
        try{localStorage.removeItem(reactionKey(match.isDemo))}catch{setNotice('추천 반응을 초기화하지 못했어요.','error')}
        render();restoreReactionInteraction(reactionScroll,'[data-action="clear-reactions"]');
      }return;
    }
    if(action==='compare-toggle'){
      const id=target.dataset.matchId;
      if(comparisonIds.includes(id))comparisonIds=comparisonIds.filter(value=>value!==id);
      else if(comparisonIds.length<2)comparisonIds.push(id);
      else{setNotice('비교는 두 경기까지 가능해요. 선택한 경기를 해제한 뒤 담아주세요.');render();focusScreen('[data-action="compare-open"]');return}
      const scroll=root.querySelector('[data-beta-main]')?.scrollTop||0;render();requestAnimationFrame(()=>{const main=root.querySelector('[data-beta-main]');if(main)main.scrollTop=scroll;root.querySelector('[data-action="compare-toggle"]')?.focus({preventScroll:true})});return;
    }
    if(action==='compare-remove'){
      comparisonIds=comparisonIds.filter(id=>id!==target.dataset.matchId);
      render();
      focusScreen(comparisonIds.length?'[data-action="compare-remove"]':'[data-action="compare-toggle"]');
      return;
    }
    if(action==='compare-clear'){comparisonIds=[];render();focusScreen('[data-action="compare-toggle"]');return}
    if(action==='compare-open'){if(comparisonIds.length!==2)return;rememberResults();comparisonOpen=true;render();focusScreen('h1');return}
    if(action==='compare-back'){comparisonOpen=false;closeDetail();restoreResults();return}
    if(action==='compare-detail'){comparisonOpen=false;detailOrigin='comparison';detailMatchId=target.dataset.matchId;detailTab='info';sessionStorage.setItem('footmate:beta:detail-match:v1',detailMatchId);render();focusScreen('h1');return}
    if(action==='match-detail'){savedDetailOrigin=target.hasAttribute('data-saved-entry')?target.dataset.matchId:'';rememberResults();emitDiscoveryMeasurement('match_detail_opened',{isDemo:matches.find(m=>m.id===target.dataset.matchId)?.isDemo,matchId:target.dataset.matchId});detailMatchId=target.dataset.matchId;detailTab='info';sessionStorage.setItem('footmate:beta:detail-match:v1',detailMatchId);render();focusScreen('h1');return}
    if(action==='detail-back'){
      const origin=detailOrigin;closeDetail();
      if(origin==='comparison'&&comparisonIds.length===2){comparisonOpen=true;render();focusScreen('h1')}
      else if(origin==='history'){
        const id=venueOriginId;venueOriginId='';render();
        requestAnimationFrame(()=>[...root.querySelectorAll('[data-growth-action="same-venue"]')].find(button=>button.dataset.matchId===id)?.focus());
      }else restoreResults();
      return;
    }
    if(action==='detail-tab'){detailTab=target.dataset.tab;render();return}
    if(action==='setup-position'){pendingMatchId=target.dataset.matchId||detailMatchId;sessionStorage.setItem('footmate:beta:pending-match:v1',pendingMatchId);setView('my');accountTab='profile';render();focusScreen('[name="position"]');return}
    if(action==='opening'){closeDetail();openingOpen=!autoLaunch;authOpen=false;if(autoLaunch){setView('home');return}render();return}
    if(action==='opening-preview-next'){openingPreviewPage++;render();root.querySelector('[data-action="opening-preview-next"]')?.focus();return;}
    if(action==='opening-start'||action==='opening-login'){
      openingOpen=false;sessionStorage.setItem('footmate:beta:entered:v1','1');
      if(session&&user){if(isDemoEntry){sessionStorage.setItem('footmate:beta:view:v1',action==='opening-login'?'my':'home');location.replace('/beta');return}setView(action==='opening-login'?'my':'home');return}
      authEntry=action==='opening-login'?'opening':'results';authOpen=action==='opening-login';
      if(!authOpen&&!isDemoEntry&&!openingExperiment){location.assign('/demo');return}
      render();focusScreen('[data-beta-main] h2');return;
    }
    if(action==='random-recommendation'||action==='restart-discovery'){
      if(recommendationBusy)return;
      const eligible=recommendationMatches();
      if(action==='restart-discovery'){
        const current=root.querySelector('.fm-beta-match')?.dataset.matchId;
        seenRecommendations=new Set(current?[current]:[]);
      }
      const next=pickUnseenRecommendation(eligible.map(match=>match.id),seenRecommendations);
      if(next){emitDiscoveryMeasurement('recommendation_redrawn',{resultCount:eligible.length,isDemo:eligible.every(m=>m.isDemo)});previewExpanded=true;demoPage=eligible.findIndex(match=>match.id===next);render();root.querySelector('.fm-beta-discovery button')?.focus();}
      return;
    }
    if(action==='demo-prev'||action==='demo-next'){demoPage=Math.max(0,demoPage+(action==='demo-next'?1:-1));render();focusScreen('.fm-beta-match h3');return}
    if(action==='matches-tab'){matchesTab=target.dataset.tab;render();return}
    if(action==='account-tab'){accountTab=target.dataset.tab;render();return}
    if(action==='joined-prev'||action==='joined-next'){joinedPage=Math.max(0,joinedPage+(action==='joined-next'?1:-1));render();return}
    if(action==='navigate'){setView(target.dataset.view);return}
    if(action==='more-matches'){visibleLimit+=8;render();return}
    if(action==='toggle-auth'){authMode=authMode==='signin'?'signup':'signin';setNotice(null);render();return}
    if(action==='expand-preview'){previewExpanded=true;demoPage++;render();focusScreen('.fm-beta-match h3');return}
    if(action==='unlock-preview'){authEntry='results';authOpen=true;render();root.querySelector('#beta-auth-panel h2, #beta-auth-panel input')?.focus();return}
    if(action==='open-account'||action==='focus-auth'){
      comparisonOpen=false;authEntry='results';
      if(session&&user&&action==='open-account'){setView('my');return}
      if(action==='focus-auth'){pendingMatchId=target.dataset.matchId||'';sessionStorage.setItem('footmate:beta:pending-match:v1',pendingMatchId)}
      else{pendingMatchId='';sessionStorage.removeItem('footmate:beta:pending-match:v1')}
      authOpen=true;render();root.querySelector('#beta-auth-panel h2, #beta-auth-panel input')?.focus();window.scrollTo({top:0,behavior:'smooth'});return;
    }
    if(action==='close-account'){if((!session||!user)&&authEntry==='opening'){openingOpen=true;authOpen=false;render();return}authOpen=false;render();root.querySelector('[data-pending-match] button, [data-action="open-account"]')?.focus();return} 
    if(action==='retry-backend'){boot();return}
    if(action==='refresh'){
      run(async()=>{await refreshData();setNotice(matchesError?null:'새로고침 완료','success')});return;
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
        const deletedUserId=user.id;
        await client.auth.deleteAccount({accessToken:session.accessToken});
        let localCleanupFailed=false;
        try{
          clearDemoParticipations(deletedUserId);
          localStorage.removeItem(discoveryPresetKey(false,deletedUserId));
          localStorage.removeItem('footmate:beta:reactions:v1:'+deletedUserId+':demo');
          localStorage.removeItem('footmate:beta:reactions:v1:'+deletedUserId+':live');
          if(localStorage.getItem('footmate:beta:preferences-owner:v1')===deletedUserId){
            localStorage.removeItem('footmate:beta:preferences-owner:v1');
            localStorage.removeItem('footmate:beta:preferences:v1');
            localStorage.removeItem('footmate:beta:ranking:v1');
          }
          sessionStorage.removeItem('footmate:beta:preferences-dirty:v1');
          sessionStorage.removeItem('footmate:beta:discovery-events:v1');
        }catch{localCleanupFailed=true}
        clearSession();
        setNotice(localCleanupFailed?'서버 계정은 삭제했지만 이 기기의 데모 기록은 일부 남아 있을 수 있습니다. 브라우저 저장 공간을 확인해주세요.':'계정과 연결된 Beta 개인정보·참가 기록을 삭제했습니다.',localCleanupFailed?'error':'success');
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
    run(async()=>{await refreshData();if(!matchesError)setNotice('연결 복구','success')});
  });

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible'||backendState!=='connected'||busy)return;
    if(lastSyncedAt&&Date.now()-lastSyncedAt<60_000)return;
    run(async()=>{await refreshData()});
  });

  window.addEventListener('footmate:beta:discovery-consent-changed',()=>render());
  window.addEventListener('footmate:beta:recommendations',event=>{
    const openFilters=openQuickFilterIds(root);
    const focusedFilter=document.activeElement?.id;
    if(freshMatches&&presetSignature(selectedPreferences())!==freshMatches.signature)freshMatches=null;
    const scrollTop=root.querySelector('[data-beta-main]')?.scrollTop||0;
    const current=root.querySelector('.fm-beta-match')?.dataset.matchId;
    const conditions=event.detail?.conditions||'';
    serverReactions=normalizeReactions(event.detail?.reactions||[]);
    const firstRecommendation=!recommendationConditions;
    const changed=conditions!==recommendationConditions;
    recommendationConditions=conditions;
    recommendationBusy=Boolean(event.detail?.busy);
    recommendedIds=event.detail?.ids??null;recommendationReasons=event.detail?.reasons||{};
    if(changed){
      recommendationInteracted=false;
      demoPage=0;previewExpanded=false;seenRecommendations.clear();
      recommendationAnchorId=firstRecommendation&&recommendedIds?.includes(pendingMatchId)?pendingMatchId:'';
      if(recommendationAnchorId){demoPage=recommendedIds.indexOf(recommendationAnchorId);if(demoPage>=3)previewExpanded=true;}
    }
    else{
      if(recommendationBusy&&current&&lastMeasuredRecommendation)recommendationAnchorId=current;
      const anchor=recommendationAnchorId||(recommendationInteracted?current:'');
      const anchorIndex=freshMatches?recommendationMatches().findIndex(match=>match.id===anchor):recommendedIds?.indexOf(anchor);
      if(anchor&&anchorIndex>=0){demoPage=anchorIndex;if(demoPage>=3)previewExpanded=true;}
    }
    if(!recommendationBusy)recommendationAnchorId='';
    // Ranking updates must not replace an active comparison, detail, login or account view.
    if(comparisonOpen||detailMatchId||authOpen||openingOpen||view!=='home')return;
    render();
    // Growth restores its controls after the base view is rendered.
    if(!changed)requestAnimationFrame(()=>{const main=root.querySelector('[data-beta-main]');if(main)main.scrollTop=scrollTop});
    if(!changed&&openFilters.length)queueMicrotask(()=>restoreQuickFilters(root,openFilters));
    if(focusedFilter?.startsWith('quick-filter-')||focusedFilter==='recommendation-title'||focusedFilter?.startsWith('preset-'))queueMicrotask(()=>{const node=document.getElementById(focusedFilter);if(node){if(focusedFilter==='recommendation-title')node.tabIndex=-1;node.focus({preventScroll:true})}});
  });
  boot();
}
