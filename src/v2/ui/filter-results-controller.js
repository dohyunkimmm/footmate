export function createFilterResultsController({scenarioStore}){
  function bindFilterButtons(){
    document.querySelectorAll('#s-filter .filter-pill').forEach(button=>{
      button.removeAttribute('onclick');
      button.onclick=null;
      if(button.dataset.v2FilterBound==='true')return;
      button.dataset.v2FilterBound='true';
      button.addEventListener('click',()=>{
        const patch={};
        if(button.dataset.timeKey)patch.time=button.dataset.timeKey;
        if(button.dataset.skillKey)patch.matchSkill=Number(button.dataset.skillKey);
        if(button.dataset.formatKey)patch.format=button.dataset.formatKey;
        scenarioStore.setFilter(patch);
        bindResultCards();
      });
    });

    const distance=document.getElementById('distanceRange');
    if(distance){
      distance.removeAttribute('oninput');
      distance.oninput=null;
      if(distance.dataset.v2DistanceBound!=='true'){
        distance.dataset.v2DistanceBound='true';
        distance.addEventListener('input',()=>{
          scenarioStore.setDistance(distance.value);
          bindResultCards();
        });
      }
    }
  }

  function bindResultCards(){
    document.querySelectorAll('#s-results [data-match-card]').forEach(card=>{
      const key=card.dataset.matchCard;
      card.removeAttribute('onclick');
      card.onclick=null;
      if(card.dataset.v2ResultBound==='true')return;
      card.dataset.v2ResultBound='true';
      card.tabIndex=card.tabIndex>=0?card.tabIndex:0;
      card.setAttribute('role',card.getAttribute('role')||'button');
      const open=()=>scenarioStore.navigateToMatch(key,true);
      card.addEventListener('click',open);
      card.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();open()}
      });
    });
  }

  function onScreen(screenId){
    if(screenId==='s-filter')bindFilterButtons();
    if(screenId==='s-results')bindResultCards();
  }

  return{onScreen,bindFilterButtons,bindResultCards};
}
