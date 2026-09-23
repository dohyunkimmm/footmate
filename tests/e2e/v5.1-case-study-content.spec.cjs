const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport={width:1440,height:900}){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.documentElement.dataset.footmateCaseStudySections==='13');
}

async function visibleSlides(page){
  return page.locator('.slide:not([hidden])');
}

async function slideText(page,index){
  return (await visibleSlides(page)).nth(index).innerText();
}

test('Case Study exposes 13 concise sections with English navigation and English subcopy',async({page})=>{
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
    'AI Match Assistant','Slow Match Decisions','Confidence After Work','One Continuous Decision Flow',
    'Value Before Account','Memory-Assisted Discovery','Decision-Centered Detail','Preserve Context Through Participation',
    'From Check-in to Next Match','Preserve Context, Offer Next Action','Ownership, Providers, and Guardrails',
    'Automated, Human, and AI-Assisted QA','Only Connected and Verified Capabilities'
  ]);
});

test('merged sections keep one clear job without exposing route strings as reader labels',async({page})=>{
  await openCaseStudy(page);

  const thesis=await slideText(page,3);
  expect(thesis).toContain('탐색');
  expect(thesis).toContain('판단 기준을 한곳에');
  expect(thesis).toContain('선택 맥락을 보존');

  const signInJoin=await slideText(page,7);
  expect(signInJoin).toContain('로그인 전 선택을 잃지 않고 참가 상태까지');
  expect(signInJoin).toContain('Real App');
  expect(signInJoin).toContain('Closed Beta');
  expect(signInJoin).toContain('완료 | 실패 | 취소');

  const domain=await slideText(page,10);
  expect(domain).toContain('상태 소유권과 외부 연동, AI 권한');
  expect(domain).toContain('결정론적 추천 엔진');
  expect(domain).toContain('HITL');
  expect(domain).toContain('실제 PG와 외부 분석 도구는 미연동');

  const production=await slideText(page,12);
  expect(production).toContain('Production 범위');
  expect(production).toContain('Real App');
  expect(production).toContain('Closed Beta');
  expect(production).toContain('실제 PG · 외부 분석 도구');

  const readerText=await page.locator('.fm-cs-shell').innerText();
  expect(readerText).not.toMatch(/(^|\s)\/app\b/);
  expect(readerText).not.toMatch(/(^|\s)\/beta\b/);
});

test('story sections use one top-aligned layout and fit the 1440x900 review surface',async({page})=>{
  await openCaseStudy(page,{width:1440,height:900});

  for(let index=1;index<13;index+=1){
    await page.evaluate(i=>window.goTo(i),index);
    const geometry=await page.locator('.slide.on .fm-next-story').evaluate(story=>{
      const rect=story.getBoundingClientRect();
      const copy=story.querySelector('.fm-next-story-copy')?.getBoundingClientRect();
      const aside=story.querySelector('.fm-next-story-aside')?.getBoundingClientRect();
      return {
        top:rect.top,
        bottom:rect.bottom,
        width:rect.width,
        copyLeft:copy?.left||0,
        copyWidth:copy?.width||0,
        asideLeft:aside?.left||0,
        overflow:story.scrollHeight-story.clientHeight
      };
    });
    expect(geometry.top).toBeGreaterThanOrEqual(90);
    expect(geometry.top).toBeLessThanOrEqual(125);
    expect(geometry.bottom).toBeLessThanOrEqual(850);
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

test('reader-facing body copy is Korean-first while preserving necessary technical terms',async({page})=>{
  await openCaseStudy(page);

  const cover=await slideText(page,0);
  expect(cover).not.toContain('deterministic ranking');
  expect(cover).toContain('추천 순위 계산');

  const provider=await slideText(page,10);
  expect(provider).not.toContain('sample records');
  expect(provider).not.toContain('connected data path');
  expect(provider).toContain('결정론적 추천 엔진');

  const validation=await slideText(page,11);
  expect(validation).toContain('사람 검수');
  expect(validation).toContain('AI 보조 검수');
  expect(validation).toContain('PASS 판정을 대신하지 않습니다');
});
