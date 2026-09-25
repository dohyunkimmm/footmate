const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,width=1440,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>
    document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&
    document.documentElement.dataset.footmateCaseStudySections==='13'&&
    document.documentElement.dataset.footmateCaseStudyReviewerPolish==='1'&&
    document.querySelectorAll('.slide:not([hidden])').length===13
  );
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
  await expect(page).toHaveTitle('FootMate · Case Study');
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
    '.fm-next-cs-state-line','.fm-next-cs-modes','.fm-next-cs-metrics','.fm-next-cs-day-states','.fm-next-cs-recovery','.fm-next-cs-outcomes',
    '.fm-next-review-summary'
  ].join(',');
  const textSelector=[
    '.fm-next-cs-card p','.fm-next-cs-persona b','.fm-next-cs-before-after p','.fm-next-cs-stack p','.fm-next-cs-auth-flow b',
    '.fm-next-cs-modes p','.fm-next-cs-metric span','.fm-next-cs-day-states p','.fm-next-cs-recovery span','.fm-next-cs-outcomes p',
    '.fm-next-review-summary b'
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

test('reviewer scan surfaces service-planning evidence before implementation detail',async({page})=>{
  await openCaseStudy(page);
  const cover=page.locator('.slide:not([hidden])').nth(0);
  await expect(cover).toContainText('Role · IT Service Planner');
  await expect(cover).toContainText('문제 정의 · Persona/JTBD');
  await expect(cover).toContainText('Scope · 기획·구현·검증');
  await expect(cover).toContainText('QA · 배포 검증');
  await expect(cover).toContainText('Responsibility · 의사결정');
  await expect(cover).toContainText('요구사항 우선순위 · 예외 처리');

  const body=page.locator('.slide:not([hidden])').filter({has:page.locator('.fm-next-story')});
  await expect(body).toHaveCount(12);
  const summaries=body.locator('.fm-next-review-summary');
  await expect(summaries).toHaveCount(12);
  for(let index=0;index<12;index+=1){
    await expect(summaries.nth(index).locator(':scope > div')).toHaveCount(3);
  }

  const leadPunctuation=await body.locator('.fm-next-story-lead').evaluateAll(nodes=>nodes.map(node=>((node.textContent||'').match(/[.!?。]/g)||[]).length));
  expect(leadPunctuation.every(count=>count===1)).toBe(true);
  const forcedTitleLines=await body.locator('.fm-next-story h2 .fm-cs-line').count();
  expect(forcedTitleLines).toBe(0);
});

test('short states and steps stay phrase-like while explanatory copy remains sentence copy',async({page})=>{
  await openCaseStudy(page);
  const slides=page.locator('.slide:not([hidden])');
  const prioritySteps=await slides.nth(3).locator('.fm-next-cs-loop b').allTextContents();
  expect(prioritySteps).toEqual(['1 탐색','2 결정','3 참가','4 경기','5 재탐색']);
  const recommendationNumbers=await slides.nth(5).locator('.fm-next-cs-stack p b').allTextContents();
  expect(recommendationNumbers).toEqual(['1','2','3','4']);
  const shortValues=await page.locator('.fm-next-review-summary b,.fm-next-cs-loop b,.fm-next-cs-auth-flow small,.fm-next-cs-auth-flow b,.fm-next-cs-detail-order span').allTextContents();
  expect(shortValues.every(value=>!/[.!?。]$/.test(value.trim()))).toBe(true);
  await expect(slides.nth(4).locator('.fm-next-cs-before-after p').first()).toContainText('필요합니다.');
});

test('KPI calculation and observation evidence stays inside the Case Study',async({page})=>{
  await openCaseStudy(page);
  await goToSlide(page,11);
  const validation=page.locator('.slide:not([hidden])').nth(11);
  await expect(validation.locator('a[href*="github.com"]')).toHaveCount(0);
  const open=validation.locator('.fm-next-kpi-open');
  await expect(open).toHaveText('8개 지표의 계산·관찰 기준 보기');
  await open.click();
  const dialog=validation.locator('.fm-next-kpi-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.fm-next-kpi-table>div')).toHaveCount(8);
  await expect(dialog).toContainText('Match Search → Detail CTR');
  await expect(dialog).toContainText('AI Search Adoption Rate');
  await expect(dialog).toContainText('운영·테스트 계정, 자동 QA, Real App의 샘플·시뮬레이션은 제외');
  await expect(dialog).toContainText('connected-ai와 rules-fallback 분리');
  await dialog.locator('.fm-next-kpi-close').click();
  await expect(dialog).not.toBeVisible();
});
