const fs=require('fs');
function read(path){return fs.readFileSync(path,'utf8')}function must(value,message){if(!value)throw new Error(message)}
const contracts=read('src/platform/domain/contracts.js'),rc=read('src/platform/domain/release-candidate.js'),mocks=read('src/platform/infrastructure/provider-mocks.js'),gate=read('src/platform/application/release-candidate.js'),presentation=read('src/platform/presentation/release-candidate.js'),design=read('src/app/release-candidate.css'),contractTest=read('tests/contracts/release-candidate.contract.mjs'),rcDoc=read('docs/RELEASE-HISTORY.md');
const worker=read('worker/index.js');
must(/["']\/demo["']\s*:\s*["']\/beta\.html["']/.test(worker),'Cloudflare public demo must open the released Beta');
must(/["']\/beta["']\s*:\s*["']\/beta\.html["']/.test(worker),'Cloudflare beta route must keep the released Beta');
must(/["']\/beta\/operator["']\s*:\s*["']\/beta-operator\.html["']/.test(worker),'Cloudflare operator route must stay available');
must(/["']\/prototype["']\s*:\s*["']\/app\.html["']/.test(worker),'Cloudflare legacy prototype must remain separately testable');
must(worker.includes('env.ASSETS.fetch'),'Cloudflare Worker must serve routed static assets');
must(read('src/beta/app.js').includes('createSupabaseBetaClient'),'released app must keep its existing backend client');

