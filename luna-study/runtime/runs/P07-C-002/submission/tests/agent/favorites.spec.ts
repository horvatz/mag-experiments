import { expect, test, type Page } from '@playwright/test'

const tasks = [
  { id: 'web-a', projectId: 'web', title: 'Isto ime', description: 'Prvi opis', status: 'todo', assignee: 'Ana', dueDate: '2026-09-21' },
  { id: 'web-b', projectId: 'web', title: 'Isto ime', description: 'Drugi opis', status: 'done', assignee: 'Luka', dueDate: '2026-09-22' },
  { id: 'other-a', projectId: 'other', title: 'Drugo', description: 'Opis', status: 'in_progress', assignee: 'Maja', dueDate: '2026-09-23' },
]

async function mount(page: Page) {
  const writes: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/') && request.method() !== 'GET') writes.push(request.method())
  })
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/projects') return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'other', name: 'Drugi projekt' }] })
    if (path === '/api/projects/web/tasks') return route.fulfill({ json: tasks.filter((task) => task.projectId === 'web') })
    if (path === '/api/projects/other/tasks') return route.fulfill({ json: tasks.filter((task) => task.projectId === 'other') })
    if (path.startsWith('/api/tasks/')) return route.fulfill({ json: tasks.find((task) => task.id === path.split('/').at(-1)) })
    return route.continue()
  })
  await page.goto('/#/projects/web')
  await expect(page.getByRole('heading', { name: 'Spletna prenova' })).toBeVisible()
  return writes
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('favorites-test-started')) return
    localStorage.removeItem('folio:favorites:v1')
    sessionStorage.setItem('favorites-test-started', 'yes')
  })
})

test('favorites are independent by ID, saved canonically, and do not open details or write the API', async ({ page }) => {
  const writes = await mount(page)
  await page.getByRole('button', { name: 'Priljubljeno opravilo web-a', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-a', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-b', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe('{"version":1,"ids":["web-a"]}')
  expect(writes).toEqual([])
})

test('filter, project reset, bulk removal and board share favorites', async ({ page }) => {
  const writes = await mount(page)
  await page.evaluate(() => localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: ['web-a', 'web-b', 'other-a', 'unknown', 'web-a'] })))
  await page.reload()
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(page.locator('[data-task-id]')).toHaveCount(2)
  await expect(page.getByRole('status', { name: 'Število priljubljenih' })).toHaveText('Priljubljeno: 2 od 2.')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-a' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Drugi projekt' }).click()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).not.toBeChecked()
  await page.getByRole('button', { name: 'Odstrani priljubljene tega projekta' }).click()
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem('folio:favorites:v1')!)).ids).toEqual(['unknown', 'web-a', 'web-b'])
  expect(writes).toEqual([])
})

test('invalid initial storage is ignored without rewriting and empty filter remains recoverable', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('folio:favorites:v1', '{bad json'))
  await mount(page)
  expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe('{bad json')
  await page.getByRole('checkbox', { name: 'Prikaži le priljubljena' }).check()
  await expect(page.getByRole('heading', { name: 'Ni priljubljenih opravil.' })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })).toBeChecked()
})
