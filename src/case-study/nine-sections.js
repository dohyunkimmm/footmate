/* FootMate Case Study · nine-stage narrative. Sources: Notion project page,
   SERVICE-PLANNING-EVIDENCE, USER-TEST-EVIDENCE and RELEASE-HISTORY. */
(() => {
  'use strict';
  const evidence = (file, label) => `<span class="evidence-record" role="listitem"><a href="/docs/${file}" target="_blank" rel="noopener noreferrer" aria-label="${label} · 원본 기록 열기">${label} ↗</a></span>`;
  const card = (label, title, body) => `<article class="story-card"><span class="eyebrow">${label}</span><h3>${title}</h3><p>${body}</p></article>`;
  const grid = (...items) => `<div class="card-grid">${items.join('')}</div>`;
  const head = (n, label, title, lead) => `<header class="section-head"><span class="eyebrow">${n} / ${label}</span><h1 tabindex="-1">${title.replaceAll('<br>', '<br class="cs-title-break"> ')}</h1><p class="lead">${lead}</p></header>`;
  const note = text => `<p class="source-note">${text}</p>`;
  const steps = items => `<ol class="flow">${items.map(([title, body], index) => `<li><span class="flow-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><strong>${title}</strong><span>${body}</span></li>`).join('')}</ol>`;
  const image = (file, alt, caption) => `<figure class="product-figure"><button class="evidence-preview" type="button" data-image="/src/case-study/evidence/${file}" data-image-title="${alt}" aria-label="${alt} · 화면 확대" aria-haspopup="dialog"><img src="/src/case-study/evidence/${file}" alt="${alt}" loading="lazy"></button><figcaption>${caption} <span class="image-view-hint" aria-hidden="true">· 확대 보기 ↗</span></figcaption></figure>`;
  const sections = [
  {
    "name": "Overview & Problem",
    "sub": "Project & Design Goal",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">01 / OVERVIEW & PROBLEM</span><h1 tabindex=\"-1\">내 수준과 포지션에 맞는 경기 매칭.</h1><p class=\"lead\">AI가 원하는 조건을 해석하고, 적합도 기준으로 개인과 풋살 경기를 연결합니다. 경기 후 경험은 다음 매칭에 반영합니다.</p></header><div class=\"overview-grid\"><div><div class=\"project-facts\"><div><span>역할</span><strong>단독 기획 · UX 설계 · 구축</strong><p>프로토타입 · 과업 검증 · QA · 배포</p></div><div><span>기간</span><strong>2026.06.08–현재</strong><p>AI 실무과정에서 시작 · 수료 후 고도화</p></div></div><div class=\"problem-statement\"><span class=\"eyebrow\">PROBLEM STATEMENT · 설계 가설</span><h2>내게 맞는 경기 판단과 다음 매칭의 단절</h2><p>레벨·거리·포지션·잔여 자리 비교<br>불분명한 추천 근거 · 경기 후 다음 행동 부재</p></div><div class=\"experience-actions\" aria-label=\"체험 환경 선택\"><a class=\"primary-link\" href=\"/demo\">Interactive Demo 직접 체험하기 <span aria-hidden=\"true\">↗</span></a></div><p class=\"small-copy experience-disclosure\">체험용 데이터 · 실제 참가·결제 없음</p></div><figure class=\"product-figure\"><button class=\"evidence-preview\" type=\"button\" data-image=\"/src/case-study/evidence/pc-matching-home.jpg\" data-image-title=\"FootMate의 추천 경기와 탐색 화면\" aria-label=\"FootMate의 추천 경기와 탐색 화면 · 화면 확대\" aria-haspopup=\"dialog\"><img src=\"/src/case-study/evidence/pc-matching-home.jpg\" alt=\"FootMate의 추천 경기와 탐색 화면\" loading=\"lazy\"></button><figcaption>1920px PC · 맞춤 경기 두 열 비교 · 참가비는 샘플 정보 <span class=\"image-view-hint\" aria-hidden=\"true\">· 확대 보기 ↗</span></figcaption></figure></div><div class=\"card-grid\"><article class=\"story-card\"><span class=\"eyebrow\">DECISION 01</span><h3>가치 확인 후 인증</h3><p>추천·상세 먼저 탐색 · 참가 시 로그인</p></article><article class=\"story-card\"><span class=\"eyebrow\">DECISION 02</span><h3>점수보다 매칭 근거</h3><p>맞는 점·실력 차이·포지션 마감을 함께 확인</p></article><article class=\"story-card\"><span class=\"eyebrow\">DECISION 03</span><h3>중단 후 복구</h3><p>선택 유지 · 재시도</p></article></div>"
  },
  {
    "name": "User Research",
    "sub": "Tasks & Findings",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">02 / USER RESEARCH</span><h1 tabindex=\"-1\">구체적인 행동 과업으로 탐색·가입 흐름을 확인했습니다.</h1><p class=\"lead\">교육생 6명에게 조건과 인증 방식을 나눠 요청한 소규모 과업 기반 사용성 검증입니다.</p></header><div class=\"card-grid\"><article class=\"story-card\"><span class=\"eyebrow\">PARTICIPANTS</span><h3>6명 · iOS 4 / Android 2</h3><p>같은 교육과정 수강생 · 숙련도·포지션 조건을 나눠 수행</p></article><article class=\"story-card\"><span class=\"eyebrow\">METHOD</span><h3>탐색·가입 과업 8회</h3><p>비회원 탐색·Kakao·Google·이메일 각 2회 · 일부 참여자 복수 수행</p></article><article class=\"story-card\"><span class=\"eyebrow\">LEARNING</span><h3>행동을 지정해 동선을 확인</h3><p>인증 방식·선택 유지·복귀 위치·모바일 차이를 관찰 단위로 정의</p></article></div><h2 class=\"block-title\">과업과 관찰 기준</h2><div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"과업・확인한 동선・관찰 기준\"><table><thead><tr><th scope=\"col\">과업</th><th scope=\"col\">확인한 동선</th><th scope=\"col\">관찰 기준</th></tr></thead><tbody><tr><th scope=\"row\">비회원 탐색</th><td>조건 → 추천·목록 → 상세</td><td>가입 전 탐색의 연결</td></tr><tr><th scope=\"row\">소셜 가입</th><td>참가 맥락 → 인증 → 원래 동선</td><td>이전 경기·복귀 위치 유지</td></tr><tr><th scope=\"row\">이메일 가입</th><td>가입 → 인증 → 로그인</td><td>상태 변화·재진입·모바일 차이</td></tr></tbody></table></div><p class=\"source-note\">과업 수행 근거는 있음 · 참여자별 발화·발견 이슈·수정 연결은 미확정. 시장 대표 조사나 실제 이용 성과로 확대하지 않음.</p><details><summary>리서치에서 얻은 학습과 기록 한계</summary><div class=\"detail-body\"><p>자유로운 체험만 요청하면 문제 구간을 지나가지 않을 수 있습니다. 확인할 행동을 지정하면 동선에 따른 막힘과 복귀를 같은 조건으로 확인하기 쉽습니다.</p><p>개별 사용자 인사이트나 발견 빈도를 임의로 만들지 않습니다. 다음 검증은 과업 → 관찰 → 판단 → 수정 → 재검증을 같은 기록에 남깁니다.</p><a href=\"/docs/USER-TEST-EVIDENCE.md\" target=\"_blank\" rel=\"noopener noreferrer\">과업 검증 원본 기록 ↗</a></div></details>"
  },
  {
    "name": "Persona & Journey",
    "sub": "Context & User Tasks",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">03 / PERSONA & JOURNEY</span><h1 tabindex=\"-1\">사용자 상황을 탐색부터 재참여까지 연결했습니다.</h1><p class=\"lead\">Persona는 설계 가설이며, 여정은 단계별 행동·막힘·설계 대응을 정리한 구조입니다.</p></header><details><summary>설계 Persona·JTBD</summary><div class=\"detail-body\"><div class=\"split\"><article class=\"persona-panel\"><span class=\"eyebrow\">DESIGN PERSONA · 검증 전 가설</span><h2>퇴근 후 한 경기를 고르는 플레이어</h2><dl><div><dt>이용 맥락</dt><dd>평일 저녁 · 주 1~2회 · 30분 안쪽 이동</dd></div><div><dt>선택 기준</dt><dd>레벨 · 거리 · 포지션 · 남은 자리</dd></div><div><dt>불안 요소</dt><dd>실력 차이 · 자리 마감 · 취소 규칙 · 경기 당일 변수</dd></div></dl></article><div class=\"jtbd-panel\"><span class=\"eyebrow\">JOB TO BE DONE</span><blockquote>퇴근 후 운동 시간 확보<br>일정·수준에 맞는 후보 판단<br>참가 확정 → 당일 준비</blockquote><p>맥락 → 선택 → 실행</p></div></div></div></details><div class=\"journey-map\" aria-label=\"설계 가설 기반 사용자 여정\"><article><span class=\"journey-number\">01</span><h2>Find · 탐색</h2><div><span class=\"eyebrow\">사용자 행동</span><p>오늘 갈 수 있는 경기 찾기</p></div><div class=\"pain\"><span class=\"eyebrow\">막힘 · 가설</span><p>시간·지역·레벨 비교 부담</p></div><div class=\"opportunity\"><span class=\"eyebrow\">설계 대응</span><p>AI 조건 해석 · 맞춤 경기 매칭</p></div></article><article><span class=\"journey-number\">02</span><h2>Decide · 판단</h2><div><span class=\"eyebrow\">사용자 행동</span><p>내게 맞는 후보 비교</p></div><div class=\"pain\"><span class=\"eyebrow\">막힘 · 가설</span><p>추천 이유·자리·취소 규칙이 불명확</p></div><div class=\"opportunity\"><span class=\"eyebrow\">설계 대응</span><p>맞는 점·확인할 점 · 상세 · 2경기 비교</p></div></article><article><span class=\"journey-number\">03</span><h2>Join · 참가</h2><div><span class=\"eyebrow\">사용자 행동</span><p>선택 경기에 참가 확정</p></div><div class=\"pain\"><span class=\"eyebrow\">막힘 · 가설</span><p>인증·확정 중단 시 선택 유실</p></div><div class=\"opportunity\"><span class=\"eyebrow\">설계 대응</span><p>참가 시 인증 · 선택 유지</p></div></article><article><span class=\"journey-number\">04</span><h2>Play · 경기</h2><div><span class=\"eyebrow\">사용자 행동</span><p>당일 준비하고 출석</p></div><div class=\"pain\"><span class=\"eyebrow\">막힘 · 가설</span><p>시간·체크인·변경 안내 재확인</p></div><div class=\"opportunity\"><span class=\"eyebrow\">설계 대응</span><p>MY · 당일 상태 · 체크인</p></div></article><article><span class=\"journey-number\">05</span><h2>Return · 재탐색</h2><div><span class=\"eyebrow\">사용자 행동</span><p>경험을 다음 선택에 반영</p></div><div class=\"pain\"><span class=\"eyebrow\">막힘 · 가설</span><p>경기 후 피드백과 다음 탐색이 분리됨</p></div><div class=\"opportunity\"><span class=\"eyebrow\">설계 대응</span><p>체감 난이도 피드백 · 다음 매칭 보정</p></div></article></div><p class=\"source-note\">예상 여정 · 감정 조사·점수화 미실시. 사용자 관찰 근거는 02에서 별도 확인.</p>"
  },
  {
    "name": "Scope & Priorities",
    "sub": "MVP & Trade-offs",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">04 / SCOPE & PRIORITIES</span><h1 tabindex=\"-1\">맞는 경기 연결을 중심으로, 참가와 복구까지.</h1><p class=\"lead\">개인과 경기의 적합도·판단 근거를 핵심 가치로 두고, 참가·복구·경기 후 경험을 연결합니다.</p></header><div class=\"priority-grid\"><article class=\"priority-card\"><span class=\"priority-tag\">Must</span><h2>핵심 동선의 완결</h2><p>지역·레벨·포지션 적합도 → 근거 확인 → 사용자 선택 · 참가·상태 복구</p><p class=\"priority-reason\">우선 기준 · 매칭 판단과 참가 흐름의 완결</p></article><article class=\"priority-card\"><span class=\"priority-tag\">Should</span><h2>선택과 운영의 보조</h2><p>경기 후 피드백과 다음 매칭 · 저장·비교 · 대기열·알림</p><p class=\"priority-reason\">기능 구현 완료 · 이용 효과는 검증 전</p></article><article class=\"priority-card\"><span class=\"priority-tag\">Could</span><h2>검증 후 고도화</h2><p>플레이 성향 · 조건 우선순위 개인화 · 매칭 효과 검증</p><p class=\"priority-reason\">착수 기준 · 실제 이용 중 막힘 확인</p></article><article class=\"priority-card\"><span class=\"priority-tag\">Won’t · 이번 범위</span><h2>유보한 확장</h2><p>실제 결제 · 수익화 검증 · AI의 자동 참가 확정</p><p class=\"priority-reason\">현재 범위 · 무료 참가 · 사용자 최종 확정</p></article></div><p class=\"source-note\">현재 제품 기준의 우선순위 · 과거 회의·정량 점수 근거 없음</p><details><summary>현재 구현 범위와 Trade-off</summary><div class=\"detail-body\"><p><strong>Interactive Demo · 기능 체험</strong><br>AI로 입력 조건 해석 · 경기·잔여 자리는 체험용 데이터<br>참가·체크인·피드백 기록은 체험한 브라우저에 저장<br>Google/Kakao 로그인 선택 시 Closed Beta로 이동<br>체험 기록은 Closed Beta로 옮겨지지 않음</p><p><strong>Closed Beta · 실제 서버 연결</strong><br>로그인·경기·정원·참가·취소·대기·체크인·알림 연동<br>무료 참가 · 실제 결제·외부 분석 도구 미연동</p><p><strong>참가 결정</strong><br>사용자 직접 확정 · 자동 실행 제외</p></div></details>"
  },
  {
    "name": "IA & Navigation",
    "sub": "Information Structure",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">05 / IA & NAVIGATION</span><h1 tabindex=\"-1\">홈·경기 찾기·MY의 역할을 나눴습니다.</h1><p class=\"lead\">정보 위치와 화면의 책임을 정의하고, 현재 상태에 맞는 다음 행동을 제공했습니다.</p></header><h2 class=\"block-title\">Information Architecture · 정보 구조</h2><div class=\"ia-tree\" aria-label=\"FootMate 아래 홈·경기 찾기·MY의 정보 구조\"><div class=\"ia-root\">FootMate</div><div class=\"ia-branches\"><article><h3>홈</h3><ul><li>맞춤 경기 · 매칭 근거</li><li>선호 조건 · 현재 경기</li><li>AI 추가 조건 입력</li></ul></article><article><h3>경기 찾기</h3><ul><li>목록 · 필터 · 정렬</li><li>경기 상세 · 저장</li><li>최대 2경기 비교</li></ul></article><article><h3>MY</h3><ul><li>내 경기 · 참가 전 빈 상태</li><li>참가 예정 · 경기 당일 · 완료</li><li>체크인 · 피드백 · 다음 탐색</li></ul></article></div></div><div class=\"card-grid\"><article class=\"story-card\"><span class=\"eyebrow\">HOME</span><h3>내 맞춤 경기와 매칭 근거</h3><p>맞춤 경기 먼저 · AI 추가 조건 · 현재 경기 이어보기</p></article><article class=\"story-card\"><span class=\"eyebrow\">DISCOVER</span><h3>조건 수정·전체 결과</h3><p>필터·정렬·비교·결과 없음 복구</p></article><article class=\"story-card\"><span class=\"eyebrow\">MY</span><h3>참가 기록과 다음 매칭</h3><p>참가 예정·당일·피드백·다음 추천</p></article></div>"
  },
  {
    "name": "Flowchart & Recovery",
    "sub": "Tasks & Decision Gates",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">06 / FLOWCHART & RECOVERY</span><h1 tabindex=\"-1\">참가 순서와 중단·복구 분기를 함께 정의했습니다.</h1><p class=\"lead\">정상 흐름뿐 아니라 인증 취소·포지션 마감·확정 실패의 다음 행동을 명시했습니다.</p></header><h2 class=\"block-title\">User Task Flow · 참가 과업</h2><p class=\"flow-guide small-copy\">01 → 06 순서 · 아래 예외 경로는 인증·참가 단계에서 분기</p><ol class=\"flow\"><li><span class=\"flow-number\" aria-hidden=\"true\">01</span><strong>조건 설정</strong><span>가입 전 매칭 기준 입력</span></li><li><span class=\"flow-number\" aria-hidden=\"true\">02</span><strong>매칭 근거·상세 비교</strong><span>맞는 점·확인할 점·포지션 자리 확인</span></li><li><span class=\"flow-number\" aria-hidden=\"true\">03</span><strong>참가하기</strong><span>선택 포지션 확인 · 가입 필요 여부 확인</span></li><li><span class=\"flow-number\" aria-hidden=\"true\">04</span><strong>인증·복귀</strong><span>체험 계정 로그인 후 선택 경기에서 참가 계속</span></li><li><span class=\"flow-number\" aria-hidden=\"true\">05</span><strong>무료 참가 확인</strong><span>사용자가 포지션과 무료 체험을 최종 확인</span></li><li><span class=\"flow-number\" aria-hidden=\"true\">06</span><strong>MY 내 경기</strong><span>당일·경기 후로 연결</span></li></ol><div class=\"flow-decision-gate\" aria-label=\"참가 과정의 실제 분기\"><span class=\"eyebrow\">DECISION GATES · 분기 기준</span><div class=\"flow-gate-track\"><div><strong>로그인 상태인가?</strong><span>인증 완료 시 04 단계 생략</span></div><div><strong>체험 계정 로그인을 취소했는가?</strong><span>선택한 경기를 유지하고 상세 화면으로 복귀</span></div><div><strong>포지션 마감 또는 참가 확정 실패인가?</strong><span>마감 시 다른 포지션 선택 · 실패 시 참가 여부 확인 후 재시도</span></div></div></div>"
  },
  {
    "name": "Wireframe & Screens",
    "sub": "Demo-based Specification",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">07 / WIREFRAME & SCREEN SPECIFICATION</span><h1 tabindex=\"-1\">만든 Demo를 화면 구조와 동작 명세로 정리했습니다.</h1><p class=\"lead\">1920px PC의 홈·경기 찾기를 우선 설계하고, 상세·참가·MY의 흐름을 함께 정리했습니다. PC는 두 열의 경기와 근거를 비교하고, 모바일에서는 한 열로 이어집니다. 현재 구현 기준 와이어프레임이며 초기 설계 원본은 아닙니다.</p></header><div class=\"wireframe-grid\"><article class=\"wireframe-record\"><h2>홈</h2><button class=\"evidence-preview\" type=\"button\" data-image=\"/src/case-study/evidence/wireframe-home.svg\" data-image-title=\"홈 와이어프레임\" aria-label=\"홈 와이어프레임 확대\" aria-haspopup=\"dialog\"><img src=\"/src/case-study/evidence/wireframe-home.svg\" alt=\"1920px PC 홈의 두 열 경기 비교와 AI 추가 조건 와이어프레임\"></button><p>내 조건 → 맞춤 경기·근거 → AI 추가 조건</p><p class=\"small-copy\">검색 실행 → 경기 찾기 / 카드 선택 → 상세</p></article><article class=\"wireframe-record\"><h2>경기 찾기</h2><button class=\"evidence-preview\" type=\"button\" data-image=\"/src/case-study/evidence/wireframe-discover.svg\" data-image-title=\"경기 찾기 와이어프레임\" aria-label=\"경기 찾기 와이어프레임 확대\" aria-haspopup=\"dialog\"><img src=\"/src/case-study/evidence/wireframe-discover.svg\" alt=\"1920px PC 경기 찾기의 적용 조건과 두 열 결과 와이어프레임\"></button><p>해석 조건·수정 → 매칭 근거 → 대안 탐색</p><p class=\"small-copy\">기존 조건 유지 / 결과 없음 → 한 조건씩 완화</p></article><article class=\"wireframe-record\"><h2>경기 상세</h2><button class=\"evidence-preview\" type=\"button\" data-image=\"/src/case-study/evidence/wireframe-detail.svg\" data-image-title=\"경기 상세 와이어프레임\" aria-label=\"경기 상세 와이어프레임 확대\" aria-haspopup=\"dialog\"><img src=\"/src/case-study/evidence/wireframe-detail.svg\" alt=\"현재 Demo의 경기 상세 정보 배치를 단순화한 와이어프레임\"></button><p>추천 이유 → 자리·시설 → 정책 → 참가</p><p class=\"small-copy\">저장·2경기 비교 / 선택 경기와 진입 경로 유지</p></article><article class=\"wireframe-record\"><h2>참가 확인</h2><button class=\"evidence-preview\" type=\"button\" data-image=\"/src/case-study/evidence/wireframe-join.svg\" data-image-title=\"참가 확인 와이어프레임\" aria-label=\"참가 확인 와이어프레임 확대\" aria-haspopup=\"dialog\"><img src=\"/src/case-study/evidence/wireframe-join.svg\" alt=\"현재 Demo의 참가 확인 정보 배치를 단순화한 와이어프레임\"></button><p>선택 경기 → 무료 체험 → 확인·복구</p><p class=\"small-copy\">미인증 시 체험 로그인 / 성공 상태만 MY로 연결</p></article><article class=\"wireframe-record\"><h2>MY</h2><button class=\"evidence-preview\" type=\"button\" data-image=\"/src/case-study/evidence/wireframe-my.svg\" data-image-title=\"MY 와이어프레임\" aria-label=\"MY 와이어프레임 확대\" aria-haspopup=\"dialog\"><img src=\"/src/case-study/evidence/wireframe-my.svg\" alt=\"현재 Demo의 MY 정보 배치를 단순화한 와이어프레임\"></button><p>내 경기 → 저장 경기 → 내 정보·설정</p><p class=\"small-copy\">참가 예정 → 당일 체크인 → 경기 후 피드백</p></article></div><p><a class=\"secondary-link\" href=\"https://www.figma.com/design/rvhwFauZFBsSnvHYitohgC?node-id=3-2\" target=\"_blank\" rel=\"noopener noreferrer\">Figma 이전 와이어프레임 원본 ↗</a></p><details><summary>화면별 표시·동작·예외 정의</summary><div class=\"detail-body\"><div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"화면・표시·동작・상태·예외\"><table><thead><tr><th scope=\"col\">화면</th><th scope=\"col\">표시·동작</th><th scope=\"col\">상태·예외</th></tr></thead><tbody><tr><th scope=\"row\">홈</th><td>기본 조건·1–2개 맞춤 경기·AI 추가 요청</td><td>참가 상태에 따라 MY 이어보기</td></tr><tr><th scope=\"row\">경기 찾기</th><td>해석 출처·조건 정정·필터·매칭 근거</td><td>결과 0개는 조건 완화·전체 해제</td></tr><tr><th scope=\"row\">상세</th><td>추천 이유·포지션 자리·정책·참가 CTA</td><td>포지션 마감 안내·이전 탐색 복귀</td></tr><tr><th scope=\"row\">참가 확인</th><td>선택 경기·포지션·청구 0원 확인</td><td>처리 중 중복 방지·실패 재시도</td></tr><tr><th scope=\"row\">MY</th><td>참가 예정·당일·완료에 따른 다음 행동</td><td>경기별 체크인·피드백 상태 유지</td></tr></tbody></table></div></div></details>"
  },
  {
    "name": "Functions & Policies",
    "sub": "Requirements & Exceptions",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">08 / FUNCTIONS & POLICIES</span><h1 tabindex=\"-1\">기능의 입력·결과와 운영 기준을 함께 정의했습니다.</h1><p class=\"lead\">기능 목록을 넘어 상태·예외·사용자 안내를 명세했습니다. Demo와 실제 서버 연결의 경계도 구분합니다.</p></header><div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"기능・입력·처리·결과・정책·예외\"><table><thead><tr><th scope=\"col\">기능</th><th scope=\"col\">입력·처리·결과</th><th scope=\"col\">정책·예외</th></tr></thead><tbody><tr><th scope=\"row\">경기 탐색</th><td>지역·레벨·포지션·추가 조건 → 경기 매칭·판단 근거</td><td>실력 차이·포지션 마감 표시 / 조건은 사용자 수정</td></tr><tr><th scope=\"row\">저장·비교</th><td>경기 ID 저장 → 재방문 복원·최대 2경기 비교</td><td>같은 경기 중복 비교 방지 / 닫은 뒤 초점 복귀</td></tr><tr><th scope=\"row\">참가</th><td>선택 경기·포지션 → 명시적 확인 → 성공 기록</td><td>AI 자동 참가 금지 / 처리 중 중복 요청 방지</td></tr><tr><th scope=\"row\">체크인</th><td>참가 경기 ID → 체크인 상태 기록</td><td>Demo는 로컬 예시 / Beta는 확정 참가·오픈 시각 확인</td></tr><tr><th scope=\"row\">경기 후</th><td>난이도·완료·반복 의도 → 다음 매칭 규칙 보정</td><td>완료 경기는 다음 후보에서 제외 / 실제 효과 미측정</td></tr></tbody></table></div><details><summary>정원·취소·체크인·데이터 정책</summary><div class=\"detail-body\"><div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"정책・기준・사용자 안내·복구\"><table><thead><tr><th scope=\"col\">정책</th><th scope=\"col\">기준</th><th scope=\"col\">사용자 안내·복구</th></tr></thead><tbody><tr><th scope=\"row\">체험 범위</th><td>샘플 경기·자리·가격 / 실제 청구 0원</td><td>Demo 기록은 현재 브라우저에만 저장</td></tr><tr><th scope=\"row\">인증·참가</th><td>가치 확인 후 인증 / 사용자가 참가 확정</td><td>취소·중단 후 선택 경기와 동선 유지</td></tr><tr><th scope=\"row\">실제 Beta 참가·취소</th><td>포지션 정원·경기별 취소 마감·권한 검증</td><td>취소 시 정원 복원 / 마감 후 사용자 취소 차단</td></tr><tr><th scope=\"row\">체크인·알림</th><td>확정 참가와 체크인 오픈 시각 확인</td><td>알림 실패와 참가 상태를 분리해 복구</td></tr><tr><th scope=\"row\">개인정보·데이터</th><td>Demo 로컬 기록 / 실제 인증은 별도 Beta</td><td>체험 기록 이전·기기 간 동기화로 표현하지 않음</td></tr></tbody></table></div></div></details><p class=\"source-note\">Notion PRD·Service Flow·기능정의서와 GitHub 운영 문서의 현재 계약을 요약. 실제 운영 성과가 아니라 설계·구현 근거.</p>"
  },
  {
    "name": "AI & Prototype",
    "sub": "Interpretation & Control",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">09 / AI & INTERACTIVE PROTOTYPE</span><h1 tabindex=\"-1\">AI가 요구를 이해하고, 매칭 기준이 맞는 경기를 연결합니다.</h1><p class=\"lead\">AI는 조건 해석 · 후보 순위와 근거는 규칙 엔진<br>개인 → 경기 매칭: 조건 해석 → 적합도·근거 확인 → 사용자 선택 → 경기 후 다음 매칭. 사람 간 궁합이나 균형 팀 편성은 이번 범위가 아닙니다.</p></header><div class=\"ai-contract\"><article class=\"story-card\"><span class=\"eyebrow\">01 · INPUT</span><h3>자연어 요청·현재 조건</h3><p>사용자 입력과<br>저장한 선호 조건</p></article><article class=\"story-card\"><span class=\"eyebrow\">02 · INTERPRET</span><h3>검색 조건으로 구조화</h3><p>지역·레벨·포지션<br>시간·가격·거리</p></article><article class=\"story-card\"><span class=\"eyebrow\">03 · RECOMMEND</span><h3>적합도·매칭 근거 결정</h3><p>경기 데이터와<br>규칙 기반 추천</p></article><article class=\"story-card\"><span class=\"eyebrow\">04 · CONFIRM</span><h3>조건 정정·참가 확인</h3><p>조건 수정 후<br>사용자가 최종 선택</p></article></div><div class=\"card-grid\"><article class=\"story-card\"><span class=\"eyebrow\">GUARDRAIL</span><h3>경기 사실 생성 금지</h3><p>AI가 경기·자리·순위를 임의 생성하지 않음 · 허용 조건과 범위 검증</p></article><article class=\"story-card\"><span class=\"eyebrow\">RECOVERY</span><h3>AI 실패에도 탐색 유지</h3><p>1회 대체 모델 → 기본 검색으로 복구 · 결과 없음은 사용자가 완화할 조건 선택</p></article><article class=\"story-card\"><span class=\"eyebrow\">USER CONTROL</span><h3>해석 조건 정정·직접 확정</h3><p>레벨 정정 · 필터 수정 · 참가 자동 실행 제외</p></article></div><p class=\"source-note\">AI 실제 연결·프로토타입 동작의 증빙이며, 실제 출시·운영 성과를 의미하지 않습니다.</p><details><summary>매칭 기준과 AI 역할 보기</summary><div class=\"detail-body\"><p>입력한 지역·시간·가격·거리·포지션 제한으로 후보를 좁히고, 경기 강도 차이·자리·생활권을 기준으로 비교합니다. 기본 프로필 추천은 가까운 대안도 보여주며 차이를 안내합니다.</p><p>체감 난이도는 다음 추천 수준에, 반복 의사는 지역·경기 형식 선호에 규칙으로 반영합니다. AI 모델 학습이나 사람 간 궁합 점수가 아닙니다.</p></div></details><details><summary>AI 매칭 화면과 복구 흐름</summary><div class=\"detail-body\"><p>자연어 입력 → 해석 조건 확인·정정 → 카탈로그 기반 매칭 결과 → 필요 시 조건 완화를 확인한 브라우저 테스트 캡처입니다. 아래 연결 응답 화면은 고정된 API 테스트 응답이며, 실제 AI 모델 호출의 성공 근거는 별도 운영 검사로 구분합니다.</p><div class=\"split ai-workflow-evidence\"><figure class=\"product-figure\"><button class=\"evidence-preview\" type=\"button\" data-image=\"/src/case-study/evidence/matching-ai-results.png\" data-image-title=\"AI 해석 조건과 매칭 결과\" aria-label=\"AI 해석 조건과 매칭 결과 · 화면 확대\" aria-haspopup=\"dialog\"><img src=\"/src/case-study/evidence/matching-ai-results.png\" alt=\"AI 해석 조건과 매칭 결과\" loading=\"lazy\"></button><figcaption>연결 응답 UI · 고정 테스트 응답 · 확대 보기 ↗</figcaption></figure><figure class=\"product-figure\"><button class=\"evidence-preview\" type=\"button\" data-image=\"/src/case-study/evidence/matching-rules-fallback.png\" data-image-title=\"AI 실패 후 기본 검색으로 해석한 조건\" aria-label=\"AI 실패 후 기본 검색으로 해석한 조건 · 화면 확대\" aria-haspopup=\"dialog\"><img src=\"/src/case-study/evidence/matching-rules-fallback.png\" alt=\"AI 실패 후 기본 검색으로 해석한 조건\" loading=\"lazy\"></button><figcaption>API 오류 상황 · 기본 검색 복구 · 확대 보기 ↗</figcaption></figure><figure class=\"product-figure\"><button class=\"evidence-preview\" type=\"button\" data-image=\"/src/case-study/evidence/matching-zero-before.png\" data-image-title=\"결과 없음에서 완화할 조건 선택\" aria-label=\"결과 없음에서 완화할 조건 선택 · 화면 확대\" aria-haspopup=\"dialog\"><img src=\"/src/case-study/evidence/matching-zero-before.png\" alt=\"결과 없음에서 완화할 조건 선택\" loading=\"lazy\"></button><figcaption>빈 결과 · 사용자가 완화 조건 선택 · 확대 보기 ↗</figcaption></figure><figure class=\"product-figure\"><button class=\"evidence-preview\" type=\"button\" data-image=\"/src/case-study/evidence/matching-zero-after.png\" data-image-title=\"가격만 완화하고 시간과 포지션을 유지한 결과\" aria-label=\"가격만 완화하고 시간과 포지션을 유지한 결과 · 화면 확대\" aria-haspopup=\"dialog\"><img src=\"/src/case-study/evidence/matching-zero-after.png\" alt=\"가격만 완화하고 시간과 포지션을 유지한 결과\" loading=\"lazy\"></button><figcaption>가격만 완화 · 나머지 조건 유지 · 확대 보기 ↗</figcaption></figure></div><p class=\"small-copy\">시나리오·커밋·원본 캡처 출처는 <a href=\"/docs/CASE-STUDY-SCREEN-EVIDENCE.md\" target=\"_blank\" rel=\"noopener noreferrer\">화면 근거 기록 ↗</a>에서 확인합니다. 샘플 경기·테스트 일정이며 실제 참가·매칭 효과를 의미하지 않습니다.</p></div></details>"
  },
  {
    "name": "Validation & UX",
    "sub": "Tasks & QA Improvements",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">10 / VALIDATION & UX IMPROVEMENT</span><h1 tabindex=\"-1\">발견한 문제를 수정하고 같은 조건으로 확인했습니다.</h1><p class=\"lead\">1920px PC를 우선 검증하고 모바일은 보조 기준으로 확인합니다. PC에서는 두 열 경기 비교·조건 정정·상세와 참가 포지션 일치·스크롤·확대 화면을 점검합니다. 아래 과거 QA 사례는 02의 사용자 과업 검증에서 직접 도출된 결과로 연결하지 않습니다.</p></header><div class=\"validation-source-keys\"><span><b>로직</b> · 상태·예외 계약</span><span><b>브라우저</b> · 핵심 과업·복귀</span><span><b>화면</b> · 접근성·반응형</span></div><h2 class=\"block-title\">문제 → 판단 → 수정 → 재검증</h2><div class=\"table-wrap qa-evidence-table\" tabindex=\"0\" role=\"region\" aria-label=\"개선·재검증 사례 표\" aria-describedby=\"qa-table-hint\"><table><caption class=\"sr-only\">개발 QA에서 확인한 개선과 재검증 기록</caption><thead><tr><th scope=\"col\">발견 문제</th><th scope=\"col\">수정</th><th scope=\"col\">재검증 결과</th></tr></thead><tbody><tr><th scope=\"row\">첫 추천까지 스크롤 부담</th><td>상단 여백·카드 밀도 조정</td><td>모바일 추천 카드 노출·가로 넘침 없음 확인</td></tr><tr><th scope=\"row\">참가 오류 후 복귀</th><td>오류 안내·재시도·경기 다시 선택</td><td>오류 후 재시도·경기 다시 선택 가능 확인</td></tr><tr><th scope=\"row\">필터 초기 색 대비</th><td>기본 상태에도 구분 색상 적용</td><td>기본 필터 구분·모바일 Safari 표시 확인</td></tr></tbody></table></div><p class=\"small-copy\" id=\"qa-table-hint\">구현 동작과 표시의 재검증 · 전환율·만족도 개선 성과를 의미하지 않음</p><details><summary>검증 방식·기록 보기</summary><div class=\"detail-body\"><p>상태·복구 회귀 / 브라우저 E2E / 키보드·axe / 반응형 / 모바일 WebKit<br>변경 후 같은 조건으로 핵심 동작과 화면을 재확인</p><p><a href=\"/docs/RELEASE-HISTORY.md\" target=\"_blank\" rel=\"noopener noreferrer\">개선·QA 이력 ↗</a></p></div></details><details><summary>추가할 매칭 검증 · 아직 미실시</summary><div class=\"detail-body\"><p>조건이 다른 두 사용자에게 적절한 경기와 확인할 차이를 고르게 하고, 선택·거절 이유를 기록합니다. 포지션 마감·실력 차이·결과 없음에서 판단 가능한지 확인합니다.</p><p>경기 후 피드백 전후의 추천과 근거를 비교하고, 순위가 유지되는 경우도 설명 가능한지 확인합니다. 추천 수용·체감 적합도·재참여는 향후 측정할 항목이며 기존 6명 과업·검색 28문장 검증의 성과로 표현하지 않습니다.</p></div></details>"
  },
  {
    "name": "Reflection & Next",
    "sub": "Learning & Validation",
    "html": "<header class=\"section-head\"><span class=\"eyebrow\">11 / REFLECTION & NEXT VALIDATION</span><h1 tabindex=\"-1\">매칭 이유를 이해하고, 경기 경험으로 다음 매칭을 검증합니다.</h1><p class=\"lead\">기획·프로토타입·과업 검증에서 확인한 학습과 아직 남은 검증 과제를 정리했습니다.</p></header><div class=\"card-grid\"><article class=\"story-card\"><span class=\"eyebrow\">KEEP</span><h3>판단·실행 책임 분리</h3><p>AI 해석 / 추천 로직 / 사용자 최종 확인</p></article><article class=\"story-card\"><span class=\"eyebrow\">LEARNED</span><h3>실패도 사용자 흐름</h3><p>인증 취소·정원 마감·중복 요청·알림 실패를 정상 경로와 함께 정의</p></article><article class=\"story-card\"><span class=\"eyebrow\">NEXT</span><h3>관찰과 수정 연결</h3><p>과업·관찰·판단·수정·재검증을 하나의 기록으로 보존</p></article></div><div class=\"split reflection-bottom\"><article class=\"story-card\"><span class=\"eyebrow\">LIMITS</span><h2>현재 근거의 범위</h2><ul><li>문제·Persona는 설계 가설</li><li>6명 과업 검증은 소규모 사용성 근거</li><li>실제 출시·전환 개선 성과는 제시하지 않음</li></ul></article><article class=\"closing-note\"><span class=\"eyebrow\">NEXT</span><h2>확인할 가설을 하나씩</h2><p>맞는 점·확인할 점 이해 → 추천 수용·거절 이유 → 경기 후 체감 적합도 → 다음 추천 변화를 과업별로 검증합니다. AI 검색 사용률·QA 통과를 매칭 성공률로 해석하지 않습니다.</p></article></div>"
  }
];
  const toc = document.querySelector('.toc');
  const track = document.querySelector('.track');
  const dots = document.querySelector('.dots');
  toc.innerHTML = sections.map((s,i) => `<button class="toc-item" type="button" data-index="${i}"><span class="toc-n">${String(i+1).padStart(2,'0')}</span><span class="toc-copy"><span class="toc-t">${s.name}</span></span></button>`).join('');
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
  track.querySelectorAll('.table-wrap:not(.qa-evidence-table) table').forEach(table=>{const labels=[...table.querySelectorAll('thead th')].map(n=>n.textContent.trim());table.querySelectorAll('tbody tr').forEach(row=>row.querySelectorAll('td').forEach((cell,index)=>cell.dataset.label=labels[index+1]));});
  // Numbered wireframes share one viewer, while evidence images retain a single-image view.
  const wirePreviews=[...track.querySelectorAll('#section-07 .evidence-preview')];
  wirePreviews.forEach((preview,index)=>{
    const record=preview.closest('.wireframe-record');
    const number=document.createElement('span');
    number.className='wireframe-step eyebrow';
    number.textContent=String(index+1).padStart(2,'0')+' / 05';
    record.prepend(number);
  });
  const imageDialog=document.createElement('dialog');
  imageDialog.className='image-dialog';
  imageDialog.setAttribute('aria-labelledby','image-dialog-title');
  imageDialog.innerHTML='<div class="image-dialog-header"><div><span class="image-dialog-position eyebrow" aria-live="polite" hidden></span><h2 id="image-dialog-title">화면 확대</h2></div><button type="button" class="image-dialog-close" autofocus>닫기 ×</button></div><p class="image-dialog-caption" hidden></p><div class="image-dialog-body" tabindex="0" role="region" aria-label="확대 이미지"><img alt=""></div><div class="image-dialog-navigation" hidden><button type="button" class="image-dialog-prev" aria-label="이전 와이어프레임">← 이전 화면</button><button type="button" class="image-dialog-next" aria-label="다음 와이어프레임">다음 화면 →</button></div>';
  document.body.appendChild(imageDialog);
  const imagePosition=imageDialog.querySelector('.image-dialog-position');
  const imageCaption=imageDialog.querySelector('.image-dialog-caption');
  const imageNavigation=imageDialog.querySelector('.image-dialog-navigation');
  const imagePrev=imageDialog.querySelector('.image-dialog-prev');
  const imageNext=imageDialog.querySelector('.image-dialog-next');
  let imageOrigin=null;
  let wireIndex=-1;
  function showImage(preview){
    wireIndex=wirePreviews.indexOf(preview);
    const gallery=wireIndex>=0;
    imageDialog.querySelector('h2').textContent=preview.dataset.imageTitle;
    const expanded=imageDialog.querySelector('img');
    expanded.src=preview.dataset.image;
    expanded.alt=preview.dataset.imageTitle;
    imagePosition.hidden=imageCaption.hidden=imageNavigation.hidden=!gallery;
    if(gallery){
      imagePosition.textContent=String(wireIndex+1).padStart(2,'0')+' / 05';
      imageCaption.textContent=preview.closest('.wireframe-record').querySelector('p').textContent;
      imagePrev.disabled=wireIndex===0;
      imageNext.disabled=wireIndex===wirePreviews.length-1;
    }
    imageDialog.querySelector('.image-dialog-body').scrollTop=0;
  }
  function moveImage(offset){
    if(wireIndex<0)return;
    const target=wireIndex+offset;
    if(target<0||target>=wirePreviews.length)return;
    const focusedButton=document.activeElement;
    showImage(wirePreviews[target]);
    // Keep focus usable when the current navigation button becomes disabled.
    if(focusedButton===imagePrev&&imagePrev.disabled)imageNext.focus();
    if(focusedButton===imageNext&&imageNext.disabled)imagePrev.focus();
  }
  imagePrev.addEventListener('click',()=>moveImage(-1));
  imageNext.addEventListener('click',()=>moveImage(1));
  imageDialog.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.isComposing)return;
    if(wireIndex>=0&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){
      event.preventDefault();
      event.stopPropagation();
      moveImage(event.key==='ArrowRight'?1:-1);
    }
  });
  imageDialog.querySelector('.image-dialog-close').addEventListener('click',()=>imageDialog.close());
  imageDialog.addEventListener('close',()=>{
    if(imageOrigin?.isConnected)imageOrigin.focus({preventScroll:true});
    wireIndex=-1;
  });
  document.addEventListener('click',event=>{
    const preview=event.target.closest('.evidence-preview');
    if(!preview)return;
    imageOrigin=preview;
    showImage(preview);
    imageDialog.showModal();
    imageDialog.querySelector('.image-dialog-close').focus();
  });
  // Connect actual exception descriptions to their numbered task steps.
  const flowSteps=[...track.querySelectorAll('#section-06 .flow>li')];
  const flowGates=[...track.querySelectorAll('#section-06 .flow-gate-track>div')];
  const gateSteps=[[3,4],[4],[3,5]];
  const flowStatus=document.createElement('p');
  flowStatus.className='flow-selection-status small-copy';
  flowStatus.setAttribute('aria-live','polite');
  flowStatus.textContent='단계나 분기 기준을 선택하면 연결된 경로가 함께 강조됩니다.';
  track.querySelector('#section-06 .flow-decision-gate').appendChild(flowStatus);
  function selectFlow(step,gate){
    flowSteps.forEach((item,index)=>{
      const active=step===index+1||(gate!==null&&gateSteps[gate].includes(index+1));
      item.classList.toggle('flow-linked',active);
      item.querySelector('button').setAttribute('aria-pressed',String(active));
    });
    flowGates.forEach((item,index)=>{
      const active=gate===index||(step!==null&&gateSteps[index].includes(step));
      item.classList.toggle('flow-linked',active);
      item.querySelector('button').setAttribute('aria-pressed',String(active));
    });
    if(gate!==null)flowStatus.textContent=gateSteps[gate].map(n=>String(n).padStart(2,'0')).join(' · ')+' 단계 연결 · '+flowGates[gate].querySelector('span').textContent;
    else{
      const related=flowGates.filter((_,i)=>gateSteps[i].includes(step)).map(item=>item.querySelector('strong').textContent);
      flowStatus.textContent=String(step).padStart(2,'0')+' 단계 · '+(related.length?related.join(' / '):'별도 예외 분기 없이 다음 단계로 이어집니다.');
    }
  }
  flowSteps.forEach((item,index)=>{
    const title=item.querySelector('strong');
    const button=document.createElement('button');
    button.type='button';
    button.className='flow-step-button';
    button.setAttribute('aria-pressed','false');
    button.setAttribute('aria-label',String(index+1).padStart(2,'0')+' 단계 · '+title.textContent);
    title.replaceWith(button);
    button.appendChild(title);
    button.addEventListener('click',()=>selectFlow(index+1,null));
  });
  flowGates.forEach((item,index)=>{
    const badge=document.createElement('span');
    badge.className='flow-gate-step eyebrow';
    badge.textContent=gateSteps[index].map(n=>String(n).padStart(2,'0')).join(' · ')+' 단계';
    const button=document.createElement('button');
    button.type='button';
    button.className='flow-gate-button';
    button.setAttribute('aria-pressed','false');
    button.append(badge,...item.childNodes);
    item.appendChild(button);
    button.addEventListener('click',()=>selectFlow(null,index));
  });
  // Emphasize recorded QA changes without presenting them as user outcome metrics.
  qaTable.querySelectorAll('tbody tr').forEach((row,index)=>{
    const title=row.querySelector('th');
    const number=document.createElement('span');
    number.className='qa-case-number eyebrow';
    number.textContent='CASE '+String(index+1).padStart(2,'0');
    title.prepend(number);
    const result=row.querySelectorAll('td')[1];
    result.classList.add('qa-confirmed-result');
    const text=document.createElement('strong');
    text.textContent=result.textContent;
    result.replaceChildren(text);
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
    const position = `${String(current+1).padStart(2,'0')} / ${String(sections.length).padStart(2,'0')}`;
    document.querySelector('.topbar-count').textContent = position;
    document.querySelector('.reader-position').textContent = `${position} · ${sections[current].name}`;
    document.querySelector('.pbar-fill').style.width = `${(current+1)/sections.length*100}%`;
    prev.disabled = current===0; next.disabled = current===sections.length-1;
    prev.innerHTML = `<span aria-hidden="true">←</span><span><small>${current===0?'첫 섹션':'이전 섹션'}</small>${sections[Math.max(0,current-1)].name}</span>`;
    next.innerHTML = `<span><small>${current===sections.length-1?'마지막 섹션':'다음 섹션'}</small>${sections[Math.min(sections.length-1,current+1)].name}</span><span aria-hidden="true">→</span>`;
    const hash = `#section-${String(current+1).padStart(2,'0')}`;
    if(historyMode && location.hash!==hash)history[historyMode==='replace'?'replaceState':'pushState'](null,'',location.pathname+location.search+hash);
    if(innerWidth<=800) {
      const button=toc.querySelectorAll('button')[current];
      const buttonRect=button.getBoundingClientRect();
      const tocRect=toc.getBoundingClientRect();
      toc.scrollTo({left:toc.scrollLeft+buttonRect.left-tocRect.left-(toc.clientWidth-buttonRect.width)/2,behavior:'instant'});
    }
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
  const navigationType=performance.getEntriesByType('navigation')[0]?.type;
  if(navigationType!=='back_forward'){
    history.scrollRestoration='manual';
    const resetInitialScroll=()=>window.scrollTo({top:0,left:0,behavior:'instant'});
    resetInitialScroll();
    // Native fragment positioning runs after the initial script on navigation.
    const resetAfterLoad=()=>requestAnimationFrame(()=>{
      resetInitialScroll();
      requestAnimationFrame(resetInitialScroll);
    });
    if(document.readyState==='complete')resetAfterLoad();
    else window.addEventListener('load',resetAfterLoad,{once:true});
  }
})();

