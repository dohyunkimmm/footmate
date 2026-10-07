const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
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
  const overflow=await page.evaluate(()=>({
    viewport:window.innerWidth,
    document:document.documentElement.scrollWidth,
    body:document.body.scrollWidth
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport+1);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport+1);
}

for(const [name,viewport,expectedRecoveryGap] of [
  ['desktop',{width:1440,height:900},10],
  ['mobile',{width:390,height:844},8]
]){
  test(`P8 P10 P13 balance stays aligned on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);

    // P8 · lower implementation boundary cards must share the auth-flow left/right edges.
    await showSection(page,7);
    const p8=await page.locator('.slide.on').evaluate(slide=>{
      const flow=slide.querySelector('.fm-p1-auth-flow')?.getBoundingClientRect();
      const boundary=slide.querySelector('.fm-p1-auth-boundary .fm-cs-reasons')?.getBoundingClientRect();
      const scope=slide.querySelector('.fm-p1-auth-boundary');
      const style=scope?getComputedStyle(scope):null;
      return {
        flow:flow&&{left:flow.left,right:flow.right,width:flow.width},
        boundary:boundary&&{left:boundary.left,right:boundary.right,width:boundary.width},
        paddingLeft:style&&parseFloat(style.paddingLeft),
        paddingRight:style&&parseFloat(style.paddingRight),
        cards:[...slide.querySelectorAll('.fm-p1-auth-boundary .fm-cs-reasons>div')].map(card=>{
          const css=getComputedStyle(card);
          return {
            top:parseFloat(css.paddingTop),
            right:parseFloat(css.paddingRight),
            bottom:parseFloat(css.paddingBottom),
            left:parseFloat(css.paddingLeft)
          };
        })
      };
    });
    expect(p8.flow).toBeTruthy();
    expect(p8.boundary).toBeTruthy();
    expect(Math.abs(p8.flow.left-p8.boundary.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(p8.flow.right-p8.boundary.right)).toBeLessThanOrEqual(1);
    expect(p8.paddingLeft).toBe(0);
    expect(p8.paddingRight).toBe(0);
    expect(p8.cards).toHaveLength(3);
    expect(p8.cards.every(card=>card.top===14&&card.bottom===14&&card.left===16&&card.right===16)).toBeTruthy();
    await page.locator('.slide.on').screenshot({path:`test-results/case-study-final-balance-${name}-p8.png`});

    // P10 · recovery rows follow the shared card rhythm. Desktop removes only the redundant recap,
    // keeping the two product proofs and captions safely above persistent navigation controls.
    await showSection(page,9);
    if(viewport.width>900)await page.locator('.slide.on').evaluate(node=>node.scrollTop=node.scrollHeight);
    const p10=await page.locator('.slide.on .fm-p0-recovery-map').evaluate(el=>({
      rowGap:parseFloat(getComputedStyle(el).rowGap),
      rect:el.getBoundingClientRect().toJSON()
    }));
    expect(p10.rowGap).toBe(expectedRecoveryGap);
    const decision=page.locator('.slide.on .fm-next-cs-decision');
    if(name==='desktop'){
      await page.locator('.slide.on').evaluate(node=>node.scrollTop=node.scrollHeight);
      const geometry=await page.locator('.slide.on').evaluate(slide=>{
        const strip=slide.querySelector('.fm-evidence-recovery-strip')?.getBoundingClientRect();
        const controls=document.querySelector('.cs-controls')?.getBoundingClientRect();
        return {
          strip:strip&&{top:strip.top,bottom:strip.bottom,height:strip.height},
          controls:controls&&{top:controls.top,bottom:controls.bottom}
        };
      });
      expect(geometry.strip).toBeTruthy();
      expect(geometry.controls).toBeTruthy();
      expect(geometry.strip.bottom).toBeLessThan(geometry.controls.top-4);
      await expect(decision).toBeHidden();
    }else{
      await expect(decision).toBeVisible();
    }
    await page.locator('.slide.on').screenshot({path:`test-results/case-study-final-balance-${name}-p10.png`});

    // P13 · desktop cards share one height while retaining all content without inner overflow.
    await showSection(page,12);
    const p13=await page.locator('.slide.on .fm-p1-release-map').evaluate(map=>{
      const style=getComputedStyle(map);
      const cards=[...map.children].map(card=>({
        zone:card.dataset.zone,
        height:card.getBoundingClientRect().height,
        clientHeight:card.clientHeight,
        scrollHeight:card.scrollHeight
      }));
      return {alignItems:style.alignItems,cards};
    });
    expect(p13.cards).toHaveLength(3);
    if(name==='desktop'){
      expect(p13.alignItems).toBe('stretch');
      const real=p13.cards.find(card=>card.zone==='real-app');
      const beta=p13.cards.find(card=>card.zone==='closed-beta');
      const open=p13.cards.find(card=>card.zone==='open-boundary');
      expect(Math.abs(open.height-real.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(open.height-beta.height)).toBeLessThanOrEqual(1);
      for(const card of p13.cards)expect(card.scrollHeight-card.clientHeight).toBeLessThanOrEqual(1);
    }
    await page.locator('.slide.on').screenshot({path:`test-results/case-study-final-balance-${name}-p13.png`});

    await noHorizontalOverflow(page);
  });

  test(`Case Study finish polish stays intentional on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);
    await expect(page.locator('.label')).toBeHidden();

    // P2 · quiet source cards feed one explicit core problem without competing with the decision block.
    await showSection(page,1);
    const p2=await page.locator('.slide.on').evaluate(slide=>{
      const summary=slide.querySelector('.fm-next-review-summary>div');
      const source=slide.querySelector('.fm-p0-problem-sources>article');
      const core=slide.querySelector('.fm-p0-problem-core');
      const quote=slide.querySelector('.fm-next-cs-quote');
      const style=el=>el?getComputedStyle(el):null;
      return {
        summaryBorder:parseFloat(style(summary)?.borderTopWidth),
        sourceBorder:style(source)?.borderTopColor,
        sourceBg:style(source)?.backgroundColor,
        coreBorder:style(core)?.borderTopColor,
        quoteBorder:style(quote)?.borderTopColor
      };
    });
    expect(p2.summaryBorder).toBe(0);
    expect(p2.sourceBorder).not.toBe('rgba(0, 0, 0, 0)');
    expect(p2.sourceBg).not.toBe('rgb(255, 255, 255)');
    expect(p2.coreBorder).not.toBe('rgba(0, 0, 0, 0)');
    expect(p2.quoteBorder).not.toBe('rgba(0, 0, 0, 0)');

    // P3 · on mobile, the 3 reviewer metadata items form one compact scan strip.
    await showSection(page,2);
    const summaryGeometry=await page.locator('.slide.on .fm-next-review-summary').evaluate(summary=>({
      height:summary.getBoundingClientRect().height,
      children:[...summary.children].map(node=>{
        const box=node.getBoundingClientRect();
        return {top:box.top,left:box.left,width:box.width,height:box.height};
      })
    }));
    expect(summaryGeometry.children).toHaveLength(3);
    if(name==='mobile'){
      expect(summaryGeometry.children[1].top).toBeGreaterThan(summaryGeometry.children[0].top);
      expect(summaryGeometry.children[2].top).toBeGreaterThan(summaryGeometry.children[1].top);
      expect(summaryGeometry.height).toBeLessThan(140);
      expect(summaryGeometry.children.every(x=>x.width>90)).toBeTruthy();
    }

    // P12 · small muted desktop copy is readable without changing the main hierarchy.
    await showSection(page,11);
    if(name==='desktop'){
      const type=await page.locator('.slide.on').evaluate(slide=>({
        funnelSmall:parseFloat(getComputedStyle(slide.querySelector('.fm-p1-funnel small')).fontSize),
        funnelMeta:parseFloat(getComputedStyle(slide.querySelector('.fm-p1-funnel span')).fontSize),
        ratioMeta:parseFloat(getComputedStyle(slide.querySelector('.fm-p1-ratio>span')).fontSize),
        evidenceLabel:parseFloat(getComputedStyle(slide.querySelector('.fm-p1-evidence-label')).fontSize)
      }));
      expect(type.funnelSmall).toBeGreaterThanOrEqual(9);
      expect(type.funnelMeta).toBeGreaterThanOrEqual(10);
      expect(type.ratioMeta).toBeGreaterThanOrEqual(10);
      expect(type.evidenceLabel).toBeGreaterThanOrEqual(9);
    }

    // P13 · one focal release zone, then a visible key-learning closing summary.
    await showSection(page,12);
    const closing=page.locator('.slide.on .fm-p1-release-next');
    await expect(closing).toBeVisible();
    await expect(closing.locator('a')).toHaveCount(0);
    // Desktop sections retain readable type and scroll within the fixed navigation.
    if(name==='desktop')await closing.scrollIntoViewIfNeeded();
    await expect(closing).toBeInViewport();
    const finish=await page.locator('.slide.on').evaluate(slide=>{
      const final=slide.querySelector('.fm-p1-release-next');
      const rows=[...final.querySelectorAll('.fm-cs-reasons>div')];
      const visibleRows=rows.filter(row=>getComputedStyle(row).display!=='none');
      const focus=slide.querySelector('.fm-p1-release-map>article.is-focus');
      const quiet=slide.querySelector('.fm-p1-release-map>article:not(.is-focus)');
      const controls=document.querySelector('.cs-controls')?.getBoundingClientRect();
      const box=final.getBoundingClientRect();
      return {
        visibleRows:visibleRows.length,
        focusBg:getComputedStyle(focus).backgroundColor,
        quietBg:getComputedStyle(quiet).backgroundColor,
        final:{top:box.top,bottom:box.bottom,height:box.height},
        controls:controls&&{top:controls.top,bottom:controls.bottom}
      };
    });
    expect(finish.visibleRows).toBe(2);
    expect(finish.focusBg).not.toBe(finish.quietBg);
    if(name==='desktop'){
      expect(finish.controls).toBeTruthy();
      expect(finish.final.bottom).toBeLessThan(finish.controls.top-4);
    }

    await page.locator('.slide.on').screenshot({path:`test-results/case-study-completion-polish-${name}-p13.png`});
    await noHorizontalOverflow(page);
  });

  test(`Case Study advanced polish stays coherent on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);
    await expect(page.locator('html')).toHaveAttribute('data-fm-case-study-advanced-polish','true');

    if(name==='desktop'){
      // Restore the pre-#423 reading rhythm: short sections sit around the visual middle
      // instead of being pinned to the same 92px top anchor. Dense sections may start higher.
      const tops=[];
      for(const index of [1,7,10]){
        await showSection(page,index);
        tops.push(await page.locator('.slide.on .fm-next-story h2').evaluate(el=>el.getBoundingClientRect().top));
      }
      expect(Math.min(...tops)).toBeGreaterThan(80);
      expect(tops.every(top=>top<viewport.height-100)).toBeTruthy();
    }

    // P11 · system-like architecture tokens become reader-facing Korean micro labels.
    await showSection(page,10);
    const architectureLabels=await page.locator('.slide.on .fm-p0-arch-node small').allTextContents();
    expect(architectureLabels).toEqual(['요청','확정','해석','전달','판단','제시']);
    if(name==='mobile'){
      const density=await page.locator('.slide.on').evaluate(slide=>({
        paddingTop:parseFloat(getComputedStyle(slide).paddingTop),
        nodePaddingTop:parseFloat(getComputedStyle(slide.querySelector('.fm-p0-arch-node')).paddingTop)
      }));
      expect(density.paddingTop).toBe(48);
      expect(density.nodePaddingTop).toBeLessThanOrEqual(10.5);
    }

    // P12 · QA and funnel micro labels are localized while the structure stays intact.
    await showSection(page,11);
    await expect(page.locator('.slide.on .fm-p1-validation-banner>span')).toHaveText('검증 지표');
    expect(await page.locator('.slide.on .fm-p1-evidence-label').allTextContents()).toEqual(['사용자 과업','자동 QA','사람 검수']);
    if(name==='mobile'){
      const spacing=await page.locator('.slide.on').evaluate(slide=>{
        const style=getComputedStyle(slide);
        const story=getComputedStyle(slide.querySelector('.fm-next-story'));
        return {
          paddingTop:parseFloat(style.paddingTop),
          paddingLeft:parseFloat(style.paddingLeft),
          storyGap:parseFloat(story.gap)
        };
      });
      expect(spacing.paddingTop).toBe(48);
      expect(spacing.paddingLeft).toBeGreaterThanOrEqual(17.5);
      expect(spacing.storyGap).toBeGreaterThanOrEqual(23.5);
    }

    // P13 · open boundary and learning label are localized without duplicating the Real App entry.
    await showSection(page,12);
    await expect(page.locator('.slide.on [data-zone="open-boundary"] header small')).toHaveText('복구 행동');
    await expect(page.locator('.slide.on .fm-p1-release-next>span')).toContainText('핵심 학습');
    await expect(page.locator('.slide.on .fm-p1-release-next>a')).toHaveCount(0);

    if(name==='desktop'){
      // Product evidence uses two explicit scale levels with a shared caption rhythm.
      await showSection(page,5);
      const recommendation=page.locator('.slide.on .fm-evidence-figure.is-recommendation');
      await expect(recommendation).toHaveAttribute('data-evidence-scale','primary');
      await expect(recommendation).toHaveAttribute('data-interactive-ready','true');
      expect(await recommendation.locator('.fm-decision-mock').evaluate(el=>Math.round(el.getBoundingClientRect().height))).toBeLessThanOrEqual(380);
      await expect(recommendation.locator('.fm-mock-match')).toHaveCount(2);

      await showSection(page,6);
      const detail=page.locator('.slide.on .fm-evidence-figure.is-detail');
      await expect(detail).toHaveAttribute('data-evidence-scale','primary');
      expect(await detail.locator('img').evaluate(el=>Math.round(el.getBoundingClientRect().height))).toBeLessThanOrEqual(480);
      expect(await detail.locator('img').evaluate(el=>getComputedStyle(el).objectFit)).toBe('contain');
      await expect(page.locator('.btn-prev')).toHaveAttribute('data-nav-label','이전 · 추천');
      await expect(page.locator('.btn-next')).toHaveAttribute('data-nav-label','다음 · 로그인·참가');

      await showSection(page,8);
      const operations=page.locator('.slide.on .fm-evidence-figure.is-operations');
      await expect(operations).toHaveAttribute('data-evidence-scale','primary');
      expect(await operations.locator('img').evaluate(el=>Math.round(el.getBoundingClientRect().height))).toBeLessThanOrEqual(480);
      expect(await operations.locator('img').evaluate(el=>getComputedStyle(el).objectFit)).toBe('contain');
    }else{
      const padding=await page.locator('.slide.on').evaluate(slide=>parseFloat(getComputedStyle(slide).paddingTop));
      expect(padding).toBe(48);
    }

    await page.locator('.slide.on').screenshot({path:`test-results/case-study-advanced-polish-${name}.png`});
    await noHorizontalOverflow(page);
  });
}
