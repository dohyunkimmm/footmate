import {MATCHES} from '../../app/data.js';
import {footmatePlatform} from '../application/platform.js';

const root=document.getElementById('footmate-next');
const FLOW_VERSION='1.3.2';
const FIRST_HOME_KEY='footmate:real-app:first-home-pending';
let scheduled=false;
let authBusy=false;
let nextAuthOutcome='success';

const isRealApp=()=>document.documentElement.dataset.footmateSurface==='real';
const readSession=()=>footmatePlatform.session.read()||{};
const patchSession=patch=>footmatePlatform.session.patch(patch);
const cleanDate=value=>String(value||'').replace(/^샘플 일정\s*·\s*/,'');
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function userCopy(node,value){
  if(!node)return;
  node.dataset.flowCopy=value;
  node.setAttribute('aria-label',value);
  if(node.textContent!==value)node.textContent=value;
}

function ensureStyles(){
  if(document.getElementById('fm-real-app-flow-naturalness'))return;
  const style=document.createElement('style');
  style.id='fm-real-app-flow-naturalness';
  style.textContent=`
.fm-next-page[data-mode="real"] .fm-flow-first-home>small{display:block}
.fm-next-page[data-mode="real"] .fm-next-greeting[data-flow-first-home="true"]>small,
.fm-next-page[data-mode="real"] .fm-next-greeting[data-flow-first-home="true"]>h1{display:none}
.fm-next-page[data-mode="real"] .fm-flow-auth-status{margin:10px 2px 0;color:#53675e;font-size:12px;font-weight:700;line-height:1.5;text-align:center}
.fm-next-page[data-mode="real"] .fm-flow-auth-status[data-tone="error"]{color:#9b3f32}
.fm-next-page[data-mode="real"] .fm-flow-saved{margin:16px 0;padding:18px;border:1px solid rgba(20,55,40,.09);border-radius:20px;background:#fff}
.fm-next-page[data-mode="real"] .fm-flow-saved-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:12px}
.fm-next-page[data-mode="real"] .fm-flow-saved-head h2{margin:0;font-size:17px}.fm-next-page[data-mode="real"] .fm-flow-saved-head span{color:#607168;font-size:11px}
.fm-next-page[data-mode="real"] .fm-flow-saved-list{display:grid;gap:8px}
.fm-next-page[data-mode="real"] .fm-flow-saved-card{display:grid;width:100%;gap:5px;padding:13px 14px;border:1px solid rgba(20,55,40,.09);border-radius:15px;background:#f7f9f6;text-align:left;color:#173c2c}
.fm-next-page[data-mode="real"] .fm-flow-saved-card small{color:#66776e;font-size:10px}.fm-next-page[data-mode="real"] .fm-flow-saved-card b{font-size:14px}.fm-next-page[data-mode="real"] .fm-flow-saved-card span{color:#52665b;font-size:11px}
.fm-next-page[data-mode="real"] .fm-flow-stage-guide{margin-top:12px;border:1px solid rgba(27,71,49,.12);border-radius:13px;background:#f7f9f6;padding:10px 12px}
.fm-next-page[data-mode="real"] .fm-flow-stage-guide summary{cursor:pointer;font-size:13px;font-weight:700;color:#375746;min-height:26px}
.fm-next-page[data-mode="real"] .fm-flow-stage-guide .fm-next-status-list{margin-top:12px}
.fm-flow-info-backdrop{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:20px;background:rgba(18,32,25,.35)}
.fm-flow-info-dialog{width:min(100%,420px);padding:22px;border-radius:22px;background:#fff;box-shadow:0 24px 70px rgba(12,35,25,.22);color:#173c2c}
.fm-flow-info-dialog h2{margin:0 0 8px;font-size:20px}.fm-flow-info-dialog p{margin:8px 0;color:#586a61;font-size:13px;line-height:1.65}
.fm-flow-info-actions{display:flex;gap:8px;margin-top:18px}.fm-flow-info-actions button{min-height:44px;flex:1;border:1px solid rgba(20,55,40,.12);border-radius:13px;background:#fff;color:#315044;font-weight:800}.fm-flow-info-actions button[data-flow-action="confirm-reset"]{background:#1f5139;color:#fff}
`;
  document.head.append(style);
}

