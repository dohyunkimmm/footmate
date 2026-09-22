const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');

test.setTimeout(120_000);

const baseSession={
  setupComplete:true,
  region:'수원 · 영통',
  position:'MF',
  level:'중급',
  signedIn:false,
  joinedMatchId:null,
  selectedMatchId:'suwon-ingye-2000',
  matchStage:'discover',
  userName:'게스트'
};

async function disableMotion(page){
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}'}).catch(()=>{});
}

async function shot(page,width,name){
  await disableMotion(page);
  const dir=path.join('test-results','visual-polish-audit',String(width));
  fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,`${name}.png`),fullPage:true,animations:'disabled'});
}

async function clearAndOpen(page,width){
  await page.setViewportSize({width,height:width>=1000?900:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('[data-screen]');
}

async function seed(page,width,patch,extra={}){
  await page.setViewportSize({width,height:width>=1000?900:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(({session,extra})=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify(session));
    for(const [key,value] of Object.entries(extra))localStorage.setItem(key,JSON.stringify(value));
  },{session:{...baseSession,...patch},extra});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('[data-screen]');
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function reachCheckout(page){
  await clearAndOpen(page,await page.evaluate(()=>innerWidth));
  await setupToHome(page);
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('textbox',{name:'아이디 또는 이메일'}).fill('member@example.com');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
}

for(const width of [390,1440]){
  test(`Real App visual polish capture ${width}px`,async({page})=>{
    await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({version:'5.1.1',mode:'connected-ai',provider:'audit',model:'audit',fallbackUsed:false,result:{intent:'search',region:'수원 · 인계',position:'MF',level:'중급',maxPrice:15000,maxDistanceMin:20,afterTime:null,reply:'수원 인계의 가까운 중급 MF 경기 조건으로 정리했어요.'}})}));

    await clearAndOpen(page,width);
    await shot(page,width,'01-welcome');
    await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
    await shot(page,width,'02-setup-region');
    await page.getByRole('button',{name:'다음'}).click();
    await shot(page,width,'03-setup-position');
    await page.getByRole('button',{name:'다음'}).click();
    await shot(page,width,'04-setup-level');
    await page.getByRole('button',{name:/추천 경기 보기/}).click();
    await expect(page.locator('[data-screen="home"]')).toBeVisible();
    await shot(page,width,'05-home');

    const aiInput=page.getByLabel('찾고 싶은 경기 조건');
    if(await aiInput.count()){
      await aiInput.fill('수원 인계에서 가까운 중급 MF 경기');
      await page.getByRole('button',{name:'AI로 찾기'}).click();
      await expect(page.locator('[data-ai-mode]')).toHaveText('AI connected');
      await shot(page,width,'06-home-ai-results');
    }

    await page.getByRole('button',{name:'전체 보기'}).click();
    await expect(page.locator('[data-screen="discover"]')).toBeVisible();
    await shot(page,width,'07-discover');
    await page.getByRole('button',{name:'필터 열기'}).click();
    await shot(page,width,'08-discover-filter');
    await page.getByLabel('날짜').selectOption('tomorrow');
    await page.getByLabel('시간').selectOption('19');
    await page.getByLabel('거리').selectOption('15');
    await page.getByLabel('가격').selectOption('11000');
    await page.getByLabel('포지션').selectOption('GK');
    await page.getByRole('button',{name:'결과 보기'}).click();
    await expect(page.getByRole('heading',{name:'조건에 맞는 경기가 없어요.'})).toBeVisible();
    await shot(page,width,'09-discover-empty');

    await seed(page,width,{route:'detail',selectedMatchId:'suwon-ingye-2000'});
    await expect(page.locator('[data-screen="detail"]')).toBeVisible();
    await shot(page,width,'10-detail');
    await page.getByRole('button',{name:'비교',exact:true}).click();
    await page.evaluate(()=>{
      const session=JSON.parse(localStorage.getItem('footmate:v4:session'));
      localStorage.setItem('footmate:v4:session',JSON.stringify({...session,route:'detail',selectedMatchId:'gwanggyo-2130'}));
    });
    await page.reload({waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:'비교',exact:true}).click();
    await page.getByRole('button',{name:'비교하기',exact:true}).click();
    await expect(page.getByRole('dialog',{name:'두 경기 비교'})).toBeVisible();
    await shot(page,width,'11-detail-compare');
    await page.keyboard.press('Escape');

    await seed(page,width,{route:'auth',selectedMatchId:'suwon-ingye-2000'});
    await expect(page.locator('[data-screen="auth"]')).toBeVisible();
    await shot(page,width,'12-auth');

    await reachCheckout(page);
    await shot(page,width,'13-checkout');
    await page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.setAutoComplete(false));
    await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
    await expect(page.locator('[data-screen="checkout"]')).toHaveAttribute('data-participation-status','pending');
    await shot(page,width,'14-checkout-pending');

    await reachCheckout(page);
    await page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.setNextOutcome('failure'));
    await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
    await expect(page.locator('[data-participation-panel="failure"]')).toBeVisible();
    await shot(page,width,'15-checkout-failure');

    await seed(page,width,{route:'success',signedIn:true,joinedMatchId:'suwon-ingye-2000',selectedMatchId:'suwon-ingye-2000',matchStage:'upcoming',userName:'도현'});
    await expect(page.locator('[data-screen="success"]')).toBeVisible();
    await shot(page,width,'16-success');

    await seed(page,width,{route:'schedule',signedIn:true,joinedMatchId:'suwon-ingye-2000',selectedMatchId:'suwon-ingye-2000',matchStage:'upcoming',userName:'도현'});
    await expect(page.locator('[data-screen="schedule"]')).toBeVisible();
    await shot(page,width,'17-schedule-upcoming');
    const arrival=page.getByRole('button',{name:'도착 상태 알리기'});
    if(await arrival.count()){
      await arrival.click();
      const late=page.getByRole('button',{name:'늦을 것 같아요'});
      if(await late.count())await late.click();
      await shot(page,width,'18-schedule-late');
      await page.evaluate(()=>window.__FOOTMATE_MATCHDAY__.setStatus('canceled'));
      await shot(page,width,'19-schedule-canceled');
    }

    await seed(page,width,{route:'schedule',signedIn:true,joinedMatchId:'suwon-ingye-2000',selectedMatchId:'suwon-ingye-2000',matchStage:'postgame',userName:'도현'});
    await expect(page.locator('[data-screen="schedule"]')).toBeVisible();
    await shot(page,width,'20-schedule-postgame');

    await seed(page,width,{route:'profile',signedIn:true,selectedMatchId:'gwanggyo-2130',userName:'도현'});
    await expect(page.locator('[data-screen="profile"]')).toBeVisible();
    await shot(page,width,'21-profile');

    const metrics=await page.evaluate(()=>({
      width:innerWidth,
      documentWidth:document.documentElement.scrollWidth,
      viewportWidth:document.documentElement.clientWidth,
      screen:document.querySelector('[data-screen]')?.getAttribute('data-screen')||null
    }));
    fs.mkdirSync(path.join('test-results','visual-polish-audit'),{recursive:true});
    fs.writeFileSync(path.join('test-results','visual-polish-audit',`${width}-metrics.json`),JSON.stringify(metrics,null,2));
    expect(metrics.documentWidth-metrics.viewportWidth).toBeLessThanOrEqual(1);
  });
}
