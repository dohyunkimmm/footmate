import {MATCHES} from '../../data.js';
import {footmatePlatform} from '../application/platform.js';

const root=document.getElementById('footmate-next');
const FLOW_VERSION='1.0.0';
let scheduled=false;

const isRealApp=()=>document.documentElement.dataset.footmateSurface==='real';
const cleanDate=value=>String(value||'').replace(/^샘플 일정\s*·\s*/,'');
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function setText(node,value){if(node&&node.textContent!==value)node.textContent=value}

function ensureStyles(){
  if(document.getElementById('fm-real-app-flow-naturalness'))return;
  const style=document.createElement('style');
  style.id='fm-real-app-flow-naturalness';
  style.textContent=`
.fm-next-page[data-mode="real"] .fm-flow-saved{margin:16px 0;padding:18px;border:1px solid rgba(20,55,40,.09);border-radius:20px;background:#fff}
.fm-next-page[data-mode="real"] .fm-flow-saved-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:12px}
.fm-next-page[data-mode="real"] .fm-flow-saved-head h2{margin:0;font-size:17px}.fm-next-page[data-mode="real"] .fm-flow-saved-head span{color:#607168;font-size:11px}
.fm-next-page[data-mode="real"] .fm-flow-saved-list{display:grid;gap:8px}
.fm-next-page[data-mode="real"] .fm-flow-saved-card{display:grid;width:100%;gap:5px;padding:13px 14px;border:1px solid rgba(20,55,40,.09);border-radius:15px;background:#f7f9f6;text-align:left;color:#173c2c}
.fm-next-page[data-mode="real"] .fm-flow-saved-card small{color:#66776e;font-size:10px}.fm-next-page[data-mode="real"] .fm-flow-saved-card b{font-size:14px}.fm-next-page[data-mode="real"] .fm-flow-saved-card span{color:#52665b;font-size:11px}
.fm-next-page[data-mode="real"] .fm-flow-experience{margin:16px 0 4px;padding:0 18px 18px}
.fm-next-page[data-mode="real"] .fm-flow-experience details{border-top:1px solid rgba(20,55,40,.09);padding-top:16px;color:#596b62;font-size:11px;line-height:1.6}
.fm-next-page[data-mode="real"] .fm-flow-experience summary{cursor:pointer;color:#294c3b;font-size:12px;font-weight:800;list-style-position:inside}
.fm-next-page[data-mode="real"] .fm-flow-experience p{margin:10px 0 0}.fm-next-page[data-mode="real"] .fm-flow-experience button{margin-top:12px;min-height:44px;padding:0 14px;border:1px solid rgba(20,55,40,.12);border-radius:12px;background:#fff;color:#365648;font-weight:700}
.fm-next-page[data-mode="real"] [data-flow-hidden="true"]{display:none!important}
`;
  document.head.append(style);
}

function stripSampleScheduleLabels(scope=root){
  if(!scope)return;
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(node.nodeValue?.includes('샘플 일정 ·'))node.nodeValue=node.nodeValue.replace(/샘플 일정\s*·\s*/g,'');
  }
}

function patchDiscover(screen){
  const empty=screen.querySelector('.fm-discovery-empty');
  if(!empty)return;
  setText(empty.querySelector('h2'),'지금 조건에는 맞는 경기가 없어요.');
  setText(empty.querySelector('p'),'조건을 조금 넓히면 가까운 후보부터 다시 보여드릴게요.');
  setText(empty.querySelector('[data-discovery-action="relax-filters"]'),'가까운 조건으로 다시 보기');
}

function patchDetail(screen){
  const capacity=screen.querySelector('[data-decision-section="capacity"]');
  if(capacity){
    setText(capacity.querySelector('.fm-next-section-head p'),'현재 경기의 남은 자리와 포지션을 확인하세요.');
    setText(capacity.querySelector('.fm-decision-capacity small'),'남은 자리');
    setText(capacity.querySelector('.fm-decision-disclosure'),'잔여 인원과 포지션은 현재 표시된 경기 정보 기준이에요.');
  }
  setText(screen.querySelector('[data-decision-section="venue"] .fm-decision-disclosure'),'시설과 준비물은 참가 전에 운영 안내와 함께 확인해주세요.');
  const refund=screen.querySelector('[data-decision-section="refund"]');
  if(refund){
    setText(refund.querySelector('.fm-next-section-head p'),'취소 시점별 환불 기준을 확인하세요.');
    setText(refund.querySelector('.fm-decision-disclosure'),'경기 시작이 가까워질수록 환불 금액이 달라질 수 있어요.');
  }
}

function patchCheckout(screen){
  setText(screen.querySelector('.fm-participation-disclosure'),'체험 결제에서는 실제 금액이 청구되지 않아요.');
  setText(screen.querySelector('[data-p1-checkout-boundary]'),'체험 결제 · 실제 청구 없음');
  const failure=screen.querySelector('[data-participation-panel="failure"]');
  if(failure)setText(failure.querySelector('p'),'참가는 아직 확정되지 않았어요. 같은 경기 정보로 다시 시도할 수 있어요.');
}

function patchSuccess(screen){
  setText(screen.querySelector('.fm-next-actions [data-action="nav-profile"]'),'내 경기 확인하기');
}

function patchMatchday(scope){
  scope.querySelectorAll('.fm-matchday-kicker').forEach(node=>setText(node,'오늘 경기'));
  scope.querySelectorAll('.fm-matchday-boundary').forEach(node=>setText(node,'체험 중인 체크인 상태는 이 브라우저에만 저장돼요.'));
}

