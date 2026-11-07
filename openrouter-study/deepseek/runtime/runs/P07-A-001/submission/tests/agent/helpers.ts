import { expect, type Page } from '@playwright/test'
export { expect, test } from '@playwright/test'

export type Task = { id: string; projectId: string; title: string; description: string; status: 'todo' | 'in_progress' | 'done'; assignee: string; dueDate: string }

export const makeTask = (id: string, values: Partial<Task> = {}): Task => ({
  id,
  projectId: 'web',
  title: 'Opravilo ' + id,
  description: 'Opis opravila ' + id,
  status: 'todo',
  assignee: 'Ana Novak',
  dueDate: '2026-09-21',
  ...values,
})

export const examples: Task[] = [
  makeTask('web-01', { title: 'Pregled vsebine', status: 'in_progress' }),
  makeTask('web-02', { title: 'Pregled vsebine' }),
  makeTask('web-03', { title: 'Zapis, "citat"', status: 'done', assignee: 'Luka Kovač' }),
  makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt' }),
  makeTask('launch-02', { projectId: 'launch', title: 'Drugi projekt', status: 'done' }),
]

export async function mount(page: Page, records: Task[] = examples, hash = '#/projects/web') {
  await page.request.post('/__test/reset')
  const writes: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method() + ' ' + request.url())
  })
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== 'GET') return route.continue()
    if (path === '/api/projects') return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
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

export const ids = (page: Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))

export async function expectIds(page: Page, values: string[]) {
  await expect.poll(() => ids(page)).toEqual(values)
}

export const click = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()

export async function board(page: Page) {
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
}

export async function table(page: Page) {
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Preglednica', exact: true })).toHaveAttribute('aria-pressed', 'true')
}

export async function project(page: Page, id: 'web' | 'launch') {
  const name = id === 'web' ? 'Spletna prenova' : 'Jesenska kampanja'
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name, exact: true }).click()
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
}

export const favoritesCounter = (page: Page) => page.locator('[role="status"][aria-label="Število priljubljenih"]')
export const storedFavorites = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('folio:favorites:v1') ?? 'null'))
