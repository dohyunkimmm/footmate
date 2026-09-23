/* FootMate Case Study reader-facing language consistency. */
(function(){
  let applied=false;

  const storyKickers=[
    '02 · 문제',
    '03 · Persona / JTBD',
    '04 · 제품 원칙',
    '05 · 핵심 여정',
    '06 · 설계 결정 01',
    '07 · 설계 결정 02',
    '08 · 설계 결정 03',
    '09 · 로그인',
    '10 · 참가 · 결제',
    '11 · 경기 당일 · 재탐색',
    '12 · 복구',
    '13 · 도메인 구조',
    '14 · 외부 연동 · AI 경계',
    '15 · 검증',
    '16 · Production 범위'
  ];
  const journeyLabels=['탐색','결정','참가','경기','재탐색'];

  function setText(root,selector,text){
    const node=root?.querySelector(selector);
    if(node)node.textContent=text;
  }

  function setTexts(nodes,texts){
    nodes.forEach((node,index)=>{
      if(node&&texts[index])node.textContent=texts[index];
    });
  }

  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    if(slides.length!==16)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='5.1.1')return false;

    setText(slides[0],'.fm-next-cover-kicker','FootMate · AI 보조 경기 탐색');
    setTexts([...slides[0].querySelectorAll('.fm-next-cover-flow b')],journeyLabels);

    storyKickers.forEach((label,index)=>setText(slides[index+1],'.fm-next-story-kicker',label));
    setTexts([...slides[3].querySelectorAll('.fm-next-cs-loop > b')],journeyLabels);
    setTexts([...slides[4].querySelectorAll('.fm-next-cs-journey h3')],journeyLabels);

    const beforeAfter=[...slides[5].querySelectorAll('.fm-next-cs-before-after small')];
    if(beforeAfter[0])beforeAfter[0].textContent='기존';
    if(beforeAfter[1])beforeAfter[1].textContent='개선안';

    setText(slides[7],'.fm-next-cs-sticky small','결정 상태');

    document.documentElement.dataset.footmateCaseStudyLanguage='ko-first';
    applied=true;
    return true;
  }

  if(patch())return;
  const target=document.querySelector('.track')||document.body;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(target,{childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