function isFirstHomePending(){
  try{return sessionStorage.getItem(FIRST_HOME_KEY)==='1'}catch{return false}
}
function setFirstHomePending(value){
  try{if(value)sessionStorage.setItem(FIRST_HOME_KEY,'1');else sessionStorage.removeItem(FIRST_HOME_KEY)}catch{}
}
function patchFirstHome(screen){
  const greeting=screen.querySelector('.fm-next-greeting');
  if(!greeting)return;
  if(!isFirstHomePending()){greeting.removeAttribute('data-flow-first-home');greeting.querySelector('[data-flow-first-home-copy]')?.remove();return;}
  greeting.dataset.flowFirstHome='true';
  if(greeting.querySelector('[data-flow-first-home-copy]'))return;
  const copy=document.createElement('div');
  copy.className='fm-flow-first-home';
  copy.dataset.flowFirstHomeCopy='true';
  copy.innerHTML='<small>설정이 완료됐어요</small><h1>조건에 맞는 경기를 <span>찾았어요.</span></h1>';
  greeting.prepend(copy);
}

function patchDetail(screen){
  const capacity=screen.querySelector('[data-decision-section="capacity"]');
  if(capacity){
    userCopy(capacity.querySelector('.fm-next-section-head p'),'현재 경기의 남은 자리와 포지션을 확인하세요.');
    userCopy(capacity.querySelector('.fm-decision-capacity small'),'남은 자리');
    capacity.querySelector('.fm-decision-meter')?.setAttribute('aria-label','현재 참가 인원');
    capacity.querySelector('.fm-decision-position-grid')?.setAttribute('aria-label','참가자 포지션 구성');
    userCopy(capacity.querySelector('.fm-decision-disclosure'),'잔여 인원과 포지션은 현재 표시된 경기 정보 기준이에요.');
  }
  userCopy(screen.querySelector('[data-decision-section="fit"] .fm-next-section-head p'),'내 조건과 맞는 이유를 참가 전에 한 번 더 확인하세요.');
  userCopy(screen.querySelector('[data-decision-section="venue"] .fm-decision-disclosure'),'시설과 준비물은 참가 전에 운영 안내와 함께 확인해주세요.');
  const refund=screen.querySelector('[data-decision-section="refund"]');
  if(refund){userCopy(refund.querySelector('.fm-next-section-head p'),'샘플 취소·환불 정책을 확인하세요.');userCopy(refund.querySelector('.fm-decision-disclosure'),'무료 참가 체험이므로 실제 취소·환불은 발생하지 않아요. 위 기준은 운영 정책 예시입니다.');}
}

function ensureAuthStatus(screen){
  let status=screen.querySelector('[data-flow-auth-status]');
  if(status)return status;
  status=document.createElement('p');
  status.className='fm-flow-auth-status';status.dataset.flowAuthStatus='true';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  screen.querySelector('[data-auth-form="login"]')?.after(status);
  return status;
}
function beginAccountAuth(button){
  const screen=button.closest('[data-screen="auth"]');if(!screen||authBusy)return;
  authBusy=true;const status=ensureAuthStatus(screen);status.dataset.tone='loading';status.textContent='로그인을 확인하고 있어요…';button.disabled=true;button.setAttribute('aria-busy','true');
  setTimeout(()=>{
    if(nextAuthOutcome==='failure'){nextAuthOutcome='success';authBusy=false;button.disabled=false;button.removeAttribute('aria-busy');status.dataset.tone='error';status.textContent='로그인을 완료하지 못했어요. 다시 시도해주세요.';return;}
    patchSession({authProvider:'account',authExperience:'simulated'});authBusy=false;button.disabled=false;button.removeAttribute('aria-busy');button.dataset.flowAuthBypass='true';button.click();queueMicrotask(()=>delete button.dataset.flowAuthBypass);
  },420);
}
function wireAuth(screen){
  const button=screen.querySelector('[data-action="sign-in"][data-provider="account"]');if(!button||button.dataset.flowAuthWired==='true')return;
  button.dataset.flowAuthWired='true';button.addEventListener('click',event=>{if(button.dataset.flowAuthBypass==='true'||event.defaultPrevented)return;event.preventDefault();event.stopPropagation();beginAccountAuth(button);});
}

