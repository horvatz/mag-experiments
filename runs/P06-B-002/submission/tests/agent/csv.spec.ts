import { test, expect, type Page } from '@playwright/test'
import { CSV_COLUMNS, createCsv, csvValue, type CsvColumn } from '../../src/csv.ts'
import { board, details, expectIds, makeTask, mount, project, readonly, select, summary, table } from '../development/helpers.ts'

const checkbox = (page: Page, column: CsvColumn) => page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })
const exportButton = (page: Page) => page.getByRole('button', { name: 'Izvozi CSV', exact: true })

async function columns(page: Page, selected: readonly CsvColumn[]) {
  for (const column of CSV_COLUMNS) await checkbox(page, column).setChecked(selected.includes(column))
}

async function download(page: Page) {
  const pending = page.waitForEvent('download')
  await exportButton(page).click()
  const file = await pending
  const stream = await file.createReadStream()
  if (!stream) throw new Error('Manjka tok prenosa')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return { name: file.suggestedFilename(), bytes: Buffer.concat(chunks) }
}

async function defaults(page: Page) {
  for (const column of CSV_COLUMNS) await expect(checkbox(page, column)).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
}

test('A01: exact CSV preserves Unicode, quotes, separators and all newline forms without mutation', () => {
  const task = Object.freeze(makeTask('odd-7', {
    title: ' Živjo, "svet"; 🌍 ', status: 'in_progress', assignee: ' \t\r\n+Ana',
    dueDate: '2028-02-29', description: 'Prva\nDruga\rTretja\r\nČetrta; "ž"',
  }))
  const tasks = Object.freeze([task])
  const before = JSON.stringify(tasks)
  const expected = '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n' +
    '"odd-7";"web";" Živjo, ""svet""; 🌍 ";"in_progress";"\' \t\r\n+Ana";"2028-02-29";"Prva\nDruga\rTretja\r\nČetrta; ""ž"""\r\n'
  expect(createCsv(tasks, CSV_COLUMNS, ';', 'all')).toBe(expected)
  expect(createCsv(tasks, ['description', 'title', 'id'], ',', 'all')).toBe(
    '\uFEFF"id","title","description"\r\n"odd-7"," Živjo, ""svet""; 🌍 ","Prva\nDruga\rTretja\r\nČetrta; ""ž"""\r\n',
  )
  expect(createCsv(tasks, [], ';', 'all')).toBeNull()
  expect(createCsv(tasks, ['id'], ';', 'done')).toBeNull()
  expect(createCsv([], ['id'], ';', 'all')).toBeNull()
  expect(JSON.stringify(tasks)).toBe(before)
})

test('A02: formula protection covers all triggers and only specified leading whitespace', () => {
  for (const prefix of ['', ' ', '\t', '\r', '\n', ' \t\r\n  ']) {
    for (const trigger of ['=', '+', '-', '@']) {
      expect(csvValue(`${prefix}${trigger}1`)).toBe(`"'${prefix}${trigger}1"`)
    }
  }
  for (const value of ['', 'abc=1', "'=1", ' \t\r\n', '\u00A0=1', '\v=1', '\f+1', 'ž😀']) {
    expect(csvValue(value)).toBe(`"${value}"`)
  }
  const task = makeTask('=id', { projectId: '+project', title: '-title', assignee: '@name', description: '\t=description' })
  expect(createCsv([task], CSV_COLUMNS, ';', 'all')).toBe(
    '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n' +
    '"\'=id";"\'+project";"\'-title";"todo";"\'@name";"2026-09-21";"\'\t=description"\r\n',
  )
})

test('A03: more than ten rows retain API order, defaults, bytes and current project only', async ({ page, context }) => {
  const ids = ['z-13', 'a-2', 'x-9', 'b-4', 'r-11', 'c-6', 'm-1', 'd-8', 'q-3', 'e-10', 'p-5', 'f-12', 'n-7']
  const records = ids.map((id) => makeTask(id, { title: 'Enak naslov', description: 'Čšž 😀' }))
  const writes = await mount(page, [...records, makeTask('else-1', { projectId: 'launch' })])
  await defaults(page)
  await expectIds(page, ids)
  const url = page.url()
  const pageCount = context.pages().length
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  const full = await download(page)
  expect(full.name).toBe('folio-web.csv')
  expect([...full.bytes.subarray(0, 3)]).toEqual([239, 187, 191])
  const expected = '\uFEFF"id";"projectId";"title";"status";"assignee";"dueDate";"description"\r\n' +
    ids.map((id) => `"${id}";"web";"Enak naslov";"todo";"Ana Novak";"2026-09-21";"Čšž 😀"\r\n`).join('')
  expect(full.bytes.equals(Buffer.from(expected, 'utf8'))).toBe(true)
  expect(page.url()).toBe(url)
  expect(context.pages()).toHaveLength(pageCount)
  expect(requests).toEqual([])
  await board(page)
  expect((await download(page)).bytes.equals(full.bytes)).toBe(true)
  await readonly(page, writes)
})

