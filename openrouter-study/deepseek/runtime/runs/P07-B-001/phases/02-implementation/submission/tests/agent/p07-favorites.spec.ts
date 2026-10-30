import { test, expect, mount, click, expectIds, board, table, project, details, summary } from '../development/helpers.ts'

const KEY = 'folio:favorites:v1'
const button = (page: Parameters<typeof click>[0], id: string) =>
  page.locator(`[data-task-id="${id}"]`).getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const counter = (page: Parameters<typeof click>[0]) => page.getByRole('status', { name: 'Število priljubljenih' })
const filter = (page: Parameters<typeof click>[0]) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
const stored = (page: Parameters<typeof click>[0]) => page.evaluate((key) => localStorage.getItem(key), KEY)

test('R01/R07: favorites exist in both views, are independent and keep state', async ({ page }) => {
  const writes = await mount(page)
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  await button(page, 'web-02').click()
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(button(page, 'web-03')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await details(page, 'web-02')
  await board(page)
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await button(page, 'web-02').click()
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  await table(page)
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  expect(writes).toEqual([])
})

test('R02: storage keeps only version and sorted unique string ids', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-03')
  await click(page, 'Priljubljeno opravilo web-01')
  const parsed = JSON.parse((await stored(page))!)
  expect(parsed).toEqual({ version: 1, ids: ['web-01', 'web-03'] })
  expect(Object.keys(parsed).sort()).toEqual(['ids', 'version'])
  await click(page, 'Priljubljeno opravilo web-03')
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['web-01'] })
})

test('R03: stored duplicates and unknown ids are tolerated and preserved', async ({ page }) => {
  await mount(page)
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ version: 1, ids: ['web-01', 'web-01', 'launch-01', 'unknown-99'] })), KEY)
  await page.reload()
  await expect(page.locator('[data-task-id]')).toHaveCount(8)
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  await expect(button(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  await click(page, 'Priljubljeno opravilo web-02')
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['launch-01', 'unknown-99', 'web-01', 'web-02'] })
})

test('R04: invalid records give an empty set without rewriting storage', async ({ page }) => {
  const invalid = ['', 'ni json', '{"version":2,"ids":[]}', '{"version":1}', '{"version":1,"ids":["web-01",5]}', '{"version":1,"ids":"web-01"}']
  await mount(page)
  for (const raw of invalid) {
    await page.evaluate(([key, value]) => localStorage.setItem(key, value), [KEY, raw])
    await page.reload()
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
    expect(await stored(page)).toBe(raw)
  }
})

test('R05/R06: filter shows favorites in source order and can be turned off', async ({ page }) => {
  await mount(page)
  await expect(filter(page)).not.toBeChecked()
  await click(page, 'Priljubljeno opravilo web-05')
  await click(page, 'Priljubljeno opravilo web-02')
  await filter(page).check()
  await expectIds(page, ['web-02', 'web-05'])
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  await click(page, 'Priljubljeno opravilo web-02')
  await expectIds(page, ['web-05'])
  await click(page, 'Priljubljeno opravilo web-05')
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(filter(page)).toBeEnabled()
  await filter(page).uncheck()
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
})

test('R06: empty favorites state also appears on the board', async ({ page }) => {
  await mount(page)
  await filter(page).check()
  await board(page)
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(filter(page)).toBeEnabled()
})

test('R08: project change keeps favorites and resets the filter', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await filter(page).check()
  await expectIds(page, ['web-02'])
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 2.')
  await project(page, 'web')
  await expect(filter(page)).not.toBeChecked()
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(filter(page)).not.toBeChecked()
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
})

test('R09: removing project favorites keeps other and unknown ids', async ({ page }) => {
  await mount(page)
  const remove = page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })
  await expect(remove).toBeDisabled()
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(remove).toBeEnabled()
  await project(page, 'launch')
  await expect(remove).toBeDisabled()
  await project(page, 'web')
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ version: 1, ids: ['launch-01', 'tuj-99', 'web-02'] })), KEY)
  await page.reload()
  await expect(remove).toBeEnabled()
  await remove.click()
  await expect(remove).toBeDisabled()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['launch-01', 'tuj-99'] })
  await project(page, 'launch')
  await expect(button(page, 'launch-01')).toHaveAttribute('aria-pressed', 'true')
})

test('R10: counter covers the whole project; board columns count visible', async ({ page }) => {
  await mount(page)
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
  await click(page, 'Priljubljeno opravilo web-02')
  await click(page, 'Priljubljeno opravilo web-03')
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  await filter(page).check()
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  await summary(page, [4, 2, 2])
  await board(page)
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).locator('.column-count')).toHaveText(['1', '0', '1'])
})

test('R11: storage events sync the set without writing back', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-01')
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    const state = window as unknown as { __writes: number }
    state.__writes = 0
    Storage.prototype.setItem = function (this: Storage, key: string, value: string) {
      state.__writes += 1
      return original.call(this, key, value)
    }
  })
  const dispatch = (init: StorageEventInit) => page.evaluate((options) => window.dispatchEvent(new StorageEvent('storage', options)), init)
  await dispatch({ key: KEY, newValue: JSON.stringify({ version: 1, ids: ['web-02', 'web-02'] }) })
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(button(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate(() => (window as unknown as { __writes: number }).__writes)).toBe(0)
  await dispatch({ key: KEY, newValue: null })
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  await dispatch({ key: KEY, newValue: '{ni json' })
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  await dispatch({ key: 'drugi:kljuc', newValue: JSON.stringify({ version: 1, ids: ['web-05'] }) })
  await expect(button(page, 'web-05')).toHaveAttribute('aria-pressed', 'false')
  await dispatch({ key: KEY, newValue: JSON.stringify({ version: 1, ids: ['web-01', 'web-01', 'neznan-7'] }) })
  await expect(button(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
})

test('R11: write exception keeps the app usable and shows an alert', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () { throw new Error('shramba blokirana') }
  })
  await mount(page)
  await expect(page.getByRole('alert')).toHaveCount(0)
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert')).toContainText(/shramba/i)
})

test('R11: read exception shows an alert and stays usable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = function () { throw new Error('ni dostopa') }
  })
  await mount(page)
  await expect(page.getByRole('alert')).toContainText(/shramba/i)
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(button(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
})

test('R12: narrow layout does not overflow and changes stay local', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await filter(page).check()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await board(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(writes).toEqual([])
  expect((await (await page.request.get('/__test/state')).json() as { saveRequests: number }).saveRequests).toBe(0)
})
