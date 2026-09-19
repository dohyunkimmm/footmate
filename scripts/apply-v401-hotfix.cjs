const fs=require('node:fs');

function read(path){return fs.readFileSync(path,'utf8')}
function write(path,content){fs.writeFileSync(path,content)}
function replaceOnce(content,from,to,label){
  if(!content.includes(from))throw new Error(`Missing patch target: ${label}`);
  return content.replace(from,to);
}
function replaceAll(content,from,to){return content.split(from).join(to)}
function remove(path){if(fs.existsSync(path))fs.rmSync(path)}
function rename(from,to){if(fs.existsSync(from)){if(fs.existsSync(to))fs.rmSync(to);fs.renameSync(from,to)}}

let app=read('src/v4/app.js');
app=replaceOnce(app,
  '기술 설명보다 사용자가 언제 가치를 느끼고, 왜 가입하며, 어떻게 경기 당일까지 이어지는지를 앞에 둔 다음 버전 경험입니다.',
  '기술 설명보다 사용자가 언제 가치를 느끼고, 왜 가입하며, 어떻게 경기 당일까지 이어지는지를 앞에 둔 v4 공식 경험입니다.',
  'guided release copy');
app=replaceOnce(app,
  "  root.querySelector('[data-screen]')?.focus?.({preventScroll:true});",
  "  const activeScreen=root.querySelector('[data-screen]');\n  if(activeScreen){\n    activeScreen.setAttribute('tabindex','-1');\n    activeScreen.focus({preventScroll:true});\n  }",
  'screen focus management');
app=replaceOnce(app,
  "  if(action==='open-real'){location.href='/next';return;}",
  "  if(action==='open-real'){location.href='/app';return;}",
  'official real app route');
write('src/v4/app.js',app);

let data=read('src/v4/data.js');
data=replaceOnce(data,"export const RELEASE_VERSION='4.0.0';","export const RELEASE_VERSION='4.0.1';",'release version');
const scheduleHelper=`\nfunction sampleSchedule(offsetDays,time){\n  const date=new Date();\n  date.setHours(12,0,0,0);\n  date.setDate(date.getDate()+offsetDays);\n  const day=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(date);\n  const weekday=new Intl.DateTimeFormat('ko-KR',{weekday:'short'}).format(date);\n  return Object.freeze({dateLabel:\`샘플 일정 · \${day} · \${time}\`,shortDate:\`\${weekday} · \${time}\`});\n}\nconst SAMPLE_SCHEDULES=Object.freeze([sampleSchedule(1,'20:00'),sampleSchedule(2,'21:30'),sampleSchedule(3,'19:00')]);\n`;
data=replaceOnce(data,"export const NEXT_STORAGE_KEY='footmate:v4:session';\n","export const NEXT_STORAGE_KEY='footmate:v4:session';\n"+scheduleHelper,'sample schedule helper');
data=replaceOnce(data,"    dateLabel:'9월 21일 · 20:00',\n    shortDate:'월 · 20:00',","    ...SAMPLE_SCHEDULES[0],",'sample schedule 1');
data=replaceOnce(data,"    dateLabel:'9월 22일 · 21:30',\n    shortDate:'화 · 21:30',","    ...SAMPLE_SCHEDULES[1],",'sample schedule 2');
data=replaceOnce(data,"    dateLabel:'9월 23일 · 19:00',\n    shortDate:'수 · 19:00',","    ...SAMPLE_SCHEDULES[2],",'sample schedule 3');
write('src/v4/data.js',data);

let auth=read('src/v4/real-app-experience.js');
auth=replaceOnce(auth,
  '/* FootMate Next Major Candidate · real-app interaction refinements.\n   External authentication remains simulated; the UI models a production sign-in / sign-up experience. */',
  '/* FootMate v4 account experience.\n   External authentication remains simulated; the UI models the official sign-in / sign-up interaction. */',
  'account experience header');
let hardening=read('src/v4/release-hardening.js');
hardening=replaceOnce(hardening,
  '/* FootMate v4.0 release-hardening layer.\n   Keeps the verified account/SSO experience intact and owns validation, return navigation and check-in persistence. */',
  '/* FootMate v4 interaction safeguards.\n   Owns validation, return navigation, guest identity and match-specific check-in persistence. */',
  'hardening header');
