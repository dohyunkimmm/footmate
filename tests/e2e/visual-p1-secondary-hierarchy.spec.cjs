const {test,expect}=require('@playwright/test');

async function chooseSetupDefaultIfNeeded(page){
  const setup=page.locator('[data-screen="setup"]');
  if(!await setup.isVisible().catch(()=>false))return;
  if(await setup.locator('[data-action="choose-setup"][aria-pressed="true"]').count())return;
  const field=await setup.locator('[data-action="choose-setup"]').first().getAttribute('data-field');
  const value={region:'수원 · 영통',position:'MF',level:'중급'}[field];
  if(value)await setup.locator(`[data-action="choose-setup"][data-value="${value}"]`).click();
}

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
  await page.waitForFunction(()=>window.__FOOTMATE_P1_DECISION_CLARITY__?.version==='1.0.0');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  return errs;
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await chooseSetupDefaultIfNeeded(page);
  await page.getByRole('button',{name:'다음'}).click();
  await chooseSetupDefaultIfNeeded(page);
  await page.getByRole('button',{name:'다음'}).click();
  await chooseSetupDefaultIfNeeded(page);
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function setSession(page,route,patch={}){
  await page.evaluate(({nextRoute,nextPatch})=>{
    localStorage.setItem('footmate:v4:session',JSON.stringify({
      route:nextRoute,
      setupComplete:true,
      setupStep:2,
      region:'수원 · 영통',
      position:'MF',
      level:'중급',
      signedIn:true,
      joinedMatchId:null,
      selectedMatchId:'suwon-ingye-2000',
      matchStage:'upcoming',
      userName:'도현',
      ...nextPatch
    }));
  },{nextRoute:route,nextPatch:patch});
}

async function reopenRoute(page,route,patch={}){
  await setSession(page,route,patch);
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_P1_DECISION_CLARITY__?.version==='1.0.0');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await expect(page.locator(`[data-screen="${route}"]`)).toBeVisible();
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
  await expect(detail.locator('.fm-decision-reason-grid>div').first()).toBeVisible();
  await expect(detail.locator('.fm-decision-policy-grid small').first()).toBeVisible();
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

test('P1 keeps Discover filter edits as draft until Result view commit',async({page})=>{
  const errs=await openCleanApp(page);
  await reopenRoute(page,'discover');
  await page.locator('[data-discovery-action="open-filters"]').click();
  let sheet=page.locator('[data-discovery-sheet="true"]');
  await expect(sheet.locator('[data-p1-discovery-draft-status]')).toHaveText('현재 적용된 조건입니다.');
  await sheet.locator('[data-discovery-field="distance"]').selectOption('20');
  await expect(sheet.locator('[data-p1-discovery-draft-status]')).toHaveText('변경 사항이 아직 적용되지 않았어요.');
  expect(await page.evaluate(()=>window.__FOOTMATE_DISCOVERY__.getState().distance)).toBe('all');
  expect(new URL(page.url()).searchParams.get('d_distance')).toBeNull();
  await sheet.locator('.fm-discovery-close').click();
  expect(await page.evaluate(()=>window.__FOOTMATE_DISCOVERY__.getState().distance)).toBe('all');

  await page.locator('[data-discovery-action="open-filters"]').click();
  sheet=page.locator('[data-discovery-sheet="true"]');
  await sheet.locator('[data-discovery-field="distance"]').selectOption('20');
  await sheet.locator('.fm-discovery-done').click();
  await expect(page.locator('[data-discovery-sheet="true"]')).toHaveCount(0);
  expect(await page.evaluate(()=>window.__FOOTMATE_DISCOVERY__.getState().distance)).toBe('20');
  expect(new URL(page.url()).searchParams.get('d_distance')).toBe('20');
  await expect(page.locator('.fm-discovery-chip')).toContainText('20분 이내');
  expect(errs).toEqual([]);
});

test('P1 keeps Discover reset as draft until Result view commit',async({page})=>{
  const errs=await openCleanApp(page);
  await setSession(page,'discover');
  await page.goto('/app?resume=1&d_distance=20',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_P1_DECISION_CLARITY__?.version==='1.0.0');
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await expect(page.locator('.fm-discovery-chip')).toContainText('20분 이내');
  await page.locator('[data-discovery-action="open-filters"]').click();
  const sheet=page.locator('[data-discovery-sheet="true"]');
  await sheet.locator('.fm-discovery-reset').click();
  expect(await page.evaluate(()=>window.__FOOTMATE_DISCOVERY__.getState().distance)).toBe('20');
  await expect(sheet.locator('[data-p1-discovery-draft-status]')).toHaveText('변경 사항이 아직 적용되지 않았어요.');
  await sheet.locator('.fm-discovery-done').click();
  expect(await page.evaluate(()=>window.__FOOTMATE_DISCOVERY__.getState().distance)).toBe('all');
  expect(new URL(page.url()).searchParams.get('d_distance')).toBeNull();
  expect(errs).toEqual([]);
});

test('P1 keeps AI decision information at an 11px readable floor',async({page})=>{
  const errs=await openCleanApp(page);
  await reopenRoute(page,'home');
  const values=await page.locator('[data-screen="home"] .fm-ai-card').evaluate(card=>{
    const selectors=['.fm-ai-mode','.fm-ai-status span','.fm-ai-conditions span','.fm-ai-result-copy small','.fm-ai-result-copy em','.fm-ai-empty span','.fm-ai-guardrail'];
    return selectors.flatMap(selector=>[...card.querySelectorAll(selector)])
      .filter(node=>getComputedStyle(node).display!=='none')
      .map(node=>({text:(node.textContent||'').trim(),size:parseFloat(getComputedStyle(node).fontSize)}));
  });
  expect(values.length).toBeGreaterThan(0);
  for(const value of values)expect(value.size,value.text).toBeGreaterThanOrEqual(11);
  expect(errs).toEqual([]);
});

test('P1 keeps the prototype payment boundary adjacent to the Checkout CTA',async({page})=>{
  const errs=await openCleanApp(page);
  await reopenRoute(page,'checkout');
  const note=page.locator('[data-p1-checkout-boundary]');
  const confirm=page.locator('[data-action="confirm-payment"],[data-participation-submit]').first();
  await expect(note).toBeVisible();
  await expect(note).toHaveText('프로토타입 · 실제 결제 없음');
  await expect(confirm).toBeVisible();
  const adjacent=await note.evaluate(node=>node.nextElementSibling?.matches('[data-action="confirm-payment"],[data-participation-submit]')||false);
  expect(adjacent).toBe(true);
  expect(errs).toEqual([]);
});
