import{createStorage}from'./core/storage.js';
import{getActiveScreenId}from'./core/screen-observer.js';
import{resolveMode,applyMode}from'./core/mode.js';
import{createProductStore}from'./state/product-store.js';
import{createScenarioStore}from'./state/scenario-store.js';
import{createHomeController}from'./ui/home-controller.js';
import{createFilterResultsController}from'./ui/filter-results-controller.js';
import{createPaymentController}from'./ui/payment-controller.js';
import{createSecondaryController}from'./ui/secondary-controller.js';
import{installScreenEffects}from'./ui/screen-effects.js';
import{installValidationEntry}from'./ui/validation-entry.js';

const VERSION='2.0.0-beta.2';
const uiStorage=createStorage('ui');
const requestedMode=resolveMode();
const state=Object.assign({
  version:VERSION,
  mode:requestedMode,
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
        !!window.FootMateScenarioAdapter&&
        document.querySelectorAll('.screen').length===39;
      if(ready)return resolve();
      if(performance.now()-started>timeoutMs)return reject(new Error('FootMate v2 runtime dependency timeout'));
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function persistUiState(){
  uiStorage.write({
    version:VERSION,
    mode:state.mode,
    lastActiveScreen:state.lastActiveScreen,
    validationTab:state.validationTab
  });
}

async function boot(){
  await waitForRuntime();

  document.documentElement.dataset.footmateVersion='2';
  state.mode=applyMode(requestedMode);

  const finalRuntime=window.FootMateFinalRuntime;
  const productStore=createProductStore(finalRuntime);
  const scenarioStore=createScenarioStore(window.FootMateScenarioAdapter);
  const home=createHomeController({productStore,scenarioStore});
  const filterResults=createFilterResultsController({scenarioStore});
  const payment=createPaymentController({productStore,scenarioStore,finalRuntime});
  const secondary=createSecondaryController({productStore,finalRuntime});

  home.bindControls();
  filterResults.bindFilterButtons();
  filterResults.bindResultCards();

  state.version=VERSION;
  state.lastActiveScreen=getActiveScreenId();
  persistUiState();

  const stopScreenEffects=installScreenEffects({
    scenarioStore,
    home,
    filterResults,
    payment,
    secondary,
    onScreen(activeId){
      state.lastActiveScreen=activeId;
      persistUiState();
    }
  });

  // Product mode skips the portfolio intro visually, but still runs its
  // initialization contract so hash deep-links and demo state restoration work.
  if(state.mode==='product'&&typeof window.startFootMateDemo==='function'){
    window.startFootMateDemo();
  }

  const validation=installValidationEntry({mode:state.mode});

  const originalOpenInspector=window.FootMateProductOps.openInspector;
  if(typeof originalOpenInspector==='function'){
    window.FootMateProductOps.openInspector=function(tab='operations'){
      state.validationTab=tab;
      persistUiState();
      return originalOpenInspector.apply(this,arguments);
    };
  }

  const legacyReplay=finalRuntime.legacy?.replayFootMateDemo;
  window.replayFootMateDemo=function(){
    try{
      localStorage.removeItem(finalRuntime.storeKey);
      localStorage.removeItem(uiStorage.key);
    }catch(error){}
    return legacyReplay?.();
  };

  window.__footmateV2=true;
  window.FootMateV2Runtime={
    version:VERSION,
    mode:state.mode,
    state,
    productStore,
    scenarioStore,
    controllers:{home,filterResults,payment,secondary},
    storageKey:uiStorage.key,
    architecture:'native-es-modules',
    navigationWrapped:false,
    legacyLayers:{
      finalize:'state-bridge-only',
      patchNavigationWrapped:false,
      productHardeningNavigationWrapped:false
    },
    refresh(){
      validation.refresh();
      scenarioStore.renderForScreen(getActiveScreenId());
      home.onScreen(getActiveScreenId());
      filterResults.onScreen(getActiveScreenId());
      payment.onScreen(getActiveScreenId());
      secondary.onScreen(getActiveScreenId());
    },
    destroy(){
      validation.stop?.();
      stopScreenEffects?.();
    }
  };

  window.dispatchEvent(new CustomEvent('footmate:v2:ready',{
    detail:{version:VERSION,mode:state.mode}
  }));
  console.info('[FootMate] v2 runtime migration ready',VERSION,state.mode);
}

boot().catch(error=>{
  console.error('[FootMate v2] bootstrap failed',error);
});
