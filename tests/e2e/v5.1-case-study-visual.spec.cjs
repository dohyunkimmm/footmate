const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
  });
  return items;
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
  }
  await page.evaluate(()=>scrollTo(0,0));
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

test('Case Study 1440 representative section matches approved visual baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:1440,height:900},7);
  await expectDesktopGeometry(page,1440);
  await expectViewportScreenshot(page,'case-study-section-08-1440.png');
  expect(errs).toEqual([]);
});

test('Case Study 390 mobile cover matches approved visual baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:390,height:844});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expectViewportScreenshot(page,'case-study-cover-390.png');
  expect(errs).toEqual([]);
});
