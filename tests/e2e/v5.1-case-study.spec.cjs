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

async function activeSlideIndex(page){
  return page.locator('.slide').evaluateAll(slides=>slides.findIndex(slide=>slide.classList.contains('on')));
}

async function focusCaseStudyShell(page){
  await page.bringToFront();
  await page.evaluate(()=>{
    window.focus();
    const shell=document.querySelector('.viewer');
    if(shell instanceof HTMLElement)shell.setAttribute('tabindex','-1');
  });
  const shell=page.locator('.viewer');
  await shell.focus();
  await expect(shell).toBeFocused();
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

test('keyboard navigation works across viewports without hijacking text input',async({page})=>{
  for(const width of [1440,900,430,320]){
    await openCaseStudy(page,width,width<=430?844:900);
    await focusCaseStudyShell(page);
    expect(await activeSlideIndex(page),`initial slide at ${width}px`).toBe(0);

    await page.keyboard.press('ArrowRight');
    expect(await activeSlideIndex(page),`ArrowRight at ${width}px`).toBe(1);

    await page.keyboard.press('PageDown');
    expect(await activeSlideIndex(page),`PageDown at ${width}px`).toBe(2);

    await page.keyboard.press('ArrowLeft');
    expect(await activeSlideIndex(page),`ArrowLeft at ${width}px`).toBe(1);

    await page.keyboard.press('PageUp');
    expect(await activeSlideIndex(page),`PageUp at ${width}px`).toBe(0);

    await page.evaluate(()=>{
      const input=document.createElement('input');
      input.setAttribute('data-keyboard-guard-probe','true');
      document.body.appendChild(input);
      input.focus();
    });
    const input=page.locator('[data-keyboard-guard-probe="true"]');
    await expect(input).toBeFocused();
    await page.keyboard.press('ArrowRight');
    expect(await activeSlideIndex(page),`focused input should keep ArrowRight at ${width}px`).toBe(0);
    await input.evaluate(element=>element.remove());
  }
});

test('structured Case Study content keeps readable type, Korean words, and no horizontal overflow',async({page})=>{
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
  const layoutSelectors=[
    '.fm-next-cs-grid',
    '.fm-next-cs-persona',
    '.fm-next-cs-journey',
    '.fm-next-cs-before-after',
    '.fm-next-cs-reco',
    '.fm-next-cs-auth-flow',
    '.fm-next-cs-state-home',
    '.fm-next-cs-modes',
    '.fm-next-cs-ia',
    '.fm-next-cs-metrics',
    '.fm-next-cs-day-states',
    '.fm-next-cs-recovery',
    '.fm-next-cs-outcomes'
  ].join(',');
  const wrapSelectors=[
    '.fm-next-cs-persona span',
    '.fm-next-cs-persona b',
    '.fm-next-cs-journey h3',
    '.fm-next-cs-journey p',
    '.fm-next-cs-stack p',
    '.fm-next-cs-detail-order span',
    '.fm-next-cs-auth-flow small',
    '.fm-next-cs-auth-flow b',
    '.fm-next-cs-state-home small',
    '.fm-next-cs-state-home b',
    '.fm-next-cs-modes small',
    '.fm-next-cs-modes h3',
    '.fm-next-cs-modes p',
    '.fm-next-cs-ia b',
    '.fm-next-cs-ia span',
    '.fm-next-cs-metric span',
    '.fm-next-cs-day-states small',
    '.fm-next-cs-day-states b',
    '.fm-next-cs-day-states p',
    '.fm-next-cs-recovery b',
    '.fm-next-cs-recovery span',
    '.fm-next-cs-outcomes b',
    '.fm-next-cs-outcomes p',
    '.fm-next-cs-quality span',
    '.fm-next-cs-final>span',
    '.fm-next-cs-final>b',
    '.fm-next-cs-loop b',
    '.fm-next-cs-loop span',
    '.fm-next-cs-agent b',
    '.fm-next-cs-state-chain span'
  ].join(',');

  for(const width of [1440,1180,900,430,390,375,320]){
    await openCaseStudy(page,width,width<=430?844:900);
    for(let index=0;index<16;index+=1){
      await goToSlide(page,index);
      const metrics=await page.locator('.slide.on').evaluate((slide,{groups,layoutSelectors,wrapSelectors})=>{
        const offenders=[];
        for(const group of groups){
          for(const el of slide.querySelectorAll(group.selector)){
            const size=parseFloat(getComputedStyle(el).fontSize);
            if(Number.isFinite(size)&&size+0.01<group.min){
              offenders.push({text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,80),size,min:group.min});
            }
          }
        }
        const layoutOverflow=[];
        for(const el of slide.querySelectorAll(layoutSelectors)){
          const overflow=el.scrollWidth-el.clientWidth;
          if(overflow>1)layoutOverflow.push({className:el.className,overflow});
        }
        const wrapOffenders=[];
        for(const el of slide.querySelectorAll(wrapSelectors)){
          const style=getComputedStyle(el);
          if(style.wordBreak!=='keep-all'){
            wrapOffenders.push({text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,80),reason:`word-break:${style.wordBreak}`});
            continue;
          }
          const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
          while(walker.nextNode()){
            const node=walker.currentNode;
            const value=node.nodeValue||'';
            for(const match of value.matchAll(/[가-힣]{2,}/g)){
              const start=match.index||0;
              const word=match[0];
              let previousTop=null;
              for(let offset=0;offset<word.length;offset+=1){
                const range=document.createRange();
                range.setStart(node,start+offset);
                range.setEnd(node,start+offset+1);
                const rect=range.getBoundingClientRect();
                if(previousTop!==null&&Math.abs(rect.top-previousTop)>2){
                  wrapOffenders.push({text:word,reason:'Hangul word split across lines'});
                  break;
                }
                previousTop=rect.top;
              }
            }
          }
        }
        return {
          documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          layoutOverflow,
          offenders,
          wrapOffenders
        };
      },{groups:floors,layoutSelectors,wrapSelectors});
      expect(metrics.documentOverflow,`document overflow at ${width}px slide ${index+1}`).toBeLessThanOrEqual(1);
      expect(metrics.layoutOverflow,`structured layout overflow at ${width}px slide ${index+1}`).toEqual([]);
      expect(metrics.offenders,`small structured text at ${width}px slide ${index+1}`).toEqual([]);
      expect(metrics.wrapOffenders,`broken Korean word at ${width}px slide ${index+1}`).toEqual([]);
    }
  }

  await openCaseStudy(page,1440,900);
  await goToSlide(page,2);
  const personaRisk=page.locator('.fm-next-cs-persona b').filter({hasText:'경기 당일 변수'});
  await expect(personaRisk).toHaveCount(1);
  await expect(personaRisk).toHaveCSS('word-break','keep-all');
});
