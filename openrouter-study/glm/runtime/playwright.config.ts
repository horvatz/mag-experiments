import { defineConfig, devices } from '@playwright/test'
import { resolve } from 'node:path'

export default defineConfig({
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  outputDir: process.env.P01_OUTPUT_DIR || 'test-results',
  reporter: [['list'], ['json', { outputFile: process.env.P01_REPORT_FILE || 'reports/reference-results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5184', actionTimeout: 5_000,
    trace: 'retain-on-failure', screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node scripts/start-app.mjs',
    url: 'http://127.0.0.1:5184/api/health',
    env: { WEB_PORT: '5184', API_PORT: '3112', MOCK_CONTROL: '1' },
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [
    { name: 'regression-api', testDir: resolve('.work/baseline/tests'), testMatch: 'api.spec.ts' },
    ...(['desktop', 'mobile'] as const).flatMap((size) => {
      const use = size === 'desktop'
        ? { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 960 } }
        : { ...devices['iPhone 13'], defaultBrowserType: 'chromium' as const }
      return [
        { name: `regression-${size}`, testDir: resolve('.work/baseline/tests'), testMatch: 'baseline.spec.ts', use },
        { name: `development-${size}`, testDir: resolve('tasks/P01'), testMatch: 'development.spec.ts', use },
        { name: `evaluation-${size}`, testDir: resolve('evaluation/P01'), testMatch: 'acceptance.spec.ts', use },
      ]
    }),
  ],
})
