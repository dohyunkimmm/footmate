(function(){
  const prev=document.querySelector('.btn-prev');
  const next=document.querySelector('.btn-next');
  const count=document.querySelector('.topbar-count');
  const bar=document.querySelector('.pbar-fill');
  const focusableSelector='a[href],button,input,select,textarea,iframe,[tabindex]';
  let current=0;
  let scrollResetEpoch=0;
  let scrollResetTimer;
  function cancelScrollReset(){scrollResetEpoch+=1;clearTimeout(scrollResetTimer);}

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

  function sectionFromUrl(){
    const match=location.hash.match(/^#section-(\d{1,2})$/);
    return match?clamp(Number(match[1])-1):0;
  }

  function syncSectionUrl(mode){
    const hash='#section-'+String(current+1).padStart(2,'0');
    if(location.hash===hash)return;
    const method=mode==='push'?'pushState':'replaceState';
    const state=history.state&&typeof history.state==='object'?history.state:{};
    history[method]({...state,fmCaseStudySection:current+1},'',location.pathname+location.search+hash);
  }

  function goTo(index,options={}){
    const visibleSlides=slides();
    if(!visibleSlides.length)return;
    const nextIndex=clamp(Number(index)||0);
    const changed=nextIndex!==current;
    current=nextIndex;
    const activeSlide=visibleSlides[current];
    if(changed){
      activeSlide.scrollTop=0;
    }
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
    const position=document.querySelector('.fm-reader-position');
    const sectionName=visibleToc[current]?.querySelector('.toc-t')?.textContent?.trim()||'';
    if(position)position.textContent=`${String(current+1).padStart(2,'0')} / ${String(visibleSlides.length).padStart(2,'0')} · ${sectionName}`;
    visibleDots.forEach((dot,i)=>{
      const name=visibleToc[i]?.querySelector('.toc-t')?.textContent?.trim()||'';
      dot.setAttribute('aria-label',`${i+1}번 섹션 · ${name}`);
      dot.setAttribute('aria-current',i===current?'step':'false');
      dot.title=`${String(i+1).padStart(2,'0')} · ${name}`;
    });
    if(options.history!==false)syncSectionUrl(options.history||'push');
    if(changed){
      // Reset after the newly active section determines document height.
      cancelScrollReset();
      const epoch=scrollResetEpoch;
      const reset=()=>{if(current===nextIndex&&scrollResetEpoch===epoch)window.scrollTo({top:0,left:0,behavior:'instant'});};
      window.scrollTo({top:0,left:0,behavior:'instant'});
      requestAnimationFrame(()=>{
        if(current!==nextIndex||scrollResetEpoch!==epoch)return;
        reset();
        // The composition observer fits the new section on the following frame.
        requestAnimationFrame(reset);
      });
      // A native PageDown already in flight can finish after the layout frames.
      // Fresh reading input cancels this final reset instead of losing its scroll.
      scrollResetTimer=setTimeout(reset,250);
    }
  }

  function isEditingTarget(target){
    if(!target)return false;
    if(target.isContentEditable)return true;
    const tag=String(target.tagName||'').toUpperCase();
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag))return true;
    return typeof target.getAttribute==='function'&&target.getAttribute('role')==='textbox';
  }

  function handleKeydown(event){
    if(document.querySelector('dialog[open]'))return;
    if(event.isComposing||event.altKey||event.ctrlKey||event.metaKey)return;
    if(isEditingTarget(event.target))return;
    // Local examples own their arrow keys; reading controls still move between sections.
    const group=event.target.closest?.('.fm-mock-presets,.fm-recovery-actions');
    if(group&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
      const buttons=[...group.querySelectorAll('button:not(:disabled)')];
      if(!buttons.length)return;
      const index=buttons.indexOf(event.target.closest('button'));
      const target=event.key==='Home'?0:event.key==='End'?buttons.length-1:
        (index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
      event.preventDefault();
      buttons[target].focus({preventScroll:true});
      if(group.classList.contains('fm-mock-presets'))buttons[target].click();
      return;
    }
    if(event.target.closest?.('.slide a,.slide button,.slide summary,.fm-next-cover-frame'))return;
    // PageUp/PageDown scroll the shared document; arrows move between sections.
    if(['PageDown','PageUp'].includes(event.key))return;
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

  function refresh(){
    current=clamp(current);
    goTo(current,{history:'replace'});
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
  window.addEventListener('wheel',cancelScrollReset,{capture:true,passive:true});
  window.addEventListener('touchstart',cancelScrollReset,{capture:true,passive:true});
  window.addEventListener('keydown',event=>{
    if(['PageDown','PageUp','ArrowDown','ArrowUp',' '].includes(event.key))cancelScrollReset();
  },{capture:true});

  const observer=new MutationObserver(()=>bindFrameKeyboard());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  const restore=()=>goTo(sectionFromUrl(),{history:'replace'});
  window.addEventListener('popstate',restore);
  window.addEventListener('hashchange',restore);
  // A reload starts the case study at Overview; direct links and history keep their section.
  const isReload=performance.getEntriesByType('navigation')[0]?.type==='reload';
  if(isReload)history.scrollRestoration='manual';
  goTo(isReload?0:sectionFromUrl(),{history:'replace'});
  if(isReload){
    window.scrollTo({top:0,left:0,behavior:'instant'});
    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
  }
})();
