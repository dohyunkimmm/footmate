const base=(process.env.FOOTMATE_PRODUCTION_URL||'https://footmate-black.vercel.app').replace(/\/$/,'');
const strict=['1','true','yes'].includes(String(process.env.FOOTMATE_STRICT_PRODUCTION||'').toLowerCase());
function a(condition,message){if(!condition)throw new Error(message)}
async function get(path){const response=await fetch(base+path,{redirect:'follow',headers:{'user-agent':'FootMate-v5.1-QA'}});a(response.ok,`${path} ${response.status}`);return response}
(async()=>{
  if(!strict){console.log('SKIP v5.1 exact Production HTTP smoke');return}
  const app=await(await get('/app')).text();
  const cs=await(await get('/')).text();
  const journey=await(await get('/src/v5/domain/journey.js')).text();
  const ai=await(await get('/src/v5/ai-match-assistant.js')).text();
  const api=await(await get('/api/ai-match-assistant')).json();
  a(app.includes('footmate-release" content="5.1.0"'),'app release');
  a(app.includes('/src/v5/ai-match-assistant.js?v=510'),'AI runtime');
  a(app.includes('/src/v5/ai-match-assistant.css?v=510'),'AI styles');
  a(cs.includes('footmate-case-study-release" content="5.1.0"'),'case release');
  a(cs.includes('/src/v5/case-study-connected.js?v=510'),'case narrative');
  a(journey.includes("CONNECTED_PLATFORM_VERSION='5.1.0'"),'journey version');
  a(ai.includes("rankingOwner:'deterministic recommendation engine'"),'deterministic ranking ownership');
  a(api.version==='5.1.0','AI API version');
  a(api.provider==='vercel-ai-gateway','AI API provider');
  a(typeof api.configured==='boolean','AI API configuration disclosure');
  for(const route of ['/demo','/next'])a((await(await get(route)).text()).includes('footmate-release" content="5.1.0"'),`${route} release`);
  console.log(`PASS v5.1 exact Production HTTP smoke (AI configured=${api.configured})`);
})().catch(error=>{console.error(error);process.exitCode=1});
