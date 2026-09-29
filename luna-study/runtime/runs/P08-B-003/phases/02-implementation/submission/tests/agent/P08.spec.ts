import { test, expect, mount, makeTask, select, expectIds, board, table, project, readonly } from '../development/helpers.ts'

test('koledarske skupine, števci in vrstici v obeh pogledih', async ({ page }) => {
  const records = [
    makeTask('task-later', { dueDate: '2024-03-03' }),
    makeTask('task-week-end', { dueDate: '2024-03-02', status: 'in_progress' }),
    makeTask('task-done', { dueDate: '2024-02-20', status: 'done' }),
    makeTask('task-done-later', { dueDate: '2024-04-03', status: 'done' }),
    makeTask('task-today', { dueDate: '2024-02-24' }),
    makeTask('task-week-start', { dueDate: '2024-02-25' }),
    makeTask('task-overdue', { dueDate: '2024-02-23' }),
  ]
  const writes = await mount(page, records)
  const date = page.getByLabel('Referenčni datum', { exact: true })
  await date.fill('2024-02-24')

  for (const [group, count] of Object.entries({ overdue: '1', today: '1', week: '2', later: '1', done: '2' })) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText(count)
  }

  const expectedGroups = {
    overdue: ['task-overdue'],
    today: ['task-today'],
    week: ['task-week-end', 'task-week-start'],
    later: ['task-later'],
    done: ['task-done', 'task-done-later'],
  }
  for (const [group, ids] of Object.entries(expectedGroups)) {
    await select(page, 'Pogled rokov', group)
    await expectIds(page, ids)
    await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
  }
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['task-week-end', 'task-week-start'])
  await board(page)
  await expectIds(page, ['task-week-end', 'task-week-start'], false)
  await table(page)
  await expect(date).toHaveValue('2024-02-24')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('week')
  await expect(page).toHaveURL(/#\/projects\/web$/)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await readonly(page, writes)
})

test('prazna skupina omogoča vrnitev, projekt pa ponastavi lokalni izbor', async ({ page }) => {
  const writes = await mount(page, [makeTask('only-done', { status: 'done' })])
  await select(page, 'Pogled rokov', 'overdue')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['only-done'])

  const date = page.getByLabel('Referenčni datum', { exact: true })
  await date.fill('2027-01-04')
  await select(page, 'Pogled rokov', 'done')
  await project(page, 'launch')
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  await expect(page.getByLabel('Število rokov overdue', { exact: true })).toHaveText('0')
  await page.reload()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  await readonly(page, writes)
})

test('koledarski teden pravilno prečka novo leto', async ({ page }) => {
  const records = [
    makeTask('year-week', { dueDate: '2025-01-04' }),
    makeTask('year-later', { dueDate: '2025-01-05' }),
  ]
  await mount(page, records)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2024-12-28')
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov later', { exact: true })).toHaveText('1')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['year-week'])
})

test('prazen projekt ima ničelne števce; prazno besedilo datuma ohrani izračun', async ({ page }) => {
  const writes = await mount(page, [])
  for (const group of ['overdue', 'today', 'week', 'later', 'done']) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText('0')
  }

  const date = page.getByLabel('Referenčni datum', { exact: true })
  await select(page, 'Pogled rokov', 'today')
  await date.fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expect(date).toHaveValue('')
  await date.fill('2024-02-29')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('today')
  await expectIds(page, [])

  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await readonly(page, writes)
})
