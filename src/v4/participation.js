import {MATCHES,createState} from './data.js';
import {footmatePlatform} from './platform/application/platform.js';

const root=document.getElementById('footmate-next');
const PARTICIPATION_VERSION='4.4.0';
const PARTICIPATION_STORAGE_KEY=footmatePlatform.storageKeys.participation;
const participationRepository=footmatePlatform.repositories.participation;
const params=new URLSearchParams(location.search);
const requestedMode=params.get('mode');
const mode=['guided','evidence'].includes(requestedMode)?requestedMode:'real';
const statuses=new Set(['idle','checkout','pending','failure','canceled','success']);
const methods=new Set(['easy','card']);
const policySnapshot=Object.freeze({
  refund24h:'경기 24시간 전까지 전액 환불',
  refund3h:'경기 3시간 전까지 50% 환불',
  operatorCancel:'운영 취소 시 전액 반환'
});

const emptyState=()=>({
  schemaVersion:1,
  version:PARTICIPATION_VERSION,
  status:'idle',
  matchId:null,
  amount:null,
  paymentMethod:'easy',
  policySnapshot:null,
  attemptId:null,
  attemptNumber:0,
  confirmationId:null,
  failureCode:null,
  createdAt:null,
  updatedAt:null
});

let state=readParticipation();
let autoComplete=true;
let nextOutcome='success';
let completeTimer=null;
let bypassLegacy=false;
let patching=false;
let scheduled=false;

function normalize(candidate={}){
  const ids=new Set(MATCHES.map(match=>match.id));
  const base=emptyState();
  const status=statuses.has(candidate.status)?candidate.status:base.status;
  const matchId=ids.has(candidate.matchId)?candidate.matchId:null;
  const amount=Number.isFinite(Number(candidate.amount))?Number(candidate.amount):null;
  const paymentMethod=methods.has(candidate.paymentMethod)?candidate.paymentMethod:'easy';
  return {
    ...base,
    ...candidate,
    schemaVersion:1,
    version:PARTICIPATION_VERSION,
    status,
    matchId,
    amount,
    paymentMethod,
    policySnapshot:candidate.policySnapshot&&typeof candidate.policySnapshot==='object'?candidate.policySnapshot:null,
    attemptNumber:Number.isInteger(candidate.attemptNumber)&&candidate.attemptNumber>=0?candidate.attemptNumber:0
  };
}

function readParticipation(){
  if(mode!=='real')return emptyState();
  return normalize(participationRepository.read({})||{});
}

function persist(){
  state.updatedAt=Date.now();
  if(mode!=='real')return;
  participationRepository.write(state);
}

function readSession(){
  if(mode!=='real')return createState();
  return createState(footmatePlatform.session.read()||{});
}

function writeSession(patch){
  if(mode!=='real')return null;
  const current=readSession();
  const next={...current,...patch};
  footmatePlatform.session.write(next);
  return next;
}

function money(value){return new Intl.NumberFormat('ko-KR').format(Number(value||0))+'원'}
function matchById(id){return MATCHES.find(match=>match.id===id)||null}
function matchFromCheckout(){
  const place=root?.querySelector('[data-screen="checkout"] .fm-next-checkout-summary h2')?.textContent?.trim();
  return MATCHES.find(match=>match.place===place)||matchById(readSession().selectedMatchId)||MATCHES[0];
}
function isLocked(){return state.status==='pending'}
function isActiveSnapshot(){return ['pending','failure','canceled','success'].includes(state.status)&&Boolean(state.matchId)}
function authoritativeMatch(fallback){return isActiveSnapshot()?matchById(state.matchId)||fallback:fallback}

function snapshotFor(match){
  return {
    ...emptyState(),
    status:'checkout',
    matchId:match.id,
    amount:match.price,
    paymentMethod:'easy',
    policySnapshot:{...policySnapshot},
    createdAt:Date.now(),
    updatedAt:Date.now()
  };
}

function ensureCheckout(match){
  if(isActiveSnapshot())return;
  if(state.status==='checkout'&&state.matchId===match.id&&state.amount===match.price)return;
  state=snapshotFor(match);
  persist();
}

function statusCopy(){
  if(state.status==='pending')return {title:'결제 확인 중',copy:'중복 참가를 막기 위해 이 요청이 끝날 때까지 다시 제출할 수 없어요.'};
  if(state.status==='failure')return {title:'결제를 완료하지 못했어요',copy:'참가는 확정되지 않았습니다. 같은 경기·금액·정책 스냅샷으로 다시 시도할 수 있어요.'};
  if(state.status==='canceled')return {title:'참가 요청을 취소했어요',copy:'경기 참가 상태는 변경되지 않았습니다.'};
  return null;
}

