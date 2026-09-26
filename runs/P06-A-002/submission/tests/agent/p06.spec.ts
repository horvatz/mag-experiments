import { expect, test, type Page } from '@playwright/test'
import type { Project, Task, TaskStatus } from '../../shared/types.ts'
import { createCsv } from '../../src/csv.ts'

const keys = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
const header = '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n'
const projects: Project[] = [{ id: 'projekt-Z7', name: 'Spletni načrt' }, { id: 'drugi-4', name: 'Drugi projekt' }]
const task = (id: string, values: Partial<Task> = {}): Task => ({
  id, projectId: projects[0].id, title: 'Enak naslov', status: 'todo',
  assignee: 'Živa 李', dueDate: '2028-02-29', description: '  Čšž 😀 – opis  ', ...values,
})
const records = [9, 2, 13, 1, 11, 6, 14, 4, 10, 3, 12, 8, 5, 7].map((n, i) => task(`naloga-${n}`, {
  status: (['done', 'todo', 'in_progress'] as TaskStatus[])[i % 3],
}))

async function mount(page: Page, tasks: Task[] = records, availableProjects = projects) {
  // A same-hash navigation can reuse React state; each fixture needs a fresh document.
  await page.goto('about:blank')
  await page.unroute('**/api/**')
  const writes: string[] = []
  const requests: string[] = []
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname
    requests.push(path)
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(`${request.method()} ${path}`)
  })
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/projects') return route.fulfill({ json: availableProjects })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) return route.fulfill({ json: tasks.filter((entry) => entry.projectId === decodeURIComponent(project[1])) })
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const entry = tasks.find((entry) => entry.id === decodeURIComponent(detail[1]))
      return route.fulfill({ status: entry ? 200 : 404, json: entry ?? { message: 'Opravilo ne obstaja.' } })
    }
    return route.continue()
  })
  await page.goto(`/#/projects/${availableProjects[0].id}`)
  await expect(page.getByRole('group', { name: 'Izvoz CSV', exact: true })).toBeVisible()
  return { writes, requests }
}

async function download(page: Page) {
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Izvozi CSV', exact: true }).click()
  const file = await pending
  const stream = await file.createReadStream()
  if (!stream) throw new Error('Prenos nima vsebine')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  expect(await file.failure()).toBeNull()
  const bytes = Buffer.concat(chunks)
  return { name: file.suggestedFilename(), bytes, text: bytes.toString('utf8') }
}

async function selectColumns(page: Page, selected: readonly string[]) {
  for (const key of keys) await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).setChecked(selected.includes(key))
}

async function defaults(page: Page) {
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
  await expect(page.getByRole('checkbox')).toHaveCount(7)
  for (const key of keys) await expect(page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true })).toBeChecked()
}

async function switchView(page: Page, view: 'Tabla' | 'Preglednica') {
  await page.getByRole('button', { name: view, exact: true }).click()
  await expect(page.getByRole('button', { name: view, exact: true })).toHaveAttribute('aria-pressed', 'true')
}

