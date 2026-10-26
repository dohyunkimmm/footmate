// Explicit opt-in only. No pre-consent backfill, guest or example-match transmission.
let state={userId:'',accessToken:'',enabled:false,config:null};
let inflight=false,pending=[],generation=0;
const allowed=new Set(['entry_viewed','recommendation_requested','recommendation_completed','recommendation_viewed','recommendation_redrawn','match_detail_opened','filters_applied','reaction_submitted','join_attempt','join_succeeded','join_failed']);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function discoveryTransportStatus(){return {enabled:state.enabled,userId:state.userId}}
async function call(path,options={}){
 const response=await fetch(state.config.url+'/rest/v1/'+path,{...options,signal:AbortSignal.timeout(3000),headers:{apikey:state.config.publishableKey,authorization:'Bearer '+state.accessToken,'content-type':'application/json',...(options.headers||{})}});
 if(!response.ok)throw new Error('통계 설정을 저장하지 못했어요. 다시 시도해주세요.');
 const body=await response.text();return body?JSON.parse(body):null;
}
export async function configureDiscoveryTransport(config,userId,accessToken){
 const version=++generation;
 state={config,userId:userId||'',accessToken:accessToken||'',enabled:false};pending=[];
 if(!userId||!accessToken)return;
 const identity=userId;
 try{const rows=await call('discovery_consents?select=enabled&user_id=eq.'+encodeURIComponent(userId));if(generation===version&&state.userId===identity)state.enabled=rows?.[0]?.enabled===true}catch{}
}
export async function setDiscoveryConsent(enabled){
 if(!state.userId||!state.accessToken)throw new Error('로그인 후 설정할 수 있어요.');
 const version=++generation;
 if(!enabled){state.enabled=false;pending=[];}
 await call('discovery_consents?on_conflict=user_id',{method:'POST',headers:{prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:state.userId,enabled:Boolean(enabled)})});
 if(generation===version)state.enabled=Boolean(enabled);
}
export function queueDiscoveryMeasurement(record){
 const root=typeof document!=='undefined'?document.getElementById('footmate-beta'):null;
 if(!state.enabled||!state.userId||!state.accessToken||record.source!=='connected-beta'||root?.dataset.betaCatalogSource!=='server'||root?.dataset.betaGuest!=='false'||!allowed.has(record.event))return;
 if(!uuid.test(record.discoveryFlowId||''))return;
 if(record.matchId&&!uuid.test(record.matchId))return;
 const row={event_id:record.eventId,session_id:record.discoveryFlowId,event_name:record.event,variant:record.variant==='quick'?'quick':'control'};
 if(!uuid.test(row.event_id||''))return;
 if(record.matchId)row.match_id=record.matchId;
 for(const [a,b] of [['resultCount','result_count'],['durationMs','duration_ms']])if(Number.isFinite(record[a]))row[b]=Math.max(0,Math.min(1000000,Math.floor(record[a])));
 if(['ai','rules'].includes(record.mode))row.mode=record.mode;
 pending.push(row);pending=pending.slice(-50);void flush();
}
async function flush(){
 if(inflight||!state.enabled||!pending.length)return;
 inflight=true;const owner=state.userId,version=generation,chunk=pending.splice(0,10);
 try{await call('discovery_events?on_conflict=event_id',{method:'POST',headers:{prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(chunk)})}
 catch{if(state.enabled&&state.userId===owner&&generation===version)pending=[...chunk,...pending].slice(-50)}
 finally{inflight=false;}
 // Retry only on a subsequent user event; never block or loop on analytics failure.
}
