const root=document.getElementById('footmate-next');
const P1_DECISION_CLARITY_VERSION='1.0.0';
const filterKeys=['date','time','distance','price','position'];
const filterDefaults=Object.freeze({date:'all',time:'all',distance:'all',price:'all',position:'all'});
let filterDraft=null;
let committingDraft=false;
let scheduled=false;

function isRealApp(){
  return document.documentElement.dataset.footmateSurface==='real';
}

function ensureStyles(){
  if(document.getElementById('fm-p1-decision-clarity'))return;
  const style=document.createElement('style');
  style.id='fm-p1-decision-clarity';
  style.textContent=`
.fm-next-page[data-mode="real"] :is(.fm-ai-mode,.fm-ai-status span,.fm-ai-conditions span,.fm-ai-result-copy small,.fm-ai-result-copy em,.fm-ai-empty span,.fm-ai-guardrail){font-size:11px}
.fm-next-page[data-mode="real"] .fm-discovery-draft-status{margin:8px 0 2px;padding:8px 10px;border-radius:11px;background:#f1f5f2;color:#53675e;font-size:11px;line-height:1.45}
.fm-next-page[data-mode="real"] .fm-discovery-draft-status[data-dirty="true"]{background:#fff7df;color:#6b5118;font-weight:700}
.fm-next-page[data-mode="real"] .fm-p1-checkout-boundary{margin:0 0 8px;text-align:center;color:#5f7068;font-size:11px;font-weight:700;line-height:1.4}
`;
  document.head.append(style);
}

function discoveryState(){
  return window.__FOOTMATE_DISCOVERY__?.getState?.()||filterDefaults;
}

function draftDirty(){
  if(!filterDraft)return false;
  const applied=discoveryState();
  return filterKeys.some(key=>String(filterDraft[key])!==String(applied[key]));
}

function updateDraftStatus(sheet=root?.querySelector('[data-discovery-sheet="true"]')){
  if(!sheet||!filterDraft)return;
  let status=sheet.querySelector('[data-p1-discovery-draft-status]');
  if(!status){
    status=document.createElement('p');
    status.className='fm-discovery-draft-status';
    status.dataset.p1DiscoveryDraftStatus='true';
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    const copy=sheet.querySelector('.fm-discovery-sheet-copy');
    copy?.insertAdjacentElement('afterend',status);
  }
  const dirty=draftDirty();
  status.dataset.dirty=String(dirty);
  status.textContent=dirty?'변경 사항이 아직 적용되지 않았어요.':'현재 적용된 조건입니다.';
  const done=sheet.querySelector('.fm-discovery-done');
  if(done)done.setAttribute('aria-label',dirty?'변경한 필터를 적용하고 결과 보기':'현재 필터로 결과 보기');
}

function beginFilterDraft(){
  const sheet=root?.querySelector('[data-discovery-sheet="true"]');
  if(!sheet)return;
  filterDraft={...filterDefaults,...discoveryState()};
  updateDraftStatus(sheet);
}

function resetFilterDraft(sheet){
  if(!filterDraft)return;
  filterDraft={...filterDraft,...filterDefaults};
  sheet.querySelectorAll('[data-discovery-field]').forEach(field=>{
    const key=field.dataset.discoveryField;
    if(key in filterDefaults)field.value=filterDefaults[key];
  });
  updateDraftStatus(sheet);
}

function commitFilterDraft(sheet){
  if(!filterDraft)return;
  committingDraft=true;
  sheet.querySelectorAll('[data-discovery-field]').forEach(field=>{
    const key=field.dataset.discoveryField;
    if(key in filterDraft)field.value=filterDraft[key];
    field.dispatchEvent(new Event('change',{bubbles:true}));
  });
  committingDraft=false;
  filterDraft=null;
}

function ensureCheckoutBoundary(){
  const screen=root?.querySelector('[data-screen="checkout"]');
  if(!screen)return;
  const confirm=screen.querySelector('[data-action="confirm-payment"],[data-participation-submit]');
  const wrap=confirm?.parentElement;
  if(!confirm||!wrap)return;
  let note=wrap.querySelector('[data-p1-checkout-boundary]');
  if(!note){
    note=document.createElement('p');
    note.className='fm-p1-checkout-boundary';
    note.dataset.p1CheckoutBoundary='true';
    note.textContent='프로토타입 · 실제 결제 없음';
    wrap.insertBefore(note,confirm);
  }
}

function applyP1DecisionClarity(){
  if(!root||!isRealApp())return;
  ensureStyles();
  ensureCheckoutBoundary();
  if(filterDraft)updateDraftStatus();
  root.dataset.p1DecisionClarityVersion=P1_DECISION_CLARITY_VERSION;
}

document.addEventListener('click',event=>{
  if(!isRealApp())return;
  const target=event.target.closest('[data-discovery-action]');
  if(!target)return;
  const action=target.dataset.discoveryAction;
  if(action==='open-filters'){
    queueMicrotask(beginFilterDraft);
    return;
  }
  const sheet=target.closest('[data-discovery-sheet="true"]');
  if(!sheet)return;
  if(action==='clear-filters'){
    event.preventDefault();
    event.stopImmediatePropagation();
    resetFilterDraft(sheet);
    return;
  }
  if(target.classList.contains('fm-discovery-done')){
    commitFilterDraft(sheet);
    return;
  }
  if(action==='close-filters')filterDraft=null;
},true);

document.addEventListener('change',event=>{
  if(!isRealApp()||committingDraft)return;
  const field=event.target.closest('[data-discovery-field]');
  const sheet=field?.closest('[data-discovery-sheet="true"]');
  if(!field||!sheet||!filterDraft)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  filterDraft={...filterDraft,[field.dataset.discoveryField]:field.value};
  updateDraftStatus(sheet);
},true);

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&root?.querySelector('[data-discovery-sheet="true"]'))filterDraft=null;
},true);

if(root){
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;applyP1DecisionClarity();});
  });
  observer.observe(root,{childList:true,subtree:true});
  applyP1DecisionClarity();
  queueMicrotask(applyP1DecisionClarity);
}

window.__FOOTMATE_P1_DECISION_CLARITY__=Object.freeze({
  version:P1_DECISION_CLARITY_VERSION,
  readableInformationFloor:11,
  discoveryFilterCommit:'draft-then-apply',
  checkoutBoundary:'prototype-no-real-payment'
});
