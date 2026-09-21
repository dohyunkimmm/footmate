export const BETA_BACKEND_CONFIG_ENDPOINT='/api/beta-config';
export const BETA_CONFIG_TIMEOUT_MS=5000;
export const BETA_REQUEST_TIMEOUT_MS=8000;

export class SupabaseBetaError extends Error{
  constructor(message,{status=0,code=null,details=null}={}){
    super(message);
    this.name='SupabaseBetaError';
    this.status=status;
    this.code=code;
    this.details=details;
  }
}

function nonEmpty(value,name){
  const text=String(value||'').trim();
  if(!text)throw new TypeError(`${name} is required`);
  return text;
}

function betaPosition(value){
  const position=String(value||'').trim().toUpperCase();
  if(!['MF','FW','DF','GK'].includes(position))throw new TypeError('position must be MF, FW, DF, or GK');
  return position;
}

function baseUrl(value){
  const url=new URL(nonEmpty(value,'Supabase URL'));
  return url.toString().replace(/\/$/,'');
}

function normalizedTimeout(value,fallback){
  const numeric=Number(value);
  return Number.isFinite(numeric)&&numeric>0?Math.max(50,Math.trunc(numeric)):fallback;
}

async function fetchWithTimeout(fetchImpl,url,options={},timeoutMs=BETA_REQUEST_TIMEOUT_MS){
  if(globalThis.navigator?.onLine===false){
    throw new SupabaseBetaError('인터넷 연결이 없습니다. 연결 후 다시 시도해주세요.',{code:'BETA_OFFLINE'});
  }
  const controller=typeof AbortController==='function'?new AbortController():null;
  const timeout=controller?setTimeout(()=>controller.abort(),normalizedTimeout(timeoutMs,BETA_REQUEST_TIMEOUT_MS)):null;
  try{
    return await fetchImpl(url,{...options,...(controller?{signal:controller.signal}:{})});
  }catch(error){
    if(controller?.signal.aborted||error?.name==='AbortError'){
      throw new SupabaseBetaError('요청 시간이 초과됐습니다. 네트워크 상태를 확인하고 다시 시도해주세요.',{code:'BETA_REQUEST_TIMEOUT'});
    }
    if(error instanceof SupabaseBetaError)throw error;
    throw new SupabaseBetaError('네트워크 연결을 확인해주세요.',{code:'BETA_NETWORK_ERROR',details:{cause:String(error?.message||error)}});
  }finally{
    if(timeout)clearTimeout(timeout);
  }
}

async function parseBody(response){
  const contentType=String(response.headers?.get?.('content-type')||'');
  if(contentType.includes('application/json')){
    try{return await response.json()}catch{return null}
  }
  const text=await response.text();
  return text||null;
}

function errorMessage(payload,status){
  if(payload&&typeof payload==='object'){
    return String(payload.msg||payload.message||payload.error_description||payload.error||`Supabase request failed (${status})`);
  }
  return String(payload||`Supabase request failed (${status})`);
}

function clampLimit(value){
  const numeric=Number(value);
  if(!Number.isFinite(numeric))return 20;
  return Math.max(1,Math.min(50,Math.trunc(numeric)));
}

const MATCH_SELECT=[
  'id','title','venue_name','area_label','address','region','level','starts_at','price_krw',
  'capacity_total','joined_count','remaining_spots','format_label','surface','duration_minutes','status',
  'match_slots(position,capacity_total,joined_count,remaining_spots)'
].join(',');
const OPERATOR_MATCH_SELECT=`${MATCH_SELECT},created_by,created_at,updated_at`;

export async function loadBetaBackendConfig({fetchImpl=globalThis.fetch,endpoint=BETA_BACKEND_CONFIG_ENDPOINT,timeoutMs=BETA_CONFIG_TIMEOUT_MS}={}){
  if(typeof fetchImpl!=='function')throw new TypeError('fetch implementation is required');
  const response=await fetchWithTimeout(fetchImpl,endpoint,{headers:{accept:'application/json'},cache:'no-store'},normalizedTimeout(timeoutMs,BETA_CONFIG_TIMEOUT_MS));
  const payload=await parseBody(response);
  if(!response.ok||!payload?.connected){
    throw new SupabaseBetaError(errorMessage(payload,response.status),{
      status:response.status,
      code:payload?.code||'BETA_BACKEND_UNAVAILABLE',
      details:payload
    });
  }
  return Object.freeze({
    url:nonEmpty(payload.url,'Supabase URL'),
    publishableKey:nonEmpty(payload.publishableKey,'Supabase publishable key')
  });
}

