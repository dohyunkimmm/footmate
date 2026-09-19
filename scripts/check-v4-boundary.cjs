const fs=require('node:fs');
function read(path){return fs.readFileSync(path,'utf8')}
function assert(condition,message){if(!condition)throw new Error(message)}

const app=read('app.html');
const appRuntime=read('src/v4/app.js');
const data=read('src/v4/data.js');
const experience=read('src/v4/experience.js');
const recommendation=read('src/v4/recommendation.js');
const discovery=read('src/v4/discovery.js');
const discoveryCss=read('src/v4/discovery.css');
const caseStudy=read('index.html');
const story=read('src/v4/case-study.js');
const caseStudyRecommendation=read('src/v4/case-study-recommendation.js');
const caseStudyDiscovery=read('src/v4/case-study-discovery.js');
const editorial=read('src/v4/case-study-editorial.css');
const productionSmoke=read('tests/production-v4-smoke.cjs');
const routes=read('vercel.json');
const readme=read('README.md');
const roadmap=read('docs/V4.1-V5.0-ROADMAP.md');

assert(app.includes('name="footmate-release" content="4.2.0"'),'v4.2.0 release metadata missing');
assert(app.includes('/src/v4/app.js?v=420'),'v4 app module missing');
assert(app.includes('/src/v4/experience.js?v=420'),'consolidated v4 experience module missing');
assert(app.includes('/src/v4/recommendation.js?v=420'),'v4.1 recommendation core module missing');
assert(app.includes('/src/v4/discovery.js?v=420'),'v4.2 discovery module missing');
assert(app.includes('/src/v4/discovery.css?v=420'),'v4.2 discovery stylesheet missing');
assert(data.includes("RELEASE_VERSION='4.2.0'"),'v4.2.0 data release marker missing');
assert(data.includes("NEXT_STORAGE_KEY='footmate:v4:session'"),'v4 storage namespace missing');
assert(data.includes('sampleSchedule'),'relative sample schedule helper missing');
assert(data.includes('샘플 일정'),'sample schedule disclosure missing');
assert(data.includes('positionSlots'),'position availability data missing');
assert(data.includes("region:'서울 · 강남'"),'cross-region recommendation data missing');
assert(experience.includes("SESSION_KEY='footmate:v4:session'"),'v4 experience session boundary missing');
assert(experience.includes('state.checkedInMatchId!==currentMatchId'),'match-specific check-in guard missing');
assert(recommendation.includes("version:'4.1.0'"),'v4.1 recommendation engine version missing');
assert(recommendation.includes('recommendationFor'),'recommendation scoring contract missing');
assert(recommendation.includes('data-recommendation-score'),'recommendation QA evidence attribute missing');
assert(discovery.includes("DISCOVERY_VERSION='4.2.0'"),'v4.2 discovery version missing');
assert(discovery.includes("DISCOVERY_STORAGE_KEY='footmate:v4:discovery'"),'discovery persistence namespace missing');
assert(discovery.includes("date:'all',time:'all',distance:'all',price:'all',position:'all',sort:'fit'"),'discovery filter contract missing');
assert(discovery.includes("sort==='closing'"),'closing-soon sort missing');
assert(discovery.includes('history.replaceState'),'URL persistence contract missing');
assert(discovery.includes("role=\"dialog\""),'filter dialog accessibility contract missing');
assert(discovery.includes("event.key==='Escape'"),'filter dialog Escape recovery missing');
assert(discovery.includes('조건 넓히기'),'zero-result recovery action missing');
assert(discoveryCss.includes('.fm-discovery-sheet-backdrop'),'discovery sheet styling missing');
assert(discoveryCss.includes('min-height:44px'),'discovery target-size contract missing');
assert(appRuntime.includes("location.href='/app'"),'guided mode must return to /app');
assert(appRuntime.includes("setAttribute('tabindex','-1')"),'active-screen focus contract missing');
assert(caseStudy.includes('FootMate v4.2.0'),'v4.2.0 Case Study shell missing');
assert(caseStudy.includes('/src/v4/case-study.js?v=420'),'v4 Case Study runtime missing');
assert(caseStudy.includes('/src/v4/case-study-recommendation.js?v=420'),'recommendation Case Study evidence missing');
assert(caseStudy.includes('/src/v4/case-study-discovery.js?v=420'),'v4.2 discovery Case Study evidence missing');
assert(caseStudy.includes('/src/v4/case-study-editorial.css?v=420'),'Case Study editorial stylesheet missing');
assert(caseStudyRecommendation.includes('선호 조건이 실제 추천에 반영'),'Case Study recommendation narrative missing');
assert(caseStudyDiscovery.includes('날짜·시간·거리·가격·포지션'),'Case Study discovery narrative missing');
assert(caseStudyDiscovery.includes('검색 결과가 0개'),'Case Study zero-result recovery narrative missing');
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
  assert(!recommendation.includes(token),`legacy/runtime token remains in recommendation source: ${token}`);
  assert(!discovery.includes(token),`legacy/runtime token remains in discovery source: ${token}`);
}

assert(story.includes('iframe src="/app?embed=1"'),'Case Study app iframe must use /app');
assert(story.includes('실제 OAuth, 회원 DB, 서버 인증 세션은 연결하지 않은 UX 시뮬레이션입니다.'),'auth integration boundary missing');
assert(story.includes('외부 AI 모델, 회원 DB, 실시간 정원, 실제 결제, 알림 backend는 연결하지 않았습니다.'),'prototype integration boundary missing');
assert(editorial.includes('text-wrap:balance'),'balanced heading wrap contract missing');
assert(editorial.includes('text-wrap:pretty'),'body wrap contract missing');
assert(editorial.includes('overflow-wrap:anywhere'),'overflow-wrap fallback missing');
assert(editorial.includes('word-break:keep-all'),'Korean word-break contract missing');
assert(editorial.includes('minmax(340px,360px)'),'desktop companion panel sizing contract missing');
assert(editorial.includes('.fm-next-cs-day-states'),'Matchday structured grid styling missing');
assert(editorial.includes('.fm-next-cs-recovery'),'Recovery structured grid styling missing');
assert(editorial.includes('.fm-next-cs-outcomes'),'Outcome structured grid styling missing');
assert(editorial.includes('.fm-next-cs-final'),'final companion panel styling missing');
assert(productionSmoke.includes("'/src/v4/experience.js'"),'Production smoke must validate consolidated experience runtime');
assert(productionSmoke.includes("'/src/v4/discovery.js'"),'Production smoke must validate discovery runtime');
assert(!productionSmoke.includes("'/src/v4/release-hardening.js'"),'Production smoke must not reference removed release hardening file');
assert(roadmap.includes('## v4.2 — Discovery & Search'),'v4.2 roadmap missing');
assert(roadmap.includes('## v5.0 — Connected Matchday Platform'),'v5.0 roadmap missing');
assert(!readme.includes('Not yet verified'),'README release verification is stale');

console.log('FootMate v4.2 runtime + discovery + repository boundary PASS');
