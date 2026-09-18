import{createStorage}from'../core/storage.js';

const SCHEMA_VERSION='2.1.0';
const CANDIDATE_VERSION='2.3.0';
const LEGACY_KEY='footmateRuntimeStateV2';

function readLegacy(){
  try{
    const value=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');
    return value&&typeof value==='object'&&!Array.isArray(value)?value:null;
  }catch(error){
    console.warn('[FootMate v2.3] legacy scenario storage read failed',error);
    return null;
  }
}

function cloneState(value={}){
  return{
    selectedMatchKey:value.selectedMatchKey||null,
    profile:{...(value.profile||{})},
    elo:Number(value.elo),
    eloState:{...(value.eloState||{})},
    participationMatchKey:value.participationMatchKey||null
  };
}

function stablePayload(value={}){
  const state=cloneState(value);
  return JSON.stringify({
    selectedMatchKey:state.selectedMatchKey,
    profile:state.profile,
    elo:state.elo,
    eloState:state.eloState,
    participationMatchKey:state.participationMatchKey
  });
}

export function createScenarioPersistence(scenarioStore){
  if(!scenarioStore?.getState||!scenarioStore?.subscribe){
    throw new Error('FootMate scenario store is required');
  }

  const storage=createStorage('scenario');
  let lastPayload='';
  let stop=()=>{};

  function persist(value=scenarioStore.getState(),reason='sync'){
    const payload=stablePayload(value);
    if(payload===lastPayload)return storage.read(null);

    const legacy=readLegacy();
    const updatedAt=Date.now();
    const record={
      schemaVersion:SCHEMA_VERSION,
      candidateVersion:CANDIDATE_VERSION,
      reason,
      updatedAt,
      state:cloneState(value),
      compatibility:{
        answered:Array.isArray(legacy?.answered)?[...legacy.answered]:[]
      }
    };

    storage.write(record);
    lastPayload=payload;

    if(legacy){
      try{
        localStorage.setItem(LEGACY_KEY,JSON.stringify({
          ...legacy,
          __v23CanonicalUpdatedAt:updatedAt
        }));
      }catch(error){
        console.warn('[FootMate v2.3] legacy scenario marker write failed',error);
      }
    }

    return record;
  }

  function start(){
    const current=storage.read(null);
    if(current?.state)lastPayload=stablePayload(current.state);
    persist(scenarioStore.getState(),'bootstrap');
    stop=scenarioStore.subscribe((value,reason)=>persist(value,reason));
    return api;
  }

  function clear(){
    storage.clear();
    lastPayload='';
  }

  function destroy(){
    stop();
    stop=()=>{};
  }

  const api={
    key:storage.key,
    legacyKey:LEGACY_KEY,
    schemaVersion:SCHEMA_VERSION,
    candidateVersion:CANDIDATE_VERSION,
    architecture:'v2.3-scenario-persistence-migration',
    getRecord:()=>storage.read(null),
    persist,
    start,
    clear,
    destroy
  };

  return api;
}
