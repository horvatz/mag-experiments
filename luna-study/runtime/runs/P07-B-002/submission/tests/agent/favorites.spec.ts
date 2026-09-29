import { expect, mount, test } from '../development/helpers.ts'

const key = 'folio:favorites:v1'

test('favorites restore IDs without rewriting input and preserve unknown IDs on change', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['web-03', 'future-task', 'web-03'] })))
  await mount(page)

  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-task-id="future-task"]')).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe(JSON.stringify({ version: 1, ids: ['web-03', 'future-task', 'web-03'] }))

  await page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('folio:favorites:v1')!))).toEqual({ version: 1, ids: ['future-task', 'web-01', 'web-03'] })
})

for (const [label, raw] of [
  ['malformed JSON', '{'],
  ['wrong version', JSON.stringify({ version: 2, ids: ['web-01'] })],
  ['missing IDs', JSON.stringify({ version: 1 })],
  ['non-string ID', JSON.stringify({ version: 1, ids: ['web-01', 42] })],
]) {
  test(`invalid stored favorites start empty without rewriting (${label})`, async ({ page }) => {
    await page.addInitScript(({ storageKey, stored }) => localStorage.setItem(storageKey, stored), { storageKey: key, stored: raw })
    await mount(page)
    await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'false')
    expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe(raw)
  })
}

test('project count and clear keep other project and unknown favorites', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['web-01', 'launch-02', 'unknown'] })))
  await mount(page)
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('folio:favorites:v1')!))).toEqual({ version: 1, ids: ['launch-02', 'unknown'] })
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 2.')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
})

test('storage events sync only the favorites key and do not write back', async ({ page }) => {
  await mount(page)
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Object.defineProperty(window, '__favoriteWrites', { value: 0, writable: true })
    Storage.prototype.setItem = function (storageKey, value) {
      if (storageKey === 'folio:favorites:v1') Reflect.set(window, '__favoriteWrites', (Reflect.get(window, '__favoriteWrites') as number) + 1)
      return original.call(this, storageKey, value)
    }
    window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated', newValue: '{"version":1,"ids":["web-01"]}' }))
  })
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: '{"version":1,"ids":["web-01"]}' })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: null })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate(() => Reflect.get(window, '__favoriteWrites') as number)).toBe(0)
})

test('storage exceptions keep favorite changes usable and show an alert', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (storageKey, value) {
      if (storageKey === 'folio:favorites:v1') throw new DOMException('blocked', 'SecurityError')
      return original.call(this, storageKey, value)
    }
  })
  await mount(page)
  await page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert')).toContainText('shramba')
})
