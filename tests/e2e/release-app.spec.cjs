const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const shot={animations:'disabled',caret:'hide',maxDiffPixels:50};
const productionSmoke=['1','true','yes'].includes(String(process.env.PRODUCTION_SMOKE||'').toLowerCase());

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`)});
  return items;
}

async function expectNoHorizontalOverflow(page){
  const geometry=await page.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,shell:document.querySelector('.fm-next-app')?.getBoundingClientRect().width||0}));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport+1);
  expect(geometry.bodyWidth).toBeLessThanOrEqual(geometry.viewport+1);
  expect(geometry.shell).toBeLessThanOrEqual(Math.min(560,geometry.viewport+1));
}

async function expectAxeClean(page,selector){
  const result=await new AxeBuilder({page}).include(selector).withTags(['wcag2a','wcag2aa']).analyze();
  expect(result.violations.filter(item=>['serious','critical'].includes(item.impact))).toEqual([]);
}

async function waitForReleaseReady(page){
  await page.waitForFunction(()=>window.__FOOTMATE_RELEASE_APP__?.version==='6.0.0');
}

async function waitForFonts(page){
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function openCleanApp(page,viewport={width:1440,height:900}){
  const errs=failures(page);
  // Stabilize display dates without changing session or participation timestamps.
  if(!productionSmoke)await require('./sample-date-fixture.cjs')(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await waitForReleaseReady(page);
  await waitForFonts(page);
  return errs;
}

async function chooseDefault(page){
  const setup=page.locator('[data-screen="setup"]');
  const chosen=setup.locator('[data-action="choose-setup"][aria-pressed="true"]');
  if(await chosen.count())return;
  const first=setup.locator('[data-action="choose-setup"]').first();
  const field=await first.getAttribute('data-field');
  const value={region:'수원 · 영통',position:'MF',level:'중급'}[field];
  await setup.locator(`[data-action="choose-setup"][data-value="${value}"]`).click();
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await chooseDefault(page);await page.getByRole('button',{name:'다음'}).click();
  await chooseDefault(page);await page.getByRole('button',{name:'다음'}).click();
  await chooseDefault(page);await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function openDetail(page){
  await page.locator('[data-screen="home"] .fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
}

async function reachJoin(page){
  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('textbox',{name:'아이디'}).fill('member01');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();
  const join=page.locator('[data-screen="checkout"]');
  await expect(join).toBeVisible();
  await expect(join).toHaveAttribute('data-v6-join','free');
}

async function seedSession(page,patch){
  await page.evaluate(patch=>{
    const current=JSON.parse(localStorage.getItem('footmate:session')||'{}');
    localStorage.setItem('footmate:session',JSON.stringify({...current,...patch}));
  },patch);
  await page.reload({waitUntil:'domcontentloaded'});
  await waitForReleaseReady(page);
  await waitForFonts(page);
}

test('Release App flattens desktop Detail into one decision surface',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);await openDetail(page);
  const screen=page.locator('[data-screen="detail"]');
  await expect(screen).toHaveAttribute('data-v6-detail','true');
  const geometry=await screen.locator('.fm-next-detail-section').first().evaluate(node=>({
    radius:getComputedStyle(node).borderRadius,
    shadow:getComputedStyle(node).boxShadow,
    background:getComputedStyle(node).backgroundColor
  }));
  expect(geometry.radius).toBe('0px');
  expect(geometry.shadow).toBe('none');
  expect(geometry.background).toBe('rgba(0, 0, 0, 0)');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('v6-release-detail-1440.png',shot);
  expect(errs).toEqual([]);
});

test('Release App replaces simulated payment with free join and hands ownership to MY',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);await openDetail(page);await reachJoin(page);
  const join=page.locator('[data-screen="checkout"]');
  await expect(join.locator('.fm-next-topbar>strong')).toHaveText('참가 확인');
  await expect(join.locator('[data-v6-hidden-payment="true"]')).toBeHidden();
  await expect(page.getByRole('button',{name:'무료로 참가 확정'})).toBeVisible();
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('v6-release-join-1440.png',shot);
  await page.getByRole('button',{name:'무료로 참가 확정'}).click();
  await waitForReleaseReady(page);
  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('v6-release-success-1440.png',shot);
  const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:participation')||'{}'));
  expect(snapshot.amount).toBe(0);
  expect(snapshot.paymentMethod).toBe('none');
  await page.getByRole('button',{name:'내 경기 보기'}).click();
  const profile=page.locator('[data-screen="profile"]');
  await expect(profile).toBeVisible();
  await expect(profile).toHaveAttribute('data-v6-my','true');
  await expect(profile.locator('[data-my-matches]')).toContainText('내 경기');
  const hierarchy=await profile.evaluate(node=>{
    const margin=selector=>{const item=node.querySelector(selector);return item?parseFloat(getComputedStyle(item).marginTop):null};
    return {saved:margin('[data-v6-my-section="saved"]'),profile:margin('[data-v6-my-section="profile"]'),settings:margin('[data-v6-settings-label]')};
  });
  expect(hierarchy.saved===null||hierarchy.saved>=30).toBe(true);
  expect(hierarchy.profile).toBeGreaterThanOrEqual(36);
  expect(hierarchy.settings).toBeGreaterThanOrEqual(36);
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('v6-release-my-upcoming-1440.png',shot);
  expect(errs).toEqual([]);
});

test('Release App free Join failure is recoverable without leaving a stuck button',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);await openDetail(page);await reachJoin(page);
  const validMatchId=await page.evaluate(()=>{
    const current=JSON.parse(localStorage.getItem('footmate:session')||'{}');
    localStorage.setItem('footmate:session',JSON.stringify({...current,selectedMatchId:'missing-match'}));
    return current.selectedMatchId;
  });
  await page.getByRole('button',{name:'무료로 참가 확정'}).click();
  const join=page.locator('[data-screen="checkout"]');
  await expect(join).toHaveAttribute('data-v6-join-state','error');
  await expect(join.getByRole('alert')).toContainText('참가를 확정하지 못했어요.');
  await expect(join.getByRole('button',{name:'다시 시도'})).toBeEnabled();
  await expect(join.getByRole('button',{name:'경기 다시 선택'})).toBeVisible();
  await page.evaluate(matchId=>{
    const current=JSON.parse(localStorage.getItem('footmate:session')||'{}');
    localStorage.setItem('footmate:session',JSON.stringify({...current,selectedMatchId:matchId}));
  },validMatchId);
  await join.getByRole('button',{name:'다시 시도'}).click();
  await waitForReleaseReady(page);
  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('legacy Schedule state migrates into canonical MY ownership',async({page})=>{
  const errs=await openCleanApp(page);
  await page.evaluate(()=>localStorage.setItem('footmate:session',JSON.stringify({schemaVersion:2,route:'schedule',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:true,matchStage:'discover'})));
  await page.reload({waitUntil:'domcontentloaded'});
  await waitForReleaseReady(page);
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  const route=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:session')||'{}').route);
  expect(route).toBe('profile');
  expect(errs).toEqual([]);
});

test('Home lifecycle closes Return and hands the next action back to Discover',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);
  const matchId=await page.locator('[data-screen="home"] .fm-next-match-card').first().getAttribute('data-match-id');
  await seedSession(page,{route:'home',signedIn:true,joinedMatchId:matchId,selectedMatchId:matchId,matchStage:'upcoming'});
  const lifecycle=page.locator('[data-v6-lifecycle="upcoming"]');
  await expect(lifecycle).toBeVisible();
  await page.mouse.move(1,1);
  if(!productionSmoke)await expect(page).toHaveScreenshot('v6-release-home-upcoming-1440.png',shot);
  await lifecycle.getByRole('button',{name:'내 경기 보기'}).click();
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await seedSession(page,{route:'profile',matchStage:'postgame'});
  const panel=page.locator('[data-v6-return="draft"]');
  await expect(panel).toBeVisible();
  await panel.getByRole('button',{name:'적당했어요'}).click();
  await panel.getByRole('button',{name:'네, 비슷하게'}).click();
  await panel.getByRole('button',{name:'평가 저장'}).click();
  await expect(page.locator('[data-v6-return="saved"]')).toBeVisible();
  await page.mouse.move(1,1);
  if(!productionSmoke)await expect(page).toHaveScreenshot('v6-release-my-postgame-1440.png',shot);
  await seedSession(page,{route:'home',matchStage:'postgame'});
  const complete=page.locator('[data-v6-lifecycle="complete"]');
  await expect(complete).toBeVisible();
  await expect(complete).toContainText('경기 기록을 저장했어요.');
  await page.mouse.move(1,1);
  if(!productionSmoke)await expect(page).toHaveScreenshot('v6-release-home-complete-1440.png',shot);
  await complete.getByRole('button',{name:'다음 경기 찾기'}).click();
  await waitForReleaseReady(page);
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('Release App mobile changed surfaces match approved visual baselines',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  const matchId=await page.locator('[data-screen="home"] .fm-next-match-card').first().getAttribute('data-match-id');
  await seedSession(page,{route:'home',signedIn:true,joinedMatchId:matchId,selectedMatchId:matchId,matchStage:'upcoming'});
  await expect(page.locator('[data-v6-lifecycle="upcoming"]')).toBeVisible();
  await expect(page.locator('[data-screen="home"]')).toHaveScreenshot('v6-release-home-upcoming-390.png',shot);

  await seedSession(page,{route:'home',signedIn:false,joinedMatchId:null,matchStage:'discover'});
  await openDetail(page);await reachJoin(page);
  await expect(page.locator('[data-screen="checkout"]')).toHaveScreenshot('v6-release-join-390.png',shot);

  await page.clock.install({time:new Date('2026-10-01T21:56:00.000Z')});
  await page.evaluate(({matchId})=>localStorage.setItem('footmate:v4:matchday',JSON.stringify({matchId,status:'upcoming',startsAt:new Date(Date.now()+10*60000).toISOString()})),{matchId});
  await seedSession(page,{route:'profile',signedIn:true,joinedMatchId:matchId,selectedMatchId:matchId,matchStage:'matchday'});
  await expect(page.locator('[data-screen="profile"]')).toHaveScreenshot('v6-release-my-matchday-390.png',shot);

  await seedSession(page,{route:'profile',matchStage:'postgame'});
  await expect(page.locator('[data-v6-return="draft"]')).toBeVisible();
  await expect(page.locator('[data-screen="profile"]')).toHaveScreenshot('v6-release-my-postgame-390.png',shot);
  expect(errs).toEqual([]);
});

test('Release App 320px Join keeps the compact visual contract',async({page})=>{
  const errs=await openCleanApp(page,{width:320,height:844});
  await setupToHome(page);await openDetail(page);await reachJoin(page);
  await expectNoHorizontalOverflow(page);
  await expect(page.locator('[data-screen="checkout"]')).toHaveScreenshot('v6-release-join-320.png',shot);
  expect(errs).toEqual([]);
});

for(const width of [320,375,390,430]){
  test(`Release App mobile Detail, free Join and MY stay overflow-safe and accessible at ${width}px`,async({page})=>{
    const errs=await openCleanApp(page,{width,height:844});
    await setupToHome(page);
    await expectNoHorizontalOverflow(page);
    await openDetail(page);
    await expectNoHorizontalOverflow(page);
    await expect(page.locator('[data-screen="detail"]')).toHaveAttribute('data-v6-detail','true');
    if(width===390)await expectAxeClean(page,'[data-screen="detail"]');
    await reachJoin(page);
    await expectNoHorizontalOverflow(page);
    const join=page.locator('[data-screen="checkout"]');
    await expect(join.locator('[data-v6-hidden-payment="true"]')).toBeHidden();
    if(width===390)await expectAxeClean(page,'[data-screen="checkout"]');
    await page.getByRole('button',{name:'무료로 참가 확정'}).click();
    await waitForReleaseReady(page);
    await expect(page.locator('[data-screen="success"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button',{name:'내 경기 보기'}).click();
    const my=page.locator('[data-screen="profile"]');
    await expect(my).toHaveAttribute('data-v6-my','true');
    await expectNoHorizontalOverflow(page);
    if(width===390)await expectAxeClean(page,'[data-screen="profile"]');
    expect(errs).toEqual([]);
  });
}

test('Release App keeps Matchday operations inside MY',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  const matchId=await page.locator('[data-screen="home"] .fm-next-match-card').first().getAttribute('data-match-id');
  await page.evaluate(({matchId})=>localStorage.setItem('footmate:v4:matchday',JSON.stringify({matchId,status:'upcoming',startsAt:new Date(Date.now()+10*60000).toISOString()})),{matchId});
  await seedSession(page,{route:'profile',signedIn:true,joinedMatchId:matchId,selectedMatchId:matchId,matchStage:'matchday'});
  const my=page.locator('[data-screen="profile"]');
  await expect(my).toHaveAttribute('data-v6-my','true');
  const matchday=my.getByRole('region',{name:'경기 당일 운영'});
  await expect(matchday).toBeVisible();
  await expect(matchday).toHaveAttribute('data-matchday-version','4.5.0');
  await expectNoHorizontalOverflow(page);
  await expectAxeClean(page,'[data-screen="profile"]');
  expect(errs).toEqual([]);
});
