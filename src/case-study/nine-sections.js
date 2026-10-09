/* FootMate Case Study · nine-stage narrative. Sources: Notion project page,
   SERVICE-PLANNING-EVIDENCE, USER-TEST-EVIDENCE and RELEASE-HISTORY. */
(() => {
  'use strict';
  const repo = 'https://github.com/dohyunkimmm/footmate/blob/main/docs/';
  const evidence = (file, label) => `<a class="evidence-link" href="${repo}${file}" target="_blank" rel="noopener">${label} <span aria-hidden="true">↗</span></a>`;
  const card = (label, title, body) => `<article class="story-card"><span class="eyebrow">${label}</span><h3>${title}</h3><p>${body}</p></article>`;
  const grid = (...items) => `<div class="card-grid">${items.join('')}</div>`;
  const head = (n, label, title, lead) => `<header class="section-head"><span class="eyebrow">${n} / ${label}</span><h1 tabindex="-1">${title.replaceAll('<br>', '<br class="cs-title-break"> ')}</h1><p class="lead">${lead}</p></header>`;
  const note = text => `<p class="source-note">${text}</p>`;
  const steps = items => `<ol class="flow">${items.map(([title, body], index) => `<li><span class="flow-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><strong>${title}</strong><span>${body}</span></li>`).join('')}</ol>`;
  const image = (file, alt, caption) => `<figure class="product-figure"><button class="evidence-preview" type="button" data-image="/src/case-study/evidence/${file}" data-image-title="${alt}" aria-label="${alt} · 화면 확대" aria-haspopup="dialog"><img src="/src/case-study/evidence/${file}" alt="${alt}" loading="lazy"></button><figcaption>${caption} <span class="image-view-hint" aria-hidden="true">· 확대 보기 ↗</span></figcaption></figure>`;
  const sections = [
    {name:'Overview & Problem', sub:'Project & Design Goal', html:
      head('01','OVERVIEW & PROBLEM','내 수준에 맞는 경기부터,<br>참가 이후의 경험까지.','경기 조건을 해석하고, 추천 이유로 판단을 돕고, 참가부터 경기 후까지 연결하는 풋살 서비스를 설계·구축했습니다.') +
      `<div class="overview-grid"><div><div class="project-facts"><div><span>역할</span><strong>단독 기획 · UX 설계 · 구축</strong><p>프로토타입 · 과업 검증 · QA · 배포</p></div><div><span>기간</span><strong>2026.06.08–현재</strong><p>AI 실무과정에서 시작 · 수료 후 고도화</p></div></div><div class="problem-statement"><span class="eyebrow">PROBLEM STATEMENT · 설계 가설</span><h2>경기 선택의 부담과<br>참가 이후의 단절</h2><p>레벨·거리·포지션·잔여 자리 비교<br>불분명한 추천 근거 · 경기 후 다음 행동 부재</p></div><a class="primary-link" href="/demo">제품 체험하기 <span aria-hidden="true">↗</span></a><p class="small-copy">샘플 경기 기반 앱 · 로그인 전 탐색 가능</p></div>${image('recommendation-home.png','FootMate의 추천 경기와 탐색 화면','홈 구현 기록 · 참가비는 샘플 정보')}</div>` +
      grid(card('DECISION 01','가치 확인 후 인증','추천·상세 먼저 탐색 · 참가 시 로그인'),card('DECISION 02','점수보다 추천 이유','레벨·거리·포지션을 판단 근거로'),card('DECISION 03','중단 후 복구','선택 유지 · 재시도'))},
    {name:'Persona & JTBD', sub:'Context & User Tasks', html:
      head('02','PERSONA & JTBD','사용자 가설을,<br>구체적인 행동 과업으로.','퇴근 후 갈 수 있는 경기를 찾는 상황을 기준으로, 무엇을 비교하고 어디서 망설일지 정의했습니다.') +
      `<div class="split"><article class="persona-panel"><span class="eyebrow">DESIGN PERSONA · 검증 전 가설</span><h2>퇴근 후 한 경기를 고르는 플레이어</h2><dl><div><dt>이용 맥락</dt><dd>평일 저녁 · 주 1~2회 · 30분 안쪽 이동</dd></div><div><dt>선택 기준</dt><dd>레벨 · 거리 · 포지션 · 남은 자리</dd></div><div><dt>불안 요소</dt><dd>실력 차이 · 자리 마감 · 취소 규칙 · 경기 당일 변수</dd></div></dl></article><div class="jtbd-panel"><span class="eyebrow">JOB TO BE DONE</span><blockquote>퇴근 후 운동 시간 확보<br>일정·수준에 맞는 후보 판단<br>참가 확정 → 당일 준비</blockquote><p>맥락 → 선택 → 실행</p></div></div>` +
      grid(card('TASK 01','가입 전 탐색','조건 설정 → 추천·목록 → 상세'),card('TASK 02','인증 후 복귀','참가 시 로그인 → 선택 경기로 이동'),card('TASK 03','상태 변화 확인','가입·인증 중단 → 진행 단계 파악 → 재진입')) +
      note('과업 기록 · 교육생 6명 · 총 8회<br>일부 참여자 복수 수행 · 기기별 구성은 07에서 확인')},
    {name:'Journey Map', sub:'Friction & Opportunities', html:
      head('03','JOURNEY MAP','탐색의 막힘을,<br>다음 설계 기회로 연결했습니다.','화면 목록 대신 사용자의 목적을 기준으로 탐색 → 판단 → 참가 → 경기 → 재탐색의 여정을 정리했습니다.') +
      `<div class="journey-map" aria-label="설계 가설 기반 사용자 여정">${[
        ['01','Find · 탐색','오늘 갈 수 있는 경기 찾기','시간·지역·레벨 비교 부담','자연어 탐색 · 필터 수정'],
        ['02','Decide · 판단','내게 맞는 후보 비교','추천 이유·자리·취소 규칙이 불명확','추천 이유 · 상세 · 2경기 비교'],
        ['03','Join · 참가','선택 경기에 참가 확정','인증·확정 중단 시 선택 유실','참가 시 인증 · 선택 유지'],
        ['04','Play · 경기','당일 준비하고 출석','시간·체크인·변경 안내 재확인','MY · 당일 상태 · 체크인'],
        ['05','Return · 재탐색','경기 경험을 다음 선택에 반영','경기 후 피드백과 다음 탐색이 분리됨','피드백 · 다음 추천']
      ].map(([n,t,a,p,o])=>`<article><span class="journey-number">${n}</span><h2>${t}</h2><div><span class="eyebrow">사용자 행동</span><p>${a}</p></div><div class="pain"><span class="eyebrow">막힘 · 가설</span><p>${p}</p></div><div class="opportunity"><span class="eyebrow">설계 대응</span><p>${o}</p></div></article>`).join('')}</div>` +
      `<div class="callout"><strong>공통 원칙 · 선택과 진행 맥락 보존</strong><p>결과 없음·인증 취소·참가 실패·당일 변경 시, 상황에 맞는 재탐색·재시도·현황 안내</p></div>` +
      note('현재 제품 기반의 예상 여정 · 감정 조사·점수화 미실시')},
    {name:'Scope & Priorities', sub:'MVP & Trade-offs', html:
      head('04','SCOPE & PRIORITIES','참가와 복구를 먼저,<br>확장 검증은 다음으로.','사용자 판단 가치, 실패의 영향, 검증 가능성을 기준으로 무료 Beta의 범위를 정했습니다.') +
      `<div class="priority-grid">${[
        ['Must','핵심 동선의 완결','탐색·추천·상세 → 인증·참가 · 정원·취소·체크인 · 실패 복구','우선 기준 · 참가 흐름과 상태 유지'],
        ['Should','선택과 운영의 보조','저장 · 최대 2경기 비교 · 대기열 · 알림 · 경기 후 피드백','효과 검증 예정'],
        ['Could','검증 후 고도화','추천 입력 · 조건 해석 · 재탐색 개선','착수 기준 · 실제 이용 중 막힘 확인'],
        ["Won’t · 이번 범위",'유보한 확장','실제 결제 · 수익화 검증 · AI의 자동 참가 확정','현재 범위 · 무료 참가 · 사용자 최종 확정']
      ].map(([label,title,features,why])=>`<article class="priority-card"><span class="priority-tag">${label}</span><h2>${title}</h2><p>${features}</p><p class="priority-reason">${why}</p></article>`).join('')}</div>` +
      note('현재 우선순위 분류 · 과거 회의·정량 점수 근거 없음<br>Should 기능 구현 완료') +
      `<details><summary>현재 구현 범위와 Trade-off</summary><div class="detail-body"><p><strong>샘플 앱 /app</strong><br>AI·Google/Kakao 인증 실제 연결<br>경기·잔여 자리 샘플 · 참가·체크인·피드백 브라우저 기록</p><p><strong>Closed Beta /beta</strong><br>로그인·경기·정원·참가·취소·대기·체크인·알림 서버 연동<br>결제·외부 분석 도구 미연동</p><p><strong>참가 결정</strong><br>사용자 직접 확정 · 자동 실행 제외</p></div></details>`},
    {name:'IA & UX Flow', sub:'Structure & Recovery', html:
      head('05','IA & UX FLOW','세 개의 탭으로 찾고,<br>하나의 참가 흐름으로 이어집니다.','메뉴는 정보의 위치를, UX Flow는 과업의 순서와 예외 경로를 설명합니다.') +
      `<h2 class="block-title">Information Architecture · 정보 구조</h2><div class="ia-tree" aria-label="FootMate 아래 홈·경기 찾기·MY의 정보 구조"><div class="ia-root">FootMate</div><div class="ia-branches">${[
        ['홈','자연어 경기 탐색','선호 조건 · 추천 경기','추천 이유 · 최근 확인'],
        ['경기 찾기','목록 · 필터 · 정렬','경기 상세 · 저장','최대 2경기 비교'],
        ['MY','내 경기 · 참가 전 빈 상태','참가 예정 · 경기 당일 · 완료','체크인 · 피드백 · 다음 탐색']
      ].map(([title,...items])=>`<article><h3>${title}</h3><ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul></article>`).join('')}</div></div>` +
      `<h2 class="block-title">User Task Flow · 참가 과업</h2><p class="flow-guide small-copy">01 → 06 순서 · 아래 예외 경로는 인증·참가 단계에서 분기</p>` + steps([['조건 설정','가입 전 탐색'],['추천·상세 비교','이유와 참가 조건 확인'],['참가하기','로그인 필요 여부 확인'],['인증·복귀','선택 경기 유지'],['무료 참가 확인','사용자가 최종 확정'],['MY 내 경기','당일·경기 후로 연결']]) +
      grid(card('03 → 05 / 로그인 상태','인증 단계 생략','인증 생략 → 선택 경기 참가 확인'),card('04 → 상세 / 인증 취소','선택 경기로 복귀','선택 유지 → 상세 복귀·인증 재시도'),card('05 → 재시도·탐색 / 참가 실패','상태에 따라 복구','상태 확인 → 재시도 · 마감 시 다른 경기 탐색'))},
    {name:'Design Decisions & Demo', sub:'Decisions in the Product', html:
      head('06','DESIGN DECISIONS & DEMO','세 가지 설계 결정을,<br>실제로 동작하는 화면으로.','각 화면에서 무엇을 앞세웠는지, 어떤 흐름을 유지했는지 구현 결과와 함께 설명합니다.') +
      `<div class="decision-list"><article class="decision-row"><div><span class="eyebrow">DECISION 01 / GUEST FIRST</span><h2>가치를 본 뒤 로그인</h2><p>조건·추천·상세 탐색 후, 참가 선택 시 로그인</p><div class="decision-path">조건 설정 → 추천 → 상세 → 참가 시 인증</div><p class="small-copy">가입 전 가치 판단 · 이탈 감소는 측정 전</p></div>${image('recommendation-home.png','조건 설정과 추천이 보이는 홈 화면','홈 · 추천부터 탐색 · 샘플 참가비')}</article><article class="decision-row"><div><span class="eyebrow">DECISION 02 / REASONS FIRST</span><h2>추천 점수보다 판단 근거</h2><p>생활권·레벨·포지션으로 추천 이유 제시 · 상세에서 참가 조건·시설·취소 정책 확인</p><div class="decision-path">조건 해석 → 기준 기반 추천 → 이유 확인 → 상세 비교</div><p class="small-copy">AI · 요청의 조건 해석 / 추천 로직 · 후보·순위·이유 결정</p></div>${image('decision-detail.png','추천 이유와 참가 정보를 함께 제공하는 경기 상세','상세 · 조건 확인 · 실제 결제 없는 체험')}</article><article class="decision-row"><div><span class="eyebrow">DECISION 03 / PRESERVE & RECOVER</span><h2>중단 후 선택 유지</h2><p>중단 상태 안내 → 재시도·경기 재선택 · 참가 상태와 알림 실패 구분</p><div class="decision-path">실패 안내 → 상태 확인 → 재시도 또는 재탐색</div><p class="small-copy">구현·동작 검증 사례 · 사용자 성과는 미측정</p></div><figure class="recovery-diagram" aria-label="현재 무료 참가의 복구 흐름 요약"><span class="eyebrow">RECOVERY FLOW</span><h3>참가 상태 먼저 확인</h3><p>확정 여부 · 정원 · 선택 경기</p><ol><li><strong>재시도 가능한 상태</strong><span>선택 유지 → 참가 다시 확인</span></li><li><strong>마감·조건 변경</strong><span>다른 경기 탐색 → 새 후보 선택</span></li></ol><figcaption>현재 복구 흐름 · 구조 요약</figcaption></figure></article></div>` +
      `<p class="small-copy"><a href="/demo">이 흐름 직접 확인하기 ↗</a> · 조건 탐색 → 추천 이유 → 상세 → 참가 확인 → MY</p>` +
      `<details><summary>프로토타입에서 현재 구현까지 · 근거 범위</summary><div class="detail-body"><p>초기 프로토타입 → 교육생 과업 검증 → 제품·운영 고도화<br>배포 점검 → KPI 측정 준비</p><p>현재 구현 화면·남아 있는 점검 기록 제시<br>과거 Lo-Fi·Hi-Fi 화면 임의 복원 제외</p><p><a href="/beta">Closed Beta 보기 ↗</a></p></div></details>`},
    {name:'Validation & Metrics', sub:'Evidence & Measurement', html:
      head('07','VALIDATION & METRICS','확인한 동작과,<br>앞으로 측정할 성과를 구분했습니다.','과업 기반 사용성 검증, 개발·배포 QA, 제품 KPI를 서로 다른 근거로 관리합니다.') +
      grid(card('USER TASKS · 과업 기록','교육생 6명 · 과업 8회','<span class="copy-unit">iOS 4명 · Android 2명</span> / <span class="copy-unit">비회원 탐색 · 소셜·이메일 가입</span>'),card('PRODUCT QA · 동작 점검','상태·복구·접근성 확인','<span class="copy-unit">주요 흐름 · 오류 복구 · 가독성</span> / <span class="copy-unit">화면 크기별 표시 · 모바일 Safari</span>'),card('PRODUCT METRICS · 측정 준비','8개 KPI · 측정 전 정의','계산·관찰·제외 기준 정리 · 실제 이용 기준값·목표치는 미확보')) +
      `<h2 class="block-title">개선·재검증 사례 · 개발 QA 근거</h2><p class="table-scroll-hint small-copy" id="qa-table-hint">발견 문제 → 수정 → 점검 내용 순서로 확인</p><div class="table-wrap qa-evidence-table" tabindex="0" role="region" aria-label="개선·재검증 사례 표" aria-describedby="qa-table-hint"><table><caption class="sr-only">개발 QA에서 확인한 개선과 재검증 기록</caption><thead><tr><th scope="col">발견 문제</th><th scope="col">수정</th><th scope="col">점검 항목</th></tr></thead><tbody><tr><th scope="row">첫 추천까지 스크롤 부담</th><td>상단 여백·카드 밀도 조정</td><td>모바일 첫 화면의 추천 카드 노출·스크롤 범위 점검</td></tr><tr><th scope="row">참가 오류 후 복귀</th><td>오류 안내·재시도·경기 다시 선택</td><td>배포 핵심 동작 15개 · 앱 흐름 8개 점검</td></tr><tr><th scope="row">필터 초기 색 대비</th><td>기본 상태에도 구분 색상 적용</td><td>색상 구분·화면 표시·모바일 Safari 동작 점검</td></tr></tbody></table></div>` +
      note('개발·배포 점검 사례 · 교육생 과업 결과와 별도<br>성공률·시간·만족도 개선 수치 미확정') +
      `<details><summary>8개 KPI의 계산·관찰 기준</summary><div class="detail-body"><p class="table-scroll-hint small-copy" id="kpi-table-hint">좌우 스크롤로 지표·계산·관찰 기준 확인 ↔</p><div class="table-wrap" tabindex="0" role="region" aria-label="KPI 계산·관찰 기준 표" aria-describedby="kpi-table-hint"><table><thead><tr><th scope="col">지표</th><th scope="col">계산</th><th scope="col">관찰 기준</th></tr></thead><tbody>${[
        ['상세 진입률','상세 진입 세션 ÷ 결과 노출 세션','결과 1개 이상 · 세션당 1회'],['참가 전환율','참가 완료 쌍 ÷ 상세 조회 사용자·경기 쌍','동일 경기 · 조회 후 24시간'],['결과 없음 비율','결과 0개 검색 ÷ 정상 처리 검색','네트워크·서버 오류 제외'],['참가 실패율','실패·미해결 흐름 ÷ 확정 요청 흐름','24시간 관찰 · 사용자 취소 분리'],['복구 성공률','목적 완료 흐름 ÷ 복구 가능한 실패 흐름','24시간 이내 · 대안 선택 별도'],['체크인 완료율','체크인 완료 쌍 ÷ 종료 경기 확정 참가 쌍','취소 제외 · 노쇼 포함'],['7일 내 재탐색률','재탐색 사용자 ÷ 7일 관찰 완료 참가 사용자','첫 완료 경기 기준 · 중복 제거'],['AI 검색 사용률','AI 요청 세션 ÷ AI 진입점 노출 세션','연결 AI와 규칙 복구 결과 분리']
      ].map(([a,b,c])=>`<tr><th scope="row">${a}</th><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table></div><p>대상 · 실제 무료 Beta 이용자<br>제외 · 운영·테스트 계정·자동 점검·샘플 앱<br>분모 0 · N/A 처리 · 첫 유효값은 개선 전 기준값</p></div></details>`},
    {name:'Reflection', sub:'Learning & Limits', html:
      head('08','REFLECTION','성공 이후의 상태까지,<br>설계해야 경험이 완성됩니다.','탐색·인증·참가를 연결하면서, 정상 경로뿐 아니라 중단·복구·운영 상태를 함께 정의해야 한다는 점을 배웠습니다.') +
      grid(card('KEEP','판단과 실행의 책임 분리','<span class="copy-unit">AI · 조건 해석</span> / <span class="copy-unit">추천 로직 · 후보 선정</span> / <span class="copy-unit">사용자 · 참가 확정</span>'),card('LEARNED','검증 행동 구체화','인증·복귀·상태 유지 확인 · 동일 조건에서 오류 재현'),card('LEARNED','실패도 사용자 흐름의 일부','중복 요청·정원 마감·알림 실패 확인 · 참가 상태와 알림 결과 분리')) +
      `<div class="split reflection-bottom"><article class="story-card"><span class="eyebrow">LIMITS</span><h2>근거의 한계</h2><ul><li>Persona·문제 정의 · 설계 가설</li><li>6명 과업 검증 · 시장 대표성 한계</li><li>개인별 발견 → 수정 → 재검증 연결 미확정</li><li>전환·재이용 개선 · 수익성 미검증</li></ul></article><article class="closing-note"><span class="eyebrow">NEXT DESIGN PRINCIPLE</span><h2>기능보다 흐름,<br>판단마다 근거</h2><p>문제 → 과업 → 상태·예외 → 수정 → 같은 조건에서 재검증</p></article></div>`},
    {name:'Next Steps', sub:'What to Validate Next', html:
      head('09','NEXT STEPS','먼저 기준값을 확보하고,<br>한 번에 하나의 가설을 검증합니다.','남은 기능을 늘리기 전에 실제 Beta 이용과 과업 기록을 정리해 다음 개선의 우선순위를 판단하겠습니다.') +
      `<ol class="next-list">${[
        ['01','사용자 과업 기록 연결','참여자별 발견 → 수정 → 재검증','관찰 항목 · 막힘·복귀 위치·재현 여부'],
        ['02','실제 Beta 기준값 확보','운영·테스트 제외 데이터 수집','보고 항목 · 표본·기간·분모·누락'],
        ['03','이탈 구간에 따라 IA·흐름 개선','참가 이탈 · 정보·인증·정원 / 당일 미참여 · 안내·알림·체크인','비교 지표 · 전환·실패·복구·출석'],
        ['04','추천·수익화의 확장 판단','조건 해석 오류·경기 부족 구분 · 결제는 핵심 흐름 검증 이후 판단','판단 근거 · AI 검색 이후 상세·참가 행동']
      ].map(([n,title,body,criterion])=>`<li><span class="next-number">${n}</span><div><span class="eyebrow">${n==='01'?'먼저 · 과업 근거':n==='02'?'먼저 · 이용 기준값':n==='03'?'다음 · 이탈 근거로 개선':'이후 · 확장 판단'}</span><h2>${title}</h2><p>${body}</p><p class="small-copy">${criterion}</p></div></li>`).join('')}</ol>` +
      note('향후 계획 · 성과·일정 미확정<br>후속 IA 수정 조건 · 실제 막힘·이탈 근거 확보') +
      `<details class="technical-resources"><summary>원문·기술 자료 보기</summary><div class="detail-body"><p>과업 기록, 구현·개선 이력, 측정 기준의 원문</p><a class="evidence-link" href="https://github.com/dohyunkimmm/footmate" target="_blank" rel="noopener">프로젝트 저장소 ↗</a>${evidence('USER-TEST-EVIDENCE.md','사용자 과업 기록')}${evidence('RELEASE-HISTORY.md','구현·개선 이력')}${evidence('SERVICE-PLANNING-EVIDENCE.md','설계·운영 판단')}${evidence('BETA-MEASUREMENT-READINESS.md','측정 준비 기준')}</div></details>`}
  ];
  const toc = document.querySelector('.toc');
  const track = document.querySelector('.track');
  const dots = document.querySelector('.dots');
  toc.innerHTML = sections.map((s,i) => `<button class="toc-item" type="button" data-index="${i}"><span class="toc-n">${String(i+1).padStart(2,'0')}</span><span class="toc-copy"><span class="toc-t">${s.name}</span><span class="toc-s">${s.sub}</span></span></button>`).join('');
  track.innerHTML = sections.map((s,i) => `<section class="slide" id="section-${String(i+1).padStart(2,'0')}" aria-label="${s.name}" hidden>${s.html}</section>`).join('');
  dots.innerHTML = sections.map((s,i) => `<button class="dot" type="button" data-index="${i}" aria-label="${i+1}번 섹션 · ${s.name}"></button>`).join('');
  // Keep native table semantics when mobile rows switch to a vertical reading layout.
  const qaTable=track.querySelector('.qa-evidence-table table');
  qaTable.setAttribute('role','table');
  qaTable.querySelectorAll('thead,tbody').forEach(group=>group.setAttribute('role','rowgroup'));
  qaTable.querySelectorAll('tr').forEach(row=>row.setAttribute('role','row'));
  qaTable.querySelectorAll('th').forEach(cell=>cell.setAttribute('role',cell.scope==='row'?'rowheader':'columnheader'));
  const qaLabels=[...qaTable.querySelectorAll('thead th')].map(cell=>cell.textContent.trim());
  qaTable.querySelectorAll('tbody tr').forEach(row=>row.querySelectorAll('td').forEach((cell,index)=>{
    cell.dataset.label=qaLabels[index+1];
    cell.setAttribute('role','cell');
    cell.setAttribute('aria-label',qaLabels[index+1]+' · '+cell.textContent.trim());
  }));
  const imageDialog=document.createElement('dialog');
  imageDialog.className='image-dialog';
  imageDialog.setAttribute('aria-labelledby','image-dialog-title');
  imageDialog.innerHTML='<div class="image-dialog-header"><h2 id="image-dialog-title">화면 확대</h2><button type="button" class="image-dialog-close" autofocus>닫기 ×</button></div><div class="image-dialog-body" tabindex="0" role="region" aria-label="확대 이미지"><img alt=""></div>';
  document.body.appendChild(imageDialog);
  imageDialog.querySelector('.image-dialog-close').addEventListener('click',()=>imageDialog.close());
  document.addEventListener('click',event=>{
    const preview=event.target.closest('.evidence-preview');
    if(!preview)return;
    imageDialog.querySelector('h2').textContent=preview.dataset.imageTitle;
    const expanded=imageDialog.querySelector('img');
    expanded.src=preview.dataset.image;
    expanded.alt=preview.dataset.imageTitle;
    imageDialog.showModal();
    imageDialog.querySelector('.image-dialog-body').scrollTop=0;
  });
  const slides = [...track.children];
  const prev = document.querySelector('.btn-prev');
  const next = document.querySelector('.btn-next');
  let current = 0;
  function fromUrl() { const match = location.hash.match(/^#section-(\d{1,2})$/); return match ? Number(match[1])-1 : 0; }
  function goTo(index, {historyMode='push', focus=true}={}) {
    if(imageDialog.open)imageDialog.close();
    current = Math.max(0, Math.min(sections.length-1, Number(index)||0));
    slides.forEach((slide,i) => { slide.hidden = i!==current; slide.classList.toggle('on',i===current); });
    toc.querySelectorAll('button').forEach((button,i) => { button.classList.toggle('on',i===current); if(i===current)button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current'); });
    dots.querySelectorAll('button').forEach((button,i) => { button.classList.toggle('on',i===current); if(i===current)button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current'); });
    const position = `${String(current+1).padStart(2,'0')} / 09`;
    document.querySelector('.topbar-count').textContent = position;
    document.querySelector('.reader-position').textContent = `${position} · ${sections[current].name}`;
    document.querySelector('.pbar-fill').style.width = `${(current+1)/9*100}%`;
    prev.disabled = current===0; next.disabled = current===8;
    prev.innerHTML = `<span aria-hidden="true">←</span><span><small>${current===0?'첫 섹션':'이전 섹션'}</small>${sections[Math.max(0,current-1)].name}</span>`;
    next.innerHTML = `<span><small>${current===8?'마지막 섹션':'다음 섹션'}</small>${sections[Math.min(8,current+1)].name}</span><span aria-hidden="true">→</span>`;
    const hash = `#section-${String(current+1).padStart(2,'0')}`;
    if(historyMode && location.hash!==hash)history[historyMode==='replace'?'replaceState':'pushState'](null,'',location.pathname+location.search+hash);
    if(innerWidth<=800)toc.querySelectorAll('button')[current].scrollIntoView({block:'nearest',inline:'center',behavior:'instant'});
    if(focus) { slides[current].querySelector('h1').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
  }
  document.addEventListener('click', event => { const button = event.target.closest('.toc-item,.dot'); if(button)goTo(button.dataset.index); });
  prev.addEventListener('click', () => goTo(current-1));
  next.addEventListener('click', () => goTo(current+1));
  window.addEventListener('popstate', () => goTo(fromUrl(),{historyMode:null}));
  window.addEventListener('hashchange', () => goTo(fromUrl(),{historyMode:'replace'}));
  window.addEventListener('keydown', event => {
    if(imageDialog.open)return;
    if(event.altKey||event.ctrlKey||event.metaKey||event.isComposing||event.target.closest('input,textarea,select,[contenteditable],summary,a,.table-wrap'))return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft') { event.preventDefault(); goTo(current+(event.key==='ArrowRight'?1:-1)); }
  });
  window.goTo = goTo;
  // Preserve the existing product behavior: refresh starts at Overview;
  // direct links and browser history retain their requested section.
  const reloaded = performance.getEntriesByType('navigation')[0]?.type==='reload';
  if(reloaded)history.scrollRestoration='manual';
  goTo(reloaded?0:fromUrl(),{historyMode:'replace',focus:false});
  if(reloaded)window.scrollTo({top:0,behavior:'instant'});
})();
