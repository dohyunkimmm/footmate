const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s);
const replace=(src,from,to,label)=>{if(!src.includes(from))throw new Error(`Missing patch target: ${label}`);return src.replace(from,to)};

let html=read('app.html');
html=replace(html,'width:min(100%,430px);height:100dvh;min-height:0;max-height:100dvh;overflow:hidden;border-radius:0','width:min(100%,402px);height:100dvh;min-height:0;max-height:100dvh;overflow:hidden;border-radius:0','desktop shell width');
const shellStart=html.indexOf('<style id="fm-real-app-mobile-shell">');
const shellEnd=html.indexOf('</style>',shellStart);
if(shellStart<0||shellEnd<0)throw new Error('Real App mobile shell style block missing');
const density='.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) :is([data-screen="home"],[data-screen="discover"],[data-screen="schedule"],[data-screen="profile"]) .fm-next-topbar{min-height:calc(64px + env(safe-area-inset-top));padding-top:calc(8px + env(safe-area-inset-top));padding-bottom:8px}.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) :is([data-screen="discover"],[data-screen="schedule"],[data-screen="profile"])>.fm-next-topbar--titled{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) :is([data-screen="discover"],[data-screen="schedule"],[data-screen="profile"])>.fm-next-topbar--titled>:first-child{justify-self:start}.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) :is([data-screen="discover"],[data-screen="schedule"],[data-screen="profile"])>.fm-next-topbar--titled>strong{justify-self:center}.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) :is([data-screen="discover"],[data-screen="schedule"],[data-screen="profile"])>.fm-next-topbar--titled>:last-child{justify-self:end}.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="discover"]>.fm-next-section{padding-top:20px}.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) :is([data-screen="home"],[data-screen="discover"],[data-screen="schedule"],[data-screen="profile"]){padding-bottom:calc(86px + env(safe-area-inset-bottom));scroll-padding-bottom:calc(86px + env(safe-area-inset-bottom))}.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-nav{bottom:max(10px,env(safe-area-inset-bottom));padding:5px 7px;border-radius:20px}.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-nav button{min-height:50px;gap:2px;border-radius:14px;font-size:10px}.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-nav-icon{width:32px;height:26px}@media(min-width:700px){.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-nav{bottom:10px}}';
if(!html.slice(shellStart,shellEnd).includes('grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)'))html=html.slice(0,shellEnd)+density+html.slice(shellEnd);
write('app.html',html);

let app=read('src/v4/app.js');
app=replace(app,"  return `<header class=\"fm-next-topbar${dark?' fm-next-topbar--dark':''}\">","  return `<header class=\"fm-next-topbar${dark?' fm-next-topbar--dark':''}${title?' fm-next-topbar--titled':''}\">",'titled topbar class');
app=replace(app,"    root.querySelector('.fm-next-app')?.scrollTo({top:0,left:0,behavior:'instant'});\n  }","    root.querySelector('.fm-next-app')?.scrollTo({top:0,left:0,behavior:'instant'});\n    activeScreen?.scrollTo({top:0,left:0,behavior:'instant'});\n  }",'active screen scroll reset');
write('src/v4/app.js',app);

let decision=read('tests/e2e/v5.1-decision-flow-polish.spec.cjs');
decision=replace(decision,'  expect(app.width).toBeGreaterThanOrEqual(428);\n  expect(app.width).toBeLessThanOrEqual(432);','  expect(app.width).toBeGreaterThanOrEqual(400);\n  expect(app.width).toBeLessThanOrEqual(404);','decision shell width');
decision=replace(decision,'  expect(sticky.width).toBeGreaterThanOrEqual(404);\n  expect(sticky.width).toBeLessThanOrEqual(408);','  expect(sticky.width).toBeGreaterThanOrEqual(376);\n  expect(sticky.width).toBeLessThanOrEqual(380);','decision sticky width');
decision=replace(decision,'  expect(submit.width).toBeGreaterThanOrEqual(386);\n  expect(submit.width).toBeLessThanOrEqual(390);','  expect(submit.width).toBeGreaterThanOrEqual(358);\n  expect(submit.width).toBeLessThanOrEqual(362);','decision submit width');
write('tests/e2e/v5.1-decision-flow-polish.spec.cjs',decision);

let ds=read('tests/e2e/v5.1-design-system-v2.spec.cjs');
ds=replace(ds,'  expect(geometry.width).toBeGreaterThanOrEqual(428);\n  expect(geometry.width).toBeLessThanOrEqual(432);','  // Standalone Real App uses the compact desktop mobile-frame width; portfolio remains outside this shell contract.\n  expect(geometry.width).toBeGreaterThanOrEqual(400);\n  expect(geometry.width).toBeLessThanOrEqual(404);','design-system shell width');
ds=replace(ds,'  expect(navGeometry.width).toBeGreaterThanOrEqual(404);\n  expect(navGeometry.width).toBeLessThanOrEqual(408);','  expect(navGeometry.width).toBeGreaterThanOrEqual(376);\n  expect(navGeometry.width).toBeLessThanOrEqual(380);','design-system nav width');
write('tests/e2e/v5.1-design-system-v2.spec.cjs',ds);

let visual=read('tests/e2e/v5.1-visual-system-completion.spec.cjs');
const home='  await setupToHome(page);\n  await expect(page).toHaveScreenshot(\'visual-system-home-1440.png\',exactScreenshot);';
const home2=`  await setupToHome(page);\n  const homeGeometry=await page.locator('[data-screen="home"]').evaluate(element=>{\n    const app=element.closest('.fm-next-app').getBoundingClientRect();\n    const header=element.querySelector('.fm-next-topbar').getBoundingClientRect();\n    const nav=element.querySelector('.fm-next-nav').getBoundingClientRect();\n    const navButton=element.querySelector('.fm-next-nav button').getBoundingClientRect();\n    return {appWidth:app.width,headerHeight:header.height,navHeight:nav.height,navButtonHeight:navButton.height};\n  });\n  expect(homeGeometry.appWidth).toBe(402);\n  expect(homeGeometry.headerHeight).toBeLessThanOrEqual(64);\n  expect(homeGeometry.navHeight).toBeLessThanOrEqual(64);\n  expect(homeGeometry.navButtonHeight).toBeLessThanOrEqual(50);\n  await expect(page).toHaveScreenshot('visual-system-home-1440.png',exactScreenshot);`;
visual=replace(visual,home,home2,'visual home geometry');
const discover="  await expect(page.locator('[data-screen=\"discover\"]')).toBeVisible();\n  await page.mouse.move(1,1);";
const discover2=`  await expect(page.locator('[data-screen="discover"]')).toBeVisible();\n  const discoverTopGap=await page.locator('[data-screen="discover"]').evaluate(element=>{\n    const header=element.querySelector('.fm-next-topbar').getBoundingClientRect();\n    const heading=element.querySelector('.fm-next-section-head').getBoundingClientRect();\n    const title=element.querySelector('.fm-next-topbar>strong').getBoundingClientRect();\n    const app=element.closest('.fm-next-app').getBoundingClientRect();\n    return {gap:heading.top-header.bottom,titleCenter:title.left+title.width/2,appCenter:app.left+app.width/2};\n  });\n  expect(discoverTopGap.gap).toBeGreaterThanOrEqual(18);\n  expect(Math.abs(discoverTopGap.titleCenter-discoverTopGap.appCenter)).toBeLessThanOrEqual(1);\n  await page.mouse.move(1,1);`;
visual=replace(visual,discover,discover2,'visual discover geometry');
write('tests/e2e/v5.1-visual-system-completion.spec.cjs',visual);
