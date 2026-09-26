const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

async function seedProfile(page,{width=390,height=844}={}){
  await page.setViewportSize({width,height});
  await page.goto('/demo?resume=1',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({
      route:'profile',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',
      signedIn:false,joinedMatchId:null,selectedMatchId:'gwanggyo-2130',matchStage:'discover',userName:'게스트'
    }));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
}

async function geometry(page){
  return page.locator('[data-screen="profile"]').evaluate(screen=>{
    const rect=node=>node.getBoundingClientRect();
    const app=rect(screen.closest('.fm-next-app'));
    const panel=rect(screen.querySelector('.fm-personalization-panel--profile'));
    const summary=rect(screen.querySelector('.fm-personalization-panel--profile .fm-personalization-head>div:first-child>span'));
    const title=rect(screen.querySelector('.fm-next-topbar>strong'));
    const nav=rect(screen.querySelector('.fm-next-nav'));
    return {
      appLeft:app.left,appRight:app.right,appCenter:app.left+app.width/2,
      panelLeft:panel.left,panelRight:panel.right,
      summaryLeft:summary.left,summaryRight:summary.right,
      titleCenter:title.left+title.width/2,
      navLeft:nav.left,navRight:nav.right,
      scrollWidth:screen.scrollWidth,clientWidth:screen.clientWidth
    };
  });
}

test('MY stays contained and centered across supported Real App widths',async({page})=>{
  for(const width of [320,375,390,402,430]){
    await seedProfile(page,{width,height:844});
    const screen=page.locator('[data-screen="profile"]');
    const panel=screen.locator('.fm-personalization-panel--profile');
    const summary=panel.locator('.fm-personalization-head>div:first-child>span');
    const g=await geometry(page);
    expect(g.scrollWidth-g.clientWidth).toBeLessThanOrEqual(1);
    expect(g.summaryLeft).toBeGreaterThanOrEqual(g.panelLeft-1);
    expect(g.summaryRight).toBeLessThanOrEqual(g.panelRight+1);
    expect(g.navLeft).toBeGreaterThanOrEqual(g.appLeft-1);
    expect(g.navRight).toBeLessThanOrEqual(g.appRight+1);
    expect(Math.abs(g.titleCenter-g.appCenter)).toBeLessThanOrEqual(1);
    await expect(screen.locator('.fm-next-topbar .fm-next-brand')).toHaveCount(0);
    await expect(summary).toContainText('현재 지역·포지션·레벨');
  }
});

test('MY personalization save edit and reset flows remain usable and axe-clean',async({page})=>{
  await seedProfile(page,{width:390,height:844});
  const screen=page.locator('[data-screen="profile"]');
  const panel=screen.locator('.fm-personalization-panel--profile');
  await panel.getByRole('button',{name:'현재 설정 저장'}).click();
  await expect(panel.getByRole('button',{name:'수정',exact:true})).toBeVisible();
  await panel.getByRole('button',{name:'수정',exact:true}).click();
  await panel.getByRole('button',{name:'21시 이후'}).click();
  await expect(panel.getByRole('button',{name:'변경사항 저장'})).toBeVisible();
  await panel.getByRole('button',{name:'변경사항 저장'}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:personalization')).favorites.timeWindows)).toContain('21+');
  await panel.getByRole('button',{name:'개인화 기록 초기화'}).click();
  expect(await page.evaluate(()=>localStorage.getItem('footmate:v4:personalization'))).toBeNull();
  await expect(panel.getByRole('button',{name:'현재 설정 저장'})).toBeVisible();
  const result=await new AxeBuilder({page}).include('[data-screen="profile"]').withTags(['wcag2a','wcag2aa']).analyze();
  expect(result.violations.filter(item=>['serious','critical'].includes(item.impact))).toEqual([]);
});

test('MY unsaved profile visual regression at 390px',async({page})=>{
  await seedProfile(page,{width:390,height:844});
  await expect(page.locator('[data-screen="profile"]')).toHaveScreenshot('my-tab-unsaved-390.png',{animations:'disabled',caret:'hide'});
});
