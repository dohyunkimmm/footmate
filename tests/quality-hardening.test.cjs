const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = process.env.FOOTMATE_SOURCE_DIR || path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));

test('production case study shell stays synchronized', () => {
  assert.equal(read('index.html'), read('index-shell.html'));
});

test('approved demo source stays synchronized', () => {
  assert.equal(read('demo.html'), read('demo-source.html'));
});

test('production shell exposes SEO and social metadata before JavaScript runs', () => {
  const html = read('index.html');
  for (const marker of [
    '<meta name="description"',
    '<link rel="canonical" href="https://footmate-black.vercel.app/">',
    '<meta property="og:title"',
    '<meta property="og:image"',
    '<meta name="twitter:card" content="summary_large_image">'
  ]) assert.ok(html.includes(marker), `missing metadata: ${marker}`);
});

test('runtime hardening classics parse and v2 module graph is wired', () => {
  for (const file of [
    'footmate-core.js',
    'footmate-product-core.js',
    'footmate-patches.js',
    'footmate-finalize.js',
    'footmate-product-hardening.js',
    'index-patches.js'
  ]) {
    assert.doesNotThrow(() => new vm.Script(read(file)), `${file} should parse`);
  }

  for (const file of [
    'src/v2/bootstrap.js',
    'src/v2/state/product-store.js',
    'src/v2/state/scenario-store.js',
    'src/v2/ui/home-controller.js',
    'src/v2/ui/filter-results-controller.js',
    'src/v2/ui/payment-controller.js',
    'src/v2/ui/secondary-controller.js',
    'src/v2/ui/screen-effects.js'
  ]) assert.ok(exists(file), `missing v2 module: ${file}`);

  const shell = read('demo-shell.html');
  assert.ok(shell.includes('/footmate-product-core.js'));
  assert.ok(shell.includes('/footmate-product-hardening.js'));
  assert.ok(shell.includes('/footmate-product-hardening.css'));
  assert.ok(shell.includes('type="module" src="/src/v2/bootstrap.js'));
  assert.equal(shell.includes('/footmate-persist-extra.js'), false);
  assert.equal(exists('footmate-persist-extra.js'), false);
  assert.ok(shell.includes('/footmate-experience.css'));
  assert.equal(shell.includes('/footmate-v1.1.css'), false);

  const caseStudyShell = read('index.html');
  assert.ok(caseStudyShell.includes('/case-study-experience.css'));
  assert.ok(caseStudyShell.includes('/index-experience.js'));
  assert.equal(caseStudyShell.includes('/case-study-v1.1.css'), false);
  assert.equal(caseStudyShell.includes('/index-v1.1.js'), false);
  assert.equal(exists('footmate-v1.1.css'), false);
  assert.equal(exists('case-study-v1.1.css'), false);
  assert.equal(exists('index-v1.1.js'), false);

  assert.ok(read('index-patches.js').includes('fmDecisionSummary'));
});

test('low-credit mutation moved out of navigation and into payment adapter', () => {
  const finalize = read('footmate-finalize.js');
  const payment = read('src/v2/ui/payment-controller.js');
  const patch = read('footmate-patches.js');
  const hardening = read('footmate-product-hardening.js');

  assert.equal(finalize.includes('window.goScreen=function'), false);
  assert.equal(patch.includes('goScreen=function(id)'), false);
  assert.equal(hardening.includes('window.goScreen=function'), false);
  assert.ok(payment.includes('creditBalance:3000'));
  assert.ok(payment.includes("window.goScreen?.('s-pay-low')"));
  assert.ok(payment.includes('window.simulateLowCredit=simulateLowCredit'));
  assert.ok(finalize.includes("architecture:'compatibility-state-bridge'"));
});

test('favorite and friend persistence uses entity identifiers in v2 controller', () => {
  const finalize = read('footmate-finalize.js');
  const secondary = read('src/v2/ui/secondary-controller.js');
  assert.ok(finalize.includes('favoriteMatchKeys:[]'));
  assert.ok(finalize.includes('friendIds:[]'));
  assert.ok(secondary.includes('favoriteKey()'));
  assert.ok(secondary.includes("return'kim-minsu'"));
  assert.ok(secondary.includes("return'park-jihyun'"));
  assert.equal(finalize.includes('favorite:false'), false);
  assert.equal(finalize.includes('friendAdded:false'), false);

  const hardening = read('footmate-product-hardening.js');
  assert.ok(hardening.includes('operationByMatch'));
  assert.ok(hardening.includes('duplicate_application_blocked'));
  assert.ok(hardening.includes('refund_complete'));
});

test('legacy boolean persistence is migrated instead of silently discarded', () => {
  const source = read('footmate-finalize.js');
  assert.ok(source.includes('state.favorite===true'));
  assert.ok(source.includes('state.friendAdded===true'));
  assert.ok(source.includes('delete state.favorite'));
  assert.ok(source.includes('delete state.friendAdded'));
});

test('v2 controllers are the owners of migrated critical interactions', () => {
  const bootstrap = read('src/v2/bootstrap.js');
  const home = read('src/v2/ui/home-controller.js');
  const filters = read('src/v2/ui/filter-results-controller.js');
  const payment = read('src/v2/ui/payment-controller.js');
  const secondary = read('src/v2/ui/secondary-controller.js');

  assert.ok(bootstrap.includes("VERSION='2.0.0'"));
  assert.ok(bootstrap.includes("finalize:'state-bridge-only'"));
  assert.ok(home.includes("removeAttribute('onclick')"));
  assert.ok(filters.includes("removeAttribute('onclick')"));
  assert.ok(payment.includes("removeAttribute('onclick')"));
  assert.ok(secondary.includes("removeAttribute('onclick')"));
});
