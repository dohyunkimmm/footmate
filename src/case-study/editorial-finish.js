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
      figure.append(caption,window);host.prepend(figure);
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
    document.documentElement.dataset.fmEditorialFinish='true';
  };
})();
