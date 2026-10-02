const POSITIONS=Object.freeze(['MF','FW','DF','GK']);
const LEVELS=new Set(['입문','초중급','중급','중급+']);

function text(value,fallback=''){
  const normalized=String(value??'').trim();
  return normalized||fallback;
}

function integer(value,{min=0,fallback=0}={}){
  const numeric=Number(value);
  if(!Number.isFinite(numeric))return fallback;
  return Math.max(min,Math.trunc(numeric));
}

function iso(value){
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))throw new TypeError('starts_at must be a valid timestamp');
  return date.toISOString();
}

function normalizeSlots(rows=[]){
  const source=Array.isArray(rows)?rows:[];
  const slots=Object.fromEntries(POSITIONS.map(position=>[position,0]));
  for(const row of source){
    const position=text(row?.position).toUpperCase();
    if(!POSITIONS.includes(position))continue;
    slots[position]=integer(row?.remaining_spots,{min:0,fallback:0});
  }
  return Object.freeze(slots);
}

export function normalizeBetaMatch(row={}){
  const id=text(row.id);
  const title=text(row.title);
  const venueName=text(row.venue_name);
  const region=text(row.region);
  const level=text(row.level);
  if(!id)throw new TypeError('match id is required');
  if(!title)throw new TypeError('match title is required');
  if(!venueName)throw new TypeError('venue_name is required');
  if(!region)throw new TypeError('match region is required');
  if(!LEVELS.has(level))throw new TypeError('match level is invalid');

  const capacity=integer(row.capacity_total,{min:1,fallback:1});
  const joined=Math.min(integer(row.joined_count,{min:0,fallback:0}),capacity);
  const remaining=Math.min(integer(row.remaining_spots,{min:0,fallback:capacity-joined}),capacity);
  const durationMin=integer(row.duration_minutes,{min:1,fallback:0});
  if(durationMin<30||durationMin>240)throw new TypeError('duration_minutes is invalid');

  return Object.freeze({
    id,
    title,
    place:venueName,
    area:text(row.area_label,region),
    address:text(row.address),
    region,
    level,
    startsAt:iso(row.starts_at),
    price:integer(row.price_krw,{min:0,fallback:0}),
    capacity,
    joined,
    remaining,
    positionSlots:normalizeSlots(row.match_slots),
    format:text(row.format_label),
    surface:text(row.surface),
    durationMin,
    status:text(row.status),
    source:'connected-beta'
  });
}

export function normalizeBetaMatches(rows=[]){
  if(!Array.isArray(rows))throw new TypeError('match rows must be an array');
  return Object.freeze(rows.map(normalizeBetaMatch));
}

export const BETA_MATCH_POSITIONS=POSITIONS;
