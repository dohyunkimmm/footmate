const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const origin='https://beta.example.supabase.co';
const matchId='11111111-1111-4111-8111-111111111111';
const userId='22222222-2222-4222-8222-222222222222';
const baseMatch={id:matchId,title:'영통 금요일 저녁 경기',venue_name:'영통 풋살장',area_label:'영통',address:'경기도 수원시 영통구',region:'수원 · 영통',level:'초중급',positions:['MF','FW','DF','GK'],starts_at:'2099-09-25T20:00:00+09:00',price_krw:0,capacity_total:12,joined_count:8,remaining_spots:4,format_label:'6 vs 6',surface:'인조잔디',duration_minutes:80,status:'open',match_slots:[{position:'MF',capacity_total:4,joined_count:3,remaining_spots:1},{position:'FW',capacity_total:3,joined_count:2,remaining_spots:1},{position:'DF',capacity_total:4,joined_count:2,remaining_spots:2},{position:'GK',capacity_total:1,joined_count:1,remaining_spots:0}]};

function fulfill(route,payload,status=200){return route.fulfill({status,contentType:'application/json',body:JSON.stringify(payload)})}

async function mockBackend(page,{empty=false,preferences=true}={}){
  await page.addInitScript(()=>sessionStorage.setItem('footmate:beta:entered:v1','1'));
  if(preferences)await page.addInitScript(()=>localStorage.setItem('footmate:beta:preferences:v1',JSON.stringify({sport:'',region:'',level:'',position:'',afterTime:''})));
  let joined=false;
  let deleted=false;
  let profile={id:userId,display_name:'도현',region:'수원 · 영통',position:'MF',level:'초중급',created_at:'2099-01-01T00:00:00Z',updated_at:'2099-01-01T00:00:00Z'};
  await page.route('**/api/beta-config',route=>fulfill(route,{connected:true,url:origin,publishableKey:'public-key'}));
  await page.route(`${origin}/**`,async route=>{
    const request=route.request();
    const url=new URL(request.url());
    const path=url.pathname+url.search;
    if(path.startsWith('/auth/v1/token?grant_type=password'))return fulfill(route,{access_token:'access-token',refresh_token:'refresh-token',expires_in:3600,user:{id:userId,email:'beta@example.com'}});
    if(path.startsWith('/auth/v1/token?grant_type=refresh_token'))return fulfill(route,{access_token:'refreshed-token',refresh_token:'refresh-token-2',expires_in:3600,user:{id:userId,email:'beta@example.com'}});
    if(path==='/auth/v1/user')return fulfill(route,{user:{id:userId,email:'beta@example.com'}});
    if(path==='/auth/v1/logout')return fulfill(route,{});
    if(path==='/auth/v1/signup')return fulfill(route,{user:{id:userId,email:'beta@example.com'},session:null});
    if(url.pathname==='/functions/v1/delete-account'){
      deleted=true;return fulfill(route,{deleted:true});
    }
    if(url.pathname==='/rest/v1/profiles'&&request.method()==='GET')return fulfill(route,[profile]);
    if(url.pathname==='/rest/v1/profiles'&&request.method()==='PATCH'){
      profile={...profile,...JSON.parse(request.postData()||'{}')};return fulfill(route,[profile]);
    }
    if(url.pathname==='/rest/v1/beta_notifications')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/participations')return fulfill(route,joined?[{id:'p-1',match_id:matchId,position:'MF',status:'confirmed',joined_at:'2099-01-01T00:00:00Z',canceled_at:null,created_at:'2099-01-01T00:00:00Z',updated_at:'2099-01-01T00:00:00Z'}]:[]);
    if(url.pathname==='/rest/v1/matches'){
      if(empty)return fulfill(route,[]);
      const row=joined?{...baseMatch,joined_count:9,remaining_spots:3,match_slots:baseMatch.match_slots.map(slot=>slot.position==='MF'?{...slot,joined_count:4,remaining_spots:0}:slot)}:baseMatch;
      return fulfill(route,[row]);
    }
    if(url.pathname==='/rest/v1/rpc/join_match_position'){
      joined=true;return fulfill(route,[{participation_id:'p-1',joined_match_id:matchId,joined_position:'MF',participation_status:'confirmed',remaining_position_spots:0,remaining_match_spots:3,already_joined:false}]);
    }
    if(url.pathname==='/rest/v1/rpc/cancel_participation'){
      joined=false;return fulfill(route,[{participation_id:'p-1',canceled_match_id:matchId,participation_status:'canceled',remaining_spots:4,already_canceled:false}]);
    }
    return fulfill(route,{message:`Unhandled ${request.method()} ${path}`},500);
  });
  return {isJoined:()=>joined,isDeleted:()=>deleted};
}

async function serious(page){
  const result=await new AxeBuilder({page}).include('.fm-beta').withTags(['wcag2a','wcag2aa']).analyze();
  return result.violations.filter(v=>['serious','critical'].includes(v.impact));
}

test('closed beta signs in, joins atomically, restores session and cancels',async({page})=>{
  const backend=await mockBackend(page);
  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await expect(page).toHaveTitle('FootMate | Demo');
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  await expect(page.locator('[data-beta-backend]')).toHaveAttribute('data-beta-backend','connected');
  await expect(page.getByText('영통 금요일 저녁 경기')).toBeVisible();
  await expect(page.getByRole('button',{name:'참가하기'})).toBeVisible();
  await expect(page.locator('.fm-beta-match a[href^="https://www.google.com/maps/search/"]')).toBeVisible();
  await expect(page.locator('.fm-beta-match a[href^="https://calendar.google.com/"]')).toHaveCount(0);
  await page.evaluate(()=>{window.__betaQaEvents=[];window.addEventListener('footmate:beta:measurement',e=>window.__betaQaEvents.push(e.detail));});
  expect(await serious(page)).toEqual([]);

  await page.locator('[data-action="open-account"]').click();
  await page.getByLabel('이메일').fill('beta@example.com');
  await page.getByLabel('비밀번호').fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await expect(page.locator('[data-action="open-account"]')).toHaveText('도현');
  await expect(page.getByRole('button',{name:'MF로 참가'})).toBeVisible();

  await page.getByRole('button',{name:'MF로 참가'}).click();
  await expect(page.getByText('MF 포지션으로 참가가 확정됐습니다.')).toBeVisible();
  expect(backend.isJoined()).toBe(true);
  await expect(page.getByRole('navigation',{name:'Beta 메뉴'})).toBeVisible();
  await expect(page.locator('.fm-beta-participation a[href^="https://calendar.google.com/"]')).toBeVisible();
  const calendar=await page.locator('.fm-beta-participation a[href^="https://calendar.google.com/"]').getAttribute('href');
  expect(new URL(calendar).searchParams.get('dates')).toBe('20990925T110000Z/20990925T122000Z');
  const measure=await page.evaluate(()=>window.__betaQaEvents||[]);
  expect(measure.map(item=>item.event)).toEqual(['join_attempt','join_succeeded']);
  expect(measure[0].flowId).toBe(measure[1].flowId);
  expect(measure[0].cohort).toBe('unclassified');
  await expect(page.getByRole('button',{name:'참가 취소'})).toBeVisible();

  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-action="open-account"]')).toHaveText('도현');
  await expect(page.getByRole('button',{name:'참가 취소'})).toBeVisible();
  await page.getByRole('button',{name:'참가 취소'}).click();
  await expect(page.getByText('참가를 취소했습니다. 잔여 자리가 복구됐습니다.')).toBeVisible();
  expect(backend.isJoined()).toBe(false);
  await expect(page.getByText('아직 참가한 경기가 없습니다.')).toBeVisible();
  await page.getByRole('button',{name:'추천',exact:true}).click();
  await expect(page.getByText(/동기화/)).toBeVisible();
  expect(await serious(page)).toEqual([]);
});

