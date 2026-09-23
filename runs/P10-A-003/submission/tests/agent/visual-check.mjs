import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const { wsEndpoint } = JSON.parse(readFileSync('task/browser.json', 'utf8'))
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
      if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method())
    })
    await page.goto('http://127.0.0.1:5193/')
    await page.getByRole('button', { name: 'Premakni web-02 gor', exact: true }).click()
    await page.screenshot({ path: `docs/agent/${name}-table.png`, fullPage: true })
    const tableFits = await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)
    assert(tableFits)
    await page.getByRole('button', { name: 'Tabla', exact: true }).click()
    await page.getByRole('region', { name: 'Tabla opravil', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Premakni web-02 dol', exact: true }).focus()
    await page.keyboard.press('Tab')
    const focus = await page.evaluate(() => ({ visible: document.activeElement.matches(':focus-visible'), outline: getComputedStyle(document.activeElement).outlineStyle }))
    assert(focus.visible && focus.outline !== 'none')
    await page.screenshot({ path: `docs/agent/${name}-board.png`, fullPage: true })
    const boardFits = await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)
    assert(boardFits)
    assert.deepEqual(errors, [])
    assert.deepEqual(writes, [])
    results.push({ name, width, height, tableFits, boardFits, focus, errors, writes })
    await context.close()
  }
  writeFileSync('docs/agent/visual-check.json', JSON.stringify(results, null, 2) + '\n')
  console.log(JSON.stringify(results, null, 2))
} finally {
  await browser.close()
}
