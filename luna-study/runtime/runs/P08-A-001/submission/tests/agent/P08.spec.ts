import { test, expect, mount, select, expectIds, board, table, readonly, type Task } from '../development/helpers.ts'

test('P08: calendar buckets include leap day and cross the year boundary', async ({ page }) => {
  const records: Task[] = [
    { id: 'past', projectId: 'web', title: 'Enako', description: '', status: 'todo', assignee: 'Ana', dueDate: '2024-02-26' },
    { id: 'today', projectId: 'web', title: 'Enako', description: '', status: 'todo', assignee: 'Ana', dueDate: '2024-02-27' },
    { id: 'leap', projectId: 'web', title: 'Enako', description: '', status: 'in_progress', assignee: 'Ana', dueDate: '2024-02-29' },
    { id: 'last-week-day', projectId: 'web', title: 'Enako', description: '', status: 'todo', assignee: 'Ana', dueDate: '2024-03-05' },
    { id: 'later', projectId: 'web', title: 'Enako', description: '', status: 'todo', assignee: 'Ana', dueDate: '2024-03-06' },
    { id: 'done-past', projectId: 'web', title: 'Enako', description: '', status: 'done', assignee: 'Ana', dueDate: '2024-02-01' },
    { id: 'new-year-week', projectId: 'web', title: 'Enako', description: '', status: 'todo', assignee: 'Ana', dueDate: '2025-01-04' },
    { id: 'new-year-later', projectId: 'web', title: 'Enako', description: '', status: 'todo', assignee: 'Ana', dueDate: '2025-01-05' },
  ]
  const writes = await mount(page, records)
  const date = page.getByLabel('Referenčni datum', { exact: true })
  await date.fill('2024-02-27')
  await expectIds(page, records.map((task) => task.id))
  await select(page, 'Pogled rokov', 'today')
  await expectIds(page, ['today'])
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['leap', 'last-week-day'])
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
  await expect(page.getByLabel('Število rokov done', { exact: true })).toHaveText('1')
  await select(page, 'Pogled rokov', 'overdue')
  await expectIds(page, ['past'])
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
  await select(page, 'Pogled rokov', 'later')
  await expectIds(page, ['later', 'new-year-week', 'new-year-later'])
  await date.fill('2024-12-28')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['new-year-week'])
  await expect(page.getByLabel('Število rokov later', { exact: true })).toHaveText('1')
  await select(page, 'Pogled rokov', 'done')
  await expectIds(page, ['done-past'])
  await readonly(page, writes)
})

test('P08: view switch keeps local filter, project change and reload reset it', async ({ page }) => {
  const writes = await mount(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('all')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08'])
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-20')
  await select(page, 'Pogled rokov', 'overdue')
  await board(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-20')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('overdue')
  await expectIds(page, ['web-01'])
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await table(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('overdue')
  await expectIds(page, ['web-01'])
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('all')
  await expectIds(page, ['launch-01', 'launch-02'])
  await page.reload()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toHaveValue('all')
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  expect(new URL(page.url()).hash).not.toContain('deadline')
  await readonly(page, writes)
})

test('P08: blank date retains the last calculation and empty groups remain switchable', async ({ page }) => {
  const oneTask: Task[] = [{ id: 'only', projectId: 'web', title: 'Eno opravilo', description: '', status: 'todo', assignee: 'Ana', dueDate: '2026-09-21' }]
  const writes = await mount(page, oneTask)
  const date = page.getByLabel('Referenčni datum', { exact: true })
  await date.fill('2026-09-22')
  await select(page, 'Pogled rokov', 'overdue')
  await expectIds(page, ['only'])
  await date.fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['only'])
  await select(page, 'Pogled rokov', 'today')
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.' })).toBeVisible()
  await expect(page.getByLabel('Pogled rokov', { exact: true })).toBeVisible()
  await date.fill('2026-09-21')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['only'])
  await readonly(page, writes)
})

test('P08: empty project has zero deadline counts and no page overflow on mobile', async ({ page }) => {
  const writes = await mount(page, [])
  for (const group of ['overdue', 'today', 'week', 'later', 'done']) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText('0')
  }
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await readonly(page, writes)
})
