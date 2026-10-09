'use strict';

/*
 * Aggregate the per-test Playwright evidence without claiming human visual
 * review or genuine browser zoom has passed.
 *
 * Usage: node scripts/typography-qa-report.cjs [input-dir] [output-dir]
 */
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
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
  if(data.schema!==1||typeof data.mode!=='string'||!Number.isInteger(data.width)||
    (data.mode==='negative-control'?!Array.isArray(data.detectedIssues):!Array.isArray(data.audits)))
    throw new Error('Unexpected typography evidence schema: '+filename);
  const audits=data.audits||[];
  const issues=audits.flatMap(item=>[
    ...(item.issues||[]),
    ...(item.documentOverflow?['document horizontal overflow: '+(item.screen||'unknown')]:[])
  ]);
  const reviews=audits.flatMap(item=>item.review||[]);
  cases.push({
    test:data.test,project:data.project,surface:data.surface,mode:data.mode,width:data.width,
    screens:audits.map(item=>item.screen),issues,review:reviews,
    screenshots:data.screenshots||[],detectedIssues:data.detectedIssues||[],
    audits:audits.map(item=>({screen:item.screen,samples:item.samples||[]})),
    fonts:data.fonts||null,status:data.status||null,
    evidence:path.relative(process.cwd(),filename)
  });
}
cases.sort((a,b)=>a.mode.localeCompare(b.mode)||Number(a.width)-Number(b.width)||a.test.localeCompare(b.test));
const gateCases=cases.filter(item=>['normal','fallback','journey','korean-line-break'].includes(item.mode));
const diagnosticCases=cases.filter(item=>['text-200-percent','user-text-spacing'].includes(item.mode));
const totalIssues=gateCases.reduce((sum,item)=>sum+item.issues.length,0);
const diagnosticIssues=diagnosticCases.reduce((sum,item)=>sum+item.issues.length,0);
const expected=[...([320,375,390,430,560,699,700,960,1366,1440,1920].map(width=>'normal@'+width)),
  ...([390,1440].flatMap(width=>['fallback@'+width,'journey@'+width,'text-200-percent@'+width,'user-text-spacing@'+width])),
  'korean-line-break@320','korean-line-break@390','negative-control@390'];
const completed=new Set(cases.map(item=>item.mode+'@'+item.width));
const missingScenarios=expected.filter(key=>!completed.has(key));
const requiredScreens={
  normal:['welcome','home','discover'],
  fallback:['home','discover'],
  journey:['detail','checkout','profile'],
  'text-200-percent':['home'],
  'user-text-spacing':['home'],
  'korean-line-break':['home']
};
const invalidEvidence=[];
let verifiedScreenshotCount=0;
const screenshotManifest=[];
const pngSignature=Buffer.from('89504e470d0a1a0a','hex');
for(const item of cases){
  const key=item.mode+'@'+item.width;
  for(const screen of requiredScreens[item.mode]||[]){
    const audit=item.audits.find(entry=>entry.screen===screen);
    if(!audit||!Array.isArray(audit.samples)||audit.samples.length===0)
      invalidEvidence.push(key+': missing typography samples for '+screen);
    if(!item.screenshots.some(shot=>shot.screen===screen))
      invalidEvidence.push(key+': missing screenshot for '+screen);
  }
  // Every declared screenshot must exist as a real PNG next to the JSON
  // evidence. Refuse absolute paths, traversal and symlinks; validate the
  // actual image bytes instead of trusting an attachment name or count.
  if(!Array.isArray(item.screenshots)){
    invalidEvidence.push(key+': screenshots must be an array');
    item.screenshots=[];
  }
  const declared=new Set();
  for(const shot of item.screenshots){
    const basename=typeof shot?.path==='string'?shot.path:'';
    if(!shot||typeof shot.screen!=='string'||typeof shot.name!=='string'||
       !/^typography-[a-z0-9-]+-[0-9]+-[a-z0-9-]+\.png$/.test(basename)||
       shot.name!==basename||declared.has(basename)||
       !Number.isSafeInteger(shot.bytes)||shot.bytes<33||
       typeof shot.sha256!=='string'||!/^[a-f0-9]{64}$/.test(shot.sha256)){
      invalidEvidence.push(key+': malformed screenshot metadata for '+(shot?.screen||'unknown'));
      continue;
    }
    declared.add(basename);
    // Evidence paths are relative to the per-test typography-qa.json.
    const caseDirectory=path.dirname(path.resolve(process.cwd(),item.evidence));
    const file=path.join(caseDirectory,basename);
    try{
      const stat=fs.lstatSync(file);
      if(!stat.isFile()||stat.isSymbolicLink())throw new Error('not a regular file');
      const body=fs.readFileSync(file);
      if(body.length!==shot.bytes||!body.subarray(0,8).equals(pngSignature))
        throw new Error('PNG signature or byte length mismatch');
      if(createHash('sha256').update(body).digest('hex')!==shot.sha256)
        throw new Error('SHA-256 mismatch');
      verifiedScreenshotCount++;
      screenshotManifest.push({scenario:key,screen:shot.screen,
        file:path.relative(process.cwd(),file),bytes:shot.bytes,sha256:shot.sha256,
        visualReview:'pending-human-review'});
    }catch(error){
      invalidEvidence.push(key+': screenshot PNG invalid for '+shot.screen+': '+error.message);
    }
  }
  if(item.mode==='negative-control'&&!item.detectedIssues.some(issue=>/clipped text|invalid line-height/.test(issue)))
    invalidEvidence.push(key+': negative control did not detect clipping');
}
if(cases.length!==completed.size)
  invalidEvidence.push('duplicate evidence scenario mode/width combinations');
