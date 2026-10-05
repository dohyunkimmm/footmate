/* AUTO-GENERATED · FootMate Case Study visual JS bundle
   Run: node scripts/build-case-study-bundle.cjs
   Sources: src/case-study/heading-polish.js, src/case-study/reader-polish.js, src/case-study/service-planner-polish.js, src/case-study/reviewer-polish.js, src/case-study/lead-tighten.js, src/case-study/structured-copy-polish.js, src/case-study/final-clarity.js, src/case-study/p0-visuals.js, src/case-study/p1-visuals.js, src/case-study/p2-polish.js, src/case-study/p1-real-preview.js, src/case-study/p12-copy-spacing.js, src/case-study/product-evidence.js, src/case-study/advanced-polish.js, src/case-study/decision-evidence.js, src/case-study/editorial-finish.js, src/case-study/page-composition.js
   Do not edit this generated file directly. */

/* ===== src/case-study/heading-polish.js ===== */
/* FootMate Case Study · reader-facing English section labels only.
   Legacy filename retained for compatibility. Story headings and supporting body copy stay Korean-first. */
(function(){
  let applied=false;
  const labels=[
    null,
    '02 · Problem & Goal',
    '03 · Persona · JTBD',
    '04 · Scope & Priority',
    '05 · Guest First',
    '06 · Recommendation',
    '07 · Decision Detail',
    '08 · Sign in · Join',
    '09 · Operations',
    '10 · Recovery',
    '11 · Domain & AI',
    '12 · KPI & Validation',
    '13 · Release & Learnings'
  ];

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='5.1.1'||
       document.documentElement.dataset.footmateCaseStudySections!=='13')return false;
    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13)return false;
    labels.forEach((label,index)=>{
      if(!label)return;
      const kicker=slides[index]?.querySelector('.fm-next-story-kicker');
      if(kicker)kicker.textContent=label;
    });
    const coverKicker=slides[0]?.querySelector('.fm-next-cover-kicker');
    if(coverKicker)coverKicker.textContent='Overview';
    const topTitle=document.querySelector('.topbar-title');
    if(topTitle)topTitle.textContent='FootMate · Case Study';
    document.title='FootMate · Case Study';
    document.documentElement.dataset.footmateCaseStudySectionLabelLanguage='en';
    document.documentElement.dataset.footmateCaseStudyHeadingLanguage='ko';
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<80)requestAnimationFrame(retry)})();
})();

/* ===== src/case-study/reader-polish.js ===== */
/* FootMate Case Study · reader-facing cleanup.
   Scope: public copy clarity, component rhythm, emphasis semantics, and self-contained evidence. */
(function(){
  let applied=false;

  function lines(...copy){
    return copy.map(text=>`<span class="fm-cs-line">${text}</span>`).join(' ');
  }

  function rows(items){
    return `<dl class="fm-cs-reasons">${items.map(([label,copy])=>`<div><dt>${label}</dt><dd>${copy}</dd></div>`).join('')}</dl>`;
  }

  function setHTML(root,selector,html){
    const node=root?.querySelector(selector);
    if(node)node.innerHTML=html;
    return node;
  }

  function setReasonCopy(root,selector,label,copy){
    const reason=[...(root?.querySelector(selector)?.querySelectorAll('.fm-cs-reasons>div')||[])].find(row=>row.querySelector('dt')?.textContent.trim()===label);
    const value=reason?.querySelector('dd');
    if(value)value.textContent=copy;
    return value;
  }

  function ensureReaderStyle(){
    if(document.getElementById('fm-case-study-reader-polish'))return;
    const style=document.createElement('style');
    style.id='fm-case-study-reader-polish';
    style.textContent=`
      /* 02–13: preserve the established page position; tighten structured components only. */
      @media(min-width:901px){
        html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) :is(
          .fm-next-cs-card,
          .fm-next-cs-persona>div,
          .fm-next-cs-before-after>div,
          .fm-next-cs-auth-flow>div,
          .fm-next-cs-modes>div,
          .fm-next-cs-day-states>div,
          .fm-next-cs-recovery>div,
          .fm-next-cs-outcomes>div,
          .fm-next-cs-metric,
          .fm-next-cs-quote,
          .fm-next-cs-jtbd,
          .fm-next-cs-decision,
          .fm-next-cs-scope,
          .fm-next-cs-sticky,
          .fm-next-cs-note,
          .fm-next-cs-final
        ){
          padding:12px 14px!important;
          min-width:0;
        }
        html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) .fm-cs-reasons>div{
          grid-template-columns:88px minmax(0,1fr);
          column-gap:14px;
        }
      }

      /* Sentence spans must not force a visual line break. Let the available width decide. */
      html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) .fm-cs-line{
        display:inline!important;
        margin:0!important;
        white-space:normal;
        text-wrap:pretty;
      }
      html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) .fm-next-story h2{
        text-wrap:balance;
      }
      html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) .fm-next-story-lead{
        text-wrap:pretty;
      }
      html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) :is(
        .fm-next-cs-card,
        .fm-next-cs-persona>div,
        .fm-next-cs-before-after>div,
        .fm-next-cs-auth-flow>div,
        .fm-next-cs-detail-order,
        .fm-next-cs-modes>div,
        .fm-next-cs-day-states>div,
        .fm-next-cs-recovery>div,
        .fm-next-cs-outcomes>div,
        .fm-next-cs-metric,
        .fm-cs-reasons>div
      ){
        min-width:0;
      }
      html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) :is(
        .fm-next-cs-card p,
        .fm-next-cs-persona b,
        .fm-next-cs-before-after b,
        .fm-next-cs-before-after p,
        .fm-next-cs-auth-flow b,
        .fm-next-cs-detail-order span,
        .fm-next-cs-modes p,
        .fm-next-cs-day-states p,
        .fm-next-cs-recovery span,
        .fm-next-cs-outcomes p,
        .fm-cs-reasons dd
      ){
        white-space:normal;
        overflow-wrap:normal;
        word-break:keep-all;
        text-wrap:pretty;
      }

      /* Keep short structured values compact without creating arbitrary new lines. */
      html[data-fm-next-case-study="true"] .fm-next-cs-persona b .fm-cs-line+.fm-cs-line::before,
      html[data-fm-next-case-study="true"] .fm-next-cs-recovery .fm-cs-line+.fm-cs-line::before{
        content:" · ";
      }
      html[data-fm-next-case-study="true"] [data-v5-content-role="guest-first-decision"] .fm-next-cs-before-after b .fm-cs-line+.fm-cs-line::before{
        content:" → ";
      }

      /* Green has one reader-facing meaning: the explicitly adopted option in a comparison. */
      html[data-fm-next-case-study="true"] :is(.fm-next-cs-auth-flow>div,.fm-next-cs-day-states>div,.fm-next-cs-modes>div){
        background:#fff!important;
        border-color:var(--fm-cs-ui-border,#dfe6e1)!important;
        box-shadow:0 1px 2px rgba(18,42,29,.025)!important;
      }
      html[data-fm-next-case-study="true"] .fm-next-cs-before-after>.is-after{
        background:var(--fm-cs-ui-soft-strong,#f4faf6)!important;
        border-color:var(--fm-cs-ui-border-strong,#c7ddce)!important;
      }

      /* Removed review-only outgoing link on Operations. */
      html[data-fm-next-case-study="true"] [data-v5-content-role="matchday-return"]>.fm-next-cs-link,
      html[data-fm-next-case-study="true"] [data-v5-content-role="matchday-return"] .fm-next-cs-link{display:none!important}
    `;
    document.head.appendChild(style);
  }

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='5.1.1'||
       document.documentElement.dataset.footmateCaseStudySections!=='13'||
       document.documentElement.dataset.footmateCaseStudyPlannerPolish!=='96')return false;

    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13)return false;

    ensureReaderStyle();

    // 02 · Problem & Goal — keep row values phrase-like unless they are explanatory sentences.
    const problem=slides[1];
    setReasonCopy(problem,'.fm-next-cs-quote','검증 범위','설계 가설 · 사용자 조사·경쟁사 우위 미입증 · Beta 확인');

    // 03 · Persona/JTBD — describe the actual participant context without internal program jargon or invented timing.
    const persona=slides[2];
    setHTML(persona,'.fm-next-story-lead',lines(
      '평일 저녁·주 1~2회·30분 안쪽 이동은 설계용 Persona 가정이며, 인터뷰로 검증한 집단은 아닙니다.',
      '같은 교육과정을 수강한 교육생 6명에게 iOS·Android에서 구체 행동 과업을 요청해 탐색·가입 동선의 버그와 막힘을 확인하며 고도화했습니다.'
    ));
    setHTML(persona,'.fm-next-cs-persona',
      '<div><span>설계 가정</span><b>'+lines('평일 저녁 · 주 1~2회','30분 안쪽으로 이동')+'</b></div>'+
      '<div><span>요구사항 반영</span><b>'+lines('시간 · 거리 · 레벨','포지션 · 남은 자리 우선 확인')+'</b></div>'+
      '<div><span>과업 검증</span><b>'+lines('교육생 6명 · iOS 4 / Android 2','숙련도·포지션을 나눠 과업 수행')+'</b></div>');

    // 05 · Guest First — decision values stay compact; reason and trade-off read as full sentences.
    const guest=slides[4];
    setReasonCopy(guest,'.fm-next-cs-decision','이유','참가 의도 전 서비스 가치 판단');
    setReasonCopy(guest,'.fm-next-cs-decision','Trade-off','로그인 전 계정 기반 개인화·기기 간 연속성 제한');

    // 06 · Recommendation — explanatory rows use complete sentences consistently.
    const recommendation=slides[5];
    setReasonCopy(recommendation,'.fm-next-cs-note','결정','개인화 정보 → 추천 보조 입력');
    setReasonCopy(recommendation,'.fm-next-cs-note','품질 기준','후보·순위·이유 → 결정론적 추천 엔진');
    setReasonCopy(recommendation,'.fm-next-cs-note','Trade-off','오늘 의도 우선 · 조건 수정·재탐색 허용');

    // 07 · Decision Detail — action labels stay phrase-like; trade-off is a complete sentence.
    const detail=slides[6];
    setReasonCopy(detail,'.fm-next-cs-sticky','Trade-off','비교 대상 제한 · 취소·환불 기준 참가 전 확인');

    // 08 · Sign in / Join — remove the orphan state line and fold preservation into the evidence table.
    const auth=slides[7];
    auth.querySelector('.fm-next-cs-state-line')?.remove();
    auth.querySelector('.fm-next-cs-auth-flow>.is-focus')?.classList.remove('is-focus');
    setHTML(auth,'.fm-next-cs-scope',rows([
      ['Real App','UX 시뮬레이션 인증 · 무료 참가 확인'],
      ['Closed Beta','Supabase 인증·참가 경로 실연동'],
      ['검증 범위','Google/Kakao OAuth Production 실로그인 확인 · 실제 PG 미연동']
    ]));

    // 09 · Operations — the Case Study itself carries the state scenario; remove the legacy review-mode exit.
    const operations=slides[8];
    operations.querySelector('.fm-next-cs-day-states>.is-focus')?.classList.remove('is-focus');
    operations.querySelectorAll('.fm-next-cs-link').forEach(node=>node.remove());

    // 11 · Domain & AI — all three responsibility cards are peers; none is a selected winner.
    const domain=slides[10];
    domain.querySelectorAll('.fm-next-cs-modes>.is-focus').forEach(node=>node.classList.remove('is-focus'));
    setHTML(domain,'.fm-next-cs-note',rows([
      ['실제 연결','Vercel AI Gateway · Supabase · Resend · Web Push · Storage'],
      ['미연동','실제 PG · 외부 분석 도구'],
      ['정의한 기준','API·데이터·권한·오류·재시도 · IA·상태별 화면·CTA · 취소·정원·복구 정책']
    ]));

    // 12 · KPI & Validation — replace statistical shorthand with a plain-language calculation rule.
    const validation=slides[11];
    const metricRules=[
      ['상세 진입 세션','결과 노출 세션'],
      ['참가 완료 사용자','상세 조회 사용자'],
      ['복구 완료 흐름','복구 가능 실패 흐름'],
      ['7일 내 재탐색 사용자','7일 관찰 완료 참가 사용자']
    ];
    validation.querySelectorAll('.fm-next-cs-metric .fm-cs-ratio').forEach((node,index)=>{
      const rule=metricRules[index];
      if(rule)node.innerHTML=`<span>계산 기준 · ${rule[0]} ÷ ${rule[1]}</span>`;
    });
    const metricLink=validation.querySelector('.fm-next-cs-note a');
    if(metricLink)metricLink.textContent='8개 지표의 계산·관찰 기준 보기 ↗';

    // 13 · Release & Learnings — same participant context, no internal program acronym or unsupported timing claim.
    const release=slides[12];
    setHTML(release,'.fm-next-story-lead',lines(
      '같은 교육과정을 수강한 교육생 6명에게 실제 탐색·가입 동선의 구체 행동 과업을 요청해 iOS와 Android에서 사용성을 확인했습니다.',
      '이 결과는 버그와 막힘을 찾기 위한 사용성 검증이며, 전환율 개선이나 시장 적합성을 입증한 Measured Result와는 구분합니다.'
    ));
    setHTML(release,'.fm-next-cs-outcomes',
      '<div><b>Real App</b><p>'+lines('AI Gateway 실연동 · 후보·순위·이유는 추천 엔진','샘플 경기 데이터 · 인증·정원·알림 시뮬레이션 · 무료 참가 확인')+'</p></div>'+
      '<div><b>Closed Beta</b><p>'+lines('Supabase 인증·경기·정원·참가/취소·체크인 실연동','Google/Kakao OAuth · 이메일 · Web Push · 미디어 실제 환경 검증')+'</p></div>'+
      '<div><b>미연동 범위</b><p>'+lines('실제 PG · 외부 분석 도구 미연동','수익성 · 실제 이용 지표 미검증')+'</p></div>');

    // Guardrail: the public Case Study should not expose the internal acronym.
    const shell=document.querySelector('.fm-cs-shell');
    if(shell&&/\bPBL\b/.test(shell.innerText)){
      const walker=document.createTreeWalker(shell,NodeFilter.SHOW_TEXT);
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
      nodes.forEach(node=>{node.nodeValue=(node.nodeValue||'').replace(/\bPBL\b\s*/g,'');});
    }

    document.documentElement.dataset.footmateCaseStudyReaderPolish='2';
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<100)requestAnimationFrame(retry)})();
})();

