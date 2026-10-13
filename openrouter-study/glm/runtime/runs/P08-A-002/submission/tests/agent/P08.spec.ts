import { expect, test, type Page } from '@playwright/test'
import type { Task } from '../../shared/types.ts'

const project = { id: 'web', name: 'Spletna prenova' }
const otherProject = { id: 'launch', name: 'Jesenska kampanja' }

function task(id: string, dueDate: string, status: Task['status'] = 'todo', projectId = 'web'): Task {
  return { id, projectId, title: 'Opravilo ' + id, description: 'Opis', status, assignee: 'Živa Kovač', dueDate }
}

const records: Task[] = [
  task('overdue-01', '2026-01-01'),
  task('today-01', '2026-09-21'),
  task('week-01', '2026-09-28'),
  task('later-01', '2026-10-01'),
  task('done-early', '2025-01-01', 'done'),
  task('done-late', '2027-01-01', 'done'),
  task('month-boundary', '2026-02-01'),
  task('leap-boundary', '2026-03-01'),
  task('year-boundary', '2027-01-01'),
]

async function mount(page: Page) {
  await page.request.post('/__test/reset')
  const writes: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method() + ' ' + request.url())
  })
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname
    if (route.request().method() !== 'GET') return route.continue()
    if (path === '/api/projects') return route.fulfill({ json: [project, otherProject] })
    if (path === '/api/projects/web/tasks') return route.fulfill({ json: records })
    if (path === '/api/projects/launch/tasks') return route.fulfill({ json: [] })
    return route.continue()
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/projects/web')
  await expect(page.getByRole('heading', { name: project.name, exact: true })).toBeVisible()
  return writes
}

async function ids(page: Page) {
  return page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
}

async function counters(page: Page) {
  const groups = ['overdue', 'today', 'week', 'later', 'done',
  ] as const
  return Promise.all(groups.map(async (group) => page.getByLabel('Število rokov ' + group, { exact: true }).textContent()))
}

test('P08-A: koledarske meje, števci, preklop in bralnost', async ({ page }) => {
  const writes = await mount(page)
  const date = page.getByLabel('Referenčni datum', { exact: true })
  const filter = page.getByLabel('Pogled rokov', { exact: true })

  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await expect.poll(() => counters(page)).toEqual(['3', '1', '1', '2', '2'])

  await filter.selectOption('overdue')
  await expect.poll(() => ids(page)).toEqual(['overdue-01', 'month-boundary', 'leap-boundary'])
  await expect.poll(() => counters(page)).toEqual(['3', '1', '1', '2', '2'])

  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect.poll(() => ids(page)).toEqual(['overdue-01', 'month-boundary', 'leap-boundary'])
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('overdue')

  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect.poll(() => ids(page)).toEqual(['overdue-01', 'month-boundary', 'leap-boundary'])

  const boundaries = [
    { reference: '2026-01-25', expected: 'month-boundary' },
    { reference: '2026-02-22', expected: 'leap-boundary' },
    { reference: '2026-12-25', expected: 'year-boundary' },
  ]
  for (const { reference, expected } of boundaries) {
    await date.fill(reference)
    await filter.selectOption('week')
    await expect.poll(() => ids(page)).toEqual([expected])
    await expect(page.getByRole('alert')).toHaveCount(0)
  }

  await date.fill('')
  await expect(page.getByRole('alert')).toContainText('Vnesi veljaven referenčni datum.')
  await expect.poll(() => ids(page)).toEqual(['year-boundary'])
  await date.fill('2026-09-22')
  await filter.selectOption('today')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: otherProject.name, exact: true }).click()
  await expect(page.getByRole('heading', { name: otherProject.name, exact: true })).toBeVisible()
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  await expect.poll(() => counters(page)).toEqual(['0', '0', '0', '0', '0'])
  await filter.selectOption('overdue')

  await page.reload()
  await expect(date).toHaveValue('2026-09-21')
  await expect(filter).toHaveValue('all')
  expect(await page.evaluate(() => window.location.href)).not.toContain('due')
  expect(await page.evaluate(() => window.localStorage.length + window.sessionStorage.length)).toBe(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  expect(writes).toEqual([])
})
