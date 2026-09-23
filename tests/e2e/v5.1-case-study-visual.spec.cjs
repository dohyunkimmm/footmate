const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
  });
  return items;
}

async function positionMobileSlide(page,index){
  const target=page.locator('.slide:not([hidden])').nth(index);
  for(let attempt=0;attempt<8;attempt+=1){
    const targetY=await target.evaluate(slide=>window.scrollY+slide.getBoundingClientRect().top-44);
    await page.evaluate(y=>window.scrollTo({top:y,behavior:'auto'}),targetY);
    await page.waitForTimeout(100);
    const settledTop=await target.evaluate(slide=>slide.getBoundingClientRect().top);
    if(settledTop>=40&&settledTop<=48)return;
  }
  const finalTop=await target.evaluate(slide=>slide.getBoundingClientRect().top);
  expect(finalTop,`mobile visible section ${index+1} top`).toBeGreaterThanOrEqual(40);
  expect(finalTop,`mobile visible section ${index+1} top`).toBeLessThanOrEqual(48);
}

async function openCaseStudy(page,viewport,index=0){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();scrollTo(0,0)});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.documentElement.dataset.footmateCaseStudySections==='13'&&document.querySelectorAll('.slide:not([hidden])').length===13);
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}html{scroll-behavior:auto!important}'});
  if(index>0){
    await page.evaluate(i=>window.goTo(i),index);
    await expect(page.locator('.slide.on')).toHaveCount(1);
    if(viewport.width<=900)await positionMobileSlide(page,index);
  }
  if(index===0||viewport.width>900)await page.evaluate(()=>scrollTo(0,0));
  await page.mouse.move(1,1);
  return errs;
}

async function expectDesktopGeometry(page,viewportWidth){
  const geometry=await page.evaluate(()=>{
    const shell=document.querySelector('.fm-cs-shell');
    const sidebar=document.querySelector('.sidebar');
    const viewer=document.querySelector('.viewer');
    if(!shell||!sidebar||!viewer)return null;
    const shellRect=shell.getBoundingClientRect();
    const sidebarRect=sidebar.getBoundingClientRect();
    const viewerRect=viewer.getBoundingClientRect();
    return {
      shell:{left:shellRect.left,right:shellRect.right,width:shellRect.width},
      sidebarWidth:sidebarRect.width,
      viewerWidth:viewerRect.width,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
  });
  expect(geometry).not.toBeNull();
  expect(geometry.shell.width).toBeLessThanOrEqual(1400.5);
  if(viewportWidth>=1400)expect(Math.abs(geometry.shell.width-1400)).toBeLessThanOrEqual(1);
  const leftGutter=geometry.shell.left;
  const rightGutter=viewportWidth-geometry.shell.right;
  expect(Math.abs(leftGutter-rightGutter)).toBeLessThanOrEqual(1);
  const shellCenter=geometry.shell.left+geometry.shell.width/2;
  expect(Math.abs(shellCenter-viewportWidth/2)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.sidebarWidth-232)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.viewerWidth-(geometry.shell.width-geometry.sidebarWidth))).toBeLessThanOrEqual(1);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
}

async function expectStoryGeometry(page){
  const geometry=await page.locator('.slide.on .fm-next-story').evaluate(story=>{
    const rect=story.getBoundingClientRect();
    const slide=story.closest('.slide')?.getBoundingClientRect();
    const copy=story.querySelector('.fm-next-story-copy')?.getBoundingClientRect();
    const aside=story.querySelector('.fm-next-story-aside')?.getBoundingClientRect();
    return {
      top:rect.top,
      bottom:rect.bottom,
      width:rect.width,
      copyLeft:copy?.left||0,
      copyWidth:copy?.width||0,
      asideLeft:aside?.left||0,
      centerDelta:slide?Math.abs((rect.top+rect.bottom)/2-(slide.top+slide.bottom)/2):999,
      overflow:story.scrollHeight-story.clientHeight
    };
  });
  expect(geometry.top).toBeGreaterThanOrEqual(140);
  expect(geometry.bottom).toBeLessThanOrEqual(760);
  expect(geometry.centerDelta).toBeLessThanOrEqual(20);
  expect(geometry.width).toBeGreaterThan(900);
  expect(geometry.copyWidth).toBeGreaterThan(900);
  if(geometry.asideLeft)expect(Math.abs(geometry.asideLeft-geometry.copyLeft)).toBeLessThanOrEqual(1);
  expect(geometry.overflow).toBeLessThanOrEqual(2);
}

