/* FootMate v5.1 AI Match Assistant Case Study narrative. */
(function(){
  let applied=false;
  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.9.0')return false;
    note.innerHTML='v5.1 · AI Match Assistant<br>Natural language → deterministic recommendation';
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){const b=proof[2].querySelector('b');const s=proof[2].querySelector('span');if(b)b.textContent='AI를 넣되 추천 근거는 보존';if(s)s.textContent='자연어 조건 해석은 AI가 담당하고, 실제 경기 후보·순위·추천 이유는 기존 recommendation engine과 sample records가 결정합니다.'}
    const architecture=slides[12];
    if(architecture){const lead=architecture.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v5.1은 v5.0의 recommendation / participation / matchday / return ownership을 유지하면서 AI Match Assistant를 추가했습니다. AI는 Context를 읽고 검색 조건을 구조화한 뒤 기존 recommendation engine을 Tool로 사용하며, 결과 데이터와 순위를 직접 생성하지 않습니다.';architecture.setAttribute('data-v5-domain-evidence','separated')}
    const providers=slides[13];
    if(providers){const lead=providers.querySelector('.fm-next-story-lead');if(lead)lead.textContent='auth/payment/capacity/notification provider는 기존 deterministic mock을 유지합니다. AI inference는 /api/ai-match-assistant의 server-side Vercel AI Gateway 경계로 분리하고, OIDC/API key 사용이 불가능하거나 요청이 실패하면 browser rules fallback으로 자동 복구합니다.';providers.setAttribute('data-v5-provider-evidence','mock-only');providers.setAttribute('data-v5-ai-evidence','guardrailed')}
    const validation=slides[14];
    if(validation){const lead=validation.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v5.1 gate는 AI structured output guardrail, connected-ai와 rules fallback, deterministic ranking ownership, HITL(join/payment), 기존 cross-domain consistency, recovery, responsive 320/375/390/430, axe와 exact Production smoke를 함께 확인합니다.';validation.setAttribute('data-v5-validation-evidence','acceptance')}
    const outcome=slides[15];
    if(outcome){const lead=outcome.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v5.1은 AI가 없는 경기를 만들거나 참가·결제를 자동 실행하지 않게 했습니다. AI는 자연어를 구조화된 검색 조건으로 바꾸는 역할에 한정하고, 실제 경기 데이터·순위·추천 이유는 deterministic recommendation이 소유합니다. AI 연결이 실패해도 기존 경기 탐색은 rules fallback으로 계속 사용할 수 있습니다.'}
    document.documentElement.dataset.footmateCaseStudyRelease='5.1.0';applied=true;return true;
  }
  if(patch())return;const target=document.querySelector('.track')||document.body;const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});observer.observe(target,{childList:true,subtree:true});let attempts=0;(function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
