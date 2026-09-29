import { test, expect, type Page } from '@playwright/test'
import { board, table, project, mount, makeTask, examples, expectIds, readonly } from '../development/helpers.ts'

const key = 'folio:favorites:v1'
const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const filter = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena', exact: true })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })
const count = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih', exact: true })
const encode = (ids: string[]) => JSON.stringify({ version: 1, ids })
type TrackedWindow = Window & { favoriteWrites: string[] }

async function storageSetup(page: Page, raw: string | null, failure?: 'read' | 'write' | 'access') {
  await page.addInitScript(({ key, raw, failure }) => {
    if (!sessionStorage.getItem('agent-seeded')) {
      if (raw === null) localStorage.removeItem(key)
      else localStorage.setItem(key, raw)
      sessionStorage.setItem('agent-seeded', 'true')
    }
    const tracked = window as unknown as TrackedWindow
    tracked.favoriteWrites = []
    const originalSet = Storage.prototype.setItem
    const originalGet = Storage.prototype.getItem
    Storage.prototype.setItem = function (name, value) {
      if (name === key) {
        tracked.favoriteWrites.push(value)
        if (failure === 'write') throw new DOMException('Quota exceeded', 'QuotaExceededError')
      }
      return originalSet.call(this, name, value)
    }
    Storage.prototype.getItem = function (name) {
      if (name === key && failure === 'read') throw new DOMException('Access denied', 'SecurityError')
      return originalGet.call(this, name)
    }
    if (failure === 'access') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Access denied', 'SecurityError') } })
  }, { key, raw, failure })
}

const writes = (page: Page) => page.evaluate(() => (window as unknown as TrackedWindow).favoriteWrites)
const stored = (page: Page) => page.evaluate(key => localStorage.getItem(key), key)
async function storageEvent(page: Page, raw: string | null, eventKey: string = key) {
  await page.evaluate(({ eventKey, raw }) => window.dispatchEvent(new StorageEvent('storage', { key: eventKey, newValue: raw })), { eventKey, raw })
}

const unusualId = 'Ω / # ? " č'
const records = [
  makeTask('z-last', { title: 'Enak naslov' }),
  makeTask('a-first', { title: 'Enak naslov' }),
  ...Array.from({ length: 10 }, (_, index) => makeTask(`task-${index}`, { status: index % 2 ? 'in_progress' : 'done' })),
  makeTask(unusualId, { title: '<b>Čas & "citat"</b>', description: 'Navadno besedilo <script> in čšž.\nDruga vrstica.', status: 'done', dueDate: '2028-02-29' }),
  makeTask('other-1', { projectId: 'launch' }),
  makeTask('other-2', { projectId: 'launch', status: 'done' }),
]

test('A01 valid duplicates and unknown IDs survive; writes are canonical UTF-16 IDs only', async ({ page }) => {
  const initial = JSON.stringify({ version: 1, ids: ['\uE000', 'web-02', '😀', 'web-02', 'ž', 'a', '', 'A'], extra: 'allowed' })
  await storageSetup(page, initial)
  await mount(page)
  await expect(count(page)).toHaveText('Priljubljeno: 1 od 8.')
  await expectIds(page, examples.filter(task => task.projectId === 'web').map(task => task.id))
  expect(await stored(page)).toBe(initial)
  expect(await writes(page)).toEqual([])
  await favorite(page, 'web-03').click()
  await favorite(page, 'web-02').click()
  const expected = { version: 1, ids: ['', 'A', 'a', 'web-03', 'ž', '😀', '\uE000'] }
  expect(JSON.parse((await stored(page))!)).toEqual(expected)
  expect(await writes(page)).toHaveLength(2)
  await filter(page).check()
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  expect(JSON.parse((await stored(page))!)).toEqual(expected)
  expect(await writes(page)).toEqual([])
})

const invalidRecords = [
  ['missing key', null], ['invalid JSON', '{oops'], ['wrong version', '{"version":2,"ids":["web-02"]}'],
  ['string version', '{"version":"1","ids":["web-02"]}'], ['missing ids', '{"version":1}'],
  ['non-array ids', '{"version":1,"ids":"web-02"}'], ['mixed ids', '{"version":1,"ids":["web-02",2]}'],
  ['null id', '{"version":1,"ids":[null]}'], ['object id', '{"version":1,"ids":[{}]}'],
  ['null root', 'null'], ['array root', '[]'], ['primitive root', 'true'],
] as const

