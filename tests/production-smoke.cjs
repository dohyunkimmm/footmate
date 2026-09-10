const fs = require('node:fs');
const path = require('node:path');

const base = (process.env.FOOTMATE_PRODUCTION_URL || 'https://footmate-black.vercel.app').replace(/\/$/, '');
const reportDir = path.resolve('test-results');
const reportFile = path.join(reportDir, 'production-smoke.json');

async function fetchText(route) {
  const url = base + route;
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'FootMate-QA/1.0' } });
  const body = await response.text();
  return { url: response.url, status: response.status, contentType: response.headers.get('content-type') || '', body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const checks = [];
  const run = async (name, route, verify) => {
    const startedAt = new Date().toISOString();
    try {
      const result = await fetchText(route);
      assert(result.status >= 200 && result.status < 300, `${route} returned ${result.status}`);
      verify(result);
      checks.push({ name, route, ok: true, status: result.status, resolvedUrl: result.url, startedAt });
    } catch (error) {
      checks.push({ name, route, ok: false, error: error.message, startedAt });
    }
  };

  await run('case-study-html', '/', ({ body, contentType }) => {
    assert(contentType.includes('text/html'), '/ must return HTML');
    for (const marker of [
      '<meta name="description"',
      '<link rel="canonical" href="https://footmate-black.vercel.app/">',
      '<meta property="og:title"',
      '<meta property="og:image"',
      '<meta name="twitter:card" content="summary_large_image">'
    ]) assert(body.includes(marker), `/ missing ${marker}`);
  });

  await run('demo-shell', '/demo', ({ body, contentType }) => {
    assert(contentType.includes('text/html'), '/demo must return HTML');
    assert(body.includes('FootMate | 인터랙티브 프로토타입'), '/demo shell title missing');
    assert(body.includes("fetch('/demo-source'"), '/demo shell source loader missing');
  });

  await run('demo-source', '/demo-source', ({ body }) => {
    assert(body.includes('id="s-splash"'), 'demo source splash missing');
    assert(body.includes('id="s-profile"'), 'demo source profile screen missing');
  });

  await run('core-runtime', '/footmate-core.js', ({ body, contentType }) => {
    assert(contentType.includes('javascript') || contentType.includes('text/plain'), 'core runtime content type unexpected');
    assert(body.includes('FootMateCore'), 'FootMateCore marker missing');
  });

  await run('final-runtime', '/footmate-finalize.js', ({ body, contentType }) => {
    assert(contentType.includes('javascript') || contentType.includes('text/plain'), 'final runtime content type unexpected');
    assert(body.includes('simulateLowCredit'), 'final runtime hardening marker missing');
    assert(body.includes('favoriteMatchKeys'), 'entity persistence marker missing');
  });

  fs.mkdirSync(reportDir, { recursive: true });
  const payload = {
    base,
    checkedAt: new Date().toISOString(),
    githubSha: process.env.GITHUB_SHA || null,
    passed: checks.every(check => check.ok),
    checks
  };
  fs.writeFileSync(reportFile, JSON.stringify(payload, null, 2) + '\n');

  for (const check of checks) {
    console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name} ${check.route}${check.status ? ` (${check.status})` : ''}`);
    if (!check.ok) console.error(`  ${check.error}`);
  }
  if (!payload.passed) process.exitCode = 1;
}

main().catch(error => {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportFile, JSON.stringify({ base, checkedAt: new Date().toISOString(), passed: false, fatal: error.message }, null, 2) + '\n');
  console.error(error);
  process.exitCode = 1;
});
