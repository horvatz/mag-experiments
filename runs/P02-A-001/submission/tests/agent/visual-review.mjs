import { readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const { wsEndpoint } = JSON.parse(readFileSync(new URL('../../task/browser.json', import.meta.url), 'utf8'))
const browser = await chromium.connect(wsEndpoint)
const context = await browser.newContext({ viewport: { width: 1440, height: 960 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
try {
  await page.goto('http://127.0.0.1:5193/')
  await page.getByRole('checkbox', { name: 'Izberi opravilo web-01', exact: true }).check()
  await page.getByRole('checkbox', { name: 'Izberi opravilo web-02', exact: true }).check()
  await page.getByRole('combobox', { name: 'Novo stanje', exact: true }).selectOption('done')
  await page.screenshot({ path: 'docs/agent/table-desktop.png', fullPage: true })
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await page.getByRole('region', { name: 'Tabla opravil', exact: true }).waitFor()
  await page.screenshot({ path: 'docs/agent/board-desktop.png', fullPage: true })
  await page.route('**/api/tasks/web-02', (route) => route.request().method() === 'PATCH'
    ? route.fulfill({ status: 503, json: { message: 'Shranjevanje trenutno ni na voljo. Poskusi znova.' } })
    : route.continue())
  await page.getByRole('button', { name: 'Uporabi za izbrana', exact: true }).click()
  await page.getByRole('status', { name: 'Rezultat množične spremembe', exact: true }).filter({ hasText: 'Uspešno: 1. Neuspešno: 1.' }).waitFor()
  const layout = []
  for (const width of [320, 390, 760, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const view of ['Preglednica', 'Tabla']) {
      await page.getByRole('button', { name: view, exact: true }).click()
      await (view === 'Tabla' ? page.getByRole('region', { name: 'Tabla opravil', exact: true }) : page.getByRole('table')).waitFor()
      layout.push({ width, view, fits: await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth) })
      if (width === 320) await page.screenshot({ path: `docs/agent/${view === 'Tabla' ? 'board' : 'table'}-mobile-error.png`, fullPage: true })
    }
  }
  console.log(JSON.stringify({ layout, errors }, null, 2))
  if (errors.length || layout.some((entry) => !entry.fits)) process.exitCode = 1
} finally {
  await context.close()
  await browser.close()
}
