import fs from 'node:fs'
import { chromium } from 'playwright'
const { wsEndpoint } = JSON.parse(fs.readFileSync('task/browser.json', 'utf8'))
const browser = await chromium.connect(wsEndpoint)
const context = await browser.newContext()
const page = await context.newPage()
const result = []
try {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 960 })
    for (const view of ['table', 'board']) {
      await page.goto(`http://127.0.0.1:5193/#/projects/web${view === 'board' ? '?view=board' : ''}`)
      await page.locator('[data-task-id]').first().waitFor()
      if (view === 'board') await page.getByRole('button', { name: 'Tabla', exact: true }).click()
      const id = await page.locator('[data-task-id]').first().getAttribute('data-task-id')
      await page.getByRole('button', { name: `Premakni ${id} dol`, exact: true }).click()
      await page.screenshot({ path: `docs/agent/P10/folio-${width}-${view}.png`, fullPage: true })
      result.push({ width, view, ...(await page.evaluate(() => ({ pageWidth: document.documentElement.scrollWidth, viewport: innerWidth, history: document.querySelector('[aria-label="Zgodovina vrstnega reda"]').textContent }))) })
    }
  }
  fs.writeFileSync('docs/agent/P10/visual.json', JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify(result))
} finally {
  await context.close()
  await browser.close()
}
