export const PLATFORM_VERSION='4.9.0';
export const SESSION_SCHEMA_VERSION=2;
export const EVENT_SCHEMA_VERSION=1;

export const STORAGE_KEYS=Object.freeze({
  session:'footmate:session',
  discovery:'footmate:discovery',
  decision:'footmate:decision',
  participation:'footmate:participation',
  matchday:'footmate:matchday',
  returnLoop:'footmate:return',
  personalization:'footmate:personalization',
  events:'footmate:events',
  interaction:'footmate:interaction'
});

export const LEGACY_STORAGE_KEYS=Object.freeze({
  session:'footmate:v4:session',
  discovery:'footmate:v4:discovery',
  decision:'footmate:v4:decision',
  participation:'footmate:v4:participation',
  matchday:'footmate:v4:matchday',
  returnLoop:'footmate:v4:return',
  personalization:'footmate:v4:personalization',
  events:'footmate:v4:events',
  interaction:'footmate:v4:interaction'
});

export const EVENT_NAMES=Object.freeze([
  'recommendation.selected',
  'join.started',
  'join.completed',
  'checkin.completed',
  'postgame.submitted'
]);

const eventNames=new Set(EVENT_NAMES);
const routes=new Set(['welcome','setup','home','discover','detail','auth','checkout','success','schedule','profile']);
const matchStages=new Set(['discover','upcoming','matchday','postgame']);
const isObject=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
const stringOr=(value,fallback)=>typeof value==='string'?value:fallback;
const nullableString=value=>value===null||typeof value==='string'?value:null;

export function migrateSession(candidate={}){
  const source=isObject(candidate)?candidate:{};
  const fromVersion=Number.isInteger(source.schemaVersion)?source.schemaVersion:0;
  const state={...source,schemaVersion:SESSION_SCHEMA_VERSION};
  if('route' in source)state.route=routes.has(source.route)?source.route:'welcome';
  if('setupStep' in source)state.setupStep=Number.isInteger(source.setupStep)&&source.setupStep>=0?source.setupStep:0;
  if('setupComplete' in source)state.setupComplete=Boolean(source.setupComplete);
  if('region' in source)state.region=stringOr(source.region,'수원 · 영통');
  if('position' in source)state.position=stringOr(source.position,'MF');
  if('level' in source)state.level=stringOr(source.level,'중급');
  if('signedIn' in source)state.signedIn=Boolean(source.signedIn);
  if('joinedMatchId' in source)state.joinedMatchId=nullableString(source.joinedMatchId);
  if('selectedMatchId' in source)state.selectedMatchId=nullableString(source.selectedMatchId);
  if('checkedInMatchId' in source)state.checkedInMatchId=nullableString(source.checkedInMatchId);
  if('matchStage' in source)state.matchStage=matchStages.has(source.matchStage)?source.matchStage:'discover';
  if('userName' in source)state.userName=stringOr(source.userName,'게스트');
  return {state,fromVersion,toVersion:SESSION_SCHEMA_VERSION,migrated:fromVersion!==SESSION_SCHEMA_VERSION};
}

export function createDomainEvent(name,payload={},options={}){
  if(!eventNames.has(name))throw new TypeError(`Unsupported FootMate event: ${name}`);
  const sequence=Number.isInteger(options.sequence)&&options.sequence>0?options.sequence:1;
  const now=typeof options.now==='function'?options.now():new Date();
  const occurredAt=now instanceof Date?now.toISOString():new Date(now).toISOString();
  return Object.freeze({
    schemaVersion:EVENT_SCHEMA_VERSION,
    sequence,
    id:`evt-${String(sequence).padStart(4,'0')}`,
    name,
    occurredAt,
    dedupeKey:typeof options.dedupeKey==='string'&&options.dedupeKey?options.dedupeKey:null,
    payload:isObject(payload)?{...payload}:{}
  });
}

export function isDomainEvent(value){
  return isObject(value)
    &&value.schemaVersion===EVENT_SCHEMA_VERSION
    &&Number.isInteger(value.sequence)
    &&eventNames.has(value.name)
    &&typeof value.occurredAt==='string'
    &&isObject(value.payload);
}
