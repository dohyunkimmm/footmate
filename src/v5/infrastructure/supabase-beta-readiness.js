const REQUEST_TIMEOUT_MS=8000;
const POSITIONS=new Set(['MF','FW','DF','GK']);

function required(value,name){
  const text=String(value??'').trim();
  if(!text)throw new TypeError(`${name} is required`);
  return text;
}

function timeout(value){
  const number=Number(value);
  return Number.isFinite(number)&&number>0?Math.max(100,Math.trunc(number)):REQUEST_TIMEOUT_MS;
}

async function parse(response){
  const type=String(response.headers?.get?.('content-type')||'');
  if(type.includes('application/json')){
    try{return await response.json()}catch{return null}
  }
  const text=await response.text();
  return text||null;
}

function message(payload,status){
  if(payload&&typeof payload==='object')return String(payload.message||payload.msg||payload.error_description||payload.error||`Supabase request failed (${status})`);
  return String(payload||`Supabase request failed (${status})`);
}

function position(value){
  const normalized=required(value,'position').toUpperCase();
  if(!POSITIONS.has(normalized))throw new TypeError('position must be MF, FW, DF, GK');
  return normalized;
}

export function createBetaReadinessClient({url,publishableKey,fetchImpl=globalThis.fetch,requestTimeoutMs=REQUEST_TIMEOUT_MS}){
  if(typeof fetchImpl!=='function')throw new TypeError('fetch implementation is required');
  const origin=new URL(required(url,'Supabase URL')).toString().replace(/\/$/,'');
  const apiKey=required(publishableKey,'Supabase publishable key');
  const timeoutMs=timeout(requestTimeoutMs);

  async function request(path,{method='GET',accessToken=null,body,headers={}}={}){
    const controller=typeof AbortController==='function'?new AbortController():null;
    const timer=controller?setTimeout(()=>controller.abort(),timeoutMs):null;
    const requestHeaders={apikey:apiKey,accept:'application/json',...headers};
    if(accessToken)requestHeaders.authorization=`Bearer ${accessToken}`;
    if(body!==undefined)requestHeaders['content-type']='application/json';
    try{
      const response=await fetchImpl(`${origin}${path}`,{
        method,
        headers:requestHeaders,
        body:body===undefined?undefined:JSON.stringify(body),
        cache:'no-store',
        ...(controller?{signal:controller.signal}:{})
      });
      const payload=await parse(response);
      if(!response.ok)throw new Error(message(payload,response.status));
      return payload;
    }catch(error){
      if(controller?.signal.aborted)throw new Error('요청 시간이 초과됐습니다. 네트워크 상태를 확인해주세요.');
      throw error;
    }finally{
      if(timer)clearTimeout(timer);
    }
  }

  async function dispatchNotificationEmail({accessToken,matchId=null,participationId=null}){
    const body={};
    if(matchId)body.match_id=required(matchId,'match id');
    if(participationId)body.participation_id=required(participationId,'participation id');
    return request('/functions/v1/send-beta-notification-email',{
      method:'POST',accessToken:required(accessToken,'access token'),body
    });
  }

  async function dispatchNotificationEmailBestEffort(args){
    try{return await dispatchNotificationEmail(args)}
    catch(error){
      console.warn('beta notification email dispatch deferred',String(error?.message||error));
      return null;
    }
  }

  function redirectPath(value){
    return required(value,'redirect URL');
  }

  const auth=Object.freeze({
    recover:({email,redirectTo})=>request(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectPath(redirectTo))}`,{
      method:'POST',body:{email:required(email,'email')}
    }),
    resendSignup:({email,redirectTo})=>request(`/auth/v1/resend?redirect_to=${encodeURIComponent(redirectPath(redirectTo))}`,{
      method:'POST',body:{type:'signup',email:required(email,'email')}
    }),
    updatePassword:({accessToken,password})=>request('/auth/v1/user',{
      method:'PUT',accessToken:required(accessToken,'access token'),body:{password:required(password,'password')}
    })
  });

  const matches=Object.freeze({
    get:({matchId,accessToken=null})=>{
      const query=new URLSearchParams();
      query.set('select','id,title,venue_name,area_label,address,region,level,starts_at,duration_minutes,status,cancel_cutoff_at,check_in_opens_at,capacity_total,joined_count,remaining_spots,match_slots(position,capacity_total,joined_count,remaining_spots)');
      query.set('id',`eq.${required(matchId,'match id')}`);
      query.set('limit','1');
      return request(`/rest/v1/matches?${query}`,{accessToken}).then(rows=>Array.isArray(rows)?rows[0]||null:null);
    }
  });

  const participation=Object.freeze({
    listMine:({accessToken})=>{
      const query=new URLSearchParams();
      query.set('select','id,match_id,user_id,position,status,joined_at,canceled_at,checked_in_at,created_at,updated_at');
      query.set('order','created_at.desc');
      return request(`/rest/v1/participations?${query}`,{accessToken:required(accessToken,'access token')});
    },
    checkIn:async({accessToken,matchId})=>{
      const token=required(accessToken,'access token');
      const id=required(matchId,'match id');
      const result=await request('/rest/v1/rpc/check_in_participation',{
        method:'POST',accessToken:token,body:{p_match_id:id}
      }).then(rows=>Array.isArray(rows)?rows[0]||null:rows);
      await dispatchNotificationEmailBestEffort({accessToken:token,participationId:result?.participation_id||null,matchId:id});
      return result;
    }
  });

  const notifications=Object.freeze({
    listMine:async({accessToken,limit=20})=>{
      const token=required(accessToken,'access token');
      await dispatchNotificationEmailBestEffort({accessToken:token});
      const query=new URLSearchParams();
      query.set('select','id,event_type,match_id,participation_id,title,body,read_at,created_at');
      query.set('order','created_at.desc');
      query.set('limit',String(Math.max(1,Math.min(50,Number(limit)||20))));
      return request(`/rest/v1/beta_notifications?${query}`,{accessToken:token});
    },
    markRead:({accessToken,notificationId})=>request('/rest/v1/rpc/mark_beta_notification_read',{
      method:'POST',accessToken:required(accessToken,'access token'),body:{p_notification_id:Number(notificationId)}
    }).then(rows=>Array.isArray(rows)?rows[0]||null:rows),
    dispatchEmail:args=>dispatchNotificationEmailBestEffort(args)
  });

  const operator=Object.freeze({
    saveMatch:({accessToken,match})=>{
      const slots=Array.isArray(match?.slots)?match.slots:[];
      return request('/rest/v1/rpc/operator_save_match_v2',{
        method:'POST',accessToken:required(accessToken,'access token'),body:{
          p_match_id:match?.id||null,
          p_title:String(match?.title||'').trim(),
          p_venue_name:String(match?.venueName||'').trim(),
          p_area_label:String(match?.areaLabel||'').trim()||null,
          p_address:String(match?.address||'').trim(),
          p_region:String(match?.region||'').trim(),
          p_level:String(match?.level||'').trim()||null,
          p_starts_at:required(match?.startsAt,'match start'),
          p_cancel_cutoff_at:match?.cancelCutoffAt||null,
          p_check_in_opens_at:match?.checkInOpensAt||null,
          p_capacity_total:Number(match?.capacityTotal||0),
          p_format_label:String(match?.formatLabel||'').trim()||null,
          p_surface:String(match?.surface||'').trim()||null,
          p_duration_minutes:Number(match?.durationMinutes||0),
          p_status:String(match?.status||'draft').trim(),
          p_slots:slots.map(slot=>({position:position(slot.position),capacity_total:Number(slot.capacityTotal||0)}))
        }
      }).then(rows=>Array.isArray(rows)?rows[0]||null:rows);
    },
    checkInParticipant:async({accessToken,matchId,userId})=>{
      const token=required(accessToken,'access token');
      const id=required(matchId,'match id');
      const result=await request('/rest/v1/rpc/operator_check_in_participant',{
        method:'POST',accessToken:token,body:{p_match_id:id,p_user_id:required(userId,'user id')}
      }).then(rows=>Array.isArray(rows)?rows[0]||null:rows);
      await dispatchNotificationEmailBestEffort({accessToken:token,participationId:result?.participation_id||null,matchId:id});
      return result;
    },
    completeMatch:({accessToken,matchId})=>request('/rest/v1/rpc/operator_complete_match',{
      method:'POST',accessToken:required(accessToken,'access token'),body:{p_match_id:required(matchId,'match id')}
    }).then(rows=>Array.isArray(rows)?rows[0]||null:rows),
    listParticipants:({accessToken,matchId})=>{
      const query=new URLSearchParams();
      query.set('select','id,match_id,user_id,position,status,joined_at,canceled_at,checked_in_at');
      query.set('match_id',`eq.${required(matchId,'match id')}`);
      query.set('status','eq.confirmed');
      query.set('order','joined_at.asc');
      return request(`/rest/v1/participations?${query}`,{accessToken:required(accessToken,'access token')});
    }
  });

  return Object.freeze({origin,auth,matches,participation,notifications,operator});
}
