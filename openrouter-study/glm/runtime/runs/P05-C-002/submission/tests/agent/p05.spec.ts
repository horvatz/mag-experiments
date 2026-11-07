import { board, click, details, expect, expectIds, ids, mount, project, readonly, select, summary, table, test, webIds } from '../development/helpers.ts'

const status = (page: import('@playwright/test').Page) => page.getByRole('status', { name: 'Stanje straničenja' })
const navigationButton = (page: import('@playwright/test').Page, name: string) => page.getByRole('button', { name, exact: true })

test('R01: default page size and filter show all tasks in source order', async ({ page }) => {
  await mount(page)
  await expectIds(page, webIds())
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
})

for (const [size, pages] of [['2', [['web-01', 'web-02'], ['web-03', 'web-04'], ['web-05', 'web-06'], ['web-07', 'web-08']]], ['5', [['web-01', 'web-02', 'web-03', 'web-04', 'web-05'], ['web-06', 'web-07', 'web-08']]], ['10', [webIds()]]] as const) {
  test(`R02: page size ${size} makes complete non-overlapping pages`, async ({ page }) => {
    await mount(page)
    await select(page, 'Velikost strani', size)
    for (const expected of pages) {
      await expectIds(page, [...expected])
      if (expected !== pages[pages.length - 1]) await click(page, 'Naslednja stran')
    }
  })
}

test('R03: navigation moves correctly and disables invalid edge actions', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await expect(navigationButton(page, 'Prva stran')).toBeDisabled()
  await expect(navigationButton(page, 'Prejšnja stran')).toBeDisabled()
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-03', 'web-04'])
  await click(page, 'Prejšnja stran')
  await expectIds(page, ['web-01', 'web-02'])
  await click(page, 'Zadnja stran')
  await expectIds(page, ['web-07', 'web-08'])
  await expect(navigationButton(page, 'Naslednja stran')).toBeDisabled()
  await expect(navigationButton(page, 'Zadnja stran')).toBeDisabled()
  await click(page, 'Prva stran')
  await expectIds(page, ['web-01', 'web-02'])
})

test('R04: changing page size always returns to its first page', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Velikost strani', '5')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05'])
  await expect(status(page)).toHaveText('Stran 1 od 2. Prikazano 1–5 od 8.')
  await select(page, 'Velikost strani', 'all')
  await expectIds(page, webIds())
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–8 od 8.')
})

test('R05: filter applies before pagination and resets to first page', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Filter strani', 'done')
  await expectIds(page, ['web-03', 'web-06'])
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
  await select(page, 'Filter strani', 'todo')
  await expectIds(page, ['web-02', 'web-04'])
  await click(page, 'Naslednja stran')
  await expectIds(page, ['web-07', 'web-08'])
  await select(page, 'Filter strani', 'in_progress')
  await expectIds(page, ['web-01', 'web-05'])
})

test('R06: table and board show the same current page segment', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Naslednja stran')
  const expected = ['web-03', 'web-04']
  await expectIds(page, expected)
  await board(page)
  await expectIds(page, expected, false)
  await table(page)
  await expectIds(page, expected)
})

test('R07: view switch and details preserve page, size and filter', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'todo')
  await click(page, 'Naslednja stran')
  const expected = ['web-07', 'web-08']
  await board(page)
  await details(page, 'web-07')
  await expectIds(page, expected, false)
  await table(page)
  await expectIds(page, expected)
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('2')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('todo')
})

test('R08: project change and refresh reset local pagination state', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await select(page, 'Filter strani', 'done')
  await project(page, 'launch')
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await page.reload()
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(page.getByRole('combobox', { name: 'Velikost strani', exact: true })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter strani', exact: true })).toHaveValue('all')
  await expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([])
  await expect(page.url()).not.toContain('pageSize')
  await expect(page.url()).not.toContain('filter')
})

test('R09: status text gives exact page and visible range', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '5')
  await expect(status(page)).toHaveText('Stran 1 od 2. Prikazano 1–5 od 8.')
  await click(page, 'Zadnja stran')
  await expect(status(page)).toHaveText('Stran 2 od 2. Prikazano 6–8 od 8.')
})

test('R10: empty project reports page zero and disables navigation', async ({ page }) => {
  await mount(page, [])
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  for (const name of ['Prva stran', 'Prejšnja stran', 'Naslednja stran', 'Zadnja stran']) {
    await expect(navigationButton(page, name)).toBeDisabled()
  }
  await select(page, 'Filter strani', 'all')
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
})

test('R10: empty filter disables navigation and all restores the first page', async ({ page }) => {
  const records = [
    { id: 'web-01', projectId: 'web', title: 'Prvo', description: 'Opis', status: 'todo' as const, assignee: 'Ana', dueDate: '2026-09-01' },
    { id: 'web-02', projectId: 'web', title: 'Drugo', description: 'Opis', status: 'in_progress' as const, assignee: 'Luka', dueDate: '2026-09-02' },
  ]
  await mount(page, records)
  await select(page, 'Filter strani', 'done')
  await expect(status(page)).toHaveText('Stran 0 od 0. Prikazano 0–0 od 0.')
  await select(page, 'Filter strani', 'all')
  await expectIds(page, ['web-01', 'web-02'])
  await expect(status(page)).toHaveText('Stran 1 od 1. Prikazano 1–2 od 2.')
})

test('R11: summary counts project and board columns count current page', async ({ page }) => {
  await mount(page)
  await select(page, 'Velikost strani', '2')
  await expect(status(page)).toHaveText('Stran 1 od 4. Prikazano 1–2 od 8.')
  await click(page, 'Naslednja stran')
  await summary(page, [4, 2, 2])
  await board(page)
  await expect(page.locator('.column-count')).toHaveText(['1', '0', '1'])
})

test('R12: pagination is read-only and preserves Folio behavior', async ({ page }) => {
  const writes = await mount(page)
  await select(page, 'Velikost strani', '2')
  await click(page, 'Zadnja stran')
  await select(page, 'Filter strani', 'todo')
  await board(page)
  await details(page, 'web-04')
  await table(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await readonly(page, writes)
  expect(await ids(page)).toEqual(['web-02', 'web-04'])
  const link = page.locator('[data-task-id="web-04"]').getByRole('link')
  await expect(link).toHaveAttribute('href', '#/projects/web/tasks/web-04')
})