/* ===== src/case-study/service-planner-polish.js ===== */
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
      '같은 교육과정을 수강한 교육생 6명에게 iOS·Android에서 구체 행동 과업을 요청해 탐색·가입 동선의 버그와 막힘을 확인하며 고도화했습니다.'
    ));
    setHTML(persona,'.fm-next-cs-persona',
      '<div><span>설계 가정</span><b>'+lines('평일 저녁 · 주 1~2회','30분 안쪽으로 이동')+'</b></div>'+
      '<div><span>요구사항 반영</span><b>'+lines('시간 · 거리 · 레벨','포지션 · 남은 자리 우선 확인')+'</b></div>'+
      '<div><span>과업 검증</span><b>'+lines('교육생 6명 · iOS 4 / Android 2','숙련도·포지션을 나눠 과업 수행')+'</b></div>');
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
      '같은 교육과정을 수강한 교육생 6명에게 실제 탐색·가입 동선의 구체 행동 과업을 요청해 iOS와 Android에서 사용성을 확인했습니다.',
      '이 결과는 버그와 막힘을 찾기 위한 사용성 검증이며, 전환율 개선이나 시장 적합성을 입증한 Measured Result와는 구분합니다.'
    ));
    setHTML(release,'.fm-next-cs-final','<span hidden>Production 기준</span><span>사용성 검증 · 근거와 다음 단계</span>'+rows([
      ['검증 표본','교육생 6명 · iOS 4 / Android 2 · 입문 2 / 초급 2 / 중급 1 / 고급 1 · 수비 2 / 공격 2 / 미드필더 2'],
      ['과업 범위','회원가입 전 2회 · Kakao 2회 · Google 2회 · 이메일 2회. 총 8회이며 일부 참여자가 복수 과업을 수행했습니다.'],
      ['학습·다음 단계','구체 행동 과업으로 동선별 버그·막힘을 재검증했습니다. 이후 제품·운영 상태 고도화 → Production QA → KPI 측정 준비로 검증 범위를 확장했고, 실제 이용자 KPI는 기준값을 확보한 뒤 Baseline부터 측정합니다.']])+
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

/* ===== src/case-study/reviewer-polish.js ===== */
/* FootMate Case Study · recruiter/reviewer scan polish.
   Facts stay within the existing Case Study evidence. This patch changes reader hierarchy,
   phrase consistency, and the KPI evidence interaction only. */
(function(){
  let applied=false;

  const copyBySection=[
    null,
    {title:'경기 선택의 불확실성을 줄여 참가와 재탐색으로 연결합니다.',lead:'추천 근거·참가 안전성·운영 복구를 함께 검증 범위로 정의했습니다.',summary:[['문제 가설','참가 결정의 불확실성'],['기준','탐색 → 판단 → 참가 → 복구'],['검증','전환 · 실패 · 재탐색']]},
    {title:'사용자 가정을 요구사항으로 연결하고 행동 과업으로 확인했습니다.',lead:'설계용 Persona는 가정으로 두고, 행동 과업으로 탐색·가입 동선의 버그와 막힘을 점검했습니다.',summary:[['가정','평일 저녁 · 30분 안쪽 이동'],['요구사항','시간 · 거리 · 레벨 · 포지션'],['검증 방식','행동 과업 · iOS · Android']]},
    {title:'참가와 운영 안전성을 우선하고 수익화 검증은 뒤로 뒀습니다.',lead:'판단 가치·참가 실패 영향·검증 가능성을 우선순위 기준으로 사용했습니다.',summary:[['우선','참가 · 복구'],['확장','운영 · 반복 이용'],['제외','실제 PG · 자동 참가']]},
    {title:'추천과 상세를 먼저 보여주고 참가할 때 로그인을 요청합니다.',lead:'가치 확인 전에 계정을 요구하지 않도록 인증 시점을 참가 직전으로 옮겼습니다.',summary:[['결정','가입 전 추천 · 상세 공개'],['이유','가치 확인 우선'],['Trade-off','로그인 전 개인화 제한']]},
    {title:'반복 입력은 줄이고 추천 이유는 먼저 확인하게 했습니다.',lead:'개인화 정보는 입력 부담을 줄이는 보조 신호로만 사용하고 후보·순위·이유는 추천 엔진이 결정합니다.',summary:[['입력','프로필 · 선호 · 최근 이력'],['소유권','결정론적 추천 엔진'],['사용자 제어','조건 수정 · 재탐색']]},
    {title:'상세의 정보 순서와 행동을 참가 결정에 맞췄습니다.',lead:'시간·장소부터 추천 이유·자리·취소 기준까지 결정 순서대로 배치했습니다.',summary:[['핵심 CTA','참가하기'],['보조','저장 · 최대 2경기 비교'],['정책','취소 · 환불 사전 확인']]},
    {title:'로그인 전 선택을 인증 후에도 이어갑니다.',lead:'선택 경기와 복귀 위치를 보존하고 참가 결과를 완료·실패·취소로 구분했습니다.',summary:[['진입점','참가하기 직전'],['인증','로그인'],['결과','완료 · 실패 · 취소']]},
    {title:'경기 당일 상태와 다음 탐색을 홈의 중심에 둡니다.',lead:'참가 예정부터 체크인·경기 후까지 상태에 맞는 다음 행동을 먼저 보여줍니다.',summary:[['상태','예정 → 당일 → 체크인 → 경기 후'],['운영','정원 · 취소 · 체크인'],['반복','다음 탐색']]},
    {title:'실패해도 선택 맥락을 보존하고 다음 행동을 제시합니다.',lead:'오류마다 보존할 상태와 재시도·대체 행동을 함께 정의했습니다.',summary:[['원칙','원인 · 보존 상태 · 다음 행동'],['복구','재시도 · 조건 수정 · 대기'],['범위','탐색 → 경기 당일']]},
    {title:'추천·상태·실행의 소유권을 분리했습니다.',lead:'자연어 조건은 AI가 해석하고, 후보·순위·이유는 결정론적 추천 엔진이 맡으며, 참가·결제는 사용자가 최종 확인합니다.',summary:[['해석','AI · 자연어 조건'],['판단','추천 엔진 · 후보·순위·이유'],['실행','사용자 확인 · 참가·결제']]},
    {title:'성공 지표와 제품 동작을 확인하는 QA를 구분합니다.',lead:'Validation Metric으로 정의했으며, Measured Result가 아닙니다.',summary:[['KPI','전환 · 복구 · 재탐색'],['QA','Regression · E2E · axe · Smoke'],['측정','Baseline 확보 후']]},
    {title:'구현·검증 결과와 아직 남은 과제를 구분합니다.',lead:'탐색·가입 동선의 행동 과업으로 iOS와 Android에서 사용성을 확인했으며 실제 이용자 KPI와 수익성은 아직 미검증입니다.',summary:[['사용성 검증','행동 과업 · iOS · Android'],['실제 연결','AI · Supabase · Resend · Push'],['미연동','실제 PG · 외부 분석 도구']]}
  ];

  const kpiRows=[
    ['Match Search → Detail CTR','상세 진입 세션 ÷ 결과 노출 세션','동일 탐색 세션 1회 집계'],
    ['Detail → Join Conversion','참가 완료 사용자·경기 ÷ 상세 조회 사용자·경기','24시간 · 사용자·경기 1회 · 종료·마감 별도'],
    ['Zero Result Rate','결과 0건 정상 검색 ÷ 정상 검색','네트워크·서버 오류 제외 · 동일 요청 중복 제거'],
    ['Join Failure Rate','확정 실패·24시간 미해결 ÷ 참가 확정 요청','사용자 취소 별도 · timeout 후 상태 재조회'],
    ['Recovery Success Rate','원래 목적 완료 흐름 ÷ 복구 가능한 실패 흐름','24시간 이내 · 대안 선택 별도 기록'],
    ['Check-in Completion Rate','체크인 완료 쌍 ÷ 종료 경기 확정 참가자·경기 쌍','취소 제외 · 노쇼 포함 · 경기 종료 시점'],
    ['Repeat Match Search Rate','7일 내 재탐색 사용자 ÷ 7일 관찰 완료 사용자','사용자당 첫 완료 경기 · 탈퇴·관찰 누락 별도'],
    ['AI Search Adoption Rate','AI 검색 사용 세션 ÷ AI 검색 진입점 노출 세션','connected-ai와 rules-fallback 분리 · 사용률과 품질 판단 분리']
  ];

  function setText(root,selector,text){const node=root?.querySelector(selector);if(node)node.textContent=text;return node;}
  function summaryHTML(items){return '<div class="fm-next-review-summary" aria-label="핵심 기획 판단">'+items.map(([label,value])=>`<div><span>${label}</span><b>${value}</b></div>`).join('')+'</div>';}

  function ensureStyle(){
    if(document.getElementById('fm-case-study-reviewer-polish'))return;
    const style=document.createElement('style');
    style.id='fm-case-study-reviewer-polish';
    style.textContent=`
      html[data-fm-next-case-study="true"] .fm-next-review-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:4px 0 2px}
      html[data-fm-next-case-study="true"] .fm-next-review-summary>div{min-width:0;padding:9px 11px;border:1px solid var(--fm-cs-ui-border,#dfe6e1);border-radius:12px;background:#fbfdfc}
      html[data-fm-next-case-study="true"] .fm-next-review-summary span{display:block;margin-bottom:3px;color:#5f7067;font-size:11px;line-height:1.35;font-weight:800;letter-spacing:.01em}
      html[data-fm-next-case-study="true"] .fm-next-review-summary b{display:block;color:var(--fm-cs-ui-ink,#16251d);font-size:12px;line-height:1.45;font-weight:750;word-break:keep-all;text-wrap:pretty}
      html[data-fm-next-case-study="true"] .fm-next-story-lead{max-width:82ch}
      html[data-fm-next-case-study="true"] .fm-next-kpi-open{display:inline-flex;align-items:center;justify-content:center;min-height:36px;margin-top:10px;padding:0 12px;border:1px solid var(--fm-cs-ui-border-strong,#c7ddce);border-radius:10px;background:#fff;color:var(--fm-cs-ui-ink,#16251d);font:inherit;font-size:12px;font-weight:800;cursor:pointer}
      html[data-fm-next-case-study="true"] .fm-next-kpi-dialog{width:min(920px,calc(100vw - 32px));max-height:min(760px,calc(100vh - 32px));padding:0;border:1px solid #d8e2dc;border-radius:18px;color:#16251d;background:#fff;box-shadow:0 24px 70px rgba(21,39,28,.18)}
      html[data-fm-next-case-study="true"] .fm-next-kpi-dialog::backdrop{background:rgba(18,32,24,.34);backdrop-filter:blur(2px)}
      html[data-fm-next-case-study="true"] .fm-next-kpi-dialog-inner{display:grid;gap:14px;max-height:inherit;overflow:auto;padding:22px}
      html[data-fm-next-case-study="true"] .fm-next-kpi-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
      html[data-fm-next-case-study="true"] .fm-next-kpi-dialog h3{margin:0;font-size:20px;line-height:1.35}
      html[data-fm-next-case-study="true"] .fm-next-kpi-dialog-intro{margin:0;color:#5f7067;font-size:12px;line-height:1.65}
      html[data-fm-next-case-study="true"] .fm-next-kpi-close{flex:0 0 auto;width:34px;height:34px;border:1px solid #dfe6e1;border-radius:50%;background:#fff;color:#34463c;font-size:18px;cursor:pointer}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table{display:grid;gap:8px;margin:0}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table>div{display:grid;grid-template-columns:180px minmax(0,1fr) minmax(0,1fr);gap:12px;padding:11px 12px;border:1px solid #e3eae6;border-radius:12px;background:#fbfdfc}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table dt,html[data-fm-next-case-study="true"] .fm-next-kpi-table dd{margin:0}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table dt{font-size:12px;line-height:1.45;font-weight:850}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table dd{min-width:0;font-size:11px;line-height:1.6}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table dd::before{display:block;margin-bottom:2px;color:#728279;font-size:9px;font-weight:800}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table dd:nth-of-type(1)::before{content:"계산 기준"}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table dd:nth-of-type(2)::before{content:"관찰 · 제외 기준"}
      @media(min-width:901px){html[data-fm-next-case-study="true"] .fm-next-kpi-table dd{white-space:nowrap}}
      @media(max-width:900px){html[data-fm-next-case-study="true"] .fm-next-review-summary{grid-template-columns:1fr;gap:6px}html[data-fm-next-case-study="true"] .fm-next-review-summary>div{padding:8px 10px}html[data-fm-next-case-study="true"] .fm-next-kpi-table>div{grid-template-columns:1fr;gap:6px}html[data-fm-next-case-study="true"] .fm-next-kpi-dialog-inner{padding:18px}}
    `;
    document.head.appendChild(style);
  }

  function patchBody(slides){
    for(let index=1;index<slides.length;index+=1){
      const slide=slides[index],copy=copyBySection[index];if(!slide||!copy)continue;
      setText(slide,'.fm-next-story h2',copy.title);setText(slide,'.fm-next-story-lead',copy.lead);
      slide.querySelector('.fm-next-review-summary')?.remove();slide.querySelector('.fm-next-story-lead')?.insertAdjacentHTML('afterend',summaryHTML(copy.summary));
    }
  }

  function normalizeStructuredPhrases(slides){
    slides[3]?.querySelectorAll('.fm-next-cs-loop b').forEach((node,index)=>{node.textContent=`${index+1} ${node.textContent.replace(/^\d+\.\s*/,'')}`;});
    slides[5]?.querySelectorAll('.fm-next-cs-stack p b').forEach((node,index)=>{node.textContent=String(index+1);});
    slides.forEach(slide=>{slide.querySelectorAll('.fm-next-review-summary b,.fm-next-cs-loop b,.fm-next-cs-loop span,.fm-next-cs-auth-flow small,.fm-next-cs-auth-flow b,.fm-next-cs-detail-order span,.fm-next-cs-reco-card strong').forEach(node=>{node.textContent=(node.textContent||'').trim().replace(/[.!?。]+$/,'');});});
  }

  function kpiDialogHTML(){
    const rows=kpiRows.map(([name,calc,observe])=>`<div><dt>${name}</dt><dd>${calc}</dd><dd>${observe}</dd></div>`).join('');
    return '<dialog class="fm-next-kpi-dialog" aria-labelledby="fm-kpi-dialog-title"><div class="fm-next-kpi-dialog-inner"><div class="fm-next-kpi-dialog-head"><div><h3 id="fm-kpi-dialog-title">8개 지표의 계산·관찰 기준</h3></div><button class="fm-next-kpi-close" type="button" aria-label="닫기">×</button></div><p class="fm-next-kpi-dialog-intro">Validation Metric이며 Measured Result가 아닙니다. 실제 무료 Beta 이용자를 측정 대상으로 하고 운영·테스트 계정, 자동 QA, Real App의 샘플·시뮬레이션은 제외합니다. 비교 기준이 0건이면 N/A로 기록하고 실패·재시도는 동일 흐름 기준으로 중복 제거합니다.</p><dl class="fm-next-kpi-table">'+rows+'</dl></div></dialog>';
  }

  function patchKpiDisclosure(validation){
    const note=validation?.querySelector('.fm-next-cs-note');if(!note)return;
    note.querySelectorAll('a[href*="github.com"]').forEach(node=>node.remove());
    if(!note.querySelector('.fm-next-kpi-open'))note.insertAdjacentHTML('beforeend',' <button class="fm-next-kpi-open" type="button">8개 지표의 계산·관찰 기준 보기</button>');
    validation.querySelector('.fm-next-kpi-dialog')?.remove();validation.insertAdjacentHTML('beforeend',kpiDialogHTML());
    const dialog=validation.querySelector('.fm-next-kpi-dialog'),open=note.querySelector('.fm-next-kpi-open'),close=dialog?.querySelector('.fm-next-kpi-close');
    open?.addEventListener('click',()=>dialog?.showModal());close?.addEventListener('click',()=>dialog?.close());dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  }

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='5.1.1'||document.documentElement.dataset.footmateCaseStudySections!=='13'||document.documentElement.dataset.footmateCaseStudyReaderPolish!=='2')return false;
    const slides=[...document.querySelectorAll('.slide:not([hidden])')];if(slides.length!==13)return false;
    ensureStyle();patchBody(slides);normalizeStructuredPhrases(slides);patchKpiDisclosure(slides[11]);
    document.documentElement.dataset.footmateCaseStudyReviewerPolish='1';applied=true;return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;(function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<120)requestAnimationFrame(retry)})();
})();

/* ===== src/case-study/lead-tighten.js ===== */
/* FootMate Case Study · tighten 01/03 lead copy without changing the approved evidence hierarchy. */
(function(){
  let applied=false;

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyReviewerPolish!=='1')return false;
    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13)return false;

    const coverLead=slides[0]?.querySelector('.fm-next-cover-lead');
    const personaLead=slides[2]?.querySelector('.fm-next-story-lead');
    const personaSummary=slides[2]?.querySelectorAll('.fm-next-review-summary>div');
    if(!coverLead||!personaLead||personaSummary?.length!==3)return false;

    coverLead.textContent='나에게 맞는 이유를 확인하고, 안심하고 참가하는 풋살 서비스입니다.';
    personaLead.textContent='설계용 Persona는 가정으로 두고, 행동 과업으로 탐색·가입 동선을 점검했습니다.';

    const validationLabel=personaSummary[2].querySelector('span');
    const validationValue=personaSummary[2].querySelector('b');
    if(validationLabel)validationLabel.textContent='검증 방식';
    if(validationValue)validationValue.textContent='행동 과업 · iOS · Android';

    document.documentElement.dataset.footmateCaseStudyLeadTighten='1';
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<120)requestAnimationFrame(retry)})();
})();

/* ===== src/case-study/structured-copy-polish.js ===== */
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
    root?.querySelectorAll(selector).forEach(node=>{
      // Do not flatten structured markup such as numbered steps or natural-wrap line spans.
      if(node.children.length)return;
      node.textContent=(node.textContent||'').trim().replace(/[.!?。]+$/,'');
    });
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
      action.innerHTML='<span class="fm-next-kpi-disclosure-label">KPI · Validation Metric</span>';
      metrics.insertAdjacentElement('beforebegin',action);
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

    // 03 · Persona · JTBD — summary states the assumption/requirement; the flow shows how it was checked.
    slides[2].querySelector('.fm-next-cs-persona')?.remove();
    setText(slides[2],'.fm-next-cs-jtbd small','검증 흐름 · 가설 → 과업 → 관찰');
    setText(slides[2],'.fm-next-cs-jtbd p','가설 · 맞는 이유 빠른 이해 → 과업 · 회원가입 전·Kakao·Google·이메일 가입 → 관찰 · 동선별 버그·막힘');

    // 04 · Scope & Priority — card bodies are phrase grammar.
    const principles=slides[3].querySelector('.fm-next-cs-principles');
    setCardText(principles,0,'판단 기준을 한곳에 · 선택 맥락을 보존 · 무료 Beta 검증 · 인증·정원·참가·취소·체크인·복구');
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
    if(modes[0])setText(modes[0],'p','후보 · 순위 · 이유 → 결정론적 추천 엔진 · 해석 실패 → fallback 탐색');
    if(modes[1])setText(modes[1],'p','참가 · 체크인 · 경기 후 상태 책임 분리 · 동일 상태 판단 일원화');
    if(modes[2])setText(modes[2],'p','경기 사실 · 가격 · 정원 · 순위 AI 생성 금지 · 참가 · 결제 사용자 최종 확인');
    setRow(slides[10],'실제 연결','Vercel AI Gateway · Supabase · Resend · Web Push · Storage');
    setRow(slides[10],'미연동','실제 PG · 외부 분석 도구');
    setRow(slides[10],'정의한 기준','API·데이터·권한·오류·재시도 · IA·상태별 화면·CTA · 취소·정원·복구 정책');

    // 12 · KPI & Validation — QA cards stay phrase-style; KPI disclosure is a dedicated action row.
    const qaCards=slides[11].querySelectorAll('.fm-next-cs-grid.three .fm-next-cs-card');
    if(qaCards[0])setText(qaCards[0],'p','Regression · Browser E2E · axe · 상태·복구 · 반응형 · Visual Regression · Production Smoke');
    if(qaCards[1])setText(qaCards[1],'p','실제 OAuth 로그인 · 이메일 최종 전달 · Web Push 브라우저·OS 표시 · 제품 성과와 분리 · 사용자 만족도·전환');
    if(qaCards[2])setText(qaCards[2],'p','중복 · 용어 · 구현-설명 불일치 검토 · PASS 판정 제외');
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

    document.documentElement.dataset.footmateCaseStudyStructuredCopy='3';
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

