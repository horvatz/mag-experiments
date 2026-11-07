import { expect, test } from '@playwright/test'
import { favoriteButton, favoriteStatus, mount } from './helpers'

test('P07 events: correct key updates state without writing', async ({ page }) => {
  const writes = await mount(page)
  const nextValue = '{"version":1,"ids":["web-01"]}'

  await page.evaluate((value) => {
    window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: value }))
  }, nextValue)
  await expect(favoriteButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBeNull()

  await page.evaluate(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: null }))
  })
  await expect(favoriteButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')

  await page.evaluate(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: 'other:key', newValue: '{"version":1,"ids":["web-02"]}' }))
  })
  await expect(favoriteButton(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  expect(writes).toEqual([])
})

test('P07 events: write failure keeps in-memory state usable and alerts', async ({ page }) => {
  const writes = await mount(page)
  await page.evaluate(() => {
    Object.defineProperty(Storage.prototype, 'setItem', {
      configurable: true,
      value: () => { throw new Error('quota') },
    })
  })

  await favoriteButton(page, 'web-01').click()
  await expect(favoriteButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await expect(favoriteStatus(page)).toHaveText('Priljubljeno: 1 od 3.')
  await expect(page.getByRole('alert').filter({ hasText: 'shramba' })).toBeVisible()
  expect(writes).toEqual([])
})

test('P07 events: read failure keeps the initial view usable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'getItem', {
      configurable: true,
      value: () => { throw new Error('unavailable') },
    })
  })
  const writes = await mount(page)

  await expect(page.getByRole('alert').filter({ hasText: 'shramba' })).toBeVisible()
  await expect(favoriteStatus(page)).toHaveText('Priljubljeno: 0 od 3.')
  await expect(favoriteButton(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  expect(writes).toEqual([])
})
