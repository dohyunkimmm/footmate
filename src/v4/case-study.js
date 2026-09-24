/* FootMate v4.0 · Matchday Companion Case Study */
(function(){
  const sections=[
    ['Overview','Matchday Companion'],
    ['Problem','판단이 오래 걸리는 경기 탐색'],
    ['Persona · JTBD','퇴근 후 바로 결정할 수 있는 확신'],
    ['Product Thesis','경기 찾기에서 경기 당일까지'],
    ['Core Journey','Find → Decide → Join → Play → Return'],
    ['Decision 01','추천 먼저, 로그인은 나중'],
    ['Decision 02','점수보다 추천 이유'],
    ['Decision 03','참가 결정에 집중'],
    ['Sign in','참가 직전의 로그인'],
    ['Join · Payment','선택을 잃지 않는 참가'],
    ['Matchday','참가 후가 홈의 중심'],
    ['Recovery','막혔을 때 다음 행동'],
    ['IA · Modes','사용자 화면과 리뷰 화면 분리'],
    ['System Evidence','상태·데이터·연동 경계'],
    ['Validation','반응형·접근성·Production'],
    ['Outcome · Limits','현재 성과와 남은 범위']
  ];

  function card(title,copy,meta=''){
    return `<article class="fm-next-cs-card">${meta?`<small>${meta}</small>`:''}<h3>${title}</h3><p>${copy}</p></article>`;
  }
  function metric(value,label){
    return `<div class="fm-next-cs-metric"><b>${value}</b><span>${label}</span></div>`;
  }
  function shell(kicker,title,lead,body,aside=''){
    return `<div class="fm-next-story"><div class="fm-next-story-copy"><div class="fm-next-story-kicker">${kicker}</div><h2>${title}</h2><p class="fm-next-story-lead">${lead}</p>${body}</div>${aside?`<aside class="fm-next-story-aside">${aside}</aside>`:''}</div>`;
  }

  const slides=[
    `<div class="fm-next-cover cover">
      <div class="fm-next-cover-copy">
        <div class="fm-next-cover-kicker">FootMate · Matchday Companion</div>
        <h1><span class="fm-next-cover-title-line">내 수준에 맞는 경기부터,</span><span class="fm-next-cover-title-line">경기 당일까지.</span></h1>
        <p class="fm-next-cover-lead">경기를 찾는 데서 끝나지 않고, <strong>나에게 맞는 이유를 이해한 뒤 안심하고 참가하고 경기 당일까지 이어지는</strong> 풋살 경험을 설계했습니다.</p>
        <div class="fm-next-cover-actions"><a href="/demo">제품 직접 체험하기 <span aria-hidden="true">↗</span></a></div>
        <div class="fm-next-cover-flow" aria-label="핵심 사용자 흐름"><b>Find</b><i>→</i><b>Decide</b><i>→</i><b>Join</b><i>→</i><b>Play</b><i>→</i><b>Return</b></div>
        <div class="fm-next-cover-proof"><div><b>가입 전에 추천부터</b><span>계정을 만들기 전에 경기 추천을 확인합니다.</span></div><div><b>추천 이유를 바로 이해</b><span>점수보다 레벨·거리·남은 자리를 먼저 봅니다.</span></div><div><b>참가 뒤 일정까지 연결</b><span>결제에서 끝내지 않고 체크인과 경기 후까지 이어집니다.</span></div></div>
      </div>
      <div class="fm-next-cover-visual" aria-label="FootMate AI 경기 검색 정적 미리보기"><div class="fm-next-cover-glow" aria-hidden="true"></div><div class="fm-next-cover-frame"><div class="fm-cs-static-preview" role="img" aria-label="FootMate Real App AI 경기 검색 화면 정적 프리뷰"><div class="fm-cs-static-top"><span>FootMate</span><b>경기 찾기</b></div><div class="fm-cs-static-section-head"><h3>수원 · 영통 추천 경기</h3><p>초급 · MF 기준 · 가까운 순</p></div><section class="fm-cs-static-ai" aria-label="AI Match Assistant 정적 화면"><div class="fm-cs-static-ai-kicker"><small>AI MATCH ASSISTANT</small><em>AI ready</em></div><h4>원하는 경기를 문장으로 검색하세요.</h4><p>필터와 함께 사용해 시간·거리·가격·포지션 조건을 빠르게 좁힐 수 있어요.</p><span class="fm-cs-static-ai-label">찾고 싶은 경기 조건</span><div class="fm-cs-static-ai-input"><span>예: 8시 이후, 2만원 이하, 가까운 중급 MF 경기</span><b>AI 검색</b></div><div class="fm-cs-static-ai-examples"><span>8시 이후 · 2만원 이하</span><span>인계 · 초급</span><span>20분 이내 · GK</span></div><div class="fm-cs-static-ai-status"><b>자연어로 조건을 입력해보세요.</b><span>AI 장애나 지연 시 기존 rules-based 검색으로 자동 전환합니다.</span></div></section><div class="fm-cs-static-match-tags"><span>수원 · 영통</span><span>MF</span><span>초급</span></div><div class="fm-cs-static-match-row"><div><small>오늘 20:00</small><b>수원 풋살파크</b><span>15분 거리 · MF 1자리</span></div><strong>12,000원</strong></div></div></div><div class="fm-next-cover-note"><strong>정적 AI 검색 프리뷰</strong><span>실제 체험은 Demo에서</span></div></div>
    </div>`,

    shell('01 · PROBLEM','경기는 많아도, 나에게 맞는 한 경기를 고르기는 어렵습니다.','시간, 거리, 레벨, 포지션, 남은 자리와 가격을 따로 확인해야 했습니다. 참가한 뒤에는 일정과 경기 당일 정보가 다시 흩어져 흐름이 끊겼습니다.',
      `<div class="fm-next-cs-grid three">${card('조건을 따로 확인해야 함','경기 하나를 고르려면 여러 정보를 머릿속에서 다시 맞춰 봐야 했습니다.')}${card('로그인이 너무 일찍 등장','추천이 어떤지 보기 전에 가입부터 요구하면 서비스 가치를 판단하기 어렵습니다.')}${card('참가 뒤 흐름이 끊김','결제 이후 일정, 체크인, 경기 후 평가가 각각 다른 기능처럼 느껴졌습니다.')}</div>`,
      `<div class="fm-next-cs-quote"><span>핵심 질문</span><b>“오늘 내가 안심하고 뛸 경기를 더 빨리 결정하려면 무엇이 필요할까?”</b></div>`),

    shell('02 · PERSONA / JTBD','퇴근 후 30분 안에 갈 수 있는 경기를, 오래 고민하지 않고 고르고 싶습니다.','대표 사용자는 평일 저녁에 주 1~2회 풋살을 즐기는 직장인 플레이어입니다. 실력 차이와 이동 시간을 빠르게 가늠하고, 참가한 뒤에도 놓칠 일이 없는 경험을 원합니다.',
      `<div class="fm-next-cs-persona"><div><span>주요 상황</span><b>평일 저녁 · 30분 안쪽 이동 · 주 1~2회</b></div><div><span>결정 기준</span><b>레벨 · 거리 · 포지션 · 남은 자리</b></div><div><span>불안 요소</span><b>실력 차이 · 자리 마감 · 취소 규칙 · 경기 당일 변수</b></div></div>`,
      `<div class="fm-next-cs-jtbd"><small>JTBD</small><p>“오늘 뛸 수 있는 경기 중 <strong>나와 잘 맞는 이유를 빠르게 이해하고</strong>, 참가한 뒤에도 다음 행동을 놓치지 않고 싶다.”</p></div>`),

    shell('03 · PRODUCT THESIS','FootMate의 범위를 “경기 찾기”에서 “경기 당일까지”로 넓혔습니다.','좋은 검색 결과를 보여주는 것만으로는 충분하지 않았습니다. 경기를 발견하고, 결정하고, 참가하고, 실제로 뛰고, 다음 경기로 돌아오는 흐름 전체를 하나의 경험으로 묶었습니다.',
      `<div class="fm-next-cs-loop"><b>Find</b><span>맞는 경기 발견</span><i>→</i><b>Decide</b><span>추천 이유 확인</span><i>→</i><b>Join</b><span>로그인·결제</span><i>→</i><b>Play</b><span>경기 당일</span><i>→</i><b>Return</b><span>평가·다음 경기</span></div>`,
      `<div class="fm-next-cs-principles">${card('추천을 먼저 보여주기','계정을 만들기 전에 서비스가 어떤 가치를 주는지 확인할 수 있게 했습니다.')}${card('점수보다 이유를 보여주기','매칭 퍼센트보다 레벨, 거리, 남은 자리처럼 바로 판단할 수 있는 정보를 앞에 뒀습니다.')}${card('현재 상태에 맞춰 홈 바꾸기','참가 전, 참가 후, 경기 당일, 경기 후에 필요한 정보가 홈의 우선순위를 바꿉니다.')}</div>`),

    shell('04 · CORE JOURNEY','전체 경험을 다섯 번의 사용자 행동으로 묶었습니다.','화면 수가 아니라 사용자가 실제로 무엇을 하려는지 기준으로 흐름을 다시 정리했습니다. 각 단계가 끝나면 다음 행동이 자연스럽게 이어지도록 정보와 CTA를 배치했습니다.',
      `<div class="fm-next-cs-journey"><div><b>01</b><h3>Find</h3><p>지역·포지션·레벨을 정하고 추천을 봅니다.</p></div><div><b>02</b><h3>Decide</h3><p>레벨·거리·자리·가격을 한 번에 비교합니다.</p></div><div><b>03</b><h3>Join</h3><p>참가할 때 로그인하고 선택을 유지한 채 결제로 갑니다.</p></div><div><b>04</b><h3>Play</h3><p>경기 당일에는 이동과 체크인 정보를 먼저 봅니다.</p></div><div><b>05</b><h3>Return</h3><p>경기 후 평가를 남기고 다음 경기를 찾습니다.</p></div></div>`,
      `<a class="fm-next-cs-link" href="/app?mode=guided" target="_blank" rel="noopener">Guided 모드로 흐름 보기 <span>↗</span></a>`),

    shell('05 · DESIGN DECISION 01','회원가입은 첫 화면이 아니라 “참가하기”를 누른 뒤에 나옵니다.','처음 온 사용자는 아직 FootMate의 추천이 자신에게 도움이 되는지 모릅니다. 그래서 지역·포지션·레벨만 정하면 추천과 경기 상세까지 먼저 볼 수 있게 했습니다.',
      `<div class="fm-next-cs-before-after"><div><small>BEFORE</small><b>첫 화면 → 로그인 → 설문 → 추천</b><p>서비스 가치를 보기 전에 계정부터 요구</p></div><div class="is-after"><small>V4</small><b>가치 확인 → 조건 설정 → 추천 → 상세 → 참가 시 로그인</b><p>추천을 확인한 뒤 참가 의도가 생겼을 때 로그인</p></div></div>`,
      `<div class="fm-next-cs-decision"><span>설계 기준</span><b>로그인은 탐색을 막는 문이 아니라, 참가 계약을 시작하는 시점에 둡니다.</b></div>`),

    shell('06 · DESIGN DECISION 02','추천 카드는 점수보다 “왜 이 경기가 맞는지”를 먼저 보여줍니다.','설명 가능성을 없앤 것이 아니라 보여주는 순서를 바꿨습니다. 카드에는 바로 판단할 수 있는 이유만 남기고, 자세한 계산 근거는 경기 상세에서 확인하도록 했습니다.',
      `<div class="fm-next-cs-reco"><div class="fm-next-cs-reco-card"><span>오늘 20:00 · 수원 인계</span><h3>내 수준과 잘 맞아요</h3><div><b>ELO 차이 적음</b><b>15분 거리</b><b>MF 1자리</b></div><strong>12,000원</strong></div><div class="fm-next-cs-stack"><p><b>1.</b> 경기 시각과 장소</p><p><b>2.</b> 나와 맞는 이유 2~3개</p><p><b>3.</b> 남은 포지션과 가격</p><p><b>4.</b> 자세한 근거는 상세에서</p></div></div>`,
      `<div class="fm-next-cs-note">ELO는 추천 근거 중 하나로 사용하지만, 첫 판단 화면을 계산 수치로 채우지는 않습니다.</div>`),

    shell('07 · DESIGN DECISION 03','경기 상세는 정보를 모아두는 곳이 아니라, 참가 여부를 결정하는 곳입니다.','사용자가 실제로 확인하는 순서에 맞춰 시간·장소 → 나와 맞는 이유 → 남은 자리 → 참가자와 시설 → 취소 규칙으로 정리했습니다. 핵심 CTA도 “참가하기” 하나로 좁혔습니다.',
      `<div class="fm-next-cs-detail-order"><span>시간 · 장소</span><i>↓</i><span>나와 맞는 이유</span><i>↓</i><span>자리 · 포지션</span><i>↓</i><span>참가자 · 시설</span><i>↓</i><span>취소 · 환불</span></div>`,
      `<div class="fm-next-cs-sticky"><small>핵심 행동</small><b>참가하기 · 12,000원</b><p>보조 행동을 경쟁시키지 않고, 사용자가 지금 결정해야 할 한 가지 행동을 분명하게 남겼습니다.</p></div>`),

    shell('08 · SIGN IN','로그인은 참가 직전에 한 번만 끼어듭니다.','아이디·비밀번호 로그인과 Kakao·Naver·Apple·Google SSO 선택지를 함께 보여줍니다. 어떤 방식을 골라도 경기 상세에서 선택한 경기는 그대로 유지되고 결제로 이어집니다.',
      `<div class="fm-next-cs-auth-flow"><div><small>둘러보기</small><b>추천·상세 확인</b></div><i>→</i><div><small>참가 의도</small><b>참가하기</b></div><i>→</i><div class="is-focus"><small>로그인</small><b>ID·PW / Kakao / Naver / Apple / Google</b></div><i>→</i><div><small>다음 단계</small><b>결제</b></div></div>`,
      `<div class="fm-next-cs-scope"><span>구현 범위</span><b>로그인 화면 · 입력 검증 · 브라우저 세션 상태 전환</b><p>실제 OAuth, 회원 DB, 서버 인증 세션은 연결하지 않은 UX 시뮬레이션입니다.</p></div>`),

    shell('09 · JOIN / PAYMENT','로그인 뒤에도 고른 경기와 참가비가 그대로 이어집니다.','사용자가 경기 상세에서 이미 내린 결정을 다시 반복하지 않도록 선택한 경기, 참가비와 참가 의도를 유지한 채 로그인 → 결제 → 참가 완료로 연결했습니다.',
      `<div class="fm-next-cs-state-line"><span>selectedMatchId</span><i>→</i><span>signedIn</span><i>→</i><span>checkout</span><i>→</i><span>joinedMatchId</span><i>→</i><span>upcoming</span></div><div class="fm-next-cs-grid three">${card('선택 유지','로그인 전후에도 사용자가 고른 경기가 바뀌지 않습니다.')}${card('한 번의 참가 의도','결제 CTA를 여러 단계에서 반복해 누르게 만들지 않습니다.')}${card('완료 뒤 다음 목적지','참가가 끝나면 바로 “내 경기”에서 일정과 준비 정보를 확인합니다.')}</div>`,
      `<div class="fm-next-cs-note">결제는 샘플 상태 전환입니다. 실제 PG, 잔액, 영수증 API는 연결하지 않았습니다.</div>`),

    shell('10 · MATCHDAY','참가가 확정되면 홈의 우선순위가 바뀝니다.','예약 전에는 추천 경기를, 예약 후에는 다가오는 경기를, 경기 당일에는 이동과 체크인을, 경기 후에는 평가와 다음 행동을 먼저 보여줍니다.',
      `<div class="fm-next-cs-day-states"><div><small>탐색 중</small><b>지금 잘 맞는 경기</b></div><div><small>참가 확정</small><b>다가오는 경기</b></div><div class="is-focus"><small>경기 당일</small><b>경기까지 1시간 20분</b><p>길찾기 · 체크인 · 운영 도움</p></div><div><small>경기 후</small><b>오늘 경기, 어땠나요?</b></div></div>`,
      `<a class="fm-next-cs-link" href="/app?mode=evidence" target="_blank" rel="noopener">상태 시나리오 보기 <span>↗</span></a>`),

    shell('11 · RECOVERY','막혔을 때는 오류 설명보다 다음 행동을 먼저 보여줍니다.','추천 결과가 없거나 자리가 마감되고, 결제가 실패하거나 경기 당일 문제가 생길 수 있습니다. 각 상황에서 사용자가 다시 진행할 수 있는 선택지를 바로 붙였습니다.',
      `<div class="fm-next-cs-recovery"><div><b>추천 없음</b><span>조건 완화 · 지역/시간 수정</span></div><div><b>자리 마감</b><span>대기 등록 · 비슷한 경기 탐색</span></div><div><b>결제 실패</b><span>재시도 · 결제수단 변경</span></div><div><b>경기 당일 문제</b><span>체크인 재시도 · 운영 도움</span></div></div>`,
      `<div class="fm-next-cs-decision"><span>복구 원칙</span><b>무슨 일이 생겼는지 설명하는 데서 끝내지 않고, 사용자가 다음에 할 수 있는 행동까지 함께 보여줍니다.</b></div>`),

    shell('12 · IA / MODES','사용자에게 보여줄 화면과 리뷰어에게 보여줄 근거를 분리했습니다.','실제 앱 화면에는 사용에 필요한 정보만 남기고, 설계 의도와 상태 검증은 Guided와 Evidence 모드에서 따로 확인할 수 있게 했습니다.',
      `<div class="fm-next-cs-modes"><div class="is-focus"><small>REAL APP</small><h3>/app</h3><p>사용자에게 필요한 UI만 보여줍니다.</p></div><div><small>GUIDED</small><h3>?mode=guided</h3><p>주요 흐름 옆에서 설계 이유를 설명합니다.</p></div><div><small>EVIDENCE</small><h3>?mode=evidence</h3><p>상태 시나리오와 검증 범위를 확인합니다.</p></div></div>`,
      `<div class="fm-next-cs-note">실제 앱에는 “프로토타입”, “QA”, “Evidence” 같은 리뷰어용 표현을 노출하지 않습니다.</div>`),

    shell('13 · SYSTEM EVIDENCE','상태와 데이터 근거는 리뷰 모드에서만 자세히 보여줍니다.','AI와 데이터 구조를 기능명으로 장식하기보다, 추천과 복구가 어떤 정보와 상태를 바탕으로 움직이는지 설명하는 계약으로 정리했습니다.',
      `<div class="fm-next-cs-agent"><b>Context</b><i>→</i><b>Plan</b><i>→</i><b>Tools</b><i>→</i><b>Guardrail</b><i>→</i><b>Observe</b></div><div class="fm-next-cs-grid three">${card('상태 계약','setupComplete · selectedMatchId · signedIn · joinedMatchId · matchStage')}${card('데이터 품질','Completeness · Validity · Freshness · Consistency · Traceability')}${card('사람의 확인','인증·결제·운영 판단처럼 실제 실행이 필요한 지점은 자동화 범위와 분리합니다.')}</div>`,
      `<div class="fm-next-cs-scope"><span>현재 구현</span><b>규칙 · 샘플 데이터 · 브라우저 세션 상태 기반 인터랙티브 프로토타입</b><p>외부 AI 모델, 회원 DB, 실시간 정원, 실제 결제, 알림 backend는 연결하지 않았습니다.</p></div>`),

    shell('14 · VALIDATION','새 디자인만 보는 것이 아니라, 16개 섹션과 핵심 흐름을 실제 브라우저에서 반복 검증합니다.','모바일 너비별 가로 넘침, 접근성, 콘솔 오류, 상태 유지와 Production 렌더링을 자동화된 릴리스 게이트로 확인합니다. 이번 편집 QA에는 줄바꿈과 구버전 문구 제거도 포함했습니다.',
      `<div class="fm-next-cs-metrics">${metric('16','Case Study sections')}${metric('320–430','mobile widths')}${metric('A / AA','axe accessibility gate')}${metric('HTTP + Chromium','exact Production smoke')}</div><div class="fm-next-cs-grid three">${card('Guest-first','가입 전에 추천을 볼 수 있고 참가 시점에만 로그인이 나타나는지 확인합니다.')}${card('상태 연속성','선택 경기 → 로그인 → 결제 → 내 경기 흐름과 새로고침 복원을 확인합니다.')}${card('편집 품질','모바일 가로 넘침, 공식 v4 문구, CTA 경로와 주요 텍스트 래핑 계약을 확인합니다.')}</div>`,
      `<div class="fm-next-cs-note">GitHub Actions의 브라우저 QA와 exact Production 검증은 구분해서 기록합니다.</div>`),

    shell('15 · OUTCOME / LIMITS','화면 수를 늘리기보다, 사용자가 다음 행동을 이해하기 쉽게 만들었습니다.','FootMate v4.0은 추천을 먼저 경험하고, 이유를 이해한 뒤 참가하고, 경기 당일까지 같은 맥락을 유지하는 데 집중합니다. Case Study도 기능 목록보다 이 의사결정 흐름을 따라가도록 정리했습니다.',
      `<div class="fm-next-cs-outcomes"><div><b>제품</b><p>추천 → 판단 → 참가 → 경기 당일까지 하나의 흐름으로 이어집니다.</p></div><div><b>Case Study</b><p>문제와 사용자 맥락에서 시작해 디자인 결정, 검증, 한계 순으로 설명합니다.</p></div><div><b>남은 실제 연동</b><p>OAuth · 회원 DB · PG · 실시간 정원 · 알림 backend</p></div></div>`,
      `<div class="fm-next-cs-final"><span>현재 범위</span><b>실제 외부 연동 전에도 사용자 흐름과 상태 계약을 검증할 수 있는 인터랙티브 프로토타입입니다.</b><a href="/app" target="_blank" rel="noopener">FootMate v4.0 앱 보기 ↗</a></div>`)
  ];

  function enhance(){
    const slideNodes=[...document.querySelectorAll('.track .slide,.slide')].slice(0,16);
    if(slideNodes.length<16||document.documentElement.dataset.fmNextStory==='true')return;
    document.documentElement.dataset.fmNextStory='true';
    slideNodes.forEach((slide,index)=>{
      slide.classList.add('fm-next-story-slide');
      if(index===0)slide.classList.add('fm-next-cover-slide');
      slide.innerHTML=slides[index];
    });
    const toc=[...document.querySelectorAll('.toc-item')].slice(0,16);
    toc.forEach((item,index)=>{
      const title=item.querySelector('.toc-t');
      const sub=item.querySelector('.toc-s');
      if(title)title.textContent=sections[index][0];
      if(sub)sub.textContent=sections[index][1];
    });
    const sub=document.querySelector('.sb-sub');
    if(sub)sub.textContent='v4.0 · 16 sections';
    const topTitle=document.querySelector('.topbar-title');
    if(topTitle)topTitle.textContent='FootMate v4.0 · Matchday Companion Case Study';
    slideNodes[0]?.querySelector('[data-fm-next-cover-next]')?.addEventListener('click',()=>{
      if(typeof window.goTo==='function'){window.goTo(1);return;}
      const next=document.querySelector('.btn-next');
      if(next)next.click();
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});
  else enhance();
  setTimeout(enhance,80);
})();
