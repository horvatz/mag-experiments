import { expect, test, mount, select, expectIds, board, table, project, readonly, type Task } from '../development/helpers.ts'

const makeTask = (id: string, values: Partial<Task> = {}): Task => ({
  id,
  projectId: 'web',
  title: `Opravilo ${id}`,
  description: `Opis ${id}`,
  status: 'todo',
  assignee: 'Ana Novak',
  dueDate: '2026-09-21',
  ...values,
})

const boundaryRecords = [
  makeTask('before', { dueDate: '2026-12-30' }),
  makeTask('today', { dueDate: '2026-12-31', status: 'in_progress' }),
  makeTask('week-1', { dueDate: '2027-01-01' }),
  makeTask('week-7', { dueDate: '2027-01-07' }),
  makeTask('later', { dueDate: '2027-01-08' }),
  makeTask('done', { dueDate: '2025-01-01', status: 'done' }),
  makeTask('leap-week', { dueDate: '2028-03-06' }),
]

test('R01, R02 and R06: fixed initial state, done group and stable counters', async ({ page }) => {
  await mount(page, boundaryRecords)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('all')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-12-31')
  const counters = ['overdue', 'today', 'week', 'later', 'done'].map(key => page.getByLabel(`Število rokov ${key}`, { exact: true }))
  await Promise.all(counters.map(async counter => expect(counter).toHaveText(/^[0-9]+$/)))
  await select(page, 'Pogled rokov', 'done')
  await expectIds(page, ['done'])
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, boundaryRecords.map(task => task.id))
})

test('R03, R04 and R05: calendar boundaries work across month, year and leap February', async ({ page }) => {
  await mount(page, boundaryRecords)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-12-31')
  await select(page, 'Pogled rokov', 'overdue')
  await expectIds(page, ['before'])
  await select(page, 'Pogled rokov', 'today')
  await expectIds(page, ['today'])
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['week-1', 'week-7'])
  await select(page, 'Pogled rokov', 'later')
  await expectIds(page, ['later', 'leap-week'])

  await page.getByLabel('Referenčni datum', { exact: true }).fill('2028-02-28')
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2028-02-28')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['leap-week'])
})

test('R07, R09 and R12: filters preserve order in both layouts without writes', async ({ page }) => {
  const writes = await mount(page, boundaryRecords)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-12-31')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['week-1', 'week-7'])
  await board(page)
  await expectIds(page, ['week-1', 'week-7'])
  await table(page)
  await expectIds(page, ['week-1', 'week-7'])
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-12-31')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('week')
  await readonly(page, writes)
})

test('R08: invalid date retains the last valid calculation', async ({ page }) => {
  await mount(page, boundaryRecords)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-12-31')
  await select(page, 'Pogled rokov', 'week')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['week-1', 'week-7'])
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2027-01-05')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expectIds(page, ['week-7', 'later'])
})

test('R10: project switch and refresh reset local filter state only', async ({ page }) => {
  await mount(page, boundaryRecords)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-12-30')
  await select(page, 'Pogled rokov', 'overdue')
  await project(page, 'launch')
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('all')
  await page.reload()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('all')
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe('{}')
  expect(page.url()).not.toContain('referenceDate')
})

test('R11: an empty project has zero counters and remains readable', async ({ page }) => {
  await mount(page, [])
  for (const key of ['overdue', 'today', 'week', 'later', 'done']) {
    await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText('0')
  }
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil', exact: true })).toBeVisible()
})

test('R11: an empty selected group in a non-empty project remains switchable', async ({ page }) => {
  await mount(page, boundaryRecords)
  await select(page, 'Pogled rokov', 'today')
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.', exact: true })).toBeVisible()
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, boundaryRecords.map(task => task.id))
})