for (const [label, raw] of invalidRecords) {
  test(`A02 invalid initial storage: ${label}`, async ({ page }) => {
    await storageSetup(page, raw)
    await mount(page)
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
    await expect(clear(page)).toBeDisabled()
    await expect(page.getByRole('alert')).toHaveCount(0)
    expect(await stored(page)).toBe(raw)
    expect(await writes(page)).toEqual([])
    await favorite(page, 'web-02').click()
    expect(await stored(page)).toBe(encode(['web-02']))
  })
}

test('A03 shared filter, stable order, independent IDs, counters and encoded details with 13 tasks', async ({ page }) => {
  await storageSetup(page, encode(['unknown', 'other-1']))
  const apiWrites = await mount(page, records)
  await favorite(page, 'z-last').focus()
  await page.keyboard.press('Space')
  await expect(favorite(page, 'z-last')).toBeFocused()
  await expect(favorite(page, 'a-first')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await favorite(page, 'a-first').click()
  await favorite(page, unusualId).click()
  await filter(page).check()
  await expectIds(page, ['z-last', 'a-first', unusualId])
  await expect(count(page)).toHaveText('Priljubljeno: 3 od 13.')
  await board(page)
  await expect(filter(page)).toBeChecked()
  for (const [label, value] of [['Pripravljeno', '2'], ['V delu', '0'], ['Končano', '1']]) {
    await expect(page.getByRole('region', { name: label, exact: true }).locator('.column-count')).toHaveText(value)
  }
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['2', '5', '6'])
  await favorite(page, unusualId).evaluate(button => {
    if (button.closest('a')) throw new Error('Favorite action is nested in a link')
  })
  await page.getByRole('link', { name: `<b>Čas & "citat"</b> ${unusualId}`, exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: '<b>Čas & "citat"</b>', exact: true })).toBeVisible()
  await expect(dialog.locator('time')).toHaveAttribute('datetime', '2028-02-29')
  await expect(dialog.locator('.description p')).toHaveText(records[12].description)
  await page.keyboard.press('Escape')
  await expect(filter(page)).toBeChecked()
  await favorite(page, 'z-last').click()
  await expect(favorite(page, 'z-last')).toHaveCount(0)
  await expect(favorite(page, 'a-first')).toHaveAttribute('aria-pressed', 'true')
  await table(page)
  await expectIds(page, ['a-first', unusualId])
  await expect(count(page)).toHaveText('Priljubljeno: 2 od 13.')
  await readonly(page, apiWrites)
})

test('A04 clearing uses entire project and preserves unknown and other-project IDs; project resets filter', async ({ page }) => {
  await storageSetup(page, encode(['unknown', 'z-last', 'a-first', 'other-1', 'other-2']))
  const apiWrites = await mount(page, records)
  await filter(page).check()
  await clear(page).click()
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(clear(page)).toBeDisabled()
  await expect(count(page)).toHaveText('Priljubljeno: 0 od 13.')
  expect(await stored(page)).toBe(encode(['other-1', 'other-2', 'unknown']))
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(count(page)).toHaveText('Priljubljeno: 2 od 2.')
  await filter(page).check()
  await favorite(page, 'other-1').click()
  await expectIds(page, ['other-2'])
  await project(page, 'web')
  await expect(filter(page)).not.toBeChecked()
  await expectIds(page, records.filter(task => task.projectId === 'web').map(task => task.id))
  await project(page, 'launch')
  await clear(page).click()
  expect(await stored(page)).toBe(encode(['unknown']))
  await readonly(page, apiWrites)
})

