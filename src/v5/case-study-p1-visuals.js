/* FootMate Case Study · P1 visual narrative layer
   Scope: Persona/JTBD, Sign in/Join, KPI/Validation, Release/Learnings.
   Keeps the 13-section IA, headings, product facts, routes, and runtime unchanged. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';

  function slides(){
    return [...document.querySelectorAll(`${ROOT} .slide`)];
  }

  function byRole(role){
    return document.querySelector(`${ROOT} .fm-next-story-slide[data-v5-content-role="${role}"]`);
  }

  function mark(slide,name){
    if(!slide)return;
    slide.dataset.p1Visual=name;
  }

  function patchPersona(){
    const all=slides();
    const slide=all[2];
    const persona=slide?.querySelector('.fm-next-cs-persona');
    const jtbd=slide?.querySelector('.fm-next-cs-jtbd');
    if(!slide||!persona||!jtbd)return false;

    mark(slide,'persona-jtbd');
    persona.classList.add('fm-p1-persona-scene');
    persona.setAttribute('aria-label','설계용 Persona의 상황, 판단 기준, 불안 요소');
    persona.innerHTML=`
      <div class="fm-p1-persona-context">
        <span>DESIGN PERSONA · 검증 전 가설</span>
        <b>퇴근 후 갈 수 있는 경기를<br>오래 고민하지 않고 고르고 싶습니다.</b>
        <p>평일 저녁 · 주 1~2회 · 30분 안쪽 이동을 가정한 설계용 Persona입니다.</p>
      </div>
      <div class="fm-p1-persona-lenses">
        <div data-kind="context"><small>CONTEXT</small><b>주요 상황</b><p>평일 저녁 · 주 1~2회<br>30분 안쪽으로 이동</p></div>
        <div data-kind="criteria"><small>CRITERIA</small><b>결정 기준</b><p>레벨 · 거리<br>포지션 · 남은 자리</p></div>
        <div data-kind="risk"><small>FRICTION</small><b>불안 요소</b><p>실력 차이 · 자리 마감<br>취소 규칙 · 경기 당일 변수</p></div>
      </div>`;

    jtbd.classList.add('fm-p1-jtbd-journey');
    jtbd.setAttribute('aria-label','Persona 가설에서 Beta 관찰까지의 JTBD 흐름');
    jtbd.innerHTML=`
      <div class="fm-p1-jtbd-head"><small>JTBD · 다음 관찰 질문</small><b>가설을 화면 요구사항과 관찰 항목으로 연결합니다.</b></div>
      <ol>
        <li><span>01</span><div><small>SITUATION</small><b>갈 수 있는 경기 찾기</b><p>평일 저녁 · 30분 안쪽 이동</p></div></li>
        <li><span>02</span><div><small>DECISION</small><b>맞는지 빠르게 판단</b><p>레벨 · 거리 · 포지션 · 남은 자리</p></div></li>
        <li class="is-focus"><span>03</span><div><small>JOB</small><b>“나와 잘 맞는 이유를 빠르게 이해하고 싶다.”</b><p>추천 이유와 참가 조건을 함께 확인</p></div></li>
        <li><span>04</span><div><small>OBSERVE IN BETA</small><b>어디서 망설이는지 관찰</b><p>먼저 보는 조건 · 부족하다고 느끼는 정보</p></div></li>
      </ol>
      <p class="fm-p1-jtbd-caveat">인터뷰로 검증한 집단이 아니며, Beta 관찰을 통해 Persona와 판단 기준을 수정할 전제입니다.</p>`;
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
    const slide=byRole('auth-participation');
    const flow=slide?.querySelector('.fm-next-cs-auth-flow');
    const state=slide?.querySelector('.fm-next-cs-state-line');
    const scope=slide?.querySelector('.fm-next-cs-scope');
    if(!slide||!flow||!state||!scope)return false;

    mark(slide,'sign-in-join');
    flow.classList.add('fm-p1-auth-flow');
    flow.setAttribute('aria-label','추천 확인부터 로그인과 참가 상태까지 선택 맥락을 보존하는 흐름');
    flow.innerHTML=`
      ${authFrame('01','둘러보기','추천 · 상세 확인','로그인 전에도 경기 가치와 참가 조건을 확인합니다.')}
      <i aria-hidden="true">→</i>
      ${authFrame('02','참가 의도','참가하기','선택한 경기와 참가 의도를 다음 단계로 전달합니다.')}
      <i aria-hidden="true">→</i>
      ${authFrame('03','인증','로그인','인증 때문에 같은 경기를 다시 찾지 않도록 맥락을 유지합니다.',true)}
      <i aria-hidden="true">→</i>
      <article class="fm-p1-auth-frame fm-p1-auth-result">
        <span class="fm-p1-auth-no">04</span>
        <div class="fm-p1-auth-screen"><small>참가 상태</small><b>결과에 맞는 다음 행동</b>
          <div class="fm-p1-result-chips"><span data-state="done">완료</span><span data-state="fail">실패</span><span data-state="cancel">취소</span></div>
        </div>
      </article>`;

    state.classList.add('fm-p1-auth-preserve');
    state.innerHTML='<span><small>STATE PRESERVED</small><b>선택 경기 + 로그인 후 복귀 위치</b></span>';

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
      <div class="fm-p1-validation-banner"><span>VALIDATION METRIC</span><b>Measured Result가 아닙니다.</b><p>목표치보다 먼저 분자·분모·제외 조건과 기준값을 정의합니다.</p></div>
      <div class="fm-p1-funnel-wrap">
        <div class="fm-p1-funnel" aria-label="탐색 결과 노출에서 상세 진입과 참가 완료까지의 관찰 퍼널">
          <div><small>01 · DISCOVERY</small><b>결과 노출</b><span>탐색 결과를 확인</span></div>
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
      <div class="fm-p1-secondary-metrics">
        ${ratio('실패 → 복구','복구 완료 흐름','복구 가능 실패 흐름','recovery')}
        ${ratio('7일 내 재탐색','7일 내 재탐색 사용자','7일 관찰 완료 참가 사용자','return')}
      </div>`;

    qa.classList.add('fm-p1-evidence-grid');
    qa.setAttribute('aria-label','Validation Metric과 구분되는 제품 검증 evidence');
    const labels=['AUTOMATED QA','HUMAN CHECK','AI-ASSISTED REVIEW'];
    [...qa.children].forEach((card,index)=>{
      card.insertAdjacentHTML('afterbegin',`<span class="fm-p1-evidence-label">${labels[index]||'EVIDENCE'}</span>`);
    });
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

  function apply(){
    if(document.documentElement.dataset.fmCaseStudyP1Visuals==='true')return true;
    if(document.documentElement.dataset.fmCaseStudyP0Visuals!=='true')return false;
    if(document.documentElement.dataset.footmateCaseStudyFinalClarity!=='1')return false;
    if(slides().length!==16)return false;

    const patched=[patchPersona(),patchAuth(),patchKPI(),patchRelease()];
    if(!patched.every(Boolean))return false;
    document.documentElement.dataset.fmCaseStudyP1Visuals='true';
    return true;
  }

  if(!apply()){
    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(apply()||tries>200)clearInterval(timer);
    },25);
  }
})();
