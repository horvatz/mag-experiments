import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

// Run against the separate manual server, started with WEB_PORT=5193 API_PORT=3123.
const { wsEndpoint } = JSON.parse(await readFile(new URL('../../task/browser.json', import.meta.url), 'utf8'))
const browser = await chromium.connect(wsEndpoint)
const results = []
try {
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }, { width: 320, height: 720 }]) {
    const context = await browser.newContext({ viewport })
    try {
      const page = await context.newPage()
      const pageErrors = []
      page.on('pageerror', (error) => pageErrors.push(error.message))
      await page.goto('http://127.0.0.1:5193/#/projects/web/tasks/web-02')
      await page.getByRole('button', { name: 'Uredi', exact: true }).click()
      const title = page.getByRole('textbox', { name: 'Naslov', exact: true })
      assert(await title.evaluate((element) => element === document.activeElement))
      await title.fill('Preverjanje daljšega naslova opravila na ozkem zaslonu in z uporabo tipkovnice')
      await page.keyboard.press('Tab')
      assert(await page.getByRole('combobox', { name: 'Stanje', exact: true }).evaluate((element) => element === document.activeElement))
      await page.keyboard.press('Tab')
      assert(await page.getByRole('button', { name: 'Shrani', exact: true }).evaluate((element) => element === document.activeElement))
      await page.keyboard.press('Tab')
      assert(await page.getByRole('button', { name: 'Prekliči', exact: true }).evaluate((element) => element === document.activeElement))
      await page.screenshot({ path: `docs/agent/form-${viewport.width}.png` })
      await title.fill(' \t\n')
      await page.getByRole('button', { name: 'Shrani', exact: true }).click()
      await page.getByRole('alert').waitFor()
      assert.equal(await title.getAttribute('aria-invalid'), 'true')
      await page.screenshot({ path: `docs/agent/validation-${viewport.width}.png` })
      const bounds = await page.getByRole('dialog').boundingBox()
      assert(bounds.x >= 0 && bounds.x + bounds.width <= viewport.width)
      assert(await page.getByRole('dialog').evaluate((element) => element.scrollWidth <= element.clientWidth))
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
      await page.getByRole('button', { name: 'Prekliči', exact: true }).click()
      assert(await page.getByRole('button', { name: 'Uredi', exact: true }).evaluate((element) => element === document.activeElement))
      assert.deepEqual(pageErrors, [])
      results.push({ viewport, keyboard: 'passed', validation: 'passed', horizontalOverflow: false, pageErrors })
    } finally {
      await context.close()
    }
  }
  console.log(JSON.stringify(results, null, 2))
} finally {
  await browser.close()
}
