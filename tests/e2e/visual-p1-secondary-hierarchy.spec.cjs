const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
  });
  return items;
}

async function openCleanApp(page,viewport={width:390,height:844}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  return errs;
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

test('P1 keeps secondary discovery controls neutral and readable',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);
  await page.getByRole('button',{name:'전체 보기'}).click();
  const screen=page.locator('[data-screen="discover"]');
  await expect(screen).toBeVisible();
  const state=await screen.evaluate(element=>{
    const chrome=element.querySelector('.fm-discovery-chrome');
    const filter=element.querySelector('.fm-discovery-filter-button');
    return {
      version:document.getElementById('footmate-next')?.dataset.visualP1Version,
      styleInstalled:Boolean(document.getElementById('fm-visual-p1-secondary-hierarchy')),
      chromeShadow:getComputedStyle(chrome).boxShadow,
      chromeBackground:getComputedStyle(chrome).backgroundColor,
      filterBackground:getComputedStyle(filter).backgroundColor,
      filterColor:getComputedStyle(filter).color
    };
  });
  expect(state.version).toBe('1.0.0');
  expect(state.styleInstalled).toBe(true);
  expect(state.chromeShadow).toBe('none');
  expect(state.chromeBackground).toBe('rgba(0, 0, 0, 0)');
  expect(state.filterBackground).toBe('rgb(255, 255, 255)');
  expect(state.filterColor).toBe('rgb(7, 61, 43)');
  await page.getByRole('button',{name:'필터 열기'}).click();
  const kickerSize=await page.locator('.fm-discovery-sheet-head small').evaluate(node=>parseFloat(getComputedStyle(node).fontSize));
  expect(kickerSize).toBeGreaterThanOrEqual(11);
  expect(errs).toEqual([]);
});

test('P1 flattens nested decision cards and keeps microcopy at the readability floor',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setupToHome(page);
  await page.locator('[data-screen="home"] .fm-next-match-card').first().click();
  const detail=page.locator('[data-screen="detail"]');
  await expect(detail).toBeVisible();
  const state=await detail.evaluate(element=>{
    const nested=element.querySelector('.fm-decision-reason-grid>div');
    const policySmall=element.querySelector('.fm-decision-policy-grid small');
    return {
      nestedBackground:getComputedStyle(nested).backgroundColor,
      nestedShadow:getComputedStyle(nested).boxShadow,
      nestedRadius:parseFloat(getComputedStyle(nested).borderRadius),
      policySmall:parseFloat(getComputedStyle(policySmall).fontSize)
    };
  });
  expect(state.nestedBackground).toBe('rgb(247, 249, 247)');
  expect(state.nestedShadow).toBe('none');
  expect(state.nestedRadius).toBe(14);
  expect(state.policySmall).toBeGreaterThanOrEqual(11);
  expect(errs).toEqual([]);
});