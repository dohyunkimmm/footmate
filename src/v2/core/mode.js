export function resolveMode(search=location.search){
  const requested=new URLSearchParams(search).get('mode');
  return requested==='portfolio'?'portfolio':'product';
}

export function applyMode(mode){
  const resolved=mode==='portfolio'?'portfolio':'product';
  document.documentElement.dataset.footmateMode=resolved;

  const onboarding=document.getElementById('demoOnboarding');
  if(onboarding&&resolved==='product'){
    onboarding.hidden=true;
    onboarding.setAttribute('aria-hidden','true');
  }

  return resolved;
}
