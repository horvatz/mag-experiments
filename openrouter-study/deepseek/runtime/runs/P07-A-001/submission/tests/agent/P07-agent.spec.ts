import { board, click, expect, expectIds, favoritesCounter, ids, makeTask, mount, project, storedFavorites, table, test } from './helpers.ts'

test('A01: gumbi so ločeni po ID-jih, zunaj povezav in ne odpirajo podrobnosti', async ({ page }) => {
  const writes = await mount(page)
  await expect(page.locator('[data-task-id="web-02"]').getByRole('link').getByRole('button')).toHaveCount(0)
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await board(page)
  await expect(page.locator('[data-task-id="web-02"]').getByRole('link').getByRole('button')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(writes).toEqual([])
})

test('A02: zapis je unikaten in sortiran, neznani ID-ji se ohranijo', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-03')
  await click(page, 'Priljubljeno opravilo web-01')
  await expect.poll(() => storedFavorites(page)).toEqual({ version: 1, ids: ['web-01', 'web-03'] })
  expect(Object.keys(await storedFavorites(page))).toEqual(['version', 'ids'])
  const raw = JSON.stringify({ version: 1, ids: ['web-09', 'web-03', 'web-03', 'ghost-a'] })
  await page.evaluate((value) => localStorage.setItem('folio:favorites:v1', value), raw)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-03', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 1 od 3.')
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe(raw)
  await click(page, 'Priljubljeno opravilo web-01')
  await expect.poll(() => storedFavorites(page)).toEqual({ version: 1, ids: ['ghost-a', 'web-01', 'web-03', 'web-09'] })
})

test('A03: neveljavni zapisi dajo prazno množico, brez prepisa in brez sesutja', async ({ page }) => {
  await mount(page)
  const invalid = [
    'ni json',
    JSON.stringify({ version: 2, ids: ['web-01'] }),
    JSON.stringify({ version: 1 }),
    JSON.stringify({ version: 1, ids: ['web-01', 7] }),
    JSON.stringify(null),
    JSON.stringify({ version: 1, ids: 'web-01' }),
  ]
  for (const raw of invalid) {
    await page.evaluate((value) => localStorage.setItem('folio:favorites:v1', value), raw)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
    await expect(page.locator('.favorite-button[aria-pressed="true"]')).toHaveCount(0)
    await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 0 od 3.')
    expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe(raw)
  }
  await page.evaluate(() => localStorage.removeItem('folio:favorites:v1'))
  await page.reload()
  await expect(page.locator('.favorite-button[aria-pressed="true"]')).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBeNull()
})

test('A04: filter, prazno stanje, števec in vidni števci stolpcev', async ({ page }) => {
  await mount(page)
  const filter = page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
  await expect(filter).not.toBeChecked()
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 0 od 3.')
  await filter.check()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(filter).toBeEnabled()
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 0 od 3.')
  await filter.uncheck()
  await expectIds(page, ['web-01', 'web-02', 'web-03'])
  await click(page, 'Priljubljeno opravilo web-01')
  await filter.check()
  await expectIds(page, ['web-01'])
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 1 od 3.')
  await board(page)
  const inProgress = page.getByRole('region', { name: 'V delu', exact: true })
  await expect(inProgress.locator('[data-task-id]')).toHaveCount(1)
  await expect(inProgress.getByLabel('1 opravil')).toBeVisible()
  const ready = page.getByRole('region', { name: 'Pripravljeno', exact: true })
  await expect(ready.locator('[data-task-id]')).toHaveCount(0)
})

test('A05: odstranitev priljubljenih projekta ohrani tuje in neznane ID-je', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['ghost-a', 'web-01', 'web-02', 'launch-01'] })))
  await mount(page)
  const remove = page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })
  await expect(remove).toBeEnabled()
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 2 od 3.')
  await remove.click()
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 0 od 3.')
  await expect(remove).toBeDisabled()
  await expect.poll(() => storedFavorites(page)).toEqual({ version: 1, ids: ['ghost-a', 'launch-01'] })
  await project(page, 'launch')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo launch-01', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(remove).toBeEnabled()
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 1 od 2.')
})

test('A06: pogled in projekt ohranita stanje, osvežitev ponastavi filter', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await board(page)
  await expectIds(page, ['web-02'])
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 1 od 3.')
  await table(page)
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).toBeChecked()
  await expectIds(page, ['web-02'])
  await project(page, 'launch')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expectIds(page, ['launch-01', 'launch-02'])
  await project(page, 'web')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await expectIds(page, ['web-01', 'web-02', 'web-03'])
})

test('A07: gumb za odstranitev je brez priljubljenih projekta onemogočen', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['ghost-a', 'launch-01'] })))
  await mount(page)
  await expect(page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' })).toBeDisabled()
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 0 od 3.')
})

test('A08: storage dogodek uskladi stanje brez povratnega zapisa', async ({ page }) => {
  await mount(page)
  await click(page, 'Priljubljeno opravilo web-02')
  const raw = await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'drugi:kljuc', newValue: JSON.stringify({ version: 1, ids: ['web-01'] }) })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: JSON.stringify({ version: 1, ids: ['web-01', 'web-01', 'ghost-a'] }) })))
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-01', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 1 od 3.')
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe(raw)
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'folio:favorites:v1', newValue: null })))
  await expect(page.locator('.favorite-button[aria-pressed="true"]')).toHaveCount(0)
})

test('A09: izjema shrambe ohrani uporabnost in prikaže opozorilo', async ({ page }) => {
  await page.addInitScript(() => {
    const storage = Object.getPrototypeOf(window.localStorage)
    storage.getItem = () => { throw new DOMException('shramba ni dosegljiva', 'SecurityError') }
    storage.setItem = () => { throw new DOMException('shramba ni dosegljiva', 'SecurityError') }
  })
  await mount(page)
  const alert = page.getByRole('alert').filter({ hasText: 'shramba' })
  await expect(alert).toBeVisible()
  await expect(alert).toContainText('shramba')
  await click(page, 'Priljubljeno opravilo web-02')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(alert).toBeVisible()
  await expectIds(page, ['web-01', 'web-02', 'web-03'])
})

test('A10: brez zapisov API in brez vodoravnega prelivanja pri 390 px', async ({ page }) => {
  const writes = await mount(page)
  await click(page, 'Priljubljeno opravilo web-01')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' }).click()
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).uncheck()
  await board(page)
  await table(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.locator('[data-task-id="web-01"]')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(writes).toEqual([])
  const state = await (await page.request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
})

test('A11: enaki naslovi delujejo neodvisno', async ({ page }) => {
  await mount(page, [makeTask('web-01', { title: 'Enak' }), makeTask('web-02', { title: 'Enak' })])
  await click(page, 'Priljubljeno opravilo web-02')
  await expectIds(page, ['web-01', 'web-02'])
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 1 od 2.')
  expect(await ids(page)).toEqual(['web-01', 'web-02'])
})

test('A12: prazen projekt prikaže prazno stanje in filter', async ({ page }) => {
  await mount(page, [])
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await expect(favoritesCounter(page)).toHaveText('Priljubljeno: 0 od 0.')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
})
