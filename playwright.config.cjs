const { defineConfig, devices } = require('@playwright/test');

const externalBaseURL = process.env.BASE_URL || '';

module.exports = defineConfig({
  testDir: './tests/e2e',
  // Retired 13-section specs are preserved in Git history, not this test tree.
  // Current 11-section acceptance is covered by case-study-eleven-stages.spec.cjs.
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: 'test-results/playwright',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: externalBaseURL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: externalBaseURL ? undefined : {
    command: 'node tests/e2e/server.cjs',
    url: 'http://127.0.0.1:4173/beta',
    reuseExistingServer: false,
    timeout: 15_000
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Keep Skia's raster path independent of the CI runner CPU.
        // https://chromium.googlesource.com/chromium/src/+/lkgr/content/public/common/content_switches.cc
        launchOptions: { args: ['--disable-skia-runtime-opts'] }
      }
    },
    {
      name: 'webkit-mobile',
      testMatch: /release-app\.spec\.cjs/,
      use: { ...devices['iPhone 13'] }
    },
    {
      name: 'webkit-beta-consent',
      testMatch: /beta-core\.spec\.cjs/,
      grep: /discovery followup sends real events|discovery hotfix preserves failed withdrawal|discovery qa/,
      use: { ...devices['iPhone 13'] }
    }
  ]
});

