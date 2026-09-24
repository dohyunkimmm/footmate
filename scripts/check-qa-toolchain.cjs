const fs=require('node:fs');
const assert=(value,message)=>{if(!value)throw new Error(message)};
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const expected={'@playwright/test':'1.55.1','@axe-core/playwright':'4.10.2'};
for(const [name,version] of Object.entries(expected))assert(pkg.devDependencies?.[name]===version,`${name} must be pinned to ${version}`);
const config=fs.readFileSync('playwright.config.cjs','utf8');
assert(config.includes('retries: 0'),'Playwright retries must stay disabled so flaky failures remain visible');
assert(config.includes("name: 'webkit-mobile'"),'WebKit mobile project missing');
for(const [name,version] of Object.entries(expected)){
  const path=`node_modules/${name}/package.json`;
  if(fs.existsSync(path))assert(JSON.parse(fs.readFileSync(path,'utf8')).version===version,`installed ${name} version drift`);
}
console.log('PASS QA toolchain contract',expected);
