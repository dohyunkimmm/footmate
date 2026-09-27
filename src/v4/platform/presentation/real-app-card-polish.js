const root=document.getElementById('footmate-next');

function isRealApp(){
  return document.documentElement.dataset.footmateSurface==='real';
}

function removeDuplicateAiCoreLabel(card){
  const label=card.querySelector('[data-ai-core-label]');
  if(!label||label.hidden)return;
  label.textContent='';
  label.hidden=true;
  label.setAttribute('aria-hidden','true');
}

function polishRealAppHome(){
  if(!root||!isRealApp())return;
  const home=root.querySelector('[data-screen="home"]');
  if(!home)return;
  home.querySelectorAll('[data-ai-assistant]').forEach(removeDuplicateAiCoreLabel);
}

if(root&&isRealApp()){
  const observer=new MutationObserver(polishRealAppHome);
  observer.observe(root,{childList:true,subtree:true});
  polishRealAppHome();
  queueMicrotask(polishRealAppHome);
}
