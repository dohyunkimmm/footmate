const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const uid='22222222-2222-4222-8222-222222222222';
const origin='https://workflow.example.supabase.co';
const first='11111111-1111-4111-8111-111111111111';
async function setup(page,{slowAI=false,needsPosition=false}={}){
 let joined=false,attempts=0;
 await page.addInitScript(()=>{sessionStorage.setItem('footmate:beta:entered:v1','1');localStorage.setItem('footmate:beta:preferences:v1',JSON.stringify({sport:'futsal',region:'',level:'',position:'MF',afterTime:''}))});
 if(needsPosition)await page.addInitScript(()=>{const p=JSON.parse(localStorage.getItem('footmate:beta:preferences:v1'));p.position='';localStorage.setItem('footmate:beta:preferences:v1',JSON.stringify(p))});
 let profile={id:uid,display_name:'테스터',position:needsPosition?null:'MF',region:'수원 · 영통',level:'중급'};
 const rows=[0,1,2,3].map((n)=>({id:n===0?first:`11111111-1111-4111-8111-${String(n+1).padStart(12,'0')}`,title:`워크플로 경기 ${n+1}`,venue_name:`풋살장 ${n+1}`,area_label:'영통',region:'수원 · 영통',level:n%2?'입문':'중급',positions:['MF','DF'],starts_at:`2099-09-${25+n}T20:00:00+09:00`,price_krw:0,capacity_total:12,joined_count:8,remaining_spots:4,format_label:'6 vs 6',surface:'인조잔디',duration_minutes:80,status:'open',match_slots:[{position:'MF',remaining_spots:2},{position:'DF',remaining_spots:2}]}));
 await page.route('**/api/beta-config',r=>r.fulfill({json:{connected:true,url:origin,publishableKey:'public-key'}}));
 await page.route('**/api/ai-match-assistant',async r=>{if(slowAI)await new Promise(resolve=>setTimeout(resolve,1500));return r.fulfill({json:{rankedMatchIds:rows.map(m=>m.id)}})});
 await page.route(origin+'/**',async r=>{
  const url=new URL(r.request().url()),path=url.pathname;
  let payload=[];
  if(path==='/auth/v1/token')payload={access_token:'access-token',refresh_token:'refresh-token',expires_in:3600,user:{id:uid,email:'qa@example.com'}};
  if(path==='/auth/v1/user')payload={user:{id:uid,email:'qa@example.com'}};
  if(path==='/rest/v1/profiles'){if(r.request().method()==='PATCH')profile={...profile,...r.request().postDataJSON()};payload=[profile]}
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
  await expect.poll(()=>card.locator('.fm-beta-recommendation-body').evaluate(el=>({connected:el.isConnected,readable:el.clientHeight>0&&el.scrollHeight<=el.clientHeight+2,overflow:getComputedStyle(el).overflowY}))).toEqual({connected:true,readable:true,overflow:'visible'});
  await page.screenshot({path:test.info().outputPath(`initial-${size.width}x${size.height}.png`),fullPage:true});
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
 const accessibility=await new AxeBuilder({page}).include('.fm-beta').withTags(['wcag2a','wcag2aa']).analyze();
 expect(accessibility.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:test.info().outputPath(`comparison-${width}.png`),fullPage:true})}
 await page.getByRole('button',{name:'워크플로 경기 1 상세 보기'}).click();
 await expect(page.getByRole('heading',{name:'경기 상세'})).toBeFocused();
 await page.getByRole('button',{name:'비교로 돌아가기',exact:true}).click();
 await expect(page.getByRole('heading',{name:'경기 비교'})).toBeFocused();
 await page.getByRole('button',{name:'워크플로 경기 1 상세 보기'}).click();
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
 await setup(page,{slowAI:true});await page.goto('/beta',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.fm-beta-ranking-status')).toBeVisible();
 await expect(page.locator('.fm-beta-match h3')).toBeVisible();
 await page.locator('#quick-filter-afterTime').click();
 await page.getByRole('radio',{name:'저녁 8시 이후',exact:true}).click();
 await page.locator('#quick-filter-afterTime').click();
 await page.getByRole('radio',{name:'저녁 6시 전 시작',exact:true}).click();
 await expect(page.getByText('시작 시간 상한은 선호 시간보다 늦게 골라주세요.')).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')).beforeTime)).toBe('');
});

