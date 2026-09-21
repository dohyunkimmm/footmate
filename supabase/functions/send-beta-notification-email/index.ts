import {withSupabase} from 'npm:@supabase/server';

const CORS_HEADERS={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const RESEND_ENDPOINT='https://api.resend.com/emails';
const DEFAULT_FROM='FootMate <auth@footmate.dynv6.net>';
const DEFAULT_BETA_URL='https://footmate-black.vercel.app/beta';
const MAX_BATCH=10;

function text(value:unknown){return String(value??'').trim()}
function safeError(value:unknown){return text(value).slice(0,500)}
function esc(value:unknown){
  return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char));
}
function formatStart(value:unknown){
  const date=new Date(String(value||''));
  if(Number.isNaN(date.getTime()))return '';
  return new Intl.DateTimeFormat('ko-KR',{
    timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false
  }).format(date);
}

async function markFailure(ctx:any,row:any,error:unknown){
  await ctx.supabaseAdmin.from('beta_notifications').update({
    email_status:'failed',
    email_attempts:Number(row.email_attempts||0)+1,
    email_last_attempt_at:new Date().toISOString(),
    email_last_error:safeError(error)
  }).eq('id',row.id);
}

async function sendOne(ctx:any,row:any,apiKey:string,from:string,betaUrl:string){
  const {data:userResult,error:userError}=await ctx.supabaseAdmin.auth.admin.getUserById(row.user_id);
  if(userError||!text(userResult?.user?.email)){
    await markFailure(ctx,row,userError?.message||'Recipient email is unavailable');
    return {id:row.id,status:'failed'};
  }

  let match:any=null;
  if(row.match_id){
    const result=await ctx.supabaseAdmin.from('matches')
      .select('id,title,venue_name,area_label,address,starts_at')
      .eq('id',row.match_id).maybeSingle();
    if(!result.error)match=result.data;
  }

  const details=[
    match?.title?`경기: ${match.title}`:'',
    match?.starts_at?`일시: ${formatStart(match.starts_at)}`:'',
    match?.venue_name?`장소: ${match.venue_name}${match.area_label?` · ${match.area_label}`:''}`:'',
    match?.address?`주소: ${match.address}`:''
  ].filter(Boolean);
  const plain=[row.title,row.body,'',...details,'',`FootMate Closed Beta: ${betaUrl}`].join('\n');
  const htmlDetails=details.length?`<ul>${details.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:'';
  const html=`<!doctype html><html><body><h2>${esc(row.title)}</h2><p>${esc(row.body)}</p>${htmlDetails}<p><a href="${esc(betaUrl)}">FootMate Closed Beta 열기</a></p></body></html>`;

  const response=await fetch(RESEND_ENDPOINT,{
    method:'POST',
    headers:{
      authorization:`Bearer ${apiKey}`,
      'content-type':'application/json',
      'idempotency-key':`footmate-beta-notification-${row.id}`
    },
    body:JSON.stringify({
      from,
      to:[userResult.user.email],
      subject:`[FootMate] ${row.title}`,
      text:plain,
      html
    })
  });
  const payload=await response.json().catch(()=>null);
  if(!response.ok){
    await markFailure(ctx,row,payload?.message||payload?.error||`Resend request failed (${response.status})`);
    return {id:row.id,status:'failed'};
  }

  await ctx.supabaseAdmin.from('beta_notifications').update({
    email_status:'sent',
    email_attempts:Number(row.email_attempts||0)+1,
    email_last_attempt_at:new Date().toISOString(),
    email_sent_at:new Date().toISOString(),
    email_message_id:text(payload?.id)||null,
    email_last_error:null
  }).eq('id',row.id);
  return {id:row.id,status:'sent'};
}

const authenticated=withSupabase({auth:'user'},async(req,ctx)=>{
  if(req.method!=='POST'){
    return Response.json({code:'METHOD_NOT_ALLOWED',message:'POST 요청만 허용됩니다.'},{status:405,headers:{...CORS_HEADERS,allow:'POST'}});
  }
  const actorId=text(ctx.userClaims?.id);
  if(!actorId)return Response.json({code:'AUTH_REQUIRED',message:'로그인이 필요합니다.'},{status:401,headers:CORS_HEADERS});

  const apiKey=text(Deno.env.get('RESEND_API_KEY'));
  if(!apiKey){
    return Response.json({code:'EMAIL_PROVIDER_NOT_CONFIGURED',message:'Transactional email provider is not configured.'},{status:503,headers:CORS_HEADERS});
  }
  const from=text(Deno.env.get('FOOTMATE_EMAIL_FROM'))||DEFAULT_FROM;
  const betaUrl=text(Deno.env.get('FOOTMATE_BETA_URL'))||DEFAULT_BETA_URL;
  const body=await req.json().catch(()=>({}));
  const participationId=text(body?.participation_id);
  const matchId=text(body?.match_id);

  const {data:operatorRow}=await ctx.supabaseAdmin.from('operators').select('user_id').eq('user_id',actorId).maybeSingle();
  const isOperator=Boolean(operatorRow?.user_id);

  let query=ctx.supabaseAdmin.from('beta_notifications')
    .select('id,user_id,event_type,match_id,participation_id,title,body,email_status,email_attempts,created_at')
    .in('email_status',['pending','failed'])
    .order('created_at',{ascending:true})
    .order('id',{ascending:true})
    .limit(MAX_BATCH);

  if(participationId)query=query.eq('participation_id',participationId);
  else if(matchId)query=query.eq('match_id',matchId);
  else query=query.eq('user_id',actorId);

  const {data:rows,error}=await query;
  if(error)return Response.json({code:'EMAIL_OUTBOX_READ_FAILED',message:'메일 대기열을 확인하지 못했습니다.'},{status:500,headers:CORS_HEADERS});
  const pending=Array.isArray(rows)?rows:[];
  if(!isOperator&&pending.some(row=>row.user_id!==actorId)){
    return Response.json({code:'EMAIL_DISPATCH_FORBIDDEN',message:'다른 사용자의 알림 메일을 발송할 수 없습니다.'},{status:403,headers:CORS_HEADERS});
  }

  const results=[];
  for(const row of pending)results.push(await sendOne(ctx,row,apiKey,from,betaUrl));
  return Response.json({processed:results.length,sent:results.filter(item=>item.status==='sent').length,failed:results.filter(item=>item.status==='failed').length},{headers:CORS_HEADERS});
});

export default {
  async fetch(req:Request){
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS_HEADERS});
    const response=await authenticated(req);
    const headers=new Headers(response.headers);
    for(const [key,value] of Object.entries(CORS_HEADERS))headers.set(key,value);
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
