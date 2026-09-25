/* FootMate Case Study · structured copy grammar polish.
   Keep short states, steps, CTA labels, and compact values phrase-style without periods.
   Keep reasons, trade-offs, validation notes, and reflective explanations sentence-style. */
(function(){
  let applied=false;

  function visibleSlides(){return [...document.querySelectorAll('.slide:not([hidden])')];}
  function linesHTML(items){return items.map(text=>`<span class="fm-cs-line">${text}</span>`).join(' ');}
  function setLines(root,selector,items){const node=root?.querySelector(selector);if(node)node.innerHTML=linesHTML(items);return node;}
  function setText(root,selector,text){const node=root?.querySelector(selector);if(node)node.textContent=text;return node;}
  function row(root,label){return [...(root?.querySelectorAll('.fm-cs-reasons>div')||[])].find(item=>item.querySelector('dt')?.textContent.trim()===label);}
  function setRow(root,label,text){const value=row(root,label)?.querySelector('dd');if(value)value.textContent=text;return value;}
  function setCardLines(container,index,items){const card=container?.querySelectorAll('.fm-next-cs-card')?.[index];if(card)setLines(card,'p',items);return card;}
  function stripTerminalPunctuation(root,selector){
    root?.querySelectorAll(selector).forEach(node=>{node.textContent=(node.textContent||'').trim().replace(/[.!?。]+$/,'');});
  }

  function patch(){
    if(applied)return true;
    const slides=visibleSlides();
    if(slides.length!==13||document.querySelectorAll('.fm-next-review-summary').length!==12)return false;

    // 01 · Overview — preserve the already-approved cover and visual baseline.

    // 02 · Problem & Goal — problem cards are scannable facts; validation remains a sentence.
    const problemCards=slides[1].querySelector('.fm-next-cs-grid.three');
    setCardLines(problemCards,0,['시간 · 거리 · 레벨 한곳 비교','확인 지표 · 상세 진입률 · 결과 없음 비율']);
    setCardLines(problemCards,1,['추천 이유 · 정원 · 취소 규칙 우선 노출','확인 지표 · 참가 전환율 · 참가 실패율']);
    setCardLines(problemCards,2,['체크인 · 경기 후 피드백 → 다음 탐색','확인 지표 · 체크인 완료율 · 재탐색률']);
    setRow(slides[1],'대안','목록·필터 조건 비교 · 지도 위치 확인 · 커뮤니티 경기 맥락 확인');
    setRow(slides[1],'선택','조건 해석 → 추천 이유 → 참가 → 경기 당일');
    setRow(slides[1],'검증 범위','사용자 조사나 경쟁사 우위가 입증된 결론은 아니며, Beta에서 가설을 확인합니다.');

    // 03 · Persona · JTBD — persona values stay compact; JTBD/observation copy stays explanatory.
    const persona=slides[2].querySelectorAll('.fm-next-cs-persona>div');
    if(persona[0])setLines(persona[0],'b',['평일 저녁 · 주 1~2회','30분 안쪽 이동']);

    // 04 · Scope & Priority — preserve approved wording while using phrase grammar.
    const principles=slides[3].querySelector('.fm-next-cs-principles');
    setCardLines(principles,0,['판단 기준을 한곳에 · 선택 맥락을 보존','무료 Beta에서 인증·정원·참가·취소·체크인·복구를 검증합니다.']);
    setCardLines(principles,1,['대기열 · 알림 · 경기 후 피드백 → 자리 회복 · 재탐색','참가 전환과 반복 이용 효과는 실제 이용 데이터로 확인할 과제입니다.']);
    setCardLines(principles,2,['실제 PG 유보 · 수익화 검증 제외','AI 자동 참가 제외 · 사용자 최종 확인(HITL)']);

    // 05 · Guest First — comparison values are phrases; rationale/trade-off remain sentences.
    const alternatives=slides[4].querySelectorAll('.fm-next-cs-before-after>div');
    if(alternatives[0])setText(alternatives[0],'p','가치 확인 전 계정 생성 필요');
    if(alternatives[1])setText(alternatives[1],'p','추천 확인 후 가입 여부 결정');
    setRow(slides[4],'결정','가입 전 추천 · 상세 공개');
    setRow(slides[4],'이유','참가 의도가 생기기 전에 서비스 가치를 판단할 수 있게 했습니다.');
    setRow(slides[4],'Trade-off','로그인 전에는 계정 기반 개인화와 기기 간 연속성이 제한됩니다.');

    // 06 · Recommendation — decision is a phrase; quality criterion/trade-off remain sentences.
    setRow(slides[5],'결정','최근 선호는 추천 보조 입력으로만 사용');
    setRow(slides[5],'품질 기준','추천 후보·순위·이유의 소유권은 결정론적 추천 엔진에 유지합니다.');
    setRow(slides[5],'Trade-off','과거 선호와 오늘의 의도가 다를 수 있어 조건 수정을 허용합니다.');

    // 07 · Decision Detail — actions are phrases; trade-off is explanatory.
    setRow(slides[6],'핵심 행동','참가하기');
    setRow(slides[6],'보조 행동','저장 · 최대 2경기 비교');
    setRow(slides[6],'Trade-off','비교 대상을 제한해 결정을 돕고, 취소·환불 기준은 참가 전에 확인합니다.');

    // 08 · Sign in · Join — scope table is status/evidence shorthand, not prose.
    setRow(slides[7],'Real App','인증 · 결제 시뮬레이션');
    setRow(slides[7],'Closed Beta','Supabase 인증 · 참가 실연동');
    setRow(slides[7],'검증 범위','Google/Kakao OAuth Production 실로그인 검증 · 실제 PG 미연동');

    // 09 · Operations — operational rows are compact policy values.
    setRow(slides[8],'운영 권한','경기 · 정원 · 취소 마감 · 체크인 · 종료 관리');
    setRow(slides[8],'자리 회복','취소 시 포지션별 대기열 FIFO 승급');
    setRow(slides[8],'변경과 복구','변경 이력(audit trail) 기록 · 알림 실패와 참가 상태 분리 복구');

    // 10 · Recovery already follows phrase grammar; normalize only terminal punctuation defensively.
    stripTerminalPunctuation(slides[9],'.fm-next-cs-recovery b,.fm-next-cs-recovery .fm-cs-line,.fm-next-cs-decision span,.fm-next-cs-decision b');

    // 11 · Domain & AI — ownership/boundary cards are compact responsibility facts.
    const modes=slides[10].querySelectorAll('.fm-next-cs-modes>div');
    if(modes[0])setLines(modes[0],'p',['후보 · 순위 · 이유 → 결정론적 추천 엔진','AI 해석 실패 → fallback 탐색']);
    if(modes[1])setLines(modes[1],'p',['참가 · 체크인 · 경기 후 상태 책임 분리','동일 상태 판단 일원화']);
    if(modes[2])setLines(modes[2],'p',['경기 사실 · 가격 · 정원 · 순위 AI 생성 금지','참가 · 결제 사용자 최종 확인']);
    setRow(slides[10],'미연동','실제 PG와 외부 분석 도구는 미연동');

    // 12 · KPI & Validation — QA scope values stay compact; boundary statements stay sentences.
    const qaCards=slides[11].querySelectorAll('.fm-next-cs-grid.three .fm-next-cs-card');
    if(qaCards[1])setLines(qaCards[1],'p',['실제 OAuth 로그인 · 이메일 최종 전달','Web Push 브라우저 · OS 표시','사용자 만족도 · 전환 성과와는 별개입니다.']);
    if(qaCards[2])setLines(qaCards[2],'p',['중복 · 용어 · 구현-설명 불일치 검토','자동 QA와 사람 검수의 PASS 판정을 대신하지 않습니다.']);

    // Phrase-only components across 01–13 must never end with sentence punctuation.
    const phraseSelector=[
      '.fm-next-review-summary b',
      '.fm-next-cs-loop b','.fm-next-cs-loop span',
      '.fm-next-cs-auth-flow small','.fm-next-cs-auth-flow b',
      '.fm-next-cs-detail-order span','.fm-next-cs-reco-card strong',
      '.fm-next-cs-day-states small','.fm-next-cs-day-states b','.fm-next-cs-day-states p',
      '.fm-next-cs-recovery b','.fm-next-cs-recovery .fm-cs-line',
      '.fm-next-cs-outcomes b','.fm-next-cs-outcomes .fm-cs-line'
    ].join(',');
    slides.forEach(slide=>stripTerminalPunctuation(slide,phraseSelector));

    document.documentElement.dataset.footmateCaseStudyStructuredCopy='1';
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
