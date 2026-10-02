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
