import { test, expect, mount, click, project, readonly } from '../development/helpers.ts'

test('P07: normalization, project clearing and storage events', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['web-02', 'web-02', 'launch-01', 'unknown-01'] })))
  const writes = await mount(page)

  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await click(page, 'Odstrani priljubljene tega projekta')
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('folio:favorites:v1')!))).toEqual({ version: 1, ids: ['launch-01', 'unknown-01'] })

  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-01', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await click(page, 'Priljubljeno opravilo launch-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-02', exact: true })).toHaveAttribute('aria-pressed', 'true')

  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: JSON.stringify({ version: 1, ids: ['launch-02'] }) })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'another:key', newValue: JSON.stringify({ version: 1, ids: [] }) })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: null })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
  await readonly(page, writes)
})

test('P07: invalid stored shape is ignored without load-time rewrite', async ({ page }) => {
  const invalid = JSON.stringify({ version: 1, ids: ['web-02', 4] })
  await page.addInitScript((value) => localStorage.setItem('folio:favorites:v1', value), invalid)
  await mount(page)

  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 8.')
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe(invalid)
})

test('P07: inaccessible storage leaves favorites usable in memory', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, get: () => { throw new DOMException('Blocked', 'SecurityError') } }))
  const writes = await mount(page)

  await expect(page.getByRole('alert')).toContainText('shramba')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await readonly(page, writes)
})
