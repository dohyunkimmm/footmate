import {createSupabaseBetaClient,loadBetaBackendConfig,SupabaseBetaError} from './infrastructure/supabase-beta.js';

const root=document.getElementById('footmate-beta-operator');
const SESSION_KEY='footmate:beta:auth:v1';
const POSITIONS=['MF','FW','DF','GK'];
const LEVELS=['입문','초중급','중급','중급+'];

if(root){
  let client=null;
  let session=null;
  let user=null;
  let membership=null;
  let state='booting';
  let matches=[];
  let selectedId=null;
  let participants=[];
  let busy=false;
  let notice=null;
  let failure=null;

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const current=()=>matches.find(match=>match.id===selectedId)||null;

  function storedSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
  function writeSession(payload){
    const accessToken=String(payload?.access_token||'').trim();
    const refreshToken=String(payload?.refresh_token||'').trim();
    if(!accessToken||!refreshToken)return null;
    session={accessToken,refreshToken,expiresAt:Number(payload?.expires_at||0)||Math.floor(Date.now()/1000)+Number(payload?.expires_in||3600)};
    localStorage.setItem(SESSION_KEY,JSON.stringify(session));
    if(payload?.user)user=payload.user;
    return session;
  }
  function clearSession(){localStorage.removeItem(SESSION_KEY);session=null;user=null;membership=null}
  function setNotice(message,tone='info'){notice=message?{message,tone}:null}
  function formatStart(value){return new Intl.DateTimeFormat('ko-KR',{month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value))}
  function localDateTime(value){
    const date=value?new Date(value):new Date(Date.now()+24*60*60*1000);
    if(!value){date.setHours(20,0,0,0)}
    const offset=date.getTimezoneOffset()*60000;
    return new Date(date.getTime()-offset).toISOString().slice(0,16);
  }
  function friendly(error){
    const raw=String(error?.message||'요청을 처리하지 못했습니다.');
    if(/OPERATOR_REQUIRED/.test(raw))return '이 계정에는 운영자 권한이 없습니다.';
    if(/POSITION_CAPACITY_INCOMPLETE/.test(raw))return '포지션 정원 합계를 확인해주세요.';
    if(/POSITION_HAS_PARTICIPANTS/.test(raw))return '참가자가 있는 포지션은 제거할 수 없습니다.';
    if(/MATCH_CAPACITY_BELOW_JOINED/.test(raw))return '현재 참가 인원보다 정원을 줄일 수 없습니다.';
    if(/MATCH_START_NOT_FUTURE/.test(raw))return '공개 경기는 현재보다 미래 시간이어야 합니다.';
    if(/MATCH_NOT_EDITABLE/.test(raw))return '취소 또는 종료된 경기는 수정할 수 없습니다.';
    if(error instanceof SupabaseBetaError&&error.status>=500)return '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.';
    return raw;
  }

  function slotValue(match,position){return Number((match?.match_slots||[]).find(slot=>slot.position===position)?.capacity_total||0)}
  function joinedSlotValue(match,position){return Number((match?.match_slots||[]).find(slot=>slot.position===position)?.joined_count||0)}
  function statusLabel(status){return ({draft:'초안',open:'공개',full:'마감',canceled:'취소',completed:'종료'})[status]||status}

  function renderGate(){
    if(state==='booting')return `<div class="fm-beta-shell"><div class="fm-beta-panel"><div class="fm-beta-empty"><span class="fm-beta-spinner"></span>운영자 권한과 실제 DB를 확인하고 있습니다.</div></div></div>`;
    if(state==='auth-required')return `<div class="fm-beta-shell"><div class="fm-beta-panel"><div class="fm-beta-empty"><strong>먼저 Closed Beta에 로그인해주세요.</strong>운영자 콘솔은 사용자 Beta 계정의 세션을 공유합니다.<div class="fm-beta-actions" style="justify-content:center;margin-top:14px"><a class="fm-beta-button fm-beta-button--primary" href="/beta">Beta 로그인</a></div></div></div></div>`;
    if(state==='forbidden')return `<div class="fm-beta-shell"><div class="fm-beta-panel"><div class="fm-beta-empty"><strong>운영자 권한이 없는 계정입니다.</strong>운영자 allowlist에 등록된 계정만 경기와 참가자를 관리할 수 있습니다.<div class="fm-beta-actions" style="justify-content:center;margin-top:14px"><a class="fm-beta-button" href="/beta">사용자 Beta로 돌아가기</a></div></div></div></div>`;
    if(state==='error')return `<div class="fm-beta-shell"><div class="fm-beta-panel"><div class="fm-beta-empty"><strong>운영자 콘솔을 불러오지 못했습니다.</strong>${esc(failure||'연결을 확인해주세요.')}<div class="fm-beta-actions" style="justify-content:center;margin-top:14px"><button class="fm-beta-button" type="button" data-action="retry">다시 시도</button></div></div></div></div>`;
    return '';
  }

  function renderList(){
    if(!matches.length)return `<div class="fm-beta-empty"><strong>아직 등록된 경기가 없습니다.</strong>새 경기를 만들어 초안으로 저장하거나 바로 공개할 수 있습니다.</div>`;
    return `<div class="fm-operator-list">${matches.map(match=>`<button class="fm-operator-item" type="button" data-action="select-match" data-match-id="${esc(match.id)}" aria-current="${match.id===selectedId?'true':'false'}"><strong>${esc(match.title)}</strong><span>${esc(formatStart(match.starts_at))} · ${esc(match.region)} · ${match.joined_count}/${match.capacity_total}명</span><span class="fm-operator-status">${esc(statusLabel(match.status))}</span></button>`).join('')}</div>`;
  }

  function renderForm(){
    const match=current();
    const readonly=Boolean(match&&['canceled','completed'].includes(match.status));
    const status=match?.status==='full'?'open':match?.status||'draft';
    return `<form class="fm-operator-form ${readonly?'fm-operator-readonly':''}" data-form="match">
      <div class="fm-beta-panel-head"><div><h2>${match?'경기 편집':'새 경기'}</h2><p>경기와 포지션 정원은 한 transaction으로 저장됩니다.</p></div>${match?`<span class="fm-beta-badge">${esc(statusLabel(match.status))}</span>`:''}</div>
      <div class="fm-operator-row"><label class="fm-beta-field"><span>경기명</span><input name="title" required maxlength="100" value="${esc(match?.title||'')}"></label><label class="fm-beta-field"><span>구장명</span><input name="venueName" required maxlength="100" value="${esc(match?.venue_name||'')}"></label></div>
      <div class="fm-operator-row"><label class="fm-beta-field"><span>지역</span><input name="region" required maxlength="80" value="${esc(match?.region||'수원 · 영통')}"></label><label class="fm-beta-field"><span>지역 라벨</span><input name="areaLabel" maxlength="60" value="${esc(match?.area_label||'영통')}"></label></div>
      <label class="fm-beta-field"><span>주소</span><input name="address" required maxlength="160" value="${esc(match?.address||'')}"></label>
      <div class="fm-operator-row"><label class="fm-beta-field"><span>시작 시간</span><input name="startsAt" type="datetime-local" required value="${esc(localDateTime(match?.starts_at))}"></label><label class="fm-beta-field"><span>레벨</span><select name="level" required>${LEVELS.map(level=>`<option value="${level}" ${(match?.level||'초중급')===level?'selected':''}>${level}</option>`).join('')}</select></label></div>
      <div class="fm-operator-row"><label class="fm-beta-field"><span>경기 형식</span><input name="formatLabel" required maxlength="40" value="${esc(match?.format_label||'6 vs 6')}"></label><label class="fm-beta-field"><span>구장 표면</span><input name="surface" required maxlength="40" value="${esc(match?.surface||'인조잔디')}"></label></div>
      <div class="fm-operator-row"><label class="fm-beta-field"><span>경기 시간(분)</span><input name="durationMinutes" type="number" min="30" max="240" required value="${Number(match?.duration_minutes||80)}"></label><label class="fm-beta-field"><span>공개 상태</span><select name="status"><option value="draft" ${status==='draft'?'selected':''}>초안</option><option value="open" ${status==='open'?'selected':''}>공개</option></select></label></div>
      <div><h3 class="fm-beta-section-title">포지션 정원</h3><div class="fm-operator-row fm-operator-row--4">${POSITIONS.map(position=>`<label class="fm-beta-field"><span>${position} · 현재 ${joinedSlotValue(match,position)}명</span><input name="slot-${position}" type="number" min="0" max="30" value="${slotValue(match,position)}"></label>`).join('')}</div></div>
      <div class="fm-beta-note">Beta 1은 무료 참가만 허용합니다. 저장 시 price는 0원으로 고정되며 포지션 정원 합계가 경기 전체 정원이 됩니다.</div>
      <div class="fm-beta-actions"><button class="fm-beta-button fm-beta-button--primary" type="submit" ${busy||readonly?'disabled':''}>${busy?'<span class="fm-beta-spinner"></span>저장 중':'경기 저장'}</button>${match?`<button class="fm-beta-button fm-beta-button--danger" type="button" data-action="cancel-match" ${busy||readonly?'disabled':''}>경기 취소</button>`:''}<button class="fm-beta-button" type="button" data-action="new-match" ${busy?'disabled':''}>새 경기</button></div>
    </form>`;
  }

  function renderParticipants(){
    const match=current();
    if(!match)return `<div class="fm-beta-empty"><strong>경기를 선택해주세요.</strong>선택한 경기의 실제 참가자를 여기서 관리합니다.</div>`;
    if(!participants.length)return `<div class="fm-beta-empty"><strong>현재 참가자가 없습니다.</strong>참가자가 생기면 이름과 포지션이 표시됩니다.</div>`;
    return `<div>${participants.map(item=>`<div class="fm-operator-participant"><div><strong>${esc(item.profile?.display_name||'FootMate 사용자')} · ${esc(item.position||'')}</strong><span>${esc(item.profile?.region||'지역 미설정')} · ${esc(item.profile?.level||'레벨 미설정')} · ${esc(formatStart(item.joined_at))} 참가</span></div><button class="fm-beta-button fm-beta-button--danger" type="button" data-action="cancel-participant" data-user-id="${esc(item.user_id)}" ${busy?'disabled':''}>참가 취소</button></div>`).join('')}</div>`;
  }

  function render(){
    root.dataset.operatorState=state;
    if(state!=='ready'){root.innerHTML=renderGate();return}
    const openCount=matches.filter(item=>['open','full'].includes(item.status)).length;
    const joined=matches.reduce((sum,item)=>sum+Number(item.joined_count||0),0);
    root.innerHTML=`<div class="fm-beta-shell">
      <header class="fm-beta-topbar"><div class="fm-beta-brand"><span class="fm-beta-mark">FM</span><span>FootMate Operator</span></div><nav class="fm-operator-nav"><span class="fm-beta-live" data-beta-backend="connected">Operator Connected</span><a class="fm-beta-button" href="/beta">사용자 Beta</a></nav></header>
      <section class="fm-beta-hero"><div class="fm-beta-hero-copy"><span class="fm-beta-eyebrow">Closed Beta · Operator</span><h1>경기 만들고,<br>참가자 관리하고,<br>상태를 닫기.</h1><p>운영자 allowlist와 Supabase RLS를 통과한 계정만 접근합니다. 경기·포지션 정원 저장과 참가 취소는 DB transaction으로 처리됩니다.</p></div><div class="fm-beta-status-card"><div><small>운영 계정</small><strong>${esc(user?.email||membership?.user_id||'Operator')}</strong></div><p>결제와 알림은 연결하지 않습니다. Closed Beta에서는 무료 경기 운영만 지원합니다.</p></div></section>
      ${notice?`<div class="fm-beta-note" data-tone="${esc(notice.tone)}" style="margin-bottom:18px">${esc(notice.message)}</div>`:''}
      <div class="fm-operator-summary"><div><b>${matches.length}</b><span>전체 경기</span></div><div><b>${openCount}</b><span>공개/마감</span></div><div><b>${joined}</b><span>현재 참가 인원</span></div></div>
      <div class="fm-operator-grid"><section><div class="fm-beta-panel">${renderForm()}</div><div class="fm-beta-panel"><div class="fm-beta-panel-head"><div><h3>참가자 관리</h3><p>운영자 취소 시 경기·포지션 잔여 자리를 함께 복구합니다.</p></div></div>${renderParticipants()}</div></section><aside><div class="fm-beta-panel"><div class="fm-beta-panel-head"><div><h2>경기 목록</h2><p>초안 포함 운영자 전용 목록입니다.</p></div><button class="fm-beta-button" type="button" data-action="refresh" ${busy?'disabled':''}>새로고침</button></div>${renderList()}</div></aside></div>
      <footer class="fm-beta-footer">Operator Console · Auth / Match / Capacity / Participation = Supabase connected · Payment / Notification = not connected</footer>
    </div>`;
  }

  async function loadMatches(){
    matches=await client.operator.listMatches({accessToken:session.accessToken,limit:50});
    if(selectedId&&!matches.some(item=>item.id===selectedId)){selectedId=null;participants=[]}
  }
  async function loadParticipants(){
    participants=selectedId?await client.operator.listParticipants({accessToken:session.accessToken,matchId:selectedId}):[];
  }
  async function restore(){
    state='booting';failure=null;render();
    try{
      const config=await loadBetaBackendConfig();
      client=createSupabaseBetaClient(config);
      const stored=storedSession();
      if(!stored?.refreshToken){state='auth-required';render();return}
      try{
        const refreshed=await client.auth.refresh({refreshToken:stored.refreshToken});
        writeSession(refreshed);
        user=refreshed?.user||await client.auth.getUser({accessToken:session.accessToken}).then(result=>result?.user||result);
      }catch{
        clearSession();state='auth-required';render();return;
      }
      membership=await client.operator.self({accessToken:session.accessToken});
      if(!membership){state='forbidden';render();return}
      await loadMatches();
      state='ready';render();
    }catch(error){state='error';failure=friendly(error);render()}
  }

  root.addEventListener('click',async event=>{
    const trigger=event.target.closest('[data-action]');
    if(!trigger)return;
    const action=trigger.dataset.action;
    if(action==='retry'){await restore();return}
    if(state!=='ready')return;
    if(action==='new-match'){selectedId=null;participants=[];setNotice(null);render();return}
    if(action==='select-match'){
      selectedId=trigger.dataset.matchId||null;busy=true;render();
      try{await loadParticipants();setNotice(null)}catch(error){setNotice(friendly(error),'error')}
      busy=false;render();return;
    }
    if(action==='refresh'){
      busy=true;render();
      try{await loadMatches();await loadParticipants();setNotice('실제 운영 데이터를 새로고침했습니다.','success')}catch(error){setNotice(friendly(error),'error')}
      busy=false;render();return;
    }
    if(action==='cancel-match'){
      const match=current();if(!match||!confirm(`“${match.title}” 경기를 취소할까요? 현재 참가도 함께 취소되고 자리가 복구됩니다.`))return;
      busy=true;render();
      try{await client.operator.cancelMatch({accessToken:session.accessToken,matchId:match.id});await loadMatches();await loadParticipants();setNotice('경기와 현재 참가를 취소했습니다.','success')}catch(error){setNotice(friendly(error),'error')}
      busy=false;render();return;
    }
    if(action==='cancel-participant'){
      const match=current();const userId=trigger.dataset.userId;if(!match||!userId||!confirm('이 참가를 운영자 권한으로 취소할까요?'))return;
      busy=true;render();
      try{await client.operator.cancelParticipant({accessToken:session.accessToken,matchId:match.id,userId});await loadMatches();await loadParticipants();setNotice('참가를 취소하고 잔여 자리를 복구했습니다.','success')}catch(error){setNotice(friendly(error),'error')}
      busy=false;render();
    }
  });

  root.addEventListener('submit',async event=>{
    const form=event.target.closest('[data-form="match"]');
    if(!form)return;
    event.preventDefault();
    const existing=current();
    const data=new FormData(form);
    const slots=POSITIONS.map(position=>({position,capacityTotal:Number(data.get(`slot-${position}`)||0)}));
    const capacityTotal=slots.reduce((sum,item)=>sum+Math.max(0,item.capacityTotal),0);
    if(capacityTotal<=0){setNotice('포지션 정원을 1명 이상 설정해주세요.','error');render();return}
    const rawStart=String(data.get('startsAt')||'');
    const startsAt=new Date(rawStart);
    if(Number.isNaN(startsAt.getTime())){setNotice('시작 시간을 확인해주세요.','error');render();return}
    busy=true;render();
    try{
      const result=await client.operator.saveMatch({accessToken:session.accessToken,match:{
        id:existing?.id||null,title:data.get('title'),venueName:data.get('venueName'),areaLabel:data.get('areaLabel'),address:data.get('address'),region:data.get('region'),level:data.get('level'),startsAt:startsAt.toISOString(),capacityTotal,formatLabel:data.get('formatLabel'),surface:data.get('surface'),durationMinutes:Number(data.get('durationMinutes')||80),status:data.get('status'),slots
      }});
      selectedId=result?.match_id||existing?.id||null;
      await loadMatches();await loadParticipants();setNotice('경기와 포지션 정원을 저장했습니다.','success');
    }catch(error){setNotice(friendly(error),'error')}
    busy=false;render();
  });

  restore();
}