test('closed beta enforces signup baseline and deletes account with explicit confirmation',async({page})=>{
  const backend=await mockBackend(page);
  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="open-account"]').click();
  await page.getByRole('button',{name:'회원가입',exact:true}).click();
  const signupPassword=page.getByLabel('비밀번호');
  await expect(signupPassword).toHaveAttribute('minlength','8');
  await expect(signupPassword).toHaveAttribute('placeholder','8자 이상');
  await page.getByRole('button',{name:'이미 계정이 있어요 · 로그인'}).click();

  await page.getByLabel('이메일').fill('beta@example.com');
  await page.getByLabel('비밀번호').fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await page.locator('[data-action="open-account"]').click();
  await page.getByRole('button',{name:'설정',exact:true}).click();
  await page.getByText('개인정보 안내',{exact:true}).click();
  await expect(page.getByText('저장 데이터: 이메일 · 이름 · 생활권 · 포지션 · 레벨 · 참가 상태 · 로그인 중 선택한 추천 조건. 결제 정보와 메시지 내용은 저장하지 않습니다.')).toBeVisible();
  await expect(page.getByRole('button',{name:'계정·참가 데이터 삭제'})).toBeVisible();

  await page.evaluate(({userId})=>{
    const key='footmate:beta:demo-participations:v1';
    localStorage.setItem(key,JSON.stringify([
      {user_id:userId,match_id:'demo-1-2099-01-01',status:'confirmed'},
      {user_id:'33333333-3333-4333-8333-333333333333',match_id:'demo-2-2099-01-01',status:'confirmed'}
    ]));
    localStorage.setItem('footmate:beta:reactions:v1:'+userId+':demo','[]');
  },{userId});
  let deletionDialog=0;
  page.on('dialog',async dialog=>{
    deletionDialog+=1;
    if(dialog.type()==='confirm')await dialog.accept();
    else if(dialog.type()==='prompt')await dialog.accept('계정 삭제');
    else await dialog.dismiss();
  });
  await page.getByRole('button',{name:'계정·참가 데이터 삭제'}).click();
  await expect(page.getByText('계정과 연결된 Beta 개인정보·참가 기록을 삭제했습니다.')).toBeVisible();
  await expect(page.locator('[data-action="open-account"]')).toHaveText('로그인');
  expect(backend.isDeleted()).toBe(true);
  const demoAfter=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:demo-participations:v1')||'[]'));
  expect(demoAfter).toHaveLength(1);
  expect(demoAfter[0].user_id).toBe('33333333-3333-4333-8333-333333333333');
  expect(await page.evaluate(userId=>localStorage.getItem('footmate:beta:reactions:v1:'+userId+':demo'),userId)).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('footmate:beta:auth:v1'))).toBeNull();
  expect(await serious(page)).toEqual([]);
});

test('closed beta recovers from backend config failure',async({page})=>{
  let attempts=0;
  await page.route('**/api/beta-config',route=>{
    attempts+=1;
    if(attempts===1)return fulfill(route,{connected:false,code:'BETA_BACKEND_NOT_CONFIGURED'},503);
    return fulfill(route,{connected:true,url:origin,publishableKey:'public-key'});
  });
  await page.route(`${origin}/**`,route=>fulfill(route,[]));
  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','error');
  await expect(page.getByRole('button',{name:'연결 다시 시도'})).toBeVisible();
  await page.getByRole('button',{name:'연결 다시 시도'}).click();
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  await expect(page.getByRole('heading',{name:'어디서 뛸까요?',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('button',{name:'추천 경기 보기'}).click();
  await expect(page.getByText('지금 참가할 수 있는 경기가 없어요.')).toBeVisible();
});

test('closed beta stays responsive at release mobile widths',async({page})=>{
  await mockBackend(page,{empty:true});
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:780});
    await page.goto('/beta',{waitUntil:'domcontentloaded'});
    await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test('released demo opens the connected Beta with useful actions only',async({page},testInfo)=>{
  await mockBackend(page);
  await page.route(origin+'/auth/v1/settings',r=>fulfill(r,{external:{google:true,kakao:true}}));
  for(const width of [1920,390]){
    await page.setViewportSize({width,height:900});
    await page.goto('/demo',{waitUntil:'domcontentloaded'});
    await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
    await expect(page.locator('#footmate-next')).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Google로 계속하기'})).toBeHidden();
    await expect(page.getByRole('button',{name:'Kakao로 계속하기'})).toBeHidden();
    await expect(page.getByText('전체 경기 둘러보기',{exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:/내 경기 이어보기|내 경기 찾아보기|로그인 화면 보기|경기 먼저 둘러보기/})).toHaveCount(0);
    const layout=await page.locator('.fm-beta-shell').evaluate(el=>({width:el.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth-innerWidth}));
    expect(layout.width).toBeLessThanOrEqual(560);expect(layout.overflow).toBeLessThanOrEqual(1);
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:testInfo.outputPath('released-beta-'+width+'.png'),fullPage:true,animations:'disabled'});
  }
});

test('choice-first recommendations keep the selected match and position through login',async({page},testInfo)=>{
  const backend=await mockBackend(page,{preferences:false});
  const requests=[];
  await page.route('**/api/ai-match-assistant',route=>{requests.push(route.request().postDataJSON());return fulfill(route,{mode:'connected-ai',rankedMatchIds:[matchId,'invented-id']})});
  await page.route(origin+'/auth/v1/settings',r=>fulfill(r,{external:{google:true,kakao:true}}));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/beta');
  await expect(page.getByRole('heading',{name:'어디서 뛸까요?',exact:true})).toBeVisible();
  await expect(page.locator('.fm-beta-catalog')).toBeHidden();
  await expect(page.getByLabel('이메일')).toBeHidden();
  await expect(page.getByRole('textbox',{name:'원하는 경기 조건'})).toHaveCount(0);
  await expect(page.getByRole('group',{name:'활동 지역',exact:true}).getByRole('radio')).toHaveCount(5);
  await page.screenshot({path:testInfo.outputPath('choice-first-390.png'),fullPage:true});
    await page.getByRole('group',{name:'활동 지역',exact:true}).getByRole('radio',{name:'수원 · 영통',exact:true}).check();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('group',{name:'실력',exact:true}).getByRole('radio',{name:'초중급',exact:true}).check();
  await page.getByRole('group',{name:'포지션',exact:true}).getByRole('radio',{name:'FW · 공격수',exact:true}).check();
  await page.getByRole('group',{name:'선호 시간',exact:true}).getByRole('radio',{name:'저녁 6시 이후',exact:true}).check();
  await page.getByRole('button',{name:'추천 경기 보기'}).click();
  await expect(page.locator('.fm-beta-match')).toHaveCount(1);
  await expect.poll(()=>requests.length).toBe(1);
  expect(requests[0].task).toBe('recommend');expect(requests[0].candidates[0].id).toBe(matchId);
  await expect(page.locator('.fm-beta-match-reason')).toContainText('FW 1자리');
  await expect(page.getByLabel('이메일')).toBeHidden();
  expect(await serious(page)).toEqual([]);
  await page.screenshot({path:testInfo.outputPath('recommendations-390.png'),fullPage:true});
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await expect(page.getByRole('button',{name:'Google로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Kakao로 계속하기'})).toBeVisible();
  await expect(page.locator('[data-beta-main]')).toBeHidden();
  await page.screenshot({path:testInfo.outputPath('participation-login-390.png'),fullPage:true});
  await page.getByRole('button',{name:'← 뒤로'}).click();
  await expect(page.locator('.fm-beta-match[data-pending-match="true"]')).toBeVisible();
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await page.getByLabel('이메일').fill('beta@example.com');await page.getByLabel('비밀번호').fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await expect(page.getByRole('button',{name:'FW로 참가'})).toBeVisible();
  expect(backend.isJoined()).toBe(false); // Signing in must never submit participation.
  await page.reload();
  await expect(page.getByRole('button',{name:'FW로 참가'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'어떤 경기를 즐기세요?'})).toHaveCount(0);
  const join=page.waitForRequest(r=>new URL(r.url()).pathname==='/rest/v1/rpc/join_match_position');
  await page.getByRole('button',{name:'FW로 참가'}).click();
  expect((await join).postDataJSON().p_position).toBe('FW');
  await expect.poll(()=>backend.isJoined()).toBe(true);
});

test('futsal conditions stay explicit and AI failure keeps real matches usable',async({page})=>{
  await mockBackend(page,{preferences:false});
  await page.route('**/api/ai-match-assistant',route=>fulfill(route,{error:'unavailable'},503));
  await page.goto('/beta');
  await expect(page.getByRole('radio',{name:'축구',exact:true})).toHaveCount(0);
  await page.getByRole('group',{name:'활동 지역',exact:true}).getByRole('radio',{name:'서울 · 강남',exact:true}).check();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('button',{name:'추천 경기 보기'}).click();
  await expect(page.getByText('조건에 맞는 경기가 없어요.',{exact:true})).toBeVisible();
  await expect(page.locator('.fm-beta-match')).toHaveCount(0);
  await page.getByRole('button',{name:'조건 변경',exact:true}).click();
  await page.getByRole('combobox',{name:'활동 지역',exact:true}).selectOption({label:'지역 전체'});
  await page.getByRole('button',{name:'추천 경기 보기'}).click();
  await expect(page.getByText('AI 연결이 지연되어 선택한 조건으로 찾았어요.')).toBeVisible();
  await expect(page.locator('.fm-beta-match')).toHaveCount(1);
  for(const width of [320,375,430,1920]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    expect(await page.locator('.fm-beta-shell').evaluate(el=>el.getBoundingClientRect().width)).toBeLessThanOrEqual(560);
  }
  expect(await serious(page)).toEqual([]);
});

test('AI can reorder eligible real candidates without introducing unknown cards',async({page})=>{
  await mockBackend(page,{preferences:false});
  const secondId='77777777-7777-4777-8777-777777777777';
  await page.route(origin+'/rest/v1/matches?**',route=>fulfill(route,[baseMatch,{...baseMatch,id:secondId,title:'두 번째 풋살 경기'}]));
  await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:[secondId,'invented',matchId]}));
  await page.goto('/beta');
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('button',{name:'추천 경기 보기'}).click();
  await expect(page.locator('.fm-beta-match').first()).toHaveAttribute('data-match-id',secondId);
  await expect(page.locator('.fm-beta-match')).toHaveCount(1);
  await page.getByRole('navigation',{name:'추천 경기 페이지'}).getByRole('button',{name:'다음',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id',matchId);
  await page.reload();
  await expect(page.locator('.fm-beta-match').first()).toHaveAttribute('data-match-id',secondId);
});

