import{createStorage}from'./core/storage.js';
import{getActiveScreenId}from'./core/screen-observer.js';
import{resolveMode,applyMode}from'./core/mode.js';
import{createMatchEngine}from'./domain/matching-engine.js';
import{createEloEngine}from'./domain/elo-engine.js';
import{createDecisionEngine}from'./domain/decision-engine.js';
import{createAvailabilityGateway}from'./domain/availability-gateway.js';
import{createProductStore}from'./state/product-store.js';
import{createScenarioStore}from'./state/scenario-store.js';
import{createScenarioPersistence}from'./state/scenario-persistence.js';
import{createDecisionTracePersistence}from'./state/decision-trace-persistence.js';
import{createRuntimeBoundary}from'./demo/runtime-boundary.js';
import{createScenarioPresenter}from'./ui/scenario-presenter.js';
import{installCoreFunnelExperience}from'./ui/core-funnel-experience.js';
import{installDecisionRecoveryExperience}from'./ui/decision-recovery-experience.js';
import{createHomeController}from'./ui/home-controller.js';
import{createFilterResultsController}from'./ui/filter-results-controller.js';
import{createPaymentController}from'./ui/payment-controller.js';
import{createSecondaryController}from'./ui/secondary-controller.js';
import{installProductInspector}from'./ui/product-inspector.js';
import{installScreenEffects}from'./ui/screen-effects.js';
import{installValidationEntry}from'./ui/validation-entry.js';

