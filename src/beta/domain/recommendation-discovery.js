// Explicit filters are authoritative; discovery never relaxes them.
export function matchesRecommendationConditions(match,conditions={},now=Date.now()){
  if(match.status!=='open'||Number(match.remaining_spots)<=0||!(new Date(match.starts_at).getTime()>now))return false;
  if(conditions.region&&match.region!==conditions.region)return false;
  if(conditions.level&&match.level!==conditions.level)return false;
  if(conditions.position){
    if(!(match.positions||[]).includes(conditions.position))return false;
    const slot=(match.match_slots||[]).find(item=>item.position===conditions.position);
    if(Number(slot?.remaining_spots||0)<=0)return false;
  }
  if(conditions.maxPrice!=null&&Number(match.price_krw||0)>conditions.maxPrice)return false;
  if(conditions.afterTime){
    const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(match.starts_at));
    if(time<conditions.afterTime)return false;
  }
  return true;
}

// Sample unseen candidates, favouring the supplied recommendation order.
// No AI/network request is needed for another draw.
export function pickUnseenRecommendation(ids,seen,random=Math.random){
  const choices=[...new Set(ids)].map((id,index)=>({id,weight:1/(index+1)})).filter(item=>!seen.has(item.id));
  if(!choices.length)return null;
  let target=random()*choices.reduce((total,item)=>total+item.weight,0);
  for(const item of choices){target-=item.weight;if(target<0)return item.id;}
  return choices.at(-1).id;
}
