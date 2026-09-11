(function(){
'use strict';
function ensureEnhancementStyles(){
  if(document.getElementById('fm-case-study-hardening'))return;
  const style=document.createElement('style');
  style.id='fm-case-study-hardening';
  style.textContent=`
    .fm-decision-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;max-width:900px;margin:0 auto 14px}
    .fm-decision-summary span{display:block;padding:8px 9px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:rgba(255,255,255,.035);color:#7890AC;font-size:9px;line-height:1.35;text-align:left}
    .fm-decision-summary b{display:block;margin-bottom:3px;color:#5EEAD4;font:900 8px/1.2 Inter,sans-serif;letter-spacing:.09em;text-transform:uppercase}
    .fm-proof-strip{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
    .fm-proof-strip span{padding:6px 9px;border-radius:999px;border:1px solid rgba(94,234,212,.2);background:rgba(94,234,212,.07);color:#A9F4E8;font-size:9px;font-weight:900}
    @media(max-width:900px){.fm-decision-summary{grid-template-columns:1fr 1fr}.fm-decision-summary span:last-child{grid-column:1/-1}}
    @media(max-width:520px){.fm-decision-summary{grid-template-columns:1fr}.fm-decision-summary span:last-child{grid-column:auto}}
    @media(prefers-reduced-motion:reduce){.fm-decision-summary *,.fm-proof-strip *{animation:none!important;transition:none!important}}
  `;
  document.head.appendChild(style);
}
function syncCaseStudy(){
  ensureEnhancementStyles();
  const ia=document.querySelector('.slide[data-i="8"] h2');
  if(ia)ia.textContent='서비스 구조를 4개 핵심 탭으로 단순화';
  const row=document.querySelector('.slide[data-i="8"] .ia-row');
  if(row){
    row.style.gridTemplateColumns='repeat(4,1fr)';
    row.innerHTML='<span>홈</span><span>탐색</span><span>일정</span><span>프로필</span>';
  }
  const detail=document.querySelector('.slide[data-i="8"] .ia-detail');
  if(detail){
    detail.style.gridTemplateColumns='repeat(4,1fr)';
    detail.innerHTML='<p>홈: 추천 경기 · 홈 필터</p><p>탐색: 조건 설정 · 추천 결과 · 팀 상세</p><p>일정: 참가 확정 · 경기일 · 알림</p><p>프로필: ELO · 성장 기록 · 설정</p>';
  }
  const cover=document.querySelector('.slide[data-i="0"] .cover');
  if(cover&&!document.getElementById('fmDecisionSummary')){
    const summary=document.createElement('div');
    summary.id='fmDecisionSummary';
    summary.className='fm-decision-summary';
    summary.setAttribute('aria-label','프로젝트 의사결정 요약');
    summary.innerHTML='<span><b>Problem</b>실력 편차 · 노쇼 · 관계 단절</span><span><b>Hypothesis</b>ELO·선결제·성장 기록이 신뢰를 높인다</span><span><b>Design</b>39화면 · 상태 기반 핵심 여정</span><span><b>Validation</b>36 회귀 · Chromium · axe · Production Smoke</span><span><b>Result</b>설명 가능한 추천·운영 예외·검증 증거를 연결</span>';
    const hero=cover.querySelector('.hero-grid');
    if(hero)cover.insertBefore(summary,hero);
  }
  const hint=document.querySelector('.showcase-hint');
  if(hint)hint.textContent='앱 우측 하단의 ‘매칭 로직’과 ‘제품 검증’에서 Agent Workflow, 운영 상태 전이, 추천 근거와 이벤트 로그를 확인할 수 있습니다.';
  const qualityNote=document.querySelector('.slide[data-i="11"] .note');
  if(qualityNote)qualityNote.textContent='※ 현재 프로토타입은 입력·상태·퍼널 이벤트에 따라 PASS·CHECK를 판정하며, 서버 최신성이 필요한 Freshness는 SAMPLE로 구분합니다. 운영 연동 후 오류율·최신성·상태 충돌을 실제 지표로 수집합니다.';
  const validation=document.querySelector('.slide[data-i="18"]');
  if(validation){
    const phase=validation.querySelector('.phase-kicker .phase-pill');
    if(phase)phase.textContent='AUTOMATED QA VERIFIED · USER TEST PLANNED';
    const title=validation.querySelector('h2');
    if(title)title.textContent='자동 QA는 증거로 닫고, 사용자 테스트는 실제 행동값으로 분리합니다';
    const badges=validation.querySelectorAll('.planned-badge');
    if(badges[0])badges[0].textContent='USER TEST · 실제 행동값 미수집';
    if(badges[1])badges[1].textContent='EVENT CONTRACT · LIVE';
    const flow=validation.querySelector('.measure-flow');
    if(flow)flow.innerHTML='<div><b>온보딩 완료</b><span>입력</span></div><div><b>추천 노출</b><span>도달</span></div><div><b>상세 조회</b><span>탐색</span></div><div><b>결제 완료</b><span>전환</span></div><div><b>결과 제출</b><span>재추천 연결</span></div>';
    const events=validation.querySelector('.event-list');
    if(events)events.innerHTML='<div class="event-row"><code>quiz_complete</code><span>5개 온보딩 입력 완료</span></div><div class="event-row"><code>recommendation_results_view</code><span>조건 기반 추천 결과 노출</span></div><div class="event-row"><code>match_detail_open</code><span>추천 팀 상세 진입</span></div><div class="event-row"><code>payment_complete</code><span>선택 경기 결제·참가 연결</span></div><div class="event-row"><code>result_submit</code><span>경기 결과 제출과 다음 추천 연결</span></div>';
    const metricPanel=validation.querySelector('.metric-panel');
    if(metricPanel&&!metricPanel.querySelector('.fm-proof-strip')){
      const proof=document.createElement('div');proof.className='fm-proof-strip';proof.innerHTML='<span>Regression 36</span><span>Chromium E2E</span><span>axe serious/critical 0</span><span>Production HTTP + Browser</span>';metricPanel.appendChild(proof);
    }
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncCaseStudy,{once:true});else syncCaseStudy();
})();
