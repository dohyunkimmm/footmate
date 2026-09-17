export function createProductStore(finalRuntime){
  if(!finalRuntime?.state)throw new Error('FootMate final runtime state is required');
  const state=finalRuntime.state;
  const listeners=new Set();

  function snapshot(){
    return{
      ...state,
      paidMatchKeys:[...(state.paidMatchKeys||[])],
      favoriteMatchKeys:[...(state.favoriteMatchKeys||[])],
      friendIds:[...(state.friendIds||[])],
      chatMessages:[...(state.chatMessages||[])],
      operationByMatch:{...(state.operationByMatch||{})},
      pmEvents:[...(state.pmEvents||[])]
    };
  }

  function emit(reason='sync'){
    const value=snapshot();
    for(const listener of listeners)listener(value,reason);
    return value;
  }

  function persist(reason='update'){
    finalRuntime.persist?.();
    return emit(reason);
  }

  function set(patch,reason='update'){
    if(typeof patch==='function'){
      const next=patch(snapshot());
      if(next&&typeof next==='object')Object.assign(state,next);
    }else if(patch&&typeof patch==='object'){
      Object.assign(state,patch);
    }
    return persist(reason);
  }

  function update(mutator,reason='update'){
    if(typeof mutator==='function')mutator(state);
    return persist(reason);
  }

  function subscribe(listener){
    if(typeof listener!=='function')return()=>{};
    listeners.add(listener);
    return()=>listeners.delete(listener);
  }

  return{
    state,
    getState:snapshot,
    set,
    update,
    persist,
    sync:emit,
    subscribe,
    renderCredit:()=>finalRuntime.renderCredit?.(),
    cost:Number(finalRuntime.cost)||17000,
    storeKey:finalRuntime.storeKey
  };
}
