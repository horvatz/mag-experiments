import { expect, test, type Page } from '@playwright/test'
import type { Task } from '../../shared/types.ts'

type TestTask = Task & { projectId: string }

const makeTask = (id: string, projectId: string, values: Partial<TestTask> = {}): TestTask => ({
  id,
  projectId,
  title: `Opravilo ${id}`,
  description: `Opis ${id}`,
  status: 'todo',
  assignee: 'Ana Novak',
  dueDate: '2026-09-20',
  ...values,
})

const examples: TestTask[] = [
  makeTask('web-01', 'web', { status: 'in_progress', dueDate: '2026-09-18' }),
  makeTask('web-02', 'web', { assignee: 'Luka Kovač', dueDate: '2026-09-22' }),
  makeTask('web-03', 'web', { status: 'done', dueDate: '2026-09-16' }),
  makeTask('web-04', 'web', { assignee: 'Maja Zupan', dueDate: '2026-10-01' }),
  makeTask('launch-01', 'launch', { dueDate: '2026-09-24' }),
  makeTask('launch-02', 'launch', { status: 'done', assignee: 'Luka Kovač', dueDate: '2026-09-25' }),
]

const projects = [
  { id: 'web', name: 'Spletna prenova' },
  { id: 'launch', name: 'Jesenska kampanja' },
]

async function mount(page: Page, records: TestTask[] = examples, hash = '#/projects/web') {
  await page.request.post('/__test/reset')
  const writes: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(`${request.method()} ${url.pathname}`)
  })
  await page.route('**/api/**', (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== 'GET') return route.continue()
    if (path === '/api/projects') return route.fulfill({ json: projects })

    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) return route.fulfill({ json: records.filter((task) => task.projectId === decodeURIComponent(project[1])) })

    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const task = records.find((entry) => entry.id === decodeURIComponent(detail[1]))
      return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }
    return route.continue()
  })
  await page.goto('/' + hash)
  await expect(page.getByRole('heading', { name: hash.includes('/launch') ? 'Jesenska kampanja' : 'Spletna prenova', exact: true })).toBeVisible()
  return writes
}

const ids = (page: Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
const expectIds = async (page: Page, expected: string[]) => {
  await expect.poll(async () => {
    const result = await ids(page)
    return result.filter(Boolean)
  }).toEqual(expected)
}
const select = (page: Page, name: string, value: string) => page.getByRole('combobox', { name, exact: true }).selectOption(value)
const expectSettings = async (page: Page, values: string[]) => {
  await expect(page.getByRole('combobox', { name: 'Primarni ključ', exact: true })).toHaveValue(values[0])
  await expect(page.getByRole('combobox', { name: 'Primarna smer', exact: true })).toHaveValue(values[1])
  await expect(page.getByRole('combobox', { name: 'Sekundarni ključ', exact: true })).toHaveValue(values[2])
  await expect(page.getByRole('combobox', { name: 'Sekundarna smer', exact: true })).toHaveValue(values[3])
}
const board = async (page: Page) => {
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
}
const columnIds = async (page: Page, name: string, expected: string[]) => {
  await expect.poll(() => page.getByRole('region', { name, exact: true }).locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))).toEqual(expected)
}

test('R01: default order and controls', async ({ page }) => {
  const records = [
    makeTask('web-02', 'web'),
    makeTask('web-01', 'web'),
    makeTask('web-03', 'web'),
    makeTask('launch-01', 'launch'),
  ]
  await mount(page, records)
  await expectIds(page, ['web-02', 'web-01', 'web-03'])
  await expectSettings(page, ['original', 'asc', 'none', 'asc'])
})

