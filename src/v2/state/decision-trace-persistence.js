import{createStorage}from'../core/storage.js';

const SCHEMA_VERSION='2.1.0';
const RELEASE_VERSION='2.6.0';
const MAX_TRACES=24;

function clone(value){return JSON.parse(JSON.stringify(value))}
function validTrace(value){return Boolean(value&&typeof value==='object'&&value.traceId&&value.screenId&&value.generatedAt)}

export function createDecisionTracePersistence(){
  const storage=createStorage('decision-traces');
  let traces=[];
  let stop=()=>{};

  function hydrate(){
    const record=storage.read(null);
    traces=record?.schemaVersion===SCHEMA_VERSION&&Array.isArray(record.traces)
      ?record.traces.filter(validTrace).slice(-MAX_TRACES).map(clone)
      :[];
    return history();
  }

  function persist(reason='sync'){
    storage.write({
      schemaVersion:SCHEMA_VERSION,
      releaseVersion:RELEASE_VERSION,
      architecture:'v2.6-decision-trace-persistence',
      reason,
      updatedAt:Date.now(),
      traces:traces.map(clone)
    });
    return history();
  }

  function append(trace,reason='decision'){
    if(!validTrace(trace))return history();
    const next=clone(trace);
    const index=traces.findIndex(item=>item.traceId===next.traceId&&item.screenId===next.screenId);
    if(index>=0)traces.splice(index,1);
    traces.push(next);
    if(traces.length>MAX_TRACES)traces=traces.slice(-MAX_TRACES);
    return persist(reason);
  }

  function capture(items=[],reason='capture'){
    if(!Array.isArray(items))return history();
    for(const item of items){
      if(!validTrace(item))continue;
      const index=traces.findIndex(trace=>trace.traceId===item.traceId&&trace.screenId===item.screenId);
      if(index>=0)traces.splice(index,1);
      traces.push(clone(item));
    }
    if(traces.length>MAX_TRACES)traces=traces.slice(-MAX_TRACES);
    return persist(reason);
  }

  function history(){return traces.map(clone)}
  function replay(traceId){const item=traces.find(trace=>trace.traceId===traceId);return item?clone(item):null}

  function start(){
    hydrate();
    const handler=event=>append(event?.detail,'runtime-event');
    window.addEventListener('footmate:v2.5:decision',handler);
    stop=()=>window.removeEventListener('footmate:v2.5:decision',handler);
    return api;
  }

  function clear(){storage.clear();traces=[]}
  function destroy(){stop();stop=()=>{}}

  const api={
    key:storage.key,
    schemaVersion:SCHEMA_VERSION,
    releaseVersion:RELEASE_VERSION,
    architecture:'v2.6-decision-trace-persistence',
    maxTraces:MAX_TRACES,
    hydrate,
    append,
    capture,
    history,
    replay,
    start,
    clear,
    destroy
  };
  return api;
}
