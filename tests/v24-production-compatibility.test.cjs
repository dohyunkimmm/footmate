const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.FOOTMATE_SOURCE_DIR || path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'tests/e2e/production.spec.cjs'), 'utf8');

test('production browser smoke keeps compatibility and exact v2.5 verification separate', () => {
  assert.ok(source.includes("if (strictProduction) await page.waitForFunction(() => !!window.FootMateV25);"));
  assert.ok(source.includes("window.FootMateV25?.version || window.FootMateV24?.version || window.FootMateV23?.version || window.FootMateV22?.version || null"));
  assert.ok(source.includes("if (strictProduction) await expect(page.locator('#s-home [data-fm25-slot=\"next-action\"]')).toBeVisible();"));
  assert.ok(source.includes("await page.waitForFunction(() => window.__footmateV2 === true && document.querySelectorAll('.screen').length === 39);"));
});
