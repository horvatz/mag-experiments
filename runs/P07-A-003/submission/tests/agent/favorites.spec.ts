import { test, expect, type Page } from '@playwright/test'
import { board, columnIds, details, examples, expectIds, makeTask, mount, project, readonly, table, webIds } from '../development/helpers.ts'

const key = 'folio:favorites:v1'
const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const filter = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena', exact: true })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })
const counter = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih', exact: true })

declare global {
  interface Window { favoriteWrites: string[] }
}

async function prepareStorage(page: Page, raw: string | null) {
  await page.goto('/favicon.svg')
  await page.evaluate(({ key, raw }) => {
    if (raw === null) localStorage.removeItem(key)
    else localStorage.setItem(key, raw)
  }, { key, raw })
  await page.addInitScript((key) => {
    window.favoriteWrites = []
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (name === key) window.favoriteWrites.push(value)
      return original.call(this, name, value)
    }
  }, key)
}

async function storage(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), key)
}

async function event(page: Page, newValue: string | null, eventKey = key) {
  await page.evaluate(({ key, newValue }) => {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }))
  }, { key: eventKey, newValue })
}

test('A01: canonical UTF-16 storage, unknown IDs and more than ten tasks retain source order', async ({ page }) => {
  const ids = ['z/2', 'a "quote"', '𐀀', '\uE000', 'ž', 'A', '', 'task-7', 'task-8', 'task-9', 'task-10', 'task-11', 'task-12']
  const records = ids.map((id, index) => makeTask(id, { title: index < 2 ? 'Isti naslov <čšž & "citat">' : `Naloga ${index}` }))
  const initialIds = ['unknown', 'launch-01', ids[2], ids[0], ids[2], ids[3], '']
  const raw = JSON.stringify({ version: 1, ids: initialIds, ignored: 'not a task' })
  await prepareStorage(page, raw)
  const writes = await mount(page, records)
  await expectIds(page, ids)
  await expect(counter(page)).toHaveText('Priljubljeno: 4 od 13.')
  expect(await storage(page)).toBe(raw)
  expect(await page.evaluate(() => window.favoriteWrites)).toEqual([])
  await favorite(page, ids[1]).click()
  await expect(favorite(page, ids[0])).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(JSON.parse((await storage(page))!)).toEqual({ version: 1, ids: [...new Set([...initialIds, ids[1]])].sort() })
  await filter(page).check()
  await expectIds(page, [ids[0], ids[1], ids[2], ids[3], ''])
  await board(page)
  await columnIds(page, 'Pripravljeno', [ids[0], ids[1], ids[2], ids[3], ''])
  await page.getByRole('link', { name: `${records[0].title} ${ids[0]}`, exact: true }).click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: records[0].title, exact: true })).toBeVisible()
  await expect(page.getByRole('dialog').getByText(ids[0], { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(favorite(page, ids[1])).toHaveAttribute('aria-pressed', 'true')
  await expect(counter(page)).toHaveText('Priljubljeno: 5 od 13.')
  expect(await page.evaluate(() => window.favoriteWrites)).toEqual([])
  await readonly(page, writes)
})

const invalidRecords: [string, string | null][] = [
  ['missing key', null], ['invalid JSON', '{'], ['null', 'null'],
  ['wrong version', '{"version":2,"ids":["web-02"]}'],
  ['string version', '{"version":"1","ids":["web-02"]}'],
  ['missing ids', '{"version":1}'], ['ids object', '{"version":1,"ids":{}}'],
  ['mixed number', '{"version":1,"ids":["web-02",7]}'],
  ['mixed null', '{"version":1,"ids":["web-02",null]}'],
  ['mixed object', '{"version":1,"ids":["web-02",{}]}'],
  ['array', '[]'], ['primitive', 'true'],
]

for (const [name, raw] of invalidRecords) {
  test(`A02: invalid initial storage (${name}) is empty without an automatic write`, async ({ page }) => {
    await prepareStorage(page, raw)
    await mount(page)
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
    await expect(clear(page)).toBeDisabled()
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
    await expectIds(page, webIds())
    expect(await storage(page)).toBe(raw)
    expect(await page.evaluate(() => window.favoriteWrites)).toEqual([])
    await favorite(page, 'web-02').click()
    expect(JSON.parse((await storage(page))!)).toEqual({ version: 1, ids: ['web-02'] })
  })
}

test('A03: project removal, filter reset and counters use the whole project', async ({ page }) => {
  await prepareStorage(page, JSON.stringify({ version: 1, ids: ['web-02', 'web-03', 'web-05', 'launch-02', 'unknown'] }))
  const writes = await mount(page)
  const original = await (await page.request.get('/__test/state')).json()
  await filter(page).check()
  await expectIds(page, ['web-02', 'web-03', 'web-05'])
  await expect(counter(page)).toHaveText('Priljubljeno: 3 od 8.')
  await board(page)
  await expect(filter(page)).toBeChecked()
  for (const name of ['Pripravljeno', 'V delu', 'Končano']) {
    await expect(page.getByRole('region', { name, exact: true }).getByLabel('1 opravil', { exact: true })).toBeVisible()
  }
  await favorite(page, 'web-02').click()
  await columnIds(page, 'Pripravljeno', [])
  await expect(page.getByRole('region', { name: 'Pripravljeno', exact: true }).getByLabel('0 opravil', { exact: true })).toBeVisible()
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  await details(page, 'web-03')
  await table(page)
  await expectIds(page, ['web-03', 'web-05'])
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 2.')
  await favorite(page, 'launch-01').click()
  await project(page, 'web')
  await expect(filter(page)).not.toBeChecked()
  await filter(page).check()
  await clear(page).click()
  await expectIds(page, [])
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
  await expect(clear(page)).toBeDisabled()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  expect(JSON.parse((await storage(page))!)).toEqual({ version: 1, ids: ['launch-01', 'launch-02', 'unknown'] })
  await filter(page).uncheck()
  await expectIds(page, webIds())
  await project(page, 'launch')
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 2.')
  await filter(page).check()
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 2.')
  expect(await (await page.request.get('/__test/state')).json()).toEqual(original)
  await readonly(page, writes)
})

test('A04: storage events replace favorites, validate all values and never echo writes', async ({ page }) => {
  await prepareStorage(page, JSON.stringify({ version: 1, ids: ['web-01'] }))
  await mount(page)
  await filter(page).check()
  await event(page, JSON.stringify({ version: 1, ids: ['web-02', 'web-02', 'unknown'] }))
  await expectIds(page, ['web-02'])
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  await event(page, null, 'unrelated')
  await expectIds(page, ['web-02'])
  for (const [, raw] of invalidRecords) {
    await event(page, raw)
    await expectIds(page, [])
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
    await event(page, JSON.stringify({ version: 1, ids: ['web-03'] }))
    await expectIds(page, ['web-03'])
  }
  await event(page, null)
  await expectIds(page, [])
  expect(await page.evaluate(() => window.favoriteWrites)).toEqual([])
  expect(JSON.parse((await storage(page))!)).toEqual({ version: 1, ids: ['web-01'] })
})

test('A05: real storage events synchronize two tabs without a write loop', async ({ page, context }) => {
  await prepareStorage(page, null)
  await mount(page)
  const second = await context.newPage()
  await mount(second)
  await filter(page).check()
  await favorite(second, 'web-02').click()
  await expectIds(page, ['web-02'])
  await favorite(page, 'web-02').click()
  await expect(favorite(second, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate(() => window.favoriteWrites)).toHaveLength(1)
  await favorite(second, 'web-03').click()
  await expectIds(page, ['web-03'])
  await second.evaluate((key) => localStorage.removeItem(key), key)
  await expectIds(page, [])
  await second.close()
})

for (const failure of ['read', 'write', 'access'] as const) {
  test(`A06: ${failure} failure warns and leaves favorites usable in memory`, async ({ page }) => {
    await page.addInitScript((failure) => {
      if (failure === 'access') {
        Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Blocked', 'SecurityError') } })
      } else {
        Storage.prototype[failure === 'read' ? 'getItem' : 'setItem'] = function () { throw new DOMException('Blocked', failure === 'read' ? 'SecurityError' : 'QuotaExceededError') }
      }
    }, failure)
    const writes = await mount(page)
    if (failure !== 'write') await expect(page.getByRole('alert')).toContainText('shramba')
    await favorite(page, 'web-02').click()
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('alert')).toContainText('shramba')
    await filter(page).check()
    await expectIds(page, ['web-02'])
    await board(page)
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await project(page, 'launch')
    await favorite(page, 'launch-01').click()
    await project(page, 'web')
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await clear(page).click()
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
    await project(page, 'launch')
    await expect(favorite(page, 'launch-01')).toHaveAttribute('aria-pressed', 'true')
    await readonly(page, writes)
  })
}

test('A07: empty projects and a single task keep controls and board columns', async ({ page }) => {
  await prepareStorage(page, JSON.stringify({ version: 1, ids: ['unknown'] }))
  await mount(page, [makeTask('one', { projectId: 'launch' })])
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 0.')
  await expect(clear(page)).toBeDisabled()
  await filter(page).check()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil', exact: true }).getByRole('region')).toHaveCount(3)
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 1.')
  await favorite(page, 'one').click()
  await filter(page).check()
  await favorite(page, 'one').click()
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await filter(page).uncheck()
  await expectIds(page, ['one'])
  expect(JSON.parse((await storage(page))!)).toEqual({ version: 1, ids: ['unknown'] })
})

test('A08: 390px layout, keyboard actions and long plain text work in both views', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const records = examples.map((task) => ({ ...task, title: 'Dolg naslov čšž <navadno> & "besedilo" '.repeat(5) }))
  const writes = await mount(page, records)
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    const button = favorite(page, 'web-02')
    await button.focus()
    await expect(button).toBeFocused()
    expect(await button.evaluate((node) => node.closest('a'))).toBeNull()
    await page.keyboard.press('Space')
    await expect(button).toHaveAttribute('aria-pressed', view === 'table' ? 'true' : 'false')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(filter(page)).toBeVisible()
    await expect(clear(page)).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  }
  await readonly(page, writes)
})
