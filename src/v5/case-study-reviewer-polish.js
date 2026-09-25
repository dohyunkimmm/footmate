/* FootMate Case Study · recruiter/reviewer scan polish.
   Facts stay within the existing Case Study evidence. This patch changes reader hierarchy,
   phrase consistency, and the KPI evidence interaction only. */
(function(){
  let applied=false;

  const copyBySection=[
    null,
    {title:'경기 선택의 불확실성을 줄여 참가와 재탐색으로 연결합니다.',lead:'추천 근거·참가 안전성·운영 복구를 함께 검증 범위로 정의했습니다.',summary:[['문제 가설','참가 결정의 불확실성'],['기준','탐색 → 판단 → 참가 → 복구'],['검증','전환 · 실패 · 재탐색']]},
    {title:'사용자 가정을 요구사항으로 연결하고 과업으로 검증했습니다.',lead:'설계용 Persona는 가정으로 두고, 같은 교육과정을 수강한 교육생 6명의 구체 행동 과업으로 탐색·가입 동선을 점검했습니다.',summary:[['가정','평일 저녁 · 30분 안쪽 이동'],['요구사항','시간 · 거리 · 레벨 · 포지션'],['검증','iOS 4 · Android 2']]},
    {title:'참가와 운영 안전성을 우선하고 수익화 검증은 뒤로 뒀습니다.',lead:'판단 가치·참가 실패 영향·검증 가능성을 우선순위 기준으로 사용했습니다.',summary:[['우선','참가 · 복구'],['확장','운영 · 반복 이용'],['제외','실제 PG · 자동 참가']]},
    {title:'추천과 상세를 먼저 보여주고 참가할 때 로그인을 요청합니다.',lead:'가치 확인 전에 계정을 요구하지 않도록 인증 시점을 참가 직전으로 옮겼습니다.',summary:[['결정','가입 전 추천 · 상세 공개'],['이유','가치 확인 우선'],['Trade-off','로그인 전 개인화 제한']]},
    {title:'반복 입력은 줄이고 추천 이유는 먼저 확인하게 했습니다.',lead:'개인화 정보는 입력 부담을 줄이는 보조 신호로만 사용하고 후보·순위·이유는 추천 엔진이 결정합니다.',summary:[['입력','프로필 · 선호 · 최근 이력'],['소유권','결정론적 추천 엔진'],['사용자 제어','조건 수정 · 재탐색']]},
    {title:'상세의 정보 순서와 행동을 참가 결정에 맞췄습니다.',lead:'시간·장소부터 추천 이유·자리·취소 기준까지 결정 순서대로 배치했습니다.',summary:[['핵심 CTA','참가하기'],['보조','저장 · 최대 2경기 비교'],['정책','취소 · 환불 사전 확인']]},
    {title:'로그인 전 선택을 인증 후에도 이어갑니다.',lead:'선택 경기와 복귀 위치를 보존하고 참가 결과를 완료·실패·취소로 구분했습니다.',summary:[['보존','선택 경기 · 복귀 위치'],['인증','로그인'],['결과','완료 · 실패 · 취소']]},
    {title:'경기 당일 상태와 다음 탐색을 홈의 중심에 둡니다.',lead:'참가 예정부터 체크인·경기 후까지 상태에 맞는 다음 행동을 먼저 보여줍니다.',summary:[['상태','예정 → 당일 → 체크인 → 경기 후'],['운영','정원 · 취소 · 체크인'],['반복','다음 탐색']]},
    {title:'실패해도 선택 맥락을 보존하고 다음 행동을 제시합니다.',lead:'오류마다 보존할 상태와 재시도·대체 행동을 함께 정의했습니다.',summary:[['원칙','원인 · 보존 상태 · 다음 행동'],['복구','재시도 · 조건 수정 · 대기'],['범위','탐색 → 경기 당일']]},
    {title:'AI 해석과 서비스 판단의 책임을 분리했습니다.',lead:'AI는 조건 해석, 추천 엔진은 후보·순위·이유, 사용자는 참가·결제의 최종 확인을 맡습니다.',summary:[['AI','조건 해석'],['서비스','상태 · 추천 소유권'],['HITL','참가 · 결제']]},
    {title:'성공 지표와 제품 동작을 확인하는 QA를 구분합니다.',lead:'Validation Metric으로 정의했으며, Measured Result가 아닙니다.',summary:[['KPI','전환 · 복구 · 재탐색'],['QA','Regression · E2E · axe · Smoke'],['측정','Baseline 확보 후']]},
    {title:'구현·검증 결과와 아직 남은 과제를 구분합니다.',lead:'사용성 검증은 버그·막힘을 확인한 결과이며 실제 이용자 KPI와 수익성은 아직 미검증입니다.',summary:[['사용성 검증','교육생 6명 과업'],['실제 연결','AI · Supabase · Resend · Push'],['미연동','실제 PG · 외부 분석 도구']]}
  ];

  const kpiRows=[
    ['Match Search → Detail CTR','결과에서 상세로 이동한 세션 ÷ 검색 결과가 1개 이상 노출된 세션','같은 탐색 세션 · 세션당 1회 집계'],
    ['Detail → Join Conversion','상세 조회 후 같은 경기에 참가 완료한 사용자·경기 쌍 ÷ 상세 조회 사용자·경기 쌍','조회 후 24시간 · 관찰 완료 표본만 비교 · 종료·마감 별도 분류'],
    ['Zero Result Rate','정상 처리 후 결과 0개인 검색 ÷ 정상 처리된 검색','네트워크·서버 오류 제외 · 동일 요청 중복 제거'],
    ['Join Failure Rate','확정 실패 또는 미해결 참가 흐름 ÷ 참가 확정을 요청한 흐름','24시간 관찰 완료 · 사용자 취소 별도 · timeout 후 상태 재조회'],
    ['Recovery Success Rate','같은 목적을 완료한 복구 흐름 ÷ 복구 가능한 실패 흐름','24시간 이내 · 원래 목적이 불가능한 대안 선택은 별도 기록'],
    ['Check-in Completion Rate','체크인 완료 참가자·경기 쌍 ÷ 취소되지 않은 종료 경기의 확정 참가자·경기 쌍','경기 종료 시점 · 참가 취소 제외 · 노쇼는 비교 기준에 포함'],
    ['Repeat Match Search Rate','경기 후 7일 내 다시 탐색한 사용자 ÷ 7일 관찰이 완료된 참가 사용자','사용자당 첫 완료 경기 기준 · 탈퇴·관찰 누락 별도 기록'],
    ['AI Search Adoption Rate','AI 검색을 1회 이상 요청한 탐색 세션 ÷ AI 검색 진입점이 노출된 탐색 세션','connected-ai와 rules-fallback 분리 · 사용률을 품질로 해석하지 않음']
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
      html[data-fm-next-case-study="true"] .fm-next-review-summary span{display:block;margin-bottom:3px;color:#5f7067;font-size:12px;line-height:1.45;font-weight:800;letter-spacing:.01em}
      html[data-fm-next-case-study="true"] .fm-next-review-summary b{display:block;color:var(--fm-cs-ui-ink,#16251d);font-size:13px;line-height:1.5;font-weight:800;word-break:keep-all;text-wrap:pretty}
      html[data-fm-next-case-study="true"] .fm-next-story-lead{max-width:82ch}
      html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) :is(.fm-next-review-summary span,.fm-next-cs-persona>div>span,.fm-next-cs-jtbd small,.fm-next-cs-auth-flow small,.fm-next-cs-day-states small,.fm-next-cs-modes small,.fm-cs-reasons dt){font-size:12px!important;line-height:1.45!important;font-weight:800}
      html[data-fm-next-case-study="true"] .fm-next-story-slide:not(.fm-next-cover-slide) :is(.fm-next-review-summary b,.fm-next-cs-card p,.fm-next-cs-persona b,.fm-next-cs-jtbd p,.fm-next-cs-before-after p,.fm-next-cs-stack p,.fm-next-cs-auth-flow b,.fm-next-cs-detail-order span,.fm-next-cs-modes h3,.fm-next-cs-modes p,.fm-next-cs-day-states b,.fm-next-cs-day-states p,.fm-next-cs-recovery b,.fm-next-cs-recovery span,.fm-next-cs-outcomes b,.fm-next-cs-outcomes p,.fm-cs-reasons dd){font-size:13px!important;line-height:1.5!important}
      @media(min-width:1180px){html[data-fm-next-case-study="true"] [data-v5-content-role="persona-jtbd"] .fm-next-cs-persona b{white-space:nowrap!important}}
      html[data-fm-next-case-study="true"] .fm-next-kpi-disclosure{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:10px;padding:10px 12px;border:1px solid var(--fm-cs-ui-border-strong,#c7ddce);border-radius:12px;background:#fcfefc}
      html[data-fm-next-case-study="true"] .fm-next-kpi-disclosure-copy{display:grid;gap:2px;min-width:0}
      html[data-fm-next-case-study="true"] .fm-next-kpi-disclosure-copy b{font-size:13px;line-height:1.45}
      html[data-fm-next-case-study="true"] .fm-next-kpi-disclosure-copy span{color:#687a70;font-size:12px;line-height:1.45}
      html[data-fm-next-case-study="true"] .fm-next-kpi-open{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;min-height:36px;padding:0 12px;border:1px solid var(--fm-cs-ui-border-strong,#c7ddce);border-radius:10px;background:#fff;color:var(--fm-cs-ui-ink,#16251d);font:inherit;font-size:12px;font-weight:800;cursor:pointer}
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
      html[data-fm-next-case-study="true"] .fm-next-kpi-table dd{font-size:11px;line-height:1.6}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table dd::before{display:block;margin-bottom:2px;color:#728279;font-size:9px;font-weight:800}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table dd:nth-of-type(1)::before{content:"계산 기준"}
      html[data-fm-next-case-study="true"] .fm-next-kpi-table dd:nth-of-type(2)::before{content:"관찰 · 제외 기준"}
      @media(max-width:900px){html[data-fm-next-case-study="true"] .fm-next-review-summary{grid-template-columns:1fr;gap:6px}html[data-fm-next-case-study="true"] .fm-next-review-summary>div{padding:8px 10px}html[data-fm-next-case-study="true"] .fm-next-kpi-table>div{grid-template-columns:1fr;gap:6px}html[data-fm-next-case-study="true"] .fm-next-kpi-dialog-inner{padding:18px}html[data-fm-next-case-study="true"] .fm-next-kpi-disclosure{display:grid;grid-template-columns:1fr;gap:8px}html[data-fm-next-case-study="true"] .fm-next-kpi-open{width:100%}}
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
    const note=validation?.querySelector('.fm-next-cs-note'),metrics=validation?.querySelector('.fm-next-cs-metrics');if(!note||!metrics)return;
    note.querySelectorAll('a[href*="github.com"],.fm-next-kpi-open').forEach(node=>node.remove());
    validation.querySelector('.fm-next-kpi-disclosure')?.remove();
    metrics.insertAdjacentHTML('afterend','<div class="fm-next-kpi-disclosure" aria-label="KPI 상세 기준"><div class="fm-next-kpi-disclosure-copy"><b>KPI 상세 기준</b><span>계산 · 관찰 · 제외 기준</span></div><button class="fm-next-kpi-open" type="button">8개 지표의 계산·관찰 기준 보기</button></div>');
    validation.querySelector('.fm-next-kpi-dialog')?.remove();validation.insertAdjacentHTML('beforeend',kpiDialogHTML());
    const dialog=validation.querySelector('.fm-next-kpi-dialog'),open=validation.querySelector('.fm-next-kpi-disclosure .fm-next-kpi-open'),close=dialog?.querySelector('.fm-next-kpi-close');
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
