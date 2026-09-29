import { expect, test, mount, examples, makeTask, click, expectIds, board, project } from '../development/helpers.ts'

const key = 'folio:favorites:v1'

test('restored favorites normalize duplicates and preserve unknown IDs without repairing storage', async ({ page }) => {
  const initial = JSON.stringify({ version: 1, ids: ['web-03', 'ghost', 'web-03'] })
  await page.addInitScript((value) => localStorage.setItem('folio:favorites:v1', value), initial)
  await mount(page)

  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 8.')
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe(initial)

  await click(page, 'Priljubljeno opravilo web-02')
  expect(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)).toEqual({
    version: 1,
    ids: ['ghost', 'web-02', 'web-03'],
  })
})

test('writes unique IDs in UTF-16 order and keeps arbitrary unknown IDs', async ({ page }) => {
  const initial = JSON.stringify({ version: 1, ids: ['未知', 'z', 'A'] })
  const records = [makeTask('z'), makeTask('é'), makeTask('A')]
  await page.addInitScript((value) => localStorage.setItem('folio:favorites:v1', value), initial)
  await mount(page, records)
  await click(page, 'Priljubljeno opravilo é')
  expect(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)).toEqual({
    version: 1,
    ids: ['A', 'z', 'é', '未知'],
  })
})

test('invalid stored shapes start empty and are not rewritten on load', async ({ page }) => {
  await mount(page)
  const invalidValues: Array<string | null> = [
    null,
    '{ broken',
    JSON.stringify({ version: 2, ids: ['web-02'] }),
    JSON.stringify({ version: 1 }),
    JSON.stringify({ version: 1, ids: ['web-02', 7] }),
  ]
  for (const value of invalidValues) {
    await page.evaluate(({ storageKey, next }) => {
      if (next === null) localStorage.removeItem(storageKey)
      else localStorage.setItem(storageKey, next)
    }, { storageKey: key, next: value })
    await page.reload()
    await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
    expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe(value)
  }
})

test('project removal preserves other-project and unknown IDs', async ({ page }) => {
  const initial = JSON.stringify({ version: 1, ids: ['launch-01', 'web-02', 'unknown'] })
  await page.addInitScript((value) => {
    if (sessionStorage.getItem('folio:test-seeded') !== 'yes') {
      localStorage.setItem('folio:favorites:v1', value)
      sessionStorage.setItem('folio:test-seeded', 'yes')
    }
  }, initial)
  await mount(page)

  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' }).click()
  expect(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)).toEqual({
    version: 1,
    ids: ['launch-01', 'unknown'],
  })
  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 1 od 2.')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-01', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' }).click()
  expect(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)).toEqual({
    version: 1,
    ids: ['unknown'],
  })
  await expect(page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })).toBeDisabled()
})

test('storage events synchronize validated values without writing back', async ({ page }) => {
  await mount(page)
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', {
    key: 'folio:favorites:v1',
    newValue: JSON.stringify({ version: 1, ids: ['web-03', 'ghost', 'web-03'] }),
  })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBeNull()

  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'another:key', newValue: null })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', {
    key: 'folio:favorites:v1',
    newValue: JSON.stringify({ version: 2, ids: ['web-03'] }),
  })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', {
    key: 'folio:favorites:v1',
    newValue: JSON.stringify({ version: 1, ids: ['web-03'] }),
  })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: null })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'false')
})

test('storage exceptions leave favorites usable in memory and show an alert', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = function (storageKey: string) {
      if (storageKey === 'folio:favorites:v1') throw new Error('blocked')
      return original.call(this, storageKey)
    }
  })
  await mount(page)
  await expect(page.getByRole('alert').filter({ hasText: 'shramba' })).toBeVisible()
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert').filter({ hasText: 'shramba' })).toBeVisible()

  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (storageKey: string, value: string) {
      if (storageKey === 'folio:favorites:v1') throw new Error('blocked')
      original.call(this, storageKey, value)
    }
  })
  await click(page, 'Priljubljeno opravilo web-03')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert').filter({ hasText: 'shramba' })).toBeVisible()
})

test('filtered board counts visible tasks and mobile viewport stays within the screen', async ({ page }) => {
  await mount(page, examples)
  await click(page, 'Priljubljeno opravilo web-01')
  await click(page, 'Priljubljeno opravilo web-04')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await board(page)
  await expectIds(page, ['web-04', 'web-01'])
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByLabel('1 opravil')).toHaveCount(2)
  await expect(page.getByRole('region', { name: 'Tabla opravil' }).getByLabel('0 opravil')).toHaveCount(1)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expectIds(page, ['web-01', 'web-04'])
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 2 od 8.')
})

test('task IDs, not duplicate titles, control toggles and details remain addressed by ID', async ({ page }) => {
  const rows = [makeTask('id-a', { title: 'Isti naslov' }), makeTask('id-b', { title: 'Isti naslov' })]
  await mount(page, rows)
  await click(page, 'Priljubljeno opravilo id-b')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo id-a', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expectIds(page, ['id-a', 'id-b'])
  await page.locator('[data-task-id="id-b"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toContainText('id-b')
})
