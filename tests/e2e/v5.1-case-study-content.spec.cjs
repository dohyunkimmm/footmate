const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');

async function openCaseStudy(page,viewport={width:1440,height:900}){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>
    document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&
    document.documentElement.dataset.footmateCaseStudySections==='13'&&
    document.documentElement.dataset.footmateCaseStudySectionLabelLanguage==='en'&&
    document.documentElement.dataset.footmateCaseStudyReaderPolish==='2'
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
  expect(html).toContain('/src/v5/case-study-heading-polish.js?v=517');
  expect(html).not.toContain('<span class="topbar-count">01 / 16</span>');
  expect(html).not.toContain('<span class="toc-n">14</span>');
  expect(html).not.toContain('<span class="toc-n">15</span>');
  expect(html).not.toContain('<span class="toc-n">16</span>');
});

test('Case Study exposes 13 concise sections with the approved navigation copy',async({page})=>{
  await openCaseStudy(page);

  await expect(page.locator('.toc-item:not([hidden])')).toHaveCount(13);
  await expect(await visibleSlides(page)).toHaveCount(13);
  await expect(page.locator('.topbar-count')).toHaveText('01 / 13');

  const navTitles=await page.locator('.toc-item:not([hidden]) .toc-t').allTextContents();
  expect(navTitles).toEqual([
    'Overview','Problem & Goal','Persona · JTBD','Scope & Priority','Guest First','Recommendation','Decision Detail',
    'Sign in · Join','Operations','Recovery','Domain & AI','KPI & Validation','Release & Learnings'
  ]);

  const navSubcopy=await page.locator('.toc-item:not([hidden]) .toc-s').allTextContents();
  expect(navSubcopy).toEqual([
    'Role & Scope','Why This Problem','Who & When','Value Before Scale',
    'Value Before Account','Reasons & Memory','From Detail to Join','Context & Confirmation',
    'Matchday & Return','Preserve & Retry','Contracts & Guardrails','Metrics & Evidence','Limits & Next Steps'
  ]);

  const subcopyLayout=await page.locator('.toc-item:not([hidden]) .toc-s').evaluateAll(items=>items.map(item=>{
    const style=getComputedStyle(item);
    const lineHeight=parseFloat(style.lineHeight);
    const height=item.getBoundingClientRect().height;
    return {
      lines:Math.round(height/lineHeight),
      clippedX:item.scrollWidth-item.clientWidth,
      clippedY:item.scrollHeight-item.clientHeight,
      whiteSpace:style.whiteSpace
    };
  }));
  expect(subcopyLayout.every(item=>item.lines===1)).toBe(true);
  expect(subcopyLayout.every(item=>item.clippedX<=1&&item.clippedY<=1)).toBe(true);
  expect(subcopyLayout.every(item=>item.whiteSpace==='nowrap')).toBe(true);

  const sidebarStyle=await page.locator('.sidebar').evaluate(node=>({
    overflowY:getComputedStyle(node).overflowY,
    scrollbarWidth:getComputedStyle(node).scrollbarWidth
  }));
  expect(['auto','scroll']).toContain(sidebarStyle.overflowY);
  expect(sidebarStyle.scrollbarWidth).toBe('none');
});

test('section labels are English while story headings and supporting body copy remain Korean-first',async({page})=>{
  await openCaseStudy(page);
  await expect(page.locator('html')).toHaveAttribute('data-footmate-case-study-section-label-language','en');
  await expect(page.locator('html')).toHaveAttribute('data-footmate-case-study-heading-language','ko');

  const labels=await page.locator('.slide:not([hidden]) .fm-next-story-kicker').allTextContents();
  expect(labels).toEqual([
    '02 · Problem & Goal',
    '03 · Persona · JTBD',
    '04 · Scope & Priority',
    '05 · Guest First',
    '06 · Recommendation',
    '07 · Decision Detail',
    '08 · Sign in · Join',
    '09 · Operations',
    '10 · Recovery',
    '11 · Domain & AI',
    '12 · KPI & Validation',
    '13 · Release & Learnings'
  ]);

  const headings=await page.locator('.slide:not([hidden]) .fm-next-story h2').allTextContents();
  expect(headings).toHaveLength(12);
  expect(headings.every(title=>/[가-힣]/.test(title))).toBe(true);
  const leads=await page.locator('.slide:not([hidden]) .fm-next-story-lead').allTextContents();
  expect(leads.join('\n')).toMatch(/[가-힣]/);
});

