const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function showSection(page,index){
  await page.evaluate(i=>document.querySelectorAll('.toc-item')[i]?.click(),index);
  await page.waitForTimeout(120);
  await expect(page.locator('.slide.on')).toBeVisible();
}

async function noHorizontalOverflow(page){
  const width=await page.evaluate(()=>({viewport:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(width.doc).toBeLessThanOrEqual(width.viewport+1);
  expect(width.body).toBeLessThanOrEqual(width.viewport+1);
}

for(const [name,viewport] of [
  ['desktop',{width:1440,height:900}],
  ['mobile',{width:390,height:844}]
]){
  test(`P7 and P9 product evidence ends at the intended app chrome on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);

    for(const [index,key,selector] of [
      [6,'detail','.fm-evidence-figure.is-detail img'],
      [8,'operations','.fm-evidence-figure.is-operations img']
    ]){
      await showSection(page,index);
      const slide=page.locator('.slide.on.fm-next-story-slide');
      await expect(slide).toHaveAttribute('data-evidence-upgrade',key);
      const image=slide.locator(selector);
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      const framing=await image.evaluate(node=>{
        const style=getComputedStyle(node);
        const box=node.getBoundingClientRect();
        const media=node.closest('.fm-evidence-media').getBoundingClientRect();
        return {clipPath:style.clipPath,marginBottom:parseFloat(style.marginBottom),box,media};
      });
      expect(framing.clipPath).toBe('none');
      expect(framing.marginBottom).toBe(0);
      expect(framing.box.left).toBeGreaterThanOrEqual(framing.media.left-1);
      expect(framing.box.right).toBeLessThanOrEqual(framing.media.right+1);
      await noHorizontalOverflow(page);
      await page.screenshot({
        path:`test-results/case-study-evidence-framing-${key}-${viewport.width}.png`,
        fullPage:false,
        animations:'disabled'
      });
    }
  });

  test(`P10 recovery evidence keeps the full state action readable on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);
    await showSection(page,9);
    const slide=page.locator('.slide.on.fm-next-story-slide');
    const strip=slide.locator('.fm-evidence-recovery-strip');
    const images=strip.locator('.fm-evidence-media img');
    await expect(images).toHaveCount(2);

    if(viewport.width>900)await slide.evaluate(node=>node.scrollTop=node.scrollHeight);
    const geometry=await strip.evaluate(node=>{
      const boxes=[...node.querySelectorAll('.fm-evidence-media img')].map(img=>{
        const box=img.getBoundingClientRect();
        const style=getComputedStyle(img);
        return {height:box.height,objectFit:style.objectFit,objectPosition:style.objectPosition,clipPath:style.clipPath,marginBottom:parseFloat(style.marginBottom)};
      });
      const captions=[...node.querySelectorAll('figcaption')].map(el=>el.getBoundingClientRect());
      return {boxes,captions};
    });

    if(viewport.width>900){
      geometry.boxes.forEach(box=>{
        expect(box.height).toBeGreaterThanOrEqual(190);
        expect(box.objectFit).toBe('cover');
        expect(box.objectPosition).toMatch(/0%$/);
        expect(box.clipPath).not.toBe('none');
        expect(box.marginBottom).toBeLessThan(0);
      });
      geometry.captions.forEach(box=>expect(box.bottom).toBeLessThan(875));
    }else{
      geometry.boxes.forEach(box=>expect(box.height).toBeGreaterThanOrEqual(228));
    }

    await expect(strip.locator('figcaption').nth(0)).toContainText('탐색 결과 없음');
    await expect(strip.locator('figcaption').nth(1)).toContainText('참가 실패');
    await noHorizontalOverflow(page);
    await page.screenshot({
      path:`test-results/case-study-evidence-framing-recovery-${viewport.width}.png`,
      fullPage:false,
      animations:'disabled'
    });
  });
}
