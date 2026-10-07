(function(){
  function install(){
    if(document.documentElement.dataset.fmEvidenceDetails!=='true'||document.documentElement.dataset.fmPageUpgrades!=='true')return false;
    const cover=document.querySelector('.fm-next-cover-flow');
    if(!cover)return false;
    if(!document.querySelector('.fm-reader-guide')){
      const guide=document.createElement('p');guide.className='fm-reader-guide';
      const desktop=document.createElement('span');desktop.className='fm-reader-guide-desktop';
      desktop.textContent='13개 섹션 · 왼쪽 목차 또는 아래 이전·다음 버튼으로 이동하고, 긴 내용은 아래로 스크롤해 읽어보세요.';
      const mobile=document.createElement('span');mobile.className='fm-reader-guide-mobile';
      mobile.textContent='아래로 스크롤하며 13개 섹션을 읽어보세요.';
      guide.append(desktop,mobile);cover.before(guide);
    }
    const dots=document.querySelector('.dots');
    if(dots&&!document.querySelector('.fm-reader-progress')){
      const progress=document.createElement('div');progress.className='fm-reader-progress';
      const position=document.createElement('span');position.className='fm-reader-position';
      dots.before(progress);progress.append(position,dots);
    }
    document.documentElement.dataset.fmReaderReview='true';
    window.refreshCaseStudyNavigation?.();
    return true;
  }
  if(!install()){
    let tries=0;const timer=setInterval(()=>{if(install()||++tries>1200)clearInterval(timer)},25);
  }
})();
