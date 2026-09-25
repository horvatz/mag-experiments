import { chromium, expect } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'

// Run while WEB_PORT=5193 API_PORT=3123 npm run dev is serving the app.
const { wsEndpoint } = JSON.parse(readFileSync('task/browser.json', 'utf8'))
const browser = await chromium.connect(wsEndpoint)
const context = await browser.newContext({ viewport: { width: 1440, height: 960 } })
try {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5193/')
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  const checks = []
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 960 })
    for (const view of ['Preglednica', 'Tabla']) {
      const button = page.getByRole('button', { name: view, exact: true })
      await button.click()
      await expect(button).toHaveAttribute('aria-pressed', 'true')
      await expect(view === 'Tabla' ? page.getByRole('region', { name: 'Tabla opravil', exact: true }) : page.getByRole('table')).toBeVisible()
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }))
      expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport)
      checks.push({ width, view, dimensions })
      await page.screenshot({ path: `docs/agent/${width === 390 ? 'mobile' : 'desktop'}-${view === 'Tabla' ? 'board' : 'table'}.png`, fullPage: true })
    }
  }
  await page.getByLabel('Pogled rokov', { exact: true }).selectOption('today')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await page.screenshot({ path: 'docs/agent/mobile-empty-date.png', fullPage: true })
  expect(errors).toEqual([])
  const result = { checks, errors, emptyDateWarning: await page.getByRole('alert').innerText(), counts: await page.locator('[aria-label^="Število rokov"]').allTextContents() }
  writeFileSync('docs/agent/manual-browser.json', JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify(result))
} finally {
  await context.close()
  await browser.close()
}
