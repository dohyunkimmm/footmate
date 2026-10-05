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

test('P1 centers editorial copy with the product UI and aligns proof descriptions',async({page})=>{
  await openPreview(page,{width:1440,height:1000});
  const slide=page.locator('.slide.on');
  await slide.evaluate(async node=>{
    await Promise.all(node.getAnimations({subtree:true}).filter(animation=>animation.effect?.getTiming().iterations!==Infinity).map(animation=>animation.finished.catch(()=>{})));
  });
  const geometry=await slide.evaluate(node=>{
    const copy=node.querySelector('.fm-next-cover-copy').getBoundingClientRect();
    const visual=node.querySelector('.fm-next-cover-visual').getBoundingClientRect();
    const cards=[...node.querySelectorAll('.fm-next-cover-proof>div')].map(card=>{
      const box=card.getBoundingClientRect();const description=card.querySelector('span').getBoundingClientRect();
      return {top:box.top,bottom:box.bottom,descriptionTop:description.top};
    });
    return {copyCenter:(copy.top+copy.bottom)/2,visualCenter:(visual.top+visual.bottom)/2,copyRight:copy.right,visualLeft:visual.left,cards};
  });
  console.log('P1_COVER_GEOMETRY '+JSON.stringify(geometry));
  expect(Math.abs(geometry.copyCenter-geometry.visualCenter)).toBeLessThanOrEqual(1);
  expect(geometry.visualLeft-geometry.copyRight).toBeGreaterThanOrEqual(24);
  for(const card of geometry.cards){
    expect(Math.abs(card.top-geometry.cards[0].top)).toBeLessThanOrEqual(1);
    expect(Math.abs(card.bottom-geometry.cards[0].bottom)).toBeLessThanOrEqual(1);
    expect(Math.abs(card.descriptionTop-geometry.cards[0].descriptionTop)).toBeLessThanOrEqual(1);
  }
  expect(await slide.evaluate(node=>node.scrollHeight-node.clientHeight)).toBeLessThanOrEqual(1);
  const screenshot=await page.screenshot({type:'jpeg',quality:75,animations:'disabled'});
  console.log('P1_COVER_VISUAL '+screenshot.toString('base64'));
});
