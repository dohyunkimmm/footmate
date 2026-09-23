/* FootMate current product Case Study narrative. */
(function(){
  let applied=false;

  const visibleSourceIndexes=[0,1,2,3,5,6,7,8,10,11,12,14,15];
  const sectionMeta=[
    ['Overview','Role & Scope'],
    ['Problem & Goal','Why This Problem'],
    ['Persona · JTBD','Who & When'],
    ['Scope & Priority','Value Before Scale'],
    ['Guest First','Value Before Account'],
    ['Recommendation','Reasons & Memory'],
    ['Decision Detail','From Detail to Join'],
    ['Sign in · Join','Context & Confirmation'],
    ['Operations','Matchday & Return'],
    ['Recovery','Preserve & Retry'],
    ['Domain & AI','Contracts & Guardrails'],
    ['KPI & Validation','Metrics & Evidence'],
    ['Release & Learnings','Limits & Next Steps']
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

    // One editorial owner per visible section. Sentence spans keep meaning intact
    // without imposing fixed pixel widths or clipping narrow-screen text.
    const lines=(...copy)=>copy.map(text=>`<span class="fm-cs-line">${text}</span>`).join(' ');
    const title=(index,...copy)=>setHTML(slides[index],'.fm-next-story h2',lines(...copy));
    const lead=(index,...copy)=>setHTML(slides[index],'.fm-next-story-lead',lines(...copy));
    const card=(heading,...copy)=>`<article class="fm-next-cs-card"><h3>${heading}</h3><p>${lines(...copy)}</p></article>`;
    const rows=(items)=>`<dl class="fm-cs-reasons">${items.map(([label,copy])=>`<div><dt>${label}</dt><dd>${copy}</dd></div>`).join('')}</dl>`;
    const decision=(index,selector,items)=>setHTML(slides[index],selector,rows(items));

    note.innerHTML='AI Match Assistant<br>자연어 조건 해석 → 추천 순위 계산';
    note.style.wordBreak='keep-all';
    note.style.overflowWrap='normal';
    document.querySelector('.fm-next-cover-visual')?.setAttribute('aria-label','FootMate 앱 미리보기');
    const frame=document.querySelector('.fm-next-cover-frame iframe');
    if(frame)frame.title='FootMate 실제 앱 흐름 미리보기';
    setHTML(slides[0],'.fm-next-cover-lead',lines(
      '나에게 맞는 이유를 확인하고, 안심하고 참가하는 풋살 서비스입니다.',
      '탐색부터 경기 당일·재탐색까지 단독으로 기획하고 구현·검증했습니다.'
    ));
    setHTML(slides[0],'.fm-next-cover-proof',
      '<div><b>Role · IT Service Planner</b><span>'+lines('문제 정의 · Persona/JTBD','IA · 기능·정책 설계')+'</span></div>'+
      '<div><b>Scope · 기획·구현·검증</b><span>'+lines('프로토타입 · API·데이터 계약','QA · 배포 검증')+'</span></div>'+
      '<div><b>Responsibility · 의사결정</b><span>'+lines('요구사항 우선순위 · 예외 처리','실제 연동과 시뮬레이션 구분')+'</span></div>'
    );

    title(1,'경기 선택의 불확실성을 줄여,','참가와 다음 탐색으로 연결합니다.');
    lead(1,'문제 가설은 “경기 정보를 찾아도 참가 결정은 여전히 어려울 수 있다”입니다.',
      '자연어 탐색의 편의뿐 아니라 추천 근거와 참가 안전성, 운영 복구까지 검증 범위에 넣었습니다.');
    setHTML(slides[1],'.fm-next-cs-grid.three',
      card('탐색 부담 줄이기','시간·거리·레벨을 한곳에서 비교합니다.','확인 지표 · 상세 진입률, 결과 없음 비율')+
      card('참가 판단 돕기','추천 이유·정원·취소 규칙을 먼저 보여줍니다.','확인 지표 · 참가 전환율, 참가 실패율')+
      card('다시 찾을 이유 만들기','체크인·경기 후 피드백을 다음 탐색에 잇습니다.','확인 지표 · 체크인 완료율, 7일 내 재탐색률'));
    setHTML(slides[1],'.fm-next-cs-quote','<span>대안 검토 · 설계 가설</span>'+rows([
      ['대안','목록·필터로 조건 비교 · 지도로 위치 확인 · 커뮤니티로 경기 맥락 확인'],
      ['선택','조건 해석 → 추천 이유 → 참가 → 경기 당일을 하나의 흐름으로 연결'],
      ['검증 범위','사용자 조사나 경쟁사 우위가 입증된 결론은 아니며, Beta에서 가설을 확인']
    ]));

    title(2,'퇴근 후 갈 수 있는 경기를,','오래 고민하지 않고 고르고 싶습니다.');
    lead(2,'설계용 Persona는 평일 저녁에 주 1~2회 풋살을 즐기는 직장인입니다.',
      '30분 안쪽 이동과 실력 차이를 주요 기준으로 가정했습니다. 인터뷰로 검증한 집단은 아닙니다.');
    setHTML(slides[2],'.fm-next-cs-persona',
      '<div><span>주요 상황</span><b>'+lines('평일 저녁 · 주 1~2회','30분 안쪽으로 이동')+'</b></div>'+
      '<div><span>결정 기준</span><b>'+lines('레벨 · 거리','포지션 · 남은 자리')+'</b></div>'+
      '<div><span>불안 요소</span><b>'+lines('실력 차이 · 자리 마감','취소 규칙 · 경기 당일 변수')+'</b></div>');
    setHTML(slides[2],'.fm-next-cs-jtbd','<small>JTBD · 다음 관찰 질문</small><p>'+lines(
      '“오늘 뛸 수 있는 경기에서, 나와 잘 맞는 이유를 빠르게 이해하고 싶다.”',
      'Beta에서는 어떤 조건을 먼저 확인하고, 어느 정보가 부족할 때 참가를 망설이는지 관찰합니다.')+'</p>');

    setRole(slides[3],'product-thesis-journey');
    title(3,'참가 흐름과 운영 안전성을 먼저,','수익화 검증은 다음으로 정했습니다.');
    lead(3,'우선순위 기준은 판단에 주는 가치, 참가 실패의 영향, 검증 가능성입니다.',
      '아래는 현재 구현 범위를 이 기준으로 정리한 것으로, 당시의 정량 평가 기록은 아닙니다.');
    setHTML(slides[3],'.fm-next-cs-loop',[['탐색','Find'],['결정','Decide'],['참가','Join'],['경기','Play'],['재탐색','Return']].map(([ko,en],index)=>`<div><b>${index+1}. ${ko}</b><span>${en}</span></div>`).join('<i>→</i>'));
    setHTML(slides[3],'.fm-next-cs-principles',
      card('우선 · 참가와 복구','판단 기준을 한곳에 모으고 선택 맥락을 보존합니다.',
        '무료 Beta에서 인증·정원·참가/취소·체크인·복구를 검증합니다.')+
      card('확장 · 운영과 반복 이용','대기열·알림·경기 후 피드백으로 자리 회복과 재탐색을 지원합니다.',
        '참가 전환과 반복 이용에 미치는 효과는 실제 이용 데이터로 확인할 과제입니다.')+
      card('제외 · 실제 PG와 자동 참가','실제 PG를 미뤄 수익화 검증을 유보했습니다.',
        'AI 자동 참가는 제외하고, 사용자가 최종 확인하는 HITL을 유지합니다.'));

    setRole(slides[5],'guest-first-decision');
    title(5,'추천과 상세를 먼저 보여주고,','참가할 때 로그인을 요청합니다.');
    lead(5,'가입 전에 자신에게 맞는 경기가 있는지 판단할 수 있도록 탐색과 상세를 열었습니다.',
      '계정이 필요한 시점을 참가 요청 직전으로 옮겨, 가치 확인과 인증의 순서를 정했습니다.');
    setHTML(slides[5],'.fm-next-cs-before-after',
      '<div><small>비교한 대안 · 가입 우선</small><b>'+lines('첫 화면 → 로그인 → 설문','추천 확인')+'</b><p>가치 확인 전에 계정 생성이 필요합니다.</p></div>'+
      '<div class="is-after"><small>채택한 흐름 · 탐색 우선</small><b>'+lines('조건 설정 → 추천 → 상세','참가 시 로그인')+'</b><p>추천을 확인한 뒤 가입 여부를 결정합니다.</p></div>');
    decision(5,'.fm-next-cs-decision',[
      ['결정','가입 전 추천·상세 공개'],['이유','참가 의도가 생기기 전에 서비스 가치를 판단'],
      ['Trade-off','로그인 전에는 계정 기반 개인화와 기기 간 연속성을 제한']]);

    setRole(slides[6],'recommendation-decision');
    title(6,'같은 조건을 다시 입력하지 않고,','추천 이유부터 확인하게 했습니다.');
    lead(6,'저장한 프로필·선호 조건·최근 확인 이력으로 반복 탐색의 입력 부담을 줄였습니다.',
      '추천 후보·순위·이유는 기존 추천 엔진이 결정하며, 사용자는 상세에서 근거를 확인합니다.');
    setHTML(slides[6],'.fm-next-cs-reco-card','<span>추천 표현 예시 · 수원 영통</span><h3>조건과 잘 맞아요</h3><div><b>생활권 일치</b><b>평일 저녁 선호</b><b>MF 자리 있음</b></div><strong>추천 1순위</strong>');
    setHTML(slides[6],'.fm-next-cs-stack','<p><b>1.</b> 저장 프로필</p><p><b>2.</b> 선호 지역·시간·경기 형식</p><p><b>3.</b> 최근 확인 이력</p><p><b>4.</b> 현재 경기 조건과 잔여 자리</p>');
    decision(6,'.fm-next-cs-note',[
      ['결정','최근 선호는 추천을 돕는 입력으로만 사용'],['이유','추천 순위와 이유를 추적할 수 있게 유지'],
      ['Trade-off','과거 선호와 오늘의 의도가 다를 수 있어 조건 수정을 허용']]);

    setRole(slides[7],'detail-decision');
    title(7,'상세의 정보 순서와 행동을','참가 결정에 맞췄습니다.');
    lead(7,'갈 수 있는 경기인지, 나와 맞는지, 어떤 조건으로 참가하는지 순서대로 확인하게 했습니다.',
      '저장과 최대 2경기 비교는 보조 행동으로 두고, 참가하기를 핵심 CTA로 유지합니다.');
    setHTML(slides[7],'.fm-next-cs-detail-order','<span>시간 · 장소</span><i>→</i><span>추천 이유</span><i>→</i><span>자리 · 포지션</span><i>→</i><span>시설 · 운영 · 준비물</span><i>→</i><span>취소 · 환불 기준</span>');
    decision(7,'.fm-next-cs-sticky',[
      ['핵심 행동','참가하기'],['보조 행동','저장 · 최대 2경기 비교'],
      ['Trade-off','비교 대상을 제한해 결정을 돕고, 취소·환불 기준은 참가 전에 확인']]);

    setRole(slides[8],'auth-participation');
    title(8,'로그인 전에 고른 경기를','참가 완료까지 유지합니다.');
    lead(8,'선택 경기와 돌아갈 목적지를 보존해 인증 후 같은 결정을 반복하지 않도록 했습니다.',
      '참가 요청 결과는 완료·실패·취소로 구분하고, 상태에 맞는 다음 행동을 제공합니다.');
    setHTML(slides[8],'.fm-next-cs-auth-flow','<div><small>둘러보기</small><b>추천·상세 확인</b></div><i>→</i><div><small>참가 의도</small><b>참가하기</b></div><i>→</i><div class="is-focus"><small>인증</small><b>로그인</b></div><i>→</i><div><small>참가 상태</small><b>완료 | 실패 | 취소</b></div>');
    const authFlow=slides[8].querySelector('.fm-next-cs-auth-flow');
    if(authFlow&&!slides[8].querySelector('.fm-next-cs-state-line'))authFlow.insertAdjacentHTML('afterend','<div class="fm-next-cs-state-line"><span>보존할 맥락 · 선택 경기와 인증 후 돌아갈 목적지</span></div>');
    decision(8,'.fm-next-cs-scope',[
      ['Real App','Real App의 인증·결제는 시뮬레이션입니다.'],
      ['Closed Beta','Closed Beta의 인증·참가 경로는 Supabase에 실제 연결됩니다.'],
      ['검증 범위','Google/Kakao OAuth는 Production 실로그인까지 검증했습니다. 실제 PG는 미연동입니다.']]);

    setRole(slides[10],'matchday-return');
    title(10,'참가 후에는 경기 당일과','다음 탐색을 홈의 중심에 둡니다.');
    lead(10,'참가 예정 → 경기 당일 → 체크인 → 경기 후 상태에 따라 필요한 행동을 먼저 보여줍니다.',
      '체감 난이도·참여 완료·반복 의도는 다음 추천의 보조 신호이며, 공개 평판 점수로 쓰지 않습니다.');
    setHTML(slides[10],'.fm-next-cs-day-states',
      '<div><small>탐색 중</small><b>지금 맞는 경기</b><p>조건 설정 · 추천 확인</p></div>'+
      '<div><small>참가 확정</small><b>다가오는 경기</b><p>일정 · 준비 정보</p></div>'+
      '<div class="is-focus"><small>경기 당일</small><b>이동과 체크인</b><p>길찾기 · 운영 도움</p></div>'+
      '<div><small>경기 후</small><b>피드백과 재탐색</b><p>체감 난이도 · 반복 의도</p></div>');
    const operations=slides[10].querySelector('.fm-next-story-aside');
    if(operations)operations.insertAdjacentHTML('afterbegin','<div class="fm-next-cs-note">'+rows([
      ['운영 권한','경기·정원·취소 마감·체크인·종료 관리'],
      ['자리 회복','취소 시 포지션별 대기열을 등록 순서(FIFO)로 승급'],
      ['변경과 복구','변경 이력(audit trail)을 남기고, 알림 실패와 참가 상태를 분리해 복구']])+'</div>');

    setRole(slides[11],'recovery-principle');
    title(11,'실패해도 선택 맥락을 보존하고,','다시 진행할 행동을 제시합니다.');
    lead(11,'오류마다 보존할 상태와 다시 시도할 행동을 함께 정의했습니다.',
      '검색부터 경기 당일까지, 처음부터 다시 입력해야 하는 상황을 줄이는 것이 복구의 기준입니다.');
    setHTML(slides[11],'.fm-next-cs-recovery',
      '<div><b>추천 없음</b><span>'+lines('보존 · 입력한 탐색 조건','다음 · 지역·시간 수정 또는 조건 완화')+'</span></div>'+
      '<div><b>자리 마감</b><span>'+lines('보존 · 선택 경기와 포지션','다음 · 대기 등록 또는 비슷한 경기 탐색')+'</span></div>'+
      '<div><b>결제 실패 · 시뮬레이션</b><span>'+lines('보존 · 선택 경기와 참가 의도','다음 · 재시도 또는 결제수단 변경')+'</span></div>'+
      '<div><b>경기 당일 문제</b><span>'+lines('보존 · 참가·체크인 상태','다음 · 체크인 재시도 또는 운영 도움')+'</span></div>');
    setHTML(slides[11],'.fm-next-cs-decision','<span>공통 복구 원칙</span><b>원인·보존할 상태·다음 행동을 함께 제시</b>');

    setRole(slides[12],'domain-ai-boundary');
    title(12,'AI의 해석과 서비스의 판단을','명확한 책임으로 나눴습니다.');
    lead(12,'AI는 자연어 조건을 해석하고, 추천 엔진은 후보·순위·이유를 결정합니다.',
      'Realtime은 변경 신호로만 사용합니다. 추가 조회 지연을 감수하고 서버 상태를 다시 읽습니다.');
    setHTML(slides[12],'.fm-next-cs-modes',
      '<div class="is-focus"><small>RECOMMENDATION</small><h3>추천 소유권</h3><p>'+lines('결정론적 추천 엔진이 후보·순위·이유를 결정합니다.','AI 해석 실패 시 fallback으로 탐색을 이어갑니다.')+'</p></div>'+
      '<div><small>PARTICIPATION · MATCHDAY · RETURN</small><h3>상태 소유권</h3><p>'+lines('참가·체크인·경기 후 상태의 책임을 분리합니다.','화면마다 같은 상태를 따로 판단하지 않게 합니다.')+'</p></div>'+
      '<div><small>AI · PROVIDERS · HITL</small><h3>실행 경계</h3><p>'+lines('AI가 경기 사실·가격·정원·순위를 만들지 않습니다.','참가·결제는 사용자가 최종 확인합니다.')+'</p></div>');
    setHTML(slides[12],'.fm-next-cs-note',rows([
      ['실연동',lines('Vercel AI Gateway · Supabase','Resend · Web Push · Storage')],
      ['미연동','실제 PG와 외부 분석 도구는 미연동입니다.'],
      ['협의 기준',lines('개발 · API·데이터 계약, 권한, 오류·재시도','디자인 · IA, 상태별 화면, CTA','운영 · 취소, 정원, 복구 정책')],
      ['개인 프로젝트','위 항목은 협의 가능한 수준의 설계 범위이며, 실제 다인 협업 성과는 아닙니다.']]));
    slides[12].setAttribute('data-v5-domain-evidence','separated');
    slides[12].setAttribute('data-v5-ai-evidence','guardrailed');

    setRole(slides[14],'validation-evidence');
    title(14,'서비스의 성공 지표와','제품 동작을 확인하는 QA를 구분합니다.');
    lead(14,'아래는 검증할 지표(Validation Metric)이며, 측정 성과인 Measured Result가 아닙니다.',
      '무료 Beta에서는 상세→참가 전환을 중심으로 실패·복구·재탐색을 함께 확인합니다.');
    setHTML(slides[14],'.fm-next-cs-metrics',[
      ['탐색 → 상세','상세 진입 세션','결과 노출 세션'],
      ['상세 → 참가','참가 완료 사용자','상세 조회 사용자'],
      ['실패 → 복구','복구 완료 흐름','복구 가능 실패 흐름'],
      ['7일 내 재탐색','7일 내 재탐색 사용자','7일 관찰 완료 참가 사용자']
    ].map(([name,numerator,denominator])=>`<div class="fm-next-cs-metric"><b>${name}</b><span class="fm-cs-ratio"><span>분자 · ${numerator}</span><span>분모 · ${denominator}</span></span></div>`).join(''));
    // 사람 검수 (Human QA) and AI 보조 검수 (AI-assisted QA) have separate evidence owners.
    setHTML(slides[14],'.fm-next-cs-grid.three',
      card('자동 QA','Regression · Browser E2E · axe','상태·복구 · 반응형 · Visual Regression','Production Smoke')+
      card('사람 검수','실제 OAuth 로그인 · 이메일 최종 전달','Web Push의 브라우저·OS 표시','사용자 만족도·전환 성과와는 별개입니다.')+
      card('AI 보조 검수','중복·용어·구현과 설명의 불일치 검토','자동 QA와 사람 검수의 PASS 판정을 대신하지 않습니다.'));
    setHTML(slides[14],'.fm-next-cs-note',lines(
      '결과 없음·참가 실패·체크인 완료·AI 검색 사용률도 정의했습니다. 외부 분석 도구는 미연동입니다.',
      '실제 측정에서는 운영·테스트 계정과 시뮬레이션을 제외하고, 표본·기간·기준값부터 확보합니다.')+
      ' <a href="https://github.com/dohyunkimmm/footmate/blob/main/docs/SERVICE-PLANNING-EVIDENCE.md" target="_blank" rel="noopener">8개 지표의 분모·관찰 기준 보기 ↗</a>');
    slides[14].setAttribute('data-v5-validation-evidence','acceptance');

    setRole(slides[15],'production-boundary');
    title(15,'연동과 복구는 구현했고,','사용자 가치와 수익성 검증은 남았습니다.');
    lead(15,'구현·배포 검증과 실제 이용 성과를 나눠 현재 범위를 공개합니다.',
      '외부 연동 성공만으로 참가 전환이나 재이용 효과가 입증되지는 않습니다.');
    setHTML(slides[15],'.fm-next-cs-outcomes',
      '<div><b>Real App</b><p>'+lines('AI Gateway 실연동 · 결정론적 추천','샘플 경기 데이터','인증·결제·정원·알림 시뮬레이션')+'</p></div>'+
      '<div><b>Closed Beta</b><p>'+lines('Supabase 인증·경기·정원·참가/취소','체크인 · Google/Kakao OAuth','이메일 · Web Push · 미디어 실연동')+'</p></div>'+
      '<div><b>미연동 범위</b><p>'+lines('실제 PG · 외부 분석 도구','수익성과 실제 이용 지표는 미검증')+'</p></div>');
    setHTML(slides[15],'.fm-next-cs-final','<span>Production 기준 · 회고와 다음 단계</span>'+rows([
      ['배운 점','연결 성공뿐 아니라 실패·중복·상태 갱신을 함께 정의해야 운영 흐름이 이어집니다.'],
      ['다음 관찰','Beta에서 Persona의 판단 기준과 참가 이탈 구간을 확인합니다.'],
      ['판단 기준','기준값을 확보한 뒤 목표치를 정하고, 참가 실패·복구와 함께 전환 변화를 해석합니다.']])+
      '<a href="/app" target="_blank" rel="noopener">FootMate 앱 보기 ↗</a>');

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

