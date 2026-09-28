const {test,expect}=require('@playwright/test');

async function waitForApp(page){
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.waitForFunction(()=>window.__FOOTMATE_P1_DECISION_CLARITY__?.version==='1.0.0');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function openClean(page){
  await page.setViewportSize({width:390,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'domcontentloaded'});
  await waitForApp(page);
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

test('Discover filter edits stay draft until Result view commit',async({page})=>{
  await openClean(page);
  await setSession(page,'discover');
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await waitForApp(page);
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();

  await page.locator('[data-discovery-action="open-filters"]').click();
  const sheet=page.locator('[data-discovery-sheet="true"]');
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('[data-p1-discovery-draft-status]')).toHaveText('현재 적용된 조건입니다.');

  await sheet.locator('[data-discovery-field="distance"]').selectOption('20');
  await expect(sheet.locator('[data-p1-discovery-draft-status]')).toHaveText('변경 사항이 아직 적용되지 않았어요.');
  expect(await page.evaluate(()=>window.__FOOTMATE_DISCOVERY__.getState().distance)).toBe('all');
  expect(new URL(page.url()).searchParams.get('d_distance')).toBeNull();

  await sheet.locator('.fm-discovery-close').click();
  expect(await page.evaluate(()=>window.__FOOTMATE_DISCOVERY__.getState().distance)).toBe('all');

  await page.locator('[data-discovery-action="open-filters"]').click();
  const reopened=page.locator('[data-discovery-sheet="true"]');
  await reopened.locator('[data-discovery-field="distance"]').selectOption('20');
  await reopened.locator('.fm-discovery-done').click();
  await expect(page.locator('[data-discovery-sheet="true"]')).toHaveCount(0);
  expect(await page.evaluate(()=>window.__FOOTMATE_DISCOVERY__.getState().distance)).toBe('20');
  expect(new URL(page.url()).searchParams.get('d_distance')).toBe('20');
  await expect(page.locator('.fm-discovery-chip')).toContainText('20분 이내');
});

test('Discover sheet reset remains a draft until Result view commit',async({page})=>{
  await openClean(page);
  await setSession(page,'discover');
  await page.goto('/app?resume=1&d_distance=20',{waitUntil:'domcontentloaded'});
  await waitForApp(page);
  await expect(page.locator('.fm-discovery-chip')).toContainText('20분 이내');

  await page.locator('[data-discovery-action="open-filters"]').click();
  const sheet=page.locator('[data-discovery-sheet="true"]');
  await sheet.locator('.fm-discovery-reset').click();
  expect(await page.evaluate(()=>window.__FOOTMATE_DISCOVERY__.getState().distance)).toBe('20');
  await expect(sheet.locator('[data-p1-discovery-draft-status]')).toHaveText('변경 사항이 아직 적용되지 않았어요.');
  await sheet.locator('.fm-discovery-done').click();
  expect(await page.evaluate(()=>window.__FOOTMATE_DISCOVERY__.getState().distance)).toBe('all');
  expect(new URL(page.url()).searchParams.get('d_distance')).toBeNull();
});

test('AI decision information keeps an 11px readable floor',async({page})=>{
  await openClean(page);
  await setSession(page,'home');
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await waitForApp(page);
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  const values=await page.locator('[data-screen="home"] .fm-ai-card').evaluate(card=>{
    const selectors=['.fm-ai-mode','.fm-ai-status span','.fm-ai-conditions span','.fm-ai-result-copy small','.fm-ai-result-copy em','.fm-ai-empty span','.fm-ai-guardrail'];
    return selectors.flatMap(selector=>[...card.querySelectorAll(selector)]).filter(node=>getComputedStyle(node).display!=='none').map(node=>({text:(node.textContent||'').trim(),size:parseFloat(getComputedStyle(node).fontSize)}));
  });
  expect(values.length).toBeGreaterThan(0);
  for(const value of values)expect(value.size,value.text).toBeGreaterThanOrEqual(11);
});

test('Checkout keeps the prototype payment boundary adjacent to the primary CTA',async({page})=>{
  await openClean(page);
  await setSession(page,'checkout');
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await waitForApp(page);
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  const note=page.locator('[data-p1-checkout-boundary]');
  const confirm=page.locator('[data-action="confirm-payment"],[data-participation-submit]').first();
  await expect(note).toBeVisible();
  await expect(note).toHaveText('프로토타입 · 실제 결제 없음');
  await expect(confirm).toBeVisible();
  const adjacent=await note.evaluate(node=>node.nextElementSibling?.matches('[data-action="confirm-payment"],[data-participation-submit]')||false);
  expect(adjacent).toBe(true);
});
