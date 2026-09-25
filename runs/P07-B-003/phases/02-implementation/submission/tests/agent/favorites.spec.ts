import { test, expect, type Page } from '@playwright/test'
import { board, table, mount, makeTask, examples, expectIds, project, readonly, columnIds } from '../development/helpers.ts'

const key = 'folio:favorites:v1'
const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const filter = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })
const count = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih' })
const stored = (page: Page) => page.evaluate((key) => localStorage.getItem(key), key)
const writes = (page: Page) => page.evaluate(() => (window as unknown as { favoriteWrites: string[] }).favoriteWrites)

async function prepare(page: Page, raw: string | null = null) {
  await page.addInitScript(({ key, raw }) => {
    if (!sessionStorage.getItem('favorites-test-seeded')) {
      if (raw !== null) localStorage.setItem(key, raw)
      sessionStorage.setItem('favorites-test-seeded', 'true')
    }
    const observed: string[] = []
    Object.assign(window, { favoriteWrites: observed })
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (name === key) observed.push(value)
      original.call(this, name, value)
    }
  }, { key, raw })
}

test('A01: canonical UTF-16 IDs, duplicates, unknown IDs and refresh', async ({ page }) => {
  const raw = JSON.stringify({ version: 1, ids: ['unknown', 'unknown', '😀', '\ue000', ''] })
  await prepare(page, raw)
  const records = ['é', 'a', 'Z'].map((id) => makeTask(id, { title: 'Enak naslov' }))
  await mount(page, records)
  await expect(count(page)).toHaveText('Priljubljeno: 0 od 3.')
  expect(await stored(page)).toBe(raw)
  expect(await writes(page)).toEqual([])
  for (const record of records) await favorite(page, record.id).click()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['', 'Z', 'a', 'unknown', 'é', '😀', '\ue000'] })
  await filter(page).check()
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(count(page)).toHaveText('Priljubljeno: 3 od 3.')
  await expectIds(page, ['é', 'a', 'Z'])
  expect(await writes(page)).toEqual([])
})

const invalid: [string, string | null][] = [
  ['missing key', null], ['broken JSON', '{'], ['null', 'null'], ['array', '[]'],
  ['wrong version', '{"version":2,"ids":["web-02"]}'],
  ['string version', '{"version":"1","ids":["web-02"]}'],
  ['missing version', '{"ids":["web-02"]}'], ['missing IDs', '{"version":1}'],
  ['non-array IDs', '{"version":1,"ids":"web-02"}'],
  ['mixed IDs', '{"version":1,"ids":["web-02",12]}'],
  ['null ID', '{"version":1,"ids":["web-02",null]}'],
]
for (const [label, raw] of invalid) {
  test(`A02: ${label} starts empty without changing storage`, async ({ page }) => {
    await prepare(page, raw)
    await mount(page)
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
    await expect(clear(page)).toBeDisabled()
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
    expect(await stored(page)).toBe(raw)
    expect(await writes(page)).toEqual([])
    await expect(page.getByRole('alert')).toHaveCount(0)
  })
}

test('A03: project changes reset filter; project clear preserves other and unknown IDs', async ({ page }) => {
  await prepare(page, JSON.stringify({ version: 1, ids: ['web-02', 'web-03', 'launch-02', 'unknown'] }))
  await mount(page)
  await filter(page).check()
  await expectIds(page, ['web-02', 'web-03'])
  await board(page)
  await expect(filter(page)).toBeChecked()
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(count(page)).toHaveText('Priljubljeno: 1 od 2.')
  await filter(page).check()
  await project(page, 'web')
  await expect(filter(page)).not.toBeChecked()
  await filter(page).check()
  await clear(page).click()
  await expect(clear(page)).toBeDisabled()
  await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['launch-02', 'unknown'] })
  await project(page, 'launch')
  await expect(favorite(page, 'launch-02')).toHaveAttribute('aria-pressed', 'true')
})

