import { expect, test, type Page } from '@playwright/test'
import type { Project, Task } from '../../shared/types.ts'

const projects: Project[] = [{ id: 'p1', name: 'Prvi projekt' }, { id: 'p2', name: 'Drugi projekt' }]
const p1: Task[] = [
  { id: 'a1', projectId: 'p1', title: 'Časovnica', description: 'Splet * stran', status: 'todo', assignee: 'Ana Kovač', dueDate: '2026-09-22' },
  { id: 'a2', projectId: 'p1', title: 'Časovnica', description: 'Pregled vsebine', status: 'in_progress', assignee: 'Luka', dueDate: '2026-09-23' },
  { id: 'a3', projectId: 'p1', title: 'Zaključek', description: 'Končni pregled', status: 'done', assignee: 'Ana Kovač', dueDate: '2026-09-24' },
  { id: 'a4', projectId: 'p1', title: 'Objava', description: 'Priprava', status: 'todo', assignee: 'Maja', dueDate: '2026-09-25' },
]
const p2: Task[] = [{ id: 'b1', projectId: 'p2', title: 'Drugo', description: 'Drugi projekt', status: 'done', assignee: 'Nina', dueDate: '2026-09-26' }]

async function mount(page: Page) {
  const writes: string[] = []
  page.on('request', (request) => {
    if (/^\/(api\/)/.test(new URL(request.url()).pathname) && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method())) writes.push(request.method())
  })
  await page.route('**/api/projects', (route) => route.fulfill({ json: projects }))
  await page.route('**/api/projects/p1/tasks', (route) => route.fulfill({ json: p1 }))
  await page.route('**/api/projects/p2/tasks', (route) => route.fulfill({ json: p2 }))
  await page.route('**/api/tasks/a1', (route) => route.fulfill({ json: p1[0] }))
  await page.goto('/#/projects/p1')
  return writes
}

const ids = async (page: Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))

test('P03 defaults, Unicode normalization, all words and literal punctuation', async ({ page }) => {
  await mount(page)
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Filter odgovorne osebe' })).toHaveValue('all')
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 4 od 4.')
  expect(await ids(page)).toEqual(['a1', 'a2', 'a3', 'a4'])
  const search = page.getByRole('searchbox', { name: 'Išči opravila' })
  await search.fill('CASOVNICA splet')
  expect(await ids(page)).toEqual(['a1'])
  await search.fill('splet CASOVNICA')
  expect(await ids(page)).toEqual(['a1'])
  await search.fill('*')
  expect(await ids(page)).toEqual(['a1'])
})

test('P03 combined filters, project-wide people, counts and both views', async ({ page }) => {
  await mount(page)
  const assignee = page.getByRole('combobox', { name: 'Filter odgovorne osebe' })
  await expect(assignee.locator('option')).toHaveCount(4)
  await page.getByRole('combobox', { name: 'Filter stanja' }).selectOption('done')
  await assignee.selectOption('Ana Kovač')
  expect(await ids(page)).toEqual(['a3'])
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 1 od 4.')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  expect((await ids(page)).sort()).toEqual(['a3'])
  await expect(page.getByRole('region', { name: 'Končano' }).getByRole('link')).toHaveCount(1)
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  expect(await ids(page)).toEqual(['a3'])
})

test('P03 clears filters, resets on project switch and refreshes without persistence or writes', async ({ page }) => {
  const writes = await mount(page)
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('Zaključek')
  await page.getByRole('button', { name: 'Počisti filtre' }).click()
  expect(await ids(page)).toEqual(['a1', 'a2', 'a3', 'a4'])
  await page.getByRole('combobox', { name: 'Filter stanja' }).selectOption('todo')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Drugi projekt' }).click()
  await expect(page.getByRole('searchbox', { name: 'Išči opravila' })).toHaveValue('')
  await expect(page.getByRole('combobox', { name: 'Filter stanja' })).toHaveValue('all')
  expect(await ids(page)).toEqual(['b1'])
  await page.reload()
  await expect(page.getByRole('status', { name: 'Rezultati filtriranja' })).toHaveText('Prikazano: 1 od 1.')
  expect(writes).toEqual([])
})

test('P03 distinguishes no matches from empty projects and preserves read details at mobile width', async ({ page }) => {
  await mount(page)
  await page.getByRole('searchbox', { name: 'Išči opravila' }).fill('nič-ne-ustreza')
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByText('Ni zadetkov.', { exact: true })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
  await page.getByRole('button', { name: 'Počisti filtre' }).click()
  await page.locator('[data-task-id="a1"] a').click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Časovnica' })).toBeVisible()
  await page.getByRole('button', { name: 'Zapri podrobnosti' }).click()
  await page.route('**/api/projects/p1/tasks', (route) => route.fulfill({ json: [] }))
  await page.reload()
  await expect(page.getByText('Prikazano: 0 od 0.')).toBeVisible()
})