const fontComparisons=[];
for(const fallback of cases.filter(item=>item.mode==='fallback')){
  const normal=cases.find(item=>item.mode==='normal'&&item.width===fallback.width);
  if(!normal)continue;
  for(const area of fallback.audits){
    const previous=normal.audits.find(item=>item.screen===area.screen);
    if(!previous)continue;
    const byId=new Map(previous.samples.map(sample=>[sample.id,sample]));
    for(const after of area.samples){
      const before=byId.get(after.id);
      if(!before)continue;
      if(before.lines!==after.lines||Math.abs(before.height-after.height)>2)
        fontComparisons.push({width:fallback.width,screen:area.screen,id:after.id,
          normal:{lines:before.lines,height:before.height},
          fallback:{lines:after.lines,height:after.height},
          reason:'font-dependent wrapping/height; manual review'});
    }
  }
}
const report={
  schema:1,generatedAt:new Date().toISOString(),
  repository:'dohyunkimmm/footmate',commit:process.env.GITHUB_SHA||null,
  source:'Playwright local evidence, not Production certification',
  totalCases:cases.length,gateCases:gateCases.length,diagnosticCases:diagnosticCases.length,
  gateIssues:totalIssues,diagnosticIssues,gateStatus:gateCases.length===0?'not-run':totalIssues>0||invalidEvidence.length?'failed':missingScenarios.length?'incomplete':'no-reported-issues',
  expectedScenarios:expected.length,missingScenarios,invalidEvidence,fontComparisons,
  screenshotCount:cases.reduce((sum,item)=>sum+item.screenshots.length,0),
  verifiedScreenshotCount,screenshotManifest,visualReviewStatus:'pending-human-review',
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
  '- 자동 검사 감지 항목: '+report.gateIssues+'개; 진단 감지 항목: '+report.diagnosticIssues+'개; 수동 검토 표식: '+report.manualReviewCount+'개',
  '- 자동 검사 상태: '+report.gateStatus,
  '- 계획된 시나리오: '+report.expectedScenarios+'개; 증거 누락: '+report.missingScenarios.length+'개',
  '- 선언된 PNG: '+report.screenshotCount+'개; 실제 파일·SHA-256 검증: '+report.verifiedScreenshotCount+'개; 잘못된 증거: '+report.invalidEvidence.length+'건',
  '- 시각적 적합성 판정: '+report.visualReviewStatus+' (육안 검토 전 자동 통과 판정 금지)',
  '- 일반/대체폰트 줄 수·높이 차이: '+report.fontComparisons.length+'개',
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
lines.push('','## 일반/대체폰트 차이','');
if(!fontComparisons.length)lines.push('기록된 동일 텍스트의 줄 수·높이 차이가 없습니다. 글꼴이 실제 로딩됐는지는 각 화면의 폰트 상태를 확인해야 합니다.');
else for(const item of fontComparisons.slice(0,60))
  lines.push('- '+item.width+'px / '+item.screen+' / '+item.id+': '+
    item.normal.lines+'줄 → '+item.fallback.lines+'줄; 높이 '+item.normal.height+'px → '+item.fallback.height+'px');
lines.push('','## 자동 감지 상세','');
let detailedIssues=0;
for(const item of cases){
  for(const issue of item.issues){
    lines.push('- '+item.mode+' / '+item.width+'px: '+issue+
      (diagnosticCases.includes(item)?' (diagnostic only)':' (release gate)'));
    detailedIssues++;
    if(detailedIssues>=60)break;
  }
  if(detailedIssues>=60)break;
}
if(!detailedIssues)lines.push('감지된 텍스트/가로 넘침 문제가 없습니다.');
if(missingScenarios.length)lines.push('','## 수집되지 않은 시나리오','',...missingScenarios.map(key=>'- '+key));
if(invalidEvidence.length)lines.push('','## 유효하지 않은 증거','',...invalidEvidence.map(issue=>'- '+issue));
lines.push('','## 시각 품질 검토 프로토콜','',
  '현재 상태: **수동 검토 미완료**. 자동 파일 무결성 검사는 시각적 품질 합격과 별개입니다.',
  '1. 320/375/390/430px 한국어 문장·영문 혼합/긴 토큰의 의미 단위와 잘림을 확인합니다.',
  '2. 1366/1440/1920px 제목·본문·보조문구의 크기·굵기·밀도·강조 순서를 확인합니다.',
  '3. 폰트 정상/차단 상태 및 200% 텍스트·간격 진단 PNG를 비교하고 수동 판단을 기록합니다.',
  '4. 화면별 스타일 토큰(fontSize, fontWeight, color, letterSpacing 등)은 JSON cases[].audits[].samples에 보관합니다.',
  '',
  '| 시나리오 | 화면 | 실제 PNG 경로 | 크기(B) | SHA-256(앞 12자) | 육안 검토 |',
  '| --- | --- | --- | ---: | --- | --- |');
for(const shot of screenshotManifest)
  lines.push('| '+escapeCell(shot.scenario)+' | '+escapeCell(shot.screen)+' | '+escapeCell(shot.file)+
    ' | '+shot.bytes+' | '+shot.sha256.slice(0,12)+' | 미완료 |');
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
console.log('Typography QA report: '+cases.length+' cases, '+totalIssues+' gate issues, '+diagnosticIssues+' diagnostic issues, '+verifiedScreenshotCount+'/'+report.screenshotCount+' PNGs verified, '+invalidEvidence.length+' evidence defects, status '+report.gateStatus+' -> '+mdPath);
if(report.gateStatus!=='no-reported-issues')process.exitCode=1;
