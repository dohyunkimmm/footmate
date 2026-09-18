const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const source=read('demo-source.html');
const components=read('src/v2/demo/core-funnel-components.js');
const experience=read('src/v2/ui/core-funnel-experience.js');
const ids=['s-home','s-filter','s-results','s-detail','s-pay'];
for(const id of ids){
  const count=source.split(`id="${id}"`).length-1;
  if(count!==1)throw new Error(`${id} must exist exactly once in demo-source.html; found ${count}`);
  if(!components.includes(`'${id}'`))throw new Error(`${id} missing from core funnel component registry`);
}
if(source.includes('fm24-'))throw new Error('v2.4 component markup must not be added to demo-source.html');
if(!experience.includes("componentSource:'src/v2/demo/core-funnel-components.js'"))throw new Error('core funnel component source boundary missing');
console.log('PASS v2.4 demo/component boundary: legacy 39-screen source remains stable and new core funnel UI is component-owned.');