test('merged sections keep one clear job without exposing route strings as reader labels',async({page})=>{
  await openCaseStudy(page);

  const thesis=await slideText(page,3);
  expect(thesis).toContain('판단 기준 통합');
  expect(thesis).toContain('선택 맥락 보존');

  const signInJoin=await slideText(page,7);
  expect(signInJoin).toContain('Real App');
  expect(signInJoin).toContain('Closed Beta');
  expect(signInJoin).toContain('완료 | 실패 | 취소');

  const domain=await slideText(page,10);
  expect(domain).toContain('결정론적 추천 엔진');
  expect(domain).toContain('HITL');
  expect(domain).toContain('실제 PG · 외부 분석 도구 미연동');

  const production=await slideText(page,12);
  expect(production).toContain('Real App');
  expect(production).toContain('Closed Beta');
  expect(production).toContain('실제 PG · 외부 분석 도구');

  const readerText=await page.locator('.fm-cs-shell').innerText();
  expect(readerText).not.toMatch(/(^|\s)\/app\b/);
  expect(readerText).not.toMatch(/(^|\s)\/beta\b/);
});

test('System Evidence, Validation, and Outcome Limits remain represented after the 13-section merge',async({page})=>{
  await openCaseStudy(page);

  const systemEvidence=await slideText(page,10);
  expect(systemEvidence).toContain('추천 소유권');
  expect(systemEvidence).toContain('PARTICIPATION · MATCHDAY · RETURN');
  expect(systemEvidence).toContain('AI · PROVIDERS · HITL');
  expect(systemEvidence).toContain('Vercel AI Gateway');
  expect(systemEvidence).toContain('Supabase');

  const validation=await slideText(page,11);
  expect(validation).toContain('자동 QA');
  expect(validation).toContain('사람 검수');
  expect(validation).toContain('AI 보조 검수');
  expect(validation).toContain('Visual Regression');
  expect(validation).toContain('Production Smoke');

  const outcomeLimits=await slideText(page,12);
  expect(outcomeLimits).toContain('Real App');
  expect(outcomeLimits).toContain('Closed Beta');
  expect(outcomeLimits).toContain('미연동 범위');
  expect(outcomeLimits).toContain('실제 PG · 외부 분석 도구');
  expect(outcomeLimits).toContain('Production 기준');
});

test('story sections preserve centered desktop rhythm and fit the 1440x900 review surface',async({page})=>{
  await openCaseStudy(page,{width:1440,height:900});

  for(let index=1;index<13;index+=1){
    await page.evaluate(i=>window.goTo(i),index);
    const geometry=await page.locator('.slide.on').evaluate(slide=>{
      const story=slide.querySelector('.fm-next-story');
      const rect=story.getBoundingClientRect();
      const copy=story.querySelector('.fm-next-story-copy')?.getBoundingClientRect();
      const aside=story.querySelector('.fm-next-story-aside')?.getBoundingClientRect();
      const style=getComputedStyle(slide);
      return {
        alignItems:style.alignItems,
        paddingTop:parseFloat(style.paddingTop),
        paddingBottom:parseFloat(style.paddingBottom),
        bottom:rect.bottom,
        width:rect.width,
        copyLeft:copy?.left||0,
        copyWidth:copy?.width||0,
        asideLeft:aside?.left||0,
        overflow:story.scrollHeight-story.clientHeight
      };
    });
    expect(geometry.alignItems).toBe('center');
    expect(geometry.paddingTop).not.toBe(38);
    expect(geometry.paddingBottom).not.toBe(38);
    expect(geometry.bottom).toBeLessThanOrEqual(835);
    expect(geometry.width).toBeGreaterThan(900);
    expect(geometry.copyWidth).toBeGreaterThan(900);
    if(geometry.asideLeft)expect(Math.abs(geometry.asideLeft-geometry.copyLeft)).toBeLessThanOrEqual(1);
    expect(geometry.overflow).toBeLessThanOrEqual(2);
  }
});

test('Case Study cover uses a static preview and one Product CTA',async({page})=>{
  await openCaseStudy(page);
  await expect(page.locator('.fm-next-cover-frame iframe')).toHaveCount(0);
  await expect(page.locator('.fm-next-cover-frame-meta')).toHaveCount(0);
  await expect(page.locator('.fm-cs-static-preview')).toBeVisible();
  await expect(page.locator('.fm-cs-ai-preview')).toContainText('AI Match Assistant');
  await expect(page.locator('.fm-cs-ai-preview')).toContainText('원하는 경기를 문장으로 검색하세요.');
  await expect(page.locator('.fm-cs-ai-preview')).toContainText('AI 검색');
  await expect(page.locator('.fm-next-cover-note')).toContainText('정적 AI 검색 프리뷰');
  await expect(page.locator('.fm-next-cover-visual')).not.toContainText('Live interaction');
  await expect(page.locator('.fm-next-cover-visual')).not.toContainText('추천 상세');
  const cta=page.locator('.fm-next-cover-actions a');
  await expect(cta).toHaveCount(1);
  await expect(cta).toContainText('제품 직접 체험하기');
  await expect(cta).toHaveAttribute('href','/demo');
});

