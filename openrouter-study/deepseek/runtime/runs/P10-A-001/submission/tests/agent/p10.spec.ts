import { expect, test, type Page } from '@playwright/test'

type Task = { id: string; projectId: string; title: string; description: string; status: 'todo' | 'in_progress' | 'done'; assignee: string; dueDate: string }

const makeTask = (id: string, values: Partial<Task> = {}): Task => ({ id, projectId: 'web', title: 'Opravilo ' + id, description: 'Opis opravila ' + id, status: 'todo', assignee: 'Ana Novak', dueDate: '2026-09-21', ...values })

const records: Task[] = [
  makeTask('web-01', { title: 'Pregled vsebine', status: 'in_progress', dueDate: '2026-09-18' }),
  makeTask('web-02', { title: 'Pregled vsebine', assignee: 'Luka Kovač', dueDate: '2026-09-22' }),
  makeTask('web-03', { title: 'Čšž – "navedek"', status: 'done', dueDate: '2026-09-16' }),
  makeTask('web-04', { title: 'Alfa 10', assignee: 'Maja Zupan', dueDate: '2026-09-28' }),
  makeTask('web-05', { title: 'alfa 2', status: 'in_progress', dueDate: '2026-09-29' }),
  makeTask('web-06', { title: 'Zapis, "citat"', status: 'done', assignee: 'Živa Kovač', dueDate: '2026-09-21' }),
  makeTask('web-07', { title: '=SUM(A1)', assignee: 'Črt', dueDate: '2026-09-20' }),
  makeTask('web-08', { title: 'Dodatno opravilo', assignee: 'Maja Zupan', dueDate: '2026-10-01' }),
  makeTask('web-09', { title: 'Pregled vsebine', dueDate: '2026-10-02' }),
  makeTask('web-10', { title: 'Še eno', status: 'in_progress', dueDate: '2026-10-03' }),
  makeTask('web-11', { title: 'Deseto', status: 'done', dueDate: '2026-10-04' }),
  makeTask('web-12', { title: 'Dvanajsto', dueDate: '2026-10-05' }),
  makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt', dueDate: '2026-09-24' }),
  makeTask('launch-02', { projectId: 'launch', title: 'Drugi projekt', status: 'done', dueDate: '2026-09-25' }),
]

async function mount(page: Page, tasks: Task[] = records, hash = '#/projects/web') {
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
    if (project) return route.fulfill({ json: tasks.filter((task) => task.projectId === decodeURIComponent(project[1])) })
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const task = tasks.find((entry) => entry.id === decodeURIComponent(detail[1]))
      return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }
    return route.continue()
  })
  await page.goto('/' + hash)
  await expect(page.getByRole('heading', { name: hash.includes('launch') ? 'Jesenska kampanja' : 'Spletna prenova', exact: true })).toBeVisible()
  return writes
}

const ids = (page: Page): Promise<string[]> => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id') as string))
const webIds = records.filter((task) => task.projectId === 'web').map((task) => task.id)
const click = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
const status = (page: Page) => page.getByRole('status', { name: 'Zgodovina vrstnega reda' })
const rank = (page: Page, id: string) => page.getByLabel(`Mesto opravila ${id}`, { exact: true })
const summary = (page: Page) => page.locator('[aria-label="Pregled stanj opravil"] strong')

async function expectIds(page: Page, values: string[]) {
  await expect.poll(() => ids(page)).toEqual(values)
}

test('T01: initial order, ranks, duplicate titles and board relative order', async ({ page }) => {
  const writes = await mount(page)
  await expectIds(page, webIds)
  for (const [index, id] of webIds.entries()) await expect(rank(page, id)).toHaveText(String(index + 1))
  await expect(summary(page)).toHaveText(['6', '3', '3'])

  await click(page, 'Tabla')
  const board = page.getByRole('region', { name: 'Tabla opravil', exact: true })
  await expect(board).toBeVisible()
  const todoColumnIds = await page.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
  expect(todoColumnIds).toEqual(webIds.filter((id) => records.find((task) => task.id === id)!.status === 'todo'))
  await expect(board.locator('[data-task-id="web-02"]')).toHaveCount(1)
  await expect(board.locator('[data-task-id="web-02"]').getByRole('link')).toHaveAttribute('href', '#/projects/web/tasks/web-02?view=board')
  await expect(rank(page, 'web-12')).toHaveText('12')
  expect(writes).toEqual([])
  expect(await (await page.request.get('/__test/state')).json()).toMatchObject({ saveRequests: 0 })
})

