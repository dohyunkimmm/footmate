const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const origin='https://beta.example.supabase.co';
const userId='22222222-2222-4222-8222-222222222222';
const fullMatch='44444444-4444-4444-8444-444444444444';
const completedMatch='66666666-6666-4666-8666-666666666666';
const fulfill=(route,payload,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(payload)});

async function install(page){
 await page.addInitScript(({userId})=>{
  const payload=btoa(JSON.stringify({sub:userId})).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  localStorage.setItem('footmate:beta:auth:v1',JSON.stringify({accessToken:`e30.${payload}.sig`,refreshToken:'refresh',expiresAt:4102444800}));
  class FakeSocket{
   constructor(){this.readyState=0;setTimeout(()=>{this.readyState=1;this.onopen?.({})},0)}
   send(raw){const data=JSON.parse(raw);if(data.event==='phx_join')setTimeout(()=>this.onmessage?.({data:JSON.stringify({event:'phx_reply',payload:{status:'ok'},ref:data.ref})}),0)}
   close(){this.readyState=3;this.onclose?.({})}
   addEventListener(name,fn){this[`on${name}`]=fn}
  }
  window.WebSocket=FakeSocket;
 },{userId});
}

function rows(){return [
 {id:fullMatch,title:'영통 마감 경기',venue_name:'영통 풋살장',area_label:'영통',address:'수원시 영통구',region:'수원 · 영통',level:'중급',positions:['MF','FW','DF','GK'],starts_at:'2099-10-01T20:00:00+09:00',price_krw:0,capacity_total:8,joined_count:8,remaining_spots:0,format_label:'5 vs 5',surface:'인조잔디',duration_minutes:80,status:'full',cancel_cutoff_at:'2099-10-01T18:00:00+09:00',check_in_opens_at:'2099-10-01T19:30:00+09:00',match_slots:[{position:'MF',capacity_total:2,joined_count:2,remaining_spots:0}]},
 {id:completedMatch,title:'완료된 실제 경기',venue_name:'인계 풋살장',area_label:'인계',address:'수원시 팔달구',region:'수원 · 인계',level:'중급',positions:['MF'],starts_at:'2000-01-01T20:00:00+09:00',price_krw:0,capacity_total:8,joined_count:1,remaining_spots:7,format_label:'5 vs 5',surface:'인조잔디',duration_minutes:80,status:'completed',cancel_cutoff_at:'2000-01-01T18:00:00+09:00',check_in_opens_at:'2000-01-01T19:30:00+09:00',match_slots:[{position:'MF',capacity_total:2,joined_count:1,remaining_spots:1}]}
]}

async function mock(page){
 let queued=false,submitted=false;
 await page.route('**/api/beta-config',r=>fulfill(r,{connected:true,url:origin,publishableKey:'public-key'}));
 await page.route('**/api/ai-match-assistant',r=>fulfill(r,{mode:'connected-ai',model:'test-model',result:{intent:'search',region:'수원 · 영통',position:'MF',level:'중급',maxPrice:null,maxDistanceMin:null,afterTime:'19:00',reply:'영통 MF 중급 저녁 조건으로 찾았어요.'}}));
 await page.route(`${origin}/**`,async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.pathname==='/auth/v1/token')return fulfill(route,{access_token:req.postDataJSON?.()?.refresh_token?'access':'access',refresh_token:'refresh2',expires_in:3600,user:{id:userId,email:'beta@example.com'}});
  if(url.pathname==='/auth/v1/user')return fulfill(route,{user:{id:userId,email:'beta@example.com'}});
  if(url.pathname==='/rest/v1/profiles')return fulfill(route,[{id:userId,display_name:'Beta User',region:'수원 · 영통',position:'MF',level:'중급'}]);
  if(url.pathname==='/rest/v1/matches')return fulfill(route,rows());
  if(url.pathname==='/rest/v1/participations')return fulfill(route,[{id:'p-complete',match_id:completedMatch,user_id:userId,position:'MF',status:'confirmed',checked_in_at:'2000-01-01T19:40:00+09:00'}]);
  if(url.pathname==='/rest/v1/beta_notifications')return fulfill(route,[]);
  if(url.pathname==='/rest/v1/beta_waitlist')return fulfill(route,queued?[{id:'w1',match_id:fullMatch,user_id:userId,position:'MF',status:'queued',created_at:'2099-01-01T00:00:00Z'}]:[]);
  if(url.pathname==='/rest/v1/beta_match_feedback')return fulfill(route,submitted?[{id:'f1',match_id:completedMatch,user_id:userId,difficulty:3,satisfaction:4,repeat_intent:true}]:[]);
  if(url.pathname==='/rest/v1/rpc/join_beta_waitlist'){queued=true;return fulfill(route,[{waitlist_id:'w1',waitlist_status:'queued'}])}
  if(url.pathname==='/rest/v1/rpc/cancel_beta_waitlist'){queued=false;return fulfill(route,[{waitlist_id:'w1',waitlist_status:'canceled'}])}
  if(url.pathname==='/rest/v1/rpc/submit_beta_match_feedback'){submitted=true;return fulfill(route,{id:'f1',match_id:completedMatch,difficulty:3,satisfaction:4,repeat_intent:true})}
  if(url.pathname==='/rest/v1/rpc/check_in_participation')return fulfill(route,[]);
  return fulfill(route,[]);
 });
 return {queued:()=>queued,submitted:()=>submitted};
}

test('live beta growth surfaces rank real matches, waitlist and collect feedback',async({page})=>{
 await install(page);const backend=await mock(page);await page.goto('/beta',{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'실제 경기 AI 탐색'})).toBeVisible();
 await expect(page.getByText('Realtime 연결됨')).toBeVisible();
 await page.getByLabel('실제 경기 AI 검색').fill('영통 MF 중급 저녁 경기');
 await page.getByRole('button',{name:'찾기'}).click();
 await expect(page.getByText('1. 영통 마감 경기')).toBeVisible();
 await page.getByRole('button',{name:'대기 신청'}).click();
 await expect.poll(()=>backend.queued()).toBe(true);
 await expect(page.getByRole('button',{name:'대기 취소'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'참석 이력 · 경기 후 피드백'})).toBeVisible();
 await page.locator('[data-growth-form="feedback"] button').click();
 await expect.poll(()=>backend.submitted()).toBe(true);
 await expect(page.getByText(/난이도 3\/5 · 만족도 4\/5/)).toBeVisible();
 const result=await new AxeBuilder({page}).include('.fm-beta').withTags(['wcag2a','wcag2aa']).analyze();
 expect(result.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
});
