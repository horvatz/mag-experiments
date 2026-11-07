import { expect, type Page } from '@playwright/test'

export { expect, test } from '@playwright/test'

export type Task = { id: string; projectId: string; title: string; description: string; status: 'todo' | 'in_progress' | 'done'; assignee: string; dueDate: string }

export const makeTask = (id: string, values: Partial<Task> = {}): Task => ({ id, projectId: 'web', title: 'Opravilo ' + id, description: 'Opis opravila ' + id, status: 'todo', assignee: 'Ana Novak', dueDate: '2026-09-21', ...values })

export const examples: Task[] = [
  makeTask('web-01', { title: 'Čas za pregled', description: 'Končni zapis vsebine', status: 'in_progress', dueDate: '2026-09-18' }),
  makeTask('web-02', { title: 'Pregled vsebine', assignee: 'Luka Kovač', dueDate: '2026-09-22' }),
  makeTask('web-03', { title: 'Pregled vsebine', status: 'done', dueDate: '2026-09-16' }),
  makeTask('web-04', { title: 'Alfa 10', assignee: 'Maja Zupan', dueDate: '2026-09-28' }),
  makeTask('web-05', { title: 'alfa 2', status: 'in_progress', dueDate: '2026-09-29' }),
  makeTask('web-06', { title: 'Zapis, "citat"', description: 'Prva vrstica', status: 'done', assignee: 'Živa Kovač', dueDate: '2026-09-21' }),
  makeTask('web-07', { title: '=SUM(A1)', assignee: 'Črt', dueDate: '2026-09-20' }),
  makeTask('web-08', { title: 'Dodatno opravilo', assignee: 'Maja Zupan', dueDate: '2026-10-01' }),
  makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt', dueDate: '2026-09-24' }),
  makeTask('launch-02', { projectId: 'launch', title: 'Drugi projekt', status: 'done', assignee: 'Luka Kovač', dueDate: '2026-09-25' }),
]

export const webIds = (records: Task[] = examples) => records.filter((task) => task.projectId === 'web').map((task) => task.id)

export async function mount(page: Page, records: Task[] = examples, hash = '#/projects/web') {
  await page.request.post('/__test/reset')
  const writes: string[] = []
  page.on('request', (request) => { if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method() + ' ' + request.url()) })
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

export const ids = (page: Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')).filter((id): id is string => id !== null))

export async function expectIds(page: Page, values: string[]) {
  await expect.poll(async () => ids(page)).toEqual(values)
}

export const select = (page: Page, name: string, value: string) => page.getByRole('combobox', { name, exact: true }).selectOption(value)

export const click = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()

export const expectSelection = (page: Page, name: string, value: string) => expect(page.getByRole('combobox', { name, exact: true })).toHaveValue(value)

export async function openBoard(page: Page) {
  await click(page, 'Tabla')
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
}

export async function openTable(page: Page) {
  await click(page, 'Preglednica')
  await expect(page.getByRole('button', { name: 'Preglednica', exact: true })).toHaveAttribute('aria-pressed', 'true')
}

export const columnIds = (page: Page, name: string) => page.getByRole('region', { name, exact: true }).locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')).filter((id): id is string => id !== null))
