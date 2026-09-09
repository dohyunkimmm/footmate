// Dependency-free logic regression tests. DOM doubles do not replace browser QA.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = process.env.FOOTMATE_SOURCE_DIR || path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'demo.html'), 'utf8');
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].at(-1)[1];

function harness() {
  const nodes = new Map(), listeners = {}, windowListeners = {}, jobs = new Map();
  let nextJob = 1, now = 0;
  const document = {activeElement:null, addEventListener:(type,fn) => {listeners[type]=fn;}};
  function element(id='', classes='') {
    const attrs = {}, classSet = new Set(classes.split(/\s+/));
    return {id, style:{}, dataset:{}, textContent:'', innerHTML:'', disabled:false,
      childNodes:[{nodeValue:''}], inert:false, isConnected:true,
      classList:{contains:c=>classSet.has(c), add:c=>classSet.add(c), remove:c=>classSet.delete(c),
        toggle(c,on=!classSet.has(c)){on?classSet.add(c):classSet.delete(c);return on;}},
      setAttribute:(k,v)=>{attrs[k]=v;}, getAttribute:k=>attrs[k] ?? null,
      hasAttribute:k=>Object.hasOwn(attrs,k), querySelector:()=>null, querySelectorAll:()=>[],
      closest:()=>null, getClientRects:()=>[{}], focus(){document.activeElement=this;},
      blur(){document.activeElement=null;}, scrollIntoView(){}, insertAdjacentHTML(){}
    };
  }
  for (const tag of html.matchAll(/<[^!\/][^>]*?\sid="([^"]+)"[^>]*>/g)) {
    const node = element(tag[1], /\bclass="([^"]*)"/.exec(tag[0])?.[1] || '');
    for (const a of tag[0].matchAll(/data-([\w-]+)="([^"]*)"/g)) node.dataset[a[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=a[2];
    nodes.set(node.id,node);
  }
  const quizOptions = Array.from({length:4},()=>element('', 'quiz-opt'));
  for (const method of ['kakao','naver','card']) {
    const check = element();
    nodes.get('method-'+method).querySelector=()=>check;
  }
  document.getElementById=id=>nodes.get(id)||null;
  document.querySelector=selector=>selector==='.screen.active' ? [...nodes.values()].find(n=>n.classList.contains('screen')&&n.classList.contains('active')) : selector==='#quizContent .quiz-opt' ? quizOptions[0] : null;
  document.querySelectorAll=selector=>selector==='#quizContent .quiz-opt' ? quizOptions : [];
  document.body=element('body');
  const schedule=(fn,delay,repeat=false)=>{const id=nextJob++;jobs.set(id,{fn,at:now+delay,delay,repeat});return id;};
  const location={hash:'',pathname:'/demo',search:''};
  const history={state:null, writes:0,pushState(state,_,url){this.state=state;this.writes++;location.hash=url;},replaceState(state,_,url){this.state=state;location.hash=url;}};
  const window={addEventListener:(type,fn)=>{windowListeners[type]=fn;}};
  window.self=window;window.top=window;
  const ctx=vm.createContext({document,window,location,history,console,
    setTimeout:(fn,ms)=>schedule(fn,ms),setInterval:(fn,ms)=>schedule(fn,ms,true),
    clearTimeout:id=>jobs.delete(id),clearInterval:id=>jobs.delete(id),
    requestAnimationFrame:fn=>schedule(fn,16),getComputedStyle:()=>({display:'block'})});
  const run=code=>vm.runInContext(code,ctx);
  // Execute declarations and event registrations; visual startup is browser-only.
  run(script.split('// ── INIT')[0]);
  function tick(ms){const end=now+ms;for(let i=0;i<10000;i++){
    const next=[...jobs.entries()].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
    if(!next){now=end;return;}const [id,j]=next;now=j.at;
    if(j.repeat)j.at+=j.delay;else jobs.delete(id);j.fn();
  }throw Error('Runaway timer');}
  return {run,tick,nodes,document,location,history,listeners,windowListeners,element,jobs,ctx};
}

test('all inline scripts and event handlers parse',()=>{
  for(const file of ['demo.html','index.html']){
    const source=fs.readFileSync(path.join(root,file),'utf8');
    for(const [,js] of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(js);
    for(const [,js] of source.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g,'').matchAll(/\bon\w+="([^"]*)"/g)) new Function('event',js.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'"));
  }
});

