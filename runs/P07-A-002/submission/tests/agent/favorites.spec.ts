import { expect, test, type Page } from '@playwright/test'
import { board, columnIds, details, expectIds, makeTask, mount, project, readonly, summary, table, webIds } from '../development/helpers.ts'

const KEY = 'folio:favorites:v1'
const filter = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena', exact: true })
const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })
const count = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih', exact: true })
const stored = (page: Page) => page.evaluate(key => localStorage.getItem(key), KEY)
const writes = (page: Page) => page.evaluate(() => window.agentFavoriteWrites)

declare global {
  interface Window { agentFavoriteWrites: string[] }
}

async function initialize(page: Page, value: string | null = null) {
  await page.addInitScript(({ key, value }) => {
    if (!sessionStorage.getItem('agent-seeded')) {
      if (value !== null) localStorage.setItem(key, value)
      else localStorage.removeItem(key)
      sessionStorage.setItem('agent-seeded', 'true')
    }
    window.agentFavoriteWrites = []
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, text) {
      if (name === key) window.agentFavoriteWrites.push(text)
      return setItem.call(this, name, text)
    }
  }, { key: KEY, value })
}

async function storageEvent(page: Page, newValue: string | null, key = KEY) {
  await page.evaluate(({ key, newValue }) => {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }))
  }, { key, newValue })
}

const invalidValues: [string, string | null][] = [
  ['missing key', null], ['broken JSON', '{'], ['null', 'null'], ['array', '[]'],
  ['wrong version', '{"version":2,"ids":["web-02"]}'],
  ['string version', '{"version":"1","ids":["web-02"]}'],
  ['missing ids', '{"version":1}'], ['non-array ids', '{"version":1,"ids":"web-02"}'],
  ['mixed ids', '{"version":1,"ids":["web-02",3]}'],
  ['null id', '{"version":1,"ids":["web-02",null]}'],
  ['object id', '{"version":1,"ids":["web-02",{}]}'],
]

for (const [name, value] of invalidValues) {
  test(`A01 invalid initial storage: ${name}`, async ({ page }) => {
    await initialize(page, value)
    await mount(page)
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
    await expect(filter(page)).not.toBeChecked()
    await expect(clear(page)).toBeDisabled()
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
    expect(await stored(page)).toBe(value)
    expect(await writes(page)).toEqual([])
    await expect(page.getByRole('alert')).toHaveCount(0)
    await favorite(page, 'web-02').click()
    expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['web-02'] })
  })
}

test('A02 duplicate and unknown IDs survive restoration; writes are canonical UTF-16 and contain no task fields', async ({ page }) => {
  const value = JSON.stringify({ version: 1, ids: ['\uE000', 'web-03', '😀', 'web-03', 'launch-02', ''] })
  await initialize(page, value)
  const apiWrites = await mount(page)
  await expect(count(page)).toHaveText('Priljubljeno: 1 od 8.')
  await expectIds(page, webIds())
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  expect(await stored(page)).toBe(value)
  expect(await writes(page)).toEqual([])
  await favorite(page, 'web-02').click()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['', 'launch-02', 'web-02', 'web-03', '😀', '\uE000'] })
  await filter(page).check()
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(count(page)).toHaveText('Priljubljeno: 2 od 8.')
  expect(await writes(page)).toEqual([])
  await readonly(page, apiWrites)
})

test('A03 project clear preserves other projects and unknown IDs; navigation resets only the filter', async ({ page }) => {
  await initialize(page, JSON.stringify({ version: 1, ids: ['web-02', 'web-03', 'launch-01', 'unknown'] }))
  await mount(page)
  await filter(page).check()
  await expectIds(page, ['web-02', 'web-03'])
  await expect(count(page)).toHaveText('Priljubljeno: 2 od 8.')
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(count(page)).toHaveText('Priljubljeno: 1 od 2.')
  await favorite(page, 'launch-02').click()
  await filter(page).check()
  await project(page, 'web')
  await expect(filter(page)).not.toBeChecked()
  await expectIds(page, webIds())
  await filter(page).check()
  await clear(page).click()
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
  await expect(clear(page)).toBeDisabled()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['launch-01', 'launch-02', 'unknown'] })
  await filter(page).uncheck()
  await expectIds(page, webIds())
  await project(page, 'launch')
  await expect(count(page)).toHaveText('Priljubljeno: 2 od 2.')
  await page.reload()
  await expect(count(page)).toHaveText('Priljubljeno: 2 od 2.')
  await expect(filter(page)).not.toBeChecked()
})

