import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const { wsEndpoint } = JSON.parse(await readFile(new URL('../../task/browser.json', import.meta.url), 'utf8'))
const browser = await chromium.connect(wsEndpoint)
const errors = []
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 960 } })
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('http://127.0.0.1:5193/')
    await page.getByRole('button', { name: 'Izvozi CSV', exact: true }).waitFor()
    for (const view of ['table', 'board']) {
      if (view === 'board') {
        await page.getByRole('button', { name: 'Tabla', exact: true }).click()
        await page.getByRole('region', { name: 'Tabla opravil', exact: true }).waitFor()
      } else {
        await page.getByRole('table').waitFor()
      }
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth, content: document.documentElement.scrollWidth,
      }))
      assert.ok(dimensions.content <= dimensions.viewport, JSON.stringify(dimensions))
      await page.screenshot({ path: `docs/agent/preview-${width}-${view}.png`, fullPage: true })
      console.log(`${width}px ${view}: ${JSON.stringify(dimensions)}, screenshot saved`)
    }
    await context.close()
  }
  assert.deepEqual(errors, [])
  console.log('No page errors; all viewport checks passed.')
} finally {
  await browser.close()
}