test('all 39 emitted deep links and legacy aliases resolve to their screen',()=>{
  const h=harness();
  assert.equal(h.run('screens.length'),39);
  assert.equal(h.run("screens.every(s=>screenFromHash('#'+(hashByScreen[s.id]||s.id.replace(/^s-/,'')))===s.id)"),true);
  assert.equal(h.run("screenFromHash('#elo-update')"),'s-eloUpdate');
  assert.equal(h.run("screenFromHash('#invalid')"),'s-splash');
});

test('back/forward or hash navigation restores the screen without another history entry',()=>{
  const h=harness();h.run('demoStarted=true');
  h.run("goScreen('s-home');goScreen('s-profile')");
  assert.equal(h.location.hash,'#profile');
  const writes=h.history.writes;h.location.hash='#home';h.windowListeners.popstate();h.windowListeners.hashchange();
  assert.equal(h.run('currentScreen'),'s-home');assert.equal(h.history.writes,writes);
});

test('invalid navigation preserves the current active screen',()=>{
  const h=harness();h.run("goScreen('missing-screen')");
  assert.equal(h.nodes.get('s-splash').classList.contains('active'),true);
});

test('rapid quiz clicks answer exactly one question',()=>{
  const h=harness();h.run("goScreen('s-quiz')");
  h.ctx.option=h.element();h.run('selectQuizOpt(option,0);selectQuizOpt(option,1)');h.tick(401);
  assert.equal(h.run('quizStep'),1);assert.equal(h.run('scenarioProfile.position'),'FW');
});

test('leaving a pending quiz cancels its advance and allows a later answer',()=>{
  const h=harness();h.ctx.option=h.element();h.run("goScreen('s-quiz');selectQuizOpt(option,0);goScreen('s-home')");h.tick(500);
  assert.equal(h.run('quizStep'),0);assert.equal(h.run('currentScreen'),'s-home');
  h.run("goScreen('s-quiz');selectQuizOpt(option,2)");h.tick(401);assert.equal(h.run('quizStep'),1);
});

test('all five quiz questions reach location without a skipped answer',()=>{
  const h=harness();h.ctx.option=h.element();h.run("goScreen('s-quiz')");
  for(let i=0;i<5;i++){h.run('selectQuizOpt(option,1)');h.tick(401);}
  assert.equal(h.run('currentScreen'),'s-location');assert.equal(h.run('scenarioProfile.region'),'seongnam');
});

test('manual region selection changes scoring and enables confirmation',()=>{
  const h=harness();h.ctx.option=h.element();h.ctx.option.dataset.regionKey='north';
  h.nodes.get('regionConfirmBtn').disabled=true;h.run('syncDynamicScenario();selectRegion(option)');
  assert.equal(h.run('scenarioProfile.region'),'north');assert.equal(h.run('matchScenarios.suwon.locationScore'),60);
  assert.match(h.nodes.get('filter-region-value').textContent,/경기 북부/);assert.equal(h.nodes.get('regionConfirmBtn').disabled,false);
  assert.match(html,/id="regionConfirmBtn" disabled/);
});

test('SSO continues normally but cannot redirect after the user leaves',()=>{
  const h=harness();h.run("startSSO('kakao');goScreen('s-home')");h.tick(10000);assert.equal(h.run('currentScreen'),'s-home');
  h.run("startSSO('kakao')");h.tick(10000);assert.equal(h.run('currentScreen'),'s-quiz');
});

test('location confirmation is cancelled on exit and can be retried',()=>{
  const h=harness();h.ctx.locationButton=h.element();h.ctx.locationButton.textContent='위치 허용';
  h.nodes.get('s-location').querySelector=()=>h.ctx.locationButton;
  h.run("goScreen('s-location');allowLocation(locationButton);goScreen('s-home')");h.tick(1500);
  assert.equal(h.run('currentScreen'),'s-home');assert.equal(h.ctx.locationButton.disabled,false);
  assert.equal(h.ctx.locationButton.textContent,'위치 허용');
  h.run("goScreen('s-location');allowLocation(locationButton)");h.tick(1201);assert.equal(h.run('currentScreen'),'s-elo');
});