function patchCheckout(screen){userCopy(screen.querySelector('[data-p1-checkout-boundary]'),'무료 참가 체험 · 실제 청구 0원');}
function patchMatchday(scope){
  scope.querySelectorAll('.fm-matchday-kicker').forEach(node=>userCopy(node,'오늘 경기'));
  scope.querySelectorAll('.fm-matchday-boundary').forEach(node=>{if(/backend|프로토타입|simulation|외부 서비스/i.test(node.textContent))userCopy(node,'실시간 위치·지도·팀 채팅·알림 외부 서비스는 연결하지 않았습니다.');});
  scope.querySelectorAll('.fm-matchday-op p').forEach(node=>{if(/backend|샘플 안내/i.test(node.textContent))userCopy(node,/메시지|공지/.test(node.textContent)?'운영 공지는 이 화면에서 확인할 수 있어요.':'경기 당일 필요한 정보를 이 화면에서 확인할 수 있어요.');});
}
function patchReturn(scope){
  scope.querySelectorAll('.fm-return-kicker').forEach(node=>userCopy(node,'경기 후 피드백'));
  scope.querySelectorAll('.fm-return-boundary').forEach(node=>userCopy(node,'남긴 평가는 내 다음 경기 추천을 조정하는 데만 사용돼요.'));
  scope.querySelectorAll('.fm-return-history small').forEach(node=>userCopy(node,'경기 기록'));
  scope.querySelectorAll('.fm-return-status span').forEach(node=>{if(/보조 신호/.test(node.textContent))userCopy(node,'체감 난이도와 다시 뛰고 싶은 조건을 남기면 다음 추천에 반영해요.');});
  scope.querySelectorAll('.fm-return-summary article small').forEach(node=>{if(/보조 신호/.test(node.textContent))userCopy(node,'다음에 추천할 경기');});
}

function savedMatchesMarkup(ids){
  const matches=ids.map(id=>MATCHES.find(match=>match.id===id)).filter(Boolean);
  return `<section class="fm-flow-saved" data-flow-saved data-flow-saved-signature="${escapeHtml(ids.join(','))}"><div class="fm-flow-saved-head"><h2>저장한 경기</h2><span>${matches.length}개</span></div><div class="fm-flow-saved-list">${matches.map(match=>`<button type="button" class="fm-flow-saved-card" data-flow-action="open-saved-match" data-match-id="${escapeHtml(match.id)}"><small>${escapeHtml(cleanDate(match.dateLabel))}</small><b>${escapeHtml(match.place)}</b><span>${escapeHtml(match.level)} · ${escapeHtml(match.distance)} · ${escapeHtml(match.spot)}</span></button>`).join('')}</div></section>`;
}
function patchProfile(screen){
  const current=readSession();
  const accountCopy=screen.querySelector('.fm-next-profile-head p');
  if(current.authExperience==='simulated')userCopy(accountCopy,'체험 계정 · 이 브라우저에만 저장');
  const statusList=screen.querySelector('[data-my-matches] .fm-next-status-list');
  if(current.joinedMatchId&&statusList&&!statusList.closest('[data-flow-stage-guide]')){
    const details=document.createElement('details');details.className='fm-flow-stage-guide';details.dataset.flowStageGuide='true';
    const summary=document.createElement('summary');summary.textContent='경기 진행 단계 더 보기';
    statusList.before(details);details.append(summary,statusList);
  }
  const ids=window.__FOOTMATE_DECISION__?.read?.().savedMatchIds||[];const signature=ids.join(',');const existing=screen.querySelector('[data-flow-saved]');
  if(!ids.length)existing?.remove();else if(existing?.dataset.flowSavedSignature!==signature){const wrapper=document.createElement('div');wrapper.innerHTML=savedMatchesMarkup(ids);const next=wrapper.firstElementChild;if(existing)existing.replaceWith(next);else screen.querySelector('.fm-next-profile-card')?.before(next);}
  const policy=screen.querySelector('[data-action="show-policy"]');
  if(policy)userCopy(policy.querySelector('span:last-child')||policy.querySelector('span'),'샘플 취소·환불 안내');
  const reset=screen.querySelector('[data-action="reset-flow"]');if(reset){reset.setAttribute('aria-label','체험 버전 안내');const label=reset.querySelector('span:last-child')||reset.querySelector('span');if(label)userCopy(label,'체험 버전 안내');}
}
function patchCompareDialog(){
  const dialog=root?.querySelector('[data-decision-dialog="compare"]');if(!dialog)return;
  userCopy(dialog.querySelector('.fm-decision-dialog-head small'),'경기 비교');
  dialog.querySelectorAll('dt').forEach(node=>{if(node.textContent.trim()==='샘플 잔여')userCopy(node,'남은 자리');});
  userCopy(dialog.querySelector('.fm-decision-disclosure'),'두 경기의 현재 표시 정보를 같은 기준으로 비교했어요.');
}

