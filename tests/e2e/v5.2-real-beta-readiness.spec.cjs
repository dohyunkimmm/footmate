const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const origin='https://beta.example.supabase.co';
const userId='22222222-2222-4222-8222-222222222222';
const operatorId='33333333-3333-4333-8333-333333333333';
const matchId='44444444-4444-4444-8444-444444444444';
const participantId='55555555-5555-4555-8555-555555555555';

function fulfill(route,payload,status=200){return route.fulfill({status,contentType:'application/json',body:JSON.stringify(payload)})}
async function serious(page,selector='.fm-beta'){const result=await new AxeBuilder({page}).include(selector).withTags(['wcag2a','wcag2aa']).analyze();return result.violations.filter(v=>['serious','critical'].includes(v.impact))}

function matchRow(overrides={}){
  return {id:matchId,title:'실제 Beta 경기',venue_name:'Beta 풋살장',area_label:'영통',address:'경기도 수원시 영통구',region:'수원 · 영통',level:'초중급',starts_at:'2099-09-25T20:00:00+09:00',cancel_cutoff_at:'2099-09-25T18:00:00+09:00',check_in_opens_at:'2000-09-25T19:30:00+09:00',price_krw:0,capacity_total:12,joined_count:1,remaining_spots:11,format_label:'6 vs 6',surface:'인조잔디',duration_minutes:80,status:'open',match_slots:[{position:'MF',capacity_total:4,joined_count:1,remaining_spots:3},{position:'FW',capacity_total:3,joined_count:0,remaining_spots:3},{position:'DF',capacity_total:4,joined_count:0,remaining_spots:4},{position:'GK',capacity_total:1,joined_count:0,remaining_spots:1}],...overrides};
}

async function installSession(page,{user=userId}={}){
  await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:'footmate:beta:auth:v1',value:{accessToken:'old-access',refreshToken:'refresh-token',expiresAt:4102444800,user}});
}

async function mockUserBackend(page,{joined=true}={}){
  let checkedIn=false;
  let notificationRead=false;
  let recoverRequests=0;
  let resendRequests=0;
  let passwordUpdates=0;
  await page.route('**/api/beta-config',route=>fulfill(route,{connected:true,url:origin,publishableKey:'public-key'}));
  await page.route(`${origin}/**`,async route=>{
    const request=route.request();const url=new URL(request.url());const path=url.pathname+url.search;
    if(path.startsWith('/auth/v1/token?grant_type=refresh_token'))return fulfill(route,{access_token:'access-token',refresh_token:'refresh-token-2',expires_in:3600,user:{id:userId,email:'beta@example.com'}});
    if(url.pathname==='/auth/v1/recover'){recoverRequests+=1;return fulfill(route,{})}
    if(url.pathname==='/auth/v1/resend'){resendRequests+=1;return fulfill(route,{})}
    if(url.pathname==='/auth/v1/user'&&request.method()==='PUT'){passwordUpdates+=1;return fulfill(route,{id:userId,email:'beta@example.com'})}
    if(url.pathname==='/auth/v1/user')return fulfill(route,{user:{id:userId,email:'beta@example.com'}});
    if(url.pathname==='/rest/v1/profiles')return fulfill(route,[{id:userId,display_name:'Beta User',region:'수원 · 영통',position:'MF',level:'초중급'}]);
    if(url.pathname==='/rest/v1/participations')return fulfill(route,joined?[{id:'p-1',match_id:matchId,user_id:userId,position:'MF',status:'confirmed',joined_at:'2099-01-01T00:00:00Z',canceled_at:null,checked_in_at:checkedIn?'2099-09-25T19:31:00+09:00':null,created_at:'2099-01-01T00:00:00Z',updated_at:'2099-01-01T00:00:00Z'}]:[]);
    if(url.pathname==='/rest/v1/matches')return fulfill(route,[matchRow()]);
    if(url.pathname==='/rest/v1/beta_notifications')return fulfill(route,[{id:1,event_type:'participation.joined',match_id:matchId,participation_id:'p-1',title:'참가가 확정됐습니다',body:'선택한 경기 참가가 확정되었습니다.',read_at:notificationRead?'2099-01-01T00:01:00Z':null,created_at:'2099-01-01T00:00:00Z'}]);
    if(url.pathname==='/rest/v1/rpc/check_in_participation'){checkedIn=true;return fulfill(route,[{participation_id:'p-1',checked_in_match_id:matchId,checked_in_at:'2099-09-25T19:31:00+09:00',already_checked_in:false}])}
    if(url.pathname==='/rest/v1/rpc/mark_beta_notification_read'){notificationRead=true;return fulfill(route,[{notification_id:1,read_at:'2099-01-01T00:01:00Z'}])}
    if(url.pathname==='/rest/v1/rpc/cancel_participation')return fulfill(route,[{participation_id:'p-1',canceled_match_id:matchId,participation_status:'canceled',remaining_spots:12,already_canceled:false}]);
    return fulfill(route,{message:`Unhandled ${request.method()} ${path}`},500);
  });
  return {recoverRequests:()=>recoverRequests,resendRequests:()=>resendRequests,passwordUpdates:()=>passwordUpdates,isCheckedIn:()=>checkedIn,isNotificationRead:()=>notificationRead};
}

