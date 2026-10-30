import type { Page } from '@playwright/test'
import { board, details, expect, expectIds, mount, project, readonly, table, test } from '../development/helpers.ts'

type WriteCounter = { __favoriteWrites?: number }

const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const checkbox = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
const counter = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih' })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })
const stored = (page: Page) => page.evaluate(() => localStorage.getItem('folio:favorites:v1'))
const favoriteWrites = (page: Page) => page.evaluate(() => (window as unknown as WriteCounter).__favoriteWrites ?? 0)
const allIds = ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08']

test('A01: gumbi so neodvisni po ID in ne odpirajo podrobnosti', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-02').click()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await board(page)
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await favorite(page, 'web-03').click()
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await table(page)
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
})

test('A02: zapis je normaliziran in vsebuje le version in ids', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-03').click()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['web-03'] })
  await favorite(page, 'web-02').click()
  const raw = JSON.parse((await stored(page))!)
  expect(raw).toEqual({ version: 1, ids: ['web-02', 'web-03'] })
  expect(Object.keys(raw)).toEqual(['version', 'ids'])
})

test('A03: seme z dvojniki in neznanimi ID-ji', async ({ page }) => {
  const seed = JSON.stringify({ version: 1, ids: ['web-03', 'web-02', 'web-03', 'unknown-9'] })
  await page.addInitScript((value) => localStorage.setItem('folio:favorites:v1', value), seed)
  await mount(page)
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-task-id="unknown-9"]')).toHaveCount(0)
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  expect(await stored(page)).toBe(seed)
  await favorite(page, 'web-02').click()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['unknown-9', 'web-03'] })
})

for (const [name, raw] of [
  ['manjka ključ', null],
  ['neveljaven JSON', '{'],
  ['napačna version', '{"version":2,"ids":["web-01"]}'],
  ['manjka ids', '{"version":1}'],
  ['neniz v ids', '{"version":1,"ids":["web-01",7]}'],
  ['ids ni seznam', '{"version":1,"ids":"web-01"}'],
] as const) {
  test(`A04: ${name} pomeni prazno množico brez prepisa`, async ({ page }) => {
    await page.addInitScript((value) => {
      if (value === null) localStorage.removeItem('folio:favorites:v1')
      else localStorage.setItem('folio:favorites:v1', value)
    }, raw)
    await mount(page)
    await expect(page.locator('.favorite-button[aria-pressed="true"]')).toHaveCount(0)
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 8.')
    expect(await stored(page)).toBe(raw)
    await favorite(page, 'web-01').click()
    await expect(favorite(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  })
}

test('A05: filter je privzeto izklopljen in ohrani izvorni vrstni red', async ({ page }) => {
  await mount(page)
  await expect(checkbox(page)).not.toBeChecked()
  await favorite(page, 'web-03').click()
  await favorite(page, 'web-01').click()
  await checkbox(page).check()
  await expectIds(page, ['web-01', 'web-03'])
  await checkbox(page).uncheck()
  await expectIds(page, allIds)
})

test('A06: odstranitev pod filtrom in prazno sporočilo', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-02').click()
  await checkbox(page).check()
  await expectIds(page, ['web-02'])
  await favorite(page, 'web-02').click()
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(checkbox(page)).toBeEnabled()
  await checkbox(page).uncheck()
  await expectIds(page, allIds)
})

test('A07: parnost pogledov in podrobnosti po ID', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-02').click()
  await checkbox(page).check()
  await board(page)
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expectIds(page, ['web-02'])
  await table(page)
  await expectIds(page, ['web-02'])
  await expect(checkbox(page)).toBeChecked()
  await details(page, 'web-02')
  await expectIds(page, ['web-02'])
  await checkbox(page).uncheck()
  await favorite(page, 'web-01').click()
  await checkbox(page).check()
  await board(page)
  await expect(favorite(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await expectIds(page, ['web-02', 'web-01'])
})

test('A08: menjava projekta in osvežitev', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-02').click()
  await checkbox(page).check()
  await project(page, 'launch')
  await expect(checkbox(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 2.')
  await favorite(page, 'launch-01').click()
  await project(page, 'web')
  await expect(checkbox(page)).not.toBeChecked()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(checkbox(page)).not.toBeChecked()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
})

test('A09: čiščenje odstrani le ID-je trenutnega projekta', async ({ page }) => {
  const seed = JSON.stringify({ version: 1, ids: ['web-02', 'launch-01', 'unknown-7'] })
  await page.addInitScript((value) => localStorage.setItem('folio:favorites:v1', value), seed)
  await mount(page)
  await expect(clear(page)).toBeEnabled()
  await clear(page).click()
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['launch-01', 'unknown-7'] })
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  await expect(clear(page)).toBeDisabled()
  await project(page, 'launch')
  await expect(favorite(page, 'launch-01')).toHaveAttribute('aria-pressed', 'true')
})

test('A10: števci kažejo celoten projekt tudi ob filtru', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-01').click()
  await favorite(page, 'web-02').click()
  await checkbox(page).check()
  await expectIds(page, ['web-01', 'web-02'])
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
  await board(page)
  const boardRegion = page.getByRole('region', { name: 'Tabla opravil', exact: true })
  await expect(boardRegion.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('.column-count')).toHaveText('1')
  await expect(boardRegion.getByRole('region', { name: 'V delu', exact: true }).locator('.column-count')).toHaveText('1')
  await expect(boardRegion.getByRole('region', { name: 'Končano', exact: true }).locator('.column-count')).toHaveText('0')
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 8.')
})

test('A11: dogodek storage uskladi množico brez povratnega zapisa', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    const target = window as unknown as WriteCounter
    target.__favoriteWrites = 0
    Storage.prototype.setItem = function (key: string, value: string) {
      target.__favoriteWrites = (target.__favoriteWrites ?? 0) + 1
      return original.call(this, key, value)
    }
  })
  await mount(page)
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'drugi-kljuc', newValue: '{"version":1,"ids":["web-03"]}' })))
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'false')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: JSON.stringify({ version: 1, ids: ['web-03', 'web-03', 'unknown-9'] }) })))
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  expect(await favoriteWrites(page)).toBe(0)
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: null })))
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'false')
  expect(await favoriteWrites(page)).toBe(0)
  await favorite(page, 'web-01').click()
  expect(await favoriteWrites(page)).toBe(1)
})

test('A12: izjema shrambe pusti aplikacijo uporabno in prikaže opozorilo', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('shramba ni dosegljiva') } })
  })
  await mount(page)
  await expect(page.getByRole('alert')).toContainText('shramba')
  await favorite(page, 'web-02').click()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 8.')
  await favorite(page, 'web-02').click()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
})

test('A13: ni API zapisov in ozki prikaz ostane brez prelivanja', async ({ page }) => {
  const writes = await mount(page)
  await favorite(page, 'web-02').click()
  await checkbox(page).check()
  await favorite(page, 'web-02').click()
  await checkbox(page).uncheck()
  await board(page)
  await favorite(page, 'web-03').click()
  await table(page)
  await clear(page).click()
  await readonly(page, writes)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