test('stale animation frames do not start game/chat work after navigation',()=>{
  const h=harness();h.run("goScreen('s-gameday');goScreen('s-chat');goScreen('s-home')");h.tick(100);
  assert.equal(h.run('chatActive'),false);assert.equal(h.run('kickoffInterval'),null);
});

for(const [method,label] of [['kakao','카카오페이'],['naver','네이버페이'],['card','신용 · 체크카드']]){
  test(`${method} charge receipt and participation agree immediately`,()=>{
    const h=harness();h.run(`selectMethod('${method}');selectedChargeAmount=30000;completeCharge()`);
    assert.equal(h.nodes.get('chargeDoneBalance').textContent,`${label} · 충전 후 잔액 ₩33,000`);
    assert.equal(h.nodes.get('chargeDoneRemaining').textContent,'₩16,000');
    assert.equal(h.run('participationConfirmed'),true);assert.equal(h.run('currentScreen'),'s-charge-done');
    assert.equal(h.nodes.get('method-'+method).querySelector().textContent,'✓');
    h.run('confirmParticipation()');assert.equal(h.run("demoEvents.filter(e=>e.name==='payment_complete').length"),1);
  });
}

test('opening the implemented team detail clears another recommendation selection',()=>{
  const h=harness();h.run("syncDynamicScenario();selectMatch('seongnam');goScreen('s-detail')");
  assert.equal(h.run('selectedMatchKey'),'suwon');assert.equal(h.nodes.get('reasonMatchTitle').textContent,'수원 FC UNITED');
});

test('zero ELO change remains unchanged; positive and negative changes finish exactly',()=>{
  const h=harness();
  for(const target of [1295,1311,1279]){
    h.run(`clearScreenTasks();demoState.initialElo=1295;demoState.updatedElo=${target};animateElo()`);h.tick(1000);
    assert.equal(h.nodes.get('eloNewNum').textContent,target.toLocaleString());
  }
});

test('submitting an evaluation clears its deferred reminder',()=>{
  const h=harness();h.nodes.get('evalReminder').style.display='block';
  h.run('setStars(4);submitEvaluation()');assert.equal(h.nodes.get('evalReminder').style.display,'none');
});

test('Korean IME Enter does not send until composition finishes',()=>{
  const code=/id="chatInput"[^>]*onkeydown="([^"]+)"/.exec(html)[1].replaceAll('&amp;','&');
  let sent=0,prevented=0;const handle=new Function('event','sendChatMsg',code);
  for(const event of [{isComposing:true,keyCode:13},{isComposing:false,keyCode:229}]){
    handle({...event,key:'Enter',preventDefault:()=>prevented++},()=>sent++);
  }
  assert.equal(sent,0);assert.equal(prevented,0);
  handle({key:'Enter',isComposing:false,keyCode:13,preventDefault:()=>prevented++},()=>sent++);
  assert.equal(sent,1);assert.equal(prevented,1);
});

test('onboarding Tab loops within its visible action',()=>{
  const h=harness(),button=h.element(),hidden=h.element();hidden.getClientRects=()=>[];
  h.nodes.get('demoOnboarding').querySelectorAll=()=>[button,hidden];button.focus();let prevented=false;
  h.listeners.keydown({key:'Tab',target:button,preventDefault:()=>prevented=true});
  assert.equal(prevented,true);assert.equal(h.document.activeElement,button);
});

test('case study keyboard shortcut does not override a TOC action or an open dialog',()=>{
  const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const keyScript=source.slice(source.lastIndexOf("document.addEventListener('keydown',e=>"),source.indexOf('\nsyncViewportHeight();const initialIndex'));
  let handler,moves=0,open=false;const ctx=vm.createContext({document:{addEventListener:(_,fn)=>handler=fn,querySelector:()=>open?{}:null},next:()=>moves++,prev:()=>moves--});
  vm.runInContext(keyScript,ctx);
  handler({key:' ',defaultPrevented:true,preventDefault(){}});assert.equal(moves,0);
  handler({key:' ',target:{tagName:'DIV',closest:()=>({})}});assert.equal(moves,0);
  open=true;handler({key:'ArrowRight'});assert.equal(moves,0);
  open=false;handler({key:'ArrowRight',target:{tagName:'DIV',closest:()=>null},preventDefault(){}});assert.equal(moves,1);
});
