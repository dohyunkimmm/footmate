const GATEWAY_URL='https://ai-gateway.vercel.sh/v1/responses';
const MODEL=process.env.FOOTMATE_AI_MODEL||'inclusionai/ling-3.0-flash-vl-free';
const FALLBACK_MODEL=process.env.FOOTMATE_AI_FALLBACK_MODEL||'inclusionai/ling-3.0-flash-fin-free';
const VERSION='5.2.0';
const LIMIT_WINDOW_MS=5*60*1000;
const LIMIT_MAX=10;
const GLOBAL_LIMIT_MAX=60;
const GATEWAY_TIMEOUT_MS=3000;
const rateStore=globalThis.__FOOTMATE_AI_RATE_STORE__||(globalThis.__FOOTMATE_AI_RATE_STORE__=new Map());
const globalRate=globalThis.__FOOTMATE_AI_RATE_GLOBAL__||(globalThis.__FOOTMATE_AI_RATE_GLOBAL__={startedAt:0,count:0});
const REGIONS=['수원 · 영통','수원 · 인계','용인 · 기흥','서울 · 강남'];
const POSITIONS=['MF','FW','DF','GK'];
const LEVELS=['입문','초중급','중급','중급+'];

function send(res,status,payload,headers={}){
  res.statusCode=status;
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store');
  for(const [name,value] of Object.entries(headers))res.setHeader(name,value);
  res.end(JSON.stringify(payload));
}
function sameOrigin(req){
  const origin=req.headers.origin;
  if(!origin)return false;
  try{return new URL(origin).host===String(req.headers.host||'')}catch{return false}
}
function sameSite(req){
  const site=String(req.headers['sec-fetch-site']||'').toLowerCase();
  return !site||site==='same-origin'||site==='none';
}
function isJsonRequest(req){return /^application\/json\b/i.test(String(req.headers['content-type']||''))}
function clientIp(req){return String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim()}
function resetWindow(bucket,now){bucket.startedAt=now;bucket.count=0}
function allowedByRateLimit(req){
  const now=Date.now();
  if(!globalRate.startedAt||now-globalRate.startedAt>LIMIT_WINDOW_MS)resetWindow(globalRate,now);
  if(globalRate.count>=GLOBAL_LIMIT_MAX)return false;
  const key=clientIp(req);
  const current=rateStore.get(key);
  if(!current||now-current.startedAt>LIMIT_WINDOW_MS)rateStore.set(key,{startedAt:now,count:0});
  const bucket=rateStore.get(key);
  if(bucket.count>=LIMIT_MAX)return false;
  bucket.count+=1;
  globalRate.count+=1;
  if(rateStore.size>500){for(const [ip,value] of rateStore){if(now-value.startedAt>LIMIT_WINDOW_MS)rateStore.delete(ip)}}
  return true;
}
async function readBody(req){
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>16_384)throw new Error('payload-too-large');chunks.push(chunk)}
  if(!chunks.length)return{};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
