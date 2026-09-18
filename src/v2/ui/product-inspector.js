function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function actionButton(action,label,disabled=false,kind='secondary'){
  return `<button type="button" class="fm-action ${kind}" data-fm-action="${escapeHtml(action)}"${disabled?' disabled':''}>${escapeHtml(label)}</button>`;
}

export function installProductInspector({productOps=window.FootMateProductOps,productCore=window.FootMateProductCore,core=window.FootMateCore,finalRuntime=window.FootMateFinalRuntime}={}){
  if(!productOps||!productCore||!core||!finalRuntime)throw new Error('FootMate product inspector dependency missing');

  const state=finalRuntime.state;
  let returnFocus=null;

  const existing=document.getElementById('fmProductInspector');
  existing?.remove();
  document.getElementById('fmLiveRegion')?.remove();
  document.getElementById('fmProductLauncher')?.remove();

  const live=document.createElement('div');
  live.id='fmLiveRegion';
  live.className='fm-sr-only';
  live.setAttribute('aria-live','polite');
  live.setAttribute('aria-atomic','true');
  document.body.appendChild(live);

  const wrap=document.createElement('div');
  wrap.id='fmProductInspector';
  wrap.className='fm-product-inspector';
  wrap.setAttribute('role','dialog');
  wrap.setAttribute('aria-modal','true');
  wrap.setAttribute('aria-hidden','true');
  wrap.setAttribute('aria-labelledby','fmProductTitle');
  wrap.dataset.activeTab='operations';
  wrap.innerHTML=`<div class="fm-inspector-card"><header><div><small>FOOTMATE PRODUCT VALIDATION</small><h2 id="fmProductTitle">제품 정책 · 추천 설명 · PM 검증</h2></div><button type="button" class="fm-close" aria-label="제품 검증 패널 닫기">×</button></header><div class="fm-tabs" role="tablist" aria-label="제품 검증 범주"><button type="button" role="tab" data-fm-tab="operations" aria-selected="true">운영 정책</button><button type="button" role="tab" data-fm-tab="recommendation" aria-selected="false" tabindex="-1">추천 설명</button><button type="button" role="tab" data-fm-tab="pm" aria-selected="false" tabindex="-1">PM · 데이터</button></div><div class="fm-panel" data-fm-panel="operations"></div><div class="fm-panel" data-fm-panel="recommendation" hidden></div><div class="fm-panel" data-fm-panel="pm" hidden></div><footer>기획 검증용 상태 시뮬레이션 · 실제 결제/DB/알림/외부 AI 모델 미연동</footer></div>`;
  document.body.appendChild(wrap);

  function activeTab(){return wrap.dataset.activeTab||'operations'}
  function inspectorOpen(){return wrap.getAttribute('aria-hidden')==='false'}
  function statusLabel(machine,value){return productOps.statusLabel?.(machine,value)||value}
  function announce(message){
    live.textContent='';
    setTimeout(()=>{live.textContent=message},20);
  }
  function renderStatusCard(machine,value){
    const label=machine==='match'?'경기':machine==='payment'?'결제':'참가';
    return `<div class="fm-status-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(statusLabel(machine,value))}</strong><small>${escapeHtml(value)}</small></div>`;
  }
  function setTab(name){
    wrap.dataset.activeTab=name;
    wrap.querySelectorAll('[data-fm-tab]').forEach(button=>{
      const on=button.dataset.fmTab===name;
      button.setAttribute('aria-selected',on?'true':'false');
      button.tabIndex=on?0:-1;
    });
    wrap.querySelectorAll('[data-fm-panel]').forEach(panel=>{panel.hidden=panel.dataset.fmPanel!==name});
    render();
  }
  function renderOperations(){
    const root=wrap.querySelector('[data-fm-panel="operations"]');
    if(!root)return;
    const key=productOps.currentMatchKey();
    const op=productOps.operation(key);
    const meta=window.FootMateV22?.scenarioStore?.getState?.().matches?.[key]||window.FootMateV21?.scenarioStore?.getState?.().matches?.[key]||null;
    const history=(op.history||[]).slice(-6).reverse();
    root.innerHTML=`
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
  function renderRecommendation(){
    const root=wrap.querySelector('[data-fm-panel="recommendation"]');
    if(!root)return;
    const scenario=productOps.currentScenario();
    if(!scenario){root.innerHTML='<p class="fm-empty">추천 계산 상태를 불러오지 못했습니다.</p>';return}
    const explanation=productCore.explainMatch(scenario);
    const baseline=state.recommendationBaseline?.scored;
    const comparison=baseline?productCore.compareRecommendations(baseline,scenario):null;
    const factorRows=explanation.factors.map(f=>`<div class="fm-factor"><div><b>${escapeHtml(f.label)}</b><span>${f.score}점</span></div><div class="fm-factor-track"><i style="width:${f.score}%"></i></div><small>${f.pass?'조건 충족':'조건 불일치'}</small></div>`).join('');
    const exclusions=explanation.exclusions.length?explanation.exclusions.map(x=>`<li>${escapeHtml(x.message)}</li>`).join(''):'<li>하드 필터 제외 조건 없음</li>';
    const delta=comparison?`${comparison.pctDelta>=0?'+':''}${comparison.pctDelta}%p`:null;
    root.innerHTML=`
      <div class="fm-section-head"><div><small>P0 · EXPLAINABLE RECOMMENDATION</small><h3>${escapeHtml(scenario.team||productOps.currentMatchKey())} · ${explanation.pct}%</h3></div><span class="fm-scope-badge ${explanation.eligible?'pass':'check'}">${explanation.eligible?'추천 가능':'필터 제외'}</span></div>
      <div class="fm-reason-summary"><b>추천 이유</b><p>${escapeHtml(explanation.reasons.join(' · ')||'현재 조건에서 강한 추천 요인이 부족합니다.')}</p></div>
      <div class="fm-factor-list">${factorRows}</div>
      <div class="fm-exclusions"><b>제외 이유 / fallback</b><ul>${exclusions}</ul>${explanation.fallback?`<p>${escapeHtml(explanation.fallback.message)} 우선 완화: ${escapeHtml(explanation.fallback.relaxPriority.join(' → '))}</p>`:'<p>현재 후보는 모든 하드 필터를 충족합니다.</p>'}</div>
      <div class="fm-compare"><div><b>조건 변경 전/후 비교</b><span>${comparison?`기준 ${comparison.beforePct}% → 현재 ${comparison.afterPct}% · ${delta}`:'비교 기준을 저장하면 필터 변경 효과를 확인할 수 있습니다.'}</span></div>${actionButton('save-baseline','현재 추천을 비교 기준으로 저장')}</div>
      ${comparison?`<div class="fm-delta-grid">${comparison.factors.filter(f=>f.delta!==0).slice(0,5).map(f=>`<span>${escapeHtml(f.label)} <b>${f.delta>0?'+':''}${f.delta}</b></span>`).join('')||'<span>요인별 점수 변화 없음</span>'}</div>`:''}`;
  }
  function renderPm(){
    const root=wrap.querySelector('[data-fm-panel="pm"]');
    if(!root)return;
    const events=productOps.combinedEvents();
    const funnel=productCore.funnelMetrics(events,core.defaultFunnel||[]);
    const contract=(state.pmEvents||[]).map(productCore.validateAnalyticsEvent);
    const validCount=contract.filter(x=>x.pass).length;
    const kpis=productCore.kpiSnapshot(events);
    root.innerHTML=`
      <div class="fm-section-head"><div><small>P1 · PM / DATA QUALITY</small><h3>퍼널 · 이벤트 계약 · KPI 관측</h3></div><span class="fm-scope-badge">현재 세션</span></div>
      <div class="fm-kpi-summary"><div><b>${funnel.completedCount}/${funnel.requiredCount}</b><span>핵심 퍼널 단계</span></div><div><b>${funnel.conversionPct}%</b><span>현재 세션 도달률</span></div><div><b>${validCount}/${contract.length||0}</b><span>v2.1 이벤트 계약 유효</span></div></div>
      <div class="fm-funnel">${funnel.steps.map((step,index)=>`<div class="${step.reached?'done':''}"><span>${String(index+1).padStart(2,'0')}</span><b>${escapeHtml(step.name)}</b><small>${step.reached?'관측됨':'미관측'}</small></div>`).join('')}</div>
      <div class="fm-policy-note"><b>다음 미관측 이벤트:</b> ${escapeHtml(funnel.nextMissing||'없음 · 핵심 퍼널 완료')}<br><b>Event contract:</b> name · timestamp · sessionId · version · metadata. 운영/추천 추가 이벤트는 v2.1 계약으로 별도 기록합니다.</div>
      <div class="fm-kpi-table"><div class="head"><b>KPI</b><b>분자 / 분모</b><b>현재 세션</b></div>${kpis.map(k=>`<div><span>${escapeHtml(k.label)}${k.inverse?' ↓':''}</span><code>${escapeHtml(k.numerator)} / ${escapeHtml(k.denominator)}</code><strong>${k.rate==null?'—':k.rate+'%'}</strong></div>`).join('')}</div>
      <p class="fm-footnote">현재 값은 1개 프로토타입 세션의 관측값이며 목표 KPI나 실제 사용자 성과가 아닙니다. 실서비스 연동 후 서버 기준 이벤트와 코호트 지표로 교체합니다.</p>`;
  }
  function render(){
    if(!inspectorOpen())return;
    const tab=activeTab();
    if(tab==='operations')renderOperations();
    if(tab==='recommendation')renderRecommendation();
    if(tab==='pm')renderPm();
  }
  function open(tab){
    returnFocus=document.activeElement;
    wrap.setAttribute('aria-hidden','false');
    document.body.classList.add('fm-inspector-open');
    setTab(tab||activeTab());
    setTimeout(()=>wrap.querySelector('.fm-close')?.focus(),0);
  }
  function close(){
    wrap.setAttribute('aria-hidden','true');
    document.body.classList.remove('fm-inspector-open');
    if(returnFocus?.isConnected&&typeof returnFocus.focus==='function')returnFocus.focus();
    else document.getElementById('v3Launcher')?.focus();
    returnFocus=null;
  }

  const actions={
    'payment-fail':productOps.simulatePaymentFailure,
    'payment-retry':productOps.retryPayment,
    waitlist:productOps.joinWaitlist,
    promote:productOps.promoteWaitlist,
    'accept-offer':productOps.acceptWaitlistOffer,
    checkin:productOps.checkIn,
    complete:productOps.completeMatch,
    'cancel-participation':productOps.cancelParticipation,
    'no-show':productOps.markNoShow,
    'cancel-match':productOps.cancelMatch,
    reset:productOps.resetOperation,
    'save-baseline':productOps.saveRecommendationBaseline
  };

  wrap.querySelector('.fm-close').addEventListener('click',close);
  wrap.addEventListener('click',event=>{
    if(event.target===wrap)close();
    const tab=event.target.closest('[data-fm-tab]');
    if(tab)setTab(tab.dataset.fmTab);
    const action=event.target.closest('[data-fm-action]')?.dataset.fmAction;
    if(action)actions[action]?.();
  });
  wrap.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close();return}
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      const tabs=[...wrap.querySelectorAll('[data-fm-tab]')];
      const current=tabs.findIndex(x=>x.getAttribute('aria-selected')==='true');
      if(current>=0){
        event.preventDefault();
        const next=(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
        setTab(tabs[next].dataset.fmTab);
        tabs[next].focus();
      }
    }
  });

  const detach=productOps.attachInspectorUi?.({render,announce,open,close,isOpen:inspectorOpen});
  window.__footmateV22Inspector=true;
  window.FootMateV22Inspector={render,announce,open,close,architecture:'v2.2-product-inspector-module'};

  return{
    render,open,close,
    architecture:'v2.2-product-inspector-module',
    destroy(){
      detach?.();
      wrap.remove();
      live.remove();
      delete window.FootMateV22Inspector;
      window.__footmateV22Inspector=false;
    }
  };
}
