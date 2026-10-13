import { expect, test, type Page } from '@playwright/test'
import type { Task } from '../../shared/types.ts'

function task(id: string, projectId: 'web' | 'launch', overrides: Partial<Task> = {}): Task {
  return {
    id,
    projectId,
    title: id,
    description: `Opis ${id}`,
    status: 'todo',
    assignee: 'Ana Novak',
    dueDate: '2026-01-01',
    ...overrides,
  }
}

const records: Task[] = [
  task('web-01', 'web', { title: 'A2', status: 'todo', assignee: 'Ana', dueDate: '2026-01-02' }),
  task('web-02', 'web', { title: 'A1', status: 'todo', assignee: 'Bo', dueDate: '2026-01-03' }),
  task('web-03', 'web', { title: 'A1', status: 'in_progress', assignee: 'Cilka', dueDate: '2026-01-01' }),
  task('web-04', 'web', { title: 'A1', status: 'done', assignee: 'Dan', dueDate: '2026-01-01' }),
  task('launch-01', 'launch', { title: 'Kampanja', status: 'done', dueDate: '2026-02-01' }),
]

const primaryKeys = ['original', 'title', 'assignee', 'status', 'dueDate'] as const
const secondaryKeys = ['none', 'title', 'assignee', 'status', 'dueDate'] as const
const directions = ['asc', 'desc'] as const

async function mount(page: Page, data: Task[] = records, hash = '#/projects/web') {
  await page.request.post('/__test/reset')
  const writes: string[] = []
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname
    if (path.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method())
  })
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== 'GET') return route.continue()
    if (path === '/api/projects') {
      return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
    }
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) {
      return route.fulfill({ json: data.filter((entry) => entry.projectId === decodeURIComponent(project[1]!)) })
    }
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const entry = data.find((item) => item.id === decodeURIComponent(detail[1]!))
      return entry ? route.fulfill({ json: entry }) : route.fulfill({ status: 404, json: { message: 'Ni opravila' } })
    }
    return route.continue()
  })
  await page.goto('/' + hash)
  await expect(page.getByRole('heading', { name: hash.includes('launch') ? 'Jesenska kampanja' : 'Spletna prenova', exact: true })).toBeVisible()
  return writes
}

const ids = (page: Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
const control = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true })
const select = (page: Page, name: string, value: string) => control(page, name).selectOption(value)

async function expectDefaults(page: Page) {
  await expect(control(page, 'Primarni ključ')).toHaveValue('original')
  await expect(control(page, 'Primarna smer')).toHaveValue('asc')
  await expect(control(page, 'Sekundarni ključ')).toHaveValue('none')
  await expect(control(page, 'Sekundarna smer')).toHaveValue('asc')
}

test('sorting is reflected in both views, survives details, resets without writes', async ({ page }) => {
  const writes = await mount(page)
  await expectDefaults(page)
  await expect.poll(() => ids(page)).toEqual(['web-01', 'web-02', 'web-03', 'web-04'])

  await select(page, 'Primarni ključ', 'status')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'dueDate')
  await expect.poll(() => ids(page)).toEqual(['web-04', 'web-03', 'web-01', 'web-02'])

  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  const board = page.getByRole('region', { name: 'Tabla opravil', exact: true })
  await expect(board).toBeVisible()
  await expect(board.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('[data-task-id]')).toHaveCount(2)
  await expect(board.getByRole('region', { name: 'V delu', exact: true }).locator('[data-task-id]')).toHaveCount(1)
  await expect(board.getByRole('region', { name: 'Končano', exact: true }).locator('[data-task-id]')).toHaveCount(1)
  const columnIds = (name: string) => board.getByRole('region', { name, exact: true }).locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
  await expect.poll(() => columnIds('Pripravljeno')).toEqual(['web-01', 'web-02'])
  await expect.poll(() => columnIds('V delu')).toEqual(['web-03'])
  await expect.poll(() => columnIds('Končano')).toEqual(['web-04'])

  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect.poll(() => ids(page)).toEqual(['web-04', 'web-03', 'web-01', 'web-02'])
  await page.locator('[data-task-id="web-03"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByText('web-03', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(control(page, 'Primarni ključ')).toHaveValue('status')
  await expect(control(page, 'Primarna smer')).toHaveValue('desc')
  await expect(control(page, 'Sekundarni ključ')).toHaveValue('dueDate')
  await expect.poll(() => ids(page)).toEqual(['web-04', 'web-03', 'web-01', 'web-02'])

  await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
  await expectDefaults(page)
  await expect.poll(() => ids(page)).toEqual(['web-01', 'web-02', 'web-03', 'web-04'])
  expect(writes).toEqual([])
  expect(new URL(page.url()).hash).not.toContain('sort')
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })

  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})

test('changing project or refreshing resets sorting controls', async ({ page }) => {
  await mount(page)
  await select(page, 'Primarni ključ', 'dueDate')
  await select(page, 'Primarna smer', 'desc')
  await select(page, 'Sekundarni ključ', 'title')
  await select(page, 'Sekundarna smer', 'desc')

  await page.getByRole('navigation', { name: 'Projekti', exact: true }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expectDefaults(page)
  await expect.poll(() => ids(page)).toEqual(['launch-01'])

  await select(page, 'Primarni ključ', 'title')
  await page.reload()
  await expectDefaults(page)
  await expect.poll(() => ids(page)).toEqual(['launch-01'])
})

test('empty and single-task projects accept every key and direction', async ({ page }) => {
  for (const recordsForTest of [[], [task('single', 'launch', { title: 'Edino opravilo' })]]) {
    await mount(page, recordsForTest, recordsForTest.length ? '#/projects/launch' : '#/projects/web')
    for (const primary of primaryKeys) {
      for (const secondary of secondaryKeys) {
        for (const direction of directions) {
          await select(page, 'Primarni ključ', primary)
          await select(page, 'Sekundarni ključ', secondary)
          await select(page, 'Primarna smer', direction)
          await select(page, 'Sekundarna smer', direction)
          await expect.poll(() => ids(page)).toEqual(recordsForTest.map((entry) => entry.id))
        }
      }
    }
    await page.getByRole('button', { name: 'Tabla', exact: true }).click()
    await expect(page.getByRole('region', { name: 'Tabla opravil', exact: true })).toBeVisible()
    await expect(page.locator('[data-task-id]')).toHaveCount(recordsForTest.length)
    await page.getByRole('button', { name: 'Izvorni vrstni red', exact: true }).click()
    await expectDefaults(page)
  }
})
