const {test,expect}=require('@playwright/test');

const exact={animations:'disabled',caret:'hide',maxDiffPixels:0};
const REMOVED_FEATURE_COPY='현재 지역·포지션·레벨을 다음 방문의 시작점으로 저장할 수 있어요.';
const BROWSER_ONLY_COPY='저장한 설정은 이 브라우저에만 저장되며 다른 기기와 동기화되지 않습니다.';

// Regression target: fresh MY keeps the title and CTA while omitting the redundant feature-description line.
async function openFreshProfile(page,width=390){
  await page.setViewportSize({width,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({route:'profile',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:true,joinedMatchId:null,selectedMatchId:'gwanggyo-2130',matchStage:'discover',userName:'테스터'}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

test('fresh MY keeps its title and CTA without the feature description',async({page})=>{
  await openFreshProfile(page,390);
  const screen=page.locator('[data-screen="profile"]');
  const panel=screen.locator('.fm-personalization-panel--profile');
  const boundary=panel.locator('.fm-personalization-boundary');
  const save=panel.getByRole('button',{name:'현재 설정 저장'});
  await expect(panel).toBeVisible();
  await expect(screen.locator('.fm-next-topbar > strong')).toHaveCount(0);
  await expect(panel.getByText('추천 프로필을 저장해보세요',{exact:true})).toBeVisible();
  await expect(panel.getByText(REMOVED_FEATURE_COPY,{exact:true})).toHaveCount(0);
  await expect(panel.locator('.fm-personalization-head span')).toHaveCount(0);
  await expect(boundary).toHaveText(BROWSER_ONLY_COPY);
  await expect(boundary).toHaveCSS('white-space','nowrap');
  await expect(save).toBeVisible();
  const geometry=await panel.evaluate(element=>{
    const panel=element.getBoundingClientRect();
    const boundaryNode=element.querySelector('.fm-personalization-boundary');
    const boundary=boundaryNode.getBoundingClientRect();
    const save=element.querySelector('[data-personalization-action="save-profile"]').getBoundingClientRect();
    return {panelLeft:panel.left,panelRight:panel.right,boundaryLeft:boundary.left,boundaryRight:boundary.right,boundaryClientWidth:boundaryNode.clientWidth,boundaryScrollWidth:boundaryNode.scrollWidth,saveLeft:save.left,saveRight:save.right,documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  });
  expect(geometry.boundaryLeft).toBeGreaterThanOrEqual(geometry.panelLeft);
  expect(geometry.boundaryRight).toBeLessThanOrEqual(geometry.panelRight);
  expect(geometry.boundaryScrollWidth).toBeLessThanOrEqual(geometry.boundaryClientWidth+1);
  expect(geometry.saveLeft).toBeGreaterThanOrEqual(geometry.panelLeft);
  expect(geometry.saveRight).toBeLessThanOrEqual(geometry.panelRight);
  expect(geometry.documentOverflow).toBeLessThanOrEqual(1);
  await expect(panel).toHaveScreenshot('my-fresh-profile-390.png',exact);
});

for(const width of [320,375,390,430]){
  test(`${width}px fresh MY has no horizontal overflow`,async({page})=>{
    await openFreshProfile(page,width);
    const panel=page.locator('[data-screen="profile"] .fm-personalization-panel--profile');
    await expect(panel).toBeVisible();
    await expect(panel.getByText(REMOVED_FEATURE_COPY,{exact:true})).toHaveCount(0);
    const overflow=await panel.evaluate(element=>{
      const panel=element.getBoundingClientRect();
      const boundaryNode=element.querySelector('.fm-personalization-boundary');
      const boundary=boundaryNode.getBoundingClientRect();
      return {panelLeft:panel.left,panelRight:panel.right,boundaryLeft:boundary.left,boundaryRight:boundary.right,boundaryClientWidth:boundaryNode.clientWidth,boundaryScrollWidth:boundaryNode.scrollWidth,documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    });
    expect(overflow.boundaryLeft).toBeGreaterThanOrEqual(overflow.panelLeft);
    expect(overflow.boundaryRight).toBeLessThanOrEqual(overflow.panelRight);
    expect(overflow.boundaryScrollWidth).toBeLessThanOrEqual(overflow.boundaryClientWidth+1);
    expect(overflow.documentOverflow).toBeLessThanOrEqual(1);
  });
}