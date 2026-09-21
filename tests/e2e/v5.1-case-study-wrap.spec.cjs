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

test('P3 and all 16 Case Study sections keep Korean words intact across release widths',async({page})=>{
  for(const width of [1440,1180,900,430,390,375,320]){
    await openCaseStudy(page,width,width<=430?844:900);
    for(let index=0;index<16;index+=1){
      await goToSlide(page,index);
      const offenders=await page.locator('.slide.on').evaluate(koreanWordSplitAudit);
      expect(offenders,`Korean word split at ${width}px slide ${index+1}`).toEqual([]);
    }
  }

  await openCaseStudy(page,1440,900);
  await goToSlide(page,2);
  const risk=page.locator('.fm-next-cs-persona b').filter({hasText:'경기 당일 변수'});
  await expect(risk).toHaveCount(1);
  await expect(risk).toHaveCSS('word-break','keep-all');
});
