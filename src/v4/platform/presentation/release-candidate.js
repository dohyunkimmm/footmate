import {releaseCandidateGate} from '../application/release-candidate.js';

const root=document.getElementById('footmate-next');
document.documentElement.dataset.footmateRcVersion=releaseCandidateGate.version;
if(root){
  root.dataset.releaseCandidateVersion=releaseCandidateGate.version;
  root.dataset.providerContract=releaseCandidateGate.providerMode;
  root.dataset.v5Readiness=releaseCandidateGate.readyForV5?'contract-ready':'blocked';
}

function hardenSetupAccessibility(){
  const indicator=root?.querySelector('.fm-next-step-indicator[aria-label]');
  if(!indicator)return;
  const label=indicator.getAttribute('aria-label')||'';
  const progress=label.match(/(\d+)\/(\d+)/);
  indicator.setAttribute('role','progressbar');
  indicator.setAttribute('aria-label','설정 진행');
  indicator.setAttribute('aria-valuemin','1');
  if(progress){indicator.setAttribute('aria-valuenow',progress[1]);indicator.setAttribute('aria-valuemax',progress[2]);}
}

function removeTargetBrandTagline(){
  const screen=root?.querySelector('[data-screen]');
  if(!screen||!['home','discover','profile'].includes(screen.dataset.screen))return;
  const tagline=screen.querySelector('.fm-next-brand small');
  if(tagline?.textContent.trim()==='내 경기의 시작부터 끝까지')tagline.remove();
}

function syncPresentation(){
  hardenSetupAccessibility();
  removeTargetBrandTagline();
}

if(root){
  syncPresentation();
  new MutationObserver(syncPresentation).observe(root,{childList:true,subtree:true});
}

window.__FOOTMATE_RELEASE_CANDIDATE__=Object.freeze({
  version:releaseCandidateGate.version,
  readyForV5:releaseCandidateGate.readyForV5,
  providerMode:releaseCandidateGate.providerMode,
  externalProviders:releaseCandidateGate.externalProviders,
  externalAnalytics:releaseCandidateGate.externalAnalytics,
  performanceBudget:releaseCandidateGate.performanceBudget,
  rehearseMigration:candidate=>releaseCandidateGate.rehearseMigration(candidate)
});
