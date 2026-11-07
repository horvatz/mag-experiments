import type { Page } from '@playwright/test'
import { expect, test, mount, makeTask, expectIds, webIds, select, board, table, click, readonly, summary, columnIds, type Task } from '../development/helpers.ts'

const search = (page: Page) => page.getByRole('searchbox', { name: 'Išči opravila' })
const status = (page: Page) => page.getByRole('combobox', { name: 'Filter stanja' })
const person = (page: Page) => page.getByRole('combobox', { name: 'Filter odgovorne osebe' })
const resultStatus = (page: Page) => page.getByRole('status', { name: 'Rezultati filtriranja' })
const optionValues = (page: Page) => person(page).locator('option').evaluateAll((nodes) => nodes.map((node) => (node as HTMLOptionElement).value))

test('A01/R01: defaults show every task in API source order with result counter', async ({ page }) => {
  const records = [
    makeTask('web-03', { title: 'Tretje' }),
    makeTask('web-01', { title: 'Prvo' }),
    makeTask('web-02', { title: 'Drugo' }),
    makeTask('launch-01', { projectId: 'launch' }),
  ]
  await mount(page, records)
  await expect(search(page)).toHaveValue('')
  await expect(status(page)).toHaveValue('all')
  await expect(person(page)).toHaveValue('all')
  await expectIds(page, ['web-03', 'web-01', 'web-02'])
  await expect(resultStatus(page)).toHaveText('Prikazano: 3 od 3.')
})

test('A02/R11+R09: clear filters resets all three controls and counts', async ({ page }) => {
  const writes = await mount(page)
  await search(page).fill('pregled')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await expect(resultStatus(page)).toHaveText('Prikazano: 1 od 8.')
  await click(page, 'Počisti filtre')
  await expect(search(page)).toHaveValue('')
  await expect(status(page)).toHaveValue('all')
  await expect(person(page)).toHaveValue('all')
  await expectIds(page, webIds())
  await expect(resultStatus(page)).toHaveText('Prikazano: 8 od 8.')
  await readonly(page, writes)
})

test('A03/R02: search is case- and diacritic-insensitive across all fields', async ({ page }) => {
  await mount(page)
  await search(page).fill('CAS')
  await expectIds(page, ['web-01'])
  await search(page).fill('čas')
  await expectIds(page, ['web-01'])
  await search(page).fill('crt')
  await expectIds(page, ['web-07'])
  await search(page).fill('DRUGA VRSTICA')
  await expectIds(page, ['web-06'])
  await search(page).fill('maja')
  await expectIds(page, ['web-04', 'web-08'])
})

test('A04/R03: all words must match, order is irrelevant, punctuation is literal', async ({ page }) => {
  await mount(page)
  await search(page).fill('pregled vsebine')
  await expectIds(page, ['web-01', 'web-02', 'web-03'])
  await search(page).fill('vsebine pregled')
  await expectIds(page, ['web-01', 'web-02', 'web-03'])
  await search(page).fill('pregled neobstojeca')
  await expectIds(page, [])
  await search(page).fill('"citat"')
  await expectIds(page, ['web-06'])
  await search(page).fill('=SUM(A1)')
  await expectIds(page, ['web-07'])
  await search(page).fill('=SUM(A1')
  await expectIds(page, ['web-07'])
})

test('A05/R03: blank search does not restrict results', async ({ page }) => {
  await mount(page)
  await search(page).fill('   ')
  await expectIds(page, webIds())
  await search(page).fill('\t\n ')
  await expectIds(page, webIds())
})

test('A06/R04: status, assignee and search combine with logical AND', async ({ page }) => {
  await mount(page)
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await expectIds(page, ['web-03'])
  await search(page).fill('pregled')
  await expectIds(page, ['web-03'])
  await select(page, 'Filter stanja', 'todo')
  await expectIds(page, [])
  await select(page, 'Filter odgovorne osebe', 'all')
  await expectIds(page, ['web-02'])
  await search(page).fill('')
  await expectIds(page, ['web-02', 'web-04', 'web-07', 'web-08'])
})

test('A07/R05: assignee options cover whole project once and survive other filters', async ({ page }) => {
  await mount(page)
  await expect.poll(() => optionValues(page)).toEqual(['all', 'Ana Novak', 'Luka Kovač', 'Maja Zupan', 'Živa Kovač', 'Črt'])
  await select(page, 'Filter stanja', 'done')
  await search(page).fill('citat')
  await expectIds(page, ['web-06'])
  await expect.poll(() => optionValues(page)).toEqual(['all', 'Ana Novak', 'Luka Kovač', 'Maja Zupan', 'Živa Kovač', 'Črt'])
})

test('A08/R05+R07: project switch resets filters and person options', async ({ page }) => {
  const records: Task[] = [
    makeTask('web-01', { assignee: 'Samo Web', status: 'done' }),
    makeTask('web-02', { assignee: 'Samo Web' }),
    makeTask('launch-01', { projectId: 'launch', assignee: 'Samo Launch' }),
    makeTask('launch-02', { projectId: 'launch', assignee: 'Samo Launch', status: 'done' }),
  ]
  await mount(page, records)
  await search(page).fill('web')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Samo Web')
  await expectIds(page, ['web-01'])
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(search(page)).toHaveValue('')
  await expect(status(page)).toHaveValue('all')
  await expect(person(page)).toHaveValue('all')
  await expect.poll(() => optionValues(page)).toEqual(['all', 'Samo Launch'])
  await expectIds(page, ['launch-01', 'launch-02'])
  await expect(resultStatus(page)).toHaveText('Prikazano: 2 od 2.')
})