hardening=replaceOnce(hardening,
  "    const state=interaction();\n    if(!state.checkedInMatchId)return;",
  "    const state=interaction();\n    const session=read(SESSION_KEY);\n    const currentMatchId=session.joinedMatchId||session.selectedMatchId||(mode==='evidence'?'evidence-match':null);\n    if(!state.checkedInMatchId||state.checkedInMatchId!==currentMatchId)return;",
  'match-specific check-in guard');
write('src/v4/experience.js',`${auth.trim()}\n\n${hardening.trim()}\n`);
remove('src/v4/real-app-experience.js');
remove('src/v4/release-hardening.js');
rename('src/v4/real-app-experience.css','src/v4/experience.css');

let appHtml=read('app.html');
appHtml=replaceAll(appHtml,'FootMate v4.0 |','FootMate v4.0.1 |');
appHtml=replaceAll(appHtml,'FootMate v4.0 Matchday','FootMate v4.0.1 Matchday');
appHtml=replaceAll(appHtml,'content="4.0.0"','content="4.0.1"');
appHtml=replaceAll(appHtml,'/src/v4/app.css?v=400','/src/v4/app.css?v=401');
appHtml=replaceAll(appHtml,'/src/v4/real-app-experience.css?v=400','/src/v4/experience.css?v=401');
appHtml=replaceAll(appHtml,'/src/v4/app.js?v=400','/src/v4/app.js?v=401');
appHtml=replaceOnce(appHtml,
  '<script type="module" src="/src/v4/real-app-experience.js?v=400"></script>\n<script type="module" src="/src/v4/release-hardening.js?v=400"></script>',
  '<script type="module" src="/src/v4/experience.js?v=401"></script>',
  'experience script consolidation');
write('app.html',appHtml);

let index=read('index.html');
index=replaceAll(index,'FootMate v4.0 |','FootMate v4.0.1 |');
index=replaceAll(index,'FootMate v4.0 Matchday','FootMate v4.0.1 Matchday');
index=replaceAll(index,'content="4.0.0"','content="4.0.1"');
index=replaceAll(index,'FootMate v4.0 ·','FootMate v4.0.1 ·');
index=replaceAll(index,'v=400','v=401');
write('index.html',index);

let story=read('src/v4/case-study.js');
story=replaceAll(story,'v4.0.0','v4.0.1');
write('src/v4/case-study.js',story);

remove('demo-shell.html');
remove('demo-source.html');
remove('index-shell.html');
remove('index-source.html');
remove('next.html');

write('vercel.json',`{\n  "$schema": "https://openapi.vercel.sh/vercel.json",\n  "git": {\n    "deploymentEnabled": {\n      "*": false,\n      "main": true\n    }\n  },\n  "ignoreCommand": "node scripts/vercel-ignore-build.cjs",\n  "cleanUrls": false,\n  "trailingSlash": false,\n  "rewrites": [\n    {"source":"/app","destination":"/app.html"},\n    {"source":"/demo","destination":"/app.html"},\n    {"source":"/demo.html","destination":"/app.html"},\n    {"source":"/next","destination":"/app.html"},\n    {"source":"/next.html","destination":"/app.html"}\n  ]\n}\n`);

write('tests/e2e/server.cjs',`const http=require('node:http');\nconst fs=require('node:fs');\nconst path=require('node:path');\nconst root=process.env.FOOTMATE_SERVER_ROOT?path.resolve(process.env.FOOTMATE_SERVER_ROOT):path.resolve(__dirname,'../..');\nconst port=Number(process.env.PORT||4173);const host=process.env.HOST||'127.0.0.1';\nconst rewrites=new Map([['/','index.html'],['/index','index.html'],['/app','app.html'],['/demo','app.html'],['/demo.html','app.html'],['/next','app.html'],['/next.html','app.html']]);\nconst types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json; charset=utf-8'};\nfunction resolveFile(urlPath){const pathname=decodeURIComponent(urlPath.split('?')[0]);const mapped=rewrites.get(pathname);const relative=mapped||pathname.replace(/^\\/+/, '');const candidates=mapped||path.extname(relative)?[relative]:[\`${relative}.html\`,relative];for(const candidate of candidates){const full=path.resolve(root,candidate);if(full!==root&&!full.startsWith(root+path.sep))continue;if(fs.existsSync(full)&&fs.statSync(full).isFile())return full}return null}\nconst server=http.createServer((req,res)=>{const file=resolveFile(req.url||'/');if(!file){res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not found');return}const type=types[path.extname(file).toLowerCase()]||'application/octet-stream';res.writeHead(200,{'content-type':type,'cache-control':'no-store'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res)});\nserver.listen(port,host,()=>console.log(\`FootMate v4 test server serving ${root} at http://${host}:${port}\`));\n`);

