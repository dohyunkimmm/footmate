import {cleanSyncPreferences} from '../preference-sync.js?v=2';
import {matchesRecommendationConditions} from './recommendation-discovery.js';

export const MAX_PRESETS=3;
export const MAX_KNOWN_MATCHES=200;

export function discoveryPresetKey(demo,userId){
  return demo?'footmate:beta:presets:v1:demo':userId?'footmate:beta:presets:v1:'+userId:'';
}

export function readDiscoveryPresets(storage,key){
  if(!key)return [];
  try{
    const rows=JSON.parse(storage.getItem(key)||'[]');
    if(!Array.isArray(rows))return [];
    return rows.flatMap(row=>{
      const conditions=cleanSyncPreferences(row?.conditions);
      if(!conditions||!Array.isArray(row.knownIds))return [];
      return [{conditions,knownIds:row.knownIds.filter(id=>typeof id==='string').slice(0,MAX_KNOWN_MATCHES)}];
    }).slice(0,MAX_PRESETS);
  }catch{return []}
}

export function eligibleMatch(match,conditions,now=Date.now()){
  return matchesRecommendationConditions({
    ...match,remaining_spots:match.remaining,starts_at:match.startsAt,price_krw:match.price,
    positions:Object.keys(match.positionSlots),
    match_slots:Object.entries(match.positionSlots).map(([position,remaining_spots])=>({position,remaining_spots}))
  },conditions,now);
}

export function unseenPresetMatches(matches,preset,now=Date.now()){
  const known=new Set(preset.knownIds);
  return matches.filter(match=>!known.has(match.id)&&eligibleMatch(match,preset.conditions,now));
}

function comparable(value){return String(value||'').normalize('NFC').trim().replace(/\s+/g,' ').toLowerCase()}

export function nextAtVenue(matches,previous,conditions,excludedIds,now=Date.now()){
  const venue=comparable(previous.place),region=comparable(previous.region),address=comparable(previous.address);
  if(!venue||!region||previous.isDemo||previous.status!=='completed')return null;
  return matches.filter(match=>!match.isDemo&&!excludedIds.has(match.id)&&comparable(match.place)===venue
    &&comparable(match.region)===region&&comparable(match.address)===address
    &&eligibleMatch(match,conditions,now)).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt))[0]||null;
}
