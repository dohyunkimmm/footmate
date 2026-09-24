/* FootMate Case Study · AI/IT Service Planner portfolio polish.
   Scope: reader-facing copy only for 03 Persona/JTBD, 06 Recommendation, 11 Domain & AI. */
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

    // 03 · Persona · JTBD — connect design assumptions to requirements and Beta observation.
    const persona=slides[2];
    setHTML(persona,'.fm-next-story h2',lines(
      '사용자 가정을 요구사항으로 연결하고,',
      'Beta에서 실제 판단 순서를 확인합니다.'
    ));
    setHTML(persona,'.fm-next-story-lead',lines(
      '평일 저녁·주 1~2회·30분 안쪽 이동은 설계용 Persona 가정이며, 인터뷰로 검증한 집단은 아닙니다.',
      '이 가정에서 시간·거리·레벨·포지션·남은 자리를 주요 판단 정보로 두고, 실제 우선순위는 Beta에서 관찰합니다.'
    ));
    setHTML(persona,'.fm-next-cs-persona',
      '<div><span>설계 가정</span><b>'+lines('평일 저녁 · 주 1~2회','30분 안쪽으로 이동')+'</b></div>'+
      '<div><span>요구사항 반영</span><b>'+lines('시간 · 거리 · 레벨','포지션 · 남은 자리 우선 확인')+'</b></div>'+
      '<div><span>Beta 관찰</span><b>'+lines('먼저 확인하는 조건','정보 부족·참가 직전 이탈 지점')+'</b></div>');
    setHTML(persona,'.fm-next-cs-jtbd','<small>JTBD · 가설 → 관찰</small><p>'+lines(
      '“오늘 뛸 수 있는 경기에서, 나와 잘 맞는 이유를 빠르게 이해하고 싶다.”',
      'Persona를 사실로 확정하지 않고, 실제 판단 순서와 망설임 지점을 확인해 요구사항을 조정합니다.')+'</p>');

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

    document.documentElement.dataset.footmateCaseStudyPlannerPolish='95';
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<80)requestAnimationFrame(retry)})();
})();
