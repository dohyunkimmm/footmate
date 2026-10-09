'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const script=path.resolve(__dirname,'../../scripts/typography-qa-report.cjs');

function fixture(cases,assertReport){
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'footmate-type-qa-'));
  try{
    const input=path.join(directory,'input'),output=path.join(directory,'output');
    for(const [index,data] of cases.entries()){
      const dir=path.join(input,'case-'+index);fs.mkdirSync(dir,{recursive:true});
      fs.writeFileSync(path.join(dir,'typography-qa.json'),JSON.stringify(data));
    }
    const result=spawnSync(process.execPath,[script,input,output],{encoding:'utf8'});
    const report=JSON.parse(fs.readFileSync(path.join(output,'typography-qa-summary.json'),'utf8'));
    const markdown=fs.readFileSync(path.join(output,'typography-qa-summary.md'),'utf8');
    assertReport({result,report,markdown});
  } finally{
    fs.rmSync(directory,{recursive:true,force:true});
  }
}
const screens={
  normal:['welcome','home','discover'],
  fallback:['home','discover'],
  journey:['detail','checkout','profile'],
  'text-200-percent':['home'],
  'user-text-spacing':['home'],
  'korean-line-break':['home'],
  'negative-control':[]
};
function example(mode,width){
  const checks=screens[mode]||[];
  return {
    schema:1,test:mode+' '+width,project:'chromium',surface:'Real App',width,mode,
    audits:checks.map(screen=>({
      screen,issues:[],review:[],documentOverflow:false,
      samples:[{id:'h1 경기',lines:2,height:40}]
    })),
    screenshots:checks.map(screen=>({screen,name:'typography-'+mode+'-'+width+'-'+screen})),
    ...(mode==='negative-control'?{detectedIssues:['clipped text in its own element']}: {})
  };
}
function completeSuite(){
  return [
    ...[320,390,430,560,699,700,960,1440].map(width=>example('normal',width)),
    ...[390,1440].flatMap(width=>['fallback','journey','text-200-percent','user-text-spacing'].map(mode=>example(mode,width))),
    ...[320,390].map(width=>example('korean-line-break',width)),
    example('negative-control',390)
  ];
}

test('report separates gate failures, diagnostics and editorial review; failure exits nonzero',()=>{
  const baseline=example('normal',390);
  baseline.audits[1].issues.push('clipped');
  baseline.audits[1].review.push({id:'h1',reason:'short final line'});
  const diagnostic=example('text-200-percent',390);
  diagnostic.audits[0].issues.push('diagnostic clipping');
  const fallback=example('fallback',390);
  fallback.audits[0].samples[0].lines=3;
  fallback.audits[0].samples[0].height=60;
  fixture([baseline,diagnostic,fallback],({result,report,markdown})=>{
    assert.equal(result.status,1);
    assert.equal(report.totalCases,3);
    assert.equal(report.gateCases,2);
    assert.equal(report.diagnosticCases,1);
    assert.equal(report.gateIssues,1);
    assert.equal(report.gateStatus,'failed');
    assert.equal(report.manualReviewCount,1);
    assert.equal(report.fontComparisons.length,1);
    assert.equal(report.fontComparisons[0].fallback.lines,3);
    assert.ok(report.missingScenarios.includes('normal@320'));
    assert.equal(report.expectedScenarios,19);
    assert.match(markdown,/수동 검토/);
    assert.match(markdown,/short final line/);
  });
});

test('complete typography evidence is the only successful release gate',()=>{
  const cases=completeSuite();
  fixture(cases,({result,report})=>{
    assert.equal(result.status,0,result.stderr);
    assert.equal(report.totalCases,19);
    assert.equal(report.gateStatus,'no-reported-issues');
    assert.equal(report.expectedScenarios,19);
    assert.deepEqual(report.missingScenarios,[]);
    assert.deepEqual(report.invalidEvidence,[]);
    assert.equal(report.screenshotCount,44);
  });
});

test('missing scenario makes report incomplete and exits with failure',()=>{
  fixture(completeSuite().filter(item=>!(item.mode==='normal'&&item.width===700)),({result,report})=>{
    assert.equal(result.status,1);
    assert.equal(report.gateStatus,'incomplete');
    assert.ok(report.missingScenarios.includes('normal@700'));
  });
});

test('document overflow counts as a gate issue, but diagnostic overflow does not',()=>{
  const cases=completeSuite();
  const baseline=cases.find(item=>item.mode==='normal'&&item.width===390);
  baseline.audits[1].documentOverflow=true;
  cases.find(item=>item.mode==='text-200-percent'&&item.width===390).audits[0].documentOverflow=true;
  fixture(cases,({result,report,markdown})=>{
    assert.equal(result.status,1);
    assert.equal(report.gateStatus,'failed');
    assert.equal(report.gateIssues,1);
    assert.match(markdown,/document horizontal overflow/);
  });
});

test('malformed screenshots, missing screen or broken negative control fail the gate',()=>{
  const cases=completeSuite();
  const baseline=cases.find(item=>item.mode==='normal'&&item.width===320);
  baseline.screenshots=baseline.screenshots.filter(item=>item.screen!=='discover');
  const journey=cases.find(item=>item.mode==='journey'&&item.width===390);
  journey.audits=journey.audits.filter(item=>item.screen!=='profile');
  cases.find(item=>item.mode==='negative-control').detectedIssues=[];
  fixture(cases,({result,report})=>{
    assert.equal(result.status,1);
    assert.equal(report.gateStatus,'failed');
    assert.ok(report.invalidEvidence.some(item=>item.includes('screenshot for discover')));
    assert.ok(report.invalidEvidence.some(item=>item.includes('samples for profile')));
    assert.ok(report.invalidEvidence.some(item=>item.includes('negative control')));
  });
});

test('diagnostic-only clipping remains visible without failing the release gate',()=>{
  const cases=completeSuite();
  cases.find(item=>item.mode==='user-text-spacing'&&item.width===1440).audits[0].issues.push('simulated diagnostic clipping');
  fixture(cases,({result,report})=>{
    assert.equal(result.status,0);
    assert.equal(report.gateIssues,0);
    assert.equal(report.gateStatus,'no-reported-issues');
    assert.ok(report.cases.some(item=>item.mode==='user-text-spacing'&&item.issues.length===1));
  });
});