test('beta account recovery requests reset and signup verification email',async({page})=>{
  const backend=await mockUserBackend(page,{joined:false});
  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('button',{name:'비밀번호 찾기'})).toBeVisible();
  await page.getByLabel('이메일').fill('beta@example.com');
  await page.getByRole('button',{name:'비밀번호 찾기'}).click();
  await expect(page.getByText(/비밀번호 재설정 이메일을 요청했습니다/)).toBeVisible();
  expect(backend.recoverRequests()).toBe(1);
  await page.getByRole('button',{name:'가입 인증메일 다시 보내기'}).click();
  await expect(page.getByText(/가입 인증메일을 다시 요청했습니다/)).toBeVisible();
  expect(backend.resendRequests()).toBe(1);
  expect(await serious(page)).toEqual([]);
});

test('beta recovery link allows password update',async({page})=>{
  const backend=await mockUserBackend(page,{joined:false});
  await page.goto('/beta#access_token=recovery-access&refresh_token=recovery-refresh&type=recovery&expires_in=3600',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{name:'새 비밀번호 설정'})).toBeVisible();
  await page.locator('[data-readiness-form="update-password"] input[name="password"]').fill('new-password-123');
  await page.locator('[data-readiness-form="update-password"] input[name="confirmPassword"]').fill('new-password-123');
  await page.getByRole('button',{name:'비밀번호 변경'}).click();
  await page.waitForURL('**/beta');
  expect(backend.passwordUpdates()).toBe(1);
});

test('beta participation exposes policy, connected check-in and in-app notification',async({page})=>{
  await installSession(page);
  const backend=await mockUserBackend(page,{joined:true});
  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await expect(page.getByText('Beta User')).toBeVisible();
  await expect(page.getByText(/취소 마감/)).toBeVisible();
  await expect(page.getByRole('button',{name:'경기 체크인'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'운영 알림'})).toBeVisible();
  await expect(page.getByText('참가가 확정됐습니다',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'경기 체크인'}).click();
  await expect(page.getByText(/체크인이 완료됐습니다/)).toBeVisible();
  expect(backend.isCheckedIn()).toBe(true);
  await page.getByRole('button',{name:'확인'}).click();
  expect(backend.isNotificationRead()).toBe(true);
  expect(await serious(page)).toEqual([]);
});

async function mockOperatorBackend(page){
  let checked=false;
  let completed=false;
  let row=matchRow({starts_at:'2000-09-25T20:00:00+09:00',cancel_cutoff_at:'2000-09-25T18:00:00+09:00',check_in_opens_at:'2000-09-25T19:30:00+09:00',created_by:operatorId,created_at:'2000-01-01T00:00:00Z',updated_at:'2000-01-01T00:00:00Z'});
  await page.route('**/api/beta-config',route=>fulfill(route,{connected:true,url:origin,publishableKey:'public-key'}));
  await page.route(`${origin}/**`,async route=>{
    const request=route.request();const url=new URL(request.url());const path=url.pathname+url.search;
    if(path.startsWith('/auth/v1/token?grant_type=refresh_token'))return fulfill(route,{access_token:'operator-access',refresh_token:'refresh-token-2',expires_in:3600,user:{id:operatorId,email:'operator@example.com'}});
    if(url.pathname==='/auth/v1/user')return fulfill(route,{user:{id:operatorId,email:'operator@example.com'}});
    if(url.pathname==='/rest/v1/operators')return fulfill(route,[{user_id:operatorId,created_at:'2000-01-01T00:00:00Z'}]);
    if(url.pathname==='/rest/v1/matches')return fulfill(route,[row]);
    if(url.pathname==='/rest/v1/participations')return fulfill(route,[{id:'p-2',match_id:matchId,user_id:participantId,position:'MF',status:'confirmed',joined_at:'2000-01-01T00:00:00Z',canceled_at:null,checked_in_at:checked?'2000-09-25T19:31:00+09:00':null}]);
    if(url.pathname==='/rest/v1/profiles')return fulfill(route,[{id:participantId,display_name:'참가자',region:'수원 · 영통',position:'MF',level:'초중급'}]);
    if(url.pathname==='/rest/v1/rpc/operator_check_in_participant'){checked=true;return fulfill(route,[{participation_id:'p-2',match_id:matchId,user_id:participantId,checked_in_at:'2000-09-25T19:31:00+09:00'}])}
    if(url.pathname==='/rest/v1/rpc/operator_complete_match'){completed=true;row={...row,status:'completed'};return fulfill(route,[{match_id:matchId,match_status:'completed',checked_in_participants:1}])}
    return fulfill(route,{message:`Unhandled ${request.method()} ${path}`},500);
  });
  return {isChecked:()=>checked,isCompleted:()=>completed};
}

test('operator records participant check-in and completes started match',async({page})=>{
  await installSession(page,{user:operatorId});
  const backend=await mockOperatorBackend(page);
  await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/실제 Beta 경기/}).click();
  await expect(page.getByLabel('사용자 취소 마감')).toBeVisible();
  await expect(page.getByLabel('체크인 오픈')).toBeVisible();
  await expect(page.getByRole('button',{name:'현장 체크인'})).toBeVisible();
  await page.getByRole('button',{name:'현장 체크인'}).click();
  await expect(page.getByText('체크인 완료',{exact:true})).toBeVisible();
  expect(backend.isChecked()).toBe(true);
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'경기 종료 처리'}).click();
  await page.waitForLoadState('domcontentloaded');
  expect(backend.isCompleted()).toBe(true);
  expect(await serious(page,'.fm-operator')).toEqual([]);
});
