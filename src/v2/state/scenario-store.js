export function createScenarioStore(adapter,{matchEngine,eloEngine}={}){
  if(!adapter?.snapshot)throw new Error('FootMate scenario adapter is required');
  const listeners=new Set();

  function derive(snapshot){
    return matchEngine?.derive?matchEngine.derive(snapshot):snapshot;
  }

  function cloneMatch(value){
    if(!value)return null;
    return{
      ...value,
      formats:Array.isArray(value.formats)?[...value.formats]:[],
      positions:Array.isArray(value.positions)?[...value.positions]:[],
      eligibility:{...(value.eligibility||{})}
    };
  }

  function clone(value){
    return{
      ...value,
      profile:{...(value.profile||{})},
      eloState:{...(value.eloState||{})},
      weights:{...(value.weights||{})},
      matches:Object.fromEntries(Object.entries(value.matches||{}).map(([key,item])=>[key,cloneMatch(item)])),
      rankedMatches:Array.isArray(value.rankedMatches)?value.rankedMatches.map(cloneMatch):[],
      selectedScenario:cloneMatch(value.selectedScenario)
    };
  }

  let state=derive(adapter.snapshot());

  function emit(reason='sync'){
    const value=clone(state);
    for(const listener of listeners)listener(value,reason);
    return value;
  }

  function sync(reason='adapter-sync',{preserveSelected=false}={}){
    const next=adapter.snapshot();
    if(preserveSelected&&state.selectedMatchKey)next.selectedMatchKey=state.selectedMatchKey;
    state=derive(next);
    return emit(reason);
  }

  function setFilter(patch){
    adapter.setFilter?.(patch);
    return sync('filter');
  }

  function setDistance(value){
    adapter.setDistance?.(value);
    return sync('distance');
  }

  function selectMatch(key){
    if(!state.matches?.[key])return false;
    adapter.setSelectedMatch?.(key);
    state={
      ...state,
      selectedMatchKey:key,
      selectedScenario:cloneMatch(state.matches[key])
    };
    emit('selected-match');
    return true;
  }

  function navigateToMatch(key,detail=true){
    if(!selectMatch(key))return false;
    window.goScreen?.(detail?'s-detail':'s-reason');
    return true;
  }

  function renderForScreen(screenId){
    adapter.renderForScreen?.(screenId,state.selectedMatchKey);
    return sync('screen',{preserveSelected:true});
  }

  function getSelectedScenario(){
    return cloneMatch(state.selectedScenario||state.matches?.[state.selectedMatchKey]);
  }

  function previewElo(result){
    const scenario=getSelectedScenario();
    if(!scenario||!eloEngine?.preview)return null;
    return eloEngine.preview({
      eloState:state.eloState||{currentElo:state.elo,initialElo:state.elo},
      opponentElo:scenario.avgElo,
      result
    });
  }

  function subscribe(listener){
    if(typeof listener!=='function')return()=>{};
    listeners.add(listener);
    return()=>listeners.delete(listener);
  }

  return{
    architecture:matchEngine?'v2.1-domain-derived-store':'adapter-derived-store',
    getState:()=>clone(state),
    getSelectedScenario,
    getRankedMatches:()=>clone(state).rankedMatches,
    previewElo,
    sync,
    setFilter,
    setDistance,
    selectMatch,
    navigateToMatch,
    renderForScreen,
    subscribe
  };
}
