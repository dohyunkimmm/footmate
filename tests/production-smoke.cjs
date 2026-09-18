const fs = require('node:fs');
const path = require('node:path');

const base = (process.env.FOOTMATE_PRODUCTION_URL || 'https://footmate-black.vercel.app').replace(/\/$/, '');
const reportDir = path.resolve('test-results');
const reportFile = path.join(reportDir, 'production-smoke.json');
const strictProduction = ['1','true','yes'].includes(String(process.env.FOOTMATE_STRICT_PRODUCTION || '').toLowerCase());

async function fetchText(route) {
  const response = await fetch(base + route, { redirect: 'follow', headers: { 'user-agent': 'FootMate-QA/1.0' } });
  return { url: response.url, status: response.status, contentType: response.headers.get('content-type') || '', body: await response.text() };
}
function assert(condition, message) { if (!condition) throw new Error(message); }

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
    for (const marker of ['<meta name="description"','<link rel="canonical" href="https://footmate-black.vercel.app/">','<meta property="og:title"','<meta property="og:image"','<meta name="twitter:card" content="summary_large_image">']) assert(body.includes(marker), `/ missing ${marker}`);
  });

  await run('demo-shell', '/demo', ({ body, contentType }) => {
    assert(contentType.includes('text/html'), '/demo must return HTML');
    assert(body.includes('FootMate | 인터랙티브 프로토타입'), '/demo shell title missing');
    assert(body.includes("fetch('/demo-source'"), '/demo shell source loader missing');
    assert(body.includes('footmate-product-core.js'), '/demo product policy core loader missing');
    assert(body.includes('footmate-product-hardening.js'), '/demo product hardening loader missing');
    if (strictProduction) {
      assert(body.includes('/src/v2/styles/core-funnel.css'), '/demo v2.4 core funnel stylesheet missing');
      assert(body.includes('/src/v2/styles/decision-recovery.css'), '/demo v2.5 decision/recovery stylesheet missing');
      assert(body.includes('/src/v2/bootstrap.js?v=20260919-2'), '/demo v2.6 bootstrap cache key missing');
    }
  });

  if (strictProduction) {
    await run('demo-legacy-shell', '/demo.html', ({ body, contentType }) => {
      assert(contentType.includes('text/html'), '/demo.html must return HTML');
      assert(body.includes("fetch('/demo-source'"), '/demo.html must resolve through the demo shell');
    });
  }

  await run('demo-source', '/demo-source', ({ body }) => {
    assert(body.includes('id="s-splash"'), 'demo source splash missing');
    assert(body.includes('id="s-profile"'), 'demo source profile screen missing');
    if (strictProduction) {
      assert(!body.includes('fm24-'), 'v2.4 component markup leaked into demo-source');
      assert(!body.includes('fm25-'), 'v2.5 component markup leaked into demo-source');
      assert(!body.includes('fm26-'), 'v2.6 architecture markup leaked into demo-source');
    }
  });

  await run('core-runtime', '/footmate-core.js', ({ body, contentType }) => {
    assert(contentType.includes('javascript') || contentType.includes('text/plain'), 'core runtime content type unexpected');
    assert(body.includes('FootMateCore'), 'FootMateCore marker missing');
  });

  await run('product-core-runtime', '/footmate-product-core.js', ({ body, contentType }) => {
    assert(contentType.includes('javascript') || contentType.includes('text/plain'), 'product core runtime content type unexpected');
    assert(body.includes('FootMateProductCore'), 'FootMateProductCore marker missing');
    assert(body.includes('transitionState'), 'product state machine marker missing');
  });

  await run('final-runtime', '/footmate-finalize.js', ({ body }) => {
    assert(body.includes('compatibility-state-bridge'), 'final runtime state-bridge marker missing');
    assert(body.includes('FootMateFinalRuntime'), 'final runtime state accessor missing');
  });

  await run('v2-bootstrap-runtime', '/src/v2/bootstrap.js', ({ body, contentType }) => {
    assert(contentType.includes('javascript') || contentType.includes('text/plain'), 'v2 bootstrap content type unexpected');
    assert(body.includes('FootMateV2Runtime'), 'v2 runtime marker missing');
    assert(body.includes("finalize:'state-bridge-only'"), 'v2 legacy boundary marker missing');
    if (strictProduction) {
      assert(body.includes("VERSION='2.1.0'"), 'v2.1 schema version marker missing');
      assert(body.includes("RELEASE_VERSION='2.6.0'"), 'v2.6 release marker missing');
      assert(body.includes('FootMateV26'), 'v2.6 runtime contract missing');
      assert(body.includes("releaseArchitecture:'v2.6-architecture-hardening'"), 'v2.6 release architecture marker missing');
      assert(body.includes("previousReleaseArchitecture:'v2.5-decision-recovery-experience'"), 'v2.5 previous architecture marker missing');
    }
  });

  if (strictProduction) {
    await run('v2.6-runtime-boundary', '/src/v2/demo/runtime-boundary.js', ({ body, contentType }) => {
      assert(contentType.includes('javascript') || contentType.includes('text/plain'), 'runtime boundary content type unexpected');
      assert(body.includes('v2.6-build-source-component-boundary'), 'v2.6 runtime boundary marker missing');
      assert(body.includes('39-screen-regression-fixture'), 'v2.6 legacy source role missing');
      assert(body.includes('legacy-render-adapter-only'), 'v2.6 patch role missing');
    });
    await run('v2.6-availability-gateway', '/src/v2/domain/availability-gateway.js', ({ body, contentType }) => {
      assert(contentType.includes('javascript') || contentType.includes('text/plain'), 'availability gateway content type unexpected');
      assert(body.includes('createAvailabilityGateway'), 'v2.6 availability gateway export missing');
      assert(body.includes('v2.6-availability-verification-boundary'), 'v2.6 availability architecture marker missing');
      assert(body.includes('serverVerified:false'), 'v2.6 prototype/server verification marker missing');
    });
    await run('v2.6-decision-trace-persistence', '/src/v2/state/decision-trace-persistence.js', ({ body, contentType }) => {
      assert(contentType.includes('javascript') || contentType.includes('text/plain'), 'trace persistence content type unexpected');
      assert(body.includes('createDecisionTracePersistence'), 'v2.6 trace persistence export missing');
      assert(body.includes('v2.6-decision-trace-persistence'), 'v2.6 trace persistence architecture marker missing');
      assert(body.includes("createStorage('decision-traces')"), 'v2.6 trace persistence storage key missing');
    });
    await run('v2.5-decision-engine', '/src/v2/domain/decision-engine.js', ({ body, contentType }) => {
      assert(contentType.includes('javascript') || contentType.includes('text/plain'), 'decision engine content type unexpected');
      assert(body.includes('createDecisionEngine'), 'v2.5 decision engine export missing');
      assert(body.includes("architecture:'v2.5-decision-recovery-engine'"), 'v2.5 decision architecture marker missing');
      assert(body.includes('traceId'), 'v2.5 decision trace marker missing');
    });
    await run('v2.5-decision-components', '/src/v2/demo/decision-recovery-components.js', ({ body }) => {
      assert(body.includes('DECISION_RECOVERY_SCREEN_IDS'), 'v2.5 screen registry missing');
      assert(body.includes('createComparisonBoard'), 'v2.5 comparison component missing');
      assert(body.includes('createPreflightCard'), 'v2.5 preflight component missing');
    });
    await run('v2.5-decision-experience', '/src/v2/ui/decision-recovery-experience.js', ({ body }) => {
      assert(body.includes("architecture:'v2.5-decision-recovery-experience'"), 'v2.5 experience architecture missing');
      assert(body.includes("componentSource:'src/v2/demo/decision-recovery-components.js'"), 'v2.5 component ownership marker missing');
    });
    await run('v2.5-decision-style', '/src/v2/styles/decision-recovery.css', ({ body }) => {
      assert(body.includes('FootMate v2.5 · Decision & Recovery Experience'), 'v2.5 stylesheet marker missing');
      assert(body.includes('.fm25-panel'), 'v2.5 decision panel style missing');
    });
    await run('v2.4-core-funnel-components', '/src/v2/demo/core-funnel-components.js', ({ body }) => {
      assert(body.includes('CORE_FUNNEL_STEPS'), 'v2.4 core funnel registry missing');
    });
    await run('v2-matching-domain-runtime', '/src/v2/domain/matching-engine.js', ({ body }) => {
      assert(body.includes('createMatchEngine'), 'v2.1 matching engine export missing');
    });
    await run('v2-elo-domain-runtime', '/src/v2/domain/elo-engine.js', ({ body }) => {
      assert(body.includes('createEloEngine'), 'v2.1 ELO engine export missing');
    });
  }

  await run('v2-payment-runtime', '/src/v2/ui/payment-controller.js', ({ body }) => {
    assert(body.includes('recordParticipation'), 'v2 participation adapter marker missing');
    assert(body.includes('paidMatchKeys'), 'v2 duplicate-charge guard marker missing');
    if (strictProduction) assert(body.includes('footmate:v2.5:decision-blocked'), 'v2.5 payment guard event missing');
  });

  await run('product-hardening-runtime', '/footmate-product-hardening.js', ({ body }) => {
    assert(body.includes('FootMateProductOps'), 'product operation API missing');
    assert(body.includes('duplicate_application_blocked'), 'duplicate application guard marker missing');
    if (strictProduction) assert(body.includes('v2.1-domain-store'), 'v2.1 recommendation source marker missing');
  });

  fs.mkdirSync(reportDir, { recursive: true });
  const payload = {base,checkedAt:new Date().toISOString(),githubSha:process.env.GITHUB_SHA||null,strictProduction,passed:checks.every(check=>check.ok),checks};
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
