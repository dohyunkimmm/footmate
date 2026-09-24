/* Case Study cover: static preview of the Real App AI Match Assistant. */
(function(){
  if(document.documentElement.dataset.fmNextCaseStudy!=='true')return;
  let applied=false;

  function patch(){
    if(applied)return true;
    const preview=document.querySelector('.fm-cs-static-preview');
    const visual=document.querySelector('.fm-next-cover-visual');
    const note=document.querySelector('.fm-next-cover-note');
    if(!preview||!visual||!note)return false;

    preview.classList.add('fm-cs-static-ai-preview');
    preview.setAttribute('role','img');
    preview.setAttribute('aria-label','FootMate Real App AI 검색 화면 정적 프리뷰');
    preview.innerHTML=`
      <div class="fm-cs-ai-preview-top"><span>FootMate</span><b>AI 검색</b></div>
      <section class="fm-cs-ai-preview-card" aria-hidden="true">
        <div class="fm-cs-ai-preview-head">
          <div><span>AI Match Assistant</span><em>AI connected</em></div>
          <h3>말로 경기 조건을 알려주세요.</h3>
          <p>AI는 요청을 검색 조건으로 바꾸고, 실제 경기 순위는 기준 기반 추천이 결정합니다.</p>
        </div>
        <div class="fm-cs-ai-preview-label">찾고 싶은 경기 조건</div>
        <div class="fm-cs-ai-preview-query"><span>8시 이후, 2만원 이하, 가까운 중급 MF 경기</span><b>AI로 찾기</b></div>
        <div class="fm-cs-ai-preview-examples"><span>8시 이후 · 2만원 이하</span><span>인계 · 초중급</span><span>20분 이내 · GK</span></div>
        <div class="fm-cs-ai-preview-status"><b>요청을 경기 검색 조건으로 정리했어요.</b><span>AI가 자연어를 조건으로 해석했고, 순위는 기존 추천 엔진이 계산했습니다.</span></div>
        <div class="fm-cs-ai-preview-conditions"><span>수원 · 인계</span><span>MF</span><span>중급</span><span>20분 이내</span></div>
        <div class="fm-cs-ai-preview-results">
          <div class="fm-cs-ai-preview-result"><i>1</i><span><b>수원 인계 풋살파크</b><small>중급 · 15분 · 12,000원</small><em>비슷한 경기 레벨 · 이동 부담이 적어요</em></span><strong>→</strong></div>
        </div>
        <div class="fm-cs-ai-preview-guardrail">AI는 참가·결제를 실행하지 않습니다.</div>
      </section>`;

    visual.setAttribute('aria-label','FootMate Real App AI 검색 정적 프리뷰');
    note.innerHTML='<span>정적 AI 검색 프리뷰 · 실제 체험은 Demo에서</span>';
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.body,{childList:true,subtree:true});
  requestAnimationFrame(patch);
})();
