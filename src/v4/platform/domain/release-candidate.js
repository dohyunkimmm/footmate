import {EVENT_NAMES,EVENT_SCHEMA_VERSION,SESSION_SCHEMA_VERSION,migrateSession} from './contracts.js';

export const RELEASE_CANDIDATE_VERSION='4.9.0';

export const IA_CONTRACT=Object.freeze([
  {route:'welcome',purpose:'value-before-account'},
  {route:'setup',purpose:'preferences'},
  {route:'home',purpose:'recommendation'},
  {route:'discover',purpose:'filter-and-sort'},
  {route:'detail',purpose:'decision'},
  {route:'auth',purpose:'join-auth'},
  {route:'checkout',purpose:'participation'},
  {route:'success',purpose:'confirmation'},
  {route:'schedule',purpose:'matchday-and-return'},
  {route:'profile',purpose:'personalization'}
]);

const eventOwner={
  'recommendation.selected':'recommendation',
  'join.started':'participation',
  'join.completed':'participation',
  'checkin.completed':'matchday',
  'postgame.submitted':'return'
};
export const EVENT_CATALOG=Object.freeze(Object.fromEntries(EVENT_NAMES.map(name=>[name,Object.freeze({name,schemaVersion:EVENT_SCHEMA_VERSION,owner:eventOwner[name],delivery:'local-only'})])));

export const PROVIDER_CONTRACTS=Object.freeze({
  auth:Object.freeze({mode:'mock',methods:Object.freeze(['getSession','signIn','signOut'])}),
  payment:Object.freeze({mode:'mock',methods:Object.freeze(['authorize','cancel','getStatus'])}),
  capacity:Object.freeze({mode:'mock',methods:Object.freeze(['getAvailability'])}),
  notification:Object.freeze({mode:'mock',methods:Object.freeze(['send'])})
});

export const PERFORMANCE_BUDGET=Object.freeze({
  appHtmlBytes:16000,
  firstPartyCssBytes:180000,
  firstPartyJsBytes:320000,
  firstPartyAssetRequests:24
});

export const RUNTIME_PERFORMANCE_BUDGET=Object.freeze({
  shellMaxWidthPx:560,
  maxHorizontalOverflowPx:1,
  screenReadyMs:4000
});

export const ACCESSIBILITY_CONTRACT=Object.freeze({
  widths:Object.freeze([320,375,390,430]),
  seriousOrCriticalViolations:0,
  fullFlowScreens:Object.freeze(['welcome','setup','home','detail','auth','checkout'])
});

export const ANALYTICS_CONTRACT=Object.freeze({
  schemaVersion:EVENT_SCHEMA_VERSION,
  names:EVENT_NAMES,
  storage:'footmate:v4:events',
  delivery:'local-only',
  externalAnalytics:false
});

const clone=value=>JSON.parse(JSON.stringify(value??{}));
export function createMigrationCheckpoint(candidate={}){
  return Object.freeze({sessionSchemaVersion:SESSION_SCHEMA_VERSION,snapshot:clone(candidate)});
}
export function restoreMigrationCheckpoint(checkpoint){
  if(!checkpoint||typeof checkpoint!=='object'||!('snapshot' in checkpoint))throw new TypeError('Invalid migration checkpoint');
  return clone(checkpoint.snapshot);
}
export function rehearseSessionMigration(candidate={}){
  const checkpoint=createMigrationCheckpoint(candidate);
  const migration=migrateSession(candidate);
  const rolledBack=restoreMigrationCheckpoint(checkpoint);
  return Object.freeze({checkpoint,migration,rolledBack,rollbackMatches:JSON.stringify(rolledBack)===JSON.stringify(clone(candidate))});
}
export function assertProviderContract(name,provider){
  const contract=PROVIDER_CONTRACTS[name];
  if(!contract)throw new TypeError(`Unknown provider contract: ${name}`);
  const missing=contract.methods.filter(method=>typeof provider?.[method]!=='function');
  return Object.freeze({name,valid:missing.length===0,missing:Object.freeze(missing)});
}
