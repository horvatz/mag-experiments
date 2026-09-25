import { test, expect, type Page } from '@playwright/test'
import { mount, makeTask, board, table, project, details, expectIds, readonly } from '../development/helpers.ts'

const key = 'folio:favorites:v1'
const filter = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const count = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih' })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })
const records = ['ž-1', 'A', '😀', 'Z', ...Array.from({ length: 9 }, (_, i) => `extra-${i}`)].map((id, i) => makeTask(id, { title: i < 2 ? 'Enak naslov čšž' : `Naloga ${i}`, status: (['todo', 'in_progress', 'done'] as const)[i % 3] }))
records.push(makeTask('foreign', { projectId: 'launch' }))

declare global {
  interface Window { p07Writes: string[] }
}

async function prepare(page: Page, raw: string | null = null, failure: 'read' | 'write' | 'access' | null = null) {
  await page.addInitScript(({ key, raw, failure }) => {
    if (!sessionStorage.getItem('p07-seeded')) {
      if (raw !== null) localStorage.setItem(key, raw)
      sessionStorage.setItem('p07-seeded', '1')
    }
    window.p07Writes = []
    const originalWrite = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (name === key) {
        window.p07Writes.push(value)
        if (failure === 'write') throw new DOMException('blocked', 'QuotaExceededError')
      }
      return originalWrite.call(this, name, value)
    }
    const originalRead = Storage.prototype.getItem
    Storage.prototype.getItem = function (name) {
      if (name === key && failure === 'read') throw new DOMException('blocked', 'SecurityError')
      return originalRead.call(this, name)
    }
    if (failure === 'access') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError') } })
  }, { key, raw, failure })
}

async function saved(page: Page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)
}

async function storageEvent(page: Page, value: string | null, eventKey = key) {
  await page.evaluate(({ eventKey, value }) => window.dispatchEvent(new StorageEvent('storage', { key: eventKey, newValue: value })), { eventKey, value })
}

