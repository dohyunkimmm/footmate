const {test,expect}=require('@playwright/test');

async function openCaseStudy(page){
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>
    document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&
    document.documentElement.dataset.footmateCaseStudySections==='13'&&
    document.documentElement.dataset.footmateCaseStudyStructuredCopy==='3'&&
    document.documentElement.dataset.footmateCaseStudyFinalClarity==='1'&&
    document.documentElement.dataset.footmateCaseStudyRepetitionPolish==='1'&&
    document.querySelectorAll('.slide:not([hidden])').length===13
  );
}

function visibleSlide(page,index){return page.locator('.slide:not([hidden])').nth(index);}

async function rowValue(slide,label){
  const rows=slide.locator('.fm-cs-reasons>div');
  const count=await rows.count();
  for(let index=0;index<count;index+=1){
    const row=rows.nth(index);
    if((await row.locator('dt').innerText()).trim()===label)return (await row.locator('dd').innerText()).trim();
  }
  throw new Error(`Missing Case Study row: ${label}`);
}

function hasSentencePunctuation(value){return /[.!?。]\s*$/.test(value.trim());}
function occurrenceCount(value,term){return value.split(term).length-1;}

test('02–13 tables, flows and cards use compact phrase grammar',async({page})=>{
  await openCaseStudy(page);

  expect(await rowValue(visibleSlide(page,1),'검증 범위')).toBe('설계 가설 · 사용자 조사·경쟁사 우위 미입증 · Beta 확인');

  const personaSlide=visibleSlide(page,2);
  await expect(personaSlide.locator('.fm-next-cs-persona')).toHaveCount(0);
  const personaSummary=personaSlide.locator('.fm-next-review-summary>div');
  expect((await personaSummary.locator('span').allTextContents()).map(value=>value.trim())).toEqual(['가정','요구사항','검증 방식']);
  expect((await personaSummary.locator('b').allTextContents()).map(value=>value.trim())).toEqual([
    '평일 저녁 · 30분 안쪽 이동',
    '시간 · 거리 · 레벨 · 포지션',
    '행동 과업 · iOS · Android'
  ]);
  await expect(personaSlide).not.toContainText('교육생 6명');
  await expect(personaSlide.locator('.fm-next-cs-jtbd small')).toHaveText('검증 흐름 · 가설 → 과업 → 관찰');
  await expect(personaSlide.locator('.fm-next-cs-jtbd p')).toHaveText('가설 · 맞는 이유 빠른 이해 → 실행 · 회원가입 전·Kakao·Google·이메일 가입 → 관찰 · 동선별 버그·막힘');

  const priorityValues=await visibleSlide(page,3).locator('.fm-next-cs-principles .fm-next-cs-card p').allTextContents();
  expect(priorityValues.map(value=>value.trim())).toEqual([
    '판단 기준을 한곳에 · 선택 맥락을 보존 · 무료 Beta · 인증·정원·취소·체크인·복구',
    '대기열·알림·경기 후 피드백 → 자리 회복·재이용 · 후속 지표 · 전환·반복 이용',
    '실제 PG 유보 · 수익화 검증 제외 · AI 자동 실행 제외 · 사용자 최종 확인(HITL)'
  ]);

  expect(await rowValue(visibleSlide(page,4),'인증 시점')).toBe('참가 요청 직전');
  expect(await rowValue(visibleSlide(page,4),'Trade-off')).toBe('계정 기반 개인화 · 기기 간 연속성 제한');

  expect(await rowValue(visibleSlide(page,5),'판단 책임')).toBe('후보·순위·이유 → 결정론적 추천 엔진');
  expect(await rowValue(visibleSlide(page,5),'사용자 제어')).toBe('현재 조건 수정 · 재탐색 허용');

  await expect(visibleSlide(page,6).locator('.fm-next-cs-sticky')).toHaveCount(0);

  expect(await rowValue(visibleSlide(page,7),'Real App')).toBe('인증 · 결제 UX 시뮬레이션');
  expect(await rowValue(visibleSlide(page,7),'Closed Beta')).toBe('Supabase 계정 · 참가 실연동');
  expect(await rowValue(visibleSlide(page,7),'검증 범위')).toBe('Google/Kakao OAuth Production 확인 · 실제 PG 미연동');
  await expect(visibleSlide(page,7)).toContainText('상태 보존');

  const recovery=visibleSlide(page,9);
  await expect(recovery).not.toContainText('보존');
  expect((await recovery.locator('.fm-next-cs-recovery>div span').allTextContents()).map(value=>value.trim())).toEqual([
    '입력한 탐색 조건 → 지역·시간 수정 또는 조건 완화',
    '선택 경기 · 포지션 → 대기 등록 또는 비슷한 경기 탐색',
    '선택 경기 · 참가 의도 → 재시도 또는 결제수단 변경',
    '참가 · 체크인 상태 → 체크인 재시도 또는 운영 도움'
  ]);

  await expect(visibleSlide(page,10).locator('.fm-next-story h2')).toHaveText('추천·상태·실행의 소유권을 분리했습니다.');
  await expect(visibleSlide(page,10).locator('.fm-next-story-lead')).toHaveText('AI는 조건 해석만 맡고, 판단과 참가·결제의 책임을 분리했습니다.');
  expect((await visibleSlide(page,10).locator('.fm-next-review-summary>div b').allTextContents()).map(value=>value.trim())).toEqual([
    'AI · 자연어 조건',
    '엔진 · 후보·순위·이유',
    '사용자 확인 · 참가·결제'
  ]);
  await expect(visibleSlide(page,10).locator('.fm-next-cs-modes>div').first().locator('p')).toHaveText('후보 · 순위 · 이유 → 결정론적 추천 엔진 · 해석 실패 → fallback 탐색');
  expect(await rowValue(visibleSlide(page,10),'실제 연결')).toBe('Vercel AI Gateway · Supabase · Resend · Web Push · Storage');
  expect(await rowValue(visibleSlide(page,10),'미연동')).toBe('실제 PG · 외부 분석 도구');
  expect(await rowValue(visibleSlide(page,10),'정의한 기준')).toBe('API·데이터·권한·오류·재시도 · IA·상태별 화면·CTA · 취소·정원·복구 정책');

  const validation=visibleSlide(page,11);
  const qaCards=validation.locator('.fm-next-cs-grid.three .fm-next-cs-card');
  await expect(qaCards.nth(1).locator('p')).toHaveText('실제 OAuth 로그인 · 이메일 최종 전달 · Web Push 브라우저·OS 표시 · 제품 성과와 분리 · 사용자 만족도·전환');
  await expect(qaCards.nth(2).locator('p')).toHaveText('중복 · 용어 · 구현-설명 불일치 검토 · PASS 판정 제외');
  expect(await rowValue(validation,'추가 지표')).toBe('결과 없음 · 참가 실패 · 체크인 완료 · AI 검색 사용률');
  expect(await rowValue(validation,'측정 조건')).toBe('외부 분석 도구 미연동 · 운영·테스트·시뮬레이션 제외 · 표본·기간·기준값 우선 확보');
  expect((await validation.locator('.fm-next-cs-metric .fm-cs-ratio').allTextContents()).map(value=>value.trim())).toEqual([
    '계산 기준 · 상세 진입 세션 ÷ 결과 노출 세션',
    '참가 완료 사용자 ÷ 상세 조회 사용자',
    '복구 완료 흐름 ÷ 복구 가능 실패 흐름',
    '7일 내 재탐색 사용자 ÷ 7일 관찰 완료 참가 사용자'
  ]);
  await expect(validation.locator('.fm-next-kpi-table>div').last().locator('dd').nth(1)).toHaveText('connected-ai와 rules-fallback 분리 · 사용률과 품질 판단 분리');

  const release=visibleSlide(page,12);
  await expect(release.locator('.fm-next-story h2')).toHaveText('구현 결과와 다음 과제를 정리했습니다.');
  await expect(release.locator('.fm-next-story-lead')).toHaveText('연결 범위와 사용자 확인을 마쳤고, 실제 이용자 KPI·결제·수익성은 후속 검증으로 남겼습니다.');
  const releaseSummary=release.locator('.fm-next-review-summary>div');
  expect((await releaseSummary.locator('span').allTextContents()).map(value=>value.trim())).toEqual(['구현','검증','다음 단계']);
  expect((await releaseSummary.locator('b').allTextContents()).map(value=>value.trim())).toEqual([
    'AI · Supabase · Resend · Push',
    '행동 과업 · iOS · Android',
    '실제 결제 · 이용자 KPI · 수익성'
  ]);
  await expect(release.locator('.fm-next-cs-outcomes')).toHaveCount(0);
  await expect(release.locator('.fm-next-cs-final')).toHaveCount(0);
  await expect(release).not.toContainText('교육생 6명');
  await expect(release).not.toContainText('검증 표본');
  await expect(release).not.toContainText('과업 범위');
  await expect(release).not.toContainText('Production QA');
  await expect(release).not.toContainText('Real App');
  await expect(release).not.toContainText('Closed Beta');
});

