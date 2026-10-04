/* FootMate Case Study · interactive decision evidence.
   Recommendation uses the product's pure base ranker and sample data.
   Recovery is a local UI model; it never signs in, joins or writes product storage. */
(function(){
  const SOURCE='https://github.com/dohyunkimmm/footmate/blob/main/';
  const link=(path,label)=>`<a class="fm-proof-link" href="${SOURCE}${path}" target="_blank" rel="noopener">${label} ↗</a>`;
  const rows=items=>'<dl class="fm-cs-reasons">'+items.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')+'</dl>';
  const CASES=[
    {label:'참가 실패 복구',title:'멈춘 버튼을 다시 선택할 수 있는 상태로 바꿨습니다.',steps:[
      ['수정 전','경기 정보가 없으면 참가 처리 중단','버튼은 처리 중 상태에 남아 다음 행동 불가'],
      ['원인','데이터 없음과 처리 오류의 복구 경로 누락','경기 존재 여부만 확인 · 버튼 상태 복원 누락'],
      ['수정','오류 안내 · 재시도 · 경기 다시 선택','처리 중에는 잠금 · 실패하면 버튼 활성화'],
      ['재검증','정보 유실 → 오류 → 정보 복원 → 참가 성공','자동 E2E에서 안내·활성 버튼·성공 화면 확인']
    ]},
    {label:'평가 후 다음 탐색',title:'저장 완료를 다음 경기 탐색으로 연결했습니다.',steps:[
      ['수정 전','평가 저장 후에도 피드백 안내 유지','Home은 종료 후 상태만 보고 MY로 재안내'],
      ['원인','저장 완료 여부와 화면 상태의 연결 누락','경기 종료 상태와 평가 완료 상태를 구분하지 않음'],
      ['수정','완료 기록 확인 · 다음 경기 찾기로 전환','MY에서 저장 · Home에서 완료 안내와 탐색 진입'],
      ['재검증','평가 저장 → Home 완료 → Discover 진입','자동 E2E에서 저장·완료 문구·다음 화면 확인']
    ]}
  ];
  function improvementEvidence(slides){
    const dialog=document.createElement('dialog');dialog.className='fm-improvement-dialog';dialog.setAttribute('aria-labelledby','fm-improvement-title');
    dialog.innerHTML='<header><div><small>구현 개선 · 재검증 기록</small><h2 id="fm-improvement-title">실제 수정과 검증을 연결했습니다.</h2></div><button type="button" aria-label="개선 기록 닫기">닫기 ×</button></header><div class="fm-improvement-tabs" role="group" aria-label="개선 사례 선택"></div><div class="fm-improvement-content" aria-live="polite" aria-atomic="true"></div><footer><p>개발·QA에서 확인한 개선 사례 · 사용자 관찰 결과와 이용 성과는 별도 검증</p><a class="fm-proof-link" href="https://github.com/dohyunkimmm/footmate/pull/442" target="_blank" rel="noopener">실제 수정 기록 ↗</a>'+link('tests/e2e/release-app.spec.cjs','현재 재검증 계약')+'</footer>';
    const tabs=dialog.querySelector('.fm-improvement-tabs');
    CASES.forEach((item,i)=>{const button=document.createElement('button');button.type='button';button.textContent=item.label;button.dataset.improvementCase=String(i);button.addEventListener('click',()=>render(i));tabs.appendChild(button);});
    const render=index=>{
      dialog.dataset.improvementCase=String(index);
      tabs.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      dialog.querySelector('.fm-improvement-content').innerHTML='<h3>'+CASES[index].title+'</h3><ol>'+CASES[index].steps.map(([stage,title,copy],i)=>`<li><span>${String(i+1).padStart(2,'0')} · ${stage}</span><b>${title}</b><p>${copy}</p></li>`).join('')+'</ol>';
    };
    let opener;
    dialog.querySelector('header>button').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('keydown',event=>event.stopPropagation());
    dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
    dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
    document.body.appendChild(dialog);
    const addButton=(host,label,index)=>{
      const button=document.createElement('button');button.type='button';button.className='fm-improvement-open';button.textContent=label;button.setAttribute('aria-haspopup','dialog');
      button.addEventListener('click',()=>{opener=button;render(index);dialog.showModal();});host.appendChild(button);
    };
    addButton(slides[9].querySelectorAll('.fm-evidence-recovery-strip figcaption')[1],'수정 전후 · 재검증 보기',0);
    addButton(slides[11].querySelectorAll('.fm-p1-evidence-grid>.fm-next-cs-card')[1],'개선 사례 2건 보기',0);
    const state=slides[8].querySelectorAll('.fm-next-cs-day-states>div')[3];
    state.querySelector('p').textContent='저장 여부에 따라 완료 안내와 탐색 버튼 표시';
    addButton(slides[8].querySelector('.fm-next-cs-note'),'평가 후 탐색 개선 보기',1);
  }
  function recommendation(slide){
    const figure=slide.querySelector('.is-recommendation');
    figure.dataset.evidenceSource='shared-base-ranker-sample-data';
    figure.dataset.evidenceKind='interactive';
    figure.querySelector('.fm-evidence-media').innerHTML=`
      <div class="fm-decision-mock" aria-label="추천 조건을 변경하는 제품 목업">
        <header class="fm-mock-top"><b>FootMate</b><span>추천 경기</span></header>
        <div class="fm-mock-context"><small>나에게 맞는 경기</small><b>조건을 바꾸고, 이유를 확인해요.</b></div>
        <div class="fm-mock-presets" role="group" aria-label="추천 조건 예시">
          <button type="button" data-reco-preset="0" aria-pressed="true" disabled>수원 · 중급 MF</button>
          <button type="button" data-reco-preset="1" aria-pressed="false" disabled>용인 · 초중급 GK</button>
        </div>
        <div class="fm-mock-results" aria-live="polite" aria-atomic="true"><p class="fm-mock-loading">추천 경기를 불러오고 있어요.</p></div>
        <footer class="fm-mock-footer"><span>조건 일치 이유로 판단</span><b>추천 → 상세 → 참가 확인</b></footer>
      </div>`;
    figure.querySelector('figcaption b').textContent='조건 변경 · 추천 UI 목업';
    figure.querySelector('figcaption span').innerHTML='기본 추천 로직 실행 · 샘플 경기 '+link('src/platform/domain/recommendation.js','추천 근거');
    const host=figure.querySelector('.fm-mock-results');
    const presets=[{region:'수원 · 인계',level:'중급',position:'MF'},{region:'용인 · 기흥',level:'초중급',position:'GK'}];
    const buttons=[...figure.querySelectorAll('[data-reco-preset]')];
    Promise.all([import('/src/platform/domain/recommendation.js'),import('/src/app/data.js')]).then(([domain,data])=>{
      const render=index=>{
        buttons.forEach((button,i)=>{button.disabled=false;button.setAttribute('aria-pressed',String(i===index));});
        const ranked=domain.rankRecommendations(data.MATCHES,presets[index]).slice(0,2);
        host.replaceChildren();
        ranked.forEach((item,i)=>{
          const card=document.createElement('article');card.className='fm-mock-match';card.dataset.matchId=item.match.id;
          const meta=document.createElement('div');meta.className='fm-mock-match-meta';
          const rank=document.createElement('span');rank.textContent=String(i+1).padStart(2,'0');
          const venue=document.createElement('b');venue.textContent=item.match.place;
          const time=document.createElement('small');time.textContent=item.match.shortDate;
          meta.append(rank,venue,time);
          const reasons=document.createElement('div');reasons.className='fm-mock-reasons';
          item.reasons.slice(0,3).forEach(reason=>{const chip=document.createElement('span');chip.textContent=reason.title;reasons.appendChild(chip);});
          const footer=document.createElement('div');footer.className='fm-mock-match-bottom';
          const detail=document.createElement('span');detail.textContent=item.match.level+' · '+item.match.distance+' · '+item.spotLabel;
          const price=document.createElement('b');price.textContent=new Intl.NumberFormat('ko-KR').format(item.match.price)+'원';
          footer.append(detail,price);card.append(meta,reasons,footer);host.appendChild(card);
        });
        figure.dataset.recommendationPreset=String(index);
        const context=figure.querySelector('.fm-mock-context small');context.textContent=index===0?'비교 A · 수원 / 중급 / MF':'비교 B · 용인 / 초중급 / GK';
        const footer=figure.querySelector('.fm-mock-footer');footer.querySelector('span').textContent='1순위 · '+ranked[0].match.place;footer.querySelector('b').textContent='조건 변경 → 순위·이유 재계산';
      };
      buttons.forEach(button=>button.addEventListener('click',()=>render(Number(button.dataset.recoPreset))));
      render(0);
      figure.dataset.interactiveReady='true';
    }).catch(()=>{host.textContent='추천 예시를 불러오지 못했어요. 새로고침해 다시 확인해 주세요.';figure.dataset.interactiveReady='error';});
    const note=slide.querySelector('.fm-next-cs-note');
    slide.querySelector('.fm-p0-annotations').innerHTML=[
      ['현재 조건','오늘의 의도를 지역·레벨·포지션으로 전달'],
      ['기억한 선호','프로필·선호·최근 이력은 현재 브라우저에 기록'],
      ['사용자 제어','AI 해석이 맞지 않으면 수정하거나 해제']
    ].map(([title,copy],i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><div><b>${title}</b><p>${copy}</p></div></li>`).join('');
    note.innerHTML=rows([
      ['대안','내부 점수를 중심으로 목록 제공'],
      ['선택','판단에 필요한 일치 항목을 먼저 노출'],
      ['제약','샘플 데이터로 실행 · 개인화 기억은 별도 입력']
    ]);
  }
  function recovery(slide){
    const figure=slide.querySelectorAll('.fm-evidence-recovery-strip .fm-evidence-figure')[1];
    figure.dataset.evidenceKind='interactive-mock';
    figure.querySelector('.fm-evidence-media').innerHTML=`<div class="fm-cs-recovery-example fm-recovery-demo" data-recovery-state="failed">
      <span class="fm-recovery-state-label">참가 확인</span>
      <div class="fm-recovery-message" aria-live="polite" aria-atomic="true"><b>참가를 확정하지 못했어요.</b><p>선택한 경기와 참가 의도를 유지했어요.</p></div>
      <div class="fm-recovery-retained"><span>보존한 선택</span><b>수원 인계 · MF</b></div>
      <div class="fm-recovery-actions"><button type="button" data-recovery-action="retry">다시 시도</button><button type="button" data-recovery-action="choose">경기 다시 선택</button></div>
      <small class="fm-recovery-action-label">다시 시도 · 경기 다시 선택</small>
    </div>`;
    figure.querySelector('figcaption b').textContent='참가 실패 · 복구 설계';
    figure.querySelector('figcaption span').innerHTML='화면 캡처 아님 · 복구 UI 목업 '+link('tests/e2e/release-app.spec.cjs','재시도 QA');
    const demo=figure.querySelector('.fm-recovery-demo');
    let timer;
    const render=state=>{
      demo.dataset.recoveryState=state;
      const message={failed:['참가를 확정하지 못했어요.','선택한 경기와 참가 의도를 유지했어요.'],checking:['참가 결과를 확인하고 있어요.','중복 참가를 막기 위해 버튼을 잠시 잠갔어요.'],success:['참가를 확정했어요.','다음 행동은 MY에서 이어가요.'],choose:['다른 경기를 선택해요.','탐색 조건을 유지하고 후보를 다시 확인해요.']}[state];
      demo.querySelector('.fm-recovery-message b').textContent=message[0];demo.querySelector('.fm-recovery-message p').textContent=message[1];
      const retry=demo.querySelector('[data-recovery-action="retry"]');retry.disabled=state==='checking';retry.textContent=state==='checking'?'확인 중…':state==='failed'?'다시 시도':'처음 상태로';
      demo.querySelector('[data-recovery-action="choose"]').disabled=state==='checking';
    };
    demo.querySelector('[data-recovery-action="retry"]').addEventListener('click',()=>{
      clearTimeout(timer);
      if(demo.dataset.recoveryState!=='failed'){render('failed');return;}
      render('checking');timer=setTimeout(()=>render('success'),450);
    });
    demo.querySelector('[data-recovery-action="choose"]').addEventListener('click',()=>{clearTimeout(timer);render('choose');});
  }
  function architecture(slide){
    const main=slide.querySelector('.fm-p0-arch-main');
    const nodes=[...main.querySelectorAll('.fm-p0-arch-node')];
    main.replaceChildren();main.classList.add('fm-owner-grid');main.setAttribute('aria-label','사용자, AI, 추천 로직의 책임 경계');
    [['사용자','의도와 최종 결정',[0,5]],['AI','자연어를 검색 조건으로',[1,2]],['추천 로직','경기 데이터로 후보 판단',[3,4]]].forEach(([owner,reason,indexes],i)=>{
      const group=document.createElement('section');group.className='fm-owner-column';group.dataset.owner=String(i);
      const header=document.createElement('header');const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');const b=document.createElement('b');b.textContent=owner;const p=document.createElement('p');p.textContent=reason;header.append(n,b,p);group.appendChild(header);
      indexes.forEach(index=>group.appendChild(nodes[index]));main.appendChild(group);
    });
    const copy=slide.querySelector('.fm-next-cs-note');
    copy.innerHTML=rows([
      ['대안','자유 생성으로 사실·순위까지 구성'],
      ['선택','검증 가능한 입력·출력 경계 고정'],
      ['제약','자동 참가 금지 · 연결 실패 시 규칙 기반 대체']
    ])+link('docs/SERVICE-PLANNING-EVIDENCE.md','책임 분리 근거');
  }
  function validation(slide){
    const cards=slide.querySelectorAll('.fm-p1-evidence-grid>.fm-next-cs-card');
    const copy=[
      ['사용자 과업','교육생 6명 · 가입 과업 8회','수료 전 탐색·가입 동선 확인 · 대표성·전환 효과는 미검증','docs/USER-TEST-EVIDENCE.md'],
      ['자동 QA','오류와 복원 경로','회귀 테스트 · 브라우저 E2E · 접근성 · 화면 비교 · 참가 실패·재시도','tests/e2e/release-app.spec.cjs'],
      ['사람 검수','외부 서비스와 전달 결과','실제 로그인 · 이메일 전달 · 브라우저·OS 알림 표시 · 사용자 효과와 구분','docs/SERVICE-PLANNING-EVIDENCE.md']
    ];
    cards.forEach((card,i)=>{card.querySelector('.fm-p1-evidence-label').textContent=copy[i][0];card.querySelector('h3').textContent=copy[i][1];card.querySelector('p').textContent=copy[i][2];card.insertAdjacentHTML('beforeend',link(copy[i][3],'근거'));});
    slide.querySelector('.fm-next-cs-note').innerHTML='이후 개인 고도화 · 설계와 구현의 일치, 중단 상황의 대응을 점검';
  }
  function nextDecisions(slide){
    const summary=[['개선 근거','수정 사례 2건'],['점검 방식','구현과 자동 QA 대조'],['적용 범위','개인 프로젝트의 품질 관리']];
    slide.querySelectorAll('.fm-next-review-summary>div').forEach((node,i)=>{node.querySelector('span').textContent=summary[i][0];node.querySelector('b').textContent=summary[i][1];});
    const definitions=[
      ['real-app','추천 일관성','조건과 설명이 일치하는가',[
        ['입력 반영','지역·레벨·포지션에 따라 후보 변경'],['재현성','같은 요청이면 동일한 순서'],['표현 원칙','내부 점수보다 선택에 필요한 이유 제시'],['보완 조건','근거와 입력이 어긋나면 로직·문구 함께 수정']
      ]],
      ['closed-beta','흐름 완결성','완료 후 다음 행동이 있는가',[
        ['발견한 문제','저장했어도 피드백 안내가 남음'],['수정 내용','완료 상태를 구분해 탐색 버튼 표시'],['검증 경로','저장 → Home 완료 → Discover 진입'],['점검 항목','종료 단계의 주 행동과 복귀 위치']
      ]],
      ['open-boundary','복구 행동','오류 후 다시 행동할 수 있는가',[
        ['버튼 복원','멈춤 → 오류 안내·재시도·다른 경기 선택'],['확인 절차','정보 유실 → 복원 → 참가 성공'],['예외 정의','상황마다 남길 정보와 이어갈 조치 명시']
      ]]
    ];
    definitions.forEach(([zone,label,title,items])=>{
      const card=slide.querySelector(`[data-zone="${zone}"]`);card.querySelector('header small').textContent=label;card.querySelector('header b').textContent=title;
      card.querySelector('ul').innerHTML=items.map(([name,copy])=>`<li data-status="not-measured"><span>${name}</span><b>${copy}</b></li>`).join('');
    });
    slide.querySelector('.fm-p1-release-map').setAttribute('aria-label','개인 고도화의 설계 학습과 다음 품질 기준');
    slide.querySelector('.fm-p1-release-next>span').textContent='핵심 학습 · 이후 적용';
    slide.querySelector('.fm-p1-release-next dl').innerHTML=rows([['배운 점','완료·실패 화면에서도 이어갈 조치를 함께 설계'],['축적 방식','설계 의도와 수정 기록, 자동 QA 결과를 대조']]).replace(/^<dl[^>]*>|<\/dl>$/g,'');
  }
  window.installFootMateDecisionEvidence=function(slides){
    // Three representative decisions share one evidence chain: alternative → choice → limit.
    slides[4].querySelector('.fm-next-cs-decision').innerHTML='<span>핵심 결정 01 · 진입 장벽</span>'+rows([
      ['대안','설문 기반 프로필 확보를 앞세움'],['선택','계정 없이도 후보를 살펴볼 수 있음'],['제약','지역·포지션·레벨 설정 필요 · 기기 간 연속성 제한']
    ])+link('docs/SERVICE-PLANNING-EVIDENCE.md','인증 시점 근거');
    recommendation(slides[5]);recovery(slides[9]);architecture(slides[10]);validation(slides[11]);nextDecisions(slides[12]);improvementEvidence(slides);
    const proof=slides[0].querySelector('.fm-next-cover-proof>div:last-child');proof.querySelector('b').textContent='대표 결정 · 3가지';proof.querySelector('span').innerHTML='가치 확인 후 인증 · 이유로 추천 판단<br>선택을 보존한 실패 복구';
    slides[2].querySelector('.fm-p1-jtbd-caveat').innerHTML='교육 단계 · iOS 4명 · Android 2명 · 일부 복수 과업 · 이후 개인 고도화와 구분 '+link('docs/USER-TEST-EVIDENCE.md','과업 기록');
    document.documentElement.dataset.fmDecisionEvidence='true';
  };
})();