test('A01: identity, stable filter, views, details and visible counts', async ({ page }) => {
  await prepare(page)
  const writes = await mount(page, records)
  const original = structuredClone(records)
  await expect(filter(page)).not.toBeChecked()
  await favorite(page, 'ž-1').click()
  await expect(favorite(page, 'A')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/#\/projects\/web$/)
  await favorite(page, 'Z').click()
  await expect(count(page)).toHaveText('Priljubljeno: 2 od 13.')
  await filter(page).check()
  await expectIds(page, ['ž-1', 'Z'])
  await board(page)
  await expect(filter(page)).toBeChecked()
  await expectIds(page, ['ž-1', 'Z'])
  await expect(page.locator('.column-count')).toHaveText(['2', '0', '0'])
  await expect(count(page)).toHaveText('Priljubljeno: 2 od 13.')
  await expect(page.locator('a button')).toHaveCount(0)
  await details(page, 'ž-1')
  await expect(filter(page)).toBeChecked()
  await favorite(page, 'ž-1').click()
  await expectIds(page, ['Z'])
  await favorite(page, 'Z').click()
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await table(page)
  await filter(page).uncheck()
  await expectIds(page, records.filter(t => t.projectId === 'web').map(t => t.id))
  await favorite(page, 'A').click()
  await filter(page).check()
  await favorite(page, 'A').click()
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await readonly(page, writes)
  expect(records).toEqual(original)
})

test('A02: canonical storage, unknown IDs and reload', async ({ page }) => {
  await prepare(page, JSON.stringify({ version: 1, ids: ['😀', 'unknown', '😀', '\uE000', '', 'foreign'] }))
  await mount(page, records)
  await expect(count(page)).toHaveText('Priljubljeno: 1 od 13.')
  expect(await page.evaluate(() => window.p07Writes)).toEqual([])
  await favorite(page, 'A').click()
  expect(await saved(page)).toEqual({ version: 1, ids: ['', 'A', 'foreign', 'unknown', '😀', '\uE000'] })
  await filter(page).check()
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(favorite(page, 'A')).toHaveAttribute('aria-pressed', 'true')
  await expect(favorite(page, '😀')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-task-id]')).toHaveCount(13)
  expect(await page.evaluate(() => window.p07Writes)).toEqual([])
})

test('A03: project reset and clear preserve foreign and unknown IDs', async ({ page }) => {
  await prepare(page, JSON.stringify({ version: 1, ids: ['ž-1', 'A', 'foreign', 'unknown'] }))
  await mount(page, records)
  await filter(page).check()
  await board(page)
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(favorite(page, 'foreign')).toHaveAttribute('aria-pressed', 'true')
  await filter(page).check()
  await project(page, 'web')
  await expect(filter(page)).not.toBeChecked()
  await filter(page).check()
  await clear(page).click()
  await expect(clear(page)).toBeDisabled()
  await expect(count(page)).toHaveText('Priljubljeno: 0 od 13.')
  await expectIds(page, [])
  expect(await saved(page)).toEqual({ version: 1, ids: ['foreign', 'unknown'] })
  await project(page, 'launch')
  await expect(count(page)).toHaveText('Priljubljeno: 1 od 1.')
  await clear(page).click()
  expect(await saved(page)).toEqual({ version: 1, ids: ['unknown'] })
})

test('A04: empty projects retain controls and zero counts', async ({ page }) => {
  await prepare(page, JSON.stringify({ version: 1, ids: ['unknown'] }))
  await mount(page, [])
  await expect(count(page)).toHaveText('Priljubljeno: 0 od 0.')
  await expect(clear(page)).toBeDisabled()
  await filter(page).check()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await board(page)
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await filter(page).uncheck()
  await project(page, 'launch')
  await expect(count(page)).toHaveText('Priljubljeno: 0 od 0.')
  expect(await page.evaluate(() => window.p07Writes)).toEqual([])
})

test('A05: Folio at desktop and 390 pixels, local changes only', async ({ page }) => {
  await prepare(page)
  const writes = await mount(page)
  const before = await (await page.request.get('/api/projects/web/tasks')).json()
  await page.setViewportSize({ width: 1440, height: 960 })
  await favorite(page, 'web-02').click()
  await page.screenshot({ path: 'docs/agent/P07/desktop-table.png', fullPage: true })
  await board(page)
  await favorite(page, 'web-03').click()
  await page.screenshot({ path: 'docs/agent/P07/desktop-board.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'docs/agent/P07/mobile-board.png', fullPage: true })
  await readonly(page, writes)
  await table(page)
  await page.screenshot({ path: 'docs/agent/P07/mobile-table.png', fullPage: true })
  await readonly(page, writes)
  await expect(page.getByLabel('Pregled stanj opravil')).toBeVisible()
  await favorite(page, 'web-02').focus()
  await page.keyboard.press('Space')
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  expect(await (await page.request.get('/api/projects/web/tasks')).json()).toEqual(before)
})

const invalid = [null, '{broken', 'null', '[]', '{}', '{"version":2,"ids":["A"]}', '{"version":"1","ids":["A"]}', '{"version":1}', '{"version":1,"ids":"A"}', '{"version":1,"ids":["A",2]}', '{"version":1,"ids":[null]}']
for (const [index, raw] of invalid.entries()) {
  test(`A06.${index}: invalid or absent storage starts empty without writes`, async ({ page }) => {
    await prepare(page, raw)
    await mount(page, records)
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 13.')
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw)
    expect(await page.evaluate(() => window.p07Writes)).toEqual([])
    await favorite(page, 'A').click()
    expect(await saved(page)).toEqual({ version: 1, ids: ['A'] })
  })
}

test('A07: storage events validate, ignore other keys and never echo writes', async ({ page }) => {
  await prepare(page)
  await mount(page, records)
  await filter(page).check()
  await storageEvent(page, JSON.stringify({ version: 1, ids: ['A', 'A', 'unknown'] }))
  await expectIds(page, ['A'])
  await board(page)
  await expect(favorite(page, 'A')).toHaveAttribute('aria-pressed', 'true')
  await storageEvent(page, null, 'another-key')
  await expectIds(page, ['A'])
  for (const raw of invalid) {
    await storageEvent(page, JSON.stringify({ version: 1, ids: ['A'] }))
    await expectIds(page, ['A'])
    await storageEvent(page, raw)
    await expectIds(page, [])
  }
  expect(await page.evaluate(() => window.p07Writes)).toEqual([])
  await filter(page).uncheck()
  await favorite(page, 'Z').click()
  expect(await saved(page)).toEqual({ version: 1, ids: ['Z'] })
})

for (const failure of ['read', 'write', 'access'] as const) {
  test(`A08.${failure}: storage exception keeps in-memory actions usable`, async ({ page }) => {
    await prepare(page, null, failure)
    const writes = await mount(page, records)
    if (failure !== 'write') await expect(page.getByRole('alert')).toContainText('shramba')
    await favorite(page, 'A').click()
    await expect(favorite(page, 'A')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('alert')).toContainText('shramba')
    await filter(page).check()
    await expectIds(page, ['A'])
    await board(page)
    await expect(favorite(page, 'A')).toHaveAttribute('aria-pressed', 'true')
    await project(page, 'launch')
    await project(page, 'web')
    await expect(favorite(page, 'A')).toHaveAttribute('aria-pressed', 'true')
    await clear(page).click()
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 13.')
    await readonly(page, writes)
  })
}
