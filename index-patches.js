(function(){
'use strict';
function syncCaseStudy(){
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
  const hint=document.querySelector('.showcase-hint');
  if(hint)hint.textContent=hint.textContent.replace('AI 로직','매칭 로직');
  const qualityNote=document.querySelector('.slide[data-i="11"] .note');
  if(qualityNote)qualityNote.textContent='※ 현재 프로토타입은 입력·상태·퍼널 이벤트에 따라 PASS·CHECK를 판정하며, 서버 최신성이 필요한 Freshness는 SAMPLE로 구분합니다. 운영 연동 후 오류율·최신성·상태 충돌을 실제 지표로 수집합니다.';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncCaseStudy,{once:true});else syncCaseStudy();
})();
