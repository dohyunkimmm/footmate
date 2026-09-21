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
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];if(proof[2]){const b=proof[2].querySelector('b'),s=proof[2].querySelector('span');if(b)b.textContent='AI를 넣되 추천 근거는 보존';if(s)s.textContent='/app의 자연어 조건 해석은 AI가 담당하고 경기 후보·순위·추천 이유는 deterministic recommendation과 sample records가 결정합니다. 실제 참가 검증은 별도 /beta의 Supabase connected data path에서 진행합니다.'}
    const afterBadge=slides[5]?.querySelector('.fm-next-cs-before-after .is-after small');if(afterBadge)afterBadge.textContent='AFTER';
    const architecture=slides[12];if(architecture){const lead=architecture.querySelector('.fm-next-story-lead');if(lead)lead.textContent='현재 구조는 recommendation / participation / matchday / return ownership을 분리하고, AI 요청 timeout과 reload state consistency를 보강했습니다. AI는 Context를 읽고 검색 조건을 구조화한 뒤 기존 recommendation engine을 Tool로 사용하며 결과 데이터와 순위를 직접 생성하지 않습니다.';architecture.setAttribute('data-v5-domain-evidence','separated')}
    const providers=slides[13];if(providers){const lead=providers.querySelector('.fm-next-story-lead');if(lead)lead.textContent='/app의 auth/payment/capacity/notification provider는 deterministic mock을 유지합니다. 반면 /beta는 Supabase Auth·Postgres·RLS·atomic RPC로 실제 회원·경기·포지션 정원·참가/취소를 연결하고, /beta/operator는 allowlist 운영 경로를 사용합니다. 실제 PG·notification delivery·external analytics는 아직 연결하지 않았습니다.';providers.setAttribute('data-v5-provider-evidence','split-boundary');providers.setAttribute('data-v5-ai-evidence','guardrailed')}
    const validation=slides[14];if(validation){const lead=validation.querySelector('.fm-next-story-lead');if(lead)lead.textContent='자동 release gate는 connected-ai와 provider/browser fallback, bounded timeout, reload restoration, deterministic ranking ownership, Closed Beta Auth·join/cancel·operator recovery, account deletion boundary, audit traceability, responsive 320/375/390/430, axe와 exact Production smoke를 함께 확인합니다. 물리 기기와 수동 접근성 점검은 별도 manual QA로 남깁니다.';validation.setAttribute('data-v5-validation-evidence','acceptance')}
    const outcome=slides[15];if(outcome){const lead=outcome.querySelector('.fm-next-story-lead');if(lead)lead.textContent='현재 제품은 /app의 sample·mock 경계와 /beta의 실제 Supabase 참가 경계를 분리했습니다. AI는 검색 조건 해석에 한정되고 /app의 순위·추천 이유는 deterministic recommendation이 소유합니다. Closed Beta는 실제 회원·경기·정원·참가/취소와 계정 삭제까지 연결하되 결제와 notification은 연결하지 않습니다.'}
    cleanVersionCopy(document.querySelector('.fm-cs-shell'));
    document.documentElement.dataset.footmateCaseStudyRelease='5.1.1';applied=true;return true;
  }
  if(patch())return;const target=document.querySelector('.track')||document.body;const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});observer.observe(target,{childList:true,subtree:true});let attempts=0;(function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