function paymentMethodsMarkup(){
  const locked=isLocked();
  return `<div class="fm-participation-methods" role="radiogroup" aria-label="결제 수단 선택">
    <button type="button" role="radio" aria-checked="${state.paymentMethod==='easy'}" data-participation-action="select-method" data-method="easy" class="${state.paymentMethod==='easy'?'is-selected':''}" ${locked?'disabled':''}><span>간편결제</span><small>프로토타입 결제 상태 시뮬레이션</small></button>
    <button type="button" role="radio" aria-checked="${state.paymentMethod==='card'}" data-participation-action="select-method" data-method="card" class="${state.paymentMethod==='card'?'is-selected':''}" ${locked?'disabled':''}><span>신용·체크카드</span><small>카드 정보 입력 없이 상태 전이만 검증</small></button>
  </div><p class="fm-participation-disclosure">실제 PG 결제나 카드 승인은 연결하지 않았습니다.</p>`;
}

function recoveryMarkup(){
  const copy=statusCopy();
  if(!copy)return '';
  if(state.status==='pending'){
    return `<section class="fm-participation-state" data-participation-panel="pending" role="status"><small>PENDING</small><h2>${copy.title}</h2><p>${copy.copy}</p><div><button type="button" data-participation-action="resolve-pending">결제 상태 다시 확인</button><button type="button" data-participation-action="cancel-payment" class="is-ghost">결제 취소</button></div></section>`;
  }
  if(state.status==='failure'){
    return `<section class="fm-participation-state is-failure" data-participation-panel="failure" role="alert"><small>RETRY AVAILABLE</small><h2>${copy.title}</h2><p>${copy.copy}</p><div><button type="button" data-participation-action="retry-payment">다시 결제하기</button><button type="button" data-participation-action="cancel-payment" class="is-ghost">참가하지 않기</button></div></section>`;
  }
  return `<section class="fm-participation-state" data-participation-panel="canceled" role="status"><h2>${copy.title}</h2><p>${copy.copy}</p></section>`;
}

function patchSummary(screen,match){
  if(!match)return;
  const summary=screen.querySelector('.fm-next-checkout-summary');
  if(summary){
    const date=summary.querySelector('small');if(date)date.textContent=match.dateLabel;
    const title=summary.querySelector('h2');if(title)title.textContent=match.place;
    const meta=summary.querySelector('.fm-next-checkout-meta');if(meta)meta.innerHTML=`<span>${match.level}</span><span>${match.spot}</span><span>${match.duration}</span>`;
  }
  const payRows=[...screen.querySelectorAll('.fm-next-pay-row')];
  if(payRows[0]?.querySelector('b'))payRows[0].querySelector('b').textContent=money(state.amount??match.price);
  const total=screen.querySelector('.fm-next-pay-row--total b');if(total)total.textContent=money(state.amount??match.price);
}

function patchCheckout(){
  const screen=root?.querySelector('[data-screen="checkout"]');
  if(!screen)return;
  const visibleMatch=matchFromCheckout();
  ensureCheckout(visibleMatch);
  const match=authoritativeMatch(visibleMatch);
  if(!match)return;
  const signature=[state.status,state.matchId,state.amount,state.paymentMethod,state.attemptId,state.attemptNumber,state.failureCode].join('|');
  if(screen.dataset.participationSignature===signature)return;
  screen.dataset.participationSignature=signature;
  screen.dataset.participationVersion=PARTICIPATION_VERSION;
  screen.dataset.participationStatus=state.status;

  patchSummary(screen,match);
  screen.querySelectorAll('[data-participation-panel]').forEach(node=>node.remove());

  const paymentSection=[...screen.querySelectorAll('.fm-next-detail-section')].find(section=>section.querySelector('h2')?.textContent?.trim()==='결제 수단');
  if(paymentSection){
    const heading=paymentSection.querySelector('h2');
    paymentSection.innerHTML='';
    paymentSection.append(heading||Object.assign(document.createElement('h2'),{textContent:'결제 수단'}));
    paymentSection.insertAdjacentHTML('beforeend',paymentMethodsMarkup());
  }

  const inline=screen.querySelector('.fm-next-inline-note span');
  if(inline)inline.textContent=`${state.policySnapshot?.refund24h||policySnapshot.refund24h}. ${state.policySnapshot?.operatorCancel||policySnapshot.operatorCancel}.`;

  const confirm=screen.querySelector('[data-action="confirm-payment"], [data-participation-submit]');
  if(confirm){
    confirm.dataset.participationSubmit='true';
    confirm.disabled=isLocked();
    confirm.setAttribute('aria-busy',String(isLocked()));
    confirm.innerHTML=state.status==='pending'?'결제 확인 중…':`${money(state.amount??match.price)} 결제하고 참가 확정`;
  }

  const actionWrap=confirm?.parentElement;
  if(actionWrap){
    const recovery=recoveryMarkup();
    if(recovery)actionWrap.insertAdjacentHTML('beforebegin',recovery);
  }
}