test('choice-first recommendations keep demo home populated and participation isolated',async({page},testInfo)=>{
  await mockBackend(page,{preferences:false,empty:true});
  const writes=[];
  await page.route(origin+'/rest/v1/rpc/**',route=>{if(/join_match_position|cancel_participation/.test(route.request().url())){writes.push(route.request().url());return fulfill(route,{error:'demo must not call live participation RPC'},500)}return fulfill(route,null)});
  await page.route(origin+'/auth/v1/token?**',route=>{
    const token='e30.'+Buffer.from(JSON.stringify({sub:userId})).toString('base64url')+'.sig';
    return fulfill(route,{access_token:token,refresh_token:'demo-auth-refresh',expires_in:3600,user:{id:userId,email:'beta@example.com'}});
  });
  await page.route(origin+'/auth/v1/settings',r=>fulfill(r,{external:{google:true,kakao:true}}));
  await page.route('**/api/ai-match-assistant',route=>{const body=route.request().postDataJSON();return fulfill(route,{mode:'connected-ai',rankedMatchIds:body.candidates.map(m=>m.id).reverse()})});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/demo');
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-catalog-source','demo');
  await expect(page.getByRole('heading',{name:'어디서 뛸까요?',exact:true})).toBeVisible();
  await expect(page.locator('.fm-beta-catalog')).toBeHidden();
  await page.screenshot({path:testInfo.outputPath('onboarding-step-1-390.png'),fullPage:true});
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('group',{name:'포지션',exact:true}).getByRole('radio',{name:'MF · 미드필더',exact:true}).check();
  await page.screenshot({path:testInfo.outputPath('onboarding-step-2-390.png'),fullPage:true});
  await page.getByRole('button',{name:'추천 경기 보기',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).toHaveCount(1);
  await expect(page.getByRole('heading',{name:'어디서 뛸까요?'})).toHaveCount(0);
  await expect(page.getByLabel('이메일')).toBeHidden();
  await expect(page.locator('.fm-beta-match-cover small')).toHaveText('데모 경기');
  const pager=page.getByRole('navigation',{name:'추천 경기 페이지'});
  await expect(pager).toBeVisible();
  await expect(pager.getByRole('button',{name:'이전',exact:true})).toBeDisabled();
  const firstMatch=await page.locator('.fm-beta-match').getAttribute('data-match-id');
  await pager.getByRole('button',{name:'다음',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).not.toHaveAttribute('data-match-id',firstMatch);
  await pager.getByRole('button',{name:'이전',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id',firstMatch);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight)).toBeLessThanOrEqual(1);
  await page.getByText('모집 포지션',{exact:true}).click();
  await expect(page.locator('.fm-beta-match').getByRole('button',{name:'참가하기',exact:true})).toBeInViewport();
  await expect(pager.getByRole('button',{name:'다음',exact:true})).toBeInViewport();
  await page.screenshot({path:testInfo.outputPath('recommendation-home-390.png'),fullPage:true});
  await expect(page.getByRole('button',{name:'축구',exact:true})).toHaveCount(0);
  await expect(page.getByRole('navigation',{name:'경기 종목'})).toHaveCount(0);
  await expect(page.locator('.fm-beta-ai-label')).toBeVisible();
  const selected=await page.locator('.fm-beta-match').first().getAttribute('data-match-id');
  await page.locator('.fm-beta-match').first().getByRole('button',{name:'참가하기',exact:true}).click();
  await expect(page.getByRole('button',{name:'Google로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Kakao로 계속하기'})).toBeVisible();
  await page.getByLabel('이메일').fill('beta@example.com');await page.getByLabel('비밀번호').fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await page.waitForURL('**/beta');
  await expect(page.getByRole('navigation',{name:'Beta 메뉴'})).toBeVisible();
  await expect(page.getByRole('button',{name:'추천',exact:true})).toHaveAttribute('aria-current','page');
  await page.locator(`.fm-beta-match[data-match-id="${selected}"]`).getByRole('button',{name:'MF로 참가'}).click();
  await expect(page.getByText('MF 데모 참가를 완료했어요.',{exact:true})).toBeVisible();
  expect(writes).toEqual([]);
  await page.reload();
  await expect(page.getByRole('button',{name:'참가 취소',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'참가 취소',exact:true}).click();
  await expect(page.getByText('데모 참가를 취소했어요.',{exact:true})).toBeVisible();
  expect(writes).toEqual([]);
  await page.getByRole('button',{name:'MY',exact:true}).click();
  await expect(page.getByRole('button',{name:'프로필 저장',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight)).toBeLessThanOrEqual(1);
  await expect(page.locator('.fm-beta-catalog')).toBeHidden();
  await page.getByRole('button',{name:'추천',exact:true}).click();
  await expect(page.locator('.fm-beta-catalog')).toBeVisible();
  expect(await serious(page)).toEqual([]);
  for(const width of [320,1920]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    expect(await page.locator('.fm-beta-shell').evaluate(el=>el.getBoundingClientRect().width)).toBeLessThanOrEqual(560);
    await page.screenshot({path:testInfo.outputPath('recommendation-home-'+width+'.png'),fullPage:true});
  }
});

test('choice-first recommendations keep OAuth login in Beta home with the selected game',async({page})=>{
  const backend=await mockBackend(page,{empty:true});
  await page.route(origin+'/auth/v1/settings',r=>fulfill(r,{external:{google:true,kakao:true}}));
  await page.route(origin+'/auth/v1/authorize?**',r=>fulfill(r,{oauth:'test redirect'}));
  await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:route.request().postDataJSON().candidates.map(m=>m.id)}));
  await page.goto('/demo');
  await expect(page.locator('.fm-beta-match')).toHaveCount(1);
  const selected=await page.locator('.fm-beta-match').first().getAttribute('data-match-id');
  await page.locator('.fm-beta-match').first().getByRole('button',{name:'참가하기',exact:true}).click();
  const authorization=page.waitForRequest(r=>r.url().startsWith(origin+'/auth/v1/authorize?'));
  await page.getByRole('button',{name:'Google로 계속하기'}).click();
  const url=new URL((await authorization).url());expect(url.searchParams.get('redirect_to')).toContain('/beta');
  await page.waitForURL(origin+'/**');
  const token='e30.'+Buffer.from(JSON.stringify({sub:userId})).toString('base64url')+'.sig';
  await page.goto('/beta#access_token='+token+'&refresh_token=test-refresh&expires_in=3600');
  await page.waitForURL('**/beta');
  await expect(page.getByRole('navigation',{name:'Beta 메뉴'})).toBeVisible();
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-catalog-source','demo');
  await expect(page.locator(`.fm-beta-match[data-match-id="${selected}"][data-pending-match="true"]`)).toBeVisible();
  expect(backend.isJoined()).toBe(false);
});


test('FootMate results expand without signup and participation retains preferences',async({page},testInfo)=>{
  await mockBackend(page,{preferences:false,empty:true});
  await page.addInitScript(()=>sessionStorage.removeItem('footmate:beta:entered:v1'));
  await page.route(origin+'/auth/v1/settings',r=>fulfill(r,{external:{google:true,kakao:true}}));
  await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:route.request().postDataJSON().candidates.map(m=>m.id)}));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/demo');
  const opening=page.locator('[data-screen="welcome"]');
  await expect(opening.locator('.fm-app-entry-name')).toHaveText('FootMate');
  await expect(opening.locator('.fm-app-entry-name')).toHaveCSS('font-size','32px');
  await expect(opening.getByRole('button',{name:'내 조건으로 추천받기',exact:true})).toHaveCount(1);
  await expect(opening.getByRole('button',{name:'다른 추천 예시 보기'})).toBeVisible();
  await opening.getByRole('button',{name:'내 조건으로 추천받기',exact:true}).click();
  await expect(page.getByRole('heading',{name:'어디서 뛸까요?',exact:true})).toBeVisible();
  await expect(page.getByLabel('이메일',{exact:true})).toBeHidden();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('group',{name:'포지션',exact:true}).getByRole('radio',{name:'MF · 미드필더',exact:true}).check();
  await page.getByRole('button',{name:'추천 경기 보기',exact:true}).click();
  await expect(page.locator('.fm-beta-preview-note')).toContainText('3개 미리보기');
  const pager=page.getByRole('navigation',{name:'추천 경기 페이지'});
  await pager.getByRole('button',{name:'다음',exact:true}).click();
  await pager.getByRole('button',{name:'다음',exact:true}).click();
  await expect(pager.getByRole('button',{name:'전체 추천 보기',exact:true})).toBeVisible();
  const selected=await page.locator('.fm-beta-match').getAttribute('data-match-id');
  await page.screenshot({path:testInfo.outputPath('recommendation-preview-390.png'),fullPage:true});
  await pager.getByRole('button',{name:'전체 추천 보기',exact:true}).click();
  await expect(page.locator('.fm-beta-preview-note')).toContainText('전체 보기');
  await expect(page.getByLabel('이메일',{exact:true})).toBeHidden();
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await expect(page.getByRole('button',{name:'Google로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Kakao로 계속하기'})).toBeVisible();
  const email=page.getByLabel('이메일',{exact:true});
  await expect(email).toBeVisible();
  const geometry=await page.evaluate(()=>{
    const form=document.querySelector('[data-form="auth"]').getBoundingClientRect();
    const social=document.querySelector('[data-beta-social-auth]').getBoundingClientRect();
    return {formBottom:form.bottom,socialTop:social.top,document:document.documentElement.scrollHeight,viewport:innerHeight};
  });
  expect(geometry.socialTop).toBeGreaterThanOrEqual(geometry.formBottom);
  expect(geometry.document-geometry.viewport).toBeLessThanOrEqual(1);
  await page.screenshot({path:testInfo.outputPath('reference-login-390.png'),fullPage:true});
  await page.getByRole('button',{name:'← 뒤로',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id',selected);
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await email.fill('beta@example.com');
  await page.getByRole('checkbox',{name:'아이디 저장',exact:true}).check();
  await page.getByLabel('비밀번호',{exact:true}).fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await page.waitForURL('**/beta');
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-guest','false');
  await expect(page.locator('.fm-beta-preview-note')).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')).position)).toBe('MF');
  expect(await page.evaluate(()=>localStorage.getItem('footmate:beta:remember-email:v1'))).toBe('beta@example.com');
  expect(await serious(page)).toEqual([]);
});

test('mobile match detail keeps selection through login and returns to app navigation',async({page})=>{
  await page.setViewportSize({width:390,height:700});
  const backend=await mockBackend(page);
  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'상세 보기',exact:true}).click();
  await expect(page.getByRole('heading',{name:'경기 상세',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'영통 금요일 저녁 경기',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'모집 포지션',exact:true}).click();
  await expect(page.locator('.fm-beta-detail .fm-beta-slot')).toHaveCount(4);
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await expect(page.getByRole('button',{name:'로그인',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'← 뒤로',exact:true}).click();
  await expect(page.getByRole('heading',{name:'경기 상세',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await page.getByLabel('이메일').fill('beta@example.com');
  await page.getByLabel('비밀번호').fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await expect(page.getByRole('heading',{name:'경기 상세',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'MF로 참가',exact:true})).toBeVisible();
  expect(backend.isJoined()).toBe(false);
  await expect.poll(async()=>{
    const bounds=await page.getByRole('button',{name:'MF로 참가',exact:true}).boundingBox();
    return Boolean(bounds&&bounds.y+bounds.height<=700);
  }).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight)).toBe(false);
  expect(await serious(page)).toEqual([]);
  await page.getByRole('button',{name:'추천으로 돌아가기',exact:true}).click();
  await expect(page.getByRole('heading',{name:'추천 경기',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'상세 보기',exact:true}).click();
  await page.getByRole('button',{name:'MF로 참가',exact:true}).click();
  expect(backend.isJoined()).toBe(true);
  await expect(page.getByRole('navigation',{name:'Beta 메뉴',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'참가 취소',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'MY',exact:true}).click();
  await expect(page.getByRole('button',{name:'프로필 저장',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'추천',exact:true}).click();
  await expect(page.getByRole('heading',{name:'추천 경기',exact:true})).toBeVisible();
});

for(const [width,height] of [[320,568],[390,844]]){
 test('design QA keeps compact cards and a reachable detail action '+width,async({page},testInfo)=>{
  await page.setViewportSize({width,height});
  await mockBackend(page);
  await page.route(origin+'/rest/v1/matches**',route=>fulfill(route,[baseMatch,{...baseMatch,id:'11111111-1111-4111-8111-222222222222',title:'다음 풋살 경기'}]));
  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{name:'영통 금요일 저녁 경기',exact:true})).toBeVisible();
  await expect(page.locator('.fm-beta-match')).toBeVisible();
  await expect.poll(async()=>{
    const card=await page.locator('.fm-beta-match').boundingBox();
    const pager=await page.getByRole('navigation',{name:'추천 경기 페이지',exact:true}).boundingBox();
    return !!card&&!!pager&&card.y+card.height<=pager.y+1&&card.height<height*.75;
  }).toBe(true);
  await page.getByRole('button',{name:'상세 보기',exact:true}).click();
  const info=await page.locator('.fm-beta-detail-body').boundingBox();
  const action=await page.getByRole('button',{name:'참가하기',exact:true}).boundingBox();
  expect(info.y+info.height).toBeLessThan(action.y);
  expect(action.y+action.height).toBeLessThanOrEqual(height);
  await page.getByRole('button',{name:'모집 포지션',exact:true}).click();
  await expect(page.locator('.fm-beta-detail .fm-beta-slot')).toHaveCount(4);
  const slotAction=await page.getByRole('button',{name:'참가하기',exact:true}).boundingBox();
  expect(slotAction.y+slotAction.height).toBeLessThanOrEqual(height);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight)).toBe(false);
  expect(await serious(page)).toEqual([]);
  await page.screenshot({path:testInfo.outputPath('design-qa-detail-'+width+'.png'),fullPage:true});
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await page.getByLabel('이메일',{exact:true}).fill('beta@example.com');
  await page.getByLabel('비밀번호',{exact:true}).fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await expect(page.getByRole('button',{name:'MF로 참가',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'추천으로 돌아가기',exact:true}).click();
  const signedInAction=await page.getByRole('button',{name:'MF로 참가',exact:true}).boundingBox();
  const appNav=await page.getByRole('navigation',{name:'Beta 메뉴',exact:true}).boundingBox();
  expect(signedInAction.y+signedInAction.height).toBeLessThanOrEqual(appNav.y);
  await page.screenshot({path:testInfo.outputPath('design-qa-home-signed-in-'+width+'.png'),fullPage:true});
  await page.getByRole('button',{name:'MY',exact:true}).click();
  await expect(page.getByRole('button',{name:'프로필 저장',exact:true})).toBeVisible();
  expect(await serious(page)).toEqual([]);
  await page.screenshot({path:testInfo.outputPath('design-qa-my-'+width+'.png'),fullPage:true});
 });
}

test('recommendation labels distinguish unrestricted browse and selected conditions',async({page})=>{
 await mockBackend(page);
 await page.route('**/api/ai-match-assistant',route=>fulfill(route,{rankedMatchIds:[matchId]}));
 await page.goto('/beta',{waitUntil:'domcontentloaded'});
 const summary=page.getByRole('region',{name:'추천 조건',exact:true});
 await expect(summary).toContainText('전체 경기 둘러보기');
 await expect(summary.locator('.fm-beta-ai-label')).toHaveCount(0);
 await page.getByRole('button',{name:'조건 변경',exact:true}).click();
 await page.getByRole('combobox',{name:'실력',exact:true}).selectOption('초중급');
 await page.getByRole('button',{name:'추천 경기 보기',exact:true}).click();
 await expect(summary).toContainText('나에게 맞는 경기');
 await expect(summary.locator('.fm-beta-ai-label')).toHaveText('AI 추천');
});

test('participation login explains selected match and stays scrollable on a short screen',async({page})=>{
 await page.setViewportSize({width:320,height:480});
 await mockBackend(page);
 await page.goto('/beta',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'참가하기',exact:true}).click();
 const context=page.getByRole('region',{name:'참가할 경기',exact:true});
 await expect(context).toContainText(baseMatch.title);
 await expect(context).toContainText('로그인만으로 참가가 확정되지는 않아요.');
 await expect(context).toContainText('9월');
 await page.getByRole('button',{name:'로그인',exact:true}).scrollIntoViewIfNeeded();
 await expect(page.getByRole('button',{name:'로그인',exact:true})).toBeInViewport();
 expect(await serious(page)).toEqual([]);
 await page.getByRole('button',{name:'← 뒤로',exact:true}).click();
 await expect(page.getByRole('heading',{name:baseMatch.title,exact:true})).toBeVisible();
});

test('general login clears abandoned match context while a new participation keeps its own selection',async({page})=>{
 await mockBackend(page);
 const next={...baseMatch,id:'11111111-1111-4111-8111-222222222222',title:'다음 풋살 경기'};
 await page.route(origin+'/rest/v1/matches**',route=>fulfill(route,[baseMatch,next]));
 await page.goto('/beta',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'참가하기',exact:true}).click();
 await expect(page.getByRole('region',{name:'참가할 경기',exact:true})).toContainText(baseMatch.title);
 await page.getByRole('button',{name:'← 뒤로',exact:true}).click();
 await page.getByRole('navigation',{name:'추천 경기 페이지',exact:true}).getByRole('button',{name:'다음',exact:true}).click();
 await expect(page.getByRole('heading',{name:next.title,exact:true})).toBeVisible();
 await page.getByRole('button',{name:'로그인',exact:true}).click();
 await expect(page.getByRole('region',{name:'참가할 경기',exact:true})).toHaveCount(0);
 expect(await page.evaluate(()=>sessionStorage.getItem('footmate:beta:pending-match:v1'))).toBeNull();
 await page.getByRole('button',{name:'← 뒤로',exact:true}).click();
 await page.getByRole('button',{name:'참가하기',exact:true}).click();
 await expect(page.getByRole('region',{name:'참가할 경기',exact:true})).toContainText(next.title);
 await page.getByRole('button',{name:'← 뒤로',exact:true}).click();
 await page.getByRole('button',{name:'로그인',exact:true}).click();
 await page.reload();
 await expect(page.getByRole('region',{name:'참가할 경기',exact:true})).toHaveCount(0);
 expect(await page.evaluate(()=>sessionStorage.getItem('footmate:beta:pending-match:v1'))).toBeNull();
});


test('random discovery keeps filters, avoids repeats and never calls AI for another draw',async({page})=>{
  await mockBackend(page);
  const eligible=[0,1,2,3].map(i=>({...baseMatch,id:`random-${i}`,title:`조건 일치 경기 ${i}`}));
  const ineligible=[{...baseMatch,id:'full',status:'full',remaining_spots:0},{...baseMatch,id:'past',starts_at:'2000-01-01T00:00:00Z'}];
  await page.route(origin+'/rest/v1/matches?**',route=>fulfill(route,[...eligible,...ineligible]));
  const requests=[];
  await page.route('**/api/ai-match-assistant',route=>{requests.push(route.request().postDataJSON());return fulfill(route,{mode:'connected-ai',rankedMatchIds:eligible.map(m=>m.id)})});
  await page.goto('/beta');
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id','random-0');
  const seen=new Set(['random-0']);
  const conditions=await page.evaluate(()=>localStorage.getItem('footmate:beta:preferences:v1'));
  for(let i=0;i<3;i++){
    await page.getByRole('button',{name:'다른 경기 추천',exact:true}).click();
    const id=await page.locator('.fm-beta-match').getAttribute('data-match-id');
    expect(seen.has(id)).toBe(false);expect(eligible.map(m=>m.id)).toContain(id);seen.add(id);
  }
  await expect(page.getByText('조건에 맞는 경기를 모두 봤어요.',{exact:true})).toBeVisible();
  const last=await page.locator('.fm-beta-match').getAttribute('data-match-id');
  await page.getByRole('button',{name:'다시 둘러보기',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).not.toHaveAttribute('data-match-id',last);
  expect(requests).toHaveLength(1);
  expect(requests[0].candidates.map(m=>m.id)).toEqual(eligible.map(m=>m.id));
  expect(await page.evaluate(()=>localStorage.getItem('footmate:beta:preferences:v1'))).toBe(conditions);
});

test('quick filters update results in place and zero results offer explicit recovery',async({page})=>{
  await mockBackend(page);
  await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:route.request().postDataJSON().candidates.map(m=>m.id)}));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/beta');
  await expect(page.locator('.fm-beta-match')).toHaveCount(1);
  await page.locator('#quick-filter-position').click();
  await page.getByRole('group',{name:'빠른 포지션',exact:true}).getByRole('radio',{name:'GK · 골키퍼',exact:true}).click();
  await expect(page.getByText('조건에 맞는 경기가 없어요.',{exact:true})).toBeVisible();
  await expect(page.locator('.fm-beta-match')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'전체 조건 해제',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')).position)).toBe('GK');
  await page.getByRole('button',{name:'전체 조건 해제',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).toHaveCount(1);
  await page.locator('#quick-filter-afterTime').click();
  await page.getByRole('group',{name:'빠른 선호 시간',exact:true}).getByRole('radio',{name:'저녁 8시 이후',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).toHaveCount(1);
  await page.locator('#quick-filter-region').click();
  await page.getByRole('group',{name:'빠른 활동 지역',exact:true}).getByRole('radio',{name:'서울 · 강남',exact:true}).click();
  await expect(page.getByRole('button',{name:'시간 조건 해제',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'시간 조건 해제',exact:true}).click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')));
  expect(saved.region).toBe('서울 · 강남');expect(saved.afterTime).toBe('');
  await expect(page.getByText('조건에 맞는 경기가 없어요.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'전체 조건 해제',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).toHaveCount(1);
  for(const width of [320,375,390,430,1440]){
    await page.setViewportSize({width,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    await expect(page.getByRole('button',{name:'상세 보기',exact:true})).toBeInViewport();
  }
  expect(await serious(page)).toEqual([]);
});

test('AI loading hides provisional cards and late responses cannot overwrite a newer filter',async({page})=>{
  await mockBackend(page,{preferences:false});
  const second={...baseMatch,id:'second-region',region:'서울 · 강남',title:'강남 경기'};
  await page.route(origin+'/rest/v1/matches?**',route=>fulfill(route,[baseMatch,second]));
  const pending=[];
  await page.route('**/api/ai-match-assistant',route=>{pending.push(route)});
  await page.goto('/beta');
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('button',{name:'추천 경기 보기',exact:true}).click();
  await expect.poll(()=>pending.length).toBe(1);
  await expect(page.getByText('선택한 조건으로 추천을 준비하고 있어요.',{exact:true})).toBeVisible();
  await expect(page.locator('.fm-beta-match')).toHaveCount(0);
  await page.locator('#quick-filter-region').click();
  await page.getByRole('group',{name:'빠른 활동 지역',exact:true}).getByRole('radio',{name:'서울 · 강남',exact:true}).click();
  await expect.poll(()=>pending.length).toBe(2);
  await fulfill(pending[1],{mode:'connected-ai',rankedMatchIds:['invented',second.id]});
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id',second.id);
  await fulfill(pending[0],{mode:'connected-ai',rankedMatchIds:[matchId]});
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id',second.id);
  await expect(page.locator('#quick-filter-region')).toBeFocused();
});

test('refreshing recommendations preserves the viewed match and discovery history',async({page})=>{
  await mockBackend(page);
  const rows=[baseMatch,{...baseMatch,id:'second',title:'두 번째 경기'},{...baseMatch,id:'third',title:'세 번째 경기'}];
  await page.route(origin+'/rest/v1/matches?**',route=>fulfill(route,rows));
  await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:rows.map(m=>m.id)}));
  await page.goto('/beta');
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-recommendations-ready','true');
  await expect(page.locator('.fm-beta-match')).toHaveCount(1);
  const initialId=await page.locator('.fm-beta-match').getAttribute('data-match-id');
  await page.getByRole('button',{name:'다른 경기 추천',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).not.toHaveAttribute('data-match-id',initialId);
  const id=await page.locator('.fm-beta-match').getAttribute('data-match-id');
  await page.getByRole('button',{name:'새로고침',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id',id);
  await page.getByRole('button',{name:'다른 경기 추천',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).not.toHaveAttribute('data-match-id',id);
  await expect(page.getByText('조건에 맞는 경기를 모두 봤어요.',{exact:true})).toBeVisible();
});

test('a refreshed full position cannot be drawn from stale recommendation IDs',async({page})=>{
  await mockBackend(page);
  await page.addInitScript(()=>localStorage.setItem('footmate:beta:preferences:v1',JSON.stringify({sport:'futsal',region:'수원 · 영통',level:'초중급',position:'MF',afterTime:''})));
  let full=false;
  await page.route(origin+'/rest/v1/matches?**',route=>fulfill(route,[full?{...baseMatch,match_slots:baseMatch.match_slots.map(slot=>slot.position==='MF'?{...slot,remaining_spots:0}:slot)}:baseMatch,{...baseMatch,id:'available-second',title:'남은 자리 있는 경기'}]));
  await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:[matchId,'available-second']}));
  await page.goto('/beta');
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id',matchId);
  full=true;
  await page.getByRole('button',{name:'새로고침',exact:true}).click();
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id','available-second');
  await expect(page.getByRole('button',{name:'다른 경기 추천',exact:true})).toHaveCount(0);
});

test('random discovery keeps the drawn demo match through participation login',async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>0.999999;});
  const backend=await mockBackend(page,{empty:true});
  await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:route.request().postDataJSON().candidates.map(m=>m.id)}));
  await page.goto('/demo');
  await expect(page.getByRole('button',{name:'다른 경기 추천',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'다른 경기 추천',exact:true}).click();
  const selected=await page.locator('.fm-beta-match').getAttribute('data-match-id');
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await page.getByLabel('이메일').fill('beta@example.com');
  await page.getByLabel('비밀번호').fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await page.waitForURL('**/beta');
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id',selected);
  expect(backend.isJoined()).toBe(false);
});

