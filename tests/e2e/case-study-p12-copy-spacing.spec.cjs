const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function openP12(page,viewport){
  await openCaseStudy(page,viewport);
  await page.evaluate(()=>document.querySelectorAll('.toc-item')[11]?.click());
  await page.waitForTimeout(120);
  await expect(page.locator('.slide.on')).toBeVisible();
}

async function noHorizontalOverflow(page){
  const widths=await page.evaluate(()=>({
    viewport:innerWidth,
    document:document.documentElement.scrollWidth,
    body:document.body.scrollWidth
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport+1);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport+1);
}

for(const [name,viewport] of [
  ['desktop',{width:1440,height:900}],
  ['mobile',{width:390,height:844}]
]){
  test(`P2 P8 and P13 scope copy reads as finished portfolio copy on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);

    await page.evaluate(()=>document.querySelectorAll('.toc-item')[1]?.click());
    await page.waitForTimeout(120);
    const problem=page.locator('.slide.on');
    await expect(problem).toContainText('탐색·가입 과업 검증 · 문제 가설·경쟁사 우위는 미입증');
    await expect(problem).not.toContainText('Beta에서 확인합니다.');
    await problem.screenshot({
      path:`test-results/case-study-copy-cleanup-p2-${viewport.width}.png`,
      animations:'disabled'
    });

    await page.evaluate(()=>document.querySelectorAll('.toc-item')[7]?.click());
    await page.waitForTimeout(120);
    const auth=page.locator('.slide.on');
    await expect(auth).toContainText('Supabase 계정·경기·참가 흐름 실제 연동');
    await expect(auth).toContainText('운영 환경 로그인 확인 · 복귀 경로 보존 설계 · 실제 결제 미연동');
    await expect(auth).not.toContainText('실제로 연동했습니다.');
    await expect(auth).not.toContainText('후속 범위입니다.');
    await auth.screenshot({
      path:`test-results/case-study-copy-cleanup-p8-${viewport.width}.png`,
      animations:'disabled'
    });

    await page.evaluate(()=>document.querySelectorAll('.toc-item')[12]?.click());
    await page.waitForTimeout(120);
    const release=page.locator('.slide.on');
    const releaseLead=release.locator('.fm-next-story-lead');
    await expect(releaseLead).toHaveText('추천 이유·참가 동선·복구 행동을 관찰할 기준과 다음 수정 조건을 정의했습니다.');
    await expect(releaseLead).not.toContainText('실제 이용자 KPI');
    await noHorizontalOverflow(page);
    await release.screenshot({
      path:`test-results/case-study-copy-cleanup-p13-${viewport.width}.png`,
      animations:'disabled'
    });
  });

  test(`P12 validation copy is polished and QA card rhythm is consistent on ${name}`,async({page})=>{
    await openP12(page,viewport);

    const slide=page.locator('.slide.on.fm-next-story-slide[data-v5-content-role="validation-evidence"]');
    const lead=slide.locator('.fm-next-story-lead');
    await expect(lead).toHaveText('성과 지표는 측정 전이며, 제품 동작은 QA·검수로 확인했습니다.');
    await expect(lead).not.toContainText('Measured Result');

    const banner=slide.locator('.fm-p1-validation-banner');
    await expect(banner.locator('b')).toHaveText('측정 전 기준 정의');
    await expect(banner.locator('p')).toHaveText('목표치보다 분자 · 분모 · 제외 조건 · 기준값을 먼저 정의');

    const cards=slide.locator('.fm-p1-evidence-grid>.fm-next-cs-card');
    await expect(cards).toHaveCount(3);
    const expectedLabels=['사용자 과업','자동 QA','사람 검수'];

    for(let index=0;index<3;index+=1){
      const card=cards.nth(index);
      const label=card.locator('.fm-p1-evidence-label');
      const body=card.locator('p');
      await expect(label).toHaveText(expectedLabels[index]);
      await expect(body).toBeVisible();
      const rhythm=await card.evaluate(node=>{
        const cardStyle=getComputedStyle(node);
        const labelStyle=getComputedStyle(node.querySelector('.fm-p1-evidence-label'));
        const titleStyle=getComputedStyle(node.querySelector('h3'));
        const bodyStyle=getComputedStyle(node.querySelector('p'));
        return {
          cardPaddingTop:parseFloat(cardStyle.paddingTop),
          labelPosition:labelStyle.position,
          labelMarginBottom:parseFloat(labelStyle.marginBottom),
          titleMarginBottom:parseFloat(titleStyle.marginBottom),
          bodyFontSize:parseFloat(bodyStyle.fontSize),
          bodyLineHeight:parseFloat(bodyStyle.lineHeight)
        };
      });
      const expectedCardPadding=name==='mobile'?18:16;
      expect(rhythm.cardPaddingTop).toBe(expectedCardPadding);
      expect(rhythm.labelPosition).toBe('static');
      expect(rhythm.labelMarginBottom).toBeGreaterThanOrEqual(7);
      expect(rhythm.labelMarginBottom).toBeLessThanOrEqual(8);
      expect(rhythm.titleMarginBottom).toBe(8);
      expect(rhythm.bodyLineHeight/rhythm.bodyFontSize).toBeGreaterThanOrEqual(1.65);
      expect(rhythm.bodyLineHeight/rhythm.bodyFontSize).toBeLessThanOrEqual(1.71);
    }

    await noHorizontalOverflow(page);
    await page.screenshot({
      path:`test-results/case-study-p12-copy-spacing-${viewport.width}.png`,
      fullPage:false,
      animations:'disabled'
    });
  });
}
