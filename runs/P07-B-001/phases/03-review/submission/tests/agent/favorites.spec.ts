import { type Page } from '@playwright/test'
import { test, expect, mount, expectIds, board, table, project, readonly, makeTask, examples } from '../development/helpers.ts'

const key = 'folio:favorites:v1'
const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const filter = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena', exact: true })
const counter = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih', exact: true })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })
type TrackedWindow = Window & { favoriteWrites: string[] }

async function prepare(page: Page, raw: string | null = null, failure: 'read' | 'write' | 'access' | null = null) {
  await page.addInitScript(({ key, raw, failure }) => {
    if (!sessionStorage.getItem('favorites-test-seeded')) {
      if (raw !== null) localStorage.setItem(key, raw)
      sessionStorage.setItem('favorites-test-seeded', '1')
    }
    const writes: string[] = []
    ;(window as unknown as TrackedWindow).favoriteWrites = writes
    const originalSet = Storage.prototype.setItem
    const originalGet = Storage.prototype.getItem
    Storage.prototype.setItem = function (name, value) {
      if (name === key) {
        writes.push(value)
        if (failure === 'write') throw new DOMException('Quota exceeded', 'QuotaExceededError')
      }
      return originalSet.call(this, name, value)
    }
    Storage.prototype.getItem = function (name) {
      if (name === key && failure === 'read') throw new DOMException('Denied', 'SecurityError')
      return originalGet.call(this, name)
    }
    if (failure === 'access') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied', 'SecurityError') } })
  }, { key, raw, failure })
}

const stored = (page: Page) => page.evaluate((key) => localStorage.getItem(key), key)
const writes = (page: Page) => page.evaluate(() => (window as unknown as TrackedWindow).favoriteWrites)
async function storageEvent(page: Page, value: string | null, eventKey = key) {
  await page.evaluate(({ key, value }) => window.dispatchEvent(new StorageEvent('storage', { key, newValue: value })), { key: eventKey, value })
}

for (const view of ['table', 'board']) {
  test(`S01 ${view}: duplicate titles and special IDs remain independent and open correct details`, async ({ page }) => {
    const specialId = 'Ž / ?#😀'
    const records = [makeTask(specialId, { title: 'Enak naslov <&> 漢', description: 'Prvi opis 🧭' }), makeTask('second', { title: 'Enak naslov <&> 漢', description: 'Drugi opis' })]
    const networkWrites = await mount(page, records)
    if (view === 'board') await board(page)
    expect(await favorite(page, specialId).evaluate((button) => button.closest('a') === null)).toBe(true)
    await favorite(page, specialId).focus()
    await page.keyboard.press('Space')
    await expect(favorite(page, specialId)).toHaveAttribute('aria-pressed', 'true')
    await expect(favorite(page, 'second')).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    const row = page.locator('[data-task-id]').filter({ has: favorite(page, specialId) })
    await row.getByRole('link').click()
    await expect(page.getByRole('dialog').getByText('Prvi opis 🧭', { exact: true })).toBeVisible()
    await expect(page.getByRole('dialog').getByText(specialId, { exact: true }).first()).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(row.getByRole('link')).toBeFocused()
    await readonly(page, networkWrites)
  })
}

test('S02: duplicates, unknown IDs, UTF-16 canonical storage and refresh', async ({ page }) => {
  const initial = JSON.stringify({ version: 1, ids: ['\uE000', '😀', 'launch-02', 'web-03', 'web-03'], extra: 'discard on edit' })
  await prepare(page, initial)
  await mount(page)
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  await expectIds(page, examples.filter(t => t.projectId === 'web').map(t => t.id))
  expect(await stored(page)).toBe(initial)
  expect(await writes(page)).toEqual([])
  await favorite(page, 'web-02').click()
  const expected = JSON.stringify({ version: 1, ids: ['launch-02', 'web-02', 'web-03', '😀', '\uE000'] })
  expect(await stored(page)).toBe(expected)
  await filter(page).check()
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  expect(await stored(page)).toBe(expected)
  expect(await writes(page)).toEqual([])
})

const invalidRecords: [string, string | null][] = [
  ['missing', null], ['broken JSON', '{'], ['null', 'null'], ['scalar', '17'], ['array', '[]'],
  ['wrong version', '{"version":2,"ids":["web-02"]}'], ['string version', '{"version":"1","ids":["web-02"]}'],
  ['missing ids', '{"version":1}'], ['non-array ids', '{"version":1,"ids":"web-02"}'],
  ['mixed ids', '{"version":1,"ids":["web-02",null]}'],
]
for (const [name, raw] of invalidRecords) {
  test(`S03: ${name} starts empty without rewriting storage`, async ({ page }) => {
    await prepare(page, raw)
    await mount(page)
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
    expect(await writes(page)).toEqual([])
    expect(await stored(page)).toBe(raw)
    await favorite(page, 'web-02').click()
    expect(await stored(page)).toBe('{"version":1,"ids":["web-02"]}')
  })
}