test('A04 views retain filtering and ID details; board counts only visible tasks and toggles use the keyboard', async ({ page }) => {
  await initialize(page)
  const apiWrites = await mount(page)
  const before = await (await page.request.get('/__test/state')).json()
  await favorite(page, 'web-02').focus()
  await page.keyboard.press('Space')
  await favorite(page, 'web-03').click()
  await favorite(page, 'web-05').click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(favorite(page, 'web-04')).toHaveAttribute('aria-pressed', 'false')
  await filter(page).check()
  await expectIds(page, ['web-02', 'web-03', 'web-05'])
  await expect(count(page)).toHaveText('Priljubljeno: 3 od 8.')
  await summary(page, [4, 2, 2])
  await board(page)
  await expect(filter(page)).toBeChecked()
  await columnIds(page, 'Pripravljeno', ['web-02'])
  await columnIds(page, 'V delu', ['web-05'])
  await columnIds(page, 'Končano', ['web-03'])
  for (const label of ['Pripravljeno', 'V delu', 'Končano']) {
    await expect(page.getByRole('region', { name: label, exact: true }).getByLabel('1 opravil')).toHaveText('1')
  }
  await expect(page.locator('a button')).toHaveCount(0)
  await details(page, 'web-02')
  await details(page, 'web-03')
  await favorite(page, 'web-03').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await columnIds(page, 'Končano', [])
  await expect(page.getByRole('region', { name: 'Končano', exact: true }).getByLabel('0 opravil')).toHaveText('0')
  await expect(count(page)).toHaveText('Priljubljeno: 2 od 8.')
  await table(page)
  await expect(filter(page)).toBeChecked()
  await expectIds(page, ['web-02', 'web-05'])
  await clear(page).click()
  await board(page)
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region')).toHaveCount(3)
  await filter(page).uncheck()
  await expectIds(page, webIds(), false)
  await readonly(page, apiWrites)
  expect(await (await page.request.get('/__test/state')).json()).toEqual(before)
})

test('A05 storage events validate all inputs, ignore unrelated keys and never echo a write', async ({ page }) => {
  const value = JSON.stringify({ version: 1, ids: ['web-01'] })
  await initialize(page, value)
  await mount(page)
  await filter(page).check()
  await storageEvent(page, JSON.stringify({ version: 1, ids: ['web-03', 'web-02', 'web-02', 'unknown'] }))
  await expectIds(page, ['web-02', 'web-03'])
  await expect(count(page)).toHaveText('Priljubljeno: 2 od 8.')
  await storageEvent(page, null, 'different-key')
  await expectIds(page, ['web-02', 'web-03'])
  for (const [, invalid] of invalidValues) {
    await storageEvent(page, JSON.stringify({ version: 1, ids: ['web-02'] }))
    await expectIds(page, ['web-02'])
    await storageEvent(page, invalid)
    await expectIds(page, [])
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
  }
  expect(await stored(page)).toBe(value)
  expect(await writes(page)).toEqual([])
  await storageEvent(page, JSON.stringify({ version: 1, ids: ['launch-02', 'future'] }))
  await filter(page).uncheck()
  await favorite(page, 'web-04').click()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['future', 'launch-02', 'web-04'] })
})

test('A06 real tabs synchronize additions, removals and key deletion without feedback writes', async ({ page, context }) => {
  await initialize(page)
  await mount(page)
  const other = await context.newPage()
  try {
    await mount(other)
    await expect(count(other)).toHaveText('Priljubljeno: 0 od 8.')
    await filter(page).check()
    await favorite(other, 'web-02').click()
    await expectIds(page, ['web-02'])
    expect(await writes(page)).toEqual([])
    await favorite(page, 'web-02').click()
    await expect(favorite(other, 'web-02')).toHaveAttribute('aria-pressed', 'false')
    expect(await writes(page)).toHaveLength(1)
    await favorite(other, 'web-03').click()
    await expectIds(page, ['web-03'])
    await other.evaluate(key => localStorage.removeItem(key), KEY)
    await expectIds(page, [])
    await expect(clear(page)).toBeDisabled()
    expect(await writes(page)).toHaveLength(1)
  } finally {
    await other.close()
  }
})

