import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {rankRecommendations} from '../../src/platform/domain/recommendation.js';
import {PERFORMANCE_BUDGET,RUNTIME_PERFORMANCE_BUDGET} from '../../src/platform/domain/release-candidate.js';

const read=async path=>readFile(new URL(`../../${path}`,import.meta.url),'utf8');
const pkg=JSON.parse(await read('package.json'));
const app=await read('app.html');
const caseStudy=await read('index.html');
const design=await read('src/app/design-system-v2.css');
const appJs=await read('src/app/app.js');
const decision=await read('src/app/decision.js');
const recommendation=await read('src/app/recommendation.js');
const config=await read('playwright.config.cjs');
const workflow=await read('.github/workflows/qa.yml');
const production=await read('tests/e2e/v5.1-production.spec.cjs');

const [releaseMajor,releaseMinor]=String(pkg.version).split('.').map(Number);
assert.ok(releaseMajor>5||(releaseMajor===5&&releaseMinor>=2),'v5.2 compatibility requires product release >= 5.2');
assert.deepEqual(pkg.qaToolchain,{node:'24',playwright:'1.55.1',axeCorePlaywright:'4.10.2'});
assert.ok(app.includes(`footmate-release\" content=\"${pkg.version}\"`));
assert.ok(caseStudy.includes('footmate-case-study-release\" content=\"5.1.1\"'));
assert.ok(app.includes('theme-color\" content=\"#f7f8f7\"'));
assert.equal(app.includes('id=\"fm-real-app-white-tone\"'),false);
assert.equal(app.includes('id=\"fm-product-polish-compat\"'),false);
assert.equal(app.includes('const redundant=new Set'),false);
assert.ok(app.includes('<main id=\"footmate-next\"></main>'));
assert.ok(design.includes('White-first Real App surface ownership'));
assert.ok(design.includes('Product completion compatibility ownership'));
for(const heading of ['나와 잘 맞는 이유','경기 정보','함께 뛰는 사람','취소·환불'])assert.equal(appJs.includes(`<h2>${heading}</h2>`),false);
assert.ok(decision.includes("hero.insertAdjacentHTML('afterend',decisionSections(match,session))"));
assert.ok(recommendation.includes("import {rankRecommendations} from './platform/domain/recommendation.js';"));
assert.equal(config.includes('retries: 0'),true);
assert.ok(config.includes("name: 'webkit-mobile'"));
assert.ok(workflow.includes('Run Release App Mobile Safari/WebKit gate'));
assert.ok(workflow.includes('tests/e2e/v6-release-app.spec.cjs'));
assert.ok(production.includes('data-product-detail'));
assert.ok(PERFORMANCE_BUDGET.firstPartyCssBytes>0&&PERFORMANCE_BUDGET.firstPartyJsBytes>0);
assert.deepEqual(RUNTIME_PERFORMANCE_BUDGET,{shellMaxWidthPx:560,maxHorizontalOverflowPx:1,screenReadyMs:4000});

const matches=[
  {id:'near',region:'수원 · 영통',area:'영통',level:'중급',positionSlots:{MF:2},distanceMin:10,spot:'2자리'},
  {id:'far',region:'서울 · 강남',area:'강남',level:'입문',positionSlots:{MF:0},distanceMin:35,spot:'마감'}
];
const ranked=rankRecommendations(matches,{region:'수원 · 영통',position:'MF',level:'중급'});
assert.deepEqual(ranked.map(item=>item.match.id),['near','far']);
assert.equal(ranked[0].score,100);
assert.equal(ranked[0].fit,'지금 가장 잘 맞아요');
console.log('PASS v5.2 product completion contracts');
