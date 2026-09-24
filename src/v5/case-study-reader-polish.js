/* FootMate Case Study · reader-facing cleanup.
   Scope: public copy clarity, density, emphasis semantics, and self-contained evidence. */
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

  function ensureReaderStyle(){
    if(document.getElementById('fm-case-study-reader-polish'))return;
    const style=document.createElement('style');
    style.id='fm-case-study-reader-polish';
    style.textContent=`
      /* 02–13: reduce decorative whitespace and keep evidence close to its heading. */
      @media(min-width:901px){
        html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide){
          align-items:flex-start!important;
          padding-top:38px!important;
          padding-bottom:38px!important;
        }
        html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) .fm-next-story{
          gap:10px!important;
          padding:0 4px 4px!important;
        }
        html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) .fm-next-story-kicker{margin-bottom:6px!important}
        html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) .fm-next-story h2{margin-bottom:8px!important}
        html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) .fm-next-story-lead{margin-bottom:10px!important}
        html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) .fm-next-story-copy>:is(.fm-next-cs-grid,.fm-next-cs-persona,.fm-next-cs-loop,.fm-next-cs-journey,.fm-next-cs-before-after,.fm-next-cs-reco,.fm-next-cs-detail-order,.fm-next-cs-auth-flow,.fm-next-cs-day-states,.fm-next-cs-recovery,.fm-next-cs-modes,.fm-next-cs-metrics,.fm-next-cs-outcomes){margin-top:10px!important}
        html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) .fm-next-story-aside{gap:8px!important}
        html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) :is(.fm-next-cs-card,.fm-next-cs-persona>div,.fm-next-cs-before-after>div,.fm-next-cs-auth-flow>div,.fm-next-cs-modes>div,.fm-next-cs-day-states>div,.fm-next-cs-recovery>div,.fm-next-cs-outcomes>div,.fm-next-cs-metric,.fm-next-cs-quote,.fm-next-cs-jtbd,.fm-next-cs-decision,.fm-next-cs-scope,.fm-next-cs-sticky,.fm-next-cs-note,.fm-next-cs-final){padding:12px 14px!important}
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

    // 08 · Sign in / Join — remove the orphan state line and fold preservation into the evidence table.
    const auth=slides[7];
    auth.querySelector('.fm-next-cs-state-line')?.remove();
    auth.querySelector('.fm-next-cs-auth-flow>.is-focus')?.classList.remove('is-focus');
    setHTML(auth,'.fm-next-cs-scope',rows([
      ['Real App','인증·결제는 UX 시뮬레이션으로 구현했습니다.'],
      ['Closed Beta','Supabase 인증·참가 경로를 실제 연결했습니다.'],
      ['상태 보존','로그인 전 선택한 경기와 복귀 위치를 유지해 같은 결정을 반복하지 않게 했습니다.'],
      ['검증 범위','Google/Kakao OAuth는 Production 실로그인까지 확인했습니다. 실제 PG는 연결하지 않았습니다.']
    ]));

    // 09 · Operations — the Case Study itself carries the state scenario; remove the legacy review-mode exit.
    const operations=slides[8];
    operations.querySelector('.fm-next-cs-day-states>.is-focus')?.classList.remove('is-focus');
    operations.querySelectorAll('.fm-next-cs-link').forEach(node=>node.remove());

    // 11 · Domain & AI — all three responsibility cards are peers; none is a selected winner.
    const domain=slides[10];
    domain.querySelectorAll('.fm-next-cs-modes>.is-focus').forEach(node=>node.classList.remove('is-focus'));
    setHTML(domain,'.fm-next-cs-note',rows([
      ['실제 연결','Vercel AI Gateway·Supabase·Resend·Web Push·Storage를 실제 연결했습니다.'],
      ['미연동','실제 PG와 외부 분석 도구는 연결하지 않았습니다.'],
      ['정의한 기준','API·데이터·권한·오류·재시도, IA·상태별 화면·CTA, 취소·정원·복구 정책을 문서화했습니다.']
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
      '<div><b>Real App</b><p>'+lines('AI Gateway를 실제 연결했고 추천 엔진이 후보·순위·이유를 결정합니다.','경기 데이터는 샘플을 사용하며 인증·결제·정원·알림은 시뮬레이션입니다.')+'</p></div>'+
      '<div><b>Closed Beta</b><p>'+lines('Supabase 인증·경기·정원·참가/취소·체크인을 실제 연결했습니다.','Google/Kakao OAuth·이메일·Web Push·미디어도 실제 환경에서 검증했습니다.')+'</p></div>'+
      '<div><b>미연동 범위</b><p>'+lines('실제 PG와 외부 분석 도구는 연결하지 않았습니다.','수익성과 실제 이용 지표는 아직 검증하지 않았습니다.')+'</p></div>');

    // Guardrail: the public Case Study should not expose the internal acronym.
    const shell=document.querySelector('.fm-cs-shell');
    if(shell&&/\bPBL\b/.test(shell.innerText)){
      const walker=document.createTreeWalker(shell,NodeFilter.SHOW_TEXT);
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
      nodes.forEach(node=>{node.nodeValue=(node.nodeValue||'').replace(/\bPBL\b\s*/g,'');});
    }

    document.documentElement.dataset.footmateCaseStudyReaderPolish='1';
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<100)requestAnimationFrame(retry)})();
})();
