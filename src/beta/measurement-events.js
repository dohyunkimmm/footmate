// Beta measurement v1: privacy-preserving, in-browser events only.
// Transport and validated pilot cohorts must be explicitly connected before KPI reporting.
const EVENT_NAMES=new Set(['match_list_available','join_attempt','join_succeeded','join_failed','directions_opened','calendar_opened']);
export const BETA_MEASUREMENT_EVENT='footmate:beta:measurement';

export function createBetaMeasurement(name,context={}){
  if(!EVENT_NAMES.has(name))throw new TypeError('Unsupported Beta measurement event');
  const flowId=String(context.flowId||'').slice(0,100);
  const matchId=String(context.matchId||'').slice(0,100);
  return Object.freeze({
    schemaVersion:1,
    event:name,
    source:'connected-beta',
    cohort:'unclassified',
    occurredAt:new Date().toISOString(),
    ...(flowId?{flowId}:{}),
    ...(matchId?{matchId}:{})
  });
}

export function emitBetaMeasurement(name,context={}){
  const payload=createBetaMeasurement(name,context);
  if(['join_attempt','join_succeeded','join_failed'].includes(name))recordDiscoveryEvent(payload);
  if(typeof window!=='undefined'&&typeof window.CustomEvent==='function'){
    window.dispatchEvent(new window.CustomEvent(BETA_MEASUREMENT_EVENT,{detail:payload}));
  }
  return payload;
}


export const DISCOVERY_MEASUREMENT_EVENT='footmate:beta:discovery-measurement';
const DISCOVERY_EVENTS=new Set(['filters_applied','recommendation_requested','recommendation_completed','recommendation_viewed','recommendation_redrawn','match_detail_opened']);
const DISCOVERY_KEY='footmate:beta:discovery-events:v1';
export function createDiscoveryMeasurement(name,context={},scope='beta'){
  if(!DISCOVERY_EVENTS.has(name))throw new TypeError('Unsupported discovery event');
  const event={schemaVersion:1,event:name,source:scope==='demo'?'demo':'connected-beta',cohort:scope==='demo'?'demo':'unclassified',occurredAt:new Date().toISOString()};
  for(const key of ['filterCount','candidateCount','resultCount','durationMs'])if(Number.isFinite(context[key])&&context[key]>=0)event[key]=Math.min(1000000,Math.floor(context[key]));
  if(['ai','rules'].includes(context.mode))event.mode=context.mode;
  return Object.freeze(event);
}
export function emitDiscoveryMeasurement(name,context={}){
  const scope=context.isDemo===true||(typeof location!=='undefined'&&location.pathname.replace(/\/$/,'')==='/demo')?'demo':'beta';
  const payload=createDiscoveryMeasurement(name,context,scope);
  recordDiscoveryEvent(payload);
  if(typeof window!=='undefined')window.dispatchEvent(new window.CustomEvent(DISCOVERY_MEASUREMENT_EVENT,{detail:payload}));
  return payload;
}

function recordDiscoveryEvent(payload){
  if(typeof window==='undefined')return;
  try{
    let rows=JSON.parse(sessionStorage.getItem(DISCOVERY_KEY)||'[]');if(!Array.isArray(rows))rows=[];
    const flowKey='footmate:beta:discovery-flow:v1';
    let flowId=sessionStorage.getItem(flowKey);if(!flowId){flowId=crypto.randomUUID();sessionStorage.setItem(flowKey,flowId)}
    const scope=payload.source==='demo'||payload.matchId?.startsWith('demo-')||location.pathname.replace(/\/$/,'')==='/demo'?'demo':'beta';
    const recorded={...payload,discoveryFlowId:flowId,source:scope==='demo'?'demo':payload.source,cohort:scope==='demo'?'demo':'unclassified'};
    sessionStorage.setItem(DISCOVERY_KEY,JSON.stringify([...rows.slice(-199),recorded]));
  }catch{}
}
