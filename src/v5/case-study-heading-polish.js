/* FootMate Case Study · English story headings only.
   Scope: headings only. Body copy, data, routes, IA, and interaction remain unchanged. */
(function(){
  let applied=false;
  const headings=[
    null,
    'Choosing one match still takes too many separate checks.',
    'After work, choose a nearby match without overthinking it.',
    'Build one continuous decision flow instead of adding more features.',
    'Show recommendation value before asking for an account.',
    'Remember useful preferences without replacing explainable ranking.',
    'Design match detail around the participation decision.',
    'Preserve the chosen match through authentication and participation.',
    'Let the current match state reshape the home priority.',
    'Preserve context first, then offer the next action.',
    'Separate state ownership, provider boundaries, and AI authority.',
    'Keep automated QA, human verification, and AI-assisted review separate.',
    'Only describe capabilities that are actually connected and verified.'
  ];

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='5.1.1'||
       document.documentElement.dataset.footmateCaseStudySections!=='13')return false;
    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13)return false;
    headings.forEach((title,index)=>{
      if(!title)return;
      const heading=slides[index]?.querySelector('.fm-next-story h2');
      if(heading)heading.textContent=title;
    });
    document.documentElement.dataset.footmateCaseStudyHeadingLanguage='en';
    applied=true;
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<80)requestAnimationFrame(retry)})();
})();