test('arrow keys work immediately on first load without an embedded product frame',async({page})=>{
  await openCaseStudy(page);
  await expect(page.locator('.topbar-count')).toHaveText('01 / 13');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.topbar-count')).toHaveText('02 / 13');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.topbar-count')).toHaveText('01 / 13');
});

test('reader-facing body copy is Korean-first while preserving necessary technical terms',async({page})=>{
  await openCaseStudy(page);

  await expect(page.locator('html')).toHaveAttribute('lang','ko');
  const bodyText=(await page.locator('.slide:not([hidden])').allInnerTexts()).join('\n');
  expect(bodyText).toMatch(/[가-힣]/);

  const cover=await slideText(page,0);
  expect(cover).not.toContain('deterministic ranking');
  expect(cover).toContain('실제 연동과 시뮬레이션 구분');

  const provider=await slideText(page,10);
  expect(provider).not.toContain('sample records');
  expect(provider).not.toContain('connected data path');
  expect(provider).toContain('결정론적 추천 엔진');

  const validation=await slideText(page,11);
  expect(validation).toContain('사람 검수');
  expect(validation).toContain('AI 보조 검수');
  expect(validation).toContain('자동 QA · 사람 검수 PASS 대체 아님');
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

// Portfolio claims must distinguish planning hypotheses from observed outcomes.
test('service planning evidence distinguishes ownership, hypotheses, metrics and outcomes',async({page})=>{
  await openCaseStudy(page);
  const cover=await slideText(page,0);
  for(const value of ['Role','Scope','Responsibility','IT Service Planner'])expect(cover).toContain(value);
  expect(await slideText(page,1)).toContain('문제 가설');
  expect(await slideText(page,2)).toContain('설계용 Persona');
  const priority=await slideText(page,3);
  for(const value of ['우선순위 기준','무료 Beta','수익화 검증','HITL'])expect(priority).toContain(value);
  expect(await slideText(page,4)).toContain('Trade-off');
  expect(await slideText(page,8)).toContain('audit trail');
  expect(await slideText(page,10)).toContain('실제 연결');
  expect(await slideText(page,10)).toContain('정의한 기준');
  const metrics=await slideText(page,11);
  for(const value of ['Validation Metric','Measured Result가 아닙니다','상세 조회 사용자','7일 내 재탐색','외부 분석 도구 미연동'])expect(metrics).toContain(value);
  expect(await slideText(page,12)).toContain('KPI Baseline 확보 후 측정');
});

test('reader-facing cleanup removes internal jargon and legacy review exits',async({page})=>{
  await openCaseStudy(page);
  const slides=await visibleSlides(page);
  const allText=(await slides.allInnerTexts()).join('\n');
  expect(allText).not.toContain('PBL');
  expect(allText).toContain('같은 교육과정을 수강한 교육생 6명');
  await expect(slides.nth(7).locator('.fm-next-cs-state-line')).toHaveCount(0);
  await expect(slides.nth(7)).toContainText('상태 보존');
  await expect(slides.nth(8).locator('.fm-next-cs-link')).toHaveCount(0);
  expect(await slides.nth(11).innerText()).not.toMatch(/분자|분모/);
  await expect(slides.nth(11)).toContainText('계산 기준 · 상세 진입 세션 ÷ 결과 노출 세션');
});

test('mobile static preview caption stays below the frame without clipping',async({page})=>{
  for(const width of [320,375,390,430]){
    await openCaseStudy(page,{width,height:844});
    const geometry=await page.evaluate(()=>{
      const frame=document.querySelector('.fm-next-cover-frame').getBoundingClientRect();
      const note=document.querySelector('.fm-next-cover-note');
      const caption=note.getBoundingClientRect();
      return {gap:caption.top-frame.bottom,clippedX:note.scrollWidth-note.clientWidth,clippedY:note.scrollHeight-note.clientHeight,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    });
    expect(geometry.gap,`preview caption gap at ${width}px`).toBeGreaterThanOrEqual(12);
    expect(geometry.clippedX,`preview caption horizontal clip at ${width}px`).toBeLessThanOrEqual(1);
    expect(geometry.clippedY,`preview caption vertical clip at ${width}px`).toBeLessThanOrEqual(1);
    expect(geometry.overflow,`page overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
});