const base=(process.env.FOOTMATE_PRODUCTION_URL||'https://footmate-black.vercel.app').replace(/\/$/,'');
const strict=['1','true','yes'].includes(String(process.env.FOOTMATE_STRICT_PRODUCTION||'').toLowerCase());
function a(condition,message){if(!condition)throw new Error(message)}
async function get(path){const response=await fetch(base+path,{redirect:'follow',headers:{'user-agent':'FootMate-v5.2.0-QA'}});a(response.ok,`${path} ${response.status}`);return response}
(async()=>{
  if(!strict){console.log('SKIP v5.2.0 exact Production HTTP smoke');return}
  const app=await(await get('/app')).text(),cs=await(await get('/')).text(),beta=await(await get('/beta')).text(),operator=await(await get('/beta/operator')).text(),serviceWorker=await(await get('/beta-sw.js')).text(),journey=await(await get('/src/v5/domain/journey.js')).text(),ai=await(await get('/src/v5/ai-match-assistant.js')).text(),api=await(await get('/api/ai-match-assistant')).json(),betaConfig=await(await get('/api/beta-config')).json();
  a(app.includes('footmate-release" content="5.2.0"'),'app release');a(app.includes('/src/v5/ai-match-assistant.js?v=511'),'AI runtime');a(app.includes('/src/v5/ai-match-assistant.css?v=511'),'AI styles');a(app.includes('theme-color\" content=\"#f7f8f7\"'),'white-first browser chrome');a(!app.includes('id=\"fm-real-app-white-tone\"'),'white-first CSS moved out of HTML');a(!app.includes('const redundant=new Set'),'Detail cleanup runtime patch removed');a(cs.includes('footmate-case-study-release" content="5.1.1"'),'case release');a(cs.includes('/src/v5/case-study-connected.js?v=511'),'case narrative');a(beta.includes('FootMate | Closed Beta'),'beta route');a(beta.includes('/src/v5/beta.js?v=1'),'beta runtime');a(beta.includes('/src/v5/beta-push.js?v=1'),'beta push runtime');a(beta.includes('/src/v5/beta-media.js?v=1'),'beta media runtime');a(operator.includes('FootMate | Closed Beta Operator'),'operator route');a(operator.includes('/src/v5/beta-operator-mfa.js?v=1'),'operator MFA gate');a(operator.includes('/src/v5/beta-media.js?v=1'),'operator media runtime');a(serviceWorker.includes("addEventListener('push'"),'beta push service worker');a(betaConfig.connected===true,'beta backend connected');a(journey.includes("CONNECTED_PLATFORM_VERSION='5.1.1'"),'journey version');a(ai.includes("rankingOwner:'deterministic recommendation engine'"),'deterministic ranking ownership');a(api.version==='5.1.1','AI API version');a(api.provider==='vercel-ai-gateway','AI API provider');a(api.model==='openai/gpt-5.4-mini','AI primary model');a(api.fallbackModel==='openai/gpt-5.4-nano','AI fallback model');a(api.gatewayTimeoutMs===3000,'AI server timeout');a(typeof api.configured==='boolean','AI API configuration disclosure');for(const route of ['/demo','/next'])a((await(await get(route)).text()).includes('footmate-release" content="5.2.0"'),`${route} release`);
  // Verify the static Case Study cover contract on the deployed source.
  const caseScript=await(await get('/src/v4/case-study.js')).text();
  a(!caseScript.includes('Live interaction'),'Case Study Live interaction removed');
  a(!caseScript.includes('/app?embed=1'),'Case Study embedded app removed');
  a(caseScript.includes('href="/demo"'),'Case Study Product CTA route');
  a(caseScript.includes('제품 직접 체험하기'),'Case Study Product CTA copy');
  // Verify the changed Case Study assets themselves, not only the product release marker.
  const {readFileSync}=require('node:fs');
  const {resolve}=require('node:path');
  for(const asset of ['index.html','src/v4/case-study.js','src/v5/case-study-connected.js','src/v5/case-study-heading-polish.js','src/v4/case-study-layout-refinement.css']){
    const actual=asset==='index.html'?cs:await(await get('/'+asset)).text();
    a(actual===readFileSync(resolve(__dirname,'..',asset),'utf8'),`Case Study asset matches checked-out SHA: ${asset}`);
  }
  console.log(`PASS v5.2.0 exact Production HTTP smoke (AI configured=${api.configured}, beta connected=${betaConfig.connected})`);
})().catch(error=>{console.error(error);process.exitCode=1});
