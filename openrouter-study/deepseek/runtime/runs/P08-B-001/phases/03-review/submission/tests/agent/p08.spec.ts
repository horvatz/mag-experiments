import { expect, test, type Page } from '@playwright/test'

type Task = { id: string; projectId: string; title: string; description: string; status: 'todo' | 'in_progress' | 'done'; assignee: string; dueDate: string }
const makeTask = (id: string, values: Partial<Task> = {}): Task => ({ id, projectId: 'web', title: 'Opravilo ' + id, description: 'Opis ' + id, status: 'todo', assignee: 'Ana Novak', dueDate: '2026-09-21', ...values })
const records: Task[] = [
  makeTask('a1', { dueDate: '2026-09-20' }),
  makeTask('a2', { dueDate: '2026-09-21' }),
  makeTask('a3', { dueDate: '2026-09-22' }),
  makeTask('a4', { dueDate: '2026-09-28' }),
  makeTask('a5', { dueDate: '2026-09-29' }),
  makeTask('a6', { dueDate: '2028-02-29' }),
  makeTask('a7', { dueDate: '2026-09-18', status: 'done' }),
  makeTask('a8', { dueDate: '2026-09-21', status: 'done' }),
  makeTask('a9', { dueDate: '2027-01-01' }),
  makeTask('l1', { projectId: 'launch', dueDate: '2026-09-25' }),
  makeTask('l2', { projectId: 'launch', status: 'done' }),
]

async function mount(page: Page, tasks: Task[] = records) {
  await page.request.post('/__test/reset')
  const writes: string[] = []
  page.on('request', (request) => { if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method() + ' ' + request.url()) })
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    if (request.method() !== 'GET') return route.continue()
    const path = new URL(request.url()).pathname
    if (path === '/api/projects') return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) return route.fulfill({ json: tasks.filter((task) => task.projectId === decodeURIComponent(project[1])) })
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) { const task = tasks.find((entry) => entry.id === decodeURIComponent(detail[1])); return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: 'Ni opravila.' } }) }
    return route.continue()
  })
  await page.goto('/#/projects/web')
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  return writes
}
const ids = (page: Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
async function expectIds(page: Page, values: string[], ordered = true) {
  await expect.poll(async () => { const result = await ids(page); return ordered ? result : [...result].sort() }).toEqual(ordered ? values : [...values].sort())
}
const counter = (page: Page, key: string) => page.getByLabel(`Število rokov ${key}`, { exact: true })
const dateField = (page: Page) => page.getByLabel('Referenčni datum', { exact: true })
const viewField = (page: Page) => page.getByRole('combobox', { name: 'Pogled rokov', exact: true })
async function expectCounters(page: Page, values: [number, number, number, number, number]) {
  const keys = ['overdue', 'today', 'week', 'later', 'done']
  for (let index = 0; index < keys.length; index += 1) await expect(counter(page, keys[index])).toHaveText(String(values[index]))
}

test('R01/R03/R04/R06/R07: zacetne vrednosti, meje in filtri', async ({ page }) => {
  await mount(page)
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await expect(viewField(page)).toHaveValue('all')
  await expectIds(page, ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9'])
  await expectCounters(page, [1, 1, 2, 3, 2])
  for (const [value, expected] of [['overdue', ['a1']], ['today', ['a2']], ['week', ['a3', 'a4']], ['later', ['a5', 'a6', 'a9']], ['done', ['a7', 'a8']]] as const) {
    await viewField(page).selectOption(value)
    await expectIds(page, [...expected])
    await expectCounters(page, [1, 1, 2, 3, 2])
  }
  await viewField(page).selectOption('all')
  await expectIds(page, ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9'])
})

test('R02/R05: done neodvisno od roka ter prestopni februar in meja leta', async ({ page }) => {
  await mount(page)
  await viewField(page).selectOption('done')
  await expectIds(page, ['a7', 'a8'])
  await expectCounters(page, [1, 1, 2, 3, 2])
  await dateField(page).fill('2028-02-22')
  await viewField(page).selectOption('week')
  await expectIds(page, ['a6'])
  await expectCounters(page, [6, 0, 1, 0, 2])
  await dateField(page).fill('2026-12-28')
  await expectIds(page, ['a9'])
  await expectCounters(page, [5, 0, 1, 1, 2])
})

test('R08: neveljaven vnos ohrani izracun, veljaven ga odstrani in ohrani filter', async ({ page }) => {
  await mount(page)
  await viewField(page).selectOption('overdue')
  await dateField(page).fill('')
  await expect(page.getByRole('alert')).toContainText('Vnesi veljaven referenčni datum.')
  await expectIds(page, ['a1'])
  await expectCounters(page, [1, 1, 2, 3, 2])
  await dateField(page).fill('2026-09-22')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(viewField(page)).toHaveValue('overdue')
  await expectIds(page, ['a1', 'a2'])
})

test('R09/R10: preglednica in tabla ista mnozica, ponastavitev ob osvezitvi', async ({ page }) => {
  await mount(page)
  await viewField(page).selectOption('week')
  await expectIds(page, ['a3', 'a4'])
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expectIds(page, ['a3', 'a4'], false)
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await expect(viewField(page)).toHaveValue('week')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await expect(viewField(page)).toHaveValue('all')
  expect(page.url()).not.toContain('overdue')
  expect(await page.evaluate(() => Object.keys(localStorage).length)).toBe(0)
})

test('R10/R11: menjava projekta, prazen projekt in prazna skupina', async ({ page }) => {
  await mount(page, records.filter((task) => task.projectId === 'launch'))
  await expectCounters(page, [0, 0, 0, 0, 0])
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(dateField(page)).toHaveValue('2026-09-21')
  await viewField(page).selectOption('later')
  await expect(page.getByText('Ni opravil v izbrani skupini.', { exact: true })).toBeVisible()
  await viewField(page).selectOption('all')
  await expectIds(page, ['l1', 'l2'])
})

test('R12: samo bralni API, stabilna sirina na 390 pik', async ({ page }) => {
  const writes = await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: 'Pregled rokov', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(writes).toEqual([])
  const state = await (await page.request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
})
