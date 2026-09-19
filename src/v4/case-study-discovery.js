/* FootMate v4.2 Case Study discovery evidence. */
(function(){
  const slides=[...document.querySelectorAll('.slide')];
  if(!slides.length)return;

  const note=document.querySelector('.fm-next-cover-note');
  if(note)note.innerHTML='v4.2.0 · Discovery & Search<br>Matchday Companion';
  const visual=document.querySelector('.fm-next-cover-visual');
  if(visual)visual.setAttribute('aria-label','FootMate v4.2 앱 미리보기');
  const frame=document.querySelector('.fm-next-cover-frame iframe');
  if(frame)frame.title='FootMate v4.2 실제 앱 흐름 미리보기';

  const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
  if(proof[2]){
    const title=proof[2].querySelector('b');
    const copy=proof[2].querySelector('span');
    if(title)title.textContent='추천 뒤 직접 탐색';
    if(copy)copy.textContent='날짜·시간·거리·가격·포지션을 좁히고 정렬 상태를 이어갑니다.';
  }

  const journey=slides[4];
  if(journey){
    const lead=journey.querySelector('.fm-next-story-lead');
    if(lead)lead.textContent='v4.2에서는 추천을 출발점으로 유지하면서, Find 단계 안에서 날짜·시간·거리·가격·포지션을 직접 좁히고 적합도·거리·마감 임박 순으로 다시 정렬할 수 있게 했습니다.';
    const find=journey.querySelector('.fm-next-cs-journey > div:first-child p');
    if(find)find.textContent='추천을 보고 날짜·시간·거리·가격·포지션으로 탐색 범위를 조절합니다.';
  }

  const recommendation=slides[6];
  if(recommendation){
    const evidence=recommendation.querySelector('.fm-next-cs-note');
    if(evidence)evidence.textContent='v4.1의 실제 추천 순위는 그대로 기준점으로 사용합니다. v4.2의 필터와 정렬은 그 추천을 대체하지 않고, 사용자가 지금 가능한 경기만 직접 좁혀 비교하도록 확장합니다.';
  }

  const recovery=slides[11];
  if(recovery){
    const lead=recovery.querySelector('.fm-next-story-lead');
    if(lead)lead.textContent='검색 결과가 0개가 되어도 막다른 화면으로 두지 않습니다. 조건 넓히기와 전체 조건 해제를 제공하고, 선택한 검색 조건은 URL과 세션에 남겨 다시 돌아와도 같은 탐색 맥락을 유지합니다.';
  }

  document.documentElement.dataset.footmateCaseStudyRelease='4.2.0';
})();
