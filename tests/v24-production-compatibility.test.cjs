const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.FOOTMATE_SOURCE_DIR || path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'tests/e2e/production.spec.cjs'), 'utf8');

test('production browser smoke keeps compatibility and exact current-release verification separate', () => {
  assert.ok(source.includes("if (strictProduction) await page.waitForFunction(() => !!window.FootMateV28 && !!window.FootMateV27 && !!window.FootMateV26 && window.FootMateV2Runtime?.version === '2.8.0');"));
  assert.ok(source.includes("window.FootMateV28?.version || window.FootMateV27?.version || window.FootMateV26?.version || window.FootMateV25?.version || null"));
  assert.ok(source.includes("await expect(page.locator('#s-home [data-fm25-slot=\"next-action\"]')).toBeVisible();"));
  assert.ok(source.includes("await page.waitForFunction(() => window.__footmateV2 === true && document.querySelectorAll('.screen').length === 39);"));
  assert.ok(source.includes("expect(release.version).toBe('2.8.0')"));
  assert.ok(source.includes("expect(release.v28).toMatchObject({version:'2.8.0'"));
  assert.ok(source.includes("expect(release.v27).toMatchObject({version:'2.7.0',currentReleaseVersion:'2.8.0'"));
  assert.ok(source.includes("expect(release.v26).toMatchObject({version:'2.6.0',currentReleaseVersion:'2.8.0'"));
  assert.ok(source.includes("expect(release.v25).toMatchObject({version:'2.5.0',currentReleaseVersion:'2.8.0'"));
});
