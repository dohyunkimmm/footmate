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
