(function(){
'use strict';

const CANONICAL_KEY='footmate:v2:scenario';
const LEGACY_KEY='footmateRuntimeStateV2';
const SCHEMA_VERSION='2.1.0';

function read(key){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'null');
    return value&&typeof value==='object'&&!Array.isArray(value)?value:null;
  }catch(error){
    console.warn('[FootMate v2.3] scenario persistence bridge read failed',error);
    return null;
  }
}

function write(key,value){
  try{
    localStorage.setItem(key,JSON.stringify(value));
    return true;
  }catch(error){
    console.warn('[FootMate v2.3] scenario persistence bridge write failed',error);
    return false;
  }
}

function finite(value,fallback){
  const number=Number(value);
  return Number.isFinite(number)?number:fallback;
}

function toLegacy(record,current={}){
  const snapshot=record?.state||{};
  const elo=snapshot.eloState||{};
  const profile=snapshot.profile||{};
  const compatibility=record?.compatibility||{};
  const participationMatchKey=snapshot.participationMatchKey||null;

  return{
    ...current,
    currentElo:finite(elo.currentElo,current.currentElo),
    eloBeforeUpdate:finite(elo.eloBeforeUpdate,current.eloBeforeUpdate),
    updatedElo:finite(elo.updatedElo,current.updatedElo),
    eloCommitted:Boolean(elo.eloCommitted),
    result:elo.result||current.result,
    selectedMatchKey:snapshot.selectedMatchKey||current.selectedMatchKey||'suwon',
    participationConfirmed:Boolean(participationMatchKey||current.participationConfirmed),
    participationMatchKey:participationMatchKey||current.participationMatchKey||null,
    answered:Array.isArray(compatibility.answered)
      ?[...compatibility.answered]
      :Array.isArray(current.answered)?[...current.answered]:[],
    profile:{...(current.profile||{}),...profile},
    __v23CanonicalUpdatedAt:Number(record?.updatedAt)||0
  };
}

const canonical=read(CANONICAL_KEY);
const legacy=read(LEGACY_KEY);
const canonicalUpdatedAt=Number(canonical?.updatedAt)||0;
const legacyMarker=Number(legacy?.__v23CanonicalUpdatedAt)||0;
const markerMatches=legacyMarker>0&&legacyMarker===canonicalUpdatedAt;
const canHydrate=Boolean(
  canonical&&
  canonical.schemaVersion===SCHEMA_VERSION&&
  canonical.state&&
  (!legacy||markerMatches)
);

if(canHydrate){
  write(LEGACY_KEY,toLegacy(canonical,legacy||{}));
}

window.FootMateScenarioPersistenceBridge={
  canonicalKey:CANONICAL_KEY,
  legacyKey:LEGACY_KEY,
  schemaVersion:SCHEMA_VERSION,
  hydrated:canHydrate,
  guardedLegacy:Boolean(legacy&&!markerMatches),
  architecture:'v2.3-canonical-to-legacy-hydration-bridge'
};
})();
