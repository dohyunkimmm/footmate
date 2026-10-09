'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const script=path.resolve(__dirname,'../../scripts/vercel-ignore-build.cjs');

function git(cwd,...args){
  const result=spawnSync('git',args,{cwd,encoding:'utf8'});
  assert.equal(result.status,0,'git '+args.join(' ')+': '+result.stderr);
  return result.stdout.trim();
}
function run(cwd,changes={}){
  const env={...process.env,VERCEL_GIT_COMMIT_REF:'feat/type-qa',VERCEL_ENV:'preview',
    FOOTMATE_VERCEL_CHANGED_FILES:'',...changes};
  return spawnSync(process.execPath,[script],{cwd,env,encoding:'utf8'});
}

test('Vercel preview deploy includes runtime changes even when final commit only edits docs',()=>{
  const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'footmate-vercel-'));
  try{
    git(cwd,'init','-b','main');
    git(cwd,'config','user.name','FootMate QA');
    git(cwd,'config','user.email','qa@example.invalid');
    fs.mkdirSync(path.join(cwd,'src','app'),{recursive:true});
    fs.writeFileSync(path.join(cwd,'src','app','app.css'),'/* before */\n');
    git(cwd,'add','.');git(cwd,'commit','-m','baseline');
    git(cwd,'remote','add','origin',cwd);
    git(cwd,'fetch','origin','main:refs/remotes/origin/main');
    git(cwd,'checkout','-b','feat/type-qa');
    fs.writeFileSync(path.join(cwd,'src','app','app.css'),'/* typography fix */\n');
    git(cwd,'add','.');git(cwd,'commit','-m','fix typography');
    fs.mkdirSync(path.join(cwd,'docs'));
    fs.writeFileSync(path.join(cwd,'docs','qa.md'),'document changes\n');
    git(cwd,'add','.');git(cwd,'commit','-m','docs only');

    const preview=run(cwd);
    assert.equal(preview.status,1,preview.stderr);
    assert.match(preview.stdout,/src\/app\/app\.css/);
    assert.match(preview.stdout,/build required/);

    const productionTip=run(cwd,{VERCEL_GIT_COMMIT_REF:'main',VERCEL_ENV:'production'});
    assert.equal(productionTip.status,0,productionTip.stderr);
    assert.match(productionTip.stdout,/Docs\/QA-only/);

    const explicitFiles=run(cwd,{FOOTMATE_VERCEL_CHANGED_FILES:'docs/qa.md'});
    assert.equal(explicitFiles.status,0,explicitFiles.stderr);

    // Real Vercel checkouts may lack origin/main: fetch both branch refs.
    git(cwd,'update-ref','-d','refs/remotes/origin/main');
    const fetchedBase=run(cwd);
    assert.equal(fetchedBase.status,1,fetchedBase.stderr);
    assert.match(fetchedBase.stdout,/src\/app\/app\.css/);
    assert.doesNotMatch(fetchedBase.stderr,/Failing open/);

    // A docs-only PR can correctly skip once the missing refs are fetched.
    git(cwd,'checkout','main');
    git(cwd,'checkout','-b','feat/docs-only');
    fs.mkdirSync(path.join(cwd,'docs'),{recursive:true});
    fs.writeFileSync(path.join(cwd,'docs','guide.md'),'documentation only\n');
    git(cwd,'add','.');git(cwd,'commit','-m','docs-only preview');
    git(cwd,'update-ref','-d','refs/remotes/origin/main');
    const docsOnly=run(cwd,{VERCEL_GIT_COMMIT_REF:'feat/docs-only'});
    assert.equal(docsOnly.status,0,docsOnly.stderr);
    assert.match(docsOnly.stdout,/Docs\/QA-only change/);

    // With no usable remote, fail open (build) instead of silently skipping.
    git(cwd,'update-ref','-d','refs/remotes/origin/main');
    git(cwd,'remote','remove','origin');
    const missingBase=run(cwd,{VERCEL_GIT_COMMIT_REF:'feat/docs-only'});
    assert.equal(missingBase.status,1);
    assert.match(missingBase.stderr,/Failing open/);
  } finally {
    fs.rmSync(cwd,{recursive:true,force:true});
  }
});

test('Only main is allowed to deploy after the temporary typography preview exception is closed',()=>{
  const config=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../vercel.json'),'utf8'));
  assert.equal(config.git.deploymentEnabled.main,true);
  assert.equal(config.git.deploymentEnabled['*'],false);
  assert.equal(config.git.deploymentEnabled['feat/typography-qa-p0-p2-20261009'],undefined);
  assert.equal(config.ignoreCommand,'node scripts/vercel-ignore-build.cjs');
});
