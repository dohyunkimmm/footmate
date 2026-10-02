/* FootMate v4.5 Case Study Matchday Operations evidence. */
(function(){
  let applied=false;
  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.4.0')return false;
    note.innerHTML='v4.5.0 · Matchday Operations<br>Matchday Companion';
    const visual=document.querySelector('.fm-next-cover-visual');if(visual)visual.setAttribute('aria-label','FootMate v4.5 앱 미리보기');
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){const b=proof[2].querySelector('b');const s=proof[2].querySelector('span');if(b)b.textContent='참가 이후 행동도 상태로 관리';if(s)s.textContent='upcoming → matchday → checked-in과 late·update·cancel recovery를 분리합니다.'}
    const matchday=slides[10];
    if(matchday){const lead=matchday.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v4.5는 참가 확정 이후를 upcoming → matchday → checked-in 상태로 연결합니다. 도착 지연, 운영 변경, 취소도 별도 복구 상태로 다루고 홈과 내 경기 화면에서 다음 행동을 바로 제시합니다.';const grid=matchday.querySelector('.fm-next-cs-day-states');if(grid)grid.setAttribute('data-matchday-evidence','operations-state-machine')}
    const recovery=slides[11];
    if(recovery){const lead=recovery.querySelector('.fm-next-story-lead');if(lead)lead.textContent='검색 0개와 결제 복구에 더해 late → arrival recovery, 운영 변경 확인, 경기 취소 → 다른 경기 탐색까지 경기 당일 Fallback Flow를 명시했습니다.'}
    const system=slides[13];
    if(system){const lead=system.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v4.5는 `footmate:v4:matchday`에 경기 ID·운영 상태·도착 상태·공지 확인을 독립 저장합니다. 실제 위치·지도·팀 채팅·알림 backend 없이 deterministic operations contract만 검증합니다.'}
    document.documentElement.dataset.footmateCaseStudyRelease='4.5.0';applied=true;return true;
  }
  if(patch())return;const target=document.querySelector('.track')||document.body;const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});observer.observe(target,{childList:true,subtree:true});let attempts=0;(function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