test('enhanced discovery applies Seoul dates and exclusive start-time bounds',async({page})=>{
 await mockBackend(page);
 await page.clock.setFixedTime(new Date('2026-10-26T15:00:00Z'));
 const rows=[{...baseMatch,id:'today-match',starts_at:'2026-10-27T20:00:00+09:00'},{...baseMatch,id:'tomorrow-match',starts_at:'2026-10-28T21:00:00+09:00'}];
 await page.route(origin+'/rest/v1/matches?**',r=>fulfill(r,rows));
 await page.route('**/api/ai-match-assistant',r=>fulfill(r,{rankedMatchIds:r.request().postDataJSON().candidates.map(m=>m.id)}));
 await page.goto('/beta');
 await expect(page.locator('.fm-beta-match')).toHaveCount(1);
 await page.locator('#quick-filter-afterTime').click();
 await page.getByRole('group',{name:'빠른 경기 날짜',exact:true}).getByRole('radio',{name:'내일',exact:true}).click();
 await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id','tomorrow-match');
 await page.locator('#quick-filter-afterTime').click();
 await page.getByRole('group',{name:'빠른 시작 시간 상한',exact:true}).getByRole('radio',{name:'저녁 6시 전 시작',exact:true}).click();
 await expect(page.getByText('조건에 맞는 경기가 없어요.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'시간 조건 해제',exact:true}).click();
 await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id','tomorrow-match');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')).dateWindow)).toBe('tomorrow');
});