async function expectMobileGeometry(page,index=0){
  const geometry=await page.evaluate(i=>{
    const slide=document.querySelectorAll('.slide:not([hidden])')[i];
    const header=document.querySelector('.cs-mobile-head');
    const headerRect=header?.getBoundingClientRect();
    return {
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      headerHeight:headerRect?.height||0,
      headerTop:headerRect?.top??999,
      headerText:(header?.innerText||'').replace(/\s+/g,' ').trim(),
      targetTop:slide?.getBoundingClientRect().top??999
    };
  },index);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.headerHeight).toBeGreaterThanOrEqual(40);
  expect(geometry.headerHeight).toBeLessThanOrEqual(48);
  expect(Math.abs(geometry.headerTop)).toBeLessThanOrEqual(1);
  expect(geometry.headerText).toContain('FootMate');
  if(index>0){
    expect(geometry.targetTop).toBeGreaterThanOrEqual(40);
    expect(geometry.targetTop).toBeLessThanOrEqual(48);
  }
}

async function expectViewportScreenshot(page,name){
  await expect(page).toHaveScreenshot(name,{animations:'disabled',caret:'hide',fullPage:false,maxDiffPixels:0});
}

test('Case Study 1728 desktop cover matches approved 13-section baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:1728,height:900});
  await expectDesktopGeometry(page,1728);
  await expectViewportScreenshot(page,'case-study-13-cover-1728.png');
  expect(errs).toEqual([]);
});

test('Case Study 1440 desktop cover matches approved 13-section baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:1440,height:900});
  await expectDesktopGeometry(page,1440);
  await expectViewportScreenshot(page,'case-study-13-cover-1440.png');
  expect(errs).toEqual([]);
});

const desktopSections=[
  {index:1,name:'case-study-13-problem-1440.png'},
  {index:2,name:'case-study-13-persona-1440.png'},
  {index:3,name:'case-study-13-thesis-1440.png'},
  {index:4,name:'case-study-13-decision-01-1440.png'},
  {index:5,name:'case-study-13-decision-02-1440.png'},
  {index:6,name:'case-study-13-decision-03-1440.png'},
  {index:7,name:'case-study-13-signin-join-1440.png'},
  {index:8,name:'case-study-13-matchday-return-1440.png'},
  {index:9,name:'case-study-13-recovery-1440.png'},
  {index:10,name:'case-study-13-domain-ai-1440.png'},
  {index:11,name:'case-study-13-validation-1440.png'},
  {index:12,name:'case-study-13-production-1440.png'}
];

for(const section of desktopSections){
  test(`Case Study 1440 visible section ${section.index+1} matches approved baseline`,async({page})=>{
    const errs=await openCaseStudy(page,{width:1440,height:900},section.index);
    await expectDesktopGeometry(page,1440);
    await expectStoryGeometry(page);
    await expectViewportScreenshot(page,section.name);
    expect(errs).toEqual([]);
  });
}

test('Case Study 390 mobile cover matches approved 13-section baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:390,height:844});
  await expectMobileGeometry(page,0);
  await expectViewportScreenshot(page,'case-study-13-cover-390.png');
  expect(errs).toEqual([]);
});

const mobileSections=[
  {index:1,name:'case-study-13-problem-390.png'},
  {index:2,name:'case-study-13-persona-390.png'},
  {index:3,name:'case-study-13-thesis-390.png'},
  {index:4,name:'case-study-13-decision-01-390.png'},
  {index:5,name:'case-study-13-decision-02-390.png'},
  {index:6,name:'case-study-13-decision-03-390.png'},
  {index:7,name:'case-study-13-signin-join-390.png'},
  {index:8,name:'case-study-13-matchday-return-390.png'},
  {index:9,name:'case-study-13-recovery-390.png'},
  {index:10,name:'case-study-13-domain-ai-390.png'},
  {index:11,name:'case-study-13-validation-390.png'},
  {index:12,name:'case-study-13-production-390.png'}
];

for(const section of mobileSections){
  test(`Case Study 390 visible section ${section.index+1} matches approved baseline`,async({page})=>{
    const errs=await openCaseStudy(page,{width:390,height:844},section.index);
    await expectMobileGeometry(page,section.index);
    await expectViewportScreenshot(page,section.name);
    expect(errs).toEqual([]);
  });
}
