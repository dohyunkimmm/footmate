/* FootMate v4.8 Case Study Platform Architecture evidence. */
(function(){
  let applied=false;
  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.7.0')return false;
    note.innerHTML='v4.8.0 · Platform Architecture<br>Matchday Companion';
    const visual=document.querySelector('.fm-next-cover-visual');if(visual)visual.setAttribute('aria-label','FootMate v4.8 앱 미리보기');
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){const b=proof[2].querySelector('b');const s=proof[2].querySelector('span');if(b)b.textContent='실제 provider를 받을 수 있는 경계';if(s)s.textContent='domain → application → infrastructure → presentation을 분리하고 브라우저 저장소를 교체 가능한 provider로 감쌉니다.'}
    const ia=slides[12];
    if(ia){const lead=ia.querySelector('.fm-next-story-lead');if(lead)lead.textContent='Real / Guided / Evidence 모드는 그대로 유지하면서 presentation이 domain 저장소를 직접 소유하지 않도록 platform boundary를 추가했습니다. 기존 v4 feature module은 compatibility runtime으로 보존하고 신규 계약은 platform 계층에서 검증합니다.'}
    const system=slides[13];
    if(system){const lead=system.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v4.8은 session schema v2 migration, storage provider/repository, recommendation·join·check-in·postgame event model을 명시합니다. 현재 provider는 localStorage이며 외부 analytics·회원 DB·PG·notification backend는 연결하지 않습니다.';system.setAttribute('data-platform-evidence','layered-contracts')}
    const validation=slides[14];
    if(validation){const lead=validation.querySelector('.fm-next-story-lead');if(lead)lead.textContent='기존 browser E2E·axe·Production smoke에 더해 memory storage fixture로 schema migration, repository roundtrip, event ordering·dedupe를 deterministic contract test로 고정합니다.'}
    const outcome=slides[15];
    if(outcome){const lead=outcome.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v4.8은 v4.7 사용자 경험을 유지하면서 실제 연동을 받을 수 있는 platform 계약을 분리했습니다. 다음 v4.9에서는 IA·design token·observability·provider mock contract와 migration/rollback rehearsal을 Release Candidate 기준으로 고정합니다.'}
    document.documentElement.dataset.footmateCaseStudyRelease='4.8.0';applied=true;return true;
  }
  if(patch())return;const target=document.querySelector('.track')||document.body;const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});observer.observe(target,{childList:true,subtree:true});let attempts=0;(function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
