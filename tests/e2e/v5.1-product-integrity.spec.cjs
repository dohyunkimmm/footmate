const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
  });
  return items;
}

async function openCleanApp(page,viewport={width:390,height:844}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  return errs;
}

async function setup(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

test('legacy v4 browser state migrates to version-neutral keys and stays rollback-mirrored',async({page})=>{
  const errs=failures(page);
  await page.addInitScript(()=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({route:'home',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:false,joinedMatchId:null,selectedMatchId:'gwanggyo-2130',matchStage:'discover',userName:'게스트'}));
    localStorage.setItem('footmate:v4:discovery',JSON.stringify({date:'all',time:'20',distance:'all',price:'all',position:'MF',sort:'fit'}));
    localStorage.setItem('footmate:v4:interaction',JSON.stringify({detailReturnRoute:'discover'}));
  });
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_PLATFORM__?.storageKeys?.session==='footmate:session');
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await expect(page.locator('#footmate-next')).toHaveAttribute('data-storage-namespace','version-neutral');
  await expect(page.locator('#footmate-next')).toHaveAttribute('data-storage-compatibility','legacy-mirror');

  const migrated=await page.evaluate(()=>({
    canonicalSession:JSON.parse(localStorage.getItem('footmate:session')),
    legacySession:JSON.parse(localStorage.getItem('footmate:v4:session')),
    canonicalDiscovery:JSON.parse(localStorage.getItem('footmate:discovery')),
    legacyDiscovery:JSON.parse(localStorage.getItem('footmate:v4:discovery')),
    canonicalInteraction:JSON.parse(localStorage.getItem('footmate:interaction')),
    legacyInteraction:JSON.parse(localStorage.getItem('footmate:v4:interaction')),
    migration:window.__FOOTMATE_PLATFORM__.storageMigration
  }));
  expect(migrated.canonicalSession.schemaVersion).toBe(2);
  expect(migrated.canonicalSession).toEqual(migrated.legacySession);
  expect(migrated.canonicalSession.selectedMatchId).toBe('gwanggyo-2130');
  expect(migrated.canonicalDiscovery).toEqual(migrated.legacyDiscovery);
  expect(migrated.canonicalDiscovery.time).toBe('20');
  expect(migrated.canonicalInteraction).toEqual(migrated.legacyInteraction);
  expect(migrated.migration.session.source).toBe('legacy');
  expect(migrated.migration.discovery.source).toBe('legacy');
  expect(migrated.migration.interaction.source).toBe('legacy');

  await page.getByRole('button',{name:'전체 보기'}).click();
  const mirroredAfterLegacyWrite=await page.evaluate(()=>({
    canonical:localStorage.getItem('footmate:session'),
    legacy:localStorage.getItem('footmate:v4:session')
  }));
  expect(mirroredAfterLegacyWrite.canonical).toBe(mirroredAfterLegacyWrite.legacy);
  expect(JSON.parse(mirroredAfterLegacyWrite.canonical).route).toBe('discover');
  expect(errs).toEqual([]);
});

test('current sample schedules remain date-safe instead of aging into past dates',async({page})=>{
  const errs=await openCleanApp(page);
  await setup(page);
  const labels=await page.locator('.fm-next-match-date > span:first-child').allTextContents();
  const expected=await page.evaluate(()=>{
    const values=[];
    for(let offset=1;offset<=4;offset+=1){
      const date=new Date();
      date.setHours(12,0,0,0);
      date.setDate(date.getDate()+offset);
      values.push(new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(date));
    }
    return values;
  });
  expect(labels.length).toBeGreaterThan(0);
  for(const label of labels){
    expect(label).toContain('샘플 일정');
    expect(expected.some(day=>label.includes(day))).toBe(true);
  }
  expect(errs).toEqual([]);
});

