(()=>{
  const root=document.getElementById('footmate-next');
  if(!root)return;
  const key='footmate:v5.1:ai';
  let pending=false;
  const set=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};
  const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
  const summary=result=>{
    const region=String(result?.region||'').replace(/\s*·\s*/g,'·').trim();
    const role=[result?.level,result?.position].filter(Boolean).join(' ');
    if(region&&role)return `${region}에서 조건에 맞는 ${role} 경기를 찾습니다.`;
    if(region)return `${region}에서 조건에 맞는 경기를 찾습니다.`;
    if(role)return `조건에 맞는 ${role} 경기를 찾습니다.`;
    return '조건에 맞는 경기를 찾습니다.';
  };
  const compactConditions=card=>{
    const conditions=card?.querySelector('[data-ai-conditions]');
    if(!conditions)return;
    conditions.style.setProperty('flex-wrap','nowrap','important');
    conditions.style.gap='4px';
    conditions.style.overflow='hidden';
    conditions.querySelectorAll('span').forEach(chip=>{
      chip.style.flex='0 1 auto';
      chip.style.minWidth='0';
      chip.style.padding='4px 5px';
      chip.style.fontSize='9px';
      chip.style.whiteSpace='nowrap';
    });
  };
  function apply(){
    const screen=root.querySelector('[data-screen="home"]');
    if(!screen)return;
    screen.querySelector(':scope > .fm-next-greeting')?.remove();
    screen.querySelector(':scope > .fm-next-topbar [data-action="nav-profile"]')?.remove();
    const card=screen.querySelector('.fm-ai-card[data-ia-role="primary-assistant"]');
    if(!card)return;
    compactConditions(card);
    set(card.querySelector('.fm-ai-head strong'),'AI에게 원하는 경기를 검색해보세요.');
    const connected=card.dataset.aiState==='result'&&card.querySelector('[data-ai-mode]')?.dataset.mode==='connected-ai';
    if(!connected)return;
    const saved=read(),result=saved?.mode==='connected-ai'?saved.result:null;
    if(result){
      const status=card.querySelector('[data-ai-status]');
      set(status?.querySelector('b'),summary(result));
      set(status?.querySelector('span'),'AI가 조건을 해석하고, 추천 순위는 기존 엔진이 계산합니다.');
    }
  }
  const schedule=()=>{
    if(pending)return;
    pending=true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{pending=false;apply()}));
  };
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true,attributes:true,characterData:true,attributeFilter:['data-ai-state','data-mode','data-screen']});
  schedule();
})();