test('02–13 avoid excessive same-word repetition inside one page',async({page})=>{
  await openCaseStudy(page);
  const limits=[
    [1,'참가',2],[1,'탐색',2],
    [2,'과업',3],
    [3,'참가',2],
    [4,'추천',3],[4,'로그인',2],
    [5,'추천',3],
    [6,'참가',2],[6,'취소',2],
    [7,'인증',2],[7,'로그인',2],
    [8,'경기',2],
    [9,'보존',0],[9,'다음',2],
    [10,'결정론적',1],[10,'추천',3],
    [11,'계산 기준',1],
    [12,'검증',2]
  ];
  for(const [index,term,max] of limits){
    const text=await visibleSlide(page,index).innerText();
    expect(occurrenceCount(text,term),`P${String(index+1).padStart(2,'0')} ${term}`).toBeLessThanOrEqual(max);
  }
});

test('structured values do not regress to sentence punctuation',async({page})=>{
  await openCaseStudy(page);
  const selector=[
    '.fm-next-review-summary b',
    '.fm-next-cs-card p',
    '.fm-next-cs-stack p',
    '.fm-next-cs-reco-card span','.fm-next-cs-reco-card h3','.fm-next-cs-reco-card div b','.fm-next-cs-reco-card strong',
    '.fm-next-cs-decision>span','.fm-next-cs-decision>b',
    '.fm-next-cs-final>span',
    '.fm-next-cs-persona b',
    '.fm-next-cs-jtbd p',
    '.fm-next-cs-loop b','.fm-next-cs-loop span',
    '.fm-next-cs-before-after small','.fm-next-cs-before-after b','.fm-next-cs-before-after p',
    '.fm-next-cs-auth-flow small','.fm-next-cs-auth-flow b',
    '.fm-next-cs-detail-order span',
    '.fm-next-cs-modes small','.fm-next-cs-modes h3','.fm-next-cs-modes p',
    '.fm-next-cs-day-states small','.fm-next-cs-day-states b','.fm-next-cs-day-states p',
    '.fm-next-cs-recovery b','.fm-next-cs-recovery span',
    '.fm-next-cs-outcomes b','.fm-next-cs-outcomes p',
    '.fm-cs-reasons dt','.fm-cs-reasons dd'
  ].join(',');
  const values=await page.locator(`.slide:not([hidden]) :is(${selector})`).allTextContents();
  expect(values.length).toBeGreaterThan(55);
  expect(values.filter(hasSentencePunctuation)).toEqual([]);
});

