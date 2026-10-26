const SEOUL_HOUR=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',hour12:false});
const REACTIONS=new Set(['interested','different_time','too_far']);
export function normalizeReactions(rows,now=Date.now()){
 return (Array.isArray(rows)?rows:[]).filter(r=>r&&typeof r.matchId==='string'&&REACTIONS.has(r.kind)&&Number.isFinite(r.at)&&r.at<=now&&now-r.at<30*86400000).slice(-50);
}
export function personalizeRecommendations(matches,reactions){
 const valid=normalizeReactions(reactions);
 return matches.map((match,index)=>{
  let signal=0;
  const hour=SEOUL_HOUR.format(new Date(match.startsAt));
  for(const r of valid){
   if(r.scope&&r.scope!==(match.isDemo?'demo':'live'))continue;
   if(r.kind==='interested'&&r.venue===match.place)signal+=1;
   if(r.kind==='too_far'&&r.venue===match.place)signal-=1;
   if(r.kind==='different_time'&&r.hour===hour)signal-=1;
  }
  const weight=Math.max(-3,Math.min(3,signal));
  return {match,index,signal:weight,score:index-weight};
 }).sort((a,b)=>a.score-b.score||b.signal-a.signal||a.index-b.index).map(r=>r.match);
}
export function chooseOpeningVariant(value,stored,random=Math.random){
 if(value==='control'||value==='quick')return value;
 if(value==='compare')return ['control','quick'].includes(stored)?stored:random()<.5?'control':'quick';
 return 'control';
}
