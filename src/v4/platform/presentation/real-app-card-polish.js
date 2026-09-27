const root=document.getElementById('footmate-next');

function isRealApp(){
  return document.documentElement.dataset.footmateSurface==='real';
}

function moveDistanceIntoScheduleMeta(card){
  const schedule=card.querySelector('.fm-next-match-date > span:first-child');
  if(!schedule)return;
  const distance=[...card.querySelectorAll('.fm-next-match-tags .fm-next-tag')]
    .find(tag=>/^\d+\s*분$/.test((tag.textContent||'').trim()));
  if(!distance)return;
  const value=(distance.textContent||'').trim();
  if(value&&!schedule.textContent.split('·').map(part=>part.trim()).includes(value)){
    schedule.textContent=`${schedule.textContent.trim()} · ${value}`;
  }
  distance.remove();
}

function removeDuplicateAiCoreLabel(card){
  const label=card.querySelector('[data-ai-core-label]');
  if(!label||label.hidden)return;
  label.textContent='';
  label.hidden=true;
  label.setAttribute('aria-hidden','true');
}

function polishRealAppCards(){
  if(!root||!isRealApp())return;
  root.querySelectorAll('.fm-next-match-card').forEach(moveDistanceIntoScheduleMeta);
  root.querySelectorAll('[data-ai-assistant]').forEach(removeDuplicateAiCoreLabel);
}

if(root&&isRealApp()){
  const observer=new MutationObserver(polishRealAppCards);
  observer.observe(root,{childList:true,subtree:true});
  polishRealAppCards();
  queueMicrotask(polishRealAppCards);
}
