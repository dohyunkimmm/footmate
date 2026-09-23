const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,width=1440,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.documentElement.dataset.footmateCaseStudySections==='13'&&document.querySelectorAll('.slide:not([hidden])').length===13);
}

async function goToSlide(page,index){
  await page.evaluate(i=>window.goTo?.(i),index);
  await expect(page.locator('.slide.on')).toHaveCount(1);
}

test('all 13 Case Study sections pass structured spacing and wrapping audit',async({page})=>{
  const widths=[1440,1180,900,430,390,375,320];
  const failures=[];
  for(const width of widths){
    await openCaseStudy(page,width,width<=430?844:900);
    for(let index=0;index<13;index+=1){
      await goToSlide(page,index);
      const audit=await page.locator('.slide.on').evaluate(slide=>{
        const visible=el=>{
          const style=getComputedStyle(el);
          const rect=el.getBoundingClientRect();
          return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0;
        };
        const textOf=el=>(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,100);
        const roots=[...slide.querySelectorAll('.fm-next-cover-proof,[class*="fm-next-cs-"]')].filter(visible);
        const cells=roots.filter(el=>{
          if(el.matches('a,button')||el.closest('a,button'))return false;
          const style=getComputedStyle(el);
          const rect=el.getBoundingClientRect();
          if(rect.width<90)return false;
          const border=Math.max(parseFloat(style.borderTopWidth)||0,parseFloat(style.borderRightWidth)||0,parseFloat(style.borderBottomWidth)||0,parseFloat(style.borderLeftWidth)||0);
          return border>0||(parseFloat(style.borderRadius)||0)>=8;
        });
        const smallText=[];
        for(const el of slide.querySelectorAll('p,h3,b,strong,span,small')){
          if(!visible(el)||!/[0-9A-Za-z가-힣]/.test(textOf(el)))continue;
          if(el.closest('.fm-next-cover-flow'))continue;
          const size=parseFloat(getComputedStyle(el).fontSize);
          let min=11;
          if(el.tagName==='P')min=12;
          else if(el.tagName==='H3')min=14;
          else if(['B','STRONG'].includes(el.tagName))min=11;
          if(Number.isFinite(size)&&size+0.01<min)smallText.push({text:textOf(el),size,min});
        }
        const tightPadding=[];
        for(const el of cells){
          const style=getComputedStyle(el);
          const rect=el.getBoundingClientRect();
          if((parseFloat(style.borderRadius)||0)>=999||rect.height<=40)continue;
          const vertical=Math.min(parseFloat(style.paddingTop)||0,parseFloat(style.paddingBottom)||0);
          const horizontal=Math.min(parseFloat(style.paddingLeft)||0,parseFloat(style.paddingRight)||0);
          if(vertical<11||horizontal<12)tightPadding.push({text:textOf(el),vertical,horizontal});
        }
        const tightGaps=[];
        for(const el of roots){
          if(el.matches('a,button')||el.closest('a,button'))continue;
          const style=getComputedStyle(el);
          if(!['grid','flex','inline-flex'].includes(style.display))continue;
          if([...el.children].filter(visible).length<2)continue;
          const gap=Math.min(parseFloat(style.rowGap)||0,parseFloat(style.columnGap)||0);
          const min=style.display==='grid'?10:7;
          if(gap+0.01<min)tightGaps.push({className:el.className||el.tagName,gap,min});
        }
        const overflow=[];
        for(const el of roots){
          const x=el.scrollWidth-el.clientWidth;
          if(x>1)overflow.push({className:el.className||el.tagName,x});
        }
        const wordBreak=[];
        for(const el of slide.querySelectorAll('.fm-next-story p,.fm-next-story h2,.fm-next-story h3,.fm-next-story b,.fm-next-story span')){
          if(visible(el)&&getComputedStyle(el).wordBreak!=='keep-all')wordBreak.push({text:textOf(el),wordBreak:getComputedStyle(el).wordBreak});
        }
        return {
          rootCount:roots.length,
          cellCount:cells.length,
          documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          smallText,tightPadding,tightGaps,overflow,wordBreak
        };
      });
      const pageId=`${width}px P${index+1}`;
      if(audit.rootCount<=0)failures.push({page:pageId,type:'structured coverage',details:audit.rootCount});
      if(audit.documentOverflow>1)failures.push({page:pageId,type:'document overflow',details:audit.documentOverflow});
      if(audit.smallText.length)failures.push({page:pageId,type:'small text',details:audit.smallText});
      if(audit.tightPadding.length)failures.push({page:pageId,type:'tight padding',details:audit.tightPadding});
      if(audit.tightGaps.length)failures.push({page:pageId,type:'tight gap',details:audit.tightGaps});
      if(audit.overflow.length)failures.push({page:pageId,type:'horizontal overflow',details:audit.overflow});
      if(audit.wordBreak.length)failures.push({page:pageId,type:'word-break mismatch',details:audit.wordBreak});
    }
  }
  expect(failures,'full P1-P13 layout audit failures').toEqual([]);
});
