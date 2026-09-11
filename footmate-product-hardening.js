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

function persist(){Final.persist?.()}
function renderCredit(){Final.renderCredit?.()}
function currentMatchKey(){try{return window.selectedMatchKey||(typeof selectedMatchKey!=='undefined'?selectedMatchKey:null)||'suwon'}catch(e){return'suwon'}}
function setParticipationFlag(value,key){try{if(typeof participationConfirmed!=='undefined')participationConfirmed=Boolean(value)}catch(e){};if(window.FootMateRuntime){window.FootMateRuntime.participationMatchKey=value?key:null}}
function matchMeta(key=currentMatchKey()){try{return (typeof matchScenarioBases!=='undefined'&&matchScenarioBases[key])||null}catch(e){return null}}
function currentScenario(){const key=currentMatchKey();try{if(typeof window.calculateMatchScenario==='function')return window.calculateMatchScenario(key);if(typeof calculateMatchScenario==='function')return calculateMatchScenario(key);if(typeof matchScenarios!=='undefined'&&matchScenarios[key])return matchScenarios[key]}catch(e){}return null}
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
  const event=Product.normalizeAnalyticsEvent(name,Object.assign({match:currentMatchKey()},metadata),{sessionId:state.pmSessionId,version:'1.1'});
  state.pmEvents.push(event);state.pmEvents=state.pmEvents.slice(-80);persist();return event;
}
function rawEvents(){try{return Array.isArray(demoEvents)?demoEvents:[]}catch(e){return[]}}
function combinedEvents(){return [...rawEvents(),...state.pmEvents]}
function announce(message){const live=document.getElementById('fmLiveRegion');if(live){live.textContent='';setTimeout(()=>{live.textContent=message},20)}}
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
  if(op.participation!=='waitlisted'){announce('대기 등록 상태에서만 빈자리 제안을 만들 수 있습니다.');return false}
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

