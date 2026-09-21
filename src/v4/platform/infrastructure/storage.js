import {STORAGE_KEYS,LEGACY_STORAGE_KEYS} from '../domain/contracts.js';

const STORAGE_BRIDGE_FLAG=Symbol.for('footmate.storage.compatibility.v1');
const storagePairs=Object.freeze(Object.keys(STORAGE_KEYS).map(name=>Object.freeze({name,canonical:STORAGE_KEYS[name],legacy:LEGACY_STORAGE_KEYS[name]})));
const storagePairByKey=new Map(storagePairs.flatMap(pair=>[[pair.canonical,pair],[pair.legacy,pair]]));

function safeJsonParse(value,fallback){
  try{return value===null||value===undefined?fallback:JSON.parse(value)}catch(_error){return fallback}
}

export function installBrowserStorageCompatibility(storage=globalThis.localStorage){
  const StorageCtor=globalThis.Storage;
  const proto=StorageCtor?.prototype;
  if(!storage||!proto)return Object.freeze({installed:false,reused:false,pairs:storagePairs.length});
  if(proto[STORAGE_BRIDGE_FLAG])return Object.freeze({installed:false,reused:true,pairs:storagePairs.length});

  const originalGet=proto.getItem;
  const originalSet=proto.setItem;
  const originalRemove=proto.removeItem;
  const localStorageRef=storage;

  proto.getItem=function(key){
    if(this!==localStorageRef)return originalGet.call(this,key);
    const pair=storagePairByKey.get(String(key));
    if(!pair)return originalGet.call(this,key);
    const canonical=originalGet.call(this,pair.canonical);
    if(canonical!==null)return canonical;
    const legacy=originalGet.call(this,pair.legacy);
    if(legacy!==null){
      try{originalSet.call(this,pair.canonical,legacy)}catch(_error){}
    }
    return legacy;
  };

  proto.setItem=function(key,value){
    if(this!==localStorageRef)return originalSet.call(this,key,value);
    const pair=storagePairByKey.get(String(key));
    if(!pair)return originalSet.call(this,key,value);
    originalSet.call(this,pair.canonical,value);
    try{originalSet.call(this,pair.legacy,value)}catch(_error){}
  };

  proto.removeItem=function(key){
    if(this!==localStorageRef)return originalRemove.call(this,key);
    const pair=storagePairByKey.get(String(key));
    if(!pair)return originalRemove.call(this,key);
    originalRemove.call(this,pair.canonical);
    try{originalRemove.call(this,pair.legacy)}catch(_error){}
  };

  Object.defineProperty(proto,STORAGE_BRIDGE_FLAG,{value:Object.freeze({originalGet,originalSet,originalRemove}),configurable:false,enumerable:false,writable:false});
  return Object.freeze({installed:true,reused:false,pairs:storagePairs.length});
}

export function createBrowserStorageProvider(storage=globalThis.localStorage){
  return Object.freeze({
    get(key){try{return storage?.getItem?.(key)??null}catch(_error){return null}},
    set(key,value){try{storage?.setItem?.(key,String(value));return true}catch(_error){return false}},
    remove(key){try{storage?.removeItem?.(key);return true}catch(_error){return false}}
  });
}

export function createMemoryStorageProvider(seed={}){
  const map=new Map(Object.entries(seed).map(([key,value])=>[key,String(value)]));
  return Object.freeze({
    get:key=>map.has(key)?map.get(key):null,
    set(key,value){map.set(key,String(value));return true},
    remove(key){map.delete(key);return true},
    snapshot:()=>Object.fromEntries(map.entries())
  });
}

export function createJsonRepository(provider,key,{legacyKey=null,mirrorLegacy=true}={}){
  if(!provider||typeof provider.get!=='function'||typeof provider.set!=='function'||typeof provider.remove!=='function')throw new TypeError('Storage provider must implement get/set/remove');
  const migrateLegacy=()=>{
    const canonical=provider.get(key);
    const legacy=legacyKey?provider.get(legacyKey):null;
    if(canonical!==null){
      const mirroredLegacy=Boolean(mirrorLegacy&&legacyKey&&legacy===null&&provider.set(legacyKey,canonical));
      return Object.freeze({key,legacyKey,source:'canonical',migrated:false,mirroredLegacy});
    }
    if(legacyKey&&legacy!==null){
      const migrated=Boolean(provider.set(key,legacy));
      return Object.freeze({key,legacyKey,source:'legacy',migrated,mirroredLegacy:false});
    }
    return Object.freeze({key,legacyKey,source:'empty',migrated:false,mirroredLegacy:false});
  };
  return Object.freeze({
    key,
    legacyKey,
    migrateLegacy,
    read(fallback=null){
      let raw=provider.get(key);
      if(raw===null&&legacyKey){
        raw=provider.get(legacyKey);
        if(raw!==null)provider.set(key,raw);
      }
      return safeJsonParse(raw,fallback);
    },
    write(value){
      const raw=JSON.stringify(value);
      provider.set(key,raw);
      if(mirrorLegacy&&legacyKey)provider.set(legacyKey,raw);
      return value;
    },
    update(mutator,fallback={}){const current=this.read(fallback);const next=mutator(current);return this.write(next)},
    clear(){provider.remove(key);if(legacyKey)provider.remove(legacyKey)}
  });
}

export function createRepositories(provider=createBrowserStorageProvider()){
  return Object.freeze({
    session:createJsonRepository(provider,STORAGE_KEYS.session,{legacyKey:LEGACY_STORAGE_KEYS.session}),
    discovery:createJsonRepository(provider,STORAGE_KEYS.discovery,{legacyKey:LEGACY_STORAGE_KEYS.discovery}),
    decision:createJsonRepository(provider,STORAGE_KEYS.decision,{legacyKey:LEGACY_STORAGE_KEYS.decision}),
    participation:createJsonRepository(provider,STORAGE_KEYS.participation,{legacyKey:LEGACY_STORAGE_KEYS.participation}),
    matchday:createJsonRepository(provider,STORAGE_KEYS.matchday,{legacyKey:LEGACY_STORAGE_KEYS.matchday}),
    returnLoop:createJsonRepository(provider,STORAGE_KEYS.returnLoop,{legacyKey:LEGACY_STORAGE_KEYS.returnLoop}),
    personalization:createJsonRepository(provider,STORAGE_KEYS.personalization,{legacyKey:LEGACY_STORAGE_KEYS.personalization}),
    events:createJsonRepository(provider,STORAGE_KEYS.events,{legacyKey:LEGACY_STORAGE_KEYS.events}),
    interaction:createJsonRepository(provider,STORAGE_KEYS.interaction,{legacyKey:LEGACY_STORAGE_KEYS.interaction})
  });
}

export function migrateRepositories(repositories){
  return Object.freeze(Object.fromEntries(Object.entries(repositories).map(([name,repository])=>[name,repository.migrateLegacy()])));
}
