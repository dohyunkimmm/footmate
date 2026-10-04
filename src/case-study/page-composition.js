/* FootMate 5.4 · page composition. Existing product facts and evidence stay intact. */
(function(){
  const pages=[
  {
    "nav": "Overview",
    "navDesc": "Experience & Role",
    "title": [
      "내 수준에 맞는 경기부터,",
      "경기 당일과 다음 경기까지."
    ],
    "desc": "탐색부터 참가 이후까지 화면·정책·검증 기준을 설계했습니다.",
    "keywords": [
      "자연어 탐색",
      "추천 근거",
      "담당 역할"
    ],
    "layout": "cover"
  },
  {
    "nav": "Problem & Goal",
    "navDesc": "Friction & Design Goal",
    "title": "경기 선택의 불확실성을 줄이는 데 집중했습니다.",
    "desc": "정보 분산·이른 로그인·참가 후 안내 단절을 해결 과제로 정의했습니다.",
    "keywords": [
      "정보 분산",
      "판단 부담",
      "경험 단절"
    ],
    "layout": "comparison"
  },
  {
    "nav": "Persona & JTBD",
    "navDesc": "Assumptions & Tasks",
    "title": "사용자 가설을 구체적인 행동 과업으로 바꿨습니다.",
    "desc": "퇴근 후 가까운 경기를 찾는 상황을 가정해 선택 기준을 도출했습니다.",
    "keywords": [
      "사용자 가설",
      "판단 기준",
      "관찰 과업"
    ],
    "layout": "persona"
  },
  {
    "nav": "Scope & Priorities",
    "navDesc": "Build Now & Validate Next",
    "title": "참가와 복구를 먼저, 확장 검증은 다음으로 뒀습니다.",
    "desc": "판단 가치·실패 영향·검증 가능성으로 구현 우선순위를 정했습니다.",
    "keywords": [
      "참가·복구",
      "구현 우선순위",
      "확장 범위"
    ],
    "layout": "journey"
  },
  {
    "nav": "Guest Exploration",
    "navDesc": "Explore Before Sign-in",
    "title": "가치를 확인한 뒤에 로그인하도록 설계했습니다.",
    "desc": "추천·상세는 공개하고, 참가 요청 직전에 인증을 배치했습니다.",
    "keywords": [
      "가입 전 탐색",
      "가치 확인",
      "인증 시점"
    ],
    "layout": "comparison"
  },
  {
    "nav": "Recommendations",
    "navDesc": "Preferences & Reasons",
    "title": "조건을 바꾸면 추천 순위와 이유도 달라집니다.",
    "desc": "현재 조건을 직접 바꾸고, 후보의 순위와 추천 이유를 확인하게 했습니다.",
    "keywords": [
      "선호 조건",
      "추천 이유",
      "조건 수정"
    ],
    "layout": "product"
  },
  {
    "nav": "Match Details",
    "navDesc": "Information for Joining",
    "title": "참가 판단에 필요한 순서로 상세를 구성했습니다.",
    "desc": "시간·장소·추천 이유·자리·취소 기준을 참가 결정 순서로 배치했습니다.",
    "keywords": [
      "참가 판단",
      "정보 순서",
      "저장·비교"
    ],
    "layout": "product"
  },
  {
    "nav": "Sign-in & Join",
    "navDesc": "Preserve Choice & Confirm",
    "title": "인증 과정에서도 선택한 경기를 유지합니다.",
    "desc": "로그인 후 복귀 위치를 보존하고, 참가 결과에 따라 다음 행동을 안내합니다.",
    "keywords": [
      "선택 유지",
      "참가 확인",
      "결과 안내"
    ],
    "layout": "flow"
  },
  {
    "nav": "Matchday & Return",
    "navDesc": "Prepare, Check In & Return",
    "title": "참가 이후의 다음 행동을 MY에서 안내합니다.",
    "desc": "참가 준비·이동·체크인·경기 후 피드백을 상태별로 연결했습니다.",
    "keywords": [
      "참가 준비",
      "체크인",
      "경기 후 재탐색"
    ],
    "layout": "product"
  },
  {
    "nav": "Recovery",
    "navDesc": "Preserve State & Retry",
    "title": "실패해도 선택을 보존하고 다시 이어갑니다.",
    "desc": "예외 상황별로 유지할 상태와 재시도·대체 행동을 정의했습니다.",
    "keywords": [
      "상태 보존",
      "재시도",
      "대체 경로"
    ],
    "layout": "recovery"
  },
  {
    "nav": "AI & Domain Rules",
    "navDesc": "Interpret, Rank & Confirm",
    "title": "해석·추천·확정의 책임을 분리했습니다.",
    "desc": "AI는 조건 해석, 엔진은 추천 판단, 사용자는 참가 확정을 맡습니다.",
    "keywords": [
      "조건 해석",
      "추천 판단",
      "사용자 확인"
    ],
    "layout": "architecture"
  },
  {
    "nav": "Metrics & Validation",
    "navDesc": "Measurement & Verification",
    "title": "동작 검증과 사용자 성과를 구분했습니다.",
    "desc": "성과 지표는 측정 전이며, 제품 동작은 QA·검수로 확인했습니다.",
    "keywords": [
      "측정 기준",
      "동작 검증",
      "성과 미측정"
    ],
    "layout": "validation"
  },
  {
    "nav": "Learning & Next Decisions",
    "navDesc": "Refine & Verify",
    "title": "개인 고도화에서 얻은 학습과 다음 기준을 정리했습니다.",
    "desc": "실제 수정·재검증의 근거를 다음 설계와 품질 기준으로 연결했습니다.",
    "keywords": [
      "설계 일관성",
      "흐름 완결성",
      "재검증 근거"
    ],
    "layout": "release"
  }
];


  // Final copy pass: reuse existing cards and notes without expanding the slide layout.
  function refineCaseStudyCopy(slides){
    const text=(page,selector,value)=>{const node=slides[page].querySelector(selector);if(node)node.textContent=value;};
    const html=(page,selector,value)=>{const node=slides[page].querySelector(selector);if(node)node.innerHTML=value;};
    const rows=items=>'<dl class="fm-cs-reasons">'+items.map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+value+'</dd></div>').join('')+'</dl>';
    const summary=(page,items)=>slides[page].querySelectorAll('.fm-next-review-summary>div').forEach((node,index)=>{const item=items[index];if(!item)return;node.querySelector('span').textContent=item[0];node.querySelector('b').textContent=item[1];});
    html(0,'.fm-next-cover-proof',
      '<div><b>역할 · 단독 설계·구축</b><span>문제 정의 · UX·정책 설계<br>프로토타입 · QA · 배포 검증</span></div>'+
      '<div><b>기간 · 2026.06.08–현재</b><span>AI 실무과정에서 시작<br>수료 후 개인 프로젝트로 고도화</span></div>'+
      '<div><b>핵심 결정 · 우선순위</b><span>참가 직전 인증 · AI 책임 분리<br>상태 보존 · 실패 복구 기준</span></div>');
    text(0,'.fm-next-cover-note strong','제품 홈 화면 미리보기');
    text(0,'.fm-next-cover-note span','자연어 탐색과 추천 확인 구조를 정적으로 재현했습니다.');
    text(1,'.fm-p0-problem-core p','추천을 확인해도 참가에 필요한 정보가 부족하면 결정을 망설일 수 있음');
    html(1,'.fm-next-cs-quote','<span>대안 검토 · 설계 가설</span>'+rows([
      ['대안','목록·필터의 조건 비교 · 지도의 위치 확인 · 커뮤니티의 경험 정보'],
      ['선택 이유','추천 근거와 참가·당일 안내를 한 흐름으로 연결'],
      ['검증 범위','탐색·가입 과업 검증 · 문제 가설·경쟁사 우위는 미입증']
    ]));
    summary(2,[['가정','평일 저녁 · 30분 안쪽 이동'],['판단 기준','시간 · 거리 · 레벨 · 포지션'],['수행한 검증','교육생 6명 · 가입 과업 8회']]);
    text(2,'.fm-p1-persona-context p','평일 저녁 · 주 1~2회 · 30분 안쪽 이동을 가정한 설계용 Persona');
    text(2,'.fm-p1-persona-lenses [data-kind="context"] p','퇴근 후 가능한 시간에 가까운 경기 탐색');
    text(2,'.fm-p1-jtbd-head small','JTBD · 가설과 관찰 계획');
    text(2,'.fm-p1-jtbd-journey li:first-child p','이동 가능한 시간과 지역 확인');
    text(2,'.fm-p1-jtbd-caveat','iOS 4명 · Android 2명 · 일부 복수 과업 수행 · Persona 대표성은 미검증');
    summary(3,[['우선 구현','참가 · 복구'],['효과 검증','전환 · 재이용'],['제외','실제 결제 · AI 자동 확정']]);
    const priority=slides[3].querySelectorAll('.fm-p0-priority-label');
    ['우선 구현 · 참가와 복구','구현 후 · 효과 검증','제외 · 이번 범위'].forEach((value,index)=>{if(priority[index])priority[index].textContent=value;});
    html(3,'.fm-next-story-aside .fm-next-cs-note',rows([
      ['참가 우선','정원·취소·체크인 오류가 참가 결과에 직접 영향'],
      ['무료 Beta','결제·정산보다 핵심 동선과 복구를 먼저 확인'],
      ['후속 검증','구현한 대기열·알림·피드백의 전환·재이용 효과']
    ]));
    html(4,'.fm-next-cs-decision',rows([
      ['인증 시점','추천·상세 확인 후 참가 요청 직전'],
      ['설정 이유','지역·포지션·레벨로 첫 추천 기준 확보'],
      ['의도한 효과','계정 생성 전 추천 가치 확인 · 초기 설정 부담은 후속 관찰'],
      ['설계상 제약','계정 기반 개인화 · 기기 간 연속성 제한']
    ]));
    const annotations=slides[5].querySelectorAll('.fm-p0-annotations li');
    [
      ['저장 프로필','지역·레벨·포지션을 다음 탐색의 시작 조건으로 사용'],
      ['선호 지역 · 시간 · 경기 형식','선호 조건 일치를 추천 점수에 추가 반영'],
      ['최근 확인 이력','확인한 경기를 추천의 보조 신호로 반영'],
      ['현재 조건 · 추천 이유','AI 조건 확인·수정·해제 · 추천 로직이 후보·순위 결정']
    ].forEach(([title,copy],index)=>{const node=annotations[index];if(node){node.querySelector('b').textContent=title;node.querySelector('p').textContent=copy;}});
    html(5,'.fm-next-cs-note',rows([
      ['저장 범위','현재 브라우저 · 회원 DB·기기 간 동기화 미연동'],
      ['판단 기준','내부 점수는 정렬에 사용 · 조건 일치 이유로 선택 지원'],
      ['사용자 제어','현재 조건과 AI 해석 결과 확인 후 수정·재탐색']
    ]));
    text(6,'.is-detail figcaption b','참가 판단을 위한 경기 상세');
    const detailSteps=slides[6].querySelectorAll('.fm-next-cs-detail-order>span');
    ['참가 가능한 일정과 이동 범위','조건에 맞는 이유','원하는 포지션의 참가 가능 여부','경기 전 준비와 운영 안내','참가 전 취소 조건 확인'].forEach((copy,index)=>{if(detailSteps[index]){const small=document.createElement('small');small.textContent=copy;detailSteps[index].appendChild(small);}});
    const comparison=document.createElement('p');comparison.className='fm-cs-detail-rationale';comparison.textContent='최대 2경기의 거리·레벨·포지션 자리·참가비 비교 · 저장·비교는 보조, 참가하기는 핵심 행동';
    slides[6].querySelector('.fm-next-cs-detail-order')?.appendChild(comparison);
    html(6,'.fm-next-story-aside .fm-next-cs-note',rows([
      ['정보 순서','시간·장소로 참가 가능 여부 확인 후 이유·자리·취소 기준 판단'],
      ['비교 기준','최대 2경기의 거리·레벨·포지션 자리·참가비 비교'],
      ['행동 우선','저장·비교는 보조 행동 · 참가하기는 핵심 행동']
    ]));
    text(7,'.fm-p1-auth-frame:nth-of-type(2) p','선택한 경기 정보를 로그인 후에도 유지');
    html(7,'.fm-next-cs-scope',rows([
      ['Real App','Google·Kakao 인증 연결 · 무료 참가 결과는 브라우저 저장'],
      ['Closed Beta','Supabase 계정·경기·참가 흐름 실제 연동'],
      ['검증 범위','운영 환경 로그인 확인 · 복귀 경로 보존 설계 · 실제 결제 미연동']
    ]));
    summary(8,[['진행','예정 → 당일 → 체크인 → 종료 후'],['안내 위치','내 경기 · MY'],['홈','다음 행동 · MY 진입']]);
    const states=slides[8].querySelectorAll('.fm-next-cs-day-states>div');
    if(states[2])states[2].querySelector('p').textContent='시작 20분 전부터 종료 전까지 체크인';
    if(states[3])states[3].querySelector('p').textContent='체감 난이도·재참가 의향 → 다음 추천 보조 신호';
    html(8,'.fm-next-cs-note',rows([
      ['체크인 범위','Real App은 체험 기록 · Beta는 실제 출석 상태'],
      ['빈 자리 충원','Beta에서 취소 시 접수 순서대로 포지션별 대기자 승격'],
      ['변경과 복구','변경 이력 기록 · 알림 전달 실패와 참가 상태 분리']
    ]));
    const recovery=slides[9].querySelectorAll('.fm-p0-recovery-row');
    if(recovery[2])recovery[2].querySelector('.fm-p0-recovery-next b').textContent='참가 결과 확인 후 재시도 또는 경기 다시 선택';
    if(recovery[3])recovery[3].querySelector('.fm-p0-recovery-next b').textContent='체크인 재시도 또는 운영 문의';
    // Replace the legacy payment screenshot with a clearly identified schematic.
    const failure=slides[9].querySelectorAll('.fm-evidence-recovery-strip .fm-evidence-figure')[1];
    if(failure){
      const media=failure.querySelector('.fm-evidence-media');
      media.innerHTML='<span class="fm-evidence-badge">복구 설계</span><div class="fm-cs-recovery-example"><b>참가를 확정하지 못했어요.</b><p>참가 결과 확인 후 다시 시도하거나 경기를 다시 선택합니다.</p><span>다시 시도 · 경기 다시 선택</span></div>';
      failure.dataset.evidenceSource='release-join-recovery-schematic';
      failure.querySelector('figcaption b').textContent='참가 실패 · 복구 설계';
      failure.querySelector('figcaption span').textContent='화면 캡처 아님 · 경기 정보 복원 후 재시도 성공을 자동 QA로 확인';
    }
    html(9,'.fm-next-cs-decision','<span>자동 QA 사례 · 무료 참가 복구</span><b>경기 정보 유실 → 오류 안내·재시도 → 정상 경기 복원 후 참가 성공 확인</b>');
    const arch=slides[10].querySelectorAll('.fm-p0-arch-node');
    const archCopy=[['요청','자연어 입력'],['해석','검색 조건 추출'],['전달','시간·거리·가격·포지션'],['판단','규칙에 따른 후보·순위'],['제시','추천 이유와 경기 상태'],['확정','사용자의 참가 확인']];
    archCopy.forEach(([label,title],index)=>{if(arch[index]){arch[index].querySelector('small').textContent=label;arch[index].querySelector('b').textContent=title;}});
    if(arch[5])arch[5].querySelector('span').textContent='AI는 참가 확정을 자동 실행하지 않음';
    const guards=slides[10].querySelectorAll('.fm-p0-arch-guardrails>div');
    [['AI 실패','대체 모델 후 규칙 기반 검색으로 전환'],['Beta 상태','변경 알림 수신 후 서버 상태 재조회'],['AI 처리 제한','경기 사실·가격·정원·순위 생성 금지']].forEach(([label,copy],index)=>{if(guards[index]){guards[index].querySelector('span').textContent=label;guards[index].querySelector('b').textContent=copy;}});
    html(10,'.fm-next-cs-note',rows([
      ['선택 이유','자유로운 생성보다 경기 사실과 참가 상태의 일관성 우선'],
      ['감수한 제약','AI 자동 실행 제한 · Beta 상태 재조회에 추가 요청 필요'],
      ['구현 범위','AI 해석 실제 연결 · Beta 인증·알림·미디어 연결']
    ]));
    const qa=slides[11].querySelectorAll('.fm-next-cs-card');
    ['회귀 테스트 · 브라우저 E2E · 접근성 · 상태 복구 · 화면 비교 · 배포 후 동작 확인','운영 환경 로그인 · 이메일 전달 · 브라우저·OS 알림 표시 확인 · 전환 성과와 구분','중복·용어·설명과 구현의 일치 검토 · 자동 QA와 사람 검수의 통과 판정은 대체하지 않음'].forEach((copy,index)=>{if(qa[index])qa[index].querySelector('p').textContent=copy;});
    const note=slides[11].querySelector('.fm-next-cs-note');
    if(note)note.innerHTML='과업 검증 · 교육생 6명 / 가입 과업 8회 · 개별 이슈 기록 미확정 · 전환 성과와 구분 <a href="https://github.com/dohyunkimmm/footmate/blob/main/docs/USER-TEST-EVIDENCE.md" target="_blank" rel="noopener">검증 근거 ↗</a>';
    const ratios=slides[11].querySelectorAll('.fm-p1-funnel-ratios .fm-p1-ratio');
    if(ratios[1]){const parts=ratios[1].querySelectorAll('span');if(parts[0])parts[0].innerHTML='<small>분자</small>참가 완료 사용자·경기 쌍';if(parts[1])parts[1].innerHTML='<small>분모</small>상세 조회 사용자·경기 쌍';}
    const app=slides[12].querySelector('[data-zone="real-app"]');
    if(app){
      app.querySelector('header b').textContent='제품 체험 화면';
      app.querySelector('ul').innerHTML='<li data-status="connected"><span>실제 연결</span><b>AI 해석 · Google/Kakao 인증</b></li><li data-status="implemented"><span>구현</span><b>규칙 기반 추천 · 무료 참가 확인</b></li><li data-status="sample"><span>샘플</span><b>경기 데이터 · 잔여 자리</b></li><li data-status="simulation"><span>체험 기록</span><b>참가·체크인·피드백 · 브라우저 저장</b></li>';
    }
    slides[12].querySelectorAll('[data-zone="closed-beta"] li span').forEach(node=>node.textContent='실제 연결');
    summary(12,[['Real App','AI·인증 연결 · 브라우저 기록'],['Closed Beta','참가·운영 · 실제 연결'],['다음 단계','이용 기준값 · 사용자 가치']]);
    html(12,'.fm-p1-release-next dl','<div><dt>배운 점과 다음 검증</dt><dd>실패·중복 요청·상태 갱신까지 함께 정의<br>다음 검증 · 추천 이유의 판단 도움 → Beta 과업 관찰·이탈 구간·기준값 확보</dd></div>');
    // Reader-facing wording only: keep navigation and product identifiers intact.
    const walker=document.createTreeWalker(document.querySelector('.track'),NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.parentElement.closest('script,style,.fm-page-keywords,.fm-next-story-kicker,.fm-next-cover-kicker'))continue;
      node.nodeValue=node.nodeValue.replace(/결정론적 추천 엔진/g,'규칙 기반 추천 엔진').replace(/audit trail/g,'변경 이력').replace(/운영 도움/g,'운영 문의').replace(/참여 이력/g,'참가 이력').replace(/실제 PG/g,'실제 결제').replace(/실연동/g,'실제 연결');
    }
    text(11,'.fm-next-kpi-disclosure-label','성과 지표 · 측정 기준');
    document.documentElement.dataset.fmCaseStudyCopyReview='p0-p1-p2';
  }

  function installEditorialInteractions(slides){
    const desktop=window.matchMedia('(min-width:901px)');
    const disclosures=[];
    // Keep the evidence visible; only supplemental rationale is collapsible on mobile.
    const supplements=[[1,'.fm-next-story-aside','대안과 검증 범위'],[3,'.fm-next-story-aside','우선순위 판단 근거'],[4,'.fm-next-story-aside','인증 시점과 제약'],[5,'.fm-page-product-notes .fm-next-cs-note','추천 설계 원칙'],[7,'.fm-next-story-aside','구현·검증 범위'],[8,'.fm-page-product-notes .fm-next-cs-note','운영 정책과 복구'],[10,'.fm-next-story-aside','연결 범위와 설계 기준']];
    supplements.forEach(([index,selector,text])=>{
      const node=slides[index].querySelector(selector);if(!node)return;
      const details=document.createElement('details');details.className='fm-editorial-supplement';details.open=desktop.matches;
      const summary=document.createElement('summary');summary.textContent=text;
      node.before(details);details.append(summary,node);disclosures.push(details);
    });
    desktop.addEventListener('change',()=>disclosures.forEach(node=>node.open=desktop.matches));
    slides.forEach(slide=>slide.querySelectorAll('details').forEach(node=>node.addEventListener('toggle',()=>window.dispatchEvent(new Event('resize')))));

    const dialog=document.createElement('dialog');dialog.className='fm-screen-dialog';dialog.setAttribute('aria-labelledby','fm-screen-dialog-title');
    dialog.innerHTML='<header><h2 id="fm-screen-dialog-title"></h2><button type="button" class="fm-screen-close" aria-label="화면 확대 닫기">닫기 ×</button></header><div class="fm-screen-tabs" role="group" aria-label="화면 보기 방식"><button type="button" data-screen-mode="full" aria-pressed="true">전체 화면</button><button type="button" data-screen-mode="focus" aria-pressed="false">핵심 영역</button></div><div class="fm-screen-viewport"><img alt=""></div><p class="fm-screen-source">기존 제품 화면 기준 · 실제 운영 화면과 차이가 있을 수 있습니다.</p>';
    document.body.append(dialog);
    const close=()=>dialog.close();dialog.querySelector('.fm-screen-close').addEventListener('click',close);
    dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();}});
    dialog.addEventListener('keydown',event=>{event.stopPropagation();});
    dialog.querySelectorAll('[data-screen-mode]').forEach(button=>button.addEventListener('click',()=>{
      dialog.classList.toggle('is-focus',button.dataset.screenMode==='focus');
      dialog.querySelectorAll('[data-screen-mode]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));
    }));
    [5,6,8].forEach(index=>{
      const figure=slides[index].querySelector('.fm-evidence-figure[data-evidence-scale="primary"]');if(!figure)return;
      const source=figure.querySelector('img');const caption=figure.querySelector('figcaption');
      if(!source)return;
      const button=document.createElement('button');button.type='button';button.className='fm-screen-expand';button.textContent='화면 확대 ↗';button.setAttribute('aria-haspopup','dialog');
      button.addEventListener('click',()=>{
        dialog.querySelector('h2').textContent=caption.querySelector('b')?.textContent||'제품 화면';
        const image=dialog.querySelector('img');image.src=source.currentSrc||source.src;image.alt=source.alt;
        dialog.classList.remove('is-focus');dialog.querySelectorAll('[data-screen-mode]').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.screenMode==='full')));
        dialog.showModal();
      });caption.append(button);
    });
  }

  function apply(){
    const html=document.documentElement;
    if(html.dataset.fmPageComposition==='true')return true;
    if(html.dataset.fmCaseStudyAdvancedPolish!=='true'||
       html.dataset.fmCaseStudyProductEvidence!=='true'||
       html.dataset.fmP1RealPreview!=='true'||
       html.dataset.fmCaseStudyCompletionPolish!=='true'||
       html.dataset.footmateCaseStudySectionLabelLanguage!=='en')return false;
    const slides=[...document.querySelectorAll('.track>.slide')];
    if(slides.length!==pages.length)return false;
    slides.forEach((slide,index)=>{
      const page=pages[index];
      const toc=document.querySelectorAll('.toc-item')[index];
      if(toc){toc.querySelector('.toc-t').textContent=page.nav;toc.querySelector('.toc-s').textContent=page.navDesc;toc.setAttribute('aria-label',String(index+1).padStart(2,'0')+' · '+page.nav+' · '+page.navDesc);}
      const label=slide.querySelector(index===0?'.fm-next-cover-kicker':'.fm-next-story-kicker');
      if(label)label.textContent=index===0?page.nav:String(index+1).padStart(2,'0')+' · '+page.nav;
      slide.dataset.pageLayout=page.layout;
      slide.dataset.pageNumber=String(index+1);
      const title=slide.querySelector(index===0?'h1':'.fm-next-story h2');
      if(title){
        title.replaceChildren();
        (Array.isArray(page.title)?page.title:[page.title]).forEach(text=>{
          const line=document.createElement('span');
          line.className=index===0?'fm-next-cover-title-line':'fm-page-title-line';
          line.textContent=text;
          title.appendChild(line);
        });
      }
      const lead=slide.querySelector(index===0?'.fm-next-cover-lead':'.fm-next-story-lead');
      if(lead)lead.textContent=page.desc;
      const kicker=slide.querySelector(index===0?'.fm-next-cover-kicker':'.fm-next-story-kicker');
      if(kicker){
        const keywords=document.createElement('div');
        keywords.className='fm-page-keywords';
        keywords.setAttribute('aria-label','핵심 키워드');
        page.keywords.forEach(text=>{
          const item=document.createElement('span');item.textContent=text;keywords.appendChild(item);
        });
        (lead||title||kicker).insertAdjacentElement('afterend',keywords);
      }
      slide.querySelectorAll('.fm-next-cs-card').forEach(card=>{
        const title=card.querySelector('h3');const description=card.querySelector('p');
        if(title)title.classList.add('fm-page-card-title');
        if(description)description.classList.add('fm-page-card-description');
      });
    });
    // Card headings explain what is checked; labels identify the method.
    const cardCopy=[
      [3,0,'참가 상태와 복구','인증·정원·취소·체크인 오류가 참가 결과에 미치는 영향부터 확인'],
      [3,1,'구현한 운영과 후속 검증','대기열·알림·피드백 구현 · 빈 자리 충원과 재이용 효과는 후속 검증'],
      [3,2,'현재 범위에서 제외','실제 결제·수익화 검증 유보 · 참가 확정은 사용자 확인으로 유지'],
      [11,0,'자동화된 동작 확인',null],
      [11,1,'실제 연결과 표시 확인',null],
      [11,2,'설명과 구현의 일치 검토',null]
    ];
    cardCopy.forEach(([page,index,title,desc])=>{const card=slides[page].querySelectorAll('.fm-next-cs-card')[index];if(!card)return;card.querySelector('h3').textContent=title;if(desc)card.querySelector('p').textContent=desc;});
    // Keep product interpretation alongside the screen rather than below another full row.
    [5,8].forEach(index=>{
      const slide=slides[index];
      const annotations=slide.querySelector(index===5?'.fm-p0-annotations':'.fm-next-cs-day-states');
      const aside=slide.querySelector('.fm-next-story-aside');
      if(!annotations||!aside)return;
      const notes=document.createElement('div');notes.className='fm-page-product-notes';
      annotations.parentNode.insertBefore(notes,annotations);
      notes.appendChild(annotations);
      [...aside.children].forEach(child=>notes.appendChild(child));
      aside.remove();
    });
    const coverNote=slides[0].querySelector('.fm-next-cover-note');
    if(coverNote)coverNote.innerHTML='<strong>최신 Real App 홈 프리뷰</strong><span>자연어 탐색에서 추천 확인까지, 홈 구조를 정적으로 재현했습니다.</span>';
    // Source images are existing, versioned visual baselines, not newly captured live screens.
    document.querySelectorAll('.fm-evidence-figure:not(.is-recovery) figcaption span').forEach(node=>{
      node.textContent='제품 화면 · 기존 시각 기준';
    });
    document.querySelectorAll('.fm-evidence-figure.is-detail,.fm-evidence-figure.is-operations').forEach(node=>{
      node.dataset.screenFormat='portrait';
    });
    refineCaseStudyCopy(slides);
    window.installFootMateDecisionEvidence(slides);
    installEditorialInteractions(slides);
    html.dataset.fmPageComposition='true';
    html.dataset.footmateCaseStudyRelease='5.4.3';
    // Desktop is a fixed slide: fit the complete composition inside the viewport.
    const fitSlides=()=>{
      const desktop=window.matchMedia('(min-width:901px)').matches;
      slides.forEach(slide=>{
        const content=slide.querySelector('.fm-next-story,.fm-next-cover');
        if(!content)return;
        content.style.zoom='';
        content.style.removeProperty('width');
        content.style.removeProperty('margin-inline');
        if(!desktop||!slide.clientHeight)return;
        const style=getComputedStyle(slide);
        content.style.setProperty('width',`${slide.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)}px`,'important');
        content.style.setProperty('margin-inline','auto','important');
        const available=slide.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
        const height=content.getBoundingClientRect().height;
        if(height>available&&available>0){
          let scale=Math.min(1,(available-2)/height);
          content.style.zoom=String(scale);
          for(let attempt=0;attempt<4;attempt++){
            const actual=content.getBoundingClientRect().height;
            if(actual<=available-1)break;
            scale*=((available-2)/actual);
            content.style.zoom=String(scale);
          }
        }
        slide.scrollTop=0;
      });
    };
    let frame;
    const scheduleFit=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(fitSlides);};
    window.addEventListener('resize',scheduleFit);
    new MutationObserver(records=>{
      if(records.some(record=>record.target.classList.contains('slide')))scheduleFit();
    }).observe(document.querySelector('.track'),{subtree:true,attributes:true,attributeFilter:['class']});
    document.querySelectorAll('img').forEach(img=>img.addEventListener('load',scheduleFit));
    if(document.fonts)document.fonts.ready.then(scheduleFit);
    scheduleFit();
    return true;
  }
  if(!apply()){
    let tries=0;
    const timer=setInterval(()=>{if(apply()||++tries>240)clearInterval(timer);},25);
  }
})();
