const fs=require('node:fs');
const assert=(value,message)=>{if(!value)throw new Error(message)};
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const pins=pkg.qaToolchain||{};
assert(pins.node==='24','QA Node major must stay pinned to 24');
assert(pins.playwright==='1.55.1','Playwright QA pin drift');
assert(pins.axeCorePlaywright==='4.10.2','axe Playwright QA pin drift');
const config=fs.readFileSync('playwright.config.cjs','utf8');
assert(config.includes('retries: 0'),'Playwright retries must stay disabled so flaky failures remain visible');
assert(config.includes("name: 'webkit-mobile'"),'WebKit mobile project missing');
const installed=[
  ['@playwright/test',pins.playwright],
  ['@axe-core/playwright',pins.axeCorePlaywright]
];
for(const [name,version] of installed){
  const path=`node_modules/${name}/package.json`;
  if(fs.existsSync(path))assert(JSON.parse(fs.readFileSync(path,'utf8')).version===version,`installed ${name} version drift`);
}
console.log('PASS QA toolchain contract',pins);