for (const mode of ['getItem', 'setItem', 'accessor'] as const) {
  test(`A07 unavailable storage (${mode}) keeps the UI usable in memory`, async ({ page }) => {
    await page.addInitScript(({ mode, key }) => {
      if (mode === 'accessor') {
        Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Denied', 'SecurityError') } })
      } else {
        const getItem = Storage.prototype.getItem
        const setItem = Storage.prototype.setItem
        Object.defineProperty(Storage.prototype, mode, { configurable: true, value: function (name: string, value: string) {
          if (name === key) throw new DOMException('Unavailable', mode === 'setItem' ? 'QuotaExceededError' : 'SecurityError')
          return mode === 'getItem' ? getItem.call(this, name) : setItem.call(this, name, value)
        } })
      }
    }, { mode, key: KEY })
    const apiWrites = await mount(page)
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
    if (mode !== 'setItem') await expect(page.getByRole('alert')).toContainText('shramba')
    else await expect(page.getByRole('alert')).toHaveCount(0)
    await favorite(page, 'web-02').click()
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('alert')).toContainText('shramba')
    await board(page)
    await filter(page).check()
    await expectIds(page, ['web-02'])
    await project(page, 'launch')
    await expect(filter(page)).not.toBeChecked()
    await favorite(page, 'launch-01').click()
    await project(page, 'web')
    await expect(count(page)).toHaveText('Priljubljeno: 1 od 8.')
    await clear(page).click()
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
    await project(page, 'launch')
    await expect(count(page)).toHaveText('Priljubljeno: 1 od 2.')
    await readonly(page, apiWrites)
  })
}

for (const size of [0, 1, 13]) {
  test(`A08 arbitrary ordered data (${size} tasks) works at 390px without page overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const records = Array.from({ length: size }, (_, index) => makeTask(`ID ${size - index}/č?#[]`, {
      title: 'Enak naslov, "čšž" 😀 <besedilo>',
      description: 'Prva vrstica\nDruga vrstica; čšž <b>navadno besedilo</b>',
      dueDate: '2028-02-29',
      status: index % 2 === 0 ? 'todo' : 'done',
    }))
    const selected = records.filter((_, index) => index % 2 === 0).map(task => task.id)
    await initialize(page, JSON.stringify({ version: 1, ids: [...selected].reverse().concat('unknown') }))
    const apiWrites = await mount(page, records)
    await expect(count(page)).toHaveText(`Priljubljeno: ${selected.length} od ${size}.`)
    await expectIds(page, records.map(task => task.id))
    await filter(page).check()
    await expectIds(page, selected)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await board(page)
    await columnIds(page, 'Pripravljeno', selected)
    await expect(count(page)).toHaveText(`Priljubljeno: ${selected.length} od ${size}.`)
    if (selected.length) {
      const id = selected[0]
      await page.getByRole('link', { name: `${records[0].title} ${id}`, exact: true }).click()
      await expect(page.getByRole('dialog').getByRole('heading', { name: records[0].title, exact: true })).toBeVisible()
      await expect(page.getByRole('dialog').locator('time')).toHaveAttribute('datetime', '2028-02-29')
      await expect(page.getByRole('dialog').getByText(records[0].description, { exact: true })).toBeVisible()
      await page.keyboard.press('Escape')
      await favorite(page, id).click()
      await columnIds(page, 'Pripravljeno', selected.slice(1))
      await expect(page.getByRole('dialog')).toHaveCount(0)
    } else {
      await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
      await expect(clear(page)).toBeDisabled()
    }
    await readonly(page, apiWrites)
    await project(page, 'launch')
    await expect(filter(page)).not.toBeChecked()
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 0.')
    await expect(clear(page)).toBeDisabled()
    await filter(page).check()
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await table(page)
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await filter(page).uncheck()
    await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
