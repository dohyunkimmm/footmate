/* FootMate Case Study · tighten 01/03 lead copy without changing the approved evidence hierarchy. */
(function(){
  let applied=false;

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyReviewerPolish!=='1')return false;
    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13)return false;

    const coverLead=slides[0]?.querySelector('.fm-next-cover-lead');
    const personaLead=slides[2]?.querySelector('.fm-next-story-lead');
    const personaSummary=slides[2]?.querySelectorAll('.fm-next-review-summary>div');
    if(!coverLead||!personaLead||personaSummary?.length!==3)return false;

    coverLead.textContent='나에게 맞는 이유를 확인하고, 안심하고 참가하는 풋살 서비스입니다.';
    personaLead.textContent='설계용 Persona는 가정으로 두고, 행동 과업으로 탐색·가입 동선을 점검했습니다.';

    const validationLabel=personaSummary[2].querySelector('span');
    const validationValue=personaSummary[2].querySelector('b');
    if(validationLabel)validationLabel.textContent='검증 방식';
    if(validationValue)validationValue.textContent='행동 과업 · iOS · Android';

    document.documentElement.dataset.footmateCaseStudyLeadTighten='1';
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<120)requestAnimationFrame(retry)})();
})();
