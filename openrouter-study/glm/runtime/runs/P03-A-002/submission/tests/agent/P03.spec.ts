import { board, click, details, expectIds, expect, mount, project, readonly, select, summary, table, test, makeTask } from '../development/helpers.ts'

const searchBox = (page: import('@playwright/test').Page) => page.getByRole('searchbox', { name: 'Išči opravila', exact: true })
const statusFilter = (page: import('@playwright/test').Page) => page.getByRole('combobox', { name: 'Filter stanja', exact: true })
const assigneeFilter = (page: import('@playwright/test').Page) => page.getByRole('combobox', { name: 'Filter odgovorne osebe', exact: true })

test('A01: privzeti prikaz, normalizirano iskanje in sestavljene filtre', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: 'Čas za pregled', description: 'Vsebina je pripravljena', status: 'in_progress', assignee: 'Ana Novak' }),
    makeTask('web-02', { title: 'Pregled vsebine', description: 'Finance in načrt', status: 'todo', assignee: 'Luka Kovač' }),
    makeTask('web-03', { title: 'Zapis [abc] (+)', description: 'Opis zapisov', status: 'done', assignee: 'Maja Zupan' }),
  ]
  await mount(page, records)
  await expectIds(page, ['web-01', 'web-02', 'web-03'])
  await searchBox(page).fill('cas ZA')
  await expectIds(page, ['web-01'])
  await searchBox(page).fill('načrt   Finance')
  await expectIds(page, ['web-02'])
  await searchBox(page).fill('opis [abc]')
  await expectIds(page, ['web-03'])
  await searchBox(page).fill('')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Maja Zupan')
  await expectIds(page, ['web-03'])
})

test('A02: možnosti oseb in ponastavitev ob preklopu projekta', async ({ page }) => {
  const records = [
    makeTask('web-01', { assignee: 'Ana Novak' }),
    makeTask('web-02', { assignee: 'Ana Novak', status: 'in_progress' }),
    makeTask('web-03', { assignee: 'Luka Kovač', status: 'done' }),
    makeTask('web-04', { assignee: 'Maja Zupan', status: 'in_progress' }),
    makeTask('launch-01', { projectId: 'launch', assignee: 'Luka Kovač', status: 'done' }),
  ]
  await mount(page, records)
  await select(page, 'Filter stanja', 'done')
  await expect(assigneeFilter(page).locator('option')).toHaveText(['Vse', 'Ana Novak', 'Luka Kovač', 'Maja Zupan'])
  await project(page, 'launch')
  await expect(searchBox(page)).toHaveValue('')
  await expect(statusFilter(page)).toHaveValue('all')
  await expect(assigneeFilter(page)).toHaveValue('all')
  await expect(assigneeFilter(page).locator('option')).toHaveText(['Vse', 'Luka Kovač'])
  await expectIds(page, ['launch-01'])
})

test('A03: enaki rezultati v obeh pogledih in stolpci table', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: 'Pregled vsebine', status: 'todo', assignee: 'Ana Novak' }),
    makeTask('web-02', { title: 'Pregled vsebine', status: 'todo', assignee: 'Luka Kovač' }),
    makeTask('web-03', { title: 'Drugo opravilo', status: 'in_progress', assignee: 'Ana Novak' }),
  ]
  await mount(page, records)
  await searchBox(page).fill('Pregled')
  await select(page, 'Filter stanja', 'todo')
  await select(page, 'Filter odgovorne osebe', 'Ana Novak')
  await expectIds(page, ['web-01'])
  await board(page)
  await expect(searchBox(page)).toHaveValue('Pregled')
  await expect(statusFilter(page)).toHaveValue('todo')
  await expect(assigneeFilter(page)).toHaveValue('Ana Novak')
  await expectIds(page, ['web-01'])
  const column = (name: string) => page.getByRole('region', { name, exact: true }).locator('[data-task-id]')
  await expect(column('Pripravljeno')).toHaveCount(1)
  await expect(column('V delu')).toHaveCount(0)
  await expect(column('Končano')).toHaveCount(0)
  await table(page)
  await expectIds(page, ['web-01'])
})

test('A04: števci, sporočilo o praznih zadetkih in prazen projekt', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: 'Alfa priprava', status: 'todo', assignee: 'Ana Novak' }),
    makeTask('web-02', { title: 'Beta priprava', status: 'todo', assignee: 'Luka Kovač' }),
    makeTask('web-03', { title: 'Alfa v delu', status: 'in_progress', assignee: 'Ana Novak' }),
    makeTask('web-04', { title: 'Alfa končano', status: 'done', assignee: 'Maja Zupan' }),
    makeTask('web-05', { title: 'Beta končano', status: 'done', assignee: 'Luka Kovač' }),
    makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt' }),
  ]
  await mount(page, records)
  await searchBox(page).fill('alfa')
  await select(page, 'Filter stanja', 'todo')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 1 od 5.')
  await summary(page, [1, 0, 0])
  await searchBox(page).fill('neobstojece')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 5.')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await board(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await table(page)
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await mount(page, records.filter((task) => task.projectId === 'launch'), '#/projects/web')
  await page.reload()
  await expect(page.getByText('V tem projektu še ni opravil')).toBeVisible()
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 0 od 0.')
})

test('A05: eno dejanje počisti vse filtre', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: 'Prvi zapis', status: 'todo', assignee: 'Ana Novak' }),
    makeTask('web-02', { title: 'Drugi zapis', status: 'done', assignee: 'Luka Kovač' }),
  ]
  await mount(page, records)
  await searchBox(page).fill('Drugi')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Luka Kovač')
  await expectIds(page, ['web-02'])
  await click(page, 'Počisti filtre')
  await expect(searchBox(page)).toHaveValue('')
  await expect(statusFilter(page)).toHaveValue('all')
  await expect(assigneeFilter(page)).toHaveValue('all')
  await expectIds(page, ['web-01', 'web-02'])
})

test('A06: osvežitev in trajna shramba ne ohranjata filtrov', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: 'Prvi zapis', status: 'todo', assignee: 'Ana Novak' }),
    makeTask('web-02', { title: 'Drugi zapis', status: 'done', assignee: 'Luka Kovač' }),
  ]
  await mount(page, records)
  await searchBox(page).fill('Drugi')
  await select(page, 'Filter stanja', 'done')
  await select(page, 'Filter odgovorne osebe', 'Luka Kovač')
  await page.reload()
  await expect(searchBox(page)).toHaveValue('')
  await expect(statusFilter(page)).toHaveValue('all')
  await expect(assigneeFilter(page)).toHaveValue('all')
  await expectIds(page, ['web-01', 'web-02'])
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
  expect(new URL(page.url()).searchParams.has('search')).toBe(false)
})

test('A07: navigacija, podrobnosti, varnostne zahteve in ozka širina', async ({ page }) => {
  const records = [
    makeTask('web-01', { title: 'Prvi zapis', status: 'todo', assignee: 'Ana Novak' }),
    makeTask('web-02', { title: 'Drugi zapis', status: 'done', assignee: 'Luka Kovač' }),
    makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt' }),
  ]
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page, records)
  await searchBox(page).fill('Prvi')
  await details(page, 'web-01')
  await project(page, 'launch')
  await project(page, 'web')
  await readonly(page, writes)
})
