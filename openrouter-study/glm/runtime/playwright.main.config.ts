import { defineConfig, devices } from '@playwright/test'
import { resolve } from 'node:path'
const task = process.env.MAG_TASK
if (!task || !/^P(?:0[3-9]|10)$/.test(task)) throw Error('Set MAG_TASK=P03..P10')
export default defineConfig({
  fullyParallel: false, workers: 1, retries: 0, forbidOnly: !!process.env.CI,
  outputDir: process.env.MAIN_OUTPUT_DIR || `.work/${task}/test-results`,
  reporter: [['list'], ['json', { outputFile: process.env.MAIN_REPORT_FILE || `reports/${task}-reference-results.json` }]],
  use: { baseURL: 'http://127.0.0.1:5188', actionTimeout: 5_000, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'node scripts/start-main.mjs', url: 'http://127.0.0.1:5188/api/health', env: { WEB_PORT: '5188', API_PORT: '3116', MOCK_CONTROL: '1' }, reuseExistingServer: false, timeout: 30_000 },
  projects: [
    { name: 'regression-api', testDir: resolve(`.work/${task}/baseline/tests`), testMatch: 'api.spec.ts' },
    ...(['desktop', 'mobile'] as const).flatMap(size => {
      const use = size === 'desktop' ? { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 960 } } : { ...devices['iPhone 13'], defaultBrowserType: 'chromium' as const }
      return [
        { name: `regression-${size}`, testDir: resolve(`.work/${task}/baseline/tests`), testMatch: 'baseline.spec.ts', use },
        { name: `development-${size}`, testDir: resolve(`tasks/${task}`), testMatch: 'development.spec.ts', use },
        { name: `evaluation-${size}`, testDir: resolve(`evaluation/${task}`), testMatch: 'acceptance.spec.ts', use },
      ]
    }),
  ],
})