test('R02: normalized UTF-16 text order', async ({ page }) => {
  const records = [
    makeTask('web-01', 'web', { title: '10', assignee: 'Éclair' }),
    makeTask('web-02', 'web', { title: '9', assignee: 'Eclair' }),
    makeTask('web-03', 'web', { title: 'Éclair', assignee: 'Zeta' }),
    makeTask('web-04', 'web', { title: 'Eclair', assignee: '10' }),
    makeTask('web-05', 'web', { title: 'Zeta', assignee: '9' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await expectIds(page, ['web-01', 'web-02', 'web-03', 'web-04', 'web-05'])
  await select(page, 'Primarni ključ', 'assignee')
  await expectIds(page, ['web-04', 'web-05', 'web-01', 'web-02', 'web-03'])
})

test('R03: status and chronological date comparators', async ({ page }) => {
  const records = [
    makeTask('web-01', 'web', { status: 'done', dueDate: '2025-12-31' }),
    makeTask('web-02', 'web', { status: 'in_progress', dueDate: '2027-01-01' }),
    makeTask('web-03', 'web', { dueDate: '2026-11-30' }),
    makeTask('web-04', 'web', { status: 'done', dueDate: '2026-10-31' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await expectIds(page, ['web-03', 'web-02', 'web-01', 'web-04'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['web-01', 'web-04', 'web-02', 'web-03'])
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'asc')
  await expectIds(page, ['web-01', 'web-04', 'web-03', 'web-02'])
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['web-02', 'web-03', 'web-04', 'web-01'])
})

test('R04: descending direction does not reverse ties', async ({ page }) => {
  const records = [
    makeTask('web-01', 'web', { title: 'B' }),
    makeTask('web-02', 'web', { title: 'A' }),
    makeTask('web-03', 'web', { title: 'B' }),
    makeTask('web-04', 'web', { title: 'C' }),
    makeTask('web-05', 'web', { title: 'A' }),
    makeTask('web-06', 'web', { title: 'C' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await expectIds(page, ['web-04', 'web-06', 'web-01', 'web-03', 'web-02', 'web-05'])
})

test('R05: independent secondary direction', async ({ page }) => {
  const records = [
    makeTask('web-01', 'web', { status: 'todo', dueDate: '2026-01-02', title: 'B' }),
    makeTask('web-02', 'web', { status: 'todo', dueDate: '2026-01-03', title: 'A' }),
    makeTask('web-03', 'web', { status: 'in_progress', dueDate: '2026-01-01', title: 'Z' }),
    makeTask('web-04', 'web', { status: 'in_progress', dueDate: '2026-01-04', title: 'Y' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-02', 'web-01', 'web-04', 'web-03'])
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'asc')
  await expectIds(page, ['web-02', 'web-01', 'web-04', 'web-03'])
})

test('R06: duplicate keys and original remain stable', async ({ page }) => {
  const records = [
    makeTask('web-01', 'web', { title: 'A' }),
    makeTask('web-02', 'web', { title: 'B' }),
    makeTask('web-03', 'web', { title: 'A' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-02', 'web-01', 'web-03'])
  await select(page, 'Primarni ključ', 'original')
  await select(page, 'Sekundarni ključ', 'assignee')
  await expectIds(page, ['web-01', 'web-02', 'web-03'])
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-01', 'web-02', 'web-03'])
})

test('R07: board columns keep sorted relative order', async ({ page }) => {
  const records = [
    makeTask('web-01', 'web', { status: 'todo', dueDate: '2026-01-03' }),
    makeTask('web-02', 'web', { status: 'todo', dueDate: '2026-01-01' }),
    makeTask('web-03', 'web', { status: 'in_progress', dueDate: '2026-01-02' }),
    makeTask('web-04', 'web', { status: 'in_progress', dueDate: '2026-01-04' }),
    makeTask('web-05', 'web', { status: 'done', dueDate: '2026-01-05' }),
    makeTask('web-06', 'web', { status: 'done', dueDate: '2026-01-06' }),
  ]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await board(page)
  await columnIds(page, 'Pripravljeno', ['web-01', 'web-02'])
  await columnIds(page, 'V delu', ['web-04', 'web-03'])
  await columnIds(page, 'Končano', ['web-06', 'web-05'])
})

test('R08: settings survive view and detail navigation', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')
  await board(page)
  await expectSettings(page, ['status', 'desc', 'title', 'desc'])
  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expectSettings(page, ['status', 'desc', 'title', 'desc'])
})

test('R09: project change and refresh reset settings', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'assignee')
  await select(page, 'Sekundarna smer', 'desc')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expectSettings(page, ['original', 'asc', 'none', 'asc'])
  await page.goto('/#/projects/web')
  await select(page, 'Primarni ključ', 'title')
  const beforeHash = await page.evaluate(() => location.hash)
  await expect(beforeHash).toBe('#/projects/web')
  await page.reload()
  await expectSettings(page, ['original', 'asc', 'none', 'asc'])
  await expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe('{}')
})

test('R10: reset works in an empty project', async ({ page }) => {
  await mount(page, [])
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectSettings(page, ['original', 'asc', 'none', 'asc'])
  await expectIds(page, [])
})

test('R10: reset and all controls work with one task', async ({ page }) => {
  const records = [makeTask('web-01', 'web')]
  await mount(page, records)
  await select(page, 'Primarni ključ', 'title')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'status')
  await select(page, 'Sekundarna smer', 'desc')
  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectSettings(page, ['original', 'asc', 'none', 'asc'])
  await expectIds(page, ['web-01'])

  for (const key of ['original', 'title', 'assignee', 'status', 'dueDate'] as const) {
    for (const direction of ['asc', 'desc'] as const) {
      await select(page, 'Primarni ključ', key)
      await select(page, 'Primarna smer', direction)
      await expectIds(page, ['web-01'])
    }
  }
  for (const key of ['none', 'title', 'assignee', 'status', 'dueDate'] as const) {
    for (const direction of ['asc', 'desc'] as const) {
      await select(page, 'Sekundarni ključ', key)
      await select(page, 'Sekundarna smer', direction)
      await expectIds(page, ['web-01'])
    }
  }
})

test('R11: sorting is a read-only projection', async ({ page }) => {
  const writes = await mount(page)
  const countsBefore = await page.locator('[aria-label="Pregled stanj opravil"] strong').allTextContents()
  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await select(page, 'Sekundarna smer', 'desc')
  await expectIds(page, ['web-03', 'web-01', 'web-04', 'web-02'])
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(countsBefore)
  expect(writes).toEqual([])
  const state = await (await page.request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
})

test('R12: unique IDs, details and narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const records = [
    makeTask('web-01', 'web', { title: 'Enak naslov' }),
    makeTask('web-02', 'web', { title: 'Enak naslov' }),
    makeTask('web-03', 'web', { title: 'Enak naslov', status: 'done' }),
  ]
  await mount(page, records)
  await expect(page.locator('[data-task-id]')).toHaveCount(3)
  await expect(page.locator('[aria-label="Pregled stanj opravil"]')).toBeVisible()
  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('web-02', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await board(page)
  await expect(page.locator('[data-task-id]')).toHaveCount(3)
  await expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
