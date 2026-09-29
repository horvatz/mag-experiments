import { defineConfig, devices } from '@playwright/test'
import { resolve } from 'node:path'

export default defineConfig({
  fullyParallel: false, workers: 1, retries: 0, forbidOnly: !!process.env.CI,
  outputDir: process.env.P02_OUTPUT_DIR || '.work/P02/test-results',
  reporter: [['list'], ['json', { outputFile: process.env.P02_REPORT_FILE || 'reports/P02-reference-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:5186', actionTimeout: 5_000, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    command: 'node scripts/start-p02.mjs', url: 'http://127.0.0.1:5186/api/health',
    env: { WEB_PORT: '5186', API_PORT: '3114', MOCK_CONTROL: '1' },
    reuseExistingServer: false, timeout: 30_000,
  },
  projects: [
    { name: 'regression-api', testDir: resolve('.work/P02/baseline/tests'), testMatch: 'api.spec.ts' },
    ...(['desktop', 'mobile'] as const).flatMap((size) => {
      const use = size === 'desktop'
        ? { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 960 } }
        : { ...devices['iPhone 13'], defaultBrowserType: 'chromium' as const }
      return [
        { name: `regression-${size}`, testDir: resolve('.work/P02/baseline/tests'), testMatch: 'baseline.spec.ts', use },
        { name: `development-${size}`, testDir: resolve('tasks/P02'), testMatch: 'development.spec.ts', use },
        { name: `evaluation-${size}`, testDir: resolve('evaluation/P02'), testMatch: 'acceptance.spec.ts', use },
      ]
    }),
  ],
})
