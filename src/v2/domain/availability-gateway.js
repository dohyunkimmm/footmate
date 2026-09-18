export const AVAILABILITY_GATEWAY_VERSION='2.6.0';

function clone(value){return JSON.parse(JSON.stringify(value))}

export function createAvailabilityGateway({productStore,productOps,now=()=>new Date().toISOString()}={}){
  if(!productStore?.getState)throw new Error('FootMate product store is required');

  function currentMatchKey(){
    try{return productOps?.currentMatchKey?.()||null}catch(error){return null}
  }

  function operationFor(matchKey){
    try{
      const value=productOps?.operation?.(matchKey);
      if(value)return value;
    }catch(error){}
    const state=productStore.getState();
    return state.operationByMatch?.[matchKey]||{match:'open',payment:'idle',participation:'available',history:[]};
  }

  function read(matchKey=currentMatchKey()||'suwon'){
    const operation=operationFor(matchKey);
    const match=operation.match||'open';
    return clone({
      version:AVAILABILITY_GATEWAY_VERSION,
      architecture:'v2.6-availability-verification-boundary',
      matchKey,
      operation:{
        match,
        payment:operation.payment||'idle',
        participation:operation.participation||'available'
      },
      capacity:match==='full'?'full':match==='open'?'available':'unavailable',
      freshness:{
        source:'prototype-session',
        realtime:false,
        serverVerified:false,
        checkedAt:now()
      }
    });
  }

  async function verify(matchKey){
    // Async by contract so a server-backed verifier can replace the prototype
    // session adapter without changing decision/payment callers.
    return read(matchKey);
  }

  return{
    version:AVAILABILITY_GATEWAY_VERSION,
    architecture:'v2.6-availability-verification-boundary',
    realtime:false,
    read,
    verify
  };
}
