import { type Page } from '@playwright/test'
import { test, expect, mount, makeTask, examples, click, board, table, project, details, expectIds, readonly } from '../development/helpers.ts'

const key = 'folio:favorites:v1'
const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const filter = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
const counter = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih' })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })

async function seed(page: Page, raw: string | null) {
  await page.addInitScript(({ key, raw }) => {
    if (!sessionStorage.getItem('p07-seeded')) {
      if (raw === null) localStorage.removeItem(key)
      else localStorage.setItem(key, raw)
      sessionStorage.setItem('p07-seeded', 'yes')
    }
  }, { key, raw })
}

async function stored(page: Page) {
  return page.evaluate(key => localStorage.getItem(key), key)
}

async function watchStorage(page: Page) {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    const calls: string[] = []
    Object.defineProperty(window, 'p07StorageWrites', { value: calls })
    Storage.prototype.setItem = function (key, value) {
      calls.push(key)
      return original.call(this, key, value)
    }
  })
}

async function writes(page: Page) {
  return page.evaluate(() => (window as unknown as { p07StorageWrites: string[] }).p07StorageWrites.filter(k => k === 'folio:favorites:v1'))
}

async function storageEvent(page: Page, newValue: string | null, eventKey = key) {
  await page.evaluate(({ eventKey, newValue }) => window.dispatchEvent(new StorageEvent('storage', { key: eventKey, newValue })), { eventKey, newValue })
}

test('A01: canonical UTF-16 storage, duplicates, unknown IDs and reload', async ({ page }) => {
  const raw = JSON.stringify({ version: 1, ids: ['web-03', 'web-03', 'unknown', '😀', '\uE000', 'Ž', 'A'] })
  await seed(page, raw)
  await mount(page)
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  expect(await stored(page)).toBe(raw)
  await click(page, 'Priljubljeno opravilo web-02')
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['A', 'unknown', 'web-02', 'web-03', 'Ž', '😀', '\uE000'] })
  await filter(page).check()
  await expectIds(page, ['web-02', 'web-03'])
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-task-id]')).toHaveCount(8)
})

const invalid: (string | null)[] = [null, '{bad', 'null', '[]', '{}', '{"version":2,"ids":["web-02"]}', '{"version":"1","ids":["web-02"]}', '{"version":1}', '{"version":1,"ids":"web-02"}', '{"version":1,"ids":["web-02",7]}', '{"version":1,"ids":[null]}']
for (const [index, raw] of invalid.entries()) {
  test(`A02.${index}: invalid initial storage is empty and never overwritten`, async ({ page }) => {
    await seed(page, raw)
    await mount(page)
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
    expect(await stored(page)).toBe(raw)
    await expect(clear(page)).toBeDisabled()
  })
}

test('A03: ordered filter, independent titles, view parity, counters and empty state', async ({ page }) => {
  const apiWrites = await mount(page)
  const before = await (await page.request.get('/__test/state')).json()
  for (const id of ['web-06', 'web-02', 'web-01']) await favorite(page, id).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'false')
  expect(await favorite(page, 'web-02').evaluate(node => node.closest('a') === null)).toBe(true)
  await filter(page).check()
  await expectIds(page, ['web-01', 'web-02', 'web-06'])
  await expect(counter(page)).toHaveText('Priljubljeno: 3 od 8.')
  await board(page)
  await expect(filter(page)).toBeChecked()
  for (const name of ['Pripravljeno', 'V delu', 'Končano']) {
    await expect(page.getByRole('region', { name, exact: true }).locator('.column-count')).toHaveText('1')
  }
  expect(await favorite(page, 'web-02').evaluate(node => node.closest('a') === null)).toBe(true)
  await details(page, 'web-02')
  await expect(filter(page)).toBeChecked()
  await favorite(page, 'web-02').click()
  await expect(page.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('.column-count')).toHaveText('0')
  await favorite(page, 'web-06').click()
  await favorite(page, 'web-01').click()
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(clear(page)).toBeDisabled()
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
  await table(page)
  await expect(filter(page)).toBeChecked()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await filter(page).uncheck()
  await expectIds(page, examples.filter(t => t.projectId === 'web').map(t => t.id))
  await readonly(page, apiWrites)
  expect(await (await page.request.get('/__test/state')).json()).toEqual(before)
})

