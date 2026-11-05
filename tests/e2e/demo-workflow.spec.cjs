const {test,expect}=require('@playwright/test');
const uid='22222222-2222-4222-8222-222222222222';
const origin='https://workflow.example.supabase.co';
const first='11111111-1111-4111-8111-111111111111';
async function setup(page,{slowAI=false}={}){
 let joined=false,attempts=0;
 await page.addInitScript(()=>{sessionStorage.setItem('footmate:beta:entered:v1','1');localStorage.setItem('footmate:beta:preferences:v1',JSON.stringify({sport:'futsal',region:'',level:'',position:'MF',afterTime:''}))});
 const rows=[0,1,2,3].map((n)=>({id:n===0?first:`11111111-1111-4111-8111-${String(n+1).padStart(12,'0')}`,title:`워크플로 경기 ${n+1}`,venue_name:`풋살장 ${n+1}`,area_label:'영통',region:'수원 · 영통',level:n%2?'입문':'중급',positions:['MF','DF'],starts_at:`2099-09-${25+n}T20:00:00+09:00`,price_krw:0,capacity_total:12,joined_count:8,remaining_spots:4,format_label:'6 vs 6',surface:'인조잔디',duration_minutes:80,status:'open',match_slots:[{position:'MF',remaining_spots:2},{position:'DF',remaining_spots:2}]}));
 await page.route('**/api/beta-config',r=>r.fulfill({json:{connected:true,url:origin,publishableKey:'public-key'}}));
 await page.route('**/api/ai-match-assistant',async r=>{if(slowAI)await new Promise(resolve=>setTimeout(resolve,1500));return r.fulfill({json:{rankedMatchIds:rows.map(m=>m.id)}})});
 await page.route(origin+'/**',async r=>{
  const url=new URL(r.request().url()),path=url.pathname;
  let payload=[];
  if(path==='/auth/v1/token')payload={access_token:'access-token',refresh_token:'refresh-token',expires_in:3600,user:{id:uid,email:'qa@example.com'}};
  if(path==='/auth/v1/user')payload={user:{id:uid,email:'qa@example.com'}};
  if(path==='/rest/v1/profiles')payload=[{id:uid,display_name:'테스터',position:'MF',region:'수원 · 영통',level:'중급'}];
  if(path==='/rest/v1/matches')payload=rows;
  if(path==='/rest/v1/participations')payload=joined?[{id:'p1',match_id:first,position:'MF',status:'confirmed',joined_at:'2099-01-01T00:00:00Z'}]:[];
  if(path==='/rest/v1/rpc/join_match_position'){attempts++;joined=true;payload=[{participation_id:'p1',joined_match_id:first,joined_position:'MF',participation_status:'confirmed'}]}
  if(path==='/rest/v1/rpc/cancel_participation'){joined=false;payload=[{participation_id:'p1',participation_status:'canceled'}]}
  await r.fulfill({json:payload});
 });
 return {attempts:()=>attempts};
}

for(const size of [{width:320,height:568},{width:390,height:844},{width:1280,height:720},{width:768,height:375},{width:640,height:720}]){
 test(`demo workflow facts remain readable at ${size.width}x${size.height}`,async({page})=>{
  await page.setViewportSize(size);await setup(page);await page.goto('/beta');
  const card=page.locator('.fm-beta-catalog .fm-beta-match');await expect(card).toBeVisible();
  const geometry=await card.locator('.fm-beta-recommendation-body').evaluate(el=>({content:el.scrollHeight,height:el.clientHeight,overflow:getComputedStyle(el).overflowY}));
  expect(geometry.overflow).toBe('visible');expect(geometry.content).toBeLessThanOrEqual(geometry.height+2);
  await card.locator('.fm-beta-meta>span').first().scrollIntoViewIfNeeded();
  await expect(card.locator('.fm-beta-meta>span').first()).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:test.info().outputPath(`facts-${size.width}x${size.height}.png`),fullPage:true});
 });
}

test('demo workflow compares two matches and preserves detail and login return',async({page})=>{
 const backend=await setup(page);await page.goto('/beta');
 await page.getByRole('button',{name:'비교에 담기'}).click();
 await page.getByRole('button',{name:'다음',exact:true}).click();
 await page.getByRole('button',{name:'비교에 담기'}).click();
 await page.getByRole('button',{name:'두 경기 비교'}).click();
 await expect(page.getByRole('table')).toContainText('워크플로 경기 1');
 await expect(page.getByRole('table')).toContainText('워크플로 경기 2');
 await page.getByRole('button',{name:'워크플로 경기 1 상세 보기'}).click();
 await expect(page.getByRole('heading',{name:'경기 상세'})).toBeFocused();
 await page.getByRole('button',{name:'참가하기',exact:true}).click();
 await expect(page.getByRole('region',{name:'참가할 경기'})).toContainText('워크플로 경기 1');
 await expect(page.getByLabel('이메일')).toBeVisible();
 await page.getByRole('button',{name:'← 뒤로',exact:true}).click();
 await expect(page.getByRole('heading',{name:'경기 상세'})).toBeVisible();
 await page.getByRole('button',{name:'참가하기',exact:true}).click();
 await page.getByLabel('이메일').fill('qa@example.com');await page.getByLabel('비밀번호',{exact:true}).fill('qa-password');
 await page.getByRole('button',{name:'로그인',exact:true}).click();
 await expect(page.getByRole('button',{name:'MF로 참가',exact:true})).toBeVisible();
 expect(backend.attempts()).toBe(0);
 await page.getByRole('button',{name:'MF로 참가',exact:true}).click();
 await expect(page.getByRole('button',{name:'참가 취소'})).toBeVisible();expect(backend.attempts()).toBe(1);
 await page.reload();await expect(page.getByRole('button',{name:'참가 취소'})).toBeVisible();
 await page.getByRole('button',{name:'참가 취소'}).click();await expect(page.getByText('아직 참가한 경기가 없습니다.')).toBeVisible();
});

test('demo workflow shows candidates while AI ranks and validates time bounds',async({page})=>{
 await setup(page,{slowAI:true});await page.goto('/beta');
 await expect(page.locator('.fm-beta-ranking-status')).toBeVisible();
 await expect(page.locator('.fm-beta-match h3')).toBeVisible();
 await page.locator('#quick-filter-afterTime').click();
 await page.getByRole('radio',{name:'저녁 8시 이후',exact:true}).check();
 await page.locator('#quick-filter-afterTime').click();
 await page.getByRole('radio',{name:'저녁 6시 전 시작',exact:true}).check();
 await expect(page.getByText('시작 시간 상한은 선호 시간보다 늦게 골라주세요.')).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')).beforeTime)).toBe('');
});

test('demo workflow empty recovery changes only the requested condition',async({page})=>{
 await setup(page);await page.goto('/beta');await expect(page.locator('.fm-beta-match')).toBeVisible();
 await page.locator('#quick-filter-region').click();await page.getByRole('radio',{name:'서울 · 강남',exact:true}).check();
 await expect(page.getByText('조건에 맞는 경기가 없어요.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'지역 조건 해제 · 4개'}).click();
 await expect(page.locator('.fm-beta-match')).toBeVisible();
 const p=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')));expect(p.region).toBe('');expect(p.position).toBe('MF');
});
