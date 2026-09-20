import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

// Start the manual server with WEB_PORT=5193 API_PORT=3123 npm run dev.

const { wsEndpoint } = JSON.parse(readFileSync('task/browser.json', 'utf8'))
const browser = await chromium.connect(wsEndpoint)
const results = []
try {
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('http://127.0.0.1:5193/#/projects/web/tasks/web-02?view=board')
    await page.getByRole('button', { name: 'Uredi', exact: true }).click()
    const title = page.getByRole('textbox', { name: 'Naslov' })
    await title.fill('Pregled vsebine in uskladitev dolgega naslova opravila')
    await page.screenshot({ path: `docs/agent/editing-${viewport.width}.png`, fullPage: true })
    const dimensions = await page.getByRole('dialog').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }))
    const focusedTitle = await title.evaluate((element) => document.activeElement === element)
    await title.fill(' \t\n ')
    await page.getByRole('button', { name: 'Shrani', exact: true }).click()
    await page.getByRole('alert').waitFor()
    await page.screenshot({ path: `docs/agent/validation-${viewport.width}.png`, fullPage: true })
    await page.getByRole('button', { name: 'Prekliči', exact: true }).click()
    const focusReturned = await page.getByRole('button', { name: 'Uredi', exact: true }).evaluate((element) => document.activeElement === element)
    results.push({ viewport, dimensions, focusedTitle, focusReturned, pageErrors: errors })
    await context.close()
  }
} finally {
  await browser.close()
}
writeFileSync('docs/agent/visual-check.json', `${JSON.stringify(results, null, 2)}\n`)
