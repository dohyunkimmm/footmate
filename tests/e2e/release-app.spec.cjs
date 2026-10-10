const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const shot={animations:'disabled',caret:'hide',maxDiffPixels:50};
const productionSmoke=['1','true','yes'].includes(String(process.env.PRODUCTION_SMOKE||'').toLowerCase());

test('desktop review surface explains the sample and remains readable on laptops',async({page})=>{
  const errs=await openCleanApp(page,{width:1366,height:768});
  const context=page.getByRole('complementary',{name:'FootMate 서비스와 체험 안내'});
  await expect(context).toBeVisible();
  await expect(context).toContainText('풋살');
  await expect(context).toContainText('실제 결제는 발생하지 않습니다');
  for(const width of [1366,1440,1920]){
    await page.setViewportSize({width,height:900});
    await expectNoHorizontalOverflow(page);
    expect((await page.locator('.fm-next-app').boundingBox()).width).toBe(560);
  }
  await setupToHome(page);
  await expect(page.locator('[data-desktop-ai-scope]')).toContainText('기본 추천 프로필');
  await expect(page.getByRole('heading',{name:'내 조건에 맞는 추천'})).toBeVisible();
  await openDetail(page);
  await page.getByRole('button',{name:'이전 화면',exact:true}).click();
  await page.getByRole('button',{name:'경기 찾기',exact:true}).click();
  await expect(page.locator('[data-personalization-explanation]')).toBeVisible();
  await page.getByRole('button',{name:'필터 열기'}).click();
  await page.getByRole('combobox',{name:'날짜',exact:true}).selectOption('tomorrow');
  await page.getByRole('combobox',{name:'시간',exact:true}).selectOption('21plus');
  await page.getByRole('combobox',{name:'가격',exact:true}).selectOption('11000');
  await page.getByRole('button',{name:'결과 보기'}).click();
  await expect(page.locator('.fm-discovery-count')).toHaveText('0개 경기');
  await expect(page.locator('[data-personalization-explanation]')).not.toBeVisible();
  await page.getByRole('button',{name:'조건 넓히기'}).press('Tab');
  expect(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineColor)).toBe('rgb(23, 100, 69)');
  await expectAxeClean(page,'#footmate-next');
  expect(errs).toEqual([]);
});

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

// Only normalize rendered date copy for the two desktop MY baselines.
// Real clocks, authentication expiry, participation and check-in timestamps remain live.
async function stabilizeDesktopMyDateCopy(page){
  const patches=[
    ['**/src/app/matchday.js*',
      "new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(new Date(value.startsAt))",
      "new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(new Date('2026-10-09T12:00:00Z'))"],
    ['**/src/platform/application/checkin.js*',
      ".format(new Date(time));",
      ".format((()=>{const displayDate=new Date(time);displayDate.setFullYear(2026,9,9);return displayDate})());"]
  ];
  for(const [url,from,to] of patches){
    await page.route(url,async route=>{
      const response=await route.fetch();
      const source=await response.text();
      expect(source).toContain(from);
      await route.fulfill({response,body:source.replace(from,to)});
    });
  }
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

// Visually reviewed intentional P0/P1 changes create bounded diffs versus the prior approved baseline.
// Limits are local to six affected views; unchanged snapshots retain 50px tolerance.
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
  await expect(page).toHaveScreenshot('v6-release-detail-1440.png',{...shot,maxDiffPixels:12000});
  expect(errs).toEqual([]);
});

