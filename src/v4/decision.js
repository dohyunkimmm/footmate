import {MATCHES,createState} from './data.js';
import {footmatePlatform} from './platform/application/platform.js';

const root=document.getElementById('footmate-next');
const DECISION_VERSION='4.3.0';
const DECISION_STORAGE_KEY=footmatePlatform.storageKeys.decision;
const decisionRepository=footmatePlatform.repositories.decision;
const params=new URLSearchParams(location.search);
const requestedMode=params.get('mode');
const mode=['guided','evidence'].includes(requestedMode)?requestedMode:'real';
const MAX_COMPARE=2;

const defaults=Object.freeze({savedMatchIds:[],compareMatchIds:[]});
const composition=Object.freeze({
  'suwon-ingye-2000':{GK:1,DF:2,MF:3,FW:2},
  'gwanggyo-2130':{GK:1,DF:2,MF:2,FW:2},
  'yeongtong-1900':{GK:1,DF:2,MF:3,FW:3},
  'maetan-2030':{GK:1,DF:2,MF:3,FW:2},
  'giheung-2000':{GK:1,DF:2,MF:2,FW:2},
  'jukjeon-2100':{GK:1,DF:2,MF:2,FW:2},
  'gangnam-1930':{GK:1,DF:2,MF:3,FW:2},
  'songpa-2100':{GK:1,DF:2,MF:2,FW:1}
});
const venue=Object.freeze({
  'suwon-ingye-2000':{court:'실외 인조잔디',gear:'풋살화 권장',amenities:'탈의 공간 · 정수기',rule:'금속 스터드 사용 불가'},
  'gwanggyo-2130':{court:'실내 인조잔디',gear:'풋살화 권장',amenities:'탈의실 · 샤워실',rule:'경기 20분 전 입장 권장'},
  'yeongtong-1900':{court:'실내 인조잔디',gear:'풋살화 권장',amenities:'락커 · 정수기',rule:'외부 음료 반입 가능'},
  'maetan-2030':{court:'실외 인조잔디',gear:'풋살화 권장',amenities:'대기 공간 · 정수기',rule:'금속 스터드 사용 불가'},
  'giheung-2000':{court:'실내 인조잔디',gear:'풋살화 권장',amenities:'탈의실 · 주차',rule:'경기 20분 전 입장 권장'},
  'jukjeon-2100':{court:'실내 인조잔디',gear:'풋살화 권장',amenities:'락커 · 주차',rule:'금속 스터드 사용 불가'},
  'gangnam-1930':{court:'옥상 인조잔디',gear:'풋살화 권장',amenities:'탈의 공간 · 정수기',rule:'건물 공용 주차 유료'},
  'songpa-2100':{court:'실내 인조잔디',gear:'풋살화 권장',amenities:'탈의실 · 정수기',rule:'입문 경기 운영 가이드 적용'}
});

let state=readDecision();
let lastCompareTrigger=null;
let applying=false;

function normalize(candidate={}){
  const ids=new Set(MATCHES.map(match=>match.id));
  const saved=Array.isArray(candidate.savedMatchIds)?candidate.savedMatchIds.filter(id=>ids.has(id)):[];
  const compare=Array.isArray(candidate.compareMatchIds)?candidate.compareMatchIds.filter(id=>ids.has(id)).slice(0,MAX_COMPARE):[];
  return {savedMatchIds:[...new Set(saved)],compareMatchIds:[...new Set(compare)]};
}

function readDecision(){
  if(mode!=='real')return {...defaults,savedMatchIds:[],compareMatchIds:[]};
  return normalize(decisionRepository.read({})||{});
}

function persist(){
  if(mode!=='real')return;
  decisionRepository.write(state);
}

function readSession(){
  if(mode!=='real')return createState(mode==='evidence'?{setupComplete:true,route:'home',signedIn:true}:{});
  return createState(footmatePlatform.session.read()||{});
}

function money(value){return new Intl.NumberFormat('ko-KR').format(value)+'원'}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function matchById(id){return MATCHES.find(match=>match.id===id)||null}
function currentMatch(){const session=readSession();return matchById(session.selectedMatchId)||MATCHES[0]}
function openSeats(match){return Math.max(0,Number(match.capacity||0)-Number(match.joined||0))}
function isSaved(id){return state.savedMatchIds.includes(id)}
function isCompared(id){return state.compareMatchIds.includes(id)}

function recommendationRow(match,session){
  const rows=window.__FOOTMATE_RECOMMENDATION__?.rank?.(session)||[];
  return rows.find(row=>row.id===match.id)||null;
}

