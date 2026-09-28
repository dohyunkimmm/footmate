/* FootMate Case Study · P2 polish orchestration
   Finishing pass only: restrained reveal order, cadence hooks, copy polish, and responsive polish.
   No new product facts, routes, IA, or runtime behavior. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';

  function storySlides(){
    return [...document.querySelectorAll(`${ROOT} .fm-next-story-slide`)];
  }

  function markReveal(node,order){
    if(!node)return;
    node.dataset.p2Reveal='true';
    node.style.setProperty('--fm-p2-order',String(order));
  }

  function markGroup(root,selector,start){
    if(!root)return;
    [...root.querySelectorAll(selector)].forEach((node,index)=>markReveal(node,start+index));
  }

  function markSection(slide){
    slide.dataset.p2Polish='true';
    markReveal(slide.querySelector('.fm-next-story-kicker'),0);
    markReveal(slide.querySelector('.fm-next-story h2'),1);
    markReveal(slide.querySelector('.fm-next-story-lead'),2);
  }

  function stripTerminalPeriod(node){
    if(!node)return;
    node.textContent=node.textContent.replace(/[.。]\s*$/,'');
  }

  function polishVisualCopy(){
    const selectors=[
      '.fm-p0-journey-step p',
      '.fm-p0-route header p',
      '.fm-p0-app-context b',
      '.fm-p0-annotations p',
      '.fm-p0-arch-node span',
      '.fm-p1-persona-context>p',
      '.fm-p1-jtbd-head>b',
      '.fm-p1-auth-screen p',
      '.fm-p1-validation-banner>p'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(stripTerminalPeriod);
  }

  function markP0Sequences(){
    markGroup(document,'.fm-p0-journey-step',3);
    markGroup(document,'.fm-p0-priority-map .fm-p0-priority-card',9);
    document.querySelectorAll('.fm-p0-route-steps').forEach(group=>markGroup(group,'.fm-p0-route-step',3));
    markGroup(document,'.fm-p0-annotations li',3);
    markGroup(document,'.fm-p0-recovery-row',3);
    markGroup(document,'.fm-p0-arch-main .fm-p0-arch-node',3);
    markGroup(document,'.fm-p0-arch-guardrails>div',9);
  }

  function markP1Sequences(){
    markGroup(document,'.fm-p1-persona-lenses>div',3);
    markGroup(document,'.fm-p1-jtbd-journey li',6);
    markGroup(document,'.fm-p1-auth-frame',3);
    markReveal(document.querySelector('.fm-p1-auth-preserve'),7);
    markGroup(document,'.fm-p1-funnel>div',3);
    markGroup(document,'.fm-p1-funnel-ratios .fm-p1-ratio',6);
    markGroup(document,'.fm-p1-secondary-metrics .fm-p1-ratio',8);
    markGroup(document,'.fm-p1-evidence-grid>.fm-next-cs-card',10);
    markGroup(document,'.fm-p1-release-map>article',3);
  }

  function markFallbackBlocks(){
    storySlides().forEach(slide=>{
      const hasVisual=slide.dataset.p0Visual||slide.dataset.p1Visual;
      if(hasVisual)return;
      const copy=slide.querySelector('.fm-next-story-copy');
      if(!copy)return;
      [...copy.children].forEach((node,index)=>{
        if(node.matches('.fm-next-story-kicker,h2,.fm-next-story-lead'))return;
        markReveal(node,3+index);
      });
    });
  }

  function apply(){
    if(document.documentElement.dataset.fmCaseStudyP2Polish==='true')return true;
    if(document.documentElement.dataset.fmCaseStudyP1Visuals!=='true')return false;
    const slides=storySlides();
    if(!slides.length)return false;

    polishVisualCopy();
    slides.forEach(markSection);
    markP0Sequences();
    markP1Sequences();
    markFallbackBlocks();
    document.documentElement.dataset.fmCaseStudyP2Polish='true';
    return true;
  }

  let tries=0;
  function boot(){
    if(apply())return;
    if(tries++<90)requestAnimationFrame(boot);
  }
  boot();
})();