rename('tests/e2e/v40-major.spec.cjs','tests/e2e/v4-app.spec.cjs');
rename('tests/e2e/v40-case-study-editorial.spec.cjs','tests/e2e/v4-case-study.spec.cjs');
rename('tests/e2e/v40-production.spec.cjs','tests/e2e/v4-production.spec.cjs');
rename('tests/production-v40-smoke.cjs','tests/production-v4-smoke.cjs');
rename('scripts/check-v40-boundary.cjs','scripts/check-v4-boundary.cjs');

let appSpec=read('tests/e2e/v4-app.spec.cjs');
appSpec=replaceAll(appSpec,'4.0.0','4.0.1');
appSpec += `\n\ntest('v4.0.1 guided mode returns to the official /app surface',async({page})=>{const errs=await boot(page,'/app?mode=guided',{width:1280,height:900});await expect(page.getByText('v4 공식 경험입니다.',{exact:false})).toBeVisible();await expect(page.getByText('다음 버전 경험입니다.',{exact:false})).toHaveCount(0);await page.getByRole('button',{name:'Real App만 보기'}).click();await expect(page).toHaveURL(/\\/app$/);await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content','4.0.1');expect(errs).toEqual([])});\n\ntest('v4.0.1 sample schedules stay relative instead of aging into past dates',async({page})=>{const errs=await boot(page);await setup(page);const labels=await page.locator('.fm-next-match-date > span:first-child').allTextContents();const expected=await page.evaluate(()=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+1);return new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(d)});expect(labels.length).toBeGreaterThan(0);expect(labels[0]).toContain('샘플 일정');expect(labels[0]).toContain(expected);expect(errs).toEqual([])});\n\ntest('v4.0.1 check-in persistence is isolated to the joined match',async({page})=>{const errs=await boot(page);await page.evaluate(()=>{localStorage.setItem('footmate:v4:session',JSON.stringify({setupComplete:true,route:'schedule',signedIn:true,joinedMatchId:'gwanggyo-2130',selectedMatchId:'gwanggyo-2130',matchStage:'matchday'}));localStorage.setItem('footmate:v4:interaction',JSON.stringify({checkedInMatchId:'suwon-ingye-2000',checkedInAt:Date.now()}));location.reload()});await page.waitForSelector('[data-screen="schedule"]');await expect(page.getByRole('button',{name:'체크인'})).toBeVisible();await expect(page.getByRole('button',{name:'체크인 완료'})).toHaveCount(0);await page.getByRole('button',{name:'체크인'}).click();await expect(page.getByRole('button',{name:'체크인 완료'})).toBeDisabled();expect(errs).toEqual([])});\n\ntest('v4.0.1 route transitions move programmatic focus to the active screen',async({page})=>{const errs=await boot(page);await expect(page.locator('[data-screen="welcome"]')).toHaveAttribute('tabindex','-1');expect(await page.evaluate(()=>document.activeElement?.dataset?.screen)).toBe('welcome');await page.getByRole('button',{name:/내 경기 찾아보기/}).click();expect(await page.evaluate(()=>document.activeElement?.dataset?.screen)).toBe('setup');await page.getByRole('button',{name:'다음'}).click();await page.getByRole('button',{name:'다음'}).click();await page.getByRole('button',{name:/추천 경기 보기/}).click();await page.locator('.fm-next-match-card').first().click();expect(await page.evaluate(()=>document.activeElement?.dataset?.screen)).toBe('detail');expect(errs).toEqual([])});\n`;
write('tests/e2e/v4-app.spec.cjs',appSpec);

for(const file of ['tests/e2e/v4-case-study.spec.cjs','tests/e2e/v4-production.spec.cjs','tests/production-v4-smoke.cjs']){
  write(file,replaceAll(read(file),'4.0.0','4.0.1'));
}

