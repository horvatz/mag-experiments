import { expect, test, type Page } from '@playwright/test'
import type { Project, Task, TaskStatus } from '../../shared/types.ts'
import { serializeTasksCsv, type CsvColumn } from '../../src/csv.ts'

const columns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
const projects: Project[] = [{ id: 'atlas-7', name: 'Atlas' }, { id: 'beta-42', name: 'Drugi projekt' }]
const task = (id: string, values: Partial<Task> = {}): Task => ({
  id, projectId: 'atlas-7', title: 'Enak naslov', status: 'todo', assignee: 'Živa Kovač',
  dueDate: '2028-02-29', description: 'Opis 東京 🐈', ...values,
})

// Independent reader: validates quoted fields and record framing, including embedded CR/LF.
function readCsv(bytes: Buffer, delimiter = ';') {
  expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
  const text = bytes.subarray(3).toString('utf8')
  const rows: string[][] = []
  let position = 0
  let row: string[] = []
  while (position < text.length) {
    expect(text[position++]).toBe('"')
    let value = ''
    let closed = false
    while (position < text.length) {
      const char = text[position++]
      if (char !== '"') value += char
      else if (text[position] === '"') { value += '"'; position++ }
      else { closed = true; break }
    }
    expect(closed).toBe(true)
    row.push(value)
    if (text[position] === delimiter) position++
    else {
      expect(text.slice(position, position + 2)).toBe('\r\n')
      position += 2
      rows.push(row)
      row = []
    }
  }
  expect(row).toEqual([])
  expect(text.endsWith('\r\n')).toBe(true)
  return rows
}

async function mount(page: Page, records: Task[]) {
  await page.request.post('/__test/reset')
  const writes: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      writes.push(`${request.method()} ${request.url()}`)
    }
  })
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== 'GET') return route.continue()
    if (path === '/api/projects') return route.fulfill({ json: projects })
    const projectMatch = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (projectMatch) return route.fulfill({ json: records.filter((entry) => entry.projectId === decodeURIComponent(projectMatch[1])) })
    const taskMatch = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (taskMatch) return route.fulfill({ json: records.find((entry) => entry.id === decodeURIComponent(taskMatch[1])) })
    return route.continue()
  })
  await page.goto('/#/projects/atlas-7')
  await expect(page.getByRole('region', { name: 'Nastavitve izvoza CSV' })).toBeVisible()
  return writes
}

const checkbox = (page: Page, column: string) => page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })
const select = (page: Page, name: string, value: string) => page.getByRole('combobox', { name, exact: true }).selectOption(value)
const button = (page: Page) => page.getByRole('button', { name: 'Izvozi CSV', exact: true })

async function chooseColumns(page: Page, selected: readonly string[]) {
  for (const column of columns) await checkbox(page, column).uncheck()
  for (const column of selected) await checkbox(page, column).check()
}

async function download(page: Page) {
  const pending = page.waitForEvent('download')
  await button(page).click()
  const file = await pending
  const stream = await file.createReadStream()
  if (!stream) throw new Error('Prenos nima vsebine')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  expect(await file.failure()).toBeNull()
  return { name: file.suggestedFilename(), bytes: Buffer.concat(chunks) }
}

async function expectDefaults(page: Page) {
  for (const column of columns) await expect(checkbox(page, column)).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
}

