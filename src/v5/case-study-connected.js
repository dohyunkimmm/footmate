/* FootMate v5.0 Connected Matchday Platform Case Study narrative. */
(function(){
  let applied=false;
  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.9.0')return false;
    note.innerHTML='v5.0 · Connected Matchday Platform<br>Connected-capable · mock-only providers';
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){const b=proof[2].querySelector('b');const s=proof[2].querySelector('span');if(b)b.textContent='연동 가능한 플랫폼 경계';if(s)s.textContent='recommendation·participation·matchday·return domain을 분리하고 provider registry와 cross-domain consistency guardrail을 추가했습니다.'}
    const architecture=slides[12];
    if(architecture){const lead=architecture.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v5.0은 Find → Decide → Join → Play → Return 흐름을 recommendation / participation / matchday / return domain으로 명시적으로 분리합니다. 기존 v4.9 UX와 session schema v2는 compatibility boundary로 유지합니다.';architecture.setAttribute('data-v5-domain-evidence','separated')}
    const providers=slides[13];
    if(providers){const lead=providers.querySelector('.fm-next-story-lead');if(lead)lead.textContent='auth/payment/capacity/notification은 동일 interface를 유지한 provider registry로 주입할 수 있습니다. 현재 Production provider는 모두 deterministic mock이며 실제 OAuth·PG·realtime backend·notification side effect는 없습니다.';providers.setAttribute('data-v5-provider-evidence','mock-only')}
    const validation=slides[14];
    if(validation){const lead=validation.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v5 gate는 provider contract, 연결 상태 disclosure, cross-domain state consistency, recovery, responsive 320/375/390/430, full-flow axe와 exact Production HTTP + Chromium 검증을 함께 확인합니다.';validation.setAttribute('data-v5-validation-evidence','acceptance')}
    const outcome=slides[15];
    if(outcome){const lead=outcome.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v5.0은 외부 서비스를 연결했다고 주장하지 않습니다. 실제로 연결·검증된 provider만 connected로 승격할 수 있는 구조를 완성했고, 현재 auth/payment/capacity/notification과 AI inference는 mock/simulation 또는 미연동 경계로 유지합니다.'}
    document.documentElement.dataset.footmateCaseStudyRelease='5.0.0';applied=true;return true;
  }
  if(patch())return;const target=document.querySelector('.track')||document.body;const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});observer.observe(target,{childList:true,subtree:true});let attempts=0;(function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
