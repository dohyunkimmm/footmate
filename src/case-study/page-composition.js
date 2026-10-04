/* FootMate 5.2 · page composition. Existing product facts and evidence stay intact. */
(function(){
  const pages=[
    {title:['내 수준에 맞는 경기부터,','경기 당일과 다음 경기까지.'],desc:'원하는 경기를 찾고, 추천 이유를 확인하고, 참가 이후까지 이어지는 풋살 경험을 설계했습니다.',keywords:['자연어 탐색','추천 근거','경험의 연결'],layout:'cover'},
    {title:'경기 선택에 필요한 근거를 한곳에 모았습니다.',desc:'조건 비교, 추천 이유, 참가 후 안내를 연결해 탐색과 판단의 부담을 줄이는 것을 목표로 했습니다.',keywords:['탐색 부담','판단 근거','다음 행동'],layout:'comparison'},
    {title:'사용자 가설을 화면 요구사항과 관찰 과업으로 옮겼습니다.',desc:'설계용 Persona는 가설로 두고, 구체적인 행동 과업으로 탐색·가입 동선의 막힘과 상태 복귀를 확인했습니다.',keywords:['사용자 가설','판단 기준','과업 관찰'],layout:'persona'},
    {title:'참가와 복구를 먼저, 수익화 검증은 다음으로 뒀습니다.',desc:'사용자의 판단 가치, 실패 영향, 검증 가능성을 기준으로 구현 범위와 우선순위를 정리했습니다.',keywords:['참가 안전성','단계적 확장','범위 선택'],layout:'journey'},
    {title:'추천을 먼저 경험하고, 참가할 때 로그인합니다.',desc:'가입 전에 추천과 상세를 열어 서비스 가치를 먼저 판단하도록 하고, 참가 요청 직전에 인증을 배치했습니다.',keywords:['가입 전 탐색','가치 확인','인증 시점'],layout:'comparison'},
    {title:'반복 입력은 줄이고, 추천 이유는 먼저 보여줍니다.',desc:'저장한 조건은 탐색을 돕는 입력으로 쓰고, 경기 후보·순위·이유는 추천 엔진이 결정하도록 했습니다.',keywords:['선호 조건','설명 가능한 추천','조건 수정'],layout:'product'},
    {title:'경기 상세를 참가 결정의 순서에 맞췄습니다.',desc:'시간·장소부터 추천 이유, 남은 자리, 취소 기준까지 확인하고 참가 여부를 결정하도록 구성했습니다.',keywords:['정보 순서','참가하기','저장·비교'],layout:'product'},
    {title:'로그인 후에도 선택한 경기에서 이어갑니다.',desc:'선택 경기와 복귀 위치를 보존해 같은 결정을 반복하지 않고, 무료 참가 확인과 MY로 연결했습니다.',keywords:['선택 유지','명시적 확인','상태 연결'],layout:'flow'},
    {title:'경기 당일과 경기 후 경험을 MY에 연결했습니다.',desc:'참가 예정, 이동·체크인, 경기 후 피드백까지 상태별로 필요한 다음 행동을 안내합니다.',keywords:['경기 당일','체크인','재탐색'],layout:'product'},
    {title:'실패해도 선택을 유지하고, 다음 행동을 안내합니다.',desc:'오류마다 보존할 상태와 재시도·대체 행동을 함께 정의해 처음부터 다시 시작하는 부담을 줄이고자 했습니다.',keywords:['상태 보존','재시도','대체 경로'],layout:'recovery'},
    {title:'AI 해석, 추천 판단, 참가 실행의 책임을 나눴습니다.',desc:'AI는 탐색 조건을 해석하고, 추천 엔진은 경기 순위를 결정하며, 참가 확정은 사용자의 확인으로 남겼습니다.',keywords:['조건 해석','추천 엔진','사용자 확인'],layout:'architecture'},
    {title:'사용자 성과와 제품 동작 검증을 구분했습니다.',desc:'KPI는 측정 기준으로 정의하고, 자동 QA·사람 검수·AI 보조 검토는 제품 동작을 확인하는 근거로 분리했습니다.',keywords:['측정 기준','검증 근거','미측정 성과'],layout:'validation'},
    {title:'구현한 범위와 앞으로 검증할 가치를 정리했습니다.',desc:'Real App과 Closed Beta의 연결 범위를 구분하고, 실제 이용 지표와 수익성은 다음 검증 과제로 남겼습니다.',keywords:['구현 범위','운영 검증','다음 과제'],layout:'release'}
  ];

  function apply(){
    const html=document.documentElement;
    if(html.dataset.fmPageComposition==='true')return true;
    if(html.dataset.fmCaseStudyAdvancedPolish!=='true'||
       html.dataset.fmCaseStudyProductEvidence!=='true'||
       html.dataset.fmP1RealPreview!=='true'||
       html.dataset.fmCaseStudyCompletionPolish!=='true'||
       html.dataset.footmateCaseStudySectionLabelLanguage!=='en')return false;
    const slides=[...document.querySelectorAll('.track>.slide')];
    if(slides.length!==pages.length)return false;
    slides.forEach((slide,index)=>{
      const page=pages[index];
      slide.dataset.pageLayout=page.layout;
      slide.dataset.pageNumber=String(index+1);
      const title=slide.querySelector(index===0?'h1':'.fm-next-story h2');
      if(title){
        title.replaceChildren();
        (Array.isArray(page.title)?page.title:[page.title]).forEach(text=>{
          const line=document.createElement('span');
          line.className=index===0?'fm-next-cover-title-line':'fm-page-title-line';
          line.textContent=text;
          title.appendChild(line);
        });
      }
      const lead=slide.querySelector(index===0?'.fm-next-cover-lead':'.fm-next-story-lead');
      if(lead)lead.textContent=page.desc;
      const kicker=slide.querySelector(index===0?'.fm-next-cover-kicker':'.fm-next-story-kicker');
      if(kicker){
        const keywords=document.createElement('div');
        keywords.className='fm-page-keywords';
        keywords.setAttribute('aria-label','핵심 키워드');
        page.keywords.forEach(text=>{
          const item=document.createElement('span');item.textContent=text;keywords.appendChild(item);
        });
        kicker.insertAdjacentElement('afterend',keywords);
      }
      slide.querySelectorAll('.fm-next-cs-card').forEach(card=>{
        const title=card.querySelector('h3');const description=card.querySelector('p');
        if(title)title.classList.add('fm-page-card-title');
        if(description)description.classList.add('fm-page-card-description');
      });
    });
    // Keep product interpretation alongside the screen rather than below another full row.
    [5,8].forEach(index=>{
      const slide=slides[index];
      const annotations=slide.querySelector(index===5?'.fm-p0-annotations':'.fm-next-cs-day-states');
      const aside=slide.querySelector('.fm-next-story-aside');
      if(!annotations||!aside)return;
      const notes=document.createElement('div');notes.className='fm-page-product-notes';
      annotations.parentNode.insertBefore(notes,annotations);
      notes.appendChild(annotations);
      [...aside.children].forEach(child=>notes.appendChild(child));
      aside.remove();
    });
    const coverNote=slides[0].querySelector('.fm-next-cover-note');
    if(coverNote)coverNote.innerHTML='<strong>최신 Real App 홈 프리뷰</strong><span>자연어 탐색에서 추천 확인까지, 홈 구조를 정적으로 재현했습니다.</span>';
    // Source images are existing, versioned visual baselines, not newly captured live screens.
    document.querySelectorAll('.fm-evidence-figure:not(.is-recovery) figcaption span').forEach(node=>{
      node.textContent='제품 화면 · 기존 시각 기준';
    });
    document.querySelectorAll('.fm-evidence-figure.is-detail,.fm-evidence-figure.is-operations').forEach(node=>{
      node.dataset.screenFormat='portrait';
    });
    html.dataset.fmPageComposition='true';
    html.dataset.footmateCaseStudyRelease='5.2.0';
    // Desktop is a fixed slide: fit the complete composition inside the viewport.
    const fitSlides=()=>{
      const desktop=window.matchMedia('(min-width:901px)').matches;
      slides.forEach(slide=>{
        const content=slide.querySelector('.fm-next-story,.fm-next-cover');
        if(!content)return;
        content.style.zoom='';
        if(!desktop)return;
        const style=getComputedStyle(slide);
        const available=slide.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
        const height=content.getBoundingClientRect().height;
        if(height>available&&available>0)content.style.zoom=String(Math.min(1,(available-2)/height));
        slide.scrollTop=0;
      });
    };
    let frame;
    const scheduleFit=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(fitSlides);};
    window.addEventListener('resize',scheduleFit);
    document.querySelectorAll('img').forEach(img=>img.addEventListener('load',scheduleFit));
    if(document.fonts)document.fonts.ready.then(scheduleFit);
    scheduleFit();
    return true;
  }
  if(!apply()){
    let tries=0;
    const timer=setInterval(()=>{if(apply()||++tries>240)clearInterval(timer);},25);
  }
})();
