import { test, expect, type Page } from '@playwright/test'
import { createCsv, csvColumns } from '../../src/csv.ts'
import { board, downloadCSV, expectIds, makeTask, mount, project, readonly, select, summary, table } from '../development/helpers.ts'

async function onlyColumns(page: Page, columns: string[]) {
  for (const column of csvColumns) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).setChecked(columns.includes(column))
}

async function defaults(page: Page) {
  for (const column of csvColumns) await expect(page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true })).toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Ločilo CSV', exact: true })).toHaveValue(';')
  await expect(page.getByRole('combobox', { name: 'Filter izvoza', exact: true })).toHaveValue('all')
}

test('S01: more than ten rows retain API order and every filter leaves the project intact', async ({ page }) => {
  const records = Array.from({ length: 13 }, (_, index) => makeTask(`custom-${30 - index}`, {
    title: 'Enak naslov', status: (['todo', 'in_progress', 'done'] as const)[index % 3],
  }))
  records.splice(3, 0, makeTask('other-99', { projectId: 'launch' }))
  const writes = await mount(page, records)
  await defaults(page)
  await onlyColumns(page, ['id'])
  for (const filter of ['all', 'todo', 'in_progress', 'done']) {
    await select(page, 'Filter izvoza', filter)
    const rows = records.filter((record) => record.projectId === 'web' && (filter === 'all' || record.status === filter))
    expect((await downloadCSV(page)).text).toBe('\uFEFF"id"\r\n' + rows.map((record) => `"${record.id}"\r\n`).join(''))
    await expectIds(page, records.filter((record) => record.projectId === 'web').map((record) => record.id))
    await summary(page, [5, 4, 4])
  }
  await project(page, 'launch')
  await defaults(page)
  await onlyColumns(page, ['id'])
  expect(await downloadCSV(page)).toEqual({ name: 'folio-launch.csv', text: '\uFEFF"id"\r\n"other-99"\r\n' })
  await readonly(page, writes)
})

test('S02: zero columns, empty filter and empty projects prevent downloads', async ({ page }) => {
  const writes = await mount(page, [makeTask('single')])
  let downloads = 0
  page.on('download', () => { downloads += 1 })
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await onlyColumns(page, [])
  await expect(button).toBeDisabled()
  await button.evaluate((element: HTMLButtonElement) => element.click())
  await page.getByRole('checkbox', { name: 'Stolpec title', exact: true }).check()
  await expect(button).toBeEnabled()
  await select(page, 'Filter izvoza', 'done')
  await expect(button).toBeDisabled()
  await button.evaluate((element: HTMLButtonElement) => element.click())
  await expectIds(page, ['single'])
  await select(page, 'Filter izvoza', 'all')
  expect((await downloadCSV(page)).text).toBe('\uFEFF"title"\r\n"Opravilo single"\r\n')
  await project(page, 'launch')
  await expect(button).toBeDisabled()
  await board(page)
  await expect(button).toBeDisabled()
  await button.evaluate((element: HTMLButtonElement) => element.click())
  expect(downloads).toBe(1)
  await readonly(page, writes)

  await mount(page, [])
  await expect(button).toBeDisabled()
  await project(page, 'launch')
  await expect(button).toBeDisabled()
})

test('S03: actual UTF-8 download preserves exact quoted fields, mixed line breaks and both separators', async ({ page }) => {
  const records = [makeTask('unusual-7', {
    title: ' Čšž, "🙂"; ', status: 'in_progress', assignee: 'Živa 李', dueDate: '2028-02-29',
    description: 'Prva\rDruga\nTretja\r\nKonec; , "da" ',
  }), makeTask('unusual-2', { title: '', description: '', assignee: 'Ana' })]
  const writes = await mount(page, records)
  const requests: string[] = []
  page.on('request', (request) => { if (new URL(request.url()).protocol.startsWith('http')) requests.push(request.url()) })
  const originalUrl = page.url()
  const pagesBefore = page.context().pages().length
  for (const separator of [';', ',']) {
    await select(page, 'Ločilo CSV', separator)
    const expected = '\uFEFF' + [
      ['"id"', '"projectId"', '"title"', '"status"', '"assignee"', '"dueDate"', '"description"'],
      ['"unusual-7"', '"web"', '" Čšž, ""🙂""; "', '"in_progress"', '"Živa 李"', '"2028-02-29"', '"Prva\rDruga\nTretja\r\nKonec; , ""da"" "'],
      ['"unusual-2"', '"web"', '""', '"todo"', '"Ana"', '"2026-09-21"', '""'],
    ].map((cells) => cells.join(separator) + '\r\n').join('')
    const event = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Izvozi CSV', exact: true }).click()
    const download = await event
    expect(download.suggestedFilename()).toBe('folio-web.csv')
    const stream = await download.createReadStream()
    expect(stream).not.toBeNull()
    const chunks: Buffer[] = []
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk))
    const bytes = Buffer.concat(chunks)
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    expect(bytes).toEqual(Buffer.from(expected, 'utf8'))
  }
  expect(page.url()).toBe(originalUrl)
  expect(page.context().pages()).toHaveLength(pagesBefore)
  expect(requests).toEqual([])
  await readonly(page, writes)
})