test('enhanced discovery keeps an open quick filter through AI completion',async({page})=>{
 await mockBackend(page);let finishFirst,first=true;
 await page.route('**/api/ai-match-assistant',async route=>{
  if(first){first=false;await new Promise(resolve=>finishFirst=resolve)}
  return fulfill(route,{rankedMatchIds:route.request().postDataJSON().candidates.map(m=>m.id)});
 });
 await page.goto('/demo');
 await page.locator('#quick-filter-afterTime').click();
 const tomorrow=page.getByRole('group',{name:'빠른 경기 날짜',exact:true}).getByRole('radio',{name:'내일',exact:true});
 await expect(tomorrow).toBeVisible();await expect.poll(()=>Boolean(finishFirst)).toBe(true);
 finishFirst();await expect(page.locator('.fm-beta-match')).toHaveCount(1);
 await expect(tomorrow).toBeVisible();await tomorrow.click();
 await expect(page.locator('#quick-filter-afterTime')).toContainText('내일');
});

test('enhanced discovery reuses valid rankings, expires them and separates demo measurement',async({page})=>{
 await mockBackend(page);
 let calls=0;
 await page.route('**/api/ai-match-assistant',r=>{calls++;return fulfill(r,{rankedMatchIds:r.request().postDataJSON().candidates.map(m=>m.id)})});
 await page.goto('/demo');await expect(page.getByRole('button',{name:'다른 경기 추천',exact:true})).toBeVisible();
 await expect.poll(()=>calls).toBe(1);
 await page.getByRole('button',{name:'다른 경기 추천',exact:true}).click();
 const local=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('footmate:beta:discovery-events:v1')));
 expect(local.some(e=>e.event==='recommendation_redrawn')).toBe(true);
 expect(local.every(e=>e.source==='demo'&&e.cohort==='demo')).toBe(true);
 expect(local.every(e=>!('email' in e)&&!('access_token' in e))).toBe(true);
 await page.reload();await expect(page.locator('.fm-beta-match')).toHaveCount(1);expect(calls).toBe(1);
 await page.evaluate(()=>{const key='footmate:beta:ranking:v1';const value=JSON.parse(localStorage.getItem(key));value.createdAt=Date.now()-300001;localStorage.setItem(key,JSON.stringify(value))});
 await page.reload();await expect.poll(()=>calls).toBe(2);
});