test('A04: project changes reset filter and clearing preserves other and unknown IDs', async ({ page }) => {
  await seed(page, JSON.stringify({ version: 1, ids: ['web-02', 'web-03', 'launch-01', 'unknown'] }))
  await mount(page)
  await filter(page).check()
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 2.')
  await favorite(page, 'launch-02').click()
  await filter(page).check()
  await project(page, 'web')
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  await filter(page).check()
  await clear(page).click()
  await expectIds(page, [])
  await expect(clear(page)).toBeDisabled()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['launch-01', 'launch-02', 'unknown'] })
  await project(page, 'launch')
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 2.')
  await expect(filter(page)).not.toBeChecked()
})

test('A05: storage events validate and synchronize without echo writes', async ({ page }) => {
  await watchStorage(page)
  await mount(page)
  expect(await writes(page)).toEqual([])
  await filter(page).check()
  await storageEvent(page, JSON.stringify({ version: 1, ids: ['web-02', 'web-02', 'unknown'] }))
  await expectIds(page, ['web-02'])
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  await board(page)
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await storageEvent(page, null, 'different-key')
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  for (const raw of invalid) {
    await storageEvent(page, JSON.stringify({ version: 1, ids: ['web-02'] }))
    await expectIds(page, ['web-02'])
    await storageEvent(page, raw)
    await expectIds(page, [])
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
  }
  expect(await writes(page)).toEqual([])
  expect(await stored(page)).toBe(null)
  await filter(page).uncheck()
  await favorite(page, 'web-03').click()
  expect(await writes(page)).toEqual([key])
})

for (const method of ['getItem', 'setItem'] as const) {
  test(`A06: ${method} exception keeps favorites usable in memory`, async ({ page }) => {
    await page.addInitScript(({ method, key }) => {
      const original = Storage.prototype[method]
      Object.defineProperty(Storage.prototype, method, { value: function (name: string, value?: string) {
        if (name === key) throw new DOMException('Unavailable', 'SecurityError')
        return Reflect.apply(original, this, [name, value])
      } })
    }, { method, key })
    const apiWrites = await mount(page)
    if (method === 'getItem') await expect(page.getByRole('alert')).toContainText('shramba')
    await favorite(page, 'web-02').click()
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('alert')).toContainText('shramba')
    await filter(page).check()
    await expectIds(page, ['web-02'])
    await board(page)
    await favorite(page, 'web-02').click()
    await expectIds(page, [])
    await project(page, 'launch')
    await favorite(page, 'launch-01').click()
    await expect(counter(page)).toHaveText('Priljubljeno: 1 od 2.')
    await readonly(page, apiWrites)
  })
}

for (const size of [0, 1, 13]) {
  test(`A07: ${size} arbitrary tasks, details and narrow Folio`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const records = Array.from({ length: size }, (_, i) => makeTask(`č /${i}?&`, { title: 'Enak naslov — Ž', status: 'todo' }))
    const apiWrites = await mount(page, records)
    await expect(counter(page)).toHaveText(`Priljubljeno: 0 od ${size}.`)
    await expect(clear(page)).toBeDisabled()
    if (size) {
      const id = records[size - 1].id
      await favorite(page, id).focus()
      await expect(favorite(page, id)).toBeFocused()
      await page.keyboard.press('Space')
      await filter(page).check()
      await expectIds(page, [id])
      await details(page, id)
    } else {
      await filter(page).check()
      await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    }
    await readonly(page, apiWrites)
    await page.screenshot({ path: `docs/agent/P07/mobile-table-${size}.png`, fullPage: true })
    await board(page)
    await expect(page.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('.column-count')).toHaveText(size ? '1' : '0')
    await readonly(page, apiWrites)
    await page.screenshot({ path: `docs/agent/P07/mobile-board-${size}.png`, fullPage: true })
    if (size) {
      await expect(page.getByRole('link', { name: `Enak naslov — Ž ${records[size - 1].id}`, exact: true })).toBeVisible()
      await details(page, records[size - 1].id)
      await favorite(page, records[size - 1].id).click()
      await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    }
    await filter(page).uncheck()
    await expect(page.locator('[data-task-id]')).toHaveCount(size)
    await project(page, 'launch')
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 0.')
    await expect(clear(page)).toBeDisabled()
    await readonly(page, apiWrites)
  })
}
