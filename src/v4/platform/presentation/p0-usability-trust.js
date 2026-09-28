const root=document.getElementById('footmate-next');
const P0_USABILITY_TRUST_VERSION='1.0.0';
const WELCOME_AI_COPY='AI가 원하는 조건을 해석해, 맞는 경기를 빠르게 찾게 도와줘요.';

function isRealApp(){
  return document.documentElement.dataset.footmateSurface==='real';
}

function ensureTouchTargetStyles(){
  if(document.getElementById('fm-p0-usability-trust'))return;
  const style=document.createElement('style');
  style.id='fm-p0-usability-trust';
  style.textContent=`
.fm-next-page[data-mode="real"] :is(.fm-ai-examples button,.fm-discovery-chip,.fm-discovery-clear){min-height:44px;min-block-size:44px}
.fm-next-page[data-mode="real"] .fm-release-team-head button{width:44px;min-width:44px;height:44px;min-height:44px}
`;
  document.head.append(style);
}

function alignWelcomeAiRole(){
  const copy=root?.querySelector('[data-screen="welcome"] [data-welcome-ai-copy]');
  if(!copy)return;
  if(copy.textContent!==WELCOME_AI_COPY)copy.textContent=WELCOME_AI_COPY;
  if(copy.dataset.aiRoleAligned!=='true')copy.dataset.aiRoleAligned='true';
}

function applyP0UsabilityTrust(){
  if(!root||!isRealApp())return;
  ensureTouchTargetStyles();
  alignWelcomeAiRole();
  root.dataset.p0UsabilityTrustVersion=P0_USABILITY_TRUST_VERSION;
}

if(root){
  const observer=new MutationObserver(applyP0UsabilityTrust);
  observer.observe(root,{childList:true,subtree:true});
  applyP0UsabilityTrust();
  queueMicrotask(applyP0UsabilityTrust);
}

window.__FOOTMATE_P0_USABILITY_TRUST__=Object.freeze({
  version:P0_USABILITY_TRUST_VERSION,
  minimumTouchTarget:44,
  welcomeAiRole:'natural-language constraint interpretation',
  rankingOwner:'deterministic recommendation engine',
  welcomeCopy:WELCOME_AI_COPY
});