test('structured typography follows semantic levels after section 03 dedupe',async({page})=>{
  await openCaseStudy(page);

  async function uniqueSizes(selector){
    return page.locator(selector).evaluateAll(nodes=>[...new Set(nodes.map(node=>getComputedStyle(node).fontSize))]);
  }

  const labels=await uniqueSizes('.slide:not([hidden]) :is(.fm-next-review-summary span,.fm-next-cs-persona>div>span,.fm-next-cs-jtbd small,.fm-next-cs-before-after small,.fm-next-cs-auth-flow small,.fm-next-cs-modes small,.fm-next-cs-day-states small,.fm-cs-reasons dt)');
  const values=await uniqueSizes('.slide:not([hidden]) :is(.fm-next-review-summary b,.fm-next-cs-card p,.fm-next-cs-persona>div>b,.fm-next-cs-jtbd p,.fm-next-cs-loop b,.fm-next-cs-loop span,.fm-next-cs-before-after b,.fm-next-cs-before-after p,.fm-next-cs-auth-flow b,.fm-next-cs-detail-order span,.fm-next-cs-modes p,.fm-next-cs-day-states b,.fm-next-cs-day-states p,.fm-next-cs-recovery span,.fm-next-cs-outcomes p,.fm-cs-reasons dd)');
  const headings=await uniqueSizes('.slide:not([hidden]) :is(.fm-next-cs-card h3,.fm-next-cs-modes h3,.fm-next-cs-recovery>div>b,.fm-next-cs-outcomes>div>b)');

  expect(labels).toEqual(['12px']);
  expect(values).toEqual(['12px']);
  expect(headings).toEqual(['14px']);

  await expect(visibleSlide(page,2).locator('.fm-next-cs-persona')).toHaveCount(0);
});

test('12 KPI disclosure is the metric header and keeps the modal interaction',async({page})=>{
  await openCaseStudy(page);
  await page.evaluate(()=>window.goTo(11));
  await expect(page.locator('.slide.on')).toHaveAttribute('data-v5-content-role','validation-evidence');
  const validation=visibleSlide(page,11);
  const note=validation.locator('.fm-next-cs-note');
  const metrics=validation.locator('.fm-next-cs-metrics');
  const action=validation.locator('.fm-next-kpi-disclosure-row');
  const open=action.locator('.fm-next-kpi-open');
  const dialog=validation.locator('.fm-next-kpi-dialog');

  await expect(note.locator('.fm-next-kpi-open')).toHaveCount(0);
  await expect(action).toHaveCount(1);
  await expect(action.locator('.fm-next-kpi-disclosure-label')).toHaveText('KPI · Validation Metric');
  expect(await action.evaluate(node=>node.nextElementSibling?.classList.contains('fm-next-cs-metrics'))).toBe(true);
  await expect(open).toHaveText('8개 지표의 계산·관찰 기준 보기');

  await open.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.fm-next-kpi-table>div')).toHaveCount(8);
  await dialog.locator('.fm-next-kpi-close').click();
  await expect(dialog).not.toBeVisible();
});