test('Release App replaces simulated payment with free join and hands ownership to MY',async({page})=>{
  if(!productionSmoke)await stabilizeDesktopMyDateCopy(page);
  const errs=await openCleanApp(page);
  await setupToHome(page);await openDetail(page);await reachJoin(page);
  const join=page.locator('[data-screen="checkout"]');
  await expect(join.locator('.fm-next-topbar>strong')).toHaveText('참가 확인');
  await expect(join.locator('[data-v6-hidden-payment="true"]')).toBeHidden();
  await expect(page.getByRole('button',{name:'무료로 참가 확정'})).toBeVisible();
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('v6-release-join-1440.png',{...shot,maxDiffPixels:4700});
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
  if(!productionSmoke)await stabilizeDesktopMyDateCopy(page);
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
  if(!productionSmoke)await expect(page).toHaveScreenshot('v6-release-my-postgame-1440.png',{...shot,maxDiffPixels:5000});
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
  await expect(page.locator('[data-screen="home"]')).toHaveScreenshot('v6-release-home-upcoming-390.png',{...shot,maxDiffPixels:850});

  await seedSession(page,{route:'home',signedIn:false,joinedMatchId:null,matchStage:'discover'});
  await openDetail(page);await reachJoin(page);
  await expect(page.locator('[data-screen="checkout"]')).toHaveScreenshot('v6-release-join-390.png',{...shot,maxDiffPixels:4800});

  await page.clock.install({time:new Date('2026-10-01T21:56:00.000Z')});
  await page.evaluate(({matchId})=>localStorage.setItem('footmate:v4:matchday',JSON.stringify({matchId,status:'upcoming',startsAt:new Date(Date.now()+10*60000).toISOString()})),{matchId});
  await seedSession(page,{route:'profile',signedIn:true,joinedMatchId:matchId,selectedMatchId:matchId,matchStage:'matchday'});
  await expect(page.locator('[data-screen="profile"]')).toHaveScreenshot('v6-release-my-matchday-390.png',{...shot,maxDiffPixels:9000});

  await seedSession(page,{route:'profile',matchStage:'postgame'});
  await expect(page.locator('[data-v6-return="draft"]')).toBeVisible();
  await expect(page.locator('[data-screen="profile"]')).toHaveScreenshot('v6-release-my-postgame-390.png',{...shot,maxDiffPixels:10000});
  expect(errs).toEqual([]);
});

test('Release App 320px Join keeps the compact visual contract',async({page})=>{
  const errs=await openCleanApp(page,{width:320,height:844});
  await setupToHome(page);await openDetail(page);await reachJoin(page);
  await expectNoHorizontalOverflow(page);
  await expect(page.locator('[data-screen="checkout"]')).toHaveScreenshot('v6-release-join-320.png',{...shot,maxDiffPixels:5100});
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


test('Real App P0 trust copy distinguishes sample prices from actual zero charge',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  await expect(page.locator('[data-screen="home"] .fm-next-price-sample').first()).toHaveText('샘플');
  await openDetail(page);
  const detail=page.locator('[data-screen="detail"]');
  await expect(detail.locator('.fm-next-detail-summary small').last()).toHaveText('샘플 참가비');
  await expect(detail.locator('.fm-next-sticky-price')).toContainText('무료 체험 · 청구액');
  await expect(detail.locator('.fm-next-sticky-price b')).toHaveText('0원');
  await expect(detail.locator('.fm-decision-trust-note')).toContainText('실제 청구 0원');
  await reachJoin(page);
  await expect(page.locator('[data-screen="checkout"] [data-v6-free-copy]')).toContainText('실제 청구 0원');
  await expect(page.locator('[data-screen="checkout"] [data-p1-checkout-boundary]')).toHaveText('무료 참가 체험 · 실제 청구 0원');
  expect(errs).toEqual([]);
});

test('Real App P1 labels widened recommendations and base discovery filters',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  await seedSession(page,{route:'home',region:'수원 · 영통',position:'FW',level:'입문'});
  await expect(page.locator('[data-screen="home"] .fm-next-match-card').first().locator('.fm-next-fit-badge')).toHaveText(/조건 확장/);
  await page.getByRole('button',{name:'경기 찾기',exact:true}).click();
  const discover=page.locator('[data-screen="discover"]');
  await expect(discover.locator('.fm-next-base-label')).toHaveText('기본 추천');
  await expect(discover.locator('.fm-discovery-default-copy')).toContainText('추가 필터 없음');
  await expect(discover.locator('.fm-next-price-sample').first()).toHaveText('샘플');
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:844});
    await expectNoHorizontalOverflow(page);
  }
  expect(errs).toEqual([]);
});