function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function dialog(){return document.getElementById('fmProductInspector')}
function inspectorOpen(){return dialog()?.getAttribute('aria-hidden')==='false'}
function activeTab(){return dialog()?.dataset.activeTab||'operations'}
function setTab(name){const d=dialog();if(!d)return;d.dataset.activeTab=name;d.querySelectorAll('[data-fm-tab]').forEach(button=>{const on=button.dataset.fmTab===name;button.setAttribute('aria-selected',on?'true':'false');button.tabIndex=on?0:-1});d.querySelectorAll('[data-fm-panel]').forEach(panel=>{panel.hidden=panel.dataset.fmPanel!==name});renderInspector()}
function renderStatusCard(machine,value){return `<div class="fm-status-card"><span>${escapeHtml(machine==='match'?'경기':machine==='payment'?'결제':'참가')}</span><strong>${escapeHtml(statusLabel(machine,value))}</strong><small>${escapeHtml(value)}</small></div>`}
function actionButton(action,label,disabled=false,kind='secondary'){return `<button type="button" class="fm-action ${kind}" data-fm-action="${escapeHtml(action)}"${disabled?' disabled':''}>${escapeHtml(label)}</button>`}
function renderOperations(){const root=document.querySelector('[data-fm-panel="operations"]');if(!root)return;const key=currentMatchKey(),op=operation(key),meta=matchMeta(key);const history=op.history.slice(-6).reverse();root.innerHTML=`
  <div class="fm-section-head"><div><small>P0 · OPERATIONS REALISM</small><h3>${escapeHtml(meta?.team||key)}</h3></div><span class="fm-scope-badge">시뮬레이션</span></div>
  <div class="fm-status-grid">${renderStatusCard('match',op.match)}${renderStatusCard('payment',op.payment)}${renderStatusCard('participation',op.participation)}</div>
  <div class="fm-policy-note"><b>정책:</b> 결제 실패 재시도 · 중복 신청 차단 · 취소/환불 · 노쇼 · 대기→빈자리 제안 · 경기 취소를 상태 전이 규칙으로 검증합니다.</div>
  <div class="fm-actions-grid">
    ${actionButton('payment-fail','결제 실패 재현',['paid','refunded'].includes(op.payment))}
    ${actionButton('payment-retry','결제 재시도',op.payment==='paid'||op.payment==='refunded')}
    ${actionButton('waitlist','대기 등록',op.participation!=='available')}
    ${actionButton('promote','빈자리 제안',op.participation!=='waitlisted')}
    ${actionButton('accept-offer','제안 수락·결제',op.participation!=='offered')}
    ${actionButton('checkin','체크인',op.participation!=='confirmed')}
    ${actionButton('complete','경기 완료',op.participation!=='checked_in')}
    ${actionButton('cancel-participation','참가 취소·환불',!['confirmed','waitlisted','offered'].includes(op.participation),'danger')}
    ${actionButton('no-show','노쇼 처리',op.participation!=='confirmed','danger')}
    ${actionButton('cancel-match','경기 취소',!['open','full'].includes(op.match),'danger')}
    ${actionButton('reset','시뮬레이션 초기화',false)}
  </div>
  <div class="fm-history"><div class="fm-subhead"><b>최근 상태 전이</b><span>${history.length}건</span></div>${history.length?history.map(item=>`<div><code>${escapeHtml(item.machine)}</code><span>${escapeHtml(statusLabel(item.machine,item.from))} → <b>${escapeHtml(statusLabel(item.machine,item.to))}</b></span></div>`).join(''):'<p>아직 실행한 운영 시뮬레이션이 없습니다.</p>'}</div>`;
}
function sanitizedScenario(scenario){if(!scenario)return null;return{eligible:scenario.eligible,pct:scenario.pct,eloScore:scenario.eloScore,locationScore:scenario.locationScore,eligibility:Object.assign({},scenario.eligibility||{}),team:scenario.team,key:scenario.key||currentMatchKey()}}
function renderRecommendation(){const root=document.querySelector('[data-fm-panel="recommendation"]');if(!root)return;const scenario=currentScenario();if(!scenario){root.innerHTML='<p class="fm-empty">추천 계산 상태를 불러오지 못했습니다.</p>';return}const explanation=Product.explainMatch(scenario);const baseline=state.recommendationBaseline?.scored;const comparison=baseline?Product.compareRecommendations(baseline,scenario):null;const factorRows=explanation.factors.map(f=>`<div class="fm-factor"><div><b>${escapeHtml(f.label)}</b><span>${f.score}점</span></div><div class="fm-factor-track"><i style="width:${f.score}%"></i></div><small>${f.pass?'조건 충족':'조건 불일치'}</small></div>`).join('');const exclusions=explanation.exclusions.length?explanation.exclusions.map(x=>`<li>${escapeHtml(x.message)}</li>`).join(''):'<li>하드 필터 제외 조건 없음</li>';const delta=comparison?`${comparison.pctDelta>=0?'+':''}${comparison.pctDelta}%p`:null;root.innerHTML=`
  <div class="fm-section-head"><div><small>P0 · EXPLAINABLE RECOMMENDATION</small><h3>${escapeHtml(scenario.team||currentMatchKey())} · ${explanation.pct}%</h3></div><span class="fm-scope-badge ${explanation.eligible?'pass':'check'}">${explanation.eligible?'추천 가능':'필터 제외'}</span></div>
  <div class="fm-reason-summary"><b>추천 이유</b><p>${escapeHtml(explanation.reasons.join(' · ')||'현재 조건에서 강한 추천 요인이 부족합니다.')}</p></div>
  <div class="fm-factor-list">${factorRows}</div>
  <div class="fm-exclusions"><b>제외 이유 / fallback</b><ul>${exclusions}</ul>${explanation.fallback?`<p>${escapeHtml(explanation.fallback.message)} 우선 완화: ${escapeHtml(explanation.fallback.relaxPriority.join(' → '))}</p>`:'<p>현재 후보는 모든 하드 필터를 충족합니다.</p>'}</div>
  <div class="fm-compare"><div><b>조건 변경 전/후 비교</b><span>${comparison?`기준 ${comparison.beforePct}% → 현재 ${comparison.afterPct}% · ${delta}`:'비교 기준을 저장하면 필터 변경 효과를 확인할 수 있습니다.'}</span></div>${actionButton('save-baseline','현재 추천을 비교 기준으로 저장')}</div>
  ${comparison?`<div class="fm-delta-grid">${comparison.factors.filter(f=>f.delta!==0).slice(0,5).map(f=>`<span>${escapeHtml(f.label)} <b>${f.delta>0?'+':''}${f.delta}</b></span>`).join('')||'<span>요인별 점수 변화 없음</span>'}</div>`:''}`;
}
function renderPm(){const root=document.querySelector('[data-fm-panel="pm"]');if(!root)return;const funnel=Product.funnelMetrics(combinedEvents(),Core.defaultFunnel||[]);const contract=state.pmEvents.map(Product.validateAnalyticsEvent);const validCount=contract.filter(x=>x.pass).length;const kpis=Product.kpiSnapshot(combinedEvents());root.innerHTML=`
  <div class="fm-section-head"><div><small>P1 · PM / DATA QUALITY</small><h3>퍼널 · 이벤트 계약 · KPI 관측</h3></div><span class="fm-scope-badge">현재 세션</span></div>
  <div class="fm-kpi-summary"><div><b>${funnel.completedCount}/${funnel.requiredCount}</b><span>핵심 퍼널 단계</span></div><div><b>${funnel.conversionPct}%</b><span>현재 세션 도달률</span></div><div><b>${validCount}/${contract.length||0}</b><span>v1.1 이벤트 계약 유효</span></div></div>
  <div class="fm-funnel">${funnel.steps.map((step,index)=>`<div class="${step.reached?'done':''}"><span>${String(index+1).padStart(2,'0')}</span><b>${escapeHtml(step.name)}</b><small>${step.reached?'관측됨':'미관측'}</small></div>`).join('')}</div>
  <div class="fm-policy-note"><b>다음 미관측 이벤트:</b> ${escapeHtml(funnel.nextMissing||'없음 · 핵심 퍼널 완료')}<br><b>Event contract:</b> name · timestamp · sessionId · version · metadata. 운영/추천 추가 이벤트는 v1.1로 별도 기록합니다.</div>
  <div class="fm-kpi-table"><div class="head"><b>KPI</b><b>분자 / 분모</b><b>현재 세션</b></div>${kpis.map(k=>`<div><span>${escapeHtml(k.label)}${k.inverse?' ↓':''}</span><code>${escapeHtml(k.numerator)} / ${escapeHtml(k.denominator)}</code><strong>${k.rate==null?'—':k.rate+'%'}</strong></div>`).join('')}</div>
  <p class="fm-footnote">현재 값은 1개 프로토타입 세션의 관측값이며 목표 KPI나 실제 사용자 성과가 아닙니다. 실서비스 연동 후 서버 기준 이벤트와 코호트 지표로 교체합니다.</p>`;
}
function renderInspector(){if(!inspectorOpen())return;const tab=activeTab();if(tab==='operations')renderOperations();if(tab==='recommendation')renderRecommendation();if(tab==='pm')renderPm()}
function saveBaseline(){const scenario=sanitizedScenario(currentScenario());if(!scenario)return false;state.recommendationBaseline={savedAt:new Date().toISOString(),matchKey:currentMatchKey(),scored:scenario};persist();record('recommendation_baseline_saved',{pct:scenario.pct});announce('현재 추천을 비교 기준으로 저장했습니다. 필터를 변경한 뒤 다시 확인하세요.');renderRecommendation();return true}
function openInspector(tab){const d=dialog();if(!d)return;d.dataset.returnFocus=document.activeElement?.id||'';d.setAttribute('aria-hidden','false');document.body.classList.add('fm-inspector-open');setTab(tab||activeTab());setTimeout(()=>d.querySelector('.fm-close')?.focus(),0)}
function closeInspector(){const d=dialog();if(!d)return;d.setAttribute('aria-hidden','true');document.body.classList.remove('fm-inspector-open');const id=d.dataset.returnFocus;if(id)document.getElementById(id)?.focus();else document.getElementById('fmProductLauncher')?.focus()}
function installUi(){
  if(document.getElementById('fmProductInspector'))return;
  const launcher=document.createElement('button');launcher.id='fmProductLauncher';launcher.type='button';launcher.className='fm-product-launcher';launcher.setAttribute('aria-haspopup','dialog');launcher.setAttribute('aria-controls','fmProductInspector');launcher.innerHTML='<span aria-hidden="true">✓</span> 제품 검증';launcher.addEventListener('click',()=>openInspector());document.body.appendChild(launcher);
  const live=document.createElement('div');live.id='fmLiveRegion';live.className='fm-sr-only';live.setAttribute('aria-live','polite');live.setAttribute('aria-atomic','true');document.body.appendChild(live);
  const wrap=document.createElement('div');wrap.id='fmProductInspector';wrap.className='fm-product-inspector';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');wrap.setAttribute('aria-hidden','true');wrap.setAttribute('aria-labelledby','fmProductTitle');wrap.dataset.activeTab='operations';wrap.innerHTML=`<div class="fm-inspector-card"><header><div><small>FOOTMATE PRODUCT HARDENING</small><h2 id="fmProductTitle">제품 정책 · 추천 설명 · PM 검증</h2></div><button type="button" class="fm-close" aria-label="제품 검증 패널 닫기">×</button></header><div class="fm-tabs" role="tablist" aria-label="제품 검증 범주"><button type="button" role="tab" data-fm-tab="operations" aria-selected="true">운영 정책</button><button type="button" role="tab" data-fm-tab="recommendation" aria-selected="false" tabindex="-1">추천 설명</button><button type="button" role="tab" data-fm-tab="pm" aria-selected="false" tabindex="-1">PM · 데이터</button></div><div class="fm-panel" data-fm-panel="operations"></div><div class="fm-panel" data-fm-panel="recommendation" hidden></div><div class="fm-panel" data-fm-panel="pm" hidden></div><footer>기획 검증용 상태 시뮬레이션 · 실제 결제/DB/알림/외부 AI 모델 미연동</footer></div>`;document.body.appendChild(wrap);
  wrap.querySelector('.fm-close').addEventListener('click',closeInspector);
  wrap.addEventListener('click',event=>{if(event.target===wrap)closeInspector();const tab=event.target.closest('[data-fm-tab]');if(tab)setTab(tab.dataset.fmTab);const action=event.target.closest('[data-fm-action]')?.dataset.fmAction;if(!action)return;const actions={'payment-fail':simulatePaymentFailure,'payment-retry':retryPayment,'waitlist':joinWaitlist,'promote':promoteWaitlist,'accept-offer':acceptWaitlistOffer,'checkin':checkIn,'complete':completeMatch,'cancel-participation':cancelParticipation,'no-show':markNoShow,'cancel-match':cancelMatch,'reset':resetOperation,'save-baseline':saveBaseline};actions[action]?.()});
  wrap.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeInspector();return}if(event.key==='ArrowRight'||event.key==='ArrowLeft'){const tabs=[...wrap.querySelectorAll('[data-fm-tab]')],current=tabs.findIndex(x=>x.getAttribute('aria-selected')==='true');if(current>=0){event.preventDefault();const next=(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setTab(tabs[next].dataset.fmTab);tabs[next].focus()}}});
}
const originalGo=window.goScreen;
if(typeof originalGo==='function')window.goScreen=function(){const result=originalGo.apply(this,arguments);renderInspector();return result};
installUi();operation();persist();
window.FootMateProductOps={operation,transition,simulatePaymentFailure,retryPayment,joinWaitlist,promoteWaitlist,acceptWaitlistOffer,cancelParticipation,markNoShow,checkIn,completeMatch,cancelMatch,resetOperation,openInspector,closeInspector,renderInspector,saveRecommendationBaseline:saveBaseline,combinedEvents};
console.info('[FootMate] product hardening 2026-09-11 applied');
})();
