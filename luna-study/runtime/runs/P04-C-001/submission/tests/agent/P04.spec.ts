import { expect, test } from '@playwright/test'
import { board, details, examples, makeTask, mount, project, select, webIds } from '../development/helpers.ts'
import { DEFAULT_SORT_SETTINGS, sortTasks, type TaskSortSettings } from '../../src/taskSorting.ts'

const settings = (changes: Partial<TaskSortSettings> = {}): TaskSortSettings => ({ ...DEFAULT_SORT_SETTINGS, ...changes })

test('P04 comparator normalizes text, orders dates/statuses, and preserves ties', () => {
  const text = [
    makeTask('accent', { title: 'Éclair' }),
    makeTask('plain', { title: 'eclair' }),
    makeTask('task2', { title: 'Task 2' }),
    makeTask('task10', { title: 'Task 10' }),
  ]
  expect(sortTasks(text, settings({ primaryKey: 'title' })).map((task) => task.id)).toEqual(['accent', 'plain', 'task10', 'task2'])

  const statusDate = [
    makeTask('todo-late', { status: 'todo', dueDate: '2026-09-22' }),
    makeTask('todo-early', { status: 'todo', dueDate: '2026-09-20' }),
    makeTask('doing', { status: 'in_progress' }),
    makeTask('done', { status: 'done' }),
  ]
  expect(sortTasks(statusDate, settings({ primaryKey: 'status', secondaryKey: 'dueDate', secondaryDirection: 'desc' })).map((task) => task.id))
    .toEqual(['todo-late', 'todo-early', 'doing', 'done'])
  expect(sortTasks(text, settings({ primaryKey: 'title', primaryDirection: 'desc', secondaryKey: 'title', secondaryDirection: 'desc' })).map((task) => task.id))
    .toEqual(['task2', 'task10', 'accent', 'plain'])
  expect(sortTasks(text, settings({ primaryKey: 'original', primaryDirection: 'desc', secondaryKey: 'dueDate', secondaryDirection: 'desc' })).map((task) => task.id))
    .toEqual(['accent', 'plain', 'task2', 'task10'])
})

test('P04 empty and single-task inputs accept every key and direction', () => {
  const primaryKeys: TaskSortSettings['primaryKey'][] = ['original', 'title', 'assignee', 'status', 'dueDate']
  const secondaryKeys: TaskSortSettings['secondaryKey'][] = ['none', 'title', 'assignee', 'status', 'dueDate']
  const single = makeTask('only')
  for (const primaryKey of primaryKeys) for (const primaryDirection of ['asc', 'desc'] as const) {
    for (const secondaryKey of secondaryKeys) for (const secondaryDirection of ['asc', 'desc'] as const) {
      const selected = settings({ primaryKey, primaryDirection, secondaryKey, secondaryDirection })
      expect(sortTasks([], selected)).toEqual([])
      expect(sortTasks([single], selected)).toEqual([single])
    }
  }
})

test('P04 controls sort both views and reset without changing counts or writing', async ({ page }) => {
  const writes: string[] = await mount(page)
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('asc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('asc')
  await select(page, 'Primarni ključ', 'title')
  await expect(page.locator('[data-task-id]')).toHaveCount(8)
  await expect(page.locator('[data-task-id]').first()).toHaveAttribute('data-task-id', 'web-07')
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['4', '2', '2'])
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await expect(page.getByRole('heading', { name: 'Pripravljeno' })).toBeVisible()
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
  expect(writes).toEqual([])
})

test('P04 settings persist through view/details and reset on project change and refresh', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'assignee')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await details(page, 'web-03')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('assignee')
  await expect(page.getByRole('combobox', { name: 'Primarna smer' })).toHaveValue('desc')
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('status')
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer' })).toHaveValue('desc')
  await project(page, 'launch')
  await expect(page.getByRole('combobox', { name: 'Primarni ključ' })).toHaveValue('original')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ' })).toHaveValue('none')
})

test('P04 IDs still open the matching details and narrow layout stays within viewport', async ({ page }) => {
  const writes: string[] = await mount(page)
  await expect(page.locator('[data-task-id]')).toHaveCount(webIds(examples).length)
  await details(page, 'web-02')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  expect(writes).toEqual([])
})
