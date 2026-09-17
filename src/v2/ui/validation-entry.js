import{ONBOARDING_SCREENS,observeActiveScreen}from'../core/screen-observer.js';

function patchParentHint(){
  try{
    if(window.parent===window||window.parent.location.origin!==location.origin)return;
    const hint=window.parent.document.querySelector('.showcase-hint');
    if(!hint)return;
    hint.textContent=hint.textContent
      .replace('AI 로직','제품 검증')
      .replace('매칭 로직','제품 검증');
  }catch(error){
    // Cross-frame access is optional in standalone demo mode.
  }
}

function hideDuplicateLauncher(){
  const duplicate=document.getElementById('fmProductLauncher');
  if(!duplicate)return;
  duplicate.hidden=true;
  duplicate.tabIndex=-1;
  duplicate.setAttribute('aria-hidden','true');
}

function configureLauncher(){
  const launcher=document.getElementById('v3Launcher');
  if(!launcher)return null;

  launcher.setAttribute('aria-haspopup','dialog');
  launcher.setAttribute('aria-controls','fmProductInspector');
  launcher.setAttribute('aria-label','제품 검증 패널 열기');
  launcher.title='추천 근거 · 운영 정책 · PM 데이터 검증';
  launcher.innerHTML='제품 검증';
  launcher.onclick=event=>{
    event?.preventDefault?.();
    window.FootMateProductOps?.openInspector?.('recommendation');
  };

  return launcher;
}

export function installValidationEntry(){
  hideDuplicateLauncher();
  const launcher=configureLauncher();
  patchParentHint();

  const stop=observeActiveScreen(activeId=>{
    hideDuplicateLauncher();
    const target=configureLauncher()||launcher;
    if(target){
      const hidden=ONBOARDING_SCREENS.has(activeId);
      target.hidden=hidden;
      target.setAttribute('aria-hidden',hidden?'true':'false');
    }
    patchParentHint();
  });

  return{stop,refresh:()=>{
    hideDuplicateLauncher();
    configureLauncher();
    patchParentHint();
  }};
}
