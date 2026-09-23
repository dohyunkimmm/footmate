const root=document.getElementById('footmate-next');
if(root){
  let scheduled=false;
  const setText=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};

  function configureAssistant(screen){
    const card=screen.querySelector('.fm-ai-card');
    if(!card)return;
    const isHome=screen.dataset.screen==='home';
    const variant=isHome?'home':'discover';
    if(card.dataset.productAi!==variant)card.dataset.productAi=variant;

    const title=card.querySelector('.fm-ai-head strong');
    const copy=card.querySelector('.fm-ai-head p');
    const input=card.querySelector('[data-ai-input]');
    const submit=card.querySelector('[data-ai-submit]');
    const examples=[...card.querySelectorAll('[data-ai-example]')];

    /* Keep the existing accessible identity/label contracts intact:
       AI Match Assistant · 찾고 싶은 경기 조건 · AI로 찾기. */
    if(submit)submit.setAttribute('aria-label','AI로 찾기');

    if(isHome){
      setText(title,'조건만 빠르게 바꿔볼까요?');
      setText(copy,'추천 흐름은 유지하고 필요한 조건만 한 줄로 조정합니다.');
      if(input&&input.placeholder!=='예: 8시 이후, 가까운 중급 MF')input.placeholder='예: 8시 이후, 가까운 중급 MF';
      setText(submit,'조건 수정');
      examples.forEach((button,index)=>{button.hidden=index>0;button.style.minHeight='44px'});
    }else{
      setText(title,'원하는 경기를 문장으로 검색하세요.');
      setText(copy,'필터와 함께 사용해 시간·거리·가격·포지션 조건을 빠르게 좁힐 수 있어요.');
      if(input&&input.placeholder!=='예: 8시 이후, 2만원 이하, 가까운 중급 MF 경기')input.placeholder='예: 8시 이후, 2만원 이하, 가까운 중급 MF 경기';
      setText(submit,'AI 검색');
      examples.forEach(button=>{button.hidden=false;button.style.minHeight=''});
    }

    const mode=card.querySelector('[data-ai-mode]');
    const retry=card.querySelector('.fm-product-ai-retry');
    if(mode?.dataset.mode==='rules-fallback'){
      if(!retry){
        const button=document.createElement('button');
        button.type='button';
        button.className='fm-product-ai-retry';
        button.textContent='AI 다시 시도';
        button.addEventListener('click',()=>{
          const field=card.querySelector('[data-ai-input]');
          if(field&&!field.value.trim())field.value=isHome?'가까운 중급 경기':'20분 이내 경기';
          card.querySelector('[data-ai-form]')?.requestSubmit();
        });
        card.querySelector('[data-ai-status]')?.insertAdjacentElement('afterend',button);
      }
    }else if(retry){
      retry.remove();
    }
  }

  function compactMatchCards(screen){
    const role=screen.dataset.screen;
    screen.querySelectorAll('.fm-next-match-card').forEach(card=>{
      if(card.dataset.productDensity!==role)card.dataset.productDensity=role;
    });
  }

  function prioritizeDetail(screen){
    if(screen.dataset.productDetail!=='prioritized')screen.dataset.productDetail='prioritized';
    const redundant=new Set(['나와 잘 맞는 이유','경기 정보','함께 뛰는 사람','취소·환불']);
    [...screen.querySelectorAll('.fm-next-detail-section')].forEach(section=>{
      if(section.dataset.decisionSection)return;
      const heading=section.querySelector('h2')?.textContent?.trim();
      if(heading&&redundant.has(heading)&&!section.hidden)section.hidden=true;
    });
  }

  function enhance(){
    const screen=root.querySelector('[data-screen]');
    if(!screen)return;
    if(screen.dataset.screen==='home'||screen.dataset.screen==='discover'){
      configureAssistant(screen);
      compactMatchCards(screen);
    }
    if(screen.dataset.screen==='detail')prioritizeDetail(screen);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;enhance()});
  }

  new MutationObserver(schedule).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-mode','data-ai-state']});
  schedule();
}
