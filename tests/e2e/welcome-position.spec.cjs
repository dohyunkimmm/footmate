const {test,expect}=require('@playwright/test');

test('Welcome moves only headline and AI support copy 44px while CTAs stay anchored',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({route:'welcome',setupComplete:true,region:'서울 · 강남',position:'GK',level:'입문',signedIn:false,userName:'게스트'}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.waitForFunction(()=>document.querySelector('[data-screen="welcome"] [data-welcome-ai-copy]'));
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());

  const metrics=await page.evaluate(()=>{
    const screen=document.querySelector('[data-screen="welcome"]');
    const copy=screen.querySelector('.fm-next-intro-copy');
    const headline=copy.querySelector('h1');
    const support=copy.querySelector('[data-welcome-ai-copy]');
    const actions=screen.querySelector('.fm-next-actions');
    const buttons=[...actions.querySelectorAll('button')];
    const snapshot=()=>({
      copyTop:copy.getBoundingClientRect().top,
      headlineTop:headline.getBoundingClientRect().top,
      supportTop:support.getBoundingClientRect().top,
      actionsTop:actions.getBoundingClientRect().top,
      buttonTops:buttons.map(node=>node.getBoundingClientRect().top),
      buttonHeights:buttons.map(node=>node.getBoundingClientRect().height),
      transform:getComputedStyle(copy).transform,
      supportText:support.textContent.trim()
    });
    const moved=snapshot();
    const inlineValue=copy.style.getPropertyValue('transform');
    const inlinePriority=copy.style.getPropertyPriority('transform');
    copy.style.setProperty('transform','none','important');
    const natural=snapshot();
    if(inlineValue)copy.style.setProperty('transform',inlineValue,inlinePriority);else copy.style.removeProperty('transform');
    const restored=snapshot();
    return {moved,natural,restored};
  });

  expect(Math.round(metrics.natural.headlineTop-metrics.moved.headlineTop)).toBe(44);
  expect(Math.round(metrics.natural.supportTop-metrics.moved.supportTop)).toBe(44);
  expect(Math.round(metrics.natural.actionsTop-metrics.moved.actionsTop)).toBe(0);
  expect(metrics.natural.buttonTops.map((top,index)=>Math.round(top-metrics.moved.buttonTops[index]))).toEqual([0,0]);
  expect(metrics.moved.buttonHeights).toEqual([54,54]);
  expect(metrics.restored.headlineTop).toBeCloseTo(metrics.moved.headlineTop,3);
  expect(metrics.moved.transform).toBe('matrix(1, 0, 0, 1, 0, -44)');
  expect(metrics.moved.supportText).toBe('AI가 최고의 경기를 골라준다');
});
