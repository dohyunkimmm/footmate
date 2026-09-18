(function(){
'use strict';
if(window.__footmateProductHardening)return;window.__footmateProductHardening=true;
const Core=window.FootMateCore;
const Product=window.FootMateProductCore;
const Final=window.FootMateFinalRuntime;
if(!Core||!Product||!Final){console.error('[FootMate] product hardening dependency missing');return;}
const state=Final.state;
const COST=Number(Final.cost)||17000;
const STATUS_LABELS={
  payment:{idle:'결제 전',pending:'결제 처리 중',paid:'결제 완료',failed:'결제 실패',refunded:'환불 완료'},
  participation:{available:'신청 가능',waitlisted:'대기 등록',offered:'빈자리 제안',confirmed:'참가 확정',checked_in:'체크인 완료',completed:'경기 완료',cancelled:'참가 취소',expired:'제안 만료',no_show:'노쇼 처리'},
  match:{open:'모집 중',full:'마감',cancelled:'경기 취소',completed:'경기 종료'}
};
if(!state.operationByMatch||typeof state.operationByMatch!=='object'||Array.isArray(state.operationByMatch))state.operationByMatch={};
if(!Array.isArray(state.pmEvents))state.pmEvents=[];
if(!state.pmSessionId)state.pmSessionId='fm-'+Date.now().toString(36);
if(!state.recommendationBaseline||typeof state.recommendationBaseline!=='object')state.recommendationBaseline=null;

let inspectorUi=null;
function persist(){Final.persist?.()}
function renderCredit(){Final.renderCredit?.()}
function currentMatchKey(){try{return window.FootMateV22?.scenarioStore?.getState?.().selectedMatchKey||window.FootMateV21?.scenarioStore?.getState?.().selectedMatchKey||window.selectedMatchKey||(typeof selectedMatchKey!=='undefined'?selectedMatchKey:null)||'suwon'}catch(e){return'suwon'}}
function setParticipationFlag(value,key){try{if(typeof participationConfirmed!=='undefined')participationConfirmed=Boolean(value)}catch(e){};if(window.FootMateRuntime){window.FootMateRuntime.participationMatchKey=value?key:null}}
function currentScenario(){const key=currentMatchKey();try{const derived=window.FootMateV22?.scenarioStore?.getSelectedScenario?.()||window.FootMateV21?.scenarioStore?.getSelectedScenario?.();if(derived&&derived.key===key)return derived;if(typeof window.calculateMatchScenario==='function')return window.calculateMatchScenario(key);if(typeof calculateMatchScenario==='function')return calculateMatchScenario(key);if(typeof matchScenarios!=='undefined'&&matchScenarios[key])return matchScenarios[key]}catch(e){}return null}
function operation(key=currentMatchKey()){
  let op=state.operationByMatch[key];
  if(!op||typeof op!=='object'||Array.isArray(op)){
    const paid=Array.isArray(state.paidMatchKeys)&&state.paidMatchKeys.includes(key);
    let participating=false;
    try{participating=Boolean(typeof participationConfirmed!=='undefined'&&participationConfirmed&&window.FootMateRuntime?.participationMatchKey===key)}catch(e){}
    op={match:'open',payment:paid?'paid':'idle',participation:participating?'confirmed':'available',history:[]};
    state.operationByMatch[key]=op;
  }
  if(!Array.isArray(op.history))op.history=[];
  return op;
}
function record(name,metadata={}){
  const event=Product.normalizeAnalyticsEvent(name,Object.assign({match:currentMatchKey()},metadata),{sessionId:state.pmSessionId,version:'2.1.0'});
  state.pmEvents.push(event);state.pmEvents=state.pmEvents.slice(-80);persist();return event;
}
function rawEvents(){try{return Array.isArray(demoEvents)?demoEvents:[]}catch(e){return[]}}
function combinedEvents(){return [...rawEvents(),...state.pmEvents]}
function announce(message){inspectorUi?.announce?.(message)}
function renderInspector(){return inspectorUi?.render?.()}
function openInspector(tab){return inspectorUi?.open?.(tab)}
function closeInspector(){return inspectorUi?.close?.()}
function attachInspectorUi(ui){inspectorUi=ui&&typeof ui==='object'?ui:null;renderInspector();return()=>{if(inspectorUi===ui)inspectorUi=null}}
function statusLabel(machine,value){return STATUS_LABELS[machine]?.[value]||value}
function transition(machine,to,meta={}){
  const key=currentMatchKey(),op=operation(key),from=op[machine];
  if(from===to)return{ok:true,machine,from,to,state:to,reason:null,noop:true};
  const result=Product.transitionState(machine,from,to);
  if(!result.ok){record('operation_transition_blocked',{machine,from,to,reason:result.reason});announce(`${statusLabel(machine,from)} 상태에서는 ${statusLabel(machine,to)}(으)로 변경할 수 없습니다.`);return result}
  op[machine]=to;
  op.history.push({at:new Date().toISOString(),machine,from,to,meta});op.history=op.history.slice(-12);
  record(`operation_${machine}_${to}`,Object.assign({from,to},meta));persist();renderInspector();
  return result;
}
function paidFor(key=currentMatchKey()){return Array.isArray(state.paidMatchKeys)&&state.paidMatchKeys.includes(key)}
function removePaid(key){if(Array.isArray(state.paidMatchKeys))state.paidMatchKeys=state.paidMatchKeys.filter(item=>item!==key)}
function refundCurrent(reason){
  const key=currentMatchKey(),op=operation(key);
  if(op.payment!=='paid'&&!paidFor(key))return false;
  if(op.payment==='paid')transition('payment','refunded',{reason});
  state.creditBalance=Core.applyCredit(state.creditBalance,COST);removePaid(key);renderCredit();persist();
  record('refund_complete',{reason,amount:COST,balance:state.creditBalance});
  return true;
}
function simulatePaymentFailure(){
  const op=operation();
  if(['paid','refunded'].includes(op.payment)){announce('이미 결제 처리된 경기입니다.');return false}
  if(op.payment==='idle')transition('payment','pending',{trigger:'simulation'});
  if(operation().payment==='pending')transition('payment','failed',{reason:'insufficient_credit'});
  if(typeof window.simulateLowCredit==='function')window.simulateLowCredit();
  record('payment_retry_required',{reason:'insufficient_credit'});announce('결제 실패 상태를 재현했습니다. 충전 후 재시도할 수 있습니다.');renderInspector();return true;
}
function retryPayment(){
  const key=currentMatchKey(),op=operation(key);
  if(op.payment==='paid'){announce('이미 결제가 완료되었습니다.');return true}
  if(op.payment==='refunded'){announce('환불 완료된 건은 같은 참가 건으로 재결제하지 않습니다.');return false}
  if(op.payment==='failed')transition('payment','pending',{trigger:'retry'});
  else if(op.payment==='idle')transition('payment','pending',{trigger:'initial'});
  if(Number(state.creditBalance)<COST){
    if(operation(key).payment==='pending')transition('payment','failed',{reason:'insufficient_credit'});
    record('payment_retry_blocked',{required:COST,balance:Number(state.creditBalance)||0});
    announce(`크레딧이 부족합니다. ${Math.max(0,COST-(Number(state.creditBalance)||0)).toLocaleString()}원 충전이 필요합니다.`);
    try{window.goScreen?.('s-charge')}catch(e){}
    return false;
  }
  const result=typeof window.recordParticipation==='function'?window.recordParticipation():false;
  if(result===false){if(operation(key).payment==='pending')transition('payment','failed',{reason:'payment_rejected'});return false}
  announce('결제 재시도와 참가 확정이 완료되었습니다.');renderInspector();return true;
}
function joinWaitlist(){
  const key=currentMatchKey(),op=operation(key);
  if(op.participation!=='available'){announce('현재 참가 상태에서는 대기 등록을 할 수 없습니다.');return false}
  if(op.match==='open')transition('match','full',{reason:'capacity_full'});
  const result=transition('participation','waitlisted',{reason:'capacity_full'});
  if(result.ok){record('waitlist_join',{position:1});announce('대기 1번으로 등록했습니다. 빈자리가 생기면 제안 상태로 전환됩니다.')}
  return result.ok;
}
function promoteWaitlist(){
  const op=operation();
  if(op.participation!=='waitlisted'){announce('대기 등록 상태에서만 빈자리 제안을 만들 수 없습니다.');return false}
  if(op.match==='full')transition('match','open',{reason:'seat_released'});
  const result=transition('participation','offered',{expiresInMinutes:10});
  if(result.ok){record('waitlist_offer',{expiresInMinutes:10});announce('빈자리 제안을 만들었습니다. 10분 내 수락·결제 정책입니다.')}
  return result.ok;
}
function acceptWaitlistOffer(){
  const op=operation();
  if(op.participation!=='offered'){announce('빈자리 제안 상태에서만 수락할 수 있습니다.');return false}
  if(Number(state.creditBalance)<COST){if(op.payment==='idle')transition('payment','pending',{trigger:'waitlist_offer'});if(operation().payment==='pending')transition('payment','failed',{reason:'insufficient_credit'});try{window.goScreen?.('s-charge')}catch(e){};announce('제안 수락 전 크레딧 충전이 필요합니다.');return false}
  if(op.payment==='idle')transition('payment','pending',{trigger:'waitlist_offer'});
  const result=typeof window.recordParticipation==='function'?window.recordParticipation():false;
  if(result===false)return false;
  announce('빈자리 제안을 수락하고 참가를 확정했습니다.');return true;
}
function cancelParticipation(){
  const key=currentMatchKey(),op=operation(key);
  if(!['confirmed','waitlisted','offered'].includes(op.participation)){announce('취소 가능한 참가 상태가 아닙니다.');return false}
  const result=transition('participation','cancelled',{reason:'user_cancel'});
  if(!result.ok)return false;
  const refunded=refundCurrent('user_cancel');setParticipationFlag(false,key);persist();
  record('participation_cancelled',{refunded});announce(refunded?'참가를 취소하고 크레딧을 전액 복구했습니다.':'참가를 취소했습니다.');return true;
}
function markNoShow(){
  const key=currentMatchKey(),op=operation(key);
  if(op.participation!=='confirmed'){announce('참가 확정 상태에서만 노쇼 처리할 수 있습니다.');return false}
  const result=transition('participation','no_show',{refund:false});
  if(result.ok){setParticipationFlag(false,key);record('participation_no_show',{refund:false});announce('노쇼 처리했습니다. 결제 크레딧은 자동 환불하지 않는 정책입니다.')}
  return result.ok;
}
function checkIn(){
  const result=transition('participation','checked_in');
  if(result.ok){record('checkin_complete');announce('체크인 완료 상태로 전환했습니다.')}
  return result.ok;
}
function completeMatch(){
  const op=operation();
  if(op.participation!=='checked_in'){announce('체크인 완료 후에만 경기 완료로 전환할 수 있습니다.');return false}
  transition('participation','completed');
  if(operation().match==='open')transition('match','completed');
  record('match_flow_completed');announce('경기 완료 상태로 전환했습니다.');return true;
}
function cancelMatch(){
  const key=currentMatchKey(),op=operation(key);
  if(!['open','full'].includes(op.match)){announce('현재 경기 상태에서는 경기 취소를 실행할 수 없습니다.');return false}
  const result=transition('match','cancelled',{reason:'operator_cancel'});if(!result.ok)return false;
  if(['confirmed','waitlisted','offered'].includes(op.participation))transition('participation','cancelled',{reason:'operator_cancel'});
  const refunded=refundCurrent('operator_cancel');setParticipationFlag(false,key);record('match_cancelled',{refunded});announce(refunded?'경기를 취소하고 결제 크레딧을 복구했습니다.':'경기를 취소했습니다.');return true;
}
function resetOperation(){
  const key=currentMatchKey();state.operationByMatch[key]={match:'open',payment:paidFor(key)?'paid':'idle',participation:paidFor(key)?'confirmed':'available',history:[]};persist();record('operation_scenario_reset');announce('현재 경기의 운영 시뮬레이션 상태를 초기화했습니다.');renderInspector();
}
function sanitizedScenario(scenario){if(!scenario)return null;return{eligible:scenario.eligible,pct:scenario.pct,eloScore:scenario.eloScore,locationScore:scenario.locationScore,eligibility:Object.assign({},scenario.eligibility||{}),team:scenario.team,key:scenario.key||currentMatchKey()}}
function saveBaseline(){const scenario=sanitizedScenario(currentScenario());if(!scenario)return false;state.recommendationBaseline={savedAt:new Date().toISOString(),matchKey:currentMatchKey(),scored:scenario};persist();record('recommendation_baseline_saved',{pct:scenario.pct});announce('현재 추천을 비교 기준으로 저장했습니다. 필터를 변경한 뒤 다시 확인하세요.');renderInspector();return true}

const originalRecord=window.recordParticipation;
if(typeof originalRecord==='function')window.recordParticipation=function(){
  const key=currentMatchKey(),op=operation(key);
  if(['confirmed','checked_in','completed','no_show'].includes(op.participation)){
    record('duplicate_application_blocked',{state:op.participation});announce('같은 경기에 대한 중복 신청을 차단했습니다.');return true;
  }
  if(op.payment==='idle')transition('payment','pending',{trigger:'participation'});
  const result=originalRecord.apply(this,arguments);
  if(result===false){if(operation(key).payment==='pending')transition('payment','failed',{reason:'insufficient_credit'});record('payment_failed',{balance:Number(state.creditBalance)||0});renderInspector();return false}
  if(operation(key).payment==='pending')transition('payment','paid');
  const current=operation(key).participation;
  if(current==='available'||current==='offered')transition('participation','confirmed');
  record('application_confirmed',{amount:COST});renderInspector();return result;
};

const originalTrack=window.trackDemoEvent;
if(typeof originalTrack==='function')window.trackDemoEvent=function(name,metadata={}){
  const result=originalTrack.apply(this,arguments);record(name,metadata);renderInspector();return result;
};

operation();persist();
window.FootMateProductOps={
  operation,transition,simulatePaymentFailure,retryPayment,joinWaitlist,promoteWaitlist,acceptWaitlistOffer,
  cancelParticipation,markNoShow,checkIn,completeMatch,cancelMatch,resetOperation,
  openInspector,closeInspector,renderInspector,attachInspectorUi,statusLabel,
  saveRecommendationBaseline:saveBaseline,combinedEvents,currentMatchKey,currentScenario,
  recommendationSource:()=>window.FootMateV22||window.FootMateV21?'v2.1-domain-store':'legacy-compatibility',
  architecture:'v2.2-policy-adapter-ui-bridge',
  eventContractVersion:'2.1.0'
};
console.info('[FootMate] v2.2 product policy adapter ready');
})();
