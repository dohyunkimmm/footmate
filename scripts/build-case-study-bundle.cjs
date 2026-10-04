const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const cssSources=[
  'src/case-study/p0-visuals.css',
  'src/case-study/p1-visuals.css',
  'src/case-study/p12-balance.css',
  'src/case-study/p3-balance.css',
  'src/case-study/p10-balance.css',
  'src/case-study/p2-polish.css',
  'src/case-study/p7-p9-balance.css',
  'src/case-study/p6-clean-evidence.css',
  'src/case-study/card-rhythm.css',
  'src/case-study/p1-real-preview.css',
  'src/case-study/evidence-framing.css',
  'src/case-study/p12-copy-spacing.css',
  'src/case-study/final-balance.css',
  'src/case-study/product-evidence.css',
  'src/case-study/advanced-polish.css',
  'src/case-study/detail-finish.css',
  'src/case-study/page-composition.css',
  'src/case-study/brand-redesign.css',
  'src/case-study/editorial-update.css',
  'src/case-study/decision-evidence.css',
  'src/case-study/editorial-finish.css'
];
const jsSources=[
  'src/case-study/heading-polish.js',
  'src/case-study/reader-polish.js',
  'src/case-study/service-planner-polish.js',
  'src/case-study/reviewer-polish.js',
  'src/case-study/lead-tighten.js',
  'src/case-study/structured-copy-polish.js',
  'src/case-study/final-clarity.js',
  'src/case-study/p0-visuals.js',
  'src/case-study/p1-visuals.js',
  'src/case-study/p2-polish.js',
  'src/case-study/p1-real-preview.js',
  'src/case-study/p12-copy-spacing.js',
  'src/case-study/product-evidence.js',
  'src/case-study/advanced-polish.js',
  'src/case-study/decision-evidence.js',
  'src/case-study/editorial-finish.js',
  'src/case-study/page-composition.js'
];

function read(file){
  return fs.readFileSync(path.join(root,file),'utf8').trimEnd();
}
function bundle(type,sources,footer){
  const head='/* AUTO-GENERATED · FootMate Case Study '+type+' bundle\n'
    +'   Run: node scripts/build-case-study-bundle.cjs\n'
    +'   Sources: '+sources.join(', ')+'\n'
    +'   Do not edit this generated file directly. */';
  const body=sources.map(file=>'/* ===== '+file+' ===== */\n'+read(file)).join('\n\n');
  return head+'\n\n'+body+(footer?'\n\n'+footer:'')+'\n';
}
const finalizer='/* ===== bundle finalizer ===== */\n'
+'(function(){\n'
+'  function finish(){\n'
+"    if(document.documentElement.dataset.fmCaseStudyAdvancedPolish!=='true')return false;\n"
+"    if(!document.querySelector('style[data-fm-detail-density-compat]')){\n"
+"      const style=document.createElement('style');\n"
+"      style.dataset.fmDetailDensityCompat='true';\n"
+'      style.textContent=\'@media(max-width:900px){html[data-fm-next-case-study="true"][data-fm-case-study-advanced-polish="true"] .fm-next-story-slide[data-v5-content-role="domain-ai-boundary"] .fm-p0-arch-node{padding-top:10px!important;padding-bottom:10px!important}}\';\n'
+'      document.head.appendChild(style);\n'
+'    }\n'
+"    document.documentElement.dataset.fmCaseStudyDetailFinish='true';\n"
+"    document.documentElement.dataset.fmCaseStudyVisualSystem='true';\n"
+'    return true;\n'
+'  }\n'
+'  if(!finish()){\n'
+'    let tries=0;\n'
+'    const timer=setInterval(()=>{\n'
+'      tries+=1;\n'
+'      if(finish()||tries>1200)clearInterval(timer);\n'
+'    },25);\n'
+'  }\n'
+'})();';

const outputs=[
  ['src/case-study/visual-system.css',bundle('visual CSS',cssSources,'')],
  ['src/case-study/visual-system.js',bundle('visual JS',jsSources,finalizer)]
];
const check=process.argv.includes('--check');
let failed=false;
for(const [file,expected] of outputs){
  const full=path.join(root,file);
  if(check){
    const actual=fs.existsSync(full)?fs.readFileSync(full,'utf8'):'';
    if(actual!==expected){
      console.error('STALE '+file+' · run node scripts/build-case-study-bundle.cjs');
      failed=true;
    }else{
      console.log('PASS '+file);
    }
  }else{
    fs.writeFileSync(full,expected);
    console.log('WROTE '+file);
  }
}
if(failed)process.exit(1);