for (const size of [0, 1]) {
  test(`A05 empty filtered states keep controls and board columns with ${size} tasks at 390px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await storageSetup(page, encode(['unknown']))
    const data = size ? [makeTask('single')] : []
    const apiWrites = await mount(page, data)
    await expect(count(page)).toHaveText(`Priljubljeno: 0 od ${size}.`)
    await expect(clear(page)).toBeDisabled()
    if (size) await favorite(page, 'single').click()
    await filter(page).check()
    if (size) await favorite(page, 'single').click()
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await board(page)
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
    await filter(page).uncheck()
    if (size) {
      await favorite(page, 'single').click()
      await filter(page).check()
      await favorite(page, 'single').click()
      await expectIds(page, [])
      await expect(count(page)).toHaveText('Priljubljeno: 0 od 1.')
      await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
      await filter(page).uncheck()
    }
    await page.screenshot({ path: `docs/agent/mobile-${size}-board.png`, fullPage: true })
    await readonly(page, apiWrites)
    await table(page)
    await page.screenshot({ path: `docs/agent/mobile-${size}-table.png`, fullPage: true })
    await readonly(page, apiWrites)
  })
}

test('A06 storage events replace state without writing, ignore other keys and validate every new value', async ({ page }) => {
  const initial = encode(['web-02', 'unknown'])
  await storageSetup(page, initial)
  await mount(page)
  await filter(page).check()
  await storageEvent(page, encode(['web-03']), 'different-key')
  await expectIds(page, ['web-02'])
  await storageEvent(page, encode(['web-03', 'web-03', 'unknown-2']))
  await expectIds(page, ['web-03'])
  await expect(count(page)).toHaveText('Priljubljeno: 1 od 8.')
  for (const [, raw] of invalidRecords) {
    await storageEvent(page, encode(['web-02']))
    await expectIds(page, ['web-02'])
    await storageEvent(page, raw)
    await expectIds(page, [])
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
  }
  expect(await writes(page)).toEqual([])
  expect(await stored(page)).toBe(initial)
  await storageEvent(page, encode(['web-03', 'unknown-2']))
  await favorite(page, 'web-03').click()
  expect(await stored(page)).toBe(encode(['unknown-2']))
})

test('A07 actual same-origin tabs synchronize toggle and removeItem without feedback writes', async ({ page, context }) => {
  await storageSetup(page, null)
  await mount(page)
  const second = await context.newPage()
  await mount(second)
  await favorite(page, 'web-02').click()
  await expect(favorite(second, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await favorite(second, 'web-03').click()
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  expect(await writes(page)).toHaveLength(1)
  await second.evaluate(key => localStorage.removeItem(key), key)
  await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
  expect(await writes(page)).toHaveLength(1)
  await second.close()
})

for (const failure of ['read', 'write', 'access'] as const) {
  test(`A08 ${failure} exception keeps favorites usable in memory and alerts the user`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await storageSetup(page, encode(['web-03']), failure)
    const apiWrites = await mount(page)
    await expect(count(page)).toHaveText(`Priljubljeno: ${failure === 'write' ? 1 : 0} od 8.`)
    if (failure !== 'write') await expect(page.getByRole('alert')).toContainText('shramba')
    await favorite(page, 'web-02').click()
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('alert')).toContainText('shramba')
    await filter(page).check()
    await board(page)
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await project(page, 'launch')
    await project(page, 'web')
    await expect(filter(page)).not.toBeChecked()
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await clear(page).click()
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
    expect(errors).toEqual([])
    await readonly(page, apiWrites)
  })
}

test('A09 real API task fields stay unchanged after all favorite operations', async ({ page }) => {
  await page.request.post('/__test/reset')
  const before = await (await page.request.get('/__test/state')).json()
  const apiWrites: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).pathname.startsWith('/api/') && request.method() !== 'GET') apiWrites.push(request.method())
  })
  await page.goto('/')
  await favorite(page, 'web-02').click()
  await filter(page).check()
  await board(page)
  await favorite(page, 'web-02').click()
  await filter(page).uncheck()
  await favorite(page, 'web-03').click()
  await clear(page).click()
  await project(page, 'launch')
  await favorite(page, 'launch-01').click()
  await page.reload()
  await expect(favorite(page, 'launch-01')).toHaveAttribute('aria-pressed', 'true')
  expect(await (await page.request.get('/__test/state')).json()).toEqual(before)
  expect(apiWrites).toEqual([])
})
