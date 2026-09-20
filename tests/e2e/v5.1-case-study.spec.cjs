const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,width=1440,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.querySelectorAll('.slide').length===16);
}

async function goToSlide(page,index){
  await page.evaluate(i=>{
    if(typeof window.goTo==='function')window.goTo(i);
    else document.querySelectorAll('.toc-item')[i]?.click();
  },index);
  await expect(page.locator('.slide.on')).toHaveCount(1);
}

test('Case Study keeps a product-first 16-section narrative without release labels',async({page})=>{
  await openCaseStudy(page);
  await expect(page).toHaveTitle('FootMate | AI-assisted Futsal Match Discovery Case Study');
  await expect(page.locator('.slide')).toHaveCount(16);
  await expect(page.locator('meta[name="footmate-case-study-release"]')).toHaveAttribute('content','5.1.1');
  await expect(page.locator('[data-v5-domain-evidence="separated"]')).toHaveCount(1);
  await expect(page.locator('[data-v5-provider-evidence="mock-only"]')).toHaveCount(1);
  await expect(page.locator('[data-v5-ai-evidence="guardrailed"]')).toHaveCount(1);
  await expect(page.locator('[data-v5-validation-evidence="acceptance"]')).toHaveCount(1);
  await expect(page.getByText('AI Match Assistant',{exact:false}).first()).toBeVisible();
  const visible=await page.locator('body').innerText();
  expect(visible).not.toMatch(/\bv\d+\.\d+(?:\.\d+)?\b/i);
  expect(visible).not.toMatch(/\bV4\b/);
});

test('structured Case Study content keeps readable type and no horizontal overflow',async({page})=>{
  const floors=[
    {
      min:13,
      selector:[
        '.fm-next-cs-card p',
        '.fm-next-cs-journey p',
        '.fm-next-cs-stack p',
        '.fm-next-cs-modes p',
        '.fm-next-cs-metric span',
        '.fm-next-cs-day-states p',
        '.fm-next-cs-recovery span',
        '.fm-next-cs-outcomes p'
      ].join(',')
    },
    {
      min:11,
      selector:[
        '.fm-next-cs-card small',
        '.fm-next-cs-persona span',
        '.fm-next-cs-auth-flow small',
        '.fm-next-cs-state-home small',
        '.fm-next-cs-modes small',
        '.fm-next-cs-day-states small',
        '.fm-next-cs-outcomes b',
        '.fm-next-cs-quality span',
        '.fm-next-cs-final>span'
      ].join(',')
    },
    {
      min:14,
      selector:[
        '.fm-next-cs-persona b',
        '.fm-next-cs-auth-flow b',
        '.fm-next-cs-state-home b',
        '.fm-next-cs-day-states b',
        '.fm-next-cs-recovery b',
        '.fm-next-cs-detail-order span',
        '.fm-next-cs-ia b',
        '.fm-next-cs-loop b',
        '.fm-next-cs-agent b',
        '.fm-next-cs-state-chain span'
      ].join(',')
    }
  ];

  for(const width of [1440,1180,430,390,375,320]){
    await openCaseStudy(page,width,width<=430?844:900);
    for(let index=0;index<16;index+=1){
      await goToSlide(page,index);
      const metrics=await page.locator('.slide.on').evaluate((slide,groups)=>{
        const offenders=[];
        for(const group of groups){
          for(const el of slide.querySelectorAll(group.selector)){
            const size=parseFloat(getComputedStyle(el).fontSize);
            if(Number.isFinite(size)&&size+0.01<group.min){
              offenders.push({text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,80),size,min:group.min});
            }
          }
        }
        return {
          documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          slideOverflow:slide.scrollWidth-slide.clientWidth,
          offenders
        };
      },floors);
      expect(metrics.documentOverflow,`document overflow at ${width}px slide ${index+1}`).toBeLessThanOrEqual(1);
      expect(metrics.slideOverflow,`slide overflow at ${width}px slide ${index+1}`).toBeLessThanOrEqual(1);
      expect(metrics.offenders,`small structured text at ${width}px slide ${index+1}`).toEqual([]);
    }
  }
});
