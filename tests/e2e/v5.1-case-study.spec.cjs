const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,width=1440,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.documentElement.dataset.footmateCaseStudySections==='13'&&document.querySelectorAll('.slide:not([hidden])').length===13);
}

async function goToSlide(page,index){
  await page.evaluate(i=>window.goTo?.(i),index);
  await expect(page.locator('.slide.on')).toHaveCount(1);
}

async function activeVisibleIndex(page){
  return page.locator('.slide:not([hidden])').evaluateAll(slides=>slides.findIndex(slide=>slide.classList.contains('on')));
}

test('Case Study keeps a concise 13-section narrative without release labels',async({page})=>{
  await openCaseStudy(page);
  await expect(page).toHaveTitle('FootMate | AI-assisted Futsal Match Discovery Case Study');
  await expect(page.locator('.slide:not([hidden])')).toHaveCount(13);
  await expect(page.locator('.toc-item:not([hidden])')).toHaveCount(13);
  await expect(page.locator('meta[name="footmate-case-study-release"]')).toHaveAttribute('content','5.1.1');
  await expect(page.locator('[data-v5-domain-evidence="separated"]')).toHaveCount(1);
  await expect(page.locator('[data-v5-ai-evidence="guardrailed"]')).toHaveCount(1);
  await expect(page.locator('[data-v5-validation-evidence="acceptance"]')).toHaveCount(1);
  const visible=await page.locator('body').innerText();
  expect(visible).not.toMatch(/\bv\d+\.\d+(?:\.\d+)?\b/i);
  expect(visible).not.toMatch(/\bV4\b/);
});

test('keyboard navigation works immediately across viewports without hijacking text input',async({page})=>{
  for(const width of [1440,900,430,320]){
    await openCaseStudy(page,width,width<=430?844:900);
    expect(await activeVisibleIndex(page),`initial section at ${width}px`).toBe(0);

    await page.keyboard.press('ArrowRight');
    expect(await activeVisibleIndex(page),`ArrowRight at ${width}px`).toBe(1);
    await page.keyboard.press('PageDown');
    expect(await activeVisibleIndex(page),`PageDown at ${width}px`).toBe(2);
    await page.keyboard.press('ArrowLeft');
    expect(await activeVisibleIndex(page),`ArrowLeft at ${width}px`).toBe(1);
    await page.keyboard.press('PageUp');
    expect(await activeVisibleIndex(page),`PageUp at ${width}px`).toBe(0);

    await page.evaluate(()=>{
      const input=document.createElement('input');
      input.setAttribute('data-keyboard-guard-probe','true');
      document.body.appendChild(input);
      input.focus();
    });
    const input=page.locator('[data-keyboard-guard-probe="true"]');
    await expect(input).toBeFocused();
    await page.keyboard.press('ArrowRight');
    expect(await activeVisibleIndex(page),`focused input keeps ArrowRight at ${width}px`).toBe(0);
    await input.evaluate(element=>element.remove());
  }
});

test('structured Case Study content keeps readable type, Korean words, aligned cells, and no horizontal overflow',async({page})=>{
  const structuredSelector=[
    '.fm-next-cs-grid','.fm-next-cs-persona','.fm-next-cs-before-after','.fm-next-cs-reco','.fm-next-cs-auth-flow',
    '.fm-next-cs-state-line','.fm-next-cs-modes','.fm-next-cs-metrics','.fm-next-cs-day-states','.fm-next-cs-recovery','.fm-next-cs-outcomes'
  ].join(',');
  const textSelector=[
    '.fm-next-cs-card p','.fm-next-cs-persona b','.fm-next-cs-before-after p','.fm-next-cs-stack p','.fm-next-cs-auth-flow b',
    '.fm-next-cs-modes p','.fm-next-cs-metric span','.fm-next-cs-day-states p','.fm-next-cs-recovery span','.fm-next-cs-outcomes p'
  ].join(',');

  for(const width of [1440,1180,900,430,390,375,320]){
    await openCaseStudy(page,width,width<=430?844:900);
    for(let index=0;index<13;index+=1){
      await goToSlide(page,index);
      const metrics=await page.locator('.slide.on').evaluate((slide,{structuredSelector,textSelector})=>{
        const layouts=[...slide.querySelectorAll(structuredSelector)].map(el=>({overflow:el.scrollWidth-el.clientWidth}));
        const text=[...slide.querySelectorAll(textSelector)].map(el=>({
          size:parseFloat(getComputedStyle(el).fontSize),
          wordBreak:getComputedStyle(el).wordBreak,
          text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,80)
        }));
        return {
          documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          layoutOverflow:layouts.filter(item=>item.overflow>1),
          tooSmall:text.filter(item=>Number.isFinite(item.size)&&item.size<12),
          badWordBreak:text.filter(item=>item.wordBreak!=='keep-all')
        };
      },{structuredSelector,textSelector});
      expect(metrics.documentOverflow,`document overflow at ${width}px section ${index+1}`).toBeLessThanOrEqual(1);
      expect(metrics.layoutOverflow,`structured overflow at ${width}px section ${index+1}`).toEqual([]);
      expect(metrics.tooSmall,`small structured text at ${width}px section ${index+1}`).toEqual([]);
      expect(metrics.badWordBreak,`word-break mismatch at ${width}px section ${index+1}`).toEqual([]);
    }
  }
});