function announce(message){
  let status=root?.querySelector('[data-participation-live]');
  if(!status){
    status=document.createElement('div');
    status.className='fm-participation-live';
    status.dataset.participationLive='true';
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    root?.append(status);
  }
  status.textContent=message;
}

function newAttempt(){
  return `pay-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}

function startPayment(){
  if(state.status==='pending'){
    announce('이미 결제 확인 중입니다.');
    return;
  }
  const visible=matchFromCheckout();
  ensureCheckout(visible);
  if(!state.matchId||!state.amount)return;
  clearTimeout(completeTimer);
  state={...state,status:'pending',attemptId:newAttempt(),attemptNumber:(state.attemptNumber||0)+1,confirmationId:null,failureCode:null};
  persist();
  announce('결제 확인을 시작했습니다.');
  patchCheckout();
  if(autoComplete){
    const outcome=nextOutcome;
    nextOutcome='success';
    completeTimer=setTimeout(()=>completePayment(outcome),450);
  }
}

function completePayment(outcome='success'){
  if(state.status!=='pending')return;
  clearTimeout(completeTimer);
  if(outcome==='failure'){
    state={...state,status:'failure',failureCode:'SIMULATED_PAYMENT_FAILURE'};
    persist();
    announce('결제를 완료하지 못했습니다. 다시 시도할 수 있어요.');
    patchCheckout();
    return;
  }
  state={...state,status:'success',confirmationId:`FM-${Date.now().toString(36).toUpperCase()}`,failureCode:null};
  persist();
  announce('참가가 확정되었습니다.');
  if(mode==='real'){
    writeSession({selectedMatchId:state.matchId,joinedMatchId:state.matchId,matchStage:'upcoming',route:'success'});
    location.reload();
    return;
  }
  const legacy=root?.querySelector('[data-action="confirm-payment"]');
  if(legacy){
    legacy.disabled=false;
    bypassLegacy=true;
    legacy.click();
    bypassLegacy=false;
  }
}

function retryPayment(){
  if(state.status!=='failure'&&state.status!=='canceled')return;
  state={...state,status:'checkout',failureCode:null,confirmationId:null};
  persist();
  patchCheckout();
  startPayment();
}

function cancelPayment(){
  clearTimeout(completeTimer);
  state={...state,status:'canceled',failureCode:null};
  persist();
  announce('결제를 취소했습니다. 참가 상태는 변경되지 않았어요.');
  if(mode==='real'){
    writeSession({route:'detail',joinedMatchId:readSession().joinedMatchId||null});
    location.reload();
    return;
  }
  const back=root?.querySelector('[data-action="checkout-back"]');
  if(back)back.click();else patchCheckout();
}

function selectMethod(method){
  if(isLocked()||!methods.has(method))return;
  state={...state,paymentMethod:method};
  persist();
  announce(method==='card'?'신용·체크카드를 선택했습니다.':'간편결제를 선택했습니다.');
  patchCheckout();
}

root?.addEventListener('click',event=>{
  const legacy=event.target.closest('[data-action="confirm-payment"]');
  if(legacy&&!bypassLegacy){
    event.preventDefault();
    event.stopPropagation();
    startPayment();
    return;
  }
  const target=event.target.closest('[data-participation-action]');
  if(!target)return;
  event.preventDefault();
  event.stopPropagation();
  const action=target.dataset.participationAction;
  if(action==='select-method'){selectMethod(target.dataset.method);return;}
  if(action==='retry-payment'){retryPayment();return;}
  if(action==='cancel-payment'){cancelPayment();return;}
  if(action==='resolve-pending'){completePayment('success');}
},true);

const observer=new MutationObserver(()=>{
  if(patching||scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;patching=true;patchCheckout();patching=false;});
});
if(root){observer.observe(root,{childList:true,subtree:true});patchCheckout();}

window.__FOOTMATE_PARTICIPATION__={
  version:PARTICIPATION_VERSION,
  storageKey:PARTICIPATION_STORAGE_KEY,
  read:()=>({...state,policySnapshot:state.policySnapshot?{...state.policySnapshot}:null}),
  setAutoComplete:value=>{autoComplete=Boolean(value);return autoComplete;},
  setNextOutcome:value=>{nextOutcome=value==='failure'?'failure':'success';return nextOutcome;},
  complete:value=>completePayment(value==='failure'?'failure':'success'),
  reset:()=>{clearTimeout(completeTimer);state=emptyState();persist();patchCheckout();}
};