test('current app route transitions move programmatic focus to the active screen',async({page})=>{
  const errs=await openCleanApp(page);
  await expect(page.locator('[data-screen="welcome"]')).toHaveAttribute('tabindex','-1');
  expect(await page.evaluate(()=>document.activeElement?.dataset?.screen)).toBe('welcome');
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  expect(await page.evaluate(()=>document.activeElement?.dataset?.screen)).toBe('setup');
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await page.locator('.fm-next-match-card').first().click();
  expect(await page.evaluate(()=>document.activeElement?.dataset?.screen)).toBe('detail');
  expect(errs).toEqual([]);
});

test('detail back navigation returns to the surface that opened the match',async({page})=>{
  const errs=await openCleanApp(page);
  await setup(page);
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'이전 화면'}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.getByRole('button',{name:'전체 보기'}).click();
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'이전 화면'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('Real App setup and checkout keep one clear full-width primary action on mobile',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  const setupPrimary=page.locator('[data-screen="setup"] .fm-next-setup-footer .fm-next-button');
  await expect(setupPrimary).toBeVisible();
  const setupRect=await setupPrimary.boundingBox();
  expect(setupRect.width).toBeGreaterThanOrEqual(340);
  expect(setupRect.y+setupRect.height).toBeGreaterThanOrEqual(790);

  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('textbox',{name:'아이디'}).fill('member01');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  const submit=page.locator('[data-participation-submit]');
  await expect(submit).toBeVisible();
  const submitRect=await submit.boundingBox();
  expect(submitRect.width).toBeGreaterThanOrEqual(340);

  await page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.setNextOutcome('failure'));
  await submit.click();
  await expect(page.locator('[data-participation-panel="failure"]')).toBeVisible();
  await expect(page.getByRole('button',{name:'다시 결제하기'})).toBeVisible();
  await expect(submit).toBeHidden();
  expect(errs).toEqual([]);
});

test('Real App responsive design baseline stays overflow-free across target widths',async({page})=>{
  const errorSets=[];
  const viewports=[
    {width:320,height:844},
    {width:375,height:844},
    {width:390,height:844},
    {width:430,height:900},
    {width:1440,height:900}
  ];

  for(const viewport of viewports){
    const errs=await openCleanApp(page,viewport);
    errorSets.push(errs);
    await setup(page);
    await expect(page.locator('.fm-ai-card')).toBeVisible();

    const homeMetrics=await page.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,documentHeight:document.documentElement.scrollHeight,bodyHeight:document.body.scrollHeight,viewportHeight:innerHeight,windowScroll:scrollY}));
    expect(homeMetrics.documentWidth,`${viewport.width}px home document overflow`).toBeLessThanOrEqual(homeMetrics.viewport);
    expect(homeMetrics.bodyWidth,`${viewport.width}px home body overflow`).toBeLessThanOrEqual(homeMetrics.viewport);
    expect(homeMetrics.documentHeight,`${viewport.width}px home document height`).toBeLessThanOrEqual(homeMetrics.viewportHeight);
    expect(homeMetrics.bodyHeight,`${viewport.width}px home body height`).toBeLessThanOrEqual(homeMetrics.viewportHeight);
    expect(homeMetrics.windowScroll).toBe(0);

    await page.getByRole('button',{name:'전체 보기'}).click();
    await expect(page.locator('[data-screen="discover"]')).toBeVisible();
    const discoveryMetrics=await page.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,documentHeight:document.documentElement.scrollHeight,bodyHeight:document.body.scrollHeight,viewportHeight:innerHeight,windowScroll:scrollY}));
    expect(discoveryMetrics.documentWidth,`${viewport.width}px discover document overflow`).toBeLessThanOrEqual(discoveryMetrics.viewport);
    expect(discoveryMetrics.bodyWidth,`${viewport.width}px discover body overflow`).toBeLessThanOrEqual(discoveryMetrics.viewport);
    expect(discoveryMetrics.documentHeight,`${viewport.width}px discover document height`).toBeLessThanOrEqual(discoveryMetrics.viewportHeight);
    expect(discoveryMetrics.bodyHeight,`${viewport.width}px discover body height`).toBeLessThanOrEqual(discoveryMetrics.viewportHeight);
    expect(discoveryMetrics.windowScroll).toBe(0);

    await page.locator('.fm-next-match-card').first().click();
    await expect(page.locator('[data-screen="detail"]')).toBeVisible();
    const detailMetrics=await page.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,documentHeight:document.documentElement.scrollHeight,bodyHeight:document.body.scrollHeight,viewportHeight:innerHeight,windowScroll:scrollY}));
    expect(detailMetrics.documentWidth,`${viewport.width}px detail document overflow`).toBeLessThanOrEqual(detailMetrics.viewport);
    expect(detailMetrics.bodyWidth,`${viewport.width}px detail body overflow`).toBeLessThanOrEqual(detailMetrics.viewport);
    expect(detailMetrics.documentHeight,`${viewport.width}px detail document height`).toBeLessThanOrEqual(detailMetrics.viewportHeight);
    expect(detailMetrics.bodyHeight,`${viewport.width}px detail body height`).toBeLessThanOrEqual(detailMetrics.viewportHeight);
    expect(detailMetrics.windowScroll).toBe(0);
  }

  expect(errorSets.flat()).toEqual([]);
});