test('demo workflow empty recovery changes only the requested condition',async({page})=>{
 await setup(page);await page.goto('/beta');await expect(page.locator('.fm-beta-match')).toBeVisible();
 await page.locator('#quick-filter-region').click();await page.getByRole('radio',{name:'서울 · 강남',exact:true}).click();
 await expect(page.getByText('조건에 맞는 경기가 없어요.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'지역 조건 해제 · 4개'}).click();
 await expect(page.locator('.fm-beta-match')).toBeVisible();
 const p=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')));expect(p.region).toBe('');expect(p.position).toBe('MF');
});

test('demo workflow returns to the selected match after setting a missing position',async({page})=>{
 const backend=await setup(page,{needsPosition:true});await page.goto('/beta');
 await page.getByRole('button',{name:'상세 보기',exact:true}).click();
 await page.getByRole('button',{name:'참가하기',exact:true}).click();
 await page.getByLabel('이메일').fill('qa@example.com');await page.getByLabel('비밀번호',{exact:true}).fill('qa-password');
 await page.getByRole('button',{name:'로그인',exact:true}).click();
 await page.getByRole('button',{name:'포지션 설정 필요',exact:true}).click();
 await page.locator('[data-form="profile"] [name="position"]').selectOption('DF');
 await page.getByRole('button',{name:'프로필 저장',exact:true}).click();
 await expect(page.getByRole('heading',{name:'경기 상세'})).toBeVisible();
 await expect(page.locator('.fm-beta-detail h3')).toHaveText('워크플로 경기 1');
 await expect(page.getByRole('button',{name:'DF로 참가',exact:true})).toBeVisible();
 expect(backend.attempts()).toBe(0);
});

test('demo workflow keeps comparison focus when a pending AI response arrives',async({page})=>{
 await setup(page);let release;
 await page.addInitScript(()=>{window.__workflowRankingDone=false;window.addEventListener('footmate:beta:recommendations',event=>{if(!event.detail.busy)window.__workflowRankingDone=true})});
 await page.route('**/api/ai-match-assistant',async route=>{await new Promise(resolve=>release=resolve);await route.fulfill({json:{rankedMatchIds:[first]}})});
 await page.goto('/beta',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'비교에 담기'}).click();
 await page.getByRole('button',{name:'다음',exact:true}).click();
 await page.getByRole('button',{name:'비교에 담기'}).click();
 await page.getByRole('button',{name:'두 경기 비교'}).click();
 await expect(page.getByRole('heading',{name:'경기 비교'})).toBeFocused();
 const response=page.waitForResponse('**/api/ai-match-assistant');release();await response;
 await expect.poll(()=>page.evaluate(()=>window.__workflowRankingDone)).toBe(true);
 await expect(page.getByRole('heading',{name:'경기 비교'})).toBeFocused();
 await expect(page.getByRole('table')).toContainText('워크플로 경기 2');
});


test('compact demo opens, saves an occurrence, and restores it the next day',async({page})=>{
 await page.setViewportSize({width:320,height:568});
 await page.clock.setFixedTime(new Date('2026-11-06T03:00:00Z'));
 await page.route('**/api/beta-config',route=>route.fulfill({json:{connected:false}}));
 await page.route('**/api/ai-match-assistant',route=>route.fulfill({json:{rankedMatchIds:[]}}));
 await page.goto('/demo?opening=control');
 const start=page.getByRole('button',{name:'내 조건으로 추천받기'});
 await expect(page.getByRole('region',{name:'추천 예시'})).toBeVisible();
 await expect(start).toBeInViewport();
 await expect(start).toHaveCSS('background-color','rgb(9, 46, 33)');
 await expect(start).toHaveCSS('color','rgb(255, 255, 255)');
 await page.screenshot({path:test.info().outputPath('compact-opening-320.png')});
 expect(await start.evaluate(el=>document.querySelector('.fm-beta-opening-preview').getBoundingClientRect().bottom<=el.getBoundingClientRect().top)).toBe(true);
 await start.click();
 await expect(page.getByRole('heading',{name:'어디서 뛸까요?'})).toBeFocused();
 await page.getByRole('radio',{name:'수원 · 영통',exact:true}).click();
 await page.getByRole('button',{name:'다음',exact:true}).click();
 await page.getByRole('group',{name:'포지션',exact:true}).getByRole('radio',{name:'MF · 미드필더',exact:true}).check();
 await page.getByRole('button',{name:'추천 경기 보기'}).click();
 const card=page.locator('.fm-beta-catalog .fm-beta-match');
 await expect(card.locator('.fm-beta-own-slot')).toContainText('MF');
 const title=await card.locator('h3').innerText();
 const save=card.getByRole('button',{name:'경기 저장'});
 await save.click();
 await expect(save).toHaveAttribute('aria-pressed','true');
 await expect(save).toBeFocused();
 await expect(save).toHaveCSS('background-color','rgb(216, 255, 115)');
 await expect(save).toHaveCSS('color','rgb(9, 46, 33)');
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:width===320?568:844});
  await expect(card).toHaveCSS('padding-left',width===320?'14px':'16px');
  expect(await save.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:test.info().outputPath(`compact-recommendation-${width}.png`)});
 }
 const saved=page.getByRole('region',{name:'저장한 경기'});
 const resume=saved.getByRole('button',{name:title+' 이어보기'});
 await expect(resume).toBeVisible();
 const savedMenu=saved.locator('#saved-match-menu');
 await expect(savedMenu).toHaveText('저장 경기 1');
 await resume.click();
 await page.getByRole('button',{name:'추천으로 돌아가기'}).click();
 await expect(resume).toBeFocused();
 await savedMenu.click();
 const originalDate=await saved.locator('small').innerText();
 await page.clock.setFixedTime(new Date('2026-11-07T03:00:00Z'));
 await page.reload();
 await expect(resume).toBeVisible();
 await savedMenu.click();
 await expect(saved.locator('small')).toHaveText(originalDate);
 await resume.click();
 await expect(page.getByRole('heading',{name:'경기 상세'})).toBeFocused();
 await expect(page.locator('.fm-beta-detail h3')).toHaveText(title);
 await page.getByRole('button',{name:'추천으로 돌아가기'}).click();
 await expect(resume).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.clock.setFixedTime(new Date('2026-11-12T03:00:00Z'));
 await page.reload();
 await savedMenu.click();
 await expect(saved.locator('small')).toContainText('종료');
 await expect(resume).toHaveCount(0);
 await saved.getByRole('button',{name:title+' 저장 해제'}).click();
 await expect(saved).toHaveCount(0);
});


