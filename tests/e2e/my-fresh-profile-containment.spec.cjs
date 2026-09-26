const {test,expect}=require('@playwright/test');

const exact={animations:'disabled',caret:'hide',maxDiffPixels:0};

// Regression target: the exact unsaved MY guidance state that overflowed before a profile was saved.
async function openFreshProfile(page,width=390){
  await page.setViewportSize({width,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({
      route:'profile',
      setupComplete:true,
      region:'수원 · 영통',
      position:'MF',
      level:'중급',
      signedIn:true,
      joinedMatchId:null,
      selectedMatchId:'gwanggyo-2130',
      matchStage:'discover',
      userName:'테스터'
    }));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

test('fresh MY guidance stays inside its card before a profile is saved',async({page})=>{
  await openFreshProfile(page,390);
  const screen=page.locator('[data-screen="profile"]');
  const panel=screen.locator('.fm-personalization-panel--profile');
  const summary=panel.locator('.fm-personalization-head span').first();
  const boundary=panel.locator('.fm-personalization-boundary');
  const save=panel.getByRole('button',{name:'현재 설정 저장'});
  await expect(panel).toBeVisible();
  await expect(screen.locator('.fm-next-topbar > strong')).toHaveCount(0);
  await expect(summary).toHaveText('현재 설정을 다음 방문 시작점으로 저장할 수 있어요.');
  await expect(summary).toHaveCSS('white-space','nowrap');
  await expect(boundary).toHaveText('저장 정보는 브라우저에만 남고 외부 동기화는 없습니다.');
  await expect(boundary).toHaveCSS('white-space','nowrap');
  await expect(save).toBeVisible();
  const geometry=await panel.evaluate(element=>{
    const panel=element.getBoundingClientRect();
    const summary=element.querySelector('.fm-personalization-head span').getBoundingClientRect();
    const save=element.querySelector('[data-personalization-action="save-profile"]').getBoundingClientRect();
    const summaryNode=element.querySelector('.fm-personalization-head span');
    const boundaryNode=element.querySelector('.fm-personalization-boundary');
    return {
      panelLeft:panel.left,
      panelRight:panel.right,
      summaryLeft:summary.left,
      summaryRight:summary.right,
      summaryClientWidth:summaryNode.clientWidth,
      summaryScrollWidth:summaryNode.scrollWidth,
      boundaryClientWidth:boundaryNode.clientWidth,
      boundaryScrollWidth:boundaryNode.scrollWidth,
      saveLeft:save.left,
      saveRight:save.right
    };
  });
  expect(geometry.summaryLeft).toBeGreaterThanOrEqual(geometry.panelLeft);
  expect(geometry.summaryRight).toBeLessThanOrEqual(geometry.panelRight);
  expect(geometry.summaryScrollWidth).toBeLessThanOrEqual(geometry.summaryClientWidth+1);
  expect(geometry.boundaryScrollWidth).toBeLessThanOrEqual(geometry.boundaryClientWidth+1);
  expect(geometry.saveLeft).toBeGreaterThanOrEqual(geometry.panelLeft);
  expect(geometry.saveRight).toBeLessThanOrEqual(geometry.panelRight);
  await expect(panel).toHaveScreenshot('my-fresh-profile-390.png',exact);
});

for(const width of [320,375,390,430]){
  test(`${width}px fresh MY guidance has no horizontal overflow`,async({page})=>{
    await openFreshProfile(page,width);
    const panel=page.locator('[data-screen="profile"] .fm-personalization-panel--profile');
    await expect(panel).toBeVisible();
    const overflow=await panel.evaluate(element=>{
      const panel=element.getBoundingClientRect();
      const summary=element.querySelector('.fm-personalization-head span').getBoundingClientRect();
      const boundary=element.querySelector('.fm-personalization-boundary').getBoundingClientRect();
      return {panelLeft:panel.left,panelRight:panel.right,summaryLeft:summary.left,summaryRight:summary.right,boundaryLeft:boundary.left,boundaryRight:boundary.right};
    });
    expect(overflow.summaryLeft).toBeGreaterThanOrEqual(overflow.panelLeft);
    expect(overflow.summaryRight).toBeLessThanOrEqual(overflow.panelRight);
    expect(overflow.boundaryLeft).toBeGreaterThanOrEqual(overflow.panelLeft);
    expect(overflow.boundaryRight).toBeLessThanOrEqual(overflow.panelRight);
  });
}