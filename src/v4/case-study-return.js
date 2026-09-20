/* FootMate v4.6 Case Study Return Loop & Reputation evidence. */
(function(){
  let applied=false;
  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.5.0')return false;
    note.innerHTML='v4.6.0 · Return Loop & Reputation<br>Matchday Companion';
    const visual=document.querySelector('.fm-next-cover-visual');if(visual)visual.setAttribute('aria-label','FootMate v4.6 앱 미리보기');
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){const b=proof[2].querySelector('b');const s=proof[2].querySelector('span');if(b)b.textContent='Play 이후가 다음 Find로 이어짐';if(s)s.textContent='체감 난이도·참여 이력·반복 의도를 다음 추천의 보조 신호로 연결합니다.'}
    const matchday=slides[10];
    if(matchday){const lead=matchday.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v4.6은 경기 당일 체크인 이후 postgame을 실제 Return 상태로 연결합니다. 체감 난이도와 다시 뛰고 싶은 조건을 저장하고 참여 완료 이력을 남겨 다음 탐색의 시작점을 조정합니다.';matchday.setAttribute('data-return-evidence','feedback-loop')}
    const recovery=slides[11];
    if(recovery){const lead=recovery.querySelector('.fm-next-story-lead');if(lead)lead.textContent='Return 단계에서도 평가 미완료는 건너뛸 수 있고, 저장된 피드백은 언제든 다음 추천의 보조 신호로만 사용됩니다. 공개 평판 점수나 팀원 평가로 확대하지 않습니다.'}
    const system=slides[13];
    if(system){const lead=system.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v4.6은 `footmate:v4:return`에 경기 ID·참여 완료·체감 난이도·반복 의도를 저장합니다. 개인 히스토리와 추천 보조 신호만 검증하며 외부 reputation backend는 연결하지 않습니다.'}
    document.documentElement.dataset.footmateCaseStudyRelease='4.6.0';applied=true;return true;
  }
  if(patch())return;const target=document.querySelector('.track')||document.body;const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});observer.observe(target,{childList:true,subtree:true});let attempts=0;(function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
