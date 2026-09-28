import { expect, test } from '@playwright/test'

const initialTasks = [
  { id: 'a', projectId: 'p', title: 'A', description: 'one', status: 'todo', assignee: 'Ana', dueDate: '2026-09-20' },
  { id: 'b', projectId: 'p', title: 'B', description: 'two', status: 'in_progress', assignee: 'Bojan', dueDate: '2026-09-21' },
  { id: 'c', projectId: 'p', title: 'C', description: 'three', status: 'todo', assignee: 'Cvetka', dueDate: '2026-09-22' },
  { id: 'd', projectId: 'p', title: 'D', description: 'four', status: 'done', assignee: 'Dora', dueDate: '2020-01-01' },
  { id: 'e', projectId: 'p', title: 'E', description: 'five', status: 'todo', assignee: 'Eva', dueDate: '2026-09-28' },
  { id: 'f', projectId: 'p', title: 'F', description: 'six', status: 'todo', assignee: 'Filip', dueDate: '2026-09-29' },
]

test.beforeEach(async ({ page }) => {
  await page.route('**/api/projects', (route) => route.fulfill({ json: [{ id: 'p', name: 'Projekt' }, { id: 'q', name: 'Drugi' }] }))
  await page.route('**/api/projects/p/tasks', (route) => route.fulfill({ json: initialTasks }))
  await page.route('**/api/projects/q/tasks', (route) => route.fulfill({ json: [] }))
})

test('classifies calendar deadlines and counts the whole project', async ({ page }) => {
  await page.goto('/#/projects/p')
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Število rokov overdue')).toHaveText('1')
  await expect(page.getByLabel('Število rokov today')).toHaveText('1')
  await expect(page.getByLabel('Število rokov week')).toHaveText('2')
  await expect(page.getByLabel('Število rokov later')).toHaveText('1')
  await expect(page.getByLabel('Število rokov done')).toHaveText('1')
  await page.getByLabel('Pogled rokov').selectOption('week')
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await expect(page.locator('[data-task-id="c"]')).toBeVisible()
  await page.getByLabel('Referenčni datum').fill('2026-09-22')
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await expect(page.getByLabel('Število rokov today')).toHaveText('1')
})

test('empty date retains the last result and table/board switches preserve controls', async ({ page }) => {
  let writes = 0
  page.on('request', (request) => { if (request.url().includes('/api/tasks/') && request.method() !== 'GET') writes += 1 })
  await page.goto('/#/projects/p')
  await page.getByLabel('Pogled rokov').selectOption('week')
  await page.getByLabel('Referenčni datum').fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('week')
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await page.getByLabel('Referenčni datum').fill('2026-09-22')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByLabel('Referenčni datum').fill('2026-09-23')
  await page.getByLabel('Pogled rokov').selectOption('today')
  await expect(page.getByText('Ni opravil v izbrani skupini.')).toBeVisible()
  await expect(page.getByLabel('Število rokov overdue')).toHaveText('3')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Drugi' }).click()
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('all')
  await page.reload()
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-09-21')
  expect(writes).toBe(0)
})

test('empty project has five zero counters and calendar arithmetic handles leap day', async ({ page }) => {
  await page.route('**/api/projects/p/tasks', (route) => route.fulfill({ json: [] }))
  await page.goto('/#/projects/p')
  for (const key of ['overdue', 'today', 'week', 'later', 'done']) {
    await expect(page.getByLabel(`Število rokov ${key}`)).toHaveText('0')
  }
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await page.route('**/api/projects/p/tasks', (route) => route.fulfill({ json: [
    { ...initialTasks[0], id: 'leap', dueDate: '2024-02-29' },
  ] }))
  await page.reload()
  await page.getByLabel('Referenčni datum').fill('2024-02-28')
  await page.getByLabel('Pogled rokov').selectOption('today')
  await expect(page.locator('[data-task-id]')).toHaveCount(0)
  await page.getByLabel('Pogled rokov').selectOption('week')
  await expect(page.locator('[data-task-id="leap"]')).toBeVisible()
})
