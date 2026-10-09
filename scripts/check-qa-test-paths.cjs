'use strict';
// Keep release-gate commands aligned with the current E2E test tree.
const fs=require('node:fs');
const path=require('node:path');
const folder=path.join('.github','workflows');
const missing=[];
let count=0;
for(const name of fs.readdirSync(folder).filter(name=>/\.ya?ml$/.test(name))){
  const source=fs.readFileSync(path.join(folder,name),'utf8');
  for(const ref of new Set(source.match(/tests\/e2e\/[\w-]+\.spec\.cjs/g)||[])){
    count++;
    if(!fs.existsSync(ref))missing.push(name+': '+ref);
  }
}
if(missing.length){
  console.error('Stale browser QA references:\n'+missing.join('\n'));
  process.exitCode=1;
}else{
  console.log('PASS '+count+' referenced E2E test paths exist in the current repository');
}
