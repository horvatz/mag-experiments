import { expect, test, type Page } from '@playwright/test'

export { expect, test }

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  assignee: string
  dueDate: string
}

export const makeTask = (id: string, values: Partial<Task> = {}): Task => ({
  id,
  projectId: 'web',
  title: `Opravilo ${id}`,
  description: `Opis opravila ${id}`,
  status: 'todo',
  assignee: 'Ana Novak',
  dueDate: '2026-09-21',
  ...values,
})

export const examples: Task[] = [
  makeTask('web-01'),
  makeTask('web-02', { title: 'Pregled vsebine', status: 'in_progress', assignee: 'Luka Kovač' }),
  makeTask('web-03', { title: 'Pregled vsebine', status: 'done', assignee: 'Maja Zupan' }),
  makeTask('web-04', { status: 'in_progress' }),
  makeTask('web-05', { assignee: 'Živa Kovač' }),
  makeTask('web-06', { status: 'done', assignee: 'Črt Novak' }),
  makeTask('web-07', { title: 'Čas za pregled', assignee: 'Maja Zupan' }),
  makeTask('web-08', { assignee: 'Luka Kovač' }),
  makeTask('launch-01', { projectId: 'launch' }),
  makeTask('launch-02', { projectId: 'launch', status: 'in_progress' }),
]

export const webIds = (records: Task[] = examples) =>
  records.filter(({ projectId }) => projectId === 'web').map(({ id }) => id)

export async function mount(page: Page, records: Task[] = examples, hash = '#/projects/web') {
  await page.request.post('/__test/reset')
  const writes: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      writes.push(`${request.method()} ${url.pathname}`)
    }
  })

  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== 'GET') return route.continue()

    if (path === '/api/projects') {
      return route.fulfill({
        json: [
          { id: 'web', name: 'Spletna prenova' },
          { id: 'launch', name: 'Jesenska kampanja' },
        ],
      })
    }

    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) {
      return route.fulfill({ json: records.filter(({ projectId }) => projectId === decodeURIComponent(project[1])) })
    }

    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const task = records.find(({ id }) => id === decodeURIComponent(detail[1]))
      return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }

    return route.continue()
  })

  await page.goto('/' + hash)
  const projectName = hash.includes('/launch') ? 'Jesenska kampanja' : 'Spletna prenova'
  await expect(page.getByRole('heading', { name: projectName, exact: true })).toBeVisible()
  return writes
}

export const ids = (page: Page) =>
  page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))

export async function expectIds(page: Page, values: string[]) {
  await expect.poll(async () => ids(page)).toEqual(values)
}

export async function columnIds(page: Page, status: string, values: string[]) {
  await expect.poll(async () =>
    page.locator(`.board-${status}`).locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id'))),
  ).toEqual(values)
}

export const rank = (page: Page, id: string) => page.getByLabel(`Mesto opravila ${id}`, { exact: true })

export const click = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()

export async function expectHistory(page: Page, undo: number, redo: number) {
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText(
    `Razveljavitve: ${undo}. Ponovitve: ${redo}.`,
  )
}

export async function board(page: Page) {
  await click(page, 'Tabla')
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
}

export async function table(page: Page) {
  await click(page, 'Preglednica')
  await expect(page.getByRole('button', { name: 'Preglednica', exact: true })).toHaveAttribute('aria-pressed', 'true')
}

export async function details(page: Page, id: string) {
  await page.locator(`[data-task-id="${id}"]`).getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
}

export async function project(page: Page, id: 'web' | 'launch') {
  const name = id === 'web' ? 'Spletna prenova' : 'Jesenska kampanja'
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name, exact: true }).click()
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
}

export async function readonly(page: Page, writes: string[]) {
  expect(writes).toEqual([])
  await expect.poll(async () => page.evaluate(() => Object.keys(localStorage).length)).toBe(0)
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
}
