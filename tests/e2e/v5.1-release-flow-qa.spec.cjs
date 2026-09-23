const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

test.setTimeout(120000);
const exactScreenshot={animations:'disabled',caret:'hide',maxDiffPixels:0};

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource')&&!message.text().includes('ERR_FAILED'))items.push(`console.error: ${message.text()}`);
  });
  return items;
}

async function openCleanApp(page,viewport={width:390,height:844}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  return errs;
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function reachAuth(page){
  await setupToHome(page);
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
}

async function seedSchedule(page,{matchStage='upcoming',matchdayStatus='upcoming',viewport={width:390,height:844}}={}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(({matchStage,matchdayStatus})=>{
    localStorage.clear();sessionStorage.clear();
    const session={schemaVersion:2,route:'schedule',setupStep:2,setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:true,joinedMatchId:'suwon-ingye-2000',selectedMatchId:'suwon-ingye-2000',checkedInMatchId:matchdayStatus==='checked-in'?'suwon-ingye-2000':null,matchStage,userName:'회원'};
    const matchday={version:'4.5.1',matchId:'suwon-ingye-2000',status:matchdayStatus,arrival:matchdayStatus==='upcoming'?'unknown':'arrived',noticeSeen:false,updatedAt:new Date().toISOString()};
    localStorage.setItem('footmate:session',JSON.stringify(session));
    localStorage.setItem('footmate:v4:session',JSON.stringify(session));
    localStorage.setItem('footmate:matchday',JSON.stringify(matchday));
    localStorage.setItem('footmate:v4:matchday',JSON.stringify(matchday));
  },{matchStage,matchdayStatus});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_MATCHDAY__?.version==='4.5.1');
  await expect(page.locator('[data-screen="schedule"]')).toBeVisible();
  return errs;
}

async function seriousOrCritical(page,include='body'){
  const result=await new AxeBuilder({page}).include(include).withTags(['wcag2a','wcag2aa']).analyze();
  return result.violations.filter(item=>['serious','critical'].includes(item.impact));
}

function luminance([r,g,b]){
  const values=[r,g,b].map(value=>{const v=value/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
  return .2126*values[0]+.7152*values[1]+.0722*values[2];
}
function rgb(value){const found=String(value).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);return found?found.slice(1,4).map(Number):null}
function contrast(fg,bg){const a=luminance(fg),b=luminance(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)}

test('fresh Real App entry starts from the first screen without deleting durable progress',async({page})=>{
  const errs=failures(page);
  await page.addInitScript(()=>{
    const session={schemaVersion:2,route:'profile',setupStep:2,setupComplete:true,region:'수원 · 영통',position:'FW',level:'중급+',signedIn:true,joinedMatchId:'suwon-ingye-2000',selectedMatchId:'suwon-ingye-2000',checkedInMatchId:null,matchStage:'upcoming',userName:'회원'};
    localStorage.setItem('footmate:session',JSON.stringify(session));
    localStorage.setItem('footmate:v4:session',JSON.stringify(session));
  });
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="welcome"]')).toBeVisible();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:session')));
  expect(stored.route).toBe('welcome');
  expect(stored.setupComplete).toBe(true);
  expect(stored.joinedMatchId).toBe('suwon-ingye-2000');
  expect(stored.position).toBe('FW');
  expect(stored.level).toBe('중급+');
  expect(errs).toEqual([]);
});

test('user-facing position and level labels use 공격수, 초급, 고급 while internal values stay compatible',async({page})=>{
  const errs=await openCleanApp(page);
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  const forward=page.locator('[data-field="position"][data-value="FW"]');
  await expect(forward).toContainText('공격수');
  await expect(page.locator('[data-screen="setup"]')).not.toContainText('포워드');
  await page.getByRole('button',{name:'다음'}).click();
  await expect(page.locator('[data-field="level"][data-value="초중급"]')).toContainText('초급');
  await expect(page.locator('[data-field="level"][data-value="중급+"]')).toContainText('고급');
  await expect(page.locator('[data-screen="setup"]')).not.toContainText('초중급');
  await expect(page.locator('[data-screen="setup"]')).not.toContainText('중급+');
  expect(errs).toEqual([]);
});

test('AI Match Assistant is the first core home feature and keeps automatic rules fallback explicit',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setupToHome(page);
  const card=page.locator('.fm-ai-card[data-core-feature="true"]');
  await expect(card).toBeVisible();
  await expect(card.locator('.fm-ai-kicker')).toHaveText('핵심 기능 · AI Match Assistant');
  await expect(card).toContainText('AI 장애나 지연 시 기존 rules-based 검색으로 자동 전환합니다.');
  const placement=await card.evaluate(element=>({previous:element.previousElementSibling?.className||'',top:element.getBoundingClientRect().top,contextTop:document.querySelector('.fm-next-context-card')?.getBoundingClientRect().top||9999}));
  expect(placement.previous).toContain('fm-next-greeting');
  expect(placement.top).toBeLessThan(placement.contextTop);
  await expect(card).toHaveScreenshot('release-flow-ai-core-1440.png',exactScreenshot);
  expect(await seriousOrCritical(page,'.fm-ai-card')).toEqual([]);
  expect(errs).toEqual([]);
});

