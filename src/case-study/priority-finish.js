/* FootMate Case Study · P0/P1 final visual priority finish
   Scope: presentation-only refinement across the current 13-section Case Study.
   Keeps IA, product facts, routes, KPI definitions and runtime behavior unchanged. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';

  function slides(){
    return [...document.querySelectorAll(`${ROOT} .slide:not([hidden])`)];
  }
  function addClass(root,selector,name){
    const node=root?.querySelector(selector);
    if(node)node.classList.add(name);
    return node;
  }
  function markPriority(list){
    const p0=new Set([1,5,6,7,9,10,11]);
    const p1=new Set([0,2,3,4,8,12]);
    list.forEach((slide,index)=>{
      slide.dataset.visualPriority=p0.has(index)?'p0':p1.has(index)?'p1':'';
      slide.dataset.visualPage=String(index+1).padStart(2,'0');
    });
  }

  function patchCover(slide){
    slide.classList.add('fm-priority-cover');
    addClass(slide,'.fm-next-cover-visual','fm-priority-cover-visual');
    addClass(slide,'.fm-next-cover-proof','fm-priority-proof-strip');
  }

  function patchProblem(slide){
    const grid=addClass(slide,'.fm-next-cs-grid.three','fm-priority-problem-map');
    const quote=addClass(slide,'.fm-next-cs-quote','fm-priority-problem-question');
    if(!grid)return false;
    if(!grid.querySelector('.fm-priority-problem-core')){
      const core=document.createElement('div');
      core.className='fm-priority-problem-core';
      core.innerHTML='<small>핵심 문제</small><b>경기 선택의 불확실성</b><span>조건 비교 → 추천 근거 확인 → 참가 결정이 한 흐름으로 이어져야 함</span>';
      grid.prepend(core);
    }
    if(quote)quote.setAttribute('aria-label','문제 정의와 검증 범위');
    return true;
  }

  function patchPersona(slide){
    addClass(slide,'.fm-p1-persona-scene','fm-priority-persona-scene');
    addClass(slide,'.fm-p1-jtbd-journey','fm-priority-persona-sequence');
  }

  function patchPriority(slide){
    addClass(slide,'.fm-p0-journey','fm-priority-journey');
    addClass(slide,'.fm-p0-priority-map','fm-priority-scope-map');
  }

  function patchGuest(slide){
    addClass(slide,'.fm-p0-guest-flow','fm-priority-guest-contrast');
  }

  function patchRecommendation(slide){
    const reco=addClass(slide,'.fm-p0-recommendation','fm-priority-recommendation');
    addClass(slide,'.fm-p0-annotations','fm-priority-recommendation-notes');
    const figure=slide.querySelector('.fm-evidence-figure.is-recommendation');
    if(figure)figure.dataset.priorityScale='hero';
    return Boolean(reco&&figure);
  }

  function patchDetail(slide){
    const layout=addClass(slide,'.fm-evidence-detail-layout','fm-priority-detail-layout');
    const order=slide.querySelector('.fm-next-cs-detail-order');
    if(!layout||!order)return false;
    order.setAttribute('aria-label','참가 결정 정보 우선순위');
    [...order.querySelectorAll(':scope>span')].forEach((node,index)=>{
      node.dataset.decisionStep=String(index+1).padStart(2,'0');
    });
    return true;
  }

  function patchAuth(slide){
    const flow=addClass(slide,'.fm-p1-auth-flow','fm-priority-auth-flow');
    addClass(slide,'.fm-p1-auth-preserve','fm-priority-state-strip');
    addClass(slide,'.fm-p1-auth-boundary','fm-priority-auth-boundary');
    return Boolean(flow);
  }

  function patchOperations(slide){
    const states=addClass(slide,'.fm-next-cs-day-states','fm-priority-matchday-timeline');
    addClass(slide,'.fm-evidence-operations-layout','fm-priority-operations-layout');
    if(!states)return false;
    [...states.children].forEach((node,index)=>{
      if(node instanceof HTMLElement)node.dataset.lifecycleStep=String(index+1).padStart(2,'0');
    });
    return true;
  }

  function patchRecovery(slide){
    const map=addClass(slide,'.fm-p0-recovery-map','fm-priority-recovery-map');
    const strip=addClass(slide,'.fm-evidence-recovery-strip','fm-priority-recovery-evidence');
    if(!map||!strip)return false;
    if(!slide.querySelector('.fm-priority-recovery-principle')){
      const principle=document.createElement('div');
      principle.className='fm-priority-recovery-principle';
      principle.innerHTML='<small>공통 복구 원칙</small><b>원인 · 보존 상태 · 다음 행동을 함께 제시</b>';
      map.insertAdjacentElement('beforebegin',principle);
    }
    return true;
  }

  function patchDomain(slide){
    const architecture=addClass(slide,'.fm-p0-architecture','fm-priority-domain-map');
    const main=addClass(slide,'.fm-p0-arch-main','fm-priority-owner-map');
    if(!architecture||!main)return false;
    const nodes=[...main.querySelectorAll('.fm-p0-arch-node')];
    const owners=['interpret','interpret','interpret','decide','decide','confirm'];
    const labels=['AI 해석','','','추천 엔진','','사용자 확인'];
    nodes.forEach((node,index)=>{
      node.dataset.owner=owners[index]||'';
      if(labels[index])node.dataset.ownerLabel=labels[index];
    });
    addClass(slide,'.fm-p0-arch-guardrails','fm-priority-guardrails');
    return nodes.length===6;
  }

  function pane(label,title,copy,className){
    const node=document.createElement('section');
    node.className=`fm-priority-validation-pane ${className}`;
    node.innerHTML=`<div class="fm-priority-pane-label"><small>${label}</small><b>${title}</b><span>${copy}</span></div>`;
    return node;
  }

  function patchValidation(slide){
    const metrics=slide.querySelector('.fm-p1-metrics');
    const evidence=slide.querySelector('.fm-p1-evidence-grid');
    if(!metrics||!evidence)return false;
    let split=slide.querySelector('.fm-priority-validation-split');
    if(!split){
      split=document.createElement('div');
      split.className='fm-priority-validation-split';
      metrics.insertAdjacentElement('beforebegin',split);
      const metricPane=pane('측정 예정','KPI 정의','Baseline 확보 후 실제 이용자 데이터로 측정','is-metric');
      const evidencePane=pane('현재 근거','제품 동작 검증','Regression · E2E · 접근성 · Production smoke','is-evidence');
      metricPane.appendChild(metrics);
      evidencePane.appendChild(evidence);
      split.append(metricPane,evidencePane);
    }
    addClass(slide,'.fm-p1-validation-note','fm-priority-validation-note');
    return true;
  }

  function patchRelease(slide){
    addClass(slide,'.fm-p1-release-map','fm-priority-release-map');
    addClass(slide,'.fm-p1-release-next','fm-priority-release-next');
  }

  function loadStyle(){
    if(document.querySelector('link[data-fm-priority-finish]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/src/case-study/priority-finish.css?v=1';
    link.dataset.fmPriorityFinish='true';
    link.addEventListener('load',()=>{
      document.documentElement.dataset.fmCaseStudyPriorityFinish='true';
    },{once:true});
    document.head.appendChild(link);
  }

  function apply(){
    const html=document.documentElement;
    if(html.dataset.fmCaseStudyPriorityFinish==='true')return true;
    if(html.dataset.fmCaseStudyDetailFinish!=='true')return false;
    if(html.dataset.fmCaseStudyProductEvidence!=='true')return false;
    const list=slides();
    if(list.length!==13)return false;

    markPriority(list);
    patchCover(list[0]);
    const patched=[
      patchProblem(list[1]),
      patchPersona(list[2])!==false,
      patchPriority(list[3])!==false,
      patchGuest(list[4])!==false,
      patchRecommendation(list[5]),
      patchDetail(list[6]),
      patchAuth(list[7]),
      patchOperations(list[8]),
      patchRecovery(list[9]),
      patchDomain(list[10]),
      patchValidation(list[11])
    ];
    patchRelease(list[12]);
    if(!patched.every(Boolean))return false;
    loadStyle();
    return true;
  }

  if(!apply()){
    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(apply()||tries>1200)clearInterval(timer);
    },25);
  }
})();