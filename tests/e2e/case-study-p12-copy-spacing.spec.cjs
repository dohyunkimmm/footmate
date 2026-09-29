const {test,expect}=require('@playwright/test');

async function openP12(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmCaseStudyP12CopySpacing==='true');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
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
  test(`P12 validation copy is polished and QA card rhythm is consistent on ${name}`,async({page})=>{
    await openP12(page,viewport);

    const slide=page.locator('.slide.on.fm-next-story-slide[data-v5-content-role="validation-evidence"]');
    const lead=slide.locator('.fm-next-story-lead');
    await expect(lead).toContainText('아래 지표는 Beta에서 관찰할 Validation Metric으로, 아직 측정된 성과값이 아닙니다.');
    await expect(lead).not.toContainText('Measured Result 아님');

    const banner=slide.locator('.fm-p1-validation-banner');
    await expect(banner.locator('b')).toHaveText('측정 전 기준 정의');
    await expect(banner.locator('p')).toHaveText('목표치보다 분자 · 분모 · 제외 조건 · 기준값을 먼저 정의');

    const cards=slide.locator('.fm-p1-evidence-grid>.fm-next-cs-card');
    await expect(cards).toHaveCount(3);
    const expectedLabels=['AUTOMATED QA','HUMAN CHECK','AI-ASSISTED REVIEW'];

    for(let index=0;index<3;index+=1){
      const card=cards.nth(index);
      const label=card.locator('.fm-p1-evidence-label');
      const title=card.locator('h3');
      const bodyLines=card.locator('p>.fm-cs-line');
      await expect(label).toHaveText(expectedLabels[index]);
      const rhythm=await card.evaluate(node=>{
        const cardStyle=getComputedStyle(node);
        const labelNode=node.querySelector('.fm-p1-evidence-label');
        const titleNode=node.querySelector('h3');
        const lineNodes=[...node.querySelectorAll('p>.fm-cs-line')];
        const labelStyle=getComputedStyle(labelNode);
        const titleStyle=getComputedStyle(titleNode);
        return {
          cardPaddingTop:parseFloat(cardStyle.paddingTop),
          labelPosition:labelStyle.position,
          labelMarginBottom:parseFloat(labelStyle.marginBottom),
          titleMarginBottom:parseFloat(titleStyle.marginBottom),
          lineDisplays:lineNodes.map(line=>getComputedStyle(line).display),
          lineMargins:lineNodes.slice(1).map(line=>parseFloat(getComputedStyle(line).marginTop))
        };
      });
      expect(rhythm.cardPaddingTop).toBeGreaterThanOrEqual(12);
      expect(rhythm.cardPaddingTop).toBeLessThanOrEqual(14);
      expect(rhythm.labelPosition).toBe('static');
      expect(rhythm.labelMarginBottom).toBeGreaterThanOrEqual(7);
      expect(rhythm.labelMarginBottom).toBeLessThanOrEqual(8);
      expect(rhythm.titleMarginBottom).toBe(7);
      expect(rhythm.lineDisplays.every(value=>value==='block')).toBeTruthy();
      expect(rhythm.lineMargins.every(value=>value===4)).toBeTruthy();
      await expect(bodyLines.first()).toBeVisible();
    }

    await noHorizontalOverflow(page);
    await page.screenshot({
      path:`test-results/case-study-p12-copy-spacing-${viewport.width}.png`,
      fullPage:false,
      animations:'disabled'
    });
  });
}
