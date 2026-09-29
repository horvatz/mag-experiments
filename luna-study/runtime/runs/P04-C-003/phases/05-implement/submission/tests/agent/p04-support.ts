import type { Page } from '@playwright/test'

export type Task = {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  assignee: string
  dueDate: string
}

export const task = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  projectId: 'web',
  title: `Task ${id}`,
  description: `Description ${id}`,
  status: 'todo',
  assignee: 'Ana Novak',
  dueDate: '2026-09-20',
  ...overrides,
})

export async function mount(page: Page, records: Task[], projectId = 'web') {
  const writes: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).pathname.startsWith('/api/') && request.method() !== 'GET') {
      writes.push(`${request.method()} ${request.url()}`)
    }
  })
  await page.route('**/api/**', async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== 'GET') return route.continue()
    if (path === '/api/projects') {
      return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
    }
    const projectMatch = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (projectMatch) {
      const id = decodeURIComponent(projectMatch[1])
      return route.fulfill({ json: records.filter(record => record.projectId === id) })
    }
    const taskMatch = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (taskMatch) {
      const record = records.find(item => item.id === decodeURIComponent(taskMatch[1]))
      return record
        ? route.fulfill({ json: record })
        : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }
    return route.continue()
  })
  await page.goto(`/#/projects/${projectId}`)
  await page.getByRole('heading', { name: projectId === 'web' ? 'Spletna prenova' : 'Jesenska kampanja' }).waitFor()
  return writes
}

export async function select(page: Page, name: string, value: string) {
  await page.getByRole('combobox', { name, exact: true }).selectOption(value)
}

export async function ids(page: Page) {
  return page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-task-id')))
}