test('A04: no columns or no matching rows prevents download; filters leave reading intact', async ({ page }) => {
  const records = [makeTask('same-2', { title: 'Enako', status: 'done' }), makeTask('same-1', { title: 'Enako' }), makeTask('same-3', { status: 'in_progress' })]
  const writes = await mount(page, records)
  const downloads: string[] = []
  page.on('download', (file) => downloads.push(file.suggestedFilename()))
  await columns(page, [])
  await expect(exportButton(page)).toBeDisabled()
  await exportButton(page).evaluate((button: HTMLButtonElement) => button.click())
  expect(downloads).toEqual([])
  await checkbox(page, 'description').check()
  await checkbox(page, 'title').check()
  await checkbox(page, 'id').check()
  expect((await download(page)).bytes.toString('utf8')).toBe('\uFEFF"id";"title";"description"\r\n"same-2";"Enako";"Opis opravila same-2"\r\n"same-1";"Enako";"Opis opravila same-1"\r\n"same-3";"Opravilo same-3";"Opis opravila same-3"\r\n')
  await columns(page, ['id'])
  for (const [filter, id] of [['todo', 'same-1'], ['in_progress', 'same-3'], ['done', 'same-2']]) {
    await select(page, 'Filter izvoza', filter)
    expect((await download(page)).bytes.toString('utf8')).toBe(`\uFEFF"id"\r\n"${id}"\r\n`)
    await expectIds(page, ['same-2', 'same-1', 'same-3'])
    await summary(page, [1, 1, 1])
  }
  await details(page, 'same-1')
  await details(page, 'same-2')
  await readonly(page, writes)
})

test('A05: one row, empty filtered result and two empty projects keep export disabled correctly', async ({ page }) => {
  await mount(page, [makeTask('only-1')])
  await select(page, 'Filter izvoza', 'done')
  await expect(exportButton(page)).toBeDisabled()
  await columns(page, [])
  await checkbox(page, 'id').check()
  await expect(exportButton(page)).toBeDisabled()
  await select(page, 'Filter izvoza', 'all')
  expect((await download(page)).bytes.toString('utf8')).toBe('\uFEFF"id"\r\n"only-1"\r\n')
  await project(page, 'launch')
  await defaults(page)
  await expect(exportButton(page)).toBeDisabled()
  await board(page)
  await expect(exportButton(page)).toBeDisabled()
  await page.unroute('**/api/**')
  await mount(page, [])
  const downloads: string[] = []
  page.on('download', (file) => downloads.push(file.suggestedFilename()))
  for (const id of ['web', 'launch'] as const) {
    await project(page, id)
    await expect(exportButton(page)).toBeDisabled()
    await exportButton(page).evaluate((button: HTMLButtonElement) => button.click())
  }
  expect(downloads).toEqual([])
})

test('A06: views preserve settings; consecutive exports, project changes and reload use current settings', async ({ page }) => {
  await mount(page)
  await columns(page, ['id', 'status'])
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')
  const first = await download(page)
  expect(first.bytes.toString('utf8')).toBe('\uFEFF"id","status"\r\n"web-03","done"\r\n"web-06","done"\r\n')
  await board(page)
  expect((await download(page)).bytes.equals(first.bytes)).toBe(true)
  await table(page)
  expect((await download(page)).bytes.equals(first.bytes)).toBe(true)
  await columns(page, ['id', 'dueDate'])
  await select(page, 'Ločilo CSV', ';')
  await select(page, 'Filter izvoza', 'in_progress')
  expect((await download(page)).bytes.toString('utf8')).toBe('\uFEFF"id";"dueDate"\r\n"web-01";"2026-09-18"\r\n"web-05";"2026-09-29"\r\n')
  await project(page, 'launch')
  await defaults(page)
  const other = await download(page)
  expect(other.name).toBe('folio-launch.csv')
  expect(other.bytes.toString('utf8')).not.toContain('web-')
  await project(page, 'web')
  await defaults(page)
  for (const view of [board, table]) {
    await view(page)
    await columns(page, ['title'])
    await select(page, 'Ločilo CSV', ',')
    await select(page, 'Filter izvoza', 'todo')
    await page.reload()
    await defaults(page)
  }
})

test('A07: 390px controls wrap, keyboard focus is visible and both views keep all tasks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await checkbox(page, 'id').focus()
  await page.keyboard.press('Space')
  await expect(checkbox(page, 'id')).not.toBeChecked()
  await expect(checkbox(page, 'id')).toBeFocused()
  expect(await checkbox(page, 'id').evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none')
  for (const view of [table, board]) {
    await view(page)
    await select(page, 'Filter izvoza', 'done')
    await expect(page.locator('[data-task-id]')).toHaveCount(8)
    await expect(exportButton(page)).toBeVisible()
    await readonly(page, writes)
    const bounds = await page.locator('.csv-export').boundingBox()
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
  }
})
