const fs=require('node:fs');
const path=require('node:path');
const base=(process.env.FOOTMATE_PRODUCTION_URL||'https://footmate-black.vercel.app').replace(/\/$/,'');
const strict=['1','true','yes'].includes(String(process.env.FOOTMATE_STRICT_PRODUCTION||'').toLowerCase());
const reportDir=path.resolve('test-results');
const reportFile=path.join(reportDir,'production-v40-smoke.json');

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
    assert(body.includes('footmate-case-study-release" content="4.0.1"'),'case study v4 metadata missing');
    assert(body.includes('/src/v4/case-study.js'),'v4 case study runtime missing');
    assert(body.includes('/src/v4/case-study-editorial.css'),'Case Study editorial stylesheet missing');
    assert(!body.includes('case-study-release.js'),'obsolete Case Study release overlay still loaded');
  },checks);
  for(const route of ['/app','/demo','/next']){
    await check(`app-${route}`,route,({body})=>{
      assert(body.includes('footmate-release" content="4.0.1"'),`${route} v4 release metadata missing`);
      assert(body.includes('/src/v4/app.js'),`${route} v4 app module missing`);
    },checks);
  }
  await check('v4-data','/src/v4/data.js',({body})=>{
    assert(body.includes("RELEASE_VERSION='4.0.1'"),'release marker missing');
    assert(body.includes("footmate:v4:session"),'v4 storage missing');
  },checks);
  await check('v4-hardening','/src/v4/release-hardening.js',({body})=>{
    assert(body.includes('validateLogin'),'login validation missing');
    assert(body.includes('detailReturnRoute'),'return navigation missing');
    assert(body.includes('checkedInMatchId'),'check-in persistence missing');
  },checks);
  await check('case-study-story','/src/v4/case-study.js',({body})=>{
    assert(body.includes('iframe src="/app?embed=1"'),'Case Study /app iframe missing');
    for(const forbidden of ['Next Major','Next major candidate','v3.0 stable baseline preserved','기존 v3.0 /demo','v2.4~v3.0']){
      assert(!body.includes(forbidden),`legacy Case Study token remains: ${forbidden}`);
    }
    assert(body.includes('UX 시뮬레이션입니다.'),'auth simulation boundary missing');
  },checks);
  await check('case-study-editorial','/src/v4/case-study-editorial.css',({body})=>{
    assert(body.includes('text-wrap:balance'),'balanced heading wrap CSS missing');
    assert(body.includes('text-wrap:pretty'),'body wrap CSS missing');
    assert(body.includes('overflow-wrap:anywhere'),'overflow fallback missing');
  },checks);

  const payload={base,checkedAt:new Date().toISOString(),githubSha:process.env.GITHUB_SHA||null,strictProduction:true,passed:checks.every(item=>item.ok),checks};
  fs.writeFileSync(reportFile,JSON.stringify(payload,null,2));
  checks.forEach(item=>console.log(`${item.ok?'PASS':'FAIL'} ${item.name} ${item.route}`));
  if(!payload.passed)process.exitCode=1;
})().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
