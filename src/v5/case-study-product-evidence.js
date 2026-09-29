/* FootMate Case Study · product evidence visual upgrade
   Adds verified product visual-baseline evidence after P2 has settled.
   No new product facts, routes, IA, or runtime behavior. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';
  const ASSET='/src/v5/evidence/';
  const SOURCE='visual-baseline-c718e788';

  function section(role){
    return document.querySelector(`${ROOT} .fm-next-story-slide[data-v5-content-role="${role}"]`);
  }

  function figure(src,label,title,meta,alt,mod){
    const node=document.createElement('figure');
    node.className=`fm-evidence-figure ${mod||''}`.trim();
    node.dataset.evidenceSource=SOURCE;
    node.innerHTML=`
      <div class="fm-evidence-media">
        <span class="fm-evidence-badge">${label}</span>
        <img src="${ASSET}${src}" alt="${alt}" loading="lazy" decoding="async">
      </div>
      <figcaption><b>${title}</b><span>${meta}</span></figcaption>`;
    node.dataset.p2Reveal='true';
    node.style.setProperty('--fm-p2-order','8');
    return node;
  }

  function patchRecommendation(){
    const slide=section('recommendation-decision');
    const stage=slide?.querySelector('.fm-p0-reco-stage');
    if(!slide||!stage)return false;
    if(stage.querySelector('.fm-evidence-figure'))return true;

    stage.replaceChildren(figure(
      'recommendation-home.png',
      'PRODUCT UI',
      '추천 홈',
      'Product visual baseline · 390px',
      'FootMate 추천 홈 제품 화면',
      'is-recommendation'
    ));
    slide.dataset.evidenceUpgrade='recommendation';
    return true;
  }

  function patchDetail(){
    const slide=section('detail-decision');
    const order=slide?.querySelector('.fm-next-cs-detail-order');
    if(!slide||!order)return false;
    if(slide.querySelector('.fm-evidence-detail-layout'))return true;

    const wrap=document.createElement('div');
    wrap.className='fm-evidence-detail-layout';
    order.parentNode.insertBefore(wrap,order);
    wrap.append(
      order,
      figure(
        'decision-detail.png',
        'PRODUCT UI',
        '참가 결정 상세',
        'Product visual baseline · 390px',
        'FootMate 참가 결정 상세 제품 화면',
        'is-detail'
      )
    );
    slide.dataset.evidenceUpgrade='detail';
    return true;
  }

  function patchOperations(){
    const states=document.querySelector(`${ROOT} .fm-next-cs-day-states`);
    const slide=states?.closest('.fm-next-story-slide');
    if(!slide||!states)return false;
    if(slide.querySelector('.fm-evidence-operations-layout'))return true;

    const wrap=document.createElement('div');
    wrap.className='fm-evidence-operations-layout';
    states.parentNode.insertBefore(wrap,states);
    wrap.append(
      states,
      figure(
        'operations-matchday.png',
        'PRODUCT UI',
        '경기 당일 허브',
        'Product visual baseline · 390px',
        'FootMate 경기 당일 허브 제품 화면',
        'is-operations'
      )
    );
    slide.dataset.evidenceUpgrade='operations';
    return true;
  }

  function patchRecovery(){
    const slide=section('recovery-principle');
    const map=slide?.querySelector('.fm-p0-recovery-map')||slide?.querySelector('.fm-next-cs-recovery');
    if(!slide||!map)return false;
    if(slide.querySelector('.fm-evidence-recovery-strip'))return true;

    const strip=document.createElement('div');
    strip.className='fm-evidence-recovery-strip';
    strip.setAttribute('aria-label','제품 복구 및 빈 상태 화면');
    strip.append(
      figure(
        'recovery-discovery-empty.png',
        'EMPTY',
        '탐색 결과 없음',
        'Product visual baseline',
        'FootMate 탐색 결과 없음 제품 화면',
        'is-recovery'
      ),
      figure(
        'recovery-participation-failure.png',
        'FAILURE',
        '참가 실패',
        'Product visual baseline',
        'FootMate 참가 실패 제품 화면',
        'is-recovery'
      ),
      figure(
        'recovery-schedule-empty.png',
        'EMPTY',
        '예정 경기 없음',
        'Product visual baseline',
        'FootMate 예정 경기 없음 제품 화면',
        'is-recovery'
      )
    );
    map.insertAdjacentElement('afterend',strip);
    slide.dataset.evidenceUpgrade='recovery';
    return true;
  }

  function apply(){
    if(document.documentElement.dataset.fmCaseStudyProductEvidence==='true')return true;
    if(document.documentElement.dataset.fmCaseStudyP2Polish!=='true')return false;

    const patched=[
      patchRecommendation(),
      patchDetail(),
      patchOperations(),
      patchRecovery()
    ];
    if(!patched.every(Boolean))return false;

    document.documentElement.dataset.fmCaseStudyProductEvidence='true';
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
