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
      closing.setAttribute('aria-label','Case Study 핵심 Learning');
      closing.innerHTML=`
        <span>KEY LEARNING · 다음 검증으로 연결</span>
        <dl class="fm-cs-reasons">
          <div><dt>배운 점</dt><dd>연결 성공 + 실패·중복·상태 갱신까지 함께 정의</dd></div>
        </dl>`;
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
      '설계 가설 · 사용자 조사·경쟁사 우위 미입증 · Beta 확인'
    );

    const authScope=auth.querySelector('.fm-next-cs-scope');
    setReasonValue(authScope,'Closed Beta','Supabase 계정·참가 흐름 실연동');
    setReasonValue(authScope,'검증 범위','Google/Kakao OAuth Production 확인 · 실제 PG 후속 범위');

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
