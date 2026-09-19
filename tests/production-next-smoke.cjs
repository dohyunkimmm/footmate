const fs=require('node:fs');
const path=require('node:path');

const base=(process.env.FOOTMATE_PRODUCTION_URL||'https://footmate-black.vercel.app').replace(/\/$/,'');
const strict=['1','true','yes'].includes(String(process.env.FOOTMATE_STRICT_PRODUCTION||'').toLowerCase());
const reportDir=path.resolve('test-results');
const reportFile=path.join(reportDir,'production-next-smoke.json');
function assert(condition,message){if(!condition)throw new Error(message)}
async function fetchText(route){const response=await fetch(base+route,{redirect:'follow',headers:{'user-agent':'FootMate-next-QA/1.0'}});return{status:response.status,contentType:response.headers.get('content-type')||'',body:await response.text()}}
async function check(name,route,verify,checks){try{const result=await fetchText(route);assert(result.status>=200&&result.status<300,`${route} returned ${result.status}`);verify(result);checks.push({name,route,ok:true,status:result.status})}catch(error){checks.push({name,route,ok:false,error:error.message})}}
async function main(){
  fs.mkdirSync(reportDir,{recursive:true});
  if(!strict){fs.writeFileSync(reportFile,JSON.stringify({base,strictProduction:false,skipped:true,passed:true},null,2)+'\n');console.log('SKIP next-major exact Production HTTP smoke: strict exact deployment was not verified.');return}
  const checks=[];
  await check('next-entry','/next',({body,contentType})=>{assert(contentType.includes('text/html'),'/next must return HTML');assert(body.includes('name="footmate-next-release" content="matchday-companion-candidate"'),'next release metadata missing');assert(body.includes('/src/next/app.css'),'/next app stylesheet missing');assert(body.includes('/src/next/app.js'),'/next app module missing')},checks);
  await check('next-app','/src/next/app.js',({body})=>{for(const marker of ['Value first','Sign in to join','join-match','confirm-payment','scenario-matchday'])assert(body.includes(marker),`next app missing ${marker}`)},checks);
  await check('next-data','/src/next/data.js',({body})=>{assert(body.includes("NEXT_RELEASE='next-major'"),'next release marker missing');assert(body.includes('setupComplete:false'),'guest-first default missing');assert(body.includes('signedIn:false'),'signed-out default missing')},checks);
  await check('next-style','/src/next/app.css',({body})=>{assert(body.includes('--fm-pitch:#0b251b'),'pitch token missing');assert(body.includes('--fm-lime:#c9ef62'),'lime token missing');assert(body.includes('@media(max-width:340px)'),'mobile guard missing')},checks);
  await check('case-study-cover','/',({body})=>{assert(body.includes('/src/next/case-study.js'),'next case-study cover loader missing');assert(body.includes('/src/next/case-study.css'),'next case-study cover style missing')},checks);
  const payload={base,checkedAt:new Date().toISOString(),githubSha:process.env.GITHUB_SHA||null,strictProduction:true,passed:checks.every(item=>item.ok),checks};
  fs.writeFileSync(reportFile,JSON.stringify(payload,null,2)+'\n');
  for(const item of checks)console.log(`${item.ok?'PASS':'FAIL'} ${item.name} ${item.route}${item.status?` (${item.status})`:''}${item.error?` ${item.error}`:''}`);
  if(!payload.passed)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1});
