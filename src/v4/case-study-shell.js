(function(){
  const slides=[...document.querySelectorAll('.track .slide')];
  const toc=[...document.querySelectorAll('.toc-item')];
  const dots=[...document.querySelectorAll('.dot')];
  const prev=document.querySelector('.btn-prev');
  const next=document.querySelector('.btn-next');
  const count=document.querySelector('.topbar-count');
  const bar=document.querySelector('.pbar-fill');
  let current=0;
  function clamp(value){return Math.max(0,Math.min(slides.length-1,value))}
  function goTo(index){
    if(!slides.length)return;
    current=clamp(Number(index)||0);
    slides.forEach((slide,i)=>{slide.classList.toggle('on',i===current);slide.setAttribute('aria-hidden',i===current?'false':'true')});
    toc.forEach((item,i)=>{item.classList.toggle('on',i===current);item.setAttribute('aria-current',i===current?'step':'false')});
    dots.forEach((dot,i)=>dot.classList.toggle('on',i===current));
    if(prev)prev.disabled=current===0;
    if(next)next.disabled=current===slides.length-1;
    if(count)count.textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    if(bar)bar.style.width=`${((current+1)/slides.length)*100}%`;
  }
  window.goTo=goTo;
  document.documentElement.dataset.fmNextCaseStudy='true';
  toc.forEach((item,i)=>item.addEventListener('click',()=>goTo(i)));
  dots.forEach((item,i)=>item.addEventListener('click',()=>goTo(i)));
  prev?.addEventListener('click',()=>goTo(current-1));
  next?.addEventListener('click',()=>goTo(current+1));
  document.addEventListener('keydown',event=>{
    if(matchMedia('(max-width:900px)').matches)return;
    if(event.key==='ArrowRight'||event.key==='PageDown')goTo(current+1);
    if(event.key==='ArrowLeft'||event.key==='PageUp')goTo(current-1);
  });
  goTo(0);
})();