test('320px context actions and AI micro UI keep readable non-cramped sizing',async({page})=>{
  const errs=await openCleanApp(page,{width:320,height:844});
  await setup(page);
  await expect(page.locator('.fm-ai-card')).toBeVisible();

  const contextActions=await page.locator('.fm-next-context-actions .fm-next-button').evaluateAll(buttons=>buttons.map(button=>{
    const rect=button.getBoundingClientRect();
    return {top:rect.top,bottom:rect.bottom,width:rect.width,left:rect.left,right:rect.right,height:rect.height,overflow:button.scrollWidth-button.clientWidth};
  }));
  expect(contextActions).toHaveLength(2);
  expect(Math.abs(contextActions[1].top-contextActions[0].top)).toBeLessThanOrEqual(1);
  expect(contextActions[1].left-contextActions[0].right).toBeGreaterThanOrEqual(8);
  for(const action of contextActions){
    expect(action.width).toBeGreaterThanOrEqual(96);
    expect(action.height).toBeGreaterThanOrEqual(44);
    expect(action.overflow).toBeLessThanOrEqual(1);
  }

  const aiMetrics=await page.locator('.fm-ai-card').evaluate(card=>{
    const fontSize=selector=>parseFloat(getComputedStyle(card.querySelector(selector)).fontSize);
    const height=selector=>card.querySelector(selector).getBoundingClientRect().height;
    return {
      mode:fontSize('.fm-ai-mode'),
      example:fontSize('.fm-ai-examples button'),
      status:fontSize('.fm-ai-status span'),
      guardrail:fontSize('.fm-ai-guardrail'),
      exampleHeight:height('.fm-ai-examples button'),
      inputHeight:height('.fm-ai-input-row input'),
      submitHeight:height('.fm-ai-input-row button')
    };
  });

  expect(aiMetrics.mode).toBeGreaterThanOrEqual(11);
  expect(aiMetrics.example).toBeGreaterThanOrEqual(11);
  expect(aiMetrics.status).toBeGreaterThanOrEqual(11);
  expect(aiMetrics.guardrail).toBeGreaterThanOrEqual(11);
  expect(aiMetrics.exampleHeight).toBeGreaterThanOrEqual(36);
  expect(aiMetrics.inputHeight).toBeGreaterThanOrEqual(44);
  expect(aiMetrics.submitHeight).toBeGreaterThanOrEqual(44);
  expect(errs).toEqual([]);
});

