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
      <div class="fm-p1-real-review-shell">
        <aside class="fm-p1-real-context" aria-label="서비스와 체험 범위">
          <small>REVIEW CONTEXT</small>
          <h3>경기를 찾고, 판단하고, 무료 참가까지 이어집니다.</h3>
          <ol><li><b>Find</b><span>자연어 조건 해석</span></li><li><b>Decide</b><span>추천 근거·상세 비교</span></li><li><b>Join</b><span>로그인 후 무료 참가 확인</span></li></ol>
          <div class="fm-p1-real-boundary"><span>샘플</span><b>경기·잔여 자리</b><span>체험 기록</span><b>참가·체크인·피드백</b></div>
        </aside>
        <div class="fm-p1-real-app">
          <div class="fm-p1-real-top">
            <div class="fm-p1-real-brand"><span class="fm-p1-real-logo-mark" aria-hidden="true">◉</span><b>FootMate</b></div>
          </div>
          <div class="fm-p1-real-segment" aria-label="홈 탐색 모드">
            <b>추천 경기 보기</b><span>조건 바꾸기</span>
          </div>
          <section class="fm-p1-real-ai" aria-label="AI Match Assistant">
            <small>AI MATCH ASSISTANT</small>
            <h3>AI에게 원하는 경기를 검색해보세요.</h3>
            <div class="fm-p1-real-ai-form"><span>예: 20시 이후, 가까운 중급 MF</span><b>AI로 찾기</b></div>
            <div class="fm-p1-real-chips"><span>20시 이후 · 2만원 이하</span><span>인계 · 초급</span><span>20분 이내 · GK</span></div>
          </section>
          <div class="fm-p1-real-section-head"><h3>내 조건에 맞는 추천</h3><span>전체 보기</span></div>
          <article class="fm-p1-real-match">
            <div class="fm-p1-real-match-meta"><small>샘플 일정 · 평일 21:30</small><b>✦ 추천 1순위</b></div>
            <h3>광교 웨스트파크</h3>
            <div class="fm-p1-real-match-bottom"><div><span class="is-fit">조건과 잘 맞아요</span><span>22분</span><span>MF 2자리</span></div><strong>13,000원</strong></div>
          </article>
          <nav class="fm-p1-real-nav" aria-label="Real App 하단 내비게이션"><span class="is-on">⌂<b>홈</b></span><span>⌕<b>경기 찾기</b></span><span>○<b>MY</b></span></nav>
        </div>
      </div>`;

    const note=document.querySelector('.fm-next-cover-note');
    if(note)note.innerHTML='<strong>제품 홈 화면 미리보기</strong><span>데스크톱에서는 앱 화면과 서비스 여정·샘플 체험 경계를 한 화면에서 함께 설명합니다.</span>';
    document.documentElement.dataset.fmP1RealPreview='true';
  }
  apply();
})();
