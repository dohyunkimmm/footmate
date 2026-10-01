const {test,expect}=require('@playwright/test');

async function waitForRelease(page){
  await page.waitForFunction(()=>window.__FOOTMATE_RELEASE_APP__?.version==='6.0.0');
}

async function openCleanApp(page){
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await waitForRelease(page);
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

test('Production v6 release journey owns Detail, free Join, and MY',async({page})=>{
  test.skip(process.env.PRODUCTION_SMOKE!=='1','Production-only verification');
  await openCleanApp(page);
  await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content','6.0.0');

  await setupToHome(page);
  const home=page.locator('[data-screen="home"]');
  await expect(home).toBeVisible();
  await home.locator('.fm-next-match-card').first().click();

  const detail=page.locator('[data-screen="detail"]');
  await expect(detail).toBeVisible();
  await expect(detail).toHaveAttribute('data-v6-detail','true');
  const surface=await detail.locator('.fm-next-detail-section').first().evaluate(node=>({
    radius:getComputedStyle(node).borderRadius,
    shadow:getComputedStyle(node).boxShadow,
    background:getComputedStyle(node).backgroundColor
  }));
  expect(surface.radius).toBe('0px');
  expect(surface.shadow).toBe('none');
  expect(surface.background).toBe('rgba(0, 0, 0, 0)');

  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('textbox',{name:'아이디'}).fill('member01');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();

  const join=page.locator('[data-screen="checkout"]');
  await expect(join).toBeVisible();
  await expect(join).toHaveAttribute('data-v6-join','free');
  await expect(join.locator('.fm-next-topbar>strong')).toHaveText('참가 확인');
  await expect(join.locator('[data-v6-hidden-payment="true"]')).toBeHidden();
  await page.getByRole('button',{name:'무료로 참가 확정'}).click();

  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  const participation=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:participation')||'{}'));
  expect(participation.amount).toBe(0);
  expect(participation.paymentMethod).toBe('none');

  await page.getByRole('button',{name:'내 경기 보기'}).click();
  const my=page.locator('[data-screen="profile"]');
  await expect(my).toBeVisible();
  await expect(my).toHaveAttribute('data-v6-my','true');
  await expect(my.locator('[data-my-matches]')).toContainText('내 경기');
});

test('Production v6 migrates legacy Schedule ownership to MY',async({page})=>{
  test.skip(process.env.PRODUCTION_SMOKE!=='1','Production-only verification');
  await openCleanApp(page);
  await page.evaluate(()=>localStorage.setItem('footmate:session',JSON.stringify({schemaVersion:2,route:'schedule',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:true,matchStage:'discover'})));
  await page.reload({waitUntil:'domcontentloaded'});
  await waitForRelease(page);
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  const route=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:session')||'{}').route);
  expect(route).toBe('profile');
});
