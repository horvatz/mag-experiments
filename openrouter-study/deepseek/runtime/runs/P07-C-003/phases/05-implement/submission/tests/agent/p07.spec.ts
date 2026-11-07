import type { Page } from '@playwright/test'
import { test, expect, mount, click, expectIds, board, table, project, details, readonly, columnIds } from '../development/helpers.ts'

const KEY = 'folio:favorites:v1'
const WEB = ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08']

const stored = (page: Page) => page.evaluate((key: string) => localStorage.getItem(key), KEY)
const pressed = (page: Page, id: string) => page.getByRole('button', { name: 'Priljubljeno opravilo ' + id, exact: true })
const filter = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena', exact: true })

test('A01 R01: gumbi preklopijo samo svoj ID in ne odprejo podrobnosti', async ({ page }) => {
  await mount(page)
  await expect(page.getByRole('button', { name: /^Priljubljeno opravilo/ })).toHaveCount(8)
  await expect(page.locator('[data-task-id="web-02"] a button')).toHaveCount(0)
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(pressed(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(pressed(page, 'web-03')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await board(page)
  await expect(page.locator('[data-task-id="web-02"] a button')).toHaveCount(0)
  await expect(pressed(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await click(page, 'Priljubljeno opravilo web-03')
  await expect(pressed(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('A02 R02: shramba ima version 1, enkratne in razvrscene ID-je brez polj opravil', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-03')
  await click(page, 'Priljubljeno opravilo web-01')
  const raw = await stored(page)
  expect(JSON.parse(raw!)).toEqual({ version: 1, ids: ['web-01', 'web-03'] })
  expect(raw).not.toContain('title')
  expect(raw).not.toContain('Pregled vsebine')
})

test('A03 R03: podvojeni in neznani ID-ji se obnovijo brez izmisljenih opravil', async ({ page }) => {
  await page.addInitScript((args: [string, string]) => localStorage.setItem(args[0], args[1]), [KEY, JSON.stringify({ version: 1, ids: ['web-01', 'web-01', 'ghost-1'] })] as [string, string])
  await mount(page)
  await expect(pressed(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await expect(pressed(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  await expectIds(page, WEB)
  await click(page, 'Priljubljeno opravilo web-02')
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['ghost-1', 'web-01', 'web-02'] })
})

test('A04 R04: neveljavni zapisi dajo prazno mnozico in se ne prepisejo', async ({ page }) => {
  await mount(page)
  expect(await stored(page)).toBeNull()
  const invalid = ['not-json', JSON.stringify({ version: 2, ids: ['web-01'] }), JSON.stringify({ version: 1 }), JSON.stringify({ version: 1, ids: ['web-01', 7] }), JSON.stringify(['web-01'])]
  for (const raw of invalid) {
    await page.addInitScript((args: [string, string]) => localStorage.setItem(args[0], args[1]), [KEY, raw] as [string, string])
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
    await expect(pressed(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
    expect(await stored(page)).toBe(raw)
  }
})

test('A05 R05: filter omeji prikaz na priljubljena v izvornem vrstnem redu', async ({ page }) => {
  await mount(page)
  await expect(filter(page)).not.toBeChecked()
  await click(page, 'Priljubljeno opravilo web-03')
  await click(page, 'Priljubljeno opravilo web-01')
  await filter(page).check()
  await expectIds(page, ['web-01', 'web-03'])
  await filter(page).uncheck()
  await expectIds(page, WEB)
})

test('A06 R06: odstranitev pod filtrom in prazno sporocilo', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await filter(page).check()
  await expectIds(page, ['web-02'])
  await click(page, 'Priljubljeno opravilo web-02')
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(filter(page)).toBeEnabled()
  await filter(page).uncheck()
  await expectIds(page, WEB)
})

test('A07 R07/R08: pogled deli stanje, menjava projekta ohrani mnozico in ponastavi filter', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await filter(page).check()
  await board(page)
  await expectIds(page, ['web-02'])
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await filter(page).uncheck()
  await click(page, 'Priljubljeno opravilo web-05')
  await table(page)
  await expect(pressed(page, 'web-05')).toHaveAttribute('aria-pressed', 'true')
  await details(page, 'web-05')
  await project(page, 'launch')
  await expect(filter(page)).not.toBeChecked()
  await project(page, 'web')
  await expect(pressed(page, 'web-05')).toHaveAttribute('aria-pressed', 'true')
  await expect(filter(page)).not.toBeChecked()
  await page.reload()
  await expect(pressed(page, 'web-05')).toHaveAttribute('aria-pressed', 'true')
  await expect(filter(page)).not.toBeChecked()
})

test('A08 R09: odstranitev priljubljenih projekta ohrani tuje in neznane ID-je', async ({ page }) => {
  await page.addInitScript((args: [string, string]) => localStorage.setItem(args[0], args[1]), [KEY, JSON.stringify({ version: 1, ids: ['ghost-9', 'launch-01', 'web-01'] })] as [string, string])
  await mount(page)
  const clear = page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })
  await expect(clear).toBeEnabled()
  await clear.click()
  await expect(pressed(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  expect(JSON.parse((await stored(page))!)).toEqual({ version: 1, ids: ['ghost-9', 'launch-01'] })
  await expect(clear).toBeDisabled()
  await project(page, 'launch')
  await expect(pressed(page, 'launch-01')).toHaveAttribute('aria-pressed', 'true')
})

test('A09 R10: stevec kaze celoten projekt, stolpci table vidna opravila', async ({ page }) => {
  await mount(page)
  const counter = page.getByRole('status', { name: 'Število priljubljenih', exact: true })
  await expect(counter).toHaveText('Priljubljeno: 0 od 8.')
  await click(page, 'Priljubljeno opravilo web-01')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(counter).toHaveText('Priljubljeno: 2 od 8.')
  await filter(page).check()
  await expect(counter).toHaveText('Priljubljeno: 2 od 8.')
  await board(page)
  await expect(counter).toHaveText('Priljubljeno: 2 od 8.')
  await columnIds(page, 'V delu', ['web-01'])
  await columnIds(page, 'Pripravljeno', ['web-02'])
  await columnIds(page, 'Končano', [])
})

test('A10 R11: dogodek storage uskladi mnozico in ne pise nazaj', async ({ page }) => {
  await mount(page)
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:other', newValue: 'x' })))
  await expect(pressed(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  await page.evaluate((args: [string, string]) => window.dispatchEvent(new StorageEvent('storage', { key: args[0], newValue: args[1] })), [KEY, JSON.stringify({ version: 1, ids: ['web-04'] })] as [string, string])
  await expect(pressed(page, 'web-04')).toHaveAttribute('aria-pressed', 'true')
  expect(await stored(page)).toBeNull()
  await page.evaluate((key: string) => window.dispatchEvent(new StorageEvent('storage', { key, newValue: null })), KEY)
  await expect(pressed(page, 'web-04')).toHaveAttribute('aria-pressed', 'false')
  expect(await stored(page)).toBeNull()
})

test('A11 R11: izjema branja shrambe pusti aplikacijo uporabno z opozorilom', async ({ page }) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem
    const set = Storage.prototype.setItem
    Storage.prototype.getItem = function (this: Storage, key: string) { if (key === 'folio:favorites:v1') throw new Error('shramba blokirana'); return get.call(this, key) }
    Storage.prototype.setItem = function (this: Storage, key: string, value: string) { if (key === 'folio:favorites:v1') throw new Error('shramba blokirana'); return set.call(this, key, value) }
  })
  await mount(page)
  await expect(page.getByRole('alert')).toContainText('shramba')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(pressed(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert')).toBeVisible()
})

test('A12 R11: izjema zapisa shrambe ne sesuje aplikacije', async ({ page }) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem
    Storage.prototype.setItem = function (this: Storage, key: string, value: string) { if (key === 'folio:favorites:v1') throw new Error('shramba blokirana'); return set.call(this, key, value) }
  })
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(pressed(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert')).toContainText('shramba')
})

test('A13 R12: brez zapisov na API in brez razsiritve strani pri 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await filter(page).check()
  await readonly(page, writes)
})
