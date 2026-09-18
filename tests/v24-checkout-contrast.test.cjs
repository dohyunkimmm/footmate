const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.env.FOOTMATE_SOURCE_DIR || path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'src/v2/styles/core-funnel.css'), 'utf8');

test('v2.4 checkout completion state keeps an accessible foreground color', () => {
  assert.ok(css.includes('.fm24-checkout-step[data-state="done"]{background:color-mix(in srgb,var(--fm-color-success-600) 9%,white);color:#146B4D}'));
});