function openExperienceDialog(){
  document.querySelector('[data-flow-dialog="experience"]')?.remove();
  const overlay=document.createElement('div');overlay.className='fm-flow-info-backdrop';overlay.dataset.flowDialog='experience';
  overlay.innerHTML='<section class="fm-flow-info-dialog" role="dialog" aria-modal="true" aria-labelledby="fm-flow-info-title"><h2 id="fm-flow-info-title">체험 버전 안내</h2><p>경기·참가비·잔여 자리·시설은 샘플 정보예요. 참가 흐름은 무료 체험이며 실제 결제는 발생하지 않습니다.</p><p>소셜 로그인은 외부 인증 화면으로 이동할 수 있어요. 이 체험의 선택 조건과 진행 상태는 이 브라우저에만 저장돼요.</p><div class="fm-flow-info-actions"><button type="button" data-flow-action="close-info">닫기</button><button type="button" data-flow-action="confirm-reset">체험 데이터 초기화</button></div></section>';
  document.body.append(overlay);requestAnimationFrame(()=>overlay.querySelector('[data-flow-action="close-info"]')?.focus());
}

function apply(){
  scheduled=false;if(!root||!isRealApp())return;ensureStyles();const screen=root.querySelector('[data-screen]');if(!screen)return;
  if(screen.dataset.screen==='home')patchFirstHome(screen);if(screen.dataset.screen==='detail')patchDetail(screen);if(screen.dataset.screen==='auth')wireAuth(screen);if(screen.dataset.screen==='checkout')patchCheckout(screen);if(screen.dataset.screen==='profile')patchProfile(screen);patchMatchday(screen);patchReturn(screen);patchCompareDialog();root.dataset.flowNaturalnessVersion=FLOW_VERSION;
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}
function install(){if(!root)return;new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true});schedule();}

document.addEventListener('click',event=>{
  if(!isRealApp())return;const target=event.target.closest('[data-action]');
  if(target?.dataset.action==='setup-next'&&root?.querySelector('[data-screen="setup"]')&&/추천 경기 보기/.test(target.textContent||'')&&!readSession().setupOrigin){
    setFirstHomePending(true);
  }
  if(root?.querySelector('[data-screen="home"]')&&isFirstHomePending()&&['open-match','nav-discover','nav-profile'].includes(target?.dataset.action))setFirstHomePending(false);
  if(target?.dataset.action==='reset-flow'&&target.dataset.flowResetBypass!=='true'){event.preventDefault();event.stopPropagation();openExperienceDialog();return;}
  const action=event.target.closest('[data-flow-action]');
  if(action?.dataset.flowAction==='close-info'){action.closest('[data-flow-dialog]')?.remove();return;}
  if(action?.dataset.flowAction==='confirm-reset'){const original=root?.querySelector('[data-action="reset-flow"]');action.closest('[data-flow-dialog]')?.remove();if(original){original.dataset.flowResetBypass='true';original.click();queueMicrotask(()=>delete original.dataset.flowResetBypass);}return;}
  const saved=event.target.closest('[data-flow-action="open-saved-match"]');if(saved){event.preventDefault();event.stopPropagation();const proxy=document.createElement('button');proxy.type='button';proxy.hidden=true;proxy.dataset.action='open-match';proxy.dataset.matchId=saved.dataset.matchId;root.append(proxy);proxy.click();proxy.remove();}
},true);

setTimeout(install,0);
window.__FOOTMATE_REAL_APP_FLOW__=Object.freeze({version:FLOW_VERSION,setNextAuthOutcome:value=>{nextAuthOutcome=value==='failure'?'failure':'success';return nextAuthOutcome;},read:()=>({authBusy,firstHomePending:isFirstHomePending()})});