test('discovery followup stores explicit reactions and clears them without expanding filters',async({page})=>{
 await mockBackend(page);
 await page.goto('/demo');
 await page.getByRole('button',{name:'상세 보기',exact:true}).click();
 await page.locator('.fm-beta-reaction-panel summary').click();
 await page.getByRole('button',{name:'관심 있어요',exact:true}).click();
 await expect(page.locator('.fm-beta-reaction-panel')).toHaveAttribute('open','');
 await expect(page.getByRole('button',{name:'관심 있어요',exact:true})).toHaveCSS('background-color','rgb(220, 239, 207)');
 await expect(page.getByRole('button',{name:'관심 있어요',exact:true})).toHaveAttribute('aria-pressed','true');
 const saved=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('footmate:beta:reactions:')).map(k=>JSON.parse(localStorage.getItem(k))).flat());
 expect(saved).toHaveLength(1);expect(saved[0].scope).toBe('demo');
 await page.getByRole('button',{name:'추천 반응 초기화',exact:true}).click();
 await expect(page.locator('.fm-beta-reaction-panel')).toHaveAttribute('open','');
 await expect(page.getByRole('button',{name:'관심 있어요',exact:true})).toHaveAttribute('aria-pressed','false');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')).region)).toBe('');
});

test('discovery followup comparison allows direct setup and preserves default intro',async({page})=>{
 await mockBackend(page,{preferences:false});
 await page.addInitScript(()=>sessionStorage.removeItem('footmate:beta:entered:v1'));
 await page.goto('/demo?opening=quick');
 await expect(page.locator('.fm-beta-opening')).toHaveCount(0);
 await expect(page.locator('form[data-growth-form="recommend"]')).toBeVisible();
 await page.goto('/demo?opening=control');
 await expect(page.locator('.fm-beta-opening')).toBeVisible();
});

