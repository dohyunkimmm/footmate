/* FootMate Next Major Candidate · cover enhancement only.
   The remaining v3.0 case study stays intact until the next IA is approved. */
(function(){
  function enhance(){
    const firstSlide=document.querySelector('.track .slide,.slide');
    if(!firstSlide||firstSlide.dataset.fmNextCover==='true')return;
    firstSlide.dataset.fmNextCover='true';
    firstSlide.classList.add('fm-next-cover-slide');
    firstSlide.innerHTML=`
      <div class="fm-next-cover cover">
        <div class="fm-next-cover-copy">
          <div class="fm-next-cover-kicker">FootMate · Matchday Companion</div>
          <h1>내 수준에 맞는 경기부터,<br><span>경기 당일까지.</span></h1>
          <p class="fm-next-cover-lead">경기를 검색하는 데서 끝나지 않고, <strong>왜 나와 맞는지 이해하고 안심하고 참가해 경기 당일까지 이어지는</strong> 풋살 경험을 설계했습니다.</p>
          <div class="fm-next-cover-actions">
            <a href="/next" target="_blank" rel="noopener">실제 앱 흐름 경험하기 <span aria-hidden="true">↗</span></a>
            <button type="button" data-fm-next-cover-next>문제부터 보기 <span aria-hidden="true">→</span></button>
          </div>
          <div class="fm-next-cover-flow" aria-label="핵심 사용자 흐름"><b>Find</b><i>→</i><b>Decide</b><i>→</i><b>Join</b><i>→</i><b>Play</b><i>→</i><b>Return</b></div>
          <div class="fm-next-cover-proof">
            <div><b>Guest-first onboarding</b><span>회원가입 전에 추천 가치를 먼저 확인</span></div>
            <div><b>Explainable match fit</b><span>점수보다 판단에 필요한 이유를 우선</span></div>
            <div><b>Matchday continuity</b><span>참가 이후 체크인·경기 후까지 연결</span></div>
          </div>
        </div>
        <div class="fm-next-cover-visual" aria-label="FootMate next app preview">
          <div class="fm-next-cover-glow" aria-hidden="true"></div>
          <div class="fm-next-cover-frame">
            <div class="fm-next-cover-frame-meta">Live interaction</div>
            <iframe src="/next?embed=1" title="FootMate 실제 앱 흐름 미리보기" loading="eager"></iframe>
          </div>
          <div class="fm-next-cover-note">Next major candidate<br>v3.0 stable baseline preserved</div>
        </div>
      </div>`;
    firstSlide.querySelector('[data-fm-next-cover-next]')?.addEventListener('click',()=>{
      const next=document.querySelector('.btn-next');
      if(next){next.click();return;}
      const toc=[...document.querySelectorAll('.toc-item')];
      if(toc[1])toc[1].click();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});
  else enhance();
  setTimeout(enhance,80);
})();
