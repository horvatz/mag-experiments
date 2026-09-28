import { test, expect, mount, click, board, project, expectIds } from '../development/helpers.ts'

const storageKey = 'folio:favorites:v1'

test('favorites validate, deduplicate, preserve unknown IDs, and sort only on a user write', async ({ page }) => {
  const raw = JSON.stringify({ version: 1, ids: ['z-other', 'web-03', 'web-03', 'a-other'] })
  await page.addInitScript((value) => localStorage.setItem('folio:favorites:v1', value), raw)
  await mount(page)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(raw)

  await click(page, 'Priljubljeno opravilo web-02')
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual({ version: 1, ids: ['a-other', 'web-02', 'web-03', 'z-other'] })
})

test('invalid stored values start empty and are not rewritten while loading', async ({ page }) => {
  await mount(page)
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull()
  const invalid = ['{', '{"version":2,"ids":["web-03"]}', '{"version":1}', '{"version":1,"ids":["web-03",4]}']
  for (const raw of invalid) {
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: raw })
    await page.reload()
    await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 8.')
    await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'false')
    expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(raw)
  }
})

test('filter can be turned off after removing the last visible favorite', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  const filter = page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
  await filter.check()
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(filter).toBeChecked()
  await filter.uncheck()
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
})

test('project favorites persist while filter resets and clear is scoped to this project', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['web-02', 'launch-01', 'unknown-task'] })))
  await mount(page)
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await project(page, 'launch')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 2.')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await click(page, 'Odstrani priljubljene tega projekta')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 2.')
  await expect(page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })).toBeDisabled()
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual({ version: 1, ids: ['unknown-task', 'web-02'] })
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await project(page, 'web')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
})

test('board columns count visible tasks and a storage event updates without a write', async ({ page }) => {
  const writes = await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await click(page, 'Priljubljeno opravilo web-03')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await board(page)
  const region = page.getByRole('region', { name: 'Tabla opravil' })
  await expect(region.getByLabel('1 opravil')).toHaveCount(2)
  await expect(region.locator('[data-task-id]')).toHaveCount(2)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).uncheck()
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()

  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Object.defineProperty(window, '__favoriteStorageWrites', { value: 0, writable: true })
    Storage.prototype.setItem = function (key: string, value: string) {
      ;(window as unknown as { __favoriteStorageWrites: number }).__favoriteStorageWrites++
      return original.call(this, key, value)
    }
    window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: JSON.stringify({ version: 1, ids: ['web-04', 'other-project'] }) }))
  })
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-04', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await expect.poll(() => page.evaluate(() => (window as unknown as { __favoriteStorageWrites: number }).__favoriteStorageWrites)).toBe(0)
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'another-key', newValue: null })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-04', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: '{"version":1,"ids":[7]}' })))
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 8.')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: null })))
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 8.')
  expect(writes).toEqual([])
})

test('storage exceptions keep favorite controls usable and show an alert', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = function () { throw new Error('blocked') }
    Storage.prototype.setItem = function () { throw new Error('blocked') }
  })
  await mount(page)
  await expect(page.getByRole('alert')).toContainText('shramba')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await expect(page.getByRole('alert')).toContainText('shramba')
})
