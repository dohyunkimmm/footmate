'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

const root=path.resolve(__dirname,'../..');
const load=relative=>import(pathToFileURL(path.join(root,relative)).href);
const beta={source:'connected-beta',id:'match-public-id',place:'광교 풋살장',address:'수원시 영통구 광교중앙로 145',title:'무료 풋살 경기',startsAt:'2026-10-12T10:30:00Z',durationMin:90};

test('P2 links: only connected Beta matches can open external directions and event drafts',async()=>{
  const {betaDirectionsUrl,betaCalendarUrl}=await load('src/beta/attendance-links.js');
  const map=betaDirectionsUrl(beta);
  assert.match(map,/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  assert.match(decodeURIComponent(map),/광교중앙로 145/);
  assert.equal(betaDirectionsUrl({...beta,source:'sample'}),null);
  assert.equal(betaCalendarUrl({...beta,source:'sample'}),null);
  assert.equal(betaCalendarUrl({...beta,startsAt:'not-a-date'}),null);
  assert.equal(betaCalendarUrl({...beta,durationMin:-15}),null);
  const calendar=new URL(betaCalendarUrl(beta));
  assert.equal(calendar.origin,'https://calendar.google.com');
  assert.equal(calendar.searchParams.get('action'),'TEMPLATE');
  assert.equal(calendar.searchParams.get('dates'),'20261012T103000Z/20261012T120000Z');
  assert.match(calendar.searchParams.get('details'),/초안/);
  assert.ok(!calendar.href.includes('access_token'));
});

test('P0 measurement events: bounded allowlist and no email, auth token or claimed cohort',async()=>{
  const {createBetaMeasurement,BETA_MEASUREMENT_EVENT}=await load('src/beta/measurement-events.js');
  assert.equal(BETA_MEASUREMENT_EVENT,'footmate:beta:measurement');
  const evt=createBetaMeasurement('join_succeeded',{flowId:'flow-1',matchId:'match-1',email:'private@example.com',access_token:'secret',cohort:'pilot'});
  assert.equal(evt.event,'join_succeeded');
  assert.equal(evt.cohort,'unclassified');
  assert.equal(evt.flowId,'flow-1');
  assert.equal(evt.matchId,'match-1');
  assert.equal(evt.email,undefined);
  assert.equal(evt.access_token,undefined);
  assert.throws(()=>createBetaMeasurement('payment_success'),/Unsupported/);
});

test('P1 core conditions use actual setup field options and preserve existing advanced filter ownership',()=>{
  const app=fs.readFileSync(path.join(root,'src/app/app.js'),'utf8');
  const discovery=fs.readFileSync(path.join(root,'src/app/discovery.js'),'utf8');
  assert.match(app,/data-quick-condition/);
  assert.match(app,/data-action="apply-discover-conditions"/);
  assert.match(app,/discoverQuickEditing/);
  assert.match(app,/step\.options\.some\(option=>option\[0\]===value\)/);
  assert.match(discovery,/data-discovery-action="remove-filter"/);
  assert.match(discovery,/function persist\(\)/);
});

test('P0/P1 disclosure and details do not silently hide refund policy',()=>{
  const decision=fs.readFileSync(path.join(root,'src/app/decision.js'),'utf8');
  assert.match(decision,/무료 참가 체험 · 실제 청구 0원/);
  assert.match(decision,/표시된 참가비|참가비·잔여 자리/);
  assert.match(decision,/<details class="fm-decision-optional"/);
  assert.match(decision,/취소 · 환불 기준/);
  assert.match(decision,/실제 결제·환불은 발생하지 않습니다/);
});

test('P2 utility links require confirmed participation for calendar actions',()=>{
  const app=fs.readFileSync(path.join(root,'src/beta/app.js'),'utf8');
  assert.match(app,/joined\?betaCalendarUrl\(match\):null/);
  assert.match(app,/attendanceLinks\(match,Boolean\(joined\)\)/);
  assert.match(app,/rel="noopener noreferrer"/);
});
