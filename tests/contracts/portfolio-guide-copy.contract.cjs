const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const guide = readFileSync(path.join(__dirname, '..', '..', 'src', 'app', 'app.js'), 'utf8');
const readme = readFileSync(path.join(__dirname, '..', '..', 'README.md'), 'utf8');

test('portfolio guide uses clear Korean and does not imply real billing', () => {
  assert.match(guide, /FootMate Demo와 동일한 예시 경기/);
  assert.match(guide, /실제 청구 0원/);
  assert.doesNotMatch(guide, /Interactive Demo과/);
});

test('all guided quick-review targets have readable tappable dimensions', () => {
  const buttons = guide.match(/min-height:44px;font-size:13px/g) || [];
  assert.equal(buttons.length, 4);
});

test('recruiters can enter the fast demo from README', () => {
  assert.match(readme, /footmate\.fmate\.workers\.dev\/demo\?mode=guided/);
  assert.match(readme, /예시 데이터만 사용하는 빠른 검토 모드/);
});
