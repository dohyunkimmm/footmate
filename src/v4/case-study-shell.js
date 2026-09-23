(function(){
  const prev=document.querySelector('.btn-prev');
  const next=document.querySelector('.btn-next');
  const count=document.querySelector('.topbar-count');
  const bar=document.querySelector('.pbar-fill');
  const focusableSelector='a[href],button,input,select,textarea,iframe,[tabindex]';
  let current=0;

  function allSlides(){return [...document.querySelectorAll('.track .slide')]}
  function slides(){return allSlides().filter(slide=>!slide.hidden&&slide.dataset.csHidden!=='true')}
  function allToc(){return [...document.querySelectorAll('.toc-item')]}
  function toc(){return allToc().filter(item=>!item.hidden&&item.dataset.csHidden!=='true')}
  function allDots(){return [...document.querySelectorAll('.dot')]}
  function dots(){return allDots().filter(dot=>!dot.hidden&&dot.dataset.csHidden!=='true')}
  function clamp(value){return Math.max(0,Math.min(slides().length-1,value))}

  function setSlideInteractive(slide,isActive){
    slide.classList.toggle('on',isActive);
    slide.setAttribute('aria-hidden',isActive?'false':'true');
    slide.querySelectorAll(focusableSelector).forEach(element=>{
      if(isActive){
        if(element.dataset.fmCaseStudyTabindex==='none')element.removeAttribute('tabindex');
        else if(element.dataset.fmCaseStudyTabindex!==undefined)element.setAttribute('tabindex',element.dataset.fmCaseStudyTabindex);
        delete element.dataset.fmCaseStudyTabindex;
        return;
      }
      if(element.dataset.fmCaseStudyTabindex===undefined){
        element.dataset.fmCaseStudyTabindex=element.hasAttribute('tabindex')?element.getAttribute('tabindex'):'none';
      }
      element.setAttribute('tabindex','-1');
    });
  }

  function goTo(index){
    const visibleSlides=slides();
    if(!visibleSlides.length)return;
    current=clamp(Number(index)||0);
    const activeSlide=visibleSlides[current];
    allSlides().forEach(slide=>setSlideInteractive(slide,slide===activeSlide));
    const visibleToc=toc();
    allToc().forEach(item=>{item.classList.remove('on');item.setAttribute('aria-current','false')});
    visibleToc.forEach((item,i)=>{
      const active=i===current;
      item.classList.toggle('on',active);
      item.setAttribute('aria-current',active?'step':'false');
    });
    const visibleDots=dots();
    allDots().forEach(dot=>dot.classList.remove('on'));
    visibleDots.forEach((dot,i)=>dot.classList.toggle('on',i===current));
    if(prev)prev.disabled=current===0;
    if(next)next.disabled=current===visibleSlides.length-1;
    if(count)count.textContent=`${String(current+1).padStart(2,'0')} / ${String(visibleSlides.length).padStart(2,'0')}`;
    if(bar)bar.style.width=`${((current+1)/visibleSlides.length)*100}%`;
  }

  function isEditingTarget(target){
    if(!target)return false;
    if(target.isContentEditable)return true;
    const tag=String(target.tagName||'').toUpperCase();
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag))return true;
    return typeof target.getAttribute==='function'&&target.getAttribute('role')==='textbox';
  }

  function handleKeydown(event){
    if(event.isComposing||event.altKey||event.ctrlKey||event.metaKey)return;
    if(isEditingTarget(event.target))return;
    if(event.key==='ArrowRight'||event.key==='PageDown'){
      event.preventDefault();
      goTo(current+1);
      return;
    }
    if(event.key==='ArrowLeft'||event.key==='PageUp'){
      event.preventDefault();
      goTo(current-1);
    }
  }

  const boundFrames=new WeakSet();
  function bindFrameKeyboard(){
    document.querySelectorAll('.fm-next-cover-frame iframe').forEach(frame=>{
      const bind=()=>{
        try{
          const frameWindow=frame.contentWindow;
          if(!frameWindow||boundFrames.has(frameWindow))return;
          frameWindow.addEventListener('keydown',handleKeydown,{capture:true});
          boundFrames.add(frameWindow);
        }catch(_error){}
      };
      bind();
      frame.addEventListener('load',bind,{once:false});
    });
  }

  function injectStoryAlignment(){
    if(document.getElementById('fm-case-study-shell-alignment'))return;
    const style=document.createElement('style');
    style.id='fm-case-study-shell-alignment';
    style.textContent=`
      @media(min-width:901px){
        html[data-fm-next-case-study="true"] .fm-next-story-slide{padding-top:92px!important;padding-bottom:58px!important}
      }
      @media(min-width:901px) and (max-height:820px){
        html[data-fm-next-case-study="true"] .fm-next-story-slide{padding-top:76px!important;padding-bottom:48px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function pruneMergedNodes(){
    if(document.documentElement.dataset.footmateCaseStudySections!=='13')return;
    document.querySelectorAll('.track .slide[data-cs-hidden="true"],.toc-item[data-cs-hidden="true"],.dot[data-cs-hidden="true"]').forEach(node=>node.remove());
  }

  function refresh(){
    pruneMergedNodes();
    current=clamp(current);
    goTo(current);
    bindFrameKeyboard();
  }

  window.goTo=goTo;
  window.refreshCaseStudyNavigation=refresh;
  document.documentElement.dataset.fmNextCaseStudy='true';
  injectStoryAlignment();

  document.addEventListener('click',event=>{
    const tocItem=event.target.closest?.('.toc-item');
    if(tocItem&&!tocItem.hidden){
      const index=toc().indexOf(tocItem);
      if(index>=0)goTo(index);
      return;
    }
    const dot=event.target.closest?.('.dot');
    if(dot&&!dot.hidden){
      const index=dots().indexOf(dot);
      if(index>=0)goTo(index);
    }
  });
  prev?.addEventListener('click',()=>goTo(current-1));
  next?.addEventListener('click',()=>goTo(current+1));
  window.addEventListener('keydown',handleKeydown,{capture:true});

  const observer=new MutationObserver(()=>bindFrameKeyboard());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  goTo(0);
})();