test('S04: formula triggers and exact whitespace rules protect every data column without mutations', () => {
  const cases: [string, string][] = [
    ['=1', "'=1"], ['+1', "'+1"], ['-1', "'-1"], ['@x', "'@x"],
    [' =1', "' =1"], ['\t+1', "'\t+1"], ['\r-1', "'\r-1"], ['\n@x', "'\n@x"],
    [' \t\r\n =1', "' \t\r\n =1"], ['', ''], [' \t\r\n', ' \t\r\n'],
    ['text=1', 'text=1'], ["'=1", "'=1"], ['\u00a0=1', '\u00a0=1'], ['\v=1', '\v=1'],
  ]
  for (const [input, expected] of cases) {
    for (const column of csvColumns) {
      // Status/date formula strings intentionally exercise the shared cell encoder beyond API values.
      const task = Object.freeze({ ...makeTask('frozen'), [column]: input })
      const tasks = Object.freeze([task])
      const before = JSON.stringify(tasks)
      expect(createCsv(tasks, [column], ';', 'all')).toBe(`\uFEFF"${column}"\r\n"${expected}"\r\n`)
      expect(JSON.stringify(tasks)).toBe(before)
    }
  }
})

test('S05: reverse selection order, consecutive exports, view parity and project/reload resets', async ({ page }) => {
  await mount(page, [makeTask('z-8', { status: 'done' }), makeTask('a-3'), makeTask('b-4', { projectId: 'launch' })])
  await onlyColumns(page, [])
  for (const column of ['title', 'id']) await page.getByRole('checkbox', { name: `Stolpec ${column}`, exact: true }).check()
  await select(page, 'Ločilo CSV', ',')
  await select(page, 'Filter izvoza', 'done')
  const first = await downloadCSV(page)
  expect(first.text).toBe('\uFEFF"id","title"\r\n"z-8","Opravilo z-8"\r\n')
  await board(page)
  expect(await downloadCSV(page)).toEqual(first)
  await select(page, 'Ločilo CSV', ';')
  expect((await downloadCSV(page)).text).toBe('\uFEFF"id";"title"\r\n"z-8";"Opravilo z-8"\r\n')
  await select(page, 'Filter izvoza', 'todo')
  expect((await downloadCSV(page)).text).toBe('\uFEFF"id";"title"\r\n"a-3";"Opravilo a-3"\r\n')
  await onlyColumns(page, ['title'])
  expect((await downloadCSV(page)).text).toBe('\uFEFF"title"\r\n"Opravilo a-3"\r\n')
  await table(page)
  expect((await downloadCSV(page)).text).toBe('\uFEFF"title"\r\n"Opravilo a-3"\r\n')
  await project(page, 'launch')
  await defaults(page)
  await project(page, 'web')
  await defaults(page)
  for (const view of ['table', 'board']) {
    if (view === 'board') await board(page)
    await onlyColumns(page, ['id'])
    await select(page, 'Ločilo CSV', ',')
    await select(page, 'Filter izvoza', 'done')
    await page.reload()
    await defaults(page)
  }
})

test('S06: mobile controls, keyboard export and both views stay inside 390 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await mount(page)
  await defaults(page)
  const checkbox = page.getByRole('checkbox', { name: 'Stolpec description', exact: true })
  await checkbox.focus()
  await page.keyboard.press('Space')
  await expect(checkbox).not.toBeChecked()
  const button = page.getByRole('button', { name: 'Izvozi CSV', exact: true })
  await button.focus()
  const download = page.waitForEvent('download')
  await page.keyboard.press('Enter')
  await download
  await readonly(page, writes)
  await board(page)
  await readonly(page, writes)
  await expect(checkbox).not.toBeChecked()
})

test('S07: serializer rejects absent rows and columns and preserves the frozen source order', () => {
  const tasks = Object.freeze([Object.freeze(makeTask('last')), Object.freeze(makeTask('first'))])
  expect(createCsv(tasks, [], ';', 'all')).toBeNull()
  expect(createCsv([], csvColumns, ';', 'all')).toBeNull()
  expect(createCsv(tasks, csvColumns, ';', 'done')).toBeNull()
  expect(createCsv(tasks, ['title', 'id'], ',', 'all')).toBe('\uFEFF"id","title"\r\n"last","Opravilo last"\r\n"first","Opravilo first"\r\n')
  expect(tasks.map((task) => task.id)).toEqual(['last', 'first'])
})
