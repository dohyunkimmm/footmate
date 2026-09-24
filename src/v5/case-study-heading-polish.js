/* FootMate Case Study · reader-facing English section labels only.
   Legacy filename retained for compatibility. Story headings and supporting body copy stay Korean-first. */
(function(){
  let applied=false;
  const labels=[
    null,
    '02 · Problem & Goal',
    '03 · Persona · JTBD',
    '04 · Scope & Priority',
    '05 · Guest First',
    '06 · Recommendation',
    '07 · Decision Detail',
    '08 · Sign in · Join',
    '09 · Operations',
    '10 · Recovery',
    '11 · Domain & AI',
    '12 · KPI & Validation',
    '13 · Release & Learnings'
  ];

  function loadReaderPolish(){
    if(document.querySelector('script[data-footmate-case-study-reader-polish]'))return;
    const script=document.createElement('script');
    script.src='/src/v5/case-study-reader-polish.js?v=1';
    script.dataset.footmateCaseStudyReaderPolish='true';
    document.body.appendChild(script);
  }

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='5.1.1'||
       document.documentElement.dataset.footmateCaseStudySections!=='13')return false;
    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13)return false;
    labels.forEach((label,index)=>{
      if(!label)return;
      const kicker=slides[index]?.querySelector('.fm-next-story-kicker');
      if(kicker)kicker.textContent=label;
    });
    const coverKicker=slides[0]?.querySelector('.fm-next-cover-kicker');
    if(coverKicker)coverKicker.textContent='Overview';
    const topTitle=document.querySelector('.topbar-title');
    if(topTitle)topTitle.textContent='FootMate · Case Study';
    document.title='FootMate · Case Study';
    document.documentElement.dataset.footmateCaseStudySectionLabelLanguage='en';
    document.documentElement.dataset.footmateCaseStudyHeadingLanguage='ko';
    loadReaderPolish();
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<80)requestAnimationFrame(retry)})();
})();
