import { expect, test, type Page } from '@playwright/test'
import type { Project, Task } from '../../shared/types.ts'

test.use({ timezoneId: 'America/Los_Angeles' })

const projects: Project[] = [
  { id: 'web', name: 'Spletna prenova' },
  { id: 'launch', name: 'Jesenska kampanja' },
]

function task(id: string, dueDate: string, status: Task['status'] = 'todo'): Task {
  return { id, projectId: 'web', title: `Opravilo ${id}`, description: `Opis ${id}`, status, assignee: 'Ana Novak', dueDate }
}

async function mockApi(page: Page, webTasks: Task[], launchTasks: Task[] = []) {
  await page.route('**/api/projects', (route) => route.fulfill({ json: projects }))
  await page.route('**/api/projects/*/tasks', (route) => {
    const projectId = new URL(route.request().url()).pathname.split('/').at(-2)
    const entries = projectId === 'launch' ? launchTasks : webTasks
    return route.fulfill({ json: entries })
  })
  await page.route('**/api/tasks/*', (route) => {
    const id = new URL(route.request().url()).pathname.split('/').at(-1)
    const entry = [...webTasks, ...launchTasks].find((item) => item.id === id)
    return entry ? route.fulfill({ json: entry }) : route.fulfill({ status: 404, json: { message: 'Ni najdeno' } })
  })
}

const taskIds = (page: Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))

test('fixed reference date classifies every task and counts the whole project', async ({ page }) => {
  const entries = [
    task('late-week', '2026-09-28'), task('overdue', '2026-09-20'),
    task('done-old', '2026-09-01', 'done'), task('today', '2026-09-21'),
    task('week', '2026-09-22'), task('later', '2026-09-29'),
  ]
  await mockApi(page, entries)
  await page.goto('/#/projects/web')
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('all')
  for (const [key, count] of Object.entries({ overdue: 1, today: 1, week: 2, later: 1, done: 1 })) {
    await expect(page.locator(`[aria-label="Število rokov ${key}"]`)).toHaveText(String(count))
  }
  const expected = { all: ['late-week', 'overdue', 'done-old', 'today', 'week', 'later'], overdue: ['overdue'], today: ['today'], week: ['late-week', 'week'], later: ['later'], done: ['done-old'] }
  const counterValues = await Promise.all(['overdue', 'today', 'week', 'later', 'done'].map((key) => page.locator(`[aria-label="Število rokov ${key}"]`).textContent()))
  for (const [group, ids] of Object.entries(expected)) {
    await page.getByLabel('Pogled rokov').selectOption(group)
    expect(await taskIds(page)).toEqual(ids)
    expect(await Promise.all(['overdue', 'today', 'week', 'later', 'done'].map((key) => page.locator(`[aria-label="Število rokov ${key}"]`).textContent()))).toEqual(counterValues)
  }
  await page.getByLabel('Pogled rokov').selectOption('week')
  await page.locator('[data-task-id="week"] a').click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Opravilo week' })).toBeVisible()
  await expect(page.getByRole('dialog').locator('time')).toHaveAttribute('datetime', '2026-09-22')
  await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await page.getByLabel('Pogled rokov').selectOption('done')
  expect(await taskIds(page)).toEqual(['done-old'])
})

test('calendar arithmetic, empty date recovery, and both views preserve filter state', async ({ page }) => {
  const entries = [task('edge-week', '2024-03-03'), task('edge-later', '2024-03-04'), task('edge-done', '2024-02-24', 'done')]
  await mockApi(page, entries)
  await page.goto('/#/projects/web')
  await page.getByLabel('Referenčni datum').fill('2024-02-25')
  await page.getByLabel('Pogled rokov').selectOption('week')
  expect(await taskIds(page)).toEqual(['edge-week'])
  const before = await page.locator('[aria-label^="Število rokov "]').allTextContents()
  await page.getByLabel('Referenčni datum').fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  expect(await taskIds(page)).toEqual(['edge-week'])
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('week')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('week')
  expect(await taskIds(page)).toEqual(['edge-week'])
  await page.getByLabel('Referenčni datum').fill('2024-02-25')
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(await taskIds(page)).toEqual(['edge-week'])
  expect(before).toHaveLength(5)
  await page.getByLabel('Referenčni datum').fill('2026-12-29')
  await page.getByLabel('Pogled rokov').selectOption('all')
  // End of year and leap-day transitions use the same date-only calculation.
  const yearTasks = [task('year-week', '2027-01-05'), task('year-later', '2027-01-06')]
  await page.route('**/api/projects/web/tasks', (route) => route.fulfill({ json: yearTasks }))
  await page.reload()
  await page.getByLabel('Referenčni datum').fill('2026-12-29')
  await page.getByLabel('Pogled rokov').selectOption('week')
  expect(await taskIds(page)).toEqual(['year-week'])
})

test('empty states, project reset, no task writes or stored filter, and narrow layout', async ({ page }) => {
  const entries = [task('one', '2026-09-22')]
  await mockApi(page, entries, [])
  let writes = 0
  page.on('request', (request) => { if (request.method() !== 'GET') writes += 1 })
  await page.goto('/#/projects/web')
  await page.getByLabel('Pogled rokov').selectOption('done')
  await expect(page.getByText('Ni opravil v izbrani skupini.')).toBeVisible()
  await page.getByLabel('Pogled rokov').selectOption('all')
  await page.getByLabel('Referenčni datum').fill('2026-09-25')
  await page.getByLabel('Pogled rokov').selectOption('overdue')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('all')
  await page.reload()
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('all')
  for (const key of ['overdue', 'today', 'week', 'later', 'done']) await expect(page.locator(`[aria-label="Število rokov ${key}"]`)).toHaveText('0')
  expect(await page.evaluate(() => ({ hash: location.hash, storage: localStorage.length }))).toEqual({ hash: '#/projects/launch', storage: 0 })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
  expect(writes).toBe(0)
})