const VERSION='2.1.0';
const V22_RELEASE_VERSION='2.2.0';
const V23_RELEASE_VERSION='2.3.0';
const V24_RELEASE_VERSION='2.4.0';
const V25_RELEASE_VERSION='2.5.0';
const RELEASE_VERSION='2.6.0';
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
  document.documentElement.dataset.footmateRelease='2.6';
  state.mode=applyMode(requestedMode);

  const finalRuntime=window.FootMateFinalRuntime;
  const productOps=window.FootMateProductOps;
  const runtimeBoundary=createRuntimeBoundary();
  const matchEngine=createMatchEngine(window.FootMateCore);
  const eloEngine=createEloEngine();
  window.FootMateScenarioAdapter.attachDomainEngines?.({match:matchEngine,elo:eloEngine});
  const productStore=createProductStore(finalRuntime);
  const scenarioPresenter=createScenarioPresenter();
  const scenarioStore=createScenarioStore(window.FootMateScenarioAdapter,{matchEngine,eloEngine,presenter:scenarioPresenter});
  const scenarioPersistence=createScenarioPersistence(scenarioStore).start();
  const decisionTracePersistence=createDecisionTracePersistence().start();
  const availabilityGateway=createAvailabilityGateway({productStore,productOps});
  const coreFunnel=installCoreFunnelExperience({scenarioStore,mode:state.mode});
  const decisionEngine=createDecisionEngine({scenarioStore,productStore,productOps});
  decisionTracePersistence.capture(decisionEngine.history(),'bootstrap-engine');
  const home=createHomeController({productStore,scenarioStore});
  const filterResults=createFilterResultsController({scenarioStore});
  const payment=createPaymentController({productStore,scenarioStore,finalRuntime,decisionEngine,productOps});
  const secondary=createSecondaryController({productStore,finalRuntime});
  const decisionRecovery=installDecisionRecoveryExperience({decisionEngine,scenarioStore,productStore,productOps,mode:state.mode});

  window.FootMateV22={
    version:V22_RELEASE_VERSION,
    currentReleaseVersion:RELEASE_VERSION,
    schemaVersion:VERSION,
    matchEngine,
    eloEngine,
    scenarioStore,
    architecture:'v2.2-inspector-ui-ownership',
    compatibility:true
  };
  window.FootMateV23={
    version:V23_RELEASE_VERSION,
    currentReleaseVersion:RELEASE_VERSION,
    previousReleaseVersion:V22_RELEASE_VERSION,
    schemaVersion:VERSION,
    scenarioPersistence:'v2.3-scenario-persistence-migration',
    scenarioPresentation:'v2.3-scenario-presenter',
    cssOwnership:'src/v2/styles',
    architecture:'v2.3-compatibility-boundary-reduction',
    compatibility:true
  };
  window.FootMateV24={
    version:V24_RELEASE_VERSION,
    currentReleaseVersion:RELEASE_VERSION,
    previousReleaseVersion:V23_RELEASE_VERSION,
    schemaVersion:VERSION,
    scenarioPersistence:scenarioPersistence.architecture,
    scenarioPresentation:scenarioPresenter.architecture,
    presenterOwnedScreens:[...scenarioPresenter.ownedScreens],
    coreFunnelExperience:coreFunnel.architecture,
    componentSource:coreFunnel.componentSource,
    coreFunnelScreens:[...coreFunnel.ownedScreens],
    cssOwnership:'src/v2/styles/core-funnel.css',
    architecture:'v2.4-core-funnel-experience',
    compatibility:true
  };
  window.FootMateV25={
    version:V25_RELEASE_VERSION,
    currentReleaseVersion:RELEASE_VERSION,
    previousReleaseVersion:V24_RELEASE_VERSION,
    schemaVersion:VERSION,
    decisionEngine:decisionEngine.architecture,
    decisionRecoveryExperience:decisionRecovery.architecture,
    componentSource:decisionRecovery.componentSource,
    ownedScreens:[...decisionRecovery.ownedScreens],
    traceReplay:true,
    cssOwnership:'src/v2/styles/decision-recovery.css',
    architecture:'v2.5-decision-recovery-experience',
    compatibility:true
  };
  window.FootMateV26={
    version:RELEASE_VERSION,
    previousReleaseVersion:V25_RELEASE_VERSION,
    schemaVersion:VERSION,
    runtimeBoundary:runtimeBoundary.architecture,
    availabilityGateway:availabilityGateway.architecture,
    decisionTracePersistence:decisionTracePersistence.architecture,
    persistentDecisionReplay:true,
    legacySourceRole:runtimeBoundary.legacySource.role,
    compatibilityPatchRole:runtimeBoundary.compatibility.role,
    architecture:'v2.6-architecture-hardening'
  };
  const inspector=installProductInspector();

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
      coreFunnel.onScreen(activeId);
      decisionRecovery.onScreen(activeId);
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
      scenarioPersistence.clear();
      decisionTracePersistence.clear();
    }catch(error){}
    return legacyReplay?.();
  };

  window.__footmateV2=true;
  window.FootMateV2Runtime={
    version:RELEASE_VERSION,
    schemaVersion:VERSION,
    mode:state.mode,
    state,
    productStore,
    scenarioStore,
    scenarioPersistence,
    scenarioPresenter,
    coreFunnel,
    decisionEngine,
    decisionRecovery,
    decisionTracePersistence,
    availabilityGateway,
    runtimeBoundary,
    domain:{matchEngine,eloEngine,decisionEngine,availabilityGateway},
    controllers:{home,filterResults,payment,secondary,inspector,coreFunnel,decisionRecovery},
    storageKey:uiStorage.key,
    architecture:'v2.1-domain-modular-es-runtime',
    releaseArchitecture:'v2.6-architecture-hardening',
    previousReleaseArchitecture:'v2.5-decision-recovery-experience',
    uiArchitecture:inspector.architecture,
    navigationWrapped:false,
    legacyLayers:{
      finalize:'state-bridge-only',
      patchNavigationWrapped:false,
      productHardeningNavigationWrapped:false,
      productHardening:'policy-adapter-ui-bridge',
      scenarioAdapter:window.FootMateScenarioAdapter.architecture,
      scenarioPersistenceBridge:window.FootMateScenarioPersistenceBridge?.architecture||'unavailable',
      patchRuntime:'legacy-render-adapter-only'
    },
    refresh(){
      validation.refresh();
      inspector.render();
      scenarioStore.renderForScreen(getActiveScreenId());
      home.onScreen(getActiveScreenId());
      filterResults.onScreen(getActiveScreenId());
      payment.onScreen(getActiveScreenId());
      secondary.onScreen(getActiveScreenId());
      coreFunnel.onScreen(getActiveScreenId());
      decisionRecovery.onScreen(getActiveScreenId());
    },
    destroy(){
      validation.stop?.();
      inspector.destroy?.();
      decisionRecovery.destroy?.();
      coreFunnel.destroy?.();
      decisionTracePersistence.destroy?.();
      scenarioPersistence.destroy?.();
      stopScreenEffects?.();
    }
  };

  window.FootMateV21={
    version:VERSION,
    matchEngine,
    eloEngine,
    scenarioStore,
    architecture:'domain-engine-extraction'
  };

  window.dispatchEvent(new CustomEvent('footmate:v2:ready',{
    detail:{version:RELEASE_VERSION,schemaVersion:VERSION,mode:state.mode}
  }));
  window.dispatchEvent(new CustomEvent('footmate:v2.1:ready',{
    detail:{version:VERSION,mode:state.mode}
  }));
  window.dispatchEvent(new CustomEvent('footmate:v2.2:ready',{
    detail:{version:V22_RELEASE_VERSION,currentReleaseVersion:RELEASE_VERSION,schemaVersion:VERSION,mode:state.mode,compatibility:true}
  }));
  window.dispatchEvent(new CustomEvent('footmate:v2.3:ready',{
    detail:{version:V23_RELEASE_VERSION,currentReleaseVersion:RELEASE_VERSION,previousReleaseVersion:V22_RELEASE_VERSION,schemaVersion:VERSION,mode:state.mode,compatibility:true}
  }));
  window.dispatchEvent(new CustomEvent('footmate:v2.4:ready',{
    detail:{version:V24_RELEASE_VERSION,currentReleaseVersion:RELEASE_VERSION,previousReleaseVersion:V23_RELEASE_VERSION,schemaVersion:VERSION,mode:state.mode,compatibility:true}
  }));
  window.dispatchEvent(new CustomEvent('footmate:v2.5:ready',{
    detail:{version:V25_RELEASE_VERSION,currentReleaseVersion:RELEASE_VERSION,previousReleaseVersion:V24_RELEASE_VERSION,schemaVersion:VERSION,mode:state.mode,compatibility:true}
  }));
  window.dispatchEvent(new CustomEvent('footmate:v2.6:ready',{
    detail:{version:RELEASE_VERSION,previousReleaseVersion:V25_RELEASE_VERSION,schemaVersion:VERSION,mode:state.mode}
  }));
  console.info('[FootMate] v2.6 architecture hardening ready',RELEASE_VERSION,state.mode);
}

boot().catch(error=>{
  console.error('[FootMate v2] bootstrap failed',error);
});
