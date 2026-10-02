/* FootMate Case Study · P1 Real App home preview */
(function(){
  let tries=0;
  function apply(){
    const preview=document.querySelector('.fm-next-cover .fm-cs-static-preview');
    if(!preview){
      if(tries++<24)requestAnimationFrame(apply);
      return;
    }
    if(preview.dataset.fmP1RealPreview==='true')return;

    preview.dataset.fmP1RealPreview='true';
    preview.classList.remove('fm-cs-ai-preview');
    preview.classList.add('fm-cs-real-home-preview');
    preview.setAttribute('aria-label','FootMate 최신 Real App 홈 화면 정적 프리뷰');
    preview.innerHTML=`
      <div class="fm-p1-real-top">
        <div class="fm-p1-real-brand"><span class="fm-p1-real-logo-mark" aria-hidden="true">◉</span><b>FootMate</b></div>
      </div>
      <div class="fm-p1-real-segment" aria-label="홈 탐색 모드">
        <b>추천 경기 보기</b><span>조건 바꾸기</span>
      </div>
      <section class="fm-p1-real-ai" aria-label="AI Match Assistant">
        <small>AI MATCH ASSISTANT</small>
        <h3>AI에게 원하는 경기를 검색해보세요.</h3>
        <div class="fm-p1-real-ai-form"><span>예: 8시 이후, 가까운 중급 MF</span><b>AI로 찾기</b></div>
        <div class="fm-p1-real-chips"><span>8시 이후 · 2만원 이하</span><span>인계 · 초급</span><span>20분 이내 · GK</span></div>
      </section>
      <div class="fm-p1-real-section-head"><h3>For You</h3><span>전체 보기</span></div>
      <article class="fm-p1-real-match">
        <div class="fm-p1-real-match-meta"><small>샘플 일정 · 10월 1일 · 21:30</small><b>✦ 추천 1순위</b></div>
        <h3>광교 웨스트파크</h3>
        <div class="fm-p1-real-match-bottom"><div><span class="is-fit">조건과 잘 맞아요</span><span>22분</span><span>MF 2자리</span></div><strong>13,000원</strong></div>
      </article>
      <nav class="fm-p1-real-nav" aria-label="Real App 하단 내비게이션"><span class="is-on">⌂<b>홈</b></span><span>⌕<b>경기 찾기</b></span><span>○<b>MY</b></span></nav>`;

    const note=document.querySelector('.fm-next-cover-note');
    if(note)note.innerHTML='<strong>최신 Real App 홈 프리뷰</strong><span>현재 Production 홈 구조를 정적으로 재현했습니다.</span>';
    document.documentElement.dataset.fmP1RealPreview='true';
  }
  apply();
})();
