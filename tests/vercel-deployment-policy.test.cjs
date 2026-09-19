const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Vercel Git integration auto-deploys main only', () => {
  const configPath = path.join(__dirname, '..', 'vercel.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  assert.equal(config.git?.deploymentEnabled?.['*'], false);
  assert.equal(config.git?.deploymentEnabled?.main, true);
});
