export const VIEW_STATE_VERSION='3.0.0';
export const VIEW_STATE_KEY='footmate:v3:view';

function safeRead(){
  try{
    const parsed=JSON.parse(localStorage.getItem(VIEW_STATE_KEY)||'null');
    if(parsed?.version===VIEW_STATE_VERSION&&typeof parsed.activeDestination==='string')return parsed;
  }catch(error){}
  return null;
}

export function createViewState(initialDestination='discover'){
  let state=safeRead()||{version:VIEW_STATE_VERSION,activeDestination:initialDestination};
  const listeners=new Set();

  function persist(){
    try{localStorage.setItem(VIEW_STATE_KEY,JSON.stringify(state))}catch(error){}
  }

  function update(patch,reason='view'){
    const next={...state,...patch,version:VIEW_STATE_VERSION};
    if(JSON.stringify(next)===JSON.stringify(state))return state;
    state=next;
    persist();
    listeners.forEach(listener=>listener(state,reason));
    return state;
  }

  persist();
  return{
    version:VIEW_STATE_VERSION,
    key:VIEW_STATE_KEY,
    getState:()=>({...state}),
    setActiveDestination(activeDestination,reason='navigation'){
      return update({activeDestination},reason);
    },
    subscribe(listener){
      listeners.add(listener);
      return()=>listeners.delete(listener);
    },
    clear(){
      try{localStorage.removeItem(VIEW_STATE_KEY)}catch(error){}
      state={version:VIEW_STATE_VERSION,activeDestination:initialDestination};
      listeners.forEach(listener=>listener(state,'clear'));
    }
  };
}
