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