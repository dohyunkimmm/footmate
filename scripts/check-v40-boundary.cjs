const fs=require('node:fs');
function read(path){return fs.readFileSync(path,'utf8')}
function assert(condition,message){if(!condition)throw new Error(message)}

const app=read('app.html');
const data=read('src/v4/data.js');
const hardening=read('src/v4/release-hardening.js');
const caseStudy=read('index.html');
const story=read('src/v4/case-study.js');
const editorial=read('src/v4/case-study-editorial.css');
const routes=read('vercel.json');
const readme=read('README.md');

assert(app.includes('name="footmate-release" content="4.0.0"'),'v4 release metadata missing');
assert(app.includes('/src/v4/app.js'),'v4 app module missing');
assert(data.includes("RELEASE_VERSION='4.0.0'"),'v4 data release marker missing');
assert(data.includes("NEXT_STORAGE_KEY='footmate:v4:session'"),'v4 storage namespace missing');
assert(hardening.includes("SESSION_KEY='footmate:v4:session'"),'v4 hardening session boundary missing');
assert(caseStudy.includes('FootMate v4.0'),'v4 Case Study shell missing');
assert(caseStudy.includes('/src/v4/case-study.js'),'v4 Case Study runtime missing');
assert(caseStudy.includes('/src/v4/case-study-editorial.css'),'Case Study editorial stylesheet missing');
assert(!caseStudy.includes('case-study-release.js'),'Case Study must not depend on release overlay copy mutation');
assert(!fs.existsSync('src/v4/case-study-release.js'),'obsolete Case Study release overlay must be absent');

for(const route of ['/app','/demo','/next']){
  assert(routes.includes(`\"source\":\"${route}\"`)||routes.includes(`"source":"${route}"`),`route ${route} missing`);
}
for(const path of ['src/next','src/v2','src/v3','footmate-core.js','footmate-patches.js','footmate-product-core.js','index-experience.js','index-patches.js']){
  assert(!fs.existsSync(path),`legacy public source must be absent: ${path}`);
}

const forbidden=[
  'Next Major',
  'Next major candidate',
  'v3.0 stable baseline preserved',
  '기존 v3.0 /demo',
  'v2.4~v3.0',
  '/next?embed=1',
  'stable required check key',
  'legacy screen visual parity'
];
for(const token of forbidden){
  assert(!story.includes(token),`legacy/editorial token remains in Case Study source: ${token}`);
  assert(!caseStudy.includes(token),`legacy/editorial token remains in Case Study shell: ${token}`);
}

assert(story.includes('iframe src="/app?embed=1"'),'Case Study app iframe must use /app');
assert(story.includes('실제 OAuth, 회원 DB, 서버 인증 세션은 연결하지 않은 UX 시뮬레이션입니다.'),'auth integration boundary missing');
assert(story.includes('외부 AI 모델, 회원 DB, 실시간 정원, 실제 결제, 알림 backend는 연결하지 않았습니다.'),'prototype integration boundary missing');
assert(editorial.includes('text-wrap:balance'),'balanced heading wrap contract missing');
assert(editorial.includes('text-wrap:pretty'),'body text wrap contract missing');
assert(editorial.includes('overflow-wrap:anywhere'),'overflow-wrap fallback missing');
assert(editorial.includes('word-break:keep-all'),'Korean word-break contract missing');
assert(!readme.includes('Not yet verified'),'README release verification is stale');

console.log('FootMate v4.0 public release + Case Study editorial boundary PASS');
