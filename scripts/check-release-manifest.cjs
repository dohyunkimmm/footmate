const fs=require('fs');
function must(value,message){if(!value)throw new Error(message)}
const release=JSON.parse(fs.readFileSync('release.json','utf8'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const app=fs.readFileSync('app.html','utf8');
const journey=fs.readFileSync('src/v5/domain/journey.js','utf8');
const aiClient=fs.readFileSync('src/v5/ai-match-assistant.js','utf8');
const aiApi=fs.readFileSync('api/ai-match-assistant.js','utf8');
const productionSpec=fs.readFileSync('tests/e2e/v5.1-production.spec.cjs','utf8');
const version=release.version;
must(/^\d+\.\d+\.\d+$/.test(version),'release.json version must be semver');
must(pkg.version===version,`package.json ${pkg.version} != release ${version}`);
must(app.includes(`meta name="footmate-release" content="${version}"`),`app meta release != ${version}`);
must(app.includes(`meta name="footmate-release-name" content="${release.name}"`),`app release name != ${release.name}`);
must(journey.includes(`CONNECTED_PLATFORM_VERSION='${version}'`),`journey version != ${version}`);
must(aiClient.includes(`const VERSION='${version}'`),`AI client version != ${version}`);
must(aiApi.includes(`const VERSION='${version}'`),`AI API version != ${version}`);
must(productionSpec.includes(`RELEASE='${version}'`),`Production spec version != ${version}`);
console.log('PASS canonical release manifest',JSON.stringify(release));
