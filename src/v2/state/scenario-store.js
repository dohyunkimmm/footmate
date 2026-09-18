export function createScenarioStore(adapter,{matchEngine,eloEngine,presenter}={}){
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

  function present(screenId,value=clone(state)){
    if(presenter?.owns?.(screenId))presenter.render(screenId,value);
    return value;
  }

  function setFilter(patch){
    adapter.setFilter?.(patch);
    const value=sync('filter');
    present('s-filter',value);
    present('s-results',value);
    return value;
  }

  function setDistance(value){
    adapter.setDistance?.(value);
    const next=sync('distance');
    present('s-filter',next);
    present('s-results',next);
    return next;
  }

  function selectMatch(key){
    if(!state.matches?.[key])return false;
    adapter.setSelectedMatch?.(key);
    state={
      ...state,
      selectedMatchKey:key,
      selectedScenario:cloneMatch(state.matches[key])
    };
    const value=emit('selected-match');
    present('s-reason',value);
    return true;
  }

  function navigateToMatch(key,detail=true){
    if(!selectMatch(key))return false;
    window.goScreen?.(detail?'s-detail':'s-reason');
    return true;
  }

  function renderForScreen(screenId){
    if(!presenter?.owns?.(screenId)){
      adapter.renderForScreen?.(screenId,state.selectedMatchKey);
    }
    const value=sync('screen',{preserveSelected:true});
    present(screenId,value);
    return value;
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
    presentationArchitecture:presenter?.architecture||'adapter-render-compatibility',
    presenterOwnedScreens:Array.isArray(presenter?.ownedScreens)?[...presenter.ownedScreens]:[],
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
