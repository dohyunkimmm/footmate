import {releaseCandidateGate} from '../application/release-candidate.js';

const root=document.getElementById('footmate-next');
const HOME_POLISH_STYLE_ID='fm-real-home-polish';
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

function ensureHomePolishStyle(){
  if(document.getElementById(HOME_POLISH_STYLE_ID))return;
  const style=document.createElement('style');
  style.id=HOME_POLISH_STYLE_ID;
  style.textContent=`
    .fm-next-page[data-mode="real"] [data-screen="home"] .fm-home-ai-search-title{font-size:0!important;line-height:1.35!important}
    .fm-next-page[data-mode="real"] [data-screen="home"] .fm-home-ai-search-title::after{content:"AI에게 원하는 경기를 검색해보세요.";display:block;font-size:18px;line-height:1.35;letter-spacing:-.035em}
    .fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions{display:flex!important;flex-wrap:nowrap!important;gap:3px!important;white-space:nowrap}
    .fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions span{flex:0 0 auto;min-width:0;padding:4px 5px!important;font-size:9px!important;letter-spacing:-.04em}
  `;
  document.head.append(style);
}

function polishRealHome(){
  const screen=root?.querySelector('.fm-next-page[data-mode="real"] [data-screen="home"]');
  if(!screen)return;
  screen.querySelector(':scope > .fm-next-greeting')?.remove();
  const profileAction=screen.querySelector(':scope > .fm-next-topbar [data-action="nav-profile"]');
  if(profileAction){
    const spacer=document.createElement('span');
    spacer.style.width='44px';
    spacer.style.flex='0 0 44px';
    spacer.setAttribute('aria-hidden','true');
    spacer.dataset.homeTopbarSpacer='';
    profileAction.replaceWith(spacer);
  }
  const title=screen.querySelector('.fm-ai-card[data-ia-role="primary-assistant"] .fm-ai-head strong,.fm-ai-card[data-ai-assistant] .fm-ai-head strong');
  if(!title)return;
  title.classList.add('fm-home-ai-search-title');
  title.setAttribute('aria-label','AI에게 원하는 경기를 검색해보세요.');
}

function enhancePresentation(){
  hardenSetupAccessibility();
  polishRealHome();
}

if(root){
  ensureHomePolishStyle();
  enhancePresentation();
  new MutationObserver(enhancePresentation).observe(root,{childList:true,subtree:true});
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
