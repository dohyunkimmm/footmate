function cloneMatch(value={}){
  return{
    ...value,
    formats:Array.isArray(value.formats)?[...value.formats]:[],
    positions:Array.isArray(value.positions)?[...value.positions]:[],
    eligibility:{...(value.eligibility||{})}
  };
}

export function createMatchEngine(core){
  if(!core?.scoreMatch||!core?.rankMatches)throw new Error('FootMateCore matching API is required');

  function score({key,base,profile,eloState,weights}){
    const scored=core.scoreMatch(
      base||{},
      {...(profile||{})},
      eloState||{},
      weights||{elo:.5,style:.3,location:.2}
    );
    const positions=Array.isArray(scored.positions)?scored.positions:[];
    const requestedPosition=profile?.position||'';
    return{
      ...cloneMatch(scored),
      key:key||scored.key,
      positionFit:positions.includes(requestedPosition),
      availablePosition:positions.includes(requestedPosition)?requestedPosition:positions[0]||'',
      styleDesc:scored.timeKey===profile?.time?'선호 시간대와 일치':'선호 시간대와 차이',
      locationDesc:scored.eligibility?.region&&scored.eligibility?.distance
        ?`${scored.distanceKm}km · 선택 지역/거리 내`
        :`${scored.distanceKm}km · 선택 지역/거리 밖`
    };
  }

  function rank({matches,profile,eloState,weights}){
    const bases=matches||{};
    return core.rankMatches(bases,profile||{},eloState||{},weights)
      .map(item=>score({
        key:item.key,
        base:bases[item.key]||item,
        profile,
        eloState,
        weights
      }))
      .sort((a,b)=>{
        if(a.eligible!==b.eligible)return a.eligible?-1:1;
        if(b.pct!==a.pct)return b.pct-a.pct;
        return Number(a.distanceKm)-Number(b.distanceKm);
      });
  }

  function derive(snapshot={}){
    const rankedMatches=rank({
      matches:snapshot.matches,
      profile:snapshot.profile,
      eloState:snapshot.eloState||{currentElo:snapshot.elo,initialElo:snapshot.elo},
      weights:snapshot.weights
    });
    const matches=Object.fromEntries(rankedMatches.map(item=>[item.key,cloneMatch(item)]));
    const selectedMatchKey=matches[snapshot.selectedMatchKey]
      ?snapshot.selectedMatchKey
      :rankedMatches[0]?.key||snapshot.selectedMatchKey||null;

    return{
      ...snapshot,
      selectedMatchKey,
      matches,
      rankedMatches:rankedMatches.map(cloneMatch),
      selectedScenario:selectedMatchKey?cloneMatch(matches[selectedMatchKey]):null,
      eligibleCount:rankedMatches.filter(item=>item.eligible).length
    };
  }

  function parity(actual,expected){
    if(!actual||!expected)return false;
    return['eligible','pct','eloScore','styleScore','locationScore','eloDiff']
      .every(key=>actual[key]===expected[key]);
  }

  return{score,rank,derive,parity,architecture:'v2.1-domain-engine'};
}
