/* FootMate Next Major Candidate · product-first Case Study narrative.
   The 16-section shell remains a compatibility surface; the story, hierarchy and visual language are redesigned. */
(function(){
  const sections=[
    ['Overview','Matchday Companion'],
    ['Problem','판단 비용이 큰 경기 탐색'],
    ['Persona · JTBD','퇴근 후 바로 뛸 수 있는 확신'],
    ['Product Thesis','검색 앱에서 Matchday Companion으로'],
    ['Core Journey','Find → Decide → Join → Play → Return'],
    ['Decision 01','Guest-first onboarding'],
    ['Decision 02','Explainable match fit'],
    ['Decision 03','경기 상세와 단일 CTA'],
    ['Sign in','참가 의도 시점의 로그인'],
    ['Join · Payment','선택 맥락을 잃지 않는 전환'],
    ['Matchday','참가 이후가 홈의 주인공'],
    ['Recovery','빈 상태·오류·노쇼까지 복구'],
    ['IA · Modes','Real App / Guided / Evidence'],
    ['System Evidence','AI · Data · State contract'],
    ['Validation','Regression · Responsive · Axe'],
    ['Outcome · Limits','무엇이 실제이고 무엇이 다음인가']
  ];

  function card(title,copy,meta=''){
    return `<article class="fm-next-cs-card">${meta?`<small>${meta}</small>`:''}<h3>${title}</h3><p>${copy}</p></article>`;
  }
  function metric(value,label){return `<div class="fm-next-cs-metric"><b>${value}</b><span>${label}</span></div>`;}
  function shell(kicker,title,lead,body,aside=''){
    return `<div class="fm-next-story"><div class="fm-next-story-copy"><div class="fm-next-story-kicker">${kicker}</div><h2>${title}</h2><p class="fm-next-story-lead">${lead}</p>${body}</div>${aside?`<aside class="fm-next-story-aside">${aside}</aside>`:''}</div>`;
  }

  const slides=[
    `<div class="fm-next-cover cover">
      <div class="fm-next-cover-copy">
        <div class="fm-next-cover-kicker">FootMate · Matchday Companion</div>
        <h1>내 수준에 맞는 경기부터,<br><span>경기 당일까지.</span></h1>
        <p class="fm-next-cover-lead">경기를 검색하는 데서 끝나지 않고, <strong>왜 나와 맞는지 이해하고 안심하고 참가해 경기 당일까지 이어지는</strong> 풋살 경험을 설계했습니다.</p>
        <div class="fm-next-cover-actions"><a href="/next" target="_blank" rel="noopener">실제 앱 흐름 경험하기 <span aria-hidden="true">↗</span></a><button type="button" data-fm-next-cover-next>문제부터 보기 <span aria-hidden="true">→</span></button></div>
        <div class="fm-next-cover-flow" aria-label="핵심 사용자 흐름"><b>Find</b><i>→</i><b>Decide</b><i>→</i><b>Join</b><i>→</i><b>Play</b><i>→</i><b>Return</b></div>
        <div class="fm-next-cover-proof"><div><b>Guest-first onboarding</b><span>회원가입 전에 추천 가치를 먼저 확인</span></div><div><b>Explainable match fit</b><span>점수보다 판단에 필요한 이유를 우선</span></div><div><b>Matchday continuity</b><span>참가 이후 체크인·경기 후까지 연결</span></div></div>
      </div>
      <div class="fm-next-cover-visual" aria-label="FootMate next app preview"><div class="fm-next-cover-glow" aria-hidden="true"></div><div class="fm-next-cover-frame"><div class="fm-next-cover-frame-meta">Live interaction</div><iframe src="/next?embed=1" title="FootMate 실제 앱 흐름 미리보기" loading="eager"></iframe></div><div class="fm-next-cover-note">Next major candidate<br>v3.0 stable baseline preserved</div></div>
    </div>`,

    shell('01 · PROBLEM','경기를 찾는 것보다, “나한테 맞는 경기인가”를 판단하는 일이 더 어려웠습니다.','시간·거리·레벨·포지션·남은 자리·가격을 각각 확인해야 했고, 참가 이후의 일정과 경기 당일 경험은 탐색 화면과 끊겨 있었습니다.',
      `<div class="fm-next-cs-grid three">${card('정보가 흩어짐','경기 하나를 고르기 위해 여러 조건을 머릿속에서 다시 조합해야 했습니다.','DECISION COST')}${card('가입이 너무 이른 시점','가치를 확인하기 전에 계정 생성부터 요구하면 사용자는 아직 이유를 모릅니다.','EARLY FRICTION')}${card('참가 후 단절','결제 이후 일정·체크인·경기 후 평가가 별도 기능처럼 느껴집니다.','CONTINUITY')}</div>`,
      `<div class="fm-next-cs-quote"><span>핵심 질문</span><b>“오늘 내가 안심하고 뛸 경기를 가장 빨리 결정하려면?”</b></div>`),

    shell('02 · PERSONA / JTBD','경기력이 아니라 “결정할 수 있는 확신”이 필요한 사용자.','핵심 Persona는 퇴근 후 주 1~2회 풋살을 즐기며, 이동 시간과 경기 강도를 빠르게 비교하고 실패 없는 참가를 원하는 직장인 플레이어로 설정했습니다.',
      `<div class="fm-next-cs-persona"><div><span>행동</span><b>평일 저녁 · 30분 내 이동 · 주 1~2회</b></div><div><span>판단 기준</span><b>레벨 · 거리 · 포지션 · 남은 자리</b></div><div><span>불안</span><b>실력 차이 · 자리 마감 · 취소 규칙 · 경기 당일 변수</b></div></div>`,
      `<div class="fm-next-cs-jtbd"><small>JTBD</small><p>“오늘 뛸 수 있는 경기 중 <strong>나와 잘 맞는 이유를 빠르게 이해하고</strong>, 참가 후에도 무엇을 해야 하는지 놓치지 않고 싶다.”</p></div>`),

    shell('03 · PRODUCT THESIS','FootMate를 “경기 검색 앱”이 아니라 Matchday Companion으로 다시 정의했습니다.','탐색 성공을 검색 결과 노출이 아니라 경기 종료 후 다시 다음 경기를 찾을 수 있는 순환 경험으로 정의했습니다.',
      `<div class="fm-next-cs-loop"><b>Find</b><span>맞는 경기 발견</span><i>→</i><b>Decide</b><span>추천 이유 이해</span><i>→</i><b>Join</b><span>로그인·결제</span><i>→</i><b>Play</b><span>경기 당일</span><i>→</i><b>Return</b><span>평가·다음 경기</span></div>`,
      `<div class="fm-next-cs-principles">${card('Value before account','가치를 먼저 보여주고 계정은 참가 의도에서 요청합니다.')}${card('Reason before score','매칭 퍼센트보다 판단 이유를 먼저 보여줍니다.')}${card('State before screen','화면 수보다 사용자의 현재 경기 상태가 홈을 결정합니다.')}</div>`),

    shell('04 · CORE JOURNEY','화면 수 대신 5개의 사용자 행동으로 전체 경험을 묶었습니다.','각 단계의 성공 조건이 다음 단계로 자연스럽게 이어지도록 정보와 CTA를 재배치했습니다.',
      `<div class="fm-next-cs-journey"><div><b>01</b><h3>Find</h3><p>지역·포지션·레벨 설정 후 추천을 먼저 봅니다.</p></div><div><b>02</b><h3>Decide</h3><p>레벨·거리·자리·가격을 한 번에 판단합니다.</p></div><div><b>03</b><h3>Join</h3><p>참가 시점에 로그인하고 선택을 유지한 채 결제로 갑니다.</p></div><div><b>04</b><h3>Play</h3><p>경기 당일 홈에서 길찾기·체크인·운영 정보를 봅니다.</p></div><div><b>05</b><h3>Return</h3><p>경기 후 평가와 ELO 변화가 다음 탐색으로 이어집니다.</p></div></div>`,
      `<a class="fm-next-cs-link" href="/next?mode=guided" target="_blank" rel="noopener">Guided flow로 직접 보기 <span>↗</span></a>`),

    shell('05 · DESIGN DECISION 01','회원가입을 첫 화면에서 제거했습니다.','사용자가 아직 FootMate의 추천 품질을 경험하지 않은 상태에서 개인정보를 먼저 요구하지 않습니다. 지역·포지션·레벨만 설정하고 추천 결과까지 볼 수 있습니다.',
      `<div class="fm-next-cs-before-after"><div><small>BEFORE</small><b>Splash → SSO → Quiz → Location → Recommendation</b><p>가입이 제품 가치보다 먼저 등장</p></div><div class="is-after"><small>NEXT</small><b>Value → Preferences → Recommendation → Sign in to Join</b><p>가치를 확인한 뒤 참가 의도에서 로그인</p></div></div>`,
      `<div class="fm-next-cs-decision"><span>설계 기준</span><b>로그인은 기능 진입 장벽이 아니라 참가 계약을 시작하는 시점에 둡니다.</b></div>`),

    shell('06 · DESIGN DECISION 02','추천은 “몇 % 맞다”보다 “왜 지금 이 경기를 고를 수 있는가”를 먼저 말합니다.','설명 가능성을 없애지 않고 정보 계층을 바꿨습니다. 카드에서는 핵심 이유만 보여주고, 더 자세한 근거는 상세에서 확장합니다.',
      `<div class="fm-next-cs-reco"><div class="fm-next-cs-reco-card"><span>오늘 20:00 · 수원 인계</span><h3>내 수준과 잘 맞아요</h3><div><b>ELO 비슷함</b><b>15분 거리</b><b>MF 1자리</b></div><strong>12,000원</strong></div><div class="fm-next-cs-stack"><p><b>1.</b> 경기 시각·장소</p><p><b>2.</b> 적합 이유 2~3개</p><p><b>3.</b> 남은 포지션·가격</p><p><b>4.</b> 상세 근거는 필요할 때</p></div></div>`,
      `<div class="fm-next-cs-note">기존 ELO/매칭 로직은 설명 근거로 남기되, 사용자의 첫 판단 화면을 계산 결과로 채우지 않습니다.</div>`),

    shell('07 · DESIGN DECISION 03','경기 상세는 정보 페이지가 아니라 “참가 결정을 끝내는 화면”으로 바꿨습니다.','사용자가 가장 먼저 확인하는 순서에 맞춰 시간·장소 → 적합도 → 자리 → 참가자 → 시설/규칙 → 취소 정책으로 정리하고 CTA를 하나로 고정했습니다.',
      `<div class="fm-next-cs-detail-order"><span>시간 · 장소</span><i>↓</i><span>내게 맞는 이유</span><i>↓</i><span>자리 · 포지션</span><i>↓</i><span>참가자 · 시설 · 규칙</span><i>↓</i><span>취소·환불</span></div>`,
      `<div class="fm-next-cs-sticky"><small>STICKY PRIMARY CTA</small><b>참가하기 · 12,000원</b><p>여러 행동을 경쟁시키지 않고 다음 행동 하나를 명확하게 유지합니다.</p></div>`),

    shell('08 · SIGN IN','Sign in은 앱의 시작이 아니라 “참가를 이어가기 위한 마지막 준비”로 이동했습니다.','아이디·비밀번호 로그인과 SSO를 함께 제공하되, 선택한 경기를 잃지 않은 상태에서 바로 결제로 이어집니다. Real App에서는 실제 서비스처럼 보이되, Case Study에서는 외부 인증이 연결되지 않은 검증용 상태임을 명확히 구분합니다.',
      `<div class="fm-next-cs-auth-flow"><div><small>GUEST</small><b>추천·상세 확인</b></div><i>→</i><div><small>INTENT</small><b>참가하기</b></div><i>→</i><div class="is-focus"><small>SIGN IN</small><b>ID·PW / Kakao / Naver / Apple / Google</b></div><i>→</i><div><small>CONTINUE</small><b>결제</b></div></div>`,
      `<div class="fm-next-cs-scope"><span>현재 범위</span><b>로그인 UX + 세션 상태 전환</b><p>실제 Kakao/Naver/Apple/Google OAuth, 회원 DB, 서버 세션은 미연동입니다.</p></div>`),

    shell('09 · JOIN / PAYMENT','로그인 때문에 사용자의 선택 맥락이 리셋되지 않도록 했습니다.','경기 상세에서 선택한 match ID, 추천 근거, 참가비를 유지한 채 로그인 → 결제 → 참가 완료로 이어집니다.',
      `<div class="fm-next-cs-state-line"><span>selectedMatchId</span><i>→</i><span>signedIn</span><i>→</i><span>checkout</span><i>→</i><span>joinedMatchId</span><i>→</i><span>upcoming</span></div><div class="fm-next-cs-grid three">${card('Selection continuity','인증 전후에도 선택 경기가 유지됩니다.')}${card('Single charge intent','결제 CTA는 한 번의 참가 의도로 처리합니다.')}${card('Confirmation','완료 후 “내 경기”가 다음 목적지가 됩니다.')}</div>`,
      `<div class="fm-next-cs-note">현재 결제는 샘플 상태 전환이며 실제 PG·잔액·영수증 API는 연결하지 않았습니다.</div>`),

    shell('10 · MATCHDAY','참가가 끝이 아니라, 참가 이후가 홈의 주인공이 됩니다.','예약 전에는 추천을, 예약 후에는 다가오는 경기를, 경기 당일에는 이동·체크인을, 경기 후에는 평가와 다음 행동을 먼저 보여줍니다.',
      `<div class="fm-next-cs-day-states"><div><small>DISCOVER</small><b>지금 잘 맞는 경기</b></div><div><small>UPCOMING</small><b>다가오는 경기</b></div><div class="is-focus"><small>MATCHDAY</small><b>경기까지 1시간 20분</b><p>길찾기 · 체크인 · 운영 도움</p></div><div><small>POSTGAME</small><b>오늘 경기, 어땠나요?</b></div></div>`,
      `<a class="fm-next-cs-link" href="/next?mode=evidence" target="_blank" rel="noopener">상태 시나리오 보기 <span>↗</span></a>`),

    shell('11 · RECOVERY','정상 플로우보다 “중간에 실패했을 때 어디로 돌아오는가”를 먼저 정의했습니다.','빈 추천, 자리 마감, 결제 실패, 노쇼·체크인 지연처럼 경기 서비스에서 반복되는 실패를 상태와 다음 행동으로 분리했습니다.',
      `<div class="fm-next-cs-recovery"><div><b>Empty</b><span>조건 완화 · 지역/시간 수정</span></div><div><b>Full</b><span>대기 등록 · 유사 경기 탐색</span></div><div><b>Payment fail</b><span>재시도 · 결제수단 변경</span></div><div><b>Matchday issue</b><span>체크인 재시도 · 운영 도움</span></div></div>`,
      `<div class="fm-next-cs-decision"><span>Fallback 원칙</span><b>오류를 설명하는 화면보다 사용자가 다시 진행할 수 있는 행동을 우선합니다.</b></div>`),

    shell('12 · IA / MODES','실제 앱과 포트폴리오 설명을 한 화면 안에 섞지 않았습니다.','동일한 제품 경험을 세 가지 모드로 분리해 사용자는 서비스만 보고, 리뷰어는 필요할 때 설계 근거와 상태를 확인할 수 있습니다.',
      `<div class="fm-next-cs-modes"><div class="is-focus"><small>REAL APP</small><b>/next</b><p>실제 사용자 UI만 노출</p></div><div><small>GUIDED</small><b>?mode=guided</b><p>사용 흐름 옆에 설계 이유</p></div><div><small>EVIDENCE</small><b>?mode=evidence</b><p>상태 시나리오·검증 범위</p></div></div>`,
      `<div class="fm-next-cs-note">기존 v3.0 `/demo` Product/Portfolio 구조는 회귀 기준으로 유지하며 Next Major와 분리했습니다.</div>`),

    shell('13 · SYSTEM EVIDENCE','보이지 않는 로직은 Evidence에서만 설명하고, Product에서는 행동으로 증명합니다.','AI와 데이터 구조는 화면을 장식하는 기능명이 아니라 추천·복구·운영 판단을 만드는 계약으로 정리했습니다.',
      `<div class="fm-next-cs-agent"><b>Context</b><i>→</i><b>Plan</b><i>→</i><b>Tools</b><i>→</i><b>Guardrail</b><i>→</i><b>Observe</b></div><div class="fm-next-cs-grid three">${card('State contract','setupComplete · selectedMatchId · signedIn · joinedMatchId · matchStage')}${card('Data quality','Completeness · Validity · Freshness · Consistency · Traceability')}${card('HITL boundary','외부 인증·결제·운영 판단은 자동화 범위와 실제 연동 범위를 분리')}</div>`,
      `<div class="fm-next-cs-scope"><span>구현 사실</span><b>rules / sample / session state 기반 인터랙티브 제품 설계</b><p>외부 AI 모델·DB·실시간 수용량·실제 결제·알림 backend는 미연동입니다.</p></div>`),

    shell('14 · VALIDATION','새 경험만 통과하면 끝이 아니라, 기존 안정 버전이 깨지지 않는지도 함께 확인합니다.','기존 v2.4~v3.0 regression과 v2.8 39-screen visual baseline을 유지한 채 Next Major 전용 QA를 추가했습니다.',
      `<div class="fm-next-cs-metrics">${metric('36','stable required check key')}${metric('39','legacy screen visual parity')}${metric('320–430','mobile responsive widths')}${metric('axe','serious / critical gate')}</div><div class="fm-next-cs-grid three">${card('Guest-first','가입 전 추천 노출과 참가 시점 로그인')}${card('State continuity','선택 경기 → 로그인 → 결제 → 내 경기')}${card('Mode isolation','Real App에는 reviewer 문구 미노출')}</div>`,
      `<div class="fm-next-cs-note">검증 결과는 GitHub Actions와 exact Production verification을 구분해 기록합니다.</div>`),

    shell('15 · OUTCOME / LIMITS','기능을 더 늘리는 대신, 제품이 스스로 설명되도록 구조를 줄였습니다.','다음 버전의 목표는 “화면이 많다”가 아니라 사용자가 설명 없이도 자신의 상태와 다음 행동을 이해하고, 리뷰어가 필요할 때만 시스템 근거를 확인할 수 있게 하는 것입니다.',
      `<div class="fm-next-cs-outcomes"><div><b>제품</b><p>Guest-first → 추천 → 판단 → 참가 → Matchday의 하나의 이야기</p></div><div><b>Case Study</b><p>Problem → Persona/JTBD → Design Decision → Evidence → Limits로 재구성</p></div><div><b>남은 실제 연동</b><p>OAuth · 회원 DB · PG · realtime capacity · notification backend</p></div></div>`,
      `<div class="fm-next-cs-final"><span>Next</span><b>실제 연동이 붙어도 UX 계약이 바뀌지 않도록 상태·Fallback·검증 기준을 먼저 고정합니다.</b><a href="/next" target="_blank" rel="noopener">FootMate Next 경험하기 ↗</a></div>`)
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
    if(sub)sub.textContent='Next Major · 16장';
    const topTitle=document.querySelector('.topbar-title');
    if(topTitle)topTitle.textContent='FootMate · Matchday Companion Case Study';
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
