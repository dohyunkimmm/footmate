const {test,expect}=require('@playwright/test');

const exact={animations:'disabled',caret:'hide',maxDiffPixels:0};

async function openProfile(page,{width=390,signedIn=true,joinedMatchId=null,matchStage='discover'}={}){
  await page.setViewportSize({width,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(({signedIn,joinedMatchId,matchStage})=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({
      route:'profile',
      setupComplete:true,
      region:'수원 · 영통',
      position:'MF',
      level:'중급',
      signedIn,
      joinedMatchId,
      selectedMatchId:'gwanggyo-2130',
      matchStage,
      userName:signedIn?'테스터':'게스트'
    }));
  },{signedIn,joinedMatchId,matchStage});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

// Regression target: the exact unsaved MY guidance state that overflowed before a profile was saved.
async function openFreshProfile(page,width=390){
  return openProfile(page,{width});
}

test('fresh MY guidance stays inside its card before a profile is saved',async({page})=>{
  await openFreshProfile(page,390);
  const panel=page.locator('[data-screen="profile"] .fm-personalization-panel--profile');
  const summary=panel.locator('.fm-personalization-head span').first();
  const save=panel.getByRole('button',{name:'현재 설정 저장'});
  await expect(panel).toBeVisible();
  await expect(summary).toHaveText('현재 지역·포지션·레벨을 다음 방문의 시작점으로 저장할 수 있어요.');
  await expect(save).toBeVisible();
  const geometry=await panel.evaluate(element=>{
    const panel=element.getBoundingClientRect();
    const summary=element.querySelector('.fm-personalization-head span').getBoundingClientRect();
    const save=element.querySelector('[data-personalization-action="save-profile"]').getBoundingClientRect();
    const summaryNode=element.querySelector('.fm-personalization-head span');
    return {
      panelLeft:panel.left,
      panelRight:panel.right,
      summaryLeft:summary.left,
      summaryRight:summary.right,
      summaryClientWidth:summaryNode.clientWidth,
      summaryScrollWidth:summaryNode.scrollWidth,
      saveLeft:save.left,
      saveRight:save.right
    };
  });
  expect(geometry.summaryLeft).toBeGreaterThanOrEqual(geometry.panelLeft);
  expect(geometry.summaryRight).toBeLessThanOrEqual(geometry.panelRight);
  expect(geometry.summaryScrollWidth).toBeLessThanOrEqual(geometry.summaryClientWidth+1);
  expect(geometry.saveLeft).toBeGreaterThanOrEqual(geometry.panelLeft);
  expect(geometry.saveRight).toBeLessThanOrEqual(geometry.panelRight);
  await expect(panel).toHaveScreenshot('my-fresh-profile-390.png',exact);
});

test('guest MY owns the empty match entry and the Real App shell has three primary tabs',async({page})=>{
  await openProfile(page,{width:390,signedIn:false});
  const screen=page.locator('[data-screen="profile"]');
  const hub=screen.locator('[data-my-matchday-hub]');
  const nav=screen.locator('.fm-next-nav');
  await expect(hub).toBeVisible();
  await expect(hub.getByRole('heading',{name:'내 경기'})).toBeVisible();
  await expect(hub.getByText('아직 참가한 경기가 없어요')).toBeVisible();
  await expect(hub.getByRole('button',{name:'경기 찾기'})).toBeVisible();
  await expect(nav.locator('button')).toHaveCount(3);
  expect(await nav.locator('button').evaluateAll(nodes=>nodes.map(node=>node.textContent.trim()))).toEqual(['홈','경기 찾기','MY']);
  await expect(nav.locator('[data-action="nav-schedule"]')).toHaveCount(0);
  const order=await screen.evaluate(element=>{
    const hub=element.querySelector('[data-my-matchday-hub]').getBoundingClientRect();
    const profile=element.querySelector('.fm-next-profile-card').getBoundingClientRect();
    return {hubTop:hub.top,hubBottom:hub.bottom,profileTop:profile.top};
  });
  expect(order.hubTop).toBeLessThan(order.profileTop);
  expect(order.hubBottom).toBeLessThanOrEqual(order.profileTop);
  await expect(screen).toHaveScreenshot('my-matchday-hub-empty-390.png',exact);
});

test('joined match is surfaced from MY and its detail remains nested under MY navigation',async({page})=>{
  await openProfile(page,{width:390,signedIn:true,joinedMatchId:'gwanggyo-2130',matchStage:'upcoming'});
  const hub=page.locator('[data-screen="profile"] [data-my-matchday-hub]');
  await expect(hub).toBeVisible();
  await expect(hub.getByText('다가오는 경기')).toBeVisible();
  const title=hub.locator('.fm-my-matchday-hub__body strong');
  await expect(title).not.toHaveText('');
  await hub.getByRole('button',{name:'내 경기 상세 보기'}).click();
  const schedule=page.locator('[data-screen="schedule"]');
  await expect(schedule).toBeVisible();
  const nav=schedule.locator('.fm-next-nav');
  await expect(nav.locator('button')).toHaveCount(3);
  await expect(nav.locator('[data-action="nav-profile"]')).toHaveAttribute('aria-current','page');
  await expect(nav.locator('[data-action="nav-schedule"]')).toHaveCount(0);
});

for(const width of [320,375,390,430]){
  test(`${width}px fresh MY guidance has no horizontal overflow`,async({page})=>{
    await openFreshProfile(page,width);
    const panel=page.locator('[data-screen="profile"] .fm-personalization-panel--profile');
    await expect(panel).toBeVisible();
    const overflow=await panel.evaluate(element=>{
      const panel=element.getBoundingClientRect();
      const summary=element.querySelector('.fm-personalization-head span').getBoundingClientRect();
      return {panelLeft:panel.left,panelRight:panel.right,summaryLeft:summary.left,summaryRight:summary.right};
    });
    expect(overflow.summaryLeft).toBeGreaterThanOrEqual(overflow.panelLeft);
    expect(overflow.summaryRight).toBeLessThanOrEqual(overflow.panelRight);
  });
}
