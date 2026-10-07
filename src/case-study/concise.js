/* Seven decisions, one message and one representative visual per section. */
(function(){
  const source='https://github.com/dohyunkimmm/footmate/blob/aee56e7360cadbf8f31fe9b1d434c1ff0444e8bc/';
  const pages=[
    {nav:'Overview',sub:'Experience & Role'},
    {nav:'Problem',sub:'The Decision Gap',kicker:'문제 정의',title:'경기를 찾는 것보다,\n나에게 맞는지 판단하기 어려웠습니다.',lead:'시간과 가격만으로는 경기 수준과 내 역할을 알기 어렵습니다. FootMate는 참가 전 판단에 필요한 정보를 모으는 데서 시작했습니다.',note:'풋살 서비스 분석을 바탕으로 세운 설계 가설입니다.',visual:'problem'},
    {nav:'Explore First',sub:'Value Before Sign-in',kicker:'결정 01 · 진입 순서',title:'가입보다 먼저,\n참가할 이유를 보여줍니다.',lead:'처음 방문한 사람도 추천과 상세를 볼 수 있게 했습니다. 참가를 선택한 순간에 로그인하고, 고른 경기로 돌아오도록 설계했습니다.',note:'회원가입을 먼저 요구하는 대안보다, 경기의 가치를 먼저 확인하는 흐름을 택했습니다.',visual:'entry'},
    {nav:'Recommendation & AI',sub:'Interpret, Then Explain',kicker:'결정 02 · 추천의 역할',title:'AI는 조건을 이해하고,\n추천은 이유로 설득합니다.',lead:'자연어를 경기 조건으로 바꾸되, 순위는 규칙 기반 엔진이 결정합니다. 가까운 거리와 맞는 포지션처럼 사용자가 판단할 이유를 보여줍니다.',note:'AI 해석이 실패하면 조건을 직접 선택할 수 있습니다. 실제 경기와 잔여 자리는 샘플 데이터입니다.',visual:'recommendation'},
    {nav:'Join & Recover',sub:'Keep the Choice',kicker:'결정 03 · 참가와 복구',title:'참가가 실패해도,\n선택은 잃지 않게 합니다.',lead:'로그인 후에도 선택한 경기를 유지하고, 무료 참가를 직접 확인하게 했습니다. 실패하면 오류 안내와 함께 다시 시도할 수 있도록 버튼을 복원했습니다.',note:'실제 결제는 이번 범위에서 제외했습니다. 체험 앱의 참가 기록은 브라우저에 저장됩니다.',visual:'recovery'},
    {nav:'After the Match',sub:'Complete, Then Return',kicker:'경험의 연결',title:'참가 완료 뒤에도,\n다음 행동이 이어집니다.',lead:'경기 전 준비와 체크인, 경기 후 피드백은 MY에서 이어집니다. 평가를 저장하면 Home이 완료를 반영하고 다음 경기 찾기를 안내합니다.',note:'평가 후에도 피드백 안내가 남던 문제를 수정하고, 저장 → 완료 안내 → 재탐색을 다시 검증했습니다.',visual:'return'},
    {nav:'Validation & Learning',sub:'Evidence & Next Step',kicker:'검증과 학습',title:'동작을 확인한 것과,\n가치를 입증한 것은 다릅니다.',lead:'교육생 6명의 탐색·가입 과업과 자동 QA로 흐름을 확인했습니다. 추천이 실제 선택에 도움이 되는지와 재이용 성과는 다음 검증으로 남겼습니다.',note:'다음 검증 · 추천 이유를 보고 경기를 선택할 수 있는지, 실제 과업 관찰과 상세 → 참가 전환으로 확인합니다.',visual:'validation'}
  ];
  const label=n=>String(n).padStart(2,'0');
  const screen=(file,caption,alt)=>`<figure class="fm-concise-screen"><div class="fm-concise-screen-media ${file==='recommendation-home.png'?'is-landscape':''}"><img src="/src/case-study/evidence/${file}" alt="${alt}" loading="lazy" width="${file==='recommendation-home.png'?1440:390}" height="${file==='recommendation-home.png'?900:844}"></div><figcaption>${caption} · 기존 제품 화면 기준</figcaption></figure>`;
  const visuals={
    problem:`<div class="fm-concise-panel fm-concise-problem"><span class="fm-concise-eyebrow">판단에 필요한 세 가지</span><ol><li><span>01</span><div><b>내 수준에 맞는가</b><p>경기 레벨과 강도를 확인</p></div></li><li><span>02</span><div><b>내가 뛸 자리가 있는가</b><p>포지션과 남은 자리로 판단</p></div></li><li><span>03</span><div><b>참가 후 무엇을 해야 하는가</b><p>준비·체크인·경기 후 행동 연결</p></div></li></ol><p class="fm-concise-panel-foot">설계 목표 · 탐색에서 참가까지 판단의 공백 줄이기</p></div>`,
    entry:`<div class="fm-concise-panel fm-concise-entry"><span class="fm-concise-eyebrow">선택을 유지하는 참가 흐름</span><ol><li><span>01</span><div><b>추천 · 상세 탐색</b><p>로그인 없이 경기의 가치 확인</p></div><em>공개</em></li><li><span>02</span><div><b>참가할 경기 선택</b><p>일정·수준·자리·정책 확인</p></div></li><li><span>03</span><div><b>로그인 후 참가 확인</b><p>선택한 경기로 복귀해 직접 확정</p></div><em>인증</em></li></ol><a class="fm-concise-link" href="/demo">직접 흐름 체험하기 ↗</a></div>`,
    recommendation:screen('recommendation-home.png','추천 홈','FootMate 추천 홈: 자연어 탐색과 추천 이유'),
    recovery:`<div class="fm-concise-panel fm-concise-recovery"><span class="fm-concise-eyebrow">실제 수정 · 참가 실패 복구</span><div class="fm-concise-before"><small>수정 전</small><h3>참가 버튼이 처리 중에 멈춤</h3><p>경기 정보가 없을 때 다음 행동을 할 수 없었습니다.</p></div><span class="fm-concise-change" aria-hidden="true">↓</span><div class="fm-concise-after"><small>수정 후</small><h3>안내를 읽고 다시 선택</h3><p>오류를 안내하고 버튼을 활성화해 재시도와 다른 경기 선택을 열었습니다.</p></div><a class="fm-concise-link" href="https://github.com/dohyunkimmm/footmate/pull/442" target="_blank" rel="noopener">수정 기록 보기 ↗</a></div>`,
    return:screen('operations-matchday.png','MY · 경기 전후 안내','FootMate MY: 경기 준비와 체크인, 경기 후 행동 안내'),
    validation:`<div class="fm-concise-panel fm-concise-validation"><span class="fm-concise-eyebrow">확인한 범위</span><dl><div><dt>과업 확인</dt><dd><strong>6명</strong><p>교육생 대상 탐색·가입 동선 확인<br>대표 이용자 집단의 성과 검증은 아님</p></dd></div><div><dt>수정·재검증</dt><dd><b>실패 복구 · 평가 후 재탐색</b><p>오류 후 참가 성공과 완료 후 다음 화면 확인</p></dd></div></dl><a class="fm-concise-link" href="${source}tests/e2e/release-app.spec.cjs" target="_blank" rel="noopener">동작 검증 근거 보기 ↗</a></div>`
  };
  const slides=[...document.querySelectorAll('.track>.slide')];
  slides.forEach((slide,index)=>{
    slide.dataset.pageNumber=String(index+1);
    if(!index)return;
    const p=pages[index];
    slide.classList.add('fm-concise-slide');
    slide.innerHTML=`<div class="fm-concise-layout"><div class="fm-concise-copy"><span class="fm-concise-kicker">${label(index+1)} · ${p.kicker}</span><h2>${p.title.split('\n').map(line=>`<span>${line}</span>`).join('')}</h2><p class="fm-concise-lead">${p.lead}</p><p class="fm-concise-note">${p.note}</p></div><div class="fm-concise-visual">${visuals[p.visual]}</div></div>`;
  });
  document.querySelectorAll('.toc-item').forEach((item,index)=>{
    item.querySelector('.toc-n').textContent=label(index+1);
    item.querySelector('.toc-t').textContent=pages[index].nav;
    item.querySelector('.toc-s').textContent=pages[index].sub;
    item.setAttribute('aria-label',`${label(index+1)} · ${pages[index].nav} · ${pages[index].sub}`);
  });
  const controls=[document.querySelector('.btn-prev'),document.querySelector('.btn-next')];
  controls.forEach((button,i)=>button.innerHTML=`<span class="fm-control-arrow" aria-hidden="true">${i?'→':'←'}</span><span class="fm-control-destination"><small></small><b></b></span>`);
  const update=()=>{
    const current=slides.findIndex(s=>s.classList.contains('on'));
    if(current<0)return;
    controls.forEach((button,i)=>{
      const target=current+(i?1:-1);
      const title=pages[Math.max(0,Math.min(pages.length-1,target))].nav;
      const hint=target<0?'첫 섹션':target>=pages.length?'마지막 섹션':i?'다음 섹션':'이전 섹션';
      button.querySelector('small').textContent=hint;button.querySelector('b').textContent=title;
      button.setAttribute('aria-label',`${hint} · ${title}`);
    });
  };
  new MutationObserver(update).observe(document.querySelector('.track'),{subtree:true,attributes:true,attributeFilter:['class']});
  update();
  document.documentElement.dataset.fmConciseReady='true';
})();
