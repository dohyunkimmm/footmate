const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const guide = readFileSync(path.join(__dirname, '..', '..', 'src', 'app', 'app.js'), 'utf8');
const readme = readFileSync(path.join(__dirname, '..', '..', 'README.md'), 'utf8');
const stylesheet = readFileSync(path.join(__dirname, '..', '..', 'src', 'app', 'app.css'), 'utf8');

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

test('P0: sample refund guidance never implies a real refund', () => {
  assert.match(guide, /시연용 정책 예시/);
  assert.match(guide, /실제 결제·환불은 없습니다/);
});

test('P1: fast review actions remain visible on mobile and scroll to their result', () => {
  const mobileRules = stylesheet.slice(stylesheet.lastIndexOf('/* P1: the 90-second review actions'));
  assert.match(mobileRules, /@media\(max-width:920px\)/);
  assert.match(mobileRules, /\.fm-next-guide\{display:flex;position:relative/);
  assert.match(mobileRules, /\.fm-next-review-shortcuts button\{min-height:44px/);
  assert.match(mobileRules, /\.fm-next-scenarios button\{min-height:44px/);
  assert.match(mobileRules, /:focus-visible\{outline:3px solid var\(--fm-lime\)/);
  assert.match(guide, /function scrollGuidedReviewIntoView\(\)/);
  assert.equal((guide.match(/scrollGuidedReviewIntoView\(\);return;/g) || []).length, 4);
});