test('T02: moves swap global neighbours and keep task fields and counts', async ({ page }) => {
  const writes = await mount(page)
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Premakni web-12 dol', exact: true })).toBeDisabled()
  await click(page, 'Premakni web-02 dol')
  await expectIds(page, ['web-01', 'web-03', 'web-02', ...webIds.slice(3)])
  const row = page.locator('[data-task-id="web-02"]')
  await expect(row.getByRole('link')).toContainText('Pregled vsebine')
  await expect(row.getByText('Luka Kovač', { exact: true })).toBeVisible()
  await expect(row.getByText('Pripravljeno', { exact: true })).toBeVisible()
  await expect(row.locator('time')).toHaveAttribute('datetime', '2026-09-22')
  await expect(summary(page)).toHaveText(['6', '3', '3'])
  await expect(status(page)).toHaveText('Razveljavitve: 1. Ponovitve: 0.')

  await click(page, 'Tabla')
  await click(page, 'Premakni web-12 gor')
  await expect(rank(page, 'web-12')).toHaveText('11')
  await expect(page.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('[data-task-id="web-12"]')).toHaveCount(1)
  expect(writes).toEqual([])
})

test('T03: undo and redo keep full permutations', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-01 dol')
  await click(page, 'Premakni web-01 dol')
  await click(page, 'Premakni web-05 gor')
  const afterMoves = await ids(page)
  expect([...afterMoves].sort()).toEqual([...webIds].sort())
  await click(page, 'Razveljavi premik')
  await click(page, 'Razveljavi premik')
  await expect(status(page)).toHaveText('Razveljavitve: 1. Ponovitve: 2.')
  await expectIds(page, ['web-02', 'web-01', ...webIds.slice(2)])
  await click(page, 'Ponovi premik')
  await click(page, 'Ponovi premik')
  await expect(status(page)).toHaveText('Razveljavitve: 3. Ponovitve: 0.')
  await expectIds(page, afterMoves)
})

test('T04: a valid move clears redo, a blocked edge move does not', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-02 gor')
  await click(page, 'Razveljavi premik')
  await expect(status(page)).toHaveText('Razveljavitve: 0. Ponovitve: 1.')
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await click(page, 'Premakni web-03 gor')
  await expect(status(page)).toHaveText('Razveljavitve: 1. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Ponovi premik', exact: true })).toBeDisabled()

  await click(page, 'Premakni web-02 gor')
  await click(page, 'Razveljavi premik')
  await expect(status(page)).toHaveText('Razveljavitve: 1. Ponovitve: 1.')
  await expect(page.getByRole('button', { name: 'Premakni web-01 gor', exact: true })).toBeDisabled()
  await expect(status(page)).toHaveText('Razveljavitve: 1. Ponovitve: 1.')
})

test('T05: undo history is capped at 20 and all undone steps can be redone', async ({ page }) => {
  await mount(page)
  const states: string[][] = []
  const working = [...webIds]
  for (let step = 0; step < 21; step += 1) {
    const last = working[working.length - 1]
    await click(page, `Premakni ${last} gor`)
    working[working.length - 1] = working[working.length - 2]
    working[working.length - 2] = last
    states.push([...working])
  }
  await expectIds(page, states[20])
  await expect(status(page)).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  for (let step = 0; step < 20; step += 1) await click(page, 'Razveljavi premik')
  await expect(status(page)).toHaveText('Razveljavitve: 0. Ponovitve: 20.')
  await expectIds(page, states[0])
  await expect(page.getByRole('button', { name: 'Razveljavi premik', exact: true })).toBeDisabled()
  for (let step = 0; step < 20; step += 1) await click(page, 'Ponovi premik')
  await expect(status(page)).toHaveText('Razveljavitve: 20. Ponovitve: 0.')
  await expectIds(page, states[20])
})