test('discovery followup sends real events only after consent and stops on withdrawal',async({page})=>{
 await mockBackend(page);let enabled=false;const sent=[];
 await page.route(`${origin}/rest/v1/discovery_consents**`,route=>{
  if(route.request().method()==='GET')return fulfill(route,[{enabled}]);
  enabled=route.request().postDataJSON().enabled;return route.fulfill({status:201,body:''});
 });
 await page.route(`${origin}/rest/v1/discovery_events**`,route=>{sent.push(...route.request().postDataJSON());return route.fulfill({status:201,body:''})});
 await page.goto('/beta');await page.locator('[data-action="open-account"]').click();
 await page.getByLabel('이메일').fill('beta@example.com');await page.getByLabel('비밀번호').fill('safe-password');await page.getByRole('button',{name:'로그인',exact:true}).click();
 await expect(page.locator('[data-action="open-account"]')).toHaveText('도현');expect(sent).toHaveLength(0);
 const consent=async()=>{
  await page.locator('[data-action="open-account"]').click();await page.getByRole('button',{name:'설정',exact:true}).click();
  await page.getByText('추천 개선 통계 참여 · 선택',{exact:true}).click();await page.locator('[data-action="discovery-consent"]').click();
 };
 await consent();await expect(page.locator('[data-action="discovery-consent"]')).toHaveText('통계 참여 해제');
 await page.getByRole('button',{name:'추천',exact:true}).click();await page.getByRole('button',{name:'상세 보기',exact:true}).click();
 await expect.poll(()=>sent.some(e=>e.event_name==='match_detail_opened'&&e.match_id===matchId)).toBe(true);
 await page.getByRole('button',{name:'추천으로 돌아가기',exact:true}).click();await consent();
 await expect(page.locator('[data-action="discovery-consent"]')).toHaveText('통계 참여하기');const count=sent.length;
 await page.getByRole('button',{name:'추천',exact:true}).click();await page.getByRole('button',{name:'상세 보기',exact:true}).click();expect(sent).toHaveLength(count);
});

test('discovery hotfix preserves failed withdrawal across reload until server acknowledgement',async({page})=>{
 await mockBackend(page);let enabled=true,withdrawFails=true;const sent=[];
 await page.route(`${origin}/rest/v1/discovery_consents**`,route=>{
  if(route.request().method()==='GET')return fulfill(route,[{enabled}]);
  if(withdrawFails)return fulfill(route,{message:'offline'},503);
  enabled=route.request().postDataJSON().enabled;return route.fulfill({status:201,body:''});
 });
 await page.route(`${origin}/rest/v1/discovery_events**`,route=>{sent.push(...route.request().postDataJSON());return route.fulfill({status:201,body:''})});
 await page.goto('/beta');await page.locator('[data-action="open-account"]').click();
 await page.getByLabel('이메일').fill('beta@example.com');await page.getByLabel('비밀번호').fill('safe-password');await page.getByRole('button',{name:'로그인',exact:true}).click();
 await expect(page.locator('[data-action="open-account"]')).toHaveText('도현');
 const settings=async()=>{
  await page.locator('[data-action="open-account"]').click();await page.getByRole('button',{name:'설정',exact:true}).click();
  await page.getByText('추천 개선 통계 참여 · 선택',{exact:true}).click();
 };
 await settings();await page.getByRole('button',{name:'서버 통계 참여 해제',exact:true}).click();
 await expect(page.locator('[data-action="discovery-consent"]')).toHaveText('서버 통계 해제 재시도');
 expect(enabled).toBe(true);await page.reload();await expect(page.locator('[data-action="open-account"]')).toHaveText('도현');
 await settings();await expect(page.getByRole('button',{name:'서버 통계 해제 재시도',exact:true})).toBeVisible();
 const count=sent.length;
 await page.getByRole('button',{name:'추천',exact:true}).click();await page.getByRole('button',{name:'상세 보기',exact:true}).click();
 expect(sent).toHaveLength(count);
 await page.getByRole('button',{name:'추천으로 돌아가기',exact:true}).click();await settings();
 withdrawFails=false;await page.getByRole('button',{name:'서버 통계 해제 재시도',exact:true}).click();
 await expect(page.locator('[data-action="discovery-consent"]')).toHaveText('통계 참여하기');expect(enabled).toBe(false);
});

test('discovery hotfix separates comparison assignment from default visits and shows assigned intro',async({page})=>{
 await mockBackend(page);
 await page.addInitScript(()=>{
  sessionStorage.setItem('footmate:beta:opening-variant:v1','control');
  Math.random=()=>sessionStorage.getItem('footmate:beta:opening-comparison:v2')?0:.99;
 });
 await page.goto('/demo?opening=compare');
 await expect(page.locator('.fm-beta-match')).toHaveCount(1);
 expect(await page.evaluate(()=>sessionStorage.getItem('footmate:beta:opening-comparison:v2'))).toBe('quick');
 await page.reload();await expect(page.locator('.fm-beta-match')).toHaveCount(1);
 expect(await page.evaluate(()=>sessionStorage.getItem('footmate:beta:opening-comparison:v2'))).toBe('quick');
 await page.evaluate(()=>sessionStorage.setItem('footmate:beta:opening-comparison:v2','control'));
 await page.reload();await expect(page.locator('.fm-beta-opening')).toBeVisible();
 await page.getByRole('button',{name:'내 조건으로 추천받기',exact:true}).click();
 await expect(page.locator('.fm-beta-match')).toHaveCount(1);
});

for(const fallbackRemoval of [false,true])test(`discovery qa keeps collection off after quota failure and reload (${fallbackRemoval?'remove permit':'reserved slot'})`,async({page})=>{
 await mockBackend(page);let enabled=false,withdrawFails=true;const sent=[];
 await page.addInitScript(({fallbackRemoval})=>{
  const original=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
   if(localStorage.getItem('footmate:qa:quota')==='1'&&(key.startsWith('footmate:beta:discovery-withdrawal:')||(fallbackRemoval&&key.startsWith('footmate:beta:discovery-permission:'))))throw new DOMException('Storage quota exceeded','QuotaExceededError');
   return original.call(this,key,value);
  };
 },{fallbackRemoval});
 await page.route(`${origin}/rest/v1/discovery_consents**`,route=>{
  if(route.request().method()==='GET')return fulfill(route,[{enabled}]);
  const next=route.request().postDataJSON().enabled;
  if(!next&&withdrawFails)return fulfill(route,{message:'offline'},503);
  enabled=next;return route.fulfill({status:201,body:''});
 });
 await page.route(`${origin}/rest/v1/discovery_events**`,route=>{sent.push(...route.request().postDataJSON());return route.fulfill({status:201,body:''})});
 await page.goto('/beta');await page.locator('[data-action="open-account"]').click();
 await page.getByLabel('이메일').fill('beta@example.com');await page.getByLabel('비밀번호').fill('safe-password');await page.getByRole('button',{name:'로그인',exact:true}).click();
 await expect(page.locator('[data-action="open-account"]')).toHaveText('도현');
 const settings=async()=>{
  await page.locator('[data-action="open-account"]').click();await page.getByRole('button',{name:'설정',exact:true}).click();
  await page.getByText('추천 개선 통계 참여 · 선택',{exact:true}).click();
 };
 await settings();await page.getByRole('button',{name:'통계 참여하기',exact:true}).click();
 await expect(page.locator('[data-action="discovery-consent"]')).toHaveText('통계 참여 해제');
 await page.evaluate(()=>localStorage.setItem('footmate:qa:quota','1'));
 await page.getByText('추천 개선 통계 참여 · 선택',{exact:true}).click();
 await page.getByRole('button',{name:'통계 참여 해제',exact:true}).click();
 await expect(page.locator('[data-action="discovery-consent"]')).toHaveText('서버 통계 해제 재시도');
 await page.reload();await expect(page.locator('[data-action="open-account"]')).toHaveText('도현');await settings();
 const retryName=fallbackRemoval?'서버 통계 참여 해제':'서버 통계 해제 재시도';
 await expect(page.getByRole('button',{name:retryName,exact:true})).toBeVisible();expect(enabled).toBe(true);
 const count=sent.length;await page.getByRole('button',{name:'추천',exact:true}).click();await page.getByRole('button',{name:'상세 보기',exact:true}).click();
 await page.waitForTimeout(100);expect(sent).toHaveLength(count);
 await page.getByRole('button',{name:'추천으로 돌아가기',exact:true}).click();await settings();
 await page.evaluate(()=>localStorage.setItem('footmate:qa:quota','0'));withdrawFails=false;
 await page.getByRole('button',{name:retryName,exact:true}).click();
 await expect(page.locator('[data-action="discovery-consent"]')).toHaveText('통계 참여하기');expect(enabled).toBe(false);
 await page.getByText('추천 개선 통계 참여 · 선택',{exact:true}).click();await page.getByRole('button',{name:'통계 참여하기',exact:true}).click();
 await expect(page.locator('[data-action="discovery-consent"]')).toHaveText('통계 참여 해제');
 await page.getByRole('button',{name:'추천',exact:true}).click();await page.getByRole('button',{name:'상세 보기',exact:true}).click();
 await expect.poll(()=>sent.length).toBeGreaterThan(count);
});


