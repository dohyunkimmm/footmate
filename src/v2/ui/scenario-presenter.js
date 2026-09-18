const OWNED_SCREENS=new Set(['s-filter','s-results','s-reason']);

function setText(id,value){
  const element=document.getElementById(id);
  if(element)element.textContent=value;
  return element;
}

function skillLabel(value){
  return window.FootMateCore?.skillLabel?.(value)||String(value??'');
}

function renderFilter(state){
  const profile=state?.profile||{};
  document.querySelectorAll('#s-filter [data-time-key]').forEach(button=>{
    const active=button.dataset.timeKey===profile.time;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('#s-filter [data-skill-key]').forEach(button=>{
    const active=Number(button.dataset.skillKey)===Number(profile.matchSkill);
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('#s-filter [data-format-key]').forEach(button=>{
    const active=button.dataset.formatKey===profile.format;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });

  const distance=document.getElementById('distanceRange');
  if(distance&&Number.isFinite(Number(profile.distanceKm))){
    distance.value=String(profile.distanceKm);
    distance.setAttribute('aria-valuenow',String(profile.distanceKm));
    distance.setAttribute('aria-valuetext',`${profile.distanceKm}km`);
  }
  if(profile.distanceKm!=null)setText('distanceVal',String(profile.distanceKm));
}

function resultCards(){
  const cards={};
  document.querySelectorAll('#s-results [data-match-card]').forEach(card=>{
    cards[card.dataset.matchCard]=card;
  });
  return cards;
}

let resultEndMarker=null;
function getResultEndMarker(holder,cards){
  if(resultEndMarker?.isConnected)return resultEndMarker;
  resultEndMarker=document.createComment('v2-result-end');
  const values=Object.values(cards);
  const last=values.at(-1)||holder.lastChild;
  last?.after?.(resultEndMarker);
  if(!resultEndMarker.parentNode)holder.appendChild(resultEndMarker);
  return resultEndMarker;
}

function ensureEmptyBox(){
  let empty=document.getElementById('footmateRuntimeEmpty');
  if(empty)return empty;
  const content=document.querySelector('#s-results .pcnt');
  if(!content)return null;

  empty=document.createElement('div');
  empty.id='footmateRuntimeEmpty';
  const title=document.createElement('strong');
  title.textContent='선택한 조건에 맞는 경기가 없습니다.';
  const copy=document.createTextNode('날짜·시간·지역·거리·경기 방식·모집 포지션을 조정해 보세요.');
  const button=document.createElement('button');
  button.className='btn-secondary';
  button.type='button';
  button.style.marginTop='10px';
  button.textContent='필터 다시 설정';
  button.addEventListener('click',()=>window.goScreen?.('s-filter'));
  empty.append(title,copy,button);

  const first=content.querySelector('[data-match-card]');
  first?content.insertBefore(empty,first):content.prepend(empty);
  return empty;
}

function renderResults(state){
  const profile=state?.profile||{};
  const ranked=Array.isArray(state?.rankedMatches)?state.rankedMatches:[];
  const cards=resultCards();

  ranked.forEach((match,index)=>{
    const card=cards[match.key];
    if(!card)return;
    const eligible=Boolean(match.eligible);
    card.style.display=eligible?'':'none';
    card.setAttribute('aria-hidden',String(!eligible));

    setText(`result-pct-${match.key}`,`${match.pct}%`);
    setText(
      `result-elo-diff-${match.key}`,
      `ELO 차이 ${match.eloDiff} · ${(match.positions||[]).join('/')} 모집 · ${skillLabel(profile.matchSkill)}`
    );

    const bar=document.getElementById(`result-skill-bar-${match.key}`);
    if(bar)bar.style.width=`${match.eloScore}%`;

    const badge=document.getElementById(`result-badge-${match.key}`);
    if(badge){
      badge.textContent=index===0&&eligible?'🥇 Best Match':eligible?'조건 일치':'조건 불일치';
      badge.className=`chip ${index===0&&eligible?'chip-blue':eligible?'chip-green':'chip-gray'}`;
    }

    const skill=card.querySelector('.result-chips .chip:first-child');
    if(skill){
      skill.textContent=match.eloDiff<=150?'실력 범위 ✓':`ELO 차이 ${match.eloDiff}`;
      skill.className=`chip ${match.eloDiff<=150?'chip-blue':'chip-orange'}`;
    }

    const position=match.key==='suwon'
      ?document.getElementById('scenario-slot-chip')
      :card.querySelector('.result-chips .chip:last-child');
    if(position){
      const positions=Array.isArray(match.positions)?match.positions:[];
      position.textContent=positions.includes(profile.position)
        ?`${profile.position} 1자리`
        :`${positions.join('/')} 모집`;
    }
  });

  const holder=Object.values(cards)[0]?.parentElement;
  if(holder){
    const marker=getResultEndMarker(holder,cards);
    ranked.forEach(match=>{
      if(cards[match.key])holder.insertBefore(cards[match.key],marker);
    });
  }

  const eligible=ranked.filter(match=>match.eligible);
  const banner=document.querySelector('#s-results .results-ai-banner');
  if(banner){
    const elo=Number(state?.elo);
    banner.textContent=eligible.length
      ?`조건에 맞는 팀 ${eligible.length}개 · 현재 ELO ${Number.isFinite(elo)?elo.toLocaleString():'-'} 기반 정렬`
      :'현재 조건에 맞는 경기가 없습니다.';
  }

  const empty=ensureEmptyBox();
  if(empty)empty.style.display=eligible.length?'none':'';
}

function renderReason(state){
  const match=state?.selectedScenario;
  if(!match)return;
  const currentElo=Number(state?.elo);
  setText('reasonMatchTitle',match.team||'');
  setText('reasonMatchPct',`왜 ${match.pct}% 매칭인가요?`);
  setText('reasonEloScore',`${match.eloScore}점`);
  setText('reasonStyleScore',`${match.styleScore}점`);
  setText('reasonLocationScore',`${match.locationScore}점`);
  setText(
    'reasonEloDesc',
    `현재 ELO ${Number.isFinite(currentElo)?currentElo.toLocaleString():'-'} ↔ 팀 평균 ${Number(match.avgElo).toLocaleString()} · 차이 ${match.eloDiff}`
  );
  setText('reasonStyleDesc',match.styleDesc||'');
  setText('reasonLocationDesc',match.locationDesc||'');
}

export function createScenarioPresenter(){
  function owns(screenId){
    return OWNED_SCREENS.has(screenId);
  }

  function render(screenId,state){
    if(screenId==='s-filter')renderFilter(state);
    if(screenId==='s-results')renderResults(state);
    if(screenId==='s-reason')renderReason(state);
    return state;
  }

  return{
    architecture:'v2.3-scenario-presenter',
    ownedScreens:[...OWNED_SCREENS],
    owns,
    render
  };
}
