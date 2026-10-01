const {test,expect}=require('@playwright/test');

async function chooseSetupDefaultIfNeeded(page){
  const setup=page.locator('[data-screen="setup"]');
  if(!await setup.isVisible().catch(()=>false))return;
  if(await setup.locator('[data-action="choose-setup"][aria-pressed="true"]').count())return;
  const field=await setup.locator('[data-action="choose-setup"]').first().getAttribute('data-field');
  const value={region:'수원 · 영통',position:'MF',level:'중급'}[field];
  if(value)await setup.locator(`[data-action="choose-setup"][data-value="${value}"]`).click();
}

async function openDesktopAuth(page){
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');

  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:'다음'}).click();
  await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:'다음'}).click();
  await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();

  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await expect(page.locator('[data-screen="auth"]')).toHaveClass(/fm-next-auth-v3/);
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function desktopHorizontalState(page){
  return page.locator('[data-screen="auth"]').evaluate(auth=>{
    const rect=node=>{const box=node.getBoundingClientRect();return {left:box.left,right:box.right,width:box.width}};
    const app=auth.closest('.fm-next-app');
    const stage=auth.closest('.fm-next-stage');
    const pageRoot=auth.closest('.fm-next-page');
    const card=auth.querySelector('.fm-auth-card');
    const style=getComputedStyle(auth);
    const cardStyle=getComputedStyle(card);
    return {
      viewport:innerWidth,
      windowScrollX:scrollX,
      documentWidth:document.documentElement.scrollWidth,
      bodyWidth:document.body.scrollWidth,
      authScrollLeft:auth.scrollLeft,
      appScrollLeft:app?.scrollLeft||0,
      stageScrollLeft:stage?.scrollLeft||0,
      pageScrollLeft:pageRoot?.scrollLeft||0,
      authOverflowX:style.overflowX,
      authOverscrollX:style.overscrollBehaviorX,
      authClientHeight:auth.clientHeight,
      authScrollHeight:auth.scrollHeight,
      authBackground:style.backgroundColor,
      cardBackground:cardStyle.backgroundColor,
      cardBorderTopWidth:cardStyle.borderTopWidth,
      cardBorderRadius:cardStyle.borderRadius,
      cardBoxShadow:cardStyle.boxShadow,
      auth:rect(auth),
      app:rect(app),
      stage:rect(stage)
    };
  });
}

function expectDesktopLocked(state){
  expect(state.windowScrollX).toBe(0);
  expect(state.documentWidth).toBeLessThanOrEqual(state.viewport);
  expect(state.bodyWidth).toBeLessThanOrEqual(state.viewport);
  expect(state.authScrollLeft).toBe(0);
  expect(state.appScrollLeft).toBe(0);
  expect(state.stageScrollLeft).toBe(0);
  expect(state.pageScrollLeft).toBe(0);
  expect(['hidden','clip']).toContain(state.authOverflowX);
  expect(state.authOverscrollX).toBe('none');
  expect(Math.abs((state.app.left+state.app.right)/2-state.viewport/2)).toBeLessThanOrEqual(1);
  expect(state.authScrollHeight).toBeLessThanOrEqual(state.authClientHeight+1);
  expect(state.authBackground).toBe('rgb(255, 255, 255)');
  expect(state.cardBackground).toBe('rgba(0, 0, 0, 0)');
  expect(state.cardBorderTopWidth).toBe('0px');
  expect(state.cardBorderRadius).toBe('0px');
  expect(state.cardBoxShadow).toBe('none');
}

test('1440px PC Auth stays flat and fixed without nested whitespace or horizontal motion',async({page})=>{
  await openDesktopAuth(page);
  const auth=page.locator('[data-screen="auth"]');
  const box=await auth.boundingBox();
  expect(box).toBeTruthy();

  const before=await desktopHorizontalState(page);
  expectDesktopLocked(before);

  await page.mouse.move(box.x+box.width/2,Math.min(box.y+220,850));
  await page.mouse.wheel(1400,0);
  await page.waitForTimeout(80);
  const afterRight=await desktopHorizontalState(page);
  expectDesktopLocked(afterRight);

  await page.mouse.wheel(-1400,0);
  await page.waitForTimeout(80);
  const afterLeft=await desktopHorizontalState(page);
  expectDesktopLocked(afterLeft);

  for(const key of ['left','right','width']){
    expect(afterRight.auth[key]).toBeCloseTo(before.auth[key],1);
    expect(afterRight.app[key]).toBeCloseTo(before.app[key],1);
    expect(afterLeft.auth[key]).toBeCloseTo(before.auth[key],1);
    expect(afterLeft.app[key]).toBeCloseTo(before.app[key],1);
  }
});
