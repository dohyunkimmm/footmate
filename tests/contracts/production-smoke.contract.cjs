'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {spawnSync}=require('node:child_process');
const {extractBetaRuntime,hasCaseStudyDemoCta}=require('../production-smoke.cjs');

test('production smoke checks the actual Closed Beta application entry',()=>{
  const html=readFileSync(resolve(__dirname,'../../beta.html'),'utf8');
  const runtime=extractBetaRuntime(html);
  assert.match(runtime,/^\/src\/beta\/app\.js\?v=[\w.-]+$/);
  assert.ok(html.includes(`src="${runtime}"`));
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
