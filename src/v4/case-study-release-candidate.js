/* FootMate v4.9 Case Study v5 Release Candidate narrative. */
(function(){
  let applied=false;
  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.8.0')return false;
    note.innerHTML='v4.9.0 · v5 Release Candidate<br>Matchday Companion';
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){const b=proof[2].querySelector('b');const s=proof[2].querySelector('span');if(b)b.textContent='v5 전환 계약 고정';if(s)s.textContent='IA·design system·성능 예산·event/provider contract·migration rollback을 RC 기준으로 묶었습니다.'}
    const ia=slides[12];
    if(ia){const lead=ia.querySelector('.fm-next-story-lead');if(lead)lead.textContent='Find → Decide → Join → Play → Return의 IA를 final route contract로 고정하고, 기존 v4 visual 값을 semantic design token alias와 공통 control 기준으로 묶었습니다. Real / Guided / Evidence 분리는 유지합니다.';ia.setAttribute('data-rc-ia','frozen')}
    const system=slides[13];
    if(system){const lead=system.querySelector('.fm-next-story-lead');if(lead)lead.textContent='recommendation.selected·join.started/completed·checkin.completed·postgame.submitted를 stable event catalog로 고정했습니다. auth/payment/capacity/notification은 interface-compatible mock provider이며 외부 API·analytics 전송은 아직 없습니다.';system.setAttribute('data-release-candidate-evidence','v5-contracts')}
    const validation=slides[14];
    if(validation){const lead=validation.querySelector('.fm-next-story-lead');if(lead)lead.textContent='RC gate는 기존 회귀에 performance budget, welcome→checkout full-flow axe, provider mock contract, session migration checkpoint/rollback rehearsal을 추가합니다. Production은 exact SHA HTTP + Chromium으로 다시 검증합니다.'}
    const outcome=slides[15];
    if(outcome){const lead=outcome.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v4.9는 v5로 넘어가기 전 제품·관측·연동 경계를 고정하는 Release Candidate입니다. v5.0에서는 실제로 연결한 provider만 Production 기능으로 승격하고, 연결하지 않은 auth/payment/capacity/notification/AI는 mock·simulation으로 계속 명시합니다.'}
    document.documentElement.dataset.footmateCaseStudyRelease='4.9.0';applied=true;return true;
  }
  if(patch())return;const target=document.querySelector('.track')||document.body;const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});observer.observe(target,{childList:true,subtree:true});let attempts=0;(function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