test('A04: storage events replace selection with validation and no feedback writes', async ({ page }) => {
  await prepare(page)
  await mount(page)
  await filter(page).check()
  const send = async (newValue: string | null, eventKey = key) => page.evaluate(({ eventKey, newValue }) => {
    window.dispatchEvent(new StorageEvent('storage', { key: eventKey, newValue }))
  }, { eventKey, newValue })
  await send(JSON.stringify({ version: 1, ids: ['web-03', 'web-03', 'unknown'] }))
  await expectIds(page, ['web-03'])
  await expect(count(page)).toHaveText('Priljubljeno: 1 od 8.')
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await send(null, 'different-key')
  await expectIds(page, ['web-03'])
  for (const raw of ['{', '{"version":2,"ids":["web-02"]}', '{"version":1,"ids":["web-02",false]}', null]) {
    await send(JSON.stringify({ version: 1, ids: ['web-02'] }))
    await expectIds(page, ['web-02'])
    await send(raw)
    await expectIds(page, [])
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
  }
  await expect(filter(page)).toBeChecked()
  expect(await writes(page)).toEqual([])
  expect(await stored(page)).toBeNull()
})

for (const mode of ['getItem', 'setItem', 'getter'] as const) {
  test(`A05: unavailable ${mode} keeps changes usable in memory`, async ({ page }) => {
    await page.addInitScript(({ mode, key }) => {
      if (mode === 'getter') Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } })
      else {
        const original = Storage.prototype[mode]
        Object.defineProperty(Storage.prototype, mode, { value: function (name: string, value: string) {
          if (name === key) throw new Error('blocked')
          return Reflect.apply(original, this, [name, value])
        } })
      }
    }, { mode, key })
    await mount(page)
    await favorite(page, 'web-02').click()
    await expect(page.getByRole('alert')).toContainText('shramba')
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await filter(page).check()
    await board(page)
    await expectIds(page, ['web-02'])
    await project(page, 'launch')
    await favorite(page, 'launch-01').click()
    await project(page, 'web')
    await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
    await clear(page).click()
    await expect(count(page)).toHaveText('Priljubljeno: 0 od 8.')
    await project(page, 'launch')
    await expect(favorite(page, 'launch-01')).toHaveAttribute('aria-pressed', 'true')
  })
}

for (const number of [0, 1, 13]) {
  test(`A06: ${number} tasks preserve totals, source order and visible column counts`, async ({ page }) => {
    const records = Array.from({ length: number }, (_, i) => makeTask(`item-${number - i}`, { status: i % 2 ? 'done' : 'todo' }))
    const selected = records.filter((_, i) => i % 3 === 0)
    await prepare(page, JSON.stringify({ version: 1, ids: selected.map((task) => task.id) }))
    await mount(page, records)
    await expect(count(page)).toHaveText(`Priljubljeno: ${selected.length} od ${number}.`)
    await filter(page).check()
    await expectIds(page, selected.map((task) => task.id))
    await board(page)
    for (const [status, label] of [['todo', 'Pripravljeno'], ['in_progress', 'V delu'], ['done', 'Končano']]) {
      const ids = selected.filter((task) => task.status === status).map((task) => task.id)
      await columnIds(page, label, ids)
      await expect(page.getByRole('region', { name: label, exact: true }).locator('.column-count')).toHaveText(String(ids.length))
    }
    await expect(count(page)).toHaveText(`Priljubljeno: ${selected.length} od ${number}.`)
    for (const record of selected) await favorite(page, record.id).click()
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await expect(clear(page)).toBeDisabled()
    await table(page)
    await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
    await filter(page).uncheck()
    await expectIds(page, records.map((task) => task.id))
  })
}

test('A07: 390px, keyboard, arbitrary ID details and unchanged API data', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const id = 'č / ? # " 01'
  const record = makeTask(id, { title: 'Enak dolg naslov — čšž '.repeat(6), description: '<b>Navadno besedilo</b> & "čšž"', assignee: 'Živa Kovač' })
  const networkWrites = await mount(page, [record, ...examples])
  const before = await (await page.request.get('/__test/state')).json()
  await favorite(page, id).focus()
  await page.keyboard.press('Space')
  await expect(favorite(page, id)).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await readonly(page, networkWrites)
  await board(page)
  expect(await favorite(page, id).evaluate((button) => button.closest('a') === null)).toBe(true)
  const link = page.getByRole('link', { name: `${record.title} ${id}`, exact: true })
  await link.click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: record.title })).toBeVisible()
  await expect(page.getByRole('dialog').getByText(record.description, { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await filter(page).check()
  await favorite(page, id).click()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await readonly(page, networkWrites)
  expect(await (await page.request.get('/__test/state')).json()).toEqual(before)
  await page.screenshot({ path: 'docs/agent/mobile-favorites.png', fullPage: true })
})
