const {test,expect}=require('@playwright/test');

async function openCaseStudy(page){
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.documentElement.dataset.footmateCaseStudySections==='13'&&document.querySelectorAll('.track .slide').length===13);
}

test('Case Study physically keeps only 13 sections and navigation nodes',async({page})=>{
  await openCaseStudy(page);
  await expect(page.locator('.track .slide')).toHaveCount(13);
  await expect(page.locator('.toc-item')).toHaveCount(13);
  await expect(page.locator('.dot')).toHaveCount(13);
  await expect(page.locator('[data-cs-hidden="true"]')).toHaveCount(0);
  await expect(page.locator('.topbar-count')).toHaveText('01 / 13');
});

test('merged System Evidence, Validation, and Outcome limits remain in P11-P13',async({page})=>{
  await openCaseStudy(page);

  await page.evaluate(()=>window.goTo?.(10));
  const systemEvidence=await page.locator('.slide.on').innerText();
  expect(systemEvidence).toContain('상태 소유권과 외부 연동, AI 권한');
  expect(systemEvidence).toContain('결정론적 추천 엔진');
  expect(systemEvidence).toContain('Vercel AI Gateway');
  expect(systemEvidence).toContain('Supabase');
  expect(systemEvidence).toContain('실제 PG와 외부 분석 도구는 미연동');

  await page.evaluate(()=>window.goTo?.(11));
  const validation=await page.locator('.slide.on').innerText();
  expect(validation).toContain('자동 QA');
  expect(validation).toContain('Browser E2E');
  expect(validation).toContain('Visual Regression');
  expect(validation).toContain('Production Smoke');
  expect(validation).toContain('사람 검수');
  expect(validation).toContain('AI 보조 검수');

  await page.evaluate(()=>window.goTo?.(12));
  const outcome=await page.locator('.slide.on').innerText();
  expect(outcome).toContain('Production 범위');
  expect(outcome).toContain('Real App');
  expect(outcome).toContain('Closed Beta');
  expect(outcome).toContain('미연동 범위');
  expect(outcome).toContain('실제 PG · 외부 분석 도구');
  await expect(page.locator('.topbar-count')).toHaveText('13 / 13');
  await expect(page.locator('.btn-next')).toBeDisabled();

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.topbar-count')).toHaveText('13 / 13');
});
