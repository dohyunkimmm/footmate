/* Editorial grouping preserves the existing copy and interactive evidence. */
(function(){

  // Existing product baselines and verified implementation records, summarized in place.
  function installEvidenceDetails(slides){
    const summary=(index,items)=>slides[index].querySelectorAll('.fm-next-review-summary>div').forEach((node,i)=>{
      node.querySelector('span').textContent=items[i][0];node.querySelector('b').textContent=items[i][1];
    });
    summary(1,[['설계 대상','탐색부터 경기 당일까지'],['관찰 범위','교육 단계 탐색·가입 과업'],['후속 측정','전환 · 실패 · 재이용']]);
    summary(3,[['선정 기준','중단 영향 · 판단 도움'],['개발 순서','핵심 요청부터 안정화'],['실행 원칙','최종 확정은 사용자 제어']]);
    summary(6,[['주 행동','참가하기'],['비교 범위','경기 2개로 제한'],['확인 시점','요청 전 운영 정책 검토']]);
    summary(12,[['개선 자료','수정·재검증 기록'],['판정 범위','개발·QA에서 동작 확인'],['이후 기준','입력 · 완료 · 예외의 일관성']]);
    const core=slides[1].querySelector('.fm-p0-problem-core');
    core.querySelector('small').textContent='설계 초점';
    core.querySelector('p').textContent='후보를 고른 뒤에도 판단에 필요한 항목과 진행 안내를 함께 확인';
    const detail=slides[6].querySelector('.fm-next-cs-detail-order');
    const day=slides[8].querySelector('.fm-page-product-notes');
    [[6,detail,'참가 결정 체크','생활권 · 남은 자리 · 경기 강도를 항목으로 제시',460,214],
     [8,day,'경기 전후 안내','참가 확정 · 체크인 시점 · 경기 후 행동을 구분',400,252]].forEach(([index,host,title,copy,offset,height])=>{
      const source=slides[index].querySelector('.fm-evidence-figure[data-evidence-scale="primary"] img');
      const figure=document.createElement('figure');figure.className='fm-focus-detail';figure.dataset.focusPage=String(index+1);
      figure.dataset.evidenceSource=source.closest('figure').dataset.evidenceSource;
      const caption=document.createElement('figcaption');const label=document.createElement('small');label.textContent='기존 제품 화면 · 핵심 영역 확대';
      const heading=document.createElement('b');heading.textContent=title;const note=document.createElement('span');note.textContent=copy;caption.append(label,heading,note);
      const window=document.createElement('div');window.className='fm-focus-crop';window.style.setProperty('--fm-focus-offset',offset+'px');window.style.setProperty('--fm-focus-height',height+'px');
      const image=document.createElement('img');image.src=source.getAttribute('src');image.alt=title+' 영역 확대';image.loading='lazy';image.decoding='async';window.appendChild(image);
      figure.append(caption,window);
      if(index===8)source.closest('figure').after(figure);else host.prepend(figure);
    });
    detail.querySelectorAll(':scope>span').forEach(step=>{
      const description=step.querySelector('small');const title=document.createElement('b');
      title.textContent=[...step.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim();
      step.replaceChildren(title,description);
    });
    const process=document.createElement('ol');process.className='fm-processing-path';process.setAttribute('aria-label','입력부터 사용자 확인까지의 처리 순서');
    [['입력','사용자가 의도 전달'],['해석','AI가 조건으로 변환'],['추천','규칙으로 후보·순위 결정'],['확인','사용자가 참가 요청']].forEach(([title,copy],i)=>{
      const step=document.createElement('li');step.innerHTML='<small>'+String(i+1).padStart(2,'0')+'</small><b>'+title+'</b><span>'+copy+'</span>';
      process.appendChild(step);
    });
    slides[10].querySelector('.fm-owner-grid').before(process);
    // Owner numbers identify groups, not execution order; the path above owns the sequence.
    slides[10].querySelectorAll('.fm-owner-column>header>span').forEach(node=>{node.textContent='';node.setAttribute('aria-hidden','true');});
    const failure=slides[9].querySelectorAll('.fm-evidence-recovery-strip figcaption')[1];
    const compare=document.createElement('div');compare.className='fm-inline-change';compare.setAttribute('aria-label','참가 실패 처리의 실제 수정 전후 기록 요약');
    compare.innerHTML='<div><small>수정 전</small><b>정보 유실 때 처리 중에 멈춤</b></div><div class="is-after"><small>수정 후</small><b>오류 안내 · 버튼 복원 · 재시도</b></div>';
    failure.querySelector('.fm-improvement-open').before(compare);
    const learning=slides[12].querySelector('[data-zone="closed-beta"]');
    const items=learning.querySelectorAll('li');
    items[0].classList.add('fm-change-before');items[1].classList.add('fm-change-after');
    items[0].querySelector('span').textContent='수정 전';items[0].querySelector('b').textContent='평가 저장 후에도 피드백 안내 유지';
    items[1].querySelector('span').textContent='수정 후';items[1].querySelector('b').textContent='완료 기록을 반영해 다음 경기 찾기 표시';
    const proof=document.createElement('a');proof.className='fm-proof-link fm-learning-proof';proof.href='https://github.com/dohyunkimmm/footmate/pull/442';proof.target='_blank';proof.rel='noopener';proof.textContent='실제 수정 기록 ↗';learning.appendChild(proof);
    slides[12].querySelector('.fm-p1-release-next dd').textContent='시작·완료·실패를 함께 다뤄 화면 사이의 연결을 점검';
    document.documentElement.dataset.fmEvidenceDetails='true';
  }


  function installNavigationPreview(slides){
    const names=[...document.querySelectorAll('.toc-item .toc-t')].map(node=>node.textContent);
    const controls=[document.querySelector('.btn-prev'),document.querySelector('.btn-next')];
    controls.forEach((button,i)=>{
      const arrow=document.createElement('span');arrow.className='fm-control-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent=i?'→':'←';
      const copy=document.createElement('span');copy.className='fm-control-destination';copy.id='fm-control-destination-'+i;
      const label=document.createElement('small');const title=document.createElement('b');copy.append(label,title);
      button.replaceChildren(arrow,copy);button.setAttribute('aria-describedby',copy.id);
    });
    const update=()=>{
      const current=slides.findIndex(slide=>slide.classList.contains('on'));
      controls.forEach((button,i)=>{
        const target=current+(i?1:-1);const destination=button.querySelector('.fm-control-destination');
        destination.querySelector('small').textContent=target<0?'첫 섹션':target>=slides.length?'마지막 섹션':i?'다음 섹션':'이전 섹션';
        destination.querySelector('b').textContent=names[Math.max(0,Math.min(names.length-1,target))];
      });
    };
    new MutationObserver(records=>{if(records.some(record=>record.target.classList.contains('slide')))update();})
      .observe(document.querySelector('.track'),{subtree:true,attributes:true,attributeFilter:['class']});
    update();
    document.documentElement.dataset.fmColorInteractionPolish='true';
  }


  function installEvidenceSummaries(slides){
    const summaries={
  "tasks": {
    "title": "사용자 과업 검증",
    "intro": "교육생 6명에게 구체적인 탐색·가입 행동을 요청해, 동선의 막힘과 상태 복귀를 확인했습니다.",
    "items": [
      [
        "확인 대상",
        "가입 전 탐색과 인증 후 복귀",
        "iOS 4명·Android 2명에게 수준·포지션 조건을 나눠 과업을 요청했습니다."
      ],
      [
        "확인 방법",
        "가입 관련 과업 총 8회",
        "가입 전 탐색·Kakao·Google·이메일을 각각 2회 요청했습니다. 일부 참여자는 복수 과업을 수행했습니다."
      ],
      [
        "배운 점",
        "구체적인 행동을 지정해 확인",
        "동선을 지정해야 문제 구간을 지나며, 같은 조건으로 오류를 다시 확인하기 쉽습니다."
      ],
      [
        "해석 한계",
        "사용성 검증이며 이용 성과는 미측정",
        "개인별 과업 매핑·상세 오류 목록은 미확정입니다. 전환율 개선이나 전체 이용자의 선호를 입증하지 않습니다."
      ]
    ]
  },
  "auth": {
    "title": "로그인을 참가 직전에 요청한 이유",
    "intro": "경기를 먼저 살펴보고 참가 의도가 생겼을 때 로그인하도록 순서를 정했습니다.",
    "items": [
      [
        "비교한 대안",
        "첫 화면에서 가입부터 요청",
        "서비스가 자신에게 맞는지 확인하기 전에 계정 생성과 설문을 거쳐야 합니다."
      ],
      [
        "선택한 흐름",
        "조건 설정 → 추천 → 상세 → 참가 시 로그인",
        "가입 전에도 후보와 추천 이유를 살펴보고, 참가할 때 인증하도록 설계했습니다."
      ],
      [
        "설계 의도",
        "가치를 확인한 뒤 가입 여부 판단",
        "로그인 전에 고른 경기와 복귀 위치를 보존해 같은 선택을 반복하지 않도록 합니다."
      ],
      [
        "한계",
        "전환 효과는 아직 미검증",
        "계정 기반 개인화와 기기 간 연속성에는 제약이 있습니다. 가입률 개선을 측정한 결과는 아닙니다."
      ]
    ]
  },
  "recommendation": {
    "title": "추천 순위와 이유를 결정하는 기준",
    "intro": "AI가 경기 사실이나 순위를 만들어내지 않도록, 조건 해석과 추천 판단을 분리했습니다.",
    "items": [
      [
        "입력",
        "지역·레벨·포지션 조건",
        "페이지의 두 조건 예시를 바꾸면 같은 샘플 경기에서 순위와 추천 이유를 비교할 수 있습니다."
      ],
      [
        "판단",
        "기준 기반 추천 로직이 후보와 순위 결정",
        "경기 데이터와 입력 조건을 대조합니다. 같은 입력은 같은 순서로 재현됩니다."
      ],
      [
        "표현",
        "점수보다 판단 가능한 이유 먼저",
        "생활권·레벨·포지션처럼 경기 선택에 필요한 일치 항목을 보여줍니다."
      ],
      [
        "한계",
        "샘플 경기로 실행하는 추천 예시",
        "이 목업은 개인화 기억이나 AI 조건 해석을 적용한 비교가 아닙니다. 실제 참가 효과도 미측정입니다."
      ]
    ]
  },
  "recovery": {
    "title": "참가 실패 후 다시 진행할 수 있는지 확인",
    "intro": "처리 중에 멈춘 버튼을 오류 안내와 재시도 가능한 상태로 바꾸고, 동일 동선을 자동 검증했습니다.",
    "items": [
      [
        "수정 전",
        "경기 정보가 없으면 처리 중에 멈춤",
        "참가를 진행하지 못해도 버튼이 처리 중 상태에 남아 다음 행동을 할 수 없었습니다."
      ],
      [
        "수정 후",
        "오류 안내·버튼 복원·다른 경기 선택",
        "실패 시 버튼을 다시 활성화하고 재시도와 경기 다시 선택을 제공합니다."
      ],
      [
        "확인 방법",
        "정보 유실 → 오류 → 정보 복원 → 참가 성공",
        "자동 브라우저 검사로 안내 문구, 활성 버튼, 최종 성공 화면을 확인합니다."
      ],
      [
        "해석 한계",
        "동작 검증과 사용자 효과는 별도",
        "페이지의 복구 화면은 UI 목업입니다. 복구 성공률이나 참가 전환 개선을 측정한 결과는 아닙니다."
      ]
    ]
  },
  "ownership": {
    "title": "AI와 서비스의 책임을 나눈 이유",
    "intro": "AI는 요청을 이해하고, 서비스는 실제 경기 데이터로 판단하며, 사용자는 참가를 최종 확인합니다.",
    "items": [
      [
        "사용자",
        "조건과 최종 참가 의사 결정",
        "AI가 사용자를 대신해 참가를 확정하지 않도록 명시적 확인 단계를 둡니다."
      ],
      [
        "AI",
        "자연어 요청을 검색 조건으로 해석",
        "경기 ID·가격·정원·날짜·순위를 생성하지 못하도록 입력과 출력 범위를 제한합니다."
      ],
      [
        "서비스",
        "후보·순위·추천 이유 결정",
        "추천 로직이 실제 후보를 평가합니다. AI 연결이 실패하면 규칙 기반 탐색으로 이어갑니다."
      ],
      [
        "한계",
        "자유로운 자동화 범위 제한",
        "대체 경로에서는 자연어 해석 범위가 줄어들 수 있습니다. 실제 결제는 미연동입니다."
      ]
    ]
  },
  "qa": {
    "title": "자동 검사에서 확인하는 내용",
    "intro": "자동 검사는 화면과 상태가 설계한 대로 이어지는지 확인합니다. 사용자 만족이나 전환 성과와 구분합니다.",
    "items": [
      [
        "정상 흐름",
        "탐색부터 경기 후 다음 탐색까지",
        "경기 선택·참가·체크인·평가 저장 이후에 올바른 상태와 다음 행동이 표시되는지 확인합니다."
      ],
      [
        "예외 흐름",
        "참가 실패·재시도·정보 복원",
        "정보 유실 시 오류를 알리고 버튼을 복원하며, 재시도 후 같은 경기의 참가를 완료하는지 확인합니다."
      ],
      [
        "화면과 접근성",
        "모바일 크기·키보드·화면 비교",
        "브라우저 자동 검사로 화면 넘침, 조작 가능 여부, 승인된 화면과의 차이를 확인합니다."
      ],
      [
        "해석 한계",
        "구현 품질 확인이며 이용 성과는 아님",
        "자동 검사 통과만으로 실제 이용자의 만족이나 참가 전환 개선을 입증하지 않습니다."
      ]
    ]
  },
  "manual": {
    "title": "사람이 직접 확인한 외부 연결",
    "intro": "자동 검사와 별도로, 실제 외부 서비스와 사용자 기기에서 전달 결과를 확인했습니다.",
    "items": [
      [
        "로그인",
        "Google·Kakao 실제 로그인",
        "Closed Beta에서 인증을 진행하고 원래 이용 흐름으로 돌아오는 경로를 수동 확인했습니다."
      ],
      [
        "이메일",
        "참가 상태 안내의 최종 전달",
        "참가·취소·체크인 안내가 실제 이메일 전달 완료까지 이어지는지 확인했습니다."
      ],
      [
        "기기 알림",
        "브라우저·운영체제에 알림 표시",
        "알림에 동의한 기기에서 실제 표시를 확인했습니다. 이후 표시는 기기와 권한 설정에 영향을 받습니다."
      ],
      [
        "해석 한계",
        "연결 확인과 사용자 효과는 별도",
        "외부 연결 성공이 서비스 만족이나 참가·재이용 효과를 의미하지는 않습니다."
      ]
    ]
  },
  "improvement": {
    "title": "평가 저장 이후 다음 경기 탐색으로 연결",
    "intro": "평가를 저장해도 피드백 안내가 남던 화면을, 완료 안내와 다음 경기 찾기로 바꿨습니다.",
    "items": [
      [
        "수정 전",
        "평가 저장 후에도 피드백 안내 유지",
        "경기 종료 여부만 확인해, 이미 평가를 마친 사용자에게 다시 피드백을 안내했습니다."
      ],
      [
        "원인",
        "경기 종료와 평가 완료를 구분하지 않음",
        "저장 완료 기록이 홈 화면의 다음 행동에 반영되지 않았습니다."
      ],
      [
        "수정 후",
        "완료 기록 확인 → 다음 경기 찾기",
        "MY에서 평가를 저장하면 홈에서 완료 안내와 탐색 진입 버튼을 표시합니다."
      ],
      [
        "재검증",
        "평가 저장 → 홈 완료 → 경기 찾기 진입",
        "자동 브라우저 검사에서 저장 상태·완료 문구·다음 화면을 확인했습니다. 재이용률 개선은 미측정입니다."
      ]
    ]
  }
};
    const dialog=document.createElement('dialog');
    dialog.className='fm-improvement-dialog fm-evidence-summary-dialog';
    dialog.setAttribute('aria-labelledby','fm-evidence-summary-title');
    dialog.innerHTML='<header><div><small>설계와 검증 근거</small><h2 id="fm-evidence-summary-title"></h2></div><button type="button" aria-label="근거 요약 닫기">닫기 ×</button></header><div class="fm-improvement-content"><p class="fm-evidence-summary-intro"></p><ol></ol></div><footer><p>기존 설계·검증 기록을 요약했습니다. 상세 자료는 선택적으로 확인할 수 있습니다.</p><a class="fm-proof-link" target="_blank" rel="noopener">상세 자료 · GitHub ↗</a></footer>';
    let opener;
    dialog.querySelector('header>button').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('keydown',event=>event.stopPropagation());
    dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
    dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
    document.body.appendChild(dialog);
    slides.forEach((slide,index)=>{
      slide.querySelectorAll('a[href*="github.com/dohyunkimmm/footmate"]').forEach(anchor=>{
        const url=anchor.href;
        const key=url.includes('USER-TEST-EVIDENCE.md')?'tasks':index===4?'auth':index===5?'recommendation':index===9?'recovery':index===10?'ownership':url.includes('/pull/442')?'improvement':url.includes('release-app.spec.cjs')?'qa':index===11?'manual':null;
        if(!key)return;
        const button=document.createElement('button');
        button.type='button';button.className=anchor.className+' fm-evidence-summary-open';
        const labels={tasks:'과업 기록 보기 ↗',auth:'인증 시점 근거 보기 ↗',recommendation:'추천 기준 보기 ↗',recovery:'복구 검증 보기 ↗',ownership:'책임 분리 근거 보기 ↗',qa:'검증 근거 보기 ↗',manual:'검증 근거 보기 ↗',improvement:'수정 전후 보기 ↗'};
        button.textContent=index===11?'검증 근거 보기 ↗':labels[key];button.dataset.evidenceSummary=key;
        button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','fm-evidence-summary-dialog');
        button.addEventListener('click',()=>{
          opener=button;const entry=summaries[key];
          dialog.dataset.evidenceSummary=key;
          dialog.querySelector('h2').textContent=entry.title;
          dialog.querySelector('.fm-evidence-summary-intro').textContent=entry.intro;
          const list=dialog.querySelector('ol');list.replaceChildren();
          entry.items.forEach(([stage,title,copy])=>{
            const item=document.createElement('li'),label=document.createElement('span'),heading=document.createElement('b'),text=document.createElement('p');
            label.textContent=stage;heading.textContent=title;text.textContent=copy;item.append(label,heading,text);list.appendChild(item);
          });
          dialog.querySelector('footer a').href=url;dialog.showModal();
        });
        anchor.replaceWith(button);
      });
    });
    dialog.id='fm-evidence-summary-dialog';
    document.querySelectorAll('.fm-improvement-dialog:not(.fm-evidence-summary-dialog) footer a').forEach((anchor,index)=>{anchor.textContent=index===0?'상세 수정 자료 · GitHub ↗':'상세 검증 자료 · GitHub ↗';});
    document.documentElement.dataset.fmEvidenceSummaries='true';
  }


  // Reviewer explanations only: these examples never write product state.
  function installPageUpgrades(slides){
    const entries={
      tasks:{title:'과업에서 요구사항으로 연결',intro:'확인된 수행 기록과 설계 적용을 연결했습니다. 개별 오류의 빈도·수정 인과는 미확정입니다.',rows:[
        ['확인한 과업','가입 전 탐색 · 2회','조건 선택 → 추천·목록 → 상세 이동을 확인하는 과업입니다.'],
        ['요구사항','계정 없이 후보와 상세 확인','가입 전 공개 범위를 설계했습니다. 과업 결과로 전환 효과가 입증된 것은 아닙니다.'],
        ['확인한 과업','Kakao·Google·이메일 가입 · 각 2회','인증 방식별 상태 변화와 원래 흐름으로 복귀하는 과정을 확인했습니다.'],
        ['요구사항과 한계','선택 경기·복귀 위치 보존','개인별 오류 목록은 미확정입니다. 특정 사용자 관찰이 모든 후속 수정을 발생시켰다고 해석하지 않습니다.']
      ]},
      priority:{title:'참가·복구를 먼저 정한 판단',intro:'현재 구현 범위를 설명하는 설계 판단입니다. 당시 정량 평가표나 사용자 성과 측정 결과는 아닙니다.',rows:[
        ['비교한 대안','결제·정산부터 확장','수익화 경로를 먼저 구축하는 대안과 비교했습니다.'],
        ['오류 영향','정원·참가 결과가 불명확하면 다음 행동 중단','참가 확정과 취소·출석 상태는 이용자가 진행할 수 있는지에 직접 영향을 줍니다.'],
        ['선택 이유','무료 참가와 예외 복구부터 검증','선택 보존·결과 확인·재시도를 먼저 다뤄 핵심 흐름을 확인합니다.'],
        ['감수한 제약','결제·수익성 검증은 후순위','실제 PG는 미연동이며, 유료 전환과 수익성을 입증하지 않습니다.']
      ]},
      compare:{title:'두 경기의 차이를 한 번에 확인',intro:'설명용 샘플입니다. 실시간 경기·정원 조회나 실제 비교 저장을 실행하지 않습니다.',rows:[
        ['판단 기준','갈 수 있는 일정 → 이동 → 레벨 → 포지션','거리 하나로 결론 내리지 않고 참가 가능 조건을 함께 확인합니다.'],
        ['저장과 비교의 역할','나중에 다시 볼 후보와 지금 판단할 후보 구분','저장은 후보 보관, 비교는 최대 2경기의 차이 확인을 돕습니다.']
      ]},
      join:{title:'참가 결과별로 이어갈 행동',intro:'설명용 상태 예시입니다. 로그인·참가 요청·취소를 실제 실행하지 않습니다.',states:[
        ['완료','참가 경기 · 완료 기록','MY에서 일정과 준비 정보 확인','참가가 끝난 뒤에는 같은 요청을 반복하지 않고 내 경기로 이동합니다.'],
        ['실패','선택 경기 · 참가 의도','참가 결과 확인 후 재시도 또는 경기 다시 선택','오류를 안내하고 버튼을 복원합니다. 재시도 전 현재 결과를 확인합니다.'],
        ['취소','선택 경기 · 복귀 위치','상세로 돌아가 참가 여부 다시 판단','인증·참가 진행을 중단한 예시입니다. 확정된 참가의 운영상 취소와 구분합니다.']
      ]},
      matchday:{title:'상태가 바뀌면 다음 행동도 바뀜',intro:'설명용 상태 예시입니다. 실제 출석·평가 기록은 변경하지 않습니다.',states:[
        ['예정','참가 경기 · 일정','MY에서 장소와 준비 정보 확인','홈은 다음 행동과 MY 진입을 안내하고, 참가 경기의 상세 상태는 MY에서 확인합니다.'],
        ['당일','참가 경기 · 체크인 상태','체크인 또는 운영 문의','시작 20분 전부터 종료 전까지 체크인합니다. 실패 시 재시도와 운영 문의를 제공합니다.'],
        ['종료 후','완료 경기 · 피드백 상태','평가 전이면 피드백, 저장 후면 다음 경기 찾기','완료 기록을 반영해 다음 행동을 바꿉니다. 체감 난이도와 재참가 의향은 추천의 보조 신호입니다.']
      ]},
      next:{title:'관찰 결과를 다음 결정으로 연결',intro:'앞으로 수행할 검증 계획입니다. 아직 관찰한 결과나 달성한 성과가 아닙니다.',rows:[
        ['남은 질문','추천 이유가 참가 판단에 도움이 되는가','과업: 조건에 맞는 경기 2개를 비교하고 선택 이유와 망설인 정보를 설명하도록 요청합니다.'],
        ['결과에 따른 결정','이유가 불명확하면 표현·정보 순서 수정','사용자가 선택 근거를 설명할 수 있는지 관찰하고, 누락된 정보와 조건 불일치를 구분합니다.'],
        ['남은 질문','완료·실패 후 다음 행동을 찾을 수 있는가','과업: 참가 실패 후 다시 진행하고, 평가 저장 후 다음 경기를 찾도록 요청합니다.'],
        ['결과에 따른 결정','막힌 지점의 안내·버튼·복귀 위치 수정','같은 과업으로 재검증합니다. 실제 이용 KPI는 운영·테스트 계정을 제외하고 기준값부터 확보합니다.']
      ]}
    };
    const dialog=document.createElement('dialog');
    dialog.id='fm-page-upgrade-dialog';dialog.className='fm-improvement-dialog fm-page-upgrade-dialog';
    dialog.setAttribute('aria-labelledby','fm-page-upgrade-title');
    dialog.innerHTML='<header><div><small>판단 과정과 설명 예시</small><h2 id="fm-page-upgrade-title"></h2></div><button type="button" aria-label="페이지 설명 닫기">닫기 ×</button></header><div class="fm-improvement-content"><p class="fm-upgrade-intro"></p><div class="fm-upgrade-example"></div><ol></ol></div><footer><p>설계 근거·구현 검증·실제 이용 성과를 구분해 읽어주세요.</p></footer>';
    document.body.appendChild(dialog);
    let opener;
    dialog.querySelector('header button').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('keydown',event=>event.stopPropagation());
    dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
    const list=dialog.querySelector('ol'),example=dialog.querySelector('.fm-upgrade-example');
    function show(key){
      const entry=entries[key];dialog.dataset.pageUpgrade=key;
      dialog.querySelector('h2').textContent=entry.title;dialog.querySelector('.fm-upgrade-intro').textContent=entry.intro;
      list.replaceChildren();example.replaceChildren();list.hidden=!entry.rows;
      (entry.rows||[]).forEach(([stage,title,copy])=>{
        const li=document.createElement('li');const label=document.createElement('span'),b=document.createElement('b'),p=document.createElement('p');
        label.textContent=stage;b.textContent=title;p.textContent=copy;li.append(label,b,p);list.appendChild(li);
      });
      if(key==='compare'){
        example.innerHTML='<table class="fm-upgrade-table"><caption>참가 판단 비교 · 설명용 샘플</caption><thead><tr><th scope="col">항목</th><th scope="col">경기 A</th><th scope="col">경기 B</th></tr></thead><tbody><tr><th scope="row">일정</th><td>평일 20:00</td><td>평일 21:00</td></tr><tr><th scope="row">이동</th><td>15분</td><td>30분</td></tr><tr><th scope="row">레벨</th><td>중급</td><td>초중급</td></tr><tr><th scope="row">포지션</th><td>MF 자리 있음</td><td>GK 자리 있음</td></tr></tbody></table><p class="fm-upgrade-choice">중급 MF를 찾는다면 A의 조건부터 확인합니다. 이동·포지션이 다른 후보는 더 가깝다는 이유만으로 선택하지 않습니다.</p>';
      }
      if(entry.states){
        const controls=document.createElement('div');controls.className='fm-upgrade-state-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','설명 상태 선택');
        const panel=document.createElement('section');panel.className='fm-upgrade-state';panel.setAttribute('aria-live','polite');panel.setAttribute('aria-atomic','true');
        const buttons=entry.states.map(([label],index)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>select(index));controls.appendChild(button);return button;});
        function select(index){
          buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
          const [label,retained,action,copy]=entry.states[index];panel.dataset.exampleState=String(index);
          panel.replaceChildren();const h=document.createElement('h3'),dl=document.createElement('dl'),p=document.createElement('p');
          h.textContent=label;dl.className='fm-cs-reasons';
          [['유지하는 정보',retained],['다음 행동',action]].forEach(([name,value])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;row.append(dt,dd);dl.appendChild(row);});
          p.textContent=copy;panel.append(h,dl,p);
        }
        example.append(controls,panel);select(0);
      }
      dialog.showModal();
    }
    [[2,'tasks','과업과 요구사항 연결 보기 ↗','.fm-p1-jtbd-caveat'],
     [3,'priority','우선순위 판단 보기 ↗','.fm-next-story-aside'],
     [6,'compare','두 경기 비교 예시 보기 ↗','.fm-cs-detail-rationale'],
     [7,'join','참가 결과별 행동 보기 ↗','.fm-p1-auth-preserve'],
     [8,'matchday','상태별 다음 행동 보기 ↗','.fm-page-product-notes'],
     [12,'next','다음 검증과 결정 보기 ↗','.fm-p1-release-next']].forEach(([index,key,label,selector])=>{
      const host=slides[index].querySelector(selector);if(!host)return;
      const button=document.createElement('button');button.type='button';button.className='fm-proof-link fm-page-upgrade-open';button.textContent=label;
      button.dataset.pageUpgrade=key;button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',dialog.id);
      button.addEventListener('click',()=>{opener=button;show(key);});
      const disclosure=host.closest('details');if(disclosure)disclosure.after(button);else if(key==='join')host.after(button);else host.appendChild(button);
    });
    const comparisonNote=slides[6].querySelector('.fm-cs-detail-rationale');
    const comparisonButton=comparisonNote.querySelector('.fm-page-upgrade-open');
    comparisonNote.replaceChildren(document.createTextNode('최대 2경기 · 거리·레벨·포지션·참가비 비교'),comparisonButton);
    const priorityNote=slides[3].querySelector('.fm-next-story-aside .fm-next-cs-note .fm-cs-reasons');
    if(priorityNote)priorityNote.innerHTML='<div><dt>비교한 대안</dt><dd>결제·정산 확장보다 참가·복구를 우선</dd></div><div><dt>선택 이유</dt><dd>정원·참가 결과 오류는 다음 행동을 중단시킴</dd></div><div><dt>감수한 제약</dt><dd>실제 결제·수익성 효과는 미검증</dd></div>';
    slides[12].querySelector('.fm-p1-release-next dl').innerHTML='<div><dt>다음 관찰</dt><dd>경기 2개 선택 이유 · 실패 후 재시도 · 평가 후 재탐색</dd></div><div><dt>결과에 따른 결정</dt><dd>막힌 지점의 정보·안내·복귀 위치 수정 → 동일 과업 재검증</dd></div>';
    document.documentElement.dataset.fmPageUpgrades='true';
  }

  window.installFootMateEditorialFinish=function(slides){
    const recovery=slides[9];
    const map=recovery.querySelector('.fm-p0-recovery-map');
    const strip=recovery.querySelector('.fm-evidence-recovery-strip');
    const layout=document.createElement('div');layout.className='fm-editorial-recovery-layout';
    map.before(layout);layout.append(map,strip);
    const heading=document.createElement('h3');heading.className='fm-editorial-evidence-heading';heading.textContent='핵심 결정 03 · 중단 이후';strip.prepend(heading);
    const note=slides[5].querySelector('.fm-next-cs-note');
    const label=document.createElement('span');label.className='fm-editorial-decision-label';label.textContent='핵심 결정 02 · 근거의 표현';note.prepend(label);note.classList.add('fm-editorial-decision');
    // Keep evidence actions together so one extra button cannot enlarge all three cards.
    slides[11].querySelectorAll('.fm-p1-evidence-grid>.fm-next-cs-card').forEach(card=>{
      const actions=document.createElement('div');actions.className='fm-editorial-evidence-actions';
      card.querySelectorAll('.fm-proof-link,.fm-improvement-open').forEach(node=>actions.appendChild(node));card.appendChild(actions);
    });
    installEvidenceDetails(slides);
    const empty=slides[9].querySelector('.fm-evidence-recovery-strip .fm-evidence-figure:first-of-type');
    empty.dataset.evidenceCrop='empty-actions';
    empty.querySelector('figcaption span').textContent='빈 상태 UI · 핵심 영역 확대';
    empty.querySelector('img').alt='탐색 결과 없음 메시지와 조건 완화·필터 해제 버튼 확대';
    // Freeze explanatory code/document evidence to the reviewed source snapshot.
    const pinEvidence=link=>{
      const prefix='https://github.com/dohyunkimmm/footmate/blob/main/';
      if(link.href.startsWith(prefix))link.href=link.href.replace(prefix,'https://github.com/dohyunkimmm/footmate/blob/b97898d86a8e18450f9bac1ced51209f64545bee/');
    };
    document.querySelectorAll('.slide a[href],.fm-improvement-dialog a[href]').forEach(pinEvidence);
    installNavigationPreview(slides);
    installEvidenceSummaries(slides);
    installPageUpgrades(slides);
    document.documentElement.dataset.fmEditorialFinish='true';
  };
})();
