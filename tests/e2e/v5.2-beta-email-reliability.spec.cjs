const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const origin='https://beta.example.supabase.co';
const operatorId='33333333-3333-4333-8333-333333333333';
const matchId='44444444-4444-4444-8444-444444444444';
const fulfill=(route,payload,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(payload)});
const serious=async page=>(await new AxeBuilder({page}).include('.fm-operator').withTags(['wcag2a','wcag2aa']).analyze()).violations.filter(v=>['serious','critical'].includes(v.impact));

async function installSession(page){
  await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{
    key:'footmate:beta:auth:v1',value:{accessToken:'old-access',refreshToken:'refresh-token',expiresAt:4102444800,user:operatorId}
  });
}

async function mockOperator(page){
  let retried=false;
  const match={
    id:matchId,title:'Email Health QA',venue_name:'Beta 풋살장',area_label:'영통',address:'경기도 수원시 영통구',region:'수원 · 영통',level:'초중급',
    starts_at:'2099-09-25T20:00:00+09:00',cancel_cutoff_at:'2099-09-25T18:00:00+09:00',check_in_opens_at:'2099-09-25T19:30:00+09:00',price_krw:0,
    capacity_total:8,joined_count:0,remaining_spots:8,format_label:'6 vs 6',surface:'인조잔디',duration_minutes:80,status:'open',created_by:operatorId,
    match_slots:[{position:'MF',capacity_total:2,joined_count:0,remaining_spots:2},{position:'FW',capacity_total:2,joined_count:0,remaining_spots:2},{position:'DF',capacity_total:3,joined_count:0,remaining_spots:3},{position:'GK',capacity_total:1,joined_count:0,remaining_spots:1}]
  };
  await page.route('**/api/beta-config',r=>fulfill(r,{connected:true,url:origin,publishableKey:'public-key'}));
  await page.route(`${origin}/**`,async route=>{
    const request=route.request(),url=new URL(request.url()),path=url.pathname+url.search;
    if(path.startsWith('/auth/v1/token?grant_type=refresh_token'))return fulfill(route,{access_token:'operator-access',refresh_token:'refresh-token-2',expires_in:3600,user:{id:operatorId,email:'operator@example.com'}});
    if(url.pathname==='/auth/v1/user')return fulfill(route,{user:{id:operatorId,email:'operator@example.com'}});
    if(url.pathname==='/rest/v1/operators')return fulfill(route,[{user_id:operatorId,created_at:'2000-01-01T00:00:00Z'}]);
    if(url.pathname==='/rest/v1/matches')return fulfill(route,[match]);
    if(url.pathname==='/rest/v1/participations')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/profiles')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/rpc/operator_beta_email_health')return fulfill(route,[
      {notification_id:2,event_type:'participation.canceled',match_id:matchId,title:'참가를 취소했습니다',email_status:retried?'pending':'failed',email_attempts:2,email_last_attempt_at:'2099-01-01T00:02:00Z',email_next_attempt_at:null,email_sent_at:null,email_delivery_status:null,email_delivery_updated_at:null,email_last_error:retried?null:'provider unavailable',created_at:'2099-01-01T00:01:00Z'},
      {notification_id:1,event_type:'participation.joined',match_id:matchId,title:'참가가 확정됐습니다',email_status:'sent',email_attempts:1,email_last_attempt_at:'2099-01-01T00:00:10Z',email_next_attempt_at:null,email_sent_at:'2099-01-01T00:00:10Z',email_delivery_status:'delivered',email_delivery_updated_at:'2099-01-01T00:00:12Z',email_last_error:null,created_at:'2099-01-01T00:00:00Z'}
    ]);
    if(url.pathname==='/rest/v1/rpc/operator_beta_funnel_metrics')return fulfill(route,[{participation_joined:4,participation_canceled:1,participation_operator_canceled:0,participation_checked_in:3,match_completed:1,email_accepted:4,email_delivered:3,email_failed:retried?0:1,email_bounced:0}]);
    if(url.pathname==='/rest/v1/rpc/operator_retry_beta_notification_email'){
      retried=true;return fulfill(route,[{notification_id:2,email_status:'pending',email_attempts:2}]);
    }
    return fulfill(route,{message:`Unhandled ${request.method()} ${path}`},500);
  });
  return {retried:()=>retried};
}

test('operator observes transactional email health and schedules safe retry',async({page})=>{
  await installSession(page);
  const backend=await mockOperator(page);
  await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{name:'Transactional email 운영 상태'})).toBeVisible();
  await expect(page.getByText(/DB 기반 운영 알림과 transactional email은 연결/)).toBeVisible();
  await expect(page.getByText(/Payment \/ Push = not connected/)).toBeVisible();
  await expect(page.getByText('결제와 알림은 연결하지 않습니다.')).toHaveCount(0);
  await expect(page.getByText('메일 전달 완료')).toBeVisible();
  await expect(page.getByText('전달 완료',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'재시도 예약'})).toBeVisible();
  await page.getByRole('button',{name:'재시도 예약'}).click();
  await expect(page.getByText(/서버 worker가 자동으로 처리합니다/)).toBeVisible();
  expect(backend.retried()).toBe(true);
  await expect(page.getByRole('button',{name:'재시도 예약'})).toHaveCount(0);
  await expect(page.getByText('operator@example.com')).toHaveCount(1);
  await expect(page.locator('[data-email-health]')).not.toContainText('operator@example.com');
  expect(await serious(page)).toEqual([]);
});
