import{PRIMARY_DESTINATIONS,isOnboardingScreen,destinationForScreen,targetForDestination}from'./ia/navigation.js';
import{createAppNavigation,setActiveDestination}from'./components/app-navigation.js';
import{createContextBar}from'./components/context-bar.js';
import{createViewState}from'./state/view-state.js';

const CONTEXT_SCREENS=new Set(['s-home','s-filter','s-results','s-detail','s-reason','s-pay','s-pay-low','s-charge','s-confirm','s-profile']);

function activeScreenId(){
  return document.querySelector('.screen.active')?.id||'s-splash';
}

function contentRoot(screenId){
  const screen=document.getElementById(screenId);
  return screen?.querySelector('.pcnt')||screen||null;
}

function replaceContext(root,node){
  if(!root||!node)return;
  const current=root.querySelector(':scope > [data-fm30-slot="context"]');
  if(current)current.replaceWith(node);
  else root.prepend(node);
}

function markSurfaces(screen){
  screen.querySelectorAll('.card,.fm24-panel,.fm25-panel,[data-match-card],.profile-elo-card,.profile-menu-item').forEach((node,index)=>{
    node.dataset.fm30Surface='true';
    node.style.setProperty('--fm30-order',String(Math.min(index,12)));
  });
}

export function installAppShell({runtime,mode='product'}={}){
  if(!runtime?.scenarioStore)throw new Error('FootMate v3 requires the v2.8 compatible scenario runtime');

  const shell=document.querySelector('.device-shell');
  const deviceScreen=document.querySelector('.device-screen');
  if(!shell||!deviceScreen)throw new Error('FootMate v3 app shell host is missing');

  let currentDestination=destinationForScreen(activeScreenId(),'discover');
  const viewState=createViewState(currentDestination);
  currentDestination=viewState.getState().activeDestination||currentDestination;

  let nav=document.getElementById('fm30AppNav');
  if(!nav){
    nav=createAppNavigation(PRIMARY_DESTINATIONS);
    shell.insertBefore(nav,deviceScreen);
  }

  document.querySelectorAll('.tab-bar').forEach(tab=>{
    tab.dataset.fm30LegacyNav='true';
    tab.setAttribute('aria-hidden','true');
  });

  let destroyed=false;
  let scheduled=false;

  function scenarioState(){
    return runtime.scenarioStore.getState?.()||{};
  }

  function mount(screenId){
    const screen=document.getElementById(screenId);
    if(!screen)return;
    const destination=destinationForScreen(screenId,currentDestination);
    screen.dataset.fm30Area=destination;
    screen.dataset.fm30Architecture='app-shell';
    markSurfaces(screen);
    if(CONTEXT_SCREENS.has(screenId)){
      replaceContext(contentRoot(screenId),createContextBar({
        screenId,
        destinationId:destination,
        state:scenarioState()
      }));
    }
  }

  function sync(){
    if(destroyed)return;
    scheduled=false;
    const screenId=activeScreenId();
    const onboarding=isOnboardingScreen(screenId);
    document.documentElement.dataset.fm30Phase=onboarding?'onboarding':'app';
    document.documentElement.dataset.fm30Mode=mode;
    if(!onboarding){
      currentDestination=destinationForScreen(screenId,currentDestination);
      viewState.setActiveDestination(currentDestination,'screen-sync');
    }
    document.documentElement.dataset.fm30Destination=currentDestination;
    setActiveDestination(nav,currentDestination);
    mount(screenId);
  }

  function schedule(){
    if(destroyed||scheduled)return;
    scheduled=true;
    queueMicrotask(sync);
  }

  function onClick(event){
    const button=event.target.closest?.('[data-fm30-destination]');
    if(!button)return;
    event.preventDefault();
    const destinationId=button.dataset.fm30Destination;
    currentDestination=destinationId;
    viewState.setActiveDestination(destinationId,'primary-navigation');
    const target=targetForDestination(destinationId);
    if(destinationId==='recommendations')runtime.scenarioStore.sync?.('v3-primary-navigation',{preserveSelected:true});
    window.goScreen?.(target);
    schedule();
  }

  const observer=new MutationObserver(mutations=>{
    if(mutations.some(mutation=>mutation.type==='attributes'&&mutation.attributeName==='class'))schedule();
  });
  observer.observe(deviceScreen,{subtree:true,attributes:true,attributeFilter:['class']});

  document.addEventListener('click',onClick);
  const stopScenario=runtime.scenarioStore.subscribe?.(()=>schedule())||(()=>{});

  document.querySelectorAll('.screen').forEach(screen=>mount(screen.id));
  sync();

  return{
    architecture:'v3.0-unified-app-shell',
    componentArchitecture:'v3.0-reusable-component-system',
    ia:'4-primary-destinations',
    primaryDestinations:PRIMARY_DESTINATIONS.map(({id,label,target})=>({id,label,target})),
    preservedLegacyRoutes:document.querySelectorAll('.screen').length,
    viewState,
    navigation:nav,
    refresh(){
      document.querySelectorAll('.screen').forEach(screen=>mount(screen.id));
      sync();
    },
    onScreen:sync,
    destroy(){
      destroyed=true;
      observer.disconnect();
      stopScenario();
      document.removeEventListener('click',onClick);
      nav.remove();
      document.querySelectorAll('.tab-bar[data-fm30-legacy-nav="true"]').forEach(tab=>{
        tab.removeAttribute('aria-hidden');
        delete tab.dataset.fm30LegacyNav;
      });
    }
  };
}
