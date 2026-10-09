'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

test('typography report keeps gate failures separate from diagnostic and editorial findings',()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'footmate-type-qa-'));
  try{
    const input=path.join(directory,'input'),output=path.join(directory,'output');
    for(const [index,data] of [
      {schema:1,test:'baseline',project:'chromium',surface:'Real App',width:390,mode:'normal',audits:[{screen:'home',issues:['clipped'],review:[{id:'h1',reason:'short final line'}],samples:[{id:'h1 경기',lines:2,height:40}]}]},
      {schema:1,test:'stress',project:'chromium',surface:'Real App',width:390,mode:'text-200-percent',audits:[{screen:'home',issues:['diagnostic clipping'],review:[]}]},
      {schema:1,test:'fallback',project:'chromium',surface:'Real App',width:390,mode:'fallback',audits:[{screen:'home',issues:[],review:[],samples:[{id:'h1 경기',lines:3,height:60}]}]}
    ].entries()){
      const dir=path.join(input,'case-'+index);fs.mkdirSync(dir,{recursive:true});
      fs.writeFileSync(path.join(dir,'typography-qa.json'),JSON.stringify(data));
    }
    const script=path.resolve(__dirname,'../../scripts/typography-qa-report.cjs');
    const run=spawnSync(process.execPath,[script,input,output],{encoding:'utf8'});
    assert.equal(run.status,0,run.stderr);
    const report=JSON.parse(fs.readFileSync(path.join(output,'typography-qa-summary.json'),'utf8'));
    assert.equal(report.totalCases,3);
    assert.equal(report.gateCases,2);
    assert.equal(report.diagnosticCases,1);
    assert.equal(report.gateIssues,1);
    assert.equal(report.gateStatus,'failed');
    assert.equal(report.manualReviewCount,1);
    assert.equal(report.fontComparisons.length,1);
    assert.equal(report.fontComparisons[0].fallback.lines,3);
    assert.ok(report.missingScenarios.includes('normal@320'));
    assert.equal(report.expectedScenarios,14);
    const markdown=fs.readFileSync(path.join(output,'typography-qa-summary.md'),'utf8');
    assert.match(markdown,/수동 검토/);
    assert.match(markdown,/short final line/);
  }finally{
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
