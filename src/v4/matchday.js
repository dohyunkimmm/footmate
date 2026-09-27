import {footmatePlatform} from './platform/application/platform.js';
import {readCheckin,completeCheckin,checkinCopy} from './platform/application/checkin.js';

const MATCHDAY_VERSION='4.5.0';
const MATCHDAY_STORAGE_KEY=footmatePlatform.storageKeys.matchday;
const matchdayRepository=footmatePlatform.repositories.matchday;
const allowed=new Set(['upcoming','matchday','checked-in','late','updated','canceled']);
const root=document.getElementById('footmate-next');
const product=!['guided','evidence'].includes(new URLSearchParams(location.search).get('mode'));
function session(){return footmatePlatform.session.read()||{}}
function currentMatchId(){return session().joinedMatchId||null}
function initial(){const stored=matchdayRepository.read({})||{},matchId=currentMatchId();if(stored.matchId===matchId&&allowed.has(stored.status))return stored;return {version:MATCHDAY_VERSION,matchId,status:'upcoming',arrival:'unknown',noticeSeen:false,updatedAt:new Date().toISOString()}}
let state=initial();
function persist(patch={}){const saved=matchdayRepository.read({})||{};state={...state,...(product&&saved.matchId===currentMatchId()?saved:{}),...patch,version:MATCHDAY_VERSION,matchId:currentMatchId(),updatedAt:new Date().toISOString()};matchdayRepository.write(state);enhance();return state}
function syncSession(patch={}){const next={...session(),...patch};footmatePlatform.session.write(next);return next}
function navigate(route){syncSession({route});location.reload()}
function statusCopy(status){return {upcoming:['경기 준비','경기 시작 20분 전부터 체크인할 수 있어요.'],matchday:['도착 준비','경기장 도착 상태를 확인하고 체크인을 완료해주세요.'],'checked-in':['체크인 완료','도착 확인이 끝났습니다. 팀 공지와 경기장 안내를 확인하세요.'],late:['늦을 것 같아요','도착 지연 상태를 저장했습니다. 운영자에게 전달되는 UX 계약을 시뮬레이션합니다.'],updated:['운영 변경 확인','변경 공지를 확인했습니다. 최신 안내를 기준으로 이동해주세요.'],canceled:['경기 취소','운영 취소 상태입니다. 참가비 반환과 대체 경기 탐색 흐름을 확인할 수 있습니다.']}[status]||['경기 준비','경기 정보를 확인하세요.']}
function panel(){const [title,copy]=statusCopy(state.status);const primary=state.status==='upcoming'?'<button type="button" data-matchday-action="arrive">도착 상태 알리기</button>':state.status==='matchday'||state.status==='late'?'<button type="button" data-matchday-action="checkin">체크인 완료</button>':state.status==='canceled'?'<button type="button" data-matchday-action="find">다른 경기 찾기</button>':'<button type="button" data-matchday-action="notice">공지 다시 보기</button>';return `<section class="fm-matchday-panel" data-matchday-version="${MATCHDAY_VERSION}" data-matchday-state="${state.status}" aria-label="경기 당일 운영"><div class="fm-matchday-kicker">MATCHDAY · ${MATCHDAY_VERSION}</div><div class="fm-matchday-status" role="status"><b>${title}</b><span>${copy}</span></div><div class="fm-matchday-grid"><article><small>체크인</small><b>킥오프 20분 전부터</b><span>이 프로토타입은 시간창과 도착 상태 계약만 검증합니다.</span></article><article><small>경기장 안내</small><b>메인 출입구 → 3층 코트</b><span>주소·동선은 샘플 안내이며 실시간 지도 연동이 아닙니다.</span></article><article><small>팀 공지</small><b>조끼는 현장 제공</b><span>메시지 전송 backend 없이 공지 확인 UX만 시뮬레이션합니다.</span></article></div><div class="fm-matchday-actions">${primary}${state.status!=='canceled'&&state.status!=='checked-in'?'<button type="button" data-matchday-action="late">늦을 것 같아요</button>':''}${state.status==='late'?'<button type="button" data-matchday-action="recover">도착 상태 수정</button>':''}${state.status!=='canceled'?'<button type="button" data-matchday-action="update">경기 변경 공지 보기</button>':''}</div><p class="fm-matchday-boundary">실시간 위치·지도·팀 채팅·알림 backend는 연결하지 않았습니다. 상태와 복구 흐름을 검증하는 deterministic simulation입니다.</p></section>`}
function homeStrip(){const [title,copy]=statusCopy(state.status);return `<div class="fm-matchday-home" data-matchday-home data-matchday-state="${state.status}"><small>MATCHDAY OPERATIONS</small><b>${title}</b><span>${copy}</span><button type="button" data-matchday-action="profile">MY에서 내 경기 보기</button></div>`}
function enhanceMatchHub(container){if(!container||!currentMatchId())return;container.setAttribute('data-matchday-module-version',MATCHDAY_VERSION);const existing=container.querySelector('[data-matchday-version]');if(!existing)container.insertAdjacentHTML('beforeend',panel());else if(existing.dataset.matchdayState!==state.status)existing.outerHTML=panel()}
function enhance(){if(product){enhanceProduct();return;}state=initial();enhanceMatchHub(root?.querySelector('[data-screen="profile"] [data-my-matches]'));enhanceMatchHub(root?.querySelector('[data-screen="schedule"] [data-my-matches]'));const home=root?.querySelector('[data-screen="home"]');if(home&&currentMatchId()){const existing=home.querySelector('[data-matchday-home]');if(!existing){const context=home.querySelector('.fm-next-context-card');if(context)context.insertAdjacentHTML('afterend',homeStrip())}else if(existing.dataset.matchdayState!==state.status)existing.outerHTML=homeStrip()}}
document.addEventListener('click',event=>{const target=event.target.closest('[data-matchday-action]');if(!target)return;event.preventDefault();const action=target.dataset.matchdayAction;if(action==='arrive'){persist({status:'matchday',arrival:'on-the-way'});return}if(action==='checkin'&&product){completeCheckin();return}if(action==='checkin'){persist({status:'checked-in',arrival:'arrived'});const id=currentMatchId();syncSession({checkedInMatchId:id,matchStage:'matchday'});enhance();return}if(action==='late'){persist({status:'late',arrival:'late'});return}if(action==='recover'){persist({status:'matchday',arrival:'on-the-way'});return}if(action==='update'){persist({status:'updated',noticeSeen:true});return}if(action==='notice'){persist({noticeSeen:true});return}if(action==='find'){navigate('discover');return}if(action==='profile'){navigate('profile');return}},true);
const observer=new MutationObserver(enhance);if(root)observer.observe(root,{childList:true,subtree:true});window.__FOOTMATE_MATCHDAY__={version:MATCHDAY_VERSION,storageKey:MATCHDAY_STORAGE_KEY,read:()=>initial(),setStatus:(status,patch={})=>allowed.has(status)?persist({status,...patch}):initial(),reset:()=>{matchdayRepository.clear();state=initial();enhance();return state}};enhance();

