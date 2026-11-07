import { expect, test, type Page } from '@playwright/test'
import type { Task, TaskStatus } from '../../shared/types.ts'
import { deadlineGroup, plusDays } from '../../src/deadline.ts'

function task(id: string, dueDate: string, status: TaskStatus = 'todo', projectId = 'web'): Task {
  return { id, projectId, title: `Opravilo ${id}`, description: `Opis ${id}`, status, assignee: `Oseba ${id}`, dueDate }
}

const webTasks: Task[] = [
  task('web-01', '2026-09-20'),
  task('web-02', '2026-09-21', 'in_progress'),
  task('web-03', '2026-09-22'),
  task('web-04', '2026-09-28'),
  task('web-05', '2026-09-29', 'in_progress'),
  task('web-06', '2026-09-19', 'done'),
]

const launchTasks: Task[] = [task('launch-01', '2026-09-24', 'todo', 'launch')]

async function mount(page: Page, records: Task[] = webTasks) {
  await page.request.post('/__test/reset')
  const requests: string[] = []
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname
    if (path.startsWith('/api/') || path.startsWith('/__test/')) requests.push(`${request.method()} ${path}`)
  })
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/projects') return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
    if (path === '/api/projects/web/tasks') return route.fulfill({ json: records.filter((entry) => entry.projectId === 'web') })
    if (path === '/api/projects/launch/tasks') return route.fulfill({ json: records.filter((entry) => entry.projectId === 'launch') })
    return route.continue()
  })
  await page.goto('/#/projects/web')
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  return requests
}

async function ids(page: Page) {
  return page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
}

async function counters(page: Page) {
  return page.locator('[aria-label="Pregled stanj opravil"] strong').allTextContents()
}

test('R02–R05: calendar boundaries use UTC calendar dates', () => {
  expect(plusDays('2026-09-21', 7)).toBe('2026-09-28')
  expect(plusDays('2026-02-28', 1)).toBe('2026-03-01')
  expect(plusDays('2028-02-28', 1)).toBe('2028-02-29')
  expect(plusDays('2028-02-29', 1)).toBe('2028-03-01')
  const reference = '2026-02-28'
  expect(deadlineGroup(task('before', '2026-02-27'), reference)).toBe('overdue')
  expect(deadlineGroup(task('today', '2026-02-28'), reference)).toBe('today')
  expect(deadlineGroup(task('week-start', '2026-02-29'), reference)).toBe('week')
  expect(deadlineGroup(task('week-end', '2026-03-07'), reference)).toBe('week')
  expect(deadlineGroup(task('later', '2026-03-08'), reference)).toBe('later')
  expect(deadlineGroup(task('done', '2026-01-01', 'done'), reference)).toBe('done')
})

test('R01, R06, R07, R09: counters and both views stay synchronized', async ({ page }) => {
  const requests = await mount(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  const view = page.getByRole('combobox', { name: 'Pogled rokov', exact: true })
  await expect(view).toHaveValue('all')
  expect(await counters(page)).toEqual(['1', '1', '2', '1', '1'])
  expect(await ids(page)).toEqual(['web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06'])

  await view.selectOption('week')
  expect(await counters(page)).toEqual(['1', '1', '2', '1', '1'])
  expect(await ids(page)).toEqual(['web-03', 'web-04'])
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(view).toHaveValue('week')
  expect(await ids(page)).toEqual(['web-03', 'web-04'])
  expect(requests.filter((entry) => entry.startsWith('/__test/') || !entry.startsWith('GET /api/'))).toEqual([])
})

test('R08: empty date preserves the last valid calculation', async ({ page }) => {
  await mount(page)
  const view = page.getByRole('combobox', { name: 'Pogled rokov', exact: true })
  await view.selectOption('overdue')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-20')
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.', exact: true })).toBeVisible()
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum.')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-21')
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(await ids(page)).toEqual(['web-01'])
})

test('R10: project change and refresh reset local filter state', async ({ page }) => {
  await mount(page, [...webTasks, ...launchTasks])
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-22')
  const view = page.getByRole('combobox', { name: 'Pogled rokov', exact: true })
  await view.selectOption('today')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(view).toHaveValue('all')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova' }).click()
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-22')
  await view.selectOption('week')
  await page.reload()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(view).toHaveValue('all')
  expect(new URL(page.url()).searchParams.get('referenceDate')).toBeNull()
  expect(await page.evaluate(() => ({ ...localStorage, ...sessionStorage }))).toEqual({})
})

test('R11: empty project and empty selected group remain recoverable', async ({ page }) => {
  await mount(page, webTasks)
  const view = page.getByRole('combobox', { name: 'Pogled rokov', exact: true })
  await view.selectOption('later')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-10-01')
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.', exact: true })).toBeVisible()
  await view.selectOption('all')
  await expect(page.getByRole('table')).toBeVisible()
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil', exact: true })).toBeVisible()
  expect(await counters(page)).toEqual(['0', '0', '0', '0', '0'])
  await view.selectOption('overdue')
  expect(await counters(page)).toEqual(['0', '0', '0', '0', '0'])
})

test('R12: page stays within 390 pixels without writes', async ({ page }) => {
  const requests = await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.locator('[data-task-id="web-01"]')).toBeAttached()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  expect(requests.filter((entry) => entry.startsWith('/__test/') || !entry.startsWith('GET /api/'))).toEqual([])
})
