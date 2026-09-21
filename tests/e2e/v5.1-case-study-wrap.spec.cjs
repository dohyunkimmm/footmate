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
      for(let offset=0;offset<word.length;offset+=1){
        const range=document.createRange();
        range.setStart(node,start+offset);
        range.setEnd(node,start+offset+1);
        const rect=range.getBoundingClientRect();
        if(rect.width<=0||rect.height<=0)continue;
        if(previousTop!==null&&Math.abs(rect.top-previousTop)>2){
          offenders.push({word,parent:parent.className||parent.tagName,reason:'Hangul word split across lines'});
          break;
        }
        previousTop=rect.top;
      }
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

const roomyCellSelectors=[
  '.fm-next-cover-proof>div',
  '.fm-next-cs-persona>div',
  '.fm-next-cs-journey>div',
  '.fm-next-cs-before-after>div',
  '.fm-next-cs-auth-flow>div',
  '.fm-next-cs-state-home>div',
  '.fm-next-cs-modes>div',
  '.fm-next-cs-metric',
  '.fm-next-cs-day-states>div',
  '.fm-next-cs-recovery>div',
  '.fm-next-cs-outcomes>div'
].join(',');

const compactCellSelectors=[
  '.fm-next-cs-stack p',
  '.fm-next-cs-detail-order span',
  '.fm-next-cs-ia b'
].join(',');

const gridGapSelectors=[
  '.fm-next-cover-proof',
  '.fm-next-cs-persona',
  '.fm-next-cs-journey',
  '.fm-next-cs-before-after',
  '.fm-next-cs-reco',
  '.fm-next-cs-auth-flow',
  '.fm-next-cs-state-home',
  '.fm-next-cs-modes',
  '.fm-next-cs-ia',
  '.fm-next-cs-metrics',
  '.fm-next-cs-day-states',
  '.fm-next-cs-recovery',
  '.fm-next-cs-outcomes'
].join(',');

test('P3 and all 16 Case Study sections keep Korean words intact with readable type and spacing',async({page})=>{
  for(const width of [1440,1180,900,430,390,375,320]){
    await openCaseStudy(page,width,width<=430?844:900);
    for(let index=0;index<16;index+=1){
      await goToSlide(page,index);
      const active=page.locator('.slide.on');
      const audit=await active.evaluate((slide,{bodySelectors,labelSelectors,roomyCellSelectors,compactCellSelectors,gridGapSelectors})=>{
        const smallText=[];
        const tightPadding=[];
        const tightGaps=[];
        for(const el of slide.querySelectorAll(bodySelectors)){
          const size=parseFloat(getComputedStyle(el).fontSize);
          if(size+0.01<13)smallText.push({text:(el.textContent||'').trim().slice(0,80),size,min:13});
        }
        for(const el of slide.querySelectorAll(labelSelectors)){
          const size=parseFloat(getComputedStyle(el).fontSize);
          if(size+0.01<11)smallText.push({text:(el.textContent||'').trim().slice(0,80),size,min:11});
        }
        for(const el of slide.querySelectorAll(roomyCellSelectors)){
          const style=getComputedStyle(el);
          const values=[style.paddingTop,style.paddingRight,style.paddingBottom,style.paddingLeft].map(parseFloat);
          if(values.some(value=>value+0.01<14))tightPadding.push({className:el.className||el.tagName,padding:values,min:14});
        }
        for(const el of slide.querySelectorAll(compactCellSelectors)){
          const style=getComputedStyle(el);
          const vertical=Math.min(parseFloat(style.paddingTop),parseFloat(style.paddingBottom));
          const horizontal=Math.min(parseFloat(style.paddingLeft),parseFloat(style.paddingRight));
          if(vertical+0.01<11||horizontal+0.01<12)tightPadding.push({className:el.className||el.tagName,vertical,horizontal,min:'11px vertical / 12px horizontal'});
        }
        for(const el of slide.querySelectorAll(gridGapSelectors)){
          const style=getComputedStyle(el);
          const gap=Math.min(parseFloat(style.rowGap)||0,parseFloat(style.columnGap)||0);
          if(gap+0.01<10)tightGaps.push({className:el.className,gap,min:10});
        }
        return {smallText,tightPadding,tightGaps};
      },{bodySelectors,labelSelectors,roomyCellSelectors,compactCellSelectors,gridGapSelectors});
      const wordSplits=await active.evaluate(koreanWordSplitAudit);
      expect(audit.smallText,`small structured text at ${width}px slide ${index+1}`).toEqual([]);
      expect(audit.tightPadding,`tight cell padding at ${width}px slide ${index+1}`).toEqual([]);
      expect(audit.tightGaps,`tight structured gap at ${width}px slide ${index+1}`).toEqual([]);
      expect(wordSplits,`Korean word split at ${width}px slide ${index+1}`).toEqual([]);
    }
  }

  await openCaseStudy(page,1440,900);
  await goToSlide(page,0);
  const coverProofType=await page.locator('.fm-next-cover-proof b,.fm-next-cover-proof span').evaluateAll(elements=>elements.map(el=>parseFloat(getComputedStyle(el).fontSize)));
  expect(coverProofType.every(size=>size>=12)).toBe(true);

  await goToSlide(page,2);
  const risk=page.locator('.fm-next-cs-persona b').filter({hasText:'경기 당일 변수'});
  await expect(risk).toHaveCount(1);
  await expect(risk).toHaveCSS('word-break','keep-all');
});
