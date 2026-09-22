const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const origin='https://beta.example.supabase.co';
const userId='22222222-2222-4222-8222-222222222222';
const operatorId='33333333-3333-4333-8333-333333333333';
const matchId='44444444-4444-4444-8444-444444444444';
const fulfill=(route,payload,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(payload)});
const jwt=(sub,aal)=>`x.${Buffer.from(JSON.stringify({sub,aal})).toString('base64url')}.y`;
const serious=async(page,selector)=>(await new AxeBuilder({page}).include(selector).withTags(['wcag2a','wcag2aa']).analyze()).violations.filter(v=>['serious','critical'].includes(v.impact));

async function installUserBrowser(page){
  await page.addInitScript(({userId})=>{
    const payload=btoa(JSON.stringify({sub:userId,aal:'aal1'})).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    localStorage.setItem('footmate:beta:auth:v1',JSON.stringify({accessToken:`e30.${payload}.sig`,refreshToken:'refresh',expiresAt:4102444800}));
    class FakeSocket{constructor(){this.readyState=0;setTimeout(()=>{this.readyState=1;this.onopen?.({})},0)}send(raw){const data=JSON.parse(raw);if(data.event==='phx_join')setTimeout(()=>this.onmessage?.({data:JSON.stringify({event:'phx_reply',payload:{status:'ok'},ref:data.ref})}),0)}close(){this.readyState=3;this.onclose?.({})}addEventListener(name,fn){this[`on${name}`]=fn}}
    window.WebSocket=FakeSocket;
    let currentSubscription=null;
    const makeSubscription=()=>({
      endpoint:'https://push.example/subscription-1',
      toJSON(){return {endpoint:this.endpoint,keys:{p256dh:'p256dh-key',auth:'auth-key'}}},
      async unsubscribe(){currentSubscription=null;return true}
    });
    const pushManager={
      async getSubscription(){return currentSubscription},
      async subscribe(){currentSubscription=makeSubscription();return currentSubscription}
    };
    class FakeNotification{
      static permission='default';
      static async requestPermission(){FakeNotification.permission='granted';return 'granted'}
    }
    window.Notification=FakeNotification;
    window.PushManager=function PushManager(){};
    Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{register:async()=>({pushManager})}});
  },{userId});
}

async function baseConfig(page){await page.route('**/api/beta-config',r=>fulfill(r,{connected:true,url:origin,publishableKey:'public-key'}))}

test('authenticated beta user can enable Web Push and upload a profile image',async({page})=>{
  await installUserBrowser(page);await baseConfig(page);
  let pushStored=false,avatarUploaded=false,avatarPath='';
  await page.route(`${origin}/**`,async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.pathname==='/auth/v1/token')return fulfill(route,{access_token:jwt(userId,'aal1'),refresh_token:'refresh2',expires_in:3600,user:{id:userId,email:'beta@example.com'}});
    if(url.pathname==='/auth/v1/user')return fulfill(route,{user:{id:userId,email:'beta@example.com'}});
    if(url.pathname==='/rest/v1/rpc/get_beta_push_public_key')return fulfill(route,'AQIDBA');
    if(url.pathname==='/rest/v1/profiles'){
      if(req.method()==='PATCH'){avatarPath=String(req.postDataJSON?.()?.avatar_path||'');return fulfill(route,[])}
      return fulfill(route,[{id:userId,display_name:'Beta User',region:'수원 · 영통',position:'MF',level:'중급',avatar_path:avatarPath||null}]);
    }
    if(url.pathname==='/rest/v1/matches')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/participations')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/beta_notifications')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/beta_waitlist')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/beta_match_feedback')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/beta_push_subscriptions'&&req.method()==='POST'){pushStored=true;return fulfill(route,[])}
    if(url.pathname.startsWith(`/storage/v1/object/beta-media/profiles/${userId}/`)&&req.method()==='POST'){avatarUploaded=true;return fulfill(route,{Key:url.pathname})}
    return fulfill(route,[]);
  });

  await page.goto('/beta',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('button',{name:'브라우저 알림 켜기'})).toBeVisible();
  await page.getByRole('button',{name:'브라우저 알림 켜기'}).click();
  await expect.poll(()=>pushStored).toBe(true);
  await expect(page.getByText('브라우저 알림 켜짐')).toBeVisible();

  await page.locator('[data-beta-avatar-file]').setInputFiles({name:'avatar.png',mimeType:'image/png',buffer:Buffer.from([137,80,78,71,13,10,26,10])});
  await page.locator('[data-action="upload-beta-avatar"]').click();
  await expect.poll(()=>avatarUploaded).toBe(true);
  await expect.poll(()=>avatarPath).toContain(`/avatar.png`);
  await expect(page.locator('[data-beta-avatar-panel] img')).toBeVisible();
  expect(await serious(page,'.fm-beta')).toEqual([]);
});

