const {test,expect}=require('@playwright/test');

// Changed-surface contract: approved Case Study polish must stay pixel-exact at wide, compact desktop, and mobile review surfaces.
// The same gate also locks the post-contrast-fix sidebar and deterministic deep-scroll mobile framing.
function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
  });
  return items;
}

async function positionMobileSlide(page,index){
  const target=page.locator('.slide').nth(index);
  for(let attempt=0;attempt<8;attempt+=1){
    const targetY=await target.evaluate(slide=>window.scrollY+slide.getBoundingClientRect().top-44);
    await page.evaluate(y=>window.scrollTo({top:y,behavior:'auto'}),targetY);
    await page.waitForTimeout(100);
    const settledTop=await target.evaluate(slide=>slide.getBoundingClientRect().top);
    if(settledTop>=40&&settledTop<=48)return;
  }
  const finalTop=await target.evaluate(slide=>slide.getBoundingClientRect().top);
  expect(finalTop,`mobile slide ${index+1} top after deterministic scroll positioning`).toBeGreaterThanOrEqual(40);
  expect(finalTop,`mobile slide ${index+1} top after deterministic scroll positioning`).toBeLessThanOrEqual(48);
}

async function openCaseStudy(page,viewport,index=0){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.clear();
    sessionStorage.clear();
    scrollTo(0,0);
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.querySelectorAll('.slide').length===16);
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

async function expectStoryEditorialGeometry(page,{minWidth=900,minCopyWidth=520,minAsideWidth=329}={}){
  const geometry=await page.locator('.slide.on .fm-next-story').evaluate(story=>{
    const rect=story.getBoundingClientRect();
    const copy=story.querySelector('.fm-next-story-copy');
    const aside=story.querySelector('.fm-next-story-aside');
    return {
      top:rect.top,
      width:rect.width,
      copyWidth:copy?.getBoundingClientRect().width||0,
      asideWidth:aside?.getBoundingClientRect().width||0
    };
  });
  expect(geometry.top).toBeGreaterThanOrEqual(108);
  expect(geometry.top).toBeLessThanOrEqual(116);
  expect(geometry.width).toBeGreaterThan(minWidth);
  expect(geometry.copyWidth).toBeGreaterThan(minCopyWidth);
  expect(geometry.asideWidth).toBeGreaterThanOrEqual(minAsideWidth);
}

async function expectMobileGeometry(page,index=0){
  const geometry=await page.evaluate(i=>{
    const slide=document.querySelectorAll('.slide')[i];
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
  await expect(page).toHaveScreenshot(name,{
    animations:'disabled',
    caret:'hide',
    fullPage:false,
    maxDiffPixels:0
  });
}

test('Case Study 1728 desktop shell matches approved visual baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:1728,height:900});
  await expectDesktopGeometry(page,1728);
  await expectViewportScreenshot(page,'case-study-cover-1728.png');
  expect(errs).toEqual([]);
});

test('Case Study 1440 desktop cover matches approved visual baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:1440,height:900});
  await expectDesktopGeometry(page,1440);
  await expectViewportScreenshot(page,'case-study-cover-1440.png');
  expect(errs).toEqual([]);
});

const desktopSections=[
  {index:2,name:'case-study-section-03-1440.png',label:'Persona / JTBD'},
  {index:3,name:'case-study-section-04-1440.png',label:'Product Thesis'},
  {index:4,name:'case-study-section-05-1440.png',label:'Core Journey'},
  {index:7,name:'case-study-section-08-1440.png',label:'Decision 03'},
  {index:8,name:'case-study-section-09-1440.png',label:'Sign in'},
  {index:9,name:'case-study-section-10-1440.png',label:'Join / Payment'},
  {index:10,name:'case-study-section-11-1440.png',label:'Matchday / Return'},
  {index:11,name:'case-study-section-12-1440.png',label:'Recovery'},
  {index:12,name:'case-study-section-13-1440.png',label:'Domain Architecture'},
  {index:13,name:'case-study-section-14-1440.png',label:'Provider / AI Boundary'},
  {index:14,name:'case-study-section-15-1440.png',label:'Validation'},
  {index:15,name:'case-study-section-16-1440.png',label:'Production Boundary'}
];

for(const section of desktopSections){
  test(`Case Study 1440 ${section.label} matches approved visual baseline`,async({page})=>{
    const errs=await openCaseStudy(page,{width:1440,height:900},section.index);
    await expectDesktopGeometry(page,1440);
    await expectStoryEditorialGeometry(page);
    await expectViewportScreenshot(page,section.name);
    expect(errs).toEqual([]);
  });
}

for(const section of [
  {index:6,name:'case-study-section-07-1180.png',label:'Recommendation stack'},
  {index:8,name:'case-study-section-09-1180.png',label:'Sign in auth flow'}
]){
  test(`Case Study 1180 ${section.label} keeps compact editorial density`,async({page})=>{
    const errs=await openCaseStudy(page,{width:1180,height:900},section.index);
    await expectDesktopGeometry(page,1180);
    await expectStoryEditorialGeometry(page,{minWidth:800,minCopyWidth:520,minAsideWidth:279});
    await expectViewportScreenshot(page,section.name);
    expect(errs).toEqual([]);
  });
}

test('Case Study 390 mobile cover matches approved visual baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:390,height:844});
  await expectMobileGeometry(page,0);
  await expectViewportScreenshot(page,'case-study-cover-390.png');
  expect(errs).toEqual([]);
});

for(const section of [
  {index:7,name:'case-study-section-08-390.png',label:'Decision 03'},
  {index:8,name:'case-study-section-09-390.png',label:'Sign in'},
  {index:11,name:'case-study-section-12-390.png',label:'Recovery'},
  {index:12,name:'case-study-section-13-390.png',label:'Domain Architecture'},
  {index:14,name:'case-study-section-15-390.png',label:'Validation'},
  {index:15,name:'case-study-section-16-390.png',label:'Production Boundary'}
]){
  test(`Case Study 390 ${section.label} matches approved visual baseline`,async({page})=>{
    const errs=await openCaseStudy(page,{width:390,height:844},section.index);
    await expectMobileGeometry(page,section.index);
    await expectViewportScreenshot(page,section.name);
    expect(errs).toEqual([]);
  });
}