function icon(name){
  const paths={
    bookmark:'<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.8L6 20V5a1 1 0 0 1 1-1Z"/>',
    compare:'<path d="M8 5h10M8 9h7M6 3v8M16 15H6M16 19H9M18 13v8"/>',
    check:'<path d="m5 12.5 4.2 4L19 7"/>',
    users:'<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.2"/><path d="M3.5 19c.4-3.3 2.5-5.2 5.5-5.2s5.1 1.9 5.5 5.2M14.5 15c2.6-.5 4.8 1 5.4 3.6"/>',
    shield:'<path d="M12 3 19 6v5c0 4.5-2.7 7.5-7 10-4.3-2.5-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    place:'<path d="M4 19h16M6 19V8l6-4 6 4v11M9 11h2M13 11h2M9 15h2M13 15h2"/>',
    close:'<path d="m7 7 10 10M17 7 7 17"/>'
  };
  return `<svg class="fm-decision-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.check}</svg>`;
}

function positionBalance(match){
  const source=composition[match.id]||{};
  return ['GK','DF','MF','FW'].map(position=>`<div class="fm-decision-position"><span>${position}</span><b>${Number(source[position]||0)}명</b></div>`).join('');
}

function reasonBreakdown(match,session){
  const row=recommendationRow(match,session);
  const reasons=(row?.reasons||match.reasons.map(reason=>reason.title)).slice(0,4);
  return `<div class="fm-decision-reason-grid" data-decision-score="${row?.score??''}">
    ${reasons.map((reason,index)=>`<div><span>${String(index+1).padStart(2,'0')}</span><b>${escapeHtml(reason)}</b></div>`).join('')}
  </div>`;
}

function decisionSections(match,session){
  const venueInfo=venue[match.id]||{court:match.surface,gear:'풋살화 권장',amenities:'현장 시설 확인',rule:'운영 안내 확인'};
  const remaining=openSeats(match);
  return `<section class="fm-next-detail-section fm-decision-section" data-decision-section="fit">
    <div class="fm-next-section-head"><div><h2>참가 결정 체크</h2><p>추천 점수 대신 실제로 확인할 조건을 한 번 더 정리했어요.</p></div></div>
    ${reasonBreakdown(match,session)}
  </section>
  <section class="fm-next-detail-section fm-decision-section" data-decision-section="capacity">
    <div class="fm-next-section-head"><div><h2>자리와 포지션</h2><p>실시간 정원이 아닌 현재 샘플 경기 데이터 기준입니다.</p></div></div>
    <div class="fm-decision-capacity"><div><small>현재 샘플 잔여</small><strong>${remaining}자리</strong><span>${match.joined}/${match.capacity}명 참가 상태</span></div><div class="fm-decision-meter" role="progressbar" aria-label="샘플 참가 인원" aria-valuemin="0" aria-valuemax="${match.capacity}" aria-valuenow="${match.joined}"><span style="width:${Math.min(100,Math.round((match.joined/match.capacity)*100))}%"></span></div></div>
    <div class="fm-decision-position-grid" role="group" aria-label="샘플 참가자 포지션 구성">${positionBalance(match)}</div>
    <p class="fm-decision-disclosure">포지션 구성은 프로토타입용 샘플이며 실제 참가자 정보나 실시간 좌석을 의미하지 않습니다.</p>
  </section>
  <section class="fm-next-detail-section fm-decision-section" data-decision-section="venue">
    <div class="fm-next-section-head"><div><h2>시설 · 운영 · 준비물</h2><p>참가 전에 현장에서 필요한 조건을 확인하세요.</p></div></div>
    <div class="fm-decision-info-list">
      <div><span>${icon('place')}</span><div><small>코트</small><b>${escapeHtml(venueInfo.court)}</b></div></div>
      <div><span>${icon('check')}</span><div><small>준비물</small><b>${escapeHtml(venueInfo.gear)}</b></div></div>
      <div><span>${icon('users')}</span><div><small>편의시설</small><b>${escapeHtml(venueInfo.amenities)}</b></div></div>
      <div><span>${icon('shield')}</span><div><small>운영 안내</small><b>${escapeHtml(venueInfo.rule)}</b></div></div>
    </div>
    <p class="fm-decision-disclosure">시설·운영 정보는 서비스 기획 검증용 샘플 데이터입니다.</p>
  </section>
  <section class="fm-next-detail-section fm-decision-section" data-decision-section="refund">
    <div class="fm-next-section-head"><div><h2>취소 · 환불 기준</h2><p>기존 프로토타입 정책을 시간 순서로 비교합니다.</p></div></div>
    <div class="fm-decision-policy-grid">
      <div class="is-strong"><small>경기 24시간 전까지</small><b>전액 환불</b><span>참가비 100%</span></div>
      <div><small>경기 3시간 전까지</small><b>50% 환불</b><span>참가비의 절반</span></div>
      <div><small>운영 취소</small><b>전액 반환</b><span>운영 측 취소 시</span></div>
    </div>
    <p class="fm-decision-disclosure">경기 3시간 이내의 상세 취소 기준은 실제 운영 정책 연동 단계에서 확정합니다.</p>
  </section>`;
}

