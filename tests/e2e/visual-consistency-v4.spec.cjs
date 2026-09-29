const {test,expect}=require('@playwright/test');

const VISUAL_BASELINE_DATE='2026-09-28T12:00:00.000Z';

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
  });
  return items;
}

async function pinVisualDate(page){
  await page.addInitScript(({iso})=>{
    const NativeDate=Date;
    const fixed=NativeDate.parse(iso);
    class FixedDate extends NativeDate{
      constructor(...args){super(...(args.length?args:[fixed]));}
      static now(){return fixed;}
    }
    globalThis.Date=FixedDate;
  },{iso:VISUAL_BASELINE_DATE});
}

async function openCleanApp(page,viewport={width:390,height:844}){
  const errs=failures(page);
  await pinVisualDate(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.querySelector('.fm-next-page')).getPropertyValue('--fm-v4-consistency').trim())).toBe('1');
  await page.mouse.move(1,1);
  return errs;
}

async function startSetup(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await expect(page.locator('[data-screen="setup"]')).toBeVisible();
  await page.mouse.move(1,1);
}

async function setupToHome(page){
  await startSetup(page);
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function reachAuth(page){
  await setupToHome(page);
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await page.waitForFunction(()=>{
    const status=document.querySelector('[data-release-auth-status]');
    return !status||status.dataset.tone!=='loading';
  },null,{timeout:7000}).catch(()=>{});
  await page.mouse.move(1,1);
}

async function moveAuthToCheckout(page){
  await page.evaluate(()=>{
    const session=JSON.parse(localStorage.getItem('footmate:v4:session')||'{}');
    localStorage.setItem('footmate:v4:session',JSON.stringify({...session,signedIn:true,route:'checkout',userName:session.userName||'도현'}));
  });
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  await page.mouse.move(1,1);
}

async function reachCheckout(page){
  await reachAuth(page);
  await moveAuthToCheckout(page);
}

async function expectNoHorizontalOverflow(page){
  const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport);
}

const shot={animations:'disabled',caret:'hide',fullPage:false,maxDiffPixels:32};

test('390px Welcome and Setup share the final V3 visual language',async({page})=>{
  const errs=await openCleanApp(page);
  const welcome=page.locator('[data-screen="welcome"]');
  await expect(welcome).toBeVisible();
  const welcomePrimary=welcome.locator('.fm-next-actions .fm-next-button').first();
  const primaryStyle=await welcomePrimary.evaluate(node=>({background:getComputedStyle(node).backgroundColor,color:getComputedStyle(node).color}));
  expect(primaryStyle.background).not.toBe('rgba(0, 0, 0, 0)');
  await expect(page).toHaveScreenshot('visual-consistency-welcome-390.png',shot);

  await startSetup(page);
  const setup=page.locator('[data-screen="setup"]');
  const selected=setup.locator('.fm-next-choice[aria-pressed="true"]');
  await expect(selected).toHaveCount(1);
  const selectedStyle=await selected.evaluate(node=>({border:getComputedStyle(node).borderColor,background:getComputedStyle(node).backgroundImage}));
  expect(selectedStyle.border).not.toBe('rgba(0, 0, 0, 0)');
  expect(selectedStyle.background).not.toBe('none');
  await expect(page).toHaveScreenshot('visual-consistency-setup-390.png',shot);
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('390px Auth Checkout and Success read as one conversion journey',async({page})=>{
  const errs=await openCleanApp(page);
  await reachAuth(page);
  await expect(page).toHaveScreenshot('visual-consistency-auth-390.png',shot);

  await moveAuthToCheckout(page);
  await expect(page).toHaveScreenshot('visual-consistency-checkout-390.png',shot);

  await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('visual-consistency-success-390.png',shot);
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('390px Schedule empty state belongs to the same product surface',async({page})=>{
  const errs=await openCleanApp(page);
  await page.evaluate(()=>{
    localStorage.setItem('footmate:v4:session',JSON.stringify({
      route:'schedule',setupComplete:true,setupStep:0,region:'수원 · 영통',position:'MF',level:'중급',signedIn:true,joinedMatchId:null,selectedMatchId:null,matchStage:'upcoming',userName:'도현'
    }));
  });
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await expect(page.locator('[data-screen="schedule"] .fm-next-empty')).toContainText('아직 참가한 경기가 없어요.');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('visual-consistency-schedule-empty-390.png',shot);
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('390px participation failure keeps the final semantic state grammar',async({page})=>{
  const errs=await openCleanApp(page);
  await reachCheckout(page);
  await page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.setNextOutcome('failure'));
  await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  const failure=page.locator('[data-participation-panel="failure"]');
  await expect(failure).toBeVisible();
  await page.mouse.move(1,1);
  await expect(failure).toHaveScreenshot('visual-consistency-participation-failure-390.png',{animations:'disabled',caret:'hide',maxDiffPixels:24});
  const styles=await failure.evaluate(node=>({border:getComputedStyle(node).borderColor,background:getComputedStyle(node).backgroundColor}));
  expect(styles.border).not.toBe('rgba(0, 0, 0, 0)');
  expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});
