const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const screenshot={animations:'disabled',caret:'hide',maxDiffPixels:0};

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
  });
  return items;
}

async function openClean(page,viewport={width:390,height:844}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await expect(page.locator('html')).toHaveAttribute('data-footmate-visual-consistency','4');
  return errs;
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await expect(page.locator('[data-screen="setup"]')).toBeVisible();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function reachAuth(page){
  await setupToHome(page);
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
}

async function reachCheckout(page){
  await reachAuth(page);
  await page.getByRole('textbox',{name:'아이디'}).fill('member01');
  await page.getByLabel('비밀번호',{exact:true}).fill('test-password');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
}

async function noOverflow(page){
  const metrics=await page.evaluate(()=>({viewport:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(metrics.doc).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.body).toBeLessThanOrEqual(metrics.viewport);
}

async function seriousAxe(page,selector){
  const result=await new AxeBuilder({page}).include(selector).withTags(['wcag2a','wcag2aa']).analyze();
  expect(result.violations.filter(item=>['serious','critical'].includes(item.impact))).toEqual([]);
}

test('390px Welcome and Setup share the v3 brand hierarchy',async({page})=>{
  const errs=await openClean(page);
  const welcome=page.locator('[data-screen="welcome"]');
  await expect(welcome).toBeVisible();
  await page.mouse.move(1,1);
  await expect(welcome).toHaveScreenshot('visual-consistency-welcome-390.png',screenshot);
  await seriousAxe(page,'[data-screen="welcome"]');

  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  const setup=page.locator('[data-screen="setup"]');
  await expect(setup).toBeVisible();
  await page.mouse.move(1,1);
  await expect(setup).toHaveScreenshot('visual-consistency-setup-390.png',screenshot);
  await seriousAxe(page,'[data-screen="setup"]');
  await noOverflow(page);
  expect(errs).toEqual([]);
});

test('390px Auth and Checkout read as one join decision journey',async({page})=>{
  const errs=await openClean(page);
  await reachAuth(page);
  const auth=page.locator('[data-screen="auth"]');
  await page.mouse.move(1,1);
  await expect(auth).toHaveScreenshot('visual-consistency-auth-390.png',screenshot);
  await seriousAxe(page,'[data-screen="auth"]');

  await page.getByRole('textbox',{name:'아이디'}).fill('member01');
  await page.getByLabel('비밀번호',{exact:true}).fill('test-password');
  await page.getByRole('button',{name:'로그인'}).click();
  const checkout=page.locator('[data-screen="checkout"]');
  await expect(checkout).toBeVisible();
  await page.mouse.move(1,1);
  await expect(checkout).toHaveScreenshot('visual-consistency-checkout-390.png',screenshot);
  await seriousAxe(page,'[data-screen="checkout"]');
  await noOverflow(page);
  expect(errs).toEqual([]);
});

test('390px Success closes the join journey with the same visual language',async({page})=>{
  const errs=await openClean(page);
  await reachCheckout(page);
  await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  const success=page.locator('[data-screen="success"]');
  await expect(success).toBeVisible();
  await page.mouse.move(1,1);
  await expect(success).toHaveScreenshot('visual-consistency-success-390.png',screenshot);
  await seriousAxe(page,'[data-screen="success"]');
  await noOverflow(page);
  expect(errs).toEqual([]);
});

test('390px Schedule empty state has a deliberate lifecycle hierarchy',async({page})=>{
  const errs=failures(page);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({route:'schedule',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:false,joinedMatchId:null,selectedMatchId:null,matchStage:'upcoming',userName:'도현'}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  const schedule=page.locator('[data-screen="schedule"]');
  await expect(schedule).toBeVisible();
  await expect(schedule.locator('.fm-next-empty')).toContainText('아직 참가한 경기가 없어요.');
  await page.mouse.move(1,1);
  await expect(schedule).toHaveScreenshot('visual-consistency-schedule-empty-390.png',screenshot);
  await seriousAxe(page,'[data-screen="schedule"]');
  await noOverflow(page);
  expect(errs).toEqual([]);
});

test('320/375/390/430 remain overflow-safe across the extended journey',async({page})=>{
  for(const width of [320,375,390,430]){
    await openClean(page,{width,height:844});
    await noOverflow(page);
    await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
    await noOverflow(page);
    await page.getByRole('button',{name:'다음'}).click();
    await page.getByRole('button',{name:'다음'}).click();
    await page.getByRole('button',{name:/추천 경기 보기/}).click();
    await page.locator('.fm-next-match-card').first().click();
    await page.getByRole('button',{name:'참가하기'}).click();
    await noOverflow(page);
  }
});
