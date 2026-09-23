const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');

async function openCaseStudy(page,viewport={width:1440,height:900}){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>
    document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&
    document.documentElement.dataset.footmateCaseStudySections==='13'&&
    document.documentElement.dataset.footmateCaseStudyLanguage==='en'
  );
}

async function visibleSlides(page){
  return page.locator('.slide:not([hidden])');
}

async function slideText(page,index){
  return (await visibleSlides(page)).nth(index).innerText();
}

test('static Case Study shell exposes 13 navigation items before runtime patching',()=>{
  const html=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8');
  const tocItems=html.match(/class="toc-item(?: [^"]*)?"/g)||[];
  const dots=html.match(/class="dot(?: [^"]*)?"/g)||[];
  const hiddenSourceSlides=html.match(/<section class="slide" hidden data-cs-hidden="true" aria-hidden="true"><\/section>/g)||[];

  expect(tocItems).toHaveLength(13);
  expect(dots).toHaveLength(13);
  expect(hiddenSourceSlides).toHaveLength(3);
  expect(html).toContain('AI-assisted discovery · 13 sections');
  expect(html).toContain('<span class="topbar-count">01 / 13</span>');
  expect(html).not.toContain('<span class="topbar-count">01 / 16</span>');
  expect(html).not.toContain('<span class="toc-n">14</span>');
  expect(html).not.toContain('<span class="toc-n">15</span>');
  expect(html).not.toContain('<span class="toc-n">16</span>');
});

test('Case Study exposes 13 concise sections with English navigation and one-line English subcopy',async({page})=>{
  await openCaseStudy(page);

  await expect(page.locator('.toc-item:not([hidden])')).toHaveCount(13);
  await expect(await visibleSlides(page)).toHaveCount(13);
  await expect(page.locator('.topbar-count')).toHaveText('01 / 13');

  const navTitles=await page.locator('.toc-item:not([hidden]) .toc-t').allTextContents();
  expect(navTitles).toEqual([
    'Overview','Problem','Persona · JTBD','Product Thesis','Decision 01','Decision 02','Decision 03',
    'Sign in · Join','Matchday · Return','Recovery','Domain · AI Boundary','Validation','Production Boundary'
  ]);

  const navSubcopy=await page.locator('.toc-item:not([hidden]) .toc-s').allTextContents();
  expect(navSubcopy).toEqual([
    'AI Match Assistant','Faster Match Decisions','After-Work Confidence','Continuous Decision Flow',
    'Value Before Account','Remembered Preferences','Decision-Centered Detail','Context Through Join',
    'Check-in to Next Match','Preserve, Then Recover','Ownership & Guardrails',
    'Automated · Human · AI QA','Connected & Verified'
  ]);

  const lineCounts=await page.locator('.toc-item:not([hidden]) .toc-s').evaluateAll(items=>items.map(item=>{
    const range=document.createRange();
    range.selectNodeContents(item);
    return range.getClientRects().length;
  }));
  expect(lineCounts.every(count=>count===1)).toBe(true);

  const sidebarStyle=await page.locator('.sidebar').evaluate(node=>({
    overflowY:getComputedStyle(node).overflowY,
    scrollbarWidth:getComputedStyle(node).scrollbarWidth
  }));
  expect(['auto','scroll']).toContain(sidebarStyle.overflowY);
  expect(sidebarStyle.scrollbarWidth).toBe('none');
});

test('merged sections keep one clear job without exposing route strings as reader labels',async({page})=>{
  await openCaseStudy(page);

  const thesis=await slideText(page,3);
  expect(thesis).toContain('continuous decision flow');
  expect(thesis).toContain('Bring Decision Criteria Together');
  expect(thesis).toContain('Preserve Selection Context');

  const signInJoin=await slideText(page,7);
  expect(signInJoin).toContain('Preserve the chosen match through authentication and participation');
  expect(signInJoin).toContain('Real App');
  expect(signInJoin).toContain('Closed Beta');
  expect(signInJoin).toContain('Success | Failure | Cancel');

  const domain=await slideText(page,10);
  expect(domain).toContain('Separate state ownership, provider boundaries, and AI authority');
  expect(domain).toContain('deterministic recommendation engine');
  expect(domain).toContain('HITL');
  expect(domain).toContain('Not connected: real payment gateway · external analytics');

  const production=await slideText(page,12);
  expect(production).toContain('Production Boundary');
  expect(production).toContain('Real App');
  expect(production).toContain('Closed Beta');
  expect(production).toContain('Real payment gateway · external analytics');

  const readerText=await page.locator('.fm-cs-shell').innerText();
  expect(readerText).not.toMatch(/(^|\s)\/app\b/);
  expect(readerText).not.toMatch(/(^|\s)\/beta\b/);
});

