/* FootMate current product Case Study narrative. */
(function(){
  let applied=false;
  function cleanVersionCopy(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      const before=node.nodeValue||'';
      const after=before
        .replace(/\bv\d+\.\d+(?:\.\d+)?부터\s*/gi,'')
        .replace(/\bv\d+\.\d+(?:\.\d+)?(?:은|는)\s*/gi,'현재 제품은 ')
        .replace(/\bv\d+\.\d+(?:\.\d+)?의\s*/gi,'현재 ')
        .replace(/\bv\d+\.\d+(?:\.\d+)?\s*·\s*/gi,'')
        .replace(/\bv\d+\.\d+(?:\.\d+)?\b/gi,'')
        .replace(/\s{2,}/g,' ');
      if(after!==before)node.nodeValue=after;
    }
  }
  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];const note=document.querySelector('.fm-next-cover-note');if(slides.length!==16||!note)return false;if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.9.0')return false;
    note.innerHTML='AI Match Assistant<br>Natural language → deterministic recommendation';
    const visual=document.querySelector('.fm-next-cover-visual');if(visual)visual.setAttribute('aria-label','FootMate 앱 미리보기');
    const frame=document.querySelector('.fm-next-cover-frame iframe');if(frame)frame.title='FootMate 실제 앱 흐름 미리보기';
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];if(proof[2]){const b=proof[2].querySelector('b'),s=proof[2].querySelector('span');if(b)b.textContent='AI를 넣되 추천 근거는 보존';if(s)s.textContent='자연어 조건 해석은 AI가 담당하고, 실제 경기 후보·순위·추천 이유는 deterministic recommendation과 sample records가 결정합니다.'}
    const afterBadge=slides[5]?.querySelector('.fm-next-cs-before-after .is-after small');if(afterBadge)afterBadge.textContent='AFTER';
    const architecture=slides[12];if(architecture){const lead=architecture.querySelector('.fm-next-story-lead');if(lead)lead.textContent='현재 구조는 recommendation / participation / matchday / return ownership을 분리하고, AI 요청 timeout과 reload state consistency를 보강했습니다. AI는 Context를 읽고 검색 조건을 구조화한 뒤 기존 recommendation engine을 Tool로 사용하며 결과 데이터와 순위를 직접 생성하지 않습니다.';architecture.setAttribute('data-v5-domain-evidence','separated')}
    const providers=slides[13];if(providers){const lead=providers.querySelector('.fm-next-story-lead');if(lead)lead.textContent='auth/payment/capacity/notification provider는 deterministic mock을 유지합니다. AI inference는 server-side Vercel AI Gateway 경계로 분리하고, provider 오류·timeout이면 한 번의 provider fallback 뒤 browser rules fallback으로 복구합니다. 함수 실행 시간과 요청 형식도 제한합니다.';providers.setAttribute('data-v5-provider-evidence','mock-only');providers.setAttribute('data-v5-ai-evidence','guardrailed')}
    const validation=slides[14];if(validation){const lead=validation.querySelector('.fm-next-story-lead');if(lead)lead.textContent='Release gate는 connected-ai와 provider/browser fallback, bounded timeout, reload mode restoration, deterministic ranking ownership, HITL(join/payment), cross-domain consistency, recovery, responsive 320/375/390/430, axe와 exact Production smoke를 함께 확인합니다.';validation.setAttribute('data-v5-validation-evidence','acceptance')}
    const outcome=slides[15];if(outcome){const lead=outcome.querySelector('.fm-next-story-lead');if(lead)lead.textContent='현재 제품은 AI 지연이나 provider 실패가 경기 탐색을 막지 않도록 복구 경계를 강화했습니다. AI는 검색 조건 해석에 한정되고 실제 경기 데이터·순위·추천 이유는 deterministic recommendation이 소유합니다. 참가·결제는 계속 사용자 확인을 거칩니다.'}
    cleanVersionCopy(document.querySelector('.fm-cs-shell'));
    document.documentElement.dataset.footmateCaseStudyRelease='5.1.1';applied=true;return true;
  }
  if(patch())return;const target=document.querySelector('.track')||document.body;const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});observer.observe(target,{childList:true,subtree:true});let attempts=0;(function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
