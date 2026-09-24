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
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.documentElement.dataset.footmateCaseStudySections==='13'&&document.documentElement.dataset.footmateCaseStudyReaderPolish==='2'&&document.querySelectorAll('.slide:not([hidden])').length===13);
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
  const geometry=await page.locator('.slide.on').evaluate(slide=>{
    const story=slide.querySelector('.fm-next-story');
    const rect=story.getBoundingClientRect();
    const slideRect=slide.getBoundingClientRect();
    const copy=story.querySelector('.fm-next-story-copy')?.getBoundingClientRect();
    const aside=story.querySelector('.fm-next-story-aside')?.getBoundingClientRect();
    const style=getComputedStyle(slide);
    return {
      alignItems:style.alignItems,
      paddingTop:parseFloat(style.paddingTop),
      paddingBottom:parseFloat(style.paddingBottom),
      centerDelta:Math.abs((rect.top+rect.bottom)/2-(slideRect.top+slideRect.bottom)/2),
      width:rect.width,
      copyLeft:copy?.left||0,
      copyWidth:copy?.width||0,
      asideLeft:aside?.left||0,
      overflow:story.scrollHeight-story.clientHeight,
      pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
  });
  expect(geometry.alignItems).toBe('center');
  expect(geometry.paddingTop).not.toBe(38);
  expect(geometry.paddingBottom).not.toBe(38);
  expect(geometry.centerDelta).toBeLessThanOrEqual(20);
  expect(geometry.width).toBeGreaterThan(900);
  expect(geometry.copyWidth).toBeGreaterThan(900);
  if(geometry.asideLeft)expect(Math.abs(geometry.asideLeft-geometry.copyLeft)).toBeLessThanOrEqual(1);
  expect(geometry.overflow).toBeLessThanOrEqual(2);
  expect(geometry.pageOverflow).toBeLessThanOrEqual(1);
}

async function expectMobileGeometry(page,index=0){
  const geometry=await page.evaluate(i=>{
    const slide=document.querySelectorAll('.slide:not([hidden])')[i];
    const header=document.querySelector('.cs-mobile-head');
    const headerRect=header?.getBoundingClientRect();
    return {
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      slideOverflow:slide?slide.scrollWidth-slide.clientWidth:999,
      headerHeight:headerRect?.height||0,
      headerTop:headerRect?.top??999,
      headerText:(header?.innerText||'').replace(/\s+/g,' ').trim(),
      targetTop:slide?.getBoundingClientRect().top??999
    };
  },index);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.slideOverflow).toBeLessThanOrEqual(1);
  expect(geometry.headerHeight).toBeGreaterThanOrEqual(40);
  expect(geometry.headerHeight).toBeLessThanOrEqual(48);
  expect(Math.abs(geometry.headerTop)).toBeLessThanOrEqual(1);
  expect(geometry.headerText).toContain('FootMate');
  if(index>0){
    expect(geometry.targetTop).toBeGreaterThanOrEqual(40);
    expect(geometry.targetTop).toBeLessThanOrEqual(48);
  }
}

async function expectStaticCoverPreview(page){
  await expect(page.locator('.fm-next-cover-frame iframe')).toHaveCount(0);
  await expect(page.locator('.fm-next-cover-frame')).not.toContainText('Live interaction');
  await expect(page.locator('.fm-cs-static-preview')).toBeVisible();
  const cta=page.locator('.fm-next-cover-actions a');
  await expect(cta).toHaveCount(1);
  await expect(cta).toContainText('제품 직접 체험하기');
  await expect(cta).toHaveAttribute('href','/demo');
}

async function expectViewportScreenshot(page,name){
  await expect(page).toHaveScreenshot(name,{animations:'disabled',caret:'hide',fullPage:false,maxDiffPixels:0});
}

test('Case Study 1728 desktop cover matches approved 13-section baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:1728,height:900});
  await expectDesktopGeometry(page,1728);
  await expectStaticCoverPreview(page);
  await expectViewportScreenshot(page,'case-study-13-cover-1728.png');
  expect(errs).toEqual([]);
});

test('Case Study 1440 desktop cover matches approved 13-section baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:1440,height:900});
  await expectDesktopGeometry(page,1440);
  await expectStaticCoverPreview(page);
  await expectViewportScreenshot(page,'case-study-13-cover-1440.png');
  expect(errs).toEqual([]);
});

test('Case Study 02–13 preserve centered desktop rhythm and natural structured wrapping',async({page})=>{
  const errs=await openCaseStudy(page,{width:1440,height:900});
  for(let index=1;index<13;index+=1){
    await page.evaluate(i=>window.goTo(i),index);
    await expect(page.locator('.slide.on')).toHaveCount(1);
    await expectDesktopGeometry(page,1440);
    await expectStoryGeometry(page);
    const displays=await page.locator('.slide.on .fm-cs-line').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).display));
    expect(displays.every(display=>display==='inline')).toBe(true);
  }
  expect(errs).toEqual([]);
});

test('Case Study 05 comparison keeps short flow segments on the same desktop line when space is available',async({page})=>{
  const errs=await openCaseStudy(page,{width:1440,height:900},4);
  const rows=page.locator('.slide.on .fm-next-cs-before-after>div b');
  await expect(rows).toHaveCount(2);
  for(let index=0;index<2;index+=1){
    const segments=rows.nth(index).locator('.fm-cs-line');
    await expect(segments).toHaveCount(2);
    const tops=await segments.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().top));
    expect(Math.abs(tops[0]-tops[1])).toBeLessThanOrEqual(1);
  }
  expect(errs).toEqual([]);
});

test('Case Study 390 mobile cover matches approved 13-section baseline',async({page})=>{
  const errs=await openCaseStudy(page,{width:390,height:844});
  await expectMobileGeometry(page,0);
  await expectStaticCoverPreview(page);
  await expectViewportScreenshot(page,'case-study-13-cover-390.png');
  expect(errs).toEqual([]);
});

test('Case Study 02–13 keep mobile sections readable without horizontal clipping',async({page})=>{
  for(const width of [320,390]){
    const errs=await openCaseStudy(page,{width,height:844});
    for(let index=1;index<13;index+=1){
      await page.evaluate(i=>window.goTo(i),index);
      await positionMobileSlide(page,index);
      await expectMobileGeometry(page,index);
    }
    expect(errs).toEqual([]);
  }
});

for(const width of [320,390]){
  test(`Case Study ${width} cover preview caption is clear and complete`,async({page})=>{
    await openCaseStudy(page,{width,height:844});
    const visual=page.locator('.fm-next-cover-visual');
    const gap=await visual.evaluate(node=>node.querySelector('.fm-next-cover-note').getBoundingClientRect().top-node.querySelector('.fm-next-cover-frame').getBoundingClientRect().bottom);
    expect(gap).toBeGreaterThanOrEqual(12);
    await page.addStyleTag({content:'.cs-mobile-head{display:none!important}'});
    await expect(visual).toHaveScreenshot(`case-study-cover-caption-${width}.png`,{animations:'disabled',caret:'hide',maxDiffPixels:0});
  });
}
