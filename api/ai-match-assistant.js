const GATEWAY_URL='https://ai-gateway.vercel.sh/v1/responses';
const MODEL=process.env.FOOTMATE_AI_MODEL||'openai/gpt-5.6-luna';
const VERSION='5.1.0';
const LIMIT_WINDOW_MS=5*60*1000;
const LIMIT_MAX=12;
const rateStore=globalThis.__FOOTMATE_AI_RATE_STORE__||(globalThis.__FOOTMATE_AI_RATE_STORE__=new Map());
const REGIONS=['수원 · 영통','수원 · 인계','용인 · 기흥','서울 · 강남'];
const POSITIONS=['MF','FW','DF','GK'];
const LEVELS=['입문','초중급','중급','중급+'];

function send(res,status,payload){
  res.statusCode=status;
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store');
  res.end(JSON.stringify(payload));
}
function sameOrigin(req){
  const origin=req.headers.origin;
  if(!origin)return true;
  try{return new URL(origin).host===req.headers.host}catch{return false}
}
function clientIp(req){return String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim()}
function allowedByRateLimit(req){
  const now=Date.now();
  const key=clientIp(req);
  const current=rateStore.get(key);
  if(!current||now-current.startedAt>LIMIT_WINDOW_MS){rateStore.set(key,{startedAt:now,count:1});return true}
  if(current.count>=LIMIT_MAX)return false;
  current.count+=1;
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
  }catch{
    return'';
  }
}
function cleanPreferences(value){
  const candidate=value&&typeof value==='object'?value:{};
  return {
    region:REGIONS.includes(candidate.region)?candidate.region:null,
    position:POSITIONS.includes(candidate.position)?candidate.position:null,
    level:LEVELS.includes(candidate.level)?candidate.level:null
  };
}
function extractOutputText(payload){
  if(typeof payload?.output_text==='string')return payload.output_text;
  for(const item of payload?.output||[]){for(const part of item?.content||[]){if(part?.type==='output_text'&&typeof part.text==='string')return part.text}}
  return'';
}
function normalizeResult(candidate={}){
  const intent=['search','refine','explain','compare'].includes(candidate.intent)?candidate.intent:'search';
  const region=REGIONS.includes(candidate.region)?candidate.region:null;
  const position=POSITIONS.includes(candidate.position)?candidate.position:null;
  const level=LEVELS.includes(candidate.level)?candidate.level:null;
  const maxPrice=Number.isInteger(candidate.maxPrice)?Math.min(50000,Math.max(5000,candidate.maxPrice)):null;
  const maxDistanceMin=Number.isInteger(candidate.maxDistanceMin)?Math.min(60,Math.max(5,candidate.maxDistanceMin)):null;
  const afterTime=typeof candidate.afterTime==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(candidate.afterTime)?candidate.afterTime:null;
  const reply=typeof candidate.reply==='string'?candidate.reply.trim().slice(0,180):'요청을 경기 검색 조건으로 정리했어요.';
  return {intent,region,position,level,maxPrice,maxDistanceMin,afterTime,reply};
}

module.exports=async function handler(req,res){
  const token=await resolveGatewayToken();
  if(req.method==='GET')return send(res,200,{version:VERSION,provider:'vercel-ai-gateway',model:MODEL,configured:Boolean(token),workflow:'Context → Plan → Tools → Guardrail → Observe'});
  if(req.method!=='POST')return send(res,405,{error:'method_not_allowed'});
  if(!sameOrigin(req))return send(res,403,{error:'origin_not_allowed'});
  if(!allowedByRateLimit(req))return send(res,429,{error:'rate_limited',retryable:true});
  if(!token)return send(res,503,{mode:'unavailable',error:'ai_provider_not_configured',retryable:true});
  let body;
  try{body=await readBody(req)}catch{return send(res,400,{error:'invalid_json'})}
  const message=typeof body.message==='string'?body.message.trim().slice(0,240):'';
  if(!message)return send(res,400,{error:'message_required'});
  const preferences=cleanPreferences(body.preferences);
  const schema={
    type:'object',additionalProperties:false,
    properties:{
      intent:{type:'string',enum:['search','refine','explain','compare']},
      region:{type:['string','null']},
      position:{type:['string','null']},
      level:{type:['string','null']},
      maxPrice:{type:['integer','null']},
      maxDistanceMin:{type:['integer','null']},
      afterTime:{type:['string','null']},
      reply:{type:'string'}
    },
    required:['intent','region','position','level','maxPrice','maxDistanceMin','afterTime','reply']
  };
  const instructions=[
    'You are FootMate AI Match Assistant for Korean futsal match discovery.',
    'Your only job is to translate the user request into structured search constraints.',
    `Allowed regions: ${REGIONS.join(', ')}.`,
    `Allowed positions: ${POSITIONS.join(', ')}.`,
    `Allowed levels: ${LEVELS.join(', ')}.`,
    'Do not invent matches, prices, availability, addresses, rankings, or user history.',
    'If a constraint is not present, return null. Keep current preferences only as context; do not copy them into constraints unless the user asks to keep/refine them.',
    'Convert Korean price expressions such as 2만원 이하 to integer KRW. Convert time such as 8시 이후 to HH:MM. If the user says 가까운 경기 without a number, use maxDistanceMin 20.',
    'reply must be one short Korean sentence describing only the interpreted constraints, never claiming a specific match exists or is available.'
  ].join(' ');
  try{
    const gateway=await fetch(GATEWAY_URL,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({model:MODEL,instructions,input:`현재 설정: ${JSON.stringify(preferences)}\n사용자 요청: ${message}`,reasoning:{effort:'none'},max_output_tokens:300,text:{format:{type:'json_schema',name:'footmate_match_constraints',strict:true,schema}}})});
    const payload=await gateway.json().catch(()=>({}));
    if(!gateway.ok)return send(res,502,{mode:'unavailable',error:'ai_gateway_error',retryable:true,status:gateway.status});
    const text=extractOutputText(payload);
    if(!text)return send(res,502,{mode:'unavailable',error:'ai_empty_output',retryable:true});
    let parsed;
    try{parsed=JSON.parse(text)}catch{return send(res,502,{mode:'unavailable',error:'ai_invalid_output',retryable:true})}
    return send(res,200,{version:VERSION,mode:'connected-ai',provider:'vercel-ai-gateway',model:MODEL,result:normalizeResult(parsed)});
  }catch{
    return send(res,502,{mode:'unavailable',error:'ai_request_failed',retryable:true});
  }
};