function toolbar(match){
  const saved=isSaved(match.id);
  const compared=isCompared(match.id);
  return `<div class="fm-decision-toolbar" data-decision-toolbar>
    <button type="button" data-decision-action="toggle-save" data-match-id="${match.id}" aria-pressed="${saved}" class="${saved?'is-active':''}">${icon('bookmark')}<span>${saved?'저장됨':'저장'}</span></button>
    <button type="button" data-decision-action="toggle-compare" data-match-id="${match.id}" aria-pressed="${compared}" class="${compared?'is-active':''}">${icon('compare')}<span>${compared?'비교 선택됨':'비교'}</span></button>
  </div>`;
}

function compareBar(){
  const ids=state.compareMatchIds;
  if(!ids.length)return '';
  const names=ids.map(id=>matchById(id)?.place).filter(Boolean);
  return `<div class="fm-decision-compare-bar" data-decision-compare-bar role="region" aria-label="경기 비교 선택">
    <div><small>비교 ${ids.length}/${MAX_COMPARE}</small><b>${names.map(escapeHtml).join(' · ')}</b></div>
    <div>${ids.length===MAX_COMPARE?'<button type="button" data-decision-action="open-compare">비교하기</button>':''}<button type="button" data-decision-action="clear-compare" class="is-ghost">비우기</button></div>
  </div>`;
}

function patchDetail(){
  const screen=root?.querySelector('[data-screen="detail"]');
  if(!screen)return;
  const match=currentMatch();
  const session=readSession();
  const signature=`${DECISION_VERSION}|${match.id}|${state.savedMatchIds.join(',')}|${state.compareMatchIds.join(',')}`;
  if(screen.dataset.decisionSignature===signature)return;
  screen.dataset.decisionSignature=signature;
  screen.dataset.decisionVersion=DECISION_VERSION;

  screen.querySelector('[data-decision-toolbar]')?.remove();
  screen.querySelectorAll('[data-decision-section]').forEach(node=>node.remove());
  screen.querySelector('[data-decision-compare-bar]')?.remove();

  const address=screen.querySelector('.fm-next-detail-address');
  if(address)address.insertAdjacentHTML('afterend',toolbar(match));

  const hero=screen.querySelector('.fm-next-detail-hero');
  if(hero)hero.insertAdjacentHTML('afterend',decisionSections(match,session));

  const sticky=screen.querySelector('.fm-next-sticky-cta');
  if(sticky&&state.compareMatchIds.length)sticky.insertAdjacentHTML('beforebegin',compareBar());
}

function compareCell(match,session){
  const row=recommendationRow(match,session);
  const positionCount=Number(match.positionSlots?.[session.position]||0);
  return `<article class="fm-decision-compare-card" data-compare-match-id="${match.id}">
    <small>${escapeHtml(match.dateLabel)}</small><h3>${escapeHtml(match.place)}</h3>
    <dl><div><dt>추천</dt><dd>${escapeHtml(row?.fit||match.fit)}</dd></div><div><dt>거리</dt><dd>${escapeHtml(match.distance)}</dd></div><div><dt>레벨</dt><dd>${escapeHtml(match.level)}</dd></div><div><dt>${escapeHtml(session.position)} 자리</dt><dd>${positionCount}자리</dd></div><div><dt>샘플 잔여</dt><dd>${openSeats(match)}자리</dd></div><div><dt>참가비</dt><dd>${money(match.price)}</dd></div></dl>
    <button type="button" data-decision-action="choose-compare-match" data-match-id="${match.id}">이 경기 보기</button>
  </article>`;
}