test('System Evidence, Validation, and Outcome Limits remain represented after the 13-section merge',async({page})=>{
  await openCaseStudy(page);

  const systemEvidence=await slideText(page,10);
  expect(systemEvidence).toContain('Ranking Ownership');
  expect(systemEvidence).toContain('Participation · Matchday · Return');
  expect(systemEvidence).toContain('AI · Providers · HITL');
  expect(systemEvidence).toContain('Vercel AI Gateway');
  expect(systemEvidence).toContain('Supabase');

  const validation=await slideText(page,11);
  expect(validation).toContain('Automated QA');
  expect(validation).toContain('Human QA');
  expect(validation).toContain('AI-Assisted QA');
  expect(validation).toContain('Visual Regression');
  expect(validation).toContain('Production Smoke');

  const outcomeLimits=await slideText(page,12);
  expect(outcomeLimits).toContain('Real App');
  expect(outcomeLimits).toContain('Closed Beta');
  expect(outcomeLimits).toContain('Not Connected');
  expect(outcomeLimits).toContain('Real payment gateway · external analytics');
  expect(outcomeLimits).toContain('Production Standard');
});

test('story sections stay vertically centered and fit the 1440x900 review surface',async({page})=>{
  await openCaseStudy(page,{width:1440,height:900});

  for(let index=1;index<13;index+=1){
    await page.evaluate(i=>window.goTo(i),index);
    const geometry=await page.locator('.slide.on .fm-next-story').evaluate(story=>{
      const rect=story.getBoundingClientRect();
      const slide=story.closest('.slide')?.getBoundingClientRect();
      const copy=story.querySelector('.fm-next-story-copy')?.getBoundingClientRect();
      const aside=story.querySelector('.fm-next-story-aside')?.getBoundingClientRect();
      return {
        top:rect.top,
        bottom:rect.bottom,
        width:rect.width,
        copyLeft:copy?.left||0,
        copyWidth:copy?.width||0,
        asideLeft:aside?.left||0,
        centerDelta:slide?Math.abs((rect.top+rect.bottom)/2-(slide.top+slide.bottom)/2):999,
        overflow:story.scrollHeight-story.clientHeight
      };
    });
    expect(geometry.top).toBeGreaterThanOrEqual(140);
    expect(geometry.bottom).toBeLessThanOrEqual(760);
    expect(geometry.centerDelta).toBeLessThanOrEqual(20);
    expect(geometry.width).toBeGreaterThan(900);
    expect(geometry.copyWidth).toBeGreaterThan(900);
    if(geometry.asideLeft)expect(Math.abs(geometry.asideLeft-geometry.copyLeft)).toBeLessThanOrEqual(1);
    expect(geometry.overflow).toBeLessThanOrEqual(2);
  }
});

test('arrow keys work immediately on first load and while the embedded app has focus',async({page})=>{
  await openCaseStudy(page);
  await expect(page.locator('.topbar-count')).toHaveText('01 / 13');

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.topbar-count')).toHaveText('02 / 13');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.topbar-count')).toHaveText('01 / 13');

  const frame=page.locator('.fm-next-cover-frame iframe');
  await frame.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.topbar-count')).toHaveText('02 / 13');
});

test('reader-facing body copy uses one English display language while preserving technical terms',async({page})=>{
  await openCaseStudy(page);

  const bodyText=(await page.locator('.slide:not([hidden])').allInnerTexts()).join('\n');
  expect(bodyText).not.toMatch(/[가-힣]/);
  await expect(page.locator('html')).toHaveAttribute('lang','en');

  const cover=await slideText(page,0);
  expect(cover).toContain('deterministic ranking');
  await expect(page.locator('.fm-next-cover-frame-meta')).toHaveText('Live Interaction');
  const liveInteractionColor=await page.locator('.fm-next-cover-frame-meta').evaluate(node=>getComputedStyle(node).color);
  expect(liveInteractionColor).toBe('rgb(60, 64, 67)');

  const provider=await slideText(page,10);
  expect(provider).toContain('deterministic recommendation engine');
  expect(provider).toContain('Vercel AI Gateway');
  const p11Labels=await page.locator('.slide:not([hidden])').nth(10).locator('.fm-next-cs-modes small').allTextContents();
  expect(p11Labels).toEqual(['Recommendation','Participation · Matchday · Return','AI · Providers · HITL']);

  const validation=await slideText(page,11);
  expect(validation).toContain('Human QA');
  expect(validation).toContain('AI-assisted review');
  expect(validation).toContain('without deciding PASS');
});

test('merged source slides can never render as extra pages after P13',async({page})=>{
  await openCaseStudy(page,{width:390,height:844});
  const hidden=page.locator('.slide[data-cs-hidden="true"]');
  await expect(hidden).toHaveCount(3);
  const states=await hidden.evaluateAll(nodes=>nodes.map(node=>({
    display:getComputedStyle(node).display,
    hidden:node.hidden,
    ariaHidden:node.getAttribute('aria-hidden')
  })));
  for(const state of states){
    expect(state.display).toBe('none');
    expect(state.hidden).toBe(true);
    expect(state.ariaHidden).toBe('true');
  }
  await page.evaluate(()=>window.goTo(99));
  await expect(page.locator('.topbar-count')).toHaveText('13 / 13');
  await expect(page.locator('.slide.on')).toHaveCount(1);
  await expect(page.locator('.slide.on')).toHaveAttribute('data-v5-content-role','production-boundary');
});