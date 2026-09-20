import {STORAGE_KEYS} from '../domain/contracts.js';

function safeJsonParse(value,fallback){
  try{return value===null||value===undefined?fallback:JSON.parse(value)}catch(_error){return fallback}
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

export function createJsonRepository(provider,key){
  if(!provider||typeof provider.get!=='function'||typeof provider.set!=='function'||typeof provider.remove!=='function')throw new TypeError('Storage provider must implement get/set/remove');
  return Object.freeze({
    key,
    read(fallback=null){return safeJsonParse(provider.get(key),fallback)},
    write(value){provider.set(key,JSON.stringify(value));return value},
    update(mutator,fallback={}){const current=this.read(fallback);const next=mutator(current);return this.write(next)},
    clear(){provider.remove(key)}
  });
}

export function createRepositories(provider=createBrowserStorageProvider()){
  return Object.freeze({
    session:createJsonRepository(provider,STORAGE_KEYS.session),
    discovery:createJsonRepository(provider,STORAGE_KEYS.discovery),
    decision:createJsonRepository(provider,STORAGE_KEYS.decision),
    participation:createJsonRepository(provider,STORAGE_KEYS.participation),
    matchday:createJsonRepository(provider,STORAGE_KEYS.matchday),
    returnLoop:createJsonRepository(provider,STORAGE_KEYS.returnLoop),
    personalization:createJsonRepository(provider,STORAGE_KEYS.personalization),
    events:createJsonRepository(provider,STORAGE_KEYS.events)
  });
}
