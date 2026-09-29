import { test, expect, mount, select, expectIds, board, table, project, summary, readonly, makeTask } from '../development/helpers.ts'

test('deadline counters cover all groups and filters preserve source order', async ({ page }) => {
  const tasks = [
    makeTask('past', { dueDate: '2026-09-20' }), makeTask('today', { dueDate: '2026-09-21' }),
    makeTask('week-1', { dueDate: '2026-09-22' }), makeTask('week-7', { dueDate: '2026-09-28' }),
    makeTask('later', { dueDate: '2026-09-29' }), makeTask('done-past', { status: 'done', dueDate: '2020-01-01' }),
    makeTask('done-future', { status: 'done', dueDate: '2030-01-01' }),
  ]
  await mount(page, tasks)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await summary(page, [1, 1, 2, 1, 2])
  for (const [filter, ids] of [
    ['all', ['past', 'today', 'week-1', 'week-7', 'later', 'done-past', 'done-future']],
    ['overdue', ['past']], ['today', ['today']], ['week', ['week-1', 'week-7']],
    ['later', ['later']], ['done', ['done-past', 'done-future']],
  ] as const) {
    await select(page, 'Pogled rokov', filter)
    await expectIds(page, [...ids])
    await summary(page, [1, 1, 2, 1, 2])
  }
})

test('calendar arithmetic handles leap day and a month boundary', async ({ page }) => {
  const tasks = [
    makeTask('before', { dueDate: '2024-02-26' }), makeTask('anchor', { dueDate: '2024-02-27' }),
    makeTask('feb28', { dueDate: '2024-02-28' }), makeTask('leap', { dueDate: '2024-02-29' }),
    makeTask('last-week', { dueDate: '2024-03-05' }), makeTask('after-week', { dueDate: '2024-03-06' }),
  ]
  await mount(page, tasks)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2024-02-27')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['feb28', 'leap', 'last-week'])
  await select(page, 'Pogled rokov', 'later')
  await expectIds(page, ['after-week'])
})

test('view switching preserves draft and filter; project change and refresh reset them', async ({ page }) => {
  await mount(page)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-20')
  await select(page, 'Pogled rokov', 'overdue')
  await board(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-20')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('overdue')
  await table(page)
  await project(page, 'launch')
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  await project(page, 'web')
  await page.getByRole('combobox', { name: 'Pogled rokov', exact: true }).selectOption('today')
  await page.reload()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  expect(new URL(page.url()).hash).not.toMatch(/(overdue|today|week|later|done|2026-09)/)
})

test('empty project has zero counters and empty selected groups can be changed', async ({ page }) => {
  await mount(page, [])
  await summary(page, [0, 0, 0, 0, 0])
  await project(page, 'launch')
  await mount(page, [makeTask('only', { dueDate: '2026-09-22' })])
  await select(page, 'Pogled rokov', 'overdue')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await board(page)
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['only'])
})

test('responsive read-only task details remain available', async ({ page, request }) => {
  const writes = await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.locator('[data-task-id="web-02"] a').click()
  await expect(page.getByRole('dialog').getByText('Luka Kovač', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await readonly(page, writes)
  expect((await request.get('/__test/state')).ok()).toBe(true)
})
