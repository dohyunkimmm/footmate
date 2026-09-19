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

function clearContext(root){
  root?.querySelector(':scope > [data-fm30-slot="context"]')?.remove();
}

function markSurfaces(screen){
  screen.querySelectorAll('.card,.fm24-panel,.fm25-panel,[data-match-card],.profile-elo-card,.profile-menu-item').forEach((node,index)=>{
    node.dataset.fm30Surface='true';
    node.style.setProperty('--fm30-order',String(Math.min(index,12)));
  });
}

function restoreLegacyNavigation(){
  document.querySelectorAll('.tab-bar').forEach(tab=>{
    tab.removeAttribute('aria-hidden');
    delete tab.dataset.fm30LegacyNav;
  });
}

export function installAppShell({runtime,mode='product'}={}){
  if(!runtime?.scenarioStore)throw new Error('FootMate v3 requires the v2.8 compatible scenario runtime');

  const shell=document.querySelector('.device-shell');
  const deviceScreen=document.querySelector('.device-screen');
  if(!shell||!deviceScreen)throw new Error('FootMate v3 app shell host is missing');

  const portfolioChrome=mode==='portfolio';
  document.documentElement.dataset.fm30Mode=mode;
  document.documentElement.dataset.fm30Chrome=portfolioChrome?'portfolio-shell':'v2.8-product-baseline';

  let currentDestination=destinationForScreen(activeScreenId(),'discover');
  const viewState=createViewState(currentDestination);
  currentDestination=viewState.getState().activeDestination||currentDestination;

  let nav=document.getElementById('fm30AppNav');
  if(portfolioChrome){
    if(!nav){
      nav=createAppNavigation(PRIMARY_DESTINATIONS);
      shell.insertBefore(nav,deviceScreen);
    }
    document.querySelectorAll('.tab-bar').forEach(tab=>{
      tab.dataset.fm30LegacyNav='true';
      tab.setAttribute('aria-hidden','true');
    });
  }else{
    nav?.remove();
    nav=null;
    restoreLegacyNavigation();
    document.querySelectorAll('[data-fm30-slot="context"]').forEach(node=>node.remove());
  }

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
    const root=contentRoot(screenId);
    if(portfolioChrome&&CONTEXT_SCREENS.has(screenId)){
      replaceContext(root,createContextBar({
        screenId,
        destinationId:destination,
        state:scenarioState()
      }));
    }else{
      clearContext(root);
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

  function onNavigationClick(event){
    const button=event.target.closest?.('[data-fm30-destination]');
    if(!button||!nav?.contains(button))return;
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

  nav?.addEventListener('click',onNavigationClick);
  const stopScenario=runtime.scenarioStore.subscribe?.(()=>schedule())||(()=>{});

  sync();

  return{
    architecture:'v3.0-unified-app-shell',
    componentArchitecture:'v3.0-reusable-component-system',
    ia:'4-primary-destinations',
    visualMode:portfolioChrome?'portfolio-app-shell':'v2.8-product-baseline',
    primaryDestinations:PRIMARY_DESTINATIONS.map(({id,label,target})=>({id,label,target})),
    preservedLegacyRoutes:document.querySelectorAll('.screen').length,
    viewState,
    navigation:nav,
    refresh(){sync()},
    onScreen:sync,
    destroy(){
      destroyed=true;
      observer.disconnect();
      stopScenario();
      nav?.removeEventListener('click',onNavigationClick);
      nav?.remove();
      document.querySelectorAll('[data-fm30-slot="context"]').forEach(node=>node.remove());
      restoreLegacyNavigation();
    }
  };
}
