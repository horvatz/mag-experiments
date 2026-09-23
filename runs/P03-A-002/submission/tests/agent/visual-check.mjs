import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'

const { wsEndpoint } = JSON.parse(readFileSync(new URL('../../task/browser.json', import.meta.url), 'utf8'))
const browser = await chromium.connect(wsEndpoint)
const errors = []
const reports = []
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 960 } })
    try {
      const page = await context.newPage()
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto('http://127.0.0.1:5193/#/projects/web')
      await page.getByRole('table').waitFor()
      await page.screenshot({ path: `docs/agent/folio-${width}-table.png`, fullPage: true })
      await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('pregled')
      await page.getByRole('button', { name: 'Tabla', exact: true }).click()
      await page.getByRole('region', { name: 'Tabla opravil', exact: true }).waitFor()
      await page.screenshot({ path: `docs/agent/folio-${width}-board.png`, fullPage: true })
      reports.push(await page.evaluate(() => ({
        width: innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        results: document.querySelector('[aria-label="Rezultati filtriranja"]').textContent,
        search: document.querySelector('input[type="search"]').value,
      })))
      await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('brez-zadetkov')
      await page.getByText('Ni zadetkov.', { exact: true }).waitFor()
      await page.screenshot({ path: `docs/agent/folio-${width}-empty.png`, fullPage: true })
      assert.equal(await page.locator('[data-task-id]').count(), 0)
      assert.equal(await page.locator('.board-column').count(), 3)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      await page.getByRole('button', { name: 'Počisti filtre' }).click()
      assert.equal(await page.getByRole('searchbox', { name: 'Išči opravila' }).inputValue(), '')
    } finally {
      await context.close()
    }
  }
  assert.deepEqual(errors, [])
  assert(reports.every((report) => report.pageWidth <= report.width))
  console.log(JSON.stringify({ reports, pageErrors: errors, screenshots: 6, result: 'PASS' }, null, 2))
} finally {
  await browser.close()
}
