const {test,expect}=require('@playwright/test');

async function openPreview(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function noHorizontalOverflow(page){
  const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport+1);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport+1);
}

for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  test(`P1 mirrors the current Real App home on ${name}`,async({page})=>{
    await openPreview(page,viewport);
    const preview=page.locator('.fm-cs-real-home-preview');
    await expect(preview).toHaveCount(1);
    await expect(preview).toHaveAttribute('data-fm-p1-real-preview','true');
    await expect(preview.locator('.fm-p1-real-brand')).toContainText('FootMate');
    await expect(preview.locator('.fm-p1-real-segment')).toContainText('추천 경기 보기');
    await expect(preview.locator('.fm-p1-real-segment')).toContainText('조건 바꾸기');
    await expect(preview.locator('.fm-p1-real-ai')).toContainText('AI MATCH ASSISTANT');
    await expect(preview.locator('.fm-p1-real-ai')).toContainText('AI에게 원하는 경기를 검색해보세요.');
    await expect(preview.locator('.fm-p1-real-section-head')).toContainText('For You');
    await expect(preview.locator('.fm-p1-real-match')).toContainText('광교 웨스트파크');
    await expect(preview.locator('.fm-p1-real-match-meta')).toContainText('샘플 일정 · 평일 21:30');
    await expect(preview.locator('.fm-p1-real-match-meta')).not.toContainText('10월 1일');
    await expect(preview.locator('.fm-p1-real-nav')).toContainText('경기 찾기');
    await expect(page.locator('.fm-next-cover-note')).toContainText('제품 홈 화면 미리보기');

    const geometry=await preview.evaluate(node=>{
      const box=node.getBoundingClientRect();
      const ai=node.querySelector('.fm-p1-real-ai').getBoundingClientRect();
      const match=node.querySelector('.fm-p1-real-match').getBoundingClientRect();
      return {height:box.height,width:box.width,aiBottom:ai.bottom,matchTop:match.top};
    });
    expect(geometry.height).toBeLessThanOrEqual(viewport.width>900?510:590);
    expect(geometry.width).toBeGreaterThan(300);
    expect(geometry.matchTop-geometry.aiBottom).toBeGreaterThanOrEqual(8);
    await noHorizontalOverflow(page);

    await page.locator('.slide.on').screenshot({path:`test-results/case-study-p1-real-preview-${viewport.width}.png`,animations:'disabled'});
  });
}