test('Real App interaction feedback is consistent across secondary, navigation, discovery and AI controls',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setup(page);

  async function surface(locator){
    return locator.evaluate(element=>{
      const style=getComputedStyle(element);
      return {background:style.backgroundColor,border:style.borderColor,color:style.color,transform:style.transform};
    });
  }

  async function hoverSurface(locator){
    await locator.hover();
    await page.waitForTimeout(220);
    return surface(locator);
  }

  const secondary=page.locator('.fm-next-context-actions .fm-next-button--secondary').first();
  await expect(secondary).toBeVisible();
  await page.mouse.move(1,1);
  const secondaryRest=await surface(secondary);
  const secondaryHover=await hoverSurface(secondary);
  expect(secondaryHover.background).not.toBe(secondaryRest.background);

  const navTarget=page.locator('.fm-next-nav button').filter({hasText:'경기 찾기'});
  const navRest=await surface(navTarget);
  const navHover=await hoverSurface(navTarget);
  expect(navHover.background).not.toBe(navRest.background);

  const aiExample=page.locator('.fm-ai-examples button').first();
  await expect(aiExample).toBeVisible();
  const aiRest=await surface(aiExample);
  await aiExample.focus();
  await page.waitForTimeout(80);
  const aiFocus=await surface(aiExample);
  expect(aiFocus.background!==aiRest.background||aiFocus.border!==aiRest.border).toBe(true);

  await page.getByRole('button',{name:'전체 보기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  const filter=page.locator('.fm-discovery-filter-button');
  await expect(filter).toBeVisible();
  await page.mouse.move(1,1);
  await page.waitForTimeout(220);
  const filterRest=await surface(filter);
  const filterHover=await hoverSurface(filter);
  expect(filterHover.background).not.toBe(filterRest.background);
  expect(filterHover.border).not.toBe(filterRest.border);

  await page.emulateMedia({reducedMotion:'reduce'});
  const transitionDurations=await filter.evaluate(element=>getComputedStyle(element).transitionDuration.split(',').map(value=>{
    const text=value.trim();
    return text.endsWith('ms')?parseFloat(text):parseFloat(text)*1000;
  }));
  expect(Math.max(...transitionDurations)).toBeLessThanOrEqual(.1);
  expect(errs).toEqual([]);
});

test('Case Study desktop companion panels retain reviewable width and structured-cell space',async({page})=>{
  const errs=failures(page);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.querySelectorAll('.slide').length===16);
  for(let index=1;index<16;index+=1){
    await page.evaluate(i=>window.goTo(i),index);
    await expect(page.locator('.slide.on')).toHaveCount(1);
    const panel=await page.locator('.slide.on').evaluate(slide=>{
      const story=slide.querySelector('.fm-next-story');
      const aside=slide.querySelector('.fm-next-story-aside');
      if(!story||!aside)return null;
      const storyRect=story.getBoundingClientRect();
      const asideRect=aside.getBoundingClientRect();
      const structured=[...slide.querySelectorAll('.fm-next-cs-day-states,.fm-next-cs-recovery,.fm-next-cs-outcomes')].map(grid=>({
        width:grid.getBoundingClientRect().width,
        childWidths:[...grid.children].map(child=>child.getBoundingClientRect().width)
      }));
      return {storyWidth:storyRect.width,asideWidth:asideRect.width,structured};
    });
    expect(panel,`missing story panel on section ${index+1}`).not.toBeNull();
    expect(panel.asideWidth,`aside too narrow on section ${index+1}`).toBeGreaterThanOrEqual(339);
    expect(panel.asideWidth/panel.storyWidth,`aside ratio too small on section ${index+1}`).toBeGreaterThanOrEqual(0.30);
    for(const [gridIndex,grid] of panel.structured.entries()){
      expect(grid.width,`structured grid ${gridIndex+1} too narrow on section ${index+1}`).toBeGreaterThan(500);
      for(const [childIndex,width] of grid.childWidths.entries())expect(width,`structured cell ${childIndex+1} too narrow on section ${index+1}`).toBeGreaterThan(145);
    }
  }
  expect(errs).toEqual([]);
});
