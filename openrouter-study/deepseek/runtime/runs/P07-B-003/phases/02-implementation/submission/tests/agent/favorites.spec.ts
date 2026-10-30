import { expect, test, type Page } from '@playwright/test'

const KEY = 'folio:favorites:v1'

type Task = {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  assignee: string
  dueDate: string
}

const task = (id: string, projectId: string, values: Partial<Task> = {}): Task => ({
  id, projectId, title: `Opravilo ${id}`, description: `Opis ${id}`, status: 'todo', assignee: 'Ana Novak', dueDate: '2026-09-21', ...values,
})

const records: Task[] = [
  task('web-01', 'web', { status: 'in_progress' }),
  task('web-02', 'web', { title: 'Pregled vsebine' }),
  task('web-03', 'web', { title: 'Pregled vsebine', status: 'done' }),
  task('launch-01', 'launch', { title: 'Drugi projekt' }),
  task('launch-02', 'launch', { title: 'Drugi projekt', status: 'done' }),
]

async function mount(page: Page, hash = '#/projects/web') {
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== 'GET') return route.continue()
    if (path === '/api/projects') return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) return route.fulfill({ json: records.filter((entry) => entry.projectId === decodeURIComponent(project[1])) })
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const found = records.find((entry) => entry.id === decodeURIComponent(detail[1]))
      return found ? route.fulfill({ json: found }) : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }
    return route.continue()
  })
  await page.goto('/' + hash)
  await expect(page.getByRole('heading', { name: hash.includes('/launch') ? 'Jesenska kampanja' : 'Spletna prenova', exact: true })).toBeVisible()
}

const favorite = (page: Page, id: string) => page.getByRole('button', { name: `Priljubljeno opravilo ${id}`, exact: true })
const counter = (page: Page) => page.getByRole('status', { name: 'Število priljubljenih' })
const toggle = (page: Page) => page.getByRole('checkbox', { name: 'Prikaži le priljubljena' })
const clear = (page: Page) => page.getByRole('button', { name: 'Odstrani priljubljene tega projekta', exact: true })
const raw = (page: Page) => page.evaluate((key) => localStorage.getItem(key), KEY)
const shownIds = (page: Page) => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id')))
const seed = async (page: Page, value: string | null) => {
  await page.goto('/')
  await page.evaluate(([key, data]) => { if (data === null) localStorage.removeItem(key); else localStorage.setItem(key, data) }, [KEY, value] as const)
  await page.reload()
}

test('L01: equal titles toggle independently without opening details (R01)', async ({ page }) => {
  await mount(page)
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  await expect(favorite(page, 'web-02')).toHaveCount(1)
  expect(await favorite(page, 'web-02').evaluate((element) => element.closest('a'))).toBeNull()
  await favorite(page, 'web-02').click()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(() => location.hash)).toBe('#/projects/web')
  await favorite(page, 'web-02').click()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
})

test('L02: storage shape is versioned, unique, sorted, without task fields (R02)', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-03').click()
  await favorite(page, 'web-01').click()
  const value = await raw(page)
  expect(JSON.parse(value!)).toEqual({ version: 1, ids: ['web-01', 'web-03'] })
  const ids = (JSON.parse(value!) as { ids: string[] }).ids
  expect(ids.every((id) => typeof id === 'string')).toBe(true)
  expect(new Set(ids).size).toBe(ids.length)
  expect([...ids].sort()).toEqual(ids)
  expect(value).not.toContain('title')
  expect(value).not.toContain('projectId')
})

test('L03: load restores set, dedupes duplicates, keeps unknown ids (R03)', async ({ page }) => {
  await seed(page, JSON.stringify({ version: 1, ids: ['web-03', 'web-03', 'ghost-9'] }))
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 3.')
  await expect(favorite(page, 'web-03')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-task-id="ghost-9"]')).toHaveCount(0)
  expect(await raw(page)).toBe(JSON.stringify({ version: 1, ids: ['web-03', 'web-03', 'ghost-9'] }))
  await favorite(page, 'web-03').click()
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 3.')
  expect(JSON.parse((await raw(page))!)).toEqual({ version: 1, ids: ['ghost-9'] })
})

test('L04: invalid records mean empty set without rewriting storage (R04)', async ({ page }) => {
  await mount(page)
  const cases: (string | null)[] = [null, 'not json {', JSON.stringify({ version: 2, ids: ['web-01'] }), JSON.stringify({ version: 1 }), JSON.stringify({ version: 1, ids: ['web-01', 5] })]
  for (const value of cases) {
    await seed(page, value)
    await expect(counter(page)).toHaveText('Priljubljeno: 0 od 3.')
    await expect(page.locator('.favorite-button[aria-pressed="true"]')).toHaveCount(0)
    expect(await raw(page)).toBe(value)
  }
})

test('L05: filter shows exactly the favorites in source order (R05)', async ({ page }) => {
  await mount(page)
  await expect(toggle(page)).not.toBeChecked()
  await favorite(page, 'web-03').click()
  await favorite(page, 'web-01').click()
  await toggle(page).check()
  await expect.poll(() => shownIds(page)).toEqual(['web-01', 'web-03'])
  await toggle(page).uncheck()
  await expect.poll(() => shownIds(page)).toEqual(['web-01', 'web-02', 'web-03'])
})

