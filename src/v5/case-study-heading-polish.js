/* FootMate Case Study · English section labels only.
   Legacy filename retained for compatibility. Story headings and supporting body copy stay Korean-first. */
(function(){
  let applied=false;
  const labels=[
    null,
    '02 · Problem',
    '03 · Persona · JTBD',
    '04 · Product Principle · Core Journey',
    '05 · Design Decision 01',
    '06 · Design Decision 02',
    '07 · Design Decision 03',
    '08 · Sign in · Join',
    '09 · Matchday · Return',
    '10 · Recovery',
    '11 · Domain · AI Boundary',
    '12 · Validation',
    '13 · Production Boundary'
  ];

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
    document.documentElement.dataset.footmateCaseStudySectionLabelLanguage='en';
    document.documentElement.dataset.footmateCaseStudyHeadingLanguage='ko';
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<80)requestAnimationFrame(retry)})();
})();
