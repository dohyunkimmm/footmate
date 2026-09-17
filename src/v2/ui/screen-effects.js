import{observeActiveScreen}from'../core/screen-observer.js';

export function installScreenEffects({scenarioStore,home,filterResults,payment,secondary,onScreen}){
  return observeActiveScreen((screenId,previous)=>{
    if(!screenId)return;

    scenarioStore.renderForScreen(screenId);
    home.onScreen(screenId,previous);
    filterResults.onScreen(screenId,previous);
    payment.onScreen(screenId,previous);
    secondary.onScreen(screenId,previous);
    window.FootMateProductOps?.renderInspector?.();
    onScreen?.(screenId,previous);
  });
}