test('discovery qa visual design keeps preview, filters and selected reactions clear on mobile',async({page},testInfo)=>{
 await mockBackend(page);
 await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:route.request().postDataJSON().candidates.map(m=>m.id)}));
 await page.addInitScript(()=>sessionStorage.removeItem('footmate:beta:entered:v1'));
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390]){
  await page.setViewportSize({width,height:740});
  await page.goto('/demo?opening=control');
  const preview=page.getByRole('region',{name:'추천 예시',exact:true});
  await expect(preview).toBeVisible();
  const title=await preview.locator('h2').textContent();
  await preview.getByRole('button',{name:'다른 추천 예시 보기'}).click();
  await expect(preview.locator('h2')).not.toHaveText(title);
  await expect(preview.locator('.fm-beta-preview-card')).toHaveCSS('animation-name','none');
  await page.screenshot({path:testInfo.outputPath(`opening-${width}.png`)});
  await expect(page.getByRole('button',{name:'내 조건으로 추천받기',exact:true})).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.getByRole('button',{name:'내 조건으로 추천받기',exact:true}).click();
 await expect(page.locator('.fm-beta-filter-count')).toHaveText('원하는 조건을 골라보세요');
 await page.locator('#quick-filter-level').click();
 await page.getByRole('group',{name:'빠른 실력',exact:true}).getByRole('radio',{name:'중급',exact:true}).click();
 await expect(page.locator('.fm-beta-filter-count')).toHaveText('조건 1개 선택됨');
 await expect(page.locator('details[data-filter-active="true"]')).toHaveCount(1);
 await expect(page.locator('#quick-filter-level')).toHaveCSS('background-color','rgb(232, 243, 223)');
 await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-tone',/morning|day|evening/);
 await expect(page.locator('.fm-beta-match-reason')).not.toBeEmpty();
 await page.getByRole('button',{name:'상세 보기',exact:true}).click();
 await page.locator('.fm-beta-reaction-panel summary').click();
 await page.getByRole('button',{name:'다른 시간 원해요',exact:true}).click();
 await expect(page.getByRole('button',{name:'다른 시간 원해요',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:'관심 있어요',exact:true})).toHaveAttribute('aria-pressed','false');
 await expect(page.getByRole('button',{name:'다른 시간 원해요',exact:true})).toBeInViewport();
 await expect(page.getByRole('button',{name:'다른 시간 원해요',exact:true})).toBeFocused();
 await page.screenshot({path:testInfo.outputPath('detail-selected.png')});
 await page.getByRole('button',{name:'다른 시간 원해요',exact:true}).click();
 await expect(page.locator('.fm-beta-reaction-panel')).toHaveAttribute('open','');
 await expect(page.getByRole('button',{name:'다른 시간 원해요',exact:true})).toHaveAttribute('aria-pressed','false');
 expect(await serious(page)).toEqual([]);
});


test('discovery qa followup keeps reaction rows and reset controls stable',async({page},testInfo)=>{
 await mockBackend(page);
 await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:route.request().postDataJSON().candidates.map(m=>m.id)}));
 await page.addInitScript(()=>localStorage.setItem('footmate:beta:preferences:v1',JSON.stringify({sport:'futsal',region:'',level:'중급',position:'',afterTime:''})));
 await page.setViewportSize({width:320,height:740});
 await page.goto('/demo');
 await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-recommendations-ready','true');
 await expect(page.locator('.fm-beta-filter-count')).toHaveText('조건 1개 선택됨');
 const reset=page.getByRole('button',{name:'전체 조건 해제',exact:true});
 await expect(reset).toHaveCount(1);await expect(reset).toBeVisible();
 await reset.click();
 await expect(page.locator('.fm-beta-filter-count')).toHaveText('원하는 조건을 골라보세요');
 await expect(page.locator('#quick-filter-region')).toBeFocused();
 await expect(page.locator('details[data-filter-active="true"]')).toHaveCount(0);
 await page.screenshot({path:testInfo.outputPath('filters-reset-320.png')});
 await page.getByRole('button',{name:'상세 보기',exact:true}).click();
 await page.locator('.fm-beta-reaction-panel summary').click();
 const interested=page.getByRole('button',{name:'관심 있어요',exact:true});
 await interested.click();await interested.click();
 await expect(interested).toHaveAttribute('aria-pressed','false');
 await expect(interested).toBeFocused();await expect(interested).toBeInViewport();
 await expect(page.locator('.fm-beta-reaction-panel')).toHaveAttribute('open','');
 await expect(page.getByText('선택한 반응이 없어요.',{exact:true})).toBeVisible();
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:740});
  const boxes=await page.locator('[data-action="recommendation-reaction"]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,x:r.x}}));
  expect(Math.max(...boxes.map(b=>b.width))-Math.min(...boxes.map(b=>b.width))).toBeLessThan(1);
  expect(boxes.every(b=>b.height>=44)).toBe(true);
  expect(Math.max(...boxes.map(b=>b.x))-Math.min(...boxes.map(b=>b.x))).toBeLessThan(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.getByRole('button',{name:'다른 구장 원해요',exact:true}).click();
 await page.getByRole('button',{name:'추천 반응 초기화',exact:true}).click();
 await expect(page.locator('.fm-beta-reaction-panel')).toHaveAttribute('open','');
 await expect(page.getByRole('button',{name:'추천 반응 초기화',exact:true})).toBeFocused();
 await expect(page.getByRole('button',{name:'추천 반응 초기화',exact:true})).toBeInViewport();
 await expect(page.locator('[data-action="recommendation-reaction"][aria-pressed="true"]')).toHaveCount(0);
 await page.screenshot({path:testInfo.outputPath('reactions-cleared-430.png')});
 expect(await serious(page)).toEqual([]);
});

test('demo recommendation preview survives an unavailable backend config',async({page})=>{
  await page.addInitScript(()=>sessionStorage.setItem('footmate:beta:entered:v1','1'));
  await page.route('**/api/beta-config',route=>fulfill(route,{connected:false,code:'BETA_BACKEND_NOT_CONFIGURED'},503));
  await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:route.request().postDataJSON().candidates.map(m=>m.id)}));
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-catalog-source','demo');
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('group',{name:'포지션',exact:true}).getByRole('radio',{name:'MF · 미드필더',exact:true}).check();
  await page.getByRole('button',{name:'추천 경기 보기'}).click();
  await expect(page.locator('.fm-beta-match-cover small')).toHaveText('데모 경기');
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await page.getByLabel('이메일').fill('beta@example.com');
  await page.getByLabel('비밀번호').fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await expect(page.getByText('로그인 연결을 사용할 수 없어요.',{exact:false})).toBeVisible();
});

test('selected demo match stays available after sign-in even when live matches exist',async({page})=>{
  const backend=await mockBackend(page,{preferences:false});
  await page.route('**/api/ai-match-assistant',route=>fulfill(route,{mode:'connected-ai',rankedMatchIds:route.request().postDataJSON().candidates.map(m=>m.id)}));
  await page.route(origin+'/auth/v1/settings',route=>fulfill(route,{external:{google:true,kakao:true}}));
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.getByRole('group',{name:'활동 지역',exact:true}).getByRole('radio',{name:'수원 · 영통',exact:true}).check();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('group',{name:'포지션',exact:true}).getByRole('radio',{name:'MF · 미드필더',exact:true}).check();
  await page.getByRole('button',{name:'추천 경기 보기'}).click();
  const selected=await page.locator('.fm-beta-match').getAttribute('data-match-id');
  expect(selected).toMatch(/^demo-/);
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await page.getByLabel('이메일').fill('beta@example.com');
  await page.getByLabel('비밀번호').fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await page.waitForURL('**/beta');
  await expect(page.locator('.fm-beta-match')).toHaveAttribute('data-match-id',selected);
  expect(backend.isJoined()).toBe(false);
  await page.getByRole('button',{name:'MF로 참가'}).click();
  await expect(page.getByText('MF 데모 참가를 완료했어요.')).toBeVisible();
  expect(backend.isJoined()).toBe(false);
});

test('new live venue region appears in the first-step location choices',async({page})=>{
  await mockBackend(page,{preferences:false});
  await page.route(origin+'/rest/v1/matches?**',route=>fulfill(route,[{...baseMatch,id:'77777777-7777-4777-8777-777777777777',title:'송파 저녁 풋살',region:'서울 · 송파',area_label:'송파'}]));
  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{name:'어디서 뛸까요?',exact:true})).toBeVisible();
  await expect(page.getByRole('group',{name:'활동 지역',exact:true}).getByRole('radio',{name:'서울 · 송파',exact:true})).toBeVisible();
  await page.getByRole('group',{name:'활동 지역',exact:true}).getByRole('radio',{name:'서울 · 송파',exact:true}).check();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('button',{name:'추천 경기 보기'}).click();
  await expect(page.locator('.fm-beta-preferences-summary')).toContainText('서울 · 송파');
});
