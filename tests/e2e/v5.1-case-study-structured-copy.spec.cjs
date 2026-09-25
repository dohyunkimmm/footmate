const {test,expect}=require('@playwright/test');

async function openCaseStudy(page){
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>
    document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&
    document.documentElement.dataset.footmateCaseStudySections==='13'&&
    document.documentElement.dataset.footmateCaseStudyStructuredCopy==='1'&&
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

test('02–13 structured cards, flows and short values use phrase grammar',async({page})=>{
  await openCaseStudy(page);

  const problemLines=await visibleSlide(page,1).locator('.fm-next-cs-grid.three .fm-next-cs-card p .fm-cs-line').allTextContents();
  expect(problemLines).toEqual([
    '시간 · 거리 · 레벨 한곳 비교','확인 지표 · 상세 진입률 · 결과 없음 비율',
    '추천 이유 · 정원 · 취소 규칙 우선 노출','확인 지표 · 참가 전환율 · 참가 실패율',
    '체크인 · 경기 후 피드백 → 다음 탐색','확인 지표 · 체크인 완료율 · 재탐색률'
  ]);
  expect(await rowValue(visibleSlide(page,1),'대안')).toBe('목록·필터 조건 비교 · 지도 위치 확인 · 커뮤니티 경기 맥락 확인');
  expect(await rowValue(visibleSlide(page,1),'선택')).toBe('조건 해석 → 추천 이유 → 참가 → 경기 당일');

  const personaLines=await visibleSlide(page,2).locator('.fm-next-cs-persona>div').first().locator('b .fm-cs-line').allTextContents();
  expect(personaLines).toEqual(['평일 저녁 · 주 1~2회','30분 안쪽 이동']);

  const priorityLines=await visibleSlide(page,3).locator('.fm-next-cs-principles .fm-next-cs-card p .fm-cs-line').allTextContents();
  expect(priorityLines).toEqual([
    '판단 기준을 한곳에 · 선택 맥락을 보존','무료 Beta에서 인증·정원·참가·취소·체크인·복구를 검증합니다.',
    '대기열 · 알림 · 경기 후 피드백 → 자리 회복 · 재탐색','참가 전환과 반복 이용 효과는 실제 이용 데이터로 확인할 과제입니다.',
    '실제 PG 유보 · 수익화 검증 제외','AI 자동 참가 제외 · 사용자 최종 확인(HITL)'
  ]);

  const guestAlternatives=await visibleSlide(page,4).locator('.fm-next-cs-before-after>div p').allTextContents();
  expect(guestAlternatives).toEqual(['가치 확인 전 계정 생성 필요','추천 확인 후 가입 여부 결정']);
  expect(await rowValue(visibleSlide(page,4),'결정')).toBe('가입 전 추천 · 상세 공개');

  expect(await rowValue(visibleSlide(page,5),'결정')).toBe('최근 선호는 추천 보조 입력으로만 사용');
  expect(await rowValue(visibleSlide(page,6),'핵심 행동')).toBe('참가하기');
  expect(await rowValue(visibleSlide(page,6),'보조 행동')).toBe('저장 · 최대 2경기 비교');

  expect(await rowValue(visibleSlide(page,7),'Real App')).toBe('인증 · 결제 시뮬레이션');
  expect(await rowValue(visibleSlide(page,7),'Closed Beta')).toBe('Supabase 인증 · 참가 실연동');
  expect(await rowValue(visibleSlide(page,7),'검증 범위')).toBe('Google/Kakao OAuth Production 실로그인 검증 · 실제 PG 미연동');

  expect(await rowValue(visibleSlide(page,8),'운영 권한')).toBe('경기 · 정원 · 취소 마감 · 체크인 · 종료 관리');
  expect(await rowValue(visibleSlide(page,8),'자리 회복')).toBe('취소 시 포지션별 대기열 FIFO 승급');
  expect(await rowValue(visibleSlide(page,8),'변경과 복구')).toBe('변경 이력(audit trail) 기록 · 알림 실패와 참가 상태 분리 복구');

  const recoveryValues=await visibleSlide(page,9).locator('.fm-next-cs-recovery .fm-cs-line').allTextContents();
  expect(recoveryValues.every(value=>!hasSentencePunctuation(value))).toBe(true);

  const aiModeLines=await visibleSlide(page,10).locator('.fm-next-cs-modes>div p .fm-cs-line').allTextContents();
  expect(aiModeLines).toEqual([
    '후보 · 순위 · 이유 → 결정론적 추천 엔진','AI 해석 실패 → fallback 탐색',
    '참가 · 체크인 · 경기 후 상태 책임 분리','동일 상태 판단 일원화',
    '경기 사실 · 가격 · 정원 · 순위 AI 생성 금지','참가 · 결제 사용자 최종 확인'
  ]);
  expect(await rowValue(visibleSlide(page,10),'미연동')).toBe('실제 PG와 외부 분석 도구는 미연동');

  const outcomes=await visibleSlide(page,12).locator('.fm-next-cs-outcomes .fm-cs-line').allTextContents();
  expect(outcomes.every(value=>!hasSentencePunctuation(value))).toBe(true);
});

test('reason, trade-off, validation and reflection explanations remain complete sentences',async({page})=>{
  await openCaseStudy(page);

  const expectedSentences=[
    '사용자 조사나 경쟁사 우위가 입증된 결론은 아니며, Beta에서 가설을 확인합니다.',
    '무료 Beta에서 인증·정원·참가·취소·체크인·복구를 검증합니다.',
    '참가 전환과 반복 이용 효과는 실제 이용 데이터로 확인할 과제입니다.',
    '참가 의도가 생기기 전에 서비스 가치를 판단할 수 있게 했습니다.',
    '로그인 전에는 계정 기반 개인화와 기기 간 연속성이 제한됩니다.',
    '과거 선호와 오늘의 의도가 다를 수 있어 조건 수정을 허용합니다.',
    '비교 대상을 제한해 결정을 돕고, 취소·환불 기준은 참가 전에 확인합니다.',
    '사용자 만족도 · 전환 성과와는 별개입니다.',
    '자동 QA와 사람 검수의 PASS 판정을 대신하지 않습니다.'
  ];

  for(const sentence of expectedSentences){
    const locator=page.getByText(sentence,{exact:true});
    await expect(locator).toHaveCount(1);
    expect(hasSentencePunctuation(await locator.innerText())).toBe(true);
  }

  const recommendationQuality=await rowValue(visibleSlide(page,5),'품질 기준');
  expect(recommendationQuality).toBe('추천 후보·순위·이유의 소유권은 결정론적 추천 엔진에 유지합니다.');
  expect(hasSentencePunctuation(recommendationQuality)).toBe(true);

  const reflections=await visibleSlide(page,12).locator('.fm-next-cs-final .fm-cs-reasons dd').allTextContents();
  expect(reflections.length).toBeGreaterThanOrEqual(2);
  expect(reflections.every(hasSentencePunctuation)).toBe(true);
});

test('phrase-only structured components do not regress to sentence punctuation',async({page})=>{
  await openCaseStudy(page);
  const selector=[
    '.fm-next-review-summary b',
    '.fm-next-cs-loop b','.fm-next-cs-loop span',
    '.fm-next-cs-auth-flow small','.fm-next-cs-auth-flow b',
    '.fm-next-cs-detail-order span','.fm-next-cs-reco-card strong',
    '.fm-next-cs-day-states small','.fm-next-cs-day-states b','.fm-next-cs-day-states p',
    '.fm-next-cs-recovery b','.fm-next-cs-recovery .fm-cs-line',
    '.fm-next-cs-outcomes b','.fm-next-cs-outcomes .fm-cs-line'
  ].join(',');
  const values=await page.locator(`.slide:not([hidden]) :is(${selector})`).allTextContents();
  expect(values.length).toBeGreaterThan(40);
  expect(values.filter(hasSentencePunctuation)).toEqual([]);
});
