/* FootMate Case Study · structured copy and hierarchy contract.
   Structured tables, flows, and cards use compact phrase grammar.
   Explanatory prose stays outside those structured components. */
(function(){
  let applied=false;

  function visibleSlides(){return [...document.querySelectorAll('.slide:not([hidden])')];}
  function linesHTML(items){return items.map(text=>`<span class="fm-cs-line">${text}</span>`).join(' ');}
  function setLines(root,selector,items){const node=root?.querySelector(selector);if(node)node.innerHTML=linesHTML(items);return node;}
  function setText(root,selector,text){const node=root?.querySelector(selector);if(node)node.textContent=text;return node;}
  function row(root,label){return [...(root?.querySelectorAll('.fm-cs-reasons>div')||[])].find(item=>item.querySelector('dt')?.textContent.trim()===label);}
  function setRow(root,label,text){const value=row(root,label)?.querySelector('dd');if(value)value.textContent=text;return value;}
  function setCardText(container,index,text){const card=container?.querySelectorAll('.fm-next-cs-card')?.[index];if(card)setText(card,'p',text);return card;}
  function stripTerminalPunctuation(root,selector){
    root?.querySelectorAll(selector).forEach(node=>{node.textContent=(node.textContent||'').trim().replace(/[.!?。]+$/,'');});
  }

  function moveKpiDisclosure(validation){
    const button=validation?.querySelector('.fm-next-kpi-open');
    const metrics=validation?.querySelector('.fm-next-cs-metrics');
    if(!button||!metrics)return;
    let action=validation.querySelector('.fm-next-kpi-disclosure-row');
    if(!action){
      action=document.createElement('div');
      action.className='fm-next-kpi-disclosure-row';
      action.setAttribute('aria-label','KPI 계산·관찰 기준');
      metrics.insertAdjacentElement('afterend',action);
    }
    action.appendChild(button);
  }

  function patch(){
    if(applied)return true;
    const slides=visibleSlides();
    if(slides.length!==13||document.querySelectorAll('.fm-next-review-summary').length!==12)return false;

    // 01 · Overview — preserve the approved cover.

    // 02 · Problem & Goal — structured evidence stays compact.
    const problemCards=slides[1].querySelector('.fm-next-cs-grid.three');
    setCardText(problemCards,0,'시간 · 거리 · 레벨 한곳 비교 · 확인 지표 · 상세 진입률 · 결과 없음 비율');
    setCardText(problemCards,1,'추천 이유 · 정원 · 취소 규칙 우선 노출 · 확인 지표 · 참가 전환율 · 참가 실패율');
    setCardText(problemCards,2,'체크인 · 경기 후 피드백 → 다음 탐색 · 확인 지표 · 체크인 완료율 · 재탐색률');
    setRow(slides[1],'대안','목록·필터 조건 비교 · 지도 위치 확인 · 커뮤니티 경기 맥락 확인');
    setRow(slides[1],'선택','조건 해석 → 추천 이유 → 참가 → 경기 당일');
    setRow(slides[1],'검증 범위','설계 가설 · 사용자 조사·경쟁사 우위 미입증 · Beta 검증');

    // 03 · Persona · JTBD — one compact value per peer card; JTBD is a phrase flow.
    const persona=slides[2].querySelectorAll('.fm-next-cs-persona>div');
    if(persona[0])setText(persona[0],'b','평일 저녁 · 주 1~2회 · 30분 안쪽 이동');
    if(persona[1])setText(persona[1],'b','시간 · 거리 · 레벨 · 포지션 · 남은 자리');
    if(persona[2])setText(persona[2],'b','교육생 6명 · iOS 4 · Android 2');
    setText(slides[2],'.fm-next-cs-jtbd p','가설 · 맞는 이유 빠른 이해 → 과업 · 회원가입 전·Kakao·Google·이메일 가입 → 관찰 · 동선별 버그·막힘');

    // 04 · Scope & Priority — card bodies are phrase grammar.
    const principles=slides[3].querySelector('.fm-next-cs-principles');
    setCardText(principles,0,'판단 기준 한곳 정리 · 선택 맥락 보존 · Beta 검증 · 인증·정원·참가·취소·체크인·복구');
    setCardText(principles,1,'대기열·알림·경기 후 피드백 → 자리 회복·재탐색 · 후속 검증 · 참가 전환·반복 이용');
    setCardText(principles,2,'실제 PG 유보 · 수익화 검증 제외 · AI 자동 참가 제외 · 사용자 최종 확인(HITL)');

    // 05 · Guest First — decision, reason, and trade-off are peer phrase values.
    const alternatives=slides[4].querySelectorAll('.fm-next-cs-before-after>div');
    if(alternatives[0])setText(alternatives[0],'p','가치 확인 전 계정 생성 필요');
    if(alternatives[1])setText(alternatives[1],'p','추천 확인 후 가입 여부 결정');
    setRow(slides[4],'결정','가입 전 추천 · 상세 공개');
    setRow(slides[4],'이유','참가 의도 전 서비스 가치 판단');
    setRow(slides[4],'Trade-off','로그인 전 계정 기반 개인화 · 기기 간 연속성 제한');

    // 06 · Recommendation — ownership and trade-off stay scannable.
    setRow(slides[5],'결정','최근 선호는 추천 보조 입력으로만 사용');
    setRow(slides[5],'품질 기준','추천 후보·순위·이유 소유권 → 결정론적 추천 엔진');
    setRow(slides[5],'Trade-off','현재 조건 수정 · 재탐색 허용');

    // 07 · Decision Detail — action and boundary rows share phrase grammar.
    setRow(slides[6],'핵심 행동','참가하기');
    setRow(slides[6],'보조 행동','저장 · 최대 2경기 비교');
    setRow(slides[6],'Trade-off','비교 대상 제한 · 참가 전 취소·환불 기준 확인');

    // 08 · Sign in · Join — keep the dedicated spacing; normalize only row copy.
    setRow(slides[7],'Real App','인증 · 결제 시뮬레이션');
    setRow(slides[7],'Closed Beta','Supabase 인증 · 참가 실연동');
    setRow(slides[7],'상태 보존','선택 경기 · 로그인 후 복귀 위치 유지');
    setRow(slides[7],'검증 범위','Google/Kakao OAuth Production 실로그인 검증 · 실제 PG 미연동');

    // 09 · Operations — operational rows are compact policy values.
    setRow(slides[8],'운영 권한','경기 · 정원 · 취소 마감 · 체크인 · 종료 관리');
    setRow(slides[8],'자리 회복','취소 시 포지션별 대기열 FIFO 승급');
    setRow(slides[8],'변경과 복구','변경 이력(audit trail) 기록 · 알림 실패와 참가 상태 분리 복구');

    // 10 · Recovery — phrase grammar only.
    stripTerminalPunctuation(slides[9],'.fm-next-cs-recovery b,.fm-next-cs-recovery .fm-cs-line,.fm-next-cs-decision span,.fm-next-cs-decision b');

    // 11 · Domain & AI — responsibility cards and evidence rows use the same compact grammar.
    const modes=slides[10].querySelectorAll('.fm-next-cs-modes>div');
    if(modes[0])setText(modes[0],'p','후보 · 순위 · 이유 → 결정론적 추천 엔진 · AI 해석 실패 → fallback 탐색');
    if(modes[1])setText(modes[1],'p','참가 · 체크인 · 경기 후 상태 책임 분리 · 동일 상태 판단 일원화');
    if(modes[2])setText(modes[2],'p','경기 사실 · 가격 · 정원 · 순위 AI 생성 금지 · 참가 · 결제 사용자 최종 확인');
    setRow(slides[10],'실제 연결','Vercel AI Gateway · Supabase · Resend · Web Push · Storage');
    setRow(slides[10],'미연동','실제 PG · 외부 분석 도구');
    setRow(slides[10],'정의한 기준','API·데이터·권한·오류·재시도 · IA·상태별 화면·CTA · 취소·정원·복구 정책');

    // 12 · KPI & Validation — QA cards stay phrase-style; KPI disclosure is a dedicated action row.
    const qaCards=slides[11].querySelectorAll('.fm-next-cs-grid.three .fm-next-cs-card');
    if(qaCards[0])setText(qaCards[0],'p','Regression · Browser E2E · axe · 상태·복구 · 반응형 · Visual Regression · Production Smoke');
    if(qaCards[1])setText(qaCards[1],'p','실제 OAuth 로그인 · 이메일 최종 전달 · Web Push 브라우저·OS 표시 · 제품 성과와 분리 · 사용자 만족도·전환');
    if(qaCards[2])setText(qaCards[2],'p','중복·용어·구현-설명 불일치 검토 · 보조 검수 · 자동 QA·사람 검수 PASS 대체 아님');
    moveKpiDisclosure(slides[11]);

    // 13 · Release & Learnings — implementation boundary and task evidence stay compact.
    const outcomes=slides[12].querySelectorAll('.fm-next-cs-outcomes>div');
    if(outcomes[0])setText(outcomes[0],'p','AI Gateway 실연동 · 결정론적 추천 · 샘플 경기 데이터 · 인증·결제·정원·알림 시뮬레이션');
    if(outcomes[1])setText(outcomes[1],'p','Supabase 인증·경기·정원·참가/취소 · 체크인 · Google/Kakao OAuth · 이메일 · Web Push · 미디어 실연동');
    if(outcomes[2])setText(outcomes[2],'p','실제 PG · 외부 분석 도구 · 수익성 · 실제 이용 지표 미검증');
    setRow(slides[12],'과업 범위','회원가입 전 2회 · Kakao 2회 · Google 2회 · 이메일 2회 · 총 8회 · 일부 참여자 복수 과업');
    setRow(slides[12],'학습·다음 단계','동선별 버그·막힘 재검증 → 제품·운영 상태 고도화 → Production QA → KPI 측정 준비 · 실제 이용자 KPI Baseline부터 측정');

    // All structured values use phrase grammar. Long-form lead/note prose remains outside this selector.
    const phraseSelector=[
      '.fm-next-review-summary b',
      '.fm-next-cs-card p',
      '.fm-next-cs-stack p',
      '.fm-next-cs-reco-card span','.fm-next-cs-reco-card h3','.fm-next-cs-reco-card div b','.fm-next-cs-reco-card strong',
      '.fm-next-cs-decision>span','.fm-next-cs-decision>b',
      '.fm-next-cs-final>span',
      '.fm-next-cs-persona b',
      '.fm-next-cs-jtbd p',
      '.fm-next-cs-loop b','.fm-next-cs-loop span',
      '.fm-next-cs-before-after small','.fm-next-cs-before-after b','.fm-next-cs-before-after p',
      '.fm-next-cs-auth-flow small','.fm-next-cs-auth-flow b',
      '.fm-next-cs-detail-order span','.fm-next-cs-reco-card strong',
      '.fm-next-cs-modes small','.fm-next-cs-modes h3','.fm-next-cs-modes p',
      '.fm-next-cs-day-states small','.fm-next-cs-day-states b','.fm-next-cs-day-states p',
      '.fm-next-cs-recovery b','.fm-next-cs-recovery .fm-cs-line',
      '.fm-next-cs-outcomes b','.fm-next-cs-outcomes p',
      '.fm-cs-reasons dt','.fm-cs-reasons dd'
    ].join(',');
    slides.forEach(slide=>stripTerminalPunctuation(slide,phraseSelector));

    document.documentElement.dataset.footmateCaseStudyStructuredCopy='2';
    applied=true;
    return true;
  }

  if(patch())return;
  const target=document.querySelector('.track')||document.body;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect();});
  observer.observe(target,{childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return;}if(attempts<80)requestAnimationFrame(retry);})();
})();
