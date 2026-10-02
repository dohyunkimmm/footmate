/* FootMate v4.7 Case Study Personalization & Memory evidence. */
(function(){
  let applied=false;
  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.6.0')return false;
    note.innerHTML='v4.7.0 · Personalization & Memory<br>Matchday Companion';
    const visual=document.querySelector('.fm-next-cover-visual');if(visual)visual.setAttribute('aria-label','FootMate v4.7 앱 미리보기');
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){const b=proof[2].querySelector('b');const s=proof[2].querySelector('span');if(b)b.textContent='반복 이용자의 결정 시간을 줄임';if(s)s.textContent='저장 프로필·최근 행동·선호 지역/시간/포맷을 로컬 개인화 신호로 연결합니다.'}
    const decision=slides[6];
    if(decision){const lead=decision.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v4.7은 추천을 매번 같은 초기 설정에서 시작하지 않습니다. 저장한 프로필과 선호 지역·시간·경기 포맷, 최근 확인 이력을 보조 신호로 사용하고 “왜 추천됐나요?”에서 근거를 다시 확인할 수 있게 합니다.';decision.setAttribute('data-personalization-evidence','memory')}
    const system=slides[13];
    if(system){const lead=system.querySelector('.fm-next-story-lead');if(lead)lead.textContent='개인화 상태는 `footmate:v4:personalization`에 분리 저장합니다. 기본 세션·결제·Matchday·Return 상태와 섞지 않고, 초기화와 기본 설정 수정 경로를 유지합니다. 회원 DB·서버 메모리·기기 간 동기화는 연결하지 않습니다.'}
    const outcome=slides[15];
    if(outcome){const lead=outcome.querySelector('.fm-next-story-lead');if(lead)lead.textContent='v4.7까지 Find → Decide → Join → Play → Return에 반복 이용자용 로컬 Memory가 연결됐습니다. 다음 단계는 이 기능들을 실제 provider 연동이 가능한 domain/application/presentation 구조로 분리하는 것입니다.'}
    document.documentElement.dataset.footmateCaseStudyRelease='4.7.0';applied=true;return true;
  }
  if(patch())return;const target=document.querySelector('.track')||document.body;const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});observer.observe(target,{childList:true,subtree:true});let attempts=0;(function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
