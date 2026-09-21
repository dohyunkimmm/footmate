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
const MAX_ATTEMPTS=5;
const BACKOFF_SECONDS=[60,300,900,3600];

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
function nextAttemptAt(attempt:number){
  if(attempt>=MAX_ATTEMPTS)return null;
  const seconds=BACKOFF_SECONDS[Math.max(0,Math.min(BACKOFF_SECONDS.length-1,attempt-1))];
  return new Date(Date.now()+seconds*1000).toISOString();
}

async function releaseFailure(ctx:any,row:any,error:unknown){
  const attempt=Number(row.email_attempts||0)+1;
  await ctx.supabaseAdmin.from('beta_notifications').update({
    email_status:'failed',
    email_attempts:attempt,
    email_last_attempt_at:new Date().toISOString(),
    email_next_attempt_at:nextAttemptAt(attempt),
    email_claimed_at:null,
    email_claim_token:null,
    email_last_error:safeError(error)
  }).eq('id',row.id).eq('email_claim_token',row.email_claim_token);
  return {id:row.id,status:'failed',attempt};
}

function emailMarkup(row:any,match:any,betaUrl:string){
  const details=[
    match?.title?['경기',match.title]:null,
    match?.starts_at?['일시',formatStart(match.starts_at)]:null,
    match?.venue_name?['장소',`${match.venue_name}${match.area_label?` · ${match.area_label}`:''}`]:null,
    match?.address?['주소',match.address]:null
  ].filter(Boolean) as Array<[string,string]>;
  const plain=[row.title,row.body,'',...details.map(([label,value])=>`${label}: ${value}`),'',`FootMate Closed Beta: ${betaUrl}`].join('\n');
  const rows=details.map(([label,value])=>`<tr><td style="padding:8px 0;width:64px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#647067;vertical-align:top">${esc(label)}</td><td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#203229">${esc(value)}</td></tr>`).join('');
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"></head><body style="margin:0;padding:0;background-color:#f4f7f4"><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td align="center" bgcolor="#f4f7f4" style="padding-top:28px;padding-right:16px;padding-bottom:28px;padding-left:16px;background-color:#f4f7f4"><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;background-color:#ffffff;border:1px solid #e1e8e2;border-radius:16px"><tr><td style="padding-top:28px;padding-right:28px;padding-bottom:12px;padding-left:28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;font-weight:700;color:#477258">FootMate Closed Beta</td></tr><tr><td style="padding-top:0;padding-right:28px;padding-bottom:8px;padding-left:28px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;font-weight:700;color:#18251e">${esc(row.title)}</td></tr><tr><td style="padding-top:0;padding-right:28px;padding-bottom:18px;padding-left:28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#46564c">${esc(row.body)}</td></tr>${rows?`<tr><td style="padding-top:0;padding-right:28px;padding-bottom:20px;padding-left:28px"><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">${rows}</table></td></tr>`:''}<tr><td style="padding-top:0;padding-right:28px;padding-bottom:28px;padding-left:28px"><table cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td bgcolor="#315c43" style="background-color:#315c43;border-radius:10px"><a href="${esc(betaUrl)}" style="display:inline-block;padding-top:12px;padding-right:18px;padding-bottom:12px;padding-left:18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none">FootMate Closed Beta 열기</a></td></tr></table></td></tr><tr><td style="padding-top:18px;padding-right:28px;padding-bottom:22px;padding-left:28px;border-top:1px solid #edf1ed;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#748078">이 메일은 경기 참가 상태와 운영 정보를 전달하는 transactional email입니다.</td></tr></table></td></tr></table></body></html>`;
  return {plain,html};
}

