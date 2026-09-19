import{installVisualIdentityExperience}from'./ui/visual-identity-experience.js';

const RELEASE_VERSION='2.8.0';
const PREVIOUS_RELEASE_VERSION='2.7.0';
const SCHEMA_VERSION='2.1.0';

function promote(){
  if(window.FootMateV28)return;
  const runtime=window.FootMateV2Runtime;
  if(!runtime)return;

  const visualIdentity=installVisualIdentityExperience();
  document.documentElement.dataset.footmateRelease='2.8';
  document.documentElement.dataset.footmateVisualIdentity='matchday';

  for(const key of ['FootMateV22','FootMateV23','FootMateV24','FootMateV25','FootMateV26']){
    if(window[key])window[key].currentReleaseVersion=RELEASE_VERSION;
  }
  if(window.FootMateV27){
    window.FootMateV27.currentReleaseVersion=RELEASE_VERSION;
    window.FootMateV27.compatibility=true;
  }

  const previousRefresh=runtime.refresh?.bind(runtime);
  const previousDestroy=runtime.destroy?.bind(runtime);
  runtime.version=RELEASE_VERSION;
  runtime.releaseArchitecture='v2.8-visual-identity';
  runtime.previousReleaseArchitecture='v2.7-visual-experience';
  runtime.visualOwnership='src/v2/styles/visual-identity.css';
  runtime.visualTokenOwnership='src/v2/styles/visual-tokens.css';
  runtime.visualIdentity=visualIdentity;
  runtime.controllers=runtime.controllers||{};
  runtime.controllers.visualIdentity=visualIdentity;
  runtime.refresh=function(){
    previousRefresh?.();
    visualIdentity.refresh();
  };
  runtime.destroy=function(){
    visualIdentity.destroy();
    previousDestroy?.();
  };

  window.FootMateV28={
    version:RELEASE_VERSION,
    previousReleaseVersion:PREVIOUS_RELEASE_VERSION,
    schemaVersion:SCHEMA_VERSION,
    visualTokenOwnership:'src/v2/styles/visual-tokens.css',
    visualOwnership:'src/v2/styles/visual-identity.css',
    visualExperience:visualIdentity.architecture,
    identity:visualIdentity.identity,
    ownedScreens:[...visualIdentity.ownedScreens],
    preservedScreens:39,
    caseStudySlides:16,
    baselineArchitecture:'v2.7-visual-experience',
    architecture:'v2.8-visual-identity'
  };

  visualIdentity.refresh();
  window.dispatchEvent(new CustomEvent('footmate:v2.8:ready',{
    detail:{
      version:RELEASE_VERSION,
      previousReleaseVersion:PREVIOUS_RELEASE_VERSION,
      schemaVersion:SCHEMA_VERSION,
      mode:runtime.mode,
      identity:'matchday',
      visualOwnership:'src/v2/styles/visual-identity.css'
    }
  }));
  console.info('[FootMate] v2.8 visual identity ready',RELEASE_VERSION,runtime.mode);
}

if(window.__footmateV2&&window.FootMateV2Runtime)promote();
else window.addEventListener('footmate:v2:ready',promote,{once:true});