async function expectIds(page: Page, records: Task[], ordered = true) {
  const expected = records.map((entry) => entry.id)
  await expect.poll(() => page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-task-id'))).then((ids) => ordered ? ids : ids.sort())).toEqual(ordered ? expected : expected.sort())
}

const mixed = Array.from({ length: 13 }, (_, index) => task(`item-${[9, 2, 14, 1, 7, 4, 18, 3, 6, 22, 5, 11, 8][index]}`, {
  status: (['todo', 'done', 'in_progress'] as TaskStatus[])[index % 3],
  ...(index === 0 ? { title: 'Čšž, "citat"; 🐈', description: 'Prva\rDruga\nTretja\r\n Četrta;,"' } : {}),
  ...(index === 3 ? { title: ' \t\r\n=1+2', assignee: '\t+Živa', description: '\n@SUM("x")' } : {}),
}))

test('A01: exact CSV bytes, canonical columns, both delimiters and preserved content', () => {
  const records = [task('z-9', { title: 'Čšž, "🐈"; 東京', status: 'in_progress', assignee: ' Ana \tNovak ', description: 'Prva\rDruga\nTretja\r\n Četrta;,"' }), task('a-1', { description: '' })]
  const goldenRows = [
    ['"id"', '"projectId"', '"title"', '"status"', '"assignee"', '"dueDate"', '"description"'],
    ['"z-9"', '"atlas-7"', '"Čšž, ""🐈""; 東京"', '"in_progress"', '" Ana \tNovak "', '"2028-02-29"', '"Prva\rDruga\nTretja\r\n Četrta;,"""'],
    ['"a-1"', '"atlas-7"', '"Enak naslov"', '"todo"', '"Živa Kovač"', '"2028-02-29"', '""'],
  ]
  for (const delimiter of [';', ','] as const) {
    const expected = Buffer.from('\uFEFF' + goldenRows.map((row) => row.join(delimiter) + '\r\n').join(''))
    expect(Buffer.from(serializeTasksCsv(records, [...columns].reverse(), delimiter))).toEqual(expected)
    expect(readCsv(expected, delimiter)).toEqual([columns, ...records.map((entry) => columns.map((column) => entry[column]))])
  }
})

test('A02: formula prefix matrix in every data column, exact whitespace and negative cases', () => {
  // Synthetic values exercise the serializer for every column; UI fixtures retain valid IDs/statuses/dates.
  for (const column of columns) {
    for (const prefix of ['', ' ', '\t', '\r', '\n', ' \t\r\n \t']) {
      for (const marker of ['=', '+', '-', '@']) {
        const value = `${prefix}${marker}SUM("čšž");東京`
        const csv = serializeTasksCsv([task('id-1', { [column]: value })], [column], ';')
        expect(readCsv(Buffer.from(csv))).toEqual([[column], [`'${value}`]])
      }
    }
    for (const value of ['', ' \t\r\n', 'normal = 1', "'=SUM(1)", '\u00a0=1', '\v+1', '\f-1', '\u2003@x', 'text\n=1', ' čšž ']) {
      const csv = serializeTasksCsv([task('id-1', { [column]: value })], [column], ',')
      expect(readCsv(Buffer.from(csv), ',')).toEqual([[column], [value]])
    }
  }
})

test('A03: frozen sources and selections remain unchanged, empty inputs produce no CSV', () => {
  const records = Object.freeze(mixed.map((entry) => Object.freeze({ ...entry })))
  const selected: readonly CsvColumn[] = Object.freeze(['description', 'id'])
  const before = JSON.stringify(records)
  serializeTasksCsv(records, selected, ';')
  serializeTasksCsv(records, selected, ',')
  expect(JSON.stringify(records)).toBe(before)
  expect(selected).toEqual(['description', 'id'])
  expect(serializeTasksCsv([], columns, ';')).toBe('')
  expect(serializeTasksCsv(records, [], ';')).toBe('')
})

test('A04: 13 unsorted tasks, all filters, changed settings, actual download bytes and unchanged UI', async ({ page }) => {
  const writes = await mount(page, [...mixed, task('other-1', { projectId: 'beta-42' })])
  await expectDefaults(page)
  await expectIds(page, mixed)
  const initialUrl = page.url()
  const initialPages = page.context().pages().length
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  const first = await download(page)
  expect(first.name).toBe('folio-atlas-7.csv')
  const expected = mixed.map((entry, index) => index === 3 ? { ...entry, title: "' \t\r\n=1+2", assignee: "'\t+Živa", description: "'\n@SUM(\"x\")" } : entry)
  expect(readCsv(first.bytes)).toEqual([columns, ...expected.map((entry) => columns.map((column) => entry[column]))])
  await chooseColumns(page, ['description', 'title', 'id'])
  await select(page, 'Ločilo CSV', ',')
  for (const filter of ['todo', 'in_progress', 'done', 'all']) {
    await select(page, 'Filter izvoza', filter)
    const file = await download(page)
    const rows = expected.filter((entry) => filter === 'all' || entry.status === filter)
    expect(readCsv(file.bytes, ',')).toEqual([['id', 'title', 'description'], ...rows.map((entry) => [entry.id, entry.title, entry.description])])
    await expectIds(page, mixed)
    await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['5', '4', '4'])
  }
  expect(page.url()).toBe(initialUrl)
  expect(page.context().pages()).toHaveLength(initialPages)
  expect(requests).toEqual([])
  expect(writes).toEqual([])
})

test('A05: no columns or matching rows disables downloads; reselecting follows both conditions', async ({ page }) => {
  await mount(page, [task('single-5')])
  const downloads: string[] = []
  page.on('download', (file) => downloads.push(file.suggestedFilename()))
  await chooseColumns(page, [])
  await expect(button(page)).toBeDisabled()
  await expect(page.getByRole('status')).toContainText('Izberi vsaj en stolpec')
  await button(page).evaluate((element: HTMLButtonElement) => element.click())
  await checkbox(page, 'title').check()
  await expect(button(page)).toBeEnabled()
  for (const filter of ['done', 'in_progress']) {
    await select(page, 'Filter izvoza', filter)
    await expect(button(page)).toBeDisabled()
    await button(page).evaluate((element: HTMLButtonElement) => element.click())
  }
  await checkbox(page, 'title').uncheck()
  await checkbox(page, 'id').check()
  await expect(button(page)).toBeDisabled()
  await expect(page.getByRole('status')).toContainText('ni opravil')
  await select(page, 'Filter izvoza', 'todo')
  await expect(button(page)).toBeEnabled()
  expect(downloads).toEqual([])
  expect(readCsv((await download(page)).bytes)).toEqual([['id'], ['single-5']])
  expect(downloads).toHaveLength(1)
})

