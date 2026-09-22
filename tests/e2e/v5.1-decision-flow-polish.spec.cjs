const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
  });
  return items;
}

async function openCleanApp(page,viewport){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  return errs;
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function openFirstDetail(page){
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
}

async function reachCheckout(page){
  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('textbox',{name:'아이디 또는 이메일'}).fill('member@example.com');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  await expect(page.locator('[data-participation-submit]')).toBeVisible();
}

function rect(locator){
  return locator.evaluate(element=>{
    const box=element.getBoundingClientRect();
    return {x:box.x,y:box.y,width:box.width,height:box.height,bottom:box.bottom,right:box.right};
  });
}

test('1440px Real App uses intentional desktop density through Detail, Checkout, and Success',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setupToHome(page);
  await openFirstDetail(page);

  const app=await rect(page.locator('.fm-next-app'));
  expect(app.width).toBeGreaterThanOrEqual(1038);
  expect(app.width).toBeLessThanOrEqual(1042);

  const detailSections=await page.locator('[data-screen="detail"]>.fm-next-detail-section').evaluateAll(nodes=>nodes.map(node=>{
    const box=node.getBoundingClientRect();
    return {x:box.x,y:box.y,width:box.width,height:box.height};
  }));
  expect(detailSections.length).toBeGreaterThanOrEqual(4);
  expect(detailSections.length%2).toBe(0);
  for(let index=0;index<detailSections.length;index+=2){
    const left=detailSections[index];
    const right=detailSections[index+1];
    expect(Math.abs(left.y-right.y),`detail row ${index/2+1} is not aligned`).toBeLessThanOrEqual(2);
    expect(right.x,`detail row ${index/2+1} did not form a second column`).toBeGreaterThan(left.x+left.width);
    expect(left.width).toBeGreaterThanOrEqual(430);
    expect(right.width).toBeGreaterThanOrEqual(430);
  }

  const sticky=await rect(page.locator('.fm-next-sticky-cta'));
  expect(sticky.width).toBeGreaterThanOrEqual(798);
  expect(sticky.width).toBeLessThanOrEqual(802);
  expect(Math.abs(900-sticky.bottom)).toBeLessThanOrEqual(34);

  await reachCheckout(page);
  const checkoutSections=await page.locator('[data-screen="checkout"]>.fm-next-detail-section').evaluateAll(nodes=>nodes.map(node=>{
    const box=node.getBoundingClientRect();
    return {x:box.x,y:box.y,width:box.width,height:box.height};
  }));
  expect(checkoutSections.length).toBeGreaterThanOrEqual(2);
  expect(checkoutSections.length%2).toBe(0);
  for(let index=0;index<checkoutSections.length;index+=2){
    const left=checkoutSections[index];
    const right=checkoutSections[index+1];
    expect(Math.abs(left.y-right.y),`checkout row ${index/2+1} is not aligned`).toBeLessThanOrEqual(2);
    expect(right.x,`checkout row ${index/2+1} did not form a second column`).toBeGreaterThan(left.x+left.width);
    expect(left.width).toBeGreaterThanOrEqual(430);
    expect(right.width).toBeGreaterThanOrEqual(430);
  }

  const submit=await rect(page.locator('[data-participation-submit]'));
  expect(submit.width).toBeGreaterThanOrEqual(378);
  expect(submit.width).toBeLessThanOrEqual(382);
  expect(submit.height).toBeGreaterThanOrEqual(50);

  await page.locator('[data-participation-submit]').click();
  await expect(page.locator('[data-screen="success"]')).toBeVisible({timeout:5000});
  const ticket=await rect(page.locator('.fm-next-ticket'));
  expect(ticket.width).toBeGreaterThanOrEqual(678);
  expect(ticket.width).toBeLessThanOrEqual(682);

  const successActions=await page.locator('[data-screen="success"] .fm-next-actions .fm-next-button').evaluateAll(nodes=>nodes.map(node=>{
    const box=node.getBoundingClientRect();
    return {x:box.x,y:box.y,width:box.width,height:box.height};
  }));
  expect(successActions).toHaveLength(2);
  expect(Math.abs(successActions[0].y-successActions[1].y)).toBeLessThanOrEqual(2);
  expect(successActions[0].width).toBeGreaterThanOrEqual(300);
  expect(successActions[1].width).toBeGreaterThanOrEqual(300);
  expect(errs).toEqual([]);
});

test('430px decision flow keeps mobile scanning order and recovery actions uncramped',async({page})=>{
  const errs=await openCleanApp(page,{width:430,height:900});
  await setupToHome(page);
  await openFirstDetail(page);

  const app=await rect(page.locator('.fm-next-app'));
  expect(app.width).toBeLessThanOrEqual(430);

  const detailSections=await page.locator('[data-screen="detail"]>.fm-next-detail-section').evaluateAll(nodes=>nodes.map(node=>{
    const box=node.getBoundingClientRect();
    return {x:box.x,y:box.y,width:box.width,height:box.height};
  }));
  expect(detailSections.length).toBeGreaterThanOrEqual(4);
  for(let index=1;index<detailSections.length;index+=1){
    expect(detailSections[index].y).toBeGreaterThan(detailSections[index-1].y);
    expect(Math.abs(detailSections[index].x-detailSections[0].x)).toBeLessThanOrEqual(2);
  }
  for(const section of detailSections){
    expect(section.width).toBeGreaterThanOrEqual(386);
    expect(section.width).toBeLessThanOrEqual(390);
  }

  const sticky=await rect(page.locator('.fm-next-sticky-cta'));
  expect(sticky.width).toBeGreaterThanOrEqual(404);
  expect(sticky.width).toBeLessThanOrEqual(408);

  await reachCheckout(page);
  const checkoutSections=await page.locator('[data-screen="checkout"]>.fm-next-detail-section').evaluateAll(nodes=>nodes.map(node=>{
    const box=node.getBoundingClientRect();
    return {x:box.x,y:box.y,width:box.width,height:box.height};
  }));
  expect(checkoutSections.length).toBeGreaterThanOrEqual(2);
  for(let index=1;index<checkoutSections.length;index+=1){
    expect(checkoutSections[index].y).toBeGreaterThan(checkoutSections[index-1].y);
    expect(Math.abs(checkoutSections[index].x-checkoutSections[0].x)).toBeLessThanOrEqual(2);
  }

  await page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.setNextOutcome('failure'));
  await page.locator('[data-participation-submit]').click();
  const failure=page.locator('[data-participation-panel="failure"]');
  await expect(failure).toBeVisible();
  const recoveryActions=await failure.locator('button').evaluateAll(nodes=>nodes.map(node=>{
    const box=node.getBoundingClientRect();
    return {x:box.x,y:box.y,width:box.width,height:box.height,bottom:box.bottom};
  }));
  expect(recoveryActions).toHaveLength(2);
  expect(recoveryActions[1].y).toBeGreaterThanOrEqual(recoveryActions[0].bottom);
  expect(recoveryActions[0].width).toBeGreaterThanOrEqual(340);
  expect(recoveryActions[1].width).toBeGreaterThanOrEqual(340);
  expect(recoveryActions[0].height).toBeGreaterThanOrEqual(48);
  expect(recoveryActions[1].height).toBeGreaterThanOrEqual(48);

  const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport);
  expect(errs).toEqual([]);
});
