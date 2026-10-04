/* FootMate Case Study · P1 visual narrative layer
   Scope: Persona/JTBD, Sign in/Join, KPI/Validation, Release/Learnings.
   Keeps the 13-section IA, headings, product facts, routes, and runtime unchanged. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';

  function byRole(role){
    return document.querySelector(`${ROOT} .fm-next-story-slide[data-v5-content-role="${role}"]`);
  }

  function mark(slide,name){
    if(!slide)return;
    slide.dataset.p1Visual=name;
  }

  function patchPersona(){
    const jtbd=document.querySelector(`${ROOT} .fm-next-cs-jtbd`);
    const slide=jtbd?.closest('.fm-next-story-slide');
    if(!slide||!jtbd)return false;

    let persona=slide.querySelector('.fm-next-cs-persona');
    if(!persona){
      persona=document.createElement('div');
      persona.className='fm-next-cs-persona';
      const anchor=slide.querySelector('.fm-next-review-summary')||slide.querySelector('.fm-next-story-lead');
      if(anchor)anchor.insertAdjacentElement('afterend',persona);
      else slide.querySelector('.fm-next-story-copy')?.appendChild(persona);
    }
    if(!persona.isConnected)return false;

    mark(slide,'persona-jtbd');
    persona.classList.add('fm-p1-persona-scene');
    persona.setAttribute('aria-label','설계용 Persona의 상황, 판단 기준, 불안 요소');
    persona.innerHTML=`
      <div class="fm-p1-persona-context">
        <span>DESIGN PERSONA · 검증 전 가설</span>
        <b>퇴근 후 갈 수 있는 경기<br>오래 고민하지 않고 선택</b>
        <p>평일 저녁 · 주 1~2회 · 30분 안쪽 이동을 가정한 설계용 Persona 가설</p>
      </div>
      <div class="fm-p1-persona-lenses">
        <div data-kind="context"><small>CONTEXT</small><b>주요 상황</b><p>평일 저녁 · 주 1~2회<br>30분 안쪽으로 이동</p></div>
        <div data-kind="criteria"><small>CRITERIA</small><b>결정 기준</b><p>레벨 · 거리<br>포지션 · 남은 자리</p></div>
        <div data-kind="risk"><small>FRICTION</small><b>불안 요소</b><p>실력 차이 · 자리 마감<br>취소 규칙 · 경기 당일 변수</p></div>
      </div>`;

    jtbd.classList.add('fm-p1-jtbd-journey');
    jtbd.setAttribute('aria-label','Persona 가설에서 Beta 관찰까지의 JTBD 흐름');
    jtbd.innerHTML=`
      <div class="fm-p1-jtbd-head"><small>JTBD · 다음 관찰 질문</small><b>상황별로 필요한 화면과 확인할 항목 도출</b></div>
      <ol>
        <li><span>01</span><div><small>SITUATION</small><b>일정에 맞는 후보 찾기</b><p>평일 저녁 · 30분 안쪽 이동</p></div></li>
        <li><span>02</span><div><small>DECISION</small><b>적합성 비교</b><p>각 정보가 선택에 미치는 영향 구분</p></div></li>
        <li class="is-focus"><span>03</span><div><small>JOB</small><b>망설임 없이 결정할 근거</b><p>추천 이유 · 참가 조건 함께 확인</p></div></li>
        <li><span>04</span><div><small>OBSERVE IN BETA</small><b>어디서 망설이는지 관찰</b><p>먼저 보는 조건 · 부족하다고 느끼는 정보</p></div></li>
      </ol>
      <p class="fm-p1-jtbd-caveat">인터뷰 검증 전 가설 · Beta 관찰 후 Persona · 판단 기준 수정 전제</p>`;
    return true;
  }

  function authFrame(no,label,title,body,focus){
    return `<article class="fm-p1-auth-frame${focus?' is-focus':''}">
      <span class="fm-p1-auth-no">${no}</span>
      <div class="fm-p1-auth-screen">
        <small>${label}</small><b>${title}</b><p>${body}</p>
      </div>
    </article>`;
  }

  function patchAuth(){
    const flow=document.querySelector(`${ROOT} .fm-next-cs-auth-flow`);
    const slide=flow?.closest('.fm-next-story-slide');
    const scope=slide?.querySelector('.fm-next-cs-scope');
    if(!slide||!flow||!scope)return false;

    let state=slide.querySelector('.fm-next-cs-state-line');
    if(!state){
      state=document.createElement('div');
      state.className='fm-next-cs-state-line';
      flow.insertAdjacentElement('afterend',state);
    }
    if(!state.isConnected)return false;

    mark(slide,'sign-in-join');
    flow.classList.add('fm-p1-auth-flow');
    flow.setAttribute('aria-label','추천 확인부터 로그인과 참가 상태까지 선택 맥락을 보존하는 흐름');
    flow.innerHTML=`
      ${authFrame('01','둘러보기','추천 · 상세 확인','일정과 정원, 취소 기준을 먼저 검토')}
      <i aria-hidden="true">→</i>
      ${authFrame('02','참가 의도','참가하기','선택 경기 · 참가 의도 다음 단계로 전달')}
      <i aria-hidden="true">→</i>
      ${authFrame('03','인증','로그인','계정 연결 후 원래 상세로 복귀',true)}
      <i aria-hidden="true">→</i>
      <article class="fm-p1-auth-frame fm-p1-auth-result">
        <span class="fm-p1-auth-no">04</span>
        <div class="fm-p1-auth-screen"><small>참가 상태</small><b>결과에 맞는 다음 행동</b>
          <div class="fm-p1-result-chips"><span data-state="done">완료</span><span data-state="fail">실패</span><span data-state="cancel">취소</span></div>
        </div>
      </article>`;

    state.classList.add('fm-p1-auth-preserve');
    state.innerHTML='<span><small>상태 보존</small><b>선택 경기 + 로그인 후 복귀 위치</b></span>';

    scope.classList.add('fm-p1-auth-boundary');
    scope.setAttribute('aria-label','Real App과 Closed Beta의 인증 및 참가 구현 경계');
    [...scope.querySelectorAll('div')].forEach((row,index)=>{
      row.dataset.boundary=index===0?'simulation':index===1?'connected':'verified';
    });
    return true;
  }

  function ratio(name,numerator,denominator,tone){
    return `<div class="fm-p1-ratio" data-tone="${tone}"><b>${name}</b><span><small>분자</small>${numerator}</span><i>÷</i><span><small>분모</small>${denominator}</span></div>`;
  }

  function patchKPI(){
    const slide=byRole('validation-evidence');
    const metrics=slide?.querySelector('.fm-next-cs-metrics');
    const qa=slide?.querySelector('.fm-next-cs-grid.three');
    const note=slide?.querySelector('.fm-next-cs-note');
    if(!slide||!metrics||!qa||!note)return false;

    mark(slide,'kpi-validation');
    metrics.classList.add('fm-p1-metrics');
    metrics.setAttribute('aria-label','측정 성과가 아닌 Validation Metric 정의와 사용자 퍼널');
    metrics.innerHTML=`
      <div class="fm-p1-validation-banner"><span>VALIDATION METRIC</span><b>Measured Result 아님</b><p>목표치보다 분자 · 분모 · 제외 조건 · 기준값 우선 정의</p></div>
      <div class="fm-p1-funnel-wrap">
        <div class="fm-p1-funnel" aria-label="탐색 결과 노출에서 상세 진입과 참가 완료까지의 관찰 퍼널">
          <div><small>01 · DISCOVERY</small><b>결과 노출</b><span>탐색 결과 확인</span></div>
          <i aria-hidden="true">→</i>
          <div class="is-focus"><small>02 · DETAIL</small><b>상세 진입</b><span>참가 판단 정보 확인</span></div>
          <i aria-hidden="true">→</i>
          <div><small>03 · JOIN</small><b>참가 완료</b><span>무료 Beta 핵심 전환</span></div>
        </div>
        <div class="fm-p1-funnel-ratios">
          ${ratio('탐색 → 상세','상세 진입 세션','결과 노출 세션','primary')}
          ${ratio('상세 → 참가','참가 완료 사용자','상세 조회 사용자','primary')}
        </div>
      </div>
`;

    qa.classList.add('fm-p1-evidence-grid');
    qa.setAttribute('aria-label','Validation Metric과 구분되는 제품 검증 evidence');
    const labels=['AUTOMATED QA','HUMAN CHECK','AI-ASSISTED REVIEW'];
    [...qa.children].forEach((card,index)=>{
      if(!card.querySelector('.fm-p1-evidence-label'))card.insertAdjacentHTML('afterbegin',`<span class="fm-p1-evidence-label">${labels[index]||'EVIDENCE'}</span>`);
    });

    let split=slide.querySelector('.fm-p1-validation-split');
    if(!split){
      split=document.createElement('div');
      split.className='fm-p1-validation-split';
      split.setAttribute('aria-label','Validation Metric과 제품 검증 evidence 분리');
      metrics.parentNode.insertBefore(split,metrics);
      split.append(metrics,qa);
    }
    note.classList.add('fm-p1-validation-note');
    return true;
  }

  function releaseItem(status,label,copy){
    return `<li data-status="${status}"><span>${label}</span><b>${copy}</b></li>`;
  }

  function patchRelease(){
    const slide=byRole('production-boundary');
    const copy=slide?.querySelector('.fm-next-story-copy');
    if(!slide||!copy)return false;

    let outcomes=slide.querySelector('.fm-next-cs-outcomes');
    if(!outcomes){
      outcomes=document.createElement('div');
      outcomes.className='fm-next-cs-outcomes';
      const anchor=copy.querySelector('.fm-next-review-summary')||copy.querySelector('.fm-next-story-lead');
      if(anchor)anchor.insertAdjacentElement('afterend',outcomes);
      else copy.appendChild(outcomes);
    }
    const final=slide.querySelector('.fm-next-cs-final');

    mark(slide,'release-boundary');
    outcomes.classList.add('fm-p1-release-map');
    outcomes.setAttribute('aria-label','Real App, Closed Beta, 미연동 및 미검증 범위');
    outcomes.innerHTML=`
      <article data-zone="real-app">
        <header><small>REAL APP</small><b>사용자에게 보여주는 제품 표면</b></header>
        <ul>
          ${releaseItem('connected','실연동','AI Gateway')}
          ${releaseItem('implemented','구현','결정론적 추천')}
          ${releaseItem('sample','샘플','경기 데이터')}
          ${releaseItem('simulation','시뮬레이션','인증 · 결제 · 정원 · 알림')}
        </ul>
      </article>
      <article class="is-focus" data-zone="closed-beta">
        <header><small>CLOSED BETA</small><b>운영 검증을 위한 실제 연결</b></header>
        <ul>
          ${releaseItem('connected','실연동','Supabase 인증 · 경기 · 정원')}
          ${releaseItem('connected','실연동','참가 · 취소 · 체크인')}
          ${releaseItem('connected','실연동','Google/Kakao OAuth')}
          ${releaseItem('connected','실연동','이메일 · Web Push · 미디어')}
        </ul>
      </article>
      <article data-zone="open-boundary">
        <header><small>OPEN BOUNDARY</small><b>아직 연결하거나 검증하지 않은 범위</b></header>
        <ul>
          ${releaseItem('not-connected','미연동','실제 PG')}
          ${releaseItem('not-connected','미연동','외부 분석 도구')}
          ${releaseItem('not-measured','미검증','수익성 · 실제 이용 지표')}
        </ul>
      </article>`;
    final?.classList.add('fm-p1-release-next');
    return true;
  }

  function patchAll(){
    const patched=[patchPersona(),patchAuth(),patchKPI(),patchRelease()];
    return patched.every(Boolean);
  }

  function apply(){
    if(document.documentElement.dataset.fmCaseStudyP1Visuals==='true')return true;
    if(document.documentElement.dataset.fmCaseStudyP0Visuals!=='true')return false;
    if(document.documentElement.dataset.footmateCaseStudyFinalClarity!=='1')return false;
    if(!patchAll())return false;
    document.documentElement.dataset.fmCaseStudyP1Visuals='true';
    document.documentElement.dataset.fmCaseStudyP1FinalRepair='true';
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
