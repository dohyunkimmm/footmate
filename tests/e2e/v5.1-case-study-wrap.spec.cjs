const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,width=1440,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.querySelectorAll('.slide').length===16);
}

async function goToSlide(page,index){
  await page.evaluate(i=>{
    if(typeof window.goTo==='function')window.goTo(i);
    else document.querySelectorAll('.toc-item')[i]?.click();
  },index);
  await expect(page.locator('.slide.on')).toHaveCount(1);
}

function koreanWordSplitAudit(slide){
  const offenders=[];
  const walker=document.createTreeWalker(slide,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode;
    const parent=node.parentElement;
    if(!parent)continue;
    const style=getComputedStyle(parent);
    if(style.display==='none'||style.visibility==='hidden')continue;
    const value=node.nodeValue||'';
    for(const match of value.matchAll(/[가-힣]{2,}/g)){
      const start=match.index||0;
      const word=match[0];
      let previousTop=null;
      let visible=false;
      for(let offset=0;offset<word.length;offset+=1){
        const range=document.createRange();
        range.setStart(node,start+offset);
        range.setEnd(node,start+offset+1);
        const rect=range.getBoundingClientRect();
        if(rect.width>0&&rect.height>0)visible=true;
        if(previousTop!==null&&Math.abs(rect.top-previousTop)>2){
          offenders.push({word,parent:parent.className||parent.tagName,reason:'Hangul word split across lines'});
          break;
        }
        previousTop=rect.top;
      }
      if(!visible)continue;
    }
  }
  return offenders;
}

const bodySelectors=[
  '.fm-next-cs-card p',
  '.fm-next-cs-jtbd p',
  '.fm-next-cs-scope p',
  '.fm-next-cs-sticky p',
  '.fm-next-cs-note',
  '.fm-next-cs-before-after p',
  '.fm-next-cs-journey p',
  '.fm-next-cs-stack p',
  '.fm-next-cs-modes p',
  '.fm-next-cs-metric span',
  '.fm-next-cs-day-states p',
  '.fm-next-cs-recovery span',
  '.fm-next-cs-outcomes p'
].join(',');

const labelSelectors=[
  '.fm-next-cs-card small',
  '.fm-next-cs-quote span',
  '.fm-next-cs-jtbd small',
  '.fm-next-cs-decision span',
  '.fm-next-cs-scope span',
  '.fm-next-cs-sticky small',
  '.fm-next-cs-persona span',
  '.fm-next-cs-before-after small',
  '.fm-next-cs-reco-card>span',
  '.fm-next-cs-reco-card>div b',
  '.fm-next-cs-auth-flow small',
  '.fm-next-cs-state-home small',
  '.fm-next-cs-modes small',
  '.fm-next-cs-ia span',
  '.fm-next-cs-day-states small',
  '.fm-next-cs-outcomes b',
  '.fm-next-cs-quality span',
  '.fm-next-cs-final>span'
].join(',');

test('P3 and all 16 Case Study sections keep Korean words intact and structured text readable',async({page})=>{
  for(const width of [1440,1180,900,430,390,375,320]){
    await openCaseStudy(page,width,width<=430?844:900);
    for(let index=0;index<16;index+=1){
      await goToSlide(page,index);
      const audit=await page.locator('.slide.on').evaluate((slide,{bodySelectors,labelSelectors})=>{
        const smallText=[];
        for(const el of slide.querySelectorAll(bodySelectors)){
          const size=parseFloat(getComputedStyle(el).fontSize);
          if(size+0.01<13)smallText.push({text:(el.textContent||'').trim().slice(0,80),size,min:13});
        }
        for(const el of slide.querySelectorAll(labelSelectors)){
          const size=parseFloat(getComputedStyle(el).fontSize);
          if(size+0.01<11)smallText.push({text:(el.textContent||'').trim().slice(0,80),size,min:11});
        }
        return {smallText,wordSplits:koreanWordSplitAudit(slide)};
      },{bodySelectors,labelSelectors});
      expect(audit.smallText,`small structured text at ${width}px slide ${index+1}`).toEqual([]);
      expect(audit.wordSplits,`Korean word split at ${width}px slide ${index+1}`).toEqual([]);
    }
  }

  await openCaseStudy(page,1440,900);
  await goToSlide(page,0);
  const coverProof=await page.locator('.fm-next-cover-proof span').evaluateAll(elements=>elements.map(el=>parseFloat(getComputedStyle(el).fontSize)));
  expect(coverProof.every(size=>size>=12)).toBe(true);

  await goToSlide(page,2);
  const risk=page.locator('.fm-next-cs-persona b').filter({hasText:'경기 당일 변수'});
  await expect(risk).toHaveCount(1);
  await expect(risk).toHaveCSS('word-break','keep-all');
});
