import { expect, test } from '@playwright/test'
import { favoriteButton, favoriteStatus, mount, seedFavorites } from './helpers'

test('P07 storage: toggles write exact normalized JSON', async ({ page }) => {
  const writes = await mount(page)
  await favoriteButton(page, 'web-03').click()
  await favoriteButton(page, 'web-01').click()

  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(favoriteStatus(page)).toHaveText('Priljubljeno: 2 od 3.')
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe('{"version":1,"ids":["web-01","web-03"]}')
  expect(writes).toEqual([])
})

test('P07 storage: reload normalizes duplicates and preserves unknown IDs', async ({ page }) => {
  const raw = '{"version":1,"ids":["web-03","web-03","unknown","launch-01","web-01"]}'
  await seedFavorites(page, raw)
  await mount(page)

  await expect(favoriteStatus(page)).toHaveText('Priljubljeno: 2 od 3.')
  await expect(favoriteButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await expect(favoriteButton(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await expect(favoriteButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  expect(await page.locator('[data-task-id="unknown"]')).toHaveCount(0)

  await page.reload()
  await expect(favoriteStatus(page)).toHaveText('Priljubljeno: 2 od 3.')
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe(raw)
})

test('P07 storage: invalid or missing values start empty without rewriting', async ({ page }) => {
  await mount(page)
  const invalidValues = [null, '{', '{"version":2,"ids":["web-01"]}', '{"version":1}', '{"version":1,"ids":"web-01"}', '{"version":1,"ids":[1]}']

  for (const value of invalidValues) {
    await page.evaluate((raw) => {
      if (raw === null) localStorage.removeItem('folio:favorites:v1')
      else localStorage.setItem('folio:favorites:v1', raw)
    }, value)
    await page.reload()

    await expect(favoriteStatus(page)).toHaveText('Priljubljeno: 0 od 3.')
    for (const id of ['web-01', 'web-02', 'web-03']) {
      await expect(favoriteButton(page, id)).toHaveAttribute('aria-pressed', 'false')
    }
    expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe(value)
  }
})
