import {withSupabase} from 'npm:@supabase/server';

const CORS_HEADERS={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'content-type, svix-id, svix-timestamp, svix-signature',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const MAX_CLOCK_SKEW_SECONDS=300;
const STATUS_BY_EVENT:Record<string,string>={
  'email.sent':'accepted',
  'email.delivery_delayed':'delivery_delayed',
  'email.delivered':'delivered',
  'email.bounced':'bounced',
  'email.complained':'complained',
  'email.suppressed':'suppressed',
  'email.failed':'failed'
};

function text(value:unknown){return String(value??'').trim()}
function decodeSecret(value:string){
  const encoded=value.startsWith('whsec_')?value.slice(6):value;
  const normalized=encoded.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(encoded.length/4)*4,'=');
  const binary=atob(normalized);const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;
}
function encodeBase64(value:ArrayBuffer){
  const bytes=new Uint8Array(value);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);
}
function constantEqual(left:string,right:string){
  if(!left||!right||left.length!==right.length)return false;
  let diff=0;for(let i=0;i<left.length;i++)diff|=left.charCodeAt(i)^right.charCodeAt(i);return diff===0;
}
async function verifySignature(raw:string,headers:Headers,secret:string){
  const id=text(headers.get('svix-id')),timestamp=text(headers.get('svix-timestamp')),signature=text(headers.get('svix-signature'));
  const epoch=Number(timestamp);
  if(!id||!timestamp||!signature||!Number.isFinite(epoch))return false;
  if(Math.abs(Math.floor(Date.now()/1000)-epoch)>MAX_CLOCK_SKEW_SECONDS)return false;
  let keyBytes:Uint8Array;try{keyBytes=decodeSecret(secret)}catch{return false}
  const key=await crypto.subtle.importKey('raw',keyBytes,{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signed=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${id}.${timestamp}.${raw}`));
  const expected=encodeBase64(signed);
  return signature.split(/\s+/).some(item=>{
    const [version,value]=item.split(',',2);return version==='v1'&&constantEqual(text(value),expected);
  });
}

const webhook=withSupabase({auth:'none'},async(req,ctx)=>{
  if(req.method!=='POST')return Response.json({code:'METHOD_NOT_ALLOWED'},{status:405,headers:{...CORS_HEADERS,allow:'POST'}});
  const raw=await req.text();
  const {data:secret,error:secretError}=await ctx.supabaseAdmin.rpc('get_resend_webhook_signing_secret');
  if(secretError||!text(secret))return Response.json({code:'WEBHOOK_SECRET_NOT_CONFIGURED'},{status:503,headers:CORS_HEADERS});
  if(!await verifySignature(raw,req.headers,text(secret)))return Response.json({code:'INVALID_WEBHOOK_SIGNATURE'},{status:400,headers:CORS_HEADERS});

  let event:any;try{event=JSON.parse(raw)}catch{return Response.json({code:'INVALID_WEBHOOK_BODY'},{status:400,headers:CORS_HEADERS})}
  const status=STATUS_BY_EVENT[text(event?.type)];
  if(!status)return Response.json({ok:true,ignored:true},{headers:CORS_HEADERS});
  const messageId=text(event?.data?.email_id);
  if(!messageId)return Response.json({ok:true,ignored:true},{headers:CORS_HEADERS});
  const parsedAt=new Date(text(event?.created_at));
  const eventAt=Number.isNaN(parsedAt.getTime())?new Date().toISOString():parsedAt.toISOString();
  const {data:notificationId,error}=await ctx.supabaseAdmin.rpc('record_beta_email_delivery',{
    p_message_id:messageId,p_delivery_status:status,p_event_at:eventAt
  });
  if(error)return Response.json({code:'DELIVERY_STATE_UPDATE_FAILED'},{status:500,headers:CORS_HEADERS});
  return Response.json({ok:true,matched:Boolean(notificationId),status},{headers:CORS_HEADERS});
});

export default {
  async fetch(req:Request){
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS_HEADERS});
    const response=await webhook(req);
    const headers=new Headers(response.headers);for(const [key,value] of Object.entries(CORS_HEADERS))headers.set(key,value);
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