function productPanel(value,compact=false){
  const [title,copy]=checkinCopy(value);
  const label={waiting:'체크인 시작 전',available:'체크인하기',processing:'체크인 중',failed:'다시 시도',completed:'체크인 완료'}[value.status];
  const enabled=['available','failed'].includes(value.status);
  const control=label?'<button type="button" data-matchday-action="checkin" '+(enabled?'':'disabled')+'>'+label+'</button>':'';
  if(compact)return '<section class="fm-matchday-panel" data-product-checkin data-checkin-state="'+value.status+'" aria-label="경기 체크인"><div class="fm-matchday-status" role="status" aria-live="polite"><b>'+title+'</b><span>'+copy+'</span></div><div class="fm-matchday-actions">'+control+'</div><p class="fm-matchday-boundary">샘플 경기 체험 · 이 브라우저에만 저장되며 실제 출석으로 처리되지 않습니다.</p></section>';
  const wrapper=document.createElement('div');
  wrapper.innerHTML=panel();
  const element=wrapper.firstElementChild;
  element.setAttribute('data-product-checkin','');
  element.dataset.checkinState=value.status;
  element.dataset.matchdayState=value.status==='completed'?'checked-in':value.status==='waiting'?'upcoming':value.status;
  const status=element.querySelector('.fm-matchday-status');
  status.setAttribute('aria-live','polite');
  status.querySelector('b').textContent=title;
  status.querySelector('span').textContent=copy;
  const terminal=['completed','canceled','ended'].includes(value.status);
  const operations=terminal?(value.status==='canceled'?'<button type="button" data-matchday-action="find">다른 경기 찾기</button>':'<button type="button" data-matchday-action="notice">공지 다시 보기</button>'):'<button type="button" data-matchday-action="arrive">도착 상태 알리기</button><button type="button" data-matchday-action="late">늦을 것 같아요</button>'+(state.status==='late'?'<button type="button" data-matchday-action="recover">도착 상태 수정</button>':'')+'<button type="button" data-matchday-action="update">경기 변경 공지 보기</button>';
  element.querySelector('.fm-matchday-actions').innerHTML=control+operations;
  element.querySelector('.fm-matchday-grid article span').textContent=state.arrival==='arrived'?'도착 확인 완료':state.arrival==='late'?'도착 지연을 기록했어요.':state.arrival==='on-the-way'?'이동 중으로 기록했어요.':'경기 시작 20분 전부터 종료 전까지 이용할 수 있어요.';
  element.querySelector('.fm-matchday-boundary').textContent='샘플 경기 체크인 체험입니다. 이 브라우저에만 저장되며 실제 출석으로 처리되지 않습니다. 실시간 위치·지도·팀 채팅·알림 backend는 연결하지 않았습니다.';
  return element.outerHTML;
}

