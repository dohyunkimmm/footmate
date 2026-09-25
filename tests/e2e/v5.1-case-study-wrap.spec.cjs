const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,width=1440,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.documentElement.dataset.footmateCaseStudySections==='13'&&document.documentElement.dataset.footmateCaseStudyStructuredCopy==='2'&&document.querySelectorAll('.slide:not([hidden])').length===13);
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
        const role=slide.dataset.v5ContentRole||'';
        const isAuth=role==='auth-participation';
        const roots=[...slide.querySelectorAll('.fm-next-cover-proof,.fm-cs-reasons,[class*="fm-next-cs-"]')].filter(visible);
        const cells=roots.filter(el=>{
          if(el.matches('a,button')||el.closest('a,button'))return false;
          const style=getComputedStyle(el);
          const rect=el.getBoundingClientRect();
          if(rect.width<90)return false;
          const border=Math.max(parseFloat(style.borderTopWidth)||0,parseFloat(style.borderRightWidth)||0,parseFloat(style.borderBottomWidth)||0,parseFloat(style.borderLeftWidth)||0);
          return border>0||(parseFloat(style.borderRadius)||0)>=8;
        });
        const smallText=[];
        for(const el of slide.querySelectorAll('p,h3,b,strong,span,small,dt,dd')){
          if(!visible(el)||!/[0-9A-Za-z가-힣]/.test(textOf(el)))continue;
          if(el.closest('.fm-next-cover-flow'))continue;
          const size=parseFloat(getComputedStyle(el).fontSize);
          let min=11;
          if(['P','DT','DD'].includes(el.tagName))min=12;
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
          const authScope=isAuth&&el.classList.contains('fm-next-cs-scope');
          const minVertical=authScope?10:11;
          const minHorizontal=12;
          if(vertical+0.01<minVertical||horizontal+0.01<minHorizontal)tightPadding.push({text:textOf(el),vertical,horizontal,minVertical,minHorizontal});
        }
        const tightGaps=[];
        for(const el of roots){
          if(el.matches('a,button')||el.closest('a,button'))continue;
          const style=getComputedStyle(el);
          if(!['grid','flex','inline-flex'].includes(style.display))continue;
          if([...el.children].filter(visible).length<2)continue;
          const gap=Math.min(parseFloat(style.rowGap)||0,parseFloat(style.columnGap)||0);
          let min=style.display==='grid'?10:7;
          if(isAuth&&el.classList.contains('fm-next-cs-auth-flow'))min=6;
          if(isAuth&&el.classList.contains('fm-cs-reasons')&&el.closest('.fm-next-cs-scope'))min=0;
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
        let authSpacing=null;
        if(isAuth&&(window.innerWidth>=901||window.innerWidth<=560)){
          const flow=slide.querySelector('.fm-next-cs-auth-flow');
          const flowCell=flow?.querySelector(':scope>div');
          const scope=slide.querySelector('.fm-next-cs-scope');
          const reasons=scope?.querySelector('.fm-cs-reasons');
          const row=reasons?.querySelector(':scope>div');
          const flowStyle=getComputedStyle(flow);
          const cellStyle=getComputedStyle(flowCell);
          const scopeStyle=getComputedStyle(scope);
          const reasonsStyle=getComputedStyle(reasons);
          const rowStyle=getComputedStyle(row);
          authSpacing={
            mode:window.innerWidth>=901?'desktop':'mobile',
            slideAlign:getComputedStyle(slide).alignItems,
            flowGap:parseFloat(flowStyle.gap)||0,
            cellVertical:Math.min(parseFloat(cellStyle.paddingTop)||0,parseFloat(cellStyle.paddingBottom)||0),
            cellHorizontal:Math.min(parseFloat(cellStyle.paddingLeft)||0,parseFloat(cellStyle.paddingRight)||0),
            scopeVertical:Math.min(parseFloat(scopeStyle.paddingTop)||0,parseFloat(scopeStyle.paddingBottom)||0),
            scopeHorizontal:Math.min(parseFloat(scopeStyle.paddingLeft)||0,parseFloat(scopeStyle.paddingRight)||0),
            reasonsGap:Math.min(parseFloat(reasonsStyle.rowGap)||0,parseFloat(reasonsStyle.columnGap)||0),
            rowVertical:Math.min(parseFloat(rowStyle.paddingTop)||0,parseFloat(rowStyle.paddingBottom)||0),
            rowColumns:rowStyle.gridTemplateColumns
          };
        }
        return {
          role,
          rootCount:roots.length,
          cellCount:cells.length,
          documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          smallText,tightPadding,tightGaps,overflow,wordBreak,authSpacing
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
      if(audit.authSpacing){
        const spacing=audit.authSpacing;
        const expected=spacing.mode==='desktop'
          ?{flowGap:6,cellVertical:10,cellHorizontal:12,scopeVertical:10,scopeHorizontal:14,reasonsGap:0,rowVertical:5,rowColumnsPrefix:'84px '}
          :{flowGap:10,cellVertical:10,cellHorizontal:12,scopeVertical:10,scopeHorizontal:12,reasonsGap:0,rowVertical:7,rowColumnsPrefix:'1fr'};
        const problems=[];
        if(spacing.slideAlign!=='center'&&spacing.mode==='desktop')problems.push({field:'slideAlign',actual:spacing.slideAlign,expected:'center'});
        for(const field of ['flowGap','cellVertical','cellHorizontal','scopeVertical','scopeHorizontal','reasonsGap','rowVertical']){
          if(Math.abs(spacing[field]-expected[field])>0.01)problems.push({field,actual:spacing[field],expected:expected[field]});
        }
        if(spacing.mode==='desktop'&&!spacing.rowColumns.startsWith(expected.rowColumnsPrefix))problems.push({field:'rowColumns',actual:spacing.rowColumns,expectedPrefix:expected.rowColumnsPrefix});
        if(spacing.mode==='mobile'&&spacing.rowColumns.split(' ').length!==1)problems.push({field:'rowColumns',actual:spacing.rowColumns,expected:'single column'});
        if(problems.length)failures.push({page:pageId,type:'auth spacing contract',details:problems});
      }
    }
  }
  expect(failures,'full P1-P13 layout audit failures').toEqual([]);
});
