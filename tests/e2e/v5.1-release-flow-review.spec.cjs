const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource')){
      items.push(`console.error: ${message.text()}`);
    }
  });
  return items;
}

const baseSession={
  schemaVersion:2,
  route:'welcome',
  setupStep:0,
  setupComplete:true,
  region:'수원 · 영통',
  position:'MF',
  level:'중급',
  signedIn:false,
  joinedMatchId:null,
  selectedMatchId:'gwanggyo-2130',
  checkedInMatchId:null,
  matchStage:'discover',
  userName:'도현'
};
const exactScreenshot={animations:'disabled',caret:'hide',maxDiffPixels:0};

async function waitRuntime(page){
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1'&&window.__FOOTMATE_RELEASE_REVIEW__?.version==='flow-review-v1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}
async function openFresh(page,viewport={width:1440,height:900}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await waitRuntime(page);
  return errs;
}
async function seedSession(page,state={},options={}){
  const errs=failures(page);
  await page.setViewportSize(options.viewport||{width:1440,height:900});
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await page.evaluate(({session,matchday})=>{
    localStorage.clear();sessionStorage.clear();
    localStorage.setItem('footmate:session',JSON.stringify(session));
    if(matchday)localStorage.setItem('footmate:matchday',JSON.stringify(matchday));
  },{session:{...baseSession,...state},matchday:options.matchday||null});
  await page.reload({waitUntil:'domcontentloaded'});
  await waitRuntime(page);
  return errs;
}
async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}
async function goHomeToAuth(page){
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
}
async function mockConnectedOAuth(page){
  await page.route('**/api/beta-config',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({connected:true,url:'https://auth.footmate.test',publishableKey:'pk_test'})}));
  await page.route('https://auth.footmate.test/auth/v1/settings',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({external:{google:true,kakao:true}})}));
  await page.route('https://auth.footmate.test/auth/v1/user',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:'user-1',user_metadata:{name:'도현'}})}));
  await page.route('https://auth.footmate.test/auth/v1/authorize**',route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Connected provider</title><h1>Connected provider login</h1>'}));
}

