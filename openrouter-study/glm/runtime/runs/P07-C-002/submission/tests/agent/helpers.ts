import { expect, type Page } from '@playwright/test'

export const FAVORITES_KEY = 'folio:favorites:v1'

export interface AgentTask {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  assignee: string
  dueDate: string
}

const makeTask = (
  id: string,
  values: Partial<Omit<AgentTask, 'id'>> = {},
): AgentTask => ({
  id,
  projectId: 'web',
  title: `Opravilo ${id}`,
  description: `Opis opravila ${id}`,
  status: 'todo',
  assignee: 'Ana Novak',
  dueDate: '2026-10-01',
  ...values,
})

export const examples: AgentTask[] = [
  makeTask('web-01', { title: 'Prvi korak' }),
  makeTask('web-02', { title: 'Skupni naslov', status: 'in_progress', assignee: 'Maja Zupan' }),
  makeTask('web-03', { title: 'Skupni naslov', status: 'done', assignee: 'Luka Kovač' }),
  makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt', assignee: 'Eva Kranjc' }),
  makeTask('launch-02', { projectId: 'launch', title: 'Drugi projekt', status: 'done' }),
]

export async function mount(
  page: Page,
  records: AgentTask[] = examples,
  hash = '#/projects/web',
) {
  const writes: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      writes.push(`${request.method()} ${url.pathname}`)
    }
  })

  await page.route('**/api/**', async (route) => {
    const request = route.request()
    if (request.method() !== 'GET') return route.continue()
    const path = new URL(request.url()).pathname
    if (path === '/api/projects') {
      return route.fulfill({ json: [
        { id: 'web', name: 'Spletna prenova' },
        { id: 'launch', name: 'Jesenska kampanja' },
      ] })
    }

    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) {
      return route.fulfill({
        json: records.filter((task) => task.projectId === decodeURIComponent(project[1])),
      })
    }

    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const task = records.find((entry) => entry.id === decodeURIComponent(detail[1]))
      return task
        ? route.fulfill({ json: task })
        : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }
    return route.continue()
  })

  await page.goto('/' + hash)
  const heading = hash.includes('/launch') ? 'Jesenska kampanja' : 'Spletna prenova'
  await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  return writes
}

export async function seedFavorites(page: Page, value: string) {
  await page.addInitScript(
    ({ key, value }) => { localStorage.setItem(key, value) },
    { key: FAVORITES_KEY, value },
  )
}

export const favoriteButton = (page: Page, id: string) =>
  page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })

export const favoriteStatus = (page: Page) =>
  page.getByRole('status', { name: 'Število priljubljenih' })

export const visibleIds = async (page: Page) =>
  page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))

export const filterCheckbox = (page: Page) =>
  page.getByRole('checkbox', { name: 'Prikaži le priljubljena', exact: true })

export const removeButton = (page: Page) =>
  page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })

export async function switchProject(page: Page, id: 'web' | 'launch') {
  const name = id === 'web' ? 'Spletna prenova' : 'Jesenska kampanja'
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name, exact: true }).click()
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
}

export async function switchView(page: Page, view: 'table' | 'board') {
  await page.getByRole('button', { name: view === 'table' ? 'Preglednica' : 'Tabla', exact: true }).click()
  if (view === 'board') {
    await expect(page.getByRole('region', { name: 'Tabla opravil', exact: true })).toBeVisible()
  } else {
    await expect(page.getByRole('button', { name: 'Preglednica', exact: true })).toHaveAttribute('aria-pressed', 'true')
  }
}
