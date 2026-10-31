'use strict';
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {createHash}=require('node:crypto');
const base=(process.env.FOOTMATE_PRODUCTION_URL||'').replace(/\/$/,'');
if(!/^https:\/\/[^/]+$/.test(base))throw Error('FOOTMATE_PRODUCTION_URL requires an HTTPS origin');
const files=[
 ['index.html','/'],
 ['src/case-study/nine-sections.js','/src/case-study/nine-sections.js'],
 ['src/case-study/nine-sections.css','/src/case-study/nine-sections.css'],
 ['src/case-study/materials.html','/src/case-study/materials.html'],
 ['src/case-study/report-previews.js','/src/case-study/report-previews.js'],
 ['src/case-study/downloads/footmate_report.pptx','/src/case-study/downloads/footmate_report.pptx'],
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
Promise.all(files.map(check)).then(()=>console.log('PASS Case Study Production Smoke · 7 assets')).catch(e=>{console.error(e);process.exitCode=1});