test('A06: both empty projects remain disabled in both views for every filter', async ({ page }) => {
  await mount(page, [])
  const downloads: string[] = []
  page.on('download', (file) => downloads.push(file.suggestedFilename()))
  for (const project of projects) {
    await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: project.name, exact: true }).click()
    for (const view of ['Tabla', 'Preglednica']) {
      await page.getByRole('button', { name: view, exact: true }).click()
      for (const filter of ['all', 'todo', 'in_progress', 'done']) {
        await select(page, 'Filter izvoza', filter)
        await expect(button(page)).toBeDisabled()
        await button(page).evaluate((element: HTMLButtonElement) => element.click())
      }
    }
    await expect(page.locator('[data-task-id]')).toHaveCount(0)
    await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(['0', '0', '0'])
  }
  expect(downloads).toEqual([])
})

test('A07: project changes, return navigation and refresh reset all export settings', async ({ page }) => {
  await mount(page, [task('first-3'), task('second-9', { projectId: 'beta-42', status: 'done' })])
  const customize = async () => {
    await chooseColumns(page, ['description'])
    await select(page, 'Ločilo CSV', ',')
    await select(page, 'Filter izvoza', 'done')
  }
  await customize()
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name: 'Drugi projekt', exact: true }).click()
  await expectDefaults(page)
  const second = await download(page)
  expect(second.name).toBe('folio-beta-42.csv')
  expect(readCsv(second.bytes)[1].slice(0, 2)).toEqual(['second-9', 'beta-42'])
  await customize()
  await page.goBack()
  await expectDefaults(page)
  expect(readCsv((await download(page)).bytes)[1].slice(0, 2)).toEqual(['first-3', 'atlas-7'])
  await customize()
  await page.reload()
  await expectDefaults(page)
  await expect(button(page)).toBeEnabled()
  expect(readCsv((await download(page)).bytes)[1][0]).toBe('first-3')
})

test('A08: all settings and bytes survive table, board and details; no API writes', async ({ page }) => {
  const writes = await mount(page, mixed)
  const before = await (await page.request.get('/__test/state')).json()
  await chooseColumns(page, ['description', 'assignee', 'id'])
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'todo')
  const first = await download(page)
  for (const view of ['Tabla', 'Preglednica', 'Tabla']) {
    await page.getByRole('button', { name: view, exact: true }).click()
    await expectIds(page, mixed, view === 'Preglednica')
    await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(',')
    await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('todo')
    for (const column of columns) await expect(checkbox(page, column)).toBeChecked({ checked: ['description', 'assignee', 'id'].includes(column) })
    expect(await download(page)).toEqual(first)
    await page.locator('[data-task-id="item-1"]').getByRole('link').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog').locator('.description p')).toHaveText(mixed[3].description)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    expect(await download(page)).toEqual(first)
  }
  expect(writes).toEqual([])
  expect(await (await page.request.get('/__test/state')).json()).toEqual(before)
})

test('A09: 390px layout, keyboard controls and real mobile download', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page, mixed)
  const checkboxTitle = checkbox(page, 'title')
  await checkboxTitle.focus()
  await page.keyboard.press('Space')
  await expect(checkboxTitle).not.toBeChecked()
  expect(await checkboxTitle.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Space')
  await select(page, 'Ločilo CSV', ',')
  for (const view of ['Preglednica', 'Tabla']) {
    await page.getByRole('button', { name: view, exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const controls = page.getByRole('region', { name: 'Nastavitve izvoza CSV' })
    const bounds = await controls.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    expect(readCsv((await download(page)).bytes, ',')).toHaveLength(14)
  }
  await page.screenshot({ path: 'docs/agent/mobile.png', fullPage: true })
})

test('A10: local download preparation error is recoverable without changing settings', async ({ page }) => {
  await mount(page, [task('single-5')])
  await page.evaluate(() => {
    const original = URL.createObjectURL
    URL.createObjectURL = () => {
      URL.createObjectURL = original
      throw new Error('Simulirana napaka priprave prenosa')
    }
  })
  await button(page).click()
  await expect(page.getByRole('alert')).toContainText('CSV se ni mogel pripraviti')
  await expectDefaults(page)
  expect(readCsv((await download(page)).bytes)[1][0]).toBe('single-5')
  await expect(page.getByRole('alert')).toHaveCount(0)
})
