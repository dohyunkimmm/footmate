import {withSupabase} from 'npm:@supabase/server';
import webpush from 'npm:web-push@3.6.7';

const CORS_HEADERS={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'content-type, x-footmate-worker-token',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const MAX_BATCH=10;
const MAX_ATTEMPTS=5;
const BACKOFF_SECONDS=[60,300,900,3600];

function text(value:unknown){return String(value??'').trim()}
function safeError(value:unknown){return text(value).slice(0,500)}
function constantEqual(left:string,right:string){
  if(!left||!right||left.length!==right.length)return false;
  let diff=0;for(let i=0;i<left.length;i++)diff|=left.charCodeAt(i)^right.charCodeAt(i);return diff===0;
}
function nextAttemptAt(attempt:number){
  if(attempt>=MAX_ATTEMPTS)return null;
  const seconds=BACKOFF_SECONDS[Math.max(0,Math.min(BACKOFF_SECONDS.length-1,attempt-1))];
  return new Date(Date.now()+seconds*1000).toISOString();
}

async function finish(ctx:any,row:any,status:'sent'|'failed'|'skipped',error:unknown=null){
  const attempt=Number(row.push_attempts||0)+1;
  const now=new Date().toISOString();
  const update:any={
    push_status:status,
    push_attempts:attempt,
    push_last_attempt_at:now,
    push_next_attempt_at:status==='failed'?nextAttemptAt(attempt):null,
    push_claimed_at:null,
    push_claim_token:null,
    push_last_error:error?safeError(error):null
  };
  if(status==='sent')update.push_sent_at=now;
  await ctx.supabaseAdmin.from('beta_notifications').update(update)
    .eq('id',row.id).eq('push_claim_token',row.push_claim_token);
  return {id:row.id,status,attempt};
}

async function sendOne(ctx:any,row:any){
  const {data:subscriptions,error:subscriptionError}=await ctx.supabaseAdmin
    .from('beta_push_subscriptions')
    .select('id,endpoint,p256dh,auth')
    .eq('user_id',row.user_id);
  if(subscriptionError)return finish(ctx,row,'failed',subscriptionError.message);
  const targets=Array.isArray(subscriptions)?subscriptions:[];
  if(!targets.length)return finish(ctx,row,'skipped');

  const payload=JSON.stringify({
    title:text(row.title)||'FootMate',
    body:text(row.body),
    url:'/beta',
    tag:`footmate-beta-${row.id}`,
    eventType:text(row.event_type)
  });
  let sent=0;
  let transientError='';
  for(const item of targets){
    try{
      await webpush.sendNotification({endpoint:item.endpoint,keys:{p256dh:item.p256dh,auth:item.auth}},payload,{TTL:3600,urgency:'normal'});
      sent++;
      await ctx.supabaseAdmin.from('beta_push_subscriptions').update({last_success_at:new Date().toISOString(),last_error:null}).eq('id',item.id);
    }catch(error:any){
      const statusCode=Number(error?.statusCode||0);
      const message=safeError(error?.body||error?.message||error);
      if(statusCode===404||statusCode===410){
        await ctx.supabaseAdmin.from('beta_push_subscriptions').delete().eq('id',item.id);
      }else{
        transientError=message||`Push request failed (${statusCode||'unknown'})`;
        await ctx.supabaseAdmin.from('beta_push_subscriptions').update({last_error:transientError}).eq('id',item.id);
      }
    }
  }
  if(sent>0)return finish(ctx,row,'sent');
  if(transientError)return finish(ctx,row,'failed',transientError);
  return finish(ctx,row,'skipped');
}

const worker=withSupabase({auth:'none'},async(req,ctx)=>{
  if(req.method!=='POST')return Response.json({code:'METHOD_NOT_ALLOWED'},{status:405,headers:CORS_HEADERS});
  const supplied=text(req.headers.get('x-footmate-worker-token'));
  const {data:expected,error:tokenError}=await ctx.supabaseAdmin.rpc('get_beta_email_worker_token');
  if(!supplied||tokenError||!constantEqual(supplied,text(expected))){
    return Response.json({code:'WORKER_AUTH_INVALID'},{status:401,headers:CORS_HEADERS});
  }

  const [{data:publicKey,error:publicError},{data:privateKey,error:privateError},{data:subject,error:subjectError}]=await Promise.all([
    ctx.supabaseAdmin.rpc('get_beta_push_public_key'),
    ctx.supabaseAdmin.rpc('get_beta_web_push_private_key'),
    ctx.supabaseAdmin.rpc('get_beta_web_push_subject')
  ]);
  if(publicError||privateError||subjectError||!text(publicKey)||!text(privateKey)||!text(subject)){
    return Response.json({code:'WEB_PUSH_NOT_CONFIGURED'},{status:503,headers:CORS_HEADERS});
  }
  webpush.setVapidDetails(text(subject),text(publicKey),text(privateKey));

  const {data:rows,error}=await ctx.supabaseAdmin.rpc('claim_beta_notification_pushes',{p_limit:MAX_BATCH});
  if(error)return Response.json({code:'PUSH_OUTBOX_CLAIM_FAILED',message:safeError(error.message)},{status:500,headers:CORS_HEADERS});
  const claimed=Array.isArray(rows)?rows:[];
  const results=[];
  for(const row of claimed)results.push(await sendOne(ctx,row));
  return Response.json({
    processed:results.length,
    sent:results.filter(item=>item.status==='sent').length,
    failed:results.filter(item=>item.status==='failed').length,
    skipped:results.filter(item=>item.status==='skipped').length
  },{headers:CORS_HEADERS});
});

export default {
  async fetch(req:Request){
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS_HEADERS});
    const response=await worker(req);
    const headers=new Headers(response.headers);for(const [key,value] of Object.entries(CORS_HEADERS))headers.set(key,value);
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
