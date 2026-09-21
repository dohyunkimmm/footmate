import {PLATFORM_VERSION,SESSION_SCHEMA_VERSION,EVENT_SCHEMA_VERSION,STORAGE_KEYS,LEGACY_STORAGE_KEYS,migrateSession,createDomainEvent,isDomainEvent} from '../domain/contracts.js';
import {createBrowserStorageProvider,createRepositories,migrateRepositories,installBrowserStorageCompatibility} from '../infrastructure/storage.js';

export function createFootMatePlatform(options={}){
  const {provider:providedProvider,now=()=>new Date(),maxEvents=100}=options;
  const browserBacked=!providedProvider;
  const provider=providedProvider||createBrowserStorageProvider();
  const repositories=createRepositories(provider);
  const storageMigration=migrateRepositories(repositories);
  const storageCompatibility=browserBacked?installBrowserStorageCompatibility():Object.freeze({installed:false,reused:false,pairs:0});
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
  return Object.freeze({version:PLATFORM_VERSION,sessionSchemaVersion:SESSION_SCHEMA_VERSION,eventSchemaVersion:EVENT_SCHEMA_VERSION,storageKeys:STORAGE_KEYS,legacyStorageKeys:LEGACY_STORAGE_KEYS,storageMigration,storageCompatibility,repositories,session,events});
}

export const footmatePlatform=createFootMatePlatform();
