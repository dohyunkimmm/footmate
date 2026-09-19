const OWNED_SCREENS=['s-home','s-filter','s-results','s-detail','s-pay'];
const TONES={
  's-home':'hero',
  's-filter':'explore',
  's-results':'compare',
  's-detail':'decision',
  's-pay':'checkout'
};

function markScreen(id){
  const screen=document.getElementById(id);
  if(!screen)return;
  screen.dataset.fm28Identity='true';
  screen.dataset.fm28Tone=TONES[id]||'default';
  screen.querySelectorAll('.fm24-panel,.fm25-panel,.card,[data-match-card]').forEach((element,index)=>{
    element.dataset.fm28Surface='true';
    element.style.setProperty('--fm28-order',String(Math.min(index,8)));
  });
  screen.querySelectorAll('.fm25-compare-card').forEach((element,index)=>{
    element.dataset.fm28Card='match';
    if(index===0)element.dataset.fm28Featured='true';
    else delete element.dataset.fm28Featured;
  });
  screen.querySelectorAll('.fm24-action,.fm25-action,.btn-primary,.btn-secondary').forEach(element=>{
    element.dataset.fm28Action='true';
  });
}

export function installVisualIdentityExperience(){
  let destroyed=false;
  let scheduled=false;
  const refresh=()=>{
    if(destroyed)return;
    scheduled=false;
    document.documentElement.dataset.footmateVisualIdentity='matchday';
    OWNED_SCREENS.forEach(markScreen);
  };
  const scheduleRefresh=()=>{
    if(destroyed||scheduled)return;
    scheduled=true;
    queueMicrotask(refresh);
  };
  const onScreen=id=>{
    if(destroyed)return;
    if(OWNED_SCREENS.includes(id))markScreen(id);
  };
  const observer=new MutationObserver(mutations=>{
    if(mutations.some(mutation=>mutation.type==='childList'&&(mutation.addedNodes.length||mutation.removedNodes.length)))scheduleRefresh();
  });
  observer.observe(document.body,{childList:true,subtree:true});
  refresh();
  return{
    architecture:'v2.8-visual-identity-experience',
    tokenSource:'src/v2/styles/visual-tokens.css',
    styleSource:'src/v2/styles/visual-identity.css',
    ownedScreens:[...OWNED_SCREENS],
    identity:'matchday',
    refresh,
    onScreen,
    destroy(){
      destroyed=true;
      observer.disconnect();
    }
  };
}