/* ===== src/case-study/final-clarity.js ===== */
/* FootMate Case Study · final reader clarity and per-page repetition pass. */
(function(){
  let applied=false;

  function setText(root,selector,text){
    const node=root?.querySelector(selector);
    if(node)node.textContent=text;
    return node;
  }

  function setHTML(root,selector,html){
    const node=root?.querySelector(selector);
    if(node)node.innerHTML=html;
    return node;
  }

  function rows(items){
    return `<dl class="fm-cs-reasons">${items.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
  }

  function lineHTML(...items){
    return items.map(value=>`<span class="fm-cs-line">${value}</span>`).join(' ');
  }

  function setSummary(slide,items){
    const summary=slide?.querySelectorAll('.fm-next-review-summary>div')||[];
    items.forEach(([label,value],index)=>{
      const item=summary[index];
      if(!item)return;
      const labelNode=setText(item,'span',label);
      const valueNode=setText(item,'b',value);
      if(labelNode&&valueNode)item.insertBefore(document.createTextNode(' '),valueNode);
    });
  }

  function setCards(root,selector,items){
    const cards=root?.querySelectorAll(selector)||[];
    items.forEach(([heading,copy],index)=>{
      const card=cards[index];
      if(!card)return;
      setText(card,'h3',heading);
      setText(card,'p',copy);
    });
  }

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyStructuredCopy!=='3'||
       document.documentElement.dataset.footmateCaseStudyReaderPolish!=='2')return false;

    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13)return false;

    const problem=slides[1];
    setText(problem,'.fm-next-story h2','경기를 고를 때 필요한 판단 근거를 한 흐름에 묶었습니다.');
    setText(problem,'.fm-next-story-lead','조건 비교부터 추천 근거, 실패 후 복구까지 검증 범위로 잡았습니다.');
    setSummary(problem,[['문제 가설','선택 불확실성'],['흐름','조건 비교 → 근거 확인 → 실행'],['확인','전환 · 실패 · 재시도']]);
    setCards(problem,'.fm-next-cs-grid.three .fm-next-cs-card',[
      ['조건 비교','시간 · 거리 · 레벨 한곳 비교 · 상세 진입률 · 결과 없음 비율'],
      ['결정 근거','추천 이유 · 정원 · 취소 규칙 우선 노출 · 전환율 · 실패율'],
      ['이후 행동','체크인 · 경기 후 피드백 → 재이용 · 완료율 · 7일 내 재탐색']
    ]);
    setHTML(problem,'.fm-next-cs-quote','<span>대안 검토 · 설계 가설</span>'+rows([
      ['대안','목록·필터 · 지도 · 커뮤니티 비교'],
      ['선택','조건 해석 → 근거 제시 → 실행 → 당일 운영'],
      ['검증 범위','설계 가설 · 사용자 조사·경쟁사 우위 미입증 · Beta 확인']
    ]));

    const persona=slides[2];
    setText(persona,'.fm-next-story h2','Persona 가정을 요구사항으로 옮기고 행동으로 확인했습니다.');
    setText(persona,'.fm-next-story-lead','설계용 Persona는 가정으로 두고, 행동 과업으로 탐색·가입 동선을 점검했습니다.');
    setSummary(persona,[['가정','평일 저녁 · 30분 안쪽 이동'],['요구사항','시간 · 거리 · 레벨 · 포지션'],['검증 방식','행동 과업 · iOS · Android']]);
    setText(persona,'.fm-next-cs-jtbd small','검증 흐름 · 가설 → 과업 → 관찰');
    setText(persona,'.fm-next-cs-jtbd p','가설 · 맞는 이유 빠른 이해 → 실행 · 회원가입 전·Kakao·Google·이메일 가입 → 관찰 · 동선별 버그·막힘');

    const priority=slides[3];
    setText(priority,'.fm-next-story h2','운영 안전성을 먼저 확보하고 수익화는 뒤로 뒀습니다.');
    setText(priority,'.fm-next-story-lead','우선순위 기준은 사용자 판단 가치와 실패 영향, 확인 가능성입니다.');
    setSummary(priority,[['우선','참가 · 복구'],['확장','운영 · 반복 이용'],['제외','실제 PG · 자동 실행']]);
    setCards(priority,'.fm-next-cs-principles .fm-next-cs-card',[
      ['우선 · 안전한 실행','판단 기준을 한곳에 · 선택 맥락을 보존 · 무료 Beta · 인증·정원·취소·체크인·복구'],
      ['확장 · 운영과 재이용','대기열·알림·경기 후 피드백 → 자리 회복·재이용 · 후속 지표 · 전환·반복 이용'],
      ['제외 · 수익화와 자동화','실제 PG 유보 · 수익화 검증 제외 · AI 자동 실행 제외 · 사용자 최종 확인(HITL)']
    ]);

    const guest=slides[4];
    setText(guest,'.fm-next-story h2','가치를 먼저 보여주고 계정은 필요할 때 요청합니다.');
    setText(guest,'.fm-next-story-lead','경기를 고른 뒤 인증하도록 순서를 바꿔 초기 진입 부담을 낮췄습니다.');
    setSummary(guest,[['선택','가입 전 추천 · 상세 공개'],['이유','가치 확인 우선'],['제약','계정 기반 개인화 제한']]);
    const alternatives=guest.querySelectorAll('.fm-next-cs-before-after>div');
    if(alternatives[0]){
      setText(alternatives[0],'small','비교안 · 가입 우선');
      setHTML(alternatives[0],'b',lineHTML('첫 화면 → 로그인 → 설문','결과 확인'));
      setText(alternatives[0],'p','가치 확인 전 계정 생성 필요');
    }
    if(alternatives[1]){
      setText(alternatives[1],'small','채택안 · 탐색 우선');
      setHTML(alternatives[1],'b',lineHTML('조건 설정 → 추천 → 상세','로그인'));
      setText(alternatives[1],'p','추천 확인 후 가입 여부 결정');
    }
    setHTML(guest,'.fm-next-cs-decision',rows([
      ['인증 시점','참가 요청 직전'],
      ['효과','초기 계정 생성 부담 감소'],
      ['Trade-off','계정 기반 개인화 · 기기 간 연속성 제한']
    ]));

    const recommendation=slides[5];
    setText(recommendation,'.fm-next-story h2','반복 입력을 줄이고 근거를 먼저 보여줍니다.');
    setText(recommendation,'.fm-next-story-lead','저장 정보는 입력 보조로만 쓰고, 후보·순위·이유는 별도 추천 로직이 결정합니다.');
    setSummary(recommendation,[['입력','프로필 · 선호 · 최근 이력'],['판단','추천 엔진 · 후보·순위·이유'],['제어','조건 수정 · 재탐색']]);
    setText(recommendation,'.fm-next-cs-reco-card span','표현 예시 · 수원 영통');
    setText(recommendation,'.fm-next-cs-reco-card strong','1순위');
    setHTML(recommendation,'.fm-next-cs-note',rows([
      ['입력 원칙','저장 정보 → 반복 입력 완화'],
      ['판단 책임','후보·순위·이유 → 결정론적 추천 엔진'],
      ['사용자 제어','현재 조건 수정 · 재탐색 허용']
    ]));

    const detail=slides[6];
    setText(detail,'.fm-next-story h2','상세 정보의 순서를 실제 결정 흐름에 맞췄습니다.');
    setText(detail,'.fm-next-story-lead','시간·장소에서 자리·환불 정책까지 필요한 순서대로 배치했습니다.');
    setSummary(detail,[['핵심 CTA','참가하기'],['보조','저장 · 최대 2경기 비교'],['정책','취소 · 환불 사전 확인']]);
    detail.querySelector('.fm-next-cs-sticky')?.remove();

    const auth=slides[7];
    setText(auth,'.fm-next-story h2','선택한 경기를 계정 확인 뒤에도 이어갑니다.');
    setText(auth,'.fm-next-story-lead','선택 경기와 복귀 위치를 유지하고 로그인 뒤 무료 참가 확인으로 이어집니다.');
    setSummary(auth,[['진입점','참가하기 직전'],['계정','로그인'],['결과','무료 참가 확인 · MY']]);
    setHTML(auth,'.fm-next-cs-scope',rows([
      ['Real App','로그인 · 무료 참가 확인 · MY'],
      ['Closed Beta','Supabase 계정 · 참가 실연동'],
      ['검증 범위','Google/Kakao OAuth Production 확인 · 실제 PG 미연동']
    ]));

    const operations=slides[8];
    setText(operations,'.fm-next-story h2','경기 당일 필요한 행동과 이후 흐름을 MY에 모았습니다.');
    setText(operations,'.fm-next-story-lead','Home은 다음 행동을 안내하고, Matchday와 경기 후 흐름은 MY에서 이어집니다.');
    setSummary(operations,[['진행','예정 → 당일 → 체크인 → 종료 후'],['소유','MY · Matchday · Return'],['Home','다음 행동 · MY 진입']]);
    const dayStates=operations.querySelectorAll('.fm-next-cs-day-states>div');
    const dayCopy=[
      ['탐색 중','조건 설정','추천 확인'],
      ['참가 확정','준비 정보','일정 · 장소'],
      ['당일','이동과 체크인','길찾기 · 운영 도움'],
      ['종료 후','피드백과 재탐색','체감 난이도 · 반복 의도']
    ];
    dayCopy.forEach(([phase,title,copy],index)=>{
      const card=dayStates[index];
      if(!card)return;
      setText(card,'small',phase);
      setText(card,'b',title);
      setText(card,'p',copy);
    });
    const operationsNote=operations.querySelector('.fm-next-story-aside .fm-next-cs-note');
    if(operationsNote)operationsNote.innerHTML=rows([
      ['운영 권한','정원 · 취소 마감 · 체크인 · 종료 관리'],
      ['자리 회복','취소 시 포지션별 대기열 FIFO 승급'],
      ['변경과 복구','audit trail 기록 · 알림 실패와 참가 상태 분리 복구']
    ]);

    const recovery=slides[9];
    setText(recovery,'.fm-next-story h2','실패해도 선택 맥락을 유지하고 다음 행동을 제시합니다.');
    setText(recovery,'.fm-next-story-lead','오류마다 이어갈 상태와 재시도·대체 행동을 함께 정의했습니다.');
    setSummary(recovery,[['원칙','원인 · 유지 상태 · 다음 행동'],['복구','재시도 · 조건 수정 · 대기'],['범위','탐색 → 경기 당일']]);
    const recoveryCards=recovery.querySelectorAll('.fm-next-cs-recovery>div');
    const recoveryCopy=[
      ['추천 없음','입력한 탐색 조건 → 지역·시간 수정 또는 조건 완화'],
      ['자리 마감','선택 경기 · 포지션 → 대기 등록 또는 비슷한 경기 탐색'],
      ['참가 상태 문제','선택 경기 · 참가 의도 → 상태 확인 또는 다시 참가'],
      ['경기 당일 문제','참가 · 체크인 상태 → 체크인 재시도 또는 운영 도움']
    ];
    recoveryCopy.forEach(([heading,copy],index)=>{
      const card=recoveryCards[index];
      if(!card)return;
      setText(card,'b',heading);
      setText(card,'span',copy);
    });
    setText(recovery,'.fm-next-cs-decision span','공통 복구 원칙');
    setText(recovery,'.fm-next-cs-decision b','원인 확인 · 상태 유지 · 재시도·대체 행동 제시');

    const domain=slides[10];
    setText(domain,'.fm-next-story h2','추천·상태·실행의 소유권을 분리했습니다.');
    setText(domain,'.fm-next-story-lead','AI는 조건 해석만 맡고, 판단과 참가 확정의 책임을 분리했습니다.');
    setSummary(domain,[['해석','AI · 자연어 조건'],['판단','엔진 · 후보·순위·이유'],['실행','사용자 확인 · 참가 확정']]);
    const modes=domain.querySelectorAll('.fm-next-cs-modes>div');
    if(modes[0]){
      setText(modes[0],'h3','추천 소유권');
      setText(modes[0],'p','후보 · 순위 · 이유 → 결정론적 추천 엔진 · 해석 실패 → fallback 탐색');
    }
    if(modes[1]){
      setText(modes[1],'h3','상태 책임');
      setText(modes[1],'p','참가 · 체크인 · 경기 후 책임 분리 · 사용자-facing 상태는 MY로 일원화');
    }
    if(modes[2]){
      setText(modes[2],'h3','실행 경계');
      setText(modes[2],'p','경기 사실 · 가격 · 정원 · 순위 AI 생성 금지 · 참가 확정 사용자 최종 확인');
    }

    const validation=slides[11];
    setText(validation,'.fm-next-story h2','성과 지표와 제품 동작 검증을 분리했습니다.');
    setText(validation,'.fm-next-story-lead','KPI는 Validation Metric이며 Measured Result가 아닙니다 — 제품 동작은 QA로 별도 확인');
    validation.querySelector('.fm-next-review-summary')?.remove();
    const metricRules=[
      ['상세 진입 세션','결과 노출 세션'],
      ['참가 완료 사용자','상세 조회 사용자'],
      ['복구 완료 흐름','복구 가능 실패 흐름'],
      ['7일 내 재탐색 사용자','7일 관찰 완료 참가 사용자']
    ];
    validation.querySelectorAll('.fm-next-cs-metric .fm-cs-ratio').forEach((node,index)=>{
      const rule=metricRules[index];
      if(!rule)return;
      const prefix=index===0?'계산 기준 · ':'';
      node.textContent=`${prefix}${rule[0]} ÷ ${rule[1]}`;
    });
    const note=validation.querySelector('.fm-next-cs-note');
    if(note)note.textContent='전체 8개 지표 계산·관찰 기준 → KPI 상세';
    setText(validation,'.fm-next-kpi-table>div:last-child dd:nth-of-type(2)','connected-ai와 rules-fallback 분리 · 사용률과 품질 판단 분리');

    const release=slides[12];
    setText(release,'.fm-next-story h2','구현 결과와 다음 과제를 정리했습니다.');
    setText(release,'.fm-next-story-lead','Real App과 Closed Beta의 연결 범위를 나눠 확인했고, 실제 이용자 KPI·결제·수익성은 후속 검증으로 남겼습니다.');
    setSummary(release,[['Real App','AI · sample · browser-local'],['Closed Beta','Supabase · Resend · Push'],['다음 단계','실제 결제 · 이용자 KPI · 수익성']]);
    release.querySelector('.fm-next-cs-outcomes')?.remove();
    release.querySelector('.fm-next-cs-final')?.remove();

    // Every story lead is one sentence. Normalize punctuation without changing wording.
    slides.slice(1).forEach(slide=>{
      const lead=slide.querySelector('.fm-next-story-lead');
      if(!lead)return;
      const normalized=(lead.textContent||'').trim().replace(/[.!?。]+/g,'').replace(/\s+/g,' ');
      lead.textContent=`${normalized}.`;
    });

    document.documentElement.dataset.footmateCaseStudyFinalClarity='1';
    document.documentElement.dataset.footmateCaseStudyRepetitionPolish='1';
    applied=true;
    return true;
  }

  if(!patch()){
    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(patch()||tries>120)clearInterval(timer);
    },25);
  }
})();

/* ===== src/case-study/p0-visuals.js ===== */
/* FootMate Case Study · P0 visual narrative layer
   Scope: visual structure only for five approved sections.
   Keeps the 13-section IA, section headings, product facts, routes, and runtime unchanged. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';

  function section(role){
    return document.querySelector(`${ROOT} .fm-next-story-slide[data-v5-content-role="${role}"]`);
  }

  function visibleSection(index){
    return [...document.querySelectorAll(`${ROOT} .slide:not([hidden])`)][index]||null;
  }

  function mark(slide,name){
    if(!slide)return;
    slide.dataset.p0Visual=name;
  }

  function patchProblem(){
    const slide=visibleSection(1);
    const grid=slide?.querySelector('.fm-next-cs-grid.three');
    const quote=slide?.querySelector('.fm-next-cs-quote');
    if(!slide||!grid||!quote)return false;

    mark(slide,'problem');
    grid.classList.add('fm-p0-problem-map');
    grid.setAttribute('aria-label','경기 선택 불확실성을 만드는 원인과 해결 흐름');
    grid.innerHTML=`
      <div class="fm-p0-problem-sources">
        <article><small>01 · 정보 분산</small><b>조건을 따로 확인</b><p>시간 · 거리 · 레벨 · 포지션 · 남은 자리 · 가격을 다시 맞춰 봐야 함</p></article>
        <article><small>02 · 가치 확인 전 장벽</small><b>로그인이 너무 일찍 등장</b><p>추천이 도움이 되는지 판단하기 전에 계정부터 요구</p></article>
        <article><small>03 · 참가 후 단절</small><b>다음 행동이 흩어짐</b><p>일정 · 체크인 · 경기 후 평가가 서로 다른 기능처럼 느껴짐</p></article>
      </div>
      <div class="fm-p0-problem-core"><small>CORE PROBLEM</small><b>판단 근거의 부족</b><p>조건 비교 → 추천 근거 이해 → 참가 → 경기 당일까지 연결</p></div>
      <div class="fm-p0-problem-path" aria-label="문제 해결 흐름">
        <span>조건 비교</span><i>→</i><span>추천 근거 확인</span><i>→</i><span>참가</span><i>→</i><span>경기 당일</span>
      </div>`;
    quote.classList.add('fm-p0-problem-decision');
    return true;
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
      ['01','탐색','Find','지역 · 시간 · 레벨 설정'],
      ['02','결정','Decide','거리 · 적합성 · 자리 비교'],
      ['03','참가','Join','계정 연결 후 요청 제출'],
      ['04','경기','Play','준비 · 이동 · 출석 처리'],
      ['05','재탐색','Return','피드백 저장 후 새 후보 확인']
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
        <header><span>비교한 대안</span><b>가입 우선</b><p>후보를 보기 전에 계정 생성 필요</p></header>
        <div class="fm-p0-route-steps">
          ${routeStep('01','첫 화면','진입')}
          <i class="fm-p0-route-arrow" aria-hidden="true">→</i>
          ${routeStep('02','로그인','계정 요구')}
          <i class="fm-p0-route-arrow" aria-hidden="true">→</i>
          ${routeStep('03','설문','조건 입력')}
          <i class="fm-p0-route-arrow" aria-hidden="true">→</i>
          ${routeStep('04','추천 확인','결과 진입')}
        </div>
      </article>
      <article class="fm-p0-route is-selected">
        <header><span>채택한 흐름</span><b>탐색 우선</b><p>후보를 둘러본 뒤 계정 연결</p></header>
        <div class="fm-p0-route-steps">
          ${routeStep('01','조건 설정','탐색')}
          <i class="fm-p0-route-arrow" aria-hidden="true">→</i>
          ${routeStep('02','추천','후보 확인')}
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
          <div class="fm-p0-app-context"><small>오늘의 추천</small><b>저장 조건 · 현재 경기 상태 함께 확인</b></div>
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
        <li><span>01</span><div><b>저장 프로필</b><p>기본 수준 · 프로필 반복 입력 최소화</p></div></li>
        <li><span>02</span><div><b>선호 지역 · 시간 · 경기 형식</b><p>최근 선호 → 추천 보조 입력으로만 사용</p></div></li>
        <li><span>03</span><div><b>최근 확인 이력</b><p>반복 탐색 입력 부담 완화 · 오늘의 의도 우선</p></div></li>
        <li><span>04</span><div><b>현재 경기 조건 · 잔여 자리</b><p>후보 · 순위 · 이유 → 결정론적 추천 엔진</p></div></li>
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
      ${recoveryRow('참가 상태 문제','선택 경기와 참가 의도','상태 확인 또는 다시 참가','participation')}
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
        ${architectureNode('RECOMMENDATION','추천 엔진','같은 입력·데이터면 동일한 결과',true)}
        <i aria-hidden="true">→</i>
        ${architectureNode('OUTPUT','추천 결과','후보별 근거와 운영 정보 표시')}
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
      visibleSection(1),
      section('product-thesis-journey'),
      section('guest-first-decision'),
      section('recommendation-decision'),
      section('recovery-principle'),
      section('domain-ai-boundary')
    ].every(Boolean);
    if(!ready)return false;

    const patched=[patchProblem(),patchJourney(),patchGuestFirst(),patchRecommendation(),patchRecovery(),patchDomainAI()];
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

/* ===== src/case-study/p1-visuals.js ===== */
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

/* ===== src/case-study/p2-polish.js ===== */
/* FootMate Case Study · P2 polish orchestration
   Finishing pass only: restrained reveal order, cadence hooks, copy polish, and responsive polish.
   No new product facts, routes, IA, or runtime behavior. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';

  function storySlides(){
    return [...document.querySelectorAll(`${ROOT} .fm-next-story-slide`)];
  }

  function markReveal(node,order){
    if(!node)return;
    node.dataset.p2Reveal='true';
    node.style.setProperty('--fm-p2-order',String(order));
  }

  function markGroup(root,selector,start){
    if(!root)return;
    [...root.querySelectorAll(selector)].forEach((node,index)=>markReveal(node,start+index));
  }

  function markSection(slide){
    slide.dataset.p2Polish='true';
    markReveal(slide.querySelector('.fm-next-story-kicker'),0);
    markReveal(slide.querySelector('.fm-next-story h2'),1);
    markReveal(slide.querySelector('.fm-next-story-lead'),2);
  }

  function stripTerminalPeriod(node){
    if(!node)return;
    node.textContent=node.textContent.replace(/[.。]\s*$/,'');
  }

  function polishVisualCopy(){
    const selectors=[
      '.fm-p0-journey-step p',
      '.fm-p0-route header p',
      '.fm-p0-app-context b',
      '.fm-p0-annotations p',
      '.fm-p0-arch-node span',
      '.fm-p1-persona-context>p',
      '.fm-p1-jtbd-head>b',
      '.fm-p1-auth-screen p',
      '.fm-p1-validation-banner>p'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(stripTerminalPeriod);
  }

  function markP0Sequences(){
    markGroup(document,'.fm-p0-journey-step',3);
    markGroup(document,'.fm-p0-priority-map .fm-p0-priority-card',9);
    document.querySelectorAll('.fm-p0-route-steps').forEach(group=>markGroup(group,'.fm-p0-route-step',3));
    markGroup(document,'.fm-p0-annotations li',3);
    markGroup(document,'.fm-p0-recovery-row',3);
    markGroup(document,'.fm-p0-arch-main .fm-p0-arch-node',3);
    markGroup(document,'.fm-p0-arch-guardrails>div',9);
  }

  function markP1Sequences(){
    markReveal(document.querySelector('.fm-p1-persona-lenses'),3);
    markGroup(document,'.fm-p1-jtbd-journey li',6);
    markGroup(document,'.fm-p1-auth-frame',3);
    markReveal(document.querySelector('.fm-p1-auth-preserve'),7);
    markGroup(document,'.fm-p1-funnel>div',3);
    markGroup(document,'.fm-p1-funnel-ratios .fm-p1-ratio',6);
    markGroup(document,'.fm-p1-secondary-metrics .fm-p1-ratio',8);
    markGroup(document,'.fm-p1-evidence-grid>.fm-next-cs-card',10);
    markGroup(document,'.fm-p1-release-map>article',3);
  }

  function markFallbackBlocks(){
    storySlides().forEach(slide=>{
      const hasVisual=slide.dataset.p0Visual||slide.dataset.p1Visual;
      if(hasVisual)return;
      const copy=slide.querySelector('.fm-next-story-copy');
      if(!copy)return;
      [...copy.children].forEach((node,index)=>{
        if(node.matches('.fm-next-story-kicker,h2,.fm-next-story-lead'))return;
        markReveal(node,3+index);
      });
    });
  }

  function apply(){
    if(document.documentElement.dataset.fmCaseStudyP2Polish==='true')return true;
    if(document.documentElement.dataset.fmCaseStudyP1Visuals!=='true')return false;
    if(document.documentElement.dataset.fmCaseStudyP1FinalRepair!=='true')return false;
    if(document.querySelectorAll('.fm-p1-release-map>article').length!==3)return false;
    const slides=storySlides();
    if(!slides.length)return false;

    polishVisualCopy();
    slides.forEach(markSection);
    markP0Sequences();
    markP1Sequences();
    markFallbackBlocks();
    document.documentElement.dataset.fmCaseStudyP2Polish='true';
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

/* ===== src/case-study/p1-real-preview.js ===== */
/* FootMate Case Study · P1 Real App home preview */
(function(){
  let tries=0;
  function apply(){
    const preview=document.querySelector('.fm-next-cover .fm-cs-static-preview');
    if(!preview){
      if(tries++<24)requestAnimationFrame(apply);
      return;
    }
    if(preview.dataset.fmP1RealPreview==='true')return;

    preview.dataset.fmP1RealPreview='true';
    preview.classList.remove('fm-cs-ai-preview');
    preview.classList.add('fm-cs-real-home-preview');
    preview.setAttribute('aria-label','FootMate 최신 Real App 홈 화면 정적 프리뷰');
    preview.innerHTML=`
      <div class="fm-p1-real-top">
        <div class="fm-p1-real-brand"><span class="fm-p1-real-logo-mark" aria-hidden="true">◉</span><b>FootMate</b></div>
      </div>
      <div class="fm-p1-real-segment" aria-label="홈 탐색 모드">
        <b>추천 경기 보기</b><span>조건 바꾸기</span>
      </div>
      <section class="fm-p1-real-ai" aria-label="AI Match Assistant">
        <small>AI MATCH ASSISTANT</small>
        <h3>AI에게 원하는 경기를 검색해보세요.</h3>
        <div class="fm-p1-real-ai-form"><span>예: 8시 이후, 가까운 중급 MF</span><b>AI로 찾기</b></div>
        <div class="fm-p1-real-chips"><span>8시 이후 · 2만원 이하</span><span>인계 · 초급</span><span>20분 이내 · GK</span></div>
      </section>
      <div class="fm-p1-real-section-head"><h3>For You</h3><span>전체 보기</span></div>
      <article class="fm-p1-real-match">
        <div class="fm-p1-real-match-meta"><small>샘플 일정 · 평일 21:30</small><b>✦ 추천 1순위</b></div>
        <h3>광교 웨스트파크</h3>
        <div class="fm-p1-real-match-bottom"><div><span class="is-fit">조건과 잘 맞아요</span><span>22분</span><span>MF 2자리</span></div><strong>13,000원</strong></div>
      </article>
      <nav class="fm-p1-real-nav" aria-label="Real App 하단 내비게이션"><span class="is-on">⌂<b>홈</b></span><span>⌕<b>경기 찾기</b></span><span>○<b>MY</b></span></nav>`;

    const note=document.querySelector('.fm-next-cover-note');
    if(note)note.innerHTML='<strong>최신 Real App 홈 프리뷰</strong><span>현재 Production 홈 구조를 정적으로 재현했습니다.</span>';
    document.documentElement.dataset.fmP1RealPreview='true';
  }
  apply();
})();

/* ===== src/case-study/p12-copy-spacing.js ===== */
/* FootMate Case Study · copy cleanup + P12 evidence-card rhythm
   Scope: reader-facing Case Study copy only. Product runtime and metric definitions remain unchanged. */
(function(){
  function setReasonValue(root,label,value){
    const row=[...(root?.querySelectorAll('.fm-cs-reasons>div')||[])].find(node=>node.querySelector('dt')?.textContent.trim()===label);
    const valueNode=row?.querySelector('dd');
    if(valueNode)valueNode.textContent=value;
  }

  function ensureReleaseClosing(release){
    const map=release?.querySelector('.fm-p1-release-map');
    if(!release||!map)return false;

    let closing=release.querySelector('.fm-p1-release-next');
    if(!closing){
      closing=document.createElement('div');
      closing.className='fm-next-cs-final fm-p1-release-next';
      closing.setAttribute('aria-label','Case Study 핵심 Learning');
      closing.innerHTML=`
        <span>KEY LEARNING · 다음 검증으로 연결</span>
        <dl class="fm-cs-reasons">
          <div><dt>배운 점</dt><dd>연결 성공 + 실패·중복·상태 갱신까지 함께 정의</dd></div>
        </dl>`;
      map.insertAdjacentElement('afterend',closing);
    }
    return closing.isConnected;
  }

  function apply(){
    if(document.documentElement.dataset.fmCaseStudyP12CopySpacing==='true')return true;
    if(document.documentElement.dataset.footmateCaseStudyFinalClarity!=='1')return false;
    if(document.documentElement.dataset.fmCaseStudyP1Visuals!=='true')return false;

    const slides=[...document.querySelectorAll('html[data-fm-next-case-study="true"] .slide:not([hidden])')];
    if(slides.length!==13)return false;

    const problem=slides[1];
    const auth=slides[7];
    const validation=slides[11];
    const release=slides[12];
    const lead=validation?.querySelector('.fm-next-story-lead');
    const releaseLead=release?.querySelector('.fm-next-story-lead');
    const banner=validation?.querySelector('.fm-p1-validation-banner');
    const evidence=validation?.querySelector('.fm-p1-evidence-grid');
    if(!problem||!auth||!validation||!release||!lead||!releaseLead||!banner||!evidence)return false;

    setReasonValue(
      problem.querySelector('.fm-next-cs-quote'),
      '검증 범위',
      '설계 가설 · 사용자 조사·경쟁사 우위 미입증 · Beta 확인'
    );

    const authScope=auth.querySelector('.fm-next-cs-scope');
    setReasonValue(authScope,'Closed Beta','Supabase 계정·참가 흐름 실연동');
    setReasonValue(authScope,'검증 범위','Google/Kakao OAuth Production 확인 · 실제 PG 후속 범위');

    lead.textContent='아래 지표는 Beta에서 관찰할 Validation Metric으로, 아직 측정된 성과값이 아닙니다.';
    releaseLead.textContent='핵심 연결과 사용자 확인을 마치고, KPI·결제·수익성은 후속 검증으로 남겼습니다.';

    const bannerTitle=banner.querySelector('b');
    const bannerCopy=banner.querySelector('p');
    if(bannerTitle)bannerTitle.textContent='측정 전 기준 정의';
    if(bannerCopy)bannerCopy.textContent='목표치보다 분자 · 분모 · 제외 조건 · 기준값을 먼저 정의';

    if(!ensureReleaseClosing(release))return false;

    document.documentElement.dataset.fmCaseStudyP12CopySpacing='true';
    document.documentElement.dataset.fmCaseStudyCompletionPolish='true';
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

/* ===== src/case-study/product-evidence.js ===== */
/* FootMate Case Study · product evidence visual upgrade
   Adds verified product visual-baseline evidence after P2 has settled.
   No new product facts, routes, IA, or runtime behavior. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';
  const ASSET='/src/case-study/evidence/';
  const SOURCE='visual-baseline-c718e788';

  function section(role){
    return document.querySelector(`${ROOT} .fm-next-story-slide[data-v5-content-role="${role}"]`);
  }

  function figure(src,label,title,meta,alt,mod){
    const node=document.createElement('figure');
    node.className=`fm-evidence-figure ${mod||''}`.trim();
    node.dataset.evidenceSource=SOURCE;
    node.innerHTML=`
      <div class="fm-evidence-media">
        <span class="fm-evidence-badge">${label}</span>
        <img src="${ASSET}${src}" alt="${alt}" loading="lazy" decoding="async">
      </div>
      <figcaption><b>${title}</b><span>${meta}</span></figcaption>`;
    node.dataset.p2Reveal='true';
    node.style.setProperty('--fm-p2-order','8');
    return node;
  }

  function patchRecommendation(){
    const slide=section('recommendation-decision');
    const stage=slide?.querySelector('.fm-p0-reco-stage');
    if(!slide||!stage)return false;
    if(stage.querySelector('.fm-evidence-figure'))return true;

    stage.replaceChildren(figure(
      'recommendation-home.png',
      'PRODUCT UI',
      '추천 홈',
      'Product visual baseline · 390px',
      'FootMate 추천 홈 제품 화면',
      'is-recommendation'
    ));
    slide.dataset.evidenceUpgrade='recommendation';
    return true;
  }

  function patchDetail(){
    const slide=section('detail-decision');
    const order=slide?.querySelector('.fm-next-cs-detail-order');
    if(!slide||!order)return false;
    if(slide.querySelector('.fm-evidence-detail-layout'))return true;

    const wrap=document.createElement('div');
    wrap.className='fm-evidence-detail-layout';
    order.parentNode.insertBefore(wrap,order);
    wrap.append(
      order,
      figure(
        'decision-detail.png',
        'PRODUCT UI',
        '참가 결정 상세',
        'Product visual baseline · 390px',
        'FootMate 참가 결정 상세 제품 화면',
        'is-detail'
      )
    );
    slide.dataset.evidenceUpgrade='detail';
    return true;
  }

  function patchOperations(){
    const states=document.querySelector(`${ROOT} .fm-next-cs-day-states`);
    const slide=states?.closest('.fm-next-story-slide');
    if(!slide||!states)return false;
    if(slide.querySelector('.fm-evidence-operations-layout'))return true;

    const wrap=document.createElement('div');
    wrap.className='fm-evidence-operations-layout';
    states.parentNode.insertBefore(wrap,states);
    wrap.append(
      states,
      figure(
        'operations-matchday.png',
        'PRODUCT UI',
        '경기 당일 허브',
        'Product visual baseline · 390px',
        'FootMate 경기 당일 허브 제품 화면',
        'is-operations'
      )
    );
    slide.dataset.evidenceUpgrade='operations';
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

  function normalizeRecoveryMap(map){
    map.classList.add('fm-p0-recovery-map');
    map.setAttribute('aria-label','문제 발생 시 보존할 상태와 다음 행동');
    map.innerHTML=`
      <div class="fm-p0-recovery-head" aria-hidden="true"><span>문제</span><span>보존할 상태</span><span>다음 행동</span></div>
      ${recoveryRow('추천 없음','입력한 탐색 조건','지역·시간 수정 또는 조건 완화','search')}
      ${recoveryRow('자리 마감','선택 경기와 포지션','대기 등록 또는 비슷한 경기 탐색','capacity')}
      ${recoveryRow('참가 상태 문제','선택 경기와 참가 의도','상태 확인 또는 다시 참가','participation')}
      ${recoveryRow('경기 당일 문제','참가·체크인 상태','체크인 재시도 또는 운영 도움','matchday')}`;
    [...map.querySelectorAll('.fm-p0-recovery-row')].forEach((row,index)=>{
      row.dataset.p2Reveal='true';
      row.style.setProperty('--fm-p2-order',String(3+index));
    });
  }

  function patchRecovery(){
    const slide=section('recovery-principle');
    const map=slide?.querySelector('.fm-p0-recovery-map')||slide?.querySelector('.fm-next-cs-recovery');
    if(!slide||!map)return false;
    if(slide.querySelector('.fm-evidence-recovery-strip'))return true;

    normalizeRecoveryMap(map);

    const strip=document.createElement('div');
    strip.className='fm-evidence-recovery-strip';
    strip.setAttribute('aria-label','제품 복구 상태 대표 화면');
    strip.append(
      figure(
        'recovery-discovery-empty.png',
        'EMPTY',
        '탐색 결과 없음',
        '빈 상태 UI',
        'FootMate 탐색 결과 없음 제품 화면',
        'is-recovery'
      ),
      figure(
        'recovery-participation-failure.png',
        'FAILURE',
        '참가 실패',
        '실패 상태 UI',
        'FootMate 참가 실패 제품 화면',
        'is-recovery'
      )
    );
    map.insertAdjacentElement('afterend',strip);
    slide.dataset.evidenceUpgrade='recovery';
    return true;
  }

  function apply(){
    if(document.documentElement.dataset.fmCaseStudyProductEvidence==='true')return true;
    if(document.documentElement.dataset.fmCaseStudyP2Polish!=='true')return false;

    const patched=[
      patchRecommendation(),
      patchDetail(),
      patchOperations(),
      patchRecovery()
    ];
    if(!patched.every(Boolean))return false;

    document.documentElement.dataset.fmCaseStudyProductEvidence='true';
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

/* ===== src/case-study/advanced-polish.js ===== */
/* FootMate Case Study · advanced portfolio polish
   Presentation-only enhancements: Korean micro labels, evidence scale metadata,
   contextual previous/next labels, and a clearer final CTA. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';
  const sectionNames=['개요','문제','Persona','우선순위','Guest First','추천','상세','로그인·참가','운영','복구','Domain·AI','KPI·검증','Release·회고'];

  function visibleToc(){
    return [...document.querySelectorAll('.toc-item')].filter(item=>!item.hidden&&item.dataset.csHidden!=='true');
  }

  function setText(node,text){
    if(node)node.textContent=text;
  }

  function translateMicroLabels(){
    const archMap={
      INPUT:'입력',AI:'AI 해석',CONTRACT:'구조화 조건',RECOMMENDATION:'추천 엔진',OUTPUT:'추천 결과',HITL:'사용자 확인'
    };
    document.querySelectorAll(`${ROOT} .fm-p0-arch-node small`).forEach(node=>{
      const key=(node.textContent||'').trim().toUpperCase();
      if(archMap[key])node.textContent=archMap[key];
    });

    const priorityMap={
      'NOW · 먼저 검증':'현재 · 먼저 검증',
      'NEXT · 확장 검증':'다음 · 확장 검증',
      'OUT · 이번 범위 제외':'제외 · 이번 범위'
    };
    document.querySelectorAll(`${ROOT} .fm-p0-priority-label`).forEach(node=>{
      const key=(node.textContent||'').trim();
      if(priorityMap[key])node.textContent=priorityMap[key];
    });

    const jtbdMap={
      SITUATION:'상황',DECISION:'판단',JOB:'과업','OBSERVE IN BETA':'Beta 관찰'
    };
    document.querySelectorAll(`${ROOT} .fm-p1-jtbd-journey li small`).forEach(node=>{
      const key=(node.textContent||'').trim().toUpperCase();
      if(jtbdMap[key])node.textContent=jtbdMap[key];
    });

    setText(document.querySelector(`${ROOT} .fm-p1-auth-preserve small`),'상태 보존');
    setText(document.querySelector(`${ROOT} .fm-p1-validation-banner>span`),'검증 지표');

    const funnelMap={DISCOVERY:'탐색',DETAIL:'상세',JOIN:'참가'};
    document.querySelectorAll(`${ROOT} .fm-p1-funnel small`).forEach(node=>{
      const raw=(node.textContent||'').trim();
      const match=raw.match(/^(\d+)\s*·\s*(.+)$/);
      if(!match)return;
      const translated=funnelMap[match[2].toUpperCase()];
      if(translated)node.textContent=`${match[1]} · ${translated}`;
    });

    const evidenceMap={
      'AUTOMATED QA':'자동 QA',
      'HUMAN CHECK':'사람 검수',
      'AI-ASSISTED REVIEW':'AI 보조 검수'
    };
    document.querySelectorAll(`${ROOT} .fm-p1-evidence-label`).forEach(node=>{
      const key=(node.textContent||'').trim().toUpperCase();
      if(evidenceMap[key])node.textContent=evidenceMap[key];
    });

    document.querySelectorAll(`${ROOT} .fm-p1-release-map [data-zone="open-boundary"] header small`).forEach(node=>{
      node.textContent='미연동 · 미검증';
    });

    const finalLabel=document.querySelector(`${ROOT} .fm-p1-release-next>span`);
    if(finalLabel)finalLabel.textContent='핵심 학습 · 다음 검증으로 연결';
  }

  function markEvidenceScale(){
    const targets=[
      ['.fm-evidence-figure.is-recommendation','primary'],
      ['.fm-evidence-figure.is-detail','primary'],
      ['.fm-evidence-figure.is-operations','primary']
    ];
    let marked=0;
    for(const [selector,scale] of targets){
      const node=document.querySelector(`${ROOT} ${selector}`);
      if(!node)continue;
      node.setAttribute('data-evidence-scale',scale);
      marked+=1;
    }
    return marked;
  }

  function wireEvidenceScale(){
    const track=document.querySelector('.track');
    const sync=()=>markEvidenceScale();
    if(sync()===3)return;
    if(!track)return;

    const observer=new MutationObserver(()=>{
      if(sync()===3)observer.disconnect();
    });
    observer.observe(track,{childList:true,subtree:true});

    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(sync()===3||tries>240){
        clearInterval(timer);
        observer.disconnect();
      }
    },25);
  }

  function updateNavigationLabels(){
    const toc=visibleToc();
    const current=Math.max(0,toc.findIndex(item=>item.classList.contains('on')));
    const prev=document.querySelector('.btn-prev');
    const next=document.querySelector('.btn-next');
    const prevText=current>0?`이전 · ${sectionNames[current-1]}`:'첫 섹션';
    const nextText=current<sectionNames.length-1?`다음 · ${sectionNames[current+1]}`:'마지막 섹션';
    if(prev){
      prev.dataset.navLabel=prevText;
      prev.setAttribute('aria-label',prevText);
    }
    if(next){
      next.dataset.navLabel=nextText;
      next.setAttribute('aria-label',nextText);
    }
  }

  function wireNavigation(){
    const controls=document.querySelector('.cs-controls');
    const toc=document.querySelector('.toc');
    const refresh=()=>requestAnimationFrame(updateNavigationLabels);
    controls?.addEventListener('click',refresh);
    toc?.addEventListener('click',refresh);
    document.addEventListener('keydown',event=>{
      if(['ArrowLeft','ArrowRight','PageUp','PageDown','Home','End'].includes(event.key))refresh();
    });
    const count=document.querySelector('.topbar-count');
    if(count)new MutationObserver(refresh).observe(count,{childList:true,characterData:true,subtree:true});
    updateNavigationLabels();
  }

  function apply(){
    const html=document.documentElement;
    if(html.dataset.fmCaseStudyAdvancedPolish==='true')return true;
    if(html.dataset.fmCaseStudyP1Visuals!=='true')return false;
    const slides=[...document.querySelectorAll(`${ROOT} .slide:not([hidden])`)];
    if(slides.length!==13)return false;

    translateMicroLabels();
    wireEvidenceScale();
    wireNavigation();
    html.dataset.fmCaseStudyAdvancedPolish='true';
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

/* ===== src/case-study/decision-evidence.js ===== */
/* FootMate Case Study · interactive decision evidence.
   Recommendation uses the product's pure base ranker and sample data.
   Recovery is a local UI model; it never signs in, joins or writes product storage. */
(function(){
  const SOURCE='https://github.com/dohyunkimmm/footmate/blob/b97898d86a8e18450f9bac1ced51209f64545bee/';
  const link=(path,label)=>`<a class="fm-proof-link" href="${SOURCE}${path}" target="_blank" rel="noopener">${label} ↗</a>`;
  const rows=items=>'<dl class="fm-cs-reasons">'+items.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')+'</dl>';
  const CASES=[
    {label:'참가 실패 복구',title:'멈춘 버튼을 다시 선택할 수 있는 상태로 바꿨습니다.',steps:[
      ['수정 전','경기 정보가 없으면 참가 처리 중단','버튼은 처리 중 상태에 남아 다음 행동 불가'],
      ['원인','데이터 없음과 처리 오류의 복구 경로 누락','경기 존재 여부만 확인 · 버튼 상태 복원 누락'],
      ['수정','오류 안내 · 재시도 · 경기 다시 선택','처리 중에는 잠금 · 실패하면 버튼 활성화'],
      ['재검증','정보 유실 → 오류 → 정보 복원 → 참가 성공','자동 E2E에서 안내·활성 버튼·성공 화면 확인']
    ]},
    {label:'평가 후 다음 탐색',title:'저장 완료를 다음 경기 탐색으로 연결했습니다.',steps:[
      ['수정 전','평가 저장 후에도 피드백 안내 유지','Home은 종료 후 상태만 보고 MY로 재안내'],
      ['원인','저장 완료 여부와 화면 상태의 연결 누락','경기 종료 상태와 평가 완료 상태를 구분하지 않음'],
      ['수정','완료 기록 확인 · 다음 경기 찾기로 전환','MY에서 저장 · Home에서 완료 안내와 탐색 진입'],
      ['재검증','평가 저장 → Home 완료 → Discover 진입','자동 E2E에서 저장·완료 문구·다음 화면 확인']
    ]}
  ];
  function improvementEvidence(slides){
    const dialog=document.createElement('dialog');dialog.className='fm-improvement-dialog';dialog.setAttribute('aria-labelledby','fm-improvement-title');
    dialog.innerHTML='<header><div><small>구현 개선 · 재검증 기록</small><h2 id="fm-improvement-title">실제 수정과 검증을 연결했습니다.</h2></div><button type="button" aria-label="개선 기록 닫기">닫기 ×</button></header><div class="fm-improvement-tabs" role="group" aria-label="개선 사례 선택"></div><div class="fm-improvement-content" aria-live="polite" aria-atomic="true"></div><footer><p>개발·QA에서 확인한 개선 사례 · 사용자 관찰 결과와 이용 성과는 별도 검증</p><a class="fm-proof-link" href="https://github.com/dohyunkimmm/footmate/pull/442" target="_blank" rel="noopener">실제 수정 기록 ↗</a>'+link('tests/e2e/release-app.spec.cjs','현재 재검증 계약')+'</footer>';
    const tabs=dialog.querySelector('.fm-improvement-tabs');
    CASES.forEach((item,i)=>{const button=document.createElement('button');button.type='button';button.textContent=item.label;button.dataset.improvementCase=String(i);button.addEventListener('click',()=>render(i));tabs.appendChild(button);});
    const render=index=>{
      dialog.dataset.improvementCase=String(index);
      tabs.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      dialog.querySelector('.fm-improvement-content').innerHTML='<h3>'+CASES[index].title+'</h3><ol>'+CASES[index].steps.map(([stage,title,copy],i)=>`<li><span>${String(i+1).padStart(2,'0')} · ${stage}</span><b>${title}</b><p>${copy}</p></li>`).join('')+'</ol>';
    };
    let opener;
    dialog.querySelector('header>button').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('keydown',event=>event.stopPropagation());
    dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
    dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
    document.body.appendChild(dialog);
    const addButton=(host,label,index)=>{
      const button=document.createElement('button');button.type='button';button.className='fm-improvement-open';button.textContent=label;button.setAttribute('aria-haspopup','dialog');
      button.addEventListener('click',()=>{opener=button;render(index);dialog.showModal();});host.appendChild(button);
    };
    addButton(slides[9].querySelectorAll('.fm-evidence-recovery-strip figcaption')[1],'수정 전후 · 재검증 보기',0);
    addButton(slides[11].querySelectorAll('.fm-p1-evidence-grid>.fm-next-cs-card')[1],'개선 사례 2건 보기',0);
    const state=slides[8].querySelectorAll('.fm-next-cs-day-states>div')[3];
    state.querySelector('p').textContent='저장 여부에 따라 완료 안내와 탐색 버튼 표시';
    addButton(slides[8].querySelector('.fm-next-cs-note'),'평가 후 탐색 개선 보기',1);
  }
  function recommendation(slide){
    const figure=slide.querySelector('.is-recommendation');
    figure.dataset.evidenceSource='shared-base-ranker-sample-data';
    figure.dataset.evidenceKind='interactive';
    figure.querySelector('.fm-evidence-media').innerHTML=`
      <div class="fm-decision-mock" aria-label="추천 조건을 변경하는 제품 목업">
        <header class="fm-mock-top"><b>FootMate</b><span>추천 경기</span></header>
        <div class="fm-mock-context"><small>나에게 맞는 경기</small><b>조건을 바꾸고, 이유를 확인해요.</b></div>
        <div class="fm-mock-presets" role="group" aria-label="추천 조건 예시">
          <button type="button" data-reco-preset="0" aria-pressed="true" disabled>수원 · 중급 MF</button>
          <button type="button" data-reco-preset="1" aria-pressed="false" disabled>용인 · 초중급 GK</button>
        </div>
        <div class="fm-mock-results" aria-live="polite" aria-atomic="true"><p class="fm-mock-loading">추천 경기를 불러오고 있어요.</p></div>
        <footer class="fm-mock-footer"><span>조건 일치 이유로 판단</span><b>추천 → 상세 → 참가 확인</b></footer>
      </div>`;
    figure.querySelector('figcaption b').textContent='조건 변경 · 추천 UI 목업';
    figure.querySelector('figcaption span').innerHTML='기본 추천 로직 실행 · 샘플 경기 '+link('src/platform/domain/recommendation.js','추천 근거');
    const host=figure.querySelector('.fm-mock-results');
    const presets=[{region:'수원 · 인계',level:'중급',position:'MF'},{region:'용인 · 기흥',level:'초중급',position:'GK'}];
    const buttons=[...figure.querySelectorAll('[data-reco-preset]')];
    let previous=[],feedbackTimer;
    Promise.all([import('/src/platform/domain/recommendation.js'),import('/src/app/data.js')]).then(([domain,data])=>{
      const render=index=>{
        buttons.forEach((button,i)=>{button.disabled=false;button.setAttribute('aria-pressed',String(i===index));});
        const ranked=domain.rankRecommendations(data.MATCHES,presets[index]).slice(0,2);
        clearTimeout(feedbackTimer);
        const prior=previous;previous=ranked.map(item=>({id:item.match.id,reasons:item.reasons.slice(0,3).map(r=>r.title)}));
        host.replaceChildren();
        ranked.forEach((item,i)=>{
          const card=document.createElement('article');card.className='fm-mock-match';card.dataset.matchId=item.match.id;
          const meta=document.createElement('div');meta.className='fm-mock-match-meta';
          const rank=document.createElement('span');rank.textContent=String(i+1).padStart(2,'0');
          const priorIndex=prior.findIndex(entry=>entry.id===item.match.id);
          if(prior.length&&priorIndex!==i){rank.classList.add('fm-rank-updated');card.dataset.recoChange='rank';}
          const venue=document.createElement('b');venue.textContent=item.match.place;
          const time=document.createElement('small');time.textContent=item.match.shortDate;
          meta.append(rank,venue,time);
          const reasons=document.createElement('div');reasons.className='fm-mock-reasons';
          item.reasons.slice(0,3).forEach(reason=>{const chip=document.createElement('span');chip.textContent=reason.title;
            if(prior.length&&!prior[priorIndex]?.reasons.includes(reason.title))chip.classList.add('fm-reason-updated');
            reasons.appendChild(chip);});
          const footer=document.createElement('div');footer.className='fm-mock-match-bottom';
          const detail=document.createElement('span');detail.textContent=item.match.level+' · '+item.match.distance+' · '+item.spotLabel;
          const price=document.createElement('b');price.textContent=new Intl.NumberFormat('ko-KR').format(item.match.price)+'원';
          footer.append(detail,price);card.append(meta,reasons,footer);host.appendChild(card);
        });
        if(prior.length)feedbackTimer=setTimeout(()=>{
          host.querySelectorAll('[data-reco-change]').forEach(node=>delete node.dataset.recoChange);
          host.querySelectorAll('.fm-rank-updated,.fm-reason-updated').forEach(node=>node.classList.remove('fm-rank-updated','fm-reason-updated'));
        },1400);
        figure.dataset.recommendationPreset=String(index);
        const context=figure.querySelector('.fm-mock-context small');context.textContent=index===0?'비교 A · 수원 / 중급 / MF':'비교 B · 용인 / 초중급 / GK';
        const footer=figure.querySelector('.fm-mock-footer');footer.querySelector('span').textContent='1순위 · '+ranked[0].match.place;footer.querySelector('b').textContent='조건 변경 → 순위·이유 재계산';
      };
      buttons.forEach(button=>button.addEventListener('click',()=>render(Number(button.dataset.recoPreset))));
      render(0);
      figure.dataset.interactiveReady='true';
    }).catch(()=>{host.textContent='추천 예시를 불러오지 못했어요. 새로고침해 다시 확인해 주세요.';figure.dataset.interactiveReady='error';});
    const note=slide.querySelector('.fm-next-cs-note');
    slide.querySelector('.fm-p0-annotations').innerHTML=[
      ['목업 입력','두 조건 예시로 기본 추천의 순위·이유를 비교'],
      ['제품의 선호 기억','브라우저에 저장 · 이 목업의 비교에는 미적용'],
      ['제품의 AI 제어','해석 결과를 수정·해제 · 이 목업은 직접 조건 비교']
    ].map(([title,copy],i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><div><b>${title}</b><p>${copy}</p></div></li>`).join('');
    note.innerHTML=rows([
      ['대안','내부 점수를 중심으로 목록 제공'],
      ['선택','판단에 필요한 일치 항목을 먼저 노출'],
      ['제약','샘플 데이터로 실행 · 개인화 기억은 별도 입력']
    ]);
  }
  function recovery(slide){
    const figure=slide.querySelectorAll('.fm-evidence-recovery-strip .fm-evidence-figure')[1];
    figure.dataset.evidenceKind='interactive-mock';
    figure.querySelector('.fm-evidence-media').innerHTML=`<div class="fm-cs-recovery-example fm-recovery-demo" data-recovery-state="failed">
      <span class="fm-recovery-state-label"><span class="fm-recovery-state-icon" aria-hidden="true">!</span><b>참가 실패</b></span>
      <div class="fm-recovery-message" aria-live="polite" aria-atomic="true"><b>참가를 확정하지 못했어요.</b><p>요청 전 정보를 그대로 남겼어요.</p></div>
      <div class="fm-recovery-retained"><span>보존한 선택</span><b>수원 인계 · MF</b></div>
      <div class="fm-recovery-actions"><button type="button" data-recovery-action="retry">다시 시도</button><button type="button" data-recovery-action="choose">경기 다시 선택</button></div>
      <small class="fm-recovery-action-label">다시 시도 · 경기 다시 선택</small>
    </div>`;
    figure.querySelector('figcaption b').textContent='참가 실패 · 복구 설계';
    figure.querySelector('figcaption span').innerHTML='화면 캡처 아님 · 복구 UI 목업 '+link('tests/e2e/release-app.spec.cjs','재시도 QA');
    const demo=figure.querySelector('.fm-recovery-demo');
    let timer;
    const render=state=>{
      demo.dataset.recoveryState=state;
      const status={failed:['!','참가 실패'],checking:['…','결과 확인 중'],success:['✓','참가 완료'],choose:['↗','경기 다시 선택']}[state];
      demo.querySelector('.fm-recovery-state-icon').textContent=status[0];demo.querySelector('.fm-recovery-state-label>b').textContent=status[1];
      const message={failed:['참가를 확정하지 못했어요.','요청 전 정보를 그대로 남겼어요.'],checking:['참가 결과를 확인하고 있어요.','중복 참가를 막기 위해 버튼을 잠시 잠갔어요.'],success:['참가를 확정했어요.','다음 행동은 MY에서 이어가요.'],choose:['다른 경기를 선택해요.','탐색 조건을 유지하고 후보를 다시 확인해요.']}[state];
      demo.querySelector('.fm-recovery-message b').textContent=message[0];demo.querySelector('.fm-recovery-message p').textContent=message[1];
      const retry=demo.querySelector('[data-recovery-action="retry"]');retry.disabled=state==='checking';retry.textContent=state==='checking'?'확인 중…':state==='failed'?'다시 시도':'처음 상태로';
      demo.querySelector('[data-recovery-action="choose"]').disabled=state==='checking';
    };
    demo.querySelector('[data-recovery-action="retry"]').addEventListener('click',()=>{
      clearTimeout(timer);
      if(demo.dataset.recoveryState!=='failed'){render('failed');return;}
      render('checking');timer=setTimeout(()=>render('success'),450);
    });
    demo.querySelector('[data-recovery-action="choose"]').addEventListener('click',()=>{clearTimeout(timer);render('choose');});
  }
  function architecture(slide){
    const main=slide.querySelector('.fm-p0-arch-main');
    const nodes=[...main.querySelectorAll('.fm-p0-arch-node')];
    main.replaceChildren();main.classList.add('fm-owner-grid');main.setAttribute('aria-label','사용자, AI, 추천 로직의 책임 경계');
    [['사용자','의도와 최종 결정',[0,5]],['AI','의도를 이해하는 단계',[1,2]],['추천 로직','경기 데이터로 후보 판단',[3,4]]].forEach(([owner,reason,indexes],i)=>{
      const group=document.createElement('section');group.className='fm-owner-column';group.dataset.owner=String(i);
      const header=document.createElement('header');const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');const b=document.createElement('b');b.textContent=owner;const p=document.createElement('p');p.textContent=reason;header.append(n,b,p);group.appendChild(header);
      indexes.forEach(index=>group.appendChild(nodes[index]));main.appendChild(group);
    });
    const copy=slide.querySelector('.fm-next-cs-note');
    copy.innerHTML=rows([
      ['대안','자유 생성으로 사실·순위까지 구성'],
      ['선택','검증 가능한 입력·출력 경계 고정'],
      ['제약','자동 참가 금지 · 연결 실패 시 규칙 기반 대체']
    ])+link('docs/SERVICE-PLANNING-EVIDENCE.md','책임 분리 근거');
  }
  function validation(slide){
    const cards=slide.querySelectorAll('.fm-p1-evidence-grid>.fm-next-cs-card');
    const copy=[
      ['사용자 과업','교육생 6명 · 가입 과업 8회','수료 전 탐색·가입 동선 확인 · 대표성·전환 효과는 미검증','docs/USER-TEST-EVIDENCE.md'],
      ['자동 QA','오류와 복원 경로','회귀 테스트 · 브라우저 E2E · 접근성 · 화면 비교 · 참가 실패·재시도','tests/e2e/release-app.spec.cjs'],
      ['사람 검수','외부 서비스와 전달 결과','실제 로그인 · 이메일 전달 · 브라우저·OS 알림 표시 · 사용자 효과와 구분','docs/SERVICE-PLANNING-EVIDENCE.md']
    ];
    cards.forEach((card,i)=>{card.querySelector('.fm-p1-evidence-label').textContent=copy[i][0];card.querySelector('h3').textContent=copy[i][1];card.querySelector('p').textContent=copy[i][2];card.insertAdjacentHTML('beforeend',link(copy[i][3],'근거'));});
    slide.querySelector('.fm-next-cs-note').innerHTML='이후 개인 고도화 · 설계와 구현의 일치, 중단 상황의 대응을 점검';
  }
  function nextDecisions(slide){
    const summary=[['개선 근거','수정 사례 2건'],['점검 방식','구현과 자동 QA 대조'],['적용 범위','개인 프로젝트의 품질 관리']];
    slide.querySelectorAll('.fm-next-review-summary>div').forEach((node,i)=>{node.querySelector('span').textContent=summary[i][0];node.querySelector('b').textContent=summary[i][1];});
    const definitions=[
      ['real-app','추천 일관성','조건과 설명이 일치하는가',[
        ['입력 반영','지역·레벨·포지션에 따라 후보 변경'],['재현성','같은 요청이면 동일한 순서'],['표현 원칙','내부 점수보다 선택에 필요한 이유 제시'],['보완 조건','근거와 입력이 어긋나면 로직·문구 함께 수정']
      ]],
      ['closed-beta','흐름 완결성','완료 후 다음 행동이 있는가',[
        ['발견한 문제','저장했어도 피드백 안내가 남음'],['수정 내용','완료 상태를 구분해 탐색 버튼 표시'],['검증 경로','저장 → Home 완료 → Discover 진입'],['점검 항목','종료 단계의 주 행동과 복귀 위치']
      ]],
      ['open-boundary','복구 행동','오류 후 다시 행동할 수 있는가',[
        ['버튼 복원','멈춤 → 오류 안내·재시도·다른 경기 선택'],['확인 절차','정보 유실 → 복원 → 참가 성공'],['예외 정의','상황마다 남길 정보와 이어갈 조치 명시']
      ]]
    ];
    definitions.forEach(([zone,label,title,items])=>{
      const card=slide.querySelector(`[data-zone="${zone}"]`);card.querySelector('header small').textContent=label;card.querySelector('header b').textContent=title;
      card.querySelector('ul').innerHTML=items.map(([name,copy])=>`<li data-status="not-measured"><span>${name}</span><b>${copy}</b></li>`).join('');
    });
    slide.querySelector('.fm-p1-release-map').setAttribute('aria-label','개인 고도화의 설계 학습과 다음 품질 기준');
    slide.querySelector('.fm-p1-release-next>span').textContent='핵심 학습 · 이후 적용';
    slide.querySelector('.fm-p1-release-next dl').innerHTML=rows([['배운 점','완료·실패 화면에서도 이어갈 조치를 함께 설계'],['축적 방식','설계 의도와 수정 기록, 자동 QA 결과를 대조']]).replace(/^<dl[^>]*>|<\/dl>$/g,'');
  }
  window.installFootMateDecisionEvidence=function(slides){
    // Three representative decisions share one evidence chain: alternative → choice → limit.
    slides[4].querySelector('.fm-next-cs-decision').innerHTML='<span>핵심 결정 01 · 진입 장벽</span>'+rows([
      ['대안','설문 기반 프로필 확보를 앞세움'],['선택','계정 없이도 후보를 살펴볼 수 있음'],['제약','지역·포지션·레벨 설정 필요 · 기기 간 연속성 제한']
    ])+link('docs/SERVICE-PLANNING-EVIDENCE.md','인증 시점 근거');
    recommendation(slides[5]);recovery(slides[9]);architecture(slides[10]);validation(slides[11]);nextDecisions(slides[12]);improvementEvidence(slides);
    const proof=slides[0].querySelector('.fm-next-cover-proof>div:last-child');proof.querySelector('b').textContent='대표 결정 · 3가지';proof.querySelector('span').innerHTML='가치 확인 후 인증 · 이유로 추천 판단<br>선택을 보존한 실패 복구';
    slides[2].querySelector('.fm-p1-jtbd-caveat').innerHTML='교육 단계 · iOS 4명 · Android 2명 · 일부 복수 과업 · 이후 개인 고도화와 구분 '+link('docs/USER-TEST-EVIDENCE.md','과업 기록');
    document.documentElement.dataset.fmDecisionEvidence='true';
  };
})();

