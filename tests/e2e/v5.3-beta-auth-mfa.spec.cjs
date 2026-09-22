const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const origin='https://beta.example.supabase.co';
const userId='22222222-2222-4222-8222-222222222222';
const operatorId='33333333-3333-4333-8333-333333333333';
const fulfill=(route,payload,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(payload)});
const jwt=(sub,aal)=>`x.${Buffer.from(JSON.stringify({sub,aal})).toString('base64url')}.y`;
const serious=async(page,selector)=>(await new AxeBuilder({page}).include(selector).withTags(['wcag2a','wcag2aa']).analyze()).violations.filter(v=>['serious','critical'].includes(v.impact));

async function baseConfig(page){await page.route('**/api/beta-config',r=>fulfill(r,{connected:true,url:origin,publishableKey:'public-key'}))}

test('beta exposes only configured Google and Kakao OAuth providers',async({page})=>{
  await baseConfig(page);
  await page.route(`${origin}/**`,async route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/auth/v1/settings')return fulfill(route,{external:{google:true,kakao:true}});
    if(url.pathname==='/rest/v1/matches')return fulfill(route,[]);
    if(url.pathname==='/auth/v1/authorize')return fulfill(route,{ok:true});
    return fulfill(route,{message:`Unhandled ${url.pathname}`},500);
  });
  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('button',{name:'Google로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Kakao로 계속하기'})).toBeVisible();
  const requestPromise=page.waitForRequest(request=>request.url().includes('/auth/v1/authorize?'));
  await page.getByRole('button',{name:'Google로 계속하기'}).click();
  const request=await requestPromise;
  const authorize=new URL(request.url());
  expect(authorize.searchParams.get('provider')).toBe('google');
  expect(authorize.searchParams.get('redirect_to')).toContain('/beta');
});

test('beta turns technical OAuth callback errors into user-facing copy',async({page})=>{
  await baseConfig(page);
  await page.route(`${origin}/**`,async route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/auth/v1/settings')return fulfill(route,{external:{google:true,kakao:true}});
    if(url.pathname==='/rest/v1/matches')return fulfill(route,[]);
    return fulfill(route,[]);
  });
  await page.goto('/beta#error_description=Unable%2520to%2520exchange%2520external%2520code%253A%2520invalid_client',{waitUntil:'domcontentloaded'});
  await expect(page.getByText('소셜 로그인 연결을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.')).toBeVisible();
  expect(page.url()).not.toContain('error_description');
});

test('operator aal1 session is blocked until verified TOTP upgrades to aal2',async({page})=>{
  let verified=false,challengeCount=0,verifyCount=0,matchReads=0;
  await baseConfig(page);
  await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:'footmate:beta:auth:v1',value:{accessToken:jwt(operatorId,'aal1'),refreshToken:'refresh-token',expiresAt:4102444800}});
  await page.route(`${origin}/**`,async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.pathname==='/auth/v1/token'&&url.searchParams.get('grant_type')==='refresh_token')return fulfill(route,{access_token:jwt(operatorId,verified?'aal2':'aal1'),refresh_token:'refresh-token-2',expires_in:3600,user:{id:operatorId,email:'operator@example.com'}});
    if(url.pathname==='/auth/v1/user')return fulfill(route,{id:operatorId,email:'operator@example.com',factors:[{id:'factor-1',factor_type:'totp',status:'verified',friendly_name:'FootMate Operator'}]});
    if(url.pathname==='/rest/v1/operators')return fulfill(route,[{user_id:operatorId,created_at:'2000-01-01T00:00:00Z'}]);
    if(url.pathname==='/auth/v1/factors/factor-1/challenge'){challengeCount++;return fulfill(route,{id:'challenge-1'})}
    if(url.pathname==='/auth/v1/factors/factor-1/verify'){verifyCount++;verified=true;return fulfill(route,{access_token:jwt(operatorId,'aal2'),refresh_token:'refresh-token-3',expires_in:3600})}
    if(url.pathname==='/rest/v1/matches'){matchReads++;return fulfill(route,[])}
    if(url.pathname==='/rest/v1/rpc/operator_beta_email_health')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/rpc/operator_beta_funnel_metrics')return fulfill(route,[{}]);
    return fulfill(route,{message:`Unhandled ${request.method()} ${url.pathname}`},500);
  });
  await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{name:'운영자 MFA 확인'})).toBeVisible();
  expect(matchReads).toBe(0);
  await page.getByLabel('인증 코드').fill('123456');
  await page.getByRole('button',{name:'MFA 확인'}).click();
  await expect.poll(()=>challengeCount).toBe(1);
  await expect.poll(()=>verifyCount).toBe(1);
  await expect(page.locator('#footmate-beta-operator')).toHaveAttribute('data-operator-state','ready');
  expect(matchReads).toBeGreaterThan(0);
  expect(await serious(page,'.fm-operator')).toEqual([]);
});