test('fresh /app entry always opens the welcome screen instead of the persisted route',async({page})=>{
  const errs=await seedSession(page,{route:'profile',signedIn:true});
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await waitRuntime(page);
  await expect(page.locator('[data-screen="welcome"]')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-footmate-fresh-entry','reset');
  await page.reload({waitUntil:'domcontentloaded'});
  await waitRuntime(page);
  await expect(page.locator('[data-screen="welcome"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('setup uses 공격수 / 초급 / 고급 display language without changing canonical domain values',async({page})=>{
  const errs=await openFresh(page,{width:390,height:844});
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await expect(page.getByText('공격수',{exact:true})).toBeVisible();
  await expect(page.getByText('포워드',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'다음'}).click();
  await expect(page.getByText('초급',{exact:true})).toBeVisible();
  await expect(page.getByText('고급',{exact:true})).toBeVisible();
  await expect(page.getByText('초중급',{exact:true})).toHaveCount(0);
  await expect(page.getByText('중급+',{exact:true})).toHaveCount(0);
  expect(errs).toEqual([]);
});

test('AI Match Assistant is a primary core feature with explicit rules fallback',async({page})=>{
  const errs=await openFresh(page);
  await setupToHome(page);
  const card=page.locator('.fm-ai-card--core');
  await expect(card).toBeVisible();
  await expect(card.getByText('CORE FEATURE',{exact:true})).toBeVisible();
  await expect(card.getByText('AI MATCHING',{exact:true})).toBeVisible();
  await expect(card.getByText('AI Match Assistant',{exact:true})).toBeVisible();
  await expect(card.getByText('AI 장애나 지연 시 기존 rules-based 검색으로 자동 전환합니다.',{exact:true})).toHaveCount(1);
  await page.mouse.move(1,1);
  await expect(card).toHaveScreenshot('release-flow-ai-core-1440.png',exactScreenshot);
  expect(errs).toEqual([]);
});

test('auth removes Apple/Naver and routes Google to the connected provider authorize screen',async({page})=>{
  await mockConnectedOAuth(page);
  const errs=await seedSession(page,{route:'home'});
  await goHomeToAuth(page);
  const google=page.locator('[data-oauth-provider="google"]');
  const kakao=page.locator('[data-oauth-provider="kakao"]');
  await expect(google).toBeVisible();
  await expect(google).toBeEnabled();
  await expect(kakao).toBeVisible();
  await expect(kakao).toBeEnabled();
  await expect(page.getByRole('button',{name:/Apple/})).toHaveCount(0);
  await expect(page.getByRole('button',{name:/Naver|네이버/})).toHaveCount(0);
  await expect(page.getByText('Google · Kakao는 실제 연결된 provider의 가입/로그인 화면으로 이동합니다.',{exact:true})).toBeVisible();
  const navigation=page.waitForURL(url=>url.hostname==='auth.footmate.test'&&url.pathname==='/auth/v1/authorize');
  await google.click();await navigation;
  const target=new URL(page.url());
  expect(target.searchParams.get('provider')).toBe('google');
  expect(target.searchParams.get('redirect_to')).toMatch(/\/beta$/);
  expect(errs).toEqual([]);
});

test('connected OAuth callback returns to the app checkout flow instead of mock sign-in',async({page})=>{
  await mockConnectedOAuth(page);
  const errs=await seedSession(page,{route:'auth',selectedMatchId:'gwanggyo-2130'});
  await page.evaluate(()=>sessionStorage.setItem('footmate:app:oauth-pending:v1',JSON.stringify({provider:'google'})));
  await page.goto('/beta#access_token=fake-token&refresh_token=fake-refresh',{waitUntil:'domcontentloaded'});
  await expect(page).toHaveURL(/\/app\?resume=1&oauth=success/);
  await waitRuntime(page);
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  const session=await page.evaluate(()=>window.__FOOTMATE_PLATFORM__.readSession());
  expect(session.signedIn).toBe(true);expect(session.route).toBe('checkout');
  expect(errs).toEqual([]);
});

test('auth and detail back buttons return through the actual previous route stack',async({page})=>{
  const errs=await seedSession(page,{route:'home'});
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.waitForFunction(()=>window.__FOOTMATE_RELEASE_REVIEW__.readHistory().includes('home'));
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await page.waitForFunction(()=>window.__FOOTMATE_RELEASE_REVIEW__.readHistory().includes('detail'));
  await page.locator('[data-action="auth-back"]').click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.getByRole('button',{name:'이전 화면'}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('team message is readable without hover and states the deterministic simulation boundary',async({page})=>{
  const errs=await seedSession(page,{route:'schedule',joinedMatchId:'gwanggyo-2130',matchStage:'upcoming'},{viewport:{width:390,height:844}});
  await page.getByRole('button',{name:'팀 메시지'}).click();
  const dialog=page.getByRole('dialog',{name:'팀 메시지'});
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('운영 안내',{exact:true})).toBeVisible();
  await expect(dialog.getByText('실시간 위치·지도·팀 채팅·알림 backend는 연결하지 않았습니다. 상태와 복구 흐름을 검증하는 deterministic simulation입니다.',{exact:true})).toBeVisible();
  const style=await dialog.evaluate(element=>({background:getComputedStyle(element).backgroundColor,color:getComputedStyle(element).color}));
  expect(style.background).toBe('rgb(255, 255, 255)');expect(style.color).not.toBe('rgb(255, 255, 255)');
  expect(errs).toEqual([]);
});

test('team message surface matches the approved 390px visual baseline',async({page})=>{
  await seedSession(page,{route:'schedule',joinedMatchId:'gwanggyo-2130',matchStage:'upcoming'},{viewport:{width:390,height:844}});
  await page.getByRole('button',{name:'팀 메시지'}).click();
  const dialog=page.getByRole('dialog',{name:'팀 메시지'});
  await expect(dialog).toBeVisible();
  await page.mouse.move(1,1);
  await expect(dialog).toHaveScreenshot('release-flow-team-message-390.png',exactScreenshot);
});

test('checked-in continues to postgame feedback and loops back to match discovery',async({page})=>{
  const errs=await seedSession(page,{route:'schedule',signedIn:true,joinedMatchId:'gwanggyo-2130',checkedInMatchId:'gwanggyo-2130',matchStage:'matchday'},{
    viewport:{width:390,height:844},
    matchday:{version:'4.5.0',matchId:'gwanggyo-2130',status:'checked-in',arrival:'arrived',noticeSeen:false,updatedAt:new Date().toISOString()}
  });
  const nextAction=page.getByRole('button',{name:'경기 종료 후 평가하기'});
  await expect(nextAction).toBeVisible();
  await nextAction.click();
  await expect(page.locator('[data-return-state="draft"]')).toBeVisible();
  await expect(page.locator('[data-matchday-state="checked-in"]')).toBeHidden();
  await expect(page.getByText('오늘 경기, 어땠나요?',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'적당했어요'}).click();
  await page.getByRole('button',{name:'네, 비슷한 경기'}).click();
  await page.getByRole('button',{name:'평가 저장'}).click();
  await expect(page.locator('[data-return-state="saved"]')).toBeVisible();
  const discover=page.getByRole('button',{name:'다음 경기 찾기'});
  await expect(discover).toBeVisible();
  await discover.click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('checked-in continuation action matches the approved 390px visual baseline',async({page})=>{
  await seedSession(page,{route:'schedule',signedIn:true,joinedMatchId:'gwanggyo-2130',checkedInMatchId:'gwanggyo-2130',matchStage:'matchday'},{
    viewport:{width:390,height:844},
    matchday:{version:'4.5.0',matchId:'gwanggyo-2130',status:'checked-in',arrival:'arrived',noticeSeen:false,updatedAt:new Date().toISOString()}
  });
  const checked=page.locator('[data-matchday-state="checked-in"]');
  await expect(checked).toBeVisible();
  await expect(page.getByRole('button',{name:'경기 종료 후 평가하기'})).toBeVisible();
  await page.mouse.move(1,1);
  await expect(checked).toHaveScreenshot('release-flow-checked-in-390.png',exactScreenshot);
});
test('welcome hero keeps readable contrast and an approved full-surface baseline',async({page})=>{
  for(const viewport of [{width:390,height:844,name:'390'},{width:1440,height:900,name:'1440'}]){
    const errs=await openFresh(page,{width:viewport.width,height:viewport.height});
    const headline=page.locator('[data-screen="welcome"] .fm-next-intro h1');
    await expect(headline).toBeVisible();
    const color=await headline.evaluate(element=>getComputedStyle(element).color);
    expect(color,`welcome headline color at ${viewport.name}px`).toBe('rgb(255, 255, 255)');
    const topbar=page.locator('[data-screen="welcome"] .fm-next-topbar--dark');
    const background=await topbar.evaluate(element=>getComputedStyle(element).backgroundImage);
    expect(background).toContain('linear-gradient');
    await page.mouse.move(1,1);
    await expect(page).toHaveScreenshot(`release-flow-welcome-${viewport.name}.png`,{animations:'disabled',caret:'hide',fullPage:false,maxDiffPixels:24});
    expect(errs).toEqual([]);
  }
});
