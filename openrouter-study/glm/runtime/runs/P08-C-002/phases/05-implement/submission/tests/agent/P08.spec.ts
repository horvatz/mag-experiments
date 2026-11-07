import { expect, test, type Page } from '@playwright/test'
import type { Task } from '../../shared/types.ts'

type ExampleTask = Task

const makeTask = (id: string, values: Partial<ExampleTask> = {}): ExampleTask => ({
  id,
  projectId: 'web',
  title: `Opravilo ${id}`,
  description: `Opis ${id}`,
  status: 'todo',
  assignee: 'Ana Novak',
  dueDate: '2026-09-21',
  ...values,
})

const examples: ExampleTask[] = [
  makeTask('web-01', { status: 'in_progress', dueDate: '2026-09-20' }),
  makeTask('web-02', { title: 'Pregled vsebine', assignee: 'Luka Kovač', dueDate: '2026-09-22' }),
  makeTask('web-03', { status: 'done', dueDate: '2026-09-16' }),
  makeTask('web-04', { title: 'Pregled vsebine', assignee: 'Maja Zupan', dueDate: '2026-09-28' }),
  makeTask('web-05', { status: 'in_progress', dueDate: '2026-09-29' }),
  makeTask('web-06', { status: 'done', dueDate: '2026-09-21' }),
  makeTask('web-07', { status: 'todo', dueDate: '2026-09-21' }),
  makeTask('web-08', { status: 'todo', dueDate: '2026-09-30' }),
  makeTask('web-09', { status: 'done', dueDate: '2026-10-02' }),
]

async function mount(page: Page, records: ExampleTask[] = examples, hash = '#/projects/web') {
  const writes: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      writes.push(`${request.method()} ${request.url()}`)
    }
  })

  await page.route('**/api/**', (route) => {
    const request = route.request()
    if (request.method() !== 'GET') return route.continue()
    const path = new URL(request.url()).pathname
    if (path === '/api/projects') {
      return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
    }

    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) {
      return route.fulfill({ json: records.filter((task) => task.projectId === decodeURIComponent(project[1])) })
    }

    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const task = records.find((entry) => entry.id === decodeURIComponent(detail[1]))
      return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }

    return route.continue()
  })

  await page.goto(`/${hash}`)
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  return writes
}

const ids = (page: Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))

async function expectIds(page: Page, expected: string[]) {
  await expect.poll(async () => ids(page)).toEqual(expected)
}

async function selectGroup(page: Page, value: string) {
  await page.getByRole('combobox', { name: 'Pogled rokov', exact: true }).selectOption(value)
}

async function expectCounts(page: Page, values: number[]) {
  for (const [index, value] of values.entries()) {
    const group = ['overdue', 'today', 'week', 'later', 'done'][index]
    await expect(page.getByLabel(`Število rokov ${group}`, { exact: true })).toHaveText(String(value))
  }
}

test('R01 to R06: fixed reference date, complete groups and stable counters', async ({ page }) => {
  await mount(page)
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  await expectIds(page, examples.map((task) => task.id))
  await expectCounts(page, [1, 1, 2, 2, 3])

  for (const value of ['overdue', 'today', 'week', 'later', 'done']) {
    await selectGroup(page, value)
    await expectCounts(page, [1, 1, 2, 2, 3])
  }
})

test('R03 to R05: strict calendar boundaries', async ({ page }) => {
  await mount(page, [
    makeTask('before', { dueDate: '2026-09-20' }),
    makeTask('same', { dueDate: '2026-09-21' }),
    makeTask('first-week', { dueDate: '2026-09-22' }),
    makeTask('last-week', { dueDate: '2026-09-28' }),
    makeTask('after', { dueDate: '2026-09-29' }),
    makeTask('month-cross', { dueDate: '2026-10-01' }),
    makeTask('year-cross', { dueDate: '2027-01-01' }),
    makeTask('leap-day', { dueDate: '2024-02-29' }),
    makeTask('done-old', { status: 'done', dueDate: '2026-09-18' }),
    makeTask('done-later', { status: 'done', dueDate: '2027-01-01' }),
  ])

  await selectGroup(page, 'week')
  await expectIds(page, ['first-week', 'last-week'])

  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-30')
  await selectGroup(page, 'week')
  await expectIds(page, ['month-cross'])

  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-12-31')
  await selectGroup(page, 'week')
  await expectIds(page, ['year-cross'])

  await page.getByLabel('Referenčni datum', { exact: true }).fill('2024-02-28')
  await selectGroup(page, 'week')
  await expectIds(page, ['leap-day'])

  await page.getByLabel('Referenčni datum', { exact: true }).fill('2024-02-29')
  await selectGroup(page, 'today')
  await expectIds(page, ['leap-day'])

  await selectGroup(page, 'done')
  await expectIds(page, ['done-old', 'done-later'])
})

test('R07 to R09: filters preserve order and both views share state', async ({ page }) => {
  const writes = await mount(page)
  await selectGroup(page, 'overdue')
  await expectIds(page, ['web-01'])

  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expectIds(page, ['web-01'])
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('overdue')

  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-22')
  await expectIds(page, ['web-07', 'web-01'])
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expectIds(page, ['web-01', 'web-07'])
  expect(writes).toEqual([])
})

test('R08 and R10: empty input, reset and no persistent filter', async ({ page }) => {
  await mount(page)
  await selectGroup(page, 'overdue')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-22')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('')
  await expect(page.getByRole('alert')).toContainText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['web-01', 'web-07'])
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('overdue')

  await page.reload()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe('{}')
  expect(new URL(page.url()).hash).not.toContain('reference')
  expect(new URL(page.url()).hash).not.toContain('due')
})

test('R10 and R11: project switch resets state and empty projects show zero', async ({ page }) => {
  await mount(page)
  await selectGroup(page, 'done')
  await page.getByLabel('Referenčni datum', { exact: true }).fill('2026-09-22')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(page.getByLabel('Referenčni datum', { exact: true })).toHaveValue('2026-09-21')
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toHaveValue('all')

  await page.route('**/api/projects/web/tasks', (route) => route.fulfill({ json: [] }))
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova' }).click()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expectCounts(page, [0, 0, 0, 0, 0])
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
})

test('R12: no writes, details remain readable and layout stays within 390 pixels', async ({ page }) => {
  const writes = await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('combobox', { name: 'Pogled rokov', exact: true })).toBeVisible()
  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Pregled vsebine' })).toBeVisible()
  await expect(page.getByRole('dialog').getByText('Luka Kovač', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(writes).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
