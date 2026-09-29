import { test, expect, mount, click, expectIds, board, project, readonly, makeTask } from '../development/helpers.ts'

const KEY = 'folio:favorites:v1'

test('favorites are independent by task ID and persist as sorted ID-only data', async ({ page }) => {
  const writes = await mount(page)
  await click(page, 'Priljubljeno opravilo web-03')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual({ version: 1, ids: ['web-02', 'web-03'] })
  await readonly(page, writes)
})

test('filter, board, project switch, and project clearing retain the global IDs', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, JSON.stringify({ version: 1, ids: ['launch-01', 'unknown-id', 'web-03', 'web-02'] })), KEY)
  const writes = await mount(page)
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 2 od 8.')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-02', 'web-03'])
  await board(page)
  await expectIds(page, ['web-02', 'web-03'])
  await expect(page.locator('.board-column.board-todo .column-count')).toHaveText('1')
  await expect(page.locator('.board-column.board-done .column-count')).toHaveText('1')
  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 2.')
  await click(page, 'Odstrani priljubljene tega projekta')
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual({ version: 1, ids: ['unknown-id', 'web-02', 'web-03'] })
  await readonly(page, writes)
})

test('empty project keeps favorite controls available and reports zero results in both views', async ({ page }) => {
  const writes = await mount(page, [])
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 0.')
  await expect(page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await board(page)
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(page.locator('.column-count')).toHaveText(['0', '0', '0'])
  await readonly(page, writes)
})

test('more than ten tasks retain source order and count only visible favorites', async ({ page }) => {
  const records = Array.from({ length: 12 }, (_, index) => makeTask(`many-${String(index + 1).padStart(2, '0')}`, { status: index === 1 ? 'in_progress' : index === 10 ? 'done' : 'todo' }))
  await page.addInitScript((key) => localStorage.setItem(key, JSON.stringify({ version: 1, ids: ['many-11', 'unknown-id', 'many-02'] })), KEY)
  const writes = await mount(page, records)
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 2 od 12.')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['many-02', 'many-11'])
  await board(page)
  await expect(page.locator('.board-column.board-in_progress .column-count')).toHaveText('1')
  await expect(page.locator('.board-column.board-done .column-count')).toHaveText('1')
  await click(page, 'Odstrani priljubljene tega projekta')
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual({ version: 1, ids: ['unknown-id'] })
  await readonly(page, writes)
})

test('invalid initial storage is ignored without being rewritten; storage events synchronize without writing', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '{bad json'), KEY)
  const writes = await mount(page)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe('{bad json')
  await page.evaluate(({ key }) => {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify({ version: 1, ids: ['web-03', 'web-03', 'unknown'] }) }))
  }, { key: KEY })
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'other:key', newValue: null })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(({ key }) => window.dispatchEvent(new StorageEvent('storage', { key, newValue: null })), { key: KEY })
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe('{bad json')
  await readonly(page, writes)
})

test('unsupported storage shapes and a missing key start empty without rewriting them', async ({ page }) => {
  const writes = await mount(page)
  const invalidValues = [
    JSON.stringify({ version: 2, ids: ['web-02'] }),
    JSON.stringify({ version: 1 }),
    JSON.stringify({ version: 1, ids: ['web-02', 7] }),
  ]
  for (const raw of invalidValues) {
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: KEY, value: raw })
    await page.reload()
    await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
    expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe(raw)
  }
  await page.evaluate((key) => localStorage.removeItem(key), KEY)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull()
  await readonly(page, writes)
})

test('storage read failure is announced and does not prevent in-memory use', async ({ page }) => {
  await page.addInitScript((key) => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = function (item: string) { if (item === key) throw new Error('blocked'); return original.call(this, item) }
  }, KEY)
  const writes = await mount(page)
  await expect(page.getByRole('alert')).toContainText('shramba')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await readonly(page, writes)
})

test('storage write failure keeps favorites usable in memory and announces the storage issue', async ({ page }) => {
  const writes = await mount(page)
  await page.evaluate((key) => {
    Object.defineProperty(localStorage, 'setItem', { configurable: true, value: (item: string) => { if (item === key) throw new Error('blocked') } })
  }, KEY)
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('alert')).toContainText('shramba')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-02'])
  await readonly(page, writes)
})
