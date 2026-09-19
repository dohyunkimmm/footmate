const fs=require('node:fs');
const path=require('node:path');
const base=(process.env.FOOTMATE_PRODUCTION_URL||'https://footmate-black.vercel.app').replace(/\/$/,'');
const strict=['1','true','yes'].includes(String(process.env.FOOTMATE_STRICT_PRODUCTION||'').toLowerCase());
const reportDir=path.resolve('test-results');
const reportFile=path.join(reportDir,'production-v4-smoke.json');

function assert(condition,message){if(!condition)throw new Error(message)}
async function fetchText(route){
  const response=await fetch(base+route,{redirect:'follow',headers:{'user-agent':'FootMate-v4-QA/1.0'}});
  return {status:response.status,contentType:response.headers.get('content-type')||'',body:await response.text()};
}
async function check(name,route,verify,checks){
  try{
    const result=await fetchText(route);
    assert(result.status>=200&&result.status<300,`${route} returned ${result.status}`);
    verify(result);
    checks.push({name,route,ok:true,status:result.status});
  }catch(error){
    checks.push({name,route,ok:false,error:error.message});
  }
}

(async()=>{
  fs.mkdirSync(reportDir,{recursive:true});
  if(!strict){
    fs.writeFileSync(reportFile,JSON.stringify({base,strictProduction:false,skipped:true,passed:true},null,2));
    console.log('SKIP v4 exact Production HTTP smoke');
    return;
  }
  const checks=[];
  await check('case-study','/',({body})=>{
    assert(body.includes('footmate-case-study-release" content="4.2.0"'),'case study v4.2 metadata missing');
    assert(body.includes('/src/v4/case-study.js?v=420'),'v4 case study runtime missing');
    assert(body.includes('/src/v4/case-study-recommendation.js?v=420'),'recommendation Case Study evidence missing');
    assert(body.includes('/src/v4/case-study-discovery.js?v=420'),'v4.2 discovery Case Study evidence missing');
    assert(body.includes('/src/v4/case-study-editorial.css?v=420'),'Case Study editorial stylesheet missing');
    assert(!body.includes('case-study-release.js'),'obsolete Case Study release overlay still loaded');
  },checks);
  for(const route of ['/app','/demo','/next']){
    await check(`app-${route}`,route,({body})=>{
      assert(body.includes('footmate-release" content="4.2.0"'),`${route} v4.2 release metadata missing`);
      assert(body.includes('/src/v4/app.js?v=420'),`${route} v4 app module missing`);
      assert(body.includes('/src/v4/experience.js?v=420'),`${route} consolidated v4 experience module missing`);
      assert(body.includes('/src/v4/recommendation.js?v=420'),`${route} recommendation module missing`);
      assert(body.includes('/src/v4/discovery.js?v=420'),`${route} v4.2 discovery module missing`);
      assert(body.includes('/src/v4/discovery.css?v=420'),`${route} v4.2 discovery stylesheet missing`);
    },checks);
  }
  await check('v4-data','/src/v4/data.js',({body})=>{
    assert(body.includes("RELEASE_VERSION='4.2.0'"),'release marker missing');
    assert(body.includes("footmate:v4:session"),'v4 storage missing');
    assert(body.includes('positionSlots'),'position availability data missing');
  },checks);
  await check('v4-experience','/src/v4/experience.js',({body})=>{
    assert(body.includes('validateLogin'),'login validation missing');
    assert(body.includes('detailReturnRoute'),'return navigation missing');
    assert(body.includes('checkedInMatchId'),'check-in persistence missing');
  },checks);
  await check('v4-recommendation','/src/v4/recommendation.js',({body})=>{
    assert(body.includes("version:'4.1.0'"),'recommendation core version missing');
    assert(body.includes('recommendationFor'),'recommendation scoring contract missing');
    assert(body.includes('data-recommendation-score'),'recommendation evidence attribute missing');
  },checks);
  await check('v4-discovery','/src/v4/discovery.js',({body})=>{
    assert(body.includes("DISCOVERY_VERSION='4.2.0'"),'discovery version missing');
    assert(body.includes("DISCOVERY_STORAGE_KEY='footmate:v4:discovery'"),'discovery persistence missing');
    assert(body.includes('history.replaceState'),'discovery URL state missing');
    assert(body.includes('조건 넓히기'),'zero-result recovery missing');
  },checks);
  await check('v4-discovery-css','/src/v4/discovery.css',({body})=>{
    assert(body.includes('.fm-discovery-sheet-backdrop'),'discovery sheet style missing');
    assert(body.includes('min-height:44px'),'filter target size rule missing');
  },checks);
  await check('case-study-story','/src/v4/case-study.js',({body})=>{
    assert(body.includes('iframe src="/app?embed=1"'),'Case Study /app iframe missing');
    for(const forbidden of ['Next Major','Next major candidate','v3.0 stable baseline preserved','기존 v3.0 /demo','v2.4~v3.0']){
      assert(!body.includes(forbidden),`legacy Case Study token remains: ${forbidden}`);
    }
    assert(body.includes('UX 시뮬레이션입니다.'),'auth simulation boundary missing');
  },checks);
  await check('case-study-recommendation','/src/v4/case-study-recommendation.js',({body})=>{
    assert(body.includes('v4.1.0'),'recommendation core Case Study marker missing');
    assert(body.includes('선호 조건이 실제 추천에 반영'),'recommendation narrative missing');
  },checks);
  await check('case-study-discovery','/src/v4/case-study-discovery.js',({body})=>{
    assert(body.includes('v4.2.0'),'v4.2 discovery Case Study marker missing');
    assert(body.includes('날짜·시간·거리·가격·포지션'),'discovery narrative missing');
    assert(body.includes('검색 결과가 0개'),'zero-result narrative missing');
  },checks);
  await check('case-study-editorial','/src/v4/case-study-editorial.css',({body})=>{
    assert(body.includes('text-wrap:balance'),'balanced heading wrap CSS missing');
    assert(body.includes('text-wrap:pretty'),'body wrap CSS missing');
    assert(body.includes('overflow-wrap:anywhere'),'overflow fallback missing');
    assert(body.includes('minmax(340px,360px)'),'desktop Case Study aside sizing contract missing');
    assert(body.includes('.fm-next-cs-final'),'Case Study final panel styling missing');
  },checks);

  const payload={base,checkedAt:new Date().toISOString(),githubSha:process.env.GITHUB_SHA||null,strictProduction:true,passed:checks.every(item=>item.ok),checks};
  fs.writeFileSync(reportFile,JSON.stringify(payload,null,2));
  checks.forEach(item=>console.log(`${item.ok?'PASS':'FAIL'} ${item.name} ${item.route}`));
  if(!payload.passed)process.exitCode=1;
})().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
