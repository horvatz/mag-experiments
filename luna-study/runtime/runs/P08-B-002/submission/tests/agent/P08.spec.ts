import { expect, test, mount, select, expectIds, board, table, project, type Task, makeTask } from '../development/helpers.ts'

test('koledarski mejniki in prestopni dnevi razvrstijo vsako opravilo natanko enkrat', async ({ browser }) => {
  const tasks: Task[] = [
    makeTask('past', { dueDate: '2026-12-30' }),
    makeTask('same', { dueDate: '2026-12-31' }),
    makeTask('week-end', { dueDate: '2027-01-07' }),
    makeTask('later', { dueDate: '2027-01-08' }),
    makeTask('leap-day', { dueDate: '2024-02-29' }),
    makeTask('finished', { status: 'done', dueDate: '2020-02-29' }),
  ]
  const context = await browser.newContext({ timezoneId: 'Pacific/Kiritimati' })
  const page = await context.newPage()
  await mount(page, tasks)
  const date = page.getByLabel('Referenčni datum', { exact: true })
  await date.fill('2026-12-31')
  await expect(page.getByLabel('Število rokov overdue', { exact: true })).toHaveText('2')
  await expect(page.getByLabel('Število rokov today', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov later', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov done', { exact: true })).toHaveText('1')
  for (const [group, ids] of [
    ['overdue', ['past', 'leap-day']],
    ['today', ['same']],
    ['week', ['week-end']],
    ['later', ['later']],
    ['done', ['finished']],
  ] as const) {
    await select(page, 'Pogled rokov', group)
    await expectIds(page, [...ids])
    await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('1')
  }
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['week-end'])
  await date.fill('2024-02-25')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('week')
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('1')
  await expectIds(page, ['leap-day'])
  await context.close()
})

test('filter in datum ostaneta pri menjavi pogleda, projekt in prazen seznam se ponastavita', async ({ page }) => {
  const writes = await mount(page)
  const date = page.getByLabel('Referenčni datum', { exact: true })
  await date.fill('2026-09-20')
  await select(page, 'Pogled rokov', 'overdue')
  await expectIds(page, ['web-01'])
  await board(page)
  await expect(date).toHaveValue('2026-09-20')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('overdue')
  await expectIds(page, ['web-01'])
  await table(page)
  await project(page, 'launch')
  await expect(date).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  await date.fill('2026-09-25')
  await select(page, 'Pogled rokov', 'done')
  await page.reload()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  await expect(page).not.toHaveURL(/2026-09-21|overdue/)
  await expect(page.evaluate(() => localStorage.length)).resolves.toBe(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(writes).toEqual([])
})

test('prazen projekt prikazuje pet ničel in filter je mogoče ponastaviti na vse', async ({ page }) => {
  await mount(page, [])
  for (const group of ['overdue', 'today', 'week', 'later', 'done']) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText('0')
  }
  await expect(page.getByText('V tem projektu še ni opravil', { exact: true })).toBeVisible()
  await select(page, 'Pogled rokov', 'done')
  await select(page, 'Pogled rokov', 'all')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
})

test('neprazen projekt v prazni skupini pokaže sporočilo in omogoča vrnitev na vse', async ({ page }) => {
  await mount(page, [makeTask('single-task', { dueDate: '2026-09-22' })])
  await select(page, 'Pogled rokov', 'done')
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.', exact: true })).toBeVisible()
  await expectIds(page, [])
  await select(page, 'Pogled rokov', 'all')
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.', exact: true })).toHaveCount(0)
  await expectIds(page, ['single-task'])
})
