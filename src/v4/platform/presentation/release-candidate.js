import {releaseCandidateGate} from '../application/release-candidate.js';

const root=document.getElementById('footmate-next');
document.documentElement.dataset.footmateRcVersion=releaseCandidateGate.version;
if(root){
  root.dataset.releaseCandidateVersion=releaseCandidateGate.version;
  root.dataset.providerContract=releaseCandidateGate.providerMode;
  root.dataset.v5Readiness=releaseCandidateGate.readyForV5?'contract-ready':'blocked';
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