function enhanceProduct(){
  const value=readCheckin();
  state=initial();
  const screen=root?.querySelector('[data-screen]');
  if(!screen)return;
  const route=screen.dataset.screen;
  const applicable=value.matchId&&(route!=='detail'||session().selectedMatchId===value.matchId);
  const container=['profile','schedule'].includes(route)?screen.querySelector('[data-my-matches]'):route==='home'?screen:route==='detail'?screen:null;
  if(!applicable||!container){screen.querySelectorAll('[data-product-checkin]').forEach(node=>node.remove());if(!value.matchId)screen.querySelectorAll('[data-action="check-in"]').forEach(node=>node.remove());return;}
  // Old Home/MY actions must not provide a second, independently stored check-in.
  screen.querySelectorAll('[data-action="check-in"]').forEach(button=>{button.dataset.action='open-joined-match';button.textContent='경기 상세'});
  const html=productPanel(value,['home','detail'].includes(route));
  const existing=container.querySelector('[data-product-checkin]');
  const signature=JSON.stringify([value.status,value.matchId,value.opensAt,value.checkedInAt,state.status,state.arrival,state.noticeSeen]);
  if(existing?.dataset.checkinSignature!==signature){
    const wrapper=document.createElement('div');wrapper.innerHTML=html;
    const next=wrapper.firstElementChild;next.dataset.checkinSignature=signature;
    if(existing)existing.replaceWith(next);
    else if(route==='home')screen.querySelector('.fm-next-context-card')?.after(next);
    else if(route==='detail')screen.querySelector('.fm-next-detail-hero')?.after(next);
    else container.appendChild(next);
  }
  const status=screen.querySelector('.fm-next-status-card.is-current');
  if(status&&['canceled','ended'].includes(value.status)){
    const [title,copy]=checkinCopy(value);
    if(status.querySelector('b')?.textContent!==title)status.querySelector('b').textContent=title;
    if(status.querySelector('p')?.textContent!==copy)status.querySelector('p').textContent=copy;
  }
  const dateLabel='샘플 일정 · '+new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(new Date(value.startsAt))+' · '+new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value.startsAt));
  const dateNode=screen.querySelector(route==='detail'?'.fm-next-detail-time':'.fm-next-upcoming-count');
  if(dateNode&&dateNode.textContent!==dateLabel)dateNode.textContent=dateLabel;
  if(['canceled','ended'].includes(value.status)){
    const [title,copy]=checkinCopy(value);
    const badge=screen.querySelector('.fm-next-upcoming-top > span:first-child');
    const contextCopy=screen.querySelector('.fm-next-context-card > p');
    if(badge&&badge.textContent!==title)badge.textContent=title;
    if(contextCopy&&contextCopy.textContent!==copy)contextCopy.textContent=copy;
  }
}

if(product){
  window.addEventListener('footmate:checkin',enhanceProduct);
  window.addEventListener('storage',enhanceProduct);
  window.addEventListener('focus',enhanceProduct);
  document.addEventListener('visibilitychange',enhanceProduct);
  setInterval(enhanceProduct,1000);
}
