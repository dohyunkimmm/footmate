const fs=require('node:fs');

function read(path){return fs.readFileSync(path,'utf8')}
function assert(condition,message){if(!condition)throw new Error(message)}

const entry=read('next.html');
const app=read('src/next/app.js');
const data=read('src/next/data.js');
const styles=read('src/next/app.css');
const realApp=read('src/next/real-app-experience.js');
const realAppStyles=read('src/next/real-app-experience.css');
const caseStudy=read('src/next/case-study.js');
const caseStudyStyles=read('src/next/case-study.css');
const index=read('index.html');
const indexShell=read('index-shell.html');
const vercel=read('vercel.json');
const stableShell=read('demo-shell.html');

assert(index===indexShell,'canonical Case Study shell and index.html must stay synchronized');
for(const asset of ['/src/next/app.css','/src/next/app.js','/src/next/real-app-experience.css','/src/next/real-app-experience.js'])assert(entry.includes(asset),`next entry missing ${asset}`);
assert(vercel.includes('"source": "/next"'),'next route missing from Vercel rewrites');
assert(vercel.includes('"destination": "/next.html"'),'next route destination missing');

for(const marker of ["NEXT_RELEASE='next-major'","NEXT_STORAGE_KEY='footmate:next:session'",'MATCHES=Object.freeze','setupComplete:false','signedIn:false'])assert(data.includes(marker),`next data contract missing ${marker}`);
for(const marker of ['Value first','Preference before account','Sign in to join','Matchday continuity','결정에 필요한 이유만 먼저 보여드려요.','start-setup','join-match','sign-in','confirm-payment','scenario-matchday','scenario-postgame',"mode==='evidence'"])assert(app.includes(marker),`next experience missing ${marker}`);
assert(app.indexOf("action==='join-match'")<app.indexOf("action==='sign-in'"),'join intent must precede sign-in handling');
assert(app.includes("setState({route:state.signedIn?'checkout':'auth'})"),'join must gate auth only at participation intent');
assert(app.includes("else setState({setupComplete:true,route:'home'})"),'setup must reach recommendations/home before auth');

for(const marker of ['--fm-pitch:#0b251b','--fm-lime:#c9ef62','.fm-next-nav','@media(max-width:340px)','@media(prefers-reduced-motion:reduce)'])assert(styles.includes(marker),`next visual system missing ${marker}`);
for(const marker of ['font-size:16px','font-size:15px','min-height:52px'])assert(styles.includes(marker),`next product readability/touch contract missing ${marker}`);
assert(!app.includes('🤖')&&!app.includes('⚽')&&!app.includes('✨'),'next product must use SVG iconography instead of emoji UI');
assert(realAppStyles.includes('.fm-next-intro:before,.fm-next-intro:after{pointer-events:none}'),'intro decoration must never intercept the primary CTA');
for(const marker of ['아이디 또는 이메일','비밀번호','카카오로 계속하기','네이버로 계속하기','Apple로 계속하기','Google로 계속하기','회원가입','모두 동의합니다.'])assert(realApp.includes(marker),`account + SSO experience missing ${marker}`);

assert(indexShell.includes('/src/next/case-study.css'),'case study shell missing next narrative CSS');
assert(indexShell.includes('/src/next/case-study.js'),'case study shell missing next narrative JS');
for(const marker of ['내 수준에 맞는 경기부터','Find</b><i>→</i><b>Decide','/next?embed=1','v3.0 stable baseline preserved','Value → Preferences → Recommendation → Sign in to Join','ID·PW / Kakao / Naver / Apple / Google','실제 Kakao/Naver/Apple/Google OAuth, 회원 DB, 서버 세션은 미연동'])assert(caseStudy.includes(marker),`next case-study narrative missing ${marker}`);
assert(caseStudyStyles.includes('#c9ef62'),'case study must share the Matchday accent');

assert(stableShell.includes('/src/v3/release.js'),'stable /demo v3 release baseline must remain available during next-major development');
assert(!stableShell.includes('/src/next/'),'next-major assets must not silently replace stable /demo before promotion');

console.log('next-major product/case-study boundary: PASS');
