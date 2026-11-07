import { expect, type Page } from '@playwright/test'
import { test, mount, click, ids, expectIds, board, project, details, readonly } from '../development/helpers.ts'

test.use({ viewport: { width: 390, height: 844 } })

const key = 'folio:favorites:v1'

async function seed(page: Page, value: unknown) {
  await page.addInitScript(({ key, value }) => {
    window.localStorage.setItem(key, value)
  }, { key, value: JSON.stringify(value) })
}

async function readFavorites(page: Page) {
  return page.evaluate(({ storageKey }) => window.localStorage.getItem(storageKey), { storageKey: key })
}

async function dispatchStorage(page: Page, storageKey: string, newValue: string | null) {
  await page.evaluate(({ storageKey, newValue }) => {
    if (newValue !== null) window.localStorage.setItem(storageKey, newValue)
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue }))
  }, { storageKey, newValue })
}

test('R01/R02/R12: independent favorites, sorted storage and no API writes', async ({ page }) => {
  const writes = await mount(page)
  const web03 = page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })
  const web02 = page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })

  await web03.click()
  await expect(web03).toHaveAttribute('aria-pressed', 'true')
  await web02.click()
  await expect(web02).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(JSON.parse((await readFavorites(page))!)).toEqual({
    version: 1,
    ids: ['web-02', 'web-03'],
  })

  await board(page)
  await click(page, 'Priljubljeno opravilo web-04')
  await click(page, 'Priljubljeno opravilo web-05')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-04', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-05', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(JSON.parse((await readFavorites(page))!)).toEqual({
    version: 1,
    ids: ['web-02', 'web-03', 'web-04', 'web-05'],
  })
  await readonly(page, writes)
})

test('R03/R04/R08/R09/R10: load, filter, projects, counters and project removal', async ({ page }) => {
  await seed(page, { version: 1, ids: ['launch-01', 'unknown', 'web-03', 'web-02', 'web-03'] })
  await mount(page, undefined, '#/projects/web')
  const raw = await readFavorites(page)
  await expect(page.getByRole('status')).toHaveText('Priljubljeno: 2 od 8.')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  expect(await readFavorites(page)).toBe(raw)

  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-02', 'web-03'])
  await expect(page.getByRole('status')).toHaveText('Priljubljeno: 2 od 8.')

  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('status')).toHaveText('Priljubljeno: 1 od 2.')
  await expectIds(page, ['launch-01', 'launch-02'])
  expect(JSON.parse((await readFavorites(page))!)).toEqual({
    version: 1,
    ids: ['launch-01', 'unknown', 'web-03', 'web-02', 'web-03'],
  })

  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['launch-01'])
  await expect(page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })).toBeEnabled()
  await click(page, 'Odstrani priljubljene tega projekta')
  await expectIds(page, [])
  await expect(page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })).toBeDisabled()
  expect(JSON.parse((await readFavorites(page))!)).toEqual({
    version: 1,
    ids: ['unknown', 'web-02', 'web-03'],
  })
})

test('R04/R06/R10: invalid storage starts empty and filtered counters follow visibility', async ({ page }) => {
  await seed(page, { version: 2, ids: ['web-02'] })
  await mount(page, undefined, '#/projects/web')
  const raw = await readFavorites(page)
  await expect(page.getByRole('status')).toHaveText('Priljubljeno: 0 od 8.')
  expect(await readFavorites(page)).toBe(raw)

  await click(page, 'Priljubljeno opravilo web-02')
  await click(page, 'Priljubljeno opravilo web-03')
  await board(page)
  await expect(page.locator('.column-count')).toHaveText(['4', '2', '2'])
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-02', 'web-03'])
  await expect(page.locator('.column-count')).toHaveText(['1', '0', '1'])
  await expect(page.getByRole('status')).toHaveText('Priljubljeno: 2 od 8.')
  await click(page, 'Priljubljeno opravilo web-03')
  await expectIds(page, ['web-02'])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toHaveCount(0)
  await click(page, 'Priljubljeno opravilo web-02')
  await expectIds(page, [])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).toBeEnabled()
})

test('R04: malformed JSON starts empty without a storage warning or rewrite', async ({ page }) => {
  await page.addInitScript(({ storageKey }) => {
    window.localStorage.setItem(storageKey, '{')
  }, { storageKey: key })
  await mount(page, undefined, '#/projects/web')
  const raw = await readFavorites(page)
  await expect(page.getByRole('status')).toHaveText('Priljubljeno: 0 od 8.')
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(await readFavorites(page)).toBe(raw)
  expect(raw).toBe('{')
})

test('R07/R08/R12: view parity, details and refresh reset the filter', async ({ page }) => {
  const writes = await mount(page, undefined, '#/projects/web')
  await click(page, 'Priljubljeno opravilo web-02')
  await board(page)
  await click(page, 'Priljubljeno opravilo web-03')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-02', 'web-03'])
  await details(page, 'web-03')
  await expectIds(page, ['web-02', 'web-03'])
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expectIds(page, ['web-02', 'web-03'])
  await details(page, 'web-02')

  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  expect(JSON.parse((await readFavorites(page))!)).toEqual({
    version: 1,
    ids: ['web-02', 'web-03'],
  })
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('status')).toHaveText('Priljubljeno: 0 od 2.')
  await readonly(page, writes)
})

test('R11: storage events validate and ignore unrelated keys', async ({ page }) => {
  await mount(page)
  await dispatchStorage(page, 'other-key', JSON.stringify({ version: 1, ids: ['web-01'] }))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'false')

  await dispatchStorage(page, key, JSON.stringify({ version: 1, ids: ['web-02', 'unknown', 'web-02'] }))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(await readFavorites(page)).toEqual(JSON.stringify({ version: 1, ids: ['web-02', 'unknown', 'web-02'] }))

  await dispatchStorage(page, key, JSON.stringify({ version: 1, ids: ['web-01', 3] }))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'false')
  expect(await readFavorites(page)).toEqual(JSON.stringify({ version: 1, ids: ['web-01', 3] }))

  await dispatchStorage(page, key, null)
  await expect(page.getByRole('status')).toHaveText('Priljubljeno: 0 od 8.')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
})

test('R11/R12: blocked storage keeps favorites usable and warns', async ({ page }) => {
  await page.addInitScript(() => {
    const blocked = () => { throw new Error('Storage blocked') }
    Object.defineProperty(Storage.prototype, 'getItem', { get: () => blocked })
    Object.defineProperty(Storage.prototype, 'setItem', { get: () => blocked })
  })
  await mount(page)
  await expect(page.getByRole('alert')).toContainText('shramba')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status')).toHaveText('Priljubljeno: 1 od 8.')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expectIds(page, ['web-02'])
  expect(await ids(page)).toEqual(['web-02'])
})
