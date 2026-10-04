/* FootMate Case Study · interactive decision evidence.
   Recommendation uses the product's pure base ranker and sample data.
   Recovery is a local UI model; it never signs in, joins or writes product storage. */
(function(){
  const SOURCE='https://github.com/dohyunkimmm/footmate/blob/main/';
  const link=(path,label)=>`<a class="fm-proof-link" href="${SOURCE}${path}" target="_blank" rel="noopener">${label} ↗</a>`;
  const rows=items=>'<dl class="fm-cs-reasons">'+items.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')+'</dl>';
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
      };
      buttons.forEach(button=>button.addEventListener('click',()=>render(Number(button.dataset.recoPreset))));
      render(0);
      figure.dataset.interactiveReady='true';
    }).catch(()=>{host.textContent='추천 예시를 불러오지 못했어요. 새로고침해 다시 확인해 주세요.';figure.dataset.interactiveReady='error';});
    const note=slide.querySelector('.fm-next-cs-note');
    slide.querySelector('.fm-p0-annotations').innerHTML=[
      ['현재 조건','지역·레벨·포지션 변경 → 후보·순위·이유 재계산'],
      ['기억한 선호','저장 프로필·선호 조건·최근 이력은 추가 입력 · 현재 브라우저 기록'],
      ['사용자 제어','해석 결과 확인 · 조건 수정·해제 · 다시 탐색']
    ].map(([title,copy],i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><div><b>${title}</b><p>${copy}</p></div></li>`).join('');
    note.innerHTML=rows([
      ['대안','내부 점수만 제시 · 추천 이유 없이 목록 제공'],
      ['선택','순위는 로직이 결정 · 조건 일치 이유는 화면에 제시'],
      ['제약','샘플 경기 · 기본 추천 예시 · 개인화 기억은 별도 입력']
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
      ['대안','AI가 후보·추천 순위까지 생성'],
      ['선택','조건 해석만 AI · 경기 사실과 순위는 추천 로직'],
      ['제약','자동 참가 금지 · 연결 실패 시 규칙 기반 대체']
    ])+link('docs/SERVICE-PLANNING-EVIDENCE.md','책임 분리 근거');
  }
  function validation(slide){
    const cards=slide.querySelectorAll('.fm-p1-evidence-grid>.fm-next-cs-card');
    const copy=[
      ['사용자 과업','6명·8회 동선 검증','가입 전 탐색 · Kakao·Google·이메일 과업 · 개별 이슈 기록 미확정','docs/USER-TEST-EVIDENCE.md'],
      ['자동 QA','동작·상태·복구 확인','회귀 테스트 · 브라우저 E2E · 접근성 · 화면 비교 · 참가 실패·재시도','tests/e2e/release-app.spec.cjs'],
      ['사람 검수','운영 환경의 연결 확인','실제 로그인 · 이메일 전달 · 브라우저·OS 알림 표시 · 사용자 효과와 구분','docs/SERVICE-PLANNING-EVIDENCE.md']
    ];
    cards.forEach((card,i)=>{card.querySelector('.fm-p1-evidence-label').textContent=copy[i][0];card.querySelector('h3').textContent=copy[i][1];card.querySelector('p').textContent=copy[i][2];card.insertAdjacentHTML('beforeend',link(copy[i][3],'근거'));});
    slide.querySelector('.fm-next-cs-note').innerHTML='해석 경계 · 과업 수행·동작 QA와 이용 성과는 구분 · 이용 기준값 미확보';
  }
  function nextDecisions(slide){
    const summary=[['추천 판단','이유 이해 · 후보 비교'],['참가 동선','인증 · 복귀 · 완료'],['복구 행동','재시도 · 대안 선택']];
    slide.querySelectorAll('.fm-next-review-summary>div').forEach((node,i)=>{node.querySelector('span').textContent=summary[i][0];node.querySelector('b').textContent=summary[i][1];});
    const definitions=[
      ['real-app','추천 이유','판단에 도움이 되는가',[
        ['구현 근거','조건에 따라 후보·순위·이유 변경'],['다음 관찰','이유를 보고 후보를 설명·비교하는지'],['제외 기준','QA 성공을 판단 도움으로 해석 금지'],['다음 판단','이유 이해가 낮으면 표현·정보 순서 수정']
      ]],
      ['closed-beta','참가 동선','어디서 흐름이 끊기는가',[
        ['검증 근거','6명·8회 탐색·가입 과업 수행'],['다음 관찰','인증 전후 선택·복귀·참가 완료'],['제외 기준','운영·테스트 계정은 이용 지표에서 제외'],['다음 판단','막힌 단계의 상태 안내·복귀 경로 수정']
      ]],
      ['open-boundary','복구 행동','실패 후 스스로 이어가는가',[
        ['동작 근거','무료 참가 오류·재시도 자동 QA'],['다음 관찰','안내 이해·재시도·대안 선택'],['다음 판단','상태 오해 시 안내·행동 우선순위 수정']
      ]]
    ];
    definitions.forEach(([zone,label,title,items])=>{
      const card=slide.querySelector(`[data-zone="${zone}"]`);card.querySelector('header small').textContent=label;card.querySelector('header b').textContent=title;
      card.querySelector('ul').innerHTML=items.map(([name,copy])=>`<li data-status="not-measured"><span>${name}</span><b>${copy}</b></li>`).join('');
    });
    slide.querySelector('.fm-p1-release-map').setAttribute('aria-label','다음 검증의 관찰 기준과 수정 조건');
    slide.querySelector('.fm-p1-release-next>span').textContent='핵심 학습 · 다음 결정';
    slide.querySelector('.fm-p1-release-next dl').innerHTML=rows([['배운 점','연결 성공보다 선택·복귀·복구의 일관성'],['다음 기준','이용 기준값 확보 후 한 번에 하나의 가설 변경']]).replace(/^<dl[^>]*>|<\/dl>$/g,'');
  }
  window.installFootMateDecisionEvidence=function(slides){
    // Three representative decisions share one evidence chain: alternative → choice → limit.
    slides[4].querySelector('.fm-next-cs-decision').innerHTML='<span>핵심 결정 01 · 인증 시점</span>'+rows([
      ['대안','가입 먼저 · 가치 확인 전 계정 생성'],['선택','추천·상세 공개 · 참가 요청 직전 인증'],['제약','첫 추천은 지역·포지션·레벨 설정 필요 · 기기 간 연속성 제한']
    ])+link('docs/SERVICE-PLANNING-EVIDENCE.md','인증 시점 근거');
    recommendation(slides[5]);recovery(slides[9]);architecture(slides[10]);validation(slides[11]);nextDecisions(slides[12]);
    const proof=slides[0].querySelector('.fm-next-cover-proof>div:last-child');proof.querySelector('b').textContent='대표 결정 · 3가지';proof.querySelector('span').innerHTML='가치 확인 후 인증 · 이유로 추천 판단<br>선택을 보존한 실패 복구';
    slides[2].querySelector('.fm-p1-jtbd-caveat').innerHTML='iOS 4명 · Android 2명 · 일부 복수 과업 · Persona 대표성은 미검증 '+link('docs/USER-TEST-EVIDENCE.md','과업 기록');
    document.documentElement.dataset.fmDecisionEvidence='true';
  };
})();
