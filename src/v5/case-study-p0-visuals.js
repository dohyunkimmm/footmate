/* FootMate Case Study · P0 visual narrative layer
   Scope: visual structure only for five approved sections.
   Keeps the 13-section IA, section headings, product facts, routes, and runtime unchanged. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';

  function section(role){
    return document.querySelector(`${ROOT} .fm-next-story-slide[data-v5-content-role="${role}"]`);
  }

  function mark(slide,name){
    if(!slide)return;
    slide.dataset.p0Visual=name;
  }

  function patchJourney(){
    const slide=section('product-thesis-journey');
    const flow=slide?.querySelector('.fm-next-cs-loop');
    const principles=slide?.querySelector('.fm-next-cs-principles');
    if(!slide||!flow||!principles)return false;

    mark(slide,'journey');
    flow.classList.add('fm-p0-journey');
    flow.setAttribute('aria-label','FootMate 핵심 사용자 여정: 탐색, 결정, 참가, 경기, 재탐색');
    flow.innerHTML=[
      ['01','탐색','Find','조건을 정하고 맞는 경기를 찾습니다.'],
      ['02','결정','Decide','추천 이유와 참가 조건을 확인합니다.'],
      ['03','참가','Join','선택을 유지한 채 로그인하고 참가합니다.'],
      ['04','경기','Play','경기 당일 상태와 체크인을 확인합니다.'],
      ['05','재탐색','Return','경기 후 신호를 다음 탐색에 잇습니다.']
    ].map(([no,ko,en,copy],index)=>`
      <div class="fm-p0-journey-step">
        <span class="fm-p0-step-no">${no}</span>
        <div><b>${ko}</b><small>${en}</small><p>${copy}</p></div>
      </div>${index<4?'<i class="fm-p0-journey-arrow" aria-hidden="true">→</i>':''}
    `).join('');

    principles.classList.add('fm-p0-priority-map');
    principles.setAttribute('aria-label','현재 제품 범위 우선순위');
    [...principles.children].forEach((card,index)=>{
      card.classList.add('fm-p0-priority-card');
      card.dataset.priority=index===0?'now':index===1?'next':'excluded';
      const labels=['NOW · 먼저 검증','NEXT · 확장 검증','OUT · 이번 범위 제외'];
      card.insertAdjacentHTML('afterbegin',`<span class="fm-p0-priority-label">${labels[index]}</span>`);
    });
    return true;
  }

  function routeStep(no,title,meta){
    return `<div class="fm-p0-route-step"><span>${no}</span><b>${title}</b><small>${meta}</small></div>`;
  }

  function patchGuestFirst(){
    const slide=section('guest-first-decision');
    const comparison=slide?.querySelector('.fm-next-cs-before-after');
    if(!slide||!comparison)return false;

    mark(slide,'guest-first');
    comparison.classList.add('fm-p0-guest-flow');
    comparison.setAttribute('aria-label','가입 우선 흐름과 탐색 우선 흐름 비교');
    comparison.innerHTML=`
      <article class="fm-p0-route is-before">
        <header><span>비교한 대안</span><b>가입 우선</b><p>가치 확인 전에 계정 생성이 필요합니다.</p></header>
        <div class="fm-p0-route-steps">
          ${routeStep('01','첫 화면','진입')}
          <i class="fm-p0-route-arrow" aria-hidden="true">→</i>
          ${routeStep('02','로그인','계정 요구')}
          <i class="fm-p0-route-arrow" aria-hidden="true">→</i>
          ${routeStep('03','설문','조건 입력')}
          <i class="fm-p0-route-arrow" aria-hidden="true">→</i>
          ${routeStep('04','추천 확인','가치 확인')}
        </div>
      </article>
      <article class="fm-p0-route is-selected">
        <header><span>채택한 흐름</span><b>탐색 우선</b><p>추천을 확인한 뒤 참가 의도가 생겼을 때 로그인합니다.</p></header>
        <div class="fm-p0-route-steps">
          ${routeStep('01','조건 설정','탐색')}
          <i class="fm-p0-route-arrow" aria-hidden="true">→</i>
          ${routeStep('02','추천','가치 확인')}
          <i class="fm-p0-route-arrow" aria-hidden="true">→</i>
          ${routeStep('03','상세','참가 판단')}
          <i class="fm-p0-route-arrow" aria-hidden="true">→</i>
          ${routeStep('04','로그인','참가 직전')}
        </div>
      </article>`;
    return true;
  }

  function patchRecommendation(){
    const slide=section('recommendation-decision');
    const surface=slide?.querySelector('.fm-next-cs-reco');
    if(!slide||!surface)return false;

    mark(slide,'recommendation');
    surface.classList.add('fm-p0-recommendation');
    surface.setAttribute('aria-label','Real App 정보 구조를 축약한 추천 화면과 추천 입력 근거');
    surface.innerHTML=`
      <div class="fm-p0-reco-stage">
        <div class="fm-p0-app-frame">
          <div class="fm-p0-app-top"><b>FootMate</b><span>추천 경기</span></div>
          <div class="fm-p0-app-context"><small>오늘의 추천</small><b>저장한 조건과 현재 경기 상태를 함께 봅니다.</b></div>
          <article class="fm-p0-match-card">
            <div class="fm-p0-match-meta"><span>오늘 20:00</span><span>수원 영통</span></div>
            <h3>조건과 잘 맞아요</h3>
            <div class="fm-p0-reason-chips">
              <span><i>1</i>생활권 일치</span>
              <span><i>2</i>평일 저녁 선호</span>
              <span><i>3</i>MF 자리 있음</span>
            </div>
            <div class="fm-p0-match-footer"><span>현재 경기 조건 반영</span><strong>추천 1순위</strong></div>
          </article>
          <div class="fm-p0-ui-caption"><span>Real App 정보 구조 기반</span><b>점수보다 이유를 먼저 읽는 추천 표면</b></div>
        </div>
      </div>
      <ol class="fm-p0-annotations">
        <li><span>01</span><div><b>저장 프로필</b><p>사용자의 기본 수준과 프로필을 반복 입력하지 않습니다.</p></div></li>
        <li><span>02</span><div><b>선호 지역 · 시간 · 경기 형식</b><p>최근 선호는 추천을 돕는 입력으로만 사용합니다.</p></div></li>
        <li><span>03</span><div><b>최근 확인 이력</b><p>반복 탐색의 입력 부담을 줄이되 오늘의 의도를 덮지 않습니다.</p></div></li>
        <li><span>04</span><div><b>현재 경기 조건 · 잔여 자리</b><p>추천 후보·순위·이유는 결정론적 추천 엔진이 결정합니다.</p></div></li>
      </ol>`;
    return true;
  }

  function recoveryRow(problem,preserve,next,tone){
    return `<div class="fm-p0-recovery-row" data-tone="${tone}">
      <div class="fm-p0-recovery-problem"><small>문제</small><b>${problem}</b></div>
      <i aria-hidden="true">→</i>
      <div class="fm-p0-recovery-preserve"><small>보존</small><b>${preserve}</b></div>
      <i aria-hidden="true">→</i>
      <div class="fm-p0-recovery-next"><small>다음 행동</small><b>${next}</b></div>
    </div>`;
  }

  function patchRecovery(){
    const slide=section('recovery-principle');
    const recovery=slide?.querySelector('.fm-next-cs-recovery');
    if(!slide||!recovery)return false;

    mark(slide,'recovery');
    recovery.classList.add('fm-p0-recovery-map');
    recovery.setAttribute('aria-label','문제 발생 시 보존할 상태와 다음 행동');
    recovery.innerHTML=`
      <div class="fm-p0-recovery-head" aria-hidden="true"><span>문제</span><span>보존할 상태</span><span>다음 행동</span></div>
      ${recoveryRow('추천 없음','입력한 탐색 조건','지역·시간 수정 또는 조건 완화','search')}
      ${recoveryRow('자리 마감','선택 경기와 포지션','대기 등록 또는 비슷한 경기 탐색','capacity')}
      ${recoveryRow('결제 실패 · 시뮬레이션','선택 경기와 참가 의도','재시도 또는 결제수단 변경','payment')}
      ${recoveryRow('경기 당일 문제','참가·체크인 상태','체크인 재시도 또는 운영 도움','matchday')}`;
    return true;
  }

  function architectureNode(kind,title,copy,focus){
    return `<div class="fm-p0-arch-node${focus?' is-focus':''}" data-kind="${kind}"><small>${kind}</small><b>${title}</b><span>${copy}</span></div>`;
  }

  function patchDomainAI(){
    const slide=section('domain-ai-boundary');
    const modes=slide?.querySelector('.fm-next-cs-modes');
    if(!slide||!modes)return false;

    mark(slide,'domain-ai');
    modes.classList.add('fm-p0-architecture');
    modes.setAttribute('aria-label','AI 해석과 결정론적 추천 엔진의 책임 분리');
    modes.innerHTML=`
      <div class="fm-p0-arch-main">
        ${architectureNode('INPUT','자연어 요청','사용자가 원하는 경기 조건')}
        <i aria-hidden="true">→</i>
        ${architectureNode('AI','조건 해석','자연어를 검색 조건으로 변환')}
        <i aria-hidden="true">→</i>
        ${architectureNode('CONTRACT','구조화 조건','시간 · 거리 · 가격 · 포지션')}
        <i aria-hidden="true">→</i>
        ${architectureNode('RECOMMENDATION','추천 엔진','후보 · 순위 · 이유 결정',true)}
        <i aria-hidden="true">→</i>
        ${architectureNode('OUTPUT','추천 결과','이유와 현재 경기 상태 표시')}
        <i aria-hidden="true">→</i>
        ${architectureNode('HITL','사용자 확인','참가 · 결제는 최종 확인 후 실행')}
      </div>
      <div class="fm-p0-arch-guardrails">
        <div><span>AI 실패</span><b>Rules fallback으로 탐색 계속</b></div>
        <div><span>Realtime</span><b>변경 신호 수신 후 서버 상태 재조회</b></div>
        <div><span>Guardrail</span><b>AI가 경기 사실 · 가격 · 정원 · 순위를 생성하지 않음</b></div>
      </div>`;
    return true;
  }

  function apply(){
    if(document.documentElement.dataset.fmCaseStudyP0Visuals==='true')return true;
    const ready=[
      section('product-thesis-journey'),
      section('guest-first-decision'),
      section('recommendation-decision'),
      section('recovery-principle'),
      section('domain-ai-boundary')
    ].every(Boolean);
    if(!ready)return false;

    const patched=[patchJourney(),patchGuestFirst(),patchRecommendation(),patchRecovery(),patchDomainAI()];
    if(!patched.every(Boolean))return false;
    document.documentElement.dataset.fmCaseStudyP0Visuals='true';
    return true;
  }

  let tries=0;
  function boot(){
    if(apply())return;
    if(tries++<30)requestAnimationFrame(boot);
  }
  boot();
})();
