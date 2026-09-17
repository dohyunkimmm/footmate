(function(){
'use strict';
if(window.__footmateV11Hotfix)return;
window.__footmateV11Hotfix=true;

const ONBOARDING_SCREENS=new Set([
  's-splash','s-quiz','s-location','s-manual-location','s-elo','s-loading'
]);

function patchParentHint(){
  try{
    if(window.parent===window||window.parent.location.origin!==location.origin)return;
    const hint=window.parent.document.querySelector('.showcase-hint');
    if(!hint)return;
    hint.textContent=hint.textContent.replace('AI 로직','제품 검증').replace('매칭 로직','제품 검증');
  }catch(e){}
}

function patchValidationEntry(){
  const legacy=document.getElementById('v3Launcher');
  const duplicate=document.getElementById('fmProductLauncher');
  const activeId=document.querySelector('.screen.active')?.id||'';
  const hide=ONBOARDING_SCREENS.has(activeId);

  if(duplicate){
    duplicate.hidden=true;
    duplicate.tabIndex=-1;
    duplicate.setAttribute('aria-hidden','true');
  }

  if(legacy){
    legacy.hidden=hide;
    legacy.setAttribute('aria-hidden',hide?'true':'false');
    legacy.setAttribute('aria-haspopup','dialog');
    legacy.setAttribute('aria-controls','fmProductInspector');
    legacy.setAttribute('aria-label','제품 검증 패널 열기');
    legacy.title='추천 근거 · 운영 정책 · PM 데이터 검증';
    legacy.innerHTML='제품 검증';
    legacy.onclick=function(event){
      event?.preventDefault?.();
      if(window.FootMateProductOps?.openInspector){
        window.FootMateProductOps.openInspector('recommendation');
      }
    };
  }

  patchParentHint();
}

const previousGo=window.goScreen;
if(typeof previousGo==='function'){
  window.goScreen=function(){
    const result=previousGo.apply(this,arguments);
    patchValidationEntry();
    return result;
  };
}

patchValidationEntry();
requestAnimationFrame(patchValidationEntry);
})();
