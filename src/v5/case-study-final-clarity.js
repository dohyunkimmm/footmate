/* FootMate Case Study · final reader clarity and per-page repetition pass. */
(function(){
  let applied=false;

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

  function rows(items){
    return `<dl class="fm-cs-reasons">${items.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
  }

  function lineHTML(...items){
    return items.map(value=>`<span class="fm-cs-line">${value}</span>`).join(' ');
  }

  function setSummary(slide,items){
    const summary=slide?.querySelectorAll('.fm-next-review-summary>div')||[];
    items.forEach(([label,value],index)=>{
      const item=summary[index];
      if(!item)return;
      const labelNode=setText(item,'span',label);
      const valueNode=setText(item,'b',value);
      if(labelNode&&valueNode)item.insertBefore(document.createTextNode(' '),valueNode);
    });
  }

  function setCards(root,selector,items){
    const cards=root?.querySelectorAll(selector)||[];
    items.forEach(([heading,copy],index)=>{
      const card=cards[index];
      if(!card)return;
      setText(card,'h3',heading);
      setText(card,'p',copy);
    });
  }

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyStructuredCopy!=='3'||
       document.documentElement.dataset.footmateCaseStudyReaderPolish!=='2')return false;

    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13)return false;

    const problem=slides[1];
    setText(problem,'.fm-next-story h2','경기를 고를 때 필요한 판단 근거를 한 흐름에 묶었습니다.');
    setText(problem,'.fm-next-story-lead','조건 비교부터 추천 근거, 실패 후 복구까지 검증 범위로 잡았습니다.');
    setSummary(problem,[['문제 가설','선택 불확실성'],['흐름','조건 비교 → 근거 확인 → 실행'],['확인','전환 · 실패 · 재시도']]);
    setCards(problem,'.fm-next-cs-grid.three .fm-next-cs-card',[
      ['조건 비교','시간 · 거리 · 레벨 한곳 비교 · 상세 진입률 · 결과 없음 비율'],
      ['결정 근거','추천 이유 · 정원 · 취소 규칙 우선 노출 · 전환율 · 실패율'],
      ['이후 행동','체크인 · 경기 후 피드백 → 재이용 · 완료율 · 7일 내 재탐색']
    ]);
    setHTML(problem,'.fm-next-cs-quote','<span>대안 검토 · 설계 가설</span>'+rows([
      ['대안','목록·필터 · 지도 · 커뮤니티 비교'],
      ['선택','조건 해석 → 근거 제시 → 실행 → 당일 운영'],
      ['검증 범위','설계 가설 · 사용자 조사·경쟁사 우위 미입증 · Beta 확인']
    ]));

    const persona=slides[2];
    setText(persona,'.fm-next-story h2','Persona 가정을 요구사항으로 옮기고 행동으로 확인했습니다.');
    setText(persona,'.fm-next-story-lead','설계용 Persona는 가정으로 두고, 행동 과업으로 탐색·가입 동선을 점검했습니다.');
    setSummary(persona,[['가정','평일 저녁 · 30분 안쪽 이동'],['요구사항','시간 · 거리 · 레벨 · 포지션'],['검증 방식','행동 과업 · iOS · Android']]);
    setText(persona,'.fm-next-cs-jtbd small','검증 흐름 · 가설 → 과업 → 관찰');
    setText(persona,'.fm-next-cs-jtbd p','가설 · 맞는 이유 빠른 이해 → 실행 · 회원가입 전·Kakao·Google·이메일 가입 → 관찰 · 동선별 버그·막힘');

    const priority=slides[3];
    setText(priority,'.fm-next-story h2','운영 안전성을 먼저 확보하고 수익화는 뒤로 뒀습니다.');
    setText(priority,'.fm-next-story-lead','우선순위 기준은 사용자 판단 가치와 실패 영향, 확인 가능성입니다.');
    setSummary(priority,[['우선','참가 · 복구'],['확장','운영 · 반복 이용'],['제외','실제 PG · 자동 실행']]);
    setCards(priority,'.fm-next-cs-principles .fm-next-cs-card',[
      ['우선 · 안전한 실행','판단 기준을 한곳에 · 선택 맥락을 보존 · 무료 Beta · 인증·정원·취소·체크인·복구'],
      ['확장 · 운영과 재이용','대기열·알림·경기 후 피드백 → 자리 회복·재이용 · 후속 지표 · 전환·반복 이용'],
      ['제외 · 수익화와 자동화','실제 PG 유보 · 수익화 검증 제외 · AI 자동 실행 제외 · 사용자 최종 확인(HITL)']
    ]);

    const guest=slides[4];
    setText(guest,'.fm-next-story h2','가치를 먼저 보여주고 계정은 필요할 때 요청합니다.');
    setText(guest,'.fm-next-story-lead','경기를 고른 뒤 인증하도록 순서를 바꿔 초기 진입 부담을 낮췄습니다.');
    setSummary(guest,[['선택','가입 전 추천 · 상세 공개'],['이유','가치 확인 우선'],['제약','계정 기반 개인화 제한']]);
    const alternatives=guest.querySelectorAll('.fm-next-cs-before-after>div');
    if(alternatives[0]){
      setText(alternatives[0],'small','비교안 · 가입 우선');
      setHTML(alternatives[0],'b',lineHTML('첫 화면 → 로그인 → 설문','결과 확인'));
      setText(alternatives[0],'p','가치 확인 전 계정 생성 필요');
    }
    if(alternatives[1]){
      setText(alternatives[1],'small','채택안 · 탐색 우선');
      setHTML(alternatives[1],'b',lineHTML('조건 설정 → 추천 → 상세','로그인'));
      setText(alternatives[1],'p','추천 확인 후 가입 여부 결정');
    }
    setHTML(guest,'.fm-next-cs-decision',rows([
      ['인증 시점','참가 요청 직전'],
      ['효과','초기 계정 생성 부담 감소'],
      ['Trade-off','계정 기반 개인화 · 기기 간 연속성 제한']
    ]));

    const recommendation=slides[5];
    setText(recommendation,'.fm-next-story h2','반복 입력을 줄이고 근거를 먼저 보여줍니다.');
    setText(recommendation,'.fm-next-story-lead','저장 정보는 입력 보조로만 쓰고, 후보·순위·이유는 별도 추천 로직이 결정합니다.');
    setSummary(recommendation,[['입력','프로필 · 선호 · 최근 이력'],['판단','추천 엔진 · 후보·순위·이유'],['제어','조건 수정 · 재탐색']]);
    setText(recommendation,'.fm-next-cs-reco-card span','표현 예시 · 수원 영통');
    setText(recommendation,'.fm-next-cs-reco-card strong','1순위');
    setHTML(recommendation,'.fm-next-cs-note',rows([
      ['입력 원칙','저장 정보 → 반복 입력 완화'],
      ['판단 책임','후보·순위·이유 → 결정론적 추천 엔진'],
      ['사용자 제어','현재 조건 수정 · 재탐색 허용']
    ]));

    const detail=slides[6];
    setText(detail,'.fm-next-story h2','상세 정보의 순서를 실제 결정 흐름에 맞췄습니다.');
    setText(detail,'.fm-next-story-lead','시간·장소에서 자리·환불 정책까지 필요한 순서대로 배치했습니다.');
    setSummary(detail,[['핵심 CTA','참가하기'],['보조','저장 · 최대 2경기 비교'],['정책','취소 · 환불 사전 확인']]);
    detail.querySelector('.fm-next-cs-sticky')?.remove();

    const auth=slides[7];
    setText(auth,'.fm-next-story h2','선택한 경기를 계정 확인 뒤에도 이어갑니다.');
    setText(auth,'.fm-next-story-lead','선택 경기와 복귀 위치를 유지하고 결과를 완료·실패·취소로 구분했습니다.');
    setSummary(auth,[['상태 보존','선택 경기 · 복귀 위치'],['계정','로그인'],['결과','완료 · 실패 · 취소']]);
    setHTML(auth,'.fm-next-cs-scope',rows([
      ['Real App','인증 · 결제 UX 시뮬레이션'],
      ['Closed Beta','Supabase 계정 · 참가 실연동'],
      ['검증 범위','Google/Kakao OAuth Production 확인 · 실제 PG 미연동']
    ]));

    const operations=slides[8];
    setText(operations,'.fm-next-story h2','경기 당일 필요한 행동과 이후 흐름을 홈에 모았습니다.');
    setText(operations,'.fm-next-story-lead','예정·체크인·경기 후 단계에 맞춰 다음 행동을 우선 노출합니다.');
    setSummary(operations,[['진행','예정 → 당일 → 체크인 → 종료 후'],['운영','정원 · 취소 · 체크인'],['이후','다음 탐색']]);
    const dayStates=operations.querySelectorAll('.fm-next-cs-day-states>div');
    const dayCopy=[
      ['탐색 중','조건 설정','추천 확인'],
      ['참가 확정','준비 정보','일정 · 장소'],
      ['당일','이동과 체크인','길찾기 · 운영 도움'],
      ['종료 후','피드백과 재탐색','체감 난이도 · 반복 의도']
    ];
    dayCopy.forEach(([phase,title,copy],index)=>{
      const card=dayStates[index];
      if(!card)return;
      setText(card,'small',phase);
      setText(card,'b',title);
      setText(card,'p',copy);
    });
    const operationsNote=operations.querySelector('.fm-next-story-aside .fm-next-cs-note');
    if(operationsNote)operationsNote.innerHTML=rows([
      ['운영 권한','정원 · 취소 마감 · 체크인 · 종료 관리'],
      ['자리 회복','취소 시 포지션별 대기열 FIFO 승급'],
      ['변경과 복구','audit trail 기록 · 알림 실패와 참가 상태 분리 복구']
    ]);

    const recovery=slides[9];
    setText(recovery,'.fm-next-story h2','실패해도 선택 맥락을 유지하고 다음 행동을 제시합니다.');
    setText(recovery,'.fm-next-story-lead','오류마다 이어갈 상태와 재시도·대체 행동을 함께 정의했습니다.');
    setSummary(recovery,[['원칙','원인 · 유지 상태 · 다음 행동'],['복구','재시도 · 조건 수정 · 대기'],['범위','탐색 → 경기 당일']]);
    const recoveryCards=recovery.querySelectorAll('.fm-next-cs-recovery>div');
    const recoveryCopy=[
      ['추천 없음','입력한 탐색 조건 → 지역·시간 수정 또는 조건 완화'],
      ['자리 마감','선택 경기 · 포지션 → 대기 등록 또는 비슷한 경기 탐색'],
      ['결제 실패 · 시뮬레이션','선택 경기 · 참가 의도 → 재시도 또는 결제수단 변경'],
      ['경기 당일 문제','참가 · 체크인 상태 → 체크인 재시도 또는 운영 도움']
    ];
    recoveryCopy.forEach(([heading,copy],index)=>{
      const card=recoveryCards[index];
      if(!card)return;
      setText(card,'b',heading);
      setText(card,'span',copy);
    });
    setText(recovery,'.fm-next-cs-decision span','공통 복구 원칙');
    setText(recovery,'.fm-next-cs-decision b','원인 확인 · 상태 유지 · 재시도·대체 행동 제시');

    const domain=slides[10];
    setText(domain,'.fm-next-story h2','추천·상태·실행의 소유권을 분리했습니다.');
    setText(domain,'.fm-next-story-lead','AI는 조건 해석만 맡고, 판단과 참가·결제의 책임을 분리했습니다.');
    setSummary(domain,[['해석','AI · 자연어 조건'],['판단','엔진 · 후보·순위·이유'],['실행','사용자 확인 · 참가·결제']]);
    const modes=domain.querySelectorAll('.fm-next-cs-modes>div');
    if(modes[0]){
      setText(modes[0],'h3','추천 소유권');
      setText(modes[0],'p','후보 · 순위 · 이유 → 결정론적 추천 엔진 · 해석 실패 → fallback 탐색');
    }
    if(modes[1]){
      setText(modes[1],'h3','상태 책임');
      setText(modes[1],'p','참가 · 체크인 · 경기 후 책임 분리 · 동일 판단 일원화');
    }
    if(modes[2]){
      setText(modes[2],'h3','실행 경계');
      setText(modes[2],'p','경기 사실 · 가격 · 정원 · 순위 AI 생성 금지 · 참가 · 결제 사용자 최종 확인');
    }

    const validation=slides[11];
    setText(validation,'.fm-next-story h2','성과 지표와 제품 동작 검증을 분리했습니다.');
    setText(validation,'.fm-next-story-lead','KPI는 Validation Metric이며 Measured Result가 아닙니다 — 제품 동작은 QA로 별도 확인');
    setSummary(validation,[['KPI','전환 · 복구 · 재탐색'],['QA','Regression · E2E · axe · Smoke'],['준비','Baseline 확보 후']]);
    const metricRules=[
      ['상세 진입 세션','결과 노출 세션'],
      ['참가 완료 사용자','상세 조회 사용자'],
      ['복구 완료 흐름','복구 가능 실패 흐름'],
      ['7일 내 재탐색 사용자','7일 관찰 완료 참가 사용자']
    ];
    validation.querySelectorAll('.fm-next-cs-metric .fm-cs-ratio').forEach((node,index)=>{
      const rule=metricRules[index];
      if(!rule)return;
      const prefix=index===0?'계산 기준 · ':'';
      node.textContent=`${prefix}${rule[0]} ÷ ${rule[1]}`;
    });
    const note=validation.querySelector('.fm-next-cs-note');
    if(note)note.innerHTML=rows([
      ['추가 지표','결과 없음 · 참가 실패 · 체크인 완료 · AI 검색 사용률'],
      ['측정 조건','외부 분석 도구 미연동 · 운영·테스트·시뮬레이션 제외 · 표본·기간·기준값 우선 확보']
    ]);
    setText(validation,'.fm-next-kpi-table>div:last-child dd:nth-of-type(2)','connected-ai와 rules-fallback 분리 · 사용률과 품질 판단 분리');

    const release=slides[12];
    setText(release,'.fm-next-story h2','구현 결과와 다음 과제를 정리했습니다.');
    setText(release,'.fm-next-story-lead','연결 범위와 사용자 확인을 마쳤고, 실제 이용자 KPI·결제·수익성은 후속 검증으로 남겼습니다.');
    setSummary(release,[['구현','AI · Supabase · Resend · Push'],['검증','행동 과업 · iOS · Android'],['다음 단계','실제 결제 · 이용자 KPI · 수익성']]);
    release.querySelector('.fm-next-cs-outcomes')?.remove();
    release.querySelector('.fm-next-cs-final')?.remove();

    // Every story lead is one sentence. Normalize punctuation without changing wording.
    slides.slice(1).forEach(slide=>{
      const lead=slide.querySelector('.fm-next-story-lead');
      if(!lead)return;
      const normalized=(lead.textContent||'').trim().replace(/[.!?。]+/g,'').replace(/\s+/g,' ');
      lead.textContent=`${normalized}.`;
    });

    document.documentElement.dataset.footmateCaseStudyFinalClarity='1';
    document.documentElement.dataset.footmateCaseStudyRepetitionPolish='1';
    applied=true;
    return true;
  }

  if(!patch()){
    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(patch()||tries>120)clearInterval(timer);
    },25);
  }
})();
