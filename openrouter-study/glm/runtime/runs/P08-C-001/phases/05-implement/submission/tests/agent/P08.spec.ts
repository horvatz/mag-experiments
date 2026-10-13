import { expect, test, type Page } from '@playwright/test'
import type { Task } from '../../shared/types.ts'

const webUrl = '**/api/projects/web/tasks'

function task(id: string, title: string, status: Task['status'], dueDate: string): Task {
  return {
    id,
    projectId: 'web',
    title,
    description: 'Razvojni primer za koledarski pregled.',
    status,
    assignee: 'Ana Novak',
    dueDate,
  }
}

async function installTasksRoute(page: Page) {
  let currentTasks: Task[] = []
  await page.route(webUrl, (route) => route.fulfill({ json: currentTasks }))
  return {
    set(tasks: Task[]) {
      currentTasks = tasks
    },
  }
}

async function tableIds(page: Page) {
  return page.locator('tbody [data-task-id]').evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.taskId))
}

async function expectCounts(page: Page, counts: Record<string, string>) {
  for (const [key, value] of Object.entries(counts)) {
    await expect(page.locator(`[aria-label="Število rokov ${key}"]`)).toHaveText(value)
  }
}

test.beforeEach(async ({ request }) => {
  const response = await request.post('/__test/reset')
  expect(response.ok()).toBeTruthy()
})

test('R01, R02, R03, R04 and R06 classify tasks around the explicit reference date', async ({ page }) => {
  const tasks = [
    task('t-overdue', 'Zapadlo', 'todo', '2026-09-20'),
    task('t-today', 'Danes', 'in_progress', '2026-09-21'),
    task('t-week-1', 'Prvi dan', 'todo', '2026-09-22'),
    task('t-week-7', 'Sedmi dan', 'todo', '2026-09-28'),
    task('t-later', 'Pozneje', 'todo', '2026-09-29'),
    task('t-done', 'Končano pred rokom', 'done', '2026-09-01'),
  ]
  const controller = await installTasksRoute(page)
  controller.set(tasks)

  await page.goto('/')
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('all')
  await expectCounts(page, { overdue: '1', today: '1', week: '2', later: '1', done: '1' })
  await expect(await tableIds(page)).toEqual(['t-overdue', 't-today', 't-week-1', 't-week-7', 't-later', 't-done'])
})

test('R02 and R05 use calendar dates across month, year and leap-day boundaries', async ({ page }) => {
  const controller = await installTasksRoute(page)

  controller.set([
    task('february-overdue', 'Pred februarjem', 'todo', '2026-02-27'),
    task('february-today', 'Danes', 'todo', '2026-02-28'),
    task('february-week-1', 'Marca', 'todo', '2026-03-01'),
    task('february-week-7', 'Sedmi dan', 'todo', '2026-03-07'),
    task('february-later', 'Pozneje', 'todo', '2026-03-08'),
    task('february-done', 'Končano', 'done', '2026-02-26'),
  ])
  await page.goto('/')
  await page.getByLabel('Referenčni datum').fill('2026-02-28')
  await expectCounts(page, { overdue: '1', today: '1', week: '2', later: '1', done: '1' })

  controller.set([
    task('leap-overdue', 'Pred prestopnim dnem', 'todo', '2028-02-27'),
    task('leap-today', 'Prestopni dan', 'todo', '2028-02-28'),
    task('leap-week-1', 'Dan po prestopnem', 'todo', '2028-02-29'),
    task('leap-week-7', 'Sedmi dan', 'todo', '2028-03-06'),
    task('leap-later', 'Pozneje', 'todo', '2028-03-07'),
    task('leap-done', 'Končano', 'done', '2028-02-26'),
  ])
  await page.reload()
  await page.getByLabel('Referenčni datum').fill('2028-02-28')
  await expectCounts(page, { overdue: '1', today: '1', week: '2', later: '1', done: '1' })

  controller.set([
    task('year-overdue', 'Pred novim letom', 'todo', '2026-12-30'),
    task('year-today', 'Silvestrovo', 'todo', '2026-12-31'),
    task('year-week-1', 'Novo leto', 'todo', '2027-01-01'),
    task('year-week-7', 'Sedmi dan', 'todo', '2027-01-07'),
    task('year-later', 'Pozneje', 'todo', '2027-01-08'),
    task('year-done', 'Končano', 'done', '2026-12-25'),
  ])
  await page.reload()
  await page.getByLabel('Referenčni datum').fill('2026-12-31')
  await expectCounts(page, { overdue: '1', today: '1', week: '2', later: '1', done: '1' })
})

test('R06 and R07 filter every group without changing counts or source order', async ({ page }) => {
  const tasks = [
    task('z-overdue', 'Zapadlo', 'todo', '2026-09-20'),
    task('z-today', 'Danes', 'todo', '2026-09-21'),
    task('z-week-1', 'Prvi dan', 'todo', '2026-09-22'),
    task('z-week-7', 'Sedmi dan', 'todo', '2026-09-28'),
    task('z-later', 'Pozneje', 'todo', '2026-09-29'),
    task('z-done', 'Končano', 'done', '2026-09-01'),
  ]
  const controller = await installTasksRoute(page)
  controller.set(tasks)
  await page.goto('/')
  const filter = page.getByLabel('Pogled rokov')
  const expected = {
    all: ['z-overdue', 'z-today', 'z-week-1', 'z-week-7', 'z-later', 'z-done'],
    overdue: ['z-overdue'],
    today: ['z-today'],
    week: ['z-week-1', 'z-week-7'],
    later: ['z-later'],
    done: ['z-done'],
  }
  const optionValues = await filter.locator('option').evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))
  expect(optionValues).toEqual(Object.keys(expected))

  for (const [value, ids] of Object.entries(expected)) {
    await filter.selectOption(value)
    await expect(await tableIds(page)).toEqual(ids)
    await expectCounts(page, { overdue: '1', today: '1', week: '2', later: '1', done: '1' })
  }
})

