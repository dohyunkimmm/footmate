// Explicit opt-in only. No pre-consent backfill, guest or example-match transmission.
let state={userId:'',accessToken:'',enabled:false,withdrawalPending:false,config:null};
let inflight=false,pending=[],generation=0;
const blockedUsers=new Set();
const withdrawalKey=id=>'footmate:beta:discovery-withdrawal:v1:'+id;
function blocked(id){try{return blockedUsers.has(id)||localStorage.getItem(withdrawalKey(id))==='1'}catch{return true}}
function block(id){blockedUsers.add(id);try{localStorage.setItem(withdrawalKey(id),'1')}catch{}}
function unblock(id){try{localStorage.removeItem(withdrawalKey(id))}catch{}blockedUsers.delete(id)}
const allowed=new Set(['entry_viewed','recommendation_requested','recommendation_completed','recommendation_viewed','recommendation_redrawn','match_detail_opened','filters_applied','reaction_submitted','join_attempt','join_succeeded','join_failed']);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function discoveryTransportStatus(){return {enabled:state.enabled,userId:state.userId,withdrawalPending:state.withdrawalPending}}
async function call(path,options={},context=state){
 const response=await fetch(context.config.url+'/rest/v1/'+path,{...options,signal:AbortSignal.timeout(3000),headers:{apikey:context.config.publishableKey,authorization:'Bearer '+context.accessToken,'content-type':'application/json',...(options.headers||{})}});
 if(!response.ok)throw new Error('통계 설정을 저장하지 못했어요. 다시 시도해주세요.');
 const body=await response.text();return body?JSON.parse(body):null;
}
async function saveConsent(enabled,context){
 return call('discovery_consents?on_conflict=user_id',{method:'POST',headers:{prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:context.userId,enabled:Boolean(enabled)})},context);
}
export async function configureDiscoveryTransport(config,userId,accessToken){
 const version=++generation;
 state={config,userId:userId||'',accessToken:accessToken||'',enabled:false,withdrawalPending:Boolean(userId&&blocked(userId))};pending=[];
 if(!userId||!accessToken)return;
 const context=state;
 try{
  if(state.withdrawalPending){
   await saveConsent(false,context);
   if(generation===version){unblock(userId);state.withdrawalPending=false}
  }else{
   const rows=await call('discovery_consents?select=enabled&user_id=eq.'+encodeURIComponent(userId),{},context);
   if(generation===version&&!blocked(userId))state.enabled=rows?.[0]?.enabled===true;
  }
 }catch{}
}
export async function setDiscoveryConsent(enabled){
 if(!state.userId||!state.accessToken)throw new Error('로그인 후 설정할 수 있어요.');
 if(enabled&&blocked(state.userId))throw new Error('서버 통계 해제를 먼저 재시도해주세요. 이 기기의 수집은 중지되어 있어요.');
 const version=++generation,context=state;
 if(!enabled){block(context.userId);state.enabled=false;state.withdrawalPending=true;pending=[];}
 try{await saveConsent(enabled,context)}catch(error){
  if(!enabled)throw new Error('이 기기의 수집은 중지했어요. 서버 기록 삭제는 확인되지 않았어요. 통계 해제를 재시도해주세요.');
  throw error;
 }
 if(generation===version){state.enabled=Boolean(enabled);if(!enabled){unblock(context.userId);state.withdrawalPending=false}}
}
export function queueDiscoveryMeasurement(record){
 const root=typeof document!=='undefined'?document.getElementById('footmate-beta'):null;
 if(!state.enabled||!state.userId||!state.accessToken||blocked(state.userId)||record.source!=='connected-beta'||root?.dataset.betaCatalogSource!=='server'||root?.dataset.betaGuest!=='false'||!allowed.has(record.event))return;
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
 if(inflight||!state.enabled||!pending.length||blocked(state.userId))return;
 inflight=true;const context=state,version=generation;let failed=false;
 try{
  while(generation===version&&state.enabled&&!blocked(context.userId)&&pending.length){
   const chunk=pending.splice(0,10);
   try{await call('discovery_events?on_conflict=event_id',{method:'POST',headers:{prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(chunk)},context)}
   catch{failed=true;if(state.enabled&&generation===version&&!blocked(context.userId))pending=[...chunk,...pending].slice(-50);break}
  }
 }finally{
  inflight=false;
  // Drain successful batches; failed batches retry only on a later user event.
  if(state.enabled&&pending.length&&(!failed||generation!==version))void flush();
 }
}
if(typeof window!=='undefined')window.addEventListener('storage',event=>{
 if(state.userId&&event.key===withdrawalKey(state.userId)&&event.newValue==='1'){
  blockedUsers.add(state.userId);state.enabled=false;state.withdrawalPending=true;pending=[];++generation;
  window.dispatchEvent(new Event('footmate:beta:discovery-consent-changed'));
 }
});