test('demo level selection keeps recommendations and stored filters consistent',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-11-07T03:00:00Z'));
 await page.route('**/api/beta-config',route=>route.fulfill({json:{connected:false}}));
 await page.route('**/api/ai-match-assistant',route=>route.fulfill({json:{rankedMatchIds:[]}}));
 await page.goto('/demo');
 await page.getByRole('button',{name:'내 조건으로 추천받기'}).click();
 await page.getByRole('radio',{name:'서울 · 강남',exact:true}).click();
 await page.getByRole('button',{name:'다음',exact:true}).click();
 await page.getByRole('group',{name:'실력',exact:true}).getByRole('radio',{name:'중급',exact:true}).check();
 await page.getByRole('button',{name:'추천 경기 보기',exact:true}).click();

 await expect(page.locator('#quick-filter-level')).toContainText('중급');
 await expect(page.locator('.fm-beta-match h3')).toHaveText('강남 중급 저녁 풋살');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')).level)).toBe('중급');

 await page.locator('#quick-filter-level').click();
 await page.getByRole('group',{name:'빠른 실력',exact:true}).getByRole('radio',{name:'고급',exact:true}).click();
 await expect(page.locator('#quick-filter-level')).toContainText('고급');
 await expect(page.locator('.fm-beta-match h3')).toHaveText('강남 고급 저녁 풋살');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')).level)).toBe('중급+');
});

test('saved demo conditions show and open only new eligible matches',async({page})=>{
 await page.setViewportSize({width:320,height:568});
 await page.clock.setFixedTime(new Date('2026-11-06T03:00:00Z'));
 await page.addInitScript(()=>{
  sessionStorage.setItem('footmate:beta:entered:v1','1');
  if(!localStorage.getItem('footmate:beta:preferences:v1')){
   localStorage.setItem('footmate:beta:preferences:v1',JSON.stringify({sport:'futsal',region:'수원 · 영통',level:'중급',position:'MF',afterTime:''}));
  }
 });
 await page.route('**/api/beta-config',route=>route.fulfill({json:{connected:false}}));
 await page.route('**/api/ai-match-assistant',route=>route.fulfill({json:{rankedMatchIds:[]}}));
 await page.goto('/demo');
 const menu=page.locator('#preset-menu');
 await menu.click();
 await page.getByRole('button',{name:'현재 조건 저장'}).click();
 const preset=page.getByRole('button',{name:'수원 · 영통 · 중급 · MF',exact:true});
 await expect(preset).toBeFocused();
 await expect(menu).not.toContainText('새 경기');
 const original=await page.locator('.fm-beta-catalog .fm-beta-match').getAttribute('data-match-id');
 await page.locator('#quick-filter-position').click();
 await page.getByRole('group',{name:'빠른 포지션'}).getByRole('radio',{name:'DF · 수비수'}).click();
 await expect(page.locator('#quick-filter-position')).toContainText('DF');
 await preset.click();
 await expect(page.locator('#quick-filter-position')).toContainText('MF');
 await expect(page.locator('#recommendation-title')).toBeFocused();

 await page.clock.setFixedTime(new Date('2026-11-07T03:00:00Z'));
 await page.reload();
 await expect(menu).toContainText(/새 경기 \d+개/);
 await menu.click();
 await page.getByRole('button',{name:/수원 · 영통 · 중급 · MF 새 경기/}).click();
 await expect(page.locator('#recommendation-title')).toHaveText('새 경기');
 const card=page.locator('.fm-beta-catalog .fm-beta-match');
 await expect(card).not.toHaveAttribute('data-match-id',original);
 await expect(card.locator('.fm-beta-own-slot')).toContainText('MF');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'전체 보기',exact:true}).click();
 await expect(menu).not.toContainText('새 경기');
 await menu.click();
 await page.getByRole('button',{name:'수원 · 영통 · 중급 · MF 조건 해제'}).click();
 await expect(preset).toHaveCount(0);
});