async function resolveGatewayToken(){
  const direct=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN||'';
  if(direct)return direct;
  try{
    const {getVercelOidcToken}=await import('@vercel/oidc');
    return await getVercelOidcToken()||'';
  }catch{return''}
}
function cleanPreferences(value){
  const candidate=value&&typeof value==='object'?value:{};
  return {region:REGIONS.includes(candidate.region)?candidate.region:null,position:POSITIONS.includes(candidate.position)?candidate.position:null,level:LEVELS.includes(candidate.level)?candidate.level:null};
}
function extractOutputText(payload){
  if(typeof payload?.output_text==='string')return payload.output_text;
  for(const item of payload?.output||[]){for(const part of item?.content||[]){if(part?.type==='output_text'&&typeof part.text==='string')return part.text}}
  return'';
}
function parseOutputText(text){
  const raw=String(text||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try{return JSON.parse(raw)}catch{}
  const start=raw.indexOf('{'),end=raw.lastIndexOf('}');
  if(start>=0&&end>start){try{return JSON.parse(raw.slice(start,end+1))}catch{}}
  return null;
}
function normalizeResult(candidate={}){
  const intent=['search','refine','explain','compare'].includes(candidate.intent)?candidate.intent:'search';
  const region=REGIONS.includes(candidate.region)?candidate.region:null;
  const position=POSITIONS.includes(candidate.position)?candidate.position:null;
  const level=LEVELS.includes(candidate.level)?candidate.level:null;
  const maxPrice=Number.isInteger(candidate.maxPrice)?Math.min(50000,Math.max(5000,candidate.maxPrice)):null;
  const maxDistanceMin=Number.isInteger(candidate.maxDistanceMin)?Math.min(60,Math.max(5,candidate.maxDistanceMin)):null;
  const afterTime=typeof candidate.afterTime==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(candidate.afterTime)?candidate.afterTime:null;
  const reply=typeof candidate.reply==='string'&&candidate.reply.trim()?candidate.reply.trim().slice(0,180):'요청을 경기 검색 조건으로 정리했어요.';
  return {intent,region,position,level,maxPrice,maxDistanceMin,afterTime,reply};
}
function gatewayErrorType(payload){return typeof payload?.error?.type==='string'?payload.error.type:null}
function supportsStrictSchema(model){return /^openai\//.test(model)&&String(process.env.FOOTMATE_AI_STRICT_SCHEMA||'auto').toLowerCase()!=='false'}
function shouldTryFallback(attempt){
  if(attempt.requestError)return true;
  if(attempt.gateway?.ok)return false;
  const status=attempt.gateway?.status||0;
  return status===429||status>=500||(status===403&&['no_providers_available','access_denied'].includes(gatewayErrorType(attempt.payload)));
}

module.exports=async function handler(req,res){
  if(req.method==='GET'){
    const token=await resolveGatewayToken();
    return send(res,200,{version:VERSION,provider:'vercel-ai-gateway',model:MODEL,fallbackModel:FALLBACK_MODEL,configured:Boolean(token),gatewayTimeoutMs:GATEWAY_TIMEOUT_MS,reasoningEffort:'none',workflow:'Context → Plan → Tools → Guardrail → Observe'});
  }
  if(req.method!=='POST')return send(res,405,{error:'method_not_allowed'});
  if(!sameOrigin(req)||!sameSite(req))return send(res,403,{error:'origin_not_allowed'});
  if(!isJsonRequest(req))return send(res,415,{error:'content_type_required'});
  if(!allowedByRateLimit(req))return send(res,429,{error:'rate_limited',retryable:true},{'retry-after':String(Math.ceil(LIMIT_WINDOW_MS/1000))});
  let body;
  try{body=await readBody(req)}catch{return send(res,400,{error:'invalid_json'})}
  const message=typeof body.message==='string'?body.message.trim().slice(0,240):'';
  if(!message)return send(res,400,{error:'message_required'});
  const token=await resolveGatewayToken();
  if(!token)return send(res,503,{mode:'unavailable',error:'ai_provider_not_configured',retryable:true});
  const preferences=cleanPreferences(body.preferences);
  const schema={type:'object',additionalProperties:false,properties:{intent:{type:'string',enum:['search','refine','explain','compare']},region:{type:['string','null']},position:{type:['string','null']},level:{type:['string','null']},maxPrice:{type:['integer','null']},maxDistanceMin:{type:['integer','null']},afterTime:{type:['string','null']},reply:{type:'string'}},required:['intent','region','position','level','maxPrice','maxDistanceMin','afterTime','reply']};
  const instructions=[
    'You are FootMate AI Match Assistant for Korean futsal match discovery.',
    'Your only job is to translate the user request into structured search constraints.',
    `Allowed regions: ${REGIONS.join(', ')}.`,
    `Allowed positions: ${POSITIONS.join(', ')}.`,
    `Allowed levels: ${LEVELS.join(', ')}.`,
    'Do not invent matches, prices, availability, addresses, rankings, dates, or user history.',
    'Date expressions such as 오늘, 내일, 주말 are not supported. Ignore them rather than inventing a date constraint.',
    'If a constraint is not present, return null. Keep current preferences only as context; do not copy them into constraints unless the user asks to keep/refine them.',
    'Convert Korean price expressions such as 2만원 이하 to integer KRW. Convert time such as 8시 이후 to HH:MM. If the user says 가까운 경기 without a number, use maxDistanceMin 20.',
    'reply must be one short Korean sentence describing only the interpreted constraints, never claiming a specific match exists or is available.'
  ].join(' ');
  const input=`현재 설정: ${JSON.stringify(preferences)}\n사용자 요청: ${message}`;
  async function requestModel(model){
    const requestBody={model,instructions,input,max_output_tokens:300,reasoning:{effort:'none'}};
    if(supportsStrictSchema(model))requestBody.text={format:{type:'json_schema',name:'footmate_match_constraints',strict:true,schema}};
    else requestBody.instructions+=` Return only one JSON object with exactly these keys: ${Object.keys(schema.properties).join(', ')}. Use null for unknown values. Do not wrap the JSON in markdown.`;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),GATEWAY_TIMEOUT_MS);
    try{
      const gateway=await fetch(GATEWAY_URL,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(requestBody),signal:controller.signal});
      const payload=await gateway.json().catch(()=>({}));
      return {gateway,payload,model,requestError:null};
    }catch(error){return {gateway:null,payload:{},model,requestError:error?.name==='AbortError'?'timeout':'network_error'}}
    finally{clearTimeout(timer)}
  }
  let attempt=await requestModel(MODEL);
  let usedFallback=false;
  if(shouldTryFallback(attempt)&&FALLBACK_MODEL&&FALLBACK_MODEL!==MODEL){
    console.warn('FootMate AI Gateway primary unavailable; retrying fallback',{status:attempt.gateway?.status||null,type:attempt.requestError||gatewayErrorType(attempt.payload),model:MODEL,fallbackModel:FALLBACK_MODEL});
    attempt=await requestModel(FALLBACK_MODEL);
    usedFallback=true;
  }
  if(attempt.requestError)return send(res,502,{mode:'unavailable',error:'ai_request_failed',retryable:true,gatewayType:attempt.requestError,model:attempt.model});
  if(!attempt.gateway.ok){
    const gatewayType=gatewayErrorType(attempt.payload);
    console.warn('FootMate AI Gateway rejected request',{status:attempt.gateway.status,type:gatewayType,model:attempt.model});
    return send(res,502,{mode:'unavailable',error:'ai_gateway_error',retryable:true,status:attempt.gateway.status,gatewayType,model:attempt.model});
  }
  const text=extractOutputText(attempt.payload);
  if(!text)return send(res,502,{mode:'unavailable',error:'ai_empty_output',retryable:true,model:attempt.model});
  const parsed=parseOutputText(text);
  if(!parsed)return send(res,502,{mode:'unavailable',error:'ai_invalid_output',retryable:true,model:attempt.model});
  return send(res,200,{version:VERSION,mode:'connected-ai',provider:'vercel-ai-gateway',model:attempt.model,fallbackUsed:usedFallback,result:normalizeResult(parsed)});
};
