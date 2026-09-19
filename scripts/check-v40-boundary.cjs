const fs=require('node:fs');
function read(path){return fs.readFileSync(path,'utf8')}
function assert(condition,message){if(!condition)throw new Error(message)}
const app=read('app.html');
const data=read('src/v4/data.js');
const hardening=read('src/v4/release-hardening.js');
const caseStudy=read('index.html');
const routes=read('vercel.json');
const readme=read('README.md');
assert(app.includes('name="footmate-release" content="4.0.0"'),'v4 release metadata missing');
assert(app.includes('/src/v4/app.js'),'v4 app module missing');
assert(data.includes("RELEASE_VERSION='4.0.0'"),'v4 data release marker missing');
assert(data.includes("NEXT_STORAGE_KEY='footmate:v4:session'"),'v4 storage namespace missing');
assert(hardening.includes("SESSION_KEY='footmate:v4:session'"),'v4 hardening session boundary missing');
assert(caseStudy.includes('FootMate v4.0'),'v4 Case Study shell missing');
assert(caseStudy.includes('/src/v4/case-study.js'),'v4 Case Study runtime missing');
for(const route of ['/app','/demo','/next'])assert(routes.includes(`\"source\":\"${route}\"`)||routes.includes(`"source":"${route}"`),`route ${route} missing`);
for(const path of ['src/next','src/v2','src/v3','footmate-core.js','footmate-patches.js','footmate-product-core.js','index-experience.js','index-patches.js'])assert(!fs.existsSync(path),`legacy public source must be absent: ${path}`);
assert(!readme.includes('Not yet verified'),'README release verification is stale');
console.log('FootMate v4.0 public release boundary PASS');
