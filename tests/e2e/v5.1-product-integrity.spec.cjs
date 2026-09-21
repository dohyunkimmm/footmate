const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`));
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
  await page.goto('/app',{waitUntil:'domcontentloaded'});
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
