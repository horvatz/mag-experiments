import { test, expect, mount, expectIds, webIds, select, click, board, readonly } from '../development/helpers.ts'

const hashParams = (page: import('@playwright/test').Page) => new URLSearchParams(new URL(page.url()).hash.split('?')[1] ?? '')

test('A01: unknown and repeated params fall back to defaults without rewriting the URL', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?status=bogus&status=done&order=bogus&foo=bar')
  await expectIds(page, webIds())
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Vrstni red v povezavi', exact: true })).toHaveValue('original')
  expect(new URL(page.url()).hash).toContain('foo=bar')
})

test('A02: search normalizes case and diacritics and matches a phrase as substring', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=ziva')
  await expectIds(page, ['web-06'])
  await mount(page, undefined, '#/projects/web?q=pregled%20vsebine')
  await expectIds(page, ['web-02', 'web-03'])
})

test('A03: search also matches description, assignee and id', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=web-07')
  await expectIds(page, ['web-07'])
  await mount(page, undefined, '#/projects/web?q=luka')
  await expectIds(page, ['web-02'])
  await mount(page, undefined, '#/projects/web?q=druga%20vrstica')
  await expectIds(page, ['web-06'])
})

test('A04: order sorts by normalized title and keeps source order on ties', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?order=title-asc')
  await expectIds(page, ['web-07', 'web-04', 'web-05', 'web-01', 'web-08', 'web-02', 'web-03', 'web-06'])
  await mount(page, undefined, '#/projects/web?order=title-desc')
  await expectIds(page, ['web-06', 'web-02', 'web-03', 'web-08', 'web-01', 'web-05', 'web-04', 'web-07'])
})

test('A05: repeated identical apply adds no history state; back restores previous state', async ({ page }) => {
  await mount(page)
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('alfa')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-04', 'web-05'])
  const length = await page.evaluate(() => history.length)
  await click(page, 'Uporabi pogled')
  expect(await page.evaluate(() => history.length)).toBe(length)
  await page.goBack()
  await expectIds(page, webIds())
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
})

test('A06: commit drops unknown params and keeps view=board', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?view=board&status=done&foo=bar')
  await click(page, 'Uporabi pogled')
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  const params = hashParams(page)
  expect(params.get('view')).toBe('board')
  expect(params.get('status')).toBe('done')
  expect(params.has('foo')).toBe(false)
})

test('A07: back and forward restore filters, display and draft', async ({ page }) => {
  await mount(page)
  await select(page, 'Stanje v povezavi', 'done')
  await click(page, 'Uporabi pogled')
  await expectIds(page, ['web-03', 'web-06'])
  await select(page, 'Stanje v povezavi', 'todo')
  await page.goBack()
  await expectIds(page, webIds())
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi', exact: true })).toHaveValue('all')
  await page.goForward()
  await expectIds(page, ['web-03', 'web-06'])
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi', exact: true })).toHaveValue('done')
})

test('A08: reload keeps committed state, view switch discards draft', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?q=alfa&order=title-desc')
  await expectIds(page, ['web-05', 'web-04'])
  await page.reload()
  await expectIds(page, ['web-05', 'web-04'])
  await page.getByRole('searchbox', { name: 'Iskanje v povezavi' }).fill('pregled')
  await board(page)
  expect(hashParams(page).get('q')).toBe('alfa')
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
})

test('A09: details and Escape keep committed params and view; equal titles open by id', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?status=done&order=title-desc')
  await page.locator('[data-task-id="web-03"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(hashParams(page).get('status')).toBe('done')
  expect(hashParams(page).get('order')).toBe('title-desc')
  await page.locator('[data-task-id="web-06"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('web-06', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  expect(hashParams(page).get('status')).toBe('done')
})

test('A10: project switch resets filters but keeps the view; direct link keeps params', async ({ page }) => {
  await mount(page, undefined, '#/projects/web?view=board&status=done&q=alfa')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  expect(hashParams(page).has('status')).toBe(false)
  expect(hashParams(page).get('view')).toBe('board')
  await expectIds(page, ['launch-01', 'launch-02'])
  await mount(page, undefined, '#/projects/launch?status=done')
  await expectIds(page, ['launch-02'])
})

test('A11: reset clears filters and draft, keeps view, shows count and empty message', async ({ page }) => {
  const writes = await mount(page, undefined, '#/projects/web?view=board&q=neobstojece')
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 8.')
  await expect(page.getByRole('heading', { name: 'Ni zadetkov.' })).toBeVisible()
  await click(page, 'Ponastavi pogled')
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 8 od 8.')
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  expect(hashParams(page).has('q')).toBe(false)
  expect(hashParams(page).get('view')).toBe('board')
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('')
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([])
  await readonly(page, writes)
})