write('scripts/check-v4-boundary.cjs',`const fs=require('node:fs');\nfunction read(path){return fs.readFileSync(path,'utf8')}\nfunction assert(condition,message){if(!condition)throw new Error(message)}\n\nconst app=read('app.html');\nconst appRuntime=read('src/v4/app.js');\nconst data=read('src/v4/data.js');\nconst experience=read('src/v4/experience.js');\nconst caseStudy=read('index.html');\nconst story=read('src/v4/case-study.js');\nconst editorial=read('src/v4/case-study-editorial.css');\nconst routes=read('vercel.json');\nconst readme=read('README.md');\n\nassert(app.includes('name="footmate-release" content="4.0.1"'),'v4.0.1 release metadata missing');\nassert(app.includes('/src/v4/app.js?v=401'),'v4 app module missing');\nassert(app.includes('/src/v4/experience.js?v=401'),'consolidated v4 experience module missing');\nassert(data.includes("RELEASE_VERSION='4.0.1'"),'v4.0.1 data release marker missing');\nassert(data.includes("NEXT_STORAGE_KEY='footmate:v4:session'"),'v4 storage namespace missing');\nassert(data.includes('sampleSchedule'),'relative sample schedule helper missing');\nassert(data.includes('샘플 일정'),'sample schedule disclosure missing');\nassert(experience.includes("SESSION_KEY='footmate:v4:session'"),'v4 experience session boundary missing');\nassert(experience.includes('state.checkedInMatchId!==currentMatchId'),'match-specific check-in guard missing');\nassert(appRuntime.includes("location.href='/app'"),'guided mode must return to /app');\nassert(appRuntime.includes("setAttribute('tabindex','-1')"),'active-screen focus contract missing');\nassert(caseStudy.includes('FootMate v4.0.1'),'v4.0.1 Case Study shell missing');\nassert(caseStudy.includes('/src/v4/case-study.js'),'v4 Case Study runtime missing');\nassert(caseStudy.includes('/src/v4/case-study-editorial.css'),'Case Study editorial stylesheet missing');\nassert(!caseStudy.includes('case-study-release.js'),'Case Study must not depend on release overlay copy mutation');\nassert(!fs.existsSync('src/v4/case-study-release.js'),'obsolete Case Study release overlay must be absent');\n\nfor(const route of ['/app','/demo','/next'])assert(routes.includes(\`"source":"${route}"\`),\`route ${route} missing\`);\nfor(const path of ['src/next','src/v2','src/v3','footmate-core.js','footmate-patches.js','footmate-product-core.js','index-experience.js','index-patches.js','demo-shell.html','demo-source.html','index-shell.html','index-source.html','next.html','src/v4/real-app-experience.js','src/v4/release-hardening.js'])assert(!fs.existsSync(path),\`legacy/redundant public file must be absent: ${path}\`);\n\nconst forbidden=['Next Major','Next major candidate','Next Major Candidate','다음 버전 경험입니다.','v3.0 stable baseline preserved','기존 v3.0 /demo','v2.4~v3.0','/next?embed=1','stable required check key','legacy screen visual parity',"location.href='/next'","dateLabel:'9월 21일 · 20:00'"];\nfor(const token of forbidden){\n  assert(!story.includes(token),\`legacy/editorial token remains in Case Study source: ${token}\`);\n  assert(!caseStudy.includes(token),\`legacy/editorial token remains in Case Study shell: ${token}\`);\n  assert(!appRuntime.includes(token),\`legacy/runtime token remains in app source: ${token}\`);\n  assert(!experience.includes(token),\`legacy/runtime token remains in experience source: ${token}\`);\n  assert(!data.includes(token),\`legacy/runtime token remains in data source: ${token}\`);\n}\n\nassert(story.includes('iframe src="/app?embed=1"'),'Case Study app iframe must use /app');\nassert(story.includes('실제 OAuth, 회원 DB, 서버 인증 세션은 연결하지 않은 UX 시뮬레이션입니다.'),'auth integration boundary missing');\nassert(story.includes('외부 AI 모델, 회원 DB, 실시간 정원, 실제 결제, 알림 backend는 연결하지 않았습니다.'),'prototype integration boundary missing');\nassert(editorial.includes('text-wrap:balance'),'balanced heading wrap contract missing');\nassert(editorial.includes('text-wrap:pretty'),'body text wrap contract missing');\nassert(editorial.includes('overflow-wrap:anywhere'),'overflow-wrap fallback missing');\nassert(editorial.includes('word-break:keep-all'),'Korean word-break contract missing');\nassert(!readme.includes('Not yet verified'),'README release verification is stale');\n\nconsole.log('FootMate v4.0.1 runtime + repository boundary PASS');\n`);