test('checked-in history opens the earliest eligible match at the same venue',async({page})=>{
 await setup(page);
 const past='11111111-1111-4111-8111-111111111110';
 const exact='11111111-1111-4111-8111-111111111117';
 const base={venue_name:'영통 풋살장',address:'영통로 100',area_label:'영통',region:'수원 · 영통',level:'중급',positions:['MF'],price_krw:0,capacity_total:12,joined_count:8,remaining_spots:4,format_label:'6 vs 6',duration_minutes:80,status:'open',match_slots:[{position:'MF',remaining_spots:2}]};
 const rows=[
  {...base,id:past,title:'참석한 경기',starts_at:'2025-09-25T20:00:00+09:00',status:'completed'},
  {...base,id:'11111111-1111-4111-8111-111111111115',title:'포지션 마감',starts_at:'2099-09-25T20:00:00+09:00',match_slots:[{position:'MF',remaining_spots:0}]},
  {...base,id:'11111111-1111-4111-8111-111111111116',title:'다른 주소의 경기',address:'영통로 200',starts_at:'2099-09-26T20:00:00+09:00'},
  {...base,id:exact,title:'같은 구장 다음 경기',starts_at:'2099-09-27T20:00:00+09:00'},
  {...base,id:'11111111-1111-4111-8111-111111111118',title:'같은 구장 나중 경기',starts_at:'2099-09-28T20:00:00+09:00'},
 ];
 await page.route(origin+'/**',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname==='/rest/v1/matches')return route.fulfill({json:url.searchParams.has('id')?rows.filter(m=>m.id===past):url.searchParams.get('status')?.includes('completed')?rows:rows.filter(m=>m.id!==past)});
  if(url.pathname==='/rest/v1/participations')return route.fulfill({json:[{id:'history-entry',match_id:past,position:'MF',status:'confirmed',checked_in_at:'2025-09-25T11:00:00Z'}]});
  return route.fallback();
 });
 await page.goto('/beta');
 await page.locator('[data-action="open-account"]').click();
 await page.getByLabel('이메일').fill('qa@example.com');
 await page.getByLabel('비밀번호',{exact:true}).fill('qa-password');
 await page.getByRole('button',{name:'로그인',exact:true}).click();
 await page.getByRole('button',{name:'내 경기',exact:true}).click();
 await page.getByRole('button',{name:'참석 이력',exact:true}).click();
 const same=page.getByRole('button',{name:'같은 구장',exact:true});
 await same.click();
 await expect(page.locator('.fm-beta-detail .fm-beta-match')).toHaveAttribute('data-match-id',exact);
 await expect(page.getByRole('heading',{name:'경기 상세'})).toBeFocused();
 await page.getByRole('button',{name:'참석 이력으로 돌아가기'}).click();
 await expect(same).toBeFocused();
 await expect(page.getByRole('button',{name:'참석 이력',exact:true})).toHaveAttribute('aria-current','page');
});

