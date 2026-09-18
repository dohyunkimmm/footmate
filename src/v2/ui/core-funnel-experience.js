import{
  CORE_FUNNEL_SCREEN_IDS,
  createJourney,
  createHomeDecisionCard,
  createFilterSummary,
  createResultsToolbar,
  createDetailDecisionCard,
  createCheckoutSteps
}from'../demo/core-funnel-components.js';

function contentRoot(screenId){
  const screen=document.getElementById(screenId);
  return screen?.querySelector('.pcnt')||screen||null;
}

function replaceSlot(root,slot,node){
  if(!root||!node)return;
  const current=root.querySelector(`:scope > [data-fm24-slot="${slot}"]`);
  if(current)current.replaceWith(node);
  else root.prepend(node);
}

function addStickyPrimary(screenId){
  const buttons=[...document.querySelectorAll(`#${screenId} .btn-primary`)];
  const primary=buttons.at(-1);
  if(primary)primary.classList.add('fm24-sticky-primary');
}

export function installCoreFunnelExperience({scenarioStore,mode='product'}={}){
  if(!scenarioStore?.getState)throw new Error('FootMate scenario store is required');
  let state=scenarioStore.getState();
  let stop=()=>{};

  function mount(screenId){
    if(!CORE_FUNNEL_SCREEN_IDS.includes(screenId))return;
    const root=contentRoot(screenId);
    if(!root)return;
    root.closest('.screen')?.setAttribute('data-fm24-core-funnel','true');
    if(screenId==='s-home')replaceSlot(root,'home-decision',createHomeDecisionCard(state));
    if(screenId==='s-filter')replaceSlot(root,'filter-summary',createFilterSummary(state));
    if(screenId==='s-results')replaceSlot(root,'results-toolbar',createResultsToolbar(state));
    if(screenId==='s-detail')replaceSlot(root,'detail-decision',createDetailDecisionCard(state));
    if(screenId==='s-pay')replaceSlot(root,'checkout',createCheckoutSteps());
    replaceSlot(root,'journey',createJourney(screenId));

    if(screenId==='s-detail'||screenId==='s-pay')addStickyPrimary(screenId);
  }

  function refresh(){
    state=scenarioStore.getState();
    CORE_FUNNEL_SCREEN_IDS.forEach(mount);
  }

  function onAction(event){
    const button=event.target.closest?.('[data-fm24-action]');
    if(!button)return;
    const action=button.dataset.fm24Action;
    if(action==='filter')window.goScreen?.('s-filter');
    if(action==='results'){
      scenarioStore.sync?.('v2.4-results-action',{preserveSelected:true});
      window.goScreen?.('s-results');
    }
    if(action==='reason')window.goScreen?.('s-reason');
  }

  function onScreen(screenId){
    state=scenarioStore.getState();
    mount(screenId);
  }

  document.addEventListener('click',onAction);
  stop=scenarioStore.subscribe(value=>{
    state=value;
    CORE_FUNNEL_SCREEN_IDS.forEach(screenId=>{
      const screen=document.getElementById(screenId);
      if(screen?.classList.contains('active')||screen?.querySelector('[data-fm24-slot]'))mount(screenId);
    });
  });
  document.documentElement.dataset.fm24Experience=mode;
  refresh();

  return{
    architecture:'v2.4-core-funnel-experience',
    componentSource:'src/v2/demo/core-funnel-components.js',
    ownedScreens:[...CORE_FUNNEL_SCREEN_IDS],
    refresh,
    onScreen,
    destroy(){
      stop();
      stop=()=>{};
      document.removeEventListener('click',onAction);
    }
  };
}
