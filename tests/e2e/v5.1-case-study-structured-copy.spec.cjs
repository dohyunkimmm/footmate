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
  expect(await rowValue(visibleSlide(page,1),'검증 범위')).toBe('설계 가설 · Beta 검증 대상 · 사용자 조사·경쟁사 우위 미입증');

  const personaLines=await visibleSlide(page,2).locator('.fm-next-cs-persona>div').first().locator('b .fm-cs-line').allTextContents();
  expect(personaLines).toEqual(['평일 저녁 · 주 1~2회','30분 안쪽 이동']);
  expect(await visibleSlide(page,2).locator('.fm-next-cs-persona>div').nth(2).locator('b').innerText()).toBe('교육생 6명 · iOS 4 / Android 2');
  expect(await visibleSlide(page,2).locator('.fm-next-cs-jtbd p .fm-cs-line').allTextContents()).toEqual([
    '가설 · 적합 이유 빠른 확인',
    '과업 · 회원가입 전 · Kakao · Google · 이메일',
    '관찰 · 동선별 버그 · 막힘 · 요구사항 조정'
  ]);

  const priorityLines=await visibleSlide(page,3).locator('.fm-next-cs-principles .fm-next-cs-card p .fm-cs-line').allTextContents();
  expect(priorityLines).toEqual([
    '판단 기준 통합 · 선택 맥락 보존','Beta 검증 · 인증 · 정원 · 참가 · 취소 · 체크인 · 복구',
    '대기열 · 알림 · 경기 후 피드백','자리 회복 · 재탐색 · 실제 이용 데이터 검증 과제',
    '실제 PG 유보 · 수익화 검증 제외','AI 자동 참가 제외 · 사용자 최종 확인(HITL)'
  ]);

  const guestAlternatives=await visibleSlide(page,4).locator('.fm-next-cs-before-after>div p').allTextContents();
  expect(guestAlternatives).toEqual(['가치 확인 전 계정 생성 필요','추천 확인 후 가입 여부 결정']);
  expect(await rowValue(visibleSlide(page,4),'결정')).toBe('가입 전 추천 · 상세 공개');
  expect(await rowValue(visibleSlide(page,4),'이유')).toBe('참가 의도 전 서비스 가치 확인');
  expect(await rowValue(visibleSlide(page,4),'Trade-off')).toBe('로그인 전 계정 기반 개인화 · 기기 간 연속성 제한');

  expect(await rowValue(visibleSlide(page,5),'결정')).toBe('최근 선호 · 추천 보조 입력');
  expect(await rowValue(visibleSlide(page,5),'품질 기준')).toBe('후보 · 순위 · 이유 · 결정론적 추천 엔진 소유');
  expect(await rowValue(visibleSlide(page,5),'Trade-off')).toBe('현재 의도 불일치 가능 · 조건 수정 · 재탐색 허용');
  expect(await rowValue(visibleSlide(page,6),'핵심 행동')).toBe('참가하기');
  expect(await rowValue(visibleSlide(page,6),'보조 행동')).toBe('저장 · 최대 2경기 비교');
  expect(await rowValue(visibleSlide(page,6),'Trade-off')).toBe('최대 2경기 비교 · 참가 전 취소·환불 기준 확인');

  expect(await rowValue(visibleSlide(page,7),'Real App')).toBe('인증 · 결제 시뮬레이션');
  expect(await rowValue(visibleSlide(page,7),'Closed Beta')).toBe('Supabase 인증 · 참가 실연동');
  expect(await rowValue(visibleSlide(page,7),'상태 보존')).toBe('로그인 전 선택 경기 · 복귀 위치 유지 · 반복 선택 방지');
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
  expect(await rowValue(visibleSlide(page,10),'실제 연결')).toBe('Vercel AI Gateway · Supabase · Resend · Web Push · Storage 실연동');
  expect(await rowValue(visibleSlide(page,10),'미연동')).toBe('실제 PG · 외부 분석 도구 미연동');
  expect(await rowValue(visibleSlide(page,10),'정의한 기준')).toBe('API·데이터·권한·오류·재시도 · IA·상태별 화면·CTA · 취소·정원·복구 정책');

  const outcomes=await visibleSlide(page,12).locator('.fm-next-cs-outcomes .fm-cs-line').allTextContents();
  expect(outcomes.every(value=>!hasSentencePunctuation(value))).toBe(true);
});

test('targeted structured values stay phrase-style without sentence punctuation',async({page})=>{
  await openCaseStudy(page);

  const targets=[
    [1,'검증 범위'],
    [4,'이유'],[4,'Trade-off'],
    [5,'품질 기준'],[5,'Trade-off'],
    [6,'Trade-off'],
    [7,'상태 보존'],
    [10,'실제 연결'],[10,'정의한 기준'],
    [12,'과업 범위'],[12,'학습·다음 단계']
  ];
  for(const [slideIndex,label] of targets){
    expect(hasSentencePunctuation(await rowValue(visibleSlide(page,slideIndex),label))).toBe(false);
  }

  const qaValues=await visibleSlide(page,11).locator('.fm-next-cs-grid.three .fm-next-cs-card p .fm-cs-line').allTextContents();
  expect(qaValues).toContain('사용자 만족도 · 전환 성과 검증 제외');
  expect(qaValues).toContain('자동 QA · 사람 검수 PASS 판정 대체 아님');
  expect(qaValues.filter(hasSentencePunctuation)).toEqual([]);

  const release=visibleSlide(page,12);
  expect(await rowValue(release,'검증 표본')).toBe('교육생 6명 · iOS 4 / Android 2 · 입문 2 / 초급 2 / 중급 1 / 고급 1 · 수비 2 / 공격 2 / 미드필더 2');
  expect(await rowValue(release,'과업 범위')).toBe('회원가입 전 2회 · Kakao 2회 · Google 2회 · 이메일 2회 · 총 8회 · 일부 참여자 복수 과업');
});

test('02–13 structured typography follows one semantic size system',async({page})=>{
  await openCaseStudy(page);
  const slide=visibleSlide(page,11);
  const sizes=await slide.evaluate(node=>{
    const px=selector=>getComputedStyle(node.querySelector(selector)).fontSize;
    return {
      cardHeading:px('.fm-next-cs-card h3'),
      metricHeading:px('.fm-next-cs-metric>b'),
      cardValue:px('.fm-next-cs-card p'),
      metricValue:px('.fm-cs-ratio'),
      rowLabel:px('.fm-next-cs-note .fm-cs-reasons dt'),
      disclosureLabel:px('.fm-next-kpi-disclosure>span')
    };
  });
  expect(sizes.cardHeading).toBe('13px');
  expect(sizes.metricHeading).toBe('13px');
  expect(sizes.cardValue).toBe('12px');
  expect(sizes.metricValue).toBe('12px');
  expect(sizes.rowLabel).toBe('11px');
  expect(sizes.disclosureLabel).toBe('11px');
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
