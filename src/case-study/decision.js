/* FootMate v4.3 Case Study Decision Detail evidence. */
(function(){
  let applied=false;

  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.2.0')return false;

    note.innerHTML='v4.3.0 · Decision Detail<br>Matchday Companion';
    const visual=document.querySelector('.fm-next-cover-visual');
    if(visual)visual.setAttribute('aria-label','FootMate v4.3 앱 미리보기');
    const frame=document.querySelector('.fm-next-cover-frame iframe');
    if(frame)frame.title='FootMate v4.3 실제 앱 흐름 미리보기';

    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){
      const title=proof[2].querySelector('b');
      const copy=proof[2].querySelector('span');
      if(title)title.textContent='상세에서 결정 근거까지';
      if(copy)copy.textContent='자리·포지션, 샘플 참가자 구성, 시설·환불 기준을 확인하고 저장·비교합니다.';
    }

    const detail=slides[7];
    if(detail){
      const lead=detail.querySelector('.fm-next-story-lead');
      if(lead)lead.textContent='v4.3에서는 시간·장소와 추천 이유만 보여주는 상세를 넘어, 샘플 잔여 자리와 포지션 구성, 시설·운영·준비물, 취소·환불 기준을 한 흐름에서 확인하고 저장·비교 의도를 남길 수 있게 했습니다.';
      const order=detail.querySelector('.fm-next-cs-detail-order');
      if(order)order.innerHTML='<span>시간 · 장소</span><i>↓</i><span>추천 근거 breakdown</span><i>↓</i><span>자리 · 샘플 포지션 구성</span><i>↓</i><span>시설 · 운영 · 준비물</span><i>↓</i><span>취소 · 환불 기준</span>';
      const sticky=detail.querySelector('.fm-next-cs-sticky');
      if(sticky)sticky.innerHTML='<small>Decision state</small><b>저장 · 최대 2경기 비교 · 참가하기</b><p>저장·비교는 탐색 의도를 보존하는 보조 행동으로 두고, 참가하기는 실제 참여 계약을 시작하는 primary CTA로 유지합니다.</p>';
    }

    const system=slides[13];
    if(system){
      const lead=system.querySelector('.fm-next-story-lead');
      if(lead)lead.textContent='v4.3의 Decision Detail은 v4.1 추천과 v4.2 탐색 계약을 그대로 사용하면서 `footmate:v4:decision`에 저장·비교 의도만 별도로 보존합니다. 참가자·정원·시설 정보는 샘플임을 명시하고 실제 backend 연동으로 오해하지 않게 경계를 유지합니다.';
    }

    document.documentElement.dataset.footmateCaseStudyRelease='4.3.0';
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
    if(attempts<30)requestAnimationFrame(retry);
  }
  requestAnimationFrame(retry);
})();
