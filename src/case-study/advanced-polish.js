/* FootMate Case Study · advanced portfolio polish
   Presentation-only enhancements: Korean micro labels, evidence scale metadata,
   contextual previous/next labels, and a clearer final CTA. */
(function(){
  const ROOT='html[data-fm-next-case-study="true"]';
  const sectionNames=['개요','문제','Persona','우선순위','Guest First','추천','상세','로그인·참가','운영','복구','Domain·AI','KPI·검증','Release·회고'];

  function visibleToc(){
    return [...document.querySelectorAll('.toc-item')].filter(item=>!item.hidden&&item.dataset.csHidden!=='true');
  }

  function setText(node,text){
    if(node)node.textContent=text;
  }

  function translateMicroLabels(){
    const archMap={
      INPUT:'입력',AI:'AI 해석',CONTRACT:'구조화 조건',RECOMMENDATION:'추천 엔진',OUTPUT:'추천 결과',HITL:'사용자 확인'
    };
    document.querySelectorAll(`${ROOT} .fm-p0-arch-node small`).forEach(node=>{
      const key=(node.textContent||'').trim().toUpperCase();
      if(archMap[key])node.textContent=archMap[key];
    });

    const priorityMap={
      'NOW · 먼저 검증':'현재 · 먼저 검증',
      'NEXT · 확장 검증':'다음 · 확장 검증',
      'OUT · 이번 범위 제외':'제외 · 이번 범위'
    };
    document.querySelectorAll(`${ROOT} .fm-p0-priority-label`).forEach(node=>{
      const key=(node.textContent||'').trim();
      if(priorityMap[key])node.textContent=priorityMap[key];
    });

    const jtbdMap={
      SITUATION:'상황',DECISION:'판단',JOB:'과업','OBSERVE IN BETA':'Beta 관찰'
    };
    document.querySelectorAll(`${ROOT} .fm-p1-jtbd-journey li small`).forEach(node=>{
      const key=(node.textContent||'').trim().toUpperCase();
      if(jtbdMap[key])node.textContent=jtbdMap[key];
    });

    setText(document.querySelector(`${ROOT} .fm-p1-auth-preserve small`),'상태 보존');
    setText(document.querySelector(`${ROOT} .fm-p1-validation-banner>span`),'검증 지표');

    const funnelMap={DISCOVERY:'탐색',DETAIL:'상세',JOIN:'참가'};
    document.querySelectorAll(`${ROOT} .fm-p1-funnel small`).forEach(node=>{
      const raw=(node.textContent||'').trim();
      const match=raw.match(/^(\d+)\s*·\s*(.+)$/);
      if(!match)return;
      const translated=funnelMap[match[2].toUpperCase()];
      if(translated)node.textContent=`${match[1]} · ${translated}`;
    });

    const evidenceMap={
      'AUTOMATED QA':'자동 QA',
      'HUMAN CHECK':'사람 검수',
      'AI-ASSISTED REVIEW':'AI 보조 검수'
    };
    document.querySelectorAll(`${ROOT} .fm-p1-evidence-label`).forEach(node=>{
      const key=(node.textContent||'').trim().toUpperCase();
      if(evidenceMap[key])node.textContent=evidenceMap[key];
    });

    document.querySelectorAll(`${ROOT} .fm-p1-release-map [data-zone="open-boundary"] header small`).forEach(node=>{
      node.textContent='미연동 · 미검증';
    });

    const finalLabel=document.querySelector(`${ROOT} .fm-p1-release-next>span`);
    if(finalLabel)finalLabel.textContent='핵심 학습 · 다음 검증으로 연결';
    const finalLink=document.querySelector(`${ROOT} .fm-p1-release-next>a`);
    if(finalLink)finalLink.textContent='Real App에서 흐름 확인 ↗';
  }

  function markEvidenceScale(){
    const targets=[
      ['.fm-evidence-figure.is-recommendation','primary'],
      ['.fm-evidence-figure.is-detail','primary'],
      ['.fm-evidence-figure.is-operations','primary']
    ];
    let marked=0;
    for(const [selector,scale] of targets){
      const node=document.querySelector(`${ROOT} ${selector}`);
      if(!node)continue;
      node.setAttribute('data-evidence-scale',scale);
      marked+=1;
    }
    return marked;
  }

  function wireEvidenceScale(){
    const track=document.querySelector('.track');
    const sync=()=>markEvidenceScale();
    if(sync()===3)return;
    if(!track)return;

    const observer=new MutationObserver(()=>{
      if(sync()===3)observer.disconnect();
    });
    observer.observe(track,{childList:true,subtree:true});

    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(sync()===3||tries>240){
        clearInterval(timer);
        observer.disconnect();
      }
    },25);
  }

  function updateNavigationLabels(){
    const toc=visibleToc();
    const current=Math.max(0,toc.findIndex(item=>item.classList.contains('on')));
    const prev=document.querySelector('.btn-prev');
    const next=document.querySelector('.btn-next');
    const prevText=current>0?`이전 · ${sectionNames[current-1]}`:'첫 섹션';
    const nextText=current<sectionNames.length-1?`다음 · ${sectionNames[current+1]}`:'마지막 섹션';
    if(prev){
      prev.dataset.navLabel=prevText;
      prev.setAttribute('aria-label',prevText);
    }
    if(next){
      next.dataset.navLabel=nextText;
      next.setAttribute('aria-label',nextText);
    }
  }

  function wireNavigation(){
    const controls=document.querySelector('.cs-controls');
    const toc=document.querySelector('.toc');
    const refresh=()=>requestAnimationFrame(updateNavigationLabels);
    controls?.addEventListener('click',refresh);
    toc?.addEventListener('click',refresh);
    document.addEventListener('keydown',event=>{
      if(['ArrowLeft','ArrowRight','PageUp','PageDown','Home','End'].includes(event.key))refresh();
    });
    const count=document.querySelector('.topbar-count');
    if(count)new MutationObserver(refresh).observe(count,{childList:true,characterData:true,subtree:true});
    updateNavigationLabels();
  }

  function apply(){
    const html=document.documentElement;
    if(html.dataset.fmCaseStudyAdvancedPolish==='true')return true;
    if(html.dataset.fmCaseStudyP1Visuals!=='true')return false;
    const slides=[...document.querySelectorAll(`${ROOT} .slide:not([hidden])`)];
    if(slides.length!==13)return false;

    translateMicroLabels();
    wireEvidenceScale();
    wireNavigation();
    html.dataset.fmCaseStudyAdvancedPolish='true';
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
