const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport={width:1440,height:900}){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyReaderPolish==='1');
}

async function visibleSlides(page){
  return page.locator('.slide:not([hidden])');
}

test('public Case Study uses reader-facing participant wording without internal PBL jargon',async({page})=>{
  await openCaseStudy(page);
  const text=(await (await visibleSlides(page)).allInnerTexts()).join('\n');
  expect(text).not.toContain('PBL');
  expect(text).toContain('같은 교육과정을 수강한 교육생 6명');
  expect(text).toContain('과업 검증');
});

test('Sign in and Join folds state preservation into the evidence table',async({page})=>{
  await openCaseStudy(page);
  const slide=(await visibleSlides(page)).nth(7);
  await expect(slide.locator('.fm-next-cs-state-line')).toHaveCount(0);
  await expect(slide).toContainText('상태 보존');
  await expect(slide).toContainText('로그인 전 선택한 경기와 복귀 위치를 유지');
});

test('Operations keeps the state scenario inside the Case Study and removes the review-mode exit',async({page})=>{
  await openCaseStudy(page);
  const slide=(await visibleSlides(page)).nth(8);
  await expect(slide.locator('.fm-next-cs-link')).toHaveCount(0);
  for(const value of ['탐색 중','참가 확정','경기 당일','경기 후','운영 권한','자리 회복','변경과 복구']){
    await expect(slide).toContainText(value);
  }
});

test('green emphasis is reserved for the adopted comparison rather than peer status cards',async({page})=>{
  await openCaseStudy(page);
  const slides=await visibleSlides(page);
  await expect(slides.nth(4).locator('.fm-next-cs-before-after>.is-after')).toHaveCount(1);
  await expect(slides.nth(7).locator('.fm-next-cs-auth-flow>.is-focus')).toHaveCount(0);
  await expect(slides.nth(8).locator('.fm-next-cs-day-states>.is-focus')).toHaveCount(0);
  await expect(slides.nth(10).locator('.fm-next-cs-modes>.is-focus')).toHaveCount(0);
});

test('KPI cards explain calculation basis without numerator denominator jargon',async({page})=>{
  await openCaseStudy(page);
  const slide=(await visibleSlides(page)).nth(11);
  const text=await slide.innerText();
  expect(text).not.toContain('분자');
  expect(text).not.toContain('분모');
  expect(text).toContain('계산 기준 · 상세 진입 세션 ÷ 결과 노출 세션');
  expect(text).toContain('8개 지표의 계산·관찰 기준 보기');
});

test('02 through 13 use tighter desktop reading density without overflow',async({page})=>{
  await openCaseStudy(page,{width:1440,height:900});
  const slides=await visibleSlides(page);
  for(let index=1;index<13;index+=1){
    await page.evaluate(i=>window.goTo(i),index);
    const geometry=await slides.nth(index).locator('.fm-next-story').evaluate(story=>{
      const rect=story.getBoundingClientRect();
      const slide=story.closest('.slide').getBoundingClientRect();
      return {
        top:rect.top,
        bottom:rect.bottom,
        slideTop:slide.top,
        overflow:story.scrollHeight-story.clientHeight
      };
    });
    expect(geometry.top-geometry.slideTop).toBeLessThanOrEqual(90);
    expect(geometry.bottom).toBeLessThanOrEqual(835);
    expect(geometry.overflow).toBeLessThanOrEqual(2);
  }
});

test('environment implementation and validation copy uses complete polite sentences',async({page})=>{
  await openCaseStudy(page);
  const domain=(await visibleSlides(page)).nth(10);
  const release=(await visibleSlides(page)).nth(12);
  for(const value of [
    'Vercel AI Gateway·Supabase·Resend·Web Push·Storage를 실제 연결했습니다.',
    '실제 PG와 외부 분석 도구는 연결하지 않았습니다.'
  ])await expect(domain).toContainText(value);
  for(const value of [
    '경기 데이터는 샘플을 사용하며 인증·결제·정원·알림은 시뮬레이션입니다.',
    'Google/Kakao OAuth·이메일·Web Push·미디어도 실제 환경에서 검증했습니다.',
    '수익성과 실제 이용 지표는 아직 검증하지 않았습니다.'
  ])await expect(release).toContainText(value);
});
