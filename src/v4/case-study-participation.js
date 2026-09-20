/* FootMate v4.4 Case Study Join & Payment State Machine evidence. */
(function(){
  let applied=false;

  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.3.0')return false;

    note.innerHTML='v4.4.0 · Join & Payment State Machine<br>Matchday Companion';
    const visual=document.querySelector('.fm-next-cover-visual');
    if(visual)visual.setAttribute('aria-label','FootMate v4.4 앱 미리보기');
    const frame=document.querySelector('.fm-next-cover-frame iframe');
    if(frame)frame.title='FootMate v4.4 실제 앱 흐름 미리보기';

    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){
      const title=proof[2].querySelector('b');
      const copy=proof[2].querySelector('span');
      if(title)title.textContent='결제 중에도 선택을 잃지 않음';
      if(copy)copy.textContent='경기·금액·정책을 스냅샷으로 고정하고 pending·failure·retry·cancel 상태를 복구합니다.';
    }

    const signIn=slides[8];
    if(signIn){
      const lead=signIn.querySelector('.fm-next-story-lead');
      if(lead)lead.textContent='참가 의도가 생긴 뒤 로그인하는 guest-first 계약은 그대로 유지합니다. v4.4에서는 인증 뒤 Checkout으로 넘어갈 때 선택 경기와 참가 맥락을 유지하고, 결제 상태와 사용자 세션을 분리해 실패나 reload가 생겨도 참가 여부를 명확하게 복구합니다.';
    }

    const payment=slides[9];
    if(payment){
      const lead=payment.querySelector('.fm-next-story-lead');
      if(lead)lead.textContent='v4.4의 Checkout은 단일 성공 버튼이 아니라 `checkout → pending → success | failure | canceled` 상태 모델로 동작합니다. 결제 수단을 선택하고, 요청 중에는 중복 제출을 막으며, 실패 시 같은 경기·금액·정책 스냅샷으로 retry할 수 있습니다.';
      const flow=payment.querySelector('.fm-next-cs-auth-flow,.fm-next-cs-flow,.fm-next-cs-journey');
      if(flow)flow.setAttribute('data-participation-evidence','state-machine');
      const noteBox=payment.querySelector('.fm-next-cs-note,.fm-next-cs-decision');
      if(noteBox)noteBox.textContent='실제 PG 승인은 연결하지 않습니다. 결제 수단·pending·failure·retry·cancel·success는 참가 계약과 복구 UX를 검증하기 위한 deterministic simulation입니다.';
    }

    const recovery=slides[11];
    if(recovery){
      const lead=recovery.querySelector('.fm-next-story-lead');
      if(lead)lead.textContent='검색 0개뿐 아니라 결제 pending reload, 실패 후 retry, 사용자 cancel도 복구 상태로 다룹니다. failure/cancel에서는 joinedMatchId를 만들지 않고, success에서만 결제 시작 시 고정한 match snapshot으로 참가를 확정합니다.';
    }

    const system=slides[13];
    if(system){
      const lead=system.querySelector('.fm-next-story-lead');
      if(lead)lead.textContent='v4.4는 `footmate:v4:participation`에 payment method, checkout snapshot, attempt, pending/failure/success/canceled 상태를 독립 저장합니다. v4.1 추천, v4.2 탐색, v4.3 Decision Detail 계약은 유지하며 실제 OAuth·회원 DB·PG·실시간 정원 backend는 계속 미연동입니다.';
    }

    document.documentElement.dataset.footmateCaseStudyRelease='4.4.0';
    applied=true;
    return true;
  }

  if(patch())return;
  const target=document.querySelector('.track')||document.body;
  const observer=new MutationObserver(()=>{
    if(patch())observer.disconnect();
  });
  observer.observe(target,{childList:true,subtree:true});
  let attempts=0;
  function retry(){
    attempts+=1;
    if(patch()){observer.disconnect();return;}
    if(attempts<40)requestAnimationFrame(retry);
  }
  requestAnimationFrame(retry);
})();
