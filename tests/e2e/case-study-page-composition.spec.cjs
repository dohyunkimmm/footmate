const {test,expect}=require('@playwright/test');

for(const viewport of [{width:1440,height:1000},{width:1280,height:720},{width:390,height:844},{width:320,height:740}]){
  test(`13 sections preserve readable composition at ${viewport.width}px`,async({page})=>{
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto('/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
    const contrast=await page.evaluate(()=>{
      const luminance=color=>{
        const values=color.match(/[\d.]+/g).slice(0,3).map(Number).map(value=>{
          const channel=value/255;return channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;
        });
        return values[0]*.2126+values[1]*.7152+values[2]*.0722;
      };
      const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
      const navigation=document.querySelector(innerWidth>900?'.sidebar':'.cs-mobile-head');
      const label=navigation.querySelector(innerWidth>900?'.sb-logo':'b');
      const cover=document.querySelector('.fm-next-cover h1 .fm-next-cover-title-line');
      return {
        navigation:ratio(getComputedStyle(label).color,getComputedStyle(navigation).backgroundColor),
                cover:ratio(getComputedStyle(cover).color,getComputedStyle(document.querySelector('.fm-next-cover-slide')).backgroundColor)
      };
    });
    expect(contrast.navigation).toBeGreaterThanOrEqual(4.5);
    expect(contrast.cover).toBeGreaterThanOrEqual(4.5);
    const slides=page.locator('.track>.slide');
    await expect(slides).toHaveCount(13);
    for(let index=0;index<13;index++){
      if(viewport.width>900)await page.locator('.toc-item').nth(index).click();
      const slide=slides.nth(index);
      await expect(slide).toBeVisible();
      await expect(slide.locator('.fm-page-keywords>span')).toHaveCount(3);
      const title=slide.locator(index===0?'h1':'.fm-next-story h2');
      await expect(title).not.toHaveText('');
      const geometry=await title.evaluate(node=>{
        const box=node.getBoundingClientRect();const parent=node.closest('.slide').getBoundingClientRect();
        return {left:box.left,right:box.right,parentLeft:parent.left,parentRight:parent.right,font:parseFloat(getComputedStyle(node).fontSize)};
      });
      expect(geometry.left).toBeGreaterThanOrEqual(geometry.parentLeft);
      expect(geometry.right).toBeLessThanOrEqual(geometry.parentRight+1);
      expect(geometry.font).toBeGreaterThanOrEqual(24);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      if(viewport.width>900){
        await expect.poll(()=>slide.evaluate(node=>node.scrollHeight-node.clientHeight)).toBeLessThanOrEqual(1);
        const bounds=await slide.evaluate(node=>{
          const content=node.querySelector('.fm-next-story,.fm-next-cover').getBoundingClientRect();
          const viewport=node.getBoundingClientRect();
          return {top:content.top-viewport.top,bottom:viewport.bottom-content.bottom};
        });
        expect(bounds.top).toBeGreaterThanOrEqual(63);
        expect(bounds.bottom).toBeGreaterThanOrEqual(63);
      }
    }
    expect(errors).toEqual([]);
    // Verify the originals load; local layout checks with placeholders are not image QA.
    for(const image of await page.locator('.fm-evidence-figure[data-evidence-scale="primary"] img').all()){
      if(viewport.width<=900)await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBeTruthy();
      const framing=await image.evaluate(node=>({fit:getComputedStyle(node).objectFit,clip:getComputedStyle(node).clipPath}));
      expect(framing).toEqual({fit:'contain',clip:'none'});
    }
    if(viewport.width>900){
      await page.keyboard.press('ArrowLeft');
      await expect(slides.nth(11)).toHaveClass(/on/);
      await page.keyboard.press('ArrowRight');
      await expect(slides.nth(12)).toHaveClass(/on/);
    }
  });
}
