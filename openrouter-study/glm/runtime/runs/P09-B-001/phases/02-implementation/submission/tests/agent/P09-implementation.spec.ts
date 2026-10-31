import { expect, test, type Page } from '@playwright/test'
import type { Task } from '../../shared/types.ts'
import { filterTasks, normalizeText, projectUrl, taskUrl } from '../../src/navigation.ts'

const projects = [
  { id: 'web', name: 'Spletna prenova' },
  { id: 'launch', name: 'Jesenska kampanja' },
]

const tasks: Task[] = [
  { id: 'web-02', projectId: 'web', title: 'Železo', description: 'Pripravi načrt', status: 'todo', assignee: 'Ana Novak', dueDate: '2026-09-20' },
  { id: 'web-01', projectId: 'web', title: 'Äon', description: 'Preglej vsebino', status: 'in_progress', assignee: 'Luka Kovač', dueDate: '2026-09-22' },
  { id: 'web-03', projectId: 'web', title: 'Äon', description: 'Dopolni vsebino', status: 'done', assignee: 'Maja Zupan', dueDate: '2026-09-24' },
  { id: 'launch-01', projectId: 'launch', title: 'Predstavitev', description: 'Pripravi govor', status: 'todo', assignee: 'Eva Vidmar', dueDate: '2026-10-01' },
]

async function mockFolio(page: Page, taskList = tasks) {
  await page.route('**/api/**', route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/projects') return route.fulfill({ json: projects })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(url.pathname)
    if (project) {
      return route.fulfill({ json: taskList.filter(task => task.projectId === decodeURIComponent(project[1]!)) })
    }
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(url.pathname)
    const task = detail && taskList.find(entry => entry.id === decodeURIComponent(detail[1]!))
    return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
  })
}

test('normalization, combined filters, sorting and URL encoding', () => {
  expect(normalizeText('  ČŽ ä ')).toBe('cz a')
  expect(filterTasks(tasks, { q: 'PRIPRAVI', status: 'todo', order: 'original' }).map(task => task.id)).toEqual(['web-02', 'launch-01'])
  expect(filterTasks(tasks, { q: 'luka', status: 'all', order: 'title-asc' }).map(task => task.id)).toEqual(['web-01', 'web-03'])
  expect(filterTasks(tasks, { q: 'maja', status: 'done', order: 'title-desc' }).map(task => task.id)).toEqual(['web-03'])
  expect(filterTasks(tasks, { q: '[n]', status: 'all', order: 'original' })).toEqual([])
  expect(projectUrl('web', 'board', { q: 'a b&c', status: 'done', order: 'title-desc' })).toBe('#/projects/web?q=a+b%26c&status=done&order=title-desc&view=board')
  expect(taskUrl('web', 'web-03', 'board', { q: '', status: 'all', order: 'original' })).toBe('#/projects/web/tasks/web-03?view=board')
})

test('direct URL uses first values, defaults invalid values and does not rewrite itself', async ({ page }) => {
  await mockFolio(page)
  const hash = '#/projects/web?status=done&status=todo&order=bogus&x=1&q=KOV%C3%A1%C4%8D'
  await page.goto('/' + hash)
  await expect(page.getByRole('searchbox', { name: 'Iskanje v povezavi' })).toHaveValue('Kováč')
  await expect(page.getByRole('combobox', { name: 'Stanje v povezavi' })).toHaveValue('done')
  const ids = page.locator('[data-task-id]')
  await expect(ids).toHaveCount(1)
  await expect(ids.first()).toHaveAttribute('data-task-id', 'web-01')
  expect(page.url().slice(page.url().indexOf('#'))).toBe(hash)
})

test('drafts apply once, repeated confirmation adds no history and navigation restores drafts', async ({ page }) => {
  await mockFolio(page)
  await page.goto('/#/projects/web')
  const initialHistory = await page.evaluate(() => history.length)
  const search = page.getByRole('searchbox', { name: 'Iskanje v povezavi' })
  const status = page.getByRole('combobox', { name: 'Stanje v povezavi' })
  await search.fill('načrt')
  await status.selectOption('todo')
  await expect(page.locator('[data-task-id]')).toHaveCount(3)
  await page.getByRole('button', { name: 'Uporabi pogled' }).click()
  await expect(page.locator('[data-task-id]')).toHaveCount(1)
  await expect(page).toHaveURL(/#\/projects\/web\?q=na%C4%8Drt&status=todo/)
  await page.getByRole('button', { name: 'Uporabi pogled' }).click()
  expect(await page.evaluate(() => history.length)).toBe(initialHistory + 1)
  await search.fill('dopolni')
  await status.selectOption('done')
  await page.getByRole('button', { name: 'Uporabi pogled' }).click()
  expect(await page.evaluate(() => history.length)).toBe(initialHistory + 2)
  await search.fill('uncommitted draft')
  await page.goBack()
  await expect(search).toHaveValue('načrt')
  await expect(status).toHaveValue('todo')
  await expect(page.locator('[data-task-id]')).toHaveCount(1)
  await page.goForward()
  await expect(search).toHaveValue('dopolni')
  await expect(status).toHaveValue('done')
})

test('board, details and project links preserve committed state', async ({ page }) => {
  await mockFolio(page)
  await page.goto('/#/projects/web?view=board&q=%C3%A4on&status=done&order=title-desc')
  const board = page.getByRole('region', { name: 'Tabla opravil' })
  await expect(board.locator('[data-task-id]')).toHaveCount(1)
  await board.locator('[data-task-id="web-03"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/#\/projects\/web\?q=%C3%A4on&status=done&order=title-desc&view=board/)
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page).toHaveURL(/#\/projects\/launch\?view=board$/)
  await expect(board.locator('[data-task-id="launch-01"]')).toBeVisible()
  await page.goto('/#/projects/launch?q=predstavitev&status=todo&order=title-asc')
  await expect(page.locator('[data-task-id="launch-01"]')).toBeVisible()
})

test('empty result, status counter, reset and mobile width work without writes', async ({ page }) => {
  await mockFolio(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/projects/web?q=neobstaja')
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 0 od 3.')
  await expect(page.getByRole('heading', { name: 'Ni zadetkov.' })).toBeVisible()
  await page.getByRole('button', { name: 'Ponastavi pogled' }).click()
  await expect(page.locator('[data-task-id]')).toHaveCount(3)
  await expect(page.getByRole('status', { name: 'Rezultati povezave' })).toHaveText('Prikazano: 3 od 3.')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})