test('R08 recalculates immediately and keeps the last valid calculation for an empty date', async ({ page }) => {
  const controller = await installTasksRoute(page)
  controller.set([
    task('october-week-1', 'Drugi oktober', 'todo', '2026-10-02'),
    task('october-week-2', 'Tretji oktober', 'todo', '2026-10-03'),
  ])
  await page.goto('/')
  await expect(page.locator('[data-task-id]').first()).toBeVisible()
  await page.getByLabel('Pogled rokov').selectOption('week')
  await page.getByLabel('Referenčni datum').fill('2026-10-01')
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-10-01')
  await expect(page.locator("[data-task-id='october-week-1']")).toBeVisible()
  await expect(await tableIds(page)).toEqual(['october-week-1', 'october-week-2'])

  await page.getByLabel('Referenčni datum').fill('')
  await expect(page.getByRole('alert')).toHaveText('Vnesi veljaven referenčni datum')
  await expect(await tableIds(page)).toEqual(['october-week-1', 'october-week-2'])

  await page.getByLabel('Referenčni datum').fill('2026-10-02')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(await tableIds(page)).toEqual(['october-week-2'])
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('week')
})

test('R09 keeps the same filtered IDs in table and board and preserves local state', async ({ page }) => {
  const tasks = [
    task('s-week-1', 'Prvi dan', 'todo', '2026-10-02'),
    task('s-week-7', 'Sedmi dan', 'todo', '2026-10-08'),
    task('s-done', 'Končano', 'done', '2026-09-01'),
  ]
  const controller = await installTasksRoute(page)
  controller.set(tasks)
  await page.goto('/')
  await expect(page.locator('[data-task-id]').first()).toBeVisible()
  await page.getByLabel('Referenčni datum').fill('2026-10-01')
  await page.getByLabel('Pogled rokov').selectOption('week')
  await expect(page.locator("[data-task-id='s-week-1']")).toBeVisible()
  await expect(page.locator("[data-task-id='s-week-7']")).toBeVisible()
  await expect(await tableIds(page)).toEqual(['s-week-1', 's-week-7'])

  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  const boardIds = await page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.taskId))
  expect(boardIds).toEqual(['s-week-1', 's-week-7'])
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-10-01')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('week')

  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect(page.locator("tbody [data-task-id='s-week-1']")).toBeVisible()
  await expect(await tableIds(page)).toEqual(['s-week-1', 's-week-7'])
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-10-01')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('week')
})

test('R10 resets date and group on project change and refresh without storage or URL state', async ({ page }) => {
  await installTasksRoute(page)
  await page.goto('/#/projects/web?view=board')
  await page.getByLabel('Referenčni datum').fill('2026-10-01')
  await page.getByLabel('Pogled rokov').selectOption('later')

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('all')
  expect(page.url()).not.toContain('referenceDate')
  expect(page.url()).not.toContain('dueDateFilter')
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0)

  await page.goto('/#/projects/web')
  await page.getByLabel('Referenčni datum').fill('2026-10-01')
  await page.getByLabel('Pogled rokov').selectOption('later')
  await page.reload()
  await expect(page.getByLabel('Referenčni datum')).toHaveValue('2026-09-21')
  await expect(page.getByLabel('Pogled rokov')).toHaveValue('all')
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0)
})

test('R11 shows five zeroes for an empty project and an actionable empty group', async ({ page }) => {
  const controller = await installTasksRoute(page)
  controller.set([])
  await page.goto('/')
  await expectCounts(page, { overdue: '0', today: '0', week: '0', later: '0', done: '0' })
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()

  controller.set([task('only-overdue', 'Zapadlo', 'todo', '2026-09-20')])
  await page.reload()
  await page.getByLabel('Pogled rokov').selectOption('today')
  await expect(page.getByRole('heading', { name: 'Ni opravil v izbrani skupini.' })).toBeVisible()
  await page.getByLabel('Pogled rokov').selectOption('all')
  await expect(page.locator("[data-task-id='only-overdue']")).toBeVisible()
})

test('R12 preserves accessibility and Folio layout at 390 pixels without write requests', async ({ page }) => {
  const writes: string[] = []
  page.on('request', (request) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method() + ' ' + request.url())
  })
  const controller = await installTasksRoute(page)
  controller.set([task('layout-task', 'Razpored', 'todo', '2026-09-22')])
  await page.goto('/')
  await expect(page.getByLabel('Referenčni datum')).toBeVisible()
  await expect(page.getByLabel('Pogled rokov')).toBeVisible()
  await expect(page.locator('[aria-label="Pregled stanj opravil"]')).toBeVisible()
  await page.getByLabel('Pogled rokov').selectOption('week')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil', exact: true })).toBeVisible()
  await expect(page.locator('[data-task-id]').first()).toBeVisible()
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('[data-task-id]').first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
  expect(writes).toEqual([])
})
