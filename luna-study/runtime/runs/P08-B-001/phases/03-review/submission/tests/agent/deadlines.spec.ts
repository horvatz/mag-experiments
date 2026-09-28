import { test, expect, mount, makeTask, select, expectIds, board, table, project } from '../development/helpers.ts'

test('calendar groups include leap day and the seventh day in source order', async ({ page }) => {
  const tasks = [
    makeTask('p-1', { dueDate: '2024-02-27' }),
    makeTask('p-2', { dueDate: '2024-02-28' }),
    makeTask('p-3', { dueDate: '2024-02-29' }),
    makeTask('p-4', { dueDate: '2024-03-06' }),
    makeTask('p-5', { dueDate: '2024-03-07' }),
    makeTask('p-6', { dueDate: '2024-02-01', status: 'done' }),
  ]
  await mount(page, tasks)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2024-02-28')
  await expect(page.getByLabel('Število rokov overdue', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov today', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov week', { exact: true })).toHaveText('2')
  await expect(page.getByLabel('Število rokov later', { exact: true })).toHaveText('1')
  await expect(page.getByLabel('Število rokov done', { exact: true })).toHaveText('1')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['p-3', 'p-4'])
  await select(page, 'Pogled rokov', 'done')
  await expectIds(page, ['p-6'])
})

test('empty groups remain switchable and project changes reset local controls', async ({ page }) => {
  await mount(page, [makeTask('only-task', { dueDate: '2026-09-25' })])
  const originalHash = await page.evaluate(() => window.location.hash)
  await select(page, 'Pogled rokov', 'overdue')
  await expect(page.getByRole('status')).toHaveText('Ni opravil v izbrani skupini.')
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
  await expect(await page.evaluate(() => window.location.hash)).toBe(originalHash)
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-23')
  await board(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-23')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('overdue')
  await select(page, 'Pogled rokov', 'week')
  await expectIds(page, ['only-task'])
  await table(page)
  await expectIds(page, ['only-task'])
  await select(page, 'Pogled rokov', 'all')
  await expectIds(page, ['only-task'])
  await page.reload()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  await expect(await page.evaluate(() => window.location.hash)).toBe('#/projects/web')
  await project(page, 'launch')
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  for (const key of ['overdue', 'today', 'week', 'later', 'done']) {
    await expect(page.getByLabel(`Število rokov ${key}`, { exact: true })).toHaveText('0')
  }
})
