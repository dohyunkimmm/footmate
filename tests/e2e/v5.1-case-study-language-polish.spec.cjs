const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,width=1440,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>
    document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&
    document.documentElement.dataset.footmateCaseStudySections==='13'&&
    document.documentElement.dataset.footmateCaseStudyLanguage==='en'&&
    document.querySelectorAll('.slide:not([hidden])').length===13
  );
}

test('Case Study reader-facing copy uses one English display language',async({page})=>{
  await openCaseStudy(page);
  const visibleText=await page.locator('.slide:not([hidden])').allInnerTexts();
  expect(visibleText.join('\n')).not.toMatch(/[가-힣]/);
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('.cs-mobile-head a')).toHaveText('View App ↗');
});

test('Case Study TOC subcopy stays single-line and sidebar keeps hidden scrolling',async({page})=>{
  await openCaseStudy(page);
  const nav=await page.locator('.toc-item:not([hidden])').evaluateAll(items=>items.map(item=>{
    const sub=item.querySelector('.toc-s');
    const range=document.createRange();
    range.selectNodeContents(sub);
    return {text:sub.textContent.trim(),lineRects:range.getClientRects().length};
  }));
  expect(nav).toHaveLength(13);
  expect(nav.every(item=>item.lineRects===1)).toBe(true);
  const sidebarStyle=await page.locator('.sidebar').evaluate(node=>({
    overflowY:getComputedStyle(node).overflowY,
    scrollbarWidth:getComputedStyle(node).scrollbarWidth
  }));
  expect(['auto','scroll']).toContain(sidebarStyle.overflowY);
  expect(sidebarStyle.scrollbarWidth).toBe('none');
});

test('P11 display labels use Title Case and preserve system evidence',async({page})=>{
  await openCaseStudy(page);
  await page.evaluate(()=>window.goTo(10));
  const slide=page.locator('.slide.on');
  await expect(slide.locator('.fm-next-story-kicker')).toHaveText('11 · Domain · AI Boundary');
  await expect(slide.locator('.fm-next-cs-agent')).toContainText('Context');
  await expect(slide.locator('.fm-next-cs-agent')).toContainText('Guardrail');
  await expect(slide.locator('.fm-next-cs-modes small').nth(0)).toHaveText('Recommendation');
  await expect(slide.locator('.fm-next-cs-modes small').nth(1)).toHaveText('Participation · Matchday · Return');
  await expect(slide.locator('.fm-next-cs-modes small').nth(2)).toHaveText('AI · Providers · HITL');
});

test('P1 Live Interaction label has readable contrast on the light theme',async({page})=>{
  await openCaseStudy(page);
  const meta=page.locator('.fm-next-cover-frame-meta');
  await expect(meta).toHaveText('Live Interaction');
  const color=await meta.evaluate(node=>getComputedStyle(node).color);
  expect(color).toBe('rgb(60, 64, 67)');
});
