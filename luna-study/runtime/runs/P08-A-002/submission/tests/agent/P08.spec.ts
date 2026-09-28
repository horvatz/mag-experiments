import { test, expect, mount, select, expectIds, board, table, project, examples, readonly, type Task } from '../development/helpers.ts'

test('calendar groups include both week boundaries, leap day and done regardless of due date', async ({ page }) => {
  const records: Task[] = [
    { ...examples[0], id: 'late-bound', dueDate: '2024-03-06' },
    { ...examples[1], id: 'before', dueDate: '2024-02-27' },
    { ...examples[2], id: 'done-old', dueDate: '2020-01-01', status: 'done' as const },
    { ...examples[3], id: 'leap-day', dueDate: '2024-02-29' },
    { ...examples[4], id: 'today', dueDate: '2024-02-28' },
    { ...examples[5], id: 'after-bound', dueDate: '2024-03-07', status: 'todo' },
  ]
  const writes = await mount(page, records)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2024-02-28')
  await expect(page.getByLabel('Število rokov overdue', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov today', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
  await expect(page.getByLabel('Število rokov later', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov done', { exact: true })).toHaveText('1')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['late-bound', 'leap-day'])
  const tableIds = await page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
  await board(page)
  await expect.poll(() => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')).sort())).toEqual([...tableIds].sort())
  await select(page, 'Pogled rokov', 'done')
  await expectIds(page, ['done-old'])
  await expect(page.getByLabel('Število rokov overdue', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
  await expect(page.getByLabel('Število rokov done', { exact: true })).toHaveText('1')
  await readonly(page, writes)
})

test('calendar difference crosses the year boundary by one to seven full days', async ({ page }) => {
  const records: Task[] = [
    { ...examples[0], id: 'jan-1', dueDate: '2025-01-01' },
    { ...examples[1], id: 'jan-7', dueDate: '2025-01-07' },
    { ...examples[2], id: 'jan-8', dueDate: '2025-01-08', status: 'todo' },
  ]
  await mount(page, records)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2024-12-31')
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
  await expect(page.getByLabel('Število rokov later', { exact: true })).toHaveText('1')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['jan-1', 'jan-7'])
})

test('reference draft, selected group and filtered IDs survive switching views', async ({ page }) => {
  await mount(page)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-20')
  await select(page, 'Pogled rokov', 'overdue')
  await expectIds(page, ['web-01'])
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await board(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['web-01'])
  await table(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('overdue')
  await expectIds(page, ['web-01'])
})

test('project navigation and reload reset local date and deadline selection', async ({ page }) => {
  await mount(page)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-10-01')
  await select(page, 'Pogled rokov', 'done')
  await expect(page).toHaveURL(/#\/projects\/web$/)
  await expect(page).not.toHaveURL(/2026-10-01|overdue|today|week|later|done/)
  await expect(page.evaluate(() => localStorage.length)).resolves.toBe(0)
  await page.reload()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('all')
  await select(page, 'Pogled rokov', 'today')
  await project(page, 'launch')
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toHaveValue('all')
})

test('empty groups in non-empty project keep recovery controls available', async ({ page }) => {
  await mount(page, examples.filter((task) => task.status === 'done'))
  await expect(page.getByLabel('Število rokov overdue', { exact: true })).toHaveText('0')
  await expect(page.getByLabel('Število rokov today', { exact: true })).toHaveText('0')
  await select(page, 'Pogled rokov', 'overdue')
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.' })).toBeVisible()
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['web-03', 'web-06'])

})

test('empty projects have five zero counters and an empty state', async ({ page }) => {
  await mount(page, [])
  for (const group of ['overdue', 'today', 'week', 'later', 'done']) {
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText('0')
  }
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Pogled rokov' })).toBeEnabled()
})

test('390px layout keeps page width fixed while table and board can scroll internally', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page)
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).resolves.toBe(true)
  await expect(page.locator('.table-scroll').evaluate((node) => node.scrollWidth > node.clientWidth)).resolves.toBe(true)
  await board(page)
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).resolves.toBe(true)
  await expect(page.locator('.board-scroll').evaluate((node) => node.scrollWidth > node.clientWidth)).resolves.toBe(true)
})

test('deadline review and details stay read only with original calendar dates and text', async ({ page }) => {
  const writes = await mount(page)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-10-02')
  await select(page, 'Pogled rokov', 'done')
  await page.locator('[data-task-id="web-06"] a').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Prva vrstica\nDruga vrstica; čšž', { exact: true })).toBeVisible()
  await expect(dialog.locator('time')).toHaveAttribute('datetime', '2026-09-21')
  await page.keyboard.press('Escape')
  await expect(page.getByLabel('Število rokov done', { exact: true })).toHaveText('2')
  await readonly(page, writes)
})
