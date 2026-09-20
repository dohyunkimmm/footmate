const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const origin='https://beta.example.supabase.co';
const userId='22222222-2222-4222-8222-222222222222';
const matchId='33333333-3333-4333-8333-333333333333';
const newMatchId='44444444-4444-4444-8444-444444444444';
const participantId='55555555-5555-4555-8555-555555555555';

function fulfill(route,payload,status=200){return route.fulfill({status,contentType:'application/json',body:JSON.stringify(payload)})}
function matchRow(id=matchId){return {id,title:'영통 운영 경기',venue_name:'영통 풋살장',area_label:'영통',address:'경기도 수원시 영통구',region:'수원 · 영통',level:'초중급',starts_at:'2099-09-25T20:00:00+09:00',price_krw:0,capacity_total:12,joined_count:1,remaining_spots:11,format_label:'6 vs 6',surface:'인조잔디',duration_minutes:80,status:'open',created_by:userId,created_at:'2099-01-01T00:00:00Z',updated_at:'2099-01-01T00:00:00Z',match_slots:[{position:'MF',capacity_total:4,joined_count:1,remaining_spots:3},{position:'FW',capacity_total:3,joined_count:0,remaining_spots:3},{position:'DF',capacity_total:4,joined_count:0,remaining_spots:4},{position:'GK',capacity_total:1,joined_count:0,remaining_spots:1}]}}

async function installSession(page){
  await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:'footmate:beta:auth:v1',value:{accessToken:'old-access',refreshToken:'refresh-token',expiresAt:4102444800}});
}

async function mockOperator(page,{allowed=true,empty=false}={}){
  let matches=empty?[]:[matchRow()];
  let participants=empty?[]:[{id:'p-1',match_id:matchId,user_id:participantId,position:'MF',status:'confirmed',joined_at:'2099-01-01T00:00:00Z',canceled_at:null,created_at:'2099-01-01T00:00:00Z',updated_at:'2099-01-01T00:00:00Z'}];
  await page.route('**/api/beta-config',route=>fulfill(route,{connected:true,url:origin,publishableKey:'public-key'}));
  await page.route(`${origin}/**`,async route=>{
    const request=route.request();const url=new URL(request.url());const path=url.pathname+url.search;
    if(path.startsWith('/auth/v1/token?grant_type=refresh_token'))return fulfill(route,{access_token:'access-token',refresh_token:'refresh-token-2',expires_in:3600,user:{id:userId,email:'operator@example.com'}});
    if(path==='/auth/v1/user')return fulfill(route,{user:{id:userId,email:'operator@example.com'}});
    if(url.pathname==='/rest/v1/operators')return fulfill(route,allowed?[{user_id:userId,created_at:'2099-01-01T00:00:00Z'}]:[]);
    if(url.pathname==='/rest/v1/matches')return fulfill(route,matches);
    if(url.pathname==='/rest/v1/participations')return fulfill(route,participants);
    if(url.pathname==='/rest/v1/profiles')return fulfill(route,[{id:participantId,display_name:'참가자',region:'수원 · 영통',position:'MF',level:'초중급'}]);
    if(url.pathname==='/rest/v1/rpc/operator_cancel_participant'){
      const body=JSON.parse(request.postData()||'{}');participants=participants.filter(item=>item.user_id!==body.p_user_id);matches=matches.map(item=>item.id===body.p_match_id?{...item,joined_count:0,remaining_spots:item.capacity_total,match_slots:item.match_slots.map(slot=>slot.position==='MF'?{...slot,joined_count:0,remaining_spots:slot.capacity_total}:slot)}:item);return fulfill(route,[{participation_id:'p-1',match_id:body.p_match_id,user_id:body.p_user_id,participation_status:'canceled'}]);
    }
    if(url.pathname==='/rest/v1/rpc/operator_save_match'){
      const body=JSON.parse(request.postData()||'{}');const id=body.p_match_id||newMatchId;const existing=matches.find(item=>item.id===id);const slots=(body.p_slots||[]).filter(slot=>Number(slot.capacity_total)>0).map(slot=>({position:slot.position,capacity_total:Number(slot.capacity_total),joined_count:existing?.match_slots?.find(current=>current.position===slot.position)?.joined_count||0,remaining_spots:Number(slot.capacity_total)-(existing?.match_slots?.find(current=>current.position===slot.position)?.joined_count||0)}));const joined=slots.reduce((sum,slot)=>sum+slot.joined_count,0);const row={id,title:body.p_title,venue_name:body.p_venue_name,area_label:body.p_area_label,address:body.p_address,region:body.p_region,level:body.p_level,starts_at:body.p_starts_at,price_krw:0,capacity_total:body.p_capacity_total,joined_count:joined,remaining_spots:body.p_capacity_total-joined,format_label:body.p_format_label,surface:body.p_surface,duration_minutes:body.p_duration_minutes,status:body.p_status==='open'&&joined>=body.p_capacity_total?'full':body.p_status,created_by:userId,created_at:'2099-01-01T00:00:00Z',updated_at:'2099-01-01T00:00:00Z',match_slots:slots};matches=[row,...matches.filter(item=>item.id!==id)];return fulfill(route,[{match_id:id,match_status:row.status}]);
    }
    if(url.pathname==='/rest/v1/rpc/operator_cancel_match'){
      const body=JSON.parse(request.postData()||'{}');matches=matches.map(item=>item.id===body.p_match_id?{...item,status:'canceled',joined_count:0,remaining_spots:item.capacity_total,match_slots:item.match_slots.map(slot=>({...slot,joined_count:0,remaining_spots:slot.capacity_total}))}:item);participants=participants.filter(item=>item.match_id!==body.p_match_id);return fulfill(route,[{match_id:body.p_match_id,match_status:'canceled',canceled_participants:0}]);
    }
    return fulfill(route,{message:`Unhandled ${request.method()} ${path}`},500);
  });
  return {getMatches:()=>matches,getParticipants:()=>participants};
}

