const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=process.env.FOOTMATE_SOURCE_DIR||path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('v2.3 canonical CSS ownership remains available under the v2.5 release',()=>{
  const patchAlias=read('footmate-patches.css');
  const finalizeAlias=read('footmate-finalize.css');
  const experienceAlias=read('footmate-experience.css');
  const patchStyles=read('src/v2/styles/compatibility-patches.css');
  const finalizeStyles=read('src/v2/styles/compatibility-finalize.css');
  const experience=read('src/v2/styles/experience.css');
  assert.ok(patchAlias.includes("@import url('/src/v2/styles/compatibility-patches.css?v=20260918-1')"));
  assert.ok(finalizeAlias.includes("@import url('/src/v2/styles/compatibility-finalize.css?v=20260918-1')"));
  assert.ok(experienceAlias.includes("@import url('/src/v2/styles/experience.css?v=20260918-1')"));
  assert.ok(patchStyles.includes('#footmateRuntimeEmpty{'));
  assert.ok(finalizeStyles.includes('.footmate-home-empty{'));
  assert.ok(experience.includes('.btn-primary{'));
});

test('v2.3 scenario persistence migration remains the canonical compatibility contract',()=>{
  const persistence=read('src/v2/state/scenario-persistence.js');
  const bridge=read('src/v2/compat/scenario-persistence-bridge.js');
  const bootstrap=read('src/v2/bootstrap.js');
  assert.ok(persistence.includes("createStorage('scenario')"));
  assert.ok(persistence.includes("const RELEASE_VERSION='2.3.0'"));
  assert.ok(persistence.includes("architecture:'v2.3-scenario-persistence-migration'"));
  assert.ok(bridge.includes("architecture:'v2.3-canonical-to-legacy-hydration-bridge'"));
  assert.ok(bootstrap.includes("scenarioPersistence:'v2.3-scenario-persistence-migration'"));
});

test('v2.3 remains a compatibility alias after v2.5 promotion',()=>{
  const bootstrap=read('src/v2/bootstrap.js');
  assert.ok(bootstrap.includes("const V23_RELEASE_VERSION='2.3.0'"));
  assert.ok(bootstrap.includes("const PREVIOUS_RELEASE_VERSION='2.4.0'"));
  assert.ok(bootstrap.includes("const RELEASE_VERSION='2.5.0'"));
  assert.ok(bootstrap.includes('window.FootMateV23'));
  assert.ok(bootstrap.includes("architecture:'v2.3-compatibility-boundary-reduction'"));
  assert.ok(bootstrap.includes('compatibility:true'));
  assert.ok(bootstrap.includes("'footmate:v2.3:ready'"));
  assert.ok(bootstrap.includes('window.FootMateV25'));
});