async function sendOne(ctx:any,row:any,apiKey:string,from:string,betaUrl:string){
  const {data:userResult,error:userError}=await ctx.supabaseAdmin.auth.admin.getUserById(row.user_id);
  if(userError||!text(userResult?.user?.email))return releaseFailure(ctx,row,userError?.message||'Recipient email is unavailable');

  let match:any=null;
  if(row.match_id){
    const result=await ctx.supabaseAdmin.from('matches')
      .select('id,title,venue_name,area_label,address,starts_at')
      .eq('id',row.match_id).maybeSingle();
    if(!result.error)match=result.data;
  }

  const {plain,html}=emailMarkup(row,match,betaUrl);
  const response=await fetch(RESEND_ENDPOINT,{
    method:'POST',
    headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json','idempotency-key':`footmate-beta-notification-${row.id}`},
    body:JSON.stringify({from,to:[userResult.user.email],subject:`[FootMate] ${row.title}`,text:plain,html})
  });
  const payload=await response.json().catch(()=>null);
  if(!response.ok)return releaseFailure(ctx,row,payload?.message||payload?.error||`Resend request failed (${response.status})`);

  const now=new Date().toISOString();
  const attempt=Number(row.email_attempts||0)+1;
  const {error:updateError}=await ctx.supabaseAdmin.from('beta_notifications').update({
    email_status:'sent',
    email_attempts:attempt,
    email_last_attempt_at:now,
    email_next_attempt_at:null,
    email_claimed_at:null,
    email_claim_token:null,
    email_sent_at:now,
    email_message_id:text(payload?.id)||null,
    email_delivery_status:'accepted',
    email_delivery_updated_at:now,
    email_last_error:null
  }).eq('id',row.id).eq('email_claim_token',row.email_claim_token);
  if(updateError)return {id:row.id,status:'state-update-failed',attempt};
  return {id:row.id,status:'sent',attempt};
}

const authenticated=withSupabase({auth:'user'},async(req,ctx)=>{
  if(req.method!=='POST')return Response.json({code:'METHOD_NOT_ALLOWED',message:'POST 요청만 허용됩니다.'},{status:405,headers:{...CORS_HEADERS,allow:'POST'}});
  const actorId=text(ctx.userClaims?.id);
  if(!actorId)return Response.json({code:'AUTH_REQUIRED',message:'로그인이 필요합니다.'},{status:401,headers:CORS_HEADERS});

  const apiKey=text(Deno.env.get('RESEND_API_KEY'));
  if(!apiKey)return Response.json({code:'EMAIL_PROVIDER_NOT_CONFIGURED',message:'Transactional email provider is not configured.'},{status:503,headers:CORS_HEADERS});
  const from=text(Deno.env.get('FOOTMATE_EMAIL_FROM'))||DEFAULT_FROM;
  const betaUrl=text(Deno.env.get('FOOTMATE_BETA_URL'))||DEFAULT_BETA_URL;
  const body=await req.json().catch(()=>({}));
  const participationId=text(body?.participation_id)||null;
  const matchId=text(body?.match_id)||null;

  const {data:operatorRow}=await ctx.supabaseAdmin.from('operators').select('user_id').eq('user_id',actorId).maybeSingle();
  const isOperator=Boolean(operatorRow?.user_id);
  const scopeUserId=isOperator&&(participationId||matchId)?null:actorId;

  const {data:rows,error}=await ctx.supabaseAdmin.rpc('claim_beta_notification_emails',{
    p_limit:MAX_BATCH,
    p_user_id:scopeUserId,
    p_match_id:matchId,
    p_participation_id:participationId
  });
  if(error)return Response.json({code:'EMAIL_OUTBOX_CLAIM_FAILED',message:'메일 대기열을 확보하지 못했습니다.'},{status:500,headers:CORS_HEADERS});
  const claimed=Array.isArray(rows)?rows:[];
  if(!isOperator&&claimed.some(row=>row.user_id!==actorId))return Response.json({code:'EMAIL_DISPATCH_FORBIDDEN',message:'다른 사용자의 알림 메일을 발송할 수 없습니다.'},{status:403,headers:CORS_HEADERS});

  const results=[];
  for(const row of claimed)results.push(await sendOne(ctx,row,apiKey,from,betaUrl));
  return Response.json({processed:results.length,sent:results.filter(item=>item.status==='sent').length,failed:results.filter(item=>item.status==='failed').length},{headers:CORS_HEADERS});
});

export default {
  async fetch(req:Request){
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS_HEADERS});
    const response=await authenticated(req);
    const headers=new Headers(response.headers);for(const [key,value] of Object.entries(CORS_HEADERS))headers.set(key,value);
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
