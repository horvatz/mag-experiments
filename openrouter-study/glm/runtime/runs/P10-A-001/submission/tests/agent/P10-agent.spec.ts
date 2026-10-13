import { expect, test, type Page } from '@playwright/test'
import type { Task, TaskStatus } from '../../shared/types.ts'

const statuses: TaskStatus[] = ['todo', 'in_progress', 'done']

function task(id: string, index: number, projectId = 'web'): Task {
  return {
    id,
    projectId,
    title: `Opravilo ${id}`,
    description: `Opis ${id}`,
    status: statuses[index % statuses.length],
    assignee: `Oseba ${index + 1}`,
    dueDate: `2026-10-${String(index + 1).padStart(2, '0')}`,
  }
}

function records(webCount: number, launchCount: number) {
  const web = Array.from({ length: webCount }, (_, index) => task(`web-${index + 1}`, index))
  const launch = Array.from({ length: launchCount }, (_, index) => task(`launch-${index + 1}`, index, 'launch'))
  return [...web, ...launch]
}

async function mount(page: Page, entries: Task[], projectId = 'web') {
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
      return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
    }
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) {
      return route.fulfill({ json: entries.filter((item) => item.projectId === decodeURIComponent(project[1])) })
    }
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const found = entries.find((item) => item.id === decodeURIComponent(detail[1]))
      return found ? route.fulfill({ json: found }) : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }
    return route.continue()
  })
  await page.goto(`/#/projects/${projectId}`)
  await expect(page.getByRole('heading', { name: projectId === 'web' ? 'Spletna prenova' : 'Jesenska kampanja', exact: true })).toBeVisible()
  return writes
}

const visibleIds = (page: Page) =>
  page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))

test('moves preserve fields, boundaries are disabled, and invalid moves keep history', async ({ page }) => {
  await mount(page, records(3, 1))
  const expectedIds = ['web-1', 'web-2', 'web-3']
  await expect.poll(() => visibleIds(page)).toEqual(expectedIds)
  await expect(page.getByRole('button', { name: 'Premakni web-1 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-3 dol', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()

  await page.getByRole('button', { name: 'Premakni web-2 dol', exact: true }).click()
  const movedRow = page.locator('[data-task-id="web-2"]')
  await expect(movedRow).toContainText('Opravilo web-2')
  await expect(movedRow).toContainText('V delu')
  await expect(movedRow).toContainText('Oseba 2')
  await expect(movedRow.locator('time')).toHaveAttribute('datetime', '2026-10-02')
  await expect(page.getByLabel('Mesto opravila web-2', { exact: true })).toHaveText('3')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 1. Ponovitve: 0.')

  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expect.poll(() => visibleIds(page)).toEqual(expectedIds)
  await page.getByRole('button', { name: 'Premakni web-1 gor', exact: true }).click({ force: true })
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 1.')
  await page.getByRole('button', { name: 'Ponovi premik', exact: true }).click()
  await expect.poll(() => visibleIds(page)).toEqual(['web-1', 'web-3', 'web-2'])
  await page.getByRole('button', { name: 'Premakni web-1 dol', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
})

test('view switch and details preserve global order', async ({ page }) => {
  await mount(page, records(3, 1))
  await page.getByRole('button', { name: 'Premakni web-2 dol', exact: true }).click()
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect(page.getByLabel('Mesto opravila web-2', { exact: true })).toHaveText('3')
  await expect(page.getByRole('region', { name: 'Pripravljeno' }).locator('[data-task-id]')).toHaveCount(1)
  await expect(page.getByRole('region', { name: 'V delu' }).locator('[data-task-id]')).toHaveCount(1)
  await expect(page.getByRole('region', { name: 'Končano' }).locator('[data-task-id]')).toHaveCount(1)

  await page.locator('[data-task-id="web-2"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByLabel('Mesto opravila web-2', { exact: true })).toHaveText('3')
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect.poll(() => visibleIds(page)).toEqual(['web-1', 'web-3', 'web-2'])
})

test('undo history keeps at most twenty permutations and all redoes work', async ({ page }) => {
  await mount(page, records(22, 0))
  await expect.poll(() => visibleIds(page)).toEqual(Array.from({ length: 22 }, (_, index) => `web-${index + 1}`))
  for (let move = 0; move < 21; move += 1) {
    await page.getByRole('button', { name: 'Premakni web-1 dol', exact: true }).click()
  }
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  for (let undo = 0; undo < 20; undo += 1) {
    await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  }
  await expect(page.getByLabel('Mesto opravila web-1', { exact: true })).toHaveText('2')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 20.')
  for (let redo = 0; redo < 20; redo += 1) {
    await page.getByRole('button', { name: 'Ponovi premik', exact: true }).click()
  }
  await expect(page.getByLabel('Mesto opravila web-1', { exact: true })).toHaveText('22')
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
})

test('reset is undoable while project switching and edge projects remain usable', async ({ page }) => {
  const writes = await mount(page, records(3, 0))
  await page.getByRole('button', { name: 'Premakni web-2 gor', exact: true }).click()
  await page.getByRole('button', { name: 'Začetni vrstni red', exact: true }).click()
  await expect.poll(() => visibleIds(page)).toEqual(['web-1', 'web-2', 'web-3'])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Razveljavi premik', exact: true }).click()
  await expect.poll(() => visibleIds(page)).toEqual(['web-2', 'web-1', 'web-3'])

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: /Premakni .+ (gor|dol)/ })).toHaveCount(0)
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova', exact: true }).click()
  await expect.poll(() => visibleIds(page)).toEqual(['web-1', 'web-2', 'web-3'])
  await page.getByRole('button', { name: 'Premakni web-2 gor', exact: true }).click()
  await page.reload()
  await expect.poll(() => visibleIds(page)).toEqual(['web-1', 'web-2', 'web-3'])
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  expect(writes).toEqual([])
  const state = await (await page.request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
})

test('one-task project has no valid moves and mobile layout stays within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page, records(1, 1))
  await expect(page.getByRole('button', { name: 'Premakni web-1 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-1 dol', exact: true })).toBeDisabled()
  await expect(page.getByRole('status', { name: 'Zgodovina vrstnega reda' })).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
