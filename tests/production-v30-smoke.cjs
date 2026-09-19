const fs=require('node:fs');
const path=require('node:path');

const base=(process.env.FOOTMATE_PRODUCTION_URL||'https://footmate-black.vercel.app').replace(/\/$/,'');
const strict=['1','true','yes'].includes(String(process.env.FOOTMATE_STRICT_PRODUCTION||'').toLowerCase());
const reportDir=path.resolve('test-results');
const reportFile=path.join(reportDir,'production-v30-smoke.json');

function assert(condition,message){if(!condition)throw new Error(message)}
async function fetchText(route){
  const response=await fetch(base+route,{redirect:'follow',headers:{'user-agent':'FootMate-v3-QA/1.0'}});
  return{status:response.status,contentType:response.headers.get('content-type')||'',body:await response.text()};
}
async function check(name,route,verify,checks){
  try{
    const result=await fetchText(route);
    assert(result.status>=200&&result.status<300,`${route} returned ${result.status}`);
    verify(result);
    checks.push({name,route,ok:true,status:result.status});
  }catch(error){checks.push({name,route,ok:false,error:error.message})}
}

async function main(){
  fs.mkdirSync(reportDir,{recursive:true});
  if(!strict){
    const payload={base,checkedAt:new Date().toISOString(),githubSha:process.env.GITHUB_SHA||null,strictProduction:false,skipped:true,passed:true,checks:[]};
    fs.writeFileSync(reportFile,JSON.stringify(payload,null,2)+'\n');
    console.log('SKIP v3 exact Production HTTP smoke: strict exact deployment was not verified.');
    return;
  }

  const checks=[];
  await check('v3-demo-shell','/demo',({body,contentType})=>{
    assert(contentType.includes('text/html'),'/demo must return HTML');
    assert(body.includes('/src/v3/styles/tokens.css'),'/demo v3 tokens missing');
    assert(body.includes('/src/v3/styles/app-shell.css'),'/demo v3 app shell stylesheet missing');
    assert(body.includes('/src/v3/styles/components.css'),'/demo v3 component stylesheet missing');
    assert(body.includes('/src/v3/release.js'),'/demo v3 release module missing');
  },checks);
  await check('v3-release','/src/v3/release.js',({body})=>{
    assert(body.includes("RELEASE_VERSION='3.0.0'"),'v3 release version missing');
    assert(body.includes("architecture:'v3.0-unified-app-architecture'"),'v3 release architecture missing');
    assert(body.includes("architecture:'v3.0-modular-app-runtime'"),'v3 runtime architecture missing');
    assert(body.includes("stateCompatibility:'v2.1-domain-state-preserved'"),'v3 state compatibility missing');
    assert(body.includes('FootMateV3Runtime'),'v3 runtime contract missing');
    assert(body.includes('FootMateV30'),'v3 release contract missing');
  },checks);
  await check('v3-app-shell','/src/v3/app-shell.js',({body})=>{
    assert(body.includes("architecture:'v3.0-unified-app-shell'"),'v3 app shell architecture missing');
    assert(body.includes("componentArchitecture:'v3.0-reusable-component-system'"),'v3 component architecture missing');
    assert(body.includes("ia:'4-primary-destinations'"),'v3 IA marker missing');
    assert(body.includes('preservedLegacyRoutes'),'v3 compatibility-route marker missing');
  },checks);
  await check('v3-navigation-ia','/src/v3/ia/navigation.js',({body})=>{
    for(const marker of ["id:'discover'","id:'recommendations'","id:'participation'","id:'profile'"])assert(body.includes(marker),`v3 destination missing ${marker}`);
    assert(body.includes("target:'s-home'"),'v3 discover target missing');
    assert(body.includes("target:'s-results'"),'v3 recommendations target missing');
    assert(body.includes("target:'s-pay'"),'v3 participation target missing');
    assert(body.includes("target:'s-profile'"),'v3 profile target missing');
  },checks);
  await check('v3-view-state','/src/v3/state/view-state.js',({body})=>{
    assert(body.includes("VIEW_STATE_VERSION='3.0.0'"),'v3 view state version missing');
    assert(body.includes("VIEW_STATE_KEY='footmate:v3:view'"),'v3 view state key missing');
  },checks);
  await check('v3-shell-styles','/src/v3/styles/app-shell.css',({body})=>{
    assert(body.includes('data-fm30-mode="portfolio"'),'v3 app shell portfolio scope missing');
    assert(body.includes('@media(min-width:800px)'),'v3 desktop breakpoint missing');
    assert(body.includes('@media(prefers-reduced-motion:reduce)'),'v3 reduced-motion guard missing');
  },checks);
  await check('v3-component-styles','/src/v3/styles/components.css',({body})=>{
    assert(body.includes('data-fm30-mode="portfolio"'),'v3 component portfolio scope missing');
    assert(body.includes('.fm30-app-nav'),'v3 app navigation style missing');
    assert(body.includes('.fm30-context'),'v3 contextual header style missing');
  },checks);
  await check('v3-case-study','/',({body})=>{
    assert(body.includes('index-experience.js'),'/ case study experience loader missing');
    assert(body.includes('index-patches.js'),'/ case study patch loader missing');
  },checks);
  const payload={base,checkedAt:new Date().toISOString(),githubSha:process.env.GITHUB_SHA||null,strictProduction:true,passed:checks.every(check=>check.ok),checks};
  fs.writeFileSync(reportFile,JSON.stringify(payload,null,2)+'\n');
  for(const item of checks){console.log(`${item.ok?'PASS':'FAIL'} ${item.name} ${item.route}${item.status?` (${item.status})`:''}`);if(!item.ok)console.error(`  ${item.error}`)}
  if(!payload.passed)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1});
