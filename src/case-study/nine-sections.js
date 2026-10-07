/* FootMate Case Study · nine-stage narrative. Sources: Notion project page,
   SERVICE-PLANNING-EVIDENCE, USER-TEST-EVIDENCE and RELEASE-HISTORY. */
(() => {
  'use strict';
  const repo = 'https://github.com/dohyunkimmm/footmate/blob/main/docs/';
  const evidence = (file, label) => `<a class="evidence-link" href="${repo}${file}" target="_blank" rel="noopener">${label} <span aria-hidden="true">↗</span></a>`;
  const card = (label, title, body) => `<article class="story-card"><span class="eyebrow">${label}</span><h3>${title}</h3><p>${body}</p></article>`;
  const grid = (...items) => `<div class="card-grid">${items.join('')}</div>`;
  const head = (n, label, title, lead) => `<header class="section-head"><span class="eyebrow">${n} / ${label}</span><h1 tabindex="-1">${title}</h1><p class="lead">${lead}</p></header>`;
  const note = text => `<p class="source-note">${text}</p>`;
  const steps = items => `<ol class="flow">${items.map(([title, body]) => `<li><strong>${title}</strong><span>${body}</span></li>`).join('')}</ol>`;
  const image = (file, alt, caption) => `<figure class="product-figure"><img src="/src/case-study/evidence/${file}" alt="${alt}" loading="lazy"><figcaption>${caption}</figcaption></figure>`;
  const sections = [
    {name:'Overview & Problem', sub:'Project & Design Goal', html:
      head('01','OVERVIEW & PROBLEM','내 수준에 맞는 경기부터,<br>참가 이후의 경험까지.','경기 조건을 해석하고, 추천 이유로 판단을 돕고, 참가부터 경기 후까지 연결하는 풋살 서비스를 설계·구축했습니다.') +
      `<div class="overview-grid"><div><div class="project-facts"><div><span>역할</span><strong>단독 기획 · UX 설계 · 구축</strong><p>프로토타입 · 과업 검증 · QA · 배포</p></div><div><span>기간</span><strong>2026.06.08–현재</strong><p>AI 실무과정에서 시작 · 수료 후 고도화</p></div></div><div class="problem-statement"><span class="eyebrow">PROBLEM STATEMENT · 설계 가설</span><h2>여러 조건을 비교해 참가를 결정하고,<br>경기 이후까지 이어가려면?</h2><p>레벨·거리·포지션·남은 자리의 비교 부담, 추천 근거의 불확실성, 참가 후 다음 행동의 단절을 핵심 문제로 정의했습니다.</p></div><a class="primary-link" href="/demo">제품 직접 체험하기 <span aria-hidden="true">↗</span></a><p class="small-copy">샘플 경기 기반 앱 · 로그인 전 탐색 가능</p></div>${image('recommendation-home.png','FootMate의 추천 경기와 탐색 화면','구현 화면 · 조건과 추천 이유를 함께 확인')}</div>` +
      grid(card('DECISION 01','가치 확인 후 인증','추천·상세를 먼저 살펴보고 참가할 때 로그인합니다.'),card('DECISION 02','점수보다 추천 이유','레벨·거리·포지션처럼 판단에 필요한 근거를 보여줍니다.'),card('DECISION 03','선택을 보존한 복구','실패·중단 뒤에도 선택과 목적을 유지해 다음 행동으로 이어갑니다.')) +
      note('문제와 Persona는 설계 가설입니다. 과업 기반 사용성 검증과 제품 성과 측정을 구분합니다. 9개 섹션에서 문제 → 설계 → 구현 → 검증의 근거를 확인할 수 있습니다.')},
    {name:'Persona & JTBD', sub:'Context & User Tasks', html:
      head('02','PERSONA & JTBD','사용자 가설을,<br>구체적인 행동 과업으로.','퇴근 후 갈 수 있는 경기를 찾는 상황을 기준으로, 무엇을 비교하고 어디서 망설일지 정의했습니다.') +
      `<div class="split"><article class="persona-panel"><span class="eyebrow">DESIGN PERSONA · 검증 전 가설</span><h2>퇴근 후 오래 고민하지 않고<br>한 경기를 고르고 싶은 플레이어</h2><dl><div><dt>이용 맥락</dt><dd>평일 저녁 · 주 1~2회 · 30분 안쪽 이동</dd></div><div><dt>선택 기준</dt><dd>레벨 · 거리 · 포지션 · 남은 자리</dd></div><div><dt>불안 요소</dt><dd>실력 차이 · 자리 마감 · 취소 규칙 · 경기 당일 변수</dd></div></dl></article><div class="jtbd-panel"><span class="eyebrow">JOB TO BE DONE</span><blockquote>퇴근 후 운동할 시간이 생겼을 때,<br>내 일정과 수준에 맞는 이유를 빠르게 이해해,<br>참가하고 경기 당일까지 준비하고 싶다.</blockquote><p>상황 → 판단 기준 → 참가 과업을 연결해 화면과 확인 항목을 도출했습니다.</p></div></div>` +
      grid(card('TASK 01','가입 전 탐색','조건을 설정하고 추천·목록에서 상세로 이동할 수 있는가?'),card('TASK 02','인증 후 복귀','참가 맥락에서 인증한 뒤 선택 경기와 이전 동선으로 돌아오는가?'),card('TASK 03','상태 변화 확인','가입·인증·로그인 단계에서 중단과 재진입을 이해할 수 있는가?')) +
      note('같은 교육과정 교육생 6명 · iOS 4명 / Android 2명 · 가입 관련 과업 8회. 일부 참여자가 복수 과업을 수행했습니다. 이 기록은 Persona의 시장 대표성을 입증하지 않습니다.') + evidence('USER-TEST-EVIDENCE.md','사용자 과업 검증 원본')},
    {name:'Journey Map', sub:'Friction & Opportunities', html:
      head('03','JOURNEY MAP','탐색의 막힘을,<br>다음 설계 기회로 연결했습니다.','화면 목록 대신 사용자의 목적을 기준으로 탐색 → 판단 → 참가 → 경기 → 재탐색의 여정을 정리했습니다.') +
      `<div class="journey-map" aria-label="설계 가설 기반 사용자 여정">${[
        ['01','Find · 탐색','오늘 갈 수 있는 경기 찾기','시간·지역·레벨 조건을 조합해야 함','자연어 조건 해석 + 수정 가능한 필터'],
        ['02','Decide · 판단','내게 맞는 후보 비교','추천 이유·자리·취소 규칙이 불명확','추천 이유 + 상세 정보 + 최대 2경기 비교'],
        ['03','Join · 참가','선택 경기에 참가 확정','인증·확정 중단으로 맥락을 잃을 수 있음','참가 직전 인증 + 선택 유지 + 무료 참가 확인'],
        ['04','Play · 경기','당일 준비하고 출석','시간·체크인·변경 안내를 다시 찾아야 함','MY 내 경기 + 당일 상태 + 체크인'],
        ['05','Return · 재탐색','경기 경험을 다음 선택에 반영','경기 후 피드백과 다음 탐색이 분리됨','피드백 저장 + 다음 추천 연결']
      ].map(([n,t,a,p,o])=>`<article><span class="journey-number">${n}</span><h2>${t}</h2><div><span class="eyebrow">사용자 행동</span><p>${a}</p></div><div class="pain"><span class="eyebrow">막힘 · 가설</span><p>${p}</p></div><div class="opportunity"><span class="eyebrow">설계 대응</span><p>${o}</p></div></article>`).join('')}</div>` +
      `<div class="callout"><strong>여정을 관통하는 기준 · 선택과 상태를 잃지 않기</strong><p>결과 없음, 인증 취소, 참가 실패, 경기 당일 변경을 별도 상태로 정의하고 재탐색·재시도·상태 확인으로 연결했습니다.</p></div>` +
      note('현재 제품 흐름을 기준으로 재구성한 예상 여정입니다. 사용자 감정을 측정한 조사나 감정 점수 그래프는 아닙니다.') + evidence('SERVICE-PLANNING-EVIDENCE.md','문제·요구사항·판단 근거')},
    {name:'Scope & Priorities', sub:'MVP & Trade-offs', html:
      head('04','SCOPE & PRIORITIES','참가와 복구를 먼저,<br>확장 검증은 다음으로.','사용자 판단 가치, 실패의 영향, 검증 가능성을 기준으로 무료 Beta의 범위를 정했습니다.') +
      `<div class="priority-grid">${[
        ['Must','핵심 동선의 완결','조건 탐색 · 추천 이유 · 상세 · 인증 후 복귀 · 참가 확인 · 정원·취소·체크인 · 실패 복구','참가 의도와 상태를 잃으면 핵심 경험이 중단됩니다.'],
        ['Should','선택과 운영의 보조','저장 · 최대 2경기 비교 · 대기열 · 알림 · 경기 후 피드백','판단과 운영을 돕지만 효과는 후속 관찰이 필요합니다.'],
        ['Could','검증 후 고도화','추천 입력 조정 · 조건 해석 품질 개선 · 다음 탐색 경험 개선','실제 사용에서 막히는 지점을 확인한 뒤 범위를 결정합니다.'],
        ["Won’t · 이번 범위",'유보한 확장','실제 결제 · 수익화 검증 · AI의 자동 참가 확정','무료 핵심 흐름을 우선하며 최종 참가 결정은 사용자가 합니다.']
      ].map(([label,title,features,why])=>`<article class="priority-card"><span class="priority-tag">${label}</span><h2>${title}</h2><p>${features}</p><p class="priority-reason">${why}</p></article>`).join('')}</div>` +
      note('MoSCoW는 현재 판단 근거를 정리한 분류이며 과거 회의 기록이나 정량 점수를 새로 만든 것이 아닙니다. 우선순위와 구현 여부는 별도입니다. Should의 저장·비교·대기열·알림·피드백은 구현되어 있으며 효과를 검증할 단계입니다.') +
      `<details><summary>현재 구현 범위와 Trade-off</summary><div class="detail-body"><p><strong>샘플 앱 /app</strong> — AI 조건 해석과 활성화된 Google/Kakao 인증은 실제 연결. 경기·잔여 자리는 샘플이며 참가·체크인·피드백은 브라우저에 기록합니다.</p><p><strong>Closed Beta /beta</strong> — 로그인·경기·정원·참가·취소·대기·체크인·알림은 서버 운영 환경에 연결합니다. 실제 결제와 외부 분석 도구는 미연동입니다.</p><p><strong>AI 책임</strong> — 조건 해석을 돕고, 경기 후보·순위·추천 이유는 기준 기반 로직이 결정합니다. 참가를 자동 실행하지 않습니다.</p></div></details>` + evidence('SERVICE-PLANNING-EVIDENCE.md','우선순위와 Trade-off 근거')},
    {name:'IA & UX Flow', sub:'Structure & Recovery', html:
      head('05','IA & UX FLOW','세 개의 탭으로 찾고,<br>하나의 참가 흐름으로 이어집니다.','메뉴는 정보의 위치를, UX Flow는 과업의 순서와 예외 경로를 설명합니다.') +
      `<h2 class="block-title">Information Architecture · 정보 구조</h2><div class="ia-tree"><div class="ia-root">FootMate</div><div class="ia-branches">${[
        ['홈','자연어 경기 탐색','선호 조건 · 추천 경기','추천 이유 · 최근 확인'],
        ['경기 찾기','목록 · 필터 · 정렬','경기 상세 · 저장','최대 2경기 비교'],
        ['MY','내 경기 · 참가 전 빈 상태','참가 예정 · 경기 당일 · 완료','체크인 · 피드백 · 다음 탐색']
      ].map(([title,...items])=>`<article><h3>${title}</h3><ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul></article>`).join('')}</div></div>` +
      `<h2 class="block-title">User Task Flow · 참가 과업</h2>` + steps([['조건 설정','가입 전 탐색'],['추천·상세 비교','이유와 참가 조건 확인'],['참가하기','로그인 필요 여부 확인'],['인증·복귀','선택 경기 유지'],['무료 참가 확인','사용자가 최종 확정'],['MY 내 경기','당일·경기 후로 연결']]) +
      grid(card('BRANCH 01','이미 로그인했다면','인증 단계를 건너뛰고 선택한 경기의 참가 확인으로 이동합니다.'),card('BRANCH 02','인증을 취소했다면','선택 맥락을 유지해 상세로 복귀하거나 인증을 다시 시도합니다.'),card('BRANCH 03','확정에 실패했다면','참가 상태를 확인하고 재시도합니다. 마감 등 참가 불가 상황은 다른 경기 탐색으로 연결합니다.')) +
      note('현재 구현 구조를 설명하는 IA와 Flow입니다. 서버 정원·참가 상태가 있는 Beta와 브라우저에 기록하는 샘플 앱의 저장 범위는 다릅니다.') + evidence('SERVICE-PLANNING-EVIDENCE.md','서비스 구조와 상태 기준')},
    {name:'Design Decisions & Demo', sub:'Decisions in the Product', html:
      head('06','DESIGN DECISIONS & DEMO','세 가지 설계 결정을,<br>실제로 동작하는 화면으로.','각 화면에서 무엇을 앞세웠는지, 어떤 흐름을 유지했는지 구현 결과와 함께 설명합니다.') +
      `<div class="decision-list"><article class="decision-row"><div><span class="eyebrow">DECISION 01 / GUEST FIRST</span><h2>가치를 본 뒤 로그인</h2><p>처음 온 사용자가 조건·추천·상세를 먼저 확인할 수 있게 하고, 참가 의도가 생긴 시점에 인증을 연결했습니다.</p><div class="decision-path">조건 설정 → 추천 → 상세 → 참가 시 인증</div><p class="small-copy">기대 효과: 가입 전 가치 판단. 이탈 감소 효과는 아직 측정하지 않았습니다.</p></div>${image('recommendation-home.png','조건 설정과 추천이 보이는 홈 화면','홈 · 추천부터 탐색')}</article><article class="decision-row"><div><span class="eyebrow">DECISION 02 / REASONS FIRST</span><h2>추천 점수보다 판단 근거</h2><p>생활권·레벨·포지션처럼 바로 비교할 수 있는 이유를 제시하고, 상세에서 참가 조건·시설·취소 정책을 함께 확인하도록 구성했습니다.</p><div class="decision-path">조건 해석 → 기준 기반 추천 → 이유 확인 → 상세 비교</div><p class="small-copy">AI는 요청을 조건으로 해석합니다. 후보·순위·이유는 추천 로직이 결정합니다.</p></div>${image('decision-detail.png','추천 이유와 참가 정보를 함께 제공하는 경기 상세','상세 · 참가 판단에 필요한 정보를 한곳에')}</article><article class="decision-row"><div><span class="eyebrow">DECISION 03 / PRESERVE & RECOVER</span><h2>실패 뒤에도 선택을 유지</h2><p>인증·참가 중단을 별도 상태로 안내하고 재시도·경기 다시 선택으로 연결했습니다. 알림 실패는 참가 사실과 구분해 다룹니다.</p><div class="decision-path">실패 안내 → 상태 확인 → 재시도 또는 재탐색</div><p class="small-copy">구현·QA 사례입니다. 사용자 성공률 개선 수치로 해석하지 않습니다.</p></div>${image('recovery-participation-failure.png','참가 확정 오류와 복구 행동을 안내하는 화면','복구 · 사용자가 다음 행동을 선택')}</article></div>` +
      `<div class="demo-panel"><div><span class="eyebrow">TRY FOOTMATE</span><h2>같은 흐름을 직접 확인하세요.</h2><p>조건 탐색 → 추천 이유 → 상세 → 참가 확인 → MY</p></div><div class="demo-actions"><a class="primary-link" href="/demo">샘플 앱 체험하기 ↗</a><a class="secondary-link" href="/beta">Closed Beta 보기 ↗</a></div></div>` +
      `<details><summary>프로토타입에서 현재 구현까지 · 근거 범위</summary><div class="detail-body"><p>초기 프로토타입 → 교육생 과업 검증 → 제품·운영 상태 고도화 → 배포 QA → KPI 측정 준비로 범위를 넓혔습니다. 사용자별 발견 문제와 후속 수정의 연결은 아직 미확정입니다.</p><p>과거 Lo-Fi → Hi-Fi 화면을 임의로 복원하지 않고, 현재 구현 화면과 남아 있는 QA 기록을 제시합니다. 샘플 앱의 경기·참가 기록과 Beta의 서버 상태를 구분합니다.</p>${evidence('USER-TEST-EVIDENCE.md','프로토타입·검증의 단계별 근거')}${evidence('RELEASE-HISTORY.md','개선·배포 QA 이력')}</div></details>`},
    {name:'Validation & Metrics', sub:'Evidence & Measurement', html:
      head('07','VALIDATION & METRICS','확인한 동작과,<br>앞으로 측정할 성과를 구분했습니다.','과업 기반 사용성 검증, 개발·배포 QA, 제품 KPI를 서로 다른 근거로 관리합니다.') +
      grid(card('USER TASKS','교육생 6명 · 과업 8회','iOS 4명 / Android 2명. 가입 전 탐색·Kakao·Google·이메일 가입 관련 과업을 수행했습니다.'),card('PRODUCT QA','상태·복구·접근성 확인','회귀·브라우저 E2E·axe·반응형·화면 비교·Mobile Safari/WebKit·배포 후 기본 동작을 검증했습니다.'),card('PRODUCT METRICS','8개 KPI · 측정 전 정의','계산 기준·분모·관찰 기간·제외 조건을 정의했습니다. 실제 이용자 기준값과 목표치는 아직 없습니다.')) +
      `<h2 class="block-title">개선·재검증 사례 · 개발 QA 근거</h2><div class="table-wrap"><table><caption class="sr-only">개발 QA에서 확인한 개선과 재검증 기록</caption><thead><tr><th scope="col">확인한 문제</th><th scope="col">수정</th><th scope="col">재검증 근거</th></tr></thead><tbody><tr><th scope="row">첫 추천까지 스크롤 부담</th><td>상단 여백·카드 밀도 조정</td><td>2026.09.24 · 390×844 첫 카드 노출, 601px 넘침 확인</td></tr><tr><th scope="row">참가 오류 후 복귀</th><td>오류 안내·재시도·경기 다시 선택</td><td>6.0.0 · 배포 핵심 동작 15개·앱 흐름 8개 QA 기록</td></tr><tr><th scope="row">필터 초기 색 대비</th><td>조작 전에도 대비 스타일 적용</td><td>2026.10.01 · E2E·axe·화면 비교·WebKit 기록</td></tr></tbody></table></div>` +
      note('위 사례는 개발·배포 QA 기록입니다. 교육생 6명의 개별 발견 문제에서 직접 도출된 수정이라고 연결하지 않습니다. 과업 성공률·소요 시간·만족도 개선 수치는 확정된 기록이 없습니다.') +
      `<details><summary>8개 KPI의 계산·관찰 기준</summary><div class="detail-body"><div class="table-wrap"><table><thead><tr><th scope="col">지표</th><th scope="col">계산</th><th scope="col">관찰 기준</th></tr></thead><tbody>${[
        ['상세 진입률','상세 진입 세션 ÷ 결과 노출 세션','결과 1개 이상 · 세션당 1회'],['참가 전환율','참가 완료 쌍 ÷ 상세 조회 사용자·경기 쌍','동일 경기 · 조회 후 24시간'],['결과 없음 비율','결과 0개 검색 ÷ 정상 처리 검색','네트워크·서버 오류 제외'],['참가 실패율','실패·미해결 흐름 ÷ 확정 요청 흐름','24시간 관찰 · 사용자 취소 분리'],['복구 성공률','목적 완료 흐름 ÷ 복구 가능한 실패 흐름','24시간 이내 · 대안 선택 별도'],['체크인 완료율','체크인 완료 쌍 ÷ 종료 경기 확정 참가 쌍','취소 제외 · 노쇼 포함'],['7일 내 재탐색률','재탐색 사용자 ÷ 7일 관찰 완료 참가 사용자','첫 완료 경기 기준 · 중복 제거'],['AI 검색 사용률','AI 요청 세션 ÷ AI 진입점 노출 세션','연결 AI와 규칙 복구 결과 분리']
      ].map(([a,b,c])=>`<tr><th scope="row">${a}</th><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table></div><p>실제 무료 Beta 이용자를 대상으로 운영·테스트 계정·자동 QA·샘플 앱을 제외합니다. 분모가 0이면 N/A로 기록합니다. 외부 분석 도구는 미연동이며, 첫 유효 측정값은 개선 성과가 아닌 기준값입니다.</p></div></details>` + evidence('USER-TEST-EVIDENCE.md','사용자 과업 원본') + evidence('RELEASE-HISTORY.md','QA·개선 이력') + evidence('BETA-MEASUREMENT-READINESS.md','Beta 측정 준비 기준')},
    {name:'Reflection', sub:'Learning & Limits', html:
      head('08','REFLECTION','연결 성공 이후의 상태까지,<br>설계해야 경험이 완성됩니다.','탐색·인증·참가를 연결하면서, 정상 경로뿐 아니라 중단·복구·운영 상태를 함께 정의해야 한다는 점을 배웠습니다.') +
      grid(card('KEEP','판단과 실행의 책임 분리','AI는 조건 해석, 추천 로직은 후보·순위·이유, 사용자는 참가 확정을 담당합니다. 판단 근거와 최종 행동의 책임을 분명히 했습니다.'),card('LEARNED','과업을 구체적으로 지정하기','자유 탐색만으로는 지나치지 않는 오류 구간이 있습니다. 확인할 행동을 지정해야 인증 방식·복귀 위치·상태 유지를 같은 조건에서 관찰할 수 있습니다.'),card('LEARNED','실패도 사용자 흐름의 일부','중복 요청·정원 경합·알림 실패·오래된 화면을 함께 다뤄야 합니다. 알림 전달 결과와 참가 사실처럼 서로 다른 상태를 분리했습니다.')) +
      `<div class="split reflection-bottom"><article class="story-card"><span class="eyebrow">LIMITS</span><h2>근거의 한계</h2><ul><li>Persona와 문제 정의는 설계 가설입니다.</li><li>6명 과업 검증은 시장 대표 표본이 아닙니다.</li><li>사용자별 발견 → 수정 → 재검증 연결 기록이 미확정입니다.</li><li>실제 전환·재이용 개선과 수익성은 미검증입니다.</li></ul></article><article class="closing-note"><span class="eyebrow">NEXT DESIGN PRINCIPLE</span><h2>기능의 수보다,<br>흐름과 근거의 연결.</h2><p>문제 → 행동 과업 → 상태·예외 → 수정 → 동일 조건 재검증을 하나의 기록으로 남기는 것을 다음 작업의 기준으로 삼습니다.</p></article></div>` + evidence('USER-TEST-EVIDENCE.md','검증 방식에서 얻은 학습') + evidence('SERVICE-PLANNING-EVIDENCE.md','설계·운영 회고')},
    {name:'Next Steps', sub:'What to Validate Next', html:
      head('09','NEXT STEPS','먼저 기준값을 확보하고,<br>한 번에 하나의 가설을 검증합니다.','남은 기능을 늘리기 전에 실제 Beta 이용과 과업 기록을 정리해 다음 개선의 우선순위를 판단하겠습니다.') +
      `<ol class="next-list">${[
        ['01','사용자 과업 기록 연결','참여자·과업별 관찰 → 문제 → 판단 → 수정 → 재검증을 기록합니다.','확인 기준 · 동일 동선의 막힘·복귀 상태와 재현 여부'],
        ['02','실제 Beta 기준값 확보','운영·테스트·자동 QA를 제외하고 이벤트·관찰 기간·누락 기준을 정리합니다.','확인 기준 · 표본 수·관찰 기간·분모·데이터 누락을 함께 보고'],
        ['03','이탈 구간에 따라 IA·흐름 개선','상세→참가가 낮다면 정보·인증·정원 구간을 나누고, 당일 참여가 낮다면 안내·알림·체크인을 확인합니다.','확인 기준 · 참가 전환·실패·복구·체크인 지표를 함께 비교'],
        ['04','추천·수익화의 확장 판단','조건 해석 오류와 경기 공급 부족을 구분합니다. 결제는 핵심 흐름 검증 이후 운영·정산 조건과 함께 판단합니다.','확인 기준 · AI 사용률만으로 품질을 판단하지 않고 후속 행동 확인']
      ].map(([n,title,body,criterion])=>`<li><span class="next-number">${n}</span><div><h2>${title}</h2><p>${body}</p><p class="small-copy">${criterion}</p></div></li>`).join('')}</ol>` +
      note('향후 검증 계획입니다. 관찰된 성과나 확정된 일정으로 제시하지 않습니다. 2차 IA는 실제 막힘과 이탈 근거를 확인한 뒤 수정합니다.') +
      `<div class="demo-panel"><div><span class="eyebrow">FOOTMATE / PROJECT</span><h2>설계에서 구현까지 확인하기</h2><p>샘플 앱 · 코드와 문서 · 검증 근거</p></div><div class="demo-actions"><a class="primary-link" href="/demo">제품 체험하기 ↗</a><a class="secondary-link" href="https://github.com/dohyunkimmm/footmate" target="_blank" rel="noopener">GitHub 보기 ↗</a></div></div>` + evidence('BETA-MEASUREMENT-READINESS.md','다음 측정의 준비 조건')}
  ];
  const toc = document.querySelector('.toc');
  const track = document.querySelector('.track');
  const dots = document.querySelector('.dots');
  toc.innerHTML = sections.map((s,i) => `<button class="toc-item" type="button" data-index="${i}"><span class="toc-n">${String(i+1).padStart(2,'0')}</span><span class="toc-copy"><span class="toc-t">${s.name}</span><span class="toc-s">${s.sub}</span></span></button>`).join('');
  track.innerHTML = sections.map((s,i) => `<section class="slide" id="section-${String(i+1).padStart(2,'0')}" aria-label="${s.name}" hidden>${s.html}</section>`).join('');
  dots.innerHTML = sections.map((s,i) => `<button class="dot" type="button" data-index="${i}" aria-label="${i+1}번 섹션 · ${s.name}"></button>`).join('');
  const slides = [...track.children];
  const prev = document.querySelector('.btn-prev');
  const next = document.querySelector('.btn-next');
  let current = 0;
  function fromUrl() { const match = location.hash.match(/^#section-(\d{1,2})$/); return match ? Number(match[1])-1 : 0; }
  function goTo(index, {historyMode='push', focus=true}={}) {
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
    if(focus) { slides[current].querySelector('h1').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
  }
  document.addEventListener('click', event => { const button = event.target.closest('.toc-item,.dot'); if(button)goTo(button.dataset.index); });
  prev.addEventListener('click', () => goTo(current-1));
  next.addEventListener('click', () => goTo(current+1));
  window.addEventListener('popstate', () => goTo(fromUrl(),{historyMode:null}));
  window.addEventListener('hashchange', () => goTo(fromUrl(),{historyMode:'replace'}));
  window.addEventListener('keydown', event => {
    if(event.altKey||event.ctrlKey||event.metaKey||event.isComposing||event.target.closest('input,textarea,select,[contenteditable],summary,a'))return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft') { event.preventDefault(); goTo(current+(event.key==='ArrowRight'?1:-1)); }
  });
  window.goTo = goTo;
  goTo(fromUrl(),{historyMode:'replace',focus:false});
})();
