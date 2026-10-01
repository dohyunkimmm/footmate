const {test,expect}=require('@playwright/test');

async function chooseSetupDefaultIfNeeded(page){
  const setup=page.locator('[data-screen="setup"]');
  if(!await setup.isVisible().catch(()=>false))return;
  if(await setup.locator('[data-action="choose-setup"][aria-pressed="true"]').count())return;
  const field=await setup.locator('[data-action="choose-setup"]').first().getAttribute('data-field');
  const value={region:'수원 · 영통',position:'MF',level:'중급'}[field];
  if(value)await setup.locator(`[data-action="choose-setup"][data-value="${value}"]`).click();
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:'다음'}).click();
  await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:'다음'}).click();
  await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function expectNoDocumentOverflow(page){
  const geometry=await page.evaluate(()=>({
    viewport:innerWidth,
    documentWidth:document.documentElement.scrollWidth,
    bodyWidth:document.body.scrollWidth,
    shell:document.querySelector('.fm-next-app')?.getBoundingClientRect().width||0,
    nav:document.querySelector('.fm-next-nav')?.getBoundingClientRect().toJSON()||null
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport+1);
  expect(geometry.bodyWidth).toBeLessThanOrEqual(geometry.viewport+1);
  expect(geometry.shell).toBeLessThanOrEqual(Math.min(560,geometry.viewport+1));
  return geometry;
}

async function expectHorizontalPanContainment(page,screenSelector,{auth=false}={}){
  const screen=page.locator(screenSelector).first();
  await expect(screen).toBeVisible();
  const policy=await screen.evaluate(node=>{
    const shell=node.closest('.fm-next-app');
    if(!shell)throw new Error('Real App shell not found');
    const shellStyle=getComputedStyle(shell);
    const screenStyle=getComputedStyle(node);
    return {
      shellTouchAction:shellStyle.touchAction,
      shellOverscrollX:shellStyle.overscrollBehaviorX,
      screenTouchAction:screenStyle.touchAction,
      screenOverscrollX:screenStyle.overscrollBehaviorX,
      screenOverflowX:screenStyle.overflowX,
      rootOverscrollX:getComputedStyle(document.documentElement).overscrollBehaviorX,
      bodyOverscrollX:getComputedStyle(document.body).overscrollBehaviorX
    };
  });
  for(const touchAction of [policy.shellTouchAction,policy.screenTouchAction]){
    const touchTokens=touchAction.split(/\s+/);
    expect(touchTokens).toContain('pan-y');
    expect(touchTokens).toContain('pinch-zoom');
  }
  expect(policy.shellOverscrollX).toBe('none');
  expect(policy.screenOverscrollX).toBe('none');
  expect(policy.rootOverscrollX).toBe('none');
  expect(policy.bodyOverscrollX).toBe('none');
  if(auth)expect(['hidden','clip']).toContain(policy.screenOverflowX);
}

async function reachAuth(page){
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await expectNoDocumentOverflow(page);
  await expectHorizontalPanContainment(page,'[data-screen="detail"]');
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await expectNoDocumentOverflow(page);
  await expectHorizontalPanContainment(page,'[data-screen="auth"]',{auth:true});
}

async function reloadRoute(page,patch){
  await page.evaluate(patch=>{
    const session=JSON.parse(localStorage.getItem('footmate:v4:session')||'{}');
    localStorage.setItem('footmate:v4:session',JSON.stringify({...session,...patch}));
  },patch);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
}

test('Mobile Safari/WebKit keeps the Real App flow geometry, vertical scroll and horizontal pan containment stable',async({page})=>{
  test.setTimeout(90000);
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:844});
    await page.goto('/app',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>localStorage.clear());
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
    expect(await page.evaluate(()=>performance.now())).toBeLessThanOrEqual(4000);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#f7f8f7');
    await expect(page.locator('#footmate-next')).not.toHaveAttribute('aria-live',/.+/);

    await expect(page.locator('[data-screen="welcome"]')).toBeVisible();
    await expectNoDocumentOverflow(page);
    await expectHorizontalPanContainment(page,'[data-screen="welcome"]');

    await setupToHome(page);
    const geometry=await expectNoDocumentOverflow(page);
    await expectHorizontalPanContainment(page,'[data-screen="home"]');
    expect(geometry.nav.width).toBeLessThanOrEqual(width);

    await reachAuth(page);
    const selectedMatchId=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:session')||'{}').selectedMatchId);
    expect(selectedMatchId).toBeTruthy();

    await reloadRoute(page,{route:'success',signedIn:true,joinedMatchId:selectedMatchId,userName:'도현',matchStage:'upcoming'});
    await expect(page.locator('[data-screen="success"]')).toBeVisible();
    await expectNoDocumentOverflow(page);
    await expectHorizontalPanContainment(page,'[data-screen="success"]');

    await reloadRoute(page,{route:'schedule',signedIn:true,joinedMatchId:null,selectedMatchId:null,userName:'도현',matchStage:'upcoming'});
    await expect(page.locator('[data-screen="schedule"] .fm-next-empty')).toContainText('아직 참가한 경기가 없어요.');
    await expectNoDocumentOverflow(page);
    await expectHorizontalPanContainment(page,'[data-screen="schedule"]');
  }
});

const {aiFilters,profileSettings,mediumPriorityUX}=require('./helpers/priority-ux.cjs');
test('high priority AI and filter behavior',async({page})=>{await aiFilters(page);});
test('high priority MY settings and navigation',async({page})=>{await profileSettings(page,async(name,element)=>element.screenshot({path:test.info().outputPath(name+'.png'),animations:'disabled'}));});
test('medium priority Home Discover and MY ownership',async({page})=>{await mediumPriorityUX(page);});

const checkin=require('./helpers/checkin.cjs');
test('Mobile Safari/WebKit shared check-in completion',async({page})=>checkin.persistence(page));
test('Mobile Safari/WebKit check-in eligibility and migration',async({page})=>checkin.gates(page));
test('Mobile Safari/WebKit check-in storage recovery',async({page})=>checkin.recovery(page));
