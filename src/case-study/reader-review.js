(function(){
  function install(){
    if(document.documentElement.dataset.fmEvidenceDetails!=='true'||document.documentElement.dataset.fmPageUpgrades!=='true')return false;
    const cover=document.querySelector('.fm-next-cover-flow');
    if(!cover)return false;
    const detail=document.querySelector('.fm-evidence-detail-layout');
    const focus=detail?.querySelector('.fm-next-cs-detail-order .fm-focus-detail');
    if(focus)detail.insertBefore(focus,detail.firstChild);
    const problem=document.querySelector('.fm-p0-problem-map');
    const problemContext=document.querySelector('.fm-next-story-slide[data-page-number="2"] .fm-next-story-aside');
    if(problem&&problemContext){problemContext.classList.add('fm-reader-problem-context');problem.appendChild(problemContext);}
    const architecture=document.querySelector('.fm-p0-architecture');
    const boundary=document.querySelector('.fm-next-story-slide[data-page-number="11"] .fm-next-story-aside .fm-next-cs-note');
    if(architecture&&boundary){
      boundary.classList.add('fm-reader-boundary-context');
      architecture.parentElement.appendChild(boundary);
      const example=architecture.closest('.fm-next-story')?.querySelector(':scope>.fm-page-upgrade-open');
      if(example)boundary.appendChild(example);
    }
    const alternatives=problem?.closest('.fm-next-story')?.querySelector(':scope>.fm-page-upgrade-open');
    if(alternatives&&problemContext)problemContext.appendChild(alternatives);
    const metricsSlide=document.querySelector('.fm-next-story-slide[data-page-number="12"]');
    const metricsNote=metricsSlide?.querySelector('.fm-next-story-aside .fm-p1-validation-note');
    const metricActions=metricsSlide?.querySelector('.fm-next-kpi-disclosure-row');
    if(metricsNote&&metricActions)metricActions.appendChild(metricsNote);
    const learningTitle=document.querySelector('.fm-next-story-slide[data-page-number="13"] h2 .fm-page-title-line');
    if(learningTitle)learningTitle.textContent='설계 학습과 다음 검증 기준을 정리했습니다.';
    const next=document.querySelector('.fm-p1-release-next');
    const nextRecord=next?.querySelector('dl');
    const nextButton=next?.querySelector('[data-page-upgrade="next"]');
    if(nextRecord&&nextButton){
      const summary=document.createElement('p');summary.className='fm-reader-next-summary';
      summary.textContent='경기 비교 · 실패 후 재시도 · 평가 후 재탐색';
      nextRecord.replaceWith(summary);
      const learningProof=document.querySelector('.fm-p1-release-map .fm-proof-link');
      if(learningProof)next.insertBefore(learningProof,nextButton);
      nextButton.addEventListener('click',()=>{
        const content=document.querySelector('#fm-page-upgrade-dialog .fm-improvement-content');
        if(content&&!content.querySelector('.fm-reader-next-record')){
          const record=nextRecord.cloneNode(true);record.classList.add('fm-reader-next-record');content.appendChild(record);
        }
      });
    }
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