test('Flow P0 resumes returning players without repeating setup',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await expect(page.locator('[data-screen="setup"]')).toHaveCount(0);
  const matchId=await page.locator('[data-screen="home"] .fm-next-match-card').first().getAttribute('data-match-id');
  await page.evaluate(matchId=>{
    const key='footmate:session',s=JSON.parse(localStorage.getItem(key)||'{}');
    localStorage.setItem(key,JSON.stringify({...s,route:'profile',joinedMatchId:matchId,signedIn:true,matchStage:'upcoming'}));
  },matchId);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await expect(page.locator('[data-screen="welcome"]')).toHaveCount(0);
  expect(errs).toEqual([]);
});

test('Flow P1 edits interpreted AI level and progressively relaxes empty results',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  const saved={version:'5.1.1',message:'초급 FW, 밤 11시 이후, 만원 이하',mode:'connected-ai',result:{
    intent:'search',region:'수원 · 영통',position:'FW',level:'입문',afterTime:'23:00',
    maxPrice:10000,maxDistanceMin:null,reply:'요청 조건 확인'
  }};
  await page.evaluate(saved=>{
    sessionStorage.setItem('footmate:v5.2:discover-ai-snapshot',JSON.stringify(saved));
    sessionStorage.setItem('footmate:v5.2:discover-ai-scope','1');
    localStorage.setItem('footmate:v5.1:ai',JSON.stringify(saved));
  },saved);
  await page.getByRole('button',{name:'경기 찾기',exact:true}).click();
  const select=page.getByRole('combobox',{name:'AI가 해석한 경기 레벨 수정'});
  await expect(select).toHaveValue('입문');
  await select.selectOption('초중급');
  await expect(select).toHaveValue('초중급');
  await expect(page.locator('[data-ia-ai-summary]')).toContainText('초급');
  await expect(page.getByRole('button',{name:'시간 조건 완화'})).toBeVisible();
  await page.getByRole('button',{name:'시간 조건 완화'}).click();
  await expect(page.locator('[data-ia-ai-summary]')).not.toContainText('23:00 이후');
  await expect(page.getByRole('button',{name:'가격 조건 완화'})).toBeVisible();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v5.1:ai')||'{}').result);
  expect(stored.level).toBe('초중급');
  expect(stored.afterTime).toBeNull();
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('Flow P2 preserves postgame feedback and hides completed match from next search',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  const matchId=await page.locator('[data-screen="home"] .fm-next-match-card').first().getAttribute('data-match-id');
  await seedSession(page,{route:'profile',signedIn:true,authExperience:'simulated',joinedMatchId:matchId,selectedMatchId:matchId,matchStage:'postgame'});
  const my=page.locator('[data-screen="profile"]');
  await expect(my.locator('[data-flow-stage-guide]')).toBeVisible();
  await expect(my.locator('.fm-next-profile-head p')).toContainText('체험 계정');
  await my.locator('[data-v6-action="difficulty"][data-value="hard"]').click();
  await my.locator('[data-v6-action="repeat"][data-value="false"]').click();
  await my.getByRole('button',{name:'평가 저장'}).click();
  await expect(my.locator('[data-v6-return="saved"]')).toBeVisible();
  await page.getByRole('button',{name:'홈',exact:true}).click();
  await expect(page.locator('[data-screen="home"] .fm-next-match-card[data-match-id="'+matchId+'"]')).toBeHidden();
  await page.getByRole('button',{name:'다음 경기 찾기'}).click();
  await expect(page.locator('[data-screen="discover"] .fm-next-match-card[data-match-id="'+matchId+'"]')).toBeHidden();
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});