/* ===== src/case-study/editorial-finish.js ===== */
/* Editorial grouping preserves the existing copy and interactive evidence. */
(function(){

  // Existing product baselines and verified implementation records, summarized in place.
  function installEvidenceDetails(slides){
    const summary=(index,items)=>slides[index].querySelectorAll('.fm-next-review-summary>div').forEach((node,i)=>{
      node.querySelector('span').textContent=items[i][0];node.querySelector('b').textContent=items[i][1];
    });
    summary(1,[['설계 대상','탐색부터 경기 당일까지'],['관찰 범위','교육 단계 탐색·가입 과업'],['후속 측정','전환 · 실패 · 재이용']]);
    summary(3,[['선정 기준','중단 영향 · 판단 도움'],['개발 순서','핵심 요청부터 안정화'],['실행 원칙','최종 확정은 사용자 제어']]);
    summary(6,[['주 행동','참가하기'],['비교 범위','경기 2개로 제한'],['확인 시점','요청 전 운영 정책 검토']]);
    summary(12,[['개선 자료','수정·재검증 기록'],['판정 범위','개발·QA에서 동작 확인'],['이후 기준','입력 · 완료 · 예외의 일관성']]);
    const core=slides[1].querySelector('.fm-p0-problem-core');
    core.querySelector('small').textContent='설계 초점';
    core.querySelector('p').textContent='후보를 고른 뒤에도 판단에 필요한 항목과 진행 안내를 함께 확인';
    const detail=slides[6].querySelector('.fm-next-cs-detail-order');
    const day=slides[8].querySelector('.fm-page-product-notes');
    [[6,detail,'참가 결정 체크','생활권 · 남은 자리 · 경기 강도를 항목으로 제시',460,214],
     [8,day,'경기 전후 안내','참가 확정 · 체크인 시점 · 경기 후 행동을 구분',400,252]].forEach(([index,host,title,copy,offset,height])=>{
      const source=slides[index].querySelector('.fm-evidence-figure[data-evidence-scale="primary"] img');
      const figure=document.createElement('figure');figure.className='fm-focus-detail';figure.dataset.focusPage=String(index+1);
      figure.dataset.evidenceSource=source.closest('figure').dataset.evidenceSource;
      const caption=document.createElement('figcaption');const label=document.createElement('small');label.textContent='기존 제품 화면 · 핵심 영역 확대';
      const heading=document.createElement('b');heading.textContent=title;const note=document.createElement('span');note.textContent=copy;caption.append(label,heading,note);
      const window=document.createElement('div');window.className='fm-focus-crop';window.style.setProperty('--fm-focus-offset',offset+'px');window.style.setProperty('--fm-focus-height',height+'px');
      const image=document.createElement('img');image.src=source.getAttribute('src');image.alt=title+' 영역 확대';image.loading='lazy';image.decoding='async';window.appendChild(image);
      figure.append(caption,window);
      if(index===8)source.closest('figure').after(figure);else host.prepend(figure);
    });
    detail.querySelectorAll(':scope>span').forEach(step=>{
      const description=step.querySelector('small');const title=document.createElement('b');
      title.textContent=[...step.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim();
      step.replaceChildren(title,description);
    });
    const process=document.createElement('ol');process.className='fm-processing-path';process.setAttribute('aria-label','입력부터 사용자 확인까지의 처리 순서');
    [['입력','사용자가 의도 전달'],['해석','AI가 조건으로 변환'],['추천','규칙으로 후보·순위 결정'],['확인','사용자가 참가 요청']].forEach(([title,copy],i)=>{
      const step=document.createElement('li');step.innerHTML='<small>'+String(i+1).padStart(2,'0')+'</small><b>'+title+'</b><span>'+copy+'</span>';
      process.appendChild(step);
    });
    slides[10].querySelector('.fm-owner-grid').before(process);
    // Owner numbers identify groups, not execution order; the path above owns the sequence.
    slides[10].querySelectorAll('.fm-owner-column>header>span').forEach(node=>{node.textContent='';node.setAttribute('aria-hidden','true');});
    const failure=slides[9].querySelectorAll('.fm-evidence-recovery-strip figcaption')[1];
    const compare=document.createElement('div');compare.className='fm-inline-change';compare.setAttribute('aria-label','참가 실패 처리의 실제 수정 전후 기록 요약');
    compare.innerHTML='<div><small>수정 전</small><b>정보 유실 때 처리 중에 멈춤</b></div><div class="is-after"><small>수정 후</small><b>오류 안내 · 버튼 복원 · 재시도</b></div>';
    failure.querySelector('.fm-improvement-open').before(compare);
    const learning=slides[12].querySelector('[data-zone="closed-beta"]');
    const items=learning.querySelectorAll('li');
    items[0].classList.add('fm-change-before');items[1].classList.add('fm-change-after');
    items[0].querySelector('span').textContent='수정 전';items[0].querySelector('b').textContent='평가 저장 후에도 피드백 안내 유지';
    items[1].querySelector('span').textContent='수정 후';items[1].querySelector('b').textContent='완료 기록을 반영해 다음 경기 찾기 표시';
    const proof=document.createElement('a');proof.className='fm-proof-link fm-learning-proof';proof.href='https://github.com/dohyunkimmm/footmate/pull/442';proof.target='_blank';proof.rel='noopener';proof.textContent='실제 수정 기록 ↗';learning.appendChild(proof);
    slides[12].querySelector('.fm-p1-release-next dd').textContent='시작·완료·실패를 함께 다뤄 화면 사이의 연결을 점검';
    document.documentElement.dataset.fmEvidenceDetails='true';
  }


  function installNavigationPreview(slides){
    const names=[...document.querySelectorAll('.toc-item .toc-t')].map(node=>node.textContent);
    const controls=[document.querySelector('.btn-prev'),document.querySelector('.btn-next')];
    controls.forEach((button,i)=>{
      const arrow=document.createElement('span');arrow.className='fm-control-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent=i?'→':'←';
      const copy=document.createElement('span');copy.className='fm-control-destination';copy.id='fm-control-destination-'+i;
      const label=document.createElement('small');const title=document.createElement('b');copy.append(label,title);
      button.replaceChildren(arrow,copy);button.setAttribute('aria-describedby',copy.id);
    });
    const update=()=>{
      const current=slides.findIndex(slide=>slide.classList.contains('on'));
      controls.forEach((button,i)=>{
        const target=current+(i?1:-1);const destination=button.querySelector('.fm-control-destination');
        destination.querySelector('small').textContent=target<0?'첫 섹션':target>=slides.length?'마지막 섹션':i?'다음 섹션':'이전 섹션';
        destination.querySelector('b').textContent=names[Math.max(0,Math.min(names.length-1,target))];
      });
    };
    new MutationObserver(records=>{if(records.some(record=>record.target.classList.contains('slide')))update();})
      .observe(document.querySelector('.track'),{subtree:true,attributes:true,attributeFilter:['class']});
    update();
    document.documentElement.dataset.fmColorInteractionPolish='true';
  }

  window.installFootMateEditorialFinish=function(slides){
    const recovery=slides[9];
    const map=recovery.querySelector('.fm-p0-recovery-map');
    const strip=recovery.querySelector('.fm-evidence-recovery-strip');
    const layout=document.createElement('div');layout.className='fm-editorial-recovery-layout';
    map.before(layout);layout.append(map,strip);
    const heading=document.createElement('h3');heading.className='fm-editorial-evidence-heading';heading.textContent='핵심 결정 03 · 중단 이후';strip.prepend(heading);
    const note=slides[5].querySelector('.fm-next-cs-note');
    const label=document.createElement('span');label.className='fm-editorial-decision-label';label.textContent='핵심 결정 02 · 근거의 표현';note.prepend(label);note.classList.add('fm-editorial-decision');
    // Keep evidence actions together so one extra button cannot enlarge all three cards.
    slides[11].querySelectorAll('.fm-p1-evidence-grid>.fm-next-cs-card').forEach(card=>{
      const actions=document.createElement('div');actions.className='fm-editorial-evidence-actions';
      card.querySelectorAll('.fm-proof-link,.fm-improvement-open').forEach(node=>actions.appendChild(node));card.appendChild(actions);
    });
    installEvidenceDetails(slides);
    const empty=slides[9].querySelector('.fm-evidence-recovery-strip .fm-evidence-figure:first-of-type');
    empty.dataset.evidenceCrop='empty-actions';
    empty.querySelector('figcaption span').textContent='빈 상태 UI · 핵심 영역 확대';
    empty.querySelector('img').alt='탐색 결과 없음 메시지와 조건 완화·필터 해제 버튼 확대';
    // Freeze explanatory code/document evidence to the reviewed source snapshot.
    const pinEvidence=link=>{
      const prefix='https://github.com/dohyunkimmm/footmate/blob/main/';
      if(link.href.startsWith(prefix))link.href=link.href.replace(prefix,'https://github.com/dohyunkimmm/footmate/blob/b97898d86a8e18450f9bac1ced51209f64545bee/');
    };
    document.querySelectorAll('.slide a[href],.fm-improvement-dialog a[href]').forEach(pinEvidence);
    installNavigationPreview(slides);
    document.documentElement.dataset.fmEditorialFinish='true';
  };
})();

/* ===== src/case-study/page-composition.js ===== */
/* FootMate 5.4 · page composition. Existing product facts and evidence stay intact. */
(function(){
  const pages=[
  {
    "nav": "Overview",
    "navDesc": "Experience & Role",
    "title": [
      "내 수준에 맞는 경기부터,",
      "참가 이후의 경험까지."
    ],
    "desc": "탐색의 편의와 운영의 안전성을 하나의 경험으로 설계했습니다.",
    "keywords": [
      "풋살 서비스",
      "전체 동선",
      "단독 구축"
    ],
    "layout": "cover"
  },
  {
    "nav": "Problem & Goal",
    "navDesc": "Friction & Design Goal",
    "title": "경기 선택의 불확실성을 줄이는 데 집중했습니다.",
    "desc": "필요한 정보와 계정 생성 시점, 일정 안내를 개선 대상으로 정했습니다.",
    "keywords": [
      "흩어진 정보",
      "접근 장벽",
      "운영 연결"
    ],
    "layout": "comparison"
  },
  {
    "nav": "Persona & JTBD",
    "navDesc": "Assumptions & Tasks",
    "title": "사용자 가설을 구체적인 행동 과업으로 바꿨습니다.",
    "desc": "과업 관찰과 가정의 범위를 구분하고, 화면에 필요한 요구사항을 정리했습니다.",
    "keywords": [
      "이용 맥락",
      "선택 요소",
      "가정의 한계"
    ],
    "layout": "persona"
  },
  {
    "nav": "Scope & Priorities",
    "navDesc": "Build Now & Validate Next",
    "title": "참가와 복구를 먼저, 확장 검증은 다음으로 뒀습니다.",
    "desc": "결정에 주는 도움과 오류의 영향을 기준으로 이번 범위를 정했습니다.",
    "keywords": [
      "핵심 동선",
      "운영 안전성",
      "개발 범위"
    ],
    "layout": "journey"
  },
  {
    "nav": "Guest Exploration",
    "navDesc": "Explore Before Sign-in",
    "title": "가치를 확인한 뒤에 로그인하도록 설계했습니다.",
    "desc": "계정을 먼저 요구하는 대안과 비교해, 처음 방문한 사람의 접근 순서를 정했습니다.",
    "keywords": [
      "공개 범위",
      "초기 설정",
      "진입 장벽"
    ],
    "layout": "comparison"
  },
  {
    "nav": "Recommendations",
    "navDesc": "Preferences & Reasons",
    "title": "조건을 바꾸면 추천 순위와 이유도 달라집니다.",
    "desc": "점수만 보여주는 대신, 선택에 도움이 되는 근거와 조정 방법을 제시했습니다.",
    "keywords": [
      "입력 반영",
      "설명 가능성",
      "직접 조정"
    ],
    "layout": "product"
  },
  {
    "nav": "Match Details",
    "navDesc": "Information for Joining",
    "title": "참가 판단에 필요한 순서로 상세를 구성했습니다.",
    "desc": "운영 정책을 미리 보여주고, 저장·비교 도구로 선택을 보조하도록 했습니다.",
    "keywords": [
      "일정·이동",
      "정원·정책",
      "보조 도구"
    ],
    "layout": "product"
  },
  {
    "nav": "Sign-in & Join",
    "navDesc": "Preserve Choice & Confirm",
    "title": "인증 과정에서도 선택한 경기를 유지합니다.",
    "desc": "재입력을 막기 위해 복귀 경로를 기록하고, 완료·실패·취소를 구분했습니다.",
    "keywords": [
      "복귀 경로",
      "처리 상태",
      "구현 경계"
    ],
    "layout": "flow"
  },
  {
    "nav": "Matchday & Return",
    "navDesc": "Prepare, Check In & Return",
    "title": "참가 이후의 다음 행동을 MY에서 안내합니다.",
    "desc": "예정·당일·종료 후로 나눠, 필요한 정보와 화면 진입점을 정했습니다.",
    "keywords": [
      "일정 안내",
      "출석 처리",
      "완료 이후"
    ],
    "layout": "product"
  },
  {
    "nav": "Recovery",
    "navDesc": "Preserve State & Retry",
    "title": "실패해도 선택을 보존하고 다시 이어갑니다.",
    "desc": "검색 결과 없음부터 당일 오류까지, 중단 지점별 대응을 정했습니다.",
    "keywords": [
      "오류 분류",
      "유지할 정보",
      "후속 조치"
    ],
    "layout": "recovery"
  },
  {
    "nav": "AI & Domain Rules",
    "navDesc": "Interpret, Rank & Confirm",
    "title": "해석·추천·확정의 책임을 분리했습니다.",
    "desc": "생성 범위를 제한하고, 연결 오류에도 탐색을 이어갈 대안을 마련했습니다.",
    "keywords": [
      "처리 경계",
      "사실 데이터",
      "최종 승인"
    ],
    "layout": "architecture"
  },
  {
    "nav": "Metrics & Validation",
    "navDesc": "Measurement & Verification",
    "title": "동작 검증과 사용자 성과를 구분했습니다.",
    "desc": "측정식·제외 조건을 먼저 정하고, 구현 근거는 확인 방법별로 제시했습니다.",
    "keywords": [
      "관찰 단위",
      "근거 구분",
      "성과 미측정"
    ],
    "layout": "validation"
  },
  {
    "nav": "Learning & Next Decisions",
    "navDesc": "Refine & Verify",
    "title": "개인 고도화에서 얻은 학습과 다음 기준을 정리했습니다.",
    "desc": "입력의 일관성, 완료 이후의 연결, 오류 대응을 앞으로의 점검 항목으로 삼았습니다.",
    "keywords": [
      "재현 가능성",
      "완료 상태",
      "대응 경로"
    ],
    "layout": "release"
  }
];


  // Final copy pass: reuse existing cards and notes without expanding the slide layout.
  function refineCaseStudyCopy(slides){
    const text=(page,selector,value)=>{const node=slides[page].querySelector(selector);if(node)node.textContent=value;};
    const html=(page,selector,value)=>{const node=slides[page].querySelector(selector);if(node)node.innerHTML=value;};
    const rows=items=>'<dl class="fm-cs-reasons">'+items.map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+value+'</dd></div>').join('')+'</dl>';
    const summary=(page,items)=>slides[page].querySelectorAll('.fm-next-review-summary>div').forEach((node,index)=>{const item=items[index];if(!item)return;node.querySelector('span').textContent=item[0];node.querySelector('b').textContent=item[1];});
    html(0,'.fm-next-cover-proof',
      '<div><b>역할 · 단독 설계·구축</b><span>문제 정의 · UX·정책 설계<br>프로토타입 · QA · 배포 검증</span></div>'+
      '<div><b>기간 · 2026.06.08–현재</b><span>AI 실무과정에서 시작<br>수료 후 개인 프로젝트로 고도화</span></div>'+
      '<div><b>핵심 결정 · 우선순위</b><span>참가 직전 인증 · AI 책임 분리<br>상태 보존 · 실패 복구 기준</span></div>');
    text(0,'.fm-next-cover-note strong','제품 홈 화면 미리보기');
    text(0,'.fm-next-cover-note span','자연어 탐색과 추천 확인 구조를 정적으로 재현했습니다.');
    summary(1,[['가설','결정에 필요한 정보 부족'],['접근','흩어진 기능 연결'],['관찰 지표','전환 · 실패 · 재이용']]);
    summary(4,[['공개','후보 목록 · 상세'],['계정 필요','요청 제출 단계'],['제한','기기 간 연속성']]);
    summary(5,[['입력','프로필 · 선호 · 최근 이력'],['판단','규칙 기반 로직'],['제어','AI 해석 확인·해제']]);
    summary(6,[['주 행동','참가하기'],['보조','최대 2경기 비교'],['정책','취소 조건 사전 확인']]);
    summary(9,[['원칙','입력 맥락 유지'],['적용','탐색부터 당일까지'],['확인','정보 유실 후 복원']]);
    text(1,'.fm-p0-problem-core p','추천을 확인해도 참가에 필요한 정보가 부족하면 결정을 망설일 수 있음');
    html(1,'.fm-next-cs-quote','<span>대안 검토 · 설계 가설</span>'+rows([
      ['대안','목록·필터의 조건 비교 · 지도의 위치 확인 · 커뮤니티의 경험 정보'],
      ['선택 이유','추천 근거와 참가·당일 안내를 한 흐름으로 연결'],
      ['검증 범위','탐색·가입 과업 검증 · 문제 가설·경쟁사 우위는 미입증']
    ]));
    summary(2,[['대상','설계용 Persona'],['요구사항','적합성 · 정보 접근'],['수행 기록','교육생 6명 · 가입 과업 8회']]);
    text(2,'.fm-p1-persona-context p','주 1~2회 운동 · 평일 저녁 · 30분 안쪽 이동');
    text(2,'.fm-p1-persona-lenses [data-kind="context"] p','업무가 끝난 뒤 짧은 시간 안에 선택');
    text(2,'.fm-p1-jtbd-head small','JTBD · 설계 적용');
    text(2,'.fm-p1-jtbd-journey li:first-child p','일정과 생활권 설정');
    text(2,'.fm-p1-jtbd-caveat','iOS 4명 · Android 2명 · 일부 복수 과업 수행 · Persona 대표성은 미검증');
    summary(3,[['우선 구현','참가 · 복구'],['효과 검증','전환 · 재이용'],['제외','실제 결제 · AI 자동 확정']]);
    const priority=slides[3].querySelectorAll('.fm-p0-priority-label');
    ['01 · 먼저','02 · 이후','03 · 제외'].forEach((value,index)=>{if(priority[index])priority[index].textContent=value;});
    html(3,'.fm-next-story-aside .fm-next-cs-note',rows([
      ['선정 근거','정원·취소·출석 오류가 결과에 직접 영향'],
      ['개발 순서','결제·정산보다 중단 상황의 대응을 먼저 점검'],
      ['후속 관찰','빈 자리 충원과 반복 이용의 변화']
    ]));
    html(4,'.fm-next-cs-decision',rows([
      ['인증 시점','추천·상세 확인 후 참가 요청 직전'],
      ['설정 이유','지역·포지션·레벨로 첫 추천 기준 확보'],
      ['의도한 효과','계정 생성 전 추천 가치 확인 · 초기 설정 부담은 후속 관찰'],
      ['설계상 제약','계정 기반 개인화 · 기기 간 연속성 제한']
    ]));
    const annotations=slides[5].querySelectorAll('.fm-p0-annotations li');
    [
      ['저장 프로필','지역·레벨·포지션을 다음 탐색의 시작 조건으로 사용'],
      ['선호 지역 · 시간 · 경기 형식','선호 조건 일치를 추천 점수에 추가 반영'],
      ['최근 확인 이력','확인한 경기를 추천의 보조 신호로 반영'],
      ['현재 조건 · 추천 이유','AI 조건 확인·수정·해제 · 추천 로직이 후보·순위 결정']
    ].forEach(([title,copy],index)=>{const node=annotations[index];if(node){node.querySelector('b').textContent=title;node.querySelector('p').textContent=copy;}});
    html(5,'.fm-next-cs-note',rows([
      ['저장 범위','현재 브라우저 · 회원 DB·기기 간 동기화 미연동'],
      ['판단 기준','내부 점수는 정렬에 사용 · 조건 일치 이유로 선택 지원'],
      ['사용자 제어','현재 조건과 AI 해석 결과 확인 후 수정·재탐색']
    ]));
    text(6,'.is-detail figcaption b','경기 상세 · 기존 제품 화면');
    const detailSteps=slides[6].querySelectorAll('.fm-next-cs-detail-order>span');
    ['참가 가능한 일정과 이동 범위','조건에 맞는 이유','원하는 포지션의 참가 가능 여부','경기 전 준비와 운영 안내','참가 전 취소 조건 확인'].forEach((copy,index)=>{if(detailSteps[index]){const small=document.createElement('small');small.textContent=copy;detailSteps[index].appendChild(small);}});
    const comparison=document.createElement('p');comparison.className='fm-cs-detail-rationale';comparison.textContent='최대 2경기의 거리·레벨·포지션 자리·참가비 비교 · 대상 수를 제한해 선택을 보조';
    slides[6].querySelector('.fm-next-cs-detail-order')?.appendChild(comparison);
    html(6,'.fm-next-story-aside .fm-next-cs-note',rows([
      ['배치 근거','일정·이동 → 적합성 → 운영 정책 순으로 확인'],
      ['도구 역할','목록에서 가려진 차이를 한 화면에서 확인'],
      ['행동 구분','참가하기를 주 행동으로 두고 나머지는 선택을 보조']
    ]));
    text(7,'.fm-p1-auth-frame:nth-of-type(2) p','한 번 고른 대상을 재입력 없이 전달');
    html(7,'.fm-next-cs-scope',rows([
      ['Real App','Google·Kakao 인증 연결 · 무료 참가 결과는 브라우저 저장'],
      ['Closed Beta','Supabase 계정·경기·참가 흐름 실제 연동'],
      ['검증 범위','운영 환경 로그인 확인 · 복귀 경로 보존 설계 · 실제 결제 미연동']
    ]));
    summary(8,[['진행','예정 → 당일 → 체크인 → 종료 후'],['안내 위치','내 경기 · MY'],['홈','다음 행동 · MY 진입']]);
    const states=slides[8].querySelectorAll('.fm-next-cs-day-states>div');
    if(states[2])states[2].querySelector('p').textContent='시작 20분 전부터 종료 전까지 체크인';
    if(states[3])states[3].querySelector('p').textContent='체감 난이도·재참가 의향 → 다음 추천 보조 신호';
    html(8,'.fm-next-cs-note',rows([
      ['체크인 범위','Real App은 체험 기록 · Beta는 실제 출석 상태'],
      ['빈 자리 충원','Beta에서 취소 시 접수 순서대로 포지션별 대기자 승격'],
      ['변경과 복구','변경 이력 기록 · 알림 전달 실패와 참가 상태 분리']
    ]));
    const recovery=slides[9].querySelectorAll('.fm-p0-recovery-row');
    if(recovery[2])recovery[2].querySelector('.fm-p0-recovery-next b').textContent='참가 결과 확인 후 재시도 또는 경기 다시 선택';
    if(recovery[3])recovery[3].querySelector('.fm-p0-recovery-next b').textContent='체크인 재시도 또는 운영 문의';
    // Replace the legacy payment screenshot with a clearly identified schematic.
    const failure=slides[9].querySelectorAll('.fm-evidence-recovery-strip .fm-evidence-figure')[1];
    if(failure){
      const media=failure.querySelector('.fm-evidence-media');
      media.innerHTML='<span class="fm-evidence-badge">복구 설계</span><div class="fm-cs-recovery-example"><b>참가를 확정하지 못했어요.</b><p>참가 결과 확인 후 다시 시도하거나 경기를 다시 선택합니다.</p><span>다시 시도 · 경기 다시 선택</span></div>';
      failure.dataset.evidenceSource='release-join-recovery-schematic';
      failure.querySelector('figcaption b').textContent='참가 실패 · 복구 설계';
      failure.querySelector('figcaption span').textContent='화면 캡처 아님 · 경기 정보 복원 후 재시도 성공을 자동 QA로 확인';
    }
    html(9,'.fm-next-cs-decision','<span>자동 QA 사례 · 무료 참가 복구</span><b>오류 안내·버튼 활성화·정상 완료를 자동 E2E에서 확인</b>');
    const arch=slides[10].querySelectorAll('.fm-p0-arch-node');
    const archCopy=[['요청','자연어 입력'],['해석','검색 조건 추출'],['전달','구조화된 입력'],['판단','규칙에 따른 후보·순위'],['제시','결과 표시'],['확정','사용자의 참가 확인']];
    archCopy.forEach(([label,title],index)=>{if(arch[index]){arch[index].querySelector('small').textContent=label;arch[index].querySelector('b').textContent=title;}});
    if(arch[5])arch[5].querySelector('span').textContent='버튼 조작으로 요청 시작';
    const guards=slides[10].querySelectorAll('.fm-p0-arch-guardrails>div');
    [['AI 실패','대체 모델 후 규칙 기반 검색으로 전환'],['Beta 상태','변경 알림 수신 후 서버 상태 재조회'],['AI 처리 제한','경기 사실·가격·정원·순위 생성 금지']].forEach(([label,copy],index)=>{if(guards[index]){guards[index].querySelector('span').textContent=label;guards[index].querySelector('b').textContent=copy;}});
    html(10,'.fm-next-cs-note',rows([
      ['선택 이유','자유로운 생성보다 경기 사실과 참가 상태의 일관성 우선'],
      ['감수한 제약','AI 자동 실행 제한 · Beta 상태 재조회에 추가 요청 필요'],
      ['구현 범위','AI 해석 실제 연결 · Beta 인증·알림·미디어 연결']
    ]));
    const qa=slides[11].querySelectorAll('.fm-next-cs-card');
    ['회귀 테스트 · 브라우저 E2E · 접근성 · 상태 복구 · 화면 비교 · 배포 후 동작 확인','운영 환경 로그인 · 이메일 전달 · 브라우저·OS 알림 표시 확인 · 전환 성과와 구분','중복·용어·설명과 구현의 일치 검토 · 자동 QA와 사람 검수의 통과 판정은 대체하지 않음'].forEach((copy,index)=>{if(qa[index])qa[index].querySelector('p').textContent=copy;});
    const note=slides[11].querySelector('.fm-next-cs-note');
    if(note)note.innerHTML='과업 검증 · 교육생 6명 / 가입 과업 8회 · 개별 이슈 기록 미확정 · 전환 성과와 구분 <a href="https://github.com/dohyunkimmm/footmate/blob/b97898d86a8e18450f9bac1ced51209f64545bee/docs/USER-TEST-EVIDENCE.md" target="_blank" rel="noopener">검증 근거 ↗</a>';
    const ratios=slides[11].querySelectorAll('.fm-p1-funnel-ratios .fm-p1-ratio');
    if(ratios[1]){const parts=ratios[1].querySelectorAll('span');if(parts[0])parts[0].innerHTML='<small>분자</small>참가 완료 사용자·경기 쌍';if(parts[1])parts[1].innerHTML='<small>분모</small>상세 조회 사용자·경기 쌍';}
    const app=slides[12].querySelector('[data-zone="real-app"]');
    if(app){
      app.querySelector('header b').textContent='제품 체험 화면';
      app.querySelector('ul').innerHTML='<li data-status="connected"><span>실제 연결</span><b>AI 해석 · Google/Kakao 인증</b></li><li data-status="implemented"><span>구현</span><b>규칙 기반 추천 · 무료 참가 확인</b></li><li data-status="sample"><span>샘플</span><b>경기 데이터 · 잔여 자리</b></li><li data-status="simulation"><span>체험 기록</span><b>참가·체크인·피드백 · 브라우저 저장</b></li>';
    }
    slides[12].querySelectorAll('[data-zone="closed-beta"] li span').forEach(node=>node.textContent='실제 연결');
    summary(12,[['Real App','AI·인증 연결 · 브라우저 기록'],['Closed Beta','참가·운영 · 실제 연결'],['다음 단계','이용 기준값 · 사용자 가치']]);
    html(12,'.fm-p1-release-next dl','<div><dt>배운 점과 다음 검증</dt><dd>실패·중복 요청·상태 갱신까지 함께 정의<br>다음 검증 · 추천 이유의 판단 도움 → Beta 과업 관찰·이탈 구간·기준값 확보</dd></div>');
    // Reader-facing wording only: keep navigation and product identifiers intact.
    const walker=document.createTreeWalker(document.querySelector('.track'),NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.parentElement.closest('script,style,.fm-page-keywords,.fm-next-story-kicker,.fm-next-cover-kicker'))continue;
      node.nodeValue=node.nodeValue.replace(/결정론적 추천 엔진/g,'규칙 기반 추천 엔진').replace(/audit trail/g,'변경 이력').replace(/운영 도움/g,'운영 문의').replace(/참여 이력/g,'참가 이력').replace(/실제 PG/g,'실제 결제').replace(/실연동/g,'실제 연결');
    }
    text(11,'.fm-next-kpi-disclosure-label','성과 지표 · 측정 기준');
    document.documentElement.dataset.fmCaseStudyCopyReview='p0-p1-p2';
  }

  function installEditorialInteractions(slides){
    const desktop=window.matchMedia('(min-width:901px)');
    const disclosures=[];
    // Keep the evidence visible; only supplemental rationale is collapsible on mobile.
    const supplements=[[1,'.fm-next-story-aside','대안과 검증 범위'],[3,'.fm-next-story-aside','우선순위 판단 근거'],[4,'.fm-next-story-aside','인증 시점과 제약'],[5,'.fm-page-product-notes .fm-next-cs-note','추천 설계 원칙'],[7,'.fm-next-story-aside','구현·검증 범위'],[8,'.fm-page-product-notes .fm-next-cs-note','운영 정책과 복구'],[10,'.fm-next-story-aside','연결 범위와 설계 기준']];
    supplements.forEach(([index,selector,text])=>{
      const node=slides[index].querySelector(selector);if(!node)return;
      const details=document.createElement('details');details.className='fm-editorial-supplement';details.open=desktop.matches;
      const summary=document.createElement('summary');summary.textContent=text;
      node.before(details);details.append(summary,node);disclosures.push(details);
    });
    desktop.addEventListener('change',()=>disclosures.forEach(node=>node.open=desktop.matches));
    slides.forEach(slide=>slide.querySelectorAll('details').forEach(node=>node.addEventListener('toggle',()=>window.dispatchEvent(new Event('resize')))));

    const dialog=document.createElement('dialog');dialog.className='fm-screen-dialog';dialog.setAttribute('aria-labelledby','fm-screen-dialog-title');
    dialog.innerHTML='<header><h2 id="fm-screen-dialog-title"></h2><button type="button" class="fm-screen-close" aria-label="화면 확대 닫기">닫기 ×</button></header><div class="fm-screen-tabs" role="group" aria-label="화면 보기 방식"><button type="button" data-screen-mode="full" aria-pressed="true">전체 화면</button><button type="button" data-screen-mode="focus" aria-pressed="false">핵심 영역</button></div><div class="fm-screen-viewport"><img alt=""></div><p class="fm-screen-source">기존 제품 화면 기준 · 실제 운영 화면과 차이가 있을 수 있습니다.</p>';
    document.body.append(dialog);
    const close=()=>dialog.close();dialog.querySelector('.fm-screen-close').addEventListener('click',close);
    dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();}});
    dialog.addEventListener('keydown',event=>{event.stopPropagation();});
    dialog.querySelectorAll('[data-screen-mode]').forEach(button=>button.addEventListener('click',()=>{
      dialog.classList.toggle('is-focus',button.dataset.screenMode==='focus');
      dialog.querySelectorAll('[data-screen-mode]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));
    }));
    [5,6,8].forEach(index=>{
      const figure=slides[index].querySelector('.fm-evidence-figure[data-evidence-scale="primary"]');if(!figure)return;
      const source=figure.querySelector('img');const caption=figure.querySelector('figcaption');
      if(!source)return;
      const button=document.createElement('button');button.type='button';button.className='fm-screen-expand';button.textContent='화면 확대 ↗';button.setAttribute('aria-haspopup','dialog');
      button.addEventListener('click',()=>{
        dialog.querySelector('h2').textContent=caption.querySelector('b')?.textContent||'제품 화면';
        const image=dialog.querySelector('img');image.src=source.currentSrc||source.src;image.alt=source.alt;
        dialog.classList.remove('is-focus');dialog.querySelectorAll('[data-screen-mode]').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.screenMode==='full')));
        dialog.showModal();
      });caption.append(button);
    });
  }

  function apply(){
    const html=document.documentElement;
    if(html.dataset.fmPageComposition==='true')return true;
    if(html.dataset.fmCaseStudyAdvancedPolish!=='true'||
       html.dataset.fmCaseStudyProductEvidence!=='true'||
       html.dataset.fmP1RealPreview!=='true'||
       html.dataset.fmCaseStudyCompletionPolish!=='true'||
       html.dataset.footmateCaseStudySectionLabelLanguage!=='en')return false;
    const slides=[...document.querySelectorAll('.track>.slide')];
    if(slides.length!==pages.length)return false;
    slides.forEach((slide,index)=>{
      const page=pages[index];
      const toc=document.querySelectorAll('.toc-item')[index];
      if(toc){toc.querySelector('.toc-t').textContent=page.nav;toc.querySelector('.toc-s').textContent=page.navDesc;toc.setAttribute('aria-label',String(index+1).padStart(2,'0')+' · '+page.nav+' · '+page.navDesc);}
      const label=slide.querySelector(index===0?'.fm-next-cover-kicker':'.fm-next-story-kicker');
      if(label)label.textContent=index===0?page.nav:String(index+1).padStart(2,'0')+' · '+page.nav;
      slide.dataset.pageLayout=page.layout;
      slide.dataset.pageNumber=String(index+1);
      const title=slide.querySelector(index===0?'h1':'.fm-next-story h2');
      if(title){
        title.replaceChildren();
        (Array.isArray(page.title)?page.title:[page.title]).forEach(text=>{
          const line=document.createElement('span');
          line.className=index===0?'fm-next-cover-title-line':'fm-page-title-line';
          line.textContent=text;
          title.appendChild(line);
        });
      }
      const lead=slide.querySelector(index===0?'.fm-next-cover-lead':'.fm-next-story-lead');
      if(lead)lead.textContent=page.desc;
      const kicker=slide.querySelector(index===0?'.fm-next-cover-kicker':'.fm-next-story-kicker');
      if(kicker){
        const keywords=document.createElement('div');
        keywords.className='fm-page-keywords';
        keywords.setAttribute('aria-label','핵심 키워드');
        page.keywords.forEach(text=>{
          const item=document.createElement('span');item.textContent=text;keywords.appendChild(item);
        });
        (lead||title||kicker).insertAdjacentElement('afterend',keywords);
      }
      slide.querySelectorAll('.fm-next-cs-card').forEach(card=>{
        const title=card.querySelector('h3');const description=card.querySelector('p');
        if(title)title.classList.add('fm-page-card-title');
        if(description)description.classList.add('fm-page-card-description');
      });
    });
    // Card headings explain what is checked; labels identify the method.
    const cardCopy=[
      [3,0,'오류 영향이 큰 동선','인증·정원·취소·체크인 문제부터 확인'],
      [3,1,'운영 기능의 효과','대기열·알림·피드백 구현 · 빈 자리 충원과 재이용은 후속 관찰'],
      [3,2,'결제와 자동 실행','실제 결제·수익화는 유보 · 최종 확정은 사용자가 수행'],
      [11,0,'자동화된 동작 확인',null],
      [11,1,'실제 연결과 표시 확인',null],
      [11,2,'설명과 구현의 일치 검토',null]
    ];
    cardCopy.forEach(([page,index,title,desc])=>{const card=slides[page].querySelectorAll('.fm-next-cs-card')[index];if(!card)return;card.querySelector('h3').textContent=title;if(desc)card.querySelector('p').textContent=desc;});
    // Keep product interpretation alongside the screen rather than below another full row.
    [5,8].forEach(index=>{
      const slide=slides[index];
      const annotations=slide.querySelector(index===5?'.fm-p0-annotations':'.fm-next-cs-day-states');
      const aside=slide.querySelector('.fm-next-story-aside');
      if(!annotations||!aside)return;
      const notes=document.createElement('div');notes.className='fm-page-product-notes';
      annotations.parentNode.insertBefore(notes,annotations);
      notes.appendChild(annotations);
      [...aside.children].forEach(child=>notes.appendChild(child));
      aside.remove();
    });
    const coverNote=slides[0].querySelector('.fm-next-cover-note');
    if(coverNote)coverNote.innerHTML='<strong>최신 Real App 홈 프리뷰</strong><span>자연어 탐색에서 추천 확인까지, 홈 구조를 정적으로 재현했습니다.</span>';
    // Source images are existing, versioned visual baselines, not newly captured live screens.
    document.querySelectorAll('.fm-evidence-figure:not(.is-recovery) figcaption span').forEach(node=>{
      node.textContent='제품 화면 · 기존 시각 기준';
    });
    document.querySelectorAll('.fm-evidence-figure.is-detail,.fm-evidence-figure.is-operations').forEach(node=>{
      node.dataset.screenFormat='portrait';
    });
    refineCaseStudyCopy(slides);
    window.installFootMateDecisionEvidence(slides);
    installEditorialInteractions(slides);
    window.installFootMateEditorialFinish(slides);
    html.dataset.fmPageComposition='true';
    html.dataset.footmateCaseStudyRelease='5.4.6';
    // Desktop is a fixed slide: fit the complete composition inside the viewport.
    const fitSlides=()=>{
      const desktop=window.matchMedia('(min-width:901px)').matches;
      slides.forEach(slide=>{
        const content=slide.querySelector('.fm-next-story,.fm-next-cover');
        if(!content)return;
        content.style.zoom='';
        content.style.removeProperty('--fm-story-offset');
        content.style.removeProperty('width');
        content.style.removeProperty('margin-inline');
        if(!desktop||!slide.clientHeight)return;
        const style=getComputedStyle(slide);
        content.style.setProperty('width',`${slide.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)}px`,'important');
        content.style.setProperty('margin-inline','auto','important');
        const available=slide.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
        const height=content.getBoundingClientRect().height;
        if(height>available&&available>0){
          let scale=Math.min(1,(available-2)/height);
          content.style.zoom=String(scale);
          for(let attempt=0;attempt<4;attempt++){
            const actual=content.getBoundingClientRect().height;
            if(actual<=available-1)break;
            scale*=((available-2)/actual);
            content.style.zoom=String(scale);
          }
        }
        if(slide.classList.contains('fm-next-story-slide')&&window.matchMedia('(min-width:1181px) and (min-height:760px)').matches){
          const spare=Math.max(0,available-content.getBoundingClientRect().height);
          content.style.setProperty('--fm-story-offset',Math.min(72,spare/2)+'px');
        }
        slide.scrollTop=0;
      });
    };
    let frame;
    const scheduleFit=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(fitSlides);};
    window.addEventListener('resize',scheduleFit);
    new MutationObserver(records=>{
      if(records.some(record=>record.target.classList.contains('slide')))scheduleFit();
    }).observe(document.querySelector('.track'),{subtree:true,attributes:true,attributeFilter:['class']});
    document.querySelectorAll('img').forEach(img=>img.addEventListener('load',scheduleFit));
    if(document.fonts)document.fonts.ready.then(scheduleFit);
    scheduleFit();
    return true;
  }
  if(!apply()){
    let tries=0;
    const timer=setInterval(()=>{if(apply()||++tries>240)clearInterval(timer);},25);
  }
})();

/* ===== bundle finalizer ===== */
(function(){
  function finish(){
    if(document.documentElement.dataset.fmCaseStudyAdvancedPolish!=='true')return false;
    if(!document.querySelector('style[data-fm-detail-density-compat]')){
      const style=document.createElement('style');
      style.dataset.fmDetailDensityCompat='true';
      style.textContent='@media(max-width:900px){html[data-fm-next-case-study="true"][data-fm-case-study-advanced-polish="true"] .fm-next-story-slide[data-v5-content-role="domain-ai-boundary"] .fm-p0-arch-node{padding-top:10px!important;padding-bottom:10px!important}}';
      document.head.appendChild(style);
    }
    document.documentElement.dataset.fmCaseStudyDetailFinish='true';
    document.documentElement.dataset.fmCaseStudyVisualSystem='true';
    return true;
  }
  if(!finish()){
    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(finish()||tries>1200)clearInterval(timer);
    },25);
  }
})();
