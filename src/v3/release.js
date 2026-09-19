import{installAppShell}from'./app-shell.js';
import{PRIMARY_DESTINATIONS}from'./ia/navigation.js';

const RELEASE_VERSION='3.0.0';
const PREVIOUS_RELEASE_VERSION='2.8.0';
const SCHEMA_VERSION='2.1.0';

function promote(){
  if(window.FootMateV30||window.FootMateV3Runtime)return;
  const baseRuntime=window.FootMateV2Runtime;
  if(!baseRuntime||!window.FootMateV28)return;

  const appShell=installAppShell({runtime:baseRuntime,mode:baseRuntime.mode});

  document.documentElement.dataset.footmateCurrentRelease='3.0';
  document.documentElement.dataset.footmateArchitecture='unified-app';
  document.documentElement.dataset.footmateVisualBaseline='2.8';

  const runtime={
    version:RELEASE_VERSION,
    schemaVersion:SCHEMA_VERSION,
    mode:baseRuntime.mode,
    state:baseRuntime.state,
    architecture:'v3.0-modular-app-runtime',
    releaseArchitecture:'v3.0-unified-app-architecture',
    previousReleaseArchitecture:'v2.8-visual-identity',
    baseRuntime,
    productStore:baseRuntime.productStore,
    scenarioStore:baseRuntime.scenarioStore,
    scenarioPersistence:baseRuntime.scenarioPersistence,
    scenarioPresenter:baseRuntime.scenarioPresenter,
    decisionEngine:baseRuntime.decisionEngine,
    decisionRecovery:baseRuntime.decisionRecovery,
    decisionTracePersistence:baseRuntime.decisionTracePersistence,
    availabilityGateway:baseRuntime.availabilityGateway,
    domain:baseRuntime.domain,
    appShell,
    viewState:appShell.viewState,
    controllers:{...baseRuntime.controllers,appShell},
    shellOwnership:'src/v3/styles/app-shell.css',
    componentOwnership:'src/v3/components',
    visualBaselineOwnership:'src/v2/styles/visual-identity.css',
    refresh(){
      baseRuntime.refresh?.();
      appShell.refresh();
    },
    destroy(){
      appShell.destroy();
    }
  };

  window.__footmateV3=true;
  window.FootMateV3Runtime=runtime;
  window.FootMateV30={
    version:RELEASE_VERSION,
    previousReleaseVersion:PREVIOUS_RELEASE_VERSION,
    schemaVersion:SCHEMA_VERSION,
    architecture:'v3.0-unified-app-architecture',
    runtimeArchitecture:runtime.architecture,
    appShell:appShell.architecture,
    componentArchitecture:appShell.componentArchitecture,
    componentOwnership:'src/v3/components',
    ia:appShell.ia,
    primaryDestinations:appShell.primaryDestinations,
    primaryDestinationCount:PRIMARY_DESTINATIONS.length,
    preservedLegacyScreens:appShell.preservedLegacyRoutes,
    visualBaseline:'v2.8-matchday',
    legacyVisualReleaseMarker:'2.8',
    stateCompatibility:'v2.1-domain-state-preserved'
  };

  appShell.refresh();
  window.dispatchEvent(new CustomEvent('footmate:v3.0:ready',{
    detail:{
      version:RELEASE_VERSION,
      previousReleaseVersion:PREVIOUS_RELEASE_VERSION,
      schemaVersion:SCHEMA_VERSION,
      mode:runtime.mode,
      architecture:'v3.0-unified-app-architecture',
      primaryDestinations:PRIMARY_DESTINATIONS.length
    }
  }));
  console.info('[FootMate] v3.0 unified app architecture ready',RELEASE_VERSION,runtime.mode);
}

if(window.FootMateV28&&window.FootMateV2Runtime)promote();
else window.addEventListener('footmate:v2.8:ready',promote,{once:true});
