import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const { wsEndpoint } = JSON.parse(readFileSync(new URL('../../task/browser.json', import.meta.url), 'utf8'))
const browser = await chromium.connect(wsEndpoint)
const context = await browser.newContext({ viewport: { width: 1440, height: 960 } })
const page = await context.newPage()
const errors = []
const writes = []
const views = []
page.on('pageerror', error => errors.push(error.message))
page.on('request', request => {
  if (new URL(request.url()).pathname.startsWith('/api/') && request.method() !== 'GET') writes.push(`${request.method()} ${request.url()}`)
})

async function capture(name) {
  await page.screenshot({ path: `docs/agent/${name}.png`, fullPage: true })
  views.push(await page.evaluate(name => ({
    name,
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    input: document.querySelector('#reference-date').value,
    filter: document.querySelector('#deadline-filter').value,
    ids: [...document.querySelectorAll('[data-task-id]')].map(node => node.getAttribute('data-task-id')),
  }), name))
}

try {
  await page.goto('http://127.0.0.1:5193/')
  await page.getByRole('table').waitFor()
  await capture('desktop-table')
  await page.setViewportSize({ width: 390, height: 844 })
  await capture('mobile-table')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await page.getByRole('region', { name: 'Tabla opravil' }).waitFor()
  await capture('mobile-board')
  await page.getByRole('combobox', { name: 'Pogled rokov' }).selectOption('week')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await page.getByRole('alert').waitFor()
  await capture('mobile-invalid-date')
  writeFileSync('docs/agent/manual-review.json', JSON.stringify({ errors, writes, views }, null, 2) + '\n')
  console.log(JSON.stringify({ errors, writes, views }, null, 2))
} finally {
  await context.close()
  await browser.close()
}