test('auth exposes only connected Google and Kakao entrypoints and panel back returns to login',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await reachAuth(page);
  await expect(page.getByRole('button',{name:'카카오로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Google로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:/네이버|Apple/})).toHaveCount(0);
  await expect(page.locator('[data-social-provider]')).toHaveCount(2);
  await page.getByRole('button',{name:'회원가입'}).click();
  await expect(page.getByRole('heading',{name:'회원가입'})).toBeVisible();
  await page.getByRole('button',{name:'로그인 화면으로 돌아가기'}).first().click();
  await expect(page.getByRole('heading',{name:/로그인 후 더 많은 경기를/})).toBeVisible();
  await page.getByRole('button',{name:'경기 상세로 돌아가기'}).click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  expect(errs).toEqual([]);
});

for(const provider of [{key:'google',name:'Google로 계속하기'},{key:'kakao',name:'카카오로 계속하기'}]){
  test(`${provider.key} social login enters the configured Supabase OAuth authorize endpoint`,async({page})=>{
    await page.route('**/api/beta-config',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({connected:true,url:'https://auth.example.test',publishableKey:'public-test-key'})}));
    await page.route('https://auth.example.test/auth/v1/settings',route=>route.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:JSON.stringify({external:{google:true,kakao:true}})}));
    await page.route('https://auth.example.test/auth/v1/authorize**',route=>route.abort());
    await openCleanApp(page);
    await reachAuth(page);
    const requestPromise=page.waitForRequest(request=>request.url().startsWith('https://auth.example.test/auth/v1/authorize'));
    await page.getByRole('button',{name:provider.name}).click();
    const request=await requestPromise;
    const url=new URL(request.url());
    expect(url.searchParams.get('provider')).toBe(provider.key);
    expect(url.searchParams.get('redirect_to')).toBe('http://127.0.0.1:4173/app?oauth=1');
  });
}

test('checkout back returns to the immediate auth surface, then auth back returns to detail',async({page})=>{
  const errs=await openCleanApp(page);
  await reachAuth(page);
  await page.getByRole('textbox',{name:'아이디 또는 이메일'}).fill('member@example.com');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  await page.locator('[data-action="checkout-back"]').click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await page.getByRole('button',{name:'경기 상세로 돌아가기'}).click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('team message action opens a readable deterministic simulation with explicit backend boundary',async({page})=>{
  const errs=await seedSchedule(page,{viewport:{width:390,height:844}});
  const teamButton=page.getByRole('button',{name:'팀 메시지'});
  await expect(teamButton).toBeVisible();
  const colors=await teamButton.evaluate(element=>{const style=getComputedStyle(element);return {color:style.color,background:style.backgroundColor}});
  const ratio=contrast(rgb(colors.color),rgb(colors.background));
  expect(ratio).toBeGreaterThanOrEqual(4.5);
  await teamButton.click();
  const dialog=page.getByRole('dialog',{name:'팀 메시지'});
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('실시간 위치·지도·팀 채팅·알림 backend는 연결하지 않았습니다. 상태와 복구 흐름을 검증하는 deterministic simulation입니다.');
  await expect(dialog.locator('input,textarea')).toHaveCount(0);
  await expect(dialog).toHaveScreenshot('release-flow-team-message-390.png',exactScreenshot);
  expect(await seriousOrCritical(page,'.fm-team-message-dialog')).toEqual([]);
  expect(errs).toEqual([]);
});

test('checked-in Matchday continues to postgame Return instead of ending without a next action',async({page})=>{
  const errs=await seedSchedule(page,{matchStage:'matchday',matchdayStatus:'matchday',viewport:{width:390,height:844}});
  const panel=page.getByRole('region',{name:'경기 당일 운영'});
  await panel.locator('[data-matchday-action="checkin"]').click();
  await expect(panel).toHaveAttribute('data-matchday-state','checked-in');
  await expect(panel.getByRole('button',{name:'경기 종료 후 이어보기'})).toBeVisible();
  await Promise.all([page.waitForLoadState('domcontentloaded'),panel.getByRole('button',{name:'경기 종료 후 이어보기'}).click()]);
  await page.waitForFunction(()=>window.__FOOTMATE_RETURN__?.version==='4.6.0');
  const returnPanel=page.locator('[data-return-version="4.6.0"]');
  await expect(returnPanel).toBeVisible();
  await expect(returnPanel).toContainText('오늘 경기, 어땠나요?');
  const states=await page.evaluate(()=>({session:JSON.parse(localStorage.getItem('footmate:session')),matchday:JSON.parse(localStorage.getItem('footmate:matchday'))}));
  expect(states.session.matchStage).toBe('postgame');
  expect(states.matchday.status).toBe('completed');
  await expect(returnPanel).toHaveScreenshot('release-flow-return-390.png',exactScreenshot);
  expect(await seriousOrCritical(page,'[data-screen="schedule"]')).toEqual([]);
  expect(errs).toEqual([]);
});

test('changed release-flow surfaces remain overflow-safe at 320/375/390/430',async({page})=>{
  for(const width of [320,375,390,430]){
    await seedSchedule(page,{viewport:{width,height:844}});
    await page.getByRole('button',{name:'팀 메시지'}).click();
    const metrics=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,dialog:document.querySelector('.fm-team-message-dialog')?.getBoundingClientRect().width||0}));
    expect(metrics.document,`${width}px document overflow`).toBeLessThanOrEqual(metrics.viewport);
    expect(metrics.body,`${width}px body overflow`).toBeLessThanOrEqual(metrics.viewport);
    expect(metrics.dialog,`${width}px dialog width`).toBeLessThanOrEqual(width-20);
    await page.getByRole('button',{name:'팀 메시지 닫기'}).click();
  }
});