export function createSupabaseBetaClient({url,publishableKey,fetchImpl=globalThis.fetch,requestTimeoutMs=BETA_REQUEST_TIMEOUT_MS}){
  if(typeof fetchImpl!=='function')throw new TypeError('fetch implementation is required');
  const origin=baseUrl(url);
  const apiKey=nonEmpty(publishableKey,'Supabase publishable key');
  const timeoutMs=normalizedTimeout(requestTimeoutMs,BETA_REQUEST_TIMEOUT_MS);

  async function request(path,{method='GET',accessToken=null,body,headers={}}={}){
    const requestHeaders={apikey:apiKey,accept:'application/json',...headers};
    if(accessToken)requestHeaders.authorization=`Bearer ${accessToken}`;
    if(body!==undefined)requestHeaders['content-type']='application/json';
    const response=await fetchWithTimeout(fetchImpl,`${origin}${path}`,{
      method,
      headers:requestHeaders,
      body:body===undefined?undefined:JSON.stringify(body),
      cache:'no-store'
    },timeoutMs);
    const payload=await parseBody(response);
    if(!response.ok){
      throw new SupabaseBetaError(errorMessage(payload,response.status),{
        status:response.status,
        code:payload?.code||payload?.error_code||null,
        details:payload
      });
    }
    return payload;
  }

  const auth=Object.freeze({
    signUp:({email,password,displayName=''})=>request('/auth/v1/signup',{
      method:'POST',
      body:{email:nonEmpty(email,'email'),password:nonEmpty(password,'password'),data:{display_name:String(displayName||'').trim()}}
    }),
    signIn:({email,password})=>request('/auth/v1/token?grant_type=password',{
      method:'POST',
      body:{email:nonEmpty(email,'email'),password:nonEmpty(password,'password')}
    }),
    refresh:({refreshToken})=>request('/auth/v1/token?grant_type=refresh_token',{
      method:'POST',
      body:{refresh_token:nonEmpty(refreshToken,'refresh token')}
    }),
    getUser:({accessToken})=>request('/auth/v1/user',{accessToken:nonEmpty(accessToken,'access token')}),
    signOut:({accessToken})=>request('/auth/v1/logout',{method:'POST',accessToken:nonEmpty(accessToken,'access token')})
  });

  const matches=Object.freeze({
    list:({region=null,limit=20}={})=>{
      const query=new URLSearchParams();
      query.set('select',MATCH_SELECT);
      query.set('status','in.(open,full)');
      query.set('starts_at',`gt.${new Date().toISOString()}`);
      if(region)query.set('region',`eq.${String(region).trim()}`);
      query.set('order','starts_at.asc');
      query.set('limit',String(clampLimit(limit)));
      return request(`/rest/v1/matches?${query}`);
    },
    get:({matchId})=>{
      const query=new URLSearchParams();
      query.set('select',MATCH_SELECT);
      query.set('id',`eq.${nonEmpty(matchId,'match id')}`);
      query.set('limit','1');
      return request(`/rest/v1/matches?${query}`).then(rows=>Array.isArray(rows)?rows[0]||null:null);
    }
  });

  const profile=Object.freeze({
    get:({accessToken,userId})=>{
      const query=new URLSearchParams();
      query.set('select','id,display_name,region,position,level,created_at,updated_at');
      query.set('id',`eq.${nonEmpty(userId,'user id')}`);
      query.set('limit','1');
      return request(`/rest/v1/profiles?${query}`,{accessToken:nonEmpty(accessToken,'access token')})
        .then(rows=>Array.isArray(rows)?rows[0]||null:null);
    },
    update:({accessToken,userId,changes={}})=>{
      const allowed=['display_name','region','position','level'];
      const body=Object.fromEntries(allowed.filter(key=>Object.prototype.hasOwnProperty.call(changes,key)).map(key=>[key,changes[key]]));
      const query=new URLSearchParams();
      query.set('id',`eq.${nonEmpty(userId,'user id')}`);
      return request(`/rest/v1/profiles?${query}`,{
        method:'PATCH',
        accessToken:nonEmpty(accessToken,'access token'),
        body,
        headers:{prefer:'return=representation'}
      }).then(rows=>Array.isArray(rows)?rows[0]||null:null);
    }
  });

  const participation=Object.freeze({
    listMine:({accessToken})=>{
      const query=new URLSearchParams();
      query.set('select','id,match_id,position,status,joined_at,canceled_at,created_at,updated_at');
      query.set('order','created_at.desc');
      return request(`/rest/v1/participations?${query}`,{accessToken:nonEmpty(accessToken,'access token')});
    },
    join:({accessToken,matchId,position})=>request('/rest/v1/rpc/join_match_position',{
      method:'POST',
      accessToken:nonEmpty(accessToken,'access token'),
      body:{p_match_id:nonEmpty(matchId,'match id'),p_position:betaPosition(position)}
    }).then(rows=>Array.isArray(rows)?rows[0]||null:rows),
    cancel:({accessToken,matchId})=>request('/rest/v1/rpc/cancel_participation',{
      method:'POST',
      accessToken:nonEmpty(accessToken,'access token'),
      body:{p_match_id:nonEmpty(matchId,'match id')}
    }).then(rows=>Array.isArray(rows)?rows[0]||null:rows)
  });

  const operator=Object.freeze({
    self:({accessToken})=>{
      const query=new URLSearchParams();
      query.set('select','user_id,created_at');
      query.set('limit','1');
      return request(`/rest/v1/operators?${query}`,{accessToken:nonEmpty(accessToken,'access token')})
        .then(rows=>Array.isArray(rows)?rows[0]||null:null);
    },
    listMatches:({accessToken,limit=50})=>{
      const query=new URLSearchParams();
      query.set('select',OPERATOR_MATCH_SELECT);
      query.set('order','starts_at.desc');
      query.set('limit',String(clampLimit(limit)));
      return request(`/rest/v1/matches?${query}`,{accessToken:nonEmpty(accessToken,'access token')});
    },
    saveMatch:({accessToken,match})=>{
      const slots=Array.isArray(match?.slots)?match.slots:[];
      return request('/rest/v1/rpc/operator_save_match',{
        method:'POST',
        accessToken:nonEmpty(accessToken,'access token'),
        body:{
          p_match_id:match?.id||null,
          p_title:String(match?.title||'').trim(),
          p_venue_name:String(match?.venueName||'').trim(),
          p_area_label:String(match?.areaLabel||'').trim()||null,
          p_address:String(match?.address||'').trim(),
          p_region:String(match?.region||'').trim(),
          p_level:String(match?.level||'').trim()||null,
          p_starts_at:nonEmpty(match?.startsAt,'match start'),
          p_capacity_total:Number(match?.capacityTotal||0),
          p_format_label:String(match?.formatLabel||'').trim()||null,
          p_surface:String(match?.surface||'').trim()||null,
          p_duration_minutes:Number(match?.durationMinutes||0),
          p_status:String(match?.status||'draft').trim(),
          p_slots:slots.map(slot=>({position:betaPosition(slot.position),capacity_total:Number(slot.capacityTotal||0)}))
        }
      }).then(rows=>Array.isArray(rows)?rows[0]||null:rows);
    },
    cancelMatch:({accessToken,matchId})=>request('/rest/v1/rpc/operator_cancel_match',{
      method:'POST',
      accessToken:nonEmpty(accessToken,'access token'),
      body:{p_match_id:nonEmpty(matchId,'match id')}
    }).then(rows=>Array.isArray(rows)?rows[0]||null:rows),
    listParticipants:async({accessToken,matchId})=>{
      const token=nonEmpty(accessToken,'access token');
      const query=new URLSearchParams();
      query.set('select','id,match_id,user_id,position,status,joined_at,canceled_at,created_at,updated_at');
      query.set('match_id',`eq.${nonEmpty(matchId,'match id')}`);
      query.set('status','eq.confirmed');
      query.set('order','joined_at.asc');
      const rows=await request(`/rest/v1/participations?${query}`,{accessToken:token});
      const participations=Array.isArray(rows)?rows:[];
      const ids=[...new Set(participations.map(item=>String(item.user_id||'')).filter(Boolean))];
      if(!ids.length)return [];
      const profilesQuery=new URLSearchParams();
      profilesQuery.set('select','id,display_name,region,position,level');
      profilesQuery.set('id',`in.(${ids.join(',')})`);
      const profiles=await request(`/rest/v1/profiles?${profilesQuery}`,{accessToken:token});
      const byId=new Map((Array.isArray(profiles)?profiles:[]).map(item=>[item.id,item]));
      return participations.map(item=>({...item,profile:byId.get(item.user_id)||null}));
    },
    cancelParticipant:({accessToken,matchId,userId})=>request('/rest/v1/rpc/operator_cancel_participant',{
      method:'POST',
      accessToken:nonEmpty(accessToken,'access token'),
      body:{p_match_id:nonEmpty(matchId,'match id'),p_user_id:nonEmpty(userId,'user id')}
    }).then(rows=>Array.isArray(rows)?rows[0]||null:rows)
  });

  return Object.freeze({origin,auth,matches,profile,participation,operator});
}