test('AAL2 operator can upload a public match image through the media boundary',async({page})=>{
  await baseConfig(page);
  await page.addInitScript(({token})=>localStorage.setItem('footmate:beta:auth:v1',JSON.stringify({accessToken:token,refreshToken:'refresh',expiresAt:4102444800})),{token:jwt(operatorId,'aal2')});
  let matchUploaded=false,imagePath='';
  const match={id:matchId,title:'QA 경기',venue_name:'영통 풋살장',area_label:'영통',address:'수원시 영통구',region:'수원 · 영통',level:'중급',starts_at:'2099-10-01T20:00:00+09:00',capacity_total:8,joined_count:0,remaining_spots:8,format_label:'5 vs 5',surface:'인조잔디',duration_minutes:80,status:'open',created_at:'2099-01-01T00:00:00Z',updated_at:'2099-01-01T00:00:00Z',cancel_cutoff_at:'2099-10-01T18:00:00+09:00',check_in_opens_at:'2099-10-01T19:30:00+09:00',match_slots:[{position:'MF',capacity_total:8,joined_count:0,remaining_spots:8}],image_path:null};
  await page.route(`${origin}/**`,async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.pathname==='/auth/v1/token')return fulfill(route,{access_token:jwt(operatorId,'aal2'),refresh_token:'refresh2',expires_in:3600,user:{id:operatorId,email:'operator@example.com'}});
    if(url.pathname==='/auth/v1/user')return fulfill(route,{id:operatorId,email:'operator@example.com',factors:[{id:'factor-1',factor_type:'totp',status:'verified'}]});
    if(url.pathname==='/rest/v1/operators')return fulfill(route,[{user_id:operatorId,created_at:'2099-01-01T00:00:00Z'}]);
    if(url.pathname==='/rest/v1/matches'){
      if(req.method()==='PATCH'){imagePath=String(req.postDataJSON?.()?.image_path||'');return fulfill(route,[])}
      if(url.searchParams.get('select')==='image_path')return fulfill(route,[{image_path:imagePath||null}]);
      return fulfill(route,[{...match,image_path:imagePath||null}]);
    }
    if(url.pathname==='/rest/v1/participations')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/rpc/operator_beta_email_health')return fulfill(route,[]);
    if(url.pathname==='/rest/v1/rpc/operator_beta_funnel_metrics')return fulfill(route,[{}]);
    if(url.pathname.startsWith(`/storage/v1/object/beta-media/matches/${matchId}/`)&&req.method()==='POST'){matchUploaded=true;return fulfill(route,{Key:url.pathname})}
    return fulfill(route,[]);
  });

  await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#footmate-beta-operator')).toHaveAttribute('data-operator-state','ready');
  await page.getByRole('button',{name:/QA 경기/}).click();
  await expect(page.getByText('경기장 이미지',{exact:true})).toBeVisible();
  await page.locator('[data-beta-match-file]').setInputFiles({name:'venue.webp',mimeType:'image/webp',buffer:Buffer.from([82,73,70,70,0,0,0,0,87,69,66,80])});
  await page.locator('[data-action="upload-beta-match-image"]').click();
  await expect.poll(()=>matchUploaded).toBe(true);
  await expect.poll(()=>imagePath).toContain('/cover.webp');
  await expect(page.locator('[data-beta-match-media-panel] img')).toBeVisible();
  expect(await serious(page,'.fm-operator')).toEqual([]);
});
