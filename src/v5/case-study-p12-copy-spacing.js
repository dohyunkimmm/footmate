/* FootMate Case Study · copy cleanup + P12 evidence-card rhythm
   Scope: reader-facing Case Study copy only. Product runtime and metric definitions remain unchanged. */
(function(){
  function setReasonValue(root,label,value){
    const row=[...(root?.querySelectorAll('.fm-cs-reasons>div')||[])].find(node=>node.querySelector('dt')?.textContent.trim()===label);
    const valueNode=row?.querySelector('dd');
    if(valueNode)valueNode.textContent=value;
  }

  function ensureReleaseClosing(release){
    const map=release?.querySelector('.fm-p1-release-map');
    if(!release||!map)return false;

    let closing=release.querySelector('.fm-p1-release-next');
    if(!closing){
      closing=document.createElement('div');
      closing.className='fm-next-cs-final fm-p1-release-next';
      closing.setAttribute('aria-label','Case Study 핵심 Learning과 Real App 이동');
      closing.innerHTML=`
        <span>KEY LEARNING · 다음 검증으로 연결</span>
        <dl class="fm-cs-reasons">
          <div><dt>배운 점</dt><dd>연결 성공뿐 아니라 실패·중복·상태 갱신을 함께 정의해야 운영 흐름이 이어집니다.</dd></div>
        </dl>
        <a href="/app" target="_blank" rel="noopener">FootMate 앱 보기 ↗</a>`;
      map.insertAdjacentElement('afterend',closing);
    }
    return closing.isConnected;
  }

  function apply(){
    if(document.documentElement.dataset.fmCaseStudyP12CopySpacing==='true')return true;
    if(document.documentElement.dataset.footmateCaseStudyFinalClarity!=='1')return false;
    if(document.documentElement.dataset.fmCaseStudyP1Visuals!=='true')return false;

    const slides=[...document.querySelectorAll('html[data-fm-next-case-study="true"] .slide:not([hidden])')];
    if(slides.length!==13)return false;

    const problem=slides[1];
    const auth=slides[7];
    const validation=slides[11];
    const release=slides[12];
    const lead=validation?.querySelector('.fm-next-story-lead');
    const releaseLead=release?.querySelector('.fm-next-story-lead');
    const banner=validation?.querySelector('.fm-p1-validation-banner');
    const evidence=validation?.querySelector('.fm-p1-evidence-grid');
    if(!problem||!auth||!validation||!release||!lead||!releaseLead||!banner||!evidence)return false;

    setReasonValue(
      problem.querySelector('.fm-next-cs-quote'),
      '검증 범위',
      '설계 가설 단계이며, 사용자 조사와 경쟁사 대비 우위는 Beta에서 확인합니다.'
    );

    const authScope=auth.querySelector('.fm-next-cs-scope');
    setReasonValue(authScope,'Closed Beta','Supabase 계정과 참가 흐름을 실제로 연동했습니다.');
    setReasonValue(authScope,'검증 범위','Google/Kakao OAuth는 Production에서 확인했고, 실제 PG 연동은 후속 범위입니다.');

    lead.textContent='아래 지표는 Beta에서 관찰할 Validation Metric으로, 아직 측정된 성과값이 아닙니다.';
    releaseLead.textContent='핵심 연결과 사용자 확인을 마치고, KPI·결제·수익성은 후속 검증으로 남겼습니다.';

    const bannerTitle=banner.querySelector('b');
    const bannerCopy=banner.querySelector('p');
    if(bannerTitle)bannerTitle.textContent='측정 전 기준 정의';
    if(bannerCopy)bannerCopy.textContent='목표치보다 분자 · 분모 · 제외 조건 · 기준값을 먼저 정의';

    if(!ensureReleaseClosing(release))return false;

    document.documentElement.dataset.fmCaseStudyP12CopySpacing='true';
    document.documentElement.dataset.fmCaseStudyCompletionPolish='true';
    return true;
  }

  if(!apply()){
    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(apply()||tries>1200)clearInterval(timer);
    },25);
  }
})();

/* Late-bound presentation loader keeps the base Case Study bundle stable while allowing
   the final portfolio-only polish to load after all structural patches are available. */
(function(){
  if(!document.querySelector('link[data-fm-advanced-polish]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/src/v5/case-study-advanced-polish.css?v=1';
    link.dataset.fmAdvancedPolish='true';
    document.head.appendChild(link);
  }
  if(!document.querySelector('script[data-fm-advanced-polish]')){
    const script=document.createElement('script');
    script.src='/src/v5/case-study-advanced-polish.js?v=1';
    script.defer=true;
    script.dataset.fmAdvancedPolish='true';
    document.body.appendChild(script);
  }
})();

/* Detail-finish stylesheet intentionally loads after the advanced polish so its token pass
   can stay presentation-only and win without increasing specificity across legacy layers. */
(function(){
  const existing=document.querySelector('link[data-fm-detail-finish]');
  if(existing){
    if(existing.sheet)document.documentElement.dataset.fmCaseStudyDetailFinish='true';
    else existing.addEventListener('load',()=>{document.documentElement.dataset.fmCaseStudyDetailFinish='true';},{once:true});
    return;
  }
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/src/v5/case-study-detail-finish.css?v=1';
  link.dataset.fmDetailFinish='true';
  link.addEventListener('load',()=>{document.documentElement.dataset.fmCaseStudyDetailFinish='true';},{once:true});
  document.head.appendChild(link);
})();