test('compact visual keeps one connection message and readable cards with 200 percent text',async({page})=>{
 await page.setViewportSize({width:320,height:568});
 await page.addInitScript(()=>{
  sessionStorage.setItem('footmate:beta:entered:v1','1');
  localStorage.setItem('footmate:beta:preferences:v1',JSON.stringify({sport:'futsal',region:'수원 · 영통',level:'중급',position:'MF',afterTime:''}));
 });
 await page.route('**/api/beta-config',route=>route.fulfill({status:503,json:{connected:false}}));
 await page.route('**/api/ai-match-assistant',route=>route.fulfill({json:{rankedMatchIds:[]}}));
 await page.goto('/demo');
 await expect(page.locator('.fm-beta-connection')).toHaveCount(1);
 await expect(page.getByText('연결 실패',{exact:true})).toBeVisible();
 await expect(page.locator('[data-readiness-notice]')).toHaveCount(0);
 const card=page.locator('.fm-beta-catalog .fm-beta-match');
 await expect(card.locator('.fm-beta-own-slot')).toContainText('MF');
 await expect(card.locator('.fm-beta-demo-slots')).toHaveCount(0);
 await expect(card).not.toContainText('인조잔디');
 await page.locator('.fm-beta-catalog :is(button,h3,span,summary,.fm-beta-match-place)').evaluateAll(nodes=>{
  const sizes=nodes.filter(node=>node.getClientRects().length).map(node=>[node,parseFloat(getComputedStyle(node).fontSize)]);
  for(const [node,size] of sizes)node.style.fontSize=size*2+'px';
 });
 const join=card.getByRole('button',{name:'참가하기',exact:true});
 await join.scrollIntoViewIfNeeded();
 await expect(join).toBeInViewport();
 expect(await card.locator('.fm-beta-match-actions button').evaluateAll(buttons=>buttons.every(button=>{
  const range=document.createRange();
  range.selectNodeContents(button);
  return range.getClientRects().length===1;
 }))).toBe(true);
 expect(await page.evaluate(()=>{
  const main=document.querySelector('[data-beta-main]');
  return document.documentElement.scrollWidth<=innerWidth&&main.scrollWidth<=main.clientWidth+1;
 })).toBe(true);
 await page.screenshot({path:test.info().outputPath('court-card-text-200-320.png')});
 await card.getByRole('button',{name:'상세 보기',exact:true}).click();
 await expect(page.locator('.fm-beta-match-cover')).toBeVisible();
 await expect(page.locator('.fm-beta-detail-facts')).toContainText('인조잔디');
 await page.getByRole('button',{name:'모집 포지션',exact:true}).click();
 await expect(page.locator('.fm-beta-detail .fm-beta-slots')).toBeVisible();
});

for(const path of ['/demo','/beta']){
 test('current typography loads and falls back on '+path,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await setup(page);
  await page.goto(path);
  const card=page.locator('.fm-beta-catalog .fm-beta-match');
  await expect(card).toBeVisible();
  await expect(card.locator('h3')).toHaveCSS('font-family',/Pretendard Variable/);
  if(path==='/demo'){
   await card.getByRole('button',{name:'경기 저장',exact:true}).click();
   await expect(page.getByRole('region',{name:'저장한 경기'}).locator('summary')).toHaveCSS('font-family',/Pretendard Variable/);
  }
  await card.locator('h3').evaluate(node=>{node.textContent='수원 영통 풋살 전용구장 초보자 환영 친선 경기 FootMate Weekend';});
  expect(await card.locator('h3').evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
  await card.getByRole('button',{name:'상세 보기',exact:true}).click();
  await expect(page.locator('.fm-beta-detail-facts')).toHaveCSS('font-family',/Pretendard Variable/);
  await page.locator('.fm-beta-detail').getByRole('button',{name:'참가하기',exact:true}).click();
  const icon=page.locator('.fm-beta-back .fm-icon');
  await expect(icon).toHaveCSS('font-family',/Tossface/);
  await expect(page.getByLabel('이메일')).toHaveCSS('font-family',/Pretendard Variable/);
  const fonts=()=>page.evaluate(async()=>{
   await document.fonts.ready;
   return Promise.all([['Pretendard Variable','경기 참가'],['Tossface','⬅️']].map(async ([family,sample])=>{
    try{return (await document.fonts.load('400 16px "'+family+'"',sample)).some(face=>face.status==='loaded')}
    catch{return false}
   }));
  });
  expect(await fonts()).toEqual([true,true]);
  await page.route(/^https:\/\/cdn\.jsdelivr\.net\/gh\/(orioncactus\/pretendard|toss\/tossface)@/,route=>route.abort());
  await page.getByRole('button',{name:'← 뒤로',exact:true}).click();
  await page.getByRole('button',{name:'추천으로 돌아가기',exact:true}).click();
  await page.reload();
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  expect(await fonts()).toEqual([false,false]);
  await expect(card).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
