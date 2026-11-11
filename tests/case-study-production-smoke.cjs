'use strict';
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {createHash}=require('node:crypto');
const base=(process.env.FOOTMATE_CASE_STUDY_URL||'https://footmate-case-study.fmate.workers.dev').replace(/\/$/,'');
if(!/^https:\/\/[^/]+$/.test(base))throw Error('FOOTMATE_PRODUCTION_URL requires an HTTPS origin');
const files=[
 ['src/case-study/nine-sections.css','/src/case-study/nine-sections.css'],
 ['src/case-study/materials.html','/src/case-study/materials.html'],
 ['src/case-study/report-previews.js','/src/case-study/report-previews.js'],
 ['src/case-study/downloads/footmate_report.pptx','/src/case-study/downloads/footmate_report.pptx'],
 ['src/case-study/downloads/footmate_5year_strategy.pptx','/src/case-study/downloads/footmate_5year_strategy.pptx'],
 ['src/case-study/downloads/footmate_model.xlsx','/src/case-study/downloads/footmate_model.xlsx']
];
const sha=b=>createHash('sha256').update(b).digest('hex');
async function check([local,url]){
 const response=await fetch(base+url,{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(url+' HTTP '+response.status);
 const actual=Buffer.from(await response.arrayBuffer()),expected=readFileSync(resolve(__dirname,'..',local));
 if(sha(actual)!==sha(expected))throw Error(url+' differs from deployed merge commit');
 console.log('PASS '+url+' '+actual.length+' bytes');
}
async function run(){
 await Promise.all(files.map(check));
 const htmlResponse=await fetch(base+'/');
 if(!htmlResponse.ok)throw Error('Report home HTTP '+htmlResponse.status);
 const html=await htmlResponse.text();
 if(!html.includes('<meta name="footmate-case-study-release"'))throw Error('Report release marker missing');
 if(!html.includes('rel="canonical" href="'+base+'/'))throw Error('Report canonical URL mismatch');
 const jsResponse=await fetch(base+'/src/case-study/nine-sections.js');
 if(!jsResponse.ok)throw Error('Report script HTTP '+jsResponse.status);
 if(!(await jsResponse.text()).includes('https://footmate.fmate.workers.dev/demo'))throw Error('Report Demo link is not external');
 console.log('PASS standalone Case Study Production Smoke · '+files.length+' identical files');
}
run().catch(e=>{console.error(e);process.exitCode=1});
