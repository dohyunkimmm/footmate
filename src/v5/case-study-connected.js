/* FootMate current product Case Study narrative. */
(function(){
  let applied=false;

  const sectionMeta=[
    ['개요','AI Match Assistant'],
    ['문제','판단이 오래 걸리는 경기 탐색'],
    ['Persona · JTBD','퇴근 후 바로 결정할 수 있는 확신'],
    ['제품 원칙','판단 맥락을 잃지 않는 하나의 흐름'],
    ['핵심 여정','각 단계의 행동과 완료 조건'],
    ['설계 결정 01','추천 먼저, 로그인은 나중'],
    ['설계 결정 02','기억된 조건으로 탐색 시작점 단축'],
    ['설계 결정 03','상세에서 결정 근거·저장·비교'],
    ['로그인','인증 전후 선택 맥락 보존'],
    ['참가 · 결제','복구 가능한 참가 상태 전이'],
    ['경기 당일 · 재탐색','경기 당일에서 다음 탐색까지'],
    ['복구','맥락 보존 + 다음 행동'],
    ['도메인 구조','recommendation · participation · matchday · return'],
    ['외부 연동 · AI 경계','실연동 · 시뮬레이션 · HITL 경계'],
    ['검증','자동 QA · 사람 검수 · AI 보조 검수'],
    ['Production 범위','실제 연결·검증된 기능만 표기']
  ];

  function cleanVersionCopy(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      const before=node.nodeValue||'';
      const after=before
        .replace(/\bv\d+\.\d+(?:\.\d+)?부터\s*/gi,'')
        .replace(/\bv\d+\.\d+(?:\.\d+)?(?:은|는)\s*/gi,'현재 제품은 ')
        .replace(/\bv\d+\.\d+(?:\.\d+)?의\s*/gi,'현재 ')
        .replace(/\bv\d+\.\d+(?:\.\d+)?\s*·\s*/gi,'')
        .replace(/\bv\d+\.\d+(?:\.\d+)?\b/gi,'')
        .replace(/\s{2,}/g,' ');
      if(after!==before)node.nodeValue=after;
    }
  }

  function setText(root,selector,text){
    const node=root?.querySelector(selector);
    if(node)node.textContent=text;
    return node;
  }

  function setHTML(root,selector,html){
    const node=root?.querySelector(selector);
    if(node)node.innerHTML=html;
    return node;
  }

  function setRole(slide,role){
    if(slide)slide.setAttribute('data-v5-content-role',role);
  }

  function syncSectionNavigation(){
    const toc=[...document.querySelectorAll('.toc-item')].slice(0,16);
    toc.forEach((item,index)=>{
      const meta=sectionMeta[index];
      if(!meta)return;
      setText(item,'.toc-t',meta[0]);
      setText(item,'.toc-s',meta[1]);
    });
    const sub=document.querySelector('.sb-sub');
    if(sub)sub.textContent='AI 보조 경기 탐색 · 16개 섹션';
    const topTitle=document.querySelector('.topbar-title');
    if(topTitle)topTitle.textContent='FootMate Case Study';
  }

  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.9.0')return false;

    syncSectionNavigation();

    note.innerHTML='AI Match Assistant<br>자연어 조건 해석 → 추천 순위 계산';
    const visual=document.querySelector('.fm-next-cover-visual');
    if(visual)visual.setAttribute('aria-label','FootMate 앱 미리보기');
    const frame=document.querySelector('.fm-next-cover-frame iframe');
    if(frame)frame.title='FootMate 실제 앱 흐름 미리보기';
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){
      setText(proof[2],'b','AI를 넣되 추천 근거는 보존');
      setText(proof[2],'span','자연어 조건은 AI가 해석하지만 경기 후보·순위·추천 이유는 기존 추천 로직이 결정합니다.');
    }

    setRole(slides[3],'product-thesis');
    setText(slides[3],'.fm-next-story h2','기능을 늘리기보다, 판단 맥락이 끊기지 않는 하나의 흐름을 만들었습니다.');
    setText(slides[3],'.fm-next-story-lead','제품 원칙은 탐색(Find) → 결정(Decide) → 참가(Join) → 경기(Play) → 재탐색(Return)을 다시 나열하는 데 있지 않습니다. 조건·선택·상태를 단계 사이에 보존해 사용자가 같은 판단을 반복하지 않도록 하는 것이 핵심입니다.');
    setHTML(slides[3],'.fm-next-cs-principles',
      '<article class="fm-next-cs-card"><h3>판단 기준을 한곳에</h3><p>시간·거리·레벨·포지션·자리·가격을 여러 화면에서 다시 조합하지 않게 합니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>선택 맥락을 보존</h3><p>필터, 선택 경기와 참가 상태를 단계 전환과 새로고침 이후에도 이어갑니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>상태마다 다음 행동</h3><p>정상 흐름과 복구 흐름 모두에서 지금 할 수 있는 행동을 분명하게 보여줍니다.</p></article>');

    setRole(slides[4],'core-journey');
    setText(slides[4],'.fm-next-story h2','사용자 행동과 각 단계의 완료 조건을 기준으로 여정을 나눴습니다.');
    setText(slides[4],'.fm-next-story-lead','탐색(Find)은 범위를 정하고, 결정(Decide)은 근거를 비교하고, 참가(Join)는 선택을 참가 상태로 바꾸며, 경기(Play)는 당일 행동을 안내하고, 재탐색(Return)은 다음 탐색의 입력을 남깁니다. 각 단계의 결과가 다음 단계의 입력이 됩니다.');

    setRole(slides[5],'guest-first-decision');
    const afterBadge=slides[5]?.querySelector('.fm-next-cs-before-after .is-after small');
    if(afterBadge)afterBadge.textContent='AFTER';

    setRole(slides[6],'recommendation-decision');
    setText(slides[6],'.fm-next-story h2','반복 이용자는 같은 조건을 다시 설정하지 않고 탐색을 시작합니다.');
    setText(slides[6],'.fm-next-story-lead','저장한 프로필과 선호 지역·시간·경기 형식, 최근 확인 이력을 보조 신호로 사용합니다. 추천 후보·순위·이유는 기존 추천 엔진이 계속 결정하고, 사용자는 “왜 추천됐나요?”에서 근거를 확인할 수 있습니다.');
    const recoCard=slides[6]?.querySelector('.fm-next-cs-reco-card');
    if(recoCard)recoCard.innerHTML='<span>최근 선호를 반영한 추천 · 수원 영통</span><h3>조건과 잘 맞아요</h3><div><b>생활권 일치</b><b>평일 저녁 선호</b><b>MF 자리 있음</b></div><strong>추천 1순위</strong>';
    const recoStack=slides[6]?.querySelector('.fm-next-cs-stack');
    if(recoStack)recoStack.innerHTML='<p><b>1.</b> 저장 프로필</p><p><b>2.</b> 선호 지역·시간·경기 형식</p><p><b>3.</b> 최근 확인 이력</p><p><b>4.</b> 현재 경기 조건과 잔여 자리</p>';
    setText(slides[6],'.fm-next-cs-note','개인화 신호는 추천의 보조 입력입니다. 추천 엔진의 순위와 설명 가능성을 유지하고, 근거 없는 AI 점수로 대체하지 않습니다.');

    setRole(slides[7],'detail-decision');
    setText(slides[7],'.fm-next-story h2','경기 상세는 정보 모음이 아니라 참가 여부를 결정하는 화면입니다.');
    setText(slides[7],'.fm-next-story-lead','시간·장소 → 추천 근거 → 자리·포지션 → 시설·운영 → 취소·환불 순으로 판단 정보를 배치했습니다. 저장과 최대 2경기 비교는 보조 행동으로 두고, 참가하기를 핵심 CTA로 유지합니다.');

    setRole(slides[8],'auth-context');
    setText(slides[8],'.fm-next-story h2','로그인보다 중요한 것은, 로그인 전의 선택을 잃지 않는 것입니다.');
    setText(slides[8],'.fm-next-story-lead','`참가하기`에서 인증으로 이동해도 선택한 경기와 돌아갈 목적지를 유지합니다. /app의 인증은 실제 계정 연동이 아닌 시뮬레이션(mock) 흐름이지만, 인증 전후에 같은 경기·참가 맥락이 이어지는 UX 계약을 검증합니다.');
    const authScope=slides[8]?.querySelector('.fm-next-cs-scope');
    if(authScope){
      setText(authScope,'span','연동 경계');
      setText(authScope,'b','/app: 시뮬레이션 인증 · /beta: Supabase Auth');
      setText(authScope,'p','Closed Beta의 Google/Kakao OAuth는 실제 연동 경로에서 검증하며, 이 섹션은 /app의 선택 맥락 보존에 집중합니다.');
    }

    setRole(slides[9],'participation-state');
    setText(slides[9],'.fm-next-story h2','참가는 성공 화면 하나가 아니라, 복구 가능한 상태 전이로 관리합니다.');
    setText(slides[9],'.fm-next-story-lead','checkout → pending → success | failure | canceled를 분리하고 결제 시작 시 경기·금액·정책 스냅샷을 고정합니다. 성공에서만 참가를 확정하고, 실패·취소에서는 같은 선택 맥락으로 재시도하거나 돌아갈 수 있습니다.');
    setHTML(slides[9],'.fm-next-cs-state-line','<span>checkout</span><i>→</i><span>pending</span><i>→</i><span>success | failure | canceled</span>');
    setHTML(slides[9],'.fm-next-cs-grid.three',
      '<article class="fm-next-cs-card"><h3>스냅샷 고정</h3><p>결제 중 경기·금액·정책이 바뀌어 참가 계약이 흔들리지 않게 합니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>중복 제출 방지</h3><p>pending 동안 같은 참가 요청이 반복되지 않도록 상태와 CTA를 잠급니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>실패 후 복구</h3><p>failure·canceled는 참가 확정과 분리하고 같은 맥락에서 재시도할 수 있게 합니다.</p></article>');
    setText(slides[9],'.fm-next-cs-note','/app의 결제는 실제 PG가 아닌 시뮬레이션입니다. /beta는 결제 없는 실제 참가 경로를 Supabase에 연결합니다.');

    setRole(slides[10],'matchday-return');
    setText(slides[10],'.fm-next-story h2','참가 이후에는 경기 당일과 경기 후의 다음 행동이 홈의 우선순위를 바꿉니다.');
    setText(slides[10],'.fm-next-story-lead','upcoming → matchday → checked-in → postgame(경기 후)으로 상태를 이어가고, 경기 후 체감 난이도·참여 완료·반복 의도는 다음 추천의 보조 신호로만 사용합니다. 공개 평판 점수나 자동 참가 판단으로 확대하지 않습니다.');

    setRole(slides[11],'recovery-principle');
    setText(slides[11],'.fm-next-story h2','복구는 기능별 예외가 아니라, 맥락을 보존하고 다음 행동을 여는 공통 원칙입니다.');
    setText(slides[11],'.fm-next-story-lead','검색 0개, 자리 마감, 결제 실패, 경기 당일 이슈가 달라도 복구 설계는 같습니다. 무엇을 보존할지 먼저 정하고, 사용자가 다시 진행할 수 있는 다음 CTA를 바로 연결합니다.');
    const recoveryDecision=slides[11]?.querySelector('.fm-next-cs-decision b');
    if(recoveryDecision)recoveryDecision.textContent='오류 원인 → 보존할 상태 → 다음 행동을 한 세트로 설계해 막다른 화면을 만들지 않습니다.';

    const architecture=slides[12];
    if(architecture){
      setRole(architecture,'domain-architecture');
      setText(architecture,'.fm-next-story h2','추천·참가·경기 당일·경기 후 상태의 소유권을 분리했습니다.');
      setText(architecture,'.fm-next-story-lead','`recommendation`은 후보·순위·추천 이유, `participation`은 선택·checkout·참가 확정, `matchday`는 체크인·운영 상태, `return`은 경기 후 신호를 소유합니다. 화면은 이 상태를 읽어 표현하고 서로의 책임을 다시 구현하지 않습니다.');
      setHTML(architecture,'.fm-next-cs-modes',
        '<div class="is-focus"><small>RECOMMENDATION</small><h3>순위 · 추천 근거</h3><p>후보·순위·추천 이유와 fallback 경로를 소유합니다.</p></div>'+
        '<div><small>PARTICIPATION</small><h3>참가 상태</h3><p>선택·checkout·참가 확정과 복구 상태를 소유합니다.</p></div>'+
        '<div><small>MATCHDAY · RETURN</small><h3>운영 · 경기 후 신호</h3><p>체크인·운영 상태와 postgame 보조 신호를 분리합니다.</p></div>');
      setText(architecture,'.fm-next-cs-note','외부 연동 여부와 AI 권한은 다음 섹션에서 다룹니다. 여기서는 상태와 로직의 소유권만 설명합니다.');
      architecture.setAttribute('data-v5-domain-evidence','separated');
    }

    const providers=slides[13];
    if(providers){
      setRole(providers,'provider-ai-boundary');
      setText(providers,'.fm-next-story h2','실제 연동과 시뮬레이션을 구분하고, AI의 권한도 제한했습니다.');
      setText(providers,'.fm-next-story-lead','/app은 Vercel AI Gateway로 자연어 조건을 해석하지만 경기 후보·순위·추천 이유는 결정론적 추천 엔진(deterministic recommendation engine)과 샘플 경기 데이터가 결정합니다. /beta는 Supabase 기반 실제 참가 데이터를 사용합니다. AI는 경기 ID·가격·정원·순위를 생성하거나 참가·결제를 자동 실행하지 않습니다.');
      setHTML(providers,'.fm-next-cs-grid.three',
        '<article class="fm-next-cs-card"><small>/APP</small><h3>AI 해석 + 결정론적 추천 순위</h3><p>AI 조건 해석, 샘플 경기 데이터, 결정론적 추천 순위, 시뮬레이션 인증·결제·정원·알림.</p></article>'+
        '<article class="fm-next-cs-card"><small>/BETA</small><h3>Supabase 실연동</h3><p>Auth·Postgres·RLS·RPC·Realtime과 OAuth·이메일·Web Push·Storage를 실제 연동 경로로 사용합니다.</p></article>'+
        '<article class="fm-next-cs-card"><small>HITL · 사람 확인</small><h3>사람이 최종 확정</h3><p>AI가 탐색을 도와도 참가와 결제처럼 되돌리기 어려운 행동은 사용자가 직접 확인합니다.</p></article>');
      const providerScope=providers.querySelector('.fm-next-cs-scope');
      if(providerScope){
        setText(providerScope,'span','현재 연동 경계');
        setText(providerScope,'b','실연동: AI Gateway · Supabase · Resend · Web Push · Storage');
        setText(providerScope,'p','실제 PG와 외부 분석 도구(analytics)는 미연동입니다. OAuth와 Web Push는 외부 서비스 설정 및 사용자의 브라우저/OS 권한에 의존합니다.');
      }
      providers.setAttribute('data-v5-provider-evidence','mock-only');
      providers.setAttribute('data-v5-ai-evidence','guardrailed');
    }

    const validation=slides[14];
    if(validation){
      setRole(validation,'validation-evidence');
      setText(validation,'.fm-next-story h2','자동 QA, 사람 검수(Human QA), AI 보조 검수(AI-assisted QA)의 역할을 분리했습니다.');
      setText(validation,'.fm-next-story-lead','자동 QA는 Regression, Browser E2E, axe, 상태·복구 계약 테스트, 반응형, 변경 화면 Visual Regression과 Production SHA 기준 HTTP·AI·Chromium smoke를 확인합니다. Case Study는 Ubuntu/Chromium에서 maxDiffPixels: 0으로 비교하고, Real App 스크린샷은 CI 실행 환경의 렌더링 편차만 최대 50 pixels로 제한합니다. 실제 로그인·이메일 전달·Web Push 표시는 사람 검수로 별도 확인하며, AI 보조 검수는 중복·용어 혼용·섹션 역할 충돌·현재 구현과 서술의 불일치를 교차 검수합니다.');
      setHTML(validation,'.fm-next-cs-metrics',
        '<div class="fm-next-cs-metric"><b>16</b><span>Case Study 섹션</span></div>'+
        '<div class="fm-next-cs-metric"><b>320–430</b><span>반응형 너비</span></div>'+
        '<div class="fm-next-cs-metric"><b>0 px</b><span>Case Study 시각 차이</span></div>'+
        '<div class="fm-next-cs-metric"><b>HTTP + AI + Chromium</b><span>Production Smoke</span></div>');
      setHTML(validation,'.fm-next-cs-grid.three',
        '<article class="fm-next-cs-card"><h3>자동 QA</h3><p>추천 순위 소유권, 새로고침 복원, fallback, Beta 참가·복구, 접근성, 반응형과 Visual Regression을 반복 검증합니다.</p></article>'+
        '<article class="fm-next-cs-card"><h3>사람 검수 (Human QA)</h3><p>Google/Kakao 실제 로그인, transactional email 최종 전달, Web Push 브라우저/OS 표시처럼 사람이 실제 결과를 확인해야 하는 항목을 검증합니다.</p></article>'+
        '<article class="fm-next-cs-card"><h3>AI 보조 검수 (AI-assisted QA)</h3><p>중복 문장, 불필요한 영문 혼용, 섹션 역할 충돌, Source of Truth와 카피 불일치를 교차 검수하되 PASS 판정을 대신하지 않습니다.</p></article>');
      setText(validation,'.fm-next-cs-note','자동 QA · 사람 검수 · AI 보조 검수는 서로 대체하지 않고, 각 검증 결과와 한계를 구분해 기록합니다.');
      const story=validation.querySelector('.fm-next-story');
      if(story){
        if(validation.getAttribute('aria-hidden')==='false')story.setAttribute('tabindex','0');
        else{story.dataset.fmCaseStudyTabindex='0';story.setAttribute('tabindex','-1')}
      }
      validation.setAttribute('data-v5-validation-evidence','acceptance');
    }

    const outcome=slides[15];
    if(outcome){
      setRole(outcome,'production-boundary');
      setText(outcome,'.fm-next-story h2','Production 범위는 실제 연결과 검증이 끝난 기능으로만 표시합니다.');
      setText(outcome,'.fm-next-story-lead','/app은 AI inference가 연결되어 있지만 추천 순위는 결정론적 런타임 로직이 소유하고 경기 목록과 거래성 provider는 샘플·시뮬레이션 경계를 유지합니다. /beta는 Supabase 기반 Auth·경기·정원·참가/취소·체크인과 OAuth·이메일·Web Push·미디어를 실제 연결했습니다. 실제 PG와 외부 분석 도구는 Production 범위에 포함하지 않습니다.');
      setHTML(outcome,'.fm-next-cs-outcomes',
        '<div><b>Real App · /app</b><p>AI Gateway 실연동 · 결정론적 추천 순위 · 샘플 경기 데이터 · 시뮬레이션 인증/결제/정원/알림</p></div>'+
        '<div><b>Closed Beta · /beta</b><p>Supabase Auth/경기/정원/참가 · OAuth · 이메일 · Web Push · 미디어 실연동</p></div>'+
        '<div><b>미연동 범위</b><p>실제 PG · 외부 분석 도구</p></div>');
      const finalBox=outcome.querySelector('.fm-next-cs-final');
      if(finalBox){
        setText(finalBox,'span','Production 기준');
        setText(finalBox,'b','외부 연동과 QA 근거가 확인된 기능만 Production 기능으로 표기하고, 미연동 영역은 시뮬레이션 또는 미연동으로 남깁니다.');
        const link=finalBox.querySelector('a');
        if(link)link.innerHTML='FootMate 앱 보기 ↗';
      }
    }

    cleanVersionCopy(document.querySelector('.fm-cs-shell'));
    document.documentElement.dataset.footmateCaseStudyRelease='5.1.1';
    applied=true;
    return true;
  }

  if(patch())return;
  const target=document.querySelector('.track')||document.body;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(target,{childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();