test('A01: defaults, 14 unsorted rows, Unicode, raw fields and local BOM download', async ({ page }) => {
  const { writes, requests } = await mount(page)
  await defaults(page)
  const originalUrl = page.url()
  const pages = page.context().pages().length
  const before = requests.length
  const file = await download(page)
  expect(file.name).toBe('folio-projekt-Z7.csv')
  expect([...file.bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
  const expected = header + records.map((entry) => `"${entry.id}";"projekt-Z7";"Enak naslov";"${entry.status}";"Živa 李";"2028-02-29";"  Čšž 😀 – opis  "\r\n`).join('')
  expect(file.bytes).toEqual(Buffer.from(expected, 'utf8'))
  expect(page.url()).toBe(originalUrl)
  expect(page.context().pages()).toHaveLength(pages)
  expect(requests.slice(before)).toEqual([])
  expect(writes).toEqual([])
})

test('A02: reverse selection order and successive downloads use current columns and delimiter', async ({ page }) => {
  await mount(page, [task('z-2', { description: 'a; b, "c"' })])
  await selectColumns(page, [])
  for (const key of ['description', 'title', 'id']) await page.getByRole('checkbox', { name: `Stolpec ${key}`, exact: true }).check()
  await page.getByRole('combobox', { name: 'Ločilo CSV', exact: true }).selectOption(',')
  expect((await download(page)).text).toBe('\uFEFF"id","title","description"\r\n"z-2","Enak naslov","a; b, ""c"""\r\n')
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).uncheck()
  await page.getByRole('combobox', { name: 'Ločilo CSV', exact: true }).selectOption(';')
  expect((await download(page)).text).toBe('\uFEFF"id";"description"\r\n"z-2";"a; b, ""c"""\r\n')
})

test('A03: no columns prevents download and reselecting one restores it', async ({ page }) => {
  await mount(page, [task('edina')])
  await selectColumns(page, [])
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await expect(button).toBeDisabled()
  let count = 0
  page.on('download', () => { count += 1 })
  await button.evaluate((element: HTMLButtonElement) => element.click())
  await page.getByRole('checkbox', { name: 'Stolpec description', exact: true }).check()
  await expect(button).toBeEnabled()
  expect(count).toBe(0)
  expect((await download(page)).text).toBe('\uFEFF"description"\r\n"  Čšž 😀 – opis  "\r\n')
  expect(count).toBe(1)
})

test('A04: every status filters only CSV; zero matches and both empty projects disable export', async ({ page }) => {
  const entries = [task('z', { status: 'done' }), task('b'), task('x', { status: 'in_progress' }), task('a', { status: 'done' })]
  const { writes } = await mount(page, entries)
  await selectColumns(page, ['id'])
  for (const [filter, expected] of [['done', '"z"\r\n"a"\r\n'], ['todo', '"b"\r\n'], ['in_progress', '"x"\r\n'], ['all', '"z"\r\n"b"\r\n"x"\r\n"a"\r\n']]) {
    await page.getByRole('combobox', { name: 'Filter izvoza', exact: true }).selectOption(filter)
    expect((await download(page)).text).toBe('\uFEFF"id"\r\n' + expected)
    await expect(page.locator('[data-task-id]')).toHaveCount(4)
    await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['1', '1', '2'])
  }
  await switchView(page, 'Tabla')
  await page.getByRole('combobox', { name: 'Filter izvoza', exact: true }).selectOption('todo')
  await expect(page.locator('[data-task-id]')).toHaveCount(4)
  await page.getByRole('navigation').getByRole('link', { name: 'Drugi projekt', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await switchView(page, 'Preglednica')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  expect(writes).toEqual([])

  await mount(page, [task('samo-todo')])
  await page.getByRole('combobox', { name: 'Filter izvoza', exact: true }).selectOption('done')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
  await expect(page.locator('[data-task-id]')).toHaveCount(1)
  await page.getByRole('combobox', { name: 'Filter izvoza', exact: true }).selectOption('all')
  await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeEnabled()

  await mount(page, [])
  for (const name of ['Spletni načrt', 'Drugi projekt']) {
    await page.getByRole('navigation').getByRole('link', { name, exact: true }).click()
    await expect(page.getByRole('button', { name: 'Izvozi CSV', exact: true })).toBeDisabled()
    await expect(page.locator('[data-task-id]')).toHaveCount(0)
  }
})

test('A05: nondefault settings and exact bytes survive both views and task details', async ({ page }) => {
  const { writes } = await mount(page)
  await selectColumns(page, ['id', 'title', 'status'])
  await page.getByRole('combobox', { name: 'Ločilo CSV', exact: true }).selectOption(',')
  await page.getByRole('combobox', { name: 'Filter izvoza', exact: true }).selectOption('in_progress')
  const first = await download(page)
  await switchView(page, 'Tabla')
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(',')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('in_progress')
  expect(await download(page)).toEqual(first)
  await page.locator('[data-task-id="naloga-2"]').getByRole('link').click()
  await expect(page.getByRole('dialog').getByText('Živa 李', { exact: true })).toBeVisible()
  await expect(page.getByRole('dialog').locator('time')).toHaveAttribute('datetime', '2028-02-29')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await switchView(page, 'Preglednica')
  expect(await download(page)).toEqual(first)
  await expect(page.locator('[data-task-id]')).toHaveCount(records.length)
  expect(writes).toEqual([])
})

test('A06: project changes, returning and refresh reset all settings and use current project ID', async ({ page }) => {
  await mount(page, [...records, task('drugi-99', { projectId: projects[1].id })])
  async function customize() {
    await selectColumns(page, ['title'])
    await page.getByRole('combobox', { name: 'Ločilo CSV', exact: true }).selectOption(',')
    await page.getByRole('combobox', { name: 'Filter izvoza', exact: true }).selectOption('done')
  }
  await customize()
  await switchView(page, 'Tabla')
  await page.getByRole('navigation').getByRole('link', { name: 'Drugi projekt', exact: true }).click()
  await defaults(page)
  const second = await download(page)
  expect(second.name).toBe('folio-drugi-4.csv')
  expect(second.text).toBe(header + '"drugi-99";"drugi-4";"Enak naslov";"todo";"Živa 李";"2028-02-29";"  Čšž 😀 – opis  "\r\n')
  await customize()
  await page.getByRole('navigation').getByRole('link', { name: 'Spletni načrt', exact: true }).click()
  await defaults(page)
  await customize()
  await page.reload()
  await defaults(page)
  await expect(page.getByRole('region', { name: 'Tabla opravil', exact: true })).toBeVisible()
  const refreshed = await download(page)
  expect(refreshed.name).toBe('folio-projekt-Z7.csv')
  expect(refreshed.text.startsWith(header)).toBe(true)
  expect(refreshed.text).toContain('"naloga-2"')
})

for (const separator of [';', ','] as const) {
  test(`A07: exact downloaded escaping, internal newlines, empty values and formula prefixes (${separator})`, async ({ page }) => {
    const specialProject = { id: '-projekt', name: 'Posebni projekt' }
    const entries = [task('-id', {
      projectId: specialProject.id, title: ' \t\r\n=SUM("a;b,c")',
      assignee: '+Živa', description: '\n@Prva\rDruga\nTretja\r\nčšž 😀;,"',
    }), task('drugi', { projectId: specialProject.id, title: '', description: '', assignee: ' \tObičajno ime  ' })]
    const before = structuredClone(entries)
    const { writes } = await mount(page, entries, [specialProject])
    await page.getByRole('combobox', { name: 'Ločilo CSV', exact: true }).selectOption(separator)
    const firstRow = ['"\'-id"', '"\'-projekt"', '"\' \t\r\n=SUM(""a;b,c"")"', '"todo"', '"\'+Živa"', '"2028-02-29"', '"\'\n@Prva\rDruga\nTretja\r\nčšž 😀;,"""']
    const secondRow = ['"drugi"', '"\'-projekt"', '""', '"todo"', '" \tObičajno ime  "', '"2028-02-29"', '""']
    const expected = '\uFEFF' + ['"id"', '"projectId"', '"title"', '"status"', '"assignee"', '"dueDate"', '"description"'].join(separator) + '\r\n' + firstRow.join(separator) + '\r\n' + secondRow.join(separator) + '\r\n'
    expect((await download(page)).bytes).toEqual(Buffer.from(expected, 'utf8'))
    expect(entries).toEqual(before)
    expect(writes).toEqual([])
  })
}

test('A08: formula rule handles only the specified whitespace, without mutating frozen inputs', () => {
  const prefixes = ['', ' ', '\t', '\r', '\n', ' \t\r\n \t']
  for (const prefix of prefixes) {
    for (const operator of ['=', '+', '-', '@']) {
      const value = prefix + operator + 'čšž "tekst"'
      const entry = Object.freeze(task('fixed', { title: value, assignee: value, description: value }))
      const entries = Object.freeze([entry])
      const expectedCell = `"'${prefix}${operator}čšž ""tekst"""`
      expect(createCsv(entries, ['description', 'assignee', 'title'], ';')).toBe('\uFEFF"title";"assignee";"description"\r\n' + [expectedCell, expectedCell, expectedCell].join(';') + '\r\n')
      expect(entry.description).toBe(value)
    }
  }
  for (const value of ['', ' ', '\t\r\n', 'čšž 李 😀', "'=1", 'text =1', '\u00a0=1', '\v+1', '\f-1', '\uFEFF@1', '  ordinary  ']) {
    expect(createCsv([task('fixed', { description: value })], ['description'], ',')).toBe(`\uFEFF"description"\r\n"${value}"\r\n`)
  }
})

test('A09: 390px controls stay inside viewport and keyboard export preserves read-only UI', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const { writes, requests } = await mount(page, records)
  for (const view of ['Preglednica', 'Tabla'] as const) {
    await switchView(page, view)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    for (const control of await page.getByRole('group', { name: 'Izvoz CSV', exact: true }).locator('input, select, button').all()) {
      const rect = await control.boundingBox()
      expect(rect).not.toBeNull()
      expect(rect!.x).toBeGreaterThanOrEqual(0)
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(390)
    }
  }
  const checkbox = page.getByRole('checkbox', { name: 'Stolpec description', exact: true })
  await checkbox.focus()
  await page.keyboard.press('Space')
  await expect(checkbox).not.toBeChecked()
  await page.keyboard.press('Space')
  await expect(checkbox).toBeChecked()
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await button.focus()
  const pending = page.waitForEvent('download')
  await page.keyboard.press('Enter')
  expect((await pending).suggestedFilename()).toBe('folio-projekt-Z7.csv')
  await page.screenshot({ path: 'docs/agent/mobile.png', fullPage: true })
  expect(writes).toEqual([])
  expect(requests.some((path) => path.startsWith('/__test/'))).toBe(false)
})
