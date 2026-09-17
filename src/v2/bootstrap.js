import{createStorage}from'./core/storage.js';
import{getActiveScreenId,observeActiveScreen}from'./core/screen-observer.js';
import{installValidationEntry}from'./ui/validation-entry.js';

const VERSION='2.0.0-beta.1';
const uiStorage=createStorage('ui');
const state=Object.assign({
  version:VERSION,
  lastActiveScreen:'',
  validationTab:'recommendation'
},uiStorage.read());

function waitForRuntime(timeoutMs=8000){
  const started=performance.now();
  return new Promise((resolve,reject)=>{
    const tick=()=>{
      const ready=
        typeof window.goScreen==='function'&&
        !!window.FootMateProductOps&&
        !!window.FootMateProductCore&&
        !!window.FootMateFinalRuntime&&
        document.querySelectorAll('.screen').length===39;
      if(ready)return resolve();
      if(performance.now()-started>timeoutMs)return reject(new Error('FootMate v2 runtime dependency timeout'));
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function persistState(){
  uiStorage.write({
    version:VERSION,
    lastActiveScreen:state.lastActiveScreen,
    validationTab:state.validationTab
  });
}

async function boot(){
  await waitForRuntime();

  document.documentElement.dataset.footmateVersion='2';
  const validation=installValidationEntry();

  state.version=VERSION;
  state.lastActiveScreen=getActiveScreenId();
  persistState();

  const stopScreenObserver=observeActiveScreen(activeId=>{
    if(!activeId)return;
    state.lastActiveScreen=activeId;
    persistState();
  });

  const originalOpenInspector=window.FootMateProductOps.openInspector;
  if(typeof originalOpenInspector==='function'){
    window.FootMateProductOps.openInspector=function(tab='operations'){
      state.validationTab=tab;
      persistState();
      return originalOpenInspector.apply(this,arguments);
    };
  }

  window.__footmateV2=true;
  window.FootMateV2Runtime={
    version:VERSION,
    state,
    storageKey:uiStorage.key,
    architecture:'native-es-modules',
    navigationWrapped:false,
    refresh:validation.refresh,
    destroy(){
      validation.stop?.();
      stopScreenObserver?.();
    }
  };

  window.dispatchEvent(new CustomEvent('footmate:v2:ready',{detail:{version:VERSION}}));
  console.info('[FootMate] v2 product experience architecture ready',VERSION);
}

boot().catch(error=>{
  console.error('[FootMate v2] bootstrap failed',error);
});
