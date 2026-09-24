/* FootMate Case Study · AI/IT Service Planner portfolio polish.
   Scope: reader-facing copy for 03 Persona/JTBD, 06 Recommendation, 11 Domain & AI, 13 Release & Learnings. */
(function(){
  let applied=false;

  function lines(...copy){
    return copy.map(text=>`<span class="fm-cs-line">${text}</span>`).join(' ');
  }

  function setHTML(root,selector,html){
    const node=root?.querySelector(selector);
    if(node)node.innerHTML=html;
    return node;
  }

  function rows(items){
    return `<dl class="fm-cs-reasons">${items.map(([label,copy])=>`<div><dt>${label}</dt><dd>${copy}</dd></div>`).join('')}</dl>`;
  }

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='5.1.1'||
       document.documentElement.dataset.footmateCaseStudySections!=='13')return false;

    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13)return false;

    // 03 · Persona · JTBD — keep the Persona as a design assumption and add task-based usability evidence separately.
    const persona=slides[2];
    setHTML(persona,'.fm-next-story h2',lines(
      '사용자 가정을 요구사항으로 연결하고,',
      '과업 기반 검증으로 동선을 확인했습니다.'
    ));
    setHTML(persona,'.fm-next-story-lead',lines(
      '평일 저녁·주 1~2회·30분 안쪽 이동은 설계용 Persona 가정이며, 인터뷰로 검증한 집단은 아닙니다.',
      'PBL 교육 이후 6명에게 iOS·Android에서 구체 행동 과업을 요청해 탐색·가입 동선의 버그와 막힘을 확인하며 고도화했습니다.'
    ));
    setHTML(persona,'.fm-next-cs-persona',
      '<div><span>설계 가정</span><b>'+lines('평일 저녁 · 주 1~2회','30분 안쪽으로 이동')+'</b></div>'+
      '<div><span>요구사항 반영</span><b>'+lines('시간 · 거리 · 레벨','포지션 · 남은 자리 우선 확인')+'</b></div>'+
      '<div><span>Task 검증</span><b>'+lines('6명 · iOS 4 / Android 2','숙련도·포지션을 나눠 과업 수행')+'</b></div>');
    setHTML(persona,'.fm-next-cs-jtbd','<small>JTBD · 가설 → 과업 → 관찰</small><p>'+lines(
      '“오늘 뛸 수 있는 경기에서, 나와 잘 맞는 이유를 빠르게 이해하고 싶다.”',
      '회원가입 전·Kakao·Google·이메일 가입처럼 구체 행동을 지정해 동선별 버그·막힘을 확인하고 요구사항을 조정했습니다.')+'</p>');

    // 06 · Recommendation — make the product decision explicit before implementation details.
    const recommendation=slides[5];
    setHTML(recommendation,'.fm-next-story h2',lines(
      '개인화는 추천을 돕되,',
      '오늘의 조건을 다시 선택할 수 있게 했습니다.'
    ));
    setHTML(recommendation,'.fm-next-story-lead',lines(
      '저장 프로필·선호 조건·최근 확인 이력은 반복 입력을 줄이는 추천 입력으로 사용합니다.',
      '후보·순위·이유는 결정론적 추천 엔진이 결정하고, 사용자는 현재 조건을 수정해 다시 탐색할 수 있습니다.'
    ));
    setHTML(recommendation,'.fm-next-cs-stack',
      '<p><b>현재 조건</b> 지역 · 시간 · 레벨 · 포지션</p>'+
      '<p><b>경기 사실</b> 일정 · 위치 · 잔여 자리</p>'+
      '<p><b>저장 정보</b> 프로필 · 선호 지역·시간·형식</p>'+
      '<p><b>최근 이력</b> 반복 탐색의 입력 부담을 줄이는 보조 신호</p>');
    setHTML(recommendation,'.fm-next-cs-note',rows([
      ['결정','개인화 정보는 추천을 돕는 입력으로 사용'],
      ['품질 기준','추천 후보·순위·이유의 소유권은 결정론적 추천 엔진에 유지'],
      ['Trade-off','과거 선호와 오늘의 의도가 다를 수 있어 조건 수정과 재탐색을 허용']
    ]));

    // 11 · Domain & AI — keep the proven evidence contracts, improve only the service-planning framing.
    const domain=slides[10];
    setHTML(domain,'.fm-next-story h2',lines(
      '서비스 상태의 책임을 나누고,',
      'AI 실행 경계를 분리했습니다.'
    ));
    setHTML(domain,'.fm-next-story-lead',lines(
      '추천·참가·체크인·경기 후 상태의 소유권을 구분해 화면마다 같은 상태를 따로 판단하지 않게 했습니다.',
      'AI는 조건 해석, 결정론적 추천 엔진은 후보·순위·이유를 맡고 참가·결제는 HITL을 유지합니다.'
    ));

    // 13 · Release & Learnings — surface real task-based usability evidence without turning it into product KPI outcomes.
    const release=slides[12];
    setHTML(release,'.fm-next-story h2',lines(
      '과업 기반 사용자 검증을 반복하며,',
      '구현 결과와 성과 측정을 구분합니다.'
    ));
    setHTML(release,'.fm-next-story-lead',lines(
      'PBL 교육 이후 6명에게 실제 탐색·가입 동선의 구체 행동 과업을 요청해 iOS와 Android에서 사용성을 확인했습니다.',
      '이 결과는 버그와 막힘을 찾기 위한 사용성 검증이며, 전환율 개선이나 시장 적합성을 입증한 Measured Result와는 구분합니다.'
    ));
    setHTML(release,'.fm-next-cs-final','<span>사용성 검증 · 근거와 다음 단계</span>'+rows([
      ['검증 표본','6명 · iOS 4 / Android 2 · 입문 2 / 초급 2 / 중급 1 / 고급 1 · 수비 2 / 공격 2 / 미드필더 2'],
      ['과업 범위','회원가입 전 2회 · Kakao 2회 · Google 2회 · 이메일 2회. 총 8회이며 일부 참여자가 복수 과업을 수행했습니다.'],
      ['학습·한계','구체 행동을 지정해야 해당 동선의 버그·막힘을 찾고 재검증할 수 있었습니다. KPI는 실제 이용자 cohort를 구분한 뒤 Baseline부터 측정합니다.']])+
      '<a href="/app" target="_blank" rel="noopener">FootMate 앱 보기 ↗</a>');

    document.documentElement.dataset.footmateCaseStudyPlannerPolish='96';
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<80)requestAnimationFrame(retry)})();
})();
