/* FootMate current product Case Study narrative. */
(function(){
  let applied=false;

  const sectionMeta=[
    ['Overview','AI Match Assistant'],
    ['Problem','판단이 오래 걸리는 경기 탐색'],
    ['Persona · JTBD','퇴근 후 바로 결정할 수 있는 확신'],
    ['Product Thesis','판단 맥락을 잃지 않는 하나의 흐름'],
    ['Core Journey','각 단계의 행동과 완료 조건'],
    ['Decision 01','추천 먼저, 로그인은 나중'],
    ['Decision 02','기억된 조건으로 더 빠르게 결정'],
    ['Decision 03','상세에서 결정 근거·저장·비교'],
    ['Sign in','인증 전후 선택 맥락 보존'],
    ['Join · Payment','복구 가능한 참가 상태 전이'],
    ['Matchday · Return','경기 당일에서 다음 탐색까지'],
    ['Recovery','맥락 보존 + 다음 행동'],
    ['Domain Architecture','recommendation · participation · matchday · return'],
    ['Provider · AI Boundary','연결·simulation·HITL 경계'],
    ['Validation','자동 gate와 수동 evidence 분리'],
    ['Production Boundary','연결·검증한 것만 Production 기능']
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
    if(sub)sub.textContent='AI-assisted discovery · 16 sections';
    const topTitle=document.querySelector('.topbar-title');
    if(topTitle)topTitle.textContent='FootMate · Product Case Study';
  }

  function patch(){
    if(applied)return true;
    const slides=[...document.querySelectorAll('.slide')];
    const note=document.querySelector('.fm-next-cover-note');
    if(slides.length!==16||!note)return false;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='4.9.0')return false;

    syncSectionNavigation();

    note.innerHTML='AI Match Assistant<br>Natural language → deterministic recommendation';
    const visual=document.querySelector('.fm-next-cover-visual');
    if(visual)visual.setAttribute('aria-label','FootMate 앱 미리보기');
    const frame=document.querySelector('.fm-next-cover-frame iframe');
    if(frame)frame.title='FootMate 실제 앱 흐름 미리보기';
    const proof=[...document.querySelectorAll('.fm-next-cover-proof > div')];
    if(proof[2]){
      setText(proof[2],'b','AI를 넣되 추천 근거는 보존');
      setText(proof[2],'span','/app의 자연어 조건 해석은 AI가 담당하고 경기 후보·순위·추천 이유는 deterministic recommendation과 sample records가 결정합니다. 실제 참가 검증은 별도 /beta의 Supabase connected data path에서 진행합니다.');
    }

    setRole(slides[3],'product-thesis');
    setText(slides[3],'.fm-next-story h2','기능을 늘리기보다, 판단 맥락이 끊기지 않는 하나의 흐름을 만들었습니다.');
    setText(slides[3],'.fm-next-story-lead','Thesis는 Find → Decide → Join → Play → Return을 나열하는 데 있지 않습니다. 조건·선택·상태를 단계 사이에 보존해 사용자가 같은 판단을 반복하지 않도록 하는 것이 핵심입니다.');
    setHTML(slides[3],'.fm-next-cs-principles',
      '<article class="fm-next-cs-card"><h3>판단 기준을 한곳에</h3><p>시간·거리·레벨·포지션·자리·가격을 여러 화면에서 다시 조합하지 않게 합니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>선택 맥락을 보존</h3><p>필터, 선택 경기와 참가 상태를 단계 전환과 reload 이후에도 이어갑니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>상태마다 다음 행동</h3><p>정상 흐름과 복구 흐름 모두에서 지금 할 수 있는 행동을 분명하게 보여줍니다.</p></article>');

    setRole(slides[4],'core-journey');
    setText(slides[4],'.fm-next-story h2','사용자 행동과 각 단계의 완료 조건을 기준으로 여정을 나눴습니다.');
    setText(slides[4],'.fm-next-story-lead','Find는 탐색 범위를 정하고, Decide는 근거를 비교하고, Join은 선택을 참가 상태로 바꾸며, Play는 경기 당일 행동을 안내하고, Return은 다음 탐색의 입력을 남깁니다. 각 단계의 결과가 다음 단계의 입력이 됩니다.');

    setRole(slides[5],'guest-first-decision');
    const afterBadge=slides[5]?.querySelector('.fm-next-cs-before-after .is-after small');
    if(afterBadge)afterBadge.textContent='AFTER';

    setRole(slides[6],'recommendation-decision');
    setRole(slides[7],'detail-decision');

    setRole(slides[8],'auth-context');
    setText(slides[8],'.fm-next-story h2','로그인보다 중요한 것은, 로그인 전의 선택을 잃지 않는 것입니다.');
    setText(slides[8],'.fm-next-story-lead','`참가하기`에서 인증으로 이동해도 선택한 경기와 돌아갈 목적지를 유지합니다. /app의 인증은 deterministic mock이지만, 인증 전후에 같은 경기·참가 맥락이 이어지는 UX 계약을 검증합니다.');
    const authScope=slides[8]?.querySelector('.fm-next-cs-scope');
    if(authScope){
      setText(authScope,'span','경계');
      setText(authScope,'b','/app은 mock auth · /beta는 Supabase Auth');
      setText(authScope,'p','Closed Beta의 Google/Kakao OAuth는 실제 provider 연결 경로에서 검증하며, 이 섹션은 Real App의 선택 맥락 보존에 집중합니다.');
    }

    setRole(slides[9],'participation-state');
    setText(slides[9],'.fm-next-story h2','참가는 성공 화면 하나가 아니라, 복구 가능한 상태 전이로 관리합니다.');
    setText(slides[9],'.fm-next-story-lead','checkout → pending → success | failure | canceled를 분리하고 결제 시작 시 경기·금액·정책 스냅샷을 고정합니다. 성공에서만 참가를 확정하고, 실패·취소에서는 같은 선택 맥락으로 retry하거나 돌아갈 수 있습니다.');
    setHTML(slides[9],'.fm-next-cs-state-line','<span>checkout</span><i>→</i><span>pending</span><i>→</i><span>success | failure | canceled</span>');
    setHTML(slides[9],'.fm-next-cs-grid.three',
      '<article class="fm-next-cs-card"><h3>스냅샷 고정</h3><p>결제 중 경기·금액·정책이 바뀌어 참가 계약이 흔들리지 않게 합니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>중복 제출 방지</h3><p>pending 동안 같은 참가 요청이 반복되지 않도록 상태와 CTA를 잠급니다.</p></article>'+
      '<article class="fm-next-cs-card"><h3>실패 후 복구</h3><p>failure·canceled는 참가 확정과 분리하고 같은 맥락에서 retry할 수 있게 합니다.</p></article>');
    setText(slides[9],'.fm-next-cs-note','/app의 결제는 deterministic simulation이며 실제 PG는 연결하지 않습니다. /beta는 결제 없는 실제 참가 경로를 Supabase에 연결합니다.');

    setRole(slides[10],'matchday-return');
    setText(slides[10],'.fm-next-story h2','참가 이후에는 경기 당일과 경기 후의 다음 행동이 홈의 우선순위를 바꿉니다.');
    setText(slides[10],'.fm-next-story-lead','upcoming → matchday → checked-in → postgame으로 상태를 이어가고, 경기 후 체감 난이도·완료·반복 의도는 다음 추천의 보조 신호로만 사용합니다. 공개 평판 점수나 자동 참가 판단으로 확대하지 않습니다.');

    setRole(slides[11],'recovery-principle');
    setText(slides[11],'.fm-next-story h2','복구는 기능별 예외가 아니라, 맥락을 보존하고 다음 행동을 여는 공통 원칙입니다.');
    setText(slides[11],'.fm-next-story-lead','검색 0개, 자리 마감, 결제 실패, 경기 당일 이슈가 달라도 복구 설계는 같습니다. 무엇을 보존할지 먼저 정하고, 사용자가 다시 진행할 수 있는 다음 CTA를 바로 연결합니다.');
    const recoveryDecision=slides[11]?.querySelector('.fm-next-cs-decision b');
    if(recoveryDecision)recoveryDecision.textContent='오류 원인 → 보존할 상태 → 다음 행동을 한 세트로 설계해 막다른 화면을 만들지 않습니다.';

    const architecture=slides[12];
    if(architecture){
      setRole(architecture,'domain-architecture');
      setText(architecture,'.fm-next-story h2','추천·참가·경기 당일·경기 후 상태의 소유권을 분리했습니다.');
      setText(architecture,'.fm-next-story-lead','recommendation은 후보·순위·추천 이유, participation은 선택·checkout·참가 확정, matchday는 체크인·운영 상태, return은 경기 후 신호를 소유합니다. 화면은 이 상태를 읽어 표현하고 서로의 책임을 다시 구현하지 않습니다.');
      setHTML(architecture,'.fm-next-cs-modes',
        '<div class="is-focus"><small>RECOMMENDATION</small><h3>Rank & reason</h3><p>후보·순위·추천 이유와 fallback을 소유합니다.</p></div>'+
        '<div><small>PARTICIPATION</small><h3>Join state</h3><p>선택·checkout·참가 확정과 recovery를 소유합니다.</p></div>'+
        '<div><small>MATCHDAY · RETURN</small><h3>Operate & learn</h3><p>체크인·운영 상태와 postgame 보조 신호를 분리합니다.</p></div>');
      setText(architecture,'.fm-next-cs-note','Provider 연결 여부와 AI 권한은 다음 섹션에서 다룹니다. 여기서는 상태와 로직의 ownership만 설명합니다.');
      architecture.setAttribute('data-v5-domain-evidence','separated');
    }

    const providers=slides[13];
    if(providers){
      setRole(providers,'provider-ai-boundary');
      setText(providers,'.fm-next-story h2','연결된 provider와 simulation을 분리하고, AI의 권한도 제한했습니다.');
      setText(providers,'.fm-next-story-lead','/app은 Vercel AI Gateway로 자연어 조건을 해석하지만 경기 후보·순위·추천 이유는 deterministic engine과 sample records가 결정합니다. /beta는 Supabase 기반 실제 참가 데이터를 사용합니다. AI는 경기 ID·가격·정원·순위를 생성하거나 참가·결제를 자동 실행하지 않습니다.');
      setHTML(providers,'.fm-next-cs-grid.three',
        '<article class="fm-next-cs-card"><small>/APP</small><h3>AI + deterministic runtime</h3><p>AI 조건 해석, sample catalog, deterministic ranking과 mock auth/payment/capacity/notification.</p></article>'+
        '<article class="fm-next-cs-card"><small>/BETA</small><h3>Supabase connected</h3><p>Auth·Postgres·RLS·RPC·Realtime과 OAuth·email·Web Push·Storage를 실제 provider 경로로 연결합니다.</p></article>'+
        '<article class="fm-next-cs-card"><small>HITL</small><h3>사람이 확정</h3><p>AI가 탐색을 도와도 참가와 결제처럼 되돌리기 어려운 행동은 사용자가 직접 확인합니다.</p></article>');
      const providerScope=providers.querySelector('.fm-next-cs-scope');
      if(providerScope){
        setText(providerScope,'span','현재 provider 경계');
        setText(providerScope,'b','Connected: AI Gateway · Supabase · Resend · Web Push · Storage');
        setText(providerScope,'p','실제 PG와 external analytics는 미연동입니다. OAuth와 Web Push는 외부 provider 설정 및 사용자의 브라우저/OS 권한에 의존합니다.');
      }
      providers.setAttribute('data-v5-provider-evidence','mock-only');
      providers.setAttribute('data-v5-ai-evidence','guardrailed');
    }

    const validation=slides[14];
    if(validation){
      setRole(validation,'validation-evidence');
      setText(validation,'.fm-next-story h2','검증 방법과 증거 수준을 분리해, 무엇을 자동으로 보장하는지 명확히 했습니다.');
      setText(validation,'.fm-next-story-lead','자동 gate는 Regression, Browser E2E, axe, 상태·복구 contract, responsive, changed-surface Visual Regression과 exact Production HTTP·AI·Chromium smoke를 확인합니다. Case Study는 Ubuntu/Chromium에서 maxDiffPixels: 0으로 비교하고, Real App screenshot은 runner raster 편차만 최대 50 pixels로 제한합니다. 실제 로그인·email delivery·Web Push 표시는 수동 Production evidence로 별도 기록합니다.');
      setHTML(validation,'.fm-next-cs-metrics',
        '<div class="fm-next-cs-metric"><b>16</b><span>Case Study sections</span></div>'+
        '<div class="fm-next-cs-metric"><b>320–430</b><span>responsive widths</span></div>'+
        '<div class="fm-next-cs-metric"><b>0 px</b><span>Case Study visual diff</span></div>'+
        '<div class="fm-next-cs-metric"><b>HTTP + AI + Chromium</b><span>exact Production smoke</span></div>');
      setHTML(validation,'.fm-next-cs-grid.three',
        '<article class="fm-next-cs-card"><h3>기능 계약</h3><p>ranking ownership, reload restoration, provider fallback과 connected Beta 참가·복구 경계를 확인합니다.</p></article>'+
        '<article class="fm-next-cs-card"><h3>화면·접근성</h3><p>axe, responsive overflow, Case Study pixel-exact baseline과 Real App bounded visual regression을 함께 봅니다.</p></article>'+
        '<article class="fm-next-cs-card"><h3>수동 evidence</h3><p>Google/Kakao 실제 로그인, transactional email delivered, Web Push 브라우저/OS 표시는 자동 gate와 분리합니다.</p></article>');
      setText(validation,'.fm-next-cs-note','GitHub Actions 자동 QA와 실제 Production 수동 evidence는 서로 대체하지 않고 각각의 검증 결과로 기록합니다.');
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
      setText(outcome,'.fm-next-story h2','Production이라고 부르는 범위는 실제 연결과 검증이 끝난 기능으로 제한합니다.');
      setText(outcome,'.fm-next-story-lead','/app은 AI inference가 연결되어 있지만 recommendation ranking은 deterministic runtime이 소유하고 match catalog와 transactional provider는 sample·mock 경계를 유지합니다. /beta는 Supabase 기반 Auth·경기·정원·참가/취소·체크인과 OAuth·email·Web Push·media를 연결했습니다. 실제 PG와 external analytics는 Production 범위에 포함하지 않습니다.');
      setHTML(outcome,'.fm-next-cs-outcomes',
        '<div><b>Real App · /app</b><p>AI Gateway connected · deterministic ranking · sample catalog · mock transactional providers</p></div>'+
        '<div><b>Closed Beta · /beta</b><p>Supabase Auth/data/capacity/participation · OAuth · email · Web Push · media connected</p></div>'+
        '<div><b>Out of scope</b><p>실제 PG · external analytics</p></div>');
      const finalBox=outcome.querySelector('.fm-next-cs-final');
      if(finalBox){
        setText(finalBox,'span','Production 기준');
        setText(finalBox,'b','provider 연결과 해당 QA evidence가 확인된 기능만 Production 기능으로 표기하고, 미연동 영역은 simulation 또는 미연동으로 남깁니다.');
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
