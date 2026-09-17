function modeFromLabel(label=''){
  const text=String(label).trim();
  if(text.includes('모집'))return'open';
  if(text.includes('ELO'))return'elo';
  if(text.includes('5km'))return'distance';
  return'all';
}

function dayKeys(index){
  return Number(index)===0?['suwon','yongin']:Number(index)===2?['seongnam']:['suwon','seongnam','yongin'];
}

export function createHomeController({productStore,scenarioStore}){
  const Core=window.FootMateCore;

  function matchKeyFromText(text){
    const matches=scenarioStore.getState().matches||{};
    for(const [key,match] of Object.entries(matches)){
      if(String(text).includes(match.team)||String(text).includes(match.venue))return key;
    }
    return null;
  }

  function cards(){
    const root=document.getElementById('home-match-list');
    if(!root)return[];
    return[...root.children]
      .filter(el=>el.matches?.('[onclick*="s-detail"],[data-home-match-key]'))
      .map(el=>{
        const key=el.dataset.homeMatchKey||matchKeyFromText(el.textContent||'');
        if(key)el.dataset.homeMatchKey=key;
        return{el,key};
      })
      .filter(item=>item.key);
  }

  function bindMatchCards(){
    for(const {el,key} of cards()){
      el.removeAttribute('onclick');
      el.onclick=null;
      if(el.dataset.v2MatchBound==='true')continue;
      el.dataset.v2MatchBound='true';
      el.tabIndex=el.tabIndex>=0?el.tabIndex:0;
      el.setAttribute('role',el.getAttribute('role')||'button');
      el.addEventListener('click',()=>scenarioStore.navigateToMatch(key,true));
      el.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){
          event.preventDefault();
          scenarioStore.navigateToMatch(key,true);
        }
      });
    }
  }

  function applyFilters(){
    const items=cards();
    if(!items.length)return;
    const product=productStore.getState();
    const scenario=scenarioStore.getState();
    const data=items.map(({key})=>{
      const match=scenario.matches[key];
      return{key,avgElo:Number(match?.avgElo),distanceKm:Number(match?.distanceKm),status:match?.status||'open'};
    });
    const options={keys:dayKeys(product.homeDayIndex),currentElo:Number(scenario.elo)};
    if(product.homeFilterMode==='open')options.openOnly=true;
    if(product.homeFilterMode==='elo')options.maxEloDiff=50;
    if(product.homeFilterMode==='distance')options.maxDistanceKm=5;
    const visible=new Set(Core.filterHomeMatches(data,options).map(item=>item.key));

    for(const {el,key} of items){
      const show=visible.has(key);
      el.hidden=!show;
      el.setAttribute('aria-hidden',show?'false':'true');
    }

    const label=['어제','오늘','내일'][Number(product.homeDayIndex)]||'오늘';
    const heading=document.querySelector('#home-match-list > div:first-child');
    if(heading)heading.textContent=`⚽ ${label} 경기 · ${visible.size}건`;

    let empty=document.getElementById('footmateHomeEmpty');
    if(!empty){
      empty=document.createElement('div');
      empty.id='footmateHomeEmpty';
      empty.className='footmate-home-empty';
      empty.textContent='선택한 홈 필터에 맞는 경기가 없습니다.';
      document.getElementById('home-match-list')?.appendChild(empty);
    }
    empty.hidden=visible.size>0;
  }

  function renderControls(){
    const product=productStore.getState();
    document.querySelectorAll('.day-tab').forEach((button,index)=>{
      const active=index===Number(product.homeDayIndex);
      button.classList.toggle('active-day-tab',active);
      button.style.background=active?'var(--blue)':'transparent';
      button.style.color=active?'#fff':'#66738A';
      button.setAttribute('aria-pressed',active?'true':'false');
    });
    document.querySelectorAll('#home-filter-tabs button').forEach(button=>{
      const active=modeFromLabel(button.textContent)===product.homeFilterMode;
      button.style.background=active?'var(--blue)':'#fff';
      button.style.color=active?'#fff':'var(--txt2)';
      button.style.borderColor=active?'var(--blue)':'var(--border)';
      button.setAttribute('aria-pressed',active?'true':'false');
    });
  }

  function bindControls(){
    document.querySelectorAll('.day-tab').forEach((button,index)=>{
      button.removeAttribute('onclick');
      button.onclick=null;
      if(button.dataset.v2HomeBound==='true')return;
      button.dataset.v2HomeBound='true';
      button.addEventListener('click',()=>{
        productStore.set({homeDayIndex:index},'home-day');
        renderControls();
        applyFilters();
      });
    });
    document.querySelectorAll('#home-filter-tabs button').forEach(button=>{
      button.removeAttribute('onclick');
      button.onclick=null;
      if(button.dataset.v2HomeBound==='true')return;
      button.dataset.v2HomeBound='true';
      button.addEventListener('click',()=>{
        productStore.set({homeFilterMode:modeFromLabel(button.textContent)},'home-filter');
        renderControls();
        applyFilters();
      });
    });
    bindMatchCards();
  }

  function onScreen(screenId){
    if(screenId!=='s-home')return;
    bindControls();
    renderControls();
    applyFilters();
  }

  return{onScreen,bindControls,renderControls,applyFilters,bindMatchCards};
}