test('A09/R06: view switch keeps filters and shows the same matching IDs in table and board', async ({ page }) => {
  await mount(page)
  await search(page).fill('pregled')
  await select(page, 'Filter stanja', 'todo')
  await select(page, 'Filter odgovorne osebe', 'Luka Kovač')
  await expectIds(page, ['web-02'])
  await board(page)
  await expectIds(page, ['web-02'])
  await expect(columnIds(page, 'Pripravljeno', ['web-02']))
  await expect(columnIds(page, 'V delu', []))
  await expect(columnIds(page, 'Končano', []))
  await table(page)
  await expectIds(page, ['web-02'])
  await expect(search(page)).toHaveValue('pregled')
  await expect(status(page)).toHaveValue('todo')
  await expect(person(page)).toHaveValue('Luka Kovač')
})

test('A10/R07: filters are never applied to another project', async ({ page }) => {
  const records: Task[] = [
    makeTask('web-01', { title: 'Samo web' }),
    makeTask('launch-01', { projectId: 'launch', title: 'Samo launch' }),
    makeTask('launch-02', { projectId: 'launch', title: 'Drugo launch' }),
  ]
  await mount(page, records)
  await search(page).fill('samo web')
  await select(page, 'Filter stanja', 'done')
  await expectIds(page, [])
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expectIds(page, ['launch-01', 'launch-02'])
})

test('A11/R08: reload starts with default filters and nothing is persisted', async ({ page }) => {
  await mount(page)
  await search(page).fill('citat')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Živa Kovač')
  await expectIds(page, ['web-06'])
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(search(page)).toHaveValue('')
  await expect(status(page)).toHaveValue('all')
  await expect(person(page)).toHaveValue('all')
  await expectIds(page, webIds())
  expect(await page.evaluate(() => JSON.stringify(Object.keys(window.localStorage)))).toBe('[]')
  expect(page.url()).not.toContain('search=')
})

test('A12/R09: summary, column counts and result counter follow displayed results', async ({ page }) => {
  await mount(page)
  await select(page, 'Filter stanja', 'in_progress')
  await summary(page, [0, 2, 0])
  await expect(resultStatus(page)).toHaveText('Prikazano: 2 od 8.')
  await board(page)
  await expect(page.getByRole('region', { name: 'V delu', exact: true }).locator('.column-count')).toHaveText('2')
  await expect(page.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('.column-count')).toHaveText('0')
  await expect(page.getByRole('region', { name: 'Končano', exact: true }).locator('.column-count')).toHaveText('0')
  await table(page)
  await summary(page, [0, 2, 0])
})

test('A13/R10: no matches shows the message in both views and stays usable', async ({ page }) => {
  const writes = await mount(page)
  await search(page).fill('neobstojece')
  await expectIds(page, [])
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(resultStatus(page)).toHaveText('Prikazano: 0 od 8.')
  await board(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await table(page)
  await click(page, 'Počisti filtre')
  await expectIds(page, webIds())
  await readonly(page, writes)
})

test('A14/R10: empty project keeps the empty state and 0 od 0 in both views', async ({ page }) => {
  await page.route('**/api/projects/web/tasks', (route) => route.fulfill({ json: [] }))
  await page.goto('/#/projects/web')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(resultStatus(page)).toHaveText('Prikazano: 0 od 0.')
  await expect(page.getByText('Ni zadetkov.')).toHaveCount(0)
  await board(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect(page.getByText('Ni opravil v tem stanju.')).toHaveCount(3)
})

test('A15/R11: filtering keeps source order and original field values', async ({ page }) => {
  const records: Task[] = [
    makeTask('web-02', { title: 'Drugo', status: 'done' }),
    makeTask('web-01', { title: 'Prvo', status: 'done' }),
    makeTask('web-03', { title: 'Tretje' }),
  ]
  await mount(page, records)
  await select(page, 'Filter stanja', 'done')
  await expectIds(page, ['web-02', 'web-01'])
  await expect(page.locator('[data-task-id="web-02"]')).toContainText('Drugo')
  await click(page, 'Počisti filtre')
  await expectIds(page, ['web-02', 'web-01', 'web-03'])
})

test('A16/R12: filtering performs no writes and keeps navigation and details working', async ({ page }) => {
  const writes = await mount(page)
  await search(page).fill('pregled')
  await select(page, 'Filter stanja', 'done')
  await expectIds(page, ['web-03'])
  await page.locator('[data-task-id="web-03"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('web-03', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expectIds(page, ['web-03'])
  await readonly(page, writes)
})

test('A17/R12: page does not overflow at 390 px and the table scrolls internally', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page)
  await search(page).fill('pregled')
  await select(page, 'Filter stanja', 'todo')
  await expectIds(page, ['web-02'])
  const widths = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    tableScroll: document.querySelector('.table-scroll')?.scrollWidth ?? 0,
    tableClient: document.querySelector('.table-scroll')?.clientWidth ?? 0,
  }))
  expect(widths.page).toBeLessThanOrEqual(widths.viewport)
  expect(widths.tableScroll).toBeGreaterThan(widths.tableClient)
  await board(page)
  const boardWidths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: window.innerWidth }))
  expect(boardWidths.page).toBeLessThanOrEqual(boardWidths.viewport)
})
