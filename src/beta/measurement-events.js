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
  if(typeof window!=='undefined'&&typeof window.CustomEvent==='function'){
    window.dispatchEvent(new window.CustomEvent(BETA_MEASUREMENT_EVENT,{detail:payload}));
  }
  return payload;
}
