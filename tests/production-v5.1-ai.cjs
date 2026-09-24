const base=(process.env.FOOTMATE_PRODUCTION_URL||'https://footmate-black.vercel.app').replace(/\/$/,'');
const strict=['1','true','yes'].includes(String(process.env.FOOTMATE_STRICT_PRODUCTION||'').toLowerCase());
const primaryModel=process.env.FOOTMATE_EXPECTED_AI_MODEL||'openai/gpt-5.4-mini';
const fallbackModel=process.env.FOOTMATE_EXPECTED_AI_FALLBACK_MODEL||'openai/gpt-5.4-nano';
function assert(condition,message){if(!condition)throw new Error(message)}
(async()=>{
  if(!strict){console.log('SKIP v5.1.1 exact Production AI inference');return}
  const response=await fetch(base+'/api/ai-match-assistant',{method:'POST',headers:{'content-type':'application/json','origin':base,'user-agent':'FootMate-v5.1.1-AI-QA'},body:JSON.stringify({message:'수원 인계에서 8시 이후 가까운 초중급 MF 경기 찾아줘',preferences:{region:'수원 · 영통',position:'MF',level:'중급'}})});
  const payload=await response.json().catch(()=>({}));
  assert(response.ok,`AI inference HTTP ${response.status}: ${JSON.stringify(payload)}`);
  assert(payload.version==='5.1.1','AI inference release');
  assert(payload.mode==='connected-ai',`AI mode must be connected-ai, got ${payload.mode||'unknown'}`);
  assert(payload.provider==='vercel-ai-gateway','AI provider');
  assert([primaryModel,fallbackModel].includes(payload.model),`AI model must be an approved provider model, got ${payload.model||'unknown'}`);
  if(payload.model===primaryModel)assert(payload.fallbackUsed===false,`AI primary model must report fallbackUsed=false, got ${payload.fallbackUsed}`);
  if(payload.model===fallbackModel)assert(payload.fallbackUsed===true,`AI fallback model must report fallbackUsed=true, got ${payload.fallbackUsed}`);
  assert(payload.result&&typeof payload.result==='object','AI result');
  assert(['수원 · 인계',null].includes(payload.result.region),'AI region guard');assert(['MF',null].includes(payload.result.position),'AI position guard');assert(['초중급',null].includes(payload.result.level),'AI level guard');assert(payload.result.afterTime===null||/^([01]\d|2[0-3]):[0-5]\d$/.test(payload.result.afterTime),'AI time guard');
  console.log(`PASS v5.1.1 exact Production AI inference (${payload.model}, fallbackUsed=${payload.fallbackUsed})`);
})().catch(error=>{console.error(error);process.exitCode=1});
