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
    document.documentElement.dataset.fmEditorialFinish='true';
  };
})();
