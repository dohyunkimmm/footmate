/* FootMate Case Study · P12 copy + evidence-card rhythm
   Scope: KPI & Validation only. Keeps metrics, evidence ownership, and product runtime unchanged. */
(function(){
  function apply(){
    if(document.documentElement.dataset.fmCaseStudyP12CopySpacing==='true')return true;
    if(document.documentElement.dataset.fmCaseStudyP1Visuals!=='true')return false;

    const slide=document.querySelector('html[data-fm-next-case-study="true"] .fm-next-story-slide[data-v5-content-role="validation-evidence"]');
    const lead=slide?.querySelector('.fm-next-story-lead');
    const banner=slide?.querySelector('.fm-p1-validation-banner');
    const evidence=slide?.querySelector('.fm-p1-evidence-grid');
    if(!slide||!lead||!banner||!evidence)return false;

    lead.textContent='아래 지표는 Beta에서 관찰할 Validation Metric으로, 아직 측정된 성과값이 아닙니다.';

    const bannerTitle=banner.querySelector('b');
    const bannerCopy=banner.querySelector('p');
    if(bannerTitle)bannerTitle.textContent='측정 전 기준 정의';
    if(bannerCopy)bannerCopy.textContent='목표치보다 분자 · 분모 · 제외 조건 · 기준값을 먼저 정의';

    document.documentElement.dataset.fmCaseStudyP12CopySpacing='true';
    return true;
  }

  if(!apply()){
    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(apply()||tries>1200)clearInterval(timer);
    },25);
  }
})();
