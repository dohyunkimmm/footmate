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
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.documentElement.dataset.footmateCaseStudySections==='13'&&document.documentElement.dataset.footmateCaseStudyReaderPolish==='2'&&document.documentElement.dataset.footmateCaseStudyStructuredCopy==='2'&&document.querySelectorAll('.slide:not([hidden])').length===13);
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

async function expectCoverScanContract(page){
  await expect(page.locator('.fm-next-cover-lead')).toHaveText('나에게 맞는 이유를 확인하고, 안심하고 참가하는 풋살 서비스입니다.');
  await expect(page.locator('.fm-next-cover-proof>div')).toHaveCount(3);
  await expect(page.locator('.fm-next-cover-proof')).toContainText('Role · IT Service Planner');
  await expect(page.locator('.fm-next-cover-proof')).toContainText('Scope · 기획·구현·검증');
  await expect(page.locator('.fm-next-cover-proof')).toContainText('Responsibility · 의사결정');
  await expect(page.locator('.fm-next-cover-note strong')).toHaveText('정적 AI 검색 프리뷰');
  await expect(page.locator('.fm-next-cover-note span')).toHaveText('Real App의 AI 경기 검색 화면입니다.');
  const geometry=await page.locator('.slide.on').evaluate(slide=>{
    const visualNode=slide.querySelector('.fm-next-cover-visual');
    const visual=visualNode?.getBoundingClientRect();
    const note=slide.querySelector('.fm-next-cover-note')?.getBoundingClientRect();
    const frame=slide.querySelector('.fm-next-cover-frame')?.getBoundingClientRect();
    return {
      visualWidth:visual?.width||0,
      visualOverflow:visualNode?visualNode.scrollWidth-visualNode.clientWidth:999,
      noteGap:note&&frame?note.top-frame.bottom:-999,
      pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
  });
  expect(geometry.visualWidth).toBeGreaterThan(0);
  expect(geometry.visualOverflow).toBeLessThanOrEqual(1);
  expect(geometry.noteGap).toBeGreaterThanOrEqual(12);
  expect(geometry.pageOverflow).toBeLessThanOrEqual(1);
}

test('Case Study 1728 desktop cover preserves recruiter scan contract',async({page})=>{
  const errs=await openCaseStudy(page,{width:1728,height:900});
  await expectDesktopGeometry(page,1728);
  await expectStaticCoverPreview(page);
  await expectCoverScanContract(page);
  expect(errs).toEqual([]);
});

test('Case Study 1440 desktop cover preserves recruiter scan contract',async({page})=>{
  const errs=await openCaseStudy(page,{width:1440,height:900});
  await expectDesktopGeometry(page,1440);
  await expectStaticCoverPreview(page);
  await expectCoverScanContract(page);
  expect(errs).toEqual([]);
});

test('Case Study 01 and 03 keep concise leads while preserving Persona validation evidence',async({page})=>{
  const errs=await openCaseStudy(page,{width:1440,height:900});
  await expect(page.locator('.fm-next-cover-lead')).toHaveText('나에게 맞는 이유를 확인하고, 안심하고 참가하는 풋살 서비스입니다.');
  await page.evaluate(()=>window.goTo(2));
  await expect(page.locator('.slide.on .fm-next-story-lead')).toHaveText('설계용 Persona는 가정으로 두고, 행동 과업으로 핵심 동선을 점검했습니다.');
  const validation=page.locator('.slide.on .fm-next-review-summary>div').nth(2);
  await expect(validation.locator('span')).toHaveText('검증');
  await expect(validation.locator('b')).toHaveText('같은 교육과정을 수강한 교육생 6명 · iOS 4 · Android 2');
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

test('Case Study 390 mobile cover preserves recruiter scan contract',async({page})=>{
  const errs=await openCaseStudy(page,{width:390,height:844});
  await expectMobileGeometry(page,0);
  await expectStaticCoverPreview(page);
  await expectCoverScanContract(page);
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
  test(`Case Study ${width} cover preview caption stays readable and complete`,async({page})=>{
    const errs=await openCaseStudy(page,{width,height:844});
    await expectStaticCoverPreview(page);
    await expectCoverScanContract(page);
    const note=page.locator('.fm-next-cover-note');
    await expect(note).toBeVisible();
    const metrics=await note.evaluate(node=>{
      const rect=node.getBoundingClientRect();
      return {left:rect.left,right:rect.right,width:rect.width,viewport:document.documentElement.clientWidth};
    });
    expect(metrics.width).toBeGreaterThan(0);
    expect(metrics.left).toBeGreaterThanOrEqual(0);
    expect(metrics.right).toBeLessThanOrEqual(metrics.viewport+1);
    expect(errs).toEqual([]);
  });
}
