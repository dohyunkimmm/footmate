export const RUNTIME_BOUNDARY_VERSION='2.6.0';

const COMPONENT_OWNERS=Object.freeze({
  coreFunnel:'src/v2/demo/core-funnel-components.js',
  decisionRecovery:'src/v2/demo/decision-recovery-components.js'
});

export function createRuntimeBoundary(){
  return{
    version:RUNTIME_BOUNDARY_VERSION,
    architecture:'v2.6-build-source-component-boundary',
    legacySource:{
      path:'demo-source.html',
      role:'39-screen-regression-fixture',
      mutableForNewFeatures:false
    },
    shell:'demo-shell.html',
    componentOwners:{...COMPONENT_OWNERS},
    compatibility:{
      patchRuntime:'footmate-patches.js',
      role:'legacy-render-adapter-only',
      newFeatureOwnership:false
    }
  };
}