test('T06: reset returns to the origin as one undoable action and clears redo', async ({ page }) => {
  await mount(page)
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await click(page, 'Premakni web-02 gor')
  await click(page, 'Premakni web-05 gor')
  const beforeReset = await ids(page)
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeEnabled()
  await click(page, 'Začetni vrstni red')
  await expectIds(page, webIds)
  await expect(status(page)).toHaveText('Razveljavitve: 3. Ponovitve: 0.')
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeDisabled()
  await click(page, 'Razveljavi premik')
  await expectIds(page, beforeReset)
  await click(page, 'Ponovi premik')
  await expectIds(page, webIds)

  await click(page, 'Razveljavi premik')
  await expect(status(page)).toHaveText('Razveljavitve: 2. Ponovitve: 1.')
  await expect(page.getByRole('button', { name: 'Začetni vrstni red', exact: true })).toBeEnabled()
  await click(page, 'Začetni vrstni red')
  await expectIds(page, webIds)
  await expect(status(page)).toHaveText('Razveljavitve: 3. Ponovitve: 0.')
})

test('T07: view, details, project switch and refresh preserve or reset state', async ({ page }) => {
  await mount(page)
  await click(page, 'Premakni web-02 gor')
  await click(page, 'Tabla')
  await expect(status(page)).toHaveText('Razveljavitve: 1. Ponovitve: 0.')
  await expect(rank(page, 'web-02')).toHaveText('1')
  await page.locator('[data-task-id="web-03"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(status(page)).toHaveText('Razveljavitve: 1. Ponovitve: 0.')
  await click(page, 'Razveljavi premik')
  await expect(rank(page, 'web-02')).toHaveText('2')
  await expect(status(page)).toHaveText('Razveljavitve: 0. Ponovitve: 1.')
  await click(page, 'Ponovi premik')
  await expect(rank(page, 'web-02')).toHaveText('1')

  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(status(page)).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  await expectIds(page, ['launch-01', 'launch-02'])
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova', exact: true }).click()
  await click(page, 'Preglednica')
  await expectIds(page, webIds)
  await expect(status(page)).toHaveText('Razveljavitve: 0. Ponovitve: 0.')

  await click(page, 'Premakni web-03 gor')
  await page.reload()
  await expectIds(page, webIds)
  await expect(status(page)).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
})

test('T08: empty and single-task projects stay usable', async ({ page }) => {
  await mount(page, [], '#/projects/launch')
  await expect(page.getByRole('heading', { name: 'V tem projektu še ni opravil' })).toBeVisible()
  await expect(status(page)).toHaveText('Razveljavitve: 0. Ponovitve: 0.')
  for (const name of ['Razveljavi premik', 'Ponovi premik', 'Začetni vrstni red']) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()

  await mount(page, [makeTask('solo-01', { title: 'Samo eno' })])
  await expect(page.locator('[data-task-id="solo-01"]')).toBeVisible()
  await expect(rank(page, 'solo-01')).toHaveText('1')
  for (const name of ['Premakni solo-01 gor', 'Premakni solo-01 dol', 'Razveljavi premik', 'Ponovi premik', 'Začetni vrstni red']) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
})

test('T09: no horizontal page overflow at 390px and no writes after reordering', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await click(page, 'Premakni web-02 gor')
  await click(page, 'Tabla')
  await click(page, 'Premakni web-03 gor')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(status(page)).toHaveText('Razveljavitve: 2. Ponovitve: 0.')
  expect(writes).toEqual([])
  expect(await (await page.request.get('/__test/state')).json()).toMatchObject({ saveRequests: 0 })
})
