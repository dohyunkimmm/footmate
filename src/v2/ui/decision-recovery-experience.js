import{
  DECISION_RECOVERY_SCREEN_IDS,
  createNextActionCard,
  createImpactPreview,
  createComparisonBoard,
  createPreflightCard,
  createRecoveryCard,
  createConfirmationCard
}from'../demo/decision-recovery-components.js';

function contentRoot(screenId){
  const screen=document.getElementById(screenId);
  return screen?.querySelector('.pcnt')||screen||null;
}
function replaceSlot(root,slot,node){
  if(!root||!node)return;
  const current=root.querySelector(`:scope > [data-fm25-slot="${slot}"]`);
  if(current)current.replaceWith(node);else root.prepend(node);
}
function activeScreen(){return document.querySelector('.screen.active')?.id||'s-home'}

export function installDecisionRecoveryExperience({decisionEngine,scenarioStore,productStore,productOps,mode='product'}={}){
  if(!decisionEngine?.evaluate)throw new Error('FootMate decision engine is required');
  let stopScenario=()=>{},stopProduct=()=>{};
  const announcer=document.createElement('div');
  announcer.className='fm25-sr-status';announcer.setAttribute('aria-live','polite');announcer.setAttribute('aria-atomic','true');document.body.append(announcer);

  function announce(message){announcer.textContent='';requestAnimationFrame(()=>{announcer.textContent=message||''})}
  function decision(screenId=activeScreen(),options){return decisionEngine.evaluate(screenId,options)}
  function syncPayGuard(value){
    const primary=document.querySelector('#s-pay .btn-primary');
    if(!primary)return;
    const blocked=value.submission==='block';
    primary.disabled=blocked;
    primary.dataset.fm25Guard=blocked?'blocked':'ready';
    primary.setAttribute('aria-disabled',String(blocked));
    if(blocked)primary.title=value.title;else primary.removeAttribute('title');
  }
  function mount(screenId){
    if(!DECISION_RECOVERY_SCREEN_IDS.includes(screenId))return;
    const root=contentRoot(screenId);if(!root)return;
    const value=decision(screenId);
    root.closest('.screen')?.setAttribute('data-fm25-decision-recovery','true');
    if(screenId==='s-home')replaceSlot(root,'next-action',createNextActionCard(value));
    if(screenId==='s-filter')replaceSlot(root,'impact',createImpactPreview(value));
    if(screenId==='s-results')replaceSlot(root,'comparison',createComparisonBoard(value));
    if(screenId==='s-reason'||screenId==='s-detail')replaceSlot(root,'preflight',createPreflightCard(value));
    if(screenId==='s-pay'){replaceSlot(root,'payment-preflight',createPreflightCard(value,'payment-preflight'));syncPayGuard(value)}
    if(screenId==='s-pay-low'||screenId==='s-charge')replaceSlot(root,'recovery',createRecoveryCard(value));
    if(screenId==='s-confirm')replaceSlot(root,'confirmation',createConfirmationCard(value));
    return value;
  }
  function refresh(){return mount(activeScreen())}

  function runAction(action,button){
    const matchKey=button?.dataset.matchKey;
    if(action==='home')window.goScreen?.('s-home');
    if(action==='filter')window.goScreen?.('s-filter');
    if(action==='results'){scenarioStore.sync?.('v2.5-results-action',{preserveSelected:true});window.goScreen?.('s-results')}
    if(action==='reason')window.goScreen?.('s-reason');
    if(action==='detail'){if(matchKey)scenarioStore.selectMatch?.(matchKey);window.goScreen?.('s-detail')}
    if(action==='payment')window.goScreen?.('s-pay');
    if(action==='charge')window.goScreen?.('s-charge');
    if(action==='confirm')window.goScreen?.('s-confirm');
    if(action==='gameday')window.goScreen?.('s-gameday');
    if(action==='postgame')window.goScreen?.('s-postgame');
    if(action==='select-match'&&matchKey)scenarioStore.navigateToMatch?.(matchKey,true);
    if(action==='relax-distance'){
      const value=Number(button?.dataset.value)||Math.min(30,Number(scenarioStore.getState().profile?.distanceKm||15)+5);
      scenarioStore.setDistance?.(value);window.goScreen?.('s-results');announce(`거리 범위를 ${value}km로 넓혀 추천을 다시 계산했습니다.`);
    }
    if(action==='join-waitlist'){
      const ok=productOps?.joinWaitlist?.();announce(ok?'대기 등록이 완료됐습니다.':'대기 등록 조건을 다시 확인해 주세요.');
    }
    if(action==='retry-payment'){
      const ok=productOps?.retryPayment?.();announce(ok?'결제 재시도가 완료됐습니다.':'결제 재시도에 필요한 조건을 확인해 주세요.');if(ok)window.goScreen?.('s-confirm');
    }
    if(action==='accept-offer'){
      const ok=productOps?.acceptWaitlistOffer?.();announce(ok?'빈자리 제안을 수락하고 참가를 확정했습니다.':'제안 수락 조건을 다시 확인해 주세요.');if(ok)window.goScreen?.('s-confirm');
    }
    queueMicrotask(()=>{productStore.sync?.('v2.5-decision-action');mount(activeScreen())});
  }
  function onClick(event){
    const button=event.target.closest?.('[data-fm25-action]');if(!button)return;
    event.preventDefault();runAction(button.dataset.fm25Action,button);
  }
  function onBlocked(event){const value=event.detail||decision('s-pay',{record:false});announce(value.title);mount(activeScreen())}
  function onScreen(screenId){mount(screenId)}

  document.addEventListener('click',onClick);
  window.addEventListener('footmate:v2.5:decision-blocked',onBlocked);
  stopScenario=scenarioStore.subscribe(()=>queueMicrotask(refresh));
  stopProduct=productStore.subscribe(()=>queueMicrotask(refresh));
  document.documentElement.dataset.fm25Experience=mode;
  DECISION_RECOVERY_SCREEN_IDS.forEach(screenId=>{const screen=document.getElementById(screenId);if(screen?.classList.contains('active'))mount(screenId)});

  const api={
    architecture:'v2.5-decision-recovery-experience',
    componentSource:'src/v2/demo/decision-recovery-components.js',
    ownedScreens:[...DECISION_RECOVERY_SCREEN_IDS],
    refresh,onScreen,announce,
    destroy(){stopScenario();stopProduct();document.removeEventListener('click',onClick);window.removeEventListener('footmate:v2.5:decision-blocked',onBlocked);announcer.remove()}
  };
  window.FootMateDecisionExperience=api;
  return api;
}