write('.github/workflows/qa.yml',`name: FootMate QA\n\non:\n  pull_request:\n    branches: [main]\n  push:\n    branches: [main]\n\npermissions:\n  contents: read\n  statuses: read\n\nconcurrency:\n  group: footmate-qa-\${{ github.ref }}\n  cancel-in-progress: true\n\njobs:\n  regression:\n    name: Regression 36\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v5\n      - uses: actions/setup-node@v5\n        with:\n          node-version: '24'\n          package-manager-cache: false\n      - name: Check v4 release boundary\n        run: node scripts/check-v4-boundary.cjs\n\n  browser-e2e:\n    name: Browser E2E + axe\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v5\n      - uses: actions/setup-node@v5\n        with:\n          node-version: '24'\n          package-manager-cache: false\n      - name: Install browser QA dependencies\n        run: npm install --no-save @playwright/test@1.55.0 @axe-core/playwright@4.10.2\n      - name: Install Chromium\n        run: npx playwright install --with-deps chromium\n      - name: Run v4 browser, state, responsive, editorial and accessibility gates\n        run: npx playwright test tests/e2e/v4-app.spec.cjs tests/e2e/v4-case-study.spec.cjs\n      - name: Upload browser QA evidence\n        if: always()\n        uses: actions/upload-artifact@v6\n        with:\n          name: v4-browser-e2e-\${{ github.run_id }}\n          path: |\n            playwright-report/\n            test-results/\n          if-no-files-found: warn\n          retention-days: 14\n\n  production-smoke:\n    name: Production Smoke\n    if: github.event_name == 'push'\n    needs: [regression, browser-e2e]\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v5\n      - uses: actions/setup-node@v5\n        with:\n          node-version: '24'\n          package-manager-cache: false\n      - name: Wait for exact Vercel deployment\n        env:\n          GH_TOKEN: \${{ github.token }}\n        run: |\n          for attempt in \$(seq 1 42); do\n            status_json="\$(gh api "repos/\${GITHUB_REPOSITORY}/commits/\${GITHUB_SHA}/status")"\n            state="\$(printf '%s' "\$status_json" | jq -r '[.statuses[] | select(.context=="Vercel")][0].state // ""')"\n            description="\$(printf '%s' "\$status_json" | jq -r '[.statuses[] | select(.context=="Vercel")][0].description // ""')"\n            echo "Vercel status: \${state:-pending} \${description}"\n            if [ "\$state" = "success" ]; then exit 0; fi\n            if [ "\$state" = "failure" ] || [ "\$state" = "error" ]; then exit 1; fi\n            sleep 10\n          done\n          echo "Timed out waiting for exact Vercel deployment \${GITHUB_SHA}."\n          exit 1\n      - name: Run v4 exact Production HTTP smoke\n        env:\n          FOOTMATE_PRODUCTION_URL: https://footmate-black.vercel.app\n          FOOTMATE_STRICT_PRODUCTION: 'true'\n        run: node tests/production-v4-smoke.cjs\n      - name: Install Production browser dependency\n        run: npm install --no-save @playwright/test@1.55.0\n      - name: Install Chromium\n        run: npx playwright install --with-deps chromium\n      - name: Run v4 exact Production Chromium smoke\n        env:\n          BASE_URL: https://footmate-black.vercel.app\n          PRODUCTION_SMOKE: '1'\n          FOOTMATE_STRICT_PRODUCTION: 'true'\n        run: npx playwright test tests/e2e/v4-production.spec.cjs\n      - name: Upload Production QA evidence\n        if: always()\n        uses: actions/upload-artifact@v6\n        with:\n          name: v4-production-\${{ github.run_id }}\n          path: |\n            playwright-report/\n            test-results/\n          if-no-files-found: warn\n          retention-days: 14\n`);

console.log('Applied FootMate v4.0.1 runtime and repository cleanup patch.');
