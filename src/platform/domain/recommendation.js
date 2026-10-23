const LEVELS=Object.freeze(['입문','초중급','중급','중급+']);

function levelGap(a,b){
  const left=LEVELS.indexOf(a);
  const right=LEVELS.indexOf(b);
  if(left<0||right<0)return 3;
  return Math.abs(left-right);
}

function fitLabel(score){
  if(score>=90)return '지금 가장 잘 맞아요';
  if(score>=78)return '조건과 잘 맞아요';
  if(score>=64)return '함께 비교해볼 만해요';
  return '조건을 넓혀 볼 경기';
}

function distanceScore(minutes){
  if(minutes<=15)return 10;
  if(minutes<=20)return 8;
  if(minutes<=25)return 5;
  return 2;
}

function levelScore(gap){
  if(gap===0)return 25;
  if(gap===1)return 17;
  if(gap===2)return 8;
  return 0;
}

export function recommendationFor(match,state){
  const exactRegion=match.region===state.region;
  const gap=levelGap(match.level,state.level);
  const slotCount=Number(match.positionSlots?.[state.position]||0);
  const alternateAvailable=Object.entries(match.positionSlots||{}).some(([role,seats])=>role!==state.position&&Number(seats)>0);
  const score=(exactRegion?40:0)+levelScore(gap)+(slotCount>0?25:0)+distanceScore(match.distanceMin||99);
  const reasons=[];

  if(exactRegion)reasons.push({kind:'pin',title:'선호 생활권과 일치',detail:`${match.area} · 예시 이동 ${match.distanceMin}분`});
  else reasons.push({kind:'pin',title:'조건을 넓혀 함께 비교',detail:`${match.region} · 예시 이동 ${match.distanceMin}분`});

  if(slotCount>0)reasons.push({kind:'position',title:`${state.position} ${slotCount}자리 남음`,detail:'선호 포지션으로 바로 참가할 수 있습니다.'});
  else reasons.push({kind:'position',title:`${state.position} 자리는 현재 마감`,detail:alternateAvailable?'다른 포지션은 상세에서 직접 선택할 수 있습니다.':'참가 가능한 다른 포지션도 없습니다.'});

  if(gap===0)reasons.push({kind:'level',title:'체감 레벨이 정확히 맞아요',detail:`설정한 ${state.level} 강도와 같은 경기입니다.`});
  else if(gap===1)reasons.push({kind:'level',title:'한 단계 차이의 경기 강도',detail:`설정한 ${state.level}에서 무리 없이 비교할 수 있는 범위입니다.`});
  else reasons.push({kind:'level',title:'경기 강도 차이가 있어요',detail:`설정한 ${state.level}과 ${match.level} 사이의 차이를 확인해주세요.`});

  if(match.distanceMin<=15)reasons.push({kind:'clock',title:'이동 부담이 적어요',detail:`표시된 ${match.distanceMin}분은 경로 탐색이 아닌 샘플 이동시간입니다.`});

  const fit=gap>1?'경기 강도 차이 확인':slotCount<=0?'선호 포지션 마감':fitLabel(score);
  const fitTier=gap<=1&&slotCount>0?0:gap<=1?1:slotCount>0?2:3;
  return {match,score,exactRegion,slotCount,fit,fitTier,spotLabel:slotCount>0?`${state.position} ${slotCount}자리`:`${state.position} 0자리 · ${alternateAvailable?'다른 포지션 가능':'모든 자리 마감'}`,reasons};
}

export function rankRecommendations(matches,state){
  return [...matches].map(match=>recommendationFor(match,state)).sort((a,b)=>a.fitTier-b.fitTier||b.score-a.score||(a.match.distanceMin||99)-(b.match.distanceMin||99)||a.match.id.localeCompare(b.match.id));
}

// Explain player-to-match compatibility using catalog facts, never generated claims.
export function matchingAssessment(match,state){
  const item=recommendationFor(match,state);
  const strengths=[],cautions=[];
  (item.exactRegion?strengths:cautions).push(item.exactRegion?'선호 지역 일치':'선호 지역 밖의 대안');
  const gap=levelGap(match.level,state.level);
  (gap===0?strengths:cautions).push(gap===0?'설정한 경기 강도 일치':`경기 강도 ${gap}단계 차이`);
  (item.slotCount>0?strengths:cautions).push(item.slotCount>0?`${state.position} 참가 가능`:`${state.position} 자리 마감`);
  return {strengths,cautions};
}
