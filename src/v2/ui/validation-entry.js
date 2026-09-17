import{ONBOARDING_SCREENS,observeActiveScreen}from'../core/screen-observer.js';

function patchParentHint(mode){
  try{
    if(window.parent===window||window.parent.location.origin!==location.origin)return;
    const hint=window.parent.document.querySelector('.showcase-hint');
    if(!hint)return;
    hint.textContent=mode==='portfolio'
      ?'Portfolio mode · 제품 검증 패널 사용 가능'
      :'Product mode · 실제 사용자 흐름 중심';
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

function configureLauncher(mode){
  const launcher=document.getElementById('v3Launcher');
  if(!launcher)return null;

  launcher.setAttribute('aria-haspopup','dialog');
  launcher.setAttribute('aria-controls','fmProductInspector');
  launcher.setAttribute('aria-label','제품 검증 패널 열기');
  launcher.title='추천 근거 · 운영 정책 · PM 데이터 검증';
  launcher.innerHTML='Portfolio · 제품 검증';
  launcher.onclick=event=>{
    event?.preventDefault?.();
    window.FootMateProductOps?.openInspector?.('recommendation');
  };

  if(mode!=='portfolio'){
    launcher.hidden=true;
    launcher.setAttribute('aria-hidden','true');
  }

  return launcher;
}

export function installValidationEntry({mode='product'}={}){
  hideDuplicateLauncher();
  const launcher=configureLauncher(mode);
  patchParentHint(mode);

  const stop=observeActiveScreen(activeId=>{
    hideDuplicateLauncher();
    const target=configureLauncher(mode)||launcher;
    if(target){
      const hidden=mode!=='portfolio'||ONBOARDING_SCREENS.has(activeId);
      target.hidden=hidden;
      target.setAttribute('aria-hidden',hidden?'true':'false');
    }
    patchParentHint(mode);
  });

  return{stop,refresh:()=>{
    hideDuplicateLauncher();
    configureLauncher(mode);
    patchParentHint(mode);
  }};
}
