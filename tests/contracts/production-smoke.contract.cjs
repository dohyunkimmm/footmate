'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {spawnSync}=require('node:child_process');
const {extractBetaRuntime,extractBetaMediaRuntime,hasCaseStudyDemoCta}=require('../production-smoke.cjs');

test('production smoke checks the actual Closed Beta application entry',()=>{
  const html=readFileSync(resolve(__dirname,'../../beta.html'),'utf8');
  const runtime=extractBetaRuntime(html);
  assert.match(runtime,/^\/src\/beta\/app\.js\?v=[\w.-]+$/);
  assert.ok(html.includes(`src="${runtime}"`));
});

test('production smoke reads the current media cache version from the Beta entry',()=>{
  const root=resolve(__dirname,'../..');
  const beta=readFileSync(resolve(root,'beta.html'),'utf8');
  const operator=readFileSync(resolve(root,'beta-operator.html'),'utf8');
  const media=extractBetaMediaRuntime(beta);
  assert.match(media,/^\/src\/beta\/media\.js\?v=[\w.-]+$/);
  assert.ok(operator.includes(media),'operator and Beta media runtime versions must match');
  assert.equal(extractBetaMediaRuntime("await import('/src/beta/media.js?v=17');"),'/src/beta/media.js?v=17');
  assert.throws(()=>extractBetaMediaRuntime("await import('/src/beta/media-legacy.js?v=1');"),/Beta media runtime/);
});

test('production smoke rejects a retired or missing beta entry with an actionable error',()=>{
  const html='<script src="/src/beta/demo.js?v=1"></script><script type="module" src="/src/beta/app.js?v=524"></script>';
  assert.equal(extractBetaRuntime(html),'/src/beta/app.js?v=524');
  assert.equal(extractBetaRuntime('<script src="/src/beta/app.js?v=530" type="module"></script>'),'/src/beta/app.js?v=530');
  assert.throws(()=>extractBetaRuntime('<script src="/src/beta/demo.js?v=1"></script>'),/Closed Beta runtime/);
});

test('non-strict production smoke skips without making network calls',()=>{
  const result=spawnSync(process.execPath,[resolve(__dirname,'../production-smoke.cjs')],{
    encoding:'utf8',
    env:{...process.env,FOOTMATE_STRICT_PRODUCTION:'false'}
  });
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/SKIP v/);
});


test('Case Study demo CTA detection accepts JS-escaped and literal HTML quotes',()=>{
  assert.equal(hasCaseStudyDemoCta('<a href="/demo">Try demo</a>'),true);
  assert.equal(hasCaseStudyDemoCta(String.raw`<a href=\"/demo\">Try demo</a>`),true);
  assert.equal(hasCaseStudyDemoCta('<a href="/other">Try demo</a>'),false);
});

test('Production AI model assertions stay aligned with the API defaults',()=>{
  const root=resolve(__dirname,'../..');
  const api=readFileSync(resolve(root,'api/ai-match-assistant.js'),'utf8');
  const primary=api.match(/const MODEL=process\.env\.FOOTMATE_AI_MODEL\|\|'([^']+)'/)?.[1];
  const fallback=api.match(/const FALLBACK_MODEL=process\.env\.FOOTMATE_AI_FALLBACK_MODEL\|\|'([^']+)'/)?.[1];
  assert.ok(primary,'API primary model default missing');
  assert.ok(fallback,'API fallback model default missing');
  assert.notEqual(primary,fallback);
  const http=readFileSync(resolve(root,'tests/production-smoke.cjs'),'utf8');
  const inference=readFileSync(resolve(root,'tests/production-ai.cjs'),'utf8');
  const browser=readFileSync(resolve(root,'tests/e2e/production-app.spec.cjs'),'utf8');
  assert.ok(http.includes(`api.model==='${primary}'`),'HTTP smoke primary model differs from API');
  assert.ok(http.includes(`api.fallbackModel==='${fallback}'`),'HTTP smoke fallback model differs from API');
  assert.ok(inference.includes(`FOOTMATE_EXPECTED_AI_MODEL||'${primary}'`),'Inference smoke primary model differs from API');
  assert.ok(inference.includes(`FOOTMATE_EXPECTED_AI_FALLBACK_MODEL||'${fallback}'`),'Inference smoke fallback model differs from API');
  assert.ok(browser.includes(`expect(health.model).toBe('${primary}')`),'Browser smoke model differs from API');
});

test('production smoke defaults to current Cloudflare host',()=>{
  for (const filename of ['production-smoke.cjs','production-ai.cjs']) {
    const source=readFileSync(resolve(__dirname,'..',filename),'utf8');
    assert.match(source,/FOOTMATE_PRODUCTION_URL\|\|'https:\/\/footmate\.fmate\.workers\.dev'/,filename);
    assert.doesNotMatch(source,/FOOTMATE_PRODUCTION_URL\|\|'https:\/\/footmate-black\.vercel\.app'/,filename);
  }
});
