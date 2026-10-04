/* FootMate 5.4 · page composition. Existing product facts and evidence stay intact. */
(function(){
  const pages=[
  {
    "nav": "Overview",
    "navDesc": "Experience & Role",
    "title": [
      "내 수준에 맞는 경기부터,",
      "경기 당일과 다음 경기까지."
    ],
    "desc": "탐색부터 참가 이후까지 이어지는 풋살 경험을 기획하고, 화면·정책·검증 기준을 설계했습니다.",
    "keywords": [
      "자연어 탐색",
      "추천 근거",
      "담당 역할"
    ],
    "layout": "cover"
  },
  {
    "nav": "Problem & Goal",
    "navDesc": "Friction & Design Goal",
    "title": "경기 선택의 불확실성을 줄이는 데 집중했습니다.",
    "desc": "조건을 따로 확인하는 탐색, 이른 로그인, 참가 후 끊기는 안내를 하나의 흐름으로 연결했습니다.",
    "keywords": [
      "정보 분산",
      "판단 부담",
      "경험 단절"
    ],
    "layout": "comparison"
  },
  {
    "nav": "Persona & JTBD",
    "navDesc": "Assumptions & Tasks",
    "title": "사용자 가설을 구체적인 행동 과업으로 바꿨습니다.",
    "desc": "퇴근 후 가까운 경기를 찾는 상황을 가정하고, 선택 기준을 화면 요구사항과 관찰 항목에 연결했습니다.",
    "keywords": [
      "사용자 가설",
      "판단 기준",
      "관찰 과업"
    ],
    "layout": "persona"
  },
  {
    "nav": "Scope & Priorities",
    "navDesc": "Build Now & Validate Next",
    "title": "참가와 복구를 먼저, 확장 검증은 다음으로 뒀습니다.",
    "desc": "판단 가치·실패 영향·검증 가능성으로 구현 순서를 정하고, 수익화와 자동 실행은 범위에서 제외했습니다.",
    "keywords": [
      "참가·복구",
      "구현 우선순위",
      "확장 범위"
    ],
    "layout": "journey"
  },
  {
    "nav": "Guest Exploration",
    "navDesc": "Explore Before Sign-in",
    "title": "가치를 확인한 뒤에 로그인하도록 설계했습니다.",
    "desc": "추천과 상세는 가입 전에 공개하고, 참가 요청 직전에 인증을 배치했습니다.",
    "keywords": [
      "가입 전 탐색",
      "가치 확인",
      "인증 시점"
    ],
    "layout": "comparison"
  },
  {
    "nav": "Recommendations",
    "navDesc": "Preferences & Reasons",
    "title": "추천 결과보다 선택의 이유가 먼저 보이게 했습니다.",
    "desc": "저장된 선호와 최근 이력을 활용하되, 현재 조건과 추천 근거를 확인하고 바꿀 수 있게 했습니다.",
    "keywords": [
      "선호 조건",
      "추천 이유",
      "조건 수정"
    ],
    "layout": "product"
  },
  {
    "nav": "Match Details",
    "navDesc": "Information for Joining",
    "title": "참가 판단에 필요한 순서로 상세를 구성했습니다.",
    "desc": "시간·장소에서 추천 이유, 자리와 준비 정보, 취소 기준으로 이어지며 저장·비교도 지원합니다.",
    "keywords": [
      "참가 판단",
      "정보 순서",
      "저장·비교"
    ],
    "layout": "product"
  },
  {
    "nav": "Sign-in & Join",
    "navDesc": "Preserve Choice & Confirm",
    "title": "인증 과정에서도 선택한 경기를 유지합니다.",
    "desc": "로그인 후 같은 위치로 돌아오고, 참가 확인 결과에 따라 MY 또는 복구 행동으로 연결합니다.",
    "keywords": [
      "선택 유지",
      "참가 확인",
      "결과 안내"
    ],
    "layout": "flow"
  },
  {
    "nav": "Matchday & Return",
    "navDesc": "Prepare, Check In & Return",
    "title": "참가 이후의 다음 행동을 MY에서 안내합니다.",
    "desc": "참가 준비부터 이동·체크인, 경기 후 피드백과 재탐색까지 상태별로 필요한 정보를 제공합니다.",
    "keywords": [
      "참가 준비",
      "체크인",
      "경기 후 재탐색"
    ],
    "layout": "product"
  },
  {
    "nav": "Recovery",
    "navDesc": "Preserve State & Retry",
    "title": "실패해도 선택을 보존하고 다시 이어갑니다.",
    "desc": "추천 없음·자리 마감·참가 오류·당일 문제마다 유지할 상태와 재시도·대체 경로를 정의했습니다.",
    "keywords": [
      "상태 보존",
      "재시도",
      "대체 경로"
    ],
    "layout": "recovery"
  },
  {
    "nav": "AI & Domain Rules",
    "navDesc": "Interpret, Rank & Confirm",
    "title": "해석·추천·확정의 책임을 분리했습니다.",
    "desc": "AI는 조건을 해석하고, 추천 엔진은 순위와 이유를 결정합니다. 참가 확정은 사용자의 확인을 거칩니다.",
    "keywords": [
      "조건 해석",
      "추천 판단",
      "사용자 확인"
    ],
    "layout": "architecture"
  },
  {
    "nav": "Metrics & Validation",
    "navDesc": "Measurement & Verification",
    "title": "동작 검증과 사용자 성과를 구분했습니다.",
    "desc": "KPI의 계산·관찰 기준을 정의하고, 자동 QA·사람 검수·AI 보조 검수는 제품 동작의 근거로 구분했습니다.",
    "keywords": [
      "측정 기준",
      "동작 검증",
      "성과 미측정"
    ],
    "layout": "validation"
  },
  {
    "nav": "Release & Next Steps",
    "navDesc": "Implementation & Limits",
    "title": "구현한 범위와 다음에 검증할 가치를 정리했습니다.",
    "desc": "제품 화면과 Closed Beta의 실제 연결을 구분하고, 이용 지표와 수익성은 후속 검증 과제로 남겼습니다.",
    "keywords": [
      "구현 범위",
      "검증 한계",
      "다음 과제"
    ],
    "layout": "release"
  }
];

  function installEditorialInteractions(slides){
    const desktop=window.matchMedia('(min-width:901px)');
    const disclosures=[];
    // Keep the evidence visible; only supplemental rationale is collapsible on mobile.
    const supplements=[[1,'.fm-next-story-aside','대안과 검증 범위'],[3,'.fm-next-story-aside','우선순위 판단 근거'],[4,'.fm-next-story-aside','인증 시점과 제약'],[5,'.fm-page-product-notes .fm-next-cs-note','추천 설계 원칙'],[7,'.fm-next-story-aside','구현·검증 범위'],[8,'.fm-page-product-notes .fm-next-cs-note','운영 정책과 복구'],[10,'.fm-next-story-aside','연결 범위와 설계 기준']];
    supplements.forEach(([index,selector,text])=>{
      const node=slides[index].querySelector(selector);if(!node)return;
      const details=document.createElement('details');details.className='fm-editorial-supplement';details.open=desktop.matches;
      const summary=document.createElement('summary');summary.textContent=text;
      node.before(details);details.append(summary,node);disclosures.push(details);
    });
    desktop.addEventListener('change',()=>disclosures.forEach(node=>node.open=desktop.matches));
    slides.forEach(slide=>slide.querySelectorAll('details').forEach(node=>node.addEventListener('toggle',()=>window.dispatchEvent(new Event('resize')))));

    const dialog=document.createElement('dialog');dialog.className='fm-screen-dialog';dialog.setAttribute('aria-labelledby','fm-screen-dialog-title');
    dialog.innerHTML='<header><h2 id="fm-screen-dialog-title"></h2><button type="button" class="fm-screen-close" aria-label="화면 확대 닫기">닫기 ×</button></header><div class="fm-screen-tabs" role="group" aria-label="화면 보기 방식"><button type="button" data-screen-mode="full" aria-pressed="true">전체 화면</button><button type="button" data-screen-mode="focus" aria-pressed="false">핵심 영역</button></div><div class="fm-screen-viewport"><img alt=""></div><p class="fm-screen-source">기존 제품 화면 기준 · 실제 운영 화면과 차이가 있을 수 있습니다.</p>';
    document.body.append(dialog);
    const close=()=>dialog.close();dialog.querySelector('.fm-screen-close').addEventListener('click',close);
    dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();}});
    dialog.addEventListener('keydown',event=>{event.stopPropagation();});
    dialog.querySelectorAll('[data-screen-mode]').forEach(button=>button.addEventListener('click',()=>{
      dialog.classList.toggle('is-focus',button.dataset.screenMode==='focus');
      dialog.querySelectorAll('[data-screen-mode]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));
    }));
    [5,6,8].forEach(index=>{
      const figure=slides[index].querySelector('.fm-evidence-figure[data-evidence-scale="primary"]');if(!figure)return;
      const source=figure.querySelector('img');const caption=figure.querySelector('figcaption');
      const button=document.createElement('button');button.type='button';button.className='fm-screen-expand';button.textContent='화면 확대 ↗';button.setAttribute('aria-haspopup','dialog');
      button.addEventListener('click',()=>{
        dialog.querySelector('h2').textContent=caption.querySelector('b')?.textContent||'제품 화면';
        const image=dialog.querySelector('img');image.src=source.currentSrc||source.src;image.alt=source.alt;
        dialog.classList.remove('is-focus');dialog.querySelectorAll('[data-screen-mode]').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.screenMode==='full')));
        dialog.showModal();
      });caption.append(button);
    });
  }

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
      const toc=document.querySelectorAll('.toc-item')[index];
      if(toc){toc.querySelector('.toc-t').textContent=page.nav;toc.querySelector('.toc-s').textContent=page.navDesc;toc.setAttribute('aria-label',String(index+1).padStart(2,'0')+' · '+page.nav+' · '+page.navDesc);}
      const label=slide.querySelector(index===0?'.fm-next-cover-kicker':'.fm-next-story-kicker');
      if(label)label.textContent=index===0?page.nav:String(index+1).padStart(2,'0')+' · '+page.nav;
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
        (lead||title||kicker).insertAdjacentElement('afterend',keywords);
      }
      slide.querySelectorAll('.fm-next-cs-card').forEach(card=>{
        const title=card.querySelector('h3');const description=card.querySelector('p');
        if(title)title.classList.add('fm-page-card-title');
        if(description)description.classList.add('fm-page-card-description');
      });
    });
    // Card headings explain what is checked; labels identify the method.
    const cardCopy=[
      [3,0,'안전한 참가 흐름','조건 확인 · 선택 맥락 보존 · 무료 Beta의 인증·정원·취소·체크인·복구'],
      [3,1,'경기 이후의 재이용','대기열·알림·피드백으로 자리 회복과 재이용 연결 · 전환·반복 이용은 후속 지표'],
      [3,2,'현재 범위에서 제외','실제 PG · 수익화 검증 · AI 자동 실행 제외 · 참가 확정은 사용자 최종 확인'],
      [11,0,'자동화된 동작 확인',null],
      [11,1,'실제 연결과 표시 확인',null],
      [11,2,'설명과 구현의 일치 검토',null]
    ];
    cardCopy.forEach(([page,index,title,desc])=>{const card=slides[page].querySelectorAll('.fm-next-cs-card')[index];if(!card)return;card.querySelector('h3').textContent=title;if(desc)card.querySelector('p').textContent=desc;});
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
    installEditorialInteractions(slides);
    html.dataset.fmPageComposition='true';
    html.dataset.footmateCaseStudyRelease='5.4.0';
    // Desktop is a fixed slide: fit the complete composition inside the viewport.
    const fitSlides=()=>{
      const desktop=window.matchMedia('(min-width:901px)').matches;
      slides.forEach(slide=>{
        const content=slide.querySelector('.fm-next-story,.fm-next-cover');
        if(!content)return;
        content.style.zoom='';
        content.style.removeProperty('width');
        content.style.removeProperty('margin-inline');
        if(!desktop||!slide.clientHeight)return;
        const style=getComputedStyle(slide);
        content.style.setProperty('width',`${slide.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)}px`,'important');
        content.style.setProperty('margin-inline','auto','important');
        const available=slide.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
        const height=content.getBoundingClientRect().height;
        if(height>available&&available>0){
          let scale=Math.min(1,(available-2)/height);
          content.style.zoom=String(scale);
          for(let attempt=0;attempt<4;attempt++){
            const actual=content.getBoundingClientRect().height;
            if(actual<=available-1)break;
            scale*=((available-2)/actual);
            content.style.zoom=String(scale);
          }
        }
        slide.scrollTop=0;
      });
    };
    let frame;
    const scheduleFit=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(fitSlides);};
    window.addEventListener('resize',scheduleFit);
    new MutationObserver(records=>{
      if(records.some(record=>record.target.classList.contains('slide')))scheduleFit();
    }).observe(document.querySelector('.track'),{subtree:true,attributes:true,attributeFilter:['class']});
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