test('L06: removing during active filter empties the view but keeps the control usable (R06)', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-02').click()
  await toggle(page).check()
  await favorite(page, 'web-02').click()
  await expect.poll(() => shownIds(page)).toEqual([])
  await expect(page.getByText('Ni priljubljenih opravil.', { exact: true })).toBeVisible()
  await expect(toggle(page)).toBeEnabled()
  await expect(toggle(page)).toBeChecked()
  await toggle(page).uncheck()
  await expect.poll(() => shownIds(page)).toEqual(['web-01', 'web-02', 'web-03'])
})

test('L07: table and board share set and filter, details stay reachable (R07)', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-02').click()
  await toggle(page).check()
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => shownIds(page)).toEqual(['web-02'])
  await page.getByRole('button', { name: 'Preglednica', exact: true }).click()
  await expect(toggle(page)).toBeChecked()
  await page.locator('[data-task-id="web-02"]').getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByText('web-02', { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
})

test('L08: project switch keeps favorites, resets filter; refresh too (R08)', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-01').click()
  await toggle(page).check()
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Jesenska kampanja', exact: true })).toBeVisible()
  await expect(toggle(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 2.')
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Spletna prenova', exact: true }).click()
  await expect(toggle(page)).not.toBeChecked()
  await expect(favorite(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(favorite(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await expect(toggle(page)).not.toBeChecked()
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 3.')
})

test('L09: remove project favorites keeps other and unknown ids (R09)', async ({ page }) => {
  await seed(page, JSON.stringify({ version: 1, ids: ['web-01', 'launch-01', 'ghost-1'] }))
  await expect(clear(page)).toBeEnabled()
  await clear(page).click()
  await expect(counter(page)).toHaveText('Priljubljeno: 0 od 3.')
  await expect(clear(page)).toBeDisabled()
  expect(JSON.parse((await raw(page))!)).toEqual({ version: 1, ids: ['ghost-1', 'launch-01'] })
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja', exact: true }).click()
  await expect(favorite(page, 'launch-01')).toHaveAttribute('aria-pressed', 'true')
  await expect(clear(page)).toBeEnabled()
})

test('L10: counter covers whole project, board counters count visible (R10)', async ({ page }) => {
  await mount(page)
  await favorite(page, 'web-01').click()
  await favorite(page, 'web-02').click()
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 3.')
  await toggle(page).check()
  await expect(counter(page)).toHaveText('Priljubljeno: 2 od 3.')
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  const board = page.getByRole('region', { name: 'Tabla opravil' })
  await expect(board.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('.column-count')).toHaveText('1')
  await expect(board.getByRole('region', { name: 'V delu', exact: true }).locator('.column-count')).toHaveText('1')
  await expect(board.getByRole('region', { name: 'Končano', exact: true }).locator('.column-count')).toHaveText('0')
  await favorite(page, 'web-02').click()
  await expect(board.getByRole('region', { name: 'Pripravljeno', exact: true }).locator('.column-count')).toHaveText('0')
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 3.')
})

test('L11: storage event syncs valid, null and ignores other keys without write-back (R11)', async ({ page }) => {
  await seed(page, JSON.stringify({ version: 1, ids: ['web-01'] }))
  const fire = (value: string | null, key = KEY) => page.evaluate(([k, v]) => window.dispatchEvent(new StorageEvent('storage', { key: k, newValue: v })), [key, value] as const)
  await fire(JSON.stringify({ version: 1, ids: ['web-02', 'ghost-2'] }))
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(favorite(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  expect(await raw(page)).toBe(JSON.stringify({ version: 1, ids: ['web-01'] }))
  await fire(JSON.stringify({ version: 1, ids: ['web-01'] }), 'other-key')
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await fire('broken json')
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'false')
  await fire(JSON.stringify({ version: 1, ids: ['web-01'] }))
  await expect(favorite(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
  await fire(null)
  await expect(favorite(page, 'web-01')).toHaveAttribute('aria-pressed', 'false')
  expect(await raw(page)).toBe(JSON.stringify({ version: 1, ids: ['web-01'] }))
})

test('L11b: unavailable storage keeps the app usable in memory with a warning (R11)', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('denied') }
  })
  await mount(page)
  await expect(page.getByRole('alert').filter({ hasText: 'shramba' })).toHaveCount(0)
  await favorite(page, 'web-02').click()
  await expect(page.getByRole('alert').filter({ hasText: 'shramba' })).toBeVisible()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
  await expect(counter(page)).toHaveText('Priljubljeno: 1 od 3.')
})

test('L11c: throwing localStorage access shows the warning and stays usable (R11)', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('denied') } })
  })
  await mount(page)
  await expect(page.getByRole('alert').filter({ hasText: 'shramba' })).toBeVisible()
  await favorite(page, 'web-01').click()
  await expect(favorite(page, 'web-01')).toHaveAttribute('aria-pressed', 'true')
})

test('L12: favorites stay local, no API writes, narrow layout intact (R12)', async ({ page }) => {
  const writes: string[] = []
  page.on('request', (request) => { if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method() + ' ' + request.url()) })
  await mount(page)
  await favorite(page, 'web-02').click()
  await toggle(page).check()
  await clear(page).click()
  await toggle(page).uncheck()
  expect(writes).toEqual([])
  const state = await (await page.request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(favorite(page, 'web-02')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await favorite(page, 'web-02').click()
  await expect(favorite(page, 'web-02')).toHaveAttribute('aria-pressed', 'true')
})