function patchReturn(scope){
  scope.querySelectorAll('.fm-return-kicker').forEach(node=>setText(node,'경기 후 피드백'));
  scope.querySelectorAll('.fm-return-boundary').forEach(node=>setText(node,'남긴 평가는 내 다음 경기 추천을 조정하는 데만 사용돼요.'));
  scope.querySelectorAll('.fm-return-status span').forEach(node=>{
    if(node.textContent.includes('보조 신호'))setText(node,'체감 난이도와 다시 뛰고 싶은 조건을 남기면 다음 추천에 반영해요.');
  });
  scope.querySelectorAll('.fm-return-summary article small').forEach(node=>{
    if(node.textContent.includes('보조 신호'))setText(node,'다음에 추천할 경기');
  });
}

function patchPersonalization(scope){
  scope.querySelectorAll('.fm-personalization-boundary').forEach(node=>setText(node,'저장한 추천 선호는 이 기기의 체험 환경에만 유지돼요.'));
  scope.querySelectorAll('[data-personalization-explanation] small').forEach(node=>setText(node,'이 경기를 추천한 이유'));
}

function savedMatchesMarkup(ids){
  const matches=ids.map(id=>MATCHES.find(match=>match.id===id)).filter(Boolean);
  return `<section class="fm-flow-saved" data-flow-saved data-flow-saved-signature="${escapeHtml(ids.join(','))}"><div class="fm-flow-saved-head"><h2>저장한 경기</h2><span>${matches.length}개</span></div><div class="fm-flow-saved-list">${matches.map(match=>`<button type="button" class="fm-flow-saved-card" data-flow-action="open-saved-match" data-match-id="${escapeHtml(match.id)}"><small>${escapeHtml(cleanDate(match.dateLabel))}</small><b>${escapeHtml(match.place)}</b><span>${escapeHtml(match.level)} · ${escapeHtml(match.distance)} · ${escapeHtml(match.spot)}</span></button>`).join('')}</div></section>`;
}

function ensureExperienceInfo(screen){
  if(screen.querySelector('[data-flow-experience]'))return;
  const experience=document.createElement('section');
  experience.className='fm-flow-experience';experience.dataset.flowExperience='true';
  experience.innerHTML='<details><summary>체험 버전 안내</summary><p>경기, 잔여 자리, 시설 정보는 체험용 데이터예요. 로그인·결제·체크인 등 외부 서비스는 실제 계정이나 금액과 연결되지 않는 항목이 있을 수 있어요.</p><p>추천 선호와 체험 진행 상태는 이 브라우저에 저장돼요.</p><button type="button" data-action="reset-flow">체험 데이터 초기화</button></details>';
  screen.append(experience);
}

function patchProfile(screen){
  const menu=screen.querySelector('.fm-next-menu-list');
  if(menu){
    const setup=menu.querySelector('[data-action="edit-setup"] span');if(setup)setText(setup,'내 추천 설정');
    const reset=menu.querySelector('[data-action="reset-flow"]');if(reset)reset.dataset.flowHidden='true';
  }
  const ids=window.__FOOTMATE_DECISION__?.read?.().savedMatchIds||[];
  const signature=ids.join(',');
  const existing=screen.querySelector('[data-flow-saved]');
  if(!ids.length)existing?.remove();
  else if(existing?.dataset.flowSavedSignature!==signature){
    const wrapper=document.createElement('div');wrapper.innerHTML=savedMatchesMarkup(ids);const next=wrapper.firstElementChild;
    if(existing)existing.replaceWith(next);else screen.querySelector('.fm-next-profile-card')?.before(next);
  }
  ensureExperienceInfo(screen);
}

function patchCompareDialog(scope){
  const dialog=scope.querySelector('[data-decision-dialog="compare"]');
  if(!dialog)return;
  dialog.querySelectorAll('dt').forEach(node=>{if(node.textContent.trim()==='샘플 잔여')setText(node,'남은 자리');});
  setText(dialog.querySelector('.fm-decision-disclosure'),'두 경기의 현재 표시 정보를 같은 기준으로 비교했어요.');
}

function apply(){
  scheduled=false;
  if(!root||!isRealApp())return;
  ensureStyles();stripSampleScheduleLabels(root);
  const screen=root.querySelector('[data-screen]');if(!screen)return;
  if(screen.dataset.screen==='discover')patchDiscover(screen);
  if(screen.dataset.screen==='detail')patchDetail(screen);
  if(screen.dataset.screen==='checkout')patchCheckout(screen);
  if(screen.dataset.screen==='success')patchSuccess(screen);
  if(screen.dataset.screen==='profile')patchProfile(screen);
  patchMatchday(screen);patchReturn(screen);patchPersonalization(screen);patchCompareDialog(root);
  root.dataset.flowNaturalnessVersion=FLOW_VERSION;
}

function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

if(root){
  const observer=new MutationObserver(schedule);
  observer.observe(root,{childList:true,subtree:true});
  schedule();
}

document.addEventListener('click',event=>{
  if(!isRealApp())return;
  const saved=event.target.closest('[data-flow-action="open-saved-match"]');
  if(!saved)return;
  event.preventDefault();event.stopImmediatePropagation();
  const proxy=document.createElement('button');
  proxy.type='button';proxy.hidden=true;proxy.dataset.action='open-match';proxy.dataset.matchId=saved.dataset.matchId;
  root.append(proxy);proxy.click();proxy.remove();
},true);

window.__FOOTMATE_REAL_APP_FLOW__=Object.freeze({version:FLOW_VERSION});
