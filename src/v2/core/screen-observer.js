export const ONBOARDING_SCREENS=new Set([
  's-splash','s-quiz','s-location','s-manual-location','s-elo','s-loading'
]);

export function getActiveScreenId(){
  return document.querySelector('.screen.active')?.id||'';
}

export function observeActiveScreen(listener){
  if(typeof listener!=='function')throw new TypeError('listener must be a function');

  let current='';
  const emit=()=>{
    const next=getActiveScreenId();
    if(next===current)return;
    const previous=current;
    current=next;
    listener(next,previous);
  };

  const root=document.querySelector('.device-screen')||document.body;
  const observer=new MutationObserver(records=>{
    if(records.some(record=>record.type==='attributes'&&record.attributeName==='class'))emit();
  });

  observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class']});
  emit();

  return()=>observer.disconnect();
}
