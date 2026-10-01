const {expect}=require('@playwright/test');
const fixed=Date.parse('2026-09-27T10:00:00Z');
const id='suwon-ingye-2000';
async function seed(page,{offset=10,joined=true,status='upcoming',route='profile',legacy=false}={}){
  await page.setViewportSize({width:390,height:844});
  await page.clock.setFixedTime(new Date(fixed));
  await page.goto('/demo?resume=1',{waitUntil:'domcontentloaded'});
  await page.evaluate(({offset,joined,status,route,legacy,fixed,id})=>{
    localStorage.clear();sessionStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({route,setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:joined,joinedMatchId:joined?id:null,selectedMatchId:id,matchStage:'upcoming',userName:'도현'}));
    if(joined)localStorage.setItem('footmate:v4:matchday',JSON.stringify({matchId:id,status,startsAt:new Date(fixed+offset*60000).toISOString()}));
    if(legacy)localStorage.setItem('footmate:v4:interaction',JSON.stringify({checkedInMatchId:id,checkedInAt:fixed-60000}));
  },{offset,joined,status,route,legacy,fixed,id});
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="'+route+'"]')).toBeVisible();
}
const panel=page=>page.locator('[data-product-checkin]');
const record=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:matchday')));

async function persistence(page,capture=async()=>{}){
  await seed(page);
  await expect(panel(page)).toHaveAttribute('data-checkin-state','available');
  await page.locator('[data-matchday-action="checkin"]').evaluate(button=>{button.click();button.click();});
  await expect(panel(page)).toHaveAttribute('data-checkin-state','completed');
  const saved=await record(page);
  expect(saved.checkinComplete).toBe(true);
  expect(saved.checkedInAt).toBe(new Date(fixed).toISOString());
  expect(await page.evaluate(()=>window.__FOOTMATE_PLATFORM__.readEvents().filter(event=>event.name==='checkin.completed').length)).toBe(1);
  await expect(panel(page).locator('[data-matchday-action="checkin"]')).toHaveCount(0);
  await expect(panel(page)).toContainText('완료 시간');
  await expect(page.locator('.fm-next-status-card:nth-child(2) b')).toHaveText('체크인 완료');
  await capture('checkin-my-completed',panel(page));
  await page.locator('.fm-next-nav [data-action="nav-home"]').click();
  await expect(panel(page)).toHaveAttribute('data-checkin-state','completed');
  await expect(panel(page).locator('[data-matchday-action="checkin"]')).toHaveCount(0);
  await capture('checkin-home-completed',page.locator('[data-screen="home"]'));
  // v6 keeps joined-match and Matchday ownership in MY. Return through canonical MY
  // rather than the legacy Home -> Detail secondary action.
  await page.locator('.fm-next-nav [data-action="nav-profile"]').click();
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await expect(panel(page)).toHaveAttribute('data-checkin-state','completed');
  await expect(panel(page).locator('[data-matchday-action="checkin"]')).toHaveCount(0);
  await capture('checkin-my-returned',page.locator('[data-screen="profile"]'));
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await expect(panel(page)).toHaveAttribute('data-checkin-state','completed');
  expect((await record(page)).checkedInAt).toBe(saved.checkedInAt);
  // An operations notice must not undo completion.
  await page.evaluate(()=>window.__FOOTMATE_MATCHDAY__.setStatus('updated',{noticeSeen:true}));
  await expect(panel(page)).toHaveAttribute('data-checkin-state','completed');
  expect((await record(page)).checkedInAt).toBe(saved.checkedInAt);
}

async function gates(page,capture=async()=>{}){
  await seed(page,{joined:false});
  await expect(panel(page)).toHaveCount(0);
  await seed(page,{offset:21});
  await expect(panel(page)).toHaveAttribute('data-checkin-state','waiting');
  await expect(panel(page).getByRole('button',{name:'체크인 시작 전'})).toBeDisabled();
  await capture('checkin-waiting',panel(page));
  const initial=await record(page);
  await page.clock.setFixedTime(new Date(fixed+60000));
  await expect(panel(page)).toHaveAttribute('data-checkin-state','available');
  await page.reload({waitUntil:'domcontentloaded'});
  expect((await record(page)).startsAt).toBe(initial.startsAt);
  await expect(panel(page)).toHaveAttribute('data-checkin-state','available');
  await page.clock.setFixedTime(new Date(fixed+111*60000));
  await expect(panel(page)).toHaveAttribute('data-checkin-state','ended');
  await expect(panel(page).locator('[data-matchday-action="checkin"]')).toHaveCount(0);
  expect((await record(page)).checkinComplete).toBe(false);
  await seed(page,{status:'canceled',legacy:true});
  await expect(panel(page)).toHaveAttribute('data-checkin-state','canceled');
  await expect(panel(page).locator('[data-matchday-action="checkin"]')).toHaveCount(0);
  await capture('checkin-canceled',panel(page));
  await seed(page,{legacy:true});
  await expect(panel(page)).toHaveAttribute('data-checkin-state','completed');
  await expect(panel(page).locator('[data-matchday-action="checkin"]')).toHaveCount(0);
  expect((await record(page)).checkedInAt).toBe(new Date(fixed-60000).toISOString());
}

async function recovery(page,capture=async()=>{}){
  await seed(page);
  await expect(panel(page)).toHaveAttribute('data-checkin-state','available');
  await page.evaluate(()=>{
    window.restoreCheckinStorage=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){if(/matchday/.test(key))throw new DOMException('Storage unavailable','QuotaExceededError');return window.restoreCheckinStorage.call(this,key,value);};
  });
  await panel(page).getByRole('button',{name:'체크인하기',exact:true}).click();
  await expect(panel(page)).toHaveAttribute('data-checkin-state','failed');
  expect((await record(page)).checkinComplete).toBe(false);
  expect(await page.evaluate(()=>window.__FOOTMATE_PLATFORM__.readEvents().filter(event=>event.name==='checkin.completed').length)).toBe(0);
  await capture('checkin-retry',panel(page));
  await page.evaluate(()=>{Storage.prototype.setItem=window.restoreCheckinStorage;delete window.restoreCheckinStorage;});
  await panel(page).getByRole('button',{name:'다시 시도',exact:true}).click();
  await expect(panel(page)).toHaveAttribute('data-checkin-state','completed');
  await expect(panel(page).locator('[data-matchday-action="checkin"]')).toHaveCount(0);
  expect(await page.evaluate(()=>window.__FOOTMATE_PLATFORM__.readEvents().filter(event=>event.name==='checkin.completed').length)).toBe(1);
  await page.evaluate(()=>{const session=JSON.parse(localStorage.getItem('footmate:v4:session'));localStorage.setItem('footmate:v4:session',JSON.stringify({...session,joinedMatchId:'gwanggyo-2130',selectedMatchId:'gwanggyo-2130'}));});
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(panel(page)).toHaveAttribute('data-checkin-state','waiting');
  expect((await record(page)).matchId).toBe('gwanggyo-2130');
  expect((await record(page)).checkinComplete).toBe(false);
}
module.exports={persistence,gates,recovery};
