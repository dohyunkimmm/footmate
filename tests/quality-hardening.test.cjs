const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = process.env.FOOTMATE_SOURCE_DIR || path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

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

test('runtime hardening scripts parse', () => {
  for (const file of ['footmate-core.js', 'footmate-patches.js', 'footmate-finalize.js', 'footmate-persist-extra.js', 'index-patches.js']) {
    assert.doesNotThrow(() => new vm.Script(read(file)), `${file} should parse`);
  }
});

test('opening the low-credit screen does not mutate persisted balance', () => {
  const source = read('footmate-finalize.js');
  const navigation = source.match(/window\.goScreen=function\(id\)\{[\s\S]*?return r\};/);
  assert.ok(navigation, 'goScreen wrapper should exist');
  assert.equal(navigation[0].includes('creditBalance=3000'), false);
  const simulation = source.match(/window\.simulateLowCredit=function\(\)\{[\s\S]*?\};/);
  assert.ok(simulation, 'explicit low-credit simulation should exist');
  assert.ok(simulation[0].includes('creditBalance=3000'));
  assert.ok(source.includes("lowCreditSimulation.onclick=()=>window.simulateLowCredit()"));
});

test('favorite and friend persistence uses entity identifiers', () => {
  const source = read('footmate-finalize.js');
  assert.ok(source.includes('favoriteMatchKeys:[]'));
  assert.ok(source.includes('friendIds:[]'));
  assert.ok(source.includes("currentFavoriteKey()"));
  assert.ok(source.includes("return'kim-minsu'"));
  assert.ok(source.includes("return'park-jihyun'"));
  assert.equal(source.includes('favorite:false'), false);
  assert.equal(source.includes('friendAdded:false'), false);
});

test('legacy boolean persistence is migrated instead of silently discarded', () => {
  const source = read('footmate-finalize.js');
  assert.ok(source.includes('finalState.favorite===true'));
  assert.ok(source.includes('finalState.friendAdded===true'));
  assert.ok(source.includes('delete finalState.favorite;delete finalState.friendAdded;'));
});
