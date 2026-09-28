const {test,expect}=require('@playwright/test');

async function waitForApp(page){
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.waitForFunction(()=>window.__FOOTMATE_P0_USABILITY_TRUST__?.version==='1.0.0');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function openClean(page){
  await page.setViewportSize({width:390,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'domcontentloaded'});
  await waitForApp(page);
}

async function setSession(page,route){
  await page.evaluate(nextRoute=>{
    localStorage.setItem('footmate:v4:session',JSON.stringify({
      route:nextRoute,
      setupComplete:true,
      setupStep:2,
      region:'수원 · 영통',
      position:'MF',
      level:'중급',
      signedIn:false,
      joinedMatchId:null,
      selectedMatchId:null,
      matchStage:'upcoming',
      userName:'도현'
    }));
  },route);
}

async function expectMinimumTouchTarget(locator){
  const boxes=await locator.evaluateAll(nodes=>nodes.map(node=>{
    const rect=node.getBoundingClientRect();
    return {width:rect.width,height:rect.height,text:(node.textContent||'').trim()};
  }));
  expect(boxes.length).toBeGreaterThan(0);
  for(const box of boxes){
    expect(box.width,`${box.text} width`).toBeGreaterThanOrEqual(44);
    expect(box.height,`${box.text} height`).toBeGreaterThanOrEqual(44);
  }
}

test('Welcome describes AI as constraint interpreter while deterministic recommendation owns ranking',async({page})=>{
  await openClean(page);
  const copy=page.locator('[data-screen="welcome"] [data-welcome-ai-copy]');
  await expect(copy).toHaveText('AI가 원하는 조건을 해석해, 맞는 경기를 빠르게 찾게 도와줘요.');
  await expect(copy).toHaveAttribute('data-ai-role-aligned','true');
  const contract=await page.evaluate(()=>({
    presentation:window.__FOOTMATE_P0_USABILITY_TRUST__,
    ai:{role:window.__FOOTMATE_AI__?.role,rankingOwner:window.__FOOTMATE_AI__?.rankingOwner}
  }));
  expect(contract.presentation.welcomeAiRole).toBe('natural-language constraint interpretation');
  expect(contract.presentation.rankingOwner).toBe('deterministic recommendation engine');
  expect(contract.ai.role).toBe('natural-language constraint interpretation');
  expect(contract.ai.rankingOwner).toBe('deterministic recommendation engine');
});

test('frequent mobile chips and AI examples keep a 44px minimum touch target',async({page})=>{
  await openClean(page);
  await setSession(page,'home');
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await waitForApp(page);
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await expect(page.locator('[data-screen="home"] .fm-ai-examples button').first()).toBeVisible();
  await expectMinimumTouchTarget(page.locator('[data-screen="home"] .fm-ai-examples button:visible'));

  await setSession(page,'discover');
  await page.goto('/app?resume=1&d_distance=20',{waitUntil:'domcontentloaded'});
  await waitForApp(page);
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await expect(page.locator('.fm-discovery-chip')).toHaveCount(1);
  await expectMinimumTouchTarget(page.locator('.fm-discovery-chip,.fm-discovery-clear'));
});

test('release dialog close affordance also keeps the 44px minimum control geometry',async({page})=>{
  await openClean(page);
  const size=await page.evaluate(()=>{
    const head=document.createElement('div');
    head.className='fm-release-team-head';
    const button=document.createElement('button');
    button.type='button';
    button.textContent='×';
    head.append(button);
    document.querySelector('.fm-next-page')?.append(head);
    const rect=button.getBoundingClientRect();
    head.remove();
    return {width:rect.width,height:rect.height};
  });
  expect(size.width).toBeGreaterThanOrEqual(44);
  expect(size.height).toBeGreaterThanOrEqual(44);
});