test('S04/S06: more than ten tasks retain order, filter across views, counts and empty recovery', async ({ page }) => {
  const records = Array.from({ length: 13 }, (_, index) => makeTask(`id-${20 - index}`, { status: index % 2 ? 'done' : 'todo' }))
  const networkWrites = await mount(page, records)
  const selected = [records[10].id, records[1].id, records[0].id]
  for (const id of selected) await favorite(page, id).click()
  await filter(page).check()
  await expectIds(page, [records[0].id, records[1].id, records[10].id])
  await expect(counter(page)).toHaveText('Priljubljeno: 3 od 13.')
  await board(page)
  await expect(filter(page)).toBeChecked()
  await expect(page.locator('.column-count')).toHaveText(['2', '0', '1'])
  await expect.poll(() => page.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))).toEqual([records[0].id, records[10].id])
  for (const id of selected) await favorite(page, id).click()
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 13.')
  await table(page)
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await filter(page).uncheck()
  await expectIds(page, records.map(t => t.id))
  await readonly(page, networkWrites)
})

test('S05: project changes reset filter, global favorites and project removal preserve foreign IDs', async ({ page }) => {
  await prepare(page, JSON.stringify({ version: 1, ids: ['web-01', 'web-03', 'launch-01', 'unknown'] }))
  const networkWrites = await mount(page)
  await filter(page).check()
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 2.')
  await favorite(page, 'launch-02').click()
  await filter(page).check()
  await project(page, 'web')
  await expect(filter(page)).not.toBeChecked()
  await filter(page).check()
  await clear(page).click()
  await expectIds(page, [])
  await expect(clear(page)).toBeDisabled()
  expect(await stored(page)).toBe('{"version":1,"ids":["launch-01","launch-02","unknown"]}')
  await project(page, 'launch')
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 2.')
  await readonly(page, networkWrites)
})

for (const count of [0, 1]) {
  test(`S06/S08: ${count} tasks on 390px keep controls, counters and all board columns`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const records = count ? [makeTask('single')] : []
    const networkWrites = await mount(page, records)
    await expect(counter(page)).toHaveText(`Priljubljeno: 0 od ${count}.`)
    await expect(clear(page)).toBeDisabled()
    await filter(page).check()
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await readonly(page, networkWrites)
    await board(page)
    await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    await readonly(page, networkWrites)
    await filter(page).uncheck()
    if (count) {
      await favorite(page, 'single').click()
      await expect(counter(page)).toHaveText('Priljubljeno: 1 od 1.')
    }
    await readonly(page, networkWrites)
  })
}

test('S07: storage events replace and validate state without echo writes', async ({ page }) => {
  await prepare(page)
  await mount(page)
  await favorite(page, 'web-01').click()
  await filter(page).check()
  const before = await writes(page)
  await storageEvent(page, '{"version":1,"ids":["web-02","web-02","unknown"]}')
  await expectIds(page, ['web-02'])
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  await storageEvent(page, null, 'unrelated')
  await expectIds(page, ['web-02'])
  for (const raw of ['{', '{"version":1,"ids":["web-03",4]}', null]) {
    await storageEvent(page, raw)
    await expectIds(page, [])
    await storageEvent(page, '{"version":1,"ids":["web-03"]}')
    await expectIds(page, ['web-03'])
  }
  expect(await writes(page)).toEqual(before)
  await favorite(page, 'web-03').click()
  expect(await stored(page)).toBe('{"version":1,"ids":[]}')
})

for (const failure of ['read', 'write', 'access'] as const) {
  test(`S07/S08: ${failure} exception warns and keeps the app usable in memory`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await prepare(page, null, failure)
    const networkWrites = await mount(page)
    await favorite(page, 'web-02').click()
    await expect(page.getByRole('alert')).toContainText('shramba')
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await favorite(page, 'web-03').click()
    await project(page, 'launch')
    await favorite(page, 'launch-01').click()
    await project(page, 'web')
    await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
    await filter(page).check()
    await board(page)
    await expectIds(page, ['web-02', 'web-03'])
    await clear(page).click()
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
    await readonly(page, networkWrites)
  })
}
