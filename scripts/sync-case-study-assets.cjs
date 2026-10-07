const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const htmlPath=path.join(root,'index.html');
const html=fs.readFileSync(htmlPath,'utf8');
const release=(html.match(/<meta name="footmate-case-study-release" content="([^"]+)">/)||[])[1];
if(!release)throw new Error('Case Study release meta missing');
const version=release.replace(/\D/g,'');
if(!version)throw new Error('Case Study release version is invalid');

const assetPattern=/(\/src\/case-study\/[^"'?]+\.(?:css|js))\?v=([^"'&]+)/g;
const matches=[...html.matchAll(assetPattern)];
if(!matches.length)throw new Error('No Case Study versioned assets found');
const assetFiles=matches.map(match=>match[1]);
const cssFiles=assetFiles.filter(file=>file.endsWith('.css'));
const jsFiles=assetFiles.filter(file=>file.endsWith('.js'));
if(cssFiles.length!==11||jsFiles.length!==2)throw new Error('Case Study runtime asset consolidation drift: expected 11 CSS / 2 JS');
if(!assetFiles.includes('/src/case-study/visual-system.css')||!assetFiles.includes('/src/case-study/concise.js')){
  throw new Error('Case Study consolidated visual bundle missing');
}
const forbiddenRuntimeAssets=[
  '/src/case-study/recommendation.js',
  '/src/case-study/discovery.js',
  '/src/case-study/decision.js',
  '/src/case-study/participation.js',
  '/src/case-study/matchday.js',
  '/src/case-study/return.js',
  '/src/case-study/personalization.js',
  '/src/case-study/platform.js',
  '/src/case-study/release-candidate.js',
  '/src/case-study/p0-visuals.css',
  '/src/case-study/p1-visuals.css',
  '/src/case-study/p2-polish.css',
  '/src/case-study/product-evidence.css',
  '/src/case-study/advanced-polish.css',
  '/src/case-study/detail-finish.css'
];
const staleRuntime=forbiddenRuntimeAssets.filter(file=>assetFiles.includes(file));
if(staleRuntime.length)throw new Error('Legacy Case Study runtime assets returned: '+staleRuntime.join(', '));
const slideCount=(html.match(/<section class="slide(?: [^"]*)?"[^>]*>/g)||[]).length;
if(slideCount!==7||/data-cs-hidden="true"/.test(html)){
  throw new Error('Case Study DOM must contain exactly 7 canonical slides and no hidden legacy slide slots');
}
const updated=html.replace(assetPattern,function(_all,file){return file+'?v='+version;});
const check=process.argv.includes('--check');

const runtimeJs=fs.readFileSync(path.join(root,'src/case-study/visual-system.js'),'utf8');
if(/(?:script\.src|link\.href)\s*=\s*['"]\/src\/case-study\//.test(runtimeJs)){
  throw new Error('Case Study visual bundle must not dynamically load additional Case Study assets');
}

if(check){
  if(updated!==html){
    const stale=matches.filter(match=>match[2]!==version).map(match=>match[1]+'?v='+match[2]);
    console.error('STALE Case Study asset versions · expected ?v='+version+': '+stale.join(', '));
    process.exit(1);
  }
  console.log('PASS Case Study asset versions · release '+release+' → v='+version);
}else{
  fs.writeFileSync(htmlPath,updated);
  console.log('WROTE Case Study asset versions · release '+release+' → v='+version);
}
