import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { chromium, expect } from '@playwright/test'

const { wsEndpoint } = JSON.parse(await readFile('task/browser.json', 'utf8'))
const browser = await chromium.connect(wsEndpoint)
const results = []
try {
  for (const [name, width, height] of [['desktop', 1440, 960], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()
    const errors = []
    const writes = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('request', request => {
      if (new URL(request.url()).pathname.startsWith('/api/') && request.method() !== 'GET') writes.push(request.method())
    })
    await page.goto('http://127.0.0.1:5193/')
    await page.getByRole('table').waitFor()
    await page.getByLabel('Referenčni datum', { exact: true }).focus()
    await page.screenshot({ path: `docs/agent/${name}-table.png`, fullPage: true })
    for (const view of ['Preglednica', 'Tabla']) {
      await page.getByRole('button', { name: view, exact: true }).click()
      await expect(page.getByRole('button', { name: view, exact: true })).toHaveAttribute('aria-pressed', 'true')
      if (view === 'Tabla') await page.getByRole('region', { name: 'Tabla opravil' }).waitFor()
      await page.getByLabel('Pogled rokov', { exact: true }).selectOption('week')
      const ids = await page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))
      assert.deepEqual(ids, ['web-02'])
      await page.getByLabel('Referenčni datum', { exact: true }).fill('')
      await page.getByRole('alert').waitFor()
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }))
      assert.ok(dimensions.content <= dimensions.viewport)
      results.push({ name, view, ids, dimensions, emptyDraft: await page.getByLabel('Referenčni datum', { exact: true }).inputValue() })
      if (view === 'Tabla') await page.screenshot({ path: `docs/agent/${name}-board-invalid.png`, fullPage: true })
      await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-21')
    }
    assert.deepEqual(errors, [])
    assert.deepEqual(writes, [])
    results.push({ name, errors, writes })
    await context.close()
  }
  await writeFile('docs/agent/visual-check.json', JSON.stringify(results, null, 2) + '\n')
  console.log(JSON.stringify(results, null, 2))
} finally {
  await browser.close()
}
