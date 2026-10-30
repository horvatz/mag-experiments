import { type Page } from '@playwright/test'
import { test, expect, mount, click, expectIds, board, table, details, project, examples } from '../development/helpers.ts'

const KEY = 'folio:favorites:v1'
const stored = (page: Page) => page.evaluate((key) => localStorage.getItem(key), KEY)
const parseStored = async (page: Page) => JSON.parse((await stored(page)) ?? 'null')

test('R01: enaki naslovi ostanejo neodvisni in klik ne odpre podrobnosti', async ({ page }) => {
  await mount(page)
  await expect(page.locator('[data-task-id="web-02"]')).toContainText('Pregled vsebine')
  await expect(page.locator('[data-task-id="web-03"]')).toContainText('Pregled vsebine')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('R02/R05/R06: zapis, privzeti filter, vrstni red in takojšnja odstranitev', async ({ page }) => {
  await mount(page)
  const checkbox = page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
  const counter = page.getByRole('status', { name: 'Število priljubljenih' })
  await expect(checkbox).not.toBeChecked()
  await expect(counter).toHaveText('Priljubljeno: 0 od 8.')
  await click(page, 'Priljubljeno opravilo web-03')
  await click(page, 'Priljubljeno opravilo web-01')
  expect(await parseStored(page)).toEqual({ version: 1, ids: ['web-01', 'web-03'] })
  await expect(counter).toHaveText('Priljubljeno: 2 od 8.')
  await checkbox.check()
  await expectIds(page, ['web-01', 'web-03'])
  await click(page, 'Priljubljeno opravilo web-01')
  await expectIds(page, ['web-03'])
  await click(page, 'Priljubljeno opravilo web-03')
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(checkbox).toBeEnabled()
  expect(await parseStored(page)).toEqual({ version: 1, ids: [] })
  await checkbox.uncheck()
  await expectIds(page, examples.filter((task) => task.projectId === 'web').map((task) => task.id))
})

test('R03: podvojeni in neznani ID-ji se ohranijo, brez izmišljenih opravil', async ({ page }) => {
  await page.addInitScript(([key, raw]) => localStorage.setItem(key, raw), [KEY, JSON.stringify({ version: 1, ids: ['web-02', 'web-02', 'neznan-99'] })] as const)
  await mount(page)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-task-id="neznan-99"]')).toHaveCount(0)
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await click(page, 'Priljubljeno opravilo web-01')
  expect(await parseStored(page)).toEqual({ version: 1, ids: ['neznan-99', 'web-01', 'web-02'] })
})

const invalidStored: [string, string | null][] = [
  ['manjkajoč ključ', null],
  ['neveljaven JSON', '{'],
  ['napačna version', JSON.stringify({ version: 2, ids: ['web-01'] })],
  ['manjkajoči ids', JSON.stringify({ version: 1 })],
  ['neniz v ids', JSON.stringify({ version: 1, ids: ['web-01', 5] })],
]
for (const [name, raw] of invalidStored) {
  test(`R04: ${name} → prazna množica brez prepisa`, async ({ page }) => {
    await page.addInitScript(([key, value]) => { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value) }, [KEY, raw] as const)
    await mount(page)
    await expect(page.locator('.favorite-button[aria-pressed="true"]')).toHaveCount(0)
    await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 0 od 8.')
    expect(await stored(page)).toEqual(raw)
  })
}

test('R07: preglednica in tabla si delita množico in filter', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await board(page)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await click(page, 'Priljubljeno opravilo web-04')
  await table(page)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-04', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-02', 'web-04'])
  await board(page)
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await details(page, 'web-02')
})

test('R08: zamenjava projekta in osvežitev', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-01', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await project(page, 'web')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
})

test('R09: odstranitev priljubljenih samo za trenutni projekt', async ({ page }) => {
  await page.addInitScript(([key, raw]) => localStorage.setItem(key, raw), [KEY, JSON.stringify({ version: 1, ids: ['launch-01', 'neznan-x', 'web-01'] })] as const)
  await mount(page)
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  await click(page, 'Odstrani priljubljene tega projekta')
  expect(await parseStored(page)).toEqual({ version: 1, ids: ['launch-01', 'neznan-x'] })
  await expect(page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })).toBeDisabled()
  await project(page, 'launch')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 2.')
  await expect(page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })).toBeEnabled()
})

test('R10: števec priljubljenih in števci stolpcev', async ({ page }) => {
  await mount(page)
  const counter = page.getByRole('status', { name: 'Število priljubljenih' })
  await click(page, 'Priljubljeno opravilo web-02')
  await click(page, 'Priljubljeno opravilo web-03')
  await expect(counter).toHaveText('Priljubljeno: 2 od 8.')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(counter).toHaveText('Priljubljeno: 2 od 8.')
  await board(page)
  await expect(page.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('.column-count')).toHaveText('1')
  await expect(page.getByRole('region', { name: 'V delu', exact: true }).locator('.column-count')).toHaveText('0')
  await expect(page.getByRole('region', { name: 'Končano', exact: true }).locator('.column-count')).toHaveText('1')
})

test('R11: dogodek storage uskladi množico brez povratnega zapisa', async ({ page }) => {
  await mount(page)
  const current = JSON.stringify({ version: 1, ids: ['web-04'] })
  const next = JSON.stringify({ version: 1, ids: ['web-02'] })
  await page.evaluate(([key, a, b]) => {
    localStorage.setItem(key, a)
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: b }))
  }, [KEY, current, next] as const)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-04', exact: true })).toHaveAttribute('aria-pressed', 'false')
  expect(await stored(page)).toEqual(current)
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'drugi:kljuc', newValue: JSON.stringify({ version: 1, ids: ['web-01'] }) })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate((key) => window.dispatchEvent(new StorageEvent('storage', { key, newValue: null })), KEY)
  await expect(page.locator('.favorite-button[aria-pressed="true"]')).toHaveCount(0)
  expect(await stored(page)).toEqual(current)
})

test('R11: izjema shrambe pusti aplikacijo uporabno in prikaže opozorilo', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('shramba ni dosegljiva') }
    Storage.prototype.setItem = () => { throw new Error('shramba ni dosegljiva') }
  })
  await mount(page)
  const alert = page.getByRole('alert')
  await expect(alert).toContainText('shramba')
  await click(page, 'Priljubljeno opravilo web-05')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-05', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(alert).toBeVisible()
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-05'])
})

test('R12: ni zapisov na API in brez prelivanja pri 390 px', async ({ page }) => {
  const writes = await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(writes).toEqual([])
  const state = await (await page.request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
  await details(page, 'web-02')
})
