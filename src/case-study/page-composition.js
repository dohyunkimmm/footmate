/* FootMate 5.4 · page composition. Existing product facts and evidence stay intact. */
(function(){
  const pages=[
  {
    "nav": "Overview",
    "navDesc": "Experience & Role",
    "title": [
      "�� ���ؿ� �´� ������,",
      "��� ���ϰ� ���� ������."
    ],
    "desc": "Ž������ ���� ���ı��� �̾����� ǲ�� ������ ��ȹ�ϰ�, ȭ�顤��å������ ������ �����߽��ϴ�.",
    "keywords": [
      "�ڿ��� Ž��",
      "��õ �ٰ�",
      "��� ����"
    ],
    "layout": "cover"
  },
  {
    "nav": "Problem & Goal",
    "navDesc": "Friction & Design Goal",
    "title": "��� ������ ��Ȯ�Ǽ��� ���̴� �� �����߽��ϴ�.",
    "desc": "������ ���� Ȯ���ϴ� Ž��, �̸� �α���, ���� �� ����� �ȳ��� �ϳ��� �帧���� �����߽��ϴ�.",
    "keywords": [
      "���� �л�",
      "�Ǵ� �δ�",
      "���� ����"
    ],
    "layout": "comparison"
  },
  {
    "nav": "Persona & JTBD",
    "navDesc": "Assumptions & Tasks",
    "title": "����� ������ ��ü���� �ൿ �������� �ٲ���ϴ�.",
    "desc": "��� �� ����� ��⸦ ã�� ��Ȳ�� �����ϰ�, ���� ������ ȭ�� �䱸���װ� ���� �׸� �����߽��ϴ�.",
    "keywords": [
      "����� ����",
      "�Ǵ� ����",
      "���� ����"
    ],
    "layout": "persona"
  },
  {
    "nav": "Scope & Priorities",
    "navDesc": "Build Now & Validate Next",
    "title": "������ ������ ����, Ȯ�� ������ �������� �׽��ϴ�.",
    "desc": "�Ǵ� ��ġ������ ���⡤���� ���ɼ����� ���� ������ ���ϰ�, ����ȭ�� �ڵ� ������ �������� �����߽��ϴ�.",
    "keywords": [
      "����������",
      "���� �켱����",
      "Ȯ�� ����"
    ],
    "layout": "journey"
  },
  {
    "nav": "Guest Exploration",
    "navDesc": "Explore Before Sign-in",
    "title": "��ġ�� Ȯ���� �ڿ� �α����ϵ��� �����߽��ϴ�.",
    "desc": "��õ�� �󼼴� ���� ���� �����ϰ�, ���� ��û ������ ������ ��ġ�߽��ϴ�.",
    "keywords": [
      "���� �� Ž��",
      "��ġ Ȯ��",
      "���� ����"
    ],
    "layout": "comparison"
  },
  {
    "nav": "Recommendations",
    "navDesc": "Preferences & Reasons",
    "title": "��õ ������� ������ ������ ���� ���̰� �߽��ϴ�.",
    "desc": "����� ��ȣ�� �ֱ� �̷��� Ȱ���ϵ�, ���� ���ǰ� ��õ �ٰŸ� Ȯ���ϰ� �ٲ� �� �ְ� �߽��ϴ�.",
    "keywords": [
      "��ȣ ����",
      "��õ ����",
      "���� ����"
    ],
    "layout": "product"
  },
  {
    "nav": "Match Details",
    "navDesc": "Information for Joining",
    "title": "���� �Ǵܿ� �ʿ��� ������ �󼼸� �����߽��ϴ�.",
    "desc": "�ð�����ҿ��� ��õ ����, �ڸ��� �غ� ����, ��� �������� �̾����� ���塤�񱳵� �����մϴ�.",
    "keywords": [
      "���� �Ǵ�",
      "���� ����",
      "���塤��"
    ],
    "layout": "product"
  },
  {
    "nav": "Sign-in & Join",
    "navDesc": "Preserve Choice & Confirm",
    "title": "���� ���������� ������ ��⸦ �����մϴ�.",
    "desc": "�α��� �� ���� ��ġ�� ���ƿ���, ���� Ȯ�� ����� ���� MY �Ǵ� ���� �ൿ���� �����մϴ�.",
    "keywords": [
      "���� ����",
      "���� Ȯ��",
      "��� �ȳ�"
    ],
    "layout": "flow"
  },
  {
    "nav": "Matchday & Return",
    "navDesc": "Prepare, Check In & Return",
    "title": "���� ������ ���� �ൿ�� MY���� �ȳ��մϴ�.",
    "desc": "���� �غ���� �̵���üũ��, ��� �� �ǵ��� ��Ž������ ���º��� �ʿ��� ������ �����մϴ�.",
    "keywords": [
      "���� �غ�",
      "üũ��",
      "��� �� ��Ž��"
    ],
    "layout": "product"
  },
  {
    "nav": "Recovery",
    "navDesc": "Preserve State & Retry",
    "title": "�����ص� ������ �����ϰ� �ٽ� �̾�ϴ�.",
    "desc": "��õ �������ڸ� ���������� ���������� �������� ������ ���¿� ��õ�����ü ��θ� �����߽��ϴ�.",
    "keywords": [
      "���� ����",
      "��õ�",
      "��ü ���"
    ],
    "layout": "recovery"
  },
  {
    "nav": "AI & Domain Rules",
    "navDesc": "Interpret, Rank & Confirm",
    "title": "�ؼ�����õ��Ȯ���� å���� �и��߽��ϴ�.",
    "desc": "AI�� ������ �ؼ��ϰ�, ��õ ������ ������ ������ �����մϴ�. ���� Ȯ���� ������� Ȯ���� ��Ĩ�ϴ�.",
    "keywords": [
      "���� �ؼ�",
      "��õ �Ǵ�",
      "����� Ȯ��"
    ],
    "layout": "architecture"
  },
  {
    "nav": "Metrics & Validation",
    "navDesc": "Measurement & Verification",
    "title": "���� ������ ����� ������ �����߽��ϴ�.",
    "desc": "KPI�� ��ꡤ���� ������ �����ϰ�, �ڵ� QA����� �˼���AI ���� �˼��� ��ǰ ������ �ٰŷ� �����߽��ϴ�.",
    "keywords": [
      "���� ����",
      "���� ����",
      "���� ������"
    ],
    "layout": "validation"
  },
  {
    "nav": "Release & Next Steps",
    "navDesc": "Implementation & Limits",
    "title": "������ ������ ������ ������ ��ġ�� �����߽��ϴ�.",
    "desc": "��ǰ ȭ��� Closed Beta�� ���� ������ �����ϰ�, �̿� ��ǥ�� ���ͼ��� �ļ� ���� ������ ������ϴ�.",
    "keywords": [
      "���� ����",
      "���� �Ѱ�",
      "���� ����"
    ],
    "layout": "release"
  }
];

  function installEditorialInteractions(slides){
    const desktop=window.matchMedia('(min-width:901px)');
    const disclosures=[];
    // Keep the evidence visible; only supplemental rationale is collapsible on mobile.
    const supplements=[[1,'.fm-next-story-aside','��Ȱ� ���� ����'],[3,'.fm-next-story-aside','�켱���� �Ǵ� �ٰ�'],[4,'.fm-next-story-aside','���� ������ ����'],[5,'.fm-page-product-notes .fm-next-cs-note','��õ ���� ��Ģ'],[7,'.fm-next-story-aside','���������� ����'],[8,'.fm-page-product-notes .fm-next-cs-note','� ��å�� ����'],[10,'.fm-next-story-aside','���� ������ ���� ����']];
    supplements.forEach(([index,selector,text])=>{
      const node=slides[index].querySelector(selector);if(!node)return;
      const details=document.createElement('details');details.className='fm-editorial-supplement';details.open=desktop.matches;
      const summary=document.createElement('summary');summary.textContent=text;
      node.before(details);details.append(summary,node);disclosures.push(details);
    });
    desktop.addEventListener('change',()=>disclosures.forEach(node=>node.open=desktop.matches));
    slides.forEach(slide=>slide.querySelectorAll('details').forEach(node=>node.addEventListener('toggle',()=>window.dispatchEvent(new Event('resize')))));

    const dialog=document.createElement('dialog');dialog.className='fm-screen-dialog';dialog.setAttribute('aria-labelledby','fm-screen-dialog-title');
    dialog.innerHTML='<header><h2 id="fm-screen-dialog-title"></h2><button type="button" class="fm-screen-close" aria-label="ȭ�� Ȯ�� �ݱ�">�ݱ� ��</button></header><div class="fm-screen-tabs" role="group" aria-label="ȭ�� ���� ���"><button type="button" data-screen-mode="full" aria-pressed="true">��ü ȭ��</button><button type="button" data-screen-mode="focus" aria-pressed="false">�ٽ� ����</button></div><div class="fm-screen-viewport"><img alt=""></div><p class="fm-screen-source">���� ��ǰ ȭ�� ���� �� ���� � ȭ��� ���̰� ���� �� �ֽ��ϴ�.</p>';
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
      const button=document.createElement('button');button.type='button';button.className='fm-screen-expand';button.textContent='ȭ�� Ȯ�� ��';button.setAttribute('aria-haspopup','dialog');
      button.addEventListener('click',()=>{
        dialog.querySelector('h2').textContent=caption.querySelector('b')?.textContent||'��ǰ ȭ��';
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
      if(toc){toc.querySelector('.toc-t').textContent=page.nav;toc.querySelector('.toc-s').textContent=page.navDesc;toc.setAttribute('aria-label',String(index+1).padStart(2,'0')+' �� '+page.nav+' �� '+page.navDesc);}
      const label=slide.querySelector(index===0?'.fm-next-cover-kicker':'.fm-next-story-kicker');
      if(label)label.textContent=index===0?page.nav:String(index+1).padStart(2,'0')+' �� '+page.nav;
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
      [3,0,'������ ���� �帧','���� Ȯ�� �� ���� �ƶ� ���� �� ���� Beta�� ��������������ҡ�üũ�Ρ�����'],
      [3,1,'��� ������ ���̿�','��⿭���˸����ǵ������ �ڸ� ȸ���� ���̿� ���� �� ��ȯ���ݺ� �̿��� �ļ� ��ǥ'],
      [3,2,'���� �������� ����','���� PG �� ����ȭ ���� �� AI �ڵ� ���� ���� �� ���� Ȯ���� ����� ���� Ȯ��'],
      [11,0,'�ڵ�ȭ�� ���� Ȯ��',null],
      [11,1,'���� ����� ǥ�� Ȯ��',null],
      [11,2,'������ ������ ��ġ ����',null]
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
