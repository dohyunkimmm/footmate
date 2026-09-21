(function(){
  const slides=[...document.querySelectorAll('.track .slide')];
  const toc=[...document.querySelectorAll('.toc-item')];
  const dots=[...document.querySelectorAll('.dot')];
  const prev=document.querySelector('.btn-prev');
  const next=document.querySelector('.btn-next');
  const count=document.querySelector('.topbar-count');
  const bar=document.querySelector('.pbar-fill');
  const focusableSelector='a[href],button,input,select,textarea,iframe,[tabindex]';
  let current=0;

  function clamp(value){return Math.max(0,Math.min(slides.length-1,value))}

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
    if(!slides.length)return;
    current=clamp(Number(index)||0);
    slides.forEach((slide,i)=>setSlideInteractive(slide,i===current));
    toc.forEach((item,i)=>{item.classList.toggle('on',i===current);item.setAttribute('aria-current',i===current?'step':'false')});
    dots.forEach((dot,i)=>dot.classList.toggle('on',i===current));
    if(prev)prev.disabled=current===0;
    if(next)next.disabled=current===slides.length-1;
    if(count)count.textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    if(bar)bar.style.width=`${((current+1)/slides.length)*100}%`;
  }

  function isEditingTarget(target){
    if(!(target instanceof HTMLElement))return false;
    if(target.isContentEditable)return true;
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))return true;
    return target.getAttribute('role')==='textbox';
  }

  window.goTo=goTo;
  document.documentElement.dataset.fmNextCaseStudy='true';
  toc.forEach((item,i)=>item.addEventListener('click',()=>goTo(i)));
  dots.forEach((item,i)=>item.addEventListener('click',()=>goTo(i)));
  prev?.addEventListener('click',()=>goTo(current-1));
  next?.addEventListener('click',()=>goTo(current+1));
  document.addEventListener('keydown',event=>{
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
  });
  goTo(0);
})();