function openCompare(trigger){
  const matches=state.compareMatchIds.map(matchById).filter(Boolean);
  if(matches.length<2)return;
  closeCompare(false);
  lastCompareTrigger=trigger||null;
  const session=readSession();
  const overlay=document.createElement('div');
  overlay.className='fm-decision-dialog-backdrop';
  overlay.dataset.decisionDialog='compare';
  overlay.innerHTML=`<section class="fm-decision-dialog" role="dialog" aria-modal="true" aria-labelledby="fm-decision-compare-title">
    <div class="fm-decision-dialog-head"><div><small>DECISION DETAIL</small><h2 id="fm-decision-compare-title">두 경기 비교</h2><p>추천 이유를 유지하면서 결정에 필요한 조건만 나란히 봅니다.</p></div><button type="button" data-decision-action="close-compare" aria-label="경기 비교 닫기">${icon('close')}</button></div>
    <div class="fm-decision-compare-grid">${matches.map(match=>compareCell(match,session)).join('')}</div>
    <p class="fm-decision-disclosure">정원·참가자·시설 정보는 프로토타입 샘플 데이터입니다.</p>
  </section>`;
  root.append(overlay);
  document.body.classList.add('fm-decision-dialog-open');
  requestAnimationFrame(()=>overlay.querySelector('[data-decision-action="close-compare"]')?.focus());
}

function closeCompare(restore=true){
  root?.querySelector('[data-decision-dialog="compare"]')?.remove();
  document.body.classList.remove('fm-decision-dialog-open');
  if(restore&&lastCompareTrigger?.isConnected)lastCompareTrigger.focus();
}

function announce(message){
  let status=root.querySelector('[data-decision-status]');
  if(!status){
    status=document.createElement('div');
    status.className='fm-decision-status';
    status.dataset.decisionStatus='true';
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    root.append(status);
  }
  status.textContent=message;
}

function toggleSave(id){
  if(isSaved(id))state.savedMatchIds=state.savedMatchIds.filter(value=>value!==id);
  else state.savedMatchIds=[...state.savedMatchIds,id];
  persist();
  announce(isSaved(id)?'경기를 저장했습니다.':'저장을 해제했습니다.');
  patchDetail();
}

function toggleCompare(id){
  if(isCompared(id)){
    state.compareMatchIds=state.compareMatchIds.filter(value=>value!==id);
    persist();
    announce('비교 선택에서 제외했습니다.');
    patchDetail();
    return;
  }
  if(state.compareMatchIds.length>=MAX_COMPARE){
    announce('비교는 최대 두 경기까지 선택할 수 있어요.');
    return;
  }
  state.compareMatchIds=[...state.compareMatchIds,id];
  persist();
  announce(state.compareMatchIds.length===2?'두 경기를 비교할 준비가 됐어요.':'비교할 경기를 한 개 더 선택하세요.');
  patchDetail();
}

function chooseCompareMatch(id){
  const match=matchById(id);
  if(!match)return;
  if(mode==='real'){
    const session=readSession();
    footmatePlatform.session.write({...session,selectedMatchId:id,route:'detail'});
  }
  closeCompare(false);
  const card=root.querySelector(`[data-action="open-match"][data-match-id="${CSS.escape(id)}"]`);
  if(card){card.click();return;}
  location.reload();
}

root?.addEventListener('click',event=>{
  const target=event.target.closest('[data-decision-action]');
  if(!target)return;
  const action=target.dataset.decisionAction;
  if(action==='toggle-save'){toggleSave(target.dataset.matchId);return;}
  if(action==='toggle-compare'){toggleCompare(target.dataset.matchId);return;}
  if(action==='clear-compare'){
    state.compareMatchIds=[];persist();announce('비교 선택을 비웠습니다.');patchDetail();return;
  }
  if(action==='open-compare'){openCompare(target);return;}
  if(action==='close-compare'){closeCompare();return;}
  if(action==='choose-compare-match'){chooseCompareMatch(target.dataset.matchId);}
});

root?.addEventListener('keydown',event=>{
  const dialog=root.querySelector('[data-decision-dialog="compare"]');
  if(!dialog)return;
  if(event.key==='Escape'){event.preventDefault();closeCompare();return;}
  if(event.key!=='Tab')return;
  const focusable=[...dialog.querySelectorAll('button,[href],select,input,[tabindex]:not([tabindex="-1"])')].filter(node=>!node.disabled);
  if(!focusable.length)return;
  const first=focusable[0];const last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});

let scheduled=false;
const observer=new MutationObserver(()=>{
  if(applying||scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;applying=true;patchDetail();applying=false;});
});
if(root){observer.observe(root,{childList:true,subtree:true});patchDetail();}

window.__FOOTMATE_DECISION__={
  version:DECISION_VERSION,
  storageKey:DECISION_STORAGE_KEY,
  read:()=>({...state,savedMatchIds:[...state.savedMatchIds],compareMatchIds:[...state.compareMatchIds]}),
  openSeats:id=>{const match=matchById(id);return match?openSeats(match):null;}
};
