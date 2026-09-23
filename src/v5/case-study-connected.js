/* FootMate current product Case Study narrative. */
(function(){
  let applied=false;

  const visibleSourceIndexes=[0,1,2,3,5,6,7,8,10,11,12,14,15];
  const sectionMeta=[
    ['Overview','AI Match Assistant'],
    ['Problem','Slow Match Decisions'],
    ['Persona · JTBD','Confidence After Work'],
    ['Product Thesis','One Continuous Decision Flow'],
    ['Decision 01','Value Before Account'],
    ['Decision 02','Memory-Assisted Discovery'],
    ['Decision 03','Decision-Centered Detail'],
    ['Sign in · Join','Preserve Context Through Participation'],
    ['Matchday · Return','From Check-in to Next Match'],
    ['Recovery','Preserve Context, Offer Next Action'],
    ['Domain · AI Boundary','Ownership, Providers, and Guardrails'],
    ['Validation','Automated, Human, and AI-Assisted QA'],
    ['Production Boundary','Only Connected and Verified Capabilities']
  ];
  const bodyKickers=[
    '',
    '02 · 문제',
    '03 · Persona · JTBD',
    '04 · 제품 원칙 · 핵심 여정',
    '05 · 설계 결정 01',
    '06 · 설계 결정 02',
    '07 · 설계 결정 03',
    '08 · 로그인 · 참가',
    '09 · 경기 당일 · 재탐색',
    '10 · 복구',
    '11 · 도메인 · AI 경계',
    '12 · 검증',
    '13 · Production 범위'
  ];

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

  function cleanReaderRouteLabels(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      const before=node.nodeValue||'';
      const after=before
        .replace(/\/app\b/g,'Real App')
        .replace(/\/beta\b/g,'Closed Beta');
      if(after!==before)node.nodeValue=after;
    }
  }

  function ensureConsistencyStyle(){
    if(document.getElementById('fm-case-study-consistency-v2'))return;
    const style=document.createElement('style');
    style.id='fm-case-study-consistency-v2';
    style.textContent=`
      .fm-next-story-slide{padding:52px 64px 58px!important}
      .fm-next-story{width:min(1160px,100%);height:auto;max-height:none;display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-content:start;align-items:start;overflow:visible;padding:0 4px 10px}
      .fm-next-story-copy,.fm-next-story-aside{min-width:0;width:100%}
      .fm-next-story-aside{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;align-items:stretch}
      .fm-next-story-kicker{margin-bottom:10px}
      .fm-next-story h2{max-width:100%;margin:0 0 10px;font-size:clamp(32px,3.7vw,46px);line-height:1.12;letter-spacing:-.052em}
      .fm-next-story-lead{max-width:78ch;margin:0 0 14px;font-size:14px;line-height:1.58}
      .fm-next-story-copy>:is(.fm-next-cs-grid,.fm-next-cs-persona,.fm-next-cs-loop,.fm-next-cs-journey,.fm-next-cs-before-after,.fm-next-cs-reco,.fm-next-cs-detail-order,.fm-next-cs-auth-flow,.fm-next-cs-state-line,.fm-next-cs-day-states,.fm-next-cs-recovery,.fm-next-cs-modes,.fm-next-cs-metrics,.fm-next-cs-outcomes){margin-top:14px}
      .fm-next-cs-grid,.fm-next-cs-persona,.fm-next-cs-before-after,.fm-next-cs-modes,.fm-next-cs-metrics,.fm-next-cs-day-states,.fm-next-cs-recovery,.fm-next-cs-outcomes{gap:12px;align-items:stretch}
      .fm-next-cs-card,.fm-next-cs-persona>div,.fm-next-cs-before-after>div,.fm-next-cs-modes>div,.fm-next-cs-day-states>div,.fm-next-cs-recovery>div,.fm-next-cs-outcomes>div,.fm-next-cs-quote,.fm-next-cs-jtbd,.fm-next-cs-decision,.fm-next-cs-scope,.fm-next-cs-sticky,.fm-next-cs-note{padding:14px 16px;border-radius:16px}
      .fm-next-cs-card h3{font-size:15px;line-height:1.4;margin-bottom:6px}
      .fm-next-cs-card p,.fm-next-cs-jtbd p,.fm-next-cs-scope p,.fm-next-cs-sticky p,.fm-next-cs-note,.fm-next-cs-before-after p,.fm-next-cs-modes p,.fm-next-cs-day-states p,.fm-next-cs-recovery span,.fm-next-cs-outcomes p{font-size:12px;line-height:1.55}
      .fm-next-story :where(h2,h3,p,b,span,small,a,strong){word-break:keep-all;overflow-wrap:normal;line-break:strict}
      .fm-next-cs-state-line span,.fm-next-cs-modes small,.fm-next-cs-metric b{overflow-wrap:anywhere}
      .fm-next-cs-loop{padding:13px 15px;gap:7px}
      .fm-next-cs-loop b,.fm-next-cs-loop span{font-size:12px}
      .fm-next-cs-state-line{padding:12px 14px}
      .fm-next-cs-metric{padding:13px 14px}
      .fm-next-cs-final{padding:16px 18px;border-radius:18px}
      .fm-next-cs-final>b{font-size:15px;line-height:1.5}
      .fm-next-cs-final>a{min-height:40px;margin-top:12px}
      @media(max-height:820px) and (min-width:901px){
        .fm-next-story-slide{padding-top:46px!important;padding-bottom:50px!important}
        .fm-next-story{gap:12px}
        .fm-next-story h2{font-size:clamp(30px,3.2vw,40px)}
        .fm-next-story-lead{font-size:13px;line-height:1.5;margin-bottom:10px}
        .fm-next-story-copy>:is(.fm-next-cs-grid,.fm-next-cs-persona,.fm-next-cs-loop,.fm-next-cs-before-after,.fm-next-cs-reco,.fm-next-cs-detail-order,.fm-next-cs-auth-flow,.fm-next-cs-state-line,.fm-next-cs-day-states,.fm-next-cs-recovery,.fm-next-cs-modes,.fm-next-cs-metrics,.fm-next-cs-outcomes){margin-top:10px}
        .fm-next-cs-card,.fm-next-cs-persona>div,.fm-next-cs-before-after>div,.fm-next-cs-modes>div,.fm-next-cs-day-states>div,.fm-next-cs-recovery>div,.fm-next-cs-outcomes>div,.fm-next-cs-quote,.fm-next-cs-jtbd,.fm-next-cs-decision,.fm-next-cs-scope,.fm-next-cs-sticky,.fm-next-cs-note{padding:12px 14px}
      }
      @media(max-width:900px){
        .fm-next-story-slide{padding:34px 20px 44px!important}
        .fm-next-story{gap:12px}
        .fm-next-story-aside{grid-template-columns:1fr}
        .fm-next-story h2{font-size:clamp(28px,8.4vw,36px)}
        .fm-next-story-lead{font-size:13px;line-height:1.62}
      }
    `;
    document.head.appendChild(style);
  }

  function hideMergedSections(slides){
    for(const index of [4,9,13]){
      const slide=slides[index];
      if(!slide)continue;
      slide.hidden=true;
      slide.dataset.csHidden='true';
      slide.setAttribute('aria-hidden','true');
    }
  }

  function syncSectionNavigation(){
    const toc=[...document.querySelectorAll('.toc-item')];
    const dots=[...document.querySelectorAll('.dot')];
    toc.forEach((item,index)=>{
      if(index<sectionMeta.length){
        item.hidden=false;
        item.dataset.csHidden='false';
        setText(item,'.toc-n',String(index+1).padStart(2,'0'));
        setText(item,'.toc-t',sectionMeta[index][0]);
        setText(item,'.toc-s',sectionMeta[index][1]);
      }else{
        item.hidden=true;
        item.dataset.csHidden='true';
      }
    });
    dots.forEach((dot,index)=>{
      dot.hidden=index>=sectionMeta.length;
      dot.dataset.csHidden=index>=sectionMeta.length?'true':'false';
      if(index<sectionMeta.length)dot.setAttribute('aria-label',`${index+1}번 섹션`);
    });
    const sub=document.querySelector('.sb-sub');
    if(sub)sub.textContent='AI-assisted discovery · 13 sections';
    const topTitle=document.querySelector('.topbar-title');
    if(topTitle)topTitle.textContent='FootMate · Product Case Study';
  }

  function syncBodyKickers(slides){
    visibleSourceIndexes.forEach((sourceIndex,visibleIndex)=>{
      if(sourceIndex===0)return;
      setText(slides[sourceIndex],'.fm-next-story-kicker',bodyKickers[visibleIndex]);
    });
  }

  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.9.0')return false;

    ensureConsistencyStyle();
    hideMergedSections(slides);
    syncSectionNavigation();
    syncBodyKickers(slides);

    note.innerHTML='AI Match Assistant<br>자연어 조건 해석 → 추천 순위 계산';
    note.style.wordBreak='keep-all';
    note.style.overflowWrap='normal';
    const visual=document.querySelector('.fm-next-cover-visual');
    if(visual)visual.setAttribute('aria-label','FootMate 앱 미리보기');
    const frame=document.querySelector('.fm-next-cover-frame iframe');
    if(frame)frame.title='FootMate 실제 앱 흐름 미리보기';
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){
      setText(proof[2],'b','AI를 넣되 추천 근거는 보존');
      setText(proof[2],'span','자연어 조건은 AI가 해석하지만 경기 후보·순위·추천 이유는 기존 추천 로직이 결정합니다.');
    }

    setRole(slides[3],'product-thesis-journey');
    setText(slides[3],'.fm-next-story h2','기능을 늘리기보다, 판단 맥락이 끊기지 않는 하나의 흐름을 만들었습니다.');
    setText(slides[3],'.fm-next-story-lead','탐색에서 경기 후 재탐색까지 조건·선택·상태를 단계 사이에 보존해 같은 판단을 반복하지 않도록 했습니다. 각 단계의 결과가 다음 단계의 입력이 됩니다.');
    setHTML(slides[3],'.fm-next-cs-loop','<b>탐색</b><span>Find</span><i>→</i><b>결정</b><span>Decide</span><i>→</i><b>참가</b><span>Join</span><i>→</i><b>경기</b><span>Play</span><i>→</i><b>재탐색</b><span>Return</span>');
    setHTML(slides[3],'.fm-next-cs-principles',
      '<article class="fm-next-cs-card"><h3>판단 기준을 한곳에</h3><p>시간·거리·레벨·포지션·자리·가격을 여러 화면에서 다시 조합하지 않게 합니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>선택 맥락을 보존</h3><p>필터, 선택 경기와 참가 상태를 단계 전환과 새로고침 이후에도 이어갑니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>상태마다 다음 행동</h3><p>정상 흐름과 복구 흐름 모두에서 지금 할 수 있는 행동을 분명하게 보여줍니다.</p></article>');

    setRole(slides[5],'guest-first-decision');
    setText(slides[5],'.fm-next-story h2','추천과 상세를 먼저 보여주고, 로그인은 참가 의도가 생긴 뒤 요청합니다.');
    setText(slides[5],'.fm-next-story-lead','처음 방문한 사용자가 계정을 만들기 전에 추천의 가치를 확인할 수 있도록 탐색과 상세를 열어 두고, 참가 계약을 시작하는 시점에만 인증을 배치했습니다.');
    const beforeAfter=slides[5]?.querySelectorAll('.fm-next-cs-before-after small');
    if(beforeAfter?.[0])beforeAfter[0].textContent='기존';
    if(beforeAfter?.[1])beforeAfter[1].textContent='개선';

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

    setRole(slides[8],'auth-participation');
    setText(slides[8],'.fm-next-story h2','로그인 전 선택을 잃지 않고 참가 상태까지 이어갑니다.');
    setText(slides[8],'.fm-next-story-lead','참가하기에서 인증으로 이동해도 선택한 경기와 돌아갈 목적지를 유지합니다. Real App의 인증·결제는 시뮬레이션이며, Closed Beta의 인증·참가 경로는 Supabase에 실제 연결됩니다.');
    setHTML(slides[8],'.fm-next-cs-auth-flow','<div><small>둘러보기</small><b>추천·상세 확인</b></div><i>→</i><div><small>참가 의도</small><b>참가하기</b></div><i>→</i><div class="is-focus"><small>인증</small><b>로그인</b></div><i>→</i><div><small>참가 상태</small><b>완료·실패·취소</b></div>');
    const authFlow=slides[8]?.querySelector('.fm-next-cs-auth-flow');
    if(authFlow&&!slides[8].querySelector('.fm-next-cs-state-line'))authFlow.insertAdjacentHTML('afterend','<div class="fm-next-cs-state-line"><span>선택 경기</span><i>→</i><span>인증</span><i>→</i><span>참가 요청</span><i>→</i><span>완료 | 실패 | 취소</span></div>');
    const authScope=slides[8]?.querySelector('.fm-next-cs-scope');
    if(authScope){
      setText(authScope,'span','연동 경계');
      setText(authScope,'b','Real App: 시뮬레이션 인증·결제 · Closed Beta: Supabase Auth·참가');
      setText(authScope,'p','Closed Beta의 Google/Kakao OAuth는 Production 실로그인까지 검증했습니다. 실제 PG는 연결하지 않았습니다.');
    }

    setRole(slides[10],'matchday-return');
    setText(slides[10],'.fm-next-story h2','참가 이후에는 경기 당일과 경기 후의 다음 행동이 홈의 우선순위를 바꿉니다.');
    setText(slides[10],'.fm-next-story-lead','참가 예정 → 경기 당일 → 체크인 → 경기 후로 상태를 이어가고, 경기 후 체감 난이도·참여 완료·반복 의도는 다음 추천의 보조 신호로만 사용합니다. 공개 평판 점수나 자동 참가 판단으로 확대하지 않습니다.');

    setRole(slides[11],'recovery-principle');
    setText(slides[11],'.fm-next-story h2','복구는 기능별 예외가 아니라, 맥락을 보존하고 다음 행동을 여는 공통 원칙입니다.');
    setText(slides[11],'.fm-next-story-lead','검색 0개, 자리 마감, 결제 실패, 경기 당일 이슈가 달라도 무엇을 보존할지 먼저 정하고 사용자가 다시 진행할 수 있는 다음 CTA를 바로 연결합니다.');
    const recoveryDecision=slides[11]?.querySelector('.fm-next-cs-decision b');
    if(recoveryDecision)recoveryDecision.textContent='오류 원인 → 보존할 상태 → 다음 행동을 한 세트로 설계해 막다른 화면을 만들지 않습니다.';

    setRole(slides[12],'domain-ai-boundary');
    setText(slides[12],'.fm-next-story h2','상태 소유권과 외부 연동, AI 권한을 한 경계 안에서 분리했습니다.');
    setText(slides[12],'.fm-next-story-lead','`recommendation`은 후보·순위·추천 이유, `participation`은 참가 상태, `matchday`는 체크인·운영 상태, `return`은 경기 후 신호를 소유합니다. AI는 자연어 조건만 해석하고 경기 사실·가격·정원·순위를 만들거나 참가를 자동 실행하지 않습니다.');
    setHTML(slides[12],'.fm-next-cs-modes',
      '<div class="is-focus"><small>RECOMMENDATION</small><h3>추천 소유권</h3><p>후보·순위·추천 이유와 fallback은 결정론적 추천 엔진이 소유합니다.</p></div>'+
      '<div><small>PARTICIPATION · MATCHDAY · RETURN</small><h3>상태 소유권</h3><p>참가·체크인·경기 후 상태를 분리해 화면이 같은 책임을 다시 구현하지 않게 합니다.</p></div>'+
      '<div><small>AI · PROVIDERS · HITL</small><h3>연동과 실행 경계</h3><p>Real App은 AI Gateway+샘플 경기, Closed Beta는 Supabase 실데이터를 사용하며 참가·결제는 사람이 최종 확정합니다.</p></div>');
    setText(slides[12],'.fm-next-cs-note','실연동: Vercel AI Gateway · Supabase · Resend · Web Push · Storage. 실제 PG와 외부 분석 도구는 미연동입니다.');
    slides[12].setAttribute('data-v5-domain-evidence','separated');
    slides[12].setAttribute('data-v5-ai-evidence','guardrailed');

    setRole(slides[14],'validation-evidence');
    setText(slides[14],'.fm-next-story h2','자동 QA, 사람 검수, AI 보조 검수의 역할을 분리했습니다.');
    setText(slides[14],'.fm-next-story-lead','자동 QA는 Regression, Browser E2E, axe, 상태·복구 계약 테스트, 반응형, 변경 화면 Visual Regression과 Production SHA 기준 HTTP·AI·Chromium smoke를 확인합니다. 실제 로그인·이메일 전달·Web Push 표시는 사람 검수로 별도 확인하며, AI 보조 검수는 중복·용어 혼용·섹션 역할 충돌과 Source of Truth 불일치를 찾되 PASS 판정을 대신하지 않습니다.');
    setHTML(slides[14],'.fm-next-cs-metrics',
      '<div class="fm-next-cs-metric"><b>13</b><span>Case Study sections</span></div>'+
      '<div class="fm-next-cs-metric"><b>320–430</b><span>Responsive widths</span></div>'+
      '<div class="fm-next-cs-metric"><b>0 px</b><span>Case Study visual diff</span></div>'+
      '<div class="fm-next-cs-metric"><b>HTTP + AI + Chromium</b><span>Production Smoke</span></div>');
    setHTML(slides[14],'.fm-next-cs-grid.three',
      '<article class="fm-next-cs-card"><h3>자동 QA</h3><p>추천 순위 소유권, 새로고침 복원, fallback, Beta 참가·복구, 접근성, 반응형과 Visual Regression을 반복 검증합니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>사람 검수 (Human QA)</h3><p>Google/Kakao 실제 로그인, transactional email 최종 전달, Web Push 브라우저/OS 표시처럼 사람이 실제 결과를 확인해야 하는 항목을 검증합니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>AI 보조 검수 (AI-assisted QA)</h3><p>중복·용어 혼용·섹션 역할 충돌·현재 구현과 서술의 불일치를 교차 검수하되 PASS 판정을 대신하지 않습니다.</p></article>');
    setText(slides[14],'.fm-next-cs-note','Case Study Visual Regression은 Ubuntu/Chromium의 승인 baseline과 실제 screenshot comparison을 분리하지 않고 같은 gate에서 확인합니다.');
    slides[14].setAttribute('data-v5-validation-evidence','acceptance');

    setRole(slides[15],'production-boundary');
    setText(slides[15],'.fm-next-story h2','Production 범위는 실제 연결과 검증이 끝난 기능으로만 표시합니다.');
    setText(slides[15],'.fm-next-story-lead','Real App은 AI inference가 연결되어 있지만 추천 순위는 결정론적 런타임 로직이 소유하고 경기 목록과 거래성 provider는 샘플·시뮬레이션 경계를 유지합니다. Closed Beta는 Supabase 기반 Auth·경기·정원·참가/취소·체크인과 OAuth·이메일·Web Push·미디어를 실제 연결했습니다.');
    setHTML(slides[15],'.fm-next-cs-outcomes',
      '<div><b>Real App</b><p>AI Gateway 실연동 · 결정론적 추천 순위 · 샘플 경기 데이터 · 시뮬레이션 인증/결제/정원/알림</p></div>'+
      '<div><b>Closed Beta</b><p>Supabase Auth/경기/정원/참가 · OAuth · 이메일 · Web Push · 미디어 실연동</p></div>'+
      '<div><b>미연동 범위</b><p>실제 PG · 외부 분석 도구</p></div>');
    const finalBox=slides[15]?.querySelector('.fm-next-cs-final');
    if(finalBox){
      setText(finalBox,'span','Production 기준');
      setText(finalBox,'b','외부 연동과 QA 근거가 확인된 기능만 Production 기능으로 표기하고, 미연동 영역은 시뮬레이션 또는 미연동으로 남깁니다.');
      const link=finalBox.querySelector('a');
      if(link)link.innerHTML='FootMate 앱 보기 ↗';
    }

    cleanVersionCopy(document.querySelector('.fm-cs-shell'));
    cleanReaderRouteLabels(document.querySelector('.fm-cs-shell'));
    document.documentElement.dataset.footmateCaseStudyRelease='5.1.1';
    document.documentElement.dataset.footmateCaseStudySections='13';
    applied=true;
    window.refreshCaseStudyNavigation?.();
    return true;
  }

  if(patch())return;
  const target=document.querySelector('.track')||document.body;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(target,{childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<40)requestAnimationFrame(retry)})();
})();