async function serious(page){const result=await new AxeBuilder({page}).include('.fm-operator').withTags(['wcag2a','wcag2aa']).analyze();return result.violations.filter(v=>['serious','critical'].includes(v.impact))}

test('operator creates, edits and cancels real match operations with participant recovery',async({page})=>{
  await installSession(page);const backend=await mockOperator(page);
  await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
  await expect(page).toHaveTitle('FootMate | Closed Beta Operator');
  await expect(page.locator('#footmate-beta-operator')).toHaveAttribute('data-operator-state','ready');
  await expect(page.getByText('Operator Connected',{exact:true})).toBeVisible();
  await expect(page.getByText('영통 운영 경기',{exact:true})).toBeVisible();
  expect(await serious(page)).toEqual([]);

  await page.getByRole('button',{name:/영통 운영 경기/}).click();
  await expect(page.getByText('참가자 · MF',{exact:true})).toBeVisible();
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'참가 취소'}).click();
  await expect(page.getByText('현재 참가자가 없습니다.')).toBeVisible();
  expect(backend.getParticipants()).toHaveLength(0);

  await page.getByRole('button',{name:'새 경기'}).click();
  await page.getByLabel('경기명').fill('새 Closed Beta 경기');
  await page.getByLabel('구장명').fill('광교 풋살장');
  await page.getByLabel('주소').fill('경기도 수원시 영통구 광교');
  await page.getByLabel('MF · 현재 0명').fill('4');
  await page.getByLabel('FW · 현재 0명').fill('3');
  await page.getByLabel('DF · 현재 0명').fill('4');
  await page.getByLabel('GK · 현재 0명').fill('1');
  await page.getByLabel('공개 상태').selectOption('open');
  await page.getByRole('button',{name:'경기 저장'}).click();
  await expect(page.getByText('경기와 포지션 정원을 저장했습니다.')).toBeVisible();
  await expect(page.getByText('새 Closed Beta 경기',{exact:true})).toBeVisible();
  expect(backend.getMatches().some(item=>item.id===newMatchId&&item.status==='open')).toBe(true);

  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'경기 취소'}).click();
  await expect(page.getByText('경기와 현재 참가를 취소했습니다.')).toBeVisible();
  expect(backend.getMatches().find(item=>item.id===newMatchId)?.status).toBe('canceled');
});

test('operator route denies an authenticated non-operator',async({page})=>{
  await installSession(page);await mockOperator(page,{allowed:false,empty:true});
  await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#footmate-beta-operator')).toHaveAttribute('data-operator-state','forbidden');
  await expect(page.getByText('운영자 권한이 없는 계정입니다.')).toBeVisible();
});

test('operator route requires beta login and remains mobile-safe',async({page})=>{
  await page.route('**/api/beta-config',route=>fulfill(route,{connected:true,url:origin,publishableKey:'public-key'}));
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:780});
    await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
    await expect(page.locator('#footmate-beta-operator')).toHaveAttribute('data-operator-state','auth-required');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
