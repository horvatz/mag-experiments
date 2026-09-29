import { expect, test } from '@playwright/test'

const key = 'folio:favorites:v1'

test.beforeEach(async ({ request }) => {
  const response = await request.post('/__test/reset')
  expect(response.ok()).toBeTruthy()
})

test('favorite buttons are independent by ID in both views and do not write tasks', async ({ page, request }) => {
  const before = await (await request.get('/__test/state')).json()
  await page.goto('/')
  const second = page.locator('[data-task-id="web-02"]')
  const favorite = second.getByRole('button', { name: 'Priljubljeno opravilo web-02' })
  await expect(favorite).toHaveAttribute('aria-pressed', 'false')
  await favorite.click()
  await expect(favorite).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-task-id="web-01"]').getByRole('button', { name: 'Priljubljeno opravilo web-01' })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)).toEqual({ version: 1, ids: ['web-02'] })
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  const card = page.locator('[data-task-id="web-02"]')
  const cardFavorite = card.getByRole('button', { name: 'Priljubljeno opravilo web-02' })
  await expect(cardFavorite).toHaveAttribute('aria-pressed', 'true')
  await cardFavorite.click()
  await expect(cardFavorite).toHaveAttribute('aria-pressed', 'false')
  expect(await (await request.get('/__test/state')).json()).toEqual(before)
})

test('restores valid IDs and ignores invalid storage without rewriting it on load', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-task-id="web-01"]').getByRole('button', { name: 'Priljubljeno opravilo web-01' })).toHaveAttribute('aria-pressed', 'false')
  const invalidRecords = ['{', '{"version":2,"ids":[]}', '{"version":1}', '{"version":1,"ids":["web-02",4]}']
  for (const record of invalidRecords) {
    await page.evaluate(([storageKey, value]) => localStorage.setItem(storageKey, value), [key, record])
    await page.reload()
    await expect(page.locator('[data-task-id="web-02"]').getByRole('button', { name: 'Priljubljeno opravilo web-02' })).toHaveAttribute('aria-pressed', 'false')
    expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe(record)
  }
  const seeded = JSON.stringify({ version: 1, ids: ['unknown-task', 'web-02', 'web-02'] })
  await page.evaluate(([storageKey, value]) => localStorage.setItem(storageKey, value), [key, seeded])
  await page.reload()
  await expect(page.locator('[data-task-id="web-02"]').getByRole('button', { name: 'Priljubljeno opravilo web-02' })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe(seeded)
  await page.locator('[data-task-id="web-01"]').getByRole('button', { name: 'Priljubljeno opravilo web-01' }).click()
  expect(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)).toEqual({ version: 1, ids: ['unknown-task', 'web-01', 'web-02'] })
})

test('filter and counters stay consistent across views and project navigation', async ({ page }) => {
  await page.goto('/')
  for (const id of ['web-01', 'web-02']) await page.locator(`[data-task-id="${id}"]`).getByRole('button', { name: `Priljubljeno opravilo ${id}` }).click()
  const counter = page.getByRole('status', { name: 'Število priljubljenih' })
  await expect(counter).toHaveText('Priljubljeno: 2 od 3.')
  const filter = page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
  await expect(filter).not.toBeChecked()
  await filter.check()
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  const readyColumn = page.getByRole('region', { name: 'Tabla opravil' }).getByRole('region', { name: 'Pripravljeno' })
  await expect(readyColumn.getByRole('link')).toHaveCount(1)
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 3.')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova' }).click()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 2 od 3.')
  await page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' }).click()
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 3.')
  await expect(page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })).toBeDisabled()
})

test('storage events synchronize without echo writes and unrelated keys are ignored', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'other:key', newValue: '{"version":1,"ids":["web-02"]}' })))
  await expect(page.locator('[data-task-id="web-02"]').getByRole('button', { name: 'Priljubljeno opravilo web-02' })).toHaveAttribute('aria-pressed', 'false')
  await page.evaluate((storageKey) => window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: '{"version":1,"ids":["web-02"]}' })), key)
  await expect(page.locator('[data-task-id="web-02"]').getByRole('button', { name: 'Priljubljeno opravilo web-02' })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBeNull()
  await page.evaluate((storageKey) => window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: null })), key)
  await expect(page.locator('[data-task-id="web-02"]').getByRole('button', { name: 'Priljubljeno opravilo web-02' })).toHaveAttribute('aria-pressed', 'false')
})

test('storage exceptions leave the page usable and report the unavailable storage', async ({ page }) => {
  await page.addInitScript((storageKey) => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (name: string, value: string) {
      if (name === storageKey) throw new DOMException('blocked', 'SecurityError')
      return original.call(this, name, value)
    }
  }, key)
  await page.goto('/')
  const favorite = page.locator('[data-task-id="web-01"]').getByRole('button', { name: 'Priljubljeno opravilo web-01' })
  await favorite.click()
  await expect(favorite).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert')).toContainText(/shramba/i)
})

test('storage read exceptions still show the app and an alert', async ({ page }) => {
  await page.addInitScript((storageKey) => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = function (name: string) {
      if (name === storageKey) throw new DOMException('blocked', 'SecurityError')
      return original.call(this, name)
    }
  }, key)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Spletna prenova' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText(/shramba/i)
  const favorite = page.locator('[data-task-id="web-01"]').getByRole('button', { name: 'Priljubljeno opravilo web-01' })
  await favorite.click()
  await expect(favorite).toHaveAttribute('aria-pressed', 'true')
})

test('removing the last filtered favorite shows the empty state and leaves filter controls usable', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-task-id="web-01"]').getByRole('button', { name: 'Priljubljeno opravilo web-01' }).click()
  const filter = page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
  await filter.check()
  await expect(page.locator('[data-task-id]')).toHaveCount(1)
  await page.locator('[data-task-id="web-01"]').getByRole('button', { name: 'Priljubljeno opravilo web-01' }).click()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(filter).toBeEnabled()
  await filter.uncheck()
  await expect(page.locator('[data-task-id]')).toHaveCount(3)
})

test('page remains within a 390px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.locator('[data-task-id="web-01"]').getByRole('button', { name: 'Priljubljeno opravilo web-01' }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
})
