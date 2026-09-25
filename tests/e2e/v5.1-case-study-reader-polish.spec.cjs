const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport={width:1440,height:900}){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyReaderPolish==='2'&&document.documentElement.dataset.footmateCaseStudyStructuredCopy==='2');
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
  await expect(slide).toContainText('선택 경기 · 로그인 후 복귀 위치 유지');
});

test('Sign in and Join applies compact spacing to the auth flow and evidence table only',async({page})=>{
  await openCaseStudy(page,{width:1440,height:900});
  const slide=(await visibleSlides(page)).nth(7);
  await expect(slide).toHaveAttribute('data-v5-content-role','auth-participation');
  const geometry=await slide.evaluate(node=>{
    const flow=node.querySelector('.fm-next-cs-auth-flow');
    const flowCell=flow?.querySelector('div');
    const scope=node.querySelector('.fm-next-cs-scope');
    const reasons=scope?.querySelector('.fm-cs-reasons');
    const firstRow=reasons?.querySelector('div');
    const slideStyle=getComputedStyle(node);
    const flowStyle=getComputedStyle(flow);
    const cellStyle=getComputedStyle(flowCell);
    const scopeStyle=getComputedStyle(scope);
    const reasonsStyle=getComputedStyle(reasons);
    const rowStyle=getComputedStyle(firstRow);
    return {
      alignItems:slideStyle.alignItems,
      flowGap:flowStyle.gap,
      cellPaddingTop:cellStyle.paddingTop,
      cellPaddingLeft:cellStyle.paddingLeft,
      scopePaddingTop:scopeStyle.paddingTop,
      scopePaddingLeft:scopeStyle.paddingLeft,
      reasonsRowGap:reasonsStyle.rowGap,
      rowPaddingTop:rowStyle.paddingTop,
      rowColumns:rowStyle.gridTemplateColumns
    };
  });
  expect(geometry.alignItems).toBe('center');
  expect(geometry.flowGap).toBe('6px');
  expect(geometry.cellPaddingTop).toBe('10px');
  expect(geometry.cellPaddingLeft).toBe('12px');
  expect(geometry.scopePaddingTop).toBe('10px');
  expect(geometry.scopePaddingLeft).toBe('14px');
  expect(geometry.reasonsRowGap).toBe('0px');
  expect(geometry.rowPaddingTop).toBe('5px');
  expect(geometry.rowColumns.startsWith('84px ')).toBe(true);
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

test('02 through 13 preserve centered desktop page rhythm without overflow',async({page})=>{
  await openCaseStudy(page,{width:1440,height:900});
  const slides=await visibleSlides(page);
  for(let index=1;index<13;index+=1){
    await page.evaluate(i=>window.goTo(i),index);
    const geometry=await slides.nth(index).evaluate(slide=>{
      const story=slide.querySelector('.fm-next-story');
      const style=getComputedStyle(slide);
      return {
        alignItems:style.alignItems,
        paddingTop:style.paddingTop,
        paddingBottom:style.paddingBottom,
        overflow:story.scrollHeight-story.clientHeight
      };
    });
    expect(geometry.alignItems).toBe('center');
    expect(geometry.paddingTop).not.toBe('38px');
    expect(geometry.paddingBottom).not.toBe('38px');
    expect(geometry.overflow).toBeLessThanOrEqual(2);
  }
});

test('title lead and structured values use natural wrapping instead of forced sentence lines',async({page})=>{
  await openCaseStudy(page,{width:1440,height:900});
  const slides=await visibleSlides(page);
  for(const index of [1,2,3,4,5,6,7,8,9,10,11,12]){
    const line=slides.nth(index).locator('.fm-next-story .fm-cs-line').first();
    if(await line.count())expect(await line.evaluate(node=>getComputedStyle(node).display)).toBe('inline');
  }
  const guest=slides.nth(4);
  const compared=guest.locator('.fm-next-cs-before-after>div').first().locator('b .fm-cs-line');
  await expect(compared).toHaveCount(2);
  expect(await compared.nth(0).evaluate(node=>getComputedStyle(node).display)).toBe('inline');
  expect(await compared.nth(1).evaluate(node=>getComputedStyle(node).display)).toBe('inline');
});

test('environment implementation and validation boundaries stay compact inside structured evidence',async({page})=>{
  await openCaseStudy(page);
  const domain=(await visibleSlides(page)).nth(10);
  const release=(await visibleSlides(page)).nth(12);
  for(const value of [
    'Vercel AI Gateway · Supabase · Resend · Web Push · Storage',
    '실제 PG · 외부 분석 도구',
    'API·데이터·권한·오류·재시도 · IA·상태별 화면·CTA · 취소·정원·복구 정책'
  ])await expect(domain).toContainText(value);
  for(const value of [
    'AI Gateway 실연동 · 결정론적 추천 · 샘플 경기 데이터 · 인증·결제·정원·알림 시뮬레이션',
    'Supabase 인증·경기·정원·참가/취소 · 체크인 · Google/Kakao OAuth · 이메일 · Web Push · 미디어 실연동',
    '실제 PG · 외부 분석 도구 · 수익성 · 실제 이용 지표 미검증'
  ])await expect(release).toContainText(value);
});
