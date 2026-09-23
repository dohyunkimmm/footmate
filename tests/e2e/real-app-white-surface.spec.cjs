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
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  return errs;
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.mouse.move(1,1);
}

async function expectNoHorizontalOverflow(page){
  const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport);
}

const exact={animations:'disabled',caret:'hide',maxDiffPixels:0};

test('390px Welcome is white-first with readable ink and green accent CTA',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  const intro=page.locator('.fm-next-intro');
  const headline=page.locator('.fm-next-intro h1');
  const lead=page.locator('.fm-next-intro-lead');
  const cta=page.getByRole('button',{name:/내 경기 찾아보기/});
  await expect(intro).toBeVisible();
  await expect(headline).toHaveCSS('color','rgb(19, 32, 25)');
  const leadColor=await lead.evaluate(node=>getComputedStyle(node).color);
  expect(leadColor).not.toBe('rgb(255, 255, 255)');
  const ctaStyle=await cta.evaluate(node=>({background:getComputedStyle(node).backgroundColor,height:node.getBoundingClientRect().height}));
  expect(ctaStyle.background).not.toBe('rgb(255, 255, 255)');
  expect(ctaStyle.height).toBeGreaterThanOrEqual(44);
  await expectNoHorizontalOverflow(page);
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('real-app-white-welcome-390.png',exact);
  expect(errs).toEqual([]);
});

test('390px Home uses neutral match media while keeping green accents',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  const screen=page.locator('[data-screen="home"]');
  const card=screen.locator('.fm-next-match-card').first();
  const media=card.locator('.fm-next-match-card-media');
  const badge=card.locator('.fm-next-fit-badge').first();
  const styles=await Promise.all([
    card.evaluate(node=>({background:getComputedStyle(node).backgroundColor,border:getComputedStyle(node).borderTopColor})),
    media.evaluate(node=>({color:getComputedStyle(node).color,image:getComputedStyle(node).backgroundImage})),
    badge.evaluate(node=>getComputedStyle(node).backgroundColor),
    screen.locator('.fm-ai-card--core').evaluate(node=>({background:getComputedStyle(node).backgroundImage,border:getComputedStyle(node).borderTopColor}))
  ]);
  expect(styles[0].background).toBe('rgb(255, 255, 255)');
  expect(styles[1].color).toBe('rgb(19, 32, 25)');
  expect(styles[1].image).toContain('linear-gradient');
  expect(styles[2]).not.toBe('rgb(255, 255, 255)');
  expect(styles[3].background).toContain('linear-gradient');
  const nav=screen.locator('.fm-next-nav');
  await expect(nav).toHaveCSS('position','fixed');
  await expectNoHorizontalOverflow(page);
  const dynamicDates=screen.locator('.fm-next-match-date > span:first-child');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('real-app-white-home-390.png',{...exact,mask:[dynamicDates]});
  expect(errs).toEqual([]);
});

test('390px Discover uses the same neutral match surface system',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  await page.getByRole('button',{name:'전체 보기'}).click();
  const screen=page.locator('[data-screen="discover"]');
  await expect(screen).toBeVisible();
  const media=screen.locator('.fm-next-match-card-media').first();
  await expect(media).toHaveCSS('color','rgb(19, 32, 25)');
  await expect(screen.locator('.fm-next-nav')).toHaveCSS('position','fixed');
  await expectNoHorizontalOverflow(page);
  const dynamicDates=screen.locator('.fm-next-match-date > span:first-child');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('real-app-white-discover-390.png',{...exact,mask:[dynamicDates]});
  expect(errs).toEqual([]);
});

for(const width of [320,375,390,430]){
  test(`${width}px keeps Welcome/Home/Discover readable and clear of fixed navigation`,async({page})=>{
    const errs=await openCleanApp(page,{width,height:844});
    const welcomeMetrics=await page.locator('.fm-next-intro').evaluate(element=>{
      const headline=element.querySelector('h1').getBoundingClientRect();
      const button=element.querySelector('button').getBoundingClientRect();
      return {headlineWidth:headline.width,buttonHeight:button.height};
    });
    expect(welcomeMetrics.headlineWidth).toBeLessThanOrEqual(width-28);
    expect(welcomeMetrics.buttonHeight).toBeGreaterThanOrEqual(44);
    await expectNoHorizontalOverflow(page);
    await setupToHome(page);
    for(const route of ['home','discover']){
      if(route==='discover')await page.getByRole('button',{name:'전체 보기'}).click();
      const screen=page.locator(`[data-screen="${route}"]`);
      await expect(screen.locator('.fm-next-nav')).toHaveCSS('position','fixed');
      await page.evaluate(()=>window.scrollTo(0,Math.max(document.documentElement.scrollHeight,document.body.scrollHeight)));
      await page.waitForTimeout(50);
      const metrics=await screen.evaluate(element=>{
        const nav=element.querySelector('.fm-next-nav').getBoundingClientRect();
        const cards=[...element.querySelectorAll('.fm-next-match-card')];
        const last=cards.at(-1)?.getBoundingClientRect();
        const firstButton=[...element.querySelectorAll('button')].find(node=>node.getClientRects().length);
        const buttonBox=firstButton?.getBoundingClientRect();
        const paddingBottom=parseFloat(getComputedStyle(element).paddingBottom)||0;
        return {navTop:nav.top,navHeight:nav.height,lastBottom:last?.bottom??0,paddingBottom,buttonHeight:buttonBox?.height??44};
      });
      expect(metrics.paddingBottom).toBeGreaterThanOrEqual(metrics.navHeight);
      expect(metrics.lastBottom).toBeLessThanOrEqual(metrics.navTop);
      expect(metrics.buttonHeight).toBeGreaterThanOrEqual(44);
      await expectNoHorizontalOverflow(page);
      if(route==='discover')await page.getByRole('button',{name:'홈'}).click();
    }
    expect(errs).toEqual([]);
  });
}
