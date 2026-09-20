import {PLATFORM_VERSION,SESSION_SCHEMA_VERSION,EVENT_SCHEMA_VERSION,STORAGE_KEYS,migrateSession,createDomainEvent,isDomainEvent} from '../domain/contracts.mjs';
import {createBrowserStorageProvider,createRepositories} from '../infrastructure/storage.mjs';

export function createFootMatePlatform({provider=createBrowserStorageProvider(),now=()=>new Date(),maxEvents=100}={}){
  const repositories=createRepositories(provider);
  const session=Object.freeze({
    read(){const value=repositories.session.read(null);return value&&typeof value==='object'?migrateSession(value).state:null},
    migrate(){const current=repositories.session.read(null);if(!current||typeof current!=='object')return {state:null,fromVersion:null,toVersion:SESSION_SCHEMA_VERSION,migrated:false};const result=migrateSession(current);if(result.migrated)repositories.session.write(result.state);return result},
    write(value){const next=migrateSession(value).state;repositories.session.write(next);return next},
    patch(patch={}){const next={...(this.read()||{}),...patch};return this.write(next)},
    clear(){repositories.session.clear()}
  });
  const events=Object.freeze({
    read(){const items=repositories.events.read([]);return Array.isArray(items)?items.filter(isDomainEvent):[]},
    record(name,payload={},options={}){
      const current=this.read();
      if(options.dedupeKey){const existing=current.find(item=>item.dedupeKey===options.dedupeKey);if(existing)return existing}
      const nextSequence=current.reduce((max,item)=>Math.max(max,item.sequence||0),0)+1;
      const event=createDomainEvent(name,payload,{sequence:nextSequence,now,dedupeKey:options.dedupeKey});
      repositories.events.write([...current,event].slice(-Math.max(1,maxEvents)));
      return event;
    },
    clear(){repositories.events.clear()}
  });
  return Object.freeze({version:PLATFORM_VERSION,sessionSchemaVersion:SESSION_SCHEMA_VERSION,eventSchemaVersion:EVENT_SCHEMA_VERSION,storageKeys:STORAGE_KEYS,repositories,session,events});
}

export const footmatePlatform=createFootMatePlatform();
