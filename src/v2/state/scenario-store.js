export function createScenarioStore(adapter){
  if(!adapter?.snapshot)throw new Error('FootMate scenario adapter is required');
  const listeners=new Set();
  let state=adapter.snapshot();

  function clone(value){
    return{
      ...value,
      profile:{...(value.profile||{})},
      matches:Object.fromEntries(Object.entries(value.matches||{}).map(([key,item])=>[key,{...item}]))
    };
  }

  function emit(reason='sync'){
    const value=clone(state);
    for(const listener of listeners)listener(value,reason);
    return value;
  }

  function sync(reason='legacy-sync',{preserveSelected=false}={}){
    const next=adapter.snapshot();
    if(preserveSelected&&state.selectedMatchKey)next.selectedMatchKey=state.selectedMatchKey;
    state=next;
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
    state={...state,selectedMatchKey:key};
    adapter.setSelectedMatch?.(key);
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

  function subscribe(listener){
    if(typeof listener!=='function')return()=>{};
    listeners.add(listener);
    return()=>listeners.delete(listener);
  }

  return{
    getState:()=>clone(state),
    sync,
    setFilter,
    setDistance,
    selectMatch,
    navigateToMatch,
    renderForScreen,
    subscribe
  };
}
