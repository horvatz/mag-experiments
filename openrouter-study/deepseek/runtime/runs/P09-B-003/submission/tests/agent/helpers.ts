import { expect, type Page } from '@playwright/test'
export { expect, test } from '@playwright/test'

export type Task = {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  assignee: string
  dueDate: string
}

export const makeTask = (id: string, projectId: string, values: Partial<Task> = {}): Task => ({
  id,
  projectId,
  title: 'Opravilo ' + id,
  description: 'Opis opravila ' + id,
  status: 'todo',
  assignee: 'Ana Novak',
  dueDate: '2026-09-21',
  ...values,
})

export const webTasks: Task[] = [
  makeTask('web-1', 'web', { title: 'Čas za pregled', description: 'Končni zapis vsebine', status: 'in_progress', assignee: 'Ana Novak' }),
  makeTask('web-2', 'web', { title: 'Pregled vsebine', assignee: 'Luka Kovač' }),
  makeTask('web-3', 'web', { title: 'Pregled vsebine', status: 'done', assignee: 'Živa Kovač' }),
  makeTask('web-4', 'web', { title: 'Alfa 10', assignee: 'Maja Zupan' }),
  makeTask('web-5', 'web', { title: 'alfa 2', status: 'in_progress', assignee: 'Črt' }),
  makeTask('web-6', 'web', { title: '=SUM(A1)', description: 'Formula (a+b)*2', status: 'done', assignee: 'Maja Zupan' }),
  makeTask('launch-1', 'launch', { title: 'Drugi projekt' }),
  makeTask('launch-2', 'launch', { title: 'Pregled v drugem projektu', status: 'done' }),
]

export const allWebIds = ['web-1', 'web-2', 'web-3', 'web-4', 'web-5', 'web-6']

const projectName = (hash: string) => (hash.includes('/launch') ? 'Jesenska kampanja' : 'Spletna prenova')

export async function mount(page: Page, hash = '#/projects/web', records: Task[] = webTasks) {
  await page.request.post('/__test/reset')
  const writes: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      writes.push(request.method() + ' ' + request.url())
    }
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
  await expect(page.getByRole('heading', { name: projectName(hash), exact: true })).toBeVisible()
  return writes
}

export const ids = (page: Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))

export async function expectIds(page: Page, values: string[]) {
  await expect.poll(() => ids(page)).toEqual(values)
}

export async function expectIdsUnordered(page: Page, values: string[]) {
  await expect.poll(async () => (await ids(page)).slice().sort()).toEqual([...values].sort())
}

export function hashParams(page: Page) {
  const hash = new URL(page.url()).hash
  const separator = hash.indexOf('?')
  return new URLSearchParams(separator === -1 ? '' : hash.slice(separator + 1))
}

export const search = (page: Page, value: string) => page.getByRole('searchbox', { name: 'Iskanje v povezavi', exact: true }).fill(value)
export const choose = (page: Page, name: string, value: string) => page.getByRole('combobox', { name, exact: true }).selectOption(value)
export const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
export const counter = (page: Page) => page.getByRole('status', { name: 'Rezultati povezave', exact: true })
export const historyLength = (page: Page) => page.evaluate(() => history.length)
