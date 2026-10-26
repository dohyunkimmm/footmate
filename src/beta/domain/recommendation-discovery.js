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
  if(conditions.dateWindow){
    const day=value=>Math.floor((value+9*3600000)/86400000);
    const today=day(now),target=day(new Date(match.starts_at).getTime());
    if(conditions.dateWindow==='today'&&target!==today)return false;
    if(conditions.dateWindow==='tomorrow'&&target!==today+1)return false;
    if(conditions.dateWindow==='weekend'){
      const weekday=new Date(today*86400000).getUTCDay();
      const start=today+(weekday===0?0:(6-weekday+7)%7);
      const end=start+(weekday===0?1:2);
      if(target<start||target>=end)return false;
    }
  }
  if(conditions.afterTime||conditions.beforeTime){
    const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(match.starts_at));
    if(conditions.afterTime&&time<conditions.afterTime)return false;
    if(conditions.beforeTime&&time>=conditions.beforeTime)return false;
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

export const RECOMMENDATION_CACHE_TTL_MS=5*60*1000;
export function recommendationFingerprint(matches,preferences,now=Date.now()){
  const day=Math.floor((now+9*3600000)/86400000);
  return JSON.stringify({day,preferences,rows:matches.map(m=>[m.id,m.region,m.level,m.starts_at,m.status,m.remaining_spots,m.price_krw,m.format_label,m.venue_name,m.positions,(m.match_slots||[]).map(s=>[s.position,s.remaining_spots]).sort()]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))) });
}
export function validRecommendationCache(cache,fingerprint,now=Date.now()){
  return cache?.fingerprint===fingerprint&&Number.isFinite(cache.createdAt)&&now>=cache.createdAt&&now-cache.createdAt<RECOMMENDATION_CACHE_TTL_MS&&Array.isArray(cache.ids)&&cache.ids.length>0;
}
// Round robin across venues before sending a bounded shortlist to AI.
export function diverseRecommendationCandidates(rows,limit=12){
  const groups=new Map();
  for(const row of rows){const key=row.m.venue_name||row.m.region;const group=groups.get(key)||[];group.push(row);groups.set(key,group)}
  const result=[];
  while(result.length<limit){let added=false;for(const group of groups.values()){if(group.length){result.push(group.shift());added=true;if(result.length===limit)break}}if(!added)break}
  return result;
}
