'use strict';

/*
 * Aggregate the per-test Playwright evidence without claiming human visual
 * review or genuine browser zoom has passed.
 *
 * Usage: node scripts/typography-qa-report.cjs [input-dir] [output-dir]
 */
const fs=require('node:fs');
const path=require('node:path');
const input=path.resolve(process.argv[2]||'test-results/playwright');
const output=path.resolve(process.argv[3]||'verification');
function collect(directory){
  if(!fs.existsSync(directory))return [];
  const files=[];
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    const filename=path.join(directory,entry.name);
    if(entry.isDirectory())files.push(...collect(filename));
    else if(entry.name==='typography-qa.json')files.push(filename);
  }
  return files;
}
function escapeCell(value){
  return String(value??'').replace(/\|/g,'\\|').replace(/\r?\n/g,' ');
}
const cases=[];
for(const filename of collect(input)){
  let data;
  try{data=JSON.parse(fs.readFileSync(filename,'utf8'));}
  catch(error){throw new Error('Invalid typography evidence: '+filename+' '+error.message);}
  if(data.schema!==1||!Array.isArray(data.audits)&&!Array.isArray(data.detectedIssues))
    throw new Error('Unexpected typography evidence schema: '+filename);
  const audits=data.audits||[];
  const issues=audits.flatMap(item=>item.issues||[]);
  const reviews=audits.flatMap(item=>item.review||[]);
  cases.push({
    test:data.test,project:data.project,surface:data.surface,mode:data.mode,width:data.width,
    screens:audits.map(item=>item.screen),issues,review:reviews,
    fonts:data.fonts||null,status:data.status||null,
    evidence:path.relative(process.cwd(),filename)
  });
}
cases.sort((a,b)=>a.mode.localeCompare(b.mode)||Number(a.width)-Number(b.width)||a.test.localeCompare(b.test));
const gateCases=cases.filter(item=>['normal','fallback','journey'].includes(item.mode));
const diagnosticCases=cases.filter(item=>['text-200-percent','user-text-spacing'].includes(item.mode));
const totalIssues=gateCases.reduce((sum,item)=>sum+item.issues.length,0);
const report={
  schema:1,generatedAt:new Date().toISOString(),
  repository:'dohyunkimmm/footmate',commit:process.env.GITHUB_SHA||null,
  source:'Playwright local evidence, not Production certification',
  totalCases:cases.length,gateCases:gateCases.length,diagnosticCases:diagnosticCases.length,
  gateIssues:totalIssues,gateStatus:gateCases.length===0?'not-run':totalIssues>0?'failed':'no-reported-issues',
  manualReviewCount:cases.reduce((sum,item)=>sum+item.review.length,0),
  warning:'Simulated text-only enlargement and text spacing are diagnostic. Screenshots and Korean wrapping require manual review.',
  cases
};
fs.mkdirSync(output,{recursive:true});
const jsonPath=path.join(output,'typography-qa-summary.json');
const mdPath=path.join(output,'typography-qa-summary.md');
fs.writeFileSync(jsonPath,JSON.stringify(report,null,2)+'\n');
const lines=[
  '# FootMate 타이포그래피 QA 증거 보고서',
  '',
  '- 대상 커밋: '+(report.commit||'로컬/미제공'),
  '- 자동 검사 시나리오: '+report.gateCases+'개; 진단 시나리오: '+report.diagnosticCases+'개',
  '- 자동 검사 감지 항목: '+report.gateIssues+'개; 수동 검토 표식: '+report.manualReviewCount+'개',
  '- 자동 검사 상태: '+report.gateStatus,
  '',
  '> 화면 구성의 품질, 한국어 의미 단위 줄바꿈, 실제 브라우저 확대의 WCAG 적합성을 인증하지 않습니다.',
  '> 진단 결과는 문제를 숨기지 않고 기록하되, 검증되지 않은 항목을 통과로 표시하지 않습니다.',
  '',
  '| 화면 폭 | 모드 | 화면 | 감지 | 수동 검토 | 폰트 상태 |',
  '| --- | --- | --- | ---: | ---: | --- |'
];
for(const item of cases){
  lines.push('| '+escapeCell(item.width)+'px | '+escapeCell(item.mode)+' | '+escapeCell(item.screens.join(', ')||'음성 대조')+' | '+
    item.issues.length+' | '+item.review.length+' | '+escapeCell(item.fonts?.coverage||'기록 없음')+' |');
}
if(!cases.length)lines.push('| - | 미실행 | 증거 파일 없음 | - | - | - |');
lines.push('','## 수동 검토 대상','');
let count=0;
for(const item of cases){
  for(const review of item.review){
    lines.push('- '+item.mode+' / '+item.width+'px: '+(review.id||'텍스트')+' — '+review.reason);
    count++;
    if(count>=60)break;
  }
  if(count>=60)break;
}
if(!count)lines.push('현재 기록된 제목 고립 행·말줄임 검토 표식이 없습니다. 실제 육안 검토 완료를 뜻하지 않습니다.');
lines.push('','## 증거','', '각 테스트의 typography-qa.json, 스크린샷, Playwright trace는 CI browser-e2e 아티팩트에 포함됩니다.');
fs.writeFileSync(mdPath,lines.join('\n')+'\n');
console.log('Typography QA report: '+cases.length+' cases, '+totalIssues+' gate issues, '+report.manualReviewCount+' review flags -> '+mdPath);
