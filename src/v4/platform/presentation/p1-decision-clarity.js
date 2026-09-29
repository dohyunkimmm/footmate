const root=document.getElementById('footmate-next');
const P1_DECISION_CLARITY_VERSION='1.0.0';
const DISCOVERY_KEYS=['date','time','distance','price','position'];
let scheduled=false;
let draftStatusScheduled=false;

function isRealApp(){
  return document.documentElement.dataset.footmateSurface==='real';
}

function ensureStyles(){
  if(document.getElementById('fm-p1-decision-clarity'))return;
  const style=document.createElement('style');
  style.id='fm-p1-decision-clarity';
  style.textContent=`
.fm-next-page[data-mode="real"] :is(.fm-ai-mode,.fm-ai-status span,.fm-ai-conditions span,.fm-ai-result-copy small,.fm-ai-result-copy em,.fm-ai-empty span,.fm-ai-guardrail){font-size:11px}
html[data-footmate-surface="real"] .fm-discovery-draft-status{margin:8px 0 2px;padding:8px 10px;border-radius:11px;background:#f1f5f2;color:#53675e;font-size:11px;line-height:1.45}
html[data-footmate-surface="real"] .fm-discovery-draft-status[data-dirty="true"]{background:#fff7df;color:#6b5118;font-weight:700}
.fm-next-page[data-mode="real"] .fm-p1-checkout-boundary{margin:0 0 8px;text-align:center;color:#5f7068;font-size:11px;font-weight:700;line-height:1.4}
`;
  document.head.append(style);
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

function syncDiscoveryDraftStatus(){
  draftStatusScheduled=false;
  const sheet=root?.querySelector('[data-discovery-sheet="true"]');
  const status=sheet?.querySelector('[data-p1-discovery-draft-status]');
  const applied=window.__FOOTMATE_DISCOVERY__?.getState?.();
  if(!sheet||!status||!applied)return;
  const dirty=DISCOVERY_KEYS.some(key=>{
    const field=sheet.querySelector(`[data-discovery-field="${key}"]`);
    return field&&String(field.value)!==String(applied[key]);
  });
  status.dataset.dirty=String(dirty);
  status.textContent=dirty?'변경 사항이 아직 적용되지 않았어요.':'현재 적용된 조건입니다.';
}

function scheduleDiscoveryDraftStatus(){
  if(draftStatusScheduled)return;
  draftStatusScheduled=true;
  requestAnimationFrame(syncDiscoveryDraftStatus);
}

function applyP1DecisionClarity(){
  if(!root||!isRealApp())return;
  ensureStyles();
  ensureCheckoutBoundary();
  if(root.querySelector('[data-discovery-sheet="true"]'))scheduleDiscoveryDraftStatus();
  root.dataset.p1DecisionClarityVersion=P1_DECISION_CLARITY_VERSION;
}

document.addEventListener('change',event=>{
  if(event.target.closest('[data-discovery-sheet="true"] [data-discovery-field]'))scheduleDiscoveryDraftStatus();
});
document.addEventListener('click',event=>{
  if(event.target.closest('[data-discovery-sheet="true"] .fm-discovery-reset'))scheduleDiscoveryDraftStatus();
});

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
