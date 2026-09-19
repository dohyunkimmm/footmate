const fs=require('node:fs');
function read(path){return fs.readFileSync(path,'utf8')}
function assert(condition,message){if(!condition)throw new Error(message)}

const app=read('app.html');
const appRuntime=read('src/v4/app.js');
const data=read('src/v4/data.js');
const experience=read('src/v4/experience.js');
const caseStudy=read('index.html');
const story=read('src/v4/case-study.js');
const editorial=read('src/v4/case-study-editorial.css');
const routes=read('vercel.json');
const readme=read('README.md');

assert(app.includes('name="footmate-release" content="4.0.1"'),'v4.0.1 release metadata missing');
assert(app.includes('/src/v4/app.js?v=401'),'v4 app module missing');
assert(app.includes('/src/v4/experience.js?v=401'),'consolidated v4 experience module missing');
assert(data.includes("RELEASE_VERSION='4.0.1'"),'v4.0.1 data release marker missing');
assert(data.includes("NEXT_STORAGE_KEY='footmate:v4:session'"),'v4 storage namespace missing');
assert(data.includes('sampleSchedule'),'relative sample schedule helper missing');
assert(data.includes('샘플 일정'),'sample schedule disclosure missing');
assert(experience.includes("SESSION_KEY='footmate:v4:session'"),'v4 experience session boundary missing');
assert(experience.includes('state.checkedInMatchId!==currentMatchId'),'match-specific check-in guard missing');
assert(appRuntime.includes("location.href='/app'"),'guided mode must return to /app');
assert(appRuntime.includes("setAttribute('tabindex','-1')"),'active-screen focus contract missing');
assert(caseStudy.includes('FootMate v4.0.1'),'v4.0.1 Case Study shell missing');
assert(caseStudy.includes('/src/v4/case-study.js'),'v4 Case Study runtime missing');
assert(caseStudy.includes('/src/v4/case-study-editorial.css'),'Case Study editorial stylesheet missing');
assert(!caseStudy.includes('case-study-release.js'),'Case Study must not depend on release overlay copy mutation');
assert(!fs.existsSync('src/v4/case-study-release.js'),'obsolete Case Study release overlay must be absent');

for(const route of ['/app','/demo','/next'])assert(routes.includes(`"source":"${route}"`),`route ${route} missing`);
for(const path of ['src/next','src/v2','src/v3','footmate-core.js','footmate-patches.js','footmate-product-core.js','index-experience.js','index-patches.js','demo-shell.html','demo-source.html','index-shell.html','index-source.html','next.html','src/v4/real-app-experience.js','src/v4/release-hardening.js'])assert(!fs.existsSync(path),`legacy/redundant public file must be absent: ${path}`);

const forbidden=['Next Major','Next major candidate','Next Major Candidate','다음 버전 경험입니다.','v3.0 stable baseline preserved','기존 v3.0 /demo','v2.4~v3.0','/next?embed=1','stable required check key','legacy screen visual parity',"location.href='/next'","dateLabel:'9월 21일 · 20:00'"];
for(const token of forbidden){
  assert(!story.includes(token),`legacy/editorial token remains in Case Study source: ${token}`);
  assert(!caseStudy.includes(token),`legacy/editorial token remains in Case Study shell: ${token}`);
  assert(!appRuntime.includes(token),`legacy/runtime token remains in app source: ${token}`);
  assert(!experience.includes(token),`legacy/runtime token remains in experience source: ${token}`);
  assert(!data.includes(token),`legacy/runtime token remains in data source: ${token}`);
}

assert(story.includes('iframe src="/app?embed=1"'),'Case Study app iframe must use /app');
assert(story.includes('실제 OAuth, 회원 DB, 서버 인증 세션은 연결하지 않은 UX 시뮬레이션입니다.'),'auth integration boundary missing');
assert(story.includes('외부 AI 모델, 회원 DB, 실시간 정원, 실제 결제, 알림 backend는 연결하지 않았습니다.'),'prototype integration boundary missing');
assert(editorial.includes('text-wrap:balance'),'balanced heading wrap contract missing');
assert(editorial.includes('text-wrap:pretty'),'body text wrap contract missing');
assert(editorial.includes('overflow-wrap:anywhere'),'overflow-wrap fallback missing');
assert(editorial.includes('word-break:keep-all'),'Korean word-break contract missing');
assert(!readme.includes('Not yet verified'),'README release verification is stale');

console.log('FootMate v4.0.1 runtime + repository boundary PASS');
