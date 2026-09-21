const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const origin='https://beta.example.supabase.co';
const matchId='11111111-1111-4111-8111-111111111111';
const userId='22222222-2222-4222-8222-222222222222';
const baseMatch={id:matchId,title:'영통 금요일 저녁 경기',venue_name:'영통 풋살장',area_label:'영통',address:'경기도 수원시 영통구',region:'수원 · 영통',level:'초중급',starts_at:'2099-09-25T20:00:00+09:00',price_krw:0,capacity_total:12,joined_count:8,remaining_spots:4,format_label:'6 vs 6',surface:'인조잔디',duration_minutes:80,status:'open',match_slots:[{position:'MF',capacity_total:4,joined_count:3,remaining_spots:1},{position:'FW',capacity_total:3,joined_count:2,remaining_spots:1},{position:'DF',capacity_total:4,joined_count:2,remaining_spots:2},{position:'GK',capacity_total:1,joined_count:1,remaining_spots:0}]};

function fulfill(route,payload,status=200){return route.fulfill({status,contentType:'application/json',body:JSON.stringify(payload)})}

async function mockBackend(page,{empty=false}={}){
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
  await expect(page).toHaveTitle('FootMate | Closed Beta');
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  await expect(page.getByText('Supabase Connected',{exact:true})).toBeVisible();
  await expect(page.getByText('영통 금요일 저녁 경기')).toBeVisible();
  await expect(page.getByRole('button',{name:'로그인 후 참가'})).toBeVisible();
  expect(await serious(page)).toEqual([]);

  await page.getByLabel('이메일').fill('beta@example.com');
  await page.getByLabel('비밀번호').fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await expect(page.getByText('도현')).toBeVisible();
  await expect(page.getByRole('button',{name:'MF로 참가'})).toBeVisible();

  await page.getByRole('button',{name:'MF로 참가'}).click();
  await expect(page.getByText('MF 포지션으로 참가가 확정됐습니다.')).toBeVisible();
  expect(backend.isJoined()).toBe(true);
  await expect(page.getByRole('button',{name:'참가 취소'})).toBeVisible();

  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.getByText('도현')).toBeVisible();
  await expect(page.getByRole('button',{name:'참가 취소'})).toBeVisible();
  await page.getByRole('button',{name:'참가 취소'}).click();
  await expect(page.getByText('참가를 취소했습니다. 잔여 자리가 복구됐습니다.')).toBeVisible();
  expect(backend.isJoined()).toBe(false);
  await expect(page.getByText('아직 참가한 경기가 없습니다.')).toBeVisible();
  await expect(page.getByText(/동기화/)).toBeVisible();
  expect(await serious(page)).toEqual([]);
});

test('closed beta enforces signup baseline and deletes account with explicit confirmation',async({page})=>{
  const backend=await mockBackend(page);
  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'처음이에요 · 가입하기'}).click();
  const signupPassword=page.getByLabel('비밀번호');
  await expect(signupPassword).toHaveAttribute('minlength','8');
  await expect(signupPassword).toHaveAttribute('placeholder','8자 이상');
  await page.getByRole('button',{name:'이미 계정이 있어요 · 로그인'}).click();

  await page.getByLabel('이메일').fill('beta@example.com');
  await page.getByLabel('비밀번호').fill('safe-password');
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await expect(page.getByText('저장 데이터: 이메일 · 이름 · 생활권 · 포지션 · 레벨 · 참가 상태. 결제 정보와 메시지 내용은 저장하지 않습니다.')).toBeVisible();
  await expect(page.getByRole('button',{name:'계정·참가 데이터 삭제'})).toBeVisible();

  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'계정·참가 데이터 삭제'}).click();
  await expect(page.getByText('계정과 연결된 Beta 개인정보·참가 기록을 삭제했습니다.')).toBeVisible();
  await expect(page.getByRole('button',{name:'로그인',exact:true})).toBeVisible();
  expect(backend.isDeleted()).toBe(true);
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
  await expect(page.getByText('아직 공개된 실제 경기가 없습니다.')).toBeVisible();
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