test('operator without TOTP can enroll from a raw Supabase SVG QR response',async({page})=>{
  let enrolled=false;
  await page.setViewportSize({width:320,height:800});
  await baseConfig(page);
  await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:'footmate:beta:auth:v1',value:{accessToken:jwt(operatorId,'aal1'),refreshToken:'refresh-token',expiresAt:4102444800}});
  await page.route(`${origin}/**`,async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.pathname==='/auth/v1/token')return fulfill(route,{access_token:jwt(operatorId,'aal1'),refresh_token:'refresh-token-2',expires_in:3600,user:{id:operatorId,email:'operator@example.com'}});
    if(url.pathname==='/rest/v1/operators')return fulfill(route,[{user_id:operatorId}]);
    if(url.pathname==='/auth/v1/user')return fulfill(route,{id:operatorId,email:'operator@example.com',factors:enrolled?[{id:'factor-new',factor_type:'totp',status:'unverified'}]:[]});
    if(url.pathname==='/auth/v1/factors'&&request.method()==='POST'){
      enrolled=true;
      return fulfill(route,{id:'factor-new',factor_type:'totp',status:'unverified',totp:{qr_code:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><rect width="2" height="2"/></svg>',secret:'TESTSECRET'}})
    }
    return fulfill(route,{message:`Unhandled ${request.method()} ${url.pathname}`},500);
  });
  await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Authenticator 설정 시작'}).click();
  await expect(page.getByText('Authenticator 앱에 등록')).toBeVisible();
  await expect(page.getByText('TESTSECRET')).toBeVisible();
  const qr=page.getByRole('img',{name:'FootMate Operator TOTP QR 코드'});
  await expect(qr).toBeVisible();
  await expect(qr).toHaveAttribute('src',/^data:image\/svg\+xml;charset=utf-8,/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  expect(await serious(page,'.fm-operator')).toEqual([]);
});

test('new operator match pre-fills policy windows and keeps target mobile widths usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await baseConfig(page);
  await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:'footmate:beta:auth:v1',value:{accessToken:jwt(operatorId,'aal2'),refreshToken:'refresh-token',expiresAt:4102444800}});
  await page.route(`${origin}/**`,async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.pathname==='/auth/v1/token')return fulfill(route,{access_token:jwt(operatorId,'aal2'),refresh_token:'refresh-token-2',expires_in:3600,user:{id:operatorId,email:'operator@example.com'}});
    if(url.pathname==='/rest/v1/operators')return fulfill(route,[{user_id:operatorId}]);
    if(url.pathname==='/rest/v1/matches')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/rpc/operator_beta_email_health')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/rpc/operator_beta_funnel_metrics')return fulfill(route,[{}]);
    return fulfill(route,{message:`Unhandled ${request.method()} ${url.pathname}`},500);
  });
  await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#footmate-beta-operator')).toHaveAttribute('data-operator-state','ready');
  const starts=page.getByLabel('시작 시간');
  const cancel=page.getByLabel('사용자 취소 마감');
  const checkIn=page.getByLabel('체크인 오픈');
  await expect(cancel).not.toHaveValue('');
  await expect(checkIn).not.toHaveValue('');
  const [startsValue,cancelValue,checkValue]=await Promise.all([starts.inputValue(),cancel.inputValue(),checkIn.inputValue()]);
  expect(new Date(startsValue).getTime()-new Date(cancelValue).getTime()).toBe(2*60*60*1000);
  expect(new Date(startsValue).getTime()-new Date(checkValue).getTime()).toBe(60*60*1000);
  const save=page.getByRole('button',{name:'경기 저장'});
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
    expect(await save.evaluate(node=>Math.round(node.getBoundingClientRect().height))).toBeGreaterThanOrEqual(44);
  }
  expect(await serious(page,'.fm-operator')).toEqual([]);
});
