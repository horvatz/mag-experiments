import { expect, test, type Page } from '@playwright/test'
import type { Task } from '../../shared/types.ts'

const records: Task[] = [
  { id: 'web-02', projectId: 'web', title: 'Zapis, "citat"', description: 'Prva vrstica\nDruga vrstica; čšž', status: 'done', assignee: 'Živa Kovač', dueDate: '2026-09-22' },
  { id: 'web-01', projectId: 'web', title: '  +SUM(A1)', description: 'Navaden opis', status: 'todo', assignee: 'Ana Novak', dueDate: '2026-09-18' },
  { id: 'web-03', projectId: 'web', title: '-2', description: 'Unicode ž', status: 'in_progress', assignee: 'Luka Kovač', dueDate: '2026-09-25' },
  { id: 'launch-01', projectId: 'launch', title: 'Drugi projekt', description: 'Opis', status: 'todo', assignee: 'Maja Zupan', dueDate: '2026-10-01' },
]

async function mount(page: Page, tasks: Task[] = records) {
  const writes: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method())
  })
  await page.route('**/api/**', async (route) => {
    const { pathname } = new URL(route.request().url())
    if (route.request().method() !== 'GET') return route.continue()
    if (pathname === '/api/projects') return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
    const match = /^\/api\/projects\/([^/]+)\/tasks$/.exec(pathname)
    if (match) return route.fulfill({ json: tasks.filter((task) => task.projectId === decodeURIComponent(match[1])) })
    return route.continue()
  })
  await page.goto('/#/projects/web')
  await expect(page.getByRole('heading', { name: 'Spletna prenova', exact: true })).toBeVisible()
  return writes
}

async function download(page: Page) {
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Izvozi CSV' }).click()
  const file = await pending
  const stream = await file.createReadStream()
  if (!stream) throw new Error('Prenesene datoteke ni mogoče prebrati')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return { name: file.suggestedFilename(), text: Buffer.concat(chunks).toString('utf8') }
}

test('P06 fixture serves project data through GET and preserves API read behavior', async ({ page }) => {
  const writes = await mount(page)
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(4)
  await expect(page.locator('[data-task-id="web-02"]')).toBeVisible()
  expect(writes).toEqual([])
})

test('default CSV keeps source order, columns, Unicode fields, BOM and final CRLF', async ({ page }) => {
  const writes = await mount(page)
  const file = await download(page)
  expect(file.name).toBe('folio-web.csv')
  expect(file.text.startsWith('\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n')).toBe(true)
  expect(file.text.endsWith('\r\n')).toBe(true)
  expect(file.text.indexOf('"web-02"')).toBeLessThan(file.text.indexOf('"web-01"'))
  expect(file.text.indexOf('"web-01"')).toBeLessThan(file.text.indexOf('"web-03"'))
  expect(file.text).toContain('"done";"Živa Kovač";"2026-09-22";"Prva vrstica\nDruga vrstica; čšž"')
  expect(writes).toEqual([])
})

test('selected columns use canonical order and filter only the exported rows', async ({ page }) => {
  await mount(page)
  for (const column of ['projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  }
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await page.getByRole('combobox', { name: 'Filter izvoza' }).selectOption('done')
  await page.getByRole('combobox', { name: 'Ločilo CSV' }).selectOption(',')
  const file = await download(page)
  expect(file.text).toBe('\uFEFF"id","title"\r\n"web-02","Zapis, ""citat"""\r\n')
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(4)
})

test('empty selection and empty filtered result disable export, then selecting a column enables it', async ({ page }) => {
  await mount(page)
  const button = page.getByRole('button', { name: 'Izvozi CSV' })
  for (const column of ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']) {
    await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).uncheck()
  }
  await expect(button).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await expect(button).toBeEnabled()
  await page.getByRole('combobox', { name: 'Filter izvoza' }).selectOption('done')
  await expect(button).toBeEnabled()
  await page.getByRole('combobox', { name: 'Filter izvoza' }).selectOption('all')
  const emptyPage = await page.context().newPage()
  const emptyWrites = await mount(emptyPage, [])
  await expect(emptyPage.getByRole('button', { name: 'Izvozi CSV' })).toBeDisabled()
  expect(emptyWrites).toEqual([])
  await emptyPage.close()
})

test('CSV quotes field content and neutralizes formula prefixes without stripping newlines', async ({ page }) => {
  await mount(page)
  const file = await download(page)
  expect(file.text).toContain('"Zapis, ""citat"""')
  expect(file.text).toContain('"\'  +SUM(A1)"')
  expect(file.text).toContain('"Prva vrstica\nDruga vrstica; čšž"')
  expect(file.text).toContain('"in_progress";"Luka Kovač";"2026-09-25"')
})

test('view switch preserves settings and identical bytes; project change and refresh reset them', async ({ page }) => {
  await mount(page)
  await page.getByRole('combobox', { name: 'Filter izvoza' }).selectOption('done')
  await page.getByRole('combobox', { name: 'Ločilo CSV' }).selectOption(',')
  const first = await download(page)
  await page.getByRole('button', { name: 'Tabla', exact: true }).click()
  const second = await download(page)
  expect(second).toEqual(first)
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Jesenska kampanja' }).click()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV' })).toHaveValue(';')
  await expect(page.getByRole('checkbox', { name: 'Stolpec id' })).toBeChecked()
  await page.getByRole('combobox', { name: 'Filter izvoza' }).selectOption('todo')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Filter izvoza' })).toHaveValue('all')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV' })).toHaveValue(';')
})

test('export controls fit 390px and never write to the API', async ({ page }) => {
  const writes = await mount(page)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await download(page)
  expect(writes).toEqual([])
  await expect(page.getByRole('button', { name: 'Preglednica', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[aria-label="Pregled stanj opravil"]')).toBeVisible()
})
