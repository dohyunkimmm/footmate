/* FootMate v4.1 Case Study recommendation evidence.
   Keeps the v4 product story intact while making the v4.1 ranking change explicit. */
(function(){
  const slides=[...document.querySelectorAll('.slide')];
  if(!slides.length)return;

  const note=document.querySelector('.fm-next-cover-note');
  if(note)note.innerHTML='v4.1.0 · Recommendation Core<br>Matchday Companion';

  const visual=document.querySelector('.fm-next-cover-visual');
  if(visual)visual.setAttribute('aria-label','FootMate v4.1 앱 미리보기');
  const frame=document.querySelector('.fm-next-cover-frame iframe');
  if(frame)frame.title='FootMate v4.1 실제 앱 흐름 미리보기';

  const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
  if(proof[1]){
    const title=proof[1].querySelector('b');
    const copy=proof[1].querySelector('span');
    if(title)title.textContent='선호 조건이 실제 추천에 반영';
    if(copy)copy.textContent='지역·포지션·레벨 설정이 경기 순위와 추천 이유를 바꿉니다.';
  }

  const recommendationSlide=slides[6];
  if(recommendationSlide){
    const lead=recommendationSlide.querySelector('.fm-next-story-lead');
    if(lead)lead.textContent='v4.1부터 설명 가능한 추천이 실제 순위 로직과 연결됩니다. 지역·포지션·레벨을 내부 적합도에 반영하되, 사용자에게는 계산 점수보다 결정에 필요한 이유를 먼저 보여줍니다.';
    const recoCard=recommendationSlide.querySelector('.fm-next-cs-reco-card');
    if(recoCard){
      recoCard.innerHTML='<span>샘플 일정 · 수원 영통</span><h3>조건과 잘 맞아요</h3><div><b>생활권 일치</b><b>중급 강도 일치</b><b>MF 자리 있음</b></div><strong>추천 1순위</strong>';
    }
    const stack=recommendationSlide.querySelector('.fm-next-cs-stack');
    if(stack){
      stack.innerHTML='<p><b>1.</b> 생활권 일치 여부</p><p><b>2.</b> 체감 레벨 차이</p><p><b>3.</b> 선호 포지션 잔여 자리</p><p><b>4.</b> 이동 시간으로 동순위 정리</p>';
    }
    const evidence=recommendationSlide.querySelector('.fm-next-cs-note');
    if(evidence)evidence.textContent='내부 적합도는 정렬에 사용하지만 숫자 점수를 전면 노출하지 않습니다. 사용자는 “왜 이 경기가 위에 있는지”를 이유로 이해합니다.';
  }

  document.documentElement.dataset.footmateCaseStudyRelease='4.1.0';
})();
