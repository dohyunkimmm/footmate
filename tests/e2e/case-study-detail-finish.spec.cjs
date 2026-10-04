const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function showSection(page,index){
  await page.evaluate(i=>document.querySelectorAll('.toc-item')[i]?.click(),index);
  await page.waitForTimeout(120);
  await expect(page.locator('.slide.on')).toBeVisible();
}

async function noHorizontalOverflow(page){
  const widths=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport+1);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport+1);
}

for(const [name,viewport] of [
  ['desktop',{width:1440,height:900}],
  ['mobile',{width:390,height:844}]
]){
  test(`Case Study detail finish stays token-consistent on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);

    // 1/2/3/5 · P11 radius, surface hierarchy, restrained label tracking, internal alignment.
    await showSection(page,10);
    const p11=await page.locator('.slide.on').evaluate(slide=>{
      const nodes=[...slide.querySelectorAll('.fm-p0-arch-node')];
      const normal=nodes.find(node=>!node.classList.contains('is-focus'));
      const focus=nodes.find(node=>node.classList.contains('is-focus'));
      const style=node=>getComputedStyle(node);
      return {
        normalRadius:parseFloat(style(normal).borderTopLeftRadius),
        focusRadius:parseFloat(style(focus).borderTopLeftRadius),
        normalBg:style(normal).backgroundColor,
        focusBg:style(focus).backgroundColor,
        labelSpacing:parseFloat(style(normal.querySelector('small')).letterSpacing),
        labelLineHeight:parseFloat(style(normal.querySelector('small')).lineHeight),
        nodeHeights:nodes.map(node=>Math.round(node.getBoundingClientRect().height)),
        summaryRadius:parseFloat(getComputedStyle(slide.querySelector('.fm-next-review-summary>div')).borderTopLeftRadius)
      };
    });
    expect(p11.normalRadius).toBe(12);
    expect(p11.focusRadius).toBe(12);
    expect(p11.summaryRadius).toBe(0);
    expect(p11.focusBg).not.toBe(p11.normalBg);
    expect(p11.labelSpacing).toBeLessThan(1);
    expect(p11.labelLineHeight).toBeGreaterThanOrEqual(9);
    if(name==='desktop')expect(Math.max(...p11.nodeHeights)-Math.min(...p11.nodeHeights)).toBeLessThanOrEqual(1);

    // 1/2/3/5 · P12 cards use 16/12 radius tiers and one focal metric hierarchy.
    await showSection(page,11);
    const p12=await page.locator('.slide.on').evaluate(slide=>{
      const banner=slide.querySelector('.fm-p1-validation-banner');
      const funnelWrap=slide.querySelector('.fm-p1-funnel-wrap');
      const funnel=slide.querySelector('.fm-p1-funnel>div');
      const funnelFocus=slide.querySelector('.fm-p1-funnel>div.is-focus');
      const evidence=slide.querySelector('.fm-p1-evidence-grid>.fm-next-cs-card');
      return {
        bannerRadius:parseFloat(getComputedStyle(banner).borderTopLeftRadius),
        wrapRadius:parseFloat(getComputedStyle(funnelWrap).borderTopLeftRadius),
        funnelRadius:parseFloat(getComputedStyle(funnel).borderTopLeftRadius),
        bannerBg:getComputedStyle(banner).backgroundColor,
        funnelFocusBg:getComputedStyle(funnelFocus).backgroundColor,
        evidenceBg:getComputedStyle(evidence).backgroundColor,
        labelSpacing:parseFloat(getComputedStyle(slide.querySelector('.fm-p1-evidence-label')).letterSpacing)||0
      };
    });
    expect(p12.bannerRadius).toBe(name==='desktop'?0:16);
    expect(p12.wrapRadius).toBe(name==='desktop'?12:16);
    expect(p12.funnelRadius).toBe(12);
    expect(p12.bannerBg).not.toBe(p12.evidenceBg);
    expect(p12.funnelFocusBg).not.toBe(p12.evidenceBg);
    expect(p12.labelSpacing).toBeLessThan(1);

    // 1/2/4/7 · P13 has one focal card, pill status tokens, and a clean learning-only close.
    await showSection(page,12);
    const p13=await page.locator('.slide.on').evaluate(slide=>{
      const quiet=slide.querySelector('.fm-p1-release-map>article:not(.is-focus)');
      const focus=slide.querySelector('.fm-p1-release-map>article.is-focus');
      const chips=[...slide.querySelectorAll('.fm-p1-release-map li>span')].map(node=>{
        const box=node.getBoundingClientRect();
        const css=getComputedStyle(node);
        return {height:box.height,width:box.width,radius:parseFloat(css.borderTopLeftRadius),lineHeight:parseFloat(css.lineHeight)};
      });
      const closing=slide.querySelector('.fm-p1-release-next');
      return {
        quietRadius:parseFloat(getComputedStyle(quiet).borderTopLeftRadius),
        focusRadius:parseFloat(getComputedStyle(focus).borderTopLeftRadius),
        quietBg:getComputedStyle(quiet).backgroundColor,
        focusBg:getComputedStyle(focus).backgroundColor,
        chips,
        closingRadius:parseFloat(getComputedStyle(closing).borderTopLeftRadius),
        hasCta:Boolean(closing.querySelector('a')),
        closingText:closing.textContent.trim()
      };
    });
    expect(p13.quietRadius).toBe(16);
    expect(p13.focusRadius).toBe(16);
    expect(p13.closingRadius).toBe(16);
    expect(p13.focusBg).not.toBe(p13.quietBg);
    expect(p13.hasCta).toBeFalsy();
    expect(p13.closingText).toContain('핵심 학습');
    // Chromium can resolve 22/44px minimums a fraction below the authored value after layout.
    // Keep a half-pixel tolerance while still verifying the intended pill geometry.
    if(name==='desktop')expect(p13.chips.every(chip=>chip.radius===0&&chip.lineHeight>=16)).toBeTruthy();
    else expect(p13.chips.every(chip=>chip.height>=21.5&&chip.width>=43.5&&chip.radius>=10.5)).toBeTruthy();

    if(name==='desktop'){
      // 6 · Navigation is quieter while the active dot remains unambiguous.
      const nav=await page.evaluate(()=>{
        const button=document.querySelector('.cs-button');
        const dot=document.querySelector('.dot:not(.on)');
        const active=document.querySelector('.dot.on');
        return {
          buttonRadius:parseFloat(getComputedStyle(button).borderTopLeftRadius),
          buttonHeight:button.getBoundingClientRect().height,
          dotSize:dot.getBoundingClientRect().width,
          dotBg:getComputedStyle(dot).backgroundColor,
          activeBg:getComputedStyle(active).backgroundColor,
          activeTransform:getComputedStyle(active).transform,
          pbarHeight:document.querySelector('.pbar').getBoundingClientRect().height
        };
      });
      expect(nav.buttonRadius).toBe(8);
      expect(nav.buttonHeight).toBe(42);
      expect(nav.dotSize).toBe(6);
      expect(nav.activeBg).not.toBe(nav.dotBg);
      expect(nav.activeTransform).not.toBe('none');
      expect(nav.pbarHeight).toBe(2);
    }else{
      // 8 · Late mobile sections keep the summary/content left and right edges aligned.
      for(const index of [10,12]){
        await showSection(page,index);
        const geometry=await page.locator('.slide.on').evaluate(slide=>{
          const summary=slide.querySelector('.fm-next-review-summary')?.getBoundingClientRect();
          const content=slide.querySelector('.fm-p0-architecture,.fm-p1-release-map')?.getBoundingClientRect();
          return summary&&content?{left:Math.abs(summary.left-content.left),right:Math.abs(summary.right-content.right)}:null;
        });
        expect(geometry).toBeTruthy();
        expect(geometry.left).toBeLessThanOrEqual(1);
        expect(geometry.right).toBeLessThanOrEqual(1);
      }
      await showSection(page,11);
      await expect(page.locator('.slide.on .fm-next-review-summary')).toHaveCount(0);
    }

    await page.locator('.slide.on').screenshot({path:`test-results/case-study-detail-finish-${name}.png`,animations:'disabled'});
    await noHorizontalOverflow(page);
  });
}

