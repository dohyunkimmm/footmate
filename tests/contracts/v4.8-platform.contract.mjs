import assert from 'node:assert/strict';
import {SESSION_SCHEMA_VERSION,EVENT_SCHEMA_VERSION,STORAGE_KEYS,LEGACY_STORAGE_KEYS,createDomainEvent} from '../../src/v4/platform/domain/contracts.js';
import {createMemoryStorageProvider,createJsonRepository} from '../../src/v4/platform/infrastructure/storage.js';
import {createFootMatePlatform} from '../../src/v4/platform/application/platform.js';

assert.equal(STORAGE_KEYS.session,'footmate:session');
assert.equal(LEGACY_STORAGE_KEYS.session,'footmate:v4:session');
assert.equal(STORAGE_KEYS.interaction,'footmate:interaction');
assert.equal(LEGACY_STORAGE_KEYS.interaction,'footmate:v4:interaction');

const fixedNow=()=>new Date('2026-09-20T00:00:00.000Z');
const provider=createMemoryStorageProvider({
  [LEGACY_STORAGE_KEYS.session]:JSON.stringify({route:'home',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',legacyFlag:'keep-me'}),
  [LEGACY_STORAGE_KEYS.decision]:JSON.stringify({savedMatchIds:['gwanggyo-2130']})
});
const platform=createFootMatePlatform({provider,now:fixedNow,maxEvents:3});

assert.equal(platform.storageMigration.session.source,'legacy');
assert.equal(platform.storageMigration.session.migrated,true);
assert.equal(platform.storageMigration.decision.source,'legacy');
assert.equal(platform.storageMigration.decision.migrated,true);
assert.deepEqual(JSON.parse(provider.snapshot()[STORAGE_KEYS.decision]),{savedMatchIds:['gwanggyo-2130']});
assert.deepEqual(platform.repositories.decision.read({}),{savedMatchIds:['gwanggyo-2130']});

const migration=platform.session.migrate();
assert.equal(migration.migrated,true);
assert.equal(migration.fromVersion,0);
assert.equal(migration.toVersion,SESSION_SCHEMA_VERSION);
assert.equal(migration.state.schemaVersion,SESSION_SCHEMA_VERSION);
assert.equal(migration.state.route,'home');
assert.equal(migration.state.legacyFlag,'keep-me');
assert.equal(JSON.parse(provider.snapshot()[STORAGE_KEYS.session]).schemaVersion,SESSION_SCHEMA_VERSION);
assert.deepEqual(JSON.parse(provider.snapshot()[LEGACY_STORAGE_KEYS.session]),JSON.parse(provider.snapshot()[STORAGE_KEYS.session]));

const patched=platform.session.patch({signedIn:true,userName:'테스터'});
assert.equal(patched.signedIn,true);
assert.equal(patched.userName,'테스터');
assert.equal(patched.schemaVersion,SESSION_SCHEMA_VERSION);
assert.deepEqual(JSON.parse(provider.snapshot()[LEGACY_STORAGE_KEYS.session]),JSON.parse(provider.snapshot()[STORAGE_KEYS.session]));

platform.repositories.interaction.write({detailReturnRoute:'discover'});
assert.deepEqual(JSON.parse(provider.snapshot()[STORAGE_KEYS.interaction]),{detailReturnRoute:'discover'});
assert.deepEqual(JSON.parse(provider.snapshot()[LEGACY_STORAGE_KEYS.interaction]),{detailReturnRoute:'discover'});
platform.repositories.interaction.clear();
assert.equal(provider.snapshot()[STORAGE_KEYS.interaction],undefined);
assert.equal(provider.snapshot()[LEGACY_STORAGE_KEYS.interaction],undefined);

const divergentProvider=createMemoryStorageProvider({
  [STORAGE_KEYS.discovery]:JSON.stringify({sort:'distance',position:'MF'}),
  [LEGACY_STORAGE_KEYS.discovery]:JSON.stringify({sort:'fit',position:'FW'})
});
const divergentPlatform=createFootMatePlatform({provider:divergentProvider});
assert.equal(divergentPlatform.storageMigration.discovery.source,'canonical');
assert.equal(divergentPlatform.storageMigration.discovery.mirroredLegacy,true);
assert.deepEqual(JSON.parse(divergentProvider.snapshot()[LEGACY_STORAGE_KEYS.discovery]),JSON.parse(divergentProvider.snapshot()[STORAGE_KEYS.discovery]));
assert.deepEqual(divergentPlatform.repositories.discovery.read({}),{sort:'distance',position:'MF'});

const scratch=createJsonRepository(provider,'footmate:test:repository');
scratch.write({ok:true,count:1});
assert.deepEqual(scratch.read({}),{ok:true,count:1});
scratch.update(value=>({...value,count:value.count+1}),{});
assert.equal(scratch.read({}).count,2);
scratch.clear();
assert.equal(scratch.read(null),null);

const first=platform.events.record('recommendation.selected',{matchId:'gwanggyo-2130'});
const second=platform.events.record('join.started',{matchId:'gwanggyo-2130'},{dedupeKey:'join:1'});
const duplicate=platform.events.record('join.started',{matchId:'gwanggyo-2130'},{dedupeKey:'join:1'});
assert.equal(first.schemaVersion,EVENT_SCHEMA_VERSION);
assert.equal(first.sequence,1);
assert.equal(first.occurredAt,'2026-09-20T00:00:00.000Z');
assert.equal(second.sequence,2);
assert.equal(duplicate.id,second.id);
assert.equal(platform.events.read().length,2);
assert.deepEqual(JSON.parse(provider.snapshot()[LEGACY_STORAGE_KEYS.events]),JSON.parse(provider.snapshot()[STORAGE_KEYS.events]));

platform.events.record('checkin.completed',{matchId:'gwanggyo-2130'});
platform.events.record('postgame.submitted',{matchId:'gwanggyo-2130'});
assert.deepEqual(platform.events.read().map(event=>event.sequence),[2,3,4]);
assert.throws(()=>createDomainEvent('unknown.event'),/Unsupported FootMate event/);

console.log('PASS v4.8 platform deterministic contracts